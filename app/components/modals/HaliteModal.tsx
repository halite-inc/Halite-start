'use client';

import React from 'react';

interface HaliteModalProps {
  isOpen: boolean;
  folderName: string;
  urls: string[];
  isDarkMode: boolean;
  glassmorphismEnabled?: boolean;
  onFolderNameChange: (name: string) => void;
  onUrlChange: (index: number, url: string) => void;
  onAddFolder: () => void;
  onClose: () => void;
}

export default function HaliteModal({
  isOpen,
  folderName,
  urls,
  isDarkMode,
  glassmorphismEnabled = false,
  onFolderNameChange,
  onUrlChange,
  onAddFolder,
  onClose,
}: HaliteModalProps) {
  if (!isOpen) return null;

  const validUrlsCount = urls.filter((url) => url.trim() !== '').length;
  const isValid = validUrlsCount >= 2 && validUrlsCount <= 4;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bottom-20 right-4 z-10">
        <div
          className={`w-80 rounded-2xl p-4 shadow-2xl ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-[#2B2B2B]/80 backdrop-blur-md'
                : 'bg-white/80 backdrop-blur-md'
              : isDarkMode
              ? 'bg-[#121212] text-white ring-1 ring-white/10'
              : 'bg-white text-gray-900 ring-1 ring-gray-200'
          }`}
        >
          <h4 className="text-sm font-semibold mb-3">Add Halite Folder</h4>
          <p
            className={`text-xs mb-3 ${
              isDarkMode ? 'text-white/70' : 'text-gray-600'
            }`}
          >
            Add 2-4 URLs to create a folder that opens all sites
          </p>
          <div className="space-y-2 mb-3">
            <input
              type="text"
              placeholder="Folder name (optional)"
              value={folderName}
              onChange={(e) => onFolderNameChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${
                isDarkMode
                  ? 'bg-white/5 ring-white/10 placeholder-gray-400'
                  : 'bg-white ring-gray-200 placeholder-gray-500'
              }`}
            />
          </div>
          <div className="space-y-2">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                type="text"
                placeholder={`URL ${index + 1} (e.g., github.com)`}
                value={urls[index] || ''}
                onChange={(e) => onUrlChange(index, e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${
                  isDarkMode
                    ? 'bg-white/5 ring-white/10 placeholder-gray-400'
                    : 'bg-white ring-gray-200 placeholder-gray-500'
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAddFolder}
              disabled={!isValid}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed text-gray-200'
              }`}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
