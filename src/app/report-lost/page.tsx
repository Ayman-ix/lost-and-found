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
  FileText,
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

export default function ReportLostPage() {
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
  const [dateLost, setDateLost] = useState(() => new Date().toISOString().split('T')[0]);
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

    if (!itemName.trim() || !categoryId || !locationId || !dateLost) {
      setError('Please provide the item name, category, location, and date lost.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/items/lost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          categoryId: Number(categoryId),
          locationId: Number(locationId),
          description: description.trim() || undefined,
          brand: brand.trim() || undefined,
          color: color.trim() || undefined,
          dateLost,
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit report.');
        setSubmitting(false);
        return;
      }

      setSuccessInfo({
        message: data.message,
        matchesFound: data.matchesFound || 0,
        itemId: data.item?.lost_item_id,
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
          To maintain accountability in the database, you must be logged in as a registered student or user to log a lost item.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#BA4F1D] transition shadow-sm"
          >
            Sign In Now
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-[#ECECEC] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#231F20] hover:bg-gray-50 transition"
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#D3632D] hover:text-[#BA4F1D] mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Overview
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#231F20]">
            Report a Lost Item
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            Submit item details into the database to initiate automatic match detection.
          </p>
        </div>
        <span className="rounded-full bg-red-50 border border-red-200 px-3.5 py-1 text-xs font-bold text-red-700 uppercase tracking-wider">
          Lost Report
        </span>
      </div>

      {/* Success Modal / Banner */}
      {successInfo ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-emerald-900">
            Lost Item Logged Successfully!
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
            {successInfo.message}
          </p>

          {successInfo.matchesFound > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FFF4ED] px-4 py-2 text-xs font-bold text-[#D3632D] shadow-sm border border-[#FFD8C2]">
              <Sparkles className="h-4 w-4" />
              <span>{successInfo.matchesFound} Potential Match records generated in database!</span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/items/lost"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              View in Lost Directory
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
        <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Item Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Dell XPS 15 Laptop or Blue HydroFlask"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Category & Location (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 px-3 text-sm text-[#231F20] focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                >
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                  Location Lost <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 px-3 text-sm text-[#231F20] focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
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
                <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                  Brand / Manufacturer <span className="text-zinc-400 font-normal">(helps matching)</span>
                </label>
                <div className="relative">
                  <Tag className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apple, Dell, Nike, Casio"
                    className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                  Primary Color <span className="text-zinc-400 font-normal">(helps matching)</span>
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Silver, Matte Black, Navy Blue"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 px-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Date Lost */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Date Lost <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={dateLost}
                  onChange={(e) => setDateLost(e.target.value)}
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Detailed Description / Identifying Marks
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include scratches, stickers, unique cases, or contents that help verify ownership..."
                className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] p-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
              />
            </div>

            {/* Image URL (Normalized in ITEM_IMAGE table) */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                Image Link / URL <span className="text-zinc-400 font-normal">(optional photo reference)</span>
              </label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-... (or paste direct image URL)"
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] py-2.5 pl-10 pr-3 text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#64748B]">
                DBMS note: Saved separately in the <code>item_image</code> normalized relation.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || loadingData}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D3632D] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#D3632D]/25 hover:bg-[#BA4F1D] disabled:opacity-50 transition active:scale-[0.99]"
              >
                {submitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Submit Lost Item Report</span>
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
