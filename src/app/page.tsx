'use client';

import AuthForm from "../components/AuthForm";
import { useAuthStore } from "../components/useAuthStore";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4 sm:p-8">
        <div className="w-full max-w-lg">
          <AuthForm onAuthAction={login} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <Dashboard />
      </div>
    </main>
  );
}
