'use client';

import React from 'react';

interface Bookmark {
  id: string;
  title: string;
  href: string;
  icon?: string;
}

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
  onAddBookmarkClick: () => void;
  isDarkMode: boolean;
  glassmorphismEnabled: boolean;
}

export default function RightSidebar({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onAddBookmarkClick,
  isDarkMode,
  glassmorphismEnabled
}: RightSidebarProps) {
  // Close on Escape when open
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-4 right-4 bottom-20 w-96 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'} ${
          glassmorphismEnabled
            ? (isDarkMode ? 'bg-[#121212]/80 backdrop-blur-xl border border-white/10' : 'bg-white/80 backdrop-blur-xl border border-black/5')
            : (isDarkMode ? 'bg-[#121212] border border-white/10' : 'bg-white border border-gray-200')
        }`}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bookmarks</h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 py-2 custom-scrollbar space-y-1.5">
          {bookmarks.length === 0 ? (
            <div className={`text-center mt-8 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No bookmarks yet. Add one!
            </div>
          ) : (
            bookmarks.map(bm => (
              <div key={bm.id} className={`flex items-center gap-2.5 p-2 px-3 rounded-lg transition-colors border group ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:bg-gray-50 hover:shadow-sm'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                  {bm.icon ? (
                    <img src={bm.icon} alt="" className="w-4.5 h-4.5 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-[10px]">🔗</span>
                  )}
                </div>
                <a href={bm.href} target="_blank" rel="noopener noreferrer" className={`flex-1 min-w-0 font-medium text-sm truncate ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}>
                  {bm.title}
                </a>
                <button
                  onClick={() => onRemoveBookmark(bm.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 pt-2 flex justify-start">
          <button
            onClick={onAddBookmarkClick}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg"
            title="Add Bookmark"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}
