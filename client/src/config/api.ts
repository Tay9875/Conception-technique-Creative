const raw = import.meta.env.VITE_API_URL;

export const API_URL = raw && raw.trim() ? raw.trim() : '/api';
