import { bindFavoriteToggle } from '../../scripts/pi-favorites.js';

function generateIdFromTitle(title) {
  if (!title) {
    return String(Date.now());
  }
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function createIdeaCard(idea) {
  const data = idea || {};
  const id = data.id || generateIdFromTitle(data.title);
  const title = data.title || '';
  const description = data.description || '';
  const image = data.image || '';
  const href = data.href || data.url || '#';
  const category = data.category || '';

  const card = document.createElement('article');
  card.className = 'pi-card pi-idea-card';
  card.dataset.ideaId = id;

  const media = document.createElement('div');
  media.className = 'pi-card-media';

  const link = document.createElement('a');
  link.href = href;
  link.tabIndex = 0;

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.src = image;
  img.alt = title;

  link.append(img);
  media.append(link);

  const favButton = document.createElement('button');
  favButton.type = 'button';
  favButton.className = 'pi-card-fav-button';
  favButton.innerHTML = '❤';

  media.append(favButton);

  const body = document.createElement('div');
  body.className = 'pi-card-body';

  const titleEl = document.createElement('div');
  titleEl.className = 'pi-card-title';
  titleEl.textContent = title;
  body.append(titleEl);

  if (category) {
    const metaEl = document.createElement('div');
    metaEl.className = 'pi-card-meta';
    metaEl.textContent = category;
    body.append(metaEl);
  }

  if (description) {
    const descEl = document.createElement('p');
    descEl.className = 'pi-card-description';
    descEl.textContent = description;
    body.append(descEl);
  }

  card.append(media, body);

  bindFavoriteToggle(favButton, {
    id,
    title,
    description,
    image,
    href,
    category,
  });

  return card;
}

export default function decorate(block) {
  const picture = block.querySelector('picture, img');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6, strong');
  const desc = block.querySelector('p');
  const categoryNode = block.querySelector('em');
  const link = block.querySelector('a');

  const title = heading ? heading.textContent.trim() : '';
  const description = desc ? desc.textContent.trim() : '';
  const category = categoryNode ? categoryNode.textContent.trim() : '';
  let image = '';
  if (picture) {
    const imgEl = picture.tagName.toLowerCase() === 'img' ? picture : picture.querySelector('img');
    if (imgEl) {
      image = imgEl.currentSrc || imgEl.src;
    }
  }
  const href = link ? link.getAttribute('href') : '#';

  const id = block.dataset.id || generateIdFromTitle(title);

  const idea = {
    id,
    title,
    description,
    image,
    href,
    category,
  };

  const card = createIdeaCard(idea);
  block.textContent = '';
  block.append(card);
}
