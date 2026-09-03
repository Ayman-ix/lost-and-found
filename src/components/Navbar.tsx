'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Search,
  PlusCircle,
  Bell,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Package,
  FileCheck,
} from 'lucide-react';

export default function Navbar() {
  const { user, unreadNotifications, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-900 transition hover:opacity-90 dark:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-base sm:text-lg">Lost & Found</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Network System
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/items/lost"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/items/lost')
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
              }`}
            >
              Lost Items
            </Link>
            <Link
              href="/items/found"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/items/found')
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
              }`}
            >
              Found Items
            </Link>
            <Link
              href="/items"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/items')
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
              }`}
            >
              All Directory
            </Link>
          </nav>
        </div>

        {/* Action Controls & User Section */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Report Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/report-lost"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Lost
            </Link>
            <Link
              href="/report-found"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Found
            </Link>
          </div>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              {user.role === 'user' && (
                <Link
                  href="/notifications"
                  className="relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>
              )}

              {/* Admin Badge */}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin Console
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 p-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs dark:bg-blue-900 dark:text-blue-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate pr-1">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-sm z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'user' && (
                      <>
                        <Link
                          href="/my-items"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Package className="h-4 w-4 text-zinc-500" />
                          My Reported Items
                        </Link>
                        <Link
                          href="/my-claims"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <FileCheck className="h-4 w-4 text-zinc-500" />
                          My Submitted Claims
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <User className="h-4 w-4 text-zinc-500" />
                          My Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-zinc-800 font-medium"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 text-left font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && user.role === 'user' && (
            <Link
              href="/notifications"
              className="relative p-2 text-zinc-600 dark:text-zinc-300"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 dark:text-zinc-200"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Link
              href="/items/lost"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
            >
              Lost Items
            </Link>
            <Link
              href="/items/found"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
            >
              Found Items
            </Link>
            <Link
              href="/items"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
            >
              All Directory
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <Link
              href="/report-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 border border-red-200 p-2 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Lost
            </Link>
            <Link
              href="/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Found
            </Link>
          </div>

          {user ? (
            <div className="flex flex-col gap-2 pt-2">
              <div className="px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Signed in as <strong className="text-zinc-900 dark:text-white">{user.name}</strong>
              </div>
              {user.role === 'user' && (
                <>
                  <Link
                    href="/my-items"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    My Items
                  </Link>
                  <Link
                    href="/my-claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    My Claims
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Profile
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mt-2 w-full rounded-lg border border-red-200 p-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg border border-zinc-300 p-2 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg bg-blue-600 p-2 text-sm font-medium text-white shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
