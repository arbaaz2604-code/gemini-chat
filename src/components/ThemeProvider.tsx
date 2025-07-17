'use client';
import React, { useEffect, useState } from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div className="min-h-screen bg-white dark:bg-gray-900" />;
  }

  return (
    <>
      <DarkModeToggle />
      {children}
    </>
  );
} 