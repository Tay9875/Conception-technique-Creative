import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const metrics = {
  incHttp: (method: string, route: string, statusCode: number) => {
    httpCounter.inc({ method, route, status_code: String(statusCode) });
  },
  contentType: register.contentType,
  render: async () => register.metrics()
};
