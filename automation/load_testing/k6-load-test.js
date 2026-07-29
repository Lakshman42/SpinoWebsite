// automation/load_testing/k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 VUs
    { duration: '1m', target: 100 },  // Baseline: 100 VUs for 1 minute
    { duration: '30s', target: 200 }, // Stress: 200 VUs
    { duration: '30s', target: 500 }, // Spike: 500 VUs
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'avg<250'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],             // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const res = http.get(`${BASE_URL}/index.html`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 250ms': (r) => r.timings.duration < 250,
  });
  sleep(0.5);
}
