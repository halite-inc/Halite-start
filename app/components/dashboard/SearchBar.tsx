'use client';

import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  showSearchBar: boolean;
  compactSearchBar?: boolean;
  searchBarWidth?: 'narrow' | 'medium' | 'wide';
  glassmorphismEnabled?: boolean;
  isDarkMode: boolean;
  onSearch: (query: string) => void;
}

export default function SearchBar({
  showSearchBar,
  compactSearchBar = false,
  searchBarWidth = 'medium',
  glassmorphismEnabled = false,
  isDarkMode,
  onSearch,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Check if user is searching YouTube directly (e.g. prefix `yt:` or `!yt`)
  const youtubeSearchMode =
    searchTerm.toLowerCase().startsWith('yt:') ||
    searchTerm.toLowerCase().startsWith('!yt');

  // Debounced search suggestions fetching from /api/suggest
  useEffect(() => {
    if (!showSearchBar) return;
    const term = searchTerm.trim();
    if (term.length === 0) {
      setSearchSuggestions([]);
      setIsSuggestOpen(false);
      setHighlightIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const cleanTerm = term.replace(/^(yt:|!yt\s*)/i, '').trim();
        if (!cleanTerm) return;
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(cleanTerm)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            setSearchSuggestions(data.suggestions);
            setIsSuggestOpen(true);
            setHighlightIndex(-1);
          } else {
            setSearchSuggestions([]);
            setIsSuggestOpen(false);
          }
        }
      } catch {
        setSearchSuggestions([]);
        setIsSuggestOpen(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, showSearchBar]);

  if (!showSearchBar) return null;

  const handleSubmit = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setIsSuggestOpen(false);
    onSearch(q);
  };

  return (
    <div
      className={`mt-6 mb-6 relative rounded-2xl shadow-lg ${
        compactSearchBar ? 'p-1' : 'p-1.5 sm:p-2'
      } ${
        searchBarWidth === 'narrow'
          ? 'max-w-md mx-auto'
          : searchBarWidth === 'wide'
          ? 'max-w-4xl mx-auto'
          : 'max-w-2xl mx-auto'
      } ${
        glassmorphismEnabled
          ? isDarkMode
            ? 'bg-black/20 backdrop-blur-md ring-1 ring-white/10'
            : 'bg-white/40 backdrop-blur-md ring-1 ring-white/30'
          : isDarkMode
          ? 'bg-[#0f1115] ring-1 ring-white/10'
          : 'bg-white ring-1 ring-gray-200'
      }`}
    >
      <div className="flex items-stretch gap-2">
        {youtubeSearchMode && (
          <div className="flex items-center px-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
        )}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() =>
              searchSuggestions.length > 0 && setIsSuggestOpen(true)
            }
            onBlur={() => setTimeout(() => setIsSuggestOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const chosen =
                  highlightIndex >= 0
                    ? searchSuggestions[highlightIndex]
                    : searchTerm;
                handleSubmit(chosen);
                return;
              }
              if (!isSuggestOpen || searchSuggestions.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightIndex(
                  (prev) => (prev + 1) % searchSuggestions.length
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightIndex(
                  (prev) =>
                    (prev - 1 + searchSuggestions.length) %
                    searchSuggestions.length
                );
              }
            }}
            placeholder={
              youtubeSearchMode ? 'Search YouTube...' : 'Search apps...'
            }
            className={`w-full ${
              compactSearchBar ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-xs'
            } rounded-full border-0 bg-transparent focus:outline-none focus:ring-0 transition-none ${
              isDarkMode
                ? 'text-white placeholder-gray-400'
                : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <button
          type="button"
          onClick={() =>
            handleSubmit(
              highlightIndex >= 0
                ? searchSuggestions[highlightIndex]
                : searchTerm
            )
          }
          className={`${
            compactSearchBar ? 'px-2 py-1' : 'px-3 py-1.5'
          } rounded-full text-sm font-semibold bg-transparent ring-0 transition-none ${
            isDarkMode ? 'text-white/80' : 'text-gray-800/80'
          }`}
          title="Search"
          aria-label="Search"
        >
          <svg
            className={`${compactSearchBar ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </button>
      </div>

      {isSuggestOpen && searchSuggestions.length > 0 && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 z-50 rounded-2xl shadow-xl overflow-hidden ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-black/25 backdrop-blur-[28px] backdrop-saturate-200 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                : 'bg-white/36 backdrop-blur-[28px] backdrop-saturate-200 ring-1 ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
              : isDarkMode
              ? 'bg-[#0f1115] ring-1 ring-white/10'
              : 'bg-white ring-1 ring-gray-200'
          }`}
        >
          {searchSuggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setSearchTerm(s);
                setIsSuggestOpen(false);
                handleSubmit(s);
              }}
              role="option"
              aria-selected={i === highlightIndex}
              aria-label={s}
              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors duration-150 outline-none ${
                isDarkMode
                  ? 'text-white font-medium hover:bg-white/10'
                  : 'text-gray-900 font-medium hover:bg-gray-100'
              } ${
                i === highlightIndex
                  ? isDarkMode
                    ? 'bg-white/10 ring-1 ring-white/20'
                    : 'bg-gray-100 ring-1 ring-gray-200'
                  : 'ring-0'
              } focus-visible:ring-2 focus-visible:ring-blue-500/40`}
              title={s}
            >
              <span className="truncate block">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
