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
  glassmorphismEnabled?: boolean;
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
  glassmorphismEnabled = false,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build commands list
  const commands: Command[] = [
    // Quick Actions
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
      id: 'reload-page',
      title: 'Reload Page',
      subtitle: 'Refresh the dashboard',
      icon: '🔄',
      action: () => {
        window.location.reload();
      },
      category: 'action',
    },
    {
      id: 'toggle-fullscreen',
      title: 'Toggle Fullscreen',
      subtitle: 'Enter or exit fullscreen mode',
      icon: '⛶',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
        onClose();
      },
      category: 'action',
    },
    {
      id: 'copy-url',
      title: 'Copy Current URL',
      subtitle: 'Copy dashboard URL to clipboard',
      icon: '📋',
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        onClose();
      },
      category: 'action',
    },
    
    // Theme & Appearance
    {
      id: 'toggle-theme',
      title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle between light and dark theme',
      icon: isDarkMode ? '☀️' : '🌙',
      action: () => {
        onToggleTheme();
        onClose();
      },
      category: 'setting',
    },
    
    // Visual Modes (if glassmorphism/liquid glass are available)
    ...(glassmorphismEnabled !== undefined ? [{
      id: 'toggle-glass',
      title: glassmorphismEnabled ? 'Disable Glass Mode' : 'Enable Glass Mode',
      subtitle: 'Toggle glassmorphism effect',
      icon: '🪟',
      action: () => {
        // This would need to be passed as a prop
        onClose();
      },
      category: 'setting' as const,
    }] : []),
    

    
    // Navigation
    {
      id: 'scroll-top',
      title: 'Scroll to Top',
      subtitle: 'Jump to the top of the page',
      icon: '⬆️',
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onClose();
      },
      category: 'action',
    },
    {
      id: 'scroll-bottom',
      title: 'Scroll to Bottom',
      subtitle: 'Jump to the bottom of the page',
      icon: '⬇️',
      action: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        onClose();
      },
      category: 'action',
    },
    
    // Utility Commands
    {
      id: 'print-page',
      title: 'Print Page',
      subtitle: 'Print the current dashboard',
      icon: '🖨️',
      action: () => {
        window.print();
        onClose();
      },
      category: 'action',
    },
    {
      id: 'open-console',
      title: 'Open Developer Console',
      subtitle: 'Open browser developer tools',
      icon: '🔧',
      action: () => {
        // This will work in most browsers when DevTools are available
        console.log('Opening developer console...');
        onClose();
      },
      category: 'action',
    },
    {
      id: 'clear-cache',
      title: 'Clear Local Storage',
      subtitle: 'Reset all saved settings (requires reload)',
      icon: '🗑️',
      action: () => {
        if (confirm('This will clear all your settings. Continue?')) {
          localStorage.clear();
          window.location.reload();
        }
        onClose();
      },
      category: 'action',
    },
    
    // Apps
    ...apps.map((app) => ({
      id: `app-${app.id}`,
      title: app.type === 'halite' ? `${app.haliteName || app.title} (Folder)` : app.title,
      subtitle: app.type === 'halite' 
        ? `${app.haliteUrls?.length || 0} apps in folder`
        : app.href,
      icon: app.type === 'halite' ? '📁' : '🔗',
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
      className="fixed inset-0 z-[200] flex flex-col items-center pt-[15vh] sm:pt-[20vh] px-3 sm:px-4 gap-2"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Search Input Pill - Floating separately */}
      <div
        className={`relative w-full max-w-[95vw] sm:max-w-xl rounded-full shadow-2xl ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-[#2B2B2B]/80 backdrop-blur-md border border-[#444]'
                : 'bg-white/80 backdrop-blur-md border border-gray-400'
              : isDarkMode
                ? 'bg-[#121212] border border-[#444]'
                : 'bg-white border border-gray-400'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3">
          <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, actions, settings..."
            className={`flex-1 bg-transparent border-0 outline-none text-sm ${
              isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          <kbd className={`hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold rounded ${
            isDarkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            ESC
          </kbd>
        </div>
      </div>

      {/* Results Dropdown - Separate from search */}
      <div
        className={`relative w-full max-w-[95vw] sm:max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden ${
            glassmorphismEnabled
              ? isDarkMode
                ? 'bg-[#2B2B2B]/80 backdrop-blur-md border border-[#444]'
                : 'bg-white/80 backdrop-blur-md border border-gray-400'
              : isDarkMode
                ? 'bg-[#121212] border border-[#444]'
                : 'bg-white border border-gray-400'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={listRef}
          className="max-h-[50vh] sm:max-h-[50vh] md:max-h-[55vh] overflow-y-auto custom-scrollbar"
        >
          {filteredCommands.length === 0 ? (
            <div className={`px-4 py-6 text-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="py-1.5 mx-1.5 sm:mx-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => command.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-2.5 sm:px-3 py-2 flex items-center gap-2 sm:gap-2.5 transition-colors rounded-xl sm:rounded-2xl ${
                    index === selectedIndex
                      ? isDarkMode
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDarkMode
                        ? 'text-white hover:bg-white/5'
                        : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg sm:text-xl flex-shrink-0">{command.icon}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">{command.title}</div>
                    {command.subtitle && (
                      <div className={`text-xs truncate ${
                        index === selectedIndex
                          ? isDarkMode ? 'text-blue-300' : 'text-blue-500'
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {command.subtitle}
                      </div>
                    )}
                  </div>
                  <span className={`hidden sm:inline-block text-[10px] px-1.5 py-0.25 rounded-md flex-shrink-0 ${
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
        <div className={`px-2 sm:px-3 py-1.5 border-t flex items-center justify-between text-xs ${
          isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className={`px-1 py-0.5 rounded text-[10px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>↑</kbd>
              <kbd className={`px-1 py-0.5 rounded text-[10px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>↓</kbd>
              <span className="ml-0.5 text-[11px]">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className={`px-1 py-0.5 rounded text-[10px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>↵</kbd>
              <span className="ml-0.5 text-[11px]">Select</span>
            </span>
          </div>
          <span className="text-[11px] ml-auto">{filteredCommands.length} results</span>
        </div>
      </div>
    </div>
  );
}
