'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  MapPin,
  Calendar,
  Tag,
  User,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';

interface MatchCandidate {
  match_id: number;
  match_score: number;
  match_status: string;
  found_item?: {
    found_item_id: number;
    item_name: string;
    brand: string;
    color: string;
    date_found: string;
    status: string;
    location: { location_name: string };
  };
  lost_item?: {
    lost_item_id: number;
    item_name: string;
    brand: string;
    color: string;
    date_lost: string;
    status: string;
    location: { location_name: string };
  };
}

interface ItemDetail {
  lost_item_id?: number;
  found_item_id?: number;
  item_name: string;
  description: string | null;
  brand: string | null;
  color: string | null;
  date_lost?: string;
  date_found?: string;
  status: string;
  created_at: string;
  user: { user_id: number; name: string; email: string };
  category: { category_id: number; category_name: string };
  location: { location_id: number; location_name: string; city: string };
  images: { image_id: number; image_url: string }[];
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim Modal State
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [proofText, setProofText] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/item/${resolvedParams.id}`);
        if (!res.ok) {
          setError('Failed to load item details.');
          return;
        }
        const data = await res.json();
        setItemType(data.type);
        setItem(data.item);
        setMatches(data.matches || []);
      } catch {
        setError('Network error while loading item.');
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [resolvedParams.id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText.trim()) return;

    setClaimSubmitting(true);
    setClaimStatus(null);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foundItemId: item?.found_item_id,
          proof: proofText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setClaimStatus({
          type: 'error',
          message: data.error || 'Failed to submit claim.',
        });
      } else {
        setClaimStatus({
          type: 'success',
          message: 'Claim successfully submitted! An admin will review your ownership proof.',
        });
        setProofText('');
        setTimeout(() => {
          setClaimModalOpen(false);
          router.push('/my-claims');
        }, 2000);
      }
    } catch {
      setClaimStatus({
        type: 'error',
        message: 'A network error occurred while submitting claim.',
      });
    } finally {
      setClaimSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-zinc-500">
        Loading item information...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Package className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">Item Not Found</h2>
        <p className="mt-1 text-xs text-zinc-500">
          The requested item may have been deleted or the link is invalid.
        </p>
        <Link
          href="/items"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const itemId = itemType === 'lost' ? item.lost_item_id : item.found_item_id;
  const isReporter = user && user.userId === item.user?.user_id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>

      {/* Main Grid: Left photo/preview, Right details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image / Photo Gallery */}
        <div className="space-y-4">
          <div className="relative flex h-80 sm:h-96 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-sm">
            {item.images && item.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.images[0].image_url}
                alt={item.item_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center space-y-2 text-zinc-400">
                <Package className="mx-auto h-16 w-16" />
                <p className="text-xs">No photograph provided</p>
              </div>
            )}

            <span
              className={`absolute top-4 left-4 rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                itemType === 'lost' ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            >
              {itemType} Report
            </span>

            <span className="absolute top-4 right-4 rounded-lg bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
              {item.status}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
            <strong>DBMS schema verification:</strong> Normalized entity <code>item_image</code> stores photo references linked to <code>{itemType}_item_id</code>.
          </div>
        </div>

        {/* Right: Item Metadata & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="inline-block rounded-md bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
                {item.category?.category_name}
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {item.item_name}
              </h1>
            </div>

            {/* Structured Specs Table */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Brand / Manufacturer</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {item.brand || 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Color</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {item.color || 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Location</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {item.location?.location_name} ({item.location?.city})
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">
                  {itemType === 'lost' ? 'Date Lost' : 'Date Found'}
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {itemType === 'lost' ? item.date_lost : item.date_found}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Description & Custody Details
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {item.description || 'No detailed description provided by reporter.'}
              </p>
            </div>

            {/* Reported By Info */}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <User className="h-4 w-4 text-zinc-400" />
              <span>Reported by: <strong className="text-zinc-700 dark:text-zinc-300">{item.user?.name}</strong></span>
              <span>•</span>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            {itemType === 'found' && (
              <div>
                {isReporter ? (
                  <div className="rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-center">
                    You reported this found item.
                  </div>
                ) : user ? (
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition active:scale-[0.99]"
                  >
                    <FileCheck className="h-4 w-4" />
                    This Might Be Mine (Submit Claim)
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Sign in to Claim This Item
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POTENTIAL MATCHES SECTION (M:N RESOLUTION DEMONSTRATION) */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Rule-Based Potential Matches ({matches.length})
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Resolved via PostgreSQL <code>potential_match</code> table (M:N bridge)
              </p>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">
            No active candidates scored above the 40-point threshold for this item yet. As new reports are submitted, potential matches will be auto-calculated.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {matches.map((m) => {
              const counterpart = itemType === 'lost' ? m.found_item : m.lost_item;
              if (!counterpart) return null;
              const counterpartType = itemType === 'lost' ? 'found' : 'lost';
              const counterpartId =
                itemType === 'lost'
                  ? (counterpart as any).found_item_id
                  : (counterpart as any).lost_item_id;

              return (
                <div
                  key={m.match_id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-900 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                        {counterpart.item_name}
                      </span>
                      <span className="rounded bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {m.match_score}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      {counterpart.brand || 'No brand'} • {counterpart.color || 'No color'} • {counterpart.location?.location_name}
                    </p>
                  </div>

                  <Link
                    href={`/item/${counterpartType}-${counterpartId}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CLAIM SUBMISSION MODAL */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Ownership Verification Claim
                </h3>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                You are submitting a claim for:{' '}
                <strong className="text-zinc-900 dark:text-white">{item.item_name}</strong>
              </p>
            </div>

            {claimStatus && (
              <div
                className={`flex items-start gap-2 rounded-xl p-3 text-xs ${
                  claimStatus.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {claimStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{claimStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Proof of Ownership / Distinctive Identifiers <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Describe unique details only the owner would know: serial number, lock screen wallpaper, stickers, scratches, contents inside, purchase receipt info..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                <strong>DBMS Note:</strong> Creates a row in <code>claim</code> table (status: <code>Pending</code>) awaiting administrator verification.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {claimSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Submit Claim
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
