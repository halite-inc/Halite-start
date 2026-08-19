'use client';

import React, { useState, useEffect } from 'react';
import { App } from '../dashboard/types';
import { getFaviconUrl } from '../../lib/favicon';

interface QuickAddModalProps {
  isOpen: boolean;
  apps: App[];
  isDarkMode: boolean;
  glassmorphismEnabled?: boolean;
  onAddApp: (app: App) => void;
  onClose: () => void;
}

const popularAppsList = [
  { title: 'ChatGPT', url: 'chatgpt.com', category: 'AI' },
  { title: 'Claude', url: 'claude.ai', category: 'AI' },
  { title: 'Perplexity', url: 'perplexity.ai', category: 'AI' },
  { title: 'YouTube', url: 'youtube.com', category: 'Entertainment' },
  { title: 'Netflix', url: 'netflix.com', category: 'Entertainment' },
  { title: 'Spotify', url: 'spotify.com', category: 'Entertainment' },
  { title: 'Twitch', url: 'twitch.tv', category: 'Entertainment' },
  { title: 'GitHub', url: 'github.com', category: 'Development' },
  { title: 'GitLab', url: 'gitlab.com', category: 'Development' },
  { title: 'Figma', url: 'figma.com', category: 'Design' },
  { title: 'Notion', url: 'notion.so', category: 'Productivity' },
  { title: 'Twitter / X', url: 'twitter.com', category: 'Social' },
  { title: 'Reddit', url: 'reddit.com', category: 'Social' },
  { title: 'LinkedIn', url: 'linkedin.com', category: 'Social' },
  { title: 'Instagram', url: 'instagram.com', category: 'Social' },
  { title: 'Amazon', url: 'amazon.com', category: 'Shopping' },
  { title: 'eBay', url: 'ebay.com', category: 'Shopping' },
  { title: 'AliExpress', url: 'aliexpress.com', category: 'Shopping' },
  { title: 'Airbnb', url: 'airbnb.com', category: 'Travel' },
  { title: 'Booking.com', url: 'booking.com', category: 'Travel' },
  { title: 'IMDb', url: 'imdb.com', category: 'Entertainment' },
  { title: 'Trello', url: 'trello.com', category: 'Productivity' },
  { title: 'Slack', url: 'slack.com', category: 'Productivity' },
  { title: 'Zoom', url: 'zoom.us', category: 'Productivity' },
  { title: 'Dropbox', url: 'dropbox.com', category: 'Productivity' },
  { title: 'Adobe', url: 'adobe.com', category: 'Design' },
  { title: 'Canva', url: 'canva.com', category: 'Design' },
  { title: 'WhatsApp', url: 'whatsapp.com', category: 'Social' },
  { title: 'Outlook', url: 'outlook.live.com', category: 'Productivity' },
  { title: 'Binance', url: 'binance.com', category: 'Finance' },
  { title: 'TradingView', url: 'tradingview.com', category: 'Finance' },
  { title: 'Shopify', url: 'shopify.com', category: 'Business' },
  { title: 'WordPress', url: 'wordpress.com', category: 'Business' },
  { title: 'Stack Overflow', url: 'stackoverflow.com', category: 'Development' },
  { title: 'Medium', url: 'medium.com', category: 'News' },
  { title: 'Quora', url: 'quora.com', category: 'Social' },
];

