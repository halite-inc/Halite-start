import { useState, useEffect, useRef } from 'react';

interface App {
  id: string;
  title: string;
  href: string;
  icon?: string;
  type?: 'default' | 'halite';
  haliteUrls?: string[];
  haliteIcons?: string[];
  haliteName?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  apps: App[];
  isDarkMode: boolean;
  onOpenApp: (app: App) => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onOpenStatistics?: () => void;
}

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  category: 'app' | 'action' | 'setting';
}

export default function CommandPalette({
  isOpen,
  onClose,
  apps,
  isDarkMode,
  onOpenApp,
  onOpenSettings,
  onToggleTheme,
  onOpenStatistics,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build commands list
  const commands: Command[] = [
    // Actions
    {
      id: 'open-settings',
      title: 'Open Settings',
      subtitle: 'Customize your dashboard',
      icon: '⚙️',
      action: () => {
        onOpenSettings();
        onClose();
      },
      category: 'action',
    },
    {
      id: 'view-statistics',
      title: 'View Statistics',
      subtitle: 'See your app usage and time tracking',
      icon: '📊',
      action: () => {
        onOpenStatistics?.();
        onClose();
      },
      category: 'action',
    },
    {
      id: 'toggle-theme',
      title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle theme',
      icon: isDarkMode ? '☀️' : '🌙',
      action: () => {
        onToggleTheme();
        onClose();
      },
      category: 'action',
    },
    // Apps
    ...apps.map((app) => ({
      id: `app-${app.id}`,
      title: app.title,
      subtitle: app.href,
      icon: '🔗',
      action: () => {
        onOpenApp(app);
        onClose();
      },
      category: 'app' as const,
    })),
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Command Palette */}
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode
            ? 'bg-[#1a1a1a] ring-1 ring-white/10'
            : 'bg-white ring-1 ring-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${
          isDarkMode ? 'border-white/10' : 'border-gray-200'
        }`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, actions, settings..."
            className={`flex-1 bg-transparent border-0 outline-none text-base ${
              isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          <kbd className={`px-2 py-1 text-xs font-semibold rounded ${
            isDarkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto custom-scrollbar"
        >
          {filteredCommands.length === 0 ? (
            <div className={`px-4 py-8 text-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => command.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    index === selectedIndex
                      ? isDarkMode
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDarkMode
                        ? 'text-white hover:bg-white/5'
                        : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{command.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{command.title}</div>
                    {command.subtitle && (
                      <div className={`text-xs ${
                        index === selectedIndex
                          ? isDarkMode ? 'text-blue-300' : 'text-blue-500'
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {command.subtitle}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDarkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {command.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-2 border-t flex items-center justify-between text-xs ${
          isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>↑</kbd>
              <kbd className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>↵</kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <span>{filteredCommands.length} results</span>
        </div>
      </div>
    </div>
  );
}
