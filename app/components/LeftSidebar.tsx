'use client';

import { useState, useEffect, useRef } from 'react';
import { saveImageBlob, deleteImageBlob } from '../lib/idb';

interface App {
  id: string;
  title: string;
  href: string;
  icon?: string;
}

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes' | 'spacer' | 'photo' | 'fidget-spinner';
  title: string;
}

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apps: App[];
  onAddApp: (app: App) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  showAppTitles: boolean;
  showSearchBar?: boolean;
  onToggleShowAppTitles: () => void;
  onToggleSearchBar?: () => void;
  backgroundImage: string;
  onSetBackgroundImage: (url: string) => void;
  glassmorphismEnabled: boolean;
  onToggleGlassmorphism: () => void;
  liquidGlassEnabled: boolean;
  onToggleLiquidGlass: () => void;
  
  normalModeEnabled: boolean;
  onToggleNormalMode: () => void;
  fullRoundedIconsEnabled?: boolean;
  onToggleFullRoundedIcons?: () => void;
  appTitleColor: 'auto' | 'black' | 'white';
  onSetAppTitleColor: (color: 'auto' | 'black' | 'white') => void;
  widgetTextColor: 'auto' | 'black' | 'white';
  onSetWidgetTextColor: (color: 'auto' | 'black' | 'white') => void;
  addWidget: (type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes' | 'spacer' | 'photo' | 'fidget-spinner') => void;
  onResetSettings: () => void;
  autofulIconsEnabled: boolean;
  onToggleAutofulIcons: () => void;
  hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow';
  onSetHoverAnimationStyle: (style: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow') => void;
  animateIconsEnabled: boolean;
  onToggleAnimateIcons: () => void;
  animateWidgetsEnabled: boolean;
  onToggleAnimateWidgets: () => void;
  centerAppsGroup?: boolean;
  onToggleCenterAppsGroup?: () => void;
  centerWidgetsGroup?: boolean;
  onToggleCenterWidgetsGroup?: () => void;
  appGroupMarginTop: number;
  onSetAppGroupMarginTop: (value: number) => void;
  showBookmarks?: boolean;
  onToggleBookmarks?: () => void;
  bookmarkStyle?: 'cards' | 'chips' | 'list' | 'minimal' | 'compact' | 'modern';
  onSetBookmarkStyle?: (style: 'cards' | 'chips' | 'list' | 'minimal' | 'compact' | 'modern') => void;
  showBookmarksTitle?: boolean;
  onToggleBookmarksTitle?: () => void;
  centerBookmarksGroup?: boolean;
  onToggleCenterBookmarksGroup?: () => void;
  floatingModeEnabled?: boolean;
  onToggleFloatingMode?: () => void;
  onAddFloatingNote?: () => void;
  liquidReflectionColor: string;
  onSetLiquidReflectionColor: (color: string) => void;
  showBookmarksParagraph?: boolean;
  onToggleBookmarksParagraph?: () => void;
  showTopTime?: boolean;
  onToggleTopTime?: () => void;
}

export default function LeftSidebar({ 
  isOpen, 
  onClose, 
  apps, 
  onAddApp, 
  isDarkMode, 
  onToggleTheme, 
  showAppTitles, 
  showSearchBar,
  onToggleShowAppTitles, 
  onToggleSearchBar,
  backgroundImage, 
  onSetBackgroundImage, 
  glassmorphismEnabled, 
  onToggleGlassmorphism, 
  liquidGlassEnabled,
  onToggleLiquidGlass,
  
  normalModeEnabled,
  onToggleNormalMode,
  fullRoundedIconsEnabled,
  onToggleFullRoundedIcons,
  appTitleColor, 
  onSetAppTitleColor, 
  widgetTextColor, 
  onSetWidgetTextColor,
  addWidget,
  onResetSettings,
  autofulIconsEnabled,
  onToggleAutofulIcons,
  hoverAnimationStyle,
  onSetHoverAnimationStyle,
  animateIconsEnabled,
  onToggleAnimateIcons,
  animateWidgetsEnabled,
  onToggleAnimateWidgets,
  centerAppsGroup,
  onToggleCenterAppsGroup,
  centerWidgetsGroup,
  onToggleCenterWidgetsGroup,
  appGroupMarginTop,
  onSetAppGroupMarginTop,
  showBookmarks,
  onToggleBookmarks,
  bookmarkStyle,
  onSetBookmarkStyle,
  showBookmarksTitle,
  onToggleBookmarksTitle,
  centerBookmarksGroup,
  onToggleCenterBookmarksGroup,
  floatingModeEnabled,
  onToggleFloatingMode,
  onAddFloatingNote,
  liquidReflectionColor,
  onSetLiquidReflectionColor,
  showBookmarksParagraph,
  onToggleBookmarksParagraph,
  showTopTime,
  onToggleTopTime,
}: LeftSidebarProps) {
  const [newApp, setNewApp] = useState({ title: '', href: '' });
  const [mounted, setMounted] = useState(false);
  const [isAppsExpanded, setIsAppsExpanded] = useState(false);
  const [newBackgroundImage, setNewBackgroundImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);

  // Single-open accordion for sections
  const [openSection, setOpenSection] = useState<'widgets' | 'preferences' | 'background' | 'addApp' | 'advanced' | null>('preferences');
  const [isHoverDropdownOpen, setIsHoverDropdownOpen] = useState(false);

  // Removed top tabs; sections are independent toggles now

  const renderHoverIcon = (style: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow') => {
    const common = 'w-3.5 h-3.5';
    switch (style) {
      case 'scale':
        // Four corners implying scale
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 10V4h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 14v6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 20h6v-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'tilt':
        // Rotated square
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="7" y="7" width="10" height="10" transform="rotate(15 12 12)" />
          </svg>
        );
      case 'skew':
        // Skewed parallelogram
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="6,8 18,6 18,16 6,18" />
          </svg>
        );
      case 'spin':
        // Circular arrow
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5a7 7 0 017 7" strokeLinecap="round" />
            <path d="M19 5v6h-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19a7 7 0 01-7-7" strokeLinecap="round" />
          </svg>
        );
      case 'bounce':
        // Up-down arrow
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v8" strokeLinecap="round" />
            <path d="M9 9l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 20v-8" strokeLinecap="round" />
            <path d="M9 15l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'pulse':
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="12" r="6" opacity="0.5" />
          </svg>
        );
      case 'float':
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 17V7" strokeLinecap="round" />
            <path d="M8 11l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'slide':
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 12h10" strokeLinecap="round" />
            <path d="M13 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'glow':
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4" />
          </svg>
        );
      default:
        return null;
    }
  };


  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape when open
  useEffect(() => {
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

  const handleAddApp = () => {
    if (newApp.title && newApp.href) {
      const app: App = {
        id: Date.now().toString(),
        title: newApp.title,
        href: newApp.href.startsWith('http') ? newApp.href : `https://${newApp.href}`,
      };
      onAddApp(app);
      setNewApp({ title: '', href: '' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddApp();
    }
  };

  const getImageDimensionsFromFile = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const dims = { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
        URL.revokeObjectURL(url);
        resolve(dims);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  const getImageDimensionsFromUrl = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBgError(null);

    if (!file.type.startsWith('image/')) {
      setBgError('Please upload a valid image file.');
      return;
    }
    const maxBytes = 15 * 1024 * 1024; // 15MB
    if (file.size > maxBytes) {
      setBgError('Image is too large. Please choose a file under 15MB.');
      return;
    }

    try {
      const { width, height } = await getImageDimensionsFromFile(file);
      if (width <= 0 || height <= 0) {
        setBgError('Could not read image dimensions. Please try a different file.');
        return;
      }
      if (width < height) {
        setBgError('Portrait images are not recommended for wallpapers. Please choose a landscape image.');
        return;
      }

      setSelectedFile(file);
      try {
        await saveImageBlob('backgroundImage', file);
        onSetBackgroundImage('idb:backgroundImage');
        setSelectedFile(null);
      } catch (e) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          if (result) {
            onSetBackgroundImage(result);
            setSelectedFile(null);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setBgError('Failed to load image. Please try a different file.');
    }
  };



  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return null;
  }

  // Derived styles based on active visual mode
  const isGlass = glassmorphismEnabled;
  const isLiquid = liquidGlassEnabled;
  const sectionHeaderClass = `w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
    isDarkMode
      ? 'bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10'
      : 'bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50 shadow-sm'
  }`;
  const panelClass = `${
    isDarkMode
      ? 'rounded-xl p-3 bg-[#121212]/85 ring-1 ring-white/10'
      : 'rounded-xl p-3 bg-white/90 ring-1 ring-gray-200'
  }`;
  const modeLabel = liquidGlassEnabled ? 'Liquid' : (glassmorphismEnabled ? 'Glass' : 'Normal');
  const modeBadgeClass = `${
    isLiquid
      ? 'bg-white/15 text-white ring-1 ring-white/20'
      : isGlass
        ? (isDarkMode ? 'bg-white/10 text-white ring-1 ring-white/15' : 'bg-white text-gray-800 ring-1 ring-white/40')
        : (isDarkMode ? 'bg-[#1e1e1e] text-white ring-1 ring-white/10' : 'bg-gray-100 text-gray-800 ring-1 ring-gray-200')
  } px-2 py-1 rounded-full text-xs font-medium`;

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${isDarkMode ? 'bg-black/50' : 'bg-black/30'}`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Left Sidebar */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className={`fixed left-4 top-4 bottom-4 w-96 sm:w-[420px] rounded-2xl overflow-hidden transform transition-all duration-300 ease-in-out z-50 ${
          glassmorphismEnabled
            ? isDarkMode 
              ? 'bg-[#2B2B2B]/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : liquidGlassEnabled
              ? 'liquid-elevated'
              : isDarkMode ? 'bg-[#2B2B2B] shadow-[0_8px_24px_rgba(0,0,0,0.35)]' : 'bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
        }`}
      >
          <div className="flex flex-col h-full">
          {/* Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-4 ${
            isDarkMode 
              ? 'border-b border-white/10' 
              : 'border-b border-gray-200'
          }`}>
            <h2 id="settings-title" className={`text-base font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Dashboard Settings
            </h2>
            <div className="flex items-center gap-3">
              <span className={`${modeBadgeClass} hidden sm:inline`} title={`Active mode: ${modeLabel}`}>{modeLabel}</span>
              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className={`px-2.5 py-1.5 rounded-lg transition-all duration-150 ring-1 ${
                  isDarkMode 
                    ? 'bg-white/5 ring-white/10 hover:bg-white/10 text-yellow-300' 
                    : 'bg-white ring-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              {/* Close Button */}
              <button
                onClick={onClose}
                className={`rounded-lg px-2.5 py-1.5 transition-all ring-1 ${
                  isDarkMode ? 'text-gray-300 hover:text-white ring-white/10 hover:bg-white/5' : 'text-gray-700 ring-gray-200 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* Widgets Section */}
            <button
              onClick={() => setOpenSection(openSection === 'widgets' ? null : 'widgets')}
              className={sectionHeaderClass}
              title="Widgets"
              aria-expanded={openSection === 'widgets'}
            >
              <span className="text-sm font-semibold">Widgets</span>
              <svg className={`w-4 h-4 transition-transform ${openSection === 'widgets' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'widgets' && (
            <div className={panelClass} >
              <h3 className={`text-lg font-medium mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Add Widgets
              </h3>
              <div className={`space-y-3 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Add custom widgets to your dashboard
                </p>


                
                {/* Widget Options with Previews */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Weather Widget Preview */}
                  <button
                    onClick={() => addWidget('weather')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold">22°</div>
                        <div className="text-sm">Sunny</div>
                      </div>
                      <p className="text-xs font-medium">Weather</p>
                    </div>
                  </button>
                  
                  {/* Clock Widget Preview */}
                  <button
                    onClick={() => addWidget('clock')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold">2:30</div>
                      </div>
                      <p className="text-xs font-medium">Clock</p>
                    </div>
                  </button>

                  {/* Calendar Widget Preview */}
                  <button
                    onClick={() => addWidget('calendar')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold">15</div>
                        <div className="text-sm">Mon</div>
                      </div>
                      <p className="text-xs font-medium">Calendar</p>
                    </div>
                  </button>

                  {/* Analog Clock Widget Preview */}
                  <button
                    onClick={() => addWidget('analog-clock')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="relative w-16 h-16">
                          <div className={`w-full h-full rounded-full border-2 flex items-center justify-center ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          }`}>
                            <div className={`w-0.5 h-1 rounded-full ${
                              isDarkMode ? 'bg-white' : 'bg-gray-800'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-medium">Analog</p>
                    </div>
                  </button>

                  {/* Water Tracker Widget Preview */}
                  <button
                    onClick={() => addWidget('water-tracker')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold text-blue-400">0ml</div>
                        <div className="text-sm">Water</div>
                      </div>
                      <p className="text-xs font-medium">Water</p>
                    </div>
                  </button>

                  {/* Quick Notes Widget Preview */}
                  <button
                    onClick={() => addWidget('quick-notes')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-amber-900 text-amber-100 border-amber-700' : 'bg-amber-800 text-amber-100 border-amber-600'
                      }`}>
                        <div className="text-xs text-center leading-tight">
                          <div className="text-amber-300/70">New note...</div>
                        </div>
                      </div>
                      <p className="text-xs font-medium">Quick Notes</p>
                    </div>
                  </button>

                  {/* Spacer Widget Preview */}
                  <button
                    onClick={() => addWidget('spacer')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-transparent border-dashed border-gray-600' : 'bg-transparent border-dashed border-gray-300'
                      }`}>
                        <div className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Spacer</div>
                      </div>
                      <p className="text-xs font-medium">Spacer</p>
                    </div>
                  </button>

                  {/* Photo Widget Preview */}
                  <button
                    onClick={() => addWidget('photo')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 7h2l2-3h10l2 3h2v12H3V7z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium">Photo</p>
                    </div>
                  </button>

                  {/* Fidget Spinner Widget Preview */}
                  <button
                    onClick={() => addWidget('fidget-spinner')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="4" r="1.5" />
                          <circle cx="20" cy="12" r="1.5" />
                          <circle cx="4" cy="12" r="1.5" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium">Fidget Spinner</p>
                    </div>
                  </button>


                {/* Sticky Note Widget Preview removed */}

                </div>
              </div>
            </div>
            )}

            {/* Preferences */}
            <button
              onClick={() => setOpenSection(openSection === 'preferences' ? null : 'preferences')}
              className={sectionHeaderClass}
              title="Preferences"
              aria-expanded={openSection === 'preferences'}
            >
              <span className="text-sm font-semibold">Preferences</span>
              <svg className={`w-4 h-4 transition-transform ${openSection === 'preferences' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'preferences' && (
            <div className={panelClass} >
              <h3 className="sr-only">Preferences</h3>
              <div className="space-y-5">
                <div className="space-y-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Bookmarks</h4>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
                      </svg>
                      Show Bookmarks
                    </label>
                    <button
                      onClick={() => onToggleBookmarks && onToggleBookmarks()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showBookmarks 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showBookmarks ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h8M7 17h6" />
                      </svg>
                      Show Bookmarks Title
                    </label>
                    <button
                      onClick={() => onToggleBookmarksTitle && onToggleBookmarksTitle()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showBookmarksTitle 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showBookmarksTitle ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h8M7 17h6" />
                      </svg>
                      Show Bookmarks Helper Text
                    </label>
                    <button
                      onClick={() => onToggleBookmarksParagraph && onToggleBookmarksParagraph()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showBookmarksParagraph 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showBookmarksParagraph ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                      </svg>
                      Center Bookmarks Group
                    </label>
                    <button
                      onClick={() => onToggleCenterBookmarksGroup && onToggleCenterBookmarksGroup()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        centerBookmarksGroup 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          centerBookmarksGroup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M4 12h12M6 17h6" />
                      </svg>
                      Bookmark Style
                    </label>
                    <select
                      value={bookmarkStyle || 'cards'}
                      onChange={(e) => onSetBookmarkStyle && onSetBookmarkStyle(e.target.value as 'cards' | 'chips' | 'list' | 'minimal' | 'compact' | 'modern')}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="cards">Cards</option>
                      <option value="chips">Chips</option>
                      <option value="list">List</option>
                      <option value="minimal">Minimal</option>
                      <option value="compact">Compact</option>
                      <option value="modern">Modern</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>App &amp; Widget Layout</h4>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h8M7 17h6" />
                      </svg>
                      Show App Titles
                    </label>
                    <button
                      onClick={onToggleShowAppTitles}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showAppTitles 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showAppTitles ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                      </svg>
                      Center App Cards Group
                    </label>
                    <button
                      onClick={() => onToggleCenterAppsGroup && onToggleCenterAppsGroup()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        centerAppsGroup 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          centerAppsGroup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10h16M4 14h10" />
                      </svg>
                      App Cards Top Margin
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={400}
                        step={5}
                        value={appGroupMarginTop}
                        onChange={(e) => onSetAppGroupMarginTop(Number(e.target.value))}
                        className="flex-1 accent-blue-500"
                      />
                      <span className={`text-xs font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {appGroupMarginTop}px
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                      </svg>
                      Center Widget Cards Group
                    </label>
                    <button
                      onClick={() => onToggleCenterWidgetsGroup && onToggleCenterWidgetsGroup()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        centerWidgetsGroup 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          centerWidgetsGroup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Display</h4>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      Show Search Bar
                    </label>
                    <button
                      onClick={() => onToggleSearchBar && onToggleSearchBar()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showSearchBar 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showSearchBar ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a8 8 0 110 16 8 8 0 010-16z" />
                      </svg>
                      Full Rounded Icons
                    </label>
                    <button
                      onClick={() => onToggleFullRoundedIcons && onToggleFullRoundedIcons()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        fullRoundedIconsEnabled 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          fullRoundedIconsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757L6.636 6.636m0 10.728l2.121-2.121m8.486-8.486l2.121-2.121" />
                      </svg>
                      Show Time (Top Bar)
                    </label>
                    <button
                      onClick={() => onToggleTopTime && onToggleTopTime()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showTopTime 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showTopTime ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Animations &amp; Effects</h4>
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-[#121212] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className={`text-sm font-medium flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                        </svg>
                        Animate Icons
                      </label>
                      <button
                        onClick={onToggleAnimateIcons}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          animateIconsEnabled 
                            ? 'bg-blue-500' 
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            animateIconsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {animateIconsEnabled && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <label className={`text-sm font-medium flex items-center gap-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 12h16M4 16h10" />
                          </svg>
                          Hover Animation
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsHoverDropdownOpen(v => !v)}
                            className={`text-xs px-3 py-1.5 rounded-lg ring-1 transition-colors flex items-center gap-1 ${
                              isDarkMode ? 'bg-[#0f1115] text-white ring-white/10 hover:bg-white/5' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
                            }`}
                            aria-haspopup="listbox"
                            aria-expanded={isHoverDropdownOpen}
                          >
                            <span className="capitalize flex items-center gap-1.5">
                              {renderHoverIcon(hoverAnimationStyle)}
                              {hoverAnimationStyle}
                            </span>
                            <svg className={`w-3.5 h-3.5 transition-transform ${isHoverDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isHoverDropdownOpen && (
                            <div className={`absolute right-0 mt-2 z-20 w-40 rounded-xl overflow-hidden shadow-lg ring-1 ${
                              isDarkMode ? 'bg-[#121212] ring-white/10' : 'bg-white ring-gray-200'
                            }`}
                              role="listbox"
                            >
                              {(['scale','tilt','skew','spin','bounce','pulse','float','slide','glow'] as const).map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onMouseDown={(e) => { e.preventDefault(); onSetHoverAnimationStyle(opt); setIsHoverDropdownOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-xs capitalize transition-colors flex items-center gap-2 ${
                                    isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
                                  } ${hoverAnimationStyle === opt ? (isDarkMode ? 'bg-white/5' : 'bg-gray-50') : ''}`}
                                  role="option"
                                  aria-selected={hoverAnimationStyle === opt}
                                >
                                  {renderHoverIcon(opt)}
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                    {animateIconsEnabled && (
                    <div className="mt-3 flex items-center justify-between">
                      <label className={`text-sm font-medium flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M4 8h16M6 12h12" />
                        </svg>
                        Also apply to widgets
                      </label>
                      <button
                        onClick={onToggleAnimateWidgets}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          animateWidgetsEnabled 
                            ? 'bg-blue-500' 
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            animateWidgetsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6m0 0l-2-2m2 2l-2 2M15 17h6m0 0l-2-2m2 2l-2 2M8 12h8" />
                      </svg>
                      Autofil Icons
                    </label>
                    <button
                      onClick={onToggleAutofulIcons}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autofulIconsEnabled 
                          ? 'bg-blue-500' 
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autofulIconsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Typography</h4>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                      App Card Text Color
                    </label>
                    <select
                      value={appTitleColor}
                      onChange={(e) => onSetAppTitleColor(e.target.value as 'auto' | 'black' | 'white')}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="auto">Auto</option>
                      <option value="black">Black</option>
                      <option value="white">White</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                      Widget Text Color
                    </label>
                    <select
                      value={widgetTextColor}
                      onChange={(e) => onSetWidgetTextColor(e.target.value as 'auto' | 'black' | 'white')}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="auto">Auto</option>
                      <option value="black">Black</option>
                      <option value="white">White</option>
                    </select>
                  </div>
                </div>

                {/* Visual Effects Mode - Modern cards */}
                <div className="space-y-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Visual Effects</h4>
                  <div className="grid grid-cols-3 gap-3">
              {/* Normal */}
              <button
                onClick={onToggleNormalMode}
                className={`group relative w-full overflow-hidden rounded-2xl p-3 text-xs font-semibold transition-all duration-300 ${
                  normalModeEnabled
                    ? 'bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-lg ring-2 ring-slate-400/50'
                    : isDarkMode
                      ? 'bg-[#121212] text-gray-200 border border-white/10 hover:bg-[#1b1b1b]'
                      : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
                title="Normal Mode"
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    normalModeEnabled ? 'bg-white/20 shadow-inner' : isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                    </svg>
                  </div>
                  <span>Normal</span>
                </div>
                <span className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent ${normalModeEnabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
              </button>

              {/* Glassmorphism */}
              <button
                onClick={onToggleGlassmorphism}
                className={`group relative w-full overflow-hidden rounded-2xl p-3 text-xs font-semibold transition-all duration-300 ${
                  glassmorphismEnabled
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-2 ring-blue-400/50'
                    : isDarkMode
                      ? 'bg-[#121212] text-gray-200 border border-white/10 hover:bg-[#1b1b1b]'
                      : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
                title="Toggle Glassmorphism"
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    glassmorphismEnabled ? 'bg-white/20 shadow-inner' : isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span>Glass</span>
                </div>
                <span className={`pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl ${glassmorphismEnabled ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'} transition-opacity`} />
              </button>

              {/* Apple Liquid Glass */}
              <button
                onClick={onToggleLiquidGlass}
                className={`group relative w-full overflow-hidden rounded-2xl p-3 text-xs font-semibold transition-all duration-300 ${
                  liquidGlassEnabled
                    ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 text-white shadow-lg ring-2 ring-cyan-300/50'
                    : isDarkMode
                      ? 'bg-[#121212] text-gray-200 border border-white/10 hover:bg-[#1b1b1b]'
                      : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
                title="Toggle Apple Liquid Glass"
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    liquidGlassEnabled ? 'bg-white/20 shadow-inner' : isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.5c5 5 7.5 8.4 7.5 11.5a7.5 7.5 0 11-15 0C4.5 10.9 7 7.5 12 2.5z" />
                    </svg>
                  </div>
                  <span>Liquid</span>
                </div>
                <span className={`pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/20 blur-2xl ${liquidGlassEnabled ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'} transition-opacity`} />
              </button>
                  </div>
                  {liquidGlassEnabled && (
                    <div className={`mt-3 rounded-xl p-3 ${
                      isDarkMode ? 'bg-[#121212] border border-white/10' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <label className={`text-sm font-medium flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                        </svg>
                        Liquid Reflection Color
                      </label>
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="color"
                          value={liquidReflectionColor}
                          onChange={(e) => onSetLiquidReflectionColor(e.target.value)}
                          className={`h-9 w-12 cursor-pointer rounded-lg p-1 ${
                            isDarkMode ? 'bg-transparent border border-white/20' : 'bg-white border border-gray-200'
                          }`}
                          title="Choose the highlight tint used across liquid surfaces"
                        />
                        <span className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {liquidReflectionColor.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 