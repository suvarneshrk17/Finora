import app from '../src/app.js';

const server = app.listen(0);
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}/api/v1`;

const checks = [
  ['GET', '/health', null, 200],
  ['POST', '/auth/login', { email: 'bad-email', password: '' }, 422],
  ['POST', '/auth/register', { name: '', email: 'bad-email', password: 'short' }, 422],
  ['GET', '/dashboard/summary', null, 401],
  ['GET', '/customers', null, 401],
  ['POST', '/customers', {}, 401],
  ['GET', '/customers/507f1f77bcf86cd799439011', null, 401],
  ['PATCH', '/customers/507f1f77bcf86cd799439011', {}, 401],
  ['DELETE', '/customers/507f1f77bcf86cd799439011', null, 401],
  ['POST', '/customers/507f1f77bcf86cd799439011/notes', {}, 401],
  ['GET', '/customers/507f1f77bcf86cd799439011/timeline', null, 401],
  ['GET', '/loans', null, 401],
  ['POST', '/loans', {}, 401],
  ['GET', '/loans/507f1f77bcf86cd799439011', null, 401],
  ['PATCH', '/loans/507f1f77bcf86cd799439011', {}, 401],
  ['POST', '/loans/507f1f77bcf86cd799439011/calculate/simple-interest', {}, 401],
  ['POST', '/loans/507f1f77bcf86cd799439011/calculate/compound-interest', {}, 401],
  ['PATCH', '/loans/507f1f77bcf86cd799439011/close', {}, 401],
  ['PATCH', '/loans/507f1f77bcf86cd799439011/cancel', {}, 401],
  ['PATCH', '/loans/507f1f77bcf86cd799439011/mark-paid', {}, 401],
  ['GET', '/emis', null, 401],
  ['POST', '/emis', {}, 401],
  ['GET', '/emis/507f1f77bcf86cd799439011', null, 401],
  ['PATCH', '/emis/507f1f77bcf86cd799439011', {}, 401],
  ['DELETE', '/emis/507f1f77bcf86cd799439011', null, 401],
  ['PATCH', '/emis/507f1f77bcf86cd799439011/mark-paid', {}, 401],
  ['GET', '/payments', null, 401],
  ['POST', '/payments', {}, 401],
  ['GET', '/payments/507f1f77bcf86cd799439011', null, 401],
  ['POST', '/payments/507f1f77bcf86cd799439011/refund', {}, 401],
];

try {
  for (const [method, path, body, expected] of checks) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status !== expected) {
      throw new Error(`${method} ${path} expected ${expected}, got ${response.status}`);
    }
  }

  console.log(`route checks passed: ${checks.length}`);
} finally {
  server.close();
}
