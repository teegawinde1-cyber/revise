const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'revisebac:token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = value => value ? localStorage.setItem(TOKEN_KEY, value) : localStorage.removeItem(TOKEN_KEY);
export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}