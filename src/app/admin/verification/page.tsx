'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface VerificationLog {
  verification_id: number;
  verification_date: string;
  remarks: string | null;
  status: 'Approved' | 'Rejected';
  admin: { name: string; email: string };
  claim: {
    claim_id: number;
    proof: string;
    user: { name: string; email: string };
    found_item: {
      found_item_id: number;
      item_name: string;
      category: { category_name: string };
    };
  };
}

export default function AdminVerificationLogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/admin/verifications');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.verifications || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'admin') {
      loadLogs();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <div className="p-20 text-center text-xs text-zinc-500">Admin access required.</div>;
  }

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
          Verification Audit Ledger
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Historical record from the <code>VERIFICATION</code> entity documenting all administrative decisions and remarks.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading audit log...</div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <ShieldCheck className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No verification records logged yet
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            When you approve or reject claims in the claims console, they will be archived here.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/claims"
              className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Review Pending Claims
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60 text-zinc-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Verif. ID</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Claim & Item</th>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4">Verified By</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.verification_id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-400">
                      #{log.verification_id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-[11px] ${
                          log.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {log.status === 'Approved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {log.claim?.found_item?.item_name}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Claim #{log.claim?.claim_id}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">
                      {log.claim?.user?.name}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-zinc-600 dark:text-zinc-300">
                      {log.remarks || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {log.admin?.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(log.verification_date).toLocaleString()}
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
