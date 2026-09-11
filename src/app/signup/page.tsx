'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, User, Mail, Phone, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Success
      login(data.user);
      router.push('/');
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D3632D] text-white shadow-md shadow-[#D3632D]/30">
            <Compass className="h-6 w-6" />
          </div>
          <span className="mt-4 inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#D3632D]">
            Campus Recovery Portal
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#231F20]">
            Create an Account
          </h1>
          <p className="mt-1.5 text-xs text-[#64748B]">
            Join the Campus Recovery Portal to report items and track claims
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Campus Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Contact Phone <span className="text-[10px] text-zinc-400">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D3632D] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#D3632D]/25 transition hover:bg-[#BA4F1D] disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* DBMS schema tip */}
          <div className="mt-6 border-t border-[#ECECEC] pt-4">
            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#D3632D]" />
              <span>Inserts a normalized record into MySQL <code>user</code> table.</span>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#D3632D] hover:text-[#BA4F1D]">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
