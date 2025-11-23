const hasWindow = typeof window !== 'undefined';

const localStore = hasWindow && window.localStorage ? window.localStorage : null;
const sessionStore = hasWindow && window.sessionStorage ? window.sessionStorage : null;

function getStore(scope) {
  if (scope === 'session') {
    return sessionStore;
  }
  return localStore;
}

export function readJSON(key, fallback = null, scope = 'local') {
  const store = getStore(scope);
  if (!store) {
    return fallback;
  }
  try {
    const value = store.getItem(key);
    if (!value) {
      return fallback;
    }
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value, scope = 'local') {
  const store = getStore(scope);
  if (!store) {
    return;
  }
  try {
    const serialized = JSON.stringify(value);
    store.setItem(key, serialized);
  } catch {
  }
}

export function removeKey(key, scope = 'local') {
  const store = getStore(scope);
  if (!store) {
    return;
  }
  try {
    store.removeItem(key);
  } catch {
  }
}
