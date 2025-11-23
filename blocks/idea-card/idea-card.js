// blocks/idea-card/idea-card.js

import { toggleFavorite, isFavorite } from '../../scripts/pi-favorites.js';

/**
 * Helper to create a card element from an idea object
 * @param {Object} idea
 * @returns {HTMLElement}
 */
export function createIdeaCard(idea) {
  const {
    id,
    path,
    title,
    description,
    image,
    category,
  } = idea;

  const card = document.createElement('article');
  card.className = 'pi-idea-card';
  card.dataset.id = id || '';

  const href = path || '#';
  const imgSrc = image || '/default-meta-image.png';

  card.innerHTML = `
    <a class="pi-idea-card-link" href="${href}">
      <div class="pi-idea-card-image-wrap">
        <img src="${imgSrc}" alt="${title || ''}">
        <button type="button" class="pi-idea-card-fav" aria-label="Toggle favorite">
          ❤
        </button>
      </div>
      <div class="pi-idea-card-body">
        <h3 class="pi-idea-card-title">${title || ''}</h3>
        ${description
          ? `<p class="pi-idea-card-description">${description}</p>`
          : ''}
        ${category
          ? `<div class="pi-idea-card-category-pill">${category}</div>`
          : ''}
      </div>
    </a>
  `;

  const favButton = card.querySelector('.pi-idea-card-fav');
  const active = isFavorite(id);
  favButton.classList.toggle('is-active', active);

  favButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nowActive = toggleFavorite(idea);
    favButton.classList.toggle('is-active', nowActive);
  });

  return card;
}

/**
 * Block decorate – optional: if you ever drop an idea-card block directly.
 * For now we just leave it empty.
 */
export default function decorate(block) {
  // idea cards are normally created via createIdeaCard() from other blocks
  block.textContent = '';
}
