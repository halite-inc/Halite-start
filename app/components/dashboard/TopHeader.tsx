'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WeatherDropdownContent, WeatherState } from '../widgets/WeatherWidget';

interface TopHeaderProps {
  userName: string;
  onSaveUserName: (newName: string) => void;
  greetingStyle?: 'hi' | 'welcome' | 'time-based';
  showTopTime?: boolean;
  topPillSize?: 'small' | 'medium' | 'large';
  topPillStyle?: 'card' | 'text';
  mergeTopPillsCenter?: boolean;
  topPillShape?: 'pill' | 'squircle';
  isDarkMode: boolean;
  backgroundImage?: string;
  glassmorphismEnabled?: boolean;
  weatherState: WeatherState | null;
  weatherLoading: boolean;
  weatherError: boolean;
  onOpenSettings: () => void;
  onOpenStatistics: () => void;
}

export default function TopHeader({
  userName,
  onSaveUserName,
  greetingStyle = 'hi',
  showTopTime = true,
  topPillSize = 'medium',
  topPillStyle = 'card',
  mergeTopPillsCenter = false,
  topPillShape = 'pill',
  isDarkMode,
  backgroundImage,
  glassmorphismEnabled = true,
  weatherState,
  weatherLoading,
  weatherError,
  onOpenSettings,
  onOpenStatistics,
}: TopHeaderProps) {
  const [clockTime, setClockTime] = useState<Date>(new Date());
  const [isTimePillDropdownOpen, setIsTimePillDropdownOpen] = useState(false);
  const [isGreetingDropdownOpen, setIsGreetingDropdownOpen] = useState(false);
  const [isNameEditorOpen, setIsNameEditorOpen] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const timeDropdownRef = useRef<HTMLDivElement | null>(null);
  const greetingDropdownRef = useRef<HTMLDivElement | null>(null);
  const nameEditorRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Localized 1-second interval so clock ticking doesn't trigger re-renders of the whole page!
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update input if external userName changes
  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  // Focus name input when editor opens
  useEffect(() => {
    if (isNameEditorOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isNameEditorOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTimePillDropdownOpen(false);
      }
      if (
        greetingDropdownRef.current &&
        !greetingDropdownRef.current.contains(e.target as Node)
      ) {
        setIsGreetingDropdownOpen(false);
      }
      if (
        nameEditorRef.current &&
        !nameEditorRef.current.contains(e.target as Node) &&
        greetingDropdownRef.current &&
        !greetingDropdownRef.current.contains(e.target as Node)
      ) {
        setIsNameEditorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = userName.trim() || 'user';
  const topClockLabel = clockTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getGreeting = () => {
    if (greetingStyle === 'welcome') {
      return `Welcome, ${displayName}`;
    } else if (greetingStyle === 'time-based') {
      const hour = new Date().getHours();
      if (hour < 12) {
        return `Good morning, ${displayName}`;
      } else if (hour < 17) {
        return `Good afternoon, ${displayName}`;
      } else {
        return `Good evening, ${displayName}`;
      }
    } else {
      return `Hi, ${displayName}`;
    }
  };

  const handleSaveName = () => {
    onSaveUserName(nameInput);
    setIsNameEditorOpen(false);
  };

  const weatherDropdownMenu = (
    <div
      id="time-weather-dropdown-menu"
      className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 rounded-2xl shadow-lg ring-1 overflow-hidden backdrop-blur-md transition-all p-3.5 z-50 ${
        glassmorphismEnabled
          ? isDarkMode
            ? 'bg-blue-400/20 backdrop-blur-md text-black border-[1.5px] border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
            : 'bg-blue-300/20 backdrop-blur-md text-black border-[1.5px] border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
          : isDarkMode
          ? 'bg-gradient-to-br from-blue-400 via-gray-300 to-blue-400 text-white ring-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-gradient-to-br from-blue-300 via-gray-200 to-blue-300 text-white ring-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
      }`}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full"></div>
        <div className="absolute top-6 left-6 w-0.5 h-0.5 bg-white rounded-full"></div>
        <div className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-10 left-4 w-0.5 h-0.5 bg-white rounded-full"></div>
        <div className="absolute top-12 right-6 w-0.5 h-0.5 bg-white rounded-full"></div>
      </div>
      <WeatherDropdownContent
        weatherState={weatherState}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        glassmorphismEnabled={glassmorphismEnabled}
        isDarkMode={isDarkMode}
      />
    </div>
  );

  const greetingDropdownMenu = (
    <div
      id="greeting-dropdown-menu"
      className={`absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-lg ring-1 overflow-hidden backdrop-blur-sm transition-all py-1 z-50 ${
        isDarkMode
          ? 'bg-black/40 text-white ring-white/15'
          : 'bg-white/50 text-gray-900 ring-gray-200'
      }`}
    >
      <div
        className={`flex items-center justify-around px-2 pt-2 pb-1.5 mx-1.5 mb-1 rounded-xl ${
          isDarkMode ? 'bg-white/5' : 'bg-gray-500/5'
        }`}
      >
        {[
          {
            name: 'Mail',
            url: 'https://mail.google.com',
            icon: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png',
          },
          {
            name: 'Drive',
            url: 'https://drive.google.com',
            icon: 'https://www.gstatic.com/images/branding/product/2x/drive_2020q4_32dp.png',
          },
          {
            name: 'Gemini',
            url: 'https://gemini.google.com',
            icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg',
          },
          {
            name: 'Calendar',
            url: 'https://calendar.google.com',
            icon: 'https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_32dp.png',
          },
        ].map(({ name, url, icon }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={name}
            className={`flex items-center justify-center p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-500/10'
            }`}
          >
            <img
              src={icon}
              alt={name}
              title={name}
              className="w-6 h-6 rounded-md"
            />
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setIsGreetingDropdownOpen(false);
          onOpenStatistics();
        }}
        className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${
          isDarkMode
            ? 'text-white/80 hover:text-white hover:bg-white/10'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'
        }`}
      >
        <svg
          className="w-4 h-4 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Statistics
      </button>

      <button
        type="button"
        onClick={() => {
          setIsGreetingDropdownOpen(false);
          onOpenSettings();
        }}
        className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${
          isDarkMode
            ? 'text-white/80 hover:text-white hover:bg-white/10'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'
        }`}
      >
        <svg
          className="w-4 h-4 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Settings
      </button>

      <button
        type="button"
        onClick={() => {
          setIsGreetingDropdownOpen(false);
          setIsNameEditorOpen(true);
        }}
        className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${
          isDarkMode
            ? 'text-white/80 hover:text-white hover:bg-white/10'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'
        }`}
      >
        <svg
          className="w-4 h-4 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Edit Name
      </button>
    </div>
  );

  const nameEditorModal = (
    <div
      ref={nameEditorRef}
      id="greeting-name-editor"
      className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 rounded-2xl shadow-sm ring-1 p-3 flex flex-col gap-3 backdrop-blur-sm transition-all z-50 ${
        isDarkMode
          ? 'bg-black/40 text-white ring-white/15'
          : 'bg-white/50 text-gray-900 ring-gray-200'
      }`}
    >
      <div className="flex flex-col relative z-10 w-full px-2">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-60">
          Update greeting
        </span>
        <input
          ref={nameInputRef}
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSaveName();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setIsNameEditorOpen(false);
            }
          }}
          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all ${
            isDarkMode
              ? 'bg-white/10 text-white placeholder-white/30 border border-white/5'
              : 'bg-gray-100/50 text-gray-900 placeholder-gray-400 border border-gray-200/50'
          }`}
          placeholder="Enter your name"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsNameEditorOpen(false)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isDarkMode
              ? 'text-white/60 hover:text-white/80 hover:bg-white/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/5'
          }`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveName}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500/80 text-white hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );

  if (mergeTopPillsCenter) {
    return (
      <div
        ref={timeDropdownRef}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
      >
        {topPillStyle === 'card' ? (
          <div
            className={`inline-flex items-center ${
              topPillSize === 'small'
                ? 'text-xs'
                : topPillSize === 'large'
                ? 'text-base'
                : 'text-sm'
            } font-semibold ${
              topPillShape === 'squircle' ? 'rounded-xl' : 'rounded-full'
            } ring-1 ${
              backgroundImage || isDarkMode
                ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl shadow-lg'
                : 'bg-white text-black ring-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
            }`}
          >
            {showTopTime && (
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsTimePillDropdownOpen((prev) => !prev);
                    setIsGreetingDropdownOpen(false);
                  }}
                  className={`${
                    topPillSize === 'small'
                      ? 'px-2 py-0.5'
                      : topPillSize === 'large'
                      ? 'px-4 py-1.5'
                      : 'px-3 py-1'
                  } transition-all duration-200 focus:outline-none hover:opacity-80`}
                >
                  {topClockLabel}
                </button>
                {isTimePillDropdownOpen && weatherDropdownMenu}
                <span
                  className={`w-px mx-0.5 h-3 self-center rounded-full ${
                    backgroundImage || isDarkMode
                      ? 'bg-white/15'
                      : 'bg-gray-300/60'
                  }`}
                />
              </div>
            )}

            <div ref={greetingDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsGreetingDropdownOpen((prev) => !prev);
                  setIsNameEditorOpen(false);
                  setIsTimePillDropdownOpen(false);
                }}
                className={`${
                  topPillSize === 'small'
                    ? 'px-2 py-0.5'
                    : topPillSize === 'large'
                    ? 'px-4 py-1.5'
                    : 'px-3 py-1'
                } transition-all duration-200 focus:outline-none hover:opacity-80`}
                title="Click to see options"
              >
                {getGreeting()}
              </button>
              {isGreetingDropdownOpen && greetingDropdownMenu}
              {isNameEditorOpen && nameEditorModal}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {showTopTime && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsTimePillDropdownOpen((prev) => !prev);
                    setIsGreetingDropdownOpen(false);
                  }}
                  className={`${
                    topPillSize === 'small'
                      ? 'text-xs'
                      : topPillSize === 'large'
                      ? 'text-base'
                      : 'text-sm'
                  } font-semibold bg-transparent hover:opacity-80 transition-all duration-200 focus:outline-none ${
                    isDarkMode
                      ? 'text-white drop-shadow-md'
                      : 'text-gray-900 drop-shadow-sm'
                  }`}
                >
                  {topClockLabel}
                </button>
                {isTimePillDropdownOpen && weatherDropdownMenu}
              </div>
            )}
            <div ref={greetingDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsGreetingDropdownOpen((prev) => !prev);
                  setIsNameEditorOpen(false);
                  setIsTimePillDropdownOpen(false);
                }}
                className={`${
                  topPillSize === 'small'
                    ? 'text-xs'
                    : topPillSize === 'large'
                    ? 'text-base'
                    : 'text-sm'
                } font-semibold bg-transparent hover:opacity-80 transition-all duration-200 focus:outline-none ${
                  isDarkMode
                    ? 'text-white drop-shadow-md'
                    : 'text-gray-900 drop-shadow-sm'
                }`}
                title="Click to see options"
              >
                {getGreeting()}
              </button>
              {isGreetingDropdownOpen && greetingDropdownMenu}
              {isNameEditorOpen && nameEditorModal}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {showTopTime && (
        <div ref={timeDropdownRef} className="fixed top-4 left-8 z-40">
          <button
            type="button"
            onClick={() => {
              setIsTimePillDropdownOpen((prev) => !prev);
              setIsGreetingDropdownOpen(false);
            }}
            className={`inline-flex items-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 hover:opacity-85 active:scale-95 ${
              topPillSize === 'small'
                ? 'px-2 py-0.5 text-xs'
                : topPillSize === 'large'
                ? 'px-4 py-1.5 text-base'
                : 'px-3 py-1 text-sm'
            } font-semibold ${
              topPillStyle === 'text'
                ? `bg-transparent hover:opacity-80 ${
                    isDarkMode
                      ? 'text-white drop-shadow-md'
                      : 'text-gray-900 drop-shadow-sm'
                  }`
                : `${
                    topPillShape === 'squircle' ? 'rounded-xl' : 'rounded-full'
                  } ring-1 ${
                    backgroundImage
                      ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl hover:bg-white/15 shadow-lg'
                      : isDarkMode
                      ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl hover:bg-white/15 shadow-lg'
                      : 'bg-white text-black ring-gray-200 hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                  }`
            }`}
          >
            {topClockLabel}
          </button>

          {isTimePillDropdownOpen && weatherDropdownMenu}
        </div>
      )}

      <div
        ref={greetingDropdownRef}
        className="fixed top-4 right-8 z-40 flex flex-col items-end gap-2"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsGreetingDropdownOpen((prev) => !prev);
              setIsNameEditorOpen(false);
              setIsTimePillDropdownOpen(false);
            }}
            className={`inline-flex items-center ${
              topPillSize === 'small'
                ? 'px-2 py-0.5 text-xs'
                : topPillSize === 'large'
                ? 'px-4 py-1.5 text-base'
                : 'px-3 py-1 text-sm'
            } font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
              topPillStyle === 'text'
                ? `bg-transparent hover:opacity-80 ${
                    isDarkMode
                      ? 'text-white drop-shadow-md'
                      : 'text-gray-900 drop-shadow-sm'
                  }`
                : `${
                    topPillShape === 'squircle' ? 'rounded-xl' : 'rounded-full'
                  } ring-1 ${
                    backgroundImage
                      ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl hover:bg-white/15 shadow-lg'
                      : isDarkMode
                      ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl hover:bg-white/15 shadow-lg'
                      : 'bg-white text-black ring-gray-200 hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                  }`
            }`}
            title="Click to see options"
          >
            {getGreeting()}
          </button>
          {isGreetingDropdownOpen && greetingDropdownMenu}
          {isNameEditorOpen && nameEditorModal}
        </div>
      </div>
    </>
  );
}
