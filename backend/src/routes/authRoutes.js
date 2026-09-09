import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jharkhand-sih-2026-secret-key-dgms-verified';

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        siteId: user.site_id,
        district: user.district
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        siteId: user.site_id,
        district: user.district
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/roles - quick role accounts for hackathon demo
router.get('/demo-accounts', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, username, full_name, role, site_id, district FROM users');
    const accounts = stmt.all();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/demo-switch - switch active user for interactive testing
router.post('/demo-switch', (req, res) => {
  try {
    const { role } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE role = ? LIMIT 1');
    const user = stmt.get(role || 'WORKER');

    if (!user) {
      return res.status(404).json({ error: 'Role user not found' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        siteId: user.site_id,
        district: user.district
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        siteId: user.site_id,
        district: user.district
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
