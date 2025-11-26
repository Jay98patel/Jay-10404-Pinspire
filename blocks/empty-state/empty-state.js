
export function createEmptyState({ title, message }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'pi-empty-state';

  wrapper.innerHTML = `
    <div class="pi-empty-state-icon" aria-hidden="true">
      🔍
    </div>
    <h3 class="pi-empty-state-title">${title}</h3>
    <p class="pi-empty-state-message">${message}</p>
  `;

  return wrapper;
}


export default function decorate(block) {
  const text = block.textContent.trim();
  block.textContent = '';

  const title = text || 'Nothing here yet';
  const message = 'New ideas will appear here as soon as they are published.';

  const card = createEmptyState({ title, message });
  block.append(card);
}
