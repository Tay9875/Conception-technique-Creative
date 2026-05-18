const baseUrl = process.argv[2] || process.env.SMOKE_BASE_URL || process.env.PUBLIC_APP_URL;

if (!baseUrl) {
  console.error('Missing smoke test base URL. Pass it as an argument or set SMOKE_BASE_URL.');
  process.exit(1);
}

const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}) => {
  const retries = Number(process.env.SMOKE_RETRIES || 12);
  const delayMs = Number(process.env.SMOKE_RETRY_DELAY_MS || 5000);
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }

      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await sleep(delayMs);
    }
  }

  throw lastError;
};

const run = async () => {
  const htmlResponse = await fetchWithRetry(`${normalizedBaseUrl}/`);
  const html = await htmlResponse.text();

  if (!html.includes('<div id="root">') && !html.includes('static/js/')) {
    throw new Error('Frontend HTML does not look like the React app shell.');
  }

  const healthResponse = await fetchWithRetry(`${normalizedBaseUrl}/api/health`, {
    headers: { Accept: 'application/json' }
  });
  const health = await healthResponse.json();

  if (health.status !== 'ok' || health.service !== 'oncarya-api') {
    throw new Error(`Unexpected API health payload: ${JSON.stringify(health)}`);
  }

  console.log(`Smoke test OK for ${normalizedBaseUrl}`);
};

run().catch((error) => {
  console.error(`Smoke test failed: ${error.message}`);
  process.exit(1);
});
