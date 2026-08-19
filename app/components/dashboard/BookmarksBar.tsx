'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark } from './types';
import { getFaviconUrl } from '../../lib/favicon';

interface BookmarksBarProps {
  showBookmarks: boolean;
  bookmarks: Bookmark[];
  onSetBookmarks: (bookmarks: Bookmark[] | ((prev: Bookmark[]) => Bookmark[])) => void;
  showBookmarksTitle?: boolean;
  centerBookmarksGroup?: boolean;
  bookmarkStyle?: 'cards' | 'chips' | 'list' | 'minimal' | 'compact' | 'modern';
  isDarkMode: boolean;
  isEditModalOpen: boolean;
  glassmorphismEnabled?: boolean;
}

export default function BookmarksBar({
  showBookmarks,
  bookmarks,
  onSetBookmarks,
  showBookmarksTitle = false,
  centerBookmarksGroup = false,
  bookmarkStyle = 'chips',
  isDarkMode,
  isEditModalOpen,
  glassmorphismEnabled = false,
}: BookmarksBarProps) {
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [bookmarkTitleInput, setBookmarkTitleInput] = useState('');
  const [bookmarkUrlInput, setBookmarkUrlInput] = useState('');
  const [bookmarkTitlePlaceholder, setBookmarkTitlePlaceholder] = useState('Title');

  // Auto-fetch title when URL input changes
  useEffect(() => {
    if (!bookmarkUrlInput || bookmarkUrlInput.length < 4) {
      setBookmarkTitlePlaceholder('Title');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(bookmarkUrlInput)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title) {
            setBookmarkTitlePlaceholder(data.title);
          }
        }
      } catch {}
    }, 500);

    return () => clearTimeout(timer);
  }, [bookmarkUrlInput]);

  if (!showBookmarks) return null;

  const handleRemoveBookmark = (id: string) => {
    onSetBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddBookmark = () => {
    const t =
      bookmarkTitleInput.trim() ||
      (bookmarkTitlePlaceholder !== 'Title' ? bookmarkTitlePlaceholder : '');
    const raw = bookmarkUrlInput.trim();
    if (!t || !raw) return;
    const href = raw.startsWith('http') ? raw : `https://${raw}`;
    const icon = getFaviconUrl(href);
    onSetBookmarks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: t, href, icon },
    ]);
    setIsAddBookmarkOpen(false);
    setBookmarkTitleInput('');
    setBookmarkUrlInput('');
  };

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center gap-3">
        {(showBookmarksTitle || isEditModalOpen) && (
          <button
            type="button"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ring-1 ${
              isDarkMode
                ? 'bg-white/10 text-white ring-white/15 hover:bg-white/15'
                : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => {
              setBookmarkTitleInput('');
              setBookmarkUrlInput('');
              setIsAddBookmarkOpen(true);
            }}
          >
            +
          </button>
        )}
        {showBookmarksTitle && (
          <h3
            className={`${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } text-sm font-semibold tracking-wide`}
          >
            Bookmarks
          </h3>
        )}
      </div>

      {bookmarks.length === 0 ? (
        showBookmarksTitle ? (
          <div
            className={`${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-xs`}
          >
            No bookmarks yet. Click + to create one.
          </div>
        ) : null
      ) : (
        <div className={`${centerBookmarksGroup ? 'flex justify-center' : ''}`}>
          <div
            className={`${
              bookmarkStyle === 'chips'
                ? 'flex flex-wrap gap-2'
                : bookmarkStyle === 'list'
                ? 'space-y-2'
                : bookmarkStyle === 'minimal'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'
                : bookmarkStyle === 'compact'
                ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5'
                : bookmarkStyle === 'modern'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3'
            }`}
          >
            {bookmarks.map((bm) =>
              bookmarkStyle === 'chips' ? (
                <a
                  key={bm.id}
                  href={bm.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-white/10 text-white hover:bg-white/15'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                >
                  {bm.icon ? (
                    <img
                      src={bm.icon}
                      alt="icon"
                      className="w-3.5 h-3.5 rounded"
                    />
                  ) : (
                    <div
                      className={`${
                        isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                      } w-3.5 h-3.5 rounded`}
                    />
                  )}
                  <span className="truncate max-w-[160px]">{bm.title}</span>
                  {isEditModalOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bm.id);
                      }}
                      className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center ${
                        isDarkMode
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </a>
              ) : bookmarkStyle === 'list' ? (
                <a
                  key={bm.id}
                  href={bm.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] ${
                    glassmorphismEnabled
                      ? isDarkMode
                        ? 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10'
                        : 'bg-white/50 ring-1 ring-white/30 hover:bg-white/70'
                      : isDarkMode
                      ? 'bg-[#0a0a0a] ring-1 ring-white/5 hover:bg-[#111]'
                      : 'bg-gray-50 ring-1 ring-gray-100 hover:bg-white'
                  } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                >
                  {bm.icon ? (
                    <img
                      src={bm.icon}
                      alt="icon"
                      className="w-5 h-5 rounded flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`${
                        isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                      } w-5 h-5 rounded flex-shrink-0`}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {bm.title}
                    </div>
                    <div
                      className={`text-xs truncate ${
                        isDarkMode ? 'text-white/60' : 'text-gray-500'
                      }`}
                    >
                      {bm.href.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                  {isEditModalOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bm.id);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDarkMode
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </a>
              ) : bookmarkStyle === 'minimal' ? (
                <a
                  key={bm.id}
                  href={bm.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative p-4 rounded-lg border transition-all hover:shadow-sm ${
                    isDarkMode
                      ? 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5'
                      : 'bg-transparent border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {bm.icon ? (
                      <img
                        src={bm.icon}
                        alt="icon"
                        className="w-4 h-4 rounded"
                      />
                    ) : (
                      <div
                        className={`${
                          isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                        } w-4 h-4 rounded`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {bm.title}
                      </div>
                      <div
                        className={`text-xs truncate ${
                          isDarkMode ? 'text-white/50' : 'text-gray-400'
                        }`}
                      >
                        {bm.href.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                  </div>
                  {isEditModalOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bm.id);
                      }}
                      className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        isDarkMode
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </a>
              ) : bookmarkStyle === 'compact' ? (
                <a
                  key={bm.id}
                  href={bm.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] ${
                    glassmorphismEnabled
                      ? isDarkMode
                        ? 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10'
                        : 'bg-white/50 ring-1 ring-white/30 hover:bg-white/70'
                      : isDarkMode
                      ? 'bg-[#0a0a0a] ring-1 ring-white/5 hover:bg-[#111]'
                      : 'bg-gray-50 ring-1 ring-gray-100 hover:bg-white'
                  } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    {bm.icon ? (
                      <img
                        src={bm.icon}
                        alt="icon"
                        className="w-6 h-6 rounded"
                      />
                    ) : (
                      <div
                        className={`${
                          isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                        } w-6 h-6 rounded`}
                      />
                    )}
                    <div
                      className={`text-[10px] font-medium text-center leading-tight ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{ lineHeight: '1.2' }}
                    >
                      {bm.title.length > 12
                        ? bm.title.substring(0, 12) + '...'
                        : bm.title}
                    </div>
                  </div>
                  {isEditModalOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bm.id);
                      }}
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isDarkMode
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-red-400 text-white hover:bg-red-500'
                      }`}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </a>
              ) : bookmarkStyle === 'modern' ? (
                <a
                  key={bm.id}
                  href={bm.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/20 hover:from-white/15 hover:to-white/10 hover:ring-white/30'
                      : 'bg-gradient-to-br from-white to-gray-50 ring-1 ring-gray-200 hover:from-blue-50 hover:to-white hover:ring-blue-200'
                  } shadow-lg hover:shadow-xl ${
                    isEditModalOpen ? 'ios-jiggle' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bm.icon ? (
                      <div className="relative">
                        <img
                          src={bm.icon}
                          alt="icon"
                          className="w-5 h-5 rounded-lg"
                        />
                        <div
                          className={`absolute inset-0 rounded-lg ${
                            isDarkMode ? 'bg-white/10' : 'bg-blue-500/10'
                          } opacity-0 group-hover:opacity-100 transition-opacity`}
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-lg ${
                          isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {bm.title}
                      </div>
                      <div
                        className={`text-xs truncate ${
                          isDarkMode ? 'text-white/60' : 'text-gray-500'
                        }`}
                      >
                        {bm.href.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-transparent via-white/5 to-transparent'
                        : 'bg-gradient-to-r from-transparent via-blue-500/5 to-transparent'
                    }`}
                  />
                  {isEditModalOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bm.id);
                      }}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isDarkMode
                          ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600'
                      }`}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </a>
              ) : (
                <a
                  key={bm.id}
                  href={bm.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    glassmorphismEnabled
                      ? isDarkMode
                        ? 'bg-white/10 ring-1 ring-white/15 hover:bg-white/15'
                        : 'bg-white/70 ring-1 ring-white/40 hover:bg-white'
                      : isDarkMode
                      ? 'bg-[#111] ring-1 ring-white/10 hover:bg-[#151515]'
                      : 'bg-white ring-1 ring-gray-200 hover:bg-gray-50'
                  } shadow-sm hover:shadow-md ${
                    isEditModalOpen ? 'ios-jiggle' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {bm.icon ? (
                      <img
                        src={bm.icon}
                        alt="icon"
                        className="w-4 h-4 rounded"
                      />
                    ) : (
                      <div
                        className={`${
                          isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                        } w-4 h-4 rounded`}
                      />
                    )}
                    <div
                      className={`truncate text-xs font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {bm.title}
                    </div>
                  </div>
                  <div
                    className={`mt-2 truncate text-[10px] ${
                      isDarkMode ? 'text-white/60' : 'text-gray-500'
                    }`}
                  >
                    {bm.href.replace(/^https?:\/\//, '')}
                  </div>
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: isDarkMode
                        ? 'inset 0 0 0 1px rgba(255,255,255,0.08)'
                        : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                    }}
                  />
                  {isEditModalOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bm.id);
                      }}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        isDarkMode
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Remove bookmark"
                    >
                      ×
                    </button>
                  )}
                </a>
              )
            )}
          </div>
        </div>
      )}

      {/* Add Bookmark Modal */}
      {isAddBookmarkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsAddBookmarkOpen(false)}
          />
          <div
            className={`relative z-10 w-[92%] max-w-sm rounded-2xl p-4 shadow-2xl ring-1 ${
              isDarkMode
                ? 'bg-[#121212] text-white ring-white/10'
                : 'bg-white text-gray-900 ring-gray-200'
            }`}
          >
            <h4 className="text-sm font-semibold mb-3">Add Bookmark</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder={bookmarkTitlePlaceholder}
                value={bookmarkTitleInput}
                onChange={(e) => setBookmarkTitleInput(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${
                  isDarkMode
                    ? 'bg-white/5 ring-white/10 placeholder-gray-400'
                    : 'bg-white ring-gray-200 placeholder-gray-500'
                }`}
              />
              <input
                type="text"
                placeholder="URL (e.g., github.com or https://github.com)"
                value={bookmarkUrlInput}
                onChange={(e) => setBookmarkUrlInput(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${
                  isDarkMode
                    ? 'bg-white/5 ring-white/10 placeholder-gray-400'
                    : 'bg-white ring-gray-200 placeholder-gray-500'
                }`}
              />
              <div className="flex justify-start px-0.5">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setBookmarkUrlInput(text.trim());
                      }
                    } catch (err) {
                      console.error('Failed to read clipboard: ', err);
                    }
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  📋 Paste from clipboard
                </button>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddBookmarkOpen(false)}
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
                onClick={handleAddBookmark}
                className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
