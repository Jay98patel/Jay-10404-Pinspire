export default function decorate(block) {
  const labels = [];
  block.querySelectorAll('p, li, span').forEach((node) => {
    const text = node.textContent.trim();
    if (text) {
      labels.push(text);
    }
  });
  if (!labels.length) {
    labels.push('All');
  }
  block.textContent = '';

  const row = document.createElement('div');
  row.className = 'pi-pill-row';

  labels.forEach((label, index) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pi-pill';
    pill.textContent = label;
    const value = label.toLowerCase();
    pill.dataset.category = value === 'ideas' ? 'all' : value;
    if (index === 0) {
      pill.classList.add('pi-pill--active');
    }
    row.append(pill);
  });

  block.append(row);

  row.addEventListener('click', (event) => {
    const target = event.target.closest('.pi-pill');
    if (!target) {
      return;
    }
    row.querySelectorAll('.pi-pill').forEach((pill) => pill.classList.remove('pi-pill--active'));
    target.classList.add('pi-pill--active');
    const category = target.dataset.category || 'all';
    const custom = new CustomEvent('pinspire:category-changed', {
      detail: { category },
    });
    window.dispatchEvent(custom);
  });
}
