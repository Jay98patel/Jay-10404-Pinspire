const INDEX_URL = '/query-index.json';

let indexCache = null;
let indexPromise = null;

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v === 'true' || v === 'yes' || v === '1';
}

function normalizeTags(raw) {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function normalizeIdea(row) {
  const createdAtDate = normalizeDate(row.createdAt || row.date);
  return {
    path: row.path || '',
    id: row.id || row.path || '',
    title: row.title || '',
    description: row.description || '',
    image: row.image || '',
    category: row.category || '',
    tags: normalizeTags(row.tags),
    createdAt: createdAtDate,
    createdAtRaw: row.createdAt || row.date || '',
    isTrending: parseBoolean(row.isTrending),
  };
}

async function fetchIndex() {
  if (indexCache) {
    return indexCache;
  }
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL, { headers: { accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Index request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        const rows = Array.isArray(json.data) ? json.data : [];
        const ideas = rows
          .map(normalizeIdea)
          .filter((idea) => idea.path && idea.title);
        indexCache = ideas;
        return ideas;
      })
      .catch((err) => {
        console.error('Failed to load ideas index', err);
        indexCache = [];
        return indexCache;
      });
  }
  return indexPromise;
}

async function loadIdeas() {
  const ideas = await fetchIndex();
  return ideas.slice();
}

async function searchIdeas(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return loadIdeas();
  }
  const ideas = await fetchIndex();
  return ideas.filter((idea) => {
    return (
      idea.title.toLowerCase().includes(q) ||
      idea.description.toLowerCase().includes(q) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}

async function filterByCategory(category) {
  const cat = (category || '').trim().toLowerCase();
  const ideas = await fetchIndex();
  if (!cat || cat === 'all') {
    return ideas.slice();
  }
  return ideas.filter(
    (idea) => idea.category && idea.category.trim().toLowerCase() === cat,
  );
}

async function filterTrending() {
  const ideas = await fetchIndex();
  return ideas.filter((idea) => idea.isTrending);
}

function sortByNewest(ideas) {
  const source = Array.isArray(ideas) ? ideas.slice() : [];
  source.sort((a, b) => {
    const aTime = a.createdAt ? a.createdAt.getTime() : 0;
    const bTime = b.createdAt ? b.createdAt.getTime() : 0;
    return bTime - aTime;
  });
  return source;
}

function getCachedIndex() {
  return indexCache ? indexCache.slice() : null;
}

window.piIndexClient = {
  loadIdeas,
  searchIdeas,
  filterByCategory,
  filterTrending,
  sortByNewest,
  getCachedIndex,
};
