import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { initializeDatabase } from './db/init.js';
import { registerSocket } from './realtime.js';
import { authRoutes } from './routes/auth.routes.js';
import { projectRoutes } from './routes/project.routes.js';
import { taskRoutes } from './routes/task.routes.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const currentFile = fileURLToPath(import.meta.url);
const serverDirectory = path.dirname(currentFile);
const clientDist = path.join(serverDirectory, '..', 'dist');

app.use(cors());
app.use(express.json());
app.get('/api/health', async (_, res) => {
  const result = await pool.query('SELECT NOW() AS now');
  res.json({ status: 'ok', database: true, time: result.rows[0].now });
});

authRoutes(app);
projectRoutes(app);
taskRoutes(app);
if (env.nodeEnv === 'production' || process.env.SERVE_CLIENT === 'true') {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_, res) => res.sendFile(path.join(clientDist, 'index.html')));
}
wss.on('connection', registerSocket);

initializeDatabase()
  .then(() => server.listen(env.port, () => console.log(`Orbit API listening on http://localhost:${env.port}`)))
  .catch((error) => { console.error('Database initialization failed:', error.message); process.exit(1); });
