import { readJSON, writeJSON } from './pi-storage.js';

const FAVORITES_KEY = 'pinspire-favorites';

function normalizeIdea(idea) {
  if (!idea) return null;
  const id = String(idea.id || '').trim();
  if (!id) return null;
  return {
    id,
    title: idea.title || '',
    description: idea.description || '',
    image: idea.image || '',
    category: idea.category || '',
    tags: Array.isArray(idea.tags) ? idea.tags : [],
    path: idea.path || '',
  };
}

function getRawMap() {
  const stored = readJSON(FAVORITES_KEY, {}, 'local');
  if (!stored || typeof stored !== 'object') {
    return {};
  }
  return stored;
}

function writeMap(map) {
  writeJSON(FAVORITES_KEY, map, 'local');
}

export function getFavoritesMap() {
  return getRawMap();
}

export function getFavoritesList() {
  const map = getRawMap();
  return Object.values(map);
}

export function isFavorite(id) {
  const map = getRawMap();
  const key = String(id || '').trim();
  if (!key) return false;
  return !!map[key];
}

export function toggleFavorite(idea) {
  const map = getRawMap();
  const normalized = normalizeIdea(idea);
  if (!normalized) {
    return false;
  }
  const key = normalized.id;
  let active;
  if (map[key]) {
    delete map[key];
    active = false;
  } else {
    map[key] = normalized;
    active = true;
  }
  writeMap(map);
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('pinspire:favorites-changed', {
      detail: { id: key, active },
    });
    window.dispatchEvent(event);
  }
  return active;
}

export function removeFavorite(id) {
  const map = getRawMap();
  const key = String(id || '').trim();
  if (!key || !map[key]) return;
  delete map[key];
  writeMap(map);
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('pinspire:favorites-changed', {
      detail: { id: key, active: false },
    });
    window.dispatchEvent(event);
  }
}
