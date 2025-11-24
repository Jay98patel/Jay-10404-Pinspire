import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { isAuthenticated, getAuth, logout } from '../../scripts/pi-auth.js';

function debounce(fn, delay) {
  let handle;
  return (...args) => {
    if (handle) {
      clearTimeout(handle);
    }
    handle = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export function createSearchBar(onQueryChanged) {
  const wrapper = document.createElement('div');
  wrapper.className = 'pi-search';
  wrapper.innerHTML = `
    <form class="pi-search-form" role="search">
      <span class="pi-search-icon" aria-hidden="true">🔍</span>
      <input class="pi-search-input" type="search" placeholder="Search ideas…" aria-label="Search ideas" />
    </form>
  `;
  const form = wrapper.querySelector('form');
  const input = wrapper.querySelector('input');

  const emit = (query) => {
    const value = String(query || '').trim();
    const event = new CustomEvent('pinspire:search', { detail: { query: value } });
    window.dispatchEvent(event);
    if (typeof onQueryChanged === 'function') {
      onQueryChanged(value);
    }
  };

  const emitDebounced = debounce(emit, 250);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    emit(input.value);
  });

  input.addEventListener('input', () => {
    emitDebounced(input.value);
  });

  return wrapper;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const brandLogoMeta = getMetadata('brand-logo');
  const brandLogoPath = brandLogoMeta || '../../images/brand-logo.png';

  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const navSource = fragment || document.createElement('div');
  const logoPicture = navSource.querySelector('picture');

  block.textContent = '';

  const shell = document.createElement('nav');
  shell.className = 'pi-header';

  const left = document.createElement('div');
  left.className = 'pi-header-left';

  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.className = 'pi-header-logo';

  if (logoPicture) {
    logoLink.append(logoPicture);
  } else {
    const logoSpan = document.createElement('span');
    logoSpan.className = 'pi-header-logo-fallback';
    logoSpan.textContent = 'P';
    logoLink.append(logoSpan);
  }

  if (brandLogoPath && typeof Image !== 'undefined') {
    const img = document.createElement('img');
    img.alt = 'Pinspire';
    img.addEventListener('load', () => {
      logoLink.innerHTML = '';
      logoLink.append(img);
    });
    img.addEventListener('error', () => {
      // fallback
    });
    img.src = brandLogoPath;
  }

  const exploreLabel = document.createElement('span');
  exploreLabel.className = 'pi-header-explore';
  exploreLabel.textContent = 'Explore';

  left.append(logoLink, exploreLabel);

  const center = document.createElement('div');
  center.className = 'pi-header-center';
  const search = createSearchBar();
  center.append(search);

  const right = document.createElement('div');
  right.className = 'pi-header-right';

  function renderRight() {
    right.innerHTML = '';

    const favLink = document.createElement('a');
    favLink.href = '/my-favorites';
    favLink.className = 'pi-header-icon-button pi-header-favorites';
    favLink.setAttribute('aria-label', 'My favorites');
    favLink.innerHTML = '❤';

    const userWrapper = document.createElement('div');
    userWrapper.className = 'pi-header-user';

    if (isAuthenticated()) {
      const auth = getAuth();
      const username = auth && auth.username ? String(auth.username) : '';
      const initial = username ? username.charAt(0).toUpperCase() : 'U';

      const avatar = document.createElement('div');
      avatar.className = 'pi-header-avatar';
      avatar.textContent = initial;

      const logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.className = 'pi-header-logout';
      logoutButton.textContent = 'Log out';
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        logout();
      });

      userWrapper.append(avatar, logoutButton);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = '/login';
      loginLink.className = 'pi-header-login';
      loginLink.textContent = 'Log in';
      userWrapper.append(loginLink);
    }

    right.append(favLink, userWrapper);
  }

  renderRight();

  window.addEventListener('pinspire:auth-changed', () => {
    renderRight();
  });

  shell.append(left, center, right);
  block.append(shell);
}
