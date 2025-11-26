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

function parseNavConfig(navSource) {
  const defaults = {
    exploreLabel: 'Explore',
    searchPlaceholder: 'Search ideas…',
    favoritesHref: '/my-favorites',
    favoritesLabel: 'My favorites',
    loginLabel: 'Log in',
    logoutLabel: 'Log out',
    brandLogo: '',
  };

  if (!navSource) return defaults;

  const section = navSource.querySelector('.section');
  if (!section || !section.dataset) return defaults;

  const { dataset } = section;

  return {
    exploreLabel: dataset.exploreLabel || defaults.exploreLabel,
    searchPlaceholder: dataset.searchPlaceholder || defaults.searchPlaceholder,
    favoritesHref: dataset.favoritesHref || defaults.favoritesHref,
    favoritesLabel: dataset.favoritesLabel || defaults.favoritesLabel,
    loginLabel: dataset.loginLabel || defaults.loginLabel,
    logoutLabel: dataset.logoutLabel || defaults.logoutLabel,
    brandLogo: dataset.brandLogo || defaults.brandLogo,
  };
}

export function createSearchBar(options = {}) {
  let onQueryChanged;
  let placeholder;

  if (typeof options === 'function') {
    onQueryChanged = options;
  } else if (options && typeof options === 'object') {
    onQueryChanged = options.onQueryChanged;
    placeholder = options.placeholder;
  }

  const searchPlaceholder = placeholder || 'Search ideas…';

  const wrapper = document.createElement('div');
  wrapper.className = 'pi-search';
  wrapper.innerHTML = `
    <form class="pi-search-form" role="search">
      <span class="pi-search-icon" aria-hidden="true">🔍</span>
      <input
        class="pi-search-input"
        type="search"
        placeholder="${searchPlaceholder}"
        aria-label="${searchPlaceholder}" />
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
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const navSource = fragment || document.createElement('div');
  const logoPicture = navSource.querySelector('picture');

  const navConfig = parseNavConfig(navSource);

  const brandLogoMeta = getMetadata('brand-logo');
  const brandLogoPath = navConfig.brandLogo || brandLogoMeta || '../../images/brand-logo.png';

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
    });
    img.src = brandLogoPath;
  }

  const exploreLabel = document.createElement('span');
  exploreLabel.className = 'pi-header-explore';
  exploreLabel.textContent = navConfig.exploreLabel;
  left.append(logoLink, exploreLabel);

  const center = document.createElement('div');
  center.className = 'pi-header-center';
  const searchHost = document.createElement('div');
  center.append(searchHost);

  const right = document.createElement('div');
  right.className = 'pi-header-right';

  function renderSearch() {
    searchHost.innerHTML = '';
    if (!isAuthenticated()) return;

    const search = createSearchBar({
      placeholder: navConfig.searchPlaceholder,
    });
    searchHost.append(search);
  }

  function renderRight() {
    right.innerHTML = '';

    const favLink = document.createElement('a');
    favLink.href = navConfig.favoritesHref;
    favLink.className = 'pi-header-icon-button pi-header-favorites';
    favLink.setAttribute('aria-label', navConfig.favoritesLabel);
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
      logoutButton.textContent = navConfig.logoutLabel;
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        logout();
      });

      userWrapper.append(avatar, logoutButton);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = '/login';
      loginLink.className = 'pi-header-login';
      loginLink.textContent = navConfig.loginLabel;
      userWrapper.append(loginLink);
    }

    right.append(favLink, userWrapper);
  }

  renderSearch();
  renderRight();

  window.addEventListener('pinspire:auth-changed', () => {
    renderSearch();
    renderRight();
  });

  shell.append(left, center, right);
  block.append(shell);
}
