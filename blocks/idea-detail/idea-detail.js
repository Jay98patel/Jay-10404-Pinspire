import { loadIdeas } from '../../scripts/pi-ideas-index.js';
import { toggleFavorite, isFavorite } from '../../scripts/pi-favorites.js';
import { createEmptyState } from '../empty-state/empty-state.js';

const DETAIL_IMG_WIDTH = 800;
const DETAIL_IMG_HEIGHT = 1000;

function buildDetailImageSources(rawSrc) {
  const fallbackSrc = rawSrc || '/default-meta-image.png';
  if (typeof window === 'undefined' || !window.location) {
    return { src: fallbackSrc, srcset: '', sizes: '' };
  }
  try {
    const url = new URL(fallbackSrc, window.location.origin);
    const widths = [640, 800, 1120];
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
    const defaultWidth = 800;
    const defaultUrl = new URL(url.toString());
    defaultUrl.searchParams.set('width', String(defaultWidth));
    defaultUrl.searchParams.set('format', format);
    defaultUrl.searchParams.set('optimize', optimize);
    const sizes = '(max-width: 900px) 100vw, 55vw';
    return { src: defaultUrl.toString(), srcset, sizes };
  } catch {
    return { src: fallbackSrc, srcset: '', sizes: '' };
  }
}

export default async function decorate(block) {
  const ideas = await loadIdeas();
  const currentPath = window.location.pathname.replace(/\/$/, '');
  const currentIdea = ideas.find((idea) => {
    const path = (idea.path || '').replace(/\/$/, '');
    return path === currentPath;
  });
  if (!currentIdea) {
    block.textContent = '';
    const empty = createEmptyState({
      title: 'Idea not found',
      message: 'This idea may have been moved or removed.',
    });
    block.append(empty);
    return;
  }
  const active = isFavorite(currentIdea.id);
  const wrapper = document.createElement('article');
  wrapper.className = 'pi-idea-detail-card';
  wrapper.dataset.id = currentIdea.id || '';
  const { src: imgSrc, srcset, sizes } = buildDetailImageSources(currentIdea.image);
  const imgAlt = currentIdea.title || '';
  wrapper.innerHTML = `
    <div class="pi-idea-detail-main">
      <div class="pi-idea-detail-image">
        <img
          src="${imgSrc}"
          alt="${imgAlt}"
          width="${DETAIL_IMG_WIDTH}"
          height="${DETAIL_IMG_HEIGHT}"
        >
        <button type="button" class="pi-idea-card-fav ${active ? 'is-active' : ''}" aria-label="Toggle favorite">
          ❤
        </button>
      </div>
      <div class="pi-idea-detail-content">
        <h1 class="pi-idea-detail-title">${currentIdea.title || ''}</h1>
        ${currentIdea.description ? `<p class="pi-idea-detail-description">${currentIdea.description}</p>` : ''}
        ${currentIdea.category ? `<div class="pi-idea-card-category-pill">${currentIdea.category}</div>` : ''}
      </div>
    </div>
  `;
  const img = wrapper.querySelector('.pi-idea-detail-image img');
  if (img) {
    img.decoding = 'async';
    img.loading = 'eager';
    if (srcset) {
      img.srcset = srcset;
    }
    if (sizes) {
      img.sizes = sizes;
    }
    if ('fetchPriority' in img) {
      img.fetchPriority = 'high';
    }
  }
  block.textContent = '';
  block.append(wrapper);
  const favButton = wrapper.querySelector('.pi-idea-card-fav');
  favButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nowActive = toggleFavorite(currentIdea);
    favButton.classList.toggle('is-active', nowActive);
  });
  const detailEvent = new CustomEvent('pinspire:current-idea', {
    detail: {
      id: currentIdea.id,
      category: currentIdea.category || '',
      path: currentIdea.path || '',
    },
  });
  window.dispatchEvent(detailEvent);
}
