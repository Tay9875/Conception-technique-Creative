const raw = process.env.REACT_APP_API_URL;

export const API_URL = raw && raw.trim() ? raw.trim() : '/api';