export default function QuickAddModal({
  isOpen,
  apps,
  isDarkMode,
  glassmorphismEnabled = false,
  onAddApp,
  onClose,
}: QuickAddModalProps) {
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [titlePlaceholder, setTitlePlaceholder] = useState('App Name');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!urlInput || urlInput.length < 4) {
      setTitlePlaceholder('App Name');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(urlInput)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title) {
            setTitlePlaceholder(data.title);
          }
        }
      } catch {}
    }, 500);

    return () => clearTimeout(timer);
  }, [urlInput]);

  if (!isOpen) return null;

  const handleAddCustom = () => {
    const raw = urlInput.trim();
    if (!raw) return;
    const title = titleInput.trim() || titlePlaceholder;
    const normalizedHref = raw.startsWith('http') ? raw : `https://${raw}`;
    const icon = getFaviconUrl(normalizedHref);
    onAddApp({
      id: Date.now().toString(),
      title,
      href: normalizedHref,
      icon,
    });
    setTitleInput('');
    setUrlInput('');
    onClose();
  };

  const handleSelectSuggested = (site: { title: string; url: string }) => {
    const href = `https://${site.url}`;
    onAddApp({
      id: Date.now().toString(),
      title: site.title,
      href,
      icon: getFaviconUrl(href),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bottom-20 right-4 z-10 flex flex-col md:flex-row gap-4 items-end">
        {showSuggestions && (
          <div
            className={`w-80 md:w-96 max-h-[380px] rounded-3xl p-4 shadow-2xl overflow-y-auto custom-scrollbar transition-all duration-300 ${
              glassmorphismEnabled
                ? isDarkMode
                  ? 'bg-[#18181b]/80 backdrop-blur-xl border border-white/10'
                  : 'bg-white/80 backdrop-blur-xl border border-white/40'
                : isDarkMode
                ? 'bg-[#121212] text-white ring-1 ring-white/10'
                : 'bg-white text-gray-900 ring-1 ring-gray-200'
            }`}
          >
            <h4
              className={`text-sm font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Popular Applications
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {popularAppsList.map((site) => (
                <button
                  key={site.url}
                  type="button"
                  onClick={() => handleSelectSuggested(site)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 ${
                    isDarkMode
                      ? 'bg-white/5 hover:bg-white/10 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  } border border-transparent hover:border-gray-200 dark:hover:border-white/10 cursor-pointer`}
                >
                  <img
                    src={getFaviconUrl(`https://${site.url}`)}
                    alt=""
                    className="w-4 h-4 rounded flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="truncate flex-1 font-medium">
                    {site.title}
                  </span>
                  {apps.some((userApp) => userApp.href.includes(site.url)) && (
                    <svg
                      className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={`w-80 rounded-[28px] p-4 shadow-2xl transition-all duration-300 ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-[#18181b]/85 backdrop-blur-xl border border-white/10'
                : 'bg-white/85 backdrop-blur-xl border border-white/40'
              : isDarkMode
              ? 'bg-[#121212] text-white ring-1 ring-white/10'
              : 'bg-white text-gray-900 ring-1 ring-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              Add Favorite App
            </h4>
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`text-xs px-3 py-1 rounded-full ring-1 transition-colors font-medium cursor-pointer ${
                showSuggestions
                  ? 'bg-blue-500 text-white ring-blue-500 hover:bg-blue-600'
                  : isDarkMode
                  ? 'bg-white/5 text-gray-300 ring-white/10 hover:bg-white/10'
                  : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {showSuggestions ? 'Hide Popular' : 'Show Popular'}
            </button>
          </div>

          <div className="space-y-3">
            <div
              className={`p-2.5 rounded-xl flex items-center gap-3 ring-1 ${
                isDarkMode
                  ? 'bg-white/5 ring-white/10'
                  : 'bg-gray-50 ring-gray-200'
              }`}
            >
              <img
                src={
                  urlInput
                    ? getFaviconUrl(
                        urlInput.startsWith('http')
                          ? urlInput
                          : `https://${urlInput}`
                      )
                    : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
                }
                alt="Preview"
                className={`w-7 h-7 rounded-lg ${
                  isDarkMode ? 'bg-white/10' : 'bg-white shadow-sm'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  {titleInput || titlePlaceholder}
                </p>
                <p
                  className={`text-xs truncate ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {urlInput || 'URL Preview'}
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder={titlePlaceholder}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-sm outline-none ring-1 ${
                isDarkMode
                  ? 'bg-white/5 ring-white/10 text-gray-200 placeholder-gray-500'
                  : 'bg-white ring-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            <input
              type="text"
              placeholder="URL (e.g., github.com or https://github.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              className={`w-full px-3 py-2 rounded-xl text-sm outline-none ring-1 ${
                isDarkMode
                  ? 'bg-white/5 ring-white/10 text-gray-200 placeholder-gray-500'
                  : 'bg-white ring-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!urlInput.trim()}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer ${
                urlInput.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-500/40 text-gray-300 cursor-not-allowed'
              }`}
            >
              Add App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
