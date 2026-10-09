# Orbit project workspace

A connected React + Express project-management workspace inspired by the clarity of Trello and Asana.

## Run locally with Neon

```bash
npm install
npm run server
```

Create `.env` from `.env.example`, paste your Neon pooled `DATABASE_URL`, and set a strong `JWT_SECRET`. The server automatically creates the users, projects, project_members, tasks, and comments tables on first start, then seeds the demo account:

```text
alex@orbit.team / password
```

```bash
npm run dev
```

This single command builds the React frontend and starts one Express process at `http://localhost:4000`. Express serves the compiled frontend, API routes, and WebSocket endpoint from the same port, so there is no frontend/backend port conflict.

## Deploy as one service

Build and serve the frontend and backend from the same Express service:

```bash
npm run build
npm start
```

Set these hosting commands:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health URL: `/api/health`

Set `NODE_ENV=production`, `DATABASE_URL`, and `JWT_SECRET` in the hosting provider's environment variables. Express serves the compiled React app and the API from the same domain, so the frontend and backend deploy together.

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- WebSocket updates: `ws://localhost:4000/ws`

The API uses Neon Postgres for persistent data. The frontend signs into the seeded demo account automatically when no token exists, so you only need to edit `.env` for the first run.

## API surface

- `POST /api/auth/login` and `POST /api/auth/register`
- `GET /api/me`
- `GET/POST /api/projects`
- `GET/POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId`
- `GET/POST /api/tasks/:taskId/comments`
- `GET /api/health`

The frontend falls back to the seeded board when the API is unavailable, so the UI is still easy to preview before dependencies are installed or a backend is deployed.
