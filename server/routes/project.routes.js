import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { broadcast } from '../realtime.js';

export function projectRoutes(app) {
  app.get('/api/projects', requireAuth, async (req, res) => {
    const result = await pool.query(`SELECT p.id,p.name,p.description,p.color,p.created_at AS "createdAt" FROM projects p JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = $1 ORDER BY p.created_at DESC`, [req.user.id]);
    res.json(result.rows);
  });

  app.post('/api/projects', requireAuth, async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(`INSERT INTO projects (name,description,created_by) VALUES ($1,$2,$3) RETURNING id,name,description,color,created_at AS "createdAt"`, [req.body.name, req.body.description || '', req.user.id]);
      const project = result.rows[0];
      await client.query(`INSERT INTO project_members (project_id,user_id) VALUES ($1,$2)`, [project.id, req.user.id]);
      await client.query('COMMIT');
      broadcast({ type: 'project.created', project });
      res.status(201).json(project);
    } catch (error) { await client.query('ROLLBACK'); res.status(500).json({ message: error.message }); } finally { client.release(); }
  });

  app.get('/api/projects/:projectId/tasks', requireAuth, async (req, res) => {
    const result = await pool.query(`SELECT t.id,t.project_id AS "projectId",t.title,t.description,t.status,t.priority,t.assignee_id AS "assigneeId",TO_CHAR(t.due_date,'YYYY-MM-DD') AS "dueDate",t.labels,t.created_at AS "createdAt",COUNT(c.id)::int AS comments FROM tasks t LEFT JOIN comments c ON c.task_id = t.id WHERE t.project_id = $1 GROUP BY t.id ORDER BY t.created_at DESC`, [req.params.projectId]);
    res.json(result.rows);
  });

  app.post('/api/projects/:projectId/tasks', requireAuth, async (req, res) => {
    const { title, description = '', status = 'todo', priority = 'medium', assigneeId = req.user.id, dueDate = null, labels = ['New'] } = req.body;
    const result = await pool.query(`INSERT INTO tasks (project_id,title,description,status,priority,assignee_id,due_date,labels) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,project_id AS "projectId",title,description,status,priority,assignee_id AS "assigneeId",TO_CHAR(due_date,'YYYY-MM-DD') AS "dueDate",labels,0 AS comments`, [req.params.projectId, title, description, status, priority, assigneeId, dueDate || null, JSON.stringify(labels)]);
    const task = result.rows[0];
    broadcast({ type: 'task.created', task });
    res.status(201).json(task);
  });
}
