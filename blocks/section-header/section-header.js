export default function decorate(block) {
  const pieces = [];
  block.querySelectorAll('h1, h2, h3, h4, h5, h6, p, strong').forEach((node) => {
    const text = node.textContent.trim();
    if (text) {
      pieces.push(text);
    }
  });

  const title = pieces[0] || '';
  const subtitle = pieces[1] || '';

  const wrapper = document.createElement('div');
  wrapper.className = 'pi-section-header';
  if (block.classList.contains('centered')) {
    wrapper.classList.add('pi-section-header--center');
  }

  const titleEl = document.createElement('h2');
  titleEl.className = 'pi-section-title';
  titleEl.textContent = title;
  wrapper.append(titleEl);

  if (subtitle) {
    const subEl = document.createElement('p');
    subEl.className = 'pi-section-subtitle';
    subEl.textContent = subtitle;
    wrapper.append(subEl);
  }

  block.textContent = '';
  block.append(wrapper);
}
