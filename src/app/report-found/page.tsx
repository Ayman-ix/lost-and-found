'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Calendar,
  MapPin,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface Category {
  category_id: number;
  category_name: string;
}

interface LocationItem {
  location_id: number;
  location_name: string;
  city: string;
}

export default function ReportFoundPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [dateFound, setDateFound] = useState(() => new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    matchesFound: number;
    itemId: number;
  } | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [catRes, locRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/locations'),
        ]);
        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.categories || []);
          if (catJson.categories?.length > 0) {
            setCategoryId(String(catJson.categories[0].category_id));
          }
        }
        if (locRes.ok) {
          const locJson = await locRes.json();
          setLocations(locJson.locations || []);
          if (locJson.locations?.length > 0) {
            setLocationId(String(locJson.locations[0].location_id));
          }
        }
      } catch (e) {
        console.error('Failed to load categories/locations', e);
      } finally {
        setLoadingData(false);
      }
    }

    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!itemName.trim() || !categoryId || !locationId || !dateFound) {
      setError('Please provide the item name, category, location, and date found.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/items/found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          categoryId: Number(categoryId),
          locationId: Number(locationId),
          description: description.trim() || undefined,
          brand: brand.trim() || undefined,
          color: color.trim() || undefined,
          dateFound,
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit found report.');
        setSubmitting(false);
        return;
      }

      setSuccessInfo({
        message: data.message,
        matchesFound: data.matchesFound || 0,
        itemId: data.item?.found_item_id,
      });
    } catch {
      setError('An unexpected network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-4">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Sign In Required to Report
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          To maintain accountability in the database, you must be logged in as a registered user or student to submit a found item report.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Sign In Now
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-zinc-300 px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Overview
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Report a Found Item
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Submit details to help the rightful owner locate and claim their property.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Found Report
        </span>
      </div>

      {/* Success Banner */}
      {successInfo ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-emerald-900 dark:text-emerald-100">
            Found Item Published Successfully!
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
            {successInfo.message}
          </p>

          {successInfo.matchesFound > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-900">
              <Sparkles className="h-4 w-4" />
              <span>Matched with {successInfo.matchesFound} lost item(s) in the database! Owners alerted.</span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/items/found"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              View in Found Directory
            </Link>
            <Link
              href="/my-items"
              className="rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-900 dark:text-emerald-300"
            >
              Go to My Items
            </Link>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Item Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Set of Dorm Keys with Red Lanyard"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* Category & Location (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3 text-sm text-zinc-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Location Found <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3 text-sm text-zinc-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                >
                  {locations.map((l) => (
                    <option key={l.location_id} value={l.location_id}>
                      {l.location_name} ({l.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand & Color (Grid - Used for Matching Engine!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Brand / Manufacturer <span className="text-zinc-400 font-normal">(if visible)</span>
                </label>
                <div className="relative">
                  <Tag className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Sony, Anker, Stanley"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Primary Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Silver, Black, Green"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* Date Found */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Date Found <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={dateFound}
                  onChange={(e) => setDateFound(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Description / Current Custody Info
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Where was it found, where is it currently being held (e.g. Library front desk, security station)..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Image Link / Photo Reference <span className="text-zinc-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (photo link)"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || loadingData}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition active:scale-[0.99]"
              >
                {submitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Submit Found Item Report</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
