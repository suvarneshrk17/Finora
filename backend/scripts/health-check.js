const baseUrl = process.env.API_URL || 'http://localhost:5000/api/v1';

const response = await fetch(`${baseUrl}/health`);
const payload = await response.json();

console.log(`${response.status} ${payload.status}: ${payload.message}`);
