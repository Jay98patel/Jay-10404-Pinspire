import { readJSON, writeJSON } from './pi-storage.js';

const FAVORITES_KEY = 'pinspire-favorites';

function readMap() {
  const value = readJSON(FAVORITES_KEY, {}, 'local');
  if (!value || typeof value !== 'object') {
    return {};
  }
  return value;
}

function writeMap(map) {
  writeJSON(FAVORITES_KEY, map, 'local');
}

export function getFavoritesList() {
  const map = readMap();
  return Object.values(map);
}

export function isFavorite(id) {
  if (!id) {
    return false;
  }
  const map = readMap();
  return !!map[id];
}

export function toggleFavorite(idea) {
  if (!idea || !idea.id) {
    return false;
  }
  const map = readMap();
  if (map[idea.id]) {
    delete map[idea.id];
  } else {
    map[idea.id] = idea;
  }
  writeMap(map);
  const list = Object.values(map);
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('pinspire:favorites-changed', {
      detail: {
        id: idea.id,
        favorites: list,
      },
    });
    window.dispatchEvent(event);
  }
  return !!map[idea.id];
}

function updateButtonState(button, active) {
  if (!button) {
    return;
  }
  button.classList.toggle('is-active', active);
  button.setAttribute('aria-pressed', active ? 'true' : 'false');
  button.setAttribute('aria-label', active ? 'Remove from favorites' : 'Save to favorites');
}

export function bindFavoriteToggle(button, idea) {
  if (!button || !idea || !idea.id) {
    return;
  }
  const active = isFavorite(idea.id);
  updateButtonState(button, active);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const next = toggleFavorite(idea);
    updateButtonState(button, next);
  });
}
