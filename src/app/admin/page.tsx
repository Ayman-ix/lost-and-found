'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  Users,
  Package,
  FileCheck,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalLost: number;
  totalFound: number;
  pendingClaims: number;
  pendingMatches: number;
  totalVerifications: number;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'admin') {
      loadStats();
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="p-16 text-center text-xs text-zinc-500">Loading admin console...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-4">
          <Shield className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Authentication Required</h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          This section is restricted to authorized campus system administrators.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Sign In as Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Campus Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Lost & Found Management Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, {user.name}. Oversee claim verifications, rule-based matching, and inventory statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/claims"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
          >
            <FileCheck className="h-4 w-4" />
            Review Pending Claims ({stats?.pendingClaims || 0})
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase">Users</span>
          <p className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white">
            {stats?.totalUsers || 0}
          </p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Registered students</span>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 dark:border-red-950 dark:bg-red-950/20">
          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase">Lost Items</span>
          <p className="mt-1 text-2xl font-extrabold text-red-700 dark:text-red-300">
            {stats?.totalLost || 0}
          </p>
          <span className="text-[10px] text-red-500 mt-1 block">Reported missing</span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Found Items</span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {stats?.totalFound || 0}
          </p>
          <span className="text-[10px] text-emerald-500 mt-1 block">Surrendered to campus</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase">Pending Claims</span>
          <p className="mt-1 text-2xl font-extrabold text-amber-700 dark:text-amber-300">
            {stats?.pendingClaims || 0}
          </p>
          <span className="text-[10px] text-amber-600 mt-1 block">Requires verification</span>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-950 dark:bg-blue-950/20">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Pending Matches</span>
          <p className="mt-1 text-2xl font-extrabold text-blue-700 dark:text-blue-300">
            {stats?.pendingMatches || 0}
          </p>
          <span className="text-[10px] text-blue-500 mt-1 block">Auto-scored pairs</span>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 dark:border-purple-950 dark:bg-purple-950/20">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Verifications</span>
          <p className="mt-1 text-2xl font-extrabold text-purple-700 dark:text-purple-300">
            {stats?.totalVerifications || 0}
          </p>
          <span className="text-[10px] text-purple-500 mt-1 block">Decisions completed</span>
        </div>
      </div>

      {/* ADMIN WORKFLOW MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Claims & Verification */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-4">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Claims & Ownership Verification
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Review proof submitted by students for found items. Record official 1:1 decisions with admin remarks in the <code>verification</code> table.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">
              {stats?.pendingClaims} pending review
            </span>
            <Link
              href="/admin/claims"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500"
            >
              <span>Manage Claims</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 2: Potential Matches */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Rule-Based Match Review
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Inspect automated matches scored by brand, category, color, location, and date proximity. Confirm or reject match suggestions.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600">
              {stats?.pendingMatches} pending matches
            </span>
            <Link
              href="/admin/matches"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500"
            >
              <span>Inspect Matches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 3: Inventory Statuses */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Inventory & Item Statuses
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Transition statuses across the database: <code>Lost</code>, <code>Matched</code>, <code>Found</code>, <code>Returned</code>, <code>Closed</code>.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">
              {(stats?.totalLost || 0) + (stats?.totalFound || 0)} total items
            </span>
            <Link
              href="/admin/items"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500"
            >
              <span>Manage Items</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 4: Users Registry */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              User & Student Registry
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              View registered users, contact information, and audit activity (reports made, claims submitted).
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">
              {stats?.totalUsers} registered users
            </span>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500"
            >
              <span>View Users</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 5: Verification Audit Trail */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Verification Audit Log
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Historical ledger of all approved and rejected claims, timestamps, and recorded administrator remarks.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">
              {stats?.totalVerifications} decisions logged
            </span>
            <Link
              href="/admin/verification"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500"
            >
              <span>View Audit Log</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
