'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  PlusCircle,
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  ArrowRight,
  Compass,
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

/**
 * Animates a number from 0 → target using an ease-out curve.
 * Duration is 900ms. Respects prefers-reduced-motion.
 */
function useCountUp(target: number, active: boolean): number {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const animate = useCallback(() => {
    if (prefersReduced) { setDisplay(target); return; }
    if (!active || target === 0) { setDisplay(0); return; }

    const duration = 900;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, active, prefersReduced]);

  useEffect(() => {
    const cleanup = animate();
    return cleanup;
  }, [animate]);

  return display;
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

  // Animated counters — only run once loading is done
  const countTotal    = useCountUp(stats.totalItems,    !loading);
  const countLost     = useCountUp(stats.totalLost,     !loading);
  const countFound    = useCountUp(stats.totalFound,    !loading);
  const countResolved = useCountUp(stats.totalResolved, !loading);

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
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0D0D0D] px-4 pt-16 pb-8 sm:px-6 lg:px-8 border-b border-[#ECECEC] dark:border-white/[0.08] animate-fade-in-up anim-delay-0 transition-colors duration-200">
        {/* Top orange brand stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D3632D] dark:bg-[#E8613A]" />

        {/* Subtle orange ambient glow */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#D3632D]/10 dark:bg-[#E8613A]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#D3632D]/5 dark:bg-[#E8613A]/10 blur-3xl" />

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.15] text-balance sm:text-6xl">
            <span className="block text-[#231F20] dark:text-[#F0EFE9]">Lost Something on Campus?</span>
            <span className="block text-[#D3632D] dark:text-[#E8613A]">We Help You Recover It.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#555555] dark:text-[#8E8C87] leading-relaxed">
            Campus portal to report lost items, browse surrendered valuables, and match securely with automated verification.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report-lost"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D3632D] dark:bg-[#E8613A] px-8 py-3.5 text-sm font-bold text-white uppercase tracking-wider shadow-md shadow-[#D3632D]/25 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#BA4F1D] dark:hover:bg-[#D3522C] hover:shadow-lg hover:shadow-[#D3632D]/30 active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              Report Lost Item
            </Link>
            <Link
              href="/report-found"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#D3632D] dark:border-[#E8613A] bg-white dark:bg-[#141414] px-8 py-3.5 text-sm font-bold text-[#D3632D] dark:text-[#E8613A] uppercase tracking-wider shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#FFF4ED] dark:hover:bg-[#E8613A]/15 hover:border-[#BA4F1D] hover:shadow-md hover:shadow-[#D3632D]/15 active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              Report Found Item
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto mt-6 max-w-xl">
            <div className="search-focus-ring relative flex items-center rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] shadow-lg shadow-black/[0.04] dark:shadow-black/40 overflow-hidden transition duration-200 ease-out">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-[#808080] dark:text-[#8E8C87]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, category, location, color..."
                className="w-full bg-white dark:bg-[#141414] py-4 pl-12 pr-32 text-sm text-[#231F20] dark:text-[#F0EFE9] placeholder:text-[#808080] dark:placeholder:text-[#7A7874] focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 rounded-lg bg-[#D3632D] dark:bg-[#E8613A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition duration-200 ease-out hover:-translate-y-px hover:bg-[#BA4F1D] dark:hover:bg-[#D3522C] hover:shadow-md hover:shadow-[#D3632D]/30 active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Reports */}
          <div className="animate-fade-in-up anim-delay-80 rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-6 shadow-sm border-t-4 border-t-[#231F20] dark:border-t-[#F0EFE9] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
            <span className="text-[11px] font-extrabold text-[#808080] dark:text-[#8E8C87] uppercase tracking-wider">Total Reports</span>
            {loading
              ? <div className="skeleton mt-2 h-9 w-16 rounded-lg" />
              : <p className="mt-2 text-3xl font-extrabold text-[#231F20] dark:text-[#F0EFE9] tabular-nums">{countTotal}</p>
            }
            <span className="text-[11px] text-[#808080] dark:text-[#8E8C87] mt-1 block">Campus database records</span>
          </div>

          {/* Lost Items */}
          <div className="animate-fade-in-up anim-delay-160 rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-6 shadow-sm border-t-4 border-t-[#D3632D] dark:border-t-[#E8613A] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
            <span className="text-[11px] font-extrabold text-[#D3632D] dark:text-[#E8613A] uppercase tracking-wider">Lost Items</span>
            {loading
              ? <div className="skeleton mt-2 h-9 w-16 rounded-lg" />
              : <p className="mt-2 text-3xl font-extrabold text-[#D3632D] dark:text-[#E8613A] tabular-nums">{countLost}</p>
            }
            <span className="text-[11px] text-[#808080] dark:text-[#8E8C87] mt-1 block">Awaiting match verification</span>
          </div>

          {/* Found Items */}
          <div className="animate-fade-in-up anim-delay-240 rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-6 shadow-sm border-t-4 border-t-emerald-600 dark:border-t-[#4EC98A] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
            <span className="text-[11px] font-extrabold text-emerald-700 dark:text-[#4EC98A] uppercase tracking-wider">Found Items</span>
            {loading
              ? <div className="skeleton mt-2 h-9 w-16 rounded-lg" />
              : <p className="mt-2 text-3xl font-extrabold text-emerald-700 dark:text-[#4EC98A] tabular-nums">{countFound}</p>
            }
            <span className="text-[11px] text-[#808080] dark:text-[#8E8C87] mt-1 block">Safely stored on campus</span>
          </div>

          {/* Returned */}
          <div className="animate-fade-in-up anim-delay-320 rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-6 shadow-sm border-t-4 border-t-[#BA4F1D] dark:border-t-[#E8613A] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
            <span className="text-[11px] font-extrabold text-[#BA4F1D] dark:text-[#E8613A] uppercase tracking-wider">Returned</span>
            {loading
              ? <div className="skeleton mt-2 h-9 w-16 rounded-lg" />
              : <p className="mt-2 text-3xl font-extrabold text-[#BA4F1D] dark:text-[#E8613A] tabular-nums">{countResolved}</p>
            }
            <span className="text-[11px] text-[#808080] dark:text-[#8E8C87] mt-1 block">Successfully claimed &amp; restored</span>
          </div>
        </div>
      </section>

      {/* 3. DIRECTORY CARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Browse Lost */}
          <div className="group rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-7 shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#D3632D] dark:hover:border-[#E8613A] flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4ED] dark:bg-[#E8613A]/15 text-[#D3632D] dark:text-[#E8613A] mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#231F20] dark:text-[#F0EFE9]">Browse Lost Items Directory</h3>
              <p className="mt-2 text-sm text-[#555555] dark:text-[#8E8C87] leading-relaxed">
                Explore items reported lost by students, faculty, and campus staff. Filter by category, location, and date.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECECEC] dark:border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#808080] dark:text-[#8E8C87]">{stats.totalLost} active lost items</span>
              <Link href="/items/lost" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D3632D] dark:text-[#E8613A] hover:text-[#BA4F1D] dark:hover:text-[#D3522C] uppercase tracking-wider transition duration-200 ease-out">
                <span>View Directory</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Browse Found */}
          <div className="group rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-7 shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-emerald-600 dark:hover:border-[#4EC98A] flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#4EC98A]/15 text-emerald-700 dark:text-[#4EC98A] mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#231F20] dark:text-[#F0EFE9]">Browse Found Items Directory</h3>
              <p className="mt-2 text-sm text-[#555555] dark:text-[#8E8C87] leading-relaxed">
                Found something on campus? Check items securely surrendered at security desks and administrative offices.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECECEC] dark:border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#808080] dark:text-[#8E8C87]">{stats.totalFound} active found items</span>
              <Link href="/items/found" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-[#4EC98A] hover:text-emerald-800 uppercase tracking-wider transition duration-200 ease-out">
                <span>View Directory</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENT ITEMS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#231F20] dark:text-[#F0EFE9]">Recently Reported Items</h2>
            <p className="text-sm text-[#555555] dark:text-[#8E8C87] mt-1">Latest items registered across campus</p>
          </div>
          <Link href="/items" className="text-xs font-bold text-[#D3632D] dark:text-[#E8613A] hover:text-[#BA4F1D] uppercase tracking-wider flex items-center gap-1 transition duration-200 ease-out">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Loading: shimmer skeleton grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-4 shadow-sm">
                <div className="skeleton mb-3 h-36 w-full rounded-lg" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton mt-2 h-3 w-full rounded" />
                <div className="skeleton mt-1.5 h-3 w-5/6 rounded" />
                <div className="mt-4 pt-3 border-t border-[#ECECEC] dark:border-white/[0.08] space-y-2">
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recentLost.length === 0 && recentFound.length === 0 ? (
          /* ── Empty state ── */
          <div className="rounded-xl border-2 border-dashed border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-14 text-center">
            <Package className="mx-auto h-12 w-12 text-[#808080] dark:text-[#8E8C87]" />
            <h3 className="mt-4 text-base font-bold text-[#231F20] dark:text-[#F0EFE9]">Nothing reported yet.</h3>
            <p className="mt-1 text-sm text-[#555555] dark:text-[#8E8C87] max-w-sm mx-auto">
              Be the first to help someone find their belongings.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/report-lost"
                className="rounded-xl bg-[#D3632D] dark:bg-[#E8613A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#BA4F1D] dark:hover:bg-[#D3522C] hover:shadow-md hover:shadow-[#D3632D]/30 active:scale-[0.98]"
              >
                Report Lost Item
              </Link>
              <Link
                href="/report-found"
                className="rounded-xl border border-[#D3632D] dark:border-[#E8613A] bg-white dark:bg-[#141414] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D3632D] dark:text-[#E8613A] shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#FFF4ED] dark:hover:bg-[#E8613A]/15 hover:border-[#BA4F1D] hover:shadow-md hover:shadow-[#D3632D]/15 active:scale-[0.98]"
              >
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          /* ── Real item cards ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...recentLost, ...recentFound].slice(0, 8).map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={`/item/${item.type}-${item.id}`}
                className={`group flex flex-col justify-between rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-4 shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md ${
                  item.type === 'lost' ? 'hover:border-[#D3632D] dark:hover:border-[#E8613A]' : 'hover:border-emerald-600 dark:hover:border-[#4EC98A]'
                }`}
              >
                <div>
                  <div className="relative mb-3 flex h-36 w-full items-center justify-center rounded-lg bg-[#F8F9FA] dark:bg-[#1A1A1A] overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-[#808080] dark:text-[#8E8C87] transition duration-200 ease-out group-hover:text-[#D3632D] dark:group-hover:text-[#E8613A]" />
                    )}
                    <span
                      className={`absolute top-2.5 left-2.5 rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        item.type === 'lost'
                          ? 'bg-[#D3632D] dark:bg-[#E8613A] text-white'
                          : 'bg-emerald-600 dark:bg-[#2E7D5B] text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 rounded bg-[#231F20]/80 dark:bg-[#0D0D0D]/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#231F20] dark:text-[#F0EFE9] truncate">{item.name}</h3>
                  <p className="mt-1 text-xs text-[#555555] dark:text-[#8E8C87] line-clamp-2">
                    {item.description || 'No additional description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#ECECEC] dark:border-white/[0.08] space-y-1.5 text-[11px] text-[#808080] dark:text-[#8E8C87]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D3632D] dark:text-[#E8613A]" />
                    <span className="truncate text-[#555555] dark:text-[#8E8C87]">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-[#808080] dark:text-[#8E8C87]" />
                      <span>{item.date}</span>
                    </div>
                    <span className="font-bold text-[#231F20] dark:text-[#F0EFE9]">{item.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#141414] border border-[#ECECEC] dark:border-white/[0.08] p-8 sm:p-12 shadow-sm transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D3632D] dark:bg-[#E8613A]" />
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D3632D] dark:text-[#E8613A] block mb-1">
              Workflow &amp; Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#231F20] dark:text-[#F0EFE9]">How It Works</h2>
            <p className="mt-2 text-sm text-[#555555] dark:text-[#8E8C87]">
              A structured relational DBMS process ensuring transparency and swift item restoration across campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#D3632D] dark:bg-[#E8613A] text-white font-bold text-base shadow-sm shadow-[#D3632D]/30 transition duration-200 ease-out hover:scale-[1.08] cursor-default">
                1
              </div>
              <h4 className="font-bold text-[#231F20] dark:text-[#F0EFE9] text-base">Report Item Details</h4>
              <p className="text-sm text-[#555555] dark:text-[#8E8C87] leading-relaxed">
                Submit structured campus records with category, campus location, date, brand, color, and photos.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#231F20] dark:bg-[#1A1A1A] dark:border dark:border-white/[0.12] text-white font-bold text-base shadow-sm transition duration-200 ease-out hover:scale-[1.08] cursor-default">
                2
              </div>
              <h4 className="font-bold text-[#231F20] dark:text-[#F0EFE9] text-base">Automated Match Scoring</h4>
              <p className="text-sm text-[#555555] dark:text-[#8E8C87] leading-relaxed">
                The algorithm computes multi-attribute match scores (Category, Brand, Color, Location, and Date Proximity) and alerts matching users.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#D3632D] dark:bg-[#E8613A] text-white font-bold text-base shadow-sm shadow-[#D3632D]/30 transition duration-200 ease-out hover:scale-[1.08] cursor-default">
                3
              </div>
              <h4 className="font-bold text-[#231F20] dark:text-[#F0EFE9] text-base">Claim &amp; Admin Verification</h4>
              <p className="text-sm text-[#555555] dark:text-[#8E8C87] leading-relaxed">
                Claimants provide unique proof of ownership. Campus authorities verify credentials before releasing the item.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
