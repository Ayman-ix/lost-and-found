'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Package,
  MapPin,
  Calendar,
  ArrowRight,
  PlusCircle,
  Tag,
  CheckCircle,
} from 'lucide-react';

interface DirectoryItem {
  id: number;
  type: 'lost' | 'found';
  name: string;
  description: string | null;
  brand: string | null;
  color: string | null;
  date: string;
  status: string;
  category: string;
  location: string;
  imageUrl: string | null;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface LocationItem {
  location_id: number;
  location_name: string;
}

function ItemsDirectoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';

  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>(
    initialType === 'lost' || initialType === 'found' ? initialType : 'all'
  );
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories & locations once
  useEffect(() => {
    async function loadLookups() {
      try {
        const [catRes, locRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/locations'),
        ]);
        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.categories || []);
        }
        if (locRes.ok) {
          const locJson = await locRes.json();
          setLocations(locJson.locations || []);
        }
      } catch (e) {
        console.error('Error loading filters', e);
      }
    }
    loadLookups();
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedLocation) params.set('location', selectedLocation);

      const qs = params.toString() ? `?${params.toString()}` : '';

      const promises = [];
      if (typeFilter === 'all' || typeFilter === 'lost') {
        promises.push(
          fetch(`/api/items/lost${qs}`)
            .then((r) => r.json())
            .then((d) =>
              (d.items || []).map((i: any) => ({
                id: i.lost_item_id,
                type: 'lost' as const,
                name: i.item_name,
                description: i.description,
                brand: i.brand,
                color: i.color,
                date: i.date_lost,
                status: i.status,
                category: i.category?.category_name || 'General',
                location: i.location?.location_name || 'Campus',
                imageUrl: i.images?.[0]?.image_url || null,
              }))
            )
        );
      }

      if (typeFilter === 'all' || typeFilter === 'found') {
        promises.push(
          fetch(`/api/items/found${qs}`)
            .then((r) => r.json())
            .then((d) =>
              (d.items || []).map((i: any) => ({
                id: i.found_item_id,
                type: 'found' as const,
                name: i.item_name,
                description: i.description,
                brand: i.brand,
                color: i.color,
                date: i.date_found,
                status: i.status,
                category: i.category?.category_name || 'General',
                location: i.location?.location_name || 'Campus',
                imageUrl: i.images?.[0]?.image_url || null,
              }))
            )
        );
      }

      const results = await Promise.all(promises);
      const combined = results.flat();
      // Sort newest first
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(combined);
    } catch (e) {
      console.error('Error fetching items', e);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, selectedCategory, selectedLocation]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Lost & Found Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Search, filter, and discover reported items across all campus locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/report-lost"
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Report Lost
          </Link>
          <Link
            href="/report-found"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, item name, brand, or color..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-800">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === 'all'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setTypeFilter('lost')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === 'lost'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setTypeFilter('found')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        {/* Dropdown Filters (Category & Location) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
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
            {(search || selectedCategory || selectedLocation || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedLocation('');
                  setTypeFilter('all');
                }}
                className="w-full py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse space-y-3"
            >
              <div className="h-32 bg-zinc-100 rounded-xl dark:bg-zinc-800" />
              <div className="h-4 bg-zinc-100 rounded w-3/4 dark:bg-zinc-800" />
              <div className="h-3 bg-zinc-100 rounded w-1/2 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No matching items found
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query, location, or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={`/item/${item.type}-${item.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="relative mb-3 flex h-40 w-full items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
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
                  {item.description || 'No additional details provided.'}
                </p>

                {(item.brand || item.color) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.brand && (
                      <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                        {item.brand}
                      </span>
                    )}
                    {item.color && (
                      <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                        {item.color}
                      </span>
                    )}
                  </div>
                )}
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
                  <span
                    className={`font-semibold ${
                      item.status === 'Found' || item.status === 'Returned'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.status === 'Matched'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
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

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-zinc-500">Loading directory...</div>}>
      <ItemsDirectoryContent />
    </Suspense>
  );
}
