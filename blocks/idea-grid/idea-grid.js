import {
  loadIdeas,
  searchIdeasByTitle,
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

  const state = {
    query: '',
    category: 'all',
    favoritesOnly,
    trendingOnly: block.classList.contains('trending'),
    newestFirst: block.classList.contains('newest'),
  };

  async function getBaseIdeas() {
    if (state.favoritesOnly) {
      return getFavoritesList();
    }
    if (state.query) {
      return searchIdeasByTitle(state.query);
    }
    return loadIdeas();
  }

  function applyCategoryFilter(ideas) {
    const list = Array.isArray(ideas) ? ideas.slice() : [];
    if (!state.category || state.category === 'all') {
      return list;
    }
    const cat = state.category.trim().toLowerCase();
    return list.filter((idea) => {
      if (!idea.category) return false;
      return idea.category.trim().toLowerCase() === cat;
    });
  }

  function applyTrendingFilter(ideas) {
    if (!state.trendingOnly) {
      return ideas;
    }
    return ideas.filter((idea) => idea.isTrending);
  }

  function applyNewestFilter(ideas) {
    if (!state.newestFirst) {
      return ideas;
    }
    return sortIdeasNewestFirst(ideas);
  }

  function applyFavoritesSearchFilter(ideas) {
    if (!state.favoritesOnly || !state.query) {
      return ideas;
    }
    const q = state.query.trim().toLowerCase();
    return ideas.filter((idea) => {
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
  }

  async function gatherIdeas() {
    let ideas = await getBaseIdeas();
    ideas = applyFavoritesSearchFilter(ideas);
    ideas = applyCategoryFilter(ideas);
    ideas = applyTrendingFilter(ideas);
    ideas = applyNewestFilter(ideas);
    return ideas;
  }

  async function render() {
    const ideas = await gatherIdeas();
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
