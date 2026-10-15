'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
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
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { user, unreadNotifications, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ECECEC] bg-white/95 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0D0D0D]/95 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-[#231F20] dark:text-[#F0EFE9] transition hover:opacity-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D3632D] text-white shadow-sm shadow-[#D3632D]/30 shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold tracking-tight text-lg leading-tight text-[#231F20] dark:text-[#F0EFE9]">Lost &amp; Found</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D3632D] leading-tight">
                Campus Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <Link
              href="/"
              data-active={isActive('/') ? 'true' : undefined}
              className={`nav-underline px-3.5 py-2 rounded-lg transition duration-200 ease-out ${
                isActive('/')
                  ? 'text-[#D3632D] dark:text-[#E8613A]'
                  : 'text-[#231F20] hover:text-[#D3632D] dark:text-[#F0EFE9] dark:hover:text-[#E8613A]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/items/lost"
              data-active={isActive('/items/lost') ? 'true' : undefined}
              className={`nav-underline px-3.5 py-2 rounded-lg transition duration-200 ease-out ${
                isActive('/items/lost')
                  ? 'text-[#D3632D] dark:text-[#E8613A]'
                  : 'text-[#231F20] hover:text-[#D3632D] dark:text-[#F0EFE9] dark:hover:text-[#E8613A]'
              }`}
            >
              Lost Items
            </Link>
            <Link
              href="/items/found"
              data-active={isActive('/items/found') ? 'true' : undefined}
              className={`nav-underline px-3.5 py-2 rounded-lg transition duration-200 ease-out ${
                isActive('/items/found')
                  ? 'text-[#D3632D] dark:text-[#E8613A]'
                  : 'text-[#231F20] hover:text-[#D3632D] dark:text-[#F0EFE9] dark:hover:text-[#E8613A]'
              }`}
            >
              Found Items
            </Link>
            <Link
              href="/items"
              data-active={isActive('/items') ? 'true' : undefined}
              className={`nav-underline px-3.5 py-2 rounded-lg transition duration-200 ease-out ${
                isActive('/items')
                  ? 'text-[#D3632D] dark:text-[#E8613A]'
                  : 'text-[#231F20] hover:text-[#D3632D] dark:text-[#F0EFE9] dark:hover:text-[#E8613A]'
              }`}
            >
              All Directory
            </Link>
          </nav>
        </div>

        {/* Action Controls & User Section */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button (getmar.ch style) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#F0EFE9] transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-[#231F20] transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              {user.role === 'user' && (
                <Link
                  href="/notifications"
                  className="relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg dark:text-zinc-400 dark:hover:text-[#F0EFE9] dark:hover:bg-[#141414] transition"
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
                  className="flex items-center gap-2 rounded-lg border border-[#ECECEC] dark:border-white/[0.08] dark:bg-[#141414] p-1.5 text-sm font-semibold text-[#231F20] dark:text-[#F0EFE9] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF4ED] dark:bg-[#E8613A]/20 text-[#D3632D] dark:text-[#E8613A] font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate pr-1">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#141414] p-2 shadow-xl text-sm z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-2 border-b border-[#ECECEC] dark:border-white/[0.08] mb-1">
                      <p className="font-bold text-[#231F20] dark:text-[#F0EFE9] truncate">{user.name}</p>
                      <p className="text-xs text-[#64748B] dark:text-[#8E8C87] truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FFF4ED] dark:bg-[#E8613A]/20 text-[#D3632D] dark:text-[#E8613A]">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'user' && (
                      <>
                        <Link
                          href="/my-items"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#1A1A1A] hover:text-[#D3632D] dark:hover:text-[#E8613A]"
                        >
                          <Package className="h-4 w-4 text-[#64748B] dark:text-[#8E8C87]" />
                          My Reported Items
                        </Link>
                        <Link
                          href="/my-claims"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#1A1A1A] hover:text-[#D3632D] dark:hover:text-[#E8613A]"
                        >
                          <FileCheck className="h-4 w-4 text-[#64748B] dark:text-[#8E8C87]" />
                          My Submitted Claims
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#1A1A1A] hover:text-[#D3632D] dark:hover:text-[#E8613A]"
                        >
                          <User className="h-4 w-4 text-[#64748B] dark:text-[#8E8C87]" />
                          My Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#D3632D] dark:text-[#E8613A] hover:bg-[#FFF4ED] dark:hover:bg-[#1A1A1A] font-bold"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-[#ECECEC] dark:border-white/[0.08] my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left font-semibold"
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
                className="px-3.5 py-1.5 text-sm font-semibold text-[#231F20] dark:text-[#F0EFE9] hover:text-[#D3632D] dark:hover:text-[#E8613A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#141414] transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#D3632D] dark:bg-[#E8613A] px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-sm shadow-[#D3632D]/25 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#BA4F1D] dark:hover:bg-[#D3522C] hover:shadow-md hover:shadow-[#D3632D]/30 active:scale-[0.98]"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls & Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#F0EFE9]" />
            ) : (
              <Moon className="h-4 w-4 text-[#231F20]" />
            )}
          </button>

          {user && user.role === 'user' && (
            <Link
              href="/notifications"
              className="relative p-2 text-[#231F20] dark:text-[#F0EFE9]"
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
            className="p-2 text-[#231F20] dark:text-[#F0EFE9]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#ECECEC] dark:border-white/[0.08] bg-white dark:bg-[#0D0D0D] px-4 py-4 transition-colors duration-200">
          <div className="flex flex-col gap-2 pb-3 border-b border-[#ECECEC] dark:border-white/[0.08]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2 rounded-lg font-semibold ${
                isActive('/') ? 'text-[#D3632D] dark:text-[#E8613A] bg-[#FFF4ED] dark:bg-[#E8613A]/15' : 'text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#141414] hover:text-[#D3632D] dark:hover:text-[#E8613A]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/items/lost"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2 rounded-lg font-semibold ${
                isActive('/items/lost') ? 'text-[#D3632D] dark:text-[#E8613A] bg-[#FFF4ED] dark:bg-[#E8613A]/15' : 'text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#141414] hover:text-[#D3632D] dark:hover:text-[#E8613A]'
              }`}
            >
              Lost Items
            </Link>
            <Link
              href="/items/found"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2 rounded-lg font-semibold ${
                isActive('/items/found') ? 'text-[#D3632D] dark:text-[#E8613A] bg-[#FFF4ED] dark:bg-[#E8613A]/15' : 'text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#141414] hover:text-[#D3632D] dark:hover:text-[#E8613A]'
              }`}
            >
              Found Items
            </Link>
            <Link
              href="/items"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2 rounded-lg font-semibold ${
                isActive('/items') ? 'text-[#D3632D] dark:text-[#E8613A] bg-[#FFF4ED] dark:bg-[#E8613A]/15' : 'text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#141414] hover:text-[#D3632D] dark:hover:text-[#E8613A]'
              }`}
            >
              All Directory
            </Link>
          </div>

          {user ? (
            <div className="flex flex-col gap-2 pt-2">
              <div className="px-3 py-1.5 text-xs text-[#64748B] dark:text-[#8E8C87]">
                Signed in as <strong className="text-[#231F20] dark:text-[#F0EFE9]">{user.name}</strong>
              </div>
              {user.role === 'user' && (
                <>
                  <Link
                    href="/my-items"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#141414]"
                  >
                    My Items
                  </Link>
                  <Link
                    href="/my-claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#141414]"
                  >
                    My Claims
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-[#231F20] dark:text-[#F0EFE9] hover:bg-[#FFF4ED] dark:hover:bg-[#141414]"
                  >
                    Profile
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-bold text-[#D3632D] dark:text-[#E8613A] bg-[#FFF4ED] dark:bg-[#E8613A]/15"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mt-2 w-full rounded-lg border border-red-200 dark:border-red-900/40 p-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg border border-[#ECECEC] dark:border-white/[0.08] p-2 text-sm font-semibold text-[#231F20] dark:text-[#F0EFE9] hover:bg-gray-50 dark:hover:bg-[#141414]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg bg-[#D3632D] dark:bg-[#E8613A] p-2 text-xs font-bold text-white uppercase tracking-wider shadow-sm transition duration-200 ease-out hover:bg-[#BA4F1D] dark:hover:bg-[#D3522C] hover:shadow-md active:scale-[0.98]"
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
