export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const labels = Array.from(row.children)
    .map((cell) => cell.textContent.trim())
    .filter(Boolean);

  const pills = labels.length ? labels : ['All'];

  const wrapper = document.createElement('div');
  wrapper.className = 'pi-category-pills-inner';

  pills.forEach((label, index) => {
    const value = label.toLowerCase();
    const normalized = value === 'all' ? 'all' : value.replace(/\s+/g, '-');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pi-category-pill';
    if (index === 0) {
      button.classList.add('is-active');
    }
    button.dataset.category = normalized;
    button.textContent = label;

    button.addEventListener('click', () => {
      const siblings = wrapper.querySelectorAll('.pi-category-pill');
      siblings.forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');

      const event = new CustomEvent('pinspire:category-changed', {
        detail: { category: normalized },
      });
      window.dispatchEvent(event);
    });

    wrapper.append(button);
  });

  block.textContent = '';
  block.append(wrapper);
}
