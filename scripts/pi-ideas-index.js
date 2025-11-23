const INDEX_URL = '/query-index.json';

let ideasPromise = null;

async function fetchIdeasFromIndex() {
  const response = await fetch(INDEX_URL, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Failed to load ideas index');
  }
  const json = await response.json();
  const rows = Array.isArray(json.data) ? json.data : [];
  return rows.map((row, index) => {
    const title = row.title || row.Title || row['card-title'] || '';
    const image =
      row.image ||
      row.Image ||
      row['card-image'] ||
      row['image-url'] ||
      '';
    const category = row.category || row.Category || '';
    const tagsValue = row.tags || row.Tags || '';
    const tags =
      typeof tagsValue === 'string'
        ? tagsValue
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
    const trendingValue = row.trending || row.Trending;
    const isTrending =
      trendingValue === true ||
      trendingValue === 'true' ||
      trendingValue === 'yes';
    const favoritesValue = row.favorites || row.Favorites || 0;
    const favorites = Number(favoritesValue) || 0;
    const created =
      row.created ||
      row.Created ||
      row['Last Modified'] ||
      row.date ||
      '';
    const id =
      row.id ||
      row.ID ||
      row['card-id'] ||
      row.path ||
      row.Path ||
      String(index);
    return {
      id,
      title,
      image,
      category,
      tags,
      isTrending,
      favorites,
      created,
      raw: row,
    };
  });
}

export function loadIdeas() {
  if (!ideasPromise) {
    ideasPromise = fetchIdeasFromIndex().catch((error) => {
      console.error(error);
      return [];
    });
  }
  return ideasPromise;
}

export function searchIdeasByTitle(ideas, query) {
  const value = String(query || '').trim().toLowerCase();
  if (!value) {
    return ideas;
  }
  return ideas.filter((idea) =>
    String(idea.title || '')
      .toLowerCase()
      .includes(value),
  );
}

export function filterIdeasByCategory(ideas, category) {
  const value = String(category || '').trim().toLowerCase();
  if (!value || value === 'all') {
    return ideas;
  }
  return ideas.filter((idea) => {
    const cat = String(idea.category || '').toLowerCase();
    if (cat === value) {
      return true;
    }
    const tags = Array.isArray(idea.tags) ? idea.tags : [];
    return tags.some((tag) => String(tag).toLowerCase() === value);
  });
}

export function filterTrendingIdeas(ideas) {
  return ideas.filter((idea) => idea.isTrending);
}

export function sortIdeasNewestFirst(ideas) {
  return [...ideas].sort((a, b) => {
    const aDate = new Date(a.created || 0).getTime();
    const bDate = new Date(b.created || 0).getTime();
    return bDate - aDate;
  });
}
