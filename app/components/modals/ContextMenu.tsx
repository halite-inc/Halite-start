'use client';

import React from 'react';

interface ContextMenuProps {
  contextMenu: { x: number; y: number; appId: string } | null;
  isDarkMode: boolean;
  glassmorphismEnabled?: boolean;
  onOpenInNewTab: () => void;
  onStartEditing: (appId: string) => void;
  onClose: () => void;
}

export default function ContextMenu({
  contextMenu,
  isDarkMode,
  glassmorphismEnabled = false,
  onOpenInNewTab,
  onStartEditing,
  onClose,
}: ContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <div
      data-context-menu
      className="fixed z-[100]"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className={`min-w-[140px] rounded-xl shadow-xl ring-1 overflow-hidden py-1 ${
          isDarkMode
            ? glassmorphismEnabled
              ? 'bg-[#2B2B2B]/90 backdrop-blur-md ring-white/20'
              : 'bg-[#1e1e1e] ring-white/10'
            : glassmorphismEnabled
            ? 'bg-white/90 backdrop-blur-md ring-gray-200/40'
            : 'bg-white ring-gray-200'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenInNewTab();
            onClose();
          }}
          className={`w-full px-3 py-1.5 text-left text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            isDarkMode
              ? 'text-white hover:bg-white/10'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Open in new tab
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartEditing(contextMenu.appId);
            onClose();
          }}
          className={`w-full px-3 py-1.5 text-left text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            isDarkMode
              ? 'text-white hover:bg-white/10'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <svg
            className="w-4 h-4"
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
          Edit App
        </button>
      </div>
    </div>
  );
}
