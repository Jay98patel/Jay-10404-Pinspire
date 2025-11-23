export function createEmptyState(options) {
  const opts = options || {};
  const title = opts.title || '';
  const message = opts.message || '';

  const wrapper = document.createElement('div');
  wrapper.className = 'pi-empty-state';

  const icon = document.createElement('div');
  icon.className = 'pi-empty-state-icon';
  icon.textContent = '🔍';

  const titleEl = document.createElement('div');
  titleEl.className = 'pi-empty-state-title';
  titleEl.textContent = title;

  const messageEl = document.createElement('div');
  messageEl.className = 'pi-empty-state-message';
  messageEl.textContent = message;

  wrapper.append(icon, titleEl, messageEl);
  return wrapper;
}

export default function decorate(block) {
  const content = block.textContent.trim() || '';
  block.textContent = '';
  const view = createEmptyState({ title: content || 'No content', message: '' });
  block.append(view);
}
