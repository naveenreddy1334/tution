import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all students with computed attendance % and total fees collected
router.get('/', (req, res) => {
  const students = db.prepare('SELECT * FROM students ORDER BY name').all();

  const result = students.map((s) => {
    const attendance = db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
         FROM attendance WHERE student_id = ?`
      )
      .get(s.id);

    const fees = db
      .prepare(
        `SELECT COALESCE(SUM(amount),0) as total_collected, COALESCE(SUM(profit),0) as total_profit
         FROM fees WHERE student_id = ?`
      )
      .get(s.id);

    const attendancePct = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : null;

    return {
      ...s,
      attendance_pct: attendancePct,
      fees_collected: fees.total_collected,
      fees_profit: fees.total_profit,
    };
  });

  res.json(result);
});

// Get single student with full attendance + fee history
router.get('/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });

  const attendance = db
    .prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC')
    .all(req.params.id);
  const fees = db
    .prepare('SELECT * FROM fees WHERE student_id = ? ORDER BY paid_date DESC, id DESC')
    .all(req.params.id);

  res.json({ ...student, attendance, fees });
});

router.post('/', (req, res) => {
  const { name, class: className, subjects, parent_name, parent_contact } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });

  const subjectsStr = Array.isArray(subjects) ? subjects.join(',') : subjects || null;

  const result = db
    .prepare(
      'INSERT INTO students (name, class, subjects, parent_name, parent_contact) VALUES (?, ?, ?, ?, ?)'
    )
    .run(name.trim(), className || null, subjectsStr, parent_name || null, parent_contact || null);

  res.json(db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });

  const { name, class: className, subjects, parent_name, parent_contact } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const subjectsStr = Array.isArray(subjects) ? subjects.join(',') : subjects || null;

  db.prepare(
    'UPDATE students SET name=?, class=?, subjects=?, parent_name=?, parent_contact=? WHERE id=?'
  ).run(name.trim(), className || null, subjectsStr, parent_name || null, parent_contact || null, req.params.id);
  res.json(db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
