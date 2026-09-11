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
        <h2 className="mt-3 text-lg font-bold text-[#231F20]">Sign In Required</h2>
        <p className="mt-1 text-xs text-[#64748B]">Please sign in to view your notifications.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-[#D3632D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#BA4F1D] shadow-sm transition"
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#231F20]">
            Notifications
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            Real-time alerts for item matches, claims, and campus updates.
          </p>
        </div>

        {notifications.some((n) => n.status === 'Unread') && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECECEC] bg-white px-3.5 py-1.5 text-xs font-bold text-[#231F20] hover:text-[#D3632D] hover:bg-[#FFF4ED] shadow-sm transition"
          >
            <CheckCheck className="h-4 w-4 text-[#D3632D]" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748B]">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ECECEC] p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-bold text-[#231F20]">
            No notifications yet
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
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
                  ? 'border-[#FFD8C2] bg-[#FFF4ED]'
                  : 'border-[#ECECEC] bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    n.status === 'Unread'
                      ? 'bg-[#D3632D] text-white shadow-sm shadow-[#D3632D]/30'
                      : 'bg-[#F8F9FA] text-[#64748B] border border-[#ECECEC]'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-[#231F20] leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(n.notification_date).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {n.status === 'Unread' && (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D3632D] mt-1" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
