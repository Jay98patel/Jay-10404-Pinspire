export function createEmptyState(options = {}) {
  const title = options.title || 'Nothing here yet';
  const message = options.message || '';
  const icon = options.icon || '☆';

  const wrapper = document.createElement('div');
  wrapper.className = 'pi-empty-state';

  const iconEl = document.createElement('div');
  iconEl.className = 'pi-empty-state-icon';
  iconEl.textContent = icon;

  const titleEl = document.createElement('div');
  titleEl.className = 'pi-empty-state-title';
  titleEl.textContent = title;

  const messageEl = document.createElement('div');
  messageEl.className = 'pi-empty-state-message';
  messageEl.textContent = message;

  wrapper.append(iconEl, titleEl, messageEl);
  return wrapper;
}

export default function decorate(block) {
  const titleNode = block.querySelector('h1, h2, h3, h4, h5, h6, strong, p');
  let title = '';
  let message = '';
  if (titleNode) {
    title = titleNode.textContent.trim();
    const sibling = titleNode.nextElementSibling;
    if (sibling) {
      message = sibling.textContent.trim();
    }
  }
  const empty = createEmptyState({
    title,
    message,
  });
  block.textContent = '';
  block.append(empty);
}
