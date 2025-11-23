import { readJSON, writeJSON, removeKey } from './pi-storage.js';
import { showToast } from './pi-toast.js';
import { login as apiLogin } from './pi-api.js';

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

function emitAuthChanged(auth) {
  const w = getWindow();
  if (!w) return;
  const event = new CustomEvent('pinspire:auth-changed', {
    detail: { auth },
  });
  w.dispatchEvent(event);
}

function ensureModalStyles(doc) {
  const id = 'pi-login-modal-styles';
  if (doc.getElementById(id)) return;
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = `
    #pi-login-modal-backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.45);
      z-index: 9999;
    }
    .pi-login-modal {
      background: var(--pi-color-surface, #ffffff);
      border-radius: 18px;
      padding: 24px 24px 20px;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
      width: 100%;
      max-width: 360px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .pi-login-modal-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
    }
    .pi-login-modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .pi-login-modal-subtitle {
      margin: 0;
      font-size: 14px;
      color: var(--pi-color-text-muted, #475569);
    }
    .pi-login-modal-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }
    .pi-login-modal-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 14px;
    }
    .pi-login-modal-field span {
      color: var(--pi-color-text-muted, #475569);
    }
    .pi-login-modal-field input {
      padding: 9px 12px;
      border-radius: 999px;
      border: 1px solid var(--pi-color-border-subtle, #e2e8f0);
      outline: none;
      font-size: 14px;
    }
    .pi-login-modal-field input:focus-visible {
      border-color: var(--pi-color-primary, #e60023);
      box-shadow: 0 0 0 1px var(--pi-color-primary, #e60023);
    }
    .pi-login-modal-actions {
      margin-top: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .pi-login-modal-primary {
      flex: 1 1 auto;
      border-radius: 999px;
      padding: 9px 14px;
      background: var(--pi-color-primary, #e60023);
      color: #ffffff;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }
    .pi-login-modal-secondary {
      border-radius: 999px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      color: var(--pi-color-text-muted, #64748b);
    }
    .pi-login-modal-close-icon {
      font-size: 18px;
      line-height: 1;
    }
    @media (max-width: 600px) {
      .pi-login-modal {
        margin: 0 16px;
      }
    }
  `;
  doc.head.appendChild(style);
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
    emitAuthChanged(null);
    return null;
  }
  writeJSON(AUTH_KEY, normalized, 'session');
  emitAuthChanged(normalized);
  return normalized;
}

export function clearAuth() {
  removeKey(AUTH_KEY, 'session');
  emitAuthChanged(null);
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

export function openLoginModal(onSuccess) {
  const w = getWindow();
  if (!w || !w.document) return;
  const doc = w.document;
  ensureModalStyles(doc);

  const existing = doc.getElementById('pi-login-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = doc.createElement('div');
  backdrop.id = 'pi-login-modal-backdrop';
  backdrop.innerHTML = `
    <div class="pi-login-modal" role="dialog" aria-modal="true">
      <div class="pi-login-modal-header">
        <h2 class="pi-login-modal-title">Log in to save ideas</h2>
        <p class="pi-login-modal-subtitle">Log in to keep track of ideas you love.</p>
      </div>
      <form class="pi-login-modal-form" novalidate>
        <label class="pi-login-modal-field">
          <span>Username</span>
          <input type="text" name="username" autocomplete="username" required />
        </label>
        <label class="pi-login-modal-field">
          <span>Password</span>
          <input type="password" name="password" autocomplete="current-password" required />
        </label>
        <div class="pi-login-modal-actions">
          <button type="button" class="pi-login-modal-secondary pi-login-modal-close">
            <span class="pi-login-modal-close-icon">×</span>
          </button>
          <button type="submit" class="pi-login-modal-primary">Log in</button>
        </div>
      </form>
    </div>
  `;
  doc.body.appendChild(backdrop);

  const form = backdrop.querySelector('form');
  const usernameInput = form.querySelector('input[name="username"]');
  const passwordInput = form.querySelector('input[name="password"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const closeButtons = backdrop.querySelectorAll('.pi-login-modal-close');

  function close() {
    backdrop.remove();
  }

  closeButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      close();
    });
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      close();
    }
  });

  const keyHandler = (event) => {
    if (event.key === 'Escape') {
      close();
      doc.removeEventListener('keydown', keyHandler);
    }
  };
  doc.addEventListener('keydown', keyHandler);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showToast('Enter username and password', 'error');
      return;
    }

    submitButton.disabled = true;

    try {
      const result = await apiLogin({ username, password });
      const auth = setAuth({ username: result.username, token: result.token });
      showToast('Logged in successfully', 'success');
      if (typeof onSuccess === 'function') {
        onSuccess(auth);
      }
      close();
    } catch (error) {
      const message = error && error.message ? error.message : 'Invalid username or password';
      showToast(message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
}
