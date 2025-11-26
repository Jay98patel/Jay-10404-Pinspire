import {
  loadIdeas,
  searchIdeasByTitle,
  sortIdeasNewestFirst,
} from '../../scripts/pi-ideas-index.js';
import { getFavoritesList } from '../../scripts/pi-favorites.js';
import { createIdeaCard } from '../idea-card/idea-card.js';
import { createEmptyState } from '../empty-state/empty-state.js';
import { requireAuth } from '../../scripts/pi-auth.js';

function ensureIdeaCardStyles() {
  if (typeof document === 'undefined') return;
  const id = 'pi-idea-card-styles';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = '/blocks/idea-card/idea-card.css';
  document.head.appendChild(link);
}

function filterRealIdeas(ideas) {
  if (!Array.isArray(ideas)) return [];
  return ideas.filter((idea) => {
    if (!idea) return false;

    const path = (idea.path || '').trim();
    if (!path || !path.startsWith('/ideas/')) return false;

    const title = (idea.title || '').trim().toLowerCase();
    if (title.startsWith('section-metadata')) return false;

    return true;
  });
}

export default async function decorate(block) {
  ensureIdeaCardStyles();

  const isFavoritesRoute =
    typeof window !== 'undefined'
    && window.location
    && window.location.pathname.startsWith('/my-favorites');

  const favoritesOnly =
    block.classList.contains('favorites-only') || isFavoritesRoute;

  const relatedOnly = block.classList.contains('related');

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
    relatedOnly,
    trendingOnly: block.classList.contains('trending'),
    newestFirst: block.classList.contains('newest'),
    currentIdeaId: '',
    currentCategory: '',
  };

  async function getBaseIdeas() {
    let ideas;

    if (state.favoritesOnly) {
      ideas = getFavoritesList();
    } else if (state.query && !state.relatedOnly) {
      ideas = await searchIdeasByTitle(state.query);
    } else {
      ideas = await loadIdeas();
    }

    return filterRealIdeas(ideas);
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
        title.includes(q)
        || desc.includes(q)
        || tagsText.includes(q)
      );
    });
  }

  function applyCategoryFilter(ideas) {
    if (!state.category || state.category === 'all') {
      return ideas;
    }
    const cat = state.category.trim().toLowerCase();
    return ideas.filter((idea) => {
      if (!idea.category) return false;
      return idea.category.trim().toLowerCase() === cat;
    });
  }

  function applyTrendingFilter(ideas) {
    if (!state.trendingOnly) return ideas;
    return ideas.filter((idea) => idea.isTrending);
  }

  function applyNewestFilter(ideas) {
    if (!state.newestFirst) return ideas;
    return sortIdeasNewestFirst(ideas);
  }

  function applyRelatedFilter(ideas) {
    if (!state.relatedOnly || !state.currentCategory) {
      return ideas;
    }
    const cat = state.currentCategory.trim().toLowerCase();
    const currentPath = window.location.pathname.replace(/\/$/, '');
    return ideas.filter((idea) => {
      if (!idea.category) return false;
      const ideaCat = idea.category.trim().toLowerCase();
      const sameCat = ideaCat === cat;
      const sameId = state.currentIdeaId && idea.id === state.currentIdeaId;
      const samePath =
        idea.path && idea.path.replace(/\/$/, '') === currentPath;
      return sameCat && !sameId && !samePath;
    });
  }

  async function gatherIdeas() {
    let ideas = await getBaseIdeas();
    ideas = applyFavoritesSearchFilter(ideas);
    if (state.relatedOnly) {
      ideas = applyRelatedFilter(ideas);
    } else {
      ideas = applyCategoryFilter(ideas);
      ideas = applyTrendingFilter(ideas);
    }
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
      } else if (state.relatedOnly) {
        title = 'No related ideas yet';
        message = 'Add more ideas in this category to see related suggestions.';
      } else {
        title = 'No ideas yet';
        message = 'Content will appear here once ideas are published.';
      }
      const empty = createEmptyState({ title, message });
      container.append(empty);
      return;
    }

    ideas.forEach((idea, index) => {
      const card = createIdeaCard(idea, index === 0);
      container.append(card);
    });
  }

  render();

  window.addEventListener('pinspire:search', (event) => {
    state.query = event.detail && event.detail.query ? event.detail.query : '';
    render();
  });

  const wrapper = block.closest('.idea-grid-wrapper');
  const prevSibling = wrapper ? wrapper.previousElementSibling : null;
  const isBrowseByCategoryGrid =
    prevSibling && prevSibling.classList.contains('category-pills-wrapper');

  if (isBrowseByCategoryGrid) {
    window.addEventListener('pinspire:category-changed', (event) => {
      state.category = event.detail && event.detail.category
        ? event.detail.category
        : 'all';
      render();
    });
  }

  window.addEventListener('pinspire:favorites-changed', () => {
    if (state.favoritesOnly) {
      render();
    }
  });

  window.addEventListener('pinspire:current-idea', (event) => {
    if (!state.relatedOnly) return;
    const detail = event.detail || {};
    state.currentIdeaId = detail.id || '';
    state.currentCategory = detail.category
      ? detail.category.trim().toLowerCase()
      : '';
    render();
  });
}
