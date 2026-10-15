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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D3632D] dark:bg-[#E8613A] text-white shadow-md shadow-[#D3632D]/30">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#231F20] dark:text-[#F0EFE9]">
            Sign In to Campus Portal
          </h1>
          <p className="mt-1.5 text-xs text-[#555555] dark:text-[#8E8C87]">
            Campus Lost &amp; Found Management System
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="flex rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-gray-100 dark:bg-[#1A1A1A] p-1">
          <button
            type="button"
            onClick={() => {
              setRole('user');
              setError('');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
              role === 'user'
                ? 'bg-white dark:bg-[#141414] text-[#D3632D] dark:text-[#E8613A] shadow-sm'
                : 'text-[#555555] dark:text-[#8E8C87] hover:text-[#231F20] dark:hover:text-[#F0EFE9]'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Student / User</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setError('');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
              role === 'admin'
                ? 'bg-white dark:bg-[#141414] text-[#D3632D] dark:text-[#E8613A] shadow-sm'
                : 'text-[#555555] dark:text-[#8E8C87] hover:text-[#231F20] dark:hover:text-[#F0EFE9]'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Campus Admin</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-sm transition-colors duration-200">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#231F20] dark:text-[#F0EFE9] uppercase tracking-wider mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#808080] dark:text-[#8E8C87]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@campus.edu' : 'student@campus.edu'}
                  className="w-full rounded-lg border border-[#ECECEC] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#1A1A1A] py-2.5 pl-10 pr-3 text-sm text-[#231F20] dark:text-[#F0EFE9] placeholder:text-[#808080] dark:placeholder:text-[#7A7874] focus:border-[#D3632D] dark:focus:border-[#E8613A] focus:bg-white dark:focus:bg-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#231F20] dark:text-[#F0EFE9] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#808080] dark:text-[#8E8C87]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#ECECEC] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#1A1A1A] py-2.5 pl-10 pr-3 text-sm text-[#231F20] dark:text-[#F0EFE9] placeholder:text-[#808080] dark:placeholder:text-[#7A7874] focus:border-[#D3632D] dark:focus:border-[#E8613A] focus:bg-white dark:focus:bg-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#D3632D] dark:bg-[#E8613A] py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#D3632D]/25 transition hover:bg-[#BA4F1D] dark:hover:bg-[#D3522C] disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign in as {role === 'admin' ? 'Campus Authority' : 'Student / User'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 border-t border-[#ECECEC] dark:border-white/[0.08] pt-4">
            <p className="text-[11px] font-bold text-[#555555] dark:text-[#8E8C87] uppercase tracking-wider mb-2">
              Quick demo credentials (for project evaluation):
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('user')}
                className="flex-1 rounded-lg border border-[#ECECEC] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#1A1A1A] px-2 py-1.5 text-[11px] font-bold text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#E8613A]/15 hover:text-[#D3632D] dark:hover:text-[#E8613A]"
              >
                Fill Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="flex-1 rounded-lg border border-[#D3632D]/40 dark:border-[#E8613A]/40 bg-[#FFF4ED] dark:bg-[#E8613A]/15 px-2 py-1.5 text-[11px] font-bold text-[#D3632D] dark:text-[#E8613A] hover:bg-[#FFE8D6] dark:hover:bg-[#E8613A]/25"
              >
                Fill Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#555555] dark:text-[#8E8C87]">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-bold text-[#D3632D] dark:text-[#E8613A] hover:text-[#BA4F1D] dark:hover:text-[#D3522C]">
            Register as a student
          </Link>
        </p>
      </div>
    </div>
  );
}
