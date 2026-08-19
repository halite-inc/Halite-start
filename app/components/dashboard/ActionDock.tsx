'use client';

import React from 'react';

interface ActionDockProps {
  dockVisibility?: 'always' | 'hover' | 'hidden' | 'visible';
  topPillSize?: 'small' | 'medium' | 'large';
  glassmorphismEnabled?: boolean;
  isDarkMode: boolean;
  isEditModalOpen: boolean;
  onToggleEditMode: () => void;
  onQuickAddApp: () => void;
  onOpenHaliteModal: () => void;
  onToggleRightSidebar: () => void;
  onOpenSettings: () => void;
}

export default function ActionDock({
  dockVisibility = 'visible',
  topPillSize = 'medium',
  glassmorphismEnabled = false,
  isDarkMode,
  isEditModalOpen,
  onToggleEditMode,
  onQuickAddApp,
  onOpenHaliteModal,
  onToggleRightSidebar,
  onOpenSettings,
}: ActionDockProps) {
  if (dockVisibility === 'hidden') return null;

  return (
    <div
      className="fixed bottom-0 right-0 p-4 sm:p-5 z-30 flex items-end justify-end group"
      style={{
        pointerEvents:
          dockVisibility === 'hover' && !isEditModalOpen ? 'auto' : 'none',
        width: '150px',
        height: '150px',
      }}
    >
      <div
        className={`rounded-full shadow-lg border flex items-center gap-1 transition-all duration-300 pointer-events-auto ${
          topPillSize === 'small'
            ? 'px-1 py-1 sm:px-1 sm:py-1 gap-0.5'
            : topPillSize === 'large'
            ? 'px-1.5 py-1.5 sm:px-2 sm:py-2 gap-1.5'
            : 'px-1 py-1 sm:px-1.5 sm:py-1.5'
        } ${
          glassmorphismEnabled
            ? isDarkMode
              ? 'bg-black/25 border-white/10 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.35)]'
              : 'bg-white/60 border-white/30 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.12)]'
            : isDarkMode
            ? 'bg-[#0f1115] border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
            : 'bg-white border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.10)]'
        } ${
          dockVisibility === 'hover' && !isEditModalOpen
            ? 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
            : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Edit Mode Button */}
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`${
            topPillSize === 'small'
              ? 'w-6 h-6 sm:w-7 sm:h-7'
              : topPillSize === 'large'
              ? 'w-8 h-8 sm:w-10 sm:h-10'
              : 'w-7 h-7 sm:w-8 sm:h-8'
          } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-white/10 text-white ring-white/10 hover:bg-white/15'
                : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
              : isDarkMode
              ? 'bg-[#1b1b1b] text-white ring-white/10 hover:bg-[#222]'
              : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
          } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
          title={isEditModalOpen ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          aria-label={isEditModalOpen ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          {isEditModalOpen ? (
            <svg
              className={`${
                topPillSize === 'small'
                  ? 'w-3.5 h-3.5'
                  : topPillSize === 'large'
                  ? 'w-5 h-5'
                  : 'w-4 h-4'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className={`${
                topPillSize === 'small'
                  ? 'w-3.5 h-3.5'
                  : topPillSize === 'large'
                  ? 'w-5 h-5'
                  : 'w-4 h-4'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          )}
        </button>

        {/* Quick Add Favorite App Button */}
        {isEditModalOpen && (
          <div className="relative">
            <button
              type="button"
              onClick={onQuickAddApp}
              className={`${
                topPillSize === 'small'
                  ? 'w-6 h-6 sm:w-7 sm:h-7'
                  : topPillSize === 'large'
                  ? 'w-8 h-8 sm:w-10 sm:h-10'
                  : 'w-7 h-7 sm:w-8 sm:h-8'
              } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${
                glassmorphismEnabled
                  ? isDarkMode
                    ? 'bg-white/10 text-white ring-white/10 hover:bg-white/15'
                    : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
                  : isDarkMode
                  ? 'bg-[#1b1b1b] text-white ring-white/10 hover:bg-[#222]'
                  : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
              } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
              title="Add Favorite App"
              aria-label="Add Favorite App"
            >
              <svg
                className={`${
                  topPillSize === 'small'
                    ? 'w-3.5 h-3.5'
                    : topPillSize === 'large'
                    ? 'w-5 h-5'
                    : 'w-4 h-4'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Halite Folder Button */}
        {isEditModalOpen && (
          <button
            type="button"
            onClick={onOpenHaliteModal}
            className={`${
              topPillSize === 'small'
                ? 'w-6 h-6 sm:w-7 sm:h-7'
                : topPillSize === 'large'
                ? 'w-8 h-8 sm:w-10 sm:h-10'
                : 'w-7 h-7 sm:w-8 sm:h-8'
            } rounded-full transition-all duration-300 flex items-center justify-center ring-1 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 text-white ring-yellow-500/30 hover:ring-yellow-500/50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
            title="Add Halite Folder"
            aria-label="Add Halite Folder"
          >
            <svg
              className={`${
                topPillSize === 'small'
                  ? 'w-3.5 h-3.5'
                  : topPillSize === 'large'
                  ? 'w-5 h-5'
                  : 'w-4 h-4'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7a2 2 0 012-2h4l2 2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              />
            </svg>
          </button>
        )}

        {/* Bookmarks Button */}
        <button
          type="button"
          onClick={onToggleRightSidebar}
          className={`${
            topPillSize === 'small'
              ? 'w-6 h-6 sm:w-7 sm:h-7'
              : topPillSize === 'large'
              ? 'w-8 h-8 sm:w-10 sm:h-10'
              : 'w-7 h-7 sm:w-8 sm:h-8'
          } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-white/10 text-white ring-white/10 hover:bg-white/15'
                : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
              : isDarkMode
              ? 'bg-[#1b1b1b] text-white ring-white/10 hover:bg-[#222]'
              : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
          } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
          title="Bookmarks"
          aria-label="Bookmarks"
        >
          <svg
            className={`${
              topPillSize === 'small'
                ? 'w-3.5 h-3.5'
                : topPillSize === 'large'
                ? 'w-5 h-5'
                : 'w-4 h-4'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`${
            topPillSize === 'small'
              ? 'w-6 h-6 sm:w-7 sm:h-7'
              : topPillSize === 'large'
              ? 'w-8 h-8 sm:w-10 sm:h-10'
              : 'w-7 h-7 sm:w-8 sm:h-8'
          } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-white/10 text-white ring-white/10 hover:bg-white/15'
                : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
              : isDarkMode
              ? 'bg-[#1b1b1b] text-white ring-white/10 hover:bg-[#222]'
              : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
          } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
          title="Settings"
          aria-label="Settings"
        >
          <svg
            className={`${
              topPillSize === 'small'
                ? 'w-3.5 h-3.5'
                : topPillSize === 'large'
                ? 'w-5 h-5'
                : 'w-4 h-4'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
