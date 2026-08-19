'use client';

import React from 'react';

interface ResetModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ResetModal({
  isOpen,
  isDarkMode,
  onConfirm,
  onClose,
}: ResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-[92%] max-w-sm rounded-2xl p-4 shadow-2xl ring-1 ${
          isDarkMode
            ? 'bg-[#121212] text-white ring-white/10'
            : 'bg-white text-gray-900 ring-gray-200'
        }`}
      >
        <h4 className="text-sm font-semibold mb-2">Reset all settings?</h4>
        <p
          className={`text-xs leading-relaxed ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}
        >
          This will restore default apps, widgets, and layout preferences.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="px-3 py-1.5 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white font-medium shadow-md shadow-red-500/20 cursor-pointer"
          >
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
}
