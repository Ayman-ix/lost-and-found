'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, LogOut, Package, FileCheck, ArrowRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <User className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">Sign In Required</h2>
        <p className="mt-1 text-xs text-zinc-500">Please sign in to view your profile.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          My Account Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Personal identification and database membership details.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-md shadow-blue-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
            <span className="mt-2 inline-block rounded-md bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300">
              Role: {user.role}
            </span>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="text-zinc-400 block text-[11px]">Database Primary Key</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
              user_id: {user.userId}
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">
              Referenced as Foreign Key across lost_item, found_item, and claim tables.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="text-zinc-400 block text-[11px]">Account Type</span>
            <span className="font-bold text-zinc-900 dark:text-white text-sm">
              {user.role === 'admin' ? 'Administrator' : 'Standard Student / User'}
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">
              {user.role === 'admin' ? 'Has full administrative verification rights.' : 'Can report items and submit claims.'}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-2">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Navigation Shortcuts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link
              href="/my-items"
              className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-850"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-zinc-400" />
                <span>My Reported Items</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
            <Link
              href="/my-claims"
              className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-850"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-zinc-400" />
                <span>My Ownership Claims</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Sign Out */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
