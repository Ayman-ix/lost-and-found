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
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white px-4 pt-16 pb-24 sm:px-6 lg:px-8 border-b border-[#ECECEC]">
        {/* Top orange brand stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D3632D]" />

        {/* Subtle orange ambient glow */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#D3632D]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#D3632D]/5 blur-3xl" />

        <div className="mx-auto max-w-3xl text-center relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#231F20] sm:text-5xl lg:text-6xl leading-[1.15]">
            Lost Something on Campus?{' '}
            <span className="text-[#D3632D]">We Help You Recover It.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#555555] leading-relaxed">
            Campus portal to report lost items, browse surrendered valuables, and match securely with automated verification.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report-lost"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D3632D] px-8 py-3.5 text-sm font-bold text-white uppercase tracking-wider shadow-md shadow-[#D3632D]/25 transition hover:bg-[#BA4F1D] active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Report Lost Item
            </Link>
            <Link
              href="/report-found"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#D3632D] bg-white px-8 py-3.5 text-sm font-bold text-[#D3632D] uppercase tracking-wider shadow-sm transition hover:bg-[#FFF4ED] active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Report Found Item
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto mt-10 max-w-xl">
            <div className="relative flex items-center rounded-xl border border-[#ECECEC] bg-white shadow-lg shadow-black/[0.04] overflow-hidden focus-within:border-[#D3632D] transition">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-[#808080]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, department, location..."
                className="w-full bg-white py-4 pl-12 pr-32 text-sm text-[#231F20] placeholder:text-[#808080] focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 rounded-lg bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#BA4F1D] active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="rounded-xl border border-[#ECECEC] bg-white p-6 shadow-sm border-t-4 border-t-[#231F20]">
            <span className="text-[11px] font-extrabold text-[#808080] uppercase tracking-wider">Total Reports</span>
            <p className="mt-2 text-3xl font-extrabold text-[#231F20]">
              {loading ? '—' : stats.totalItems}
            </p>
            <span className="text-[11px] text-[#808080] mt-1 block">Campus database records</span>
          </div>

          <div className="rounded-xl border border-[#ECECEC] bg-white p-6 shadow-sm border-t-4 border-t-[#D3632D]">
            <span className="text-[11px] font-extrabold text-[#D3632D] uppercase tracking-wider">Lost Items</span>
            <p className="mt-2 text-3xl font-extrabold text-[#D3632D]">
              {loading ? '—' : stats.totalLost}
            </p>
            <span className="text-[11px] text-[#808080] mt-1 block">Awaiting match verification</span>
          </div>

          <div className="rounded-xl border border-[#ECECEC] bg-white p-6 shadow-sm border-t-4 border-t-emerald-600">
            <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Found Items</span>
            <p className="mt-2 text-3xl font-extrabold text-emerald-700">
              {loading ? '—' : stats.totalFound}
            </p>
            <span className="text-[11px] text-[#808080] mt-1 block">Safely stored on campus</span>
          </div>

          <div className="rounded-xl border border-[#ECECEC] bg-white p-6 shadow-sm border-t-4 border-t-[#BA4F1D]">
            <span className="text-[11px] font-extrabold text-[#BA4F1D] uppercase tracking-wider">Returned</span>
            <p className="mt-2 text-3xl font-extrabold text-[#BA4F1D]">
              {loading ? '—' : stats.totalResolved}
            </p>
            <span className="text-[11px] text-[#808080] mt-1 block">Successfully claimed &amp; restored</span>
          </div>
        </div>
      </section>

      {/* 3. DIRECTORY CARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group rounded-xl border border-[#ECECEC] bg-white p-7 shadow-sm transition hover:shadow-md hover:border-[#D3632D] flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4ED] text-[#D3632D] mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#231F20]">Browse Lost Items Directory</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">
                Explore items reported lost by students, faculty, and campus staff. Filter by category, department, and date.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#808080]">{stats.totalLost} active lost items</span>
              <Link href="/items/lost" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D] uppercase tracking-wider transition">
                <span>View Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="group rounded-xl border border-[#ECECEC] bg-white p-7 shadow-sm transition hover:shadow-md hover:border-emerald-600 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#231F20]">Browse Found Items Directory</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">
                Found something on campus? Check items securely surrendered at security desks and administrative offices.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#808080]">{stats.totalFound} active found items</span>
              <Link href="/items/found" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider transition">
                <span>View Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#ECECEC] p-8 sm:p-12 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D3632D]" />
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D3632D] block mb-1">
              Workflow &amp; Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#231F20]">How It Works</h2>
            <p className="mt-2 text-sm text-[#555555]">
              A structured relational DBMS process ensuring transparency and swift item restoration across campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D3632D] text-white font-bold text-base shadow-sm shadow-[#D3632D]/30">
                1
              </div>
              <h4 className="font-bold text-[#231F20] text-base">Report Item Details</h4>
              <p className="text-sm text-[#555555] leading-relaxed">
                Submit structured campus records with category, campus location/hostel, date, brand, color, and photos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#231F20] text-white font-bold text-base shadow-sm">
                2
              </div>
              <h4 className="font-bold text-[#231F20] text-base">Automated Match Scoring</h4>
              <p className="text-sm text-[#555555] leading-relaxed">
                The database computes multi-attribute match scores (Category, Brand, Campus Location) and notifies relevant users.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D3632D] text-white font-bold text-base shadow-sm shadow-[#D3632D]/30">
                3
              </div>
              <h4 className="font-bold text-[#231F20] text-base">Claim &amp; Admin Verification</h4>
              <p className="text-sm text-[#555555] leading-relaxed">
                Claimants provide unique proof of ownership. Campus authorities verify credentials before releasing the item.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECENT ITEMS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#231F20]">Recently Reported Items</h2>
            <p className="text-sm text-[#555555] mt-1">Latest items registered across campus</p>
          </div>
          <Link href="/items" className="text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D] uppercase tracking-wider flex items-center gap-1 transition">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentLost.length === 0 && recentFound.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#ECECEC] bg-white p-14 text-center">
            <Package className="mx-auto h-12 w-12 text-[#808080]" />
            <h3 className="mt-4 text-base font-bold text-[#231F20]">No items reported yet</h3>
            <p className="mt-1 text-sm text-[#555555] max-w-sm mx-auto">
              The database is clean and active. Report the first lost or found item today.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/report-lost"
                className="rounded-xl bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#BA4F1D] transition shadow-sm"
              >
                Report Lost Item
              </Link>
              <Link
                href="/report-found"
                className="rounded-xl border border-[#D3632D] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D3632D] hover:bg-[#FFF4ED] transition"
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
                className="group flex flex-col justify-between rounded-xl border border-[#ECECEC] bg-white p-4 shadow-sm transition hover:shadow-md hover:border-[#D3632D]"
              >
                <div>
                  <div className="relative mb-3 flex h-36 w-full items-center justify-center rounded-lg bg-[#F8F9FA] overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-[#808080] group-hover:text-[#D3632D] transition" />
                    )}
                    <span
                      className={`absolute top-2.5 left-2.5 rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        item.type === 'lost'
                          ? 'bg-[#D3632D] text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 rounded bg-[#231F20]/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#231F20] truncate">{item.name}</h3>
                  <p className="mt-1 text-xs text-[#555555] line-clamp-2">
                    {item.description || 'No additional description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#ECECEC] space-y-1.5 text-[11px] text-[#808080]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D3632D]" />
                    <span className="truncate text-[#555555]">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-[#808080]" />
                      <span>{item.date}</span>
                    </div>
                    <span className="font-bold text-[#231F20]">{item.status}</span>
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
