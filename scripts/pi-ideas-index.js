// scripts/pi-ideas-index.js

const IDEAS_INDEX_URL = '/pi-ideas-index.json';

let ideasCache = null;

/**
 * Fetch raw data from the Helix ideas index
 */
async function fetchIdeasIndex() {
  if (ideasCache) {
    return ideasCache;
  }

  const resp = await fetch(IDEAS_INDEX_URL);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error('Failed to load ideas index:', IDEAS_INDEX_URL, resp.status);
    ideasCache = [];
    return ideasCache;
  }

  const json = await resp.json();
  const rows = json.data || [];

  ideasCache = rows.map((row) => normalizeIdea(row));
  // eslint-disable-next-line no-console
  console.log('Loaded ideas index:', ideasCache);
  return ideasCache;
}

/**
 * Normalize a row from the index into a nice object
 */
function normalizeIdea(row) {
  // index columns: path, title, description, image, category, tags, createdAt, isTrending, lastModified, id
  const [
    path,
    title,
    description,
    image,
    category,
    tags,
    createdAt,
    isTrending,
    lastModified,
    id,
  ] = row;

  const tagList = typeof tags === 'string'
    ? tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    id: id || path,
    path,
    title,
    description,
    image,
    category,
    tags: tagList,
    createdAt: createdAt || '',
    isTrending: String(isTrending).toLowerCase() === 'true',
    lastModified: lastModified || '',
  };
}

/**
 * Public API used by idea-grid / idea-detail
 */

export async function loadIdeas() {
  return fetchIdeasIndex();
}

export async function searchIdeasByTitle(query) {
  const all = await fetchIdeasIndex();
  const q = (query || '').trim().toLowerCase();
  if (!q) return all;
  return all.filter((idea) => (idea.title || '').toLowerCase().includes(q));
}

export function sortIdeasNewestFirst(ideas) {
  return [...ideas].sort((a, b) => {
    const da = Date.parse(a.createdAt || '') || 0;
    const db = Date.parse(b.createdAt || '') || 0;
    return db - da;
  });
}
