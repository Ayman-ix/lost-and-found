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
        <p className="mt-1 text-xs text-[#64748B]">Please sign in to view your profile.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#BA4F1D] shadow-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#231F20]">
          My Account Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
          Personal identification and database membership details.
        </p>
      </div>

      <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D3632D] text-2xl font-bold text-white shadow-md shadow-[#D3632D]/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#231F20]">{user.name}</h2>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
            <span className="mt-2 inline-block rounded-md bg-[#FFF4ED] border border-[#FFD8C2] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#D3632D]">
              Role: {user.role}
            </span>
          </div>
        </div>

        <div className="border-t border-[#ECECEC] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-[#ECECEC] bg-[#F8F9FA] p-4">
            <span className="text-[#64748B] block text-[11px]">Database Primary Key</span>
            <span className="font-mono font-bold text-[#231F20] text-sm">
              user_id: {user.userId}
            </span>
            <p className="text-[10px] text-[#64748B] mt-1">
              Referenced as Foreign Key across lost_item, found_item, and claim tables.
            </p>
          </div>

          <div className="rounded-xl border border-[#ECECEC] bg-[#F8F9FA] p-4">
            <span className="text-[#64748B] block text-[11px]">Account Type</span>
            <span className="font-bold text-[#231F20] text-sm">
              {user.role === 'admin' ? 'Administrator' : 'Standard Student / User'}
            </span>
            <p className="text-[10px] text-[#64748B] mt-1">
              {user.role === 'admin' ? 'Has full administrative verification rights.' : 'Can report items and submit claims.'}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="border-t border-[#ECECEC] pt-6 space-y-2">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Navigation Shortcuts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link
              href="/my-items"
              className="flex items-center justify-between rounded-xl border border-[#ECECEC] p-3 text-xs font-semibold text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D] hover:border-[#FFD8C2] transition"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#D3632D]" />
                <span>My Reported Items</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
            <Link
              href="/my-claims"
              className="flex items-center justify-between rounded-xl border border-[#ECECEC] p-3 text-xs font-semibold text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D] hover:border-[#FFD8C2] transition"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[#D3632D]" />
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
