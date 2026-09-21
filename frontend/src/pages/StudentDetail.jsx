import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

function formatMonth(month) {
  if (!month) return '—';
  const [y, m] = month.split('-');
  if (!y || !m) return month;
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const currentMonth = new Date().toISOString().slice(0, 7); // "2026-09"

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feeForm, setFeeForm] = useState({
    month: currentMonth,
    amount: '',
    profit: '',
    payment_mode: 'Cash',
  });

  function load() {
    setLoading(true);
    api.getStudent(id).then(setStudent).finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function addFee(e) {
    e.preventDefault();
    setError('');
    if (!feeForm.month || !feeForm.amount) {
      setError('Month and amount are required.');
      return;
    }
    try {
      await api.addFee({
        student_id: id,
        month: feeForm.month,
        amount: parseFloat(feeForm.amount),
        profit: parseFloat(feeForm.profit || 0),
        payment_mode: feeForm.payment_mode,
        paid_date: new Date().toISOString().slice(0, 10),
      });
      setFeeForm({ month: currentMonth, amount: '', profit: '', payment_mode: 'Cash' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeFee(feeId) {
    if (!confirm('Delete this payment record?')) return;
    await api.deleteFee(feeId);
    load();
  }

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (!student) return <div className="p-8 text-gray-500 dark:text-gray-400">Not found.</div>;

  const totalPresent = student.attendance.filter((a) => a.status === 'present').length;
  const pct = student.attendance.length ? Math.round((totalPresent / student.attendance.length) * 100) : null;
  const totalCollected = student.fees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Link to="/students" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
        ← Back to Students
      </Link>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 my-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{student.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {student.class || 'No class'}
          {student.subjects ? ` • ${student.subjects.split(',').join(', ')}` : ''}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Parent: {student.parent_name || '—'} {student.parent_contact ? `(${student.parent_contact})` : ''}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attendance */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-900 dark:text-gray-100">Attendance</h2>
            {pct !== null && (
              <span
                className={`text-sm font-medium ${
                  pct < 75 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                }`}
              >
                {pct}%
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {student.attendance.map((a) => (
              <div key={a.id} className="py-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{a.date}</span>
                <span className={a.status === 'present' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {a.status}
                </span>
              </div>
            ))}
            {student.attendance.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No attendance records yet.</p>
            )}
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-900 dark:text-gray-100">Fees</h2>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              ₹{totalCollected.toLocaleString()} total
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 mb-4 max-h-56 overflow-y-auto">
            {student.fees.map((f) => (
              <div key={f.id} className="py-2 text-sm group">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{formatMonth(f.month)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800 dark:text-gray-200 font-medium">₹{f.amount.toLocaleString()}</span>
                    <button
                      onClick={() => removeFee(f.id)}
                      className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete this payment"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {f.payment_mode || '—'} {f.paid_date ? `• ${f.paid_date}` : ''}
                </div>
                {f.profit > 0 && (
                  <div className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">Profit: ₹{f.profit.toLocaleString()}</div>
                )}
              </div>
            ))}
            {student.fees.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No fee records yet.</p>}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-md px-3 py-2 mb-3">
              {error}
            </div>
          )}

          <form onSubmit={addFee} className="grid grid-cols-2 gap-2">
            <input
              type="month"
              value={feeForm.month}
              onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}
              className="col-span-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-sm"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount collected"
              value={feeForm.amount}
              onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-sm"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Profit"
              value={feeForm.profit}
              onChange={(e) => setFeeForm({ ...feeForm, profit: e.target.value })}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-sm"
            />
            <select
              value={feeForm.payment_mode}
              onChange={(e) => setFeeForm({ ...feeForm, payment_mode: e.target.value })}
              className="col-span-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank">Bank</option>
            </select>
            <button className="col-span-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-md py-1.5">
              Add Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
