'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Users, ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';

interface RegisteredUser {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  lostCount: number;
  foundCount: number;
  claimsCount: number;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsersList(data.users || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'admin') {
      loadUsers();
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
          Registered Users & Student Accounts
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Auditing user table records and cross-referencing lost/found reporting metrics.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading user registry...</div>
      ) : usersList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Users className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No registered users yet
          </h3>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60 text-zinc-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User ID (PK)</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Lost Reports</th>
                  <th className="py-3 px-4">Found Reports</th>
                  <th className="py-3 px-4">Claims Filed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {usersList.map((u) => (
                  <tr key={u.user_id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-500">#{u.user_id}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">{u.name}</td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="text-zinc-600 dark:text-zinc-300">{u.email}</div>
                      {u.phone && <div className="text-[11px] text-zinc-400">{u.phone}</div>}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {u.lostCount} lost
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {u.foundCount} found
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {u.claimsCount} claims
                      </span>
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
