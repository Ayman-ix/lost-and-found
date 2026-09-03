import React from 'react';
import Link from 'next/link';
import { Compass, Database, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold text-zinc-900 dark:text-white">
                Lost & Found Network
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              A comprehensive campus and community DBMS platform designed to streamline lost property recovery, ownership verification, and transparent claim management.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <Database className="h-3.5 w-3.5 text-blue-500" />
              <span>PostgreSQL Relational Database System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/items/lost" className="hover:text-blue-600 transition">
                  Browse Lost Items
                </Link>
              </li>
              <li>
                <Link href="/items/found" className="hover:text-blue-600 transition">
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link href="/report-lost" className="hover:text-blue-600 transition">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link href="/report-found" className="hover:text-blue-600 transition">
                  Report a Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* DBMS & Security */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
              DBMS Portal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/admin" className="flex items-center gap-1.5 hover:text-blue-600 transition">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  Admin Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-blue-600 transition">
                  Student / User Registration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-3">
          <p>© {new Date().getFullYear()} Lost & Found Network Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for College DBMS Project Evaluation
          </p>
        </div>
      </div>
    </footer>
  );
}
