// blocks/empty-state/empty-state.js

/**
 * Create a reusable “empty state” card.
 * Used by idea-grid when there are no ideas to render.
 */
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

/**
 * Block decorator (kept minimal because this block is mostly used via JS).
 */
export default function decorate(block) {
  // If someone drops an empty-state block in authoring, convert its text.
  const text = block.textContent.trim();
  block.textContent = '';

  const title = text || 'Nothing here yet';
  const message = 'New ideas will appear here as soon as they are published.';

  const card = createEmptyState({ title, message });
  block.append(card);
}
