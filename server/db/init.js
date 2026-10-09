import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Copy it from Neon into .env.');
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, initials TEXT NOT NULL, color TEXT DEFAULT '#e2b6ff', created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT DEFAULT '', color TEXT DEFAULT '#bdebd6', created_by UUID REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS project_members (project_id UUID REFERENCES projects(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id) ON DELETE CASCADE, PRIMARY KEY (project_id, user_id));
    CREATE TABLE IF NOT EXISTS tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID REFERENCES projects(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','inprogress','done')), priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')), assignee_id UUID REFERENCES users(id) ON DELETE SET NULL, due_date DATE, labels JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS comments_task_id_idx ON comments(task_id);
  `);
  const password = await bcrypt.hash('password', 12);
  const user = await pool.query(`INSERT INTO users (name,email,password_hash,initials,color) VALUES ('Alex Morgan','alex@orbit.team',$1,'AM','#e2b6ff') ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [password]);
  const userId = user.rows[0].id;
  const project = await pool.query(`INSERT INTO projects (name,description,color,created_by) SELECT 'Launch website','Website refresh · Q3','#ffcf75',$1 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Launch website') RETURNING id`, [userId]);
  const projectId = project.rows[0]?.id || (await pool.query(`SELECT id FROM projects WHERE name = 'Launch website' LIMIT 1`)).rows[0].id;
  await pool.query(`INSERT INTO project_members (project_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [projectId, userId]);
  const demoTasks = [
    ['Finalize homepage copy', 'Polish the headline and supporting proof points before review.', 'todo', 'high', '2026-08-28', ['Content']],
    ['Design pricing section', 'Explore the comparison table and mobile states.', 'todo', 'medium', '2026-08-30', ['Design']],
    ['Set up analytics events', 'Track signups, navigation and activation moments.', 'inprogress', 'medium', '2026-08-27', ['Development']],
    ['QA responsive layouts', 'Run through the key breakpoints on real devices.', 'inprogress', 'low', '2026-09-02', ['QA']],
    ['Create launch checklist', 'Gather all pre-launch tasks in one place.', 'done', 'low', '2026-08-21', ['Operations']],
    ['Share staging link', 'Send the latest staging build to the wider team.', 'done', 'medium', '2026-08-22', ['Launch']],
  ];
  for (const [title, description, status, priority, dueDate, labels] of demoTasks) {
    await pool.query(`INSERT INTO tasks (project_id,title,description,status,priority,assignee_id,due_date,labels) SELECT $1,$2,$3,$4,$5,$6,$7,$8 WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE project_id=$1 AND title=$2)`, [projectId, title, description, status, priority, userId, dueDate, JSON.stringify(labels)]);
  }
}
