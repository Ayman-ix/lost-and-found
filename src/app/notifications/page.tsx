'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, CheckCheck, Clock, ShieldAlert } from 'lucide-react';

interface NotificationItem {
  notification_id: number;
  message: string;
  notification_date: string;
  status: 'Unread' | 'Read';
}

export default function NotificationsPage() {
  const { user, refreshAuth } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
      refreshAuth();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Bell className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">Sign In Required</h2>
        <p className="mt-1 text-xs text-zinc-500">Please sign in to view your notifications.</p>
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Real-time alerts for item matches, claims, and campus updates.
          </p>
        </div>

        {notifications.some((n) => n.status === 'Unread') && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 shadow-sm"
          >
            <CheckCheck className="h-4 w-4 text-blue-600" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Bell className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            No notifications yet
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            You will receive updates here whenever a match is discovered or a claim status changes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.notification_id}
              className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition ${
                n.status === 'Unread'
                  ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/60 dark:bg-blue-950/20'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    n.status === 'Unread'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(n.notification_date).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {n.status === 'Unread' && (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 mt-1" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
