'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  MapPin,
  Calendar,
  PlusCircle,
  ArrowLeft,
} from 'lucide-react';

interface LostItemRecord {
  lost_item_id: number;
  item_name: string;
  description: string | null;
  brand: string | null;
  color: string | null;
  date_lost: string;
  status: string;
  category: { category_name: string };
  location: { location_name: string };
  images: { image_url: string }[];
}

interface Category {
  category_id: number;
  category_name: string;
}

interface LocationItem {
  location_id: number;
  location_name: string;
}

function LostItemsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [items, setItems] = useState<LostItemRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLookups() {
      const [catRes, locRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/locations'),
      ]);
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || []);
      }
      if (locRes.ok) {
        const l = await locRes.json();
        setLocations(l.locations || []);
      }
    }
    loadLookups();
  }, []);

  const loadLostItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedLocation) params.set('location', selectedLocation);

      const res = await fetch(`/api/items/lost?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedLocation]);

  useEffect(() => {
    loadLostItems();
  }, [loadLostItems]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#231F20]">
            Lost Items Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Browse all missing possessions reported by campus students and community members.
          </p>
        </div>

        <Link
          href="/report-lost"
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Report Lost Item
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lost items by keyword, brand, color..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs sm:text-sm text-[#231F20]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-[#231F20]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-[#231F20]"
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>
                  {l.location_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(search || selectedCategory || selectedLocation) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedLocation('');
                }}
                className="w-full py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading lost items...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-[#231F20]">
            No lost items match your filters
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">Check back later or report your missing item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <Link
              key={item.lost_item_id}
              href={`/item/lost-${item.lost_item_id}`}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="relative mb-3 flex h-40 w-full items-center justify-center rounded-xl bg-zinc-100 overflow-hidden">
                  {item.images?.[0]?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0].image_url}
                      alt={item.item_name}
                      className="h-full w-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <Package className="h-10 w-10 text-zinc-400 group-hover:text-red-500 transition" />
                  )}
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    LOST
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
                    {item.category?.category_name}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#231F20] truncate">
                  {item.item_name}
                </h3>
                <p className="mt-1 text-xs text-[#64748B] line-clamp-2">
                  {item.description || 'No additional details.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-[11px] text-zinc-500">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{item.location?.location_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{item.date_lost}</span>
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
    </div>
  );
}

export default function LostItemsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-zinc-500">Loading lost directory...</div>}>
      <LostItemsContent />
    </Suspense>
  );
}
