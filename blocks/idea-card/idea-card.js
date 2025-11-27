import { toggleFavorite, isFavorite } from '../../scripts/pi-favorites.js';
import { isAuthenticated, openLoginModal } from '../../scripts/pi-auth.js';

const CARD_IMAGE_WIDTH = 360;
const CARD_IMAGE_HEIGHT = 540;

function buildCardImageSources(rawSrc) {
  const fallbackSrc = rawSrc || '/default-meta-image.png';
  if (typeof window === 'undefined' || !window.location) {
    return { src: fallbackSrc, srcset: '', sizes: '' };
  }
  try {
    const url = new URL(fallbackSrc, window.location.origin);
    const widths = [360, 480, 720];
    const format = url.searchParams.get('format') || 'webply';
    const optimize = url.searchParams.get('optimize') || 'medium';
    const srcset = widths
      .map((w) => {
        const u = new URL(url.toString());
        u.searchParams.set('width', String(w));
        u.searchParams.set('format', format);
        u.searchParams.set('optimize', optimize);
        return `${u.toString()} ${w}w`;
      })
      .join(', ');
    const defaultWidth = 480;
    const defaultUrl = new URL(url.toString());
    defaultUrl.searchParams.set('width', String(defaultWidth));
    defaultUrl.searchParams.set('format', format);
    defaultUrl.searchParams.set('optimize', optimize);
    const sizes =
      '(max-width: 520px) 100vw, (max-width: 800px) 50vw, (max-width: 1100px) 33vw, 25vw';
    return { src: defaultUrl.toString(), srcset, sizes };
  } catch {
    return { src: fallbackSrc, srcset: '', sizes: '' };
  }
}

export function createIdeaCard(idea, isEager = false) {
  const rawId = idea.id || idea.path || '';
  const id = String(rawId).trim();
  const path = idea.path || '#';
  const title = idea.title || '';
  const image = idea.image || '/default-meta-image.png';
  const normalizedIdea = { ...idea, id };
  const { src: imgSrc, srcset, sizes } = buildCardImageSources(image);
  const card = document.createElement('article');
  card.className = 'pi-idea-card';
  card.dataset.id = id;
  card.innerHTML = `
    <a class="pi-idea-card-link" href="${path}">
      <div class="pi-idea-card-image-wrap">
        <img
          src="${imgSrc}"
          alt="${title}"
          width="${CARD_IMAGE_WIDTH}"
          height="${CARD_IMAGE_HEIGHT}"
        >
        <button type="button" class="pi-idea-card-fav" aria-label="Toggle favorite"></button>
        <div class="pi-idea-card-overlay">
          <h3 class="pi-idea-card-title">${title}</h3>
        </div>
      </div>
    </a>
  `;
  const img = card.querySelector('img');
  if (img) {
    img.loading = isEager ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (srcset) {
      img.srcset = srcset;
    }
    if (sizes) {
      img.sizes = sizes;
    }
    if (isEager && 'fetchPriority' in img) {
      img.fetchPriority = 'high';
    }
  }
  const favButton = card.querySelector('.pi-idea-card-fav');
  function renderFav(active) {
    favButton.classList.toggle('is-active', active);
  }
  const initialActive = isAuthenticated() && isFavorite(id);
  renderFav(initialActive);
  favButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!id) return;
    const doToggle = () => {
      const nowActive = toggleFavorite(normalizedIdea);
      renderFav(nowActive);
    };
    if (!isAuthenticated()) {
      openLoginModal(() => {
        doToggle();
      });
      return;
    }
    doToggle();
  });
  return card;
}

export default function decorate(block) {
  block.textContent = '';
}
