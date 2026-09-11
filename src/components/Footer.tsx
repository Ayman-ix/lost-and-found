import React from 'react';
import Link from 'next/link';
import { Compass, Database, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-[#D3632D] bg-[#231F20] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D3632D] text-white shadow-sm shadow-[#D3632D]/40">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg text-white">
                Lost &amp; Found Network
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Campus DBMS portal designed to streamline lost item reporting, match calculation, and verified ownership returns.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3.5 py-1 text-[11px] text-zinc-300">
              <Database className="h-3.5 w-3.5 text-[#D3632D]" />
              <span>PostgreSQL Relational Database System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#D3632D] pl-2">
              Directory
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/items/lost" className="hover:text-[#D3632D] transition">
                  Browse Lost Items
                </Link>
              </li>
              <li>
                <Link href="/items/found" className="hover:text-[#D3632D] transition">
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link href="/report-lost" className="hover:text-[#D3632D] transition">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link href="/report-found" className="hover:text-[#D3632D] transition">
                  Report a Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* DBMS & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#D3632D] pl-2">
              Management Portal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/admin" className="flex items-center gap-1.5 hover:text-[#D3632D] transition">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D3632D]" />
                  Admin Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#D3632D] transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#D3632D] transition">
                  Student / User Registration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} Campus Lost &amp; Found Network. All rights reserved.</p>
          <p className="flex items-center gap-1 text-zinc-400">
            Student Services &amp; Campus Recovery Center
          </p>
        </div>
      </div>
    </footer>
  );
}
