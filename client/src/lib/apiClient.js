export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || 'Une erreur est survenue.';
    const details = payload?.error?.details || payload?.errors || null;
    const err = new Error(message);
    err.status = response.status;
    err.details = details;
    throw err;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
}
