function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function login(credentials) {
  const username = credentials && credentials.username ? String(credentials.username).trim() : '';
  const password = credentials && credentials.password ? String(credentials.password).trim() : '';

  await delay(400);

  if (!username || !password) {
    const error = new Error('Enter username and password');
    error.code = 'VALIDATION';
    throw error;
  }

  const expectedPassword = 'pinspire123';

  if (password !== expectedPassword) {
    const error = new Error('Invalid username or password');
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const token = `mock-token-${Date.now()}`;
  return { username, token };
}
