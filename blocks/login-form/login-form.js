import { showToast } from '../../scripts/pi-toast.js';
import { setAuth } from '../../scripts/pi-auth.js';

export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'pi-login-form-wrapper';
  wrapper.innerHTML = `
    <form class="pi-login-form" novalidate>
      <h1 class="pi-login-title">Welcome back</h1>
      <p class="pi-login-subtitle">Log in to save and organize your favorite ideas.</p>
      <label class="pi-login-field">
        <span>Username</span>
        <input type="text" name="username" autocomplete="username" required />
      </label>
      <label class="pi-login-field">
        <span>Password</span>
        <input type="password" name="password" autocomplete="current-password" required />
      </label>
      <button type="submit" class="pi-login-submit">Log in</button>
    </form>
  `;
  block.textContent = '';
  block.append(wrapper);

  const form = wrapper.querySelector('form');
  const usernameInput = form.querySelector('input[name="username"]');
  const passwordInput = form.querySelector('input[name="password"]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) {
      showToast('Enter username and password', 'error');
      return;
    }
    setAuth({ username });
    showToast('Logged in successfully', 'success');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  });
}
