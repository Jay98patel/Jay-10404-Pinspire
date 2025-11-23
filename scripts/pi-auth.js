import { readJSON, writeJSON, removeKey } from './pi-storage.js';

const AUTH_KEY = 'pinspire-auth';
const RETURN_URL_KEY = 'pinspire-return-url';

function normalizeUser(input) {
  if (!input) return null;
  const username = String(input.username || '').trim();
  if (!username) return null;
  const tokenRaw = input.token || '';
  const token = String(tokenRaw || `mock-${Date.now()}`).trim();
  return { username, token };
}

function getWindow() {
  if (typeof window === 'undefined') return null;
  return window;
}

export function getAuth() {
  return readJSON(AUTH_KEY, null, 'session');
}

export function isAuthenticated() {
  const auth = getAuth();
  return !!(auth && auth.username && auth.token);
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

export function saveReturnUrl(url) {
  const w = getWindow();
  if (!w || !w.sessionStorage) return;
  try {
    if (url) {
      w.sessionStorage.setItem(RETURN_URL_KEY, url);
    }
  } catch {
  }
}

export function consumeReturnUrl() {
  const w = getWindow();
  if (!w || !w.sessionStorage) return null;
  try {
    const value = w.sessionStorage.getItem(RETURN_URL_KEY);
    w.sessionStorage.removeItem(RETURN_URL_KEY);
    if (!value) return null;
    return value;
  } catch {
    return null;
  }
}

export function requireAuth() {
  if (isAuthenticated()) {
    return true;
  }
  const w = getWindow();
  if (!w) {
    return false;
  }
  const path = w.location ? w.location.pathname : '';
  const search = w.location ? w.location.search : '';
  const hash = w.location ? w.location.hash : '';
  const url = path + search + hash;
  saveReturnUrl(url);
  w.location.href = '/login';
  return false;
}

export function logout() {
  const w = getWindow();
  clearAuth();
  if (w) {
    w.location.href = '/';
  }
}
