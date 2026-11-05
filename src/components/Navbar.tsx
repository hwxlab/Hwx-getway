/**
 * HWX Gateway - Top Bar Component
 * Adheres strictly to the 3-zone Top Bar Contract and WCAG AA contrast.
 */
import React from 'react';
import { Menu, LogOut, User as UserIcon, Shield, ExternalLink } from 'lucide-react';
import { User } from 'firebase/auth';
import { AppUser } from '../lib/firebase';

interface NavbarProps {
  user: User | AppUser | null;
  onOpenMobileMenu: () => void;
  onSignOut: () => void;
  currentTitle: string;
  onNavigateToDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenMobileMenu,
  onSignOut,
  currentTitle,
  onNavigateToDocs,
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Zone 1: Mobile Toggle & Brand / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden text-slate-400 hover:text-slate-100 p-1.5 rounded-lg border border-slate-800 bg-slate-950/40"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-100 hidden sm:inline whitespace-nowrap">HWX Gateway</span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">/</span>
          <span className="text-indigo-400 font-medium whitespace-nowrap">{currentTitle}</span>
        </div>
      </div>

      {/* Zone 2: System Environment Indicator (Unboxed, clean typography) */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 font-mono">
        <span>Region: Asia-South1</span>
        <span aria-hidden="true">·</span>
        <span>Gateway Protocol: HTTP/v1</span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={onNavigateToDocs}
          className="text-slate-300 hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Zone 3: Authenticated User Account Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-slate-200 font-medium truncate max-w-[140px] text-[11px]">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {user.email || 'Authenticated'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Unauthenticated</span>
          </div>
        )}
      </div>
    </header>
  );
};
