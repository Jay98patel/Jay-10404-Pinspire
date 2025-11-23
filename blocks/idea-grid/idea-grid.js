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

  async function applyFilters() {
    let ideas = getSourceIdeas();

    if (state.query) {
      const q = state.query.trim().toLowerCase();
      if (state.favoritesOnly) {
        ideas = ideas.filter((idea) => {
          const title = (idea.title || '').toLowerCase();
          const desc = (idea.description || '').toLowerCase();
          const tags = Array.isArray(idea.tags) ? idea.tags : [];
          const tagsText = tags.join(' ').toLowerCase();
          return (
            title.includes(q) ||
            desc.includes(q) ||
            tagsText.includes(q)
          );
        });
      } else {
        ideas = await searchIdeasByTitle(state.query);
      }
    }

    if (state.category && state.category !== 'all') {
      ideas = ideas.filter((idea) => {
        if (!idea.category) return false;
        return idea.category.trim().toLowerCase() === state.category;
      });
    }

    if (state.trendingOnly) {
      const trending = await filterTrendingIdeas();
      const map = {};
      trending.forEach((idea) => {
        map[idea.id] = true;
      });
      ideas = ideas.filter((idea) => map[idea.id]);
    }

    if (state.newestFirst) {
      ideas = sortIdeasNewestFirst(ideas);
    }

    return ideas;
  }

  async function render() {
    const ideas = await applyFilters();
    container.innerHTML = '';
    if (!ideas.length) {
      let title;
      let message;
      if (state.query) {
        title = 'No ideas found';
        message = `No ideas match “${state.query}”.`;
      } else if (state.favoritesOnly) {
        title = 'No favorites yet';
        message = 'Save ideas you love and they will show up here.';
      } else {
        title = 'No ideas yet';
        message = 'Content will appear here once ideas are published.';
      }
      const empty = createEmptyState({ title, message });
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
