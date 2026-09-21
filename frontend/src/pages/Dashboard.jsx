import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent || 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
    </div>
  );
}

function formatMonth(month) {
  if (!month) return '—';
  const [y, m] = month.split('-');
  if (!y || !m) return month;
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getFeeSummary(), api.getRecentFees(8)])
      .then(([s, r]) => {
        setSummary(s);
        setRecent(r);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Students" value={summary.student_count} />
        <StatCard
          label="Fees Collected"
          value={`₹${summary.total_collected.toLocaleString()}`}
          accent="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Total Profit"
          value={`₹${summary.total_profit.toLocaleString()}`}
          accent="text-brand-600 dark:text-brand-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Payments</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No payments recorded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {recent.map((f) => (
              <li key={f.id} className="py-2.5 flex items-center justify-between text-sm gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/students/${f.student_id}`}
                    className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                  >
                    {f.student_name}
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatMonth(f.month)} {f.payment_mode ? `• ${f.payment_mode}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-800 dark:text-gray-200 font-medium">₹{f.amount.toLocaleString()}</p>
                  {f.profit > 0 && (
                    <p className="text-xs text-brand-600 dark:text-brand-400">Profit ₹{f.profit.toLocaleString()}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
