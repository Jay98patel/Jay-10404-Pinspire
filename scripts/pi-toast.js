let toastRoot;

function ensureRoot() {
  if (toastRoot) {
    return toastRoot;
  }
  const root = document.createElement('div');
  root.id = 'pi-toast-root';
  root.style.position = 'fixed';
  root.style.bottom = '16px';
  root.style.right = '16px';
  root.style.zIndex = '9999';
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.gap = '8px';
  root.style.alignItems = 'flex-end';
  root.style.pointerEvents = 'none';
  document.body.appendChild(root);
  toastRoot = root;
  return root;
}

function styleToast(element, type) {
  element.style.minWidth = '200px';
  element.style.maxWidth = '320px';
  element.style.padding = '10px 14px';
  element.style.borderRadius = '999px';
  element.style.backgroundColor = '#333333';
  element.style.color = '#ffffff';
  element.style.fontSize = '14px';
  element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  element.style.pointerEvents = 'auto';
  if (type === 'success') {
    element.style.backgroundColor = '#12805c';
  } else if (type === 'error') {
    element.style.backgroundColor = '#c62828';
  }
}

export function showToast(message, type = 'info', duration = 3000) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = ensureRoot();
  const toast = document.createElement('div');
  toast.textContent = message;
  styleToast(toast, type);
  root.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 200ms ease-out';
    setTimeout(() => {
      if (toast.parentNode === root) {
        root.removeChild(toast);
      }
    }, 220);
  }, duration);
}
