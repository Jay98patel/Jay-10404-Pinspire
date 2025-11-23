import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) {
    return;
  }
  const root = fragment.firstElementChild || fragment;
  const wrapper = document.createElement('div');
  wrapper.className = 'pi-footer';

  const linksContainer = document.createElement('div');
  linksContainer.className = 'pi-footer-links';
  while (root.firstChild) {
    linksContainer.append(root.firstChild);
  }

  const meta = document.createElement('div');
  meta.className = 'pi-footer-meta';
  const year = new Date().getFullYear();
  meta.textContent = `© ${year} Pinspire. All rights reserved.`;

  wrapper.append(linksContainer, meta);
  block.textContent = '';
  block.append(wrapper);
}
