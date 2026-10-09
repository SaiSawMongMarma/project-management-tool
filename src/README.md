# Client structure

- `main.jsx` — app composition and workspace state
- `components/` — reusable UI primitives
- `services/api.js` — authenticated API client and resource methods
- `data/seed.js` — local preview seed data
- `styles.css` — visual system and responsive layout

The workspace reads projects and tasks from the Express API whenever it is available, then uses the seed data as a preview fallback.
