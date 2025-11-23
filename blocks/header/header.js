import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { isAuthenticated, getAuth } from '../../scripts/pi-auth.js';

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

  function emit(query) {
    const value = String(query || '').trim();
    const event = new CustomEvent('pinspire:search', { detail: { query: value } });
    window.dispatchEvent(event);
    if (typeof onQueryChanged === 'function') {
      onQueryChanged(value);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    emit(input.value);
  });

  input.addEventListener('input', () => {
    emit(input.value);
  });

  return wrapper;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
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
    logoSpan.textContent = 'Pinspire';
    logoLink.append(logoSpan);
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

  const favLink = document.createElement('a');
  favLink.href = '/my-favorites';
  favLink.className = 'pi-header-icon-button pi-header-favorites';
  favLink.setAttribute('aria-label', 'My favorites');
  favLink.innerHTML = '❤';

  const profileLink = document.createElement('a');
  profileLink.className = 'pi-header-profile';
  profileLink.href = '/login';

  if (isAuthenticated()) {
    const auth = getAuth();
    const username = auth && auth.username ? String(auth.username) : '';
    const initial = username ? username.charAt(0).toUpperCase() : 'U';
    profileLink.textContent = initial;
    profileLink.setAttribute('aria-label', 'Profile');
  } else {
    profileLink.textContent = 'Log in';
    profileLink.setAttribute('aria-label', 'Log in');
  }

  right.append(favLink, profileLink);

  shell.append(left, center, right);
  block.append(shell);
}
