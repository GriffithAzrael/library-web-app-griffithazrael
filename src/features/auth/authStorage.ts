import type { AuthUser } from './types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function loadAuthFromStorage(): {
  token: string;
  user: AuthUser;
} | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  if (!token || !userStr) return null;

  try {
    const user = JSON.parse(userStr) as AuthUser;
    return { token, user };
  } catch {
    return null;
  }
}

export function saveAuthToStorage(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthFromStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
