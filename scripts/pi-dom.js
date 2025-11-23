export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function delegate(root, selector, eventName, handler) {
  function listener(event) {
    const match = event.target.closest(selector);
    if (!match || !root.contains(match)) {
      return;
    }
    handler(event, match);
  }
  root.addEventListener(eventName, listener);
  return () => root.removeEventListener(eventName, listener);
}

export function setActiveItem(container, selector, activeElement) {
  const items = container ? container.querySelectorAll(selector) : [];
  items.forEach((item) => item.classList.remove('is-active'));
  if (activeElement) {
    activeElement.classList.add('is-active');
  }
}
