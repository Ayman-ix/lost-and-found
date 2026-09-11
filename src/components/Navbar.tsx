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
    <header className="sticky top-0 z-50 w-full border-b border-[#ECECEC] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-[#231F20] transition hover:opacity-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D3632D] text-white shadow-sm shadow-[#D3632D]/30">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg text-[#231F20]">Lost &amp; Found</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D3632D]">
                Campus Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <Link
              href="/items/lost"
              className={`px-3.5 py-2 rounded-lg transition ${
                isActive('/items/lost')
                  ? 'bg-[#FFF4ED] text-[#D3632D]'
                  : 'text-[#231F20] hover:text-[#D3632D] hover:bg-gray-50'
              }`}
            >
              Lost Items
            </Link>
            <Link
              href="/items/found"
              className={`px-3.5 py-2 rounded-lg transition ${
                isActive('/items/found')
                  ? 'bg-[#FFF4ED] text-[#D3632D]'
                  : 'text-[#231F20] hover:text-[#D3632D] hover:bg-gray-50'
              }`}
            >
              Found Items
            </Link>
            <Link
              href="/items"
              className={`px-3.5 py-2 rounded-lg transition ${
                isActive('/items')
                  ? 'bg-[#FFF4ED] text-[#D3632D]'
                  : 'text-[#231F20] hover:text-[#D3632D] hover:bg-gray-50'
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D3632D]/40 bg-[#FFF4ED] px-3.5 py-1.5 text-xs font-bold text-[#D3632D] transition hover:bg-[#FFE8D6]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Lost
            </Link>
            <Link
              href="/report-found"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Found
            </Link>
          </div>

          <div className="h-5 w-px bg-[#ECECEC] mx-1" />

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
                  className="flex items-center gap-2 rounded-lg border border-[#ECECEC] p-1.5 text-sm font-semibold text-[#231F20] hover:bg-gray-50"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF4ED] text-[#D3632D] font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate pr-1">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-[#ECECEC] bg-white p-2 shadow-xl text-sm z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-2 border-b border-[#ECECEC] mb-1">
                      <p className="font-bold text-[#231F20] truncate">{user.name}</p>
                      <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FFF4ED] text-[#D3632D]">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'user' && (
                      <>
                        <Link
                          href="/my-items"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D]"
                        >
                          <Package className="h-4 w-4 text-[#64748B]" />
                          My Reported Items
                        </Link>
                        <Link
                          href="/my-claims"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D]"
                        >
                          <FileCheck className="h-4 w-4 text-[#64748B]" />
                          My Submitted Claims
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D]"
                        >
                          <User className="h-4 w-4 text-[#64748B]" />
                          My Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#D3632D] hover:bg-[#FFF4ED] font-bold"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-[#ECECEC] my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left font-semibold"
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
                className="px-3.5 py-1.5 text-sm font-semibold text-[#231F20] hover:text-[#D3632D] rounded-lg hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#D3632D] px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-sm shadow-[#D3632D]/25 hover:bg-[#BA4F1D] transition active:scale-95"
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
              className="relative p-2 text-[#231F20]"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D3632D] text-[10px] font-bold text-white">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#231F20]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#ECECEC] bg-white px-4 py-4">
          <div className="flex flex-col gap-2 pb-3 border-b border-[#ECECEC]">
            <Link
              href="/items/lost"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-lg text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D] font-semibold"
            >
              Lost Items
            </Link>
            <Link
              href="/items/found"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-lg text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D] font-semibold"
            >
              Found Items
            </Link>
            <Link
              href="/items"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-lg text-[#231F20] hover:bg-[#FFF4ED] hover:text-[#D3632D] font-semibold"
            >
              All Directory
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <Link
              href="/report-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FFF4ED] border border-[#D3632D]/30 p-2 text-xs font-bold text-[#D3632D]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Lost
            </Link>
            <Link
              href="/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-600/30 p-2 text-xs font-bold text-emerald-700"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Report Found
            </Link>
          </div>

          {user ? (
            <div className="flex flex-col gap-2 pt-2">
              <div className="px-3 py-1.5 text-xs text-[#64748B]">
                Signed in as <strong className="text-[#231F20]">{user.name}</strong>
              </div>
              {user.role === 'user' && (
                <>
                  <Link
                    href="/my-items"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-[#231F20] hover:bg-[#FFF4ED]"
                  >
                    My Items
                  </Link>
                  <Link
                    href="/my-claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-[#231F20] hover:bg-[#FFF4ED]"
                  >
                    My Claims
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-[#231F20] hover:bg-[#FFF4ED]"
                  >
                    Profile
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-bold text-[#D3632D] bg-[#FFF4ED]"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mt-2 w-full rounded-lg border border-red-200 p-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg border border-[#ECECEC] p-2 text-sm font-semibold text-[#231F20] hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg bg-[#D3632D] p-2 text-xs font-bold text-white uppercase tracking-wider shadow-sm hover:bg-[#BA4F1D]"
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
