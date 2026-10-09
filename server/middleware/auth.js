import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';

export async function requireAuth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, env.jwtSecret);
    const result = await pool.query(`SELECT id,name,email,initials,color FROM users WHERE id = $1`, [payload.id]);
    if (!result.rows[0]) return res.status(401).json({ message: 'User not found.' });
    req.user = result.rows[0];
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired authentication token.' }); }
}
