import { showToast } from '../../scripts/pi-toast.js';
import { setAuth, consumeReturnUrl } from '../../scripts/pi-auth.js';
import { login as apiLogin } from '../../scripts/pi-api.js';

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
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showToast('Enter username and password', 'error');
      return;
    }

    submitButton.disabled = true;

    try {
      const result = await apiLogin({ username, password });
      setAuth({ username: result.username, token: result.token });
      showToast('Logged in successfully', 'success');
      const returnUrl = consumeReturnUrl();
      if (typeof window !== 'undefined') {
        window.location.href = returnUrl || '/';
      }
    } catch (error) {
      const message = error && error.message ? error.message : 'Invalid username or password';
      showToast(message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
}
