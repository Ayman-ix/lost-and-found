'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Package, ArrowLeft, ExternalLink } from 'lucide-react';

interface AdminItem {
  id: number;
  type: 'lost' | 'found';
  name: string;
  brand: string | null;
  color: string | null;
  date: string;
  status: string;
  category: string;
  location: string;
  user: { name: string; email: string };
}

export default function AdminItemsPage() {
  const { user } = useAuth();
  const [lostItems, setLostItems] = useState<AdminItem[]>([]);
  const [foundItems, setFoundItems] = useState<AdminItem[]>([]);
  const [tab, setTab] = useState<'lost' | 'found'>('lost');
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/items');
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
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadItems();
    }
  }, [user, loadItems]);

  const handleStatusChange = async (id: number, type: 'lost' | 'found', newStatus: string) => {
    try {
      const res = await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status: newStatus }),
      });
      if (res.ok) {
        loadItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-20 text-center text-xs text-zinc-500">Admin access required.</div>;
  }

  const currentItems = tab === 'lost' ? lostItems : foundItems;
  const lostStatuses = ['Lost', 'Matched', 'Found', 'Returned', 'Closed'];
  const foundStatuses = ['Found', 'Claimed', 'Verified', 'Returned', 'Closed'];

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
          Manage Inventory Statuses
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Enforce database status transitions across reported lost and found entities.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setTab('lost')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            tab === 'lost'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Lost Items ({lostItems.length})
        </button>
        <button
          onClick={() => setTab('found')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            tab === 'found'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Found Items ({foundItems.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading items...</div>
      ) : currentItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No {tab} items recorded
          </h3>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60 text-zinc-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Change Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {currentItems.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">{item.category}</td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">{item.location}</td>
                    <td className="py-3 px-4 text-zinc-500">{item.user?.name}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 font-bold text-zinc-800 dark:text-zinc-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, item.type, e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white py-1 px-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      >
                        {(tab === 'lost' ? lostStatuses : foundStatuses).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/item/${item.type}-${item.id}`}
                        className="text-[#D3632D] hover:text-[#BA4F1D] inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
