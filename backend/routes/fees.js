import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { student_id, month, amount, profit, payment_mode, paid_date } = req.body;
  if (!student_id || !month || amount === undefined || amount === '') {
    return res.status(400).json({ error: 'student_id, month, amount required' });
  }
  const result = db
    .prepare(
      'INSERT INTO fees (student_id, month, amount, profit, payment_mode, paid_date) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(
      student_id,
      month,
      Number(amount) || 0,
      Number(profit) || 0,
      payment_mode || null,
      paid_date || new Date().toISOString().slice(0, 10)
    );

  res.json(db.prepare('SELECT * FROM fees WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const { month, amount, profit, payment_mode, paid_date } = req.body;
  db.prepare(
    'UPDATE fees SET month=?, amount=?, profit=?, payment_mode=?, paid_date=? WHERE id=?'
  ).run(month, Number(amount) || 0, Number(profit) || 0, payment_mode, paid_date, req.params.id);
  res.json(db.prepare('SELECT * FROM fees WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM fees WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Dashboard summary — simple totals, no due/pending concept
router.get('/summary/all', (req, res) => {
  const totals = db
    .prepare(
      `SELECT COALESCE(SUM(amount),0) as total_collected, COALESCE(SUM(profit),0) as total_profit
       FROM fees`
    )
    .get();
  const studentCount = db.prepare('SELECT COUNT(*) as c FROM students').get().c;

  res.json({
    total_collected: totals.total_collected,
    total_profit: totals.total_profit,
    student_count: studentCount,
  });
});

// Most recent payments across all students, for the dashboard
router.get('/recent', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 50);
  const rows = db
    .prepare(
      `SELECT fees.id, fees.month, fees.amount, fees.profit, fees.payment_mode, fees.paid_date,
              students.id as student_id, students.name as student_name
       FROM fees
       JOIN students ON students.id = fees.student_id
       ORDER BY fees.paid_date DESC, fees.id DESC
       LIMIT ?`
    )
    .all(limit);
  res.json(rows);
});

export default router;
