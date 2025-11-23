export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = Array.from(row.children);
  const titleText = cells[0] ? cells[0].textContent.trim() : '';
  const subtitleText = cells[1] ? cells[1].textContent.trim() : '';

  const wrapper = document.createElement('div');
  wrapper.className = 'pi-section-header-inner';

  const titleEl = document.createElement('h2');
  titleEl.className = 'pi-section-title';
  titleEl.textContent = titleText;
  wrapper.append(titleEl);

  if (subtitleText) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'pi-section-subtitle';
    subtitleEl.textContent = subtitleText;
    wrapper.append(subtitleEl);
  }

  block.textContent = '';
  block.append(wrapper);
}
