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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#ECECEC] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#FFF4ED] border border-[#FFD8C2] px-3 py-1 text-xs font-bold text-[#D3632D] mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Campus Portal • Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#231F20]">
            Lost &amp; Found Management Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Welcome back, {user.name}. Oversee claim verifications, rule-based matching, and inventory statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/claims"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#D3632D] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#BA4F1D] transition"
          >
            <FileCheck className="h-4 w-4" />
            Review Pending Claims ({stats?.pendingClaims || 0})
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-4">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Users</span>
          <p className="mt-1 text-2xl font-extrabold text-[#231F20]">
            {stats?.totalUsers || 0}
          </p>
          <span className="text-[10px] text-[#64748B] mt-1 block">Registered students</span>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
          <span className="text-[11px] font-semibold text-red-600 uppercase">Lost Items</span>
          <p className="mt-1 text-2xl font-extrabold text-red-700">
            {stats?.totalLost || 0}
          </p>
          <span className="text-[10px] text-red-500 mt-1 block">Reported missing</span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Found Items</span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-700">
            {stats?.totalFound || 0}
          </p>
          <span className="text-[10px] text-emerald-500 mt-1 block">Surrendered to campus</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <span className="text-[11px] font-semibold text-amber-800 uppercase">Pending Claims</span>
          <p className="mt-1 text-2xl font-extrabold text-amber-700">
            {stats?.pendingClaims || 0}
          </p>
          <span className="text-[10px] text-amber-600 mt-1 block">Requires verification</span>
        </div>

        <div className="rounded-2xl border border-[#FFD8C2] bg-[#FFF4ED] p-4">
          <span className="text-[11px] font-semibold text-[#D3632D] uppercase">Pending Matches</span>
          <p className="mt-1 text-2xl font-extrabold text-[#D3632D]">
            {stats?.pendingMatches || 0}
          </p>
          <span className="text-[10px] text-[#D3632D] mt-1 block">Auto-scored pairs</span>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
          <span className="text-[11px] font-semibold text-purple-600 uppercase">Verifications</span>
          <p className="mt-1 text-2xl font-extrabold text-purple-700">
            {stats?.totalVerifications || 0}
          </p>
          <span className="text-[10px] text-purple-500 mt-1 block">Decisions completed</span>
        </div>
      </div>

      {/* ADMIN WORKFLOW MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Claims & Verification */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 mb-4">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[#231F20]">
              Claims &amp; Ownership Verification
            </h3>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              Review proof submitted by students for found items. Record official 1:1 decisions with admin remarks in the <code>verification</code> table.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">
              {stats?.pendingClaims} pending review
            </span>
            <Link
              href="/admin/claims"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D]"
            >
              <span>Manage Claims</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 2: Potential Matches */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4ED] text-[#D3632D] border border-[#FFD8C2] mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[#231F20]">
              Rule-Based Match Review
            </h3>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              Inspect automated matches scored by brand, category, color, location, and date proximity. Confirm or reject match suggestions.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#D3632D]">
              {stats?.pendingMatches} pending matches
            </span>
            <Link
              href="/admin/matches"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D]"
            >
              <span>Inspect Matches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 3: Inventory Statuses */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F9FA] text-[#231F20] border border-[#ECECEC] mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[#231F20]">
              Inventory &amp; Item Statuses
            </h3>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              Transition statuses across the database: <code>Lost</code>, <code>Matched</code>, <code>Found</code>, <code>Returned</code>, <code>Closed</code>.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              {(stats?.totalLost || 0) + (stats?.totalFound || 0)} total items
            </span>
            <Link
              href="/admin/items"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D]"
            >
              <span>Manage Items</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 4: Users Registry */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[#231F20]">
              User &amp; Student Registry
            </h3>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              View registered users, contact information, and audit activity (reports made, claims submitted).
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              {stats?.totalUsers} registered users
            </span>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D]"
            >
              <span>View Users</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 5: Verification Audit Trail */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-[#231F20]">
              Verification Audit Log
            </h3>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              Historical ledger of all approved and rejected claims, timestamps, and recorded administrator remarks.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              {stats?.totalVerifications} decisions logged
            </span>
            <Link
              href="/admin/verification"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D]"
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
