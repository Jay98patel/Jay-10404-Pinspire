export default function decorate(block) {
  const data = {};
  const rows = Array.from(block.querySelectorAll('tr'));
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();
    if (!key || !value) return;
    data[key] = value;
  });

  const section = block.closest('.section');

  if (section) {
    if (data.id) {
      section.id = data.id;
    }
    if (data.class) {
      data.class
        .split(/\s+/)
        .filter(Boolean)
        .forEach((cls) => section.classList.add(cls));
    }
  }

  block.remove();
}
