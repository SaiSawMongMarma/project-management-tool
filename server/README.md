# Server structure

- `index.js` — Express app, HTTP server, WebSocket server, and route registration
- `config/env.js` — environment configuration
- `db/pool.js` — Neon PostgreSQL pool
- `db/init.js` — automatic schema creation and demo seed
- `middleware/auth.js` — JWT verification against Neon users
- `routes/` — auth, project, task, and comment endpoints
- `/api/auth/*` — registration and JWT login
- `/api/projects/*` — project and task resources
- `/api/tasks/*` — task updates and comments
- `/ws` — live task/comment broadcast channel
