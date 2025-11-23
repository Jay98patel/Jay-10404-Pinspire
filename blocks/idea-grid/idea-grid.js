import {
  loadIdeas,
  searchIdeasByTitle,
  filterIdeasByCategory,
  filterTrendingIdeas,
  sortIdeasNewestFirst,
} from '../../scripts/pi-ideas-index.js';
import { getFavoritesList } from '../../scripts/pi-favorites.js';
import { createIdeaCard } from '../idea-card/idea-card.js';
import { createEmptyState } from '../empty-state/empty-state.js';
import { requireAuth } from '../../scripts/pi-auth.js';

export default async function decorate(block) {
  const favoritesOnly = block.classList.contains('favorites-only');

  if (favoritesOnly) {
    const allowed = requireAuth();
    if (!allowed) {
      return;
    }
  }

  const container = document.createElement('div');
  container.className = 'pi-idea-grid-inner';
  block.textContent = '';
  block.append(container);

  const allIdeas = favoritesOnly ? getFavoritesList() : await loadIdeas();

  const state = {
    query: '',
    category: 'all',
    favoritesOnly,
    trendingOnly: block.classList.contains('trending'),
    newestFirst: block.classList.contains('newest'),
  };

  function getSourceIdeas() {
    if (state.favoritesOnly) {
      return getFavoritesList();
    }
    return allIdeas;
  }

  function applyFilters() {
    let ideas = getSourceIdeas();
    if (state.query) {
      ideas = searchIdeasByTitle(ideas, state.query);
    }
    if (state.category && state.category !== 'all') {
      ideas = filterIdeasByCategory(ideas, state.category);
    }
    if (state.trendingOnly) {
      ideas = filterTrendingIdeas(ideas);
    }
    if (state.newestFirst) {
      ideas = sortIdeasNewestFirst(ideas);
    }
    return ideas;
  }

  function render() {
    const ideas = applyFilters();
    container.innerHTML = '';
    if (!ideas.length) {
      const empty = createEmptyState({
        title: favoritesOnly ? 'No favorites yet' : 'No ideas found',
        message: favoritesOnly
          ? 'Save ideas you love and they will show up here.'
          : 'Try a different search term or category.',
      });
      container.append(empty);
      return;
    }
    ideas.forEach((idea) => {
      const card = createIdeaCard(idea);
      container.append(card);
    });
  }

  render();

  window.addEventListener('pinspire:search', (event) => {
    state.query = event.detail && event.detail.query ? event.detail.query : '';
    render();
  });

  window.addEventListener('pinspire:category-changed', (event) => {
    state.category = event.detail && event.detail.category ? event.detail.category : 'all';
    render();
  });

  window.addEventListener('pinspire:favorites-changed', () => {
    if (state.favoritesOnly) {
      render();
    }
  });
}
