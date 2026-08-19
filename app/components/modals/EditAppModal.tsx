'use client';

import React from 'react';
import { App } from '../dashboard/types';

interface EditAppModalProps {
  app: App | null;
  title: string;
  url: string;
  isDarkMode: boolean;
  onTitleChange: (title: string) => void;
  onUrlChange: (url: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditAppModal({
  app,
  title,
  url,
  isDarkMode,
  onTitleChange,
  onUrlChange,
  onSave,
  onCancel,
}: EditAppModalProps) {
  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className={`relative z-10 w-[92%] max-w-sm rounded-2xl p-4 shadow-2xl ring-1 ${
          isDarkMode
            ? 'bg-[#121212] text-white ring-white/10'
            : 'bg-white text-gray-900 ring-gray-200'
        }`}
      >
        <h4 className="text-sm font-semibold mb-3">Edit App</h4>
        <div className="space-y-3">
          <div>
            <label
              className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Title
            </label>
            <input
              type="text"
              placeholder="App title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none ring-1 ${
                isDarkMode
                  ? 'bg-white/5 ring-white/10 placeholder-gray-400 text-white'
                  : 'bg-white ring-gray-200 placeholder-gray-500 text-gray-900'
              }`}
              autoFocus
            />
          </div>
          <div>
            <label
              className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              URL
            </label>
            <input
              type="text"
              placeholder="URL (e.g., example.com or https://example.com)"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none ring-1 ${
                isDarkMode
                  ? 'bg-white/5 ring-white/10 placeholder-gray-400 text-white'
                  : 'bg-white ring-gray-200 placeholder-gray-500 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
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
            onClick={onSave}
            disabled={!title.trim() || !url.trim()}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              title.trim() && url.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                : isDarkMode
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gray-400 cursor-not-allowed text-gray-200'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
