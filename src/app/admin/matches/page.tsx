'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ArrowLeft, Check, X, ExternalLink } from 'lucide-react';

interface MatchItem {
  match_id: number;
  match_score: number;
  match_status: 'Pending' | 'Possible' | 'Confirmed' | 'Rejected';
  created_at: string;
  lost_item: {
    lost_item_id: number;
    item_name: string;
    brand: string;
    color: string;
    date_lost: string;
    status: string;
    user: { name: string; email: string };
  };
  found_item: {
    found_item_id: number;
    item_name: string;
    brand: string;
    color: string;
    date_found: string;
    status: string;
    user: { name: string; email: string };
  };
}

export default function AdminMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/matches');
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadMatches();
    }
  }, [user, loadMatches]);

  const handleUpdateStatus = async (matchId: number, status: string) => {
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, status }),
      });
      if (res.ok) {
        loadMatches();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-20 text-center text-xs text-zinc-500">Admin access required.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Rule-Based Potential Matches
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Resolved through the <code>potential_match</code> table (M:N relationship resolver) with calculated similarity points.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Sparkles className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No potential matches generated yet
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            As students report lost and found items with overlapping attributes, matches will populate automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <div
              key={m.match_id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">
                    Match #{m.match_id}
                  </span>
                  <span className="rounded-full bg-[#FFF4ED] dark:bg-[#D3632D]/20 px-2.5 py-0.5 text-xs font-extrabold text-[#D3632D]">
                    {m.match_score} / 100 Score
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      m.match_status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : m.match_status === 'Rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {m.match_status}
                  </span>

                  <button
                    onClick={() => handleUpdateStatus(m.match_id, 'Confirmed')}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    title="Confirm match"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(m.match_id, 'Rejected')}
                    className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    title="Reject match"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Lost Item */}
                <div className="rounded-xl border border-red-100 bg-red-50/40 p-4 dark:border-red-950 dark:bg-red-950/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-600">Lost Item</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {m.lost_item?.item_name}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    Brand: <strong>{m.lost_item?.brand || 'N/A'}</strong> • Color: <strong>{m.lost_item?.color || 'N/A'}</strong>
                  </p>
                  <p className="text-zinc-500">Reported by: {m.lost_item?.user?.name}</p>
                  <Link
                    href={`/item/lost-${m.lost_item?.lost_item_id}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#D3632D] hover:text-[#BA4F1D] pt-1"
                  >
                    <span>View item</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Found Item */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-950 dark:bg-emerald-950/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Found Item</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {m.found_item?.item_name}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    Brand: <strong>{m.found_item?.brand || 'N/A'}</strong> • Color: <strong>{m.found_item?.color || 'N/A'}</strong>
                  </p>
                  <p className="text-zinc-500">Reported by: {m.found_item?.user?.name}</p>
                  <Link
                    href={`/item/found-${m.found_item?.found_item_id}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#D3632D] hover:text-[#BA4F1D] pt-1"
                  >
                    <span>View item</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
