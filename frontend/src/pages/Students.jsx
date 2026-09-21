import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const SUBJECTS = ['Maths', 'Science', 'Social Science', 'Kannada', 'Hindi', 'English'];

const emptyForm = { name: '', class: '', subjects: [], parent_name: '', parent_contact: '' };

function SubjectPicker({ selected, onChange }) {
  const allSelected = SUBJECTS.every((s) => selected.includes(s));

  function toggleSubject(subject) {
    if (selected.includes(subject)) {
      onChange(selected.filter((s) => s !== subject));
    } else {
      onChange([...selected, subject]);
    }
  }

  function toggleAll() {
    onChange(allSelected ? [] : [...SUBJECTS]);
  }

  return (
    <div className="col-span-2">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Subjects</label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleAll}
          className={`text-xs px-3 py-1.5 rounded-full border ${
            allSelected
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {SUBJECTS.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => toggleSubject(s)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              selected.includes(s)
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.getStudents().then(setStudents).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function startEdit(s) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      class: s.class || '',
      subjects: s.subjects ? s.subjects.split(',').filter(Boolean) : [],
      parent_name: s.parent_name || '',
      parent_contact: s.parent_contact || '',
    });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    try {
      if (editingId) {
        await api.updateStudent(editingId, form);
      } else {
        await api.createStudent(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeStudent(id) {
    if (!confirm('Delete this student and all their records? This cannot be undone.')) return;
    await api.deleteStudent(id);
    load();
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Students</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : startAdd())}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-md px-4 py-2 shrink-0"
        >
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <h3 className="col-span-1 sm:col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300 -mb-1">
            {editingId ? 'Edit Student' : 'New Student'}
          </h3>
          {error && (
            <div className="col-span-1 sm:col-span-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm col-span-1 sm:col-span-2"
            required
          />
          <input
            placeholder="Class (e.g. 5-A)"
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm col-span-1 sm:col-span-2"
          />
          <SubjectPicker selected={form.subjects} onChange={(subjects) => setForm({ ...form, subjects })} />
          <input
            placeholder="Parent name"
            value={form.parent_name}
            onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Parent contact"
            value={form.parent_contact}
            onChange={(e) => setForm({ ...form, parent_contact: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
          />
          <button className="col-span-1 sm:col-span-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-md py-2">
            {editingId ? 'Save Changes' : 'Save Student'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subjects</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Fees Collected</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link to={`/students/${s.id}`} className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.class || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    {s.subjects ? s.subjects.split(',').join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {s.attendance_pct === null ? (
                      <span className="text-gray-400 dark:text-gray-500">No data</span>
                    ) : (
                      <span
                        className={
                          s.attendance_pct < 75
                            ? 'text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        }
                      >
                        {s.attendance_pct}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                    ₹{s.fees_collected.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link to={`/students/${s.id}`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                      Fees
                    </Link>
                    <button onClick={() => startEdit(s)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => removeStudent(s.id)}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">
                    No students yet. Add your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
