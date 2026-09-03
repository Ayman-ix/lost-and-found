'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  PlusCircle,
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface RecentItem {
  id: number;
  type: 'lost' | 'found';
  name: string;
  description: string;
  brand: string | null;
  color: string | null;
  date: string;
  status: string;
  category: string;
  location: string;
  imageUrl: string | null;
}

interface StatsData {
  totalLost: number;
  totalFound: number;
  totalResolved: number;
  totalItems: number;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLost, setRecentLost] = useState<RecentItem[]>([]);
  const [recentFound, setRecentFound] = useState<RecentItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalLost: 0,
    totalFound: 0,
    totalResolved: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch('/api/items/stats'),
          fetch('/api/items/recent'),
        ]);

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson);
        }

        if (recentRes.ok) {
          const recentJson = await recentRes.json();
          setRecentLost(recentJson.recentLost || []);
          setRecentFound(recentJson.recentFound || []);
        }
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/items');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-white via-zinc-50/50 to-white px-4 pt-16 pb-20 sm:px-6 lg:px-8 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900/30 dark:to-zinc-950">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Campus DBMS Recovery Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
            Lost Something on Campus? <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              We Help You Recover It.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Report lost items, list found possessions, match reports with rule-based scoring, and submit verified ownership claims seamlessly.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/report-lost"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Report Lost Item
            </Link>
            <Link
              href="/report-found"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Report Found Item
            </Link>
          </div>

          {/* Search Bar Component */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="relative flex items-center shadow-lg shadow-zinc-200/50 dark:shadow-none">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, item name, brand, or location..."
                className="w-full rounded-2xl border border-zinc-300 bg-white py-4 pl-12 pr-28 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-2.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. REAL DATABASE METRICS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Reports
            </span>
            <p className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
              {loading ? '—' : stats.totalItems}
            </p>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Normalized records in database
            </span>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 shadow-sm dark:border-red-950/60 dark:bg-red-950/20">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
              Lost Items
            </span>
            <p className="mt-2 text-3xl font-extrabold text-red-700 dark:text-red-300">
              {loading ? '—' : stats.totalLost}
            </p>
            <span className="text-[11px] text-red-500/80 mt-1 block">
              Awaiting matching found reports
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm dark:border-emerald-950/60 dark:bg-emerald-950/20">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Found Items
            </span>
            <p className="mt-2 text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {loading ? '—' : stats.totalFound}
            </p>
            <span className="text-[11px] text-emerald-500/80 mt-1 block">
              Ready for ownership claims
            </span>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm dark:border-blue-950/60 dark:bg-blue-950/20">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Items Returned
            </span>
            <p className="mt-2 text-3xl font-extrabold text-blue-700 dark:text-blue-300">
              {loading ? '—' : stats.totalResolved}
            </p>
            <span className="text-[11px] text-blue-500/80 mt-1 block">
              Verified & safely restored
            </span>
          </div>
        </div>
      </section>

      {/* 3. BROWSE DIRECTORY QUICK ACCESS CARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lost Directory Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 mb-4">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Browse Lost Items Directory
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Explore items currently reported lost by students, faculty, or campus visitors. Filter by category, location, and date.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                {stats.totalLost} active lost items
              </span>
              <Link
                href="/items/lost"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <span>View Lost Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Found Directory Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Browse Found Items Directory
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Found something or looking for your missing possession? Check items safely surrendered and awaiting their rightful owners.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                {stats.totalFound} active found items
              </span>
              <Link
                href="/items/found"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <span>View Found Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-8 sm:p-12 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              How the Network Operates
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Structured relational DBMS workflow designed for high accountability and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
                1
              </div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-base">
                Report Item with Details
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Users submit structured records detailing category, location, date, brand, color, and optional photos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
                2
              </div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-base">
                Rule-Based Match Scoring
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The database compares attributes (Category: 25pts, Brand: 25pts, Location: 20pts, etc.) and auto-notifies users of potential matches.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
                3
              </div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-base">
                Ownership Claim & Verification
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Claimants provide proof details. Administrators review and approve/reject claims before items are officially returned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECENTLY REPORTED ITEMS (REAL DB DATA) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Recently Reported Items
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Latest items added to the database records
            </p>
          </div>
          <Link
            href="/items"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentLost.length === 0 && recentFound.length === 0 ? (
          /* Honest realistic empty state */
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
            <Package className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
              No items reported yet
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              The database is currently initialized and clean. Be the first to report a lost or found item!
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/report-lost"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Report Lost Item
              </Link>
              <Link
                href="/report-found"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...recentLost, ...recentFound].slice(0, 8).map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={`/item/${item.type}-${item.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  {/* Image or Category Fallback */}
                  <div className="relative mb-3 flex h-36 w-full items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-zinc-400 group-hover:text-blue-500 transition" />
                    )}
                    <span
                      className={`absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.type === 'lost'
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {item.description || 'No additional description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{item.date}</span>
                    </div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {item.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
