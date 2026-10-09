const clients = new Set();
export function registerSocket(socket) { clients.add(socket); socket.on('close', () => clients.delete(socket)); socket.send(JSON.stringify({ type: 'connected' })); }
export function broadcast(message) { const payload = JSON.stringify(message); clients.forEach((client) => client.readyState === 1 && client.send(payload)); }
