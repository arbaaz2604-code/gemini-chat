'use client';
import React from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(localStorage.getItem('theme') === 'dark');
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    const html = document.documentElement;
    if (newDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        aria-label="Toggle dark mode"
        className={`w-16 h-9 flex items-center rounded-full px-1 transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? 'bg-gradient-to-br from-blue-900 via-gray-900 to-blue-700' : 'bg-gradient-to-br from-blue-100 via-white to-blue-300'}`}
        onClick={toggle}
        tabIndex={0}
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 bg-white dark:bg-gray-900 ${dark ? 'translate-x-7' : 'translate-x-0'}`}>
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.219 4.219l1.061 1.061M17.657 17.657l1.061 1.061M3 12h1.5M19.5 12H21M4.219 19.781l1.061-1.061M17.657 6.343l1.061-1.061M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
} 