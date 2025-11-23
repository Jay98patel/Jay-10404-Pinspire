import { toggleFavorite, isFavorite } from '../../scripts/pi-favorites.js';
import { isAuthenticated, openLoginModal } from '../../scripts/pi-auth.js';

export function createIdeaCard(idea) {
  const rawId = idea.id || idea.path || '';
  const id = String(rawId).trim();
  const path = idea.path || '#';
  const title = idea.title || '';
  const image = idea.image || '/default-meta-image.png';

  const normalizedIdea = { ...idea, id };

  const card = document.createElement('article');
  card.className = 'pi-idea-card';
  card.dataset.id = id;

  card.innerHTML = `
    <a class="pi-idea-card-link" href="${path}">
      <div class="pi-idea-card-image-wrap">
        <img src="${image}" alt="${title}">
        <button type="button" class="pi-idea-card-fav" aria-label="Toggle favorite"></button>
        <div class="pi-idea-card-overlay">
          <h3 class="pi-idea-card-title">${title}</h3>
        </div>
      </div>
    </a>
  `;

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
