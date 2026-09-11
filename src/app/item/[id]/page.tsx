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
          className="mt-6 inline-block rounded-xl bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#BA4F1D] shadow-sm transition"
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
              <span className="inline-block rounded-md bg-[#FFF4ED] border border-[#FFD8C2] px-3 py-1 text-xs font-bold text-[#D3632D]">
                {item.category?.category_name}
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#231F20]">
                {item.item_name}
              </h1>
            </div>

            {/* Structured Specs Table */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#ECECEC] bg-white p-4 text-xs">
              <div>
                <span className="text-[#64748B] block text-[11px]">Brand / Manufacturer</span>
                <span className="font-semibold text-[#231F20]">
                  {item.brand || 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Color</span>
                <span className="font-semibold text-[#231F20]">
                  {item.color || 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Location</span>
                <span className="font-semibold text-[#231F20]">
                  {item.location?.location_name} ({item.location?.city})
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">
                  {itemType === 'lost' ? 'Date Lost' : 'Date Found'}
                </span>
                <span className="font-semibold text-[#231F20]">
                  {itemType === 'lost' ? item.date_lost : item.date_found}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
                Description &amp; Custody Details
              </h3>
              <p className="text-xs sm:text-sm text-[#231F20] leading-relaxed bg-white p-4 rounded-xl border border-[#ECECEC]">
                {item.description || 'No detailed description provided by reporter.'}
              </p>
            </div>

            {/* Reported By Info */}
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <User className="h-4 w-4 text-zinc-400" />
              <span>Reported by: <strong className="text-[#231F20]">{item.user?.name}</strong></span>
              <span>•</span>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-[#ECECEC] space-y-3">
            {itemType === 'found' && (
              <div>
                {isReporter ? (
                  <div className="rounded-xl bg-[#F8F9FA] border border-[#ECECEC] p-3 text-xs text-[#64748B] text-center">
                    You reported this found item.
                  </div>
                ) : user ? (
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#D3632D] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#D3632D]/25 hover:bg-[#BA4F1D] transition active:scale-[0.99]"
                  >
                    <FileCheck className="h-4 w-4" />
                    This Might Be Mine (Submit Claim)
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#231F20] py-3.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-black transition"
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
      <section className="rounded-2xl border border-[#ECECEC] bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF4ED] text-[#D3632D] border border-[#FFD8C2]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#231F20]">
                Rule-Based Potential Matches ({matches.length})
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Resolved via MySQL <code>potential_match</code> table (M:N bridge)
              </p>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="text-xs text-[#64748B] py-2">
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
                  className="flex items-center justify-between rounded-xl border border-[#ECECEC] p-4 hover:border-[#D3632D]/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#231F20]">
                        {counterpart.item_name}
                      </span>
                      <span className="rounded bg-[#FFF4ED] border border-[#FFD8C2] px-1.5 py-0.5 text-[10px] font-bold text-[#D3632D]">
                        {m.match_score}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {counterpart.brand || 'No brand'} • {counterpart.color || 'No color'} • {counterpart.location?.location_name}
                    </p>
                  </div>

                  <Link
                    href={`/item/${counterpartType}-${counterpartId}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#FFF4ED] hover:bg-[#FFE8D6] text-[#D3632D] border border-[#FFD8C2] px-3 py-1.5 text-xs font-bold transition"
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
          <div className="w-full max-w-lg rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#D3632D]" />
                <h3 className="font-bold text-base text-[#231F20]">
                  Ownership Verification Claim
                </h3>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-[#64748B] hover:text-[#231F20]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">
                You are submitting a claim for:{' '}
                <strong className="text-[#231F20]">{item.item_name}</strong>
              </p>
            </div>

            {claimStatus && (
              <div
                className={`flex items-start gap-2 rounded-xl p-3 text-xs ${
                  claimStatus.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-red-200 bg-red-50 text-red-800'
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
                <label className="block text-xs font-semibold text-[#231F20] mb-1.5">
                  Proof of Ownership / Distinctive Identifiers <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Describe unique details only the owner would know: serial number, lock screen wallpaper, stickers, scratches, contents inside, purchase receipt info..."
                  className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F9FA] p-3 text-xs sm:text-sm text-[#231F20] placeholder:text-zinc-400 focus:border-[#D3632D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D3632D]"
                />
              </div>

              <div className="rounded-xl border border-[#FFD8C2] bg-[#FFF4ED] p-3 text-[11px] text-[#BA4F1D]">
                <strong>DBMS Note:</strong> Creates a row in <code>claim</code> table (status: <code>Pending</code>) awaiting administrator verification.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm shadow-[#D3632D]/25 hover:bg-[#BA4F1D] disabled:opacity-50 transition"
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
