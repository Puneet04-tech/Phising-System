import axios from 'axios';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

export async function apiPost(path, body) {
  const res = await api.post(path, body);
  return res.data;
}
