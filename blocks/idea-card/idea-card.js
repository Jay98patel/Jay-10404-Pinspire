import { toggleFavorite, isFavorite } from '../../scripts/pi-favorites.js';

export function createIdeaCard(idea) {
  
  const safeIdea = idea || {};
  const id = safeIdea.id || '';
  const title = safeIdea.title || '';
  const description = safeIdea.description || '';
  const category = safeIdea.category || '';
  const image = safeIdea.image || '';
  const path = safeIdea.path || '';
  const active = isFavorite(id);

  const card = document.createElement('article');
  card.className = 'pi-idea-card';
  card.dataset.id = id;

  card.innerHTML = `
    <div class="pi-idea-card-image">
      <img src="${image}" alt="${title}">
      <button type="button" class="pi-idea-card-fav ${active ? 'is-active' : ''}" aria-label="Toggle favorite">
        ❤
      </button>
    </div>
    <div class="pi-idea-card-body">
      <div class="pi-idea-card-title">${title}</div>
      ${description ? `<div class="pi-idea-card-description">${description}</div>` : ''}
      ${category ? `<div class="pi-idea-card-category-pill">${category}</div>` : ''}
    </div>
  `;

  const favButton = card.querySelector('.pi-idea-card-fav');
  favButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nowActive = toggleFavorite(safeIdea);
    favButton.classList.toggle('is-active', nowActive);
  });

  if (path) {
    card.addEventListener('click', () => {
      window.location.href = path;
    });
    card.style.cursor = 'pointer';
  }

  return card;
}

export default function decorate(block) {
  const placeholder = document.createElement('div');
  placeholder.className = 'pi-idea-card-placeholder';
  placeholder.textContent = '';
  block.textContent = '';
  block.append(placeholder);
}
