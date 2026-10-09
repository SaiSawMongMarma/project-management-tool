import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const tokenFor = (user) => jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '7d' });

export function authRoutes(app) {
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email, and a password of at least 6 characters are required.' });
      const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
      const result = await pool.query(`INSERT INTO users (name,email,password_hash,initials) VALUES ($1,LOWER($2),$3,$4) RETURNING id,name,email,initials,color`, [name, email, await bcrypt.hash(password, 12), initials]);
      const user = result.rows[0];
      res.status(201).json({ token: tokenFor(user), user });
    } catch (error) { res.status(error.code === '23505' ? 409 : 500).json({ message: error.code === '23505' ? 'An account with that email already exists.' : 'Could not create account.' }); }
  });

  app.post('/api/auth/login', async (req, res) => {
    const result = await pool.query(`SELECT id,name,email,password_hash,initials,color FROM users WHERE email = LOWER($1)`, [req.body.email || '']);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash))) return res.status(401).json({ message: 'Invalid email or password.' });
    const { password_hash, ...safeUser } = user;
    res.json({ token: tokenFor(user), user: safeUser });
  });

  app.get('/api/me', requireAuth, (req, res) => res.json({ user: req.user }));
}
