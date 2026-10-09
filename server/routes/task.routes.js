import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { broadcast } from '../realtime.js';

export function taskRoutes(app) {
  app.patch('/api/tasks/:taskId', requireAuth, async (req, res) => {
    const allowed = ['title', 'description', 'status', 'priority', 'assigneeId', 'dueDate', 'labels'];
    const entries = Object.entries(req.body).filter(([key]) => allowed.includes(key));
    if (!entries.length) return res.status(400).json({ message: 'No editable fields provided.' });
    const columns = { assigneeId: 'assignee_id', dueDate: 'due_date' };
    const set = entries.map(([key], index) => `${columns[key] || key} = $${index + 1}`).join(', ');
    const values = entries.map(([, value]) => Array.isArray(value) ? JSON.stringify(value) : value);
    const result = await pool.query(`UPDATE tasks SET ${set},updated_at=NOW() WHERE id=$${values.length + 1} RETURNING id,project_id AS "projectId",title,description,status,priority,assignee_id AS "assigneeId",TO_CHAR(due_date,'YYYY-MM-DD') AS "dueDate",labels`, [...values, req.params.taskId]);
    if (!result.rows[0]) return res.sendStatus(404);
    broadcast({ type: 'task.updated', task: result.rows[0] });
    res.json(result.rows[0]);
  });

  app.get('/api/tasks/:taskId/comments', requireAuth, async (req, res) => {
    const result = await pool.query(`SELECT c.id,c.task_id AS "taskId",c.body,c.created_at AS "createdAt",json_build_object('id',u.id,'name',u.name,'initials',u.initials,'color',u.color) AS user FROM comments c JOIN users u ON u.id=c.user_id WHERE c.task_id=$1 ORDER BY c.created_at ASC`, [req.params.taskId]);
    res.json(result.rows);
  });

  app.post('/api/tasks/:taskId/comments', requireAuth, async (req, res) => {
    const result = await pool.query(`INSERT INTO comments (task_id,user_id,body) VALUES ($1,$2,$3) RETURNING id,task_id AS "taskId",body,created_at AS "createdAt"`, [req.params.taskId, req.user.id, req.body.body]);
    const comment = { ...result.rows[0], user: req.user };
    broadcast({ type: 'comment.created', comment });
    res.status(201).json(comment);
  });
}
