import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    setLoading(true);
    setSaved(false);
    api
      .getAttendanceByDate(date)
      .then((data) => {
        setRows(data.map((r) => ({ ...r, status: r.status || 'present' })));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  function setStatus(studentId, status) {
    setRows((prev) => prev.map((r) => (r.student_id === studentId ? { ...r, status } : r)));
  }

  function markAllPresent() {
    setRows((prev) => prev.map((r) => ({ ...r, status: 'present' })));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    await api.bulkAttendance(
      date,
      rows.map((r) => ({ student_id: r.student_id, status: r.status }))
    );
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Attendance</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-1.5 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No students yet. Add some in the Students tab first.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">{rows.length} students</span>
            <button onClick={markAllPresent} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              Mark all present
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((r) => (
              <div key={r.student_id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{r.name}</p>
                  {r.class && <p className="text-xs text-gray-400 dark:text-gray-500">{r.class}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setStatus(r.student_id, 'present')}
                    className={`w-10 h-9 rounded-md text-sm font-semibold ${
                      r.status === 'present'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
                    }`}
                  >
                    P
                  </button>
                  <button
                    onClick={() => setStatus(r.student_id, 'absent')}
                    className={`w-10 h-9 rounded-md text-sm font-semibold ${
                      r.status === 'absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900'
                    }`}
                  >
                    A
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <span className="text-sm text-green-600 dark:text-green-400">{saved && 'Saved.'}</span>
            <button
              onClick={save}
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-md px-5 py-2 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
