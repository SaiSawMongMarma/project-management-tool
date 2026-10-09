process.env.PORT = process.env.DEV_API_PORT || '4001';
await import('./index.js');
