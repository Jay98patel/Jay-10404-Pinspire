import { readJSON, writeJSON, removeKey } from './pi-storage.js';

const AUTH_KEY = 'pinspire-auth';

function normalizeUser(input) {
  if (!input) {
    return null;
  }
  const username = String(input.username || '').trim();
  if (!username) {
    return null;
  }
  return { username };
}

export function getAuth() {
  return readJSON(AUTH_KEY, null, 'session');
}

export function isAuthenticated() {
  const auth = getAuth();
  return !!(auth && auth.username);
}

export function setAuth(user) {
  const normalized = normalizeUser(user);
  if (!normalized) {
    removeKey(AUTH_KEY, 'session');
    return null;
  }
  writeJSON(AUTH_KEY, normalized, 'session');
  return normalized;
}

export function clearAuth() {
  removeKey(AUTH_KEY, 'session');
}

export function requireAuth() {
  if (isAuthenticated()) {
    return true;
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return false;
}
