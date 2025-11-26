// scripts/pi-ideas-index.js

const INDEX_URL = '/query-index.json'; // JSON view of the query-index sheet
let ideasCache = null;

function normalizeTags(rawTags) {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags;

  const str = String(rawTags).trim();
  if (!str) return [];

  // Try JSON, e.g. `["tag1","tag2"]`
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed
        .map((t) => String(t).trim())
        .filter(Boolean);
    }
  } catch (e) {
    // fall through
  }

  // Fallback: comma-separated list
  return str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalizeIdea(row) {
  const {
    path = '',
    id = '',
    title = '',
    description = '',
    image = '',
    category = '',
    tags = '',
    createdAt = '',
    isTrending = '',
    lastModified = '',
  } = row;

  if (!path || !path.startsWith('/ideas/')) return null;

  const trending =
    typeof isTrending === 'boolean'
      ? isTrending
      : String(isTrending).toLowerCase() === 'true';

  const lm = Number(lastModified) || 0;

  return {
    path,
    id: id || path.replace(/^\/+/, '').replace(/\//g, '-'),
    title,
    description,
    image,
    category,
    tags: normalizeTags(tags),
    createdAt,
    isTrending: trending,
    lastModified: lm,
  };
}


export async function loadIdeas() {
  if (ideasCache) return ideasCache;

  const resp = await fetch(INDEX_URL);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load ideas index', resp.status, resp.statusText);
    ideasCache = [];
    return ideasCache;
  }

  const json = await resp.json();
  const rows = Array.isArray(json.data) ? json.data : json;

  ideasCache = rows
    .map(normalizeIdea)
    .filter(Boolean);

  return ideasCache;
}

export async function searchIdeasByTitle(query) {
  const ideas = await loadIdeas();
  const q = (query || '').trim().toLowerCase();
  if (!q) return ideas;

  return ideas.filter((idea) =>
    (idea.title || '').toLowerCase().includes(q),
  );
}

export function sortIdeasNewestFirst(ideas) {
  return [...ideas].sort((a, b) => {
    const aTime = Date.parse(a.createdAt) || 0;
    const bTime = Date.parse(b.createdAt) || 0;
    return bTime - aTime;
  });
}
