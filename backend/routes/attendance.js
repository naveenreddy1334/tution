import express from 'express';
import db from '../db.js';

const router = express.Router();
const VALID_STATUSES = ['present', 'absent'];

// Mark attendance for one student on a date (upsert)
router.post('/', (req, res) => {
  const { student_id, date, status } = req.body;
  if (!student_id || !date || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'student_id, date, and status (present/absent) required' });
  }
  db.prepare(
    `INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)
     ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status`
  ).run(student_id, date, status);

  res.json({ success: true });
});

// Bulk mark attendance for a whole class on one date: [{student_id, status}, ...]
router.post('/bulk', (req, res) => {
  const { date, records } = req.body;
  if (!date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'date and a non-empty records[] required' });
  }
  const invalid = records.some((r) => !r.student_id || !VALID_STATUSES.includes(r.status));
  if (invalid) {
    return res.status(400).json({ error: 'every record needs student_id and status (present/absent)' });
  }

  const stmt = db.prepare(
    `INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)
     ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status`
  );
  const insertMany = db.transaction((recs) => {
    for (const r of recs) stmt.run(r.student_id, date, r.status);
  });
  insertMany(records);

  res.json({ success: true, count: records.length });
});

// Get attendance for a specific date (all students)
router.get('/date/:date', (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id as student_id, s.name, s.class, a.status
       FROM students s
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
       ORDER BY s.name`
    )
    .all(req.params.date);
  res.json(rows);
});

export default router;
