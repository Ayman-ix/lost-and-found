'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FileCheck, Package, Clock, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ClaimItem {
  claim_id: number;
  claim_date: string;
  proof: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  found_item: {
    found_item_id: number;
    item_name: string;
    brand: string | null;
    color: string | null;
    date_found: string;
    category: { category_name: string };
    location: { location_name: string };
  };
  verification: {
    verification_id: number;
    verification_date: string;
    remarks: string | null;
    status: 'Approved' | 'Rejected';
    admin: { name: string; email: string };
  } | null;
}

export default function MyClaimsPage() {
  const { user, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClaims() {
      try {
        const res = await fetch('/api/claims');
        if (res.ok) {
          const data = await res.json();
          setClaims(data.claims || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadClaims();
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Loading your claims...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <FileCheck className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">Sign In Required</h2>
        <p className="mt-1 text-xs text-zinc-500">Please sign in to view your claims.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          My Ownership Claims
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Track administrator verifications for items you have claimed.
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <FileCheck className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No claims submitted yet
          </h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            If you identify a lost possession in the found directory, click &quot;This Might Be Mine&quot; to initiate a claim.
          </p>
          <div className="mt-4">
            <Link
              href="/items/found"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Browse Found Items
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.claim_id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">
                    Claim #{claim.claim_id}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs text-zinc-500">
                    Submitted on {new Date(claim.claim_date).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      claim.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : claim.status === 'Rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {claim.status === 'Approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {claim.status === 'Rejected' && <XCircle className="h-3.5 w-3.5" />}
                    {claim.status === 'Pending' && <Clock className="h-3.5 w-3.5" />}
                    {claim.status}
                  </span>
                </div>
              </div>

              {/* Claimed Item Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl text-xs">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Found Item Target:</span>
                  <h4 className="font-bold text-zinc-900 dark:text-white">
                    {claim.found_item?.item_name}
                  </h4>
                  <p className="text-zinc-500">
                    {claim.found_item?.category?.category_name} • Location: {claim.found_item?.location?.location_name}
                  </p>
                </div>
                <Link
                  href={`/item/found-${claim.found_item?.found_item_id}`}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-500"
                >
                  <span>Inspect Found Item</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Submitted Proof */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-zinc-500">Your Submitted Proof:</span>
                <p className="text-zinc-700 dark:text-zinc-300 italic bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  &quot;{claim.proof}&quot;
                </p>
              </div>

              {/* Verification Decision (1:1 Relation with VERIFICATION) */}
              {claim.verification && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>Administrator Verification Decision: {claim.verification.status}</span>
                  </div>
                  {claim.verification.remarks && (
                    <p className="text-zinc-600 dark:text-zinc-300">
                      <strong>Admin Remarks:</strong> {claim.verification.remarks}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    Verified by {claim.verification.admin?.name} on{' '}
                    {new Date(claim.verification.verification_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
