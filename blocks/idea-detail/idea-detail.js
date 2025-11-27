import { loadIdeas } from '../../scripts/pi-ideas-index.js';
import { toggleFavorite, isFavorite } from '../../scripts/pi-favorites.js';
import { createEmptyState } from '../empty-state/empty-state.js';

const DETAIL_IMG_WIDTH = 800;
const DETAIL_IMG_HEIGHT = 1000;

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

  const imgSrc = currentIdea.image || '/default-meta-image.png';
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
