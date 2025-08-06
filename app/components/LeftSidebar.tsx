'use client';

import { useState, useEffect } from 'react';

interface App {
  id: string;
  title: string;
  href: string;
  icon?: string;
}

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes';
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
  onToggleShowAppTitles: () => void;
  backgroundImage: string;
  onSetBackgroundImage: (url: string) => void;
  glassmorphismEnabled: boolean;
  onToggleGlassmorphism: () => void;
  appTitleColor: 'auto' | 'black' | 'white';
  onSetAppTitleColor: (color: 'auto' | 'black' | 'white') => void;
  widgetTextColor: 'auto' | 'black' | 'white';
  onSetWidgetTextColor: (color: 'auto' | 'black' | 'white') => void;
  addWidget: (type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes') => void;
}

export default function LeftSidebar({ 
  isOpen, 
  onClose, 
  apps, 
  onAddApp, 
  isDarkMode, 
  onToggleTheme, 
  showAppTitles, 
  onToggleShowAppTitles, 
  backgroundImage, 
  onSetBackgroundImage, 
  glassmorphismEnabled, 
  onToggleGlassmorphism, 
  appTitleColor, 
  onSetAppTitleColor, 
  widgetTextColor, 
  onSetWidgetTextColor,
  addWidget 
}: LeftSidebarProps) {
  const [newApp, setNewApp] = useState({ title: '', href: '' });
  const [mounted, setMounted] = useState(false);
  const [isAppsExpanded, setIsAppsExpanded] = useState(false);
  const [newBackgroundImage, setNewBackgroundImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onSetBackgroundImage(result);
          setSelectedFile(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Left Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 shadow-2xl transform transition-all duration-300 ease-in-out z-50 ${
          glassmorphismEnabled
            ? isDarkMode 
              ? 'bg-[#2B2B2B]/80 backdrop-blur-md border-r border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-white/80 backdrop-blur-md border-r border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDarkMode ? 'bg-[#2B2B2B] border-r border-gray-700' : 'bg-white border-r border-gray-200'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Dashboard Settings
            </h2>
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
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
                className={`transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Widgets Section */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
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
                <div className="grid grid-cols-2 gap-3">
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
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Glassmorphism
                  </label>
                  <button
                    onClick={onToggleGlassmorphism}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      glassmorphismEnabled 
                        ? 'bg-blue-500' 
                        : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        glassmorphismEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Background Image
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newBackgroundImage}
                    onChange={(e) => setNewBackgroundImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (newBackgroundImage) {
                        onSetBackgroundImage(newBackgroundImage);
                        setNewBackgroundImage('');
                      }
                    }}
                    disabled={!newBackgroundImage}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                  >
                    Set Background
                  </button>
                  <button
                    onClick={() => onSetBackgroundImage('')}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition duration-300"
                  >
                    Remove
                  </button>
                </div>
                {backgroundImage && (
                  <div className="mt-3">
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Current background: {backgroundImage.length > 30 ? backgroundImage.substring(0, 30) + '...' : backgroundImage}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Add App Form */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Add New App
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    App Name
                  </label>
                  <input
                    type="text"
                    value={newApp.title}
                    onChange={(e) => setNewApp({ ...newApp, title: e.target.value })}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Twitter, Spotify"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    URL
                  </label>
                  <input
                    type="text"
                    value={newApp.href}
                    onChange={(e) => setNewApp({ ...newApp, href: e.target.value })}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., twitter.com or https://twitter.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <button
                  onClick={handleAddApp}
                  disabled={!newApp.title || !newApp.href}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                >
                  Add App
                </button>
              </div>
            </div>

            {/* Current Apps List */}
            <div>
              <button
                onClick={() => setIsAppsExpanded(!isAppsExpanded)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <h3 className={`text-lg font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Current Apps ({apps.length})
                </h3>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  } ${isAppsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isAppsExpanded && (
                <div className="space-y-2 mt-2">
                  {apps.map((app) => (
                    <div key={app.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {app.title}
                        </p>
                        <p className={`text-sm truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {app.href}
                        </p>
                      </div>
                    </div>
                  ))}
                  {apps.length === 0 && (
                    <p className={`text-center py-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No apps added yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 