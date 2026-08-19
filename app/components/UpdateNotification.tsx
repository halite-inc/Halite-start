'use client';

import React, { useState, useEffect } from 'react';
import { CURRENT_VERSION, LATEST_RELEASE, ChangelogItem } from '../lib/updates';

interface UpdateNotificationProps {
  isDarkMode: boolean;
  glassmorphismEnabled?: boolean;
  mergeTopPillsCenter?: boolean;
  forcedOpen?: boolean;
  onForcedClose?: () => void;
}

export default function UpdateNotification({
  isDarkMode,
  glassmorphismEnabled = true,
  mergeTopPillsCenter = false,
  forcedOpen = false,
  onForcedClose,
}: UpdateNotificationProps) {
  const [hasNewUpdate, setHasNewUpdate] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const seenVersion = localStorage.getItem('halite_update_seen_version');
      if (seenVersion !== CURRENT_VERSION) {
        setHasNewUpdate(true);
      }
    } catch (e) {
      console.error('Error reading seen version from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    if (forcedOpen) {
      setIsOpen(true);
    }
  }, [forcedOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('halite_update_seen_version', CURRENT_VERSION);
    } catch (e) {
      console.error('Error saving seen version to localStorage:', e);
    }
    setIsOpen(false);
    setHasNewUpdate(false);
    if (onForcedClose) {
      onForcedClose();
    }
  };

  const handlePillClick = () => {
    setIsOpen(true);
  };

  if (!mounted) return null;

  const categoryBadge = (cat: ChangelogItem['category']) => {
    switch (cat) {
      case 'feature':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            New
          </span>
        );
      case 'improvement':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Improved
          </span>
        );
      case 'performance':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Speed
          </span>
        );
      case 'fix':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Fix
          </span>
        );
    }
  };

  return (
    <>
      {/* Top Center Notification Pill (Only shown if update hasn't been acknowledged) */}
      {hasNewUpdate && !isOpen && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            mergeTopPillsCenter ? 'top-16' : 'top-4'
          }`}
        >
          <div className="relative group">
            <button
              onClick={handlePillClick}
              type="button"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                isDarkMode
                  ? 'bg-[#18181b]/85 hover:bg-[#27272a] text-white border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/90 hover:bg-white text-gray-900 border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.18)]'
              }`}
            >
              {/* Pulsing indicator dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>

              <span className="flex items-center gap-1.5">
                <span className="text-sm">✨</span>
                <span>Update <strong>{CURRENT_VERSION}</strong> Available</span>
              </span>

              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white shadow-sm">
                What's New
              </span>
            </button>

            {/* Quick close button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              title="Dismiss notification"
              className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-gray-800/80 hover:bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md border border-white/20"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Popover / Release Notes Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300" />

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-xl max-h-[85vh] rounded-[28px] overflow-hidden flex flex-col shadow-2xl ring-1 transition-all duration-300 animate-in fade-in zoom-in-95 ${
              isDarkMode
                ? 'bg-[#121214]/90 text-white ring-white/15 border border-white/10'
                : 'bg-white/95 text-gray-900 ring-black/10 border border-gray-200'
            }`}
            style={{
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header Banner */}
            <div className={`relative px-6 pt-6 pb-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/25">
                    ✨
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight">
                        {LATEST_RELEASE.headline}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {LATEST_RELEASE.version}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Released {LATEST_RELEASE.releaseDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {LATEST_RELEASE.summary}
              </p>
            </div>

            {/* Changelog Highlights List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 custom-scrollbar">
              {LATEST_RELEASE.highlights.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex gap-3.5 items-start ${
                    isDarkMode
                      ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07]'
                      : 'bg-gray-50/80 border-gray-150 hover:bg-gray-100/80'
                  }`}
                >
                  <div className="text-xl shrink-0 mt-0.5 p-2 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    {item.icon || '🚀'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold tracking-tight">
                        {item.title}
                      </h4>
                      {categoryBadge(item.category)}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-4 border-t flex items-center justify-between gap-3 ${
                isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Will not show again after acknowledge
              </span>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Got it, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
