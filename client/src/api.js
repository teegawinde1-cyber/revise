const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const DEVICE_KEY = 'revisebac:device-id';
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'device-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
export const getToken = () => getDeviceId();
export const setToken = () => {};
export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', 'X-ReviseBac-Device': getDeviceId(), ...(options.headers || {}) };
  const response = await fetch(API + path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}
