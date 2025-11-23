const INDEX_URL = '/query-index.json';

let indexPromise = null;

async function fetchIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => (Array.isArray(json.data) ? json.data : []))
      .catch(() => []);
  }
  return indexPromise;
}

function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalizeBoolean(value) {
  if (!value) return false;
  return String(value).toLowerCase() === 'true';
}

function mapIdea(row) {
  const tags = normalizeTags(row.tags);
  const createdAt = row.createdAt || '';
  const isTrending = normalizeBoolean(row.isTrending);
  const id = row.id || row.path || '';
  return {
    path: row.path || '',
    id,
    title: row.title || '',
    description: row.description || '',
    image: row.image || '',
    category: row.category || '',
    tags,
    createdAt,
    isTrending,
  };
}

export async function loadIdeas() {
  const rows = await fetchIndex();
  return rows
    .filter((row) => row.path && row.path !== '/404')
    .map(mapIdea);
}

export async function searchIdeasByTitle(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return loadIdeas();
  }
  const ideas = await loadIdeas();
  return ideas.filter((idea) => {
    const title = (idea.title || '').toLowerCase();
    const desc = (idea.description || '').toLowerCase();
    const tags = (idea.tags || []).join(' ').toLowerCase();
    return title.includes(q) || desc.includes(q) || tags.includes(q);
  });
}

export function sortIdeasNewestFirst(ideas) {
  const copy = [...ideas];
  copy.sort((a, b) => {
    const ta = Date.parse(a.createdAt || '') || 0;
    const tb = Date.parse(b.createdAt || '') || 0;
    return tb - ta;
  });
  return copy;
}
