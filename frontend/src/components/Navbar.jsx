import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { getInitialTheme, setTheme } from '../theme.js';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [theme, setThemeState] = useState(getInitialTheme());

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  }

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
      location.pathname === path
        ? 'bg-brand-600 text-white'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto">
          <span className="font-semibold text-lg text-brand-700 dark:text-brand-500 pr-2 whitespace-nowrap">
            Tuition Admin
          </span>
          <Link to="/" className={linkClass('/')}>
            Dashboard
          </Link>
          <Link to="/students" className={linkClass('/students')}>
            Students
          </Link>
          <Link to="/attendance" className={linkClass('/attendance')}>
            Attendance
          </Link>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="text-sm px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 font-medium whitespace-nowrap"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
