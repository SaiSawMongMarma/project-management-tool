process.env.PORT = process.env.DEV_PORT || '4000';
process.env.SERVE_CLIENT = 'true';
await import('./index.js');
