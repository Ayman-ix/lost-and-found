'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, Mail, Lock, AlertCircle, ArrowRight, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleFillDemo = (targetRole: 'user' | 'admin') => {
    setRole(targetRole);
    if (targetRole === 'admin') {
      setEmail('admin@campus.edu');
      setPassword('admin123');
    } else {
      setEmail('alex@campus.edu');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      // Success
      login(data.user);
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch {
      setError('An unexpected network error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Card Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Sign in to your account
          </h1>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            Access your reported items, claims, and campus updates
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => {
              setRole('user');
              setError('');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              role === 'user'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            Student / User
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setError('');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              role === 'admin'
                ? 'bg-white text-amber-900 shadow-sm dark:bg-zinc-800 dark:text-amber-300'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4 text-amber-500" />
            Administrator
          </button>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {role === 'admin' ? 'Admin Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@campus.edu' : 'student@campus.edu'}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition disabled:opacity-50 active:scale-[0.99] ${
                role === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign in as {role === 'admin' ? 'Administrator' : 'User'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Viva / Evaluation */}
          <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              Quick demo credentials (for project evaluation):
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('user')}
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Fill Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
              >
                Fill Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
            Register as a student
          </Link>
        </p>
      </div>
    </div>
  );
}
