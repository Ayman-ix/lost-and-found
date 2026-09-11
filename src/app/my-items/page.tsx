'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Package, PlusCircle, ArrowRight, MapPin, Calendar, CheckCircle } from 'lucide-react';

interface UserItem {
  id: number;
  type: 'lost' | 'found';
  name: string;
  brand: string | null;
  color: string | null;
  date: string;
  status: string;
  category: string;
  location: string;
  imageUrl: string | null;
}

export default function MyItemsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [lostItems, setLostItems] = useState<UserItem[]>([]);
  const [foundItems, setFoundItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch('/api/user/items');
        if (res.ok) {
          const data = await res.json();
          setLostItems(data.lostItems || []);
          setFoundItems(data.foundItems || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadItems();
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Loading your items...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Package className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">Sign In Required</h2>
        <p className="mt-1 text-xs text-zinc-500">Please sign in to view your reported items.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#BA4F1D] shadow-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const currentList = activeTab === 'lost' ? lostItems : foundItems;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            My Reported Items
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Track and monitor the status of items you have reported as lost or found.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/report-lost"
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Report Lost
          </Link>
          <Link
            href="/report-found"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'lost'
              ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Lost Reports ({lostItems.length})
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'found'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Found Reports ({foundItems.length})
        </button>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No {activeTab} items reported yet
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Have you {activeTab === 'lost' ? 'misplaced' : 'discovered'} something on campus?
          </p>
          <div className="mt-4">
            <Link
              href={activeTab === 'lost' ? '/report-lost' : '/report-found'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D3632D] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#BA4F1D] shadow-sm transition"
            >
              Report {activeTab === 'lost' ? 'Lost Item' : 'Found Item'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#D3632D]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-[#FFF4ED] border border-[#FFD8C2] px-2 py-0.5 text-[10px] font-bold text-[#D3632D]">
                    {item.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      item.status === 'Matched'
                        ? 'bg-[#FFF4ED] text-[#D3632D] border border-[#FFD8C2]'
                        : item.status === 'Found' || item.status === 'Returned'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#231F20]">{item.name}</h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  {item.brand ? `Brand: ${item.brand} • ` : ''}
                  {item.color ? `Color: ${item.color}` : ''}
                </p>

                <div className="mt-3 space-y-1 text-xs text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#ECECEC]">
                <Link
                  href={`/item/${item.type}-${item.id}`}
                  className="flex items-center justify-between text-xs font-bold text-[#D3632D] hover:text-[#BA4F1D]"
                >
                  <span>View Details & Matches</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
