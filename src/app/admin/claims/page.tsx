'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Package,
  Shield,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface AdminClaimItem {
  claim_id: number;
  claim_date: string;
  proof: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  user: {
    user_id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  found_item: {
    found_item_id: number;
    item_name: string;
    brand: string | null;
    color: string | null;
    category: { category_name: string };
    location: { location_name: string };
  };
  verification: {
    verification_id: number;
    status: 'Approved' | 'Rejected';
    remarks: string;
    admin: { name: string };
  } | null;
}

export default function AdminClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<AdminClaimItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification action modal state
  const [selectedClaim, setSelectedClaim] = useState<AdminClaimItem | null>(null);
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadClaims = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadClaims();
    }
  }, [user, loadClaims]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: selectedClaim.claim_id,
          status: decision,
          remarks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to record verification' });
      } else {
        setFeedback({ type: 'success', message: data.message });
        setTimeout(() => {
          setSelectedClaim(null);
          setRemarks('');
          setFeedback(null);
          loadClaims();
        }, 1200);
      }
    } catch {
      setFeedback({ type: 'error', message: 'A network error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-20 text-center text-xs text-zinc-500">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Claims Management & Verification
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Review ownership claims submitted by students and record official verification decisions.
          </p>
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <FileCheck className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No claims recorded in database
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Claims submitted by students on found items will appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.claim_id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">
                    Claim #{claim.claim_id}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(claim.claim_date).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
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

                  {claim.status === 'Pending' && (
                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setDecision('Approved');
                        setRemarks('');
                        setFeedback(null);
                      }}
                      className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
                    >
                      Verify Claim
                    </button>
                  )}
                </div>
              </div>

              {/* Grid with Claimant & Found Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Claimant */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                    Claimant (USER table)
                  </span>
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>{claim.user?.name}</span>
                  </div>
                  <p className="text-zinc-500">
                    Email: {claim.user?.email} {claim.user?.phone ? `• Tel: ${claim.user.phone}` : ''}
                  </p>
                </div>

                {/* Found Item */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                    Target Found Item (FOUND_ITEM table)
                  </span>
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                    <span>{claim.found_item?.item_name}</span>
                    <Link
                      href={`/item/found-${claim.found_item?.found_item_id}`}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-0.5"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <p className="text-zinc-500">
                    Category: {claim.found_item?.category?.category_name} • Location: {claim.found_item?.location?.location_name}
                  </p>
                </div>
              </div>

              {/* Submitted Proof */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                  Claimant Proof Description:
                </span>
                <p className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 italic">
                  &quot;{claim.proof}&quot;
                </p>
              </div>

              {/* Existing Verification Details */}
              {claim.verification && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20 text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-300">
                    Verification Audit Record (VERIFICATION table):
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                    <strong>Status:</strong> {claim.verification.status} •{' '}
                    <strong>Remarks:</strong> {claim.verification.remarks || 'None'} •{' '}
                    <strong>Admin:</strong> {claim.verification.admin?.name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VERIFICATION MODAL */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Verify Claim #{selectedClaim.claim_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p>
                Claimant: <strong>{selectedClaim.user?.name}</strong> ({selectedClaim.user?.email})
              </p>
              <p>
                Item: <strong>{selectedClaim.found_item?.item_name}</strong>
              </p>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-2.5 mt-2 border border-zinc-200 dark:border-zinc-700 italic">
                &quot;{selectedClaim.proof}&quot;
              </div>
            </div>

            {feedback && (
              <div
                className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {/* Decision radio */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Verification Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('Approved')}
                    className={`rounded-xl border p-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                      decision === 'Approved'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-sm'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Approve Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('Rejected')}
                    className={`rounded-xl border p-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                      decision === 'Rejected'
                        ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-200 shadow-sm'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700'
                    }`}
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                    Reject Claim
                  </button>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Administrative Remarks / Notes <span className="text-zinc-400">(sent to claimant)</span>
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    decision === 'Approved'
                      ? 'e.g. Serial number and markings matched campus registration records. Authorized for pickup.'
                      : 'e.g. Proof was insufficient or did not match distinguishing features.'
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs text-zinc-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2.5 text-[11px] text-amber-800 dark:text-amber-300">
                <strong>DBMS Action:</strong> Inserts a row in <code>VERIFICATION</code> table and updates <code>claim.status</code>. If approved, sets <code>found_item.status = &apos;Returned&apos;</code>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
