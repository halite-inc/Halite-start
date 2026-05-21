  'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LeftSidebar from './components/LeftSidebar';
import CommandPalette from './components/CommandPalette';
import UsageStatistics from './components/UsageStatistics';
import { getImageObjectUrl, deleteImageBlob, saveImageBlob } from './lib/idb';
import { getFaviconUrl, fetchBestFavicon } from './lib/favicon';
import React from 'react';

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

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes' | 'spacer' | 'photo' | 'fidget-spinner' | 'pomodoro' | 'dice' | 'coin-flip';
  title: string;
}

interface Bookmark {
  id: string;
  title: string;
  href: string;
  icon?: string;
}


const defaultApps: App[] = [
  { id: 'youtube', title: 'YouTube', href: 'https://youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32' },
  { id: 'github', title: 'GitHub', href: 'https://github.com', icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32' },
  { id: 'pinterest', title: 'Pinterest', href: 'https://pinterest.com', icon: 'https://www.google.com/s2/favicons?domain=pinterest.com&sz=32' },
  { id: 'dribbble', title: 'Dribbble', href: 'https://dribbble.com', icon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=32' },
  { id: 'flipkart', title: 'Flipkart', href: 'https://flipkart.com', icon: 'https://www.google.com/s2/favicons?domain=flipkart.com&sz=32' },
  { id: 'amazon', title: 'Amazon', href: 'https://amazon.com', icon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32' },
  { id: 'booking', title: 'Booking.com', href: 'https://booking.com', icon: 'https://www.google.com/s2/favicons?domain=booking.com&sz=32' },

  { id: 'google', title: 'Google', href: 'https://google.com', icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=32' },
  { id: 'gmail', title: 'Gmail', href: 'https://gmail.com', icon: 'https://www.google.com/s2/favicons?domain=gmail.com&sz=32' },
  { id: 'twitter', title: 'Twitter', href: 'https://twitter.com', icon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=32' },
  { id: 'netfree2', title: 'NetFree2', href: 'https://netfree2.cc/home', icon: 'https://www.google.com/s2/favicons?domain=netfree2.cc&sz=32' },
];

const defaultWidgets: Widget[] = [
  { id: 'clock-1', type: 'clock', title: 'Clock Widget' },
  { id: 'weather-1', type: 'weather', title: 'Weather Widget' },
  { id: 'calendar-1', type: 'calendar', title: 'Calendar Widget' },
  { id: 'analog-clock-1', type: 'analog-clock', title: 'Analog Clock Widget' },
  { id: 'water-tracker-1', type: 'water-tracker', title: 'Water Tracker Widget' },
  { id: 'quick-notes-1', type: 'quick-notes', title: 'Quick Notes Widget' },
  { id: 'photo-1', type: 'photo', title: 'Photo Widget' },
  { id: 'fidget-spinner-1', type: 'fidget-spinner', title: 'Fidget Spinner Widget' },
  // Sticky note is optional by default
];

const defaultBookmarks: Bookmark[] = [];

const hexToRgb = (hex: string): [number, number, number] => {
  let value = hex.trim().replace('#', '');
  if (value.length === 3) {
    value = value.split('').map((char) => char + char).join('');
  }
  if (value.length !== 6) {
    return [255, 255, 255];
  }
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

function SortableLinkCard({ app, onRemove, isDark, showAppTitles, hideAppTitleText, backgroundImage, glassmorphismEnabled, appTitleColor, isEditModalOpen, jiggleIndex, animateIconsEnabled, hoverAnimationStyle, monochromeIcons, onContextMenu, appCardBorderRadius, removeAppCardBorders, appCardSize = 'normal', customAppCardSize = 64, appCardInnerShadow = 'none', appCardBackgroundColor, onAppClick }: { app: App; onRemove: (id: string) => void; isDark: boolean; showAppTitles: boolean; hideAppTitleText: boolean; backgroundImage: string; glassmorphismEnabled: boolean; appTitleColor: 'auto' | 'black' | 'white'; isEditModalOpen: boolean; jiggleIndex: number; animateIconsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow'; monochromeIcons: boolean; onContextMenu: (e: React.MouseEvent, appId: string) => void; appCardBorderRadius: 'small' | 'medium' | 'full'; removeAppCardBorders: boolean; appCardSize?: 'small' | 'normal' | 'large' | 'custom'; customAppCardSize?: number; appCardInnerShadow?: 'none' | 'small' | 'medium' | 'large'; appCardBackgroundColor?: string; onAppClick?: (appId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, disabled: !isEditModalOpen });

  const [hovered, setHovered] = useState(false);
  const [iconSrc, setIconSrc] = useState<string | undefined>(app.icon);

  useEffect(() => {
    let isMounted = true;
    
    // Check if this is a faceprep.online or examly URL and use custom icon
    const isFaceprep = app.href.includes('faceprep.online');
    const isExamly = app.href.includes('rec215.examly.io');
    
    if (isFaceprep) {
      setIconSrc('/faceprep.png');
    } else if (isExamly) {
      setIconSrc('/raj.png');
    } else if (app.icon?.startsWith('idb:')) {
      const key = app.icon.replace('idb:', '');
      getImageObjectUrl(key).then(url => {
        if (isMounted && url) setIconSrc(url);
      });
    } else {
      setIconSrc(app.icon);
    }
    return () => { isMounted = false; };
  }, [app.icon, app.href]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isYouTube = (() => {
    try {
      const url = new URL(app.href.startsWith('http') ? app.href : `https://${app.href}`);
      return url.hostname.includes('youtube.com');
    } catch { return false; }
  })();

  const extraClasses = isYouTube ? ' bg-[#FF0037]' : '';
  const iconBgClass = isYouTube ? 'bg-[#FF0037]' : 'bg-white';

  const hoverClass = animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : hoverAnimationStyle === 'pulse'
              ? 'hover:scale-[1.06]'
              : hoverAnimationStyle === 'float'
                ? 'hover:-translate-y-1.5'
                : hoverAnimationStyle === 'slide'
                  ? 'hover:translate-x-1'
                  : hoverAnimationStyle === 'glow'
                    ? 'hover:shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                    : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  /* App Card Size Classes */
  const sizeClasses = {
    small: 'w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] lg:w-[52px] lg:h-[52px]',
    normal: 'w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] lg:w-[60px] lg:h-[60px]',
    large: 'w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]'
  };
  const currentSizeClass = appCardSize === 'custom' ? '' : (sizeClasses[appCardSize] || sizeClasses.normal);

  /* Inner Shadow Classes */
  const innerShadowClasses = {
    none: '',
    small: 'shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]',
    medium: 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]',
    large: 'shadow-[inset_0_4px_8px_rgba(0,0,0,0.25)]'
  };
  const currentInnerShadowClass = innerShadowClasses[appCardInnerShadow] || '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${showAppTitles ? 'w-[40px] sm:w-[48px] lg:w-[60px]' : 'w-[48px] sm:w-[60px] lg:w-[70px]'} ${isDragging ? 'z-50' : ''}`}
    >
      {/* App Card */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`${currentSizeClass} ${appCardBorderRadius === 'small' ? 'rounded-lg' : appCardBorderRadius === 'full' ? 'rounded-full' : 'rounded-2xl'} transition duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${(backgroundImage || removeAppCardBorders) ? 'border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]' : 'border'} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          } ${glassmorphismEnabled
              ? (isDark
                ? `bg-black/20 backdrop-blur-md text-white hover:bg-black/30 ${removeAppCardBorders ? '' : 'border-[1.5px] border-white/15 hover:border-white/25'} shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]`
                : `bg-white/20 backdrop-blur-md text-black hover:bg-white/30 ${removeAppCardBorders ? '' : 'border-[1.5px] border-white/30 hover:border-white/40'} shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]`)
              : (isDark
                ? `bg-black text-white hover:bg-gray-900 ${removeAppCardBorders ? '' : 'border border-[#2C2D2D]'} shadow-[inset_0_0_20px_rgba(255,255,255,0.15),0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_0_25px_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.4)]`
                : `bg-white text-black hover:bg-white ${removeAppCardBorders ? '' : 'border border-[#e0e0e0]'} shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]`)
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}${extraClasses} ${hoverClass}`}
        style={{ 
          animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined,
          ...(appCardBackgroundColor ? { backgroundColor: appCardBackgroundColor } : {}),
          ...(appCardSize === 'custom' && customAppCardSize ? { width: `${customAppCardSize}px`, height: `${customAppCardSize}px` } : {})
        }}
        onClick={(e) => {
          if (!isEditModalOpen) {
            onAppClick?.(app.id);
            if (e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              // Open in new tab (not window)
              window.open(app.href, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = app.href;
            }
          }
        }}
        onContextMenu={(e) => {
          if (!isEditModalOpen) {
            onContextMenu(e, app.id);
          }
        }}
      >
        {/* Inner Shadow Overlay */}
        {appCardInnerShadow !== 'none' && (
          <div className={`pointer-events-none absolute inset-0 rounded-inherit ${currentInnerShadowClass}`} style={{ borderRadius: 'inherit' }} />
        )}
        {/* App Icon */}
        <div className="relative z-10">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={`${app.title} icon`}
              className={`${appCardSize === 'custom' ? 'w-[60%] h-[60%]' : (showAppTitles ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8' : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10')} rounded-full shadow-sm ${iconBgClass} ${monochromeIcons ? 'grayscale contrast-125' : ''}`}
              onError={(e) => {
                // Show a fallback icon if the image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          {/* Fallback icon if no image or image fails to load */}
          <div className={`${showAppTitles ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8' : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10'} rounded-full shadow-sm flex items-center justify-center text-lg ${iconBgClass} ${iconSrc ? 'hidden' : ''} ${isDark ? 'text-gray-600' : 'text-gray-600'
            }`}>
            🔗
          </div>
        </div>
      </div>

      {/* App Title - Below the card */}
      {showAppTitles && (
        <div className={`mt-2 text-center w-full ${hideAppTitleText ? 'invisible' : ''}`}>
          <span className={`block max-w-full truncate text-xs font-medium ${appTitleColor === 'auto'
            ? (isDark ? 'text-white' : 'text-gray-800')
            : appTitleColor === 'black'
              ? 'text-black'
              : 'text-white'
            }`}>{app.title}</span>
        </div>
      )}

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={() => onRemove(app.id)}
          className={`absolute -top-2 -right-2 ${
            glassmorphismEnabled 
              ? (isDark ? 'bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 hover:text-red-400' : 'bg-white/40 backdrop-blur-xl border border-black/10 text-black hover:bg-white/60 hover:text-red-500')
              : (isDark ? 'bg-[#1e1e1e] border border-[#333] text-white hover:bg-[#333] hover:text-red-400' : 'bg-white border border-gray-200 text-black hover:bg-gray-100 hover:text-red-500')
          } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-all duration-200 z-10 shadow-lg`}
          title="Remove app"
        >
          ×
        </button>
      )}
    </div>
  );
}

function HaliteCard({ app, onRemove, isDark, showAppTitles, hideAppTitleText, backgroundImage, glassmorphismEnabled, appTitleColor, isEditModalOpen, jiggleIndex, animateIconsEnabled, hoverAnimationStyle, monochromeIcons, onContextMenu, appCardBorderRadius, removeAppCardBorders, appCardSize = 'normal', customAppCardSize = 64, appCardInnerShadow = 'none', appCardBackgroundColor, onAppClick }: { app: App; onRemove: (id: string) => void; isDark: boolean; showAppTitles: boolean; hideAppTitleText: boolean; backgroundImage: string; glassmorphismEnabled: boolean; appTitleColor: 'auto' | 'black' | 'white'; isEditModalOpen: boolean; jiggleIndex: number; animateIconsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow'; monochromeIcons: boolean; onContextMenu: (e: React.MouseEvent, appId: string) => void; appCardBorderRadius: 'small' | 'medium' | 'full'; removeAppCardBorders: boolean; appCardSize?: 'small' | 'normal' | 'large' | 'custom'; customAppCardSize?: number; appCardInnerShadow?: 'none' | 'small' | 'medium' | 'large'; appCardBackgroundColor?: string; onAppClick?: (appId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, disabled: !isEditModalOpen });

  const [hovered, setHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hoverClass = animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : hoverAnimationStyle === 'pulse'
              ? 'hover:scale-[1.06]'
              : hoverAnimationStyle === 'float'
                ? 'hover:-translate-y-1.5'
                : hoverAnimationStyle === 'slide'
                  ? 'hover:translate-x-1'
                  : hoverAnimationStyle === 'glow'
                    ? 'hover:shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                    : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  const haliteUrls = app.haliteUrls || [];
  const haliteIcons = app.haliteIcons || [];
  
  // Override icons for faceprep.online or examly URLs with custom icon
  const displayIcons = haliteIcons.map((icon, idx) => {
    const url = haliteUrls[idx];
    if (url && url.includes('faceprep.online')) {
      return '/faceprep.png';
    } else if (url && url.includes('rec215.examly.io')) {
      return '/raj.png';
    }
    return icon;
  });

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditModalOpen && haliteUrls.length > 0) {
      onAppClick?.(app.id);
      // Always open all URLs in new tabs to keep dashboard open
      haliteUrls.forEach((url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }
  };

  /* App Card Size Classes */
  const sizeClasses = {
    small: 'w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] lg:w-[52px] lg:h-[52px]',
    normal: 'w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] lg:w-[60px] lg:h-[60px]',
    large: 'w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]'
  };
  const currentSizeClass = appCardSize === 'custom' ? '' : (sizeClasses[appCardSize] || sizeClasses.normal);

  /* Inner Shadow Classes */
  const innerShadowClasses = {
    none: '',
    small: 'shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]',
    medium: 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]',
    large: 'shadow-[inset_0_4px_8px_rgba(0,0,0,0.25)]'
  };
  const currentInnerShadowClass = innerShadowClasses[appCardInnerShadow] || '';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(appCardSize === 'custom' && customAppCardSize ? { width: `${customAppCardSize}px` } : {})
      }}
      className={`relative group ${appCardSize === 'custom' ? '' : (showAppTitles ? 'w-[40px] sm:w-[48px] lg:w-[60px]' : 'w-[48px] sm:w-[60px] lg:w-[70px]')} ${isDragging ? 'z-50' : ''}`}
    >
      {/* Halite Card */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`${currentSizeClass} ${appCardBorderRadius === 'small' ? 'rounded-lg' : appCardBorderRadius === 'full' ? 'rounded-full' : 'rounded-2xl'} transition duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${(backgroundImage || removeAppCardBorders) ? 'border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]' : 'border'} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          } ${glassmorphismEnabled
              ? (isDark
                ? `bg-black/20 backdrop-blur-md text-white hover:bg-black/30 ${removeAppCardBorders ? '' : 'border-[1.5px] border-white/15 hover:border-white/25'} shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]`
                : `bg-white/20 backdrop-blur-md text-black hover:bg-white/30 ${removeAppCardBorders ? '' : 'border-[1.5px] border-white/30 hover:border-white/40'} shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]`)
              : (isDark
                ? `bg-black text-white hover:bg-gray-900 ${removeAppCardBorders ? '' : 'border border-[#2C2D2D]'} shadow-[inset_0_0_20px_rgba(255,255,255,0.15),0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_0_25px_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.4)]`
                : `bg-white text-black hover:bg-white ${removeAppCardBorders ? '' : 'border border-[#e0e0e0]'} shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]`)
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''} ${hoverClass}`}
        style={{ 
          animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined,
          ...(appCardBackgroundColor ? { backgroundColor: appCardBackgroundColor } : {}),
          ...(appCardSize === 'custom' && customAppCardSize ? { width: `${customAppCardSize}px`, height: `${customAppCardSize}px` } : {})
        }}
        onClick={handleClick}
        onContextMenu={(e) => {
          if (!isEditModalOpen) {
            onContextMenu(e, app.id);
          }
        }}
      >
        {/* Inner Shadow Overlay */}
        {appCardInnerShadow !== 'none' && (
          <div className={`pointer-events-none absolute inset-0 rounded-inherit ${currentInnerShadowClass}`} style={{ borderRadius: 'inherit' }} />
        )}
        {/* Dynamic Grid of Mini Icons (2x2 diagonal, 3x1, or 2x2) */}
        {haliteUrls.length === 2 ? (
          <div className="w-full h-full p-1 relative z-10">
            {/* First icon - top left */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 flex items-center justify-center relative overflow-hidden rounded">
              {displayIcons[0] && displayIcons[0].trim() !== '' ? (
                <>
                  <img
                    src={displayIcons[0]}
                    alt={`${app.title} 1`}
                    className={`w-full h-full object-cover ${monochromeIcons ? 'grayscale contrast-125' : ''}`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.halite-fallback-0') as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="halite-fallback-0 hidden w-full h-full rounded flex items-center justify-center text-[8px] bg-white/20">
                    🔗
                  </div>
                </>
              ) : (
                <div className={`w-full h-full rounded flex items-center justify-center text-[8px] ${isDark ? 'bg-white/10 text-white/60' : 'bg-white/30 text-gray-600'}`}>
                  🔗
                </div>
              )}
            </div>
            {/* Second icon - bottom right */}
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-center justify-center relative overflow-hidden rounded">
              {displayIcons[1] && displayIcons[1].trim() !== '' ? (
                <>
                  <img
                    src={displayIcons[1]}
                    alt={`${app.title} 2`}
                    className={`w-full h-full object-cover ${monochromeIcons ? 'grayscale contrast-125' : ''}`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.halite-fallback-1') as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="halite-fallback-1 hidden w-full h-full rounded flex items-center justify-center text-[8px] bg-white/20">
                    🔗
                  </div>
                </>
              ) : (
                <div className={`w-full h-full rounded flex items-center justify-center text-[8px] ${isDark ? 'bg-white/10 text-white/60' : 'bg-white/30 text-gray-600'}`}>
                  🔗
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-1 grid gap-0.5 grid-cols-2 grid-rows-2 relative z-10">
            {haliteUrls.map((url, index) => {
              const hasIcon = displayIcons[index] && displayIcons[index].trim() !== '';
              return (
                <div key={index} className="w-full h-full flex items-center justify-center relative overflow-hidden rounded">
                  {hasIcon ? (
                    <>
                      <img
                        src={displayIcons[index]}
                        alt={`${app.title} ${index + 1}`}
                        className={`w-full h-full object-cover ${monochromeIcons ? 'grayscale contrast-125' : ''}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.halite-fallback') as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }
                        }}
                      />
                      <div className="halite-fallback hidden w-full h-full rounded flex items-center justify-center text-[8px] bg-white/20">
                        🔗
                      </div>
                    </>
                  ) : (
                    <div className={`halite-fallback w-full h-full rounded flex items-center justify-center text-[8px] ${isDark ? 'bg-white/10 text-white/60' : 'bg-white/30 text-gray-600'}`}>
                      🔗
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* App Title - Below the card (shown for halite if name is set) */}
      {showAppTitles && app.haliteName && (
        <div className={`mt-2 text-center w-full ${hideAppTitleText ? 'invisible' : ''}`}>
          <span className={`truncate text-xs font-medium ${appTitleColor === 'auto'
            ? (isDark ? 'text-white' : 'text-gray-800')
            : appTitleColor === 'black'
              ? 'text-black'
              : 'text-white'
            }`}>{app.haliteName}</span>
        </div>
      )}

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={() => onRemove(app.id)}
          className={`absolute -top-2 -right-2 ${
            glassmorphismEnabled 
              ? (isDark ? 'bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 hover:text-red-400' : 'bg-white/40 backdrop-blur-xl border border-black/10 text-black hover:bg-white/60 hover:text-red-500')
              : (isDark ? 'bg-[#1e1e1e] border border-[#333] text-white hover:bg-[#333] hover:text-red-400' : 'bg-white border border-gray-200 text-black hover:bg-gray-100 hover:text-red-500')
          } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-all duration-200 z-10 shadow-lg`}
          title="Remove app"
        >
          ×
        </button>
      )}
    </div>
  );
}

function SortableClockWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading flag
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : hoverAnimationStyle === 'pulse'
              ? 'hover:scale-[1.06]'
              : hoverAnimationStyle === 'float'
                ? 'hover:-translate-y-1.5'
                : hoverAnimationStyle === 'slide'
                  ? 'hover:translate-x-1'
                  : hoverAnimationStyle === 'glow'
                    ? 'hover:shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                    : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-white/10 backdrop-blur-xl backdrop-saturate-150 text-white ring-1 ring-white/15 shadow-[0_10px_28px_rgba(0,0,0,0.30)]'
                : 'bg-white/55 backdrop-blur-xl backdrop-saturate-150 text-gray-900 ring-1 ring-white/40 shadow-[0_10px_28px_rgba(0,0,0,0.12)]')
              : (isDark
                ? 'bg-white/12 backdrop-blur-xl text-white ring-1 ring-white/10 shadow-[0_10px_26px_rgba(0,0,0,0.35)]'
                : 'bg-white/80 backdrop-blur-xl text-gray-900 ring-1 ring-white/50 shadow-[0_10px_26px_rgba(0,0,0,0.10)]')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        {/* iOS-like sheen and soft highlights */}
        <div className="pointer-events-none absolute -top-10 -left-12 w-28 h-28 rounded-full bg-white/60 blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -bottom-12 -right-14 w-36 h-36 rounded-full bg-white/40 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.0)_45%)] opacity-70" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" />

        <div className="text-center flex flex-col justify-center items-center h-full relative z-10">
          <div suppressHydrationWarning className={`text-3xl sm:text-4xl font-semibold leading-tight tracking-tight font-sans ${widgetTextColor === 'auto'
            ? (isDark ? 'text-white' : 'text-gray-800')
            : widgetTextColor === 'black'
              ? 'text-black'
              : 'text-white'
            }`}>
            {mounted ? time.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: '2-digit' }) : '00:00'}
          </div>
          <div className="mt-1">
            <span suppressHydrationWarning className={`px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold text-[10px] sm:text-xs ${isDark ? 'bg-white/15' : 'bg-white/60'
              } ${widgetTextColor === 'auto'
                ? (isDark ? 'text-white' : 'text-gray-800')
                : widgetTextColor === 'black'
                  ? 'text-black'
                  : 'text-white'
              }`}>
              {mounted ? time.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' }).split(' ')[1] : 'AM'}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500/60 backdrop-blur-xl hover:bg-red-600/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-all duration-200 z-10 ring-1 ring-white/30 shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}

function WeatherWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [weather, setWeather] = useState({ temp: '22°', condition: 'Sunny', location: 'Loading...' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        setLoading(true);
        setError(false);

        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          throw new Error('Not in browser environment');
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        // Get current location with better error handling
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 15000,
            enableHighAccuracy: false, // Changed to false for better compatibility
            maximumAge: 300000 // 5 minutes cache
          });
        });

        const { latitude, longitude } = position.coords;

        // Fetch location name using reverse geocoding
        const locationResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (!locationResponse.ok) {
          throw new Error('Failed to fetch location data');
        }

        const locationData = await locationResponse.json();

        // For demo purposes, using mock weather data since we need an API key
        // In a real app, you would use a weather API like OpenWeatherMap or WeatherAPI
        const mockConditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear'];
        const mockCondition = mockConditions[Math.floor(Math.random() * mockConditions.length)];

        setWeather({
          temp: `${Math.round(15 + Math.random() * 20)}°`, // More realistic temperature range
          condition: mockCondition,
          location: locationData.city || locationData.locality || locationData.countryName || 'Unknown'
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching location/weather:', error);
        setError(true);
        setWeather({
          temp: '22°',
          condition: 'Sunny',
          location: 'Location unavailable'
        });
        setLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      fetchLocationAndWeather();
    }
    setMounted(true);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : hoverAnimationStyle === 'pulse'
              ? 'hover:scale-[1.06]'
              : hoverAnimationStyle === 'float'
                ? 'hover:-translate-y-1.5'
                : hoverAnimationStyle === 'slide'
                  ? 'hover:translate-x-1'
                  : hoverAnimationStyle === 'glow'
                    ? 'hover:shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                    : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-start justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-blue-400/20 backdrop-blur-md text-black border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-blue-300/20 backdrop-blur-md text-black border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gradient-to-br from-blue-400 via-gray-300 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm'
                : 'bg-gradient-to-br from-blue-300 via-gray-200 to-blue-300 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(parseInt(widget.id, 10) % 8) * 60}ms` : undefined }}
      >
        {/* Rain droplet effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-6 left-6 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-10 left-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-12 right-6 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>

        <div className="flex flex-col justify-center items-start h-full px-4 pl-6 relative z-10">
          <div suppressHydrationWarning className={`text-xs sm:text-sm font-bold leading-none mb-1 ${isDark ? 'text-black' : 'text-black'
            }`}>
            {mounted ? (loading ? 'Loading...' : error ? 'Location unavailable' : weather.location) : 'Loading...'}
          </div>
          <div className="flex items-center gap-1.5 relative z-10">
          {/* Month */}<div className="text-xs">
              {mounted ? (loading ? '⏳' : error ? '⚠️' :
                weather.condition === 'Sunny' ? '☀️' :
                  weather.condition === 'Cloudy' ? '☁️' :
                    weather.condition === 'Rainy' ? '🌧️' :
                      weather.condition === 'Partly Cloudy' ? '⛅' :
                        weather.condition === 'Clear' ? '🌙' : '⚡') : '⏳'}
            </div>
            <div suppressHydrationWarning className={`text-xs leading-none ${widgetTextColor === 'auto'
              ? (isDark ? 'text-black' : 'text-black')
              : widgetTextColor === 'black'
                ? 'text-black'
                : 'text-white'
              }`}>
              {mounted ? (loading ? 'Getting weather...' : error ? 'Check permissions' : weather.condition) : 'Getting weather...'}
            </div>
          </div>
          <div suppressHydrationWarning className={`text-xs leading-none mb-2 ${widgetTextColor === 'auto'
            ? (isDark ? 'text-black/80' : 'text-black/80')
            : widgetTextColor === 'black'
              ? 'text-black/80'
              : 'text-white/80'
            }`}>
            {mounted ? new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold leading-none ${widgetTextColor === 'auto'
            ? (isDark ? 'text-blue-800' : 'text-blue-800')
            : widgetTextColor === 'black'
              ? 'text-black'
              : 'text-white'
            }`}>
            {loading ? '...' : weather.temp}
          </div>
        </div>
      </div>

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}

function CalendarWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [date, setDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  // Get current week dates (Monday-first)
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
    const weekStart = new Date(today);
    // Adjust so Monday is the start; handle Sunday gracefully
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    weekStart.setDate(today.getDate() + diffToMonday);

    const weekDates = [] as Date[];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDates.push(d);
    }
    return weekDates;
  };

  useEffect(() => setMounted(true), []);
  const weekDates = getWeekDates();
  const currentDate = mounted ? date.getDate() : new Date().getDate();
  const currentMonth = mounted ? date.toLocaleDateString('en-US', { month: 'long' }) : new Date().toLocaleDateString('en-US', { month: 'long' });
  const today = new Date();
  const isSameDay = (a: Date, b: Date) => (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : hoverAnimationStyle === 'pulse'
              ? 'hover:scale-[1.06]'
              : hoverAnimationStyle === 'float'
                ? 'hover:-translate-y-1.5'
                : hoverAnimationStyle === 'slide'
                  ? 'hover:translate-x-1'
                  : hoverAnimationStyle === 'glow'
                    ? 'hover:shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                    : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-gray-800/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-white/20 backdrop-blur-md text-gray-800 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gray-800/90 text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-gray-700/30'
                : 'bg-white/95 text-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm border border-gray-200/50')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(parseInt(widget.id, 10) % 8) * 60}ms` : undefined }}
      >
        {/* Subtle accent */}
        <div className="pointer-events-none absolute -top-6 -right-8 w-20 h-20 bg-gradient-to-br from-indigo-500/15 via-violet-500/15 to-fuchsia-500/15 blur-2xl" />

        {/* Center current day number overlay with top margin */}
        <div className="absolute inset-0 flex justify-center items-start z-0 pointer-events-none">
          <div className={`text-[10rem] sm:text-[12rem] font-black select-none ${glassmorphismEnabled
              ? (isDark ? 'text-white/20' : 'text-gray-900/20')
              : (isDark ? 'text-white/12' : 'text-gray-900/12')
            }`}>
            {currentDate}
          </div>
        </div>


        <div className="flex flex-col justify-start items-start h-full p-3 pt-6 relative z-10">
          {/* Current Date Display */}
          <div className="flex items-center justify-center w-full mt-[12px] mb-3">
            <div suppressHydrationWarning className={`text-[13px] sm:text-sm font-semibold leading-none ${widgetTextColor === 'auto'
              ? (isDark ? 'text-white' : 'text-gray-900')
              : widgetTextColor === 'black'
                ? 'text-black'
                : 'text-white'
              }`}>
              {currentMonth}
            </div>
          </div>

          {/* Week View removed for minimal look */}
        </div>
      </div>

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}

function WaterTrackerWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [waterIntake, setWaterIntake] = useState(() => {
    // Initialize with saved value or 0
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`waterIntake_${widget.id}`);
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [lastResetDate, setLastResetDate] = useState(() => {
    // Initialize with saved date or today
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`lastResetDate_${widget.id}`);
      return saved || new Date().toDateString();
    }
    return new Date().toDateString();
  });
  const lastResetDateRef = useRef(lastResetDate);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    // Check for daily reset
    const today = new Date().toDateString();

    if (today !== lastResetDateRef.current) {
      // Reset for new day
      setWaterIntake(0);
      setLastResetDate(today);
      lastResetDateRef.current = today;
      localStorage.setItem(`waterIntake_${widget.id}`, '0');
      localStorage.setItem(`lastResetDate_${widget.id}`, today);
    }
  }, [widget.id]);

  useEffect(() => {
    // Save water intake to localStorage whenever it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem(`waterIntake_${widget.id}`, waterIntake.toString());
    }
  }, [waterIntake, widget.id]);

  const addWater = () => {
    setWaterIntake(prev => prev + 250); // 250ml per glass
  };

  const removeWater = () => {
    setWaterIntake(prev => Math.max(0, prev - 250)); // 250ml per glass, minimum 0
  };

  const saveWaterData = () => {
    localStorage.setItem(`waterIntake_${widget.id}`, waterIntake.toString());
    localStorage.setItem(`lastResetDate_${widget.id}`, lastResetDate);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-blue-400/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-blue-300/20 backdrop-blur-md text-white border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm'
                : 'bg-gradient-to-br from-blue-300 via-cyan-200 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-blue-200')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        <div className="text-center flex flex-col justify-center items-center h-full relative px-2 py-3">
          {/* Animated water droplets background */}
          <div className="absolute inset-0 opacity-20 overflow-hidden">
            <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-6 left-6 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>

          {/* Main water icon with enhanced styling */}
          <div className="relative mb-2">
            <div className={`text-2xl p-2 rounded-full border-2 border-white/40 bg-white/15 backdrop-blur-sm shadow-lg transition-all duration-300 ${waterIntake > 0 ? 'scale-110 border-white/60 bg-white/20' : ''
              }`}>
              💧
            </div>
            {/* Glow effect - only when water is added */}
            {waterIntake > 0 && (
              <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md scale-110 opacity-100 transition-opacity duration-300"></div>
            )}
          </div>

          {/* Water intake display with better typography */}
          <div className={`text-sm font-bold mb-2 leading-none tracking-wide ${widgetTextColor === 'auto'
            ? (isDark ? 'text-white drop-shadow-sm' : 'text-white drop-shadow-sm')
            : widgetTextColor === 'black'
              ? 'text-black drop-shadow-sm'
              : 'text-white drop-shadow-sm'
            }`}>
            {waterIntake}ml
          </div>

          {/* Progress indicator */}
          <div className="w-14 h-1 bg-white/20 rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-white/60 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min((waterIntake / 2000) * 100, 100)}%` }}
            ></div>
          </div>

          {/* Enhanced buttons with better UX */}
          <div className="flex gap-2 items-center">
            <button
              onClick={removeWater}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg z-10 ${isDark
                ? 'bg-red-500/80 hover:bg-red-400 text-white border border-red-400/50'
                : 'bg-red-400 hover:bg-red-300 text-white border border-red-300/50'
                }`}
              title="Remove 250ml"
            >
              -
            </button>

            {/* Center indicator */}
            <div className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-white/80' : 'bg-white/20 text-white/90'
              }`}>
              {Math.ceil(waterIntake / 250)}
            </div>

            <button
              onClick={addWater}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg z-10 ${isDark
                ? 'bg-blue-500/80 hover:bg-blue-400 text-white border border-blue-400/50'
                : 'bg-blue-400 hover:bg-blue-300 text-white border border-blue-300/50'
                }`}
              title="Add 250ml"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}

function QuickNotesWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [notes, setNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`notes_${widget.id}`);
      return saved || '';
    }
    return '';
  });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`notes_${widget.id}`, notes);
    }
  }, [notes, widget.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-yellow-500/15 backdrop-blur-md text-yellow-100 border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-yellow-400/15 backdrop-blur-md text-yellow-50 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gradient-to-br from-orange-600 via-yellow-600 to-orange-700 text-yellow-100 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm border border-orange-500/30'
                : 'bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 text-yellow-50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm border border-orange-400/30')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-3 left-4 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
        </div>

        <div className="flex flex-col justify-start items-start h-full p-3 relative z-10">
          <div className="w-full h-full">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="New note..."
              className={`w-full h-full bg-transparent border-none outline-none resize-none text-xs leading-tight placeholder-yellow-200/70 ${widgetTextColor === 'auto'
                ? (isDark ? 'text-yellow-100' : 'text-yellow-50')
                : widgetTextColor === 'black'
                  ? 'text-black'
                  : 'text-white'
                }`}
              style={{
                fontFamily: 'inherit',
                lineHeight: '1.2'
              }}
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>
      </div>

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}



function PhotoWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    let revokedUrl: string | null = null;
    (async () => {
      try {
        const url = await getImageObjectUrl(`photo_${widget.id}`);
        if (url) {
          setPhotoUrl(url);
          revokedUrl = url;
        }
      } catch { }
    })();
    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [widget.id]);

  const style = { transform: CSS.Transform.toString(transform), transition };
  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : hoverAnimationStyle === 'pulse'
              ? 'hover:scale-[1.06]'
              : hoverAnimationStyle === 'float'
                ? 'hover:-translate-y-1.5'
                : hoverAnimationStyle === 'slide'
                  ? 'hover:translate-x-1'
                  : hoverAnimationStyle === 'glow'
                    ? 'hover:shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                    : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isDragging ? 'z-50' : ''}`}>
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-300 ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${glassmorphismEnabled
              ? (isDark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-white/70 ring-1 ring-white/40')
              : (isDark ? 'bg-[#111] ring-1 ring-white/10' : 'bg-white ring-1 ring-gray-200')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
        ) : (
          <div className={`text-center px-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
            <div className="text-[10px] mb-1">No photo</div>
            {isEditModalOpen && (
              <label className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md cursor-pointer ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await saveImageBlob(`photo_${widget.id}`, file);
                      const url = await getImageObjectUrl(`photo_${widget.id}`);
                      if (url) setPhotoUrl(url);
                    } catch { }
                  }}
                />
                Upload
              </label>
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}
function FidgetSpinnerWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : hoverAnimationStyle === 'pulse'
              ? 'hover:scale-[1.06]'
              : hoverAnimationStyle === 'float'
                ? 'hover:-translate-y-1.5'
                : hoverAnimationStyle === 'slide'
                  ? 'hover:translate-x-1'
                  : hoverAnimationStyle === 'glow'
                    ? 'hover:shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                    : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  const [angle, setAngle] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const lastPointerAngleRef = useRef<number | null>(null);
  const armColors = isDark ? ['#f472b6', '#22d3ee', '#fbbf24'] : ['#d946ef', '#06b6d4', '#f59e0b'];

  const animate = (time: number) => {
    if (lastTimeRef.current == null) lastTimeRef.current = time;
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    const v = velocityRef.current;
    if (Math.abs(v) > 0.1) {
      setAngle((prev) => (prev + (v * dt) / 1000) % 360);
      velocityRef.current = v * 0.985;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      velocityRef.current = 0;
      lastTimeRef.current = null;
      rafRef.current = null;
    }
  };

  const kick = (power = 720) => {
    velocityRef.current += power;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (isEditModalOpen) return;
    draggingRef.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    lastPointerAngleRef.current = Math.atan2(dy, dx) * (180 / Math.PI);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || isEditModalOpen) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const current = Math.atan2(dy, dx) * (180 / Math.PI);
    const prev = lastPointerAngleRef.current;
    if (prev != null) {
      let delta = current - prev;
      // Normalize to [-180, 180]
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setAngle((a) => (a + delta) % 360);
      // Update velocity based on pointer delta
      velocityRef.current = delta * 40; // scale factor for inertia feel
    }
    lastPointerAngleRef.current = current;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    lastPointerAngleRef.current = null;
    if (rafRef.current == null && Math.abs(velocityRef.current) > 0.1) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  const dragProps = isEditModalOpen ? { ...attributes, ...listeners } : {};
  const pointerProps = !isEditModalOpen ? { onPointerDown, onPointerMove, onPointerUp } : {};

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isDragging ? 'z-50' : ''}`}>
      <div
        {...dragProps}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          } ${glassmorphismEnabled
              ? (isDark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-white/60 ring-1 ring-white/40')
              : (isDark ? 'bg-[#111] ring-1 ring-white/10' : 'bg-white ring-1 ring-gray-200')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
        onClick={() => {
          if (!isEditModalOpen) {
            kick(960);
            setIsPopping(true);
            setTimeout(() => setIsPopping(false), 160);
          }
        }}
        {...pointerProps}
      >
        <div className={`relative transition-transform ${isPopping ? 'scale-105' : 'scale-100'}`} style={{ width: '68%', height: '68%' }}>
          <div
            className="absolute inset-0"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: '50% 50%' }}
          >
            {[0, 120, 240].map((deg, idx) => (
              <div key={`line-${deg}`} className="absolute top-1/2 left-1/2" style={{ transform: `rotate(${deg}deg)` }}>
                <div
                  style={{
                    width: '2.5px',
                    height: 'calc(50% - 14px)',
                    transform: 'translate(-50%, -98%)',
                    borderRadius: '9999px',
                    background: `linear-gradient(180deg, rgba(255,255,255,${isDark ? 0.12 : 0.18}) 0%, ${armColors[idx]} 65%, ${armColors[idx]} 100%)`,
                    boxShadow: `0 0 8px ${armColors[idx]}33`,
                    opacity: 0.95,
                    pointerEvents: 'none'
                  }}
                />
              </div>
            ))}
            {[0, 120, 240].map((deg, idx) => (
              <div key={deg} className="absolute top-1/2 left-1/2" style={{ transform: `rotate(${deg}deg) translateY(-112%)` }}>
                <div className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.25)] ${idx === 0 ? (isDark ? 'bg-fuchsia-400' : 'bg-fuchsia-500') : idx === 1 ? (isDark ? 'bg-cyan-300' : 'bg-cyan-400') : (isDark ? 'bg-amber-300' : 'bg-amber-400')
                  }`}>
                  <div className={`absolute inset-0 rounded-full blur-md opacity-60 ${idx === 0 ? 'bg-fuchsia-500' : idx === 1 ? 'bg-cyan-400' : 'bg-amber-400'
                    }`} />
                  <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isDark ? 'bg-gray-900' : 'bg-white'}`} />
                </div>
              </div>
            ))}
            {/* trailing glow ring */}
            <div className={`pointer-events-none absolute inset-0 rounded-full ${isDark ? 'ring-white/10' : 'ring-black/10'}`} style={{ boxShadow: `inset 0 0 0 2px ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full ${isDark ? 'bg-white' : 'bg-gray-900'} shadow-inner flex items-center justify-center`}>
                <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${isDark ? 'bg-gray-900' : 'bg-white'}`} />
                <div className={`pointer-events-none absolute inset-0 rounded-full blur-md opacity-40 ${isDark ? 'bg-white' : 'bg-black'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}

function SpacerWidget({ widget, onRemove, isEditModalOpen, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle, isDark }: { widget: Widget; onRemove: () => void; isEditModalOpen: boolean; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow'; isDark: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt'
      ? 'hover:-rotate-3 hover:translate-y-[-2px]'
      : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
          ? 'hover:rotate-6'
          : hoverAnimationStyle === 'bounce'
            ? 'hover:-translate-y-1'
            : 'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${isEditModalOpen
            ? (isDark ? 'border-2 border-dashed border-white/30' : 'border-2 border-dashed border-gray-400')
            : 'border-0'
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        {isEditModalOpen && (
          <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/70' : 'text-gray-600/80'}`}>Spacer</div>
        )}
      </div>

      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}

// StickyNoteWidget removed

function PomodoroWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    if (isRunning && time > 0) {
      const timer = setInterval(() => setTime(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (time === 0) {
      setIsRunning(false);
    }
  }, [isRunning, time]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const progress = 1 - (time / (25 * 60));

  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt' ? 'hover:-rotate-3 hover:translate-y-[-2px]' :
      hoverAnimationStyle === 'skew' ? 'hover:skew-x-3 hover:skew-y-1' :
        hoverAnimationStyle === 'spin' ? 'hover:rotate-180' :
          hoverAnimationStyle === 'bounce' ? 'hover:animate-bounce' :
            hoverAnimationStyle === 'pulse' ? 'hover:animate-pulse' :
              hoverAnimationStyle === 'float' ? 'hover:-translate-y-2' :
                hoverAnimationStyle === 'slide' ? 'hover:translate-x-2' :
                  hoverAnimationStyle === 'glow' ? 'hover:shadow-lg hover:shadow-red-400/50' :
                    'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative group ${isDragging ? 'z-50' : ''}`}>
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        onClick={() => !isEditModalOpen && setIsRunning(!isRunning)}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-red-400/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-red-300/20 backdrop-blur-md text-white border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm'
                : 'bg-gradient-to-br from-red-400 via-orange-400 to-red-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-red-200')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        <div className="absolute inset-0 rounded-3xl" style={{ background: `conic-gradient(from 0deg, rgba(255,255,255,0.3) ${progress * 360}deg, transparent ${progress * 360}deg)` }} />
        <div className={`text-lg sm:text-xl font-bold ${widgetTextColor === 'auto' ? (isDark ? 'text-white' : 'text-white') : widgetTextColor === 'black' ? 'text-black' : 'text-white'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xs mt-1 opacity-80">🍅</div>
      </div>
      {isEditModalOpen && (
        <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold z-10">×</button>
      )}
    </div>
  );
}


function DiceWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    const rolls = Array.from({ length: 10 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.forEach((roll, i) => {
      setTimeout(() => setValue(roll), i * 50);
    });
    setTimeout(() => setRolling(false), 500);
  };

  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt' ? 'hover:-rotate-3 hover:translate-y-[-2px]' :
      hoverAnimationStyle === 'skew' ? 'hover:skew-x-3 hover:skew-y-1' :
        hoverAnimationStyle === 'spin' ? 'hover:rotate-180' :
          hoverAnimationStyle === 'bounce' ? 'hover:animate-bounce' :
            hoverAnimationStyle === 'pulse' ? 'hover:animate-pulse' :
              hoverAnimationStyle === 'float' ? 'hover:-translate-y-2' :
                hoverAnimationStyle === 'slide' ? 'hover:translate-x-2' :
                  hoverAnimationStyle === 'glow' ? 'hover:shadow-lg hover:shadow-green-400/50' :
                    'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative group ${isDragging ? 'z-50' : ''}`}>
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        onClick={() => !isEditModalOpen && roll()}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-green-400/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-green-300/20 backdrop-blur-md text-white border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm'
                : 'bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-green-200')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''} ${rolling ? 'animate-spin' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        <div className={`text-3xl sm:text-4xl font-bold ${widgetTextColor === 'auto' ? (isDark ? 'text-white' : 'text-white') : widgetTextColor === 'black' ? 'text-black' : 'text-white'}`}>
          {value}
        </div>
      </div>
      {isEditModalOpen && (
        <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold z-10">×</button>
      )}
    </div>
  );
}

function CoinFlipWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex, animateIconsEnabled, animateWidgetsEnabled, hoverAnimationStyle }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number; animateIconsEnabled: boolean; animateWidgetsEnabled: boolean; hoverAnimationStyle: 'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow' }) {
  const [side, setSide] = useState<'H' | 'T'>('H');
  const [flipping, setFlipping] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    setTimeout(() => {
      setSide(Math.random() > 0.5 ? 'H' : 'T');
      setFlipping(false);
    }, 500);
  };

  const widgetHoverClass = animateWidgetsEnabled && animateIconsEnabled
    ? hoverAnimationStyle === 'tilt' ? 'hover:-rotate-3 hover:translate-y-[-2px]' :
      hoverAnimationStyle === 'skew' ? 'hover:skew-x-3 hover:skew-y-1' :
        hoverAnimationStyle === 'spin' ? 'hover:rotate-180' :
          hoverAnimationStyle === 'bounce' ? 'hover:animate-bounce' :
            hoverAnimationStyle === 'pulse' ? 'hover:animate-pulse' :
              hoverAnimationStyle === 'float' ? 'hover:-translate-y-2' :
                hoverAnimationStyle === 'slide' ? 'hover:translate-x-2' :
                  hoverAnimationStyle === 'glow' ? 'hover:shadow-lg hover:shadow-yellow-400/50' :
                    'hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative group ${isDragging ? 'z-50' : ''}`}>
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        onClick={() => !isEditModalOpen && flip()}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-yellow-400/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-yellow-300/20 backdrop-blur-md text-white border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm'
                : 'bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-yellow-200')
          } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''} ${flipping ? 'animate-spin' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        <div className={`text-2xl sm:text-3xl font-bold ${widgetTextColor === 'auto' ? (isDark ? 'text-white' : 'text-white') : widgetTextColor === 'black' ? 'text-black' : 'text-white'}`}>
          {side}
        </div>
      </div>
      {isEditModalOpen && (
        <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold z-10">×</button>
      )}
    </div>
  );
}

function AnalogClockWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor, jiggleIndex }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number }) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  useEffect(() => setMounted(true), []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate clock hands angles
  const seconds = mounted ? time.getSeconds() : 0;
  const minutes = mounted ? time.getMinutes() : 0;
  const hours = mounted ? (time.getHours() % 12) : 0;

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours + minutes / 60) / 12) * 360;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''
          } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${glassmorphismEnabled
              ? (isDark
                ? 'bg-gray-900/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'bg-white/20 backdrop-blur-md text-black border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm'
                : 'bg-gradient-to-br from-white via-gray-50 to-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-gray-100')
          }`}
      >
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-26 lg:h-26 xl:w-28 xl:h-28">
          {/* Clock face */}
          <div className={`w-full h-full rounded-full ${isDark ? 'bg-black' : 'bg-white'} shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center relative p-2`}>
            {/* Roman numerals for cardinal hours */}
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${isDark ? 'text-white' : 'text-gray-800'
              }`}>XII</div>
            <div className={`absolute top-1/2 right-2 transform -translate-y-1/2 text-xs font-medium ${isDark ? 'text-white' : 'text-gray-800'
              }`}>III</div>
            <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${isDark ? 'text-white' : 'text-gray-800'
              }`}>VI</div>
            <div className={`absolute top-1/2 left-2 transform -translate-y-1/2 text-xs font-medium ${isDark ? 'text-white' : 'text-gray-800'
              }`}>IX</div>

            {/* Hour markers (small dashes) */}
            {[1, 2, 4, 5, 7, 8, 10, 11].map((hour) => {
              const angle = (hour / 12) * 360;
              const radius = 3; // Adjusted for padding
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

              return (
                <div
                  key={hour}
                  className="absolute w-0.5 h-1 bg-gray-400 rounded-full"
                  style={{
                    left: `calc(50% + ${x}rem)`,
                    top: `calc(50% + ${y}rem)`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`
                  }}
                />
              );
            })}

            {/* Clock center dot */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 z-10 shadow-sm"></div>
          </div>

          {/* Hour hand */}
          <div
            className="absolute top-1/2 left-1/2 w-1 h-8 origin-bottom bg-gray-800 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)`
            }}
          ></div>

          {/* Minute hand */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-10 origin-bottom bg-gray-800 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)`
            }}
          ></div>

          {/* Second hand */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-11 origin-bottom bg-red-500 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${secondDegrees}deg)`
            }}
          ></div>
        </div>
      </div>

      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [apps, setApps] = useState<App[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showAppTitles, setShowAppTitles] = useState(true);
  const [hideAppTitleText, setHideAppTitleText] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [searchBarWidth, setSearchBarWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');
  const [compactSearchBar, setCompactSearchBar] = useState<boolean>(false);

  const [monochromeIcons, setMonochromeIcons] = useState<boolean>(false);
  const [appCardBorderRadius, setAppCardBorderRadius] = useState<'small' | 'medium' | 'full'>('medium');
  const [removeAppCardBorders, setRemoveAppCardBorders] = useState<boolean>(false);
  const [appCardSize, setAppCardSize] = useState<'small' | 'normal' | 'large' | 'custom'>('normal');
  const [customAppCardSize, setCustomAppCardSize] = useState<number>(64);
  const [appCardGapX, setAppCardGapX] = useState<number>(16);
  const [appCardInnerShadow, setAppCardInnerShadow] = useState<'none' | 'small' | 'medium' | 'large'>('none');
  const [appCardBackgroundColor, setAppCardBackgroundColor] = useState<string>('');

  const [youtubeSearchMode, setYoutubeSearchMode] = useState<boolean>(false);
  const [haliteFolderName, setHaliteFolderName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [backgroundBlur, setBackgroundBlur] = useState<number>(0);
  const [glassmorphismEnabled, setGlassmorphismEnabled] = useState<boolean>(false);
  const [appTitleColor, setAppTitleColor] = useState<'auto' | 'black' | 'white'>('auto');
  const [widgetTextColor, setWidgetTextColor] = useState<'auto' | 'black' | 'white'>('auto');
  const [normalModeEnabled, setNormalModeEnabled] = useState<boolean>(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading flag
  const [isResetting, setIsResetting] = useState(false); // Add reset flag

  const [animateIconsEnabled, setAnimateIconsEnabled] = useState<boolean>(false);
  const [hoverAnimationStyle, setHoverAnimationStyle] = useState<'scale' | 'tilt' | 'skew' | 'spin' | 'bounce' | 'pulse' | 'float' | 'slide' | 'glow'>('scale');
  const [animateWidgetsEnabled, setAnimateWidgetsEnabled] = useState<boolean>(false);
  const [centerAppsGroup, setCenterAppsGroup] = useState<boolean>(false);

  const [fullRoundedIconsEnabled, setFullRoundedIconsEnabled] = useState<boolean>(false);

  const [showBookmarks, setShowBookmarks] = useState<boolean>(true);
  const [bookmarkStyle, setBookmarkStyle] = useState<'cards' | 'chips' | 'list' | 'minimal' | 'compact' | 'modern'>('cards');
  const [showBookmarksTitle, setShowBookmarksTitle] = useState<boolean>(true);
  const [centerBookmarksGroup, setCenterBookmarksGroup] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState<boolean>(false);
  const [bookmarkTitleInput, setBookmarkTitleInput] = useState<string>('');
  const [bookmarkUrlInput, setBookmarkUrlInput] = useState<string>('');
  const [isQuickAppOpen, setIsQuickAppOpen] = useState<boolean>(false);
  const [quickAppTitleInput, setQuickAppTitleInput] = useState<string>('');
  const [quickAppUrlInput, setQuickAppUrlInput] = useState<string>('');
  const [isHaliteModalOpen, setIsHaliteModalOpen] = useState<boolean>(false);
  const [haliteUrls, setHaliteUrls] = useState<string[]>(['', '', '', '']);
  const [appGroupMarginTop, setAppGroupMarginTop] = useState<number>(240);

  const [userName, setUserName] = useState<string>('user');
  const [greetingStyle, setGreetingStyle] = useState<'hi' | 'welcome' | 'time-based'>('hi');
  const [isNameEditorOpen, setIsNameEditorOpen] = useState<boolean>(false);
  const [isGreetingDropdownOpen, setIsGreetingDropdownOpen] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('user');
  const nameEditorRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const greetingDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState<boolean>(false);

  // Usage statistics
  const [appClickCounts, setAppClickCounts] = useState<Record<string, number>>({});
  const [appLastClicked, setAppLastClicked] = useState<Record<string, number>>({});
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0); // in seconds (cumulative)
  const [previousTimeSpent, setPreviousTimeSpent] = useState<number>(0); // time from previous sessions
  const [sessionStartTime] = useState<number>(Date.now());

  const [showTopTime, setShowTopTime] = useState<boolean>(true);
  const [topPillSize, setTopPillSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [topPillStyle, setTopPillStyle] = useState<'card' | 'text'>('card');
  const [mergeTopPillsCenter, setMergeTopPillsCenter] = useState<boolean>(false);
  const [topPillShape, setTopPillShape] = useState<'pill' | 'squircle'>('pill');
  const [animatedGradientBackground, setAnimatedGradientBackground] = useState<boolean>(false);
  const [animatedGradientPreset, setAnimatedGradientPreset] = useState<'default' | 'ocean' | 'sunset' | 'aurora' | 'midnight'>('default');
  const [dockVisibility, setDockVisibility] = useState<'always' | 'hover'>('always');
  const [topClockTime, setTopClockTime] = useState<Date>(new Date());
  const [showBigClock, setShowBigClock] = useState<boolean>(false);
  const [bigClockTime, setBigClockTime] = useState<Date>(new Date());
  const [bigClockMarginTop, setBigClockMarginTop] = useState<number>(128);
  const [bigClockColor, setBigClockColor] = useState<string>('');
  const [bigClockFont, setBigClockFont] = useState<string>('default');
  const [bigClockSize, setBigClockSize] = useState<'small' | 'medium' | 'large' | 'huge'>('medium');
  const [bigClockGlassMode, setBigClockGlassMode] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; appId: string } | null>(null);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [editAppTitle, setEditAppTitle] = useState<string>('');
  const [editAppUrl, setEditAppUrl] = useState<string>('');
  const [fontFamily, setFontFamily] = useState<'default' | 'serif' | 'mono' | 'sans' | 'elegant' | 'poppins' | 'fun'>('default');



  const displayName = userName.trim() || 'user';
  const topClockLabel = topClockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Get greeting text based on style
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update fluid theme color CSS variable when color changes


  useEffect(() => {
    if (!isNameEditorOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (nameEditorRef.current && !nameEditorRef.current.contains(event.target as Node)) {
        setIsNameEditorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isNameEditorOpen]);

  useEffect(() => {
    if (isNameEditorOpen) {
      setNameInput(userName);
      const focusTimer = window.setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 0);
      return () => window.clearTimeout(focusTimer);
    }
  }, [isNameEditorOpen, userName]);

  // Close context menu on outside click or Escape key
  useEffect(() => {
    if (!contextMenu) return;

    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside the context menu
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]')) {
        setContextMenu(null);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Close when right-clicking elsewhere
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]')) {
        setContextMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };

    // Add a small delay to avoid closing immediately when opening
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('contextmenu', handleContextMenu, true);
      document.addEventListener('keydown', handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Close greeting dropdown on outside click
  useEffect(() => {
    if (!isGreetingDropdownOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (greetingDropdownRef.current && !greetingDropdownRef.current.contains(target)) {
        setIsGreetingDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGreetingDropdownOpen(false);
      }
    };

    // Add a small delay to avoid closing immediately when opening
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGreetingDropdownOpen]);

  // Close name editor on outside click
  useEffect(() => {
    if (!isNameEditorOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (nameEditorRef.current && !nameEditorRef.current.contains(target)) {
        setIsNameEditorOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNameEditorOpen(false);
      }
    };

    // Add a small delay to avoid closing immediately when opening
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNameEditorOpen]);

  useEffect(() => {
    if (!showTopTime) return;
    setTopClockTime(new Date());
    const intervalId = window.setInterval(() => {
      setTopClockTime(new Date());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [showTopTime]);

  useEffect(() => {
    if (!showBigClock) return;
    setBigClockTime(new Date());
    const intervalId = window.setInterval(() => {
      setBigClockTime(new Date());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [showBigClock]);

  // Load saved state on mount to avoid hydration mismatch
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    console.log('🔄 Loading saved state from localStorage...');
    setIsLoading(true); // Set loading to true before loading

    try {
      // Load apps
      const savedApps = localStorage.getItem('favoriteApps');
      if (savedApps) {
        const parsedApps = JSON.parse(savedApps);
        setApps(parsedApps);
        console.log('✅ Apps loaded:', parsedApps.length);
      } else {
        setApps(defaultApps);
        console.log('🔄 No apps saved, using defaults');
      }

      // Load widgets
      const savedWidgets = localStorage.getItem('widgets');
      if (savedWidgets) {
        const parsedWidgets = JSON.parse(savedWidgets);
        setWidgets(parsedWidgets);
        console.log('✅ Widgets loaded:', parsedWidgets.length);
      } else {
        setWidgets(defaultWidgets);
        console.log('🔄 No widgets saved, using defaults');
      }

      // Load bookmarks
      try {
        const savedBookmarks = localStorage.getItem('bookmarks');
        if (savedBookmarks) {
          const parsed = JSON.parse(savedBookmarks);
          setBookmarks(parsed);
          console.log('✅ Bookmarks loaded:', parsed.length);
        } else {
          setBookmarks(defaultBookmarks);
        }
      } catch { }

      // Load bookmarks toggle
      try {
        const savedShowBm = localStorage.getItem('showBookmarks');
        if (savedShowBm != null) setShowBookmarks(savedShowBm === 'true');
        const savedShowBmTitle = localStorage.getItem('showBookmarksTitle');
        if (savedShowBmTitle != null) setShowBookmarksTitle(savedShowBmTitle === 'true');
        const savedCenterBm = localStorage.getItem('centerBookmarksGroup');
        if (savedCenterBm != null) setCenterBookmarksGroup(savedCenterBm === 'true');
        const savedBmStyle = localStorage.getItem('bookmarkStyle');
        if (savedBmStyle === 'chips' || savedBmStyle === 'cards') setBookmarkStyle(savedBmStyle);
      } catch { }

      // Load theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        console.log('✅ Theme loaded from localStorage:', savedTheme);

        // Apply theme to document immediately
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Use system preference if no theme saved
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        console.log('🌐 Using system preference:', prefersDark ? 'dark' : 'light');

        // Apply system preference to document
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Load show app titles
      const savedShowAppTitles = localStorage.getItem('showAppTitles');
      if (savedShowAppTitles !== null) {
        setShowAppTitles(savedShowAppTitles === 'true');
        console.log('✅ Show app titles loaded:', savedShowAppTitles === 'true');
      }
      const savedHideAppTitleText = localStorage.getItem('hideAppTitleText');
      if (savedHideAppTitleText !== null) {
        setHideAppTitleText(savedHideAppTitleText === 'true');
        console.log('✅ Hide app title text loaded:', savedHideAppTitleText === 'true');
      }
      const savedShowSearchBar = localStorage.getItem('showSearchBar');
      if (savedShowSearchBar !== null) {
        setShowSearchBar(savedShowSearchBar === 'true');
        console.log('✅ Show search bar loaded:', savedShowSearchBar === 'true');
      }

      const savedBigClockMarginTop = localStorage.getItem('bigClockMarginTop');
      if (savedBigClockMarginTop !== null) {
        const margin = parseInt(savedBigClockMarginTop, 10);
        setBigClockMarginTop(isNaN(margin) ? 128 : margin);
      }

      const savedBigClockColor = localStorage.getItem('bigClockColor');
      if (savedBigClockColor) setBigClockColor(savedBigClockColor);

      const savedBigClockSize = localStorage.getItem('bigClockSize');
      if (savedBigClockSize) setBigClockSize(savedBigClockSize as any);

      const savedBigClockGlassMode = localStorage.getItem('bigClockGlassMode');
      if (savedBigClockGlassMode !== null) setBigClockGlassMode(savedBigClockGlassMode === 'true');

      const savedSearchBarWidth = localStorage.getItem('searchBarWidth');
      if (savedSearchBarWidth && (savedSearchBarWidth === 'narrow' || savedSearchBarWidth === 'medium' || savedSearchBarWidth === 'wide')) {
        setSearchBarWidth(savedSearchBarWidth as 'narrow' | 'medium' | 'wide');
        console.log('✅ Search bar width loaded:', savedSearchBarWidth);
      }

      const savedCompactSearchBar = localStorage.getItem('compactSearchBar');
      if (savedCompactSearchBar !== null) {
        setCompactSearchBar(savedCompactSearchBar === 'true');
        console.log('✅ Compact search bar loaded:', savedCompactSearchBar === 'true');
      }

      const savedMonochromeIcons = localStorage.getItem('monochromeIcons');
      if (savedMonochromeIcons !== null) {
        setMonochromeIcons(savedMonochromeIcons === 'true');
        console.log('✅ Monochrome icons loaded:', savedMonochromeIcons === 'true');
      }


      const savedCenterAppsGroup = localStorage.getItem('centerAppsGroup');
      if (savedCenterAppsGroup !== null) {
        setCenterAppsGroup(savedCenterAppsGroup === 'true');
        console.log('✅ Center apps group loaded:', savedCenterAppsGroup === 'true');
      }

      // Always start with an empty search term on load

      // Load background image from IndexedDB if flag is set
      const hasBackground = localStorage.getItem('hasBackgroundImage');
      if (hasBackground === 'true') {
        console.log('🔍 Loading background from IndexedDB...');
        (async () => {
          try {
            const blobUrl = await getImageObjectUrl('backgroundImage');
            if (blobUrl) {
              setBackgroundImage(blobUrl);
              console.log('✅ Background loaded from IndexedDB');
            } else {
              console.warn('⚠️ Flag set but no image in IndexedDB');
              localStorage.removeItem('hasBackgroundImage');
            }
          } catch (err) {
            console.error('❌ Failed to load from IndexedDB:', err);
            localStorage.removeItem('hasBackgroundImage');
          }
        })();
      } else {
        console.log('ℹ️ No background image');
      }

      // Load background blur
      const savedBackgroundBlur = localStorage.getItem('backgroundBlur');
      if (savedBackgroundBlur !== null) {
        const blurValue = parseInt(savedBackgroundBlur, 10);
        setBackgroundBlur(isNaN(blurValue) ? 0 : blurValue);
        console.log('✅ Background blur loaded:', blurValue);
      }

      // Load app title color
      const savedAppTitleColor = localStorage.getItem('appTitleColor');
      if (savedAppTitleColor) {
        setAppTitleColor(savedAppTitleColor as 'auto' | 'black' | 'white');
        console.log('✅ App title color loaded:', savedAppTitleColor);
      }

      // Load widget text color
      const savedWidgetTextColor = localStorage.getItem('widgetTextColor');
      if (savedWidgetTextColor) {
        setWidgetTextColor(savedWidgetTextColor as 'auto' | 'black' | 'white');
        console.log('✅ Widget text color loaded:', savedWidgetTextColor);
      }



      // Load animate icons toggle
      const savedAnimate = localStorage.getItem('animateIconsEnabled');
      if (savedAnimate !== null) {
        setAnimateIconsEnabled(savedAnimate === 'true');
        console.log('✅ Animate icons loaded:', savedAnimate === 'true');
      }

      // Load animate widgets toggle
      const savedAnimateWidgets = localStorage.getItem('animateWidgetsEnabled');
      if (savedAnimateWidgets !== null) {
        setAnimateWidgetsEnabled(savedAnimateWidgets === 'true');
        console.log('✅ Animate widgets loaded:', savedAnimateWidgets === 'true');
      }

      // Load hover animation style
      const savedHover = localStorage.getItem('hoverAnimationStyle');
      if (
        savedHover === 'scale' || savedHover === 'tilt' || savedHover === 'skew' ||
        savedHover === 'spin' || savedHover === 'bounce' || savedHover === 'pulse' ||
        savedHover === 'float' || savedHover === 'slide' || savedHover === 'glow'
      ) {
        setHoverAnimationStyle(savedHover);
        console.log('✅ Hover animation style loaded:', savedHover);
      }

      const savedAppMargin = localStorage.getItem('appGroupMarginTop');
      if (savedAppMargin !== null) {
        const parsedMargin = parseInt(savedAppMargin, 10);
        if (!Number.isNaN(parsedMargin)) {
          setAppGroupMarginTop(parsedMargin);
          console.log('✅ App cards margin top loaded:', parsedMargin);
        }
      }



      const savedUserName = localStorage.getItem('userName');
      if (savedUserName) {
        setUserName(savedUserName);
        setNameInput(savedUserName);
        console.log('✅ User name loaded:', savedUserName);
      }





      // Load visual modes - this is critical for persistence
      const savedNormal = localStorage.getItem('normalModeEnabled');
      const savedGlass = localStorage.getItem('glassmorphismEnabled');



      console.log('🔍 Mode settings found in localStorage:', {
        normal: savedNormal,
        glass: savedGlass
      });

      // Set modes based on saved values, ensuring only one is active
      if (savedNormal === 'true') {
        setNormalModeEnabled(true);
        setGlassmorphismEnabled(false);
        console.log('✅ Normal mode restored from localStorage');
      } else if (savedGlass === 'true') {
        setNormalModeEnabled(false);
        setGlassmorphismEnabled(true);
        console.log('✅ Glassmorphism mode restored from localStorage');
      } else {
        // No modes saved, default to normal
        setNormalModeEnabled(true);
        setGlassmorphismEnabled(false);
        console.log('🔄 No modes saved, defaulting to normal mode');
      }

      // Load app card border radius
      const savedFullRounded = localStorage.getItem('fullRoundedIconsEnabled');
      const savedAppCardBorderRadius = localStorage.getItem('appCardBorderRadius');

      if (savedFullRounded === 'true') {
        setAppCardBorderRadius('full');
      } else if (savedAppCardBorderRadius === 'small' || savedAppCardBorderRadius === 'medium' || savedAppCardBorderRadius === 'full') {
        setAppCardBorderRadius(savedAppCardBorderRadius as 'small' | 'medium' | 'full');
      } else if (savedAppCardBorderRadius === 'large') {
        setAppCardBorderRadius('full');
      }

      // Load remove app card borders
      const savedRemoveBorders = localStorage.getItem('removeAppCardBorders');
      if (savedRemoveBorders !== null) {
        setRemoveAppCardBorders(savedRemoveBorders === 'true');
        console.log('✅ Remove borders loaded:', savedRemoveBorders === 'true');
      }

      // Load app card size
      const savedAppCardSize = localStorage.getItem('appCardSize');
      if (savedAppCardSize === 'small' || savedAppCardSize === 'normal' || savedAppCardSize === 'large' || savedAppCardSize === 'custom') {
        setAppCardSize(savedAppCardSize as 'small' | 'normal' | 'large' | 'custom');
        console.log('✅ App card size loaded:', savedAppCardSize);
      }

      // Load custom app card size
      const savedCustomAppCardSize = localStorage.getItem('customAppCardSize');
      if (savedCustomAppCardSize) {
        const parsed = parseInt(savedCustomAppCardSize, 10);
        if (!isNaN(parsed) && parsed >= 32 && parsed <= 150) {
          setCustomAppCardSize(parsed);
        }
      }

      // Load app card gap x
      const savedAppCardGapX = localStorage.getItem('appCardGapX');
      if (savedAppCardGapX) {
        const parsed = parseInt(savedAppCardGapX, 10);
        if (!isNaN(parsed)) {
          setAppCardGapX(parsed);
        }
      }

      // Load inner shadow
      const savedInnerShadow = localStorage.getItem('appCardInnerShadow');
      if (savedInnerShadow === 'none' || savedInnerShadow === 'small' || savedInnerShadow === 'medium' || savedInnerShadow === 'large') {
        setAppCardInnerShadow(savedInnerShadow as 'none' | 'small' | 'medium' | 'large');
        console.log('✅ App card inner shadow loaded:', savedInnerShadow);
      }

      // Load greeting style
      const savedGreetingStyle = localStorage.getItem('greetingStyle');
      if (savedGreetingStyle === 'hi' || savedGreetingStyle === 'welcome' || savedGreetingStyle === 'time-based') {
        setGreetingStyle(savedGreetingStyle);
        console.log('✅ Greeting style loaded:', savedGreetingStyle);
      }

      const savedFontFamily = localStorage.getItem('fontFamily');
      if (savedFontFamily === 'default' || savedFontFamily === 'serif' || savedFontFamily === 'mono' || savedFontFamily === 'sans' || savedFontFamily === 'elegant' || savedFontFamily === 'poppins' || savedFontFamily === 'fun') {
        setFontFamily(savedFontFamily);
        console.log('✅ Font family loaded:', savedFontFamily);
      }

      // Load top pill size
      const savedTopPillSize = localStorage.getItem('topPillSize');
      if (savedTopPillSize === 'small' || savedTopPillSize === 'medium' || savedTopPillSize === 'large') {
        setTopPillSize(savedTopPillSize as 'small' | 'medium' | 'large');
        console.log('✅ Top pill size loaded:', savedTopPillSize);
      }

      // Load top pill style
      const savedTopPillStyle = localStorage.getItem('topPillStyle');
      if (savedTopPillStyle === 'card' || savedTopPillStyle === 'text') {
        setTopPillStyle(savedTopPillStyle);
      }

      // Load merge top pills center
      const savedMergeTopPillsCenter = localStorage.getItem('mergeTopPillsCenter');
      if (savedMergeTopPillsCenter === 'true') {
        setMergeTopPillsCenter(true);
      }

      // Load top pill shape
      const savedTopPillShape = localStorage.getItem('topPillShape');
      if (savedTopPillShape === 'pill' || savedTopPillShape === 'squircle') {
        setTopPillShape(savedTopPillShape);
      }

      // Load animated gradient background and preset
      const savedAnimatedGradient = localStorage.getItem('animatedGradientBackground');
      if (savedAnimatedGradient === 'true') {
        setAnimatedGradientBackground(true);
      }
      const savedGradientPreset = localStorage.getItem('animatedGradientPreset');
      if (savedGradientPreset && ['default', 'ocean', 'sunset', 'aurora', 'midnight'].includes(savedGradientPreset)) {
        setAnimatedGradientPreset(savedGradientPreset as any);
      }

      // Load dock visibility
      const savedDockVisibility = localStorage.getItem('dockVisibility');
      if (savedDockVisibility === 'always' || savedDockVisibility === 'hover') {
        setDockVisibility(savedDockVisibility);
        console.log('✅ Dock visibility loaded:', savedDockVisibility);
      }

      // Load show top time
      const savedShowTopTime = localStorage.getItem('showTopTime');
      if (savedShowTopTime !== null) {
        setShowTopTime(savedShowTopTime === 'true');
        console.log('✅ Show top time loaded:', savedShowTopTime === 'true');
      }

      // Load show big clock
      const savedShowBigClock = localStorage.getItem('showBigClock');
      if (savedShowBigClock !== null) {
        setShowBigClock(savedShowBigClock === 'true');
        console.log('✅ Show big clock loaded:', savedShowBigClock === 'true');
      }

      // Load big clock font
      const savedBigClockFont = localStorage.getItem('bigClockFont');
      if (savedBigClockFont) setBigClockFont(savedBigClockFont);

      console.log('✅ All settings loaded successfully');
      setIsLoading(false); // Mark loading as complete
      console.log('🚀 Loading complete - save effect now enabled');

    } catch (error) {
      console.error('❌ Error loading settings:', error);
      // Fallback to defaults on error
      setApps(defaultApps);
      setWidgets(defaultWidgets);
      setNormalModeEnabled(true);
      setGlassmorphismEnabled(false);

      setIsLoading(false); // Mark loading as complete even on error
    }
  }, [mounted]);

  // Save apps to localStorage only when explicitly changed by user (not during load/reset)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isResetting && !isLoading) {
      localStorage.setItem('favoriteApps', JSON.stringify(apps));
    }
  }, [apps, isResetting, isLoading]);

  // Save widgets to localStorage only when explicitly changed by user (not during load/reset)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isResetting && !isLoading) {
      localStorage.setItem('widgets', JSON.stringify(widgets));
    }
  }, [widgets, isResetting, isLoading]);

  // Save bookmarks to localStorage only when explicitly changed by user (not during load/reset)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isResetting && !isLoading) {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, isResetting, isLoading]);


  // Reset completion - localStorage saving is now passive and only happens on user changes
  useEffect(() => {
    if (isResetting && apps.length > 0 && widgets.length > 0) {
      const timer = setTimeout(() => {
        setIsResetting(false);
        console.log('🔄 Reset complete - localStorage is now read-only until user makes changes');
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isResetting, apps, widgets]);

  // Load usage statistics
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      try {
        const savedClickCounts = localStorage.getItem('appClickCounts');
        const savedLastClicked = localStorage.getItem('appLastClicked');
        const savedTotalTime = localStorage.getItem('totalTimeSpent');

        if (savedClickCounts) {
          setAppClickCounts(JSON.parse(savedClickCounts));
        }
        if (savedLastClicked) {
          setAppLastClicked(JSON.parse(savedLastClicked));
        }
        if (savedTotalTime) {
          const savedTime = parseInt(savedTotalTime, 10);
          setPreviousTimeSpent(savedTime);
          setTotalTimeSpent(savedTime);
        }
      } catch (error) {
        console.error('Failed to load usage statistics:', error);
      }
    }
  }, [mounted]);

  // Save usage statistics
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      localStorage.setItem('appClickCounts', JSON.stringify(appClickCounts));
      localStorage.setItem('appLastClicked', JSON.stringify(appLastClicked));
      localStorage.setItem('totalTimeSpent', totalTimeSpent.toString());
    }
  }, [appClickCounts, appLastClicked, totalTimeSpent, isLoading]);

  // Track total time spent (accumulate with previous sessions)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
      setTotalTimeSpent(previousTimeSpent + currentSessionTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, previousTimeSpent]);

  // Apply font family to document whenever it changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const fontFamilyMap = {
        default: 'system-ui, -apple-system, sans-serif',
        serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        elegant: '"Helvetica Neue Thin", "Helvetica Neue Light", "Segoe UI Light", "Roboto Light", sans-serif',
        poppins: 'Poppins, sans-serif',
        fun: '"Comic Sans MS", "Chalkboard SE", cursive'
      };
      const fontStack = fontFamilyMap[fontFamily];
      document.documentElement.style.fontFamily = fontStack;
      document.body.style.fontFamily = fontStack;
      console.log('🎨 Font family changed to:', fontFamily, '→', fontStack);
    }
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('appCardSize', appCardSize);
  }, [appCardSize]);

  useEffect(() => {
    localStorage.setItem('appCardGapX', appCardGapX.toString());
  }, [appCardGapX]);

  useEffect(() => {
    localStorage.setItem('customAppCardSize', customAppCardSize.toString());
  }, [customAppCardSize]);

  // Comprehensive save effect for all settings - only save on user changes, not during load/reset
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && !isResetting) { // Only save when not loading and not resetting
      console.log('💾 Saving user settings to localStorage:', {
        theme: isDarkMode ? 'dark' : 'light',
        showAppTitles,
        hideAppTitleText,
        showSearchBar,

        searchBarWidth,
        showTopTime
      });

      // Save theme
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

      // Save show app titles
      localStorage.setItem('showAppTitles', showAppTitles.toString());
      localStorage.setItem('hideAppTitleText', hideAppTitleText.toString());
      localStorage.setItem('showSearchBar', showSearchBar.toString());
      localStorage.setItem('searchBarWidth', searchBarWidth);
      localStorage.setItem('compactSearchBar', compactSearchBar.toString());
      localStorage.setItem('monochromeIcons', monochromeIcons.toString());
      localStorage.setItem('centerAppsGroup', centerAppsGroup.toString());
      localStorage.setItem('showBookmarks', showBookmarks.toString());
      localStorage.setItem('showBookmarksTitle', showBookmarksTitle.toString());
      localStorage.setItem('centerBookmarksGroup', centerBookmarksGroup.toString());
      // searchTerm not saved by design

      // Save background image only if it's a data URL or remote URL.
      // For IndexedDB case we use object URL at runtime and don't persist the blob in localStorage.
      if (!backgroundImage.startsWith('blob:')) {
        localStorage.setItem('backgroundImage', backgroundImage);
      }
      localStorage.setItem('backgroundBlur', backgroundBlur.toString());

      // Save visual modes
      localStorage.setItem('normalModeEnabled', normalModeEnabled.toString());
      localStorage.setItem('glassmorphismEnabled', glassmorphismEnabled.toString());

      // Save colors
      localStorage.setItem('appTitleColor', appTitleColor);
      localStorage.setItem('widgetTextColor', widgetTextColor);
      localStorage.setItem('animateIconsEnabled', animateIconsEnabled.toString());
      localStorage.setItem('animateWidgetsEnabled', animateWidgetsEnabled.toString());
      localStorage.setItem('hoverAnimationStyle', hoverAnimationStyle);
      localStorage.setItem('appCardBorderRadius', appCardBorderRadius);
      localStorage.setItem('removeAppCardBorders', removeAppCardBorders.toString());
      localStorage.setItem('appCardSize', appCardSize);
      localStorage.setItem('appCardInnerShadow', appCardInnerShadow);
      localStorage.setItem('bookmarkStyle', bookmarkStyle);
      localStorage.setItem('appGroupMarginTop', appGroupMarginTop.toString());
      localStorage.setItem('userName', userName);
      localStorage.setItem('greetingStyle', greetingStyle);
      localStorage.setItem('showTopTime', showTopTime.toString());
      localStorage.setItem('fontFamily', fontFamily);

      // Apply theme to document
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        console.log('🌙 Dark mode applied to document');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('☀️ Light mode applied to document');
      }

      // Apply background image
      if (backgroundImage) {
        document.documentElement.style.setProperty('--app-bg-image', `url(${backgroundImage.replace(/'/g, "\\'")})`);
        document.documentElement.classList.add('has-app-bg');
      } else {
        document.documentElement.style.setProperty('--app-bg-image', 'none');
        document.documentElement.classList.remove('has-app-bg');
      }



      console.log('✅ All settings saved to localStorage successfully');
    }
  }, [
    isDarkMode,
    showAppTitles,
    hideAppTitleText,
    showSearchBar,

    searchBarWidth,
    backgroundImage,
    backgroundBlur,
    normalModeEnabled,
    glassmorphismEnabled,
    monochromeIcons,
    appTitleColor,
    widgetTextColor,
    animateIconsEnabled,
    animateWidgetsEnabled,
    hoverAnimationStyle,
    appCardBorderRadius,
    removeAppCardBorders,
    appCardSize,
    appCardInnerShadow,
    bookmarkStyle,
    centerAppsGroup,
    showBookmarks,
    showBookmarksTitle,
    centerBookmarksGroup,
    appGroupMarginTop,
    userName,
    greetingStyle,
    showTopTime,
    searchBarWidth,
    compactSearchBar,
    fontFamily,
    isLoading,
    isResetting
  ]);

  // Fetch Google suggestions (debounced)
  useEffect(() => {
    const term = searchTerm.trim();
    if (!showSearchBar || term.length === 0) {
      setSearchSuggestions([]);
      setIsSuggestOpen(false);
      setHighlightIndex(-1);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const url = `/api/suggest?q=${encodeURIComponent(term)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('suggest fetch failed');
        const data = await res.json();
        const suggestions: string[] = Array.isArray(data?.suggestions) ? data.suggestions : [];
        setSearchSuggestions(suggestions.slice(0, 8));
        setIsSuggestOpen(suggestions.length > 0);
        setHighlightIndex(-1);
      } catch (e) {
        // On CORS/error, hide suggestions gracefully
        setSearchSuggestions([]);
        setIsSuggestOpen(false);
        setHighlightIndex(-1);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [searchTerm, showSearchBar]);

  const submitSearch = (query: string) => {
    const term = (query ?? '').trim();
    if (!term) return;
    if (typeof window !== 'undefined') {
      if (youtubeSearchMode) {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`;
        window.open(url, '_blank');
      } else {
        const url = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
        window.open(url, '_blank');
      }
    }
  };

  const handleSaveGreetingName = () => {
    const trimmed = nameInput.trim();
    setUserName(trimmed || 'user');
    setIsNameEditorOpen(false);
  };

  const handleCancelGreetingEdit = () => {
    setIsNameEditorOpen(false);
    setNameInput(userName);
  };

  // Track app click for usage statistics
  const trackAppClick = (appId: string) => {
    setAppClickCounts(prev => ({
      ...prev,
      [appId]: (prev[appId] || 0) + 1
    }));
    setAppLastClicked(prev => ({
      ...prev,
      [appId]: Date.now()
    }));
  };

  const resetSettings = () => {
    setShowResetModal(true);
    return;

    console.log('🔄 Resetting all settings to defaults...');

    // Set reset flag to prevent useEffect from overwriting localStorage
    setIsResetting(true);

    // Clear localStorage first and ensure it's completely empty
    if (typeof window !== 'undefined') {
      localStorage.clear();

      // Double-check that localStorage is actually cleared
      if (localStorage.length > 0) {
        console.warn('⚠️ localStorage not fully cleared, forcing removal of remaining items');
        // Force remove any remaining items
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
      }

      console.log('🗑️ localStorage cleared, length:', localStorage.length);
    }

    // Reset visual settings to defaults
    setIsDarkMode(true);
    setAnimatedGradientBackground(false);
    setShowAppTitles(true);
    setShowSearchBar(false);
    setSearchBarWidth('medium');
    setCompactSearchBar(false);
    setBackgroundImage('');
    setBackgroundBlur(0);
    setGlassmorphismEnabled(false);

    setNormalModeEnabled(true);
    setAppTitleColor('auto');
    setWidgetTextColor('auto');
    setMonochromeIcons(false);

    // Restore default apps and widgets
    setApps(defaultApps);
    setWidgets(defaultWidgets);
    setHideAppTitleText(false);

    // Set default values in localStorage immediately after clearing
    if (typeof window !== 'undefined') {
      try {
        // Set default values in localStorage
        localStorage.setItem('theme', 'light');
        localStorage.setItem('showAppTitles', 'true');
        localStorage.setItem('hideAppTitleText', 'false');
        localStorage.setItem('backgroundImage', '');
        localStorage.setItem('animatedGradientBackground', 'false');
        localStorage.setItem('normalModeEnabled', 'true');
        localStorage.setItem('glassmorphismEnabled', 'false');
        localStorage.setItem('fluidModeEnabled', 'false');

        localStorage.setItem('appTitleColor', 'auto');
        localStorage.setItem('widgetTextColor', 'auto');
        localStorage.setItem('animateIconsEnabled', 'false');
        localStorage.setItem('animateWidgetsEnabled', 'false');
        localStorage.setItem('hoverAnimationStyle', 'scale');
        localStorage.setItem('appGroupMarginTop', '180');
        localStorage.setItem('userName', 'user');
        localStorage.setItem('greetingStyle', 'hi');
        localStorage.setItem('showTopTime', 'false');
        localStorage.setItem('searchBarWidth', 'medium');
        localStorage.setItem('compactSearchBar', 'false');
        localStorage.setItem('monochromeIcons', 'false');
        localStorage.setItem('removeAppCardBorders', 'false');
        localStorage.setItem('appCardSize', 'normal');
        localStorage.setItem('appCardInnerShadow', 'none');
        localStorage.setItem('appCardGapX', '16');


        // Save apps and widgets with explicit stringification
        const appsJson = JSON.stringify(defaultApps);
        const widgetsJson = JSON.stringify(defaultWidgets);

        localStorage.setItem('favoriteApps', appsJson);
        localStorage.setItem('widgets', widgetsJson);

        // Add timestamp for reset tracking
        localStorage.setItem('lastResetDate', new Date().toDateString());

        // Simple verification that save was successful
        if (localStorage.getItem('favoriteApps') === appsJson && localStorage.getItem('widgets') === widgetsJson) {
          console.log('✅ Default apps and widgets saved to localStorage successfully');
        } else {
          console.warn('⚠️ localStorage save verification failed, but continuing...');
        }

        // Verify the save was successful
        const savedApps = localStorage.getItem('favoriteApps') || '[]';
        const savedWidgets = localStorage.getItem('widgets') || '[]';
        console.log('🔍 Verification - saved apps:', JSON.parse(savedApps).length);
        console.log('🔍 Verification - saved widgets:', JSON.parse(savedWidgets).length);

        // Simple verification that save was successful
        if (savedApps === appsJson && savedWidgets === widgetsJson) {
          console.log('✅ All settings reset to defaults and saved to localStorage successfully');
        } else {
          console.warn('⚠️ localStorage save verification failed, but continuing...');
        }
      } catch (error) {
        console.error('❌ Error saving to localStorage during reset:', error);
      }
    }

    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--app-bg-image', 'none');
      document.documentElement.classList.remove('has-app-bg');
      document.documentElement.style.setProperty('--liquid-reflection-rgb', '255,255,255');
    }

    // Note: isResetting will be set to false by a useEffect when the state updates complete
  };

  // Silent reset without confirmation, triggered programmatically (e.g., via query param)
  const resetSettingsSilently = () => {
    console.log('🔄 Resetting all settings to defaults (silent)...');
    setIsResetting(true);
    if (typeof window !== 'undefined') {
      localStorage.clear();
      if (localStorage.length > 0) {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    }
    setIsDarkMode(false);
    setAnimatedGradientBackground(false);
    setShowAppTitles(true);
    setShowSearchBar(false);
    setBackgroundImage('');
    setBackgroundBlur(0);
    setGlassmorphismEnabled(false);

    setNormalModeEnabled(true);
    setAppTitleColor('auto');
    setWidgetTextColor('auto');
    setAnimateIconsEnabled(false);
    setAnimateWidgetsEnabled(false);
    setHoverAnimationStyle('scale');
    setAppGroupMarginTop(180);
    setAppCardGapX(16);

    setUserName('user');
    setNameInput('user');
    setShowTopTime(false);
    setApps(defaultApps);
    setWidgets(defaultWidgets);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('showAppTitles', 'true');
        localStorage.setItem('hideAppTitleText', 'false');
        localStorage.setItem('backgroundImage', '');
        localStorage.setItem('animatedGradientBackground', 'false');
        localStorage.setItem('normalModeEnabled', 'true');
        localStorage.setItem('glassmorphismEnabled', 'false');
        localStorage.setItem('appTitleColor', 'auto');
        localStorage.setItem('widgetTextColor', 'auto');
        localStorage.setItem('animateIconsEnabled', 'false');
        localStorage.setItem('animateWidgetsEnabled', 'false');
        localStorage.setItem('hoverAnimationStyle', 'scale');
        localStorage.setItem('appGroupMarginTop', '180');
        localStorage.setItem('userName', 'user');
        localStorage.setItem('showTopTime', 'false');
        const appsJson = JSON.stringify(defaultApps);
        const widgetsJson = JSON.stringify(defaultWidgets);
        localStorage.setItem('favoriteApps', appsJson);
        localStorage.setItem('widgets', widgetsJson);
        localStorage.setItem('lastResetDate', new Date().toDateString());
        localStorage.setItem('removeAppCardBorders', 'false');
        localStorage.setItem('appCardSize', 'normal');
        localStorage.setItem('appCardInnerShadow', 'none');
        localStorage.setItem('appCardGapX', '16');
      } catch { }
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--app-bg-image', 'none');
      document.documentElement.classList.remove('has-app-bg');
      document.documentElement.style.setProperty('--liquid-reflection-rgb', '255,255,255');
    }
  };

  const addApp = async (app: App) => {
    const initialIcon = app.icon || getFaviconUrl(app.href);
    const appWithIcon = {
      ...app,
      icon: initialIcon
    };
    setApps((prevApps) => [...prevApps, appWithIcon]);

    if (!app.icon) {
      try {
        const bestIcon = await fetchBestFavicon(app.href);
        setApps((prevApps) => prevApps.map((item) => item.id === appWithIcon.id ? { ...item, icon: bestIcon } : item));
      } catch {
        // Keep the placeholder icon if remote resolution fails.
      }
    }
  };

  const addWidget = (type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes' | 'spacer' | 'photo' | 'fidget-spinner' | 'pomodoro' | 'dice' | 'coin-flip') => {
    const widget: Widget = {
      id: Date.now().toString(),
      type,
      title: type === 'clock' ? 'Clock Widget' : type === 'weather' ? 'Weather Widget' : type === 'calendar' ? 'Calendar Widget' : type === 'analog-clock' ? 'Analog Clock Widget' : type === 'water-tracker' ? 'Water Tracker Widget' : type === 'quick-notes' ? 'Quick Notes Widget' : type === 'photo' ? 'Photo Widget' : type === 'fidget-spinner' ? 'Fidget Spinner' : type === 'pomodoro' ? 'Pomodoro Timer' : type === 'dice' ? 'Dice Roller' : type === 'coin-flip' ? 'Coin Flip' : 'Spacer'
    };
    setWidgets([...widgets, widget]);
  };

  const quickAddFavoriteApp = () => {
    setQuickAppTitleInput('');
    setQuickAppUrlInput('');
    setIsQuickAppOpen(true);
  };

  const openHaliteModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHaliteUrls(['', '', '', '']);
    setHaliteFolderName('');
    setIsHaliteModalOpen(true);
  };

  const addHaliteFolder = async () => {
    const validUrls = haliteUrls.filter(url => url.trim() !== '');
    if (validUrls.length >= 2 && validUrls.length <= 4) {
      const normalizedUrls = validUrls.map(url => {
        const trimmed = url.trim();
        return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      });
      const haliteIcons = normalizedUrls.map((url) => getFaviconUrl(url));
      const folderName = haliteFolderName.trim() || 'Halite';
      const haliteApp: App = {
        id: `halite-${Date.now()}`,
        title: folderName,
        href: normalizedUrls[0], // First URL as primary
        type: 'halite',
        haliteUrls: normalizedUrls,
        haliteIcons: haliteIcons,
        haliteName: folderName,
      };

      await addApp(haliteApp);

      try {
        const resolvedIcons = await Promise.all(normalizedUrls.map((url) => fetchBestFavicon(url).catch(() => getFaviconUrl(url))));
        setApps((prevApps) => prevApps.map((item) => item.id === haliteApp.id ? { ...item, haliteIcons: resolvedIcons } : item));
      } catch {
        // Keep placeholder halite icons on failure.
      }

      setHaliteUrls(['', '', '', '']);
      setHaliteFolderName('');
      setIsHaliteModalOpen(false);
    }
  };

  const removeApp = (id: string) => {
    const appToRemove = apps.find(app => app.id === id);
    if (appToRemove?.icon?.startsWith('idb:')) {
      const key = appToRemove.icon.replace('idb:', '');
      deleteImageBlob(key).catch(console.error);
    }
    setApps(apps.filter(app => app.id !== id));
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate position with viewport bounds checking
    const menuWidth = 160;
    const menuHeight = 100;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({
      x: Math.max(10, x),
      y: Math.max(10, y),
      appId,
    });
  };

  const startEditingApp = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    setEditingApp(app);
    setEditAppTitle(app.title);
    setEditAppUrl(app.href);
    setContextMenu(null);
  };

  const saveEditedApp = () => {
    if (!editingApp || !editAppTitle.trim() || !editAppUrl.trim()) {
      return;
    }
    const normalizedUrl = editAppUrl.trim().startsWith('http') ? editAppUrl.trim() : `https://${editAppUrl.trim()}`;
    setApps(apps.map(app => 
      app.id === editingApp.id 
        ? { ...app, title: editAppTitle.trim(), href: normalizedUrl }
        : app
    ));
    setEditingApp(null);
    setEditAppTitle('');
    setEditAppUrl('');
  };

  const cancelEditingApp = () => {
    setEditingApp(null);
    setEditAppTitle('');
    setEditAppUrl('');
  };

  const handleOpenInNewTab = () => {
    if (!contextMenu) return;
    const app = apps.find(a => a.id === contextMenu.appId);
    if (app) {
      if (app.type === 'halite' && app.haliteUrls && app.haliteUrls.length > 0) {
        // Open all halite URLs in new tabs
        app.haliteUrls.forEach(url => {
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      } else {
        window.open(app.href, '_blank', 'noopener,noreferrer');
      }
    }
    setContextMenu(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Handle app reordering
      const activeApp = apps.find(app => app.id === active.id);
      const overApp = apps.find(app => app.id === over?.id);

      if (activeApp && overApp) {
        setApps((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }

      // Handle widget reordering
      const activeWidget = widgets.find(widget => widget.id === active.id);
      const overWidget = widgets.find(widget => widget.id === over?.id);

      if (activeWidget && overWidget) {
        setWidgets((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = widgets.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }

      // Handle cross-type reordering (app to widget position or vice versa)
      if (activeApp && overWidget) {
        // Move app to widget position
        setApps((appItems) => {
          const oldIndex = appItems.findIndex((item) => item.id === active.id);
          const newIndex = widgets.findIndex((item) => item.id === over?.id);
          return arrayMove(appItems, oldIndex, newIndex);
        });
      }

      if (activeWidget && overApp) {
        // Move widget to app position
        setWidgets((widgetItems) => {
          const oldIndex = widgetItems.findIndex((item) => item.id === active.id);
          const newIndex = apps.findIndex((item) => item.id === over?.id);
          return arrayMove(widgetItems, oldIndex, newIndex);
        });
      }
    }
  };

  // StickyNoteLayer removed

  // Query param trigger: /?reset=1 performs a silent reset and cleans the URL
  useEffect(() => {
    if (!mounted) return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset') === '1') {
        resetSettingsSilently();
        params.delete('reset');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState(null, '', newUrl);
      }
    } catch { }
  }, [mounted]);

  // Handle Ctrl+Y to toggle YouTube search mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        setYoutubeSearchMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Cmd/Ctrl+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <main className="min-h-screen px-4 py-8 bg-white">
        <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mt-24 px-1 sm:px-2 lg:px-3">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main suppressHydrationWarning
      ref={containerRef}
      className={`min-h-screen px-4 py-8 transition-all duration-300 ${!animatedGradientBackground && (backgroundImage || (!isDarkMode && !backgroundImage)) ? 'bg-cover bg-center bg-no-repeat' : ''
        } ${animatedGradientBackground ? (animatedGradientPreset === 'default' ? 'animated-gradient-bg' : `animated-gradient-bg-${animatedGradientPreset}`) : (isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white')} ${backgroundBlur && backgroundImage && !animatedGradientBackground ? 'relative' : ''}`}
      style={{
        backgroundImage: animatedGradientBackground
          ? undefined
          : (backgroundImage
            ? `url(${backgroundImage})`
            : (isDarkMode
                ? 'radial-gradient(600px circle at 100% 0, rgba(59,130,246,0.12), transparent 40%), radial-gradient(800px circle at 0 100%, rgba(236,72,153,0.10), transparent 40%), linear-gradient(180deg, #0a0a0a 0%, #0f1115 100%)'
                : 'none'
            )),
        backgroundColor: animatedGradientBackground ? undefined : (isDarkMode ? '#0a0a0a' : '#f5f5f5'),
        backgroundRepeat: 'no-repeat',

      } as React.CSSProperties}
    >
      {/* Background blur overlay */}
      {backgroundBlur > 0 && backgroundImage && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backdropFilter: `blur(${backgroundBlur}px)`,
            WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
          }}
        />
      )}
      {/* StickyNoteLayer removed */}
      {/* Global keyframes for iOS-style jiggle */}
      <style>{`
        @keyframes iosJiggle {
          0%, 100% { transform: rotate(-1deg) translateY(0); }
          50% { transform: rotate(1deg) translateY(-0.5px); }
        }
        .ios-jiggle {
          animation: iosJiggle 0.22s ease-in-out infinite;
        }
      `}</style>
      {/* Apple Liquid Glass overlays */}
      {/* Top pills: merged centered group OR separate left/right */}
      {mergeTopPillsCenter ? (
        /* Merged: both pills centered at top */
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
          {topPillStyle === 'card' ? (
            /* Single unified pill card */
            <div className={`inline-flex items-center ${topPillSize === 'small' ? 'text-xs' : topPillSize === 'large' ? 'text-base' : 'text-sm'} font-semibold ${topPillShape === 'squircle' ? 'rounded-xl' : 'rounded-full'} ring-1 ${
              backgroundImage || isDarkMode
                ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl shadow-lg'
                : 'bg-white text-black ring-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
            }`}>
              {/* Time section */}
              {showTopTime && (
                <>
                  <span className={`${topPillSize === 'small' ? 'px-2 py-0.5' : topPillSize === 'large' ? 'px-4 py-1.5' : 'px-3 py-1'}`} aria-live="polite">
                    {topClockLabel}
                  </span>
                  {/* Divider */}
                  <span className={`w-px mx-0.5 h-3 self-center rounded-full ${backgroundImage || isDarkMode ? 'bg-white/15' : 'bg-gray-300/60'}`} />
                </>
              )}
              {/* Greeting section */}
              <div ref={greetingDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setIsGreetingDropdownOpen(prev => !prev); setIsNameEditorOpen(false); }}
                  className={`${topPillSize === 'small' ? 'px-2 py-0.5' : topPillSize === 'large' ? 'px-4 py-1.5' : 'px-3 py-1'} transition-all duration-200 focus:outline-none hover:opacity-80`}
                  title="Click to see options"
                  aria-expanded={isGreetingDropdownOpen}
                  aria-controls="greeting-dropdown-menu"
                >
                  {getGreeting()}
                </button>
                {isGreetingDropdownOpen && (
                  <div id="greeting-dropdown-menu" className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 rounded-2xl shadow-sm ring-1 overflow-hidden backdrop-blur-sm transition-all py-1 ${isDarkMode ? 'bg-black/40 text-white ring-white/15' : 'bg-white/50 text-gray-900 ring-gray-200'}`}>
                    {/* Google Quick Links */}
                    <div className={`flex items-center justify-around px-2 pt-2 pb-1.5 mx-1.5 mb-1 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-500/5'}`}>
                      {[
                        { name: 'Mail',     url: 'https://mail.google.com',    icon: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png' },
                        { name: 'Drive',    url: 'https://drive.google.com',   icon: 'https://www.gstatic.com/images/branding/product/2x/drive_2020q4_32dp.png' },
                        { name: 'Gemini',   url: 'https://gemini.google.com',  icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg' },
                        { name: 'Calendar', url: 'https://calendar.google.com',icon: 'https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_32dp.png' },
                      ].map(({ name, url, icon }) => (
                        <a key={name} href={url} target="_blank" rel="noopener noreferrer" title={name}
                          className={`flex items-center justify-center p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-500/10'}`}>
                          <img src={icon} alt={name} title={name} className="w-6 h-6 rounded-md" />
                        </a>
                      ))}
                    </div>
                    <button type="button" onClick={() => { setIsGreetingDropdownOpen(false); setIsSidebarOpen(true); }} className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'}`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </button>
                    <button type="button" onClick={() => { setIsGreetingDropdownOpen(false); setIsNameEditorOpen(true); setNameInput(userName); }} className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'}`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Name
                    </button>
                  </div>
                )}
                {isNameEditorOpen && (
                  <div ref={nameEditorRef} id="greeting-name-editor" className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 rounded-2xl shadow-sm ring-1 p-3 flex flex-col gap-3 backdrop-blur-sm transition-all ${isDarkMode ? 'bg-black/40 text-white ring-white/15' : 'bg-white/50 text-gray-900 ring-gray-200'}`}>
                    <div className="flex flex-col relative z-10 w-full px-2">
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Update greeting</span>
                      <input ref={nameInputRef} type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveGreetingName(); } if (e.key === 'Escape') { e.preventDefault(); handleCancelGreetingEdit(); } }}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all ${isDarkMode ? 'bg-white/10 text-white placeholder-white/30 border border-white/5' : 'bg-gray-100/50 text-gray-900 placeholder-gray-400 border border-gray-200/50'}`}
                        placeholder="Enter your name" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={handleCancelGreetingEdit} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isDarkMode ? 'text-white/60 hover:text-white/80 hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/5'}`}>Cancel</button>
                      <button type="button" onClick={handleSaveGreetingName} className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500/80 text-white hover:bg-blue-600 transition-colors">Save</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Text-only mode: two items side by side */
            <div className="flex items-center gap-3">
              {showTopTime && (
                <span className={`${topPillSize === 'small' ? 'text-xs' : topPillSize === 'large' ? 'text-base' : 'text-sm'} font-semibold bg-transparent ${isDarkMode ? 'text-white drop-shadow-md' : 'text-gray-900 drop-shadow-sm'}`} aria-live="polite">
                  {topClockLabel}
                </span>
              )}
              <div ref={greetingDropdownRef} className="relative">
                <button type="button" onClick={() => { setIsGreetingDropdownOpen(prev => !prev); setIsNameEditorOpen(false); }}
                  className={`${topPillSize === 'small' ? 'text-xs' : topPillSize === 'large' ? 'text-base' : 'text-sm'} font-semibold bg-transparent hover:opacity-80 transition-all duration-200 focus:outline-none ${isDarkMode ? 'text-white drop-shadow-md' : 'text-gray-900 drop-shadow-sm'}`}
                  title="Click to see options" aria-expanded={isGreetingDropdownOpen} aria-controls="greeting-dropdown-menu">
                  {getGreeting()}
                </button>
                {isGreetingDropdownOpen && (
                  <div id="greeting-dropdown-menu" className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 rounded-2xl shadow-sm ring-1 overflow-hidden backdrop-blur-sm transition-all py-1 ${isDarkMode ? 'bg-black/40 text-white ring-white/15' : 'bg-white/50 text-gray-900 ring-gray-200'}`}>
                    {/* Google Quick Links */}
                    <div className={`flex items-center justify-around px-2 pt-2 pb-1.5 mx-1.5 mb-1 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-500/5'}`}>
                      {[
                        { name: 'Mail',     url: 'https://mail.google.com',    icon: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png' },
                        { name: 'Drive',    url: 'https://drive.google.com',   icon: 'https://www.gstatic.com/images/branding/product/2x/drive_2020q4_32dp.png' },
                        { name: 'Gemini',   url: 'https://gemini.google.com',  icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg' },
                        { name: 'Calendar', url: 'https://calendar.google.com',icon: 'https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_32dp.png' },
                      ].map(({ name, url, icon }) => (
                        <a key={name} href={url} target="_blank" rel="noopener noreferrer" title={name}
                          className={`flex items-center justify-center p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-500/10'}`}>
                          <img src={icon} alt={name} title={name} className="w-6 h-6 rounded-md" />
                        </a>
                      ))}
                    </div>
                    <button type="button" onClick={() => { setIsGreetingDropdownOpen(false); setIsSidebarOpen(true); }} className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'}`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </button>
                    <button type="button" onClick={() => { setIsGreetingDropdownOpen(false); setIsNameEditorOpen(true); setNameInput(userName); }} className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'}`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Name
                    </button>
                  </div>
                )}
                {isNameEditorOpen && (
                  <div ref={nameEditorRef} id="greeting-name-editor" className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 rounded-2xl shadow-sm ring-1 p-3 flex flex-col gap-3 backdrop-blur-sm transition-all ${isDarkMode ? 'bg-black/40 text-white ring-white/15' : 'bg-white/50 text-gray-900 ring-gray-200'}`}>
                    <div className="flex flex-col relative z-10 w-full px-2">
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Update greeting</span>
                      <input ref={nameInputRef} type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveGreetingName(); } if (e.key === 'Escape') { e.preventDefault(); handleCancelGreetingEdit(); } }}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all ${isDarkMode ? 'bg-white/10 text-white placeholder-white/30 border border-white/5' : 'bg-gray-100/50 text-gray-900 placeholder-gray-400 border border-gray-200/50'}`}
                        placeholder="Enter your name" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={handleCancelGreetingEdit} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isDarkMode ? 'text-white/60 hover:text-white/80 hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/5'}`}>Cancel</button>
                      <button type="button" onClick={handleSaveGreetingName} className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500/80 text-white hover:bg-blue-600 transition-colors">Save</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Time pill - top left */}
          {showTopTime && (
            <div className="fixed top-4 left-8 z-40">
              <span
                className={`inline-flex items-center ${topPillSize === 'small' ? 'px-2 py-0.5 text-xs' : topPillSize === 'large' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm'} font-semibold ${
                  topPillStyle === 'text'
                    ? `bg-transparent ${isDarkMode ? 'text-white drop-shadow-md' : 'text-gray-900 drop-shadow-sm'}`
                    : `${topPillShape === 'squircle' ? 'rounded-xl' : 'rounded-full'} ring-1 ${
                      backgroundImage
                        ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl shadow-lg'
                        : isDarkMode
                          ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl shadow-lg'
                          : 'bg-white text-black ring-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                      }`
                }`}
                aria-live="polite"
              >
                {topClockLabel}
              </span>
            </div>
          )}
          {/* Greetings pill - top right */}
          <div ref={greetingDropdownRef} className="fixed top-4 right-8 z-40 flex flex-col items-end gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsGreetingDropdownOpen(prev => !prev);
                  setIsNameEditorOpen(false);
                }}
                className={`inline-flex items-center ${topPillSize === 'small' ? 'px-2 py-0.5 text-xs' : topPillSize === 'large' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm'} font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
                  topPillStyle === 'text'
                    ? `bg-transparent hover:opacity-80 ${isDarkMode ? 'text-white drop-shadow-md' : 'text-gray-900 drop-shadow-sm'}`
                    : `${topPillShape === 'squircle' ? 'rounded-xl' : 'rounded-full'} ring-1 ${
                      backgroundImage
                        ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl hover:bg-white/15 shadow-lg'
                        : isDarkMode
                          ? 'bg-white/10 text-white ring-white/20 backdrop-blur-xl hover:bg-white/15 shadow-lg'
                          : 'bg-white text-black ring-gray-200 hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                      }`
                }`}
                title="Click to see options"
                aria-expanded={isGreetingDropdownOpen}
                aria-controls="greeting-dropdown-menu"
              >
                {getGreeting()}
              </button>
              {isGreetingDropdownOpen && (
                <div
                  id="greeting-dropdown-menu"
                  className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-sm ring-1 overflow-hidden backdrop-blur-sm transition-all py-1 ${isDarkMode
                    ? 'bg-black/40 text-white ring-white/15'
                    : 'bg-white/50 text-gray-900 ring-gray-200'
                    }`}
                >
                  {/* Google Quick Links */}
                  <div className={`flex items-center justify-center gap-1.5 px-2 pt-2 pb-1.5 mx-2 mb-1 mt-1 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-500/5'}`}>
                    {[
                      { name: 'Mail',     url: 'https://mail.google.com',    icon: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png' },
                      { name: 'Drive',    url: 'https://drive.google.com',   icon: 'https://www.gstatic.com/images/branding/product/2x/drive_2020q4_32dp.png' },
                      { name: 'Gemini',   url: 'https://gemini.google.com',  icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg' },
                      { name: 'Calendar', url: 'https://calendar.google.com',icon: 'https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_32dp.png' },
                    ].map(({ name, url, icon }) => (
                      <a key={name} href={url} target="_blank" rel="noopener noreferrer" title={name}
                        className={`flex items-center justify-center p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-500/10'}`}>
                        <img src={icon} alt={name} title={name} className="w-5 h-5 rounded-md" />
                      </a>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIsGreetingDropdownOpen(false); setIsSidebarOpen(true); }}
                    className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'}`}
                  >
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsGreetingDropdownOpen(false); setIsNameEditorOpen(true); setNameInput(userName); }}
                    className={`w-[calc(100%-12px)] mx-1.5 my-1 text-left px-3 py-2 text-sm font-medium transition-all flex items-center gap-2.5 rounded-xl ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-500/10'}`}
                  >
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Name
                  </button>
                </div>
              )}
              {isNameEditorOpen && (
                <div
                  ref={nameEditorRef}
                  id="greeting-name-editor"
                  className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-sm ring-1 p-3 flex flex-col gap-3 backdrop-blur-sm transition-all ${isDarkMode ? 'bg-black/40 text-white ring-white/5' : 'bg-white/50 text-gray-900 ring-gray-200/30'}`}
                >
                  <div className="flex flex-col relative z-10 w-full px-2">
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Update greeting</span>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleSaveGreetingName(); }
                        if (e.key === 'Escape') { e.preventDefault(); handleCancelGreetingEdit(); }
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all ${isDarkMode ? 'bg-white/10 text-white placeholder-white/30 border border-white/5' : 'bg-white/50 text-gray-900 placeholder-gray-400 border border-gray-200/50'}`}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={handleCancelGreetingEdit} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isDarkMode ? 'text-white/60 hover:text-white/80 hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-500/5'}`}>Cancel</button>
                    <button type="button" onClick={handleSaveGreetingName} className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500/80 text-white hover:bg-blue-600 transition-colors">Save</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mt-24 px-1 sm:px-2 lg:px-3">
        {/* Big Clock Display - Above App Cards */}
        {showBigClock && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-none transition-all duration-300" 
            style={{ 
              top: `${bigClockMarginTop}px`,
            }} 
            suppressHydrationWarning
          >
            <div className="flex flex-col items-center justify-center transition-all duration-300">
              <span 
                className={`font-bold tracking-tight leading-none transition-all duration-300 ${
                  bigClockSize === 'small' ? 'text-5xl sm:text-6xl md:text-7xl' :
                  bigClockSize === 'large' ? 'text-8xl sm:text-9xl md:text-[10rem]' :
                  bigClockSize === 'huge' ? 'text-9xl sm:text-[10rem] md:text-[12rem]' :
                  'text-7xl sm:text-8xl md:text-9xl' // medium
                } ${
                  bigClockGlassMode 
                    ? 'bg-clip-text text-transparent drop-shadow-lg' 
                    : ''
                }`}
                style={{
                   ...(bigClockGlassMode ? {
                     backgroundImage: `linear-gradient(to bottom, ${bigClockColor || 'white'}cc, ${bigClockColor || 'white'}33)`,
                     backgroundClip: 'text',
                   } : {}),
                   color: !bigClockGlassMode ? (bigClockColor || (backgroundImage || isDarkMode ? 'white' : '#111827')) : undefined,
                   fontFamily: bigClockFont === 'default' ? undefined :
                               bigClockFont === 'serif' ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' :
                               bigClockFont === 'mono' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' :
                               bigClockFont === 'elegant' ? '"Helvetica Neue Thin", "Helvetica Neue Light", "Segoe UI Light", "Roboto Light", sans-serif' :
                               bigClockFont === 'fun' ? '"Comic Sans MS", "Chalkboard SE", cursive' :
                               bigClockFont === 'poppins' ? 'Poppins, sans-serif' :
                               bigClockFont === 'playfair' ? 'var(--font-playfair), "Playfair Display", Georgia, serif' :
                               bigClockFont === 'raleway' ? 'var(--font-raleway), Raleway, sans-serif' :
                               bigClockFont === 'space' ? 'var(--font-space-grotesk), "Space Grotesk", sans-serif' :
                               bigClockFont === 'bebas' ? 'var(--font-bebas-neue), "Bebas Neue", sans-serif' :
                               bigClockFont === 'pacifico' ? 'var(--font-pacifico), Pacifico, cursive' :
                               bigClockFont === 'outfit' ? 'var(--font-outfit), Outfit, sans-serif' : undefined
                }}
              >
                {bigClockTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
              <span 
                className={`font-medium tracking-wide opacity-80 mt-2 transition-all duration-300 ${
                  bigClockSize === 'small' ? 'text-lg sm:text-xl' :
                  bigClockSize === 'large' ? 'text-2xl sm:text-3xl' :
                  bigClockSize === 'huge' ? 'text-3xl sm:text-4xl' :
                  'text-xl sm:text-2xl' // medium
                } ${
                  bigClockGlassMode 
                    ? 'bg-clip-text text-transparent drop-shadow-md' 
                    : ''
                }`}
                style={{
                   ...(bigClockGlassMode ? {
                     backgroundImage: `linear-gradient(to bottom, ${bigClockColor || 'white'}cc, ${bigClockColor || 'white'}33)`,
                     backgroundClip: 'text',
                   } : {}),
                   color: !bigClockGlassMode ? (bigClockColor || (backgroundImage || isDarkMode ? 'white' : '#111827')) : undefined,
                   fontFamily: bigClockFont === 'default' ? undefined :
                               bigClockFont === 'serif' ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' :
                               bigClockFont === 'mono' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' :
                               bigClockFont === 'elegant' ? '"Helvetica Neue Thin", "Helvetica Neue Light", "Segoe UI Light", "Roboto Light", sans-serif' :
                               bigClockFont === 'fun' ? '"Comic Sans MS", "Chalkboard SE", cursive' :
                               bigClockFont === 'poppins' ? 'Poppins, sans-serif' :
                               bigClockFont === 'playfair' ? 'var(--font-playfair), "Playfair Display", Georgia, serif' :
                               bigClockFont === 'raleway' ? 'var(--font-raleway), Raleway, sans-serif' :
                               bigClockFont === 'space' ? 'var(--font-space-grotesk), "Space Grotesk", sans-serif' :
                               bigClockFont === 'bebas' ? 'var(--font-bebas-neue), "Bebas Neue", sans-serif' :
                               bigClockFont === 'pacifico' ? 'var(--font-pacifico), Pacifico, cursive' :
                               bigClockFont === 'outfit' ? 'var(--font-outfit), Outfit, sans-serif' : undefined
                }}
              >
                {bigClockTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        )}


        {/* Apps Grid with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={apps.map(app => app.id)} strategy={rectSortingStrategy}>
            <div className="mb-6" style={{ marginTop: appGroupMarginTop }}>
              <div className={`${centerAppsGroup
                ? 'grid w-fit mx-auto [grid-template-columns:repeat(3,max-content)] xs:[grid-template-columns:repeat(4,max-content)] sm:[grid-template-columns:repeat(5,max-content)] md:[grid-template-columns:repeat(6,max-content)] lg:[grid-template-columns:repeat(8,max-content)] xl:[grid-template-columns:repeat(10,max-content)] 2xl:[grid-template-columns:repeat(12,max-content)] 3xl:[grid-template-columns:repeat(14,max-content)]'
                : 'grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 3xl:grid-cols-14'
                } gap-y-10 sm:gap-y-11 auto-rows-[40px] sm:auto-rows-[48px] lg:auto-rows-[60px]`}
                style={{ columnGap: `${appCardGapX}px` }}
              >
                {apps.map((app, index) => (
                  app.type === 'halite' ? (
                    <HaliteCard
                      key={app.id}
                      app={app}
                      onRemove={removeApp}
                      isDark={isDarkMode}
                      showAppTitles={showAppTitles}
                      hideAppTitleText={hideAppTitleText}
                      backgroundImage={backgroundImage}
                      glassmorphismEnabled={glassmorphismEnabled}
                      appTitleColor={appTitleColor}
                      isEditModalOpen={isEditModalOpen}
                      jiggleIndex={index}
                      animateIconsEnabled={animateIconsEnabled}
                      hoverAnimationStyle={hoverAnimationStyle}
                      monochromeIcons={monochromeIcons}
                      appCardBorderRadius={appCardBorderRadius}
                      removeAppCardBorders={removeAppCardBorders}
                      appCardSize={appCardSize}
                      customAppCardSize={customAppCardSize}
                      appCardInnerShadow={appCardInnerShadow}
                      appCardBackgroundColor={appCardBackgroundColor}
                      onContextMenu={handleContextMenu}
                      onAppClick={trackAppClick}
                    />
                  ) : (
                    <SortableLinkCard
                      key={app.id}
                      app={app}
                      onRemove={removeApp}
                      isDark={isDarkMode}
                      showAppTitles={showAppTitles}
                      hideAppTitleText={hideAppTitleText}
                      backgroundImage={backgroundImage}
                      glassmorphismEnabled={glassmorphismEnabled}
                      appTitleColor={appTitleColor}
                      isEditModalOpen={isEditModalOpen}
                      jiggleIndex={index}
                      animateIconsEnabled={animateIconsEnabled}
                      hoverAnimationStyle={hoverAnimationStyle}
                      monochromeIcons={monochromeIcons}
                      appCardBorderRadius={appCardBorderRadius}
                      removeAppCardBorders={removeAppCardBorders}
                      appCardSize={appCardSize}
                      customAppCardSize={customAppCardSize}
                      appCardInnerShadow={appCardInnerShadow}
                      appCardBackgroundColor={appCardBackgroundColor}
                      onContextMenu={handleContextMenu}
                      onAppClick={trackAppClick}
                    />
                  )
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>

        {/* Widget Area */}
        {widgets.length > 0 && (
          <div className="mt-12">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={widgets.map(widget => widget.id)} strategy={rectSortingStrategy}>
                <div className={`${centerAppsGroup
                  ? 'grid w-fit mx-auto [grid-template-columns:repeat(1,max-content)] sm:[grid-template-columns:repeat(2,max-content)] md:[grid-template-columns:repeat(3,max-content)] lg:[grid-template-columns:repeat(4,max-content)] xl:[grid-template-columns:repeat(5,max-content)] 2xl:[grid-template-columns:repeat(6,max-content)] 3xl:[grid-template-columns:repeat(7,max-content)]'
                  : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7'
                  } gap-y-4 sm:gap-y-5 ${centerAppsGroup ? 'gap-x-2 sm:gap-x-3 lg:gap-x-4' : 'gap-x-0 sm:gap-x-1 lg:gap-x-2'}`}>
                  {widgets.map((widget, index) => (
                    widget.type === 'clock' ? (
                      <SortableClockWidget
                        key={widget.id}
                        widget={widget}
                        isDark={isDarkMode}
                        onRemove={() => {
                          setWidgets(widgets.filter(w => w.id !== widget.id));
                        }}
                        isEditModalOpen={isEditModalOpen}
                        backgroundImage={backgroundImage}
                        glassmorphismEnabled={glassmorphismEnabled}
                        widgetTextColor={widgetTextColor}
                        jiggleIndex={index}
                        animateIconsEnabled={animateIconsEnabled}
                        animateWidgetsEnabled={animateWidgetsEnabled}
                        hoverAnimationStyle={hoverAnimationStyle}
                      />
                    ) : (
                      widget.type === 'weather' ? (
                        <WeatherWidget
                          key={widget.id}
                          widget={widget}
                          isDark={isDarkMode}
                          onRemove={() => {
                            setWidgets(widgets.filter(w => w.id !== widget.id));
                          }}
                          isEditModalOpen={isEditModalOpen}
                          backgroundImage={backgroundImage}
                          glassmorphismEnabled={glassmorphismEnabled}
                          widgetTextColor={widgetTextColor}
                          jiggleIndex={index}
                          animateIconsEnabled={animateIconsEnabled}
                          animateWidgetsEnabled={animateWidgetsEnabled}
                          hoverAnimationStyle={hoverAnimationStyle}
                        />
                      ) : (
                        widget.type === 'calendar' ? (
                          <CalendarWidget
                            key={widget.id}
                            widget={widget}
                            isDark={isDarkMode}
                            onRemove={() => {
                              setWidgets(widgets.filter(w => w.id !== widget.id));
                            }}
                            isEditModalOpen={isEditModalOpen}
                            backgroundImage={backgroundImage}
                            glassmorphismEnabled={glassmorphismEnabled}
                            widgetTextColor={widgetTextColor}
                            jiggleIndex={index}
                            animateIconsEnabled={animateIconsEnabled}
                            animateWidgetsEnabled={animateWidgetsEnabled}
                            hoverAnimationStyle={hoverAnimationStyle}
                          />
                        ) : (
                          widget.type === 'water-tracker' ? (
                            <WaterTrackerWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : widget.type === 'quick-notes' ? (
                            <QuickNotesWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : widget.type === 'spacer' ? (
                            <SpacerWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : widget.type === 'photo' ? (
                            <PhotoWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : widget.type === 'fidget-spinner' ? (
                            <FidgetSpinnerWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : widget.type === 'pomodoro' ? (
                            <PomodoroWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : widget.type === 'dice' ? (
                            <DiceWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : widget.type === 'coin-flip' ? (
                            <CoinFlipWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                              animateIconsEnabled={animateIconsEnabled}
                              animateWidgetsEnabled={animateWidgetsEnabled}
                              hoverAnimationStyle={hoverAnimationStyle}
                            />
                          ) : (
                            <AnalogClockWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                            />
                          )
                        )
                      )
                    )
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Bookmarks Section */}
        {showBookmarks && (
          <div className="mt-10">
            <div className={`mb-3 flex items-center gap-3`}>
              {(showBookmarksTitle || isEditModalOpen) && (
                <button
                  type="button"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ring-1 ${isDarkMode ? 'bg-white/10 text-white ring-white/15 hover:bg-white/15' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'}`}
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
                <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold tracking-wide`}>Bookmarks</h3>
              )}
            </div>

            {bookmarks.length === 0 ? (
              showBookmarksTitle ? (
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>No bookmarks yet. Click + to create one.</div>
              ) : null
            ) : (
              <div className={`${centerBookmarksGroup ? 'flex justify-center' : ''
                }`}>
                <div className={`${bookmarkStyle === 'chips' ? 'flex flex-wrap gap-2' :
                  bookmarkStyle === 'list' ? 'space-y-2' :
                    bookmarkStyle === 'minimal' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3' :
                      bookmarkStyle === 'compact' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5' :
                        bookmarkStyle === 'modern' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4' :
                          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3'
                  }`}>
                  {bookmarks.map((bm) => (
                    bookmarkStyle === 'chips' ? (
                      <a
                        key={bm.id}
                        href={bm.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                      >
                        {bm.icon ? (
                          <img src={bm.icon} alt="icon" className="w-3.5 h-3.5 rounded" />
                        ) : (
                          <div className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} w-3.5 h-3.5 rounded`} />
                        )}
                        <span className="truncate max-w-[160px]">{bm.title}</span>
                        {isEditModalOpen && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setBookmarks((prev) => prev.filter((x) => x.id !== bm.id)); }}
                            className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
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
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] ${glassmorphismEnabled
                            ? (isDarkMode ? 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10' : 'bg-white/50 ring-1 ring-white/30 hover:bg-white/70')
                            : (isDarkMode ? 'bg-[#0a0a0a] ring-1 ring-white/5 hover:bg-[#111]' : 'bg-gray-50 ring-1 ring-gray-100 hover:bg-white')
                          } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                      >
                        {bm.icon ? (
                          <img src={bm.icon} alt="icon" className="w-5 h-5 rounded flex-shrink-0" />
                        ) : (
                          <div className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} w-5 h-5 rounded flex-shrink-0`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bm.title}</div>
                          <div className={`text-xs truncate ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>{bm.href.replace(/^https?:\/\//, '')}</div>
                        </div>
                        {isEditModalOpen && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setBookmarks((prev) => prev.filter((x) => x.id !== bm.id)); }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                        className={`group relative p-4 rounded-lg border transition-all hover:shadow-sm ${isDarkMode
                          ? 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5'
                          : 'bg-transparent border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {bm.icon ? (
                            <img src={bm.icon} alt="icon" className="w-4 h-4 rounded" />
                          ) : (
                            <div className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} w-4 h-4 rounded`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bm.title}</div>
                            <div className={`text-xs truncate ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`}>{bm.href.replace(/^https?:\/\//, '')}</div>
                          </div>
                        </div>
                        {isEditModalOpen && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setBookmarks((prev) => prev.filter((x) => x.id !== bm.id)); }}
                            className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] ${glassmorphismEnabled
                            ? (isDarkMode ? 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10' : 'bg-white/50 ring-1 ring-white/30 hover:bg-white/70')
                            : (isDarkMode ? 'bg-[#0a0a0a] ring-1 ring-white/5 hover:bg-[#111]' : 'bg-gray-50 ring-1 ring-gray-100 hover:bg-white')
                          } ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {bm.icon ? (
                            <img src={bm.icon} alt="icon" className="w-6 h-6 rounded" />
                          ) : (
                            <div className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} w-6 h-6 rounded`} />
                          )}
                          <div className={`text-[10px] font-medium text-center leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ lineHeight: '1.2' }}>
                            {bm.title.length > 12 ? bm.title.substring(0, 12) + '...' : bm.title}
                          </div>
                        </div>
                        {isEditModalOpen && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setBookmarks((prev) => prev.filter((x) => x.id !== bm.id)); }}
                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-400 text-white hover:bg-red-500'}`}
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
                        className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${isDarkMode
                          ? 'bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/20 hover:from-white/15 hover:to-white/10 hover:ring-white/30'
                          : 'bg-gradient-to-br from-white to-gray-50 ring-1 ring-gray-200 hover:from-blue-50 hover:to-white hover:ring-blue-200'
                          } shadow-lg hover:shadow-xl ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {bm.icon ? (
                            <div className="relative">
                              <img src={bm.icon} alt="icon" className="w-5 h-5 rounded-lg" />
                              <div className={`absolute inset-0 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-blue-500/10'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </div>
                          ) : (
                            <div className={`w-5 h-5 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bm.title}</div>
                            <div className={`text-xs truncate ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>{bm.href.replace(/^https?:\/\//, '')}</div>
                          </div>
                        </div>
                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDarkMode ? 'bg-gradient-to-r from-transparent via-white/5 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/5 to-transparent'
                          }`} />
                        {isEditModalOpen && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setBookmarks((prev) => prev.filter((x) => x.id !== bm.id)); }}
                            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600'
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
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all ${glassmorphismEnabled
                            ? (isDarkMode ? 'bg-white/10 ring-1 ring-white/15 hover:bg-white/15' : 'bg-white/70 ring-1 ring-white/40 hover:bg-white')
                            : (isDarkMode ? 'bg-[#111] ring-1 ring-white/10 hover:bg-[#151515]' : 'bg-white ring-1 ring-gray-200 hover:bg-gray-50')
                          } shadow-sm hover:shadow-md ${isEditModalOpen ? 'ios-jiggle' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {bm.icon ? (
                            <img src={bm.icon} alt="icon" className="w-4 h-4 rounded" />
                          ) : (
                            <div className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} w-4 h-4 rounded`} />
                          )}
                          <div className={`truncate text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bm.title}</div>
                        </div>
                        <div className={`mt-2 truncate text-[10px] ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>{bm.href.replace(/^https?:\/\//, '')}</div>
                        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: isDarkMode ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
                        {isEditModalOpen && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setBookmarks((prev) => prev.filter((x) => x.id !== bm.id));
                            }}
                            className={`absolute top-2 right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title="Remove bookmark"
                          >
                            ×
                          </button>
                        )}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Bookmark Modal */}
        {isAddBookmarkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsAddBookmarkOpen(false)} />
            <div className={`relative z-10 w-[92%] max-w-sm rounded-2xl p-4 ${isDarkMode ? 'bg-[#121212] text-white ring-1 ring-white/10' : 'bg-white text-gray-900 ring-1 ring-gray-200'}`}>
              <h4 className="text-sm font-semibold mb-3">Add Bookmark</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={bookmarkTitleInput}
                  onChange={(e) => setBookmarkTitleInput(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 placeholder-gray-400' : 'bg-white ring-gray-200 placeholder-gray-500'}`}
                />
                <input
                  type="text"
                  placeholder="URL (e.g., twitter.com or https://twitter.com)"
                  value={bookmarkUrlInput}
                  onChange={(e) => setBookmarkUrlInput(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 placeholder-gray-400' : 'bg-white ring-gray-200 placeholder-gray-500'}`}
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => setIsAddBookmarkOpen(false)} className={`px-3 py-1.5 rounded-lg text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>Cancel</button>
                <button
                  onClick={() => {
                    const t = bookmarkTitleInput.trim();
                    const raw = bookmarkUrlInput.trim();
                    if (!t || !raw) return;
                    const href = raw.startsWith('http') ? raw : `https://${raw}`;
                    const icon = getFaviconUrl(href);
                    setBookmarks((prev) => [...prev, { id: Date.now().toString(), title: t, href, icon }]);
                    setIsAddBookmarkOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Add App Modal */}
        {isQuickAppOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsQuickAppOpen(false)} />
            <div className="absolute bottom-20 right-4 z-10 flex gap-4">
              <div className={`w-80 lg:w-[30rem] rounded-[28px] p-4 shadow-2xl max-h-96 overflow-y-auto custom-scrollbar ${glassmorphismEnabled ? (isDarkMode ? 'bg-[#2B2B2B]/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md') : isDarkMode ? 'bg-[#121212] text-white ring-1 ring-white/10' : 'bg-white text-white ring-1 ring-gray-200'} text-white`}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { title: 'YouTube', url: 'youtube.com' },
                    { title: 'GitHub', url: 'github.com' },
                    { title: 'Twitter', url: 'twitter.com' },
                    { title: 'Reddit', url: 'reddit.com' },
                    { title: 'Instagram', url: 'instagram.com' },
                    { title: 'LinkedIn', url: 'linkedin.com' },
                    { title: 'Facebook', url: 'facebook.com' },
                    { title: 'Netflix', url: 'netflix.com' },
                    { title: 'Spotify', url: 'spotify.com' },
                    { title: 'Discord', url: 'discord.com' },
                    { title: 'Notion', url: 'notion.so' },
                    { title: 'Figma', url: 'figma.com' },
                    { title: 'Amazon', url: 'amazon.com' },
                    { title: 'Google', url: 'google.com' },
                    { title: 'Gmail', url: 'gmail.com' },
                    { title: 'Twitch', url: 'twitch.tv' },
                    { title: 'ChatGPT', url: 'chatgpt.com' },
                    { title: 'Apple', url: 'apple.com' },
                    { title: 'Wikipedia', url: 'wikipedia.org' },
                    { title: 'BBC', url: 'bbc.com' },
                    { title: 'CNN', url: 'cnn.com' },
                    { title: 'Pinterest', url: 'pinterest.com' },
                    { title: 'TikTok', url: 'tiktok.com' },
                    { title: 'eBay', url: 'ebay.com' },
                    { title: 'AliExpress', url: 'aliexpress.com' },
                    { title: 'Airbnb', url: 'airbnb.com' },
                    { title: 'Booking.com', url: 'booking.com' },
                    { title: 'IMDb', url: 'imdb.com' },
                    { title: 'Trello', url: 'trello.com' },
                    { title: 'Slack', url: 'slack.com' },
                    { title: 'Zoom', url: 'zoom.us' },
                    { title: 'Dropbox', url: 'dropbox.com' },
                    { title: 'Adobe', url: 'adobe.com' },
                    { title: 'Canva', url: 'canva.com' },
                  ].map((site) => (
                    <button
                      key={site.url}
                      onClick={() => {
                        addApp({
                          id: Date.now().toString(),
                          title: site.title,
                          href: `https://${site.url}`,
                          icon: getFaviconUrl(`https://${site.url}`)
                        });
                        setIsQuickAppOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-2xl text-sm transition-colors flex items-center gap-2 ${isDarkMode
                        ? 'bg-white/5 hover:bg-white/10 text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                    >
                      <img
                        src={getFaviconUrl(`https://${site.url}`)}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span>{site.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={`w-80 rounded-2xl p-4 shadow-2xl ${glassmorphismEnabled ? (isDarkMode ? 'bg-[#2B2B2B]/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md') : isDarkMode ? 'bg-[#121212] text-white ring-1 ring-white/10' : 'bg-white text-white ring-1 ring-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>Add Favorite App</h4>
                <div className="space-y-3">
                  <div className={`p-2.5 rounded-xl flex items-center gap-3 ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10' : 'bg-gray-50 ring-gray-200'}`}>
                    <img 
                      src={quickAppUrlInput ? getFaviconUrl(quickAppUrlInput.startsWith('http') ? quickAppUrlInput : `https://${quickAppUrlInput}`) : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 10h.01M15 10h.01M9.5 15c.658.658 1.5.94 2.5.94s1.842-.282 2.5-.94" /></svg>'} 
                      alt="Preview" 
                      className={`w-8 h-8 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-white shadow-sm'}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 10h.01M15 10h.01M9.5 15c.658.658 1.5.94 2.5.94s1.842-.282 2.5-.94" /></svg>';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {quickAppTitleInput || 'App Name'}
                      </p>
                      <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {quickAppUrlInput || 'URL Preview'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="App name"
                    value={quickAppTitleInput}
                    onChange={(e) => setQuickAppTitleInput(e.target.value)}
                    className={`w-full px-3 py-2 rounded-full text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 text-gray-200 placeholder-gray-400' : 'bg-white ring-gray-200 text-gray-500 placeholder-gray-500'}`}
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g., twitter.com or https://twitter.com)"
                    value={quickAppUrlInput}
                    onChange={(e) => setQuickAppUrlInput(e.target.value)}
                    className={`w-full px-3 py-2 rounded-full text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 text-gray-200 placeholder-gray-400' : 'bg-white ring-gray-200 text-gray-500 placeholder-gray-500'}`}
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => setIsQuickAppOpen(false)} className={`px-4 py-1.5 rounded-full text-sm ${isDarkMode ? 'bg-white/15 hover:bg-white/25 text-black' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}>Cancel</button>
                  <button
                    onClick={() => {
                      const t = quickAppTitleInput.trim();
                      const raw = quickAppUrlInput.trim();
                      if (!t || !raw) return;
                      const normalizedHref = raw.startsWith('http') ? raw : `https://${raw}`;
                      addApp({ id: Date.now().toString(), title: t, href: normalizedHref });
                      setQuickAppTitleInput('');
                      setQuickAppUrlInput('');
                      setIsQuickAppOpen(false);
                    }}
                    className={`px-5 py-1.5 rounded-full min-w-[96px] text-sm ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Halite Modal */}
        {isHaliteModalOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsHaliteModalOpen(false)} />
            <div className="absolute bottom-20 right-4 z-10">
              <div className={`w-80 rounded-2xl p-4 shadow-2xl ${glassmorphismEnabled ? (isDarkMode ? 'bg-[#2B2B2B]/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md') : isDarkMode ? 'bg-[#121212] text-white ring-1 ring-white/10' : 'bg-white text-gray-900 ring-1 ring-gray-200'}`}>
                <h4 className="text-sm font-semibold mb-3">Add Halite Folder</h4>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Add 2-4 URLs to create a folder that opens all sites</p>
                <div className="space-y-2 mb-3">
                  <input
                    type="text"
                    placeholder="Folder name (optional)"
                    value={haliteFolderName}
                    onChange={(e) => setHaliteFolderName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 placeholder-gray-400' : 'bg-white ring-gray-200 placeholder-gray-500'}`}
                  />
                </div>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={`URL ${index + 1} (e.g., twitter.com)`}
                      value={haliteUrls[index] || ''}
                      onChange={(e) => {
                        const newUrls = [...haliteUrls];
                        newUrls[index] = e.target.value;
                        setHaliteUrls(newUrls);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 placeholder-gray-400' : 'bg-white ring-gray-200 placeholder-gray-500'}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setIsHaliteModalOpen(false)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addHaliteFolder}
                    disabled={haliteUrls.filter(url => url.trim() !== '').length < 2 || haliteUrls.filter(url => url.trim() !== '').length > 4}
                    className={`px-3 py-1.5 rounded-lg text-sm ${haliteUrls.filter(url => url.trim() !== '').length >= 2 && haliteUrls.filter(url => url.trim() !== '').length <= 4 ? (isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-500') : 'bg-gray-400 cursor-not-allowed'} text-white`}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowResetModal(false)} />
            <div className={`relative z-10 w-[92%] max-w-sm rounded-2xl p-4 ${isDarkMode ? 'bg-[#121212] text-white ring-1 ring-white/10' : 'bg-white text-gray-900 ring-1 ring-gray-200'}`}>
              <h4 className="text-sm font-semibold mb-2">Reset all settings?</h4>
              <p className={`text-xs ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>This will restore default apps, widgets, and preferences.</p>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => setShowResetModal(false)} className={`px-3 py-1.5 rounded-lg text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>Cancel</button>
                <button
                  onClick={() => { setShowResetModal(false); /* proceed */ resetSettingsSilently(); }}
                  className={`px-3 py-1.5 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit App Modal */}
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={cancelEditingApp} />
            <div className={`relative z-10 w-[92%] max-w-sm rounded-2xl p-4 ${isDarkMode ? 'bg-[#121212] text-white ring-1 ring-white/10' : 'bg-white text-gray-900 ring-1 ring-gray-200'}`}>
              <h4 className="text-sm font-semibold mb-3">Edit App</h4>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                  <input
                    type="text"
                    placeholder="App title"
                    value={editAppTitle}
                    onChange={(e) => setEditAppTitle(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 placeholder-gray-400 text-white' : 'bg-white ring-gray-200 placeholder-gray-500 text-gray-900'}`}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>URL</label>
                  <input
                    type="text"
                    placeholder="URL (e.g., example.com or https://example.com)"
                    value={editAppUrl}
                    onChange={(e) => setEditAppUrl(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none ring-1 ${isDarkMode ? 'bg-white/5 ring-white/10 placeholder-gray-400 text-white' : 'bg-white ring-gray-200 placeholder-gray-500 text-gray-900'}`}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={cancelEditingApp} className={`px-3 py-1.5 rounded-lg text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>Cancel</button>
                <button
                  onClick={saveEditedApp}
                  disabled={!editAppTitle.trim() || !editAppUrl.trim()}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    editAppTitle.trim() && editAppUrl.trim()
                      ? isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-500'
                      : isDarkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed'
                  } text-white`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar under widget cards group */}
        {showSearchBar && (
          <div className={`mt-6 mb-6 relative rounded-2xl shadow-lg ${compactSearchBar ? 'p-1' : 'p-1.5 sm:p-2'} ${searchBarWidth === 'narrow' ? 'max-w-md mx-auto' : searchBarWidth === 'wide' ? 'max-w-4xl mx-auto' : 'max-w-2xl mx-auto'
            } ${glassmorphismEnabled
                ? (isDarkMode ? 'bg-black/20 backdrop-blur-md ring-1 ring-white/10' : 'bg-white/40 backdrop-blur-md ring-1 ring-white/30')
                : (isDarkMode ? 'bg-[#0f1115] ring-1 ring-white/10' : 'bg-white ring-1 ring-gray-200')
            }`}>
            <div className="flex items-stretch gap-2">
              {youtubeSearchMode && (
                <div className="flex items-center px-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
              )}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchSuggestions.length > 0 && setIsSuggestOpen(true)}
                  onBlur={() => setTimeout(() => setIsSuggestOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const chosen = highlightIndex >= 0 ? searchSuggestions[highlightIndex] : searchTerm;
                      submitSearch(chosen);
                      setIsSuggestOpen(false);
                      return;
                    }
                    if (!isSuggestOpen || searchSuggestions.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightIndex((prev) => (prev + 1) % searchSuggestions.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightIndex((prev) => (prev - 1 + searchSuggestions.length) % searchSuggestions.length);
                    }
                  }}
                  placeholder={youtubeSearchMode ? "Search YouTube..." : "Search apps..."}
                  className={`w-full ${compactSearchBar ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-xs'} rounded-full border-0 bg-transparent focus:outline-none focus:ring-0 transition-none ${isDarkMode
                    ? 'text-white placeholder-gray-400'
                    : 'text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
              <button
                type="button"
                onClick={() => submitSearch(highlightIndex >= 0 ? searchSuggestions[highlightIndex] : searchTerm)}
                className={`${compactSearchBar ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-full text-sm font-semibold bg-transparent ring-0 transition-none ${isDarkMode ? 'text-white/80' : 'text-gray-800/80'
                  }`}
                title="Search"
                aria-label="Search"
              >
                <svg className={`${compactSearchBar ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </button>
            </div>
            {isSuggestOpen && searchSuggestions.length > 0 && (
              <div
                className={`absolute top-full left-0 right-0 mt-1 z-50 rounded-2xl shadow-xl overflow-hidden ${glassmorphismEnabled
                  ? (isDarkMode
                    ? 'bg-black/25 backdrop-blur-[28px] backdrop-saturate-200 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'bg-white/36 backdrop-blur-[28px] backdrop-saturate-200 ring-1 ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]')
                  : (isDarkMode
                    ? 'bg-[#0f1115] ring-1 ring-white/10'
                    : 'bg-white ring-1 ring-gray-200')
                }`}>
                {searchSuggestions.map((s, i) => (
                  <button
                    key={`${s}-${i}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchTerm(s);
                      setIsSuggestOpen(false);
                      submitSearch(s);
                    }}
                    role="option"
                    aria-selected={i === highlightIndex}
                    aria-label={s}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors duration-150 outline-none ${isDarkMode
                      ? 'text-white font-medium hover:bg-white/10'
                      : 'text-gray-900 font-medium hover:bg-gray-100'
                      } ${i === highlightIndex
                        ? (isDarkMode ? 'bg-white/10 ring-1 ring-white/20' : 'bg-gray-100 ring-1 ring-gray-200')
                        : 'ring-0'} focus-visible:ring-2 focus-visible:ring-blue-500/40`}
                    title={s}
                  >
                    <span className="truncate block">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {apps.length === 0 && (
          <div className={`text-center mt-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            <p>No apps added yet. Click the + button to add your first app!</p>
          </div>
        )}
      </div>

      {/* Floating Action Dock Wrapper */}
      <div className="fixed bottom-0 right-0 p-4 sm:p-5 z-30 flex items-end justify-end group" style={{ pointerEvents: dockVisibility === 'hover' && !isEditModalOpen ? 'auto' : 'none', width: '150px', height: '150px' }}>
        <div
          className={`rounded-full shadow-lg border flex items-center gap-1 transition-all duration-300 pointer-events-auto ${
            topPillSize === 'small' ? 'px-1 py-1 sm:px-1 sm:py-1 gap-0.5' :
            topPillSize === 'large' ? 'px-1.5 py-1.5 sm:px-2 sm:py-2 gap-1.5' :
            'px-1 py-1 sm:px-1.5 sm:py-1.5'
          } ${glassmorphismEnabled
              ? (isDarkMode
                ? 'bg-black/25 border-white/10 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.35)]'
                : 'bg-white/60 border-white/30 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.12)]')
              : (isDarkMode
                ? 'bg-[#0f1115] border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
                : 'bg-white border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.10)]')
            } ${dockVisibility === 'hover' && !isEditModalOpen ? 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-100 translate-y-0'}`}
        >
        {/* Edit Mode Button */}
        <button
          onClick={() => {
            setIsEditModalOpen(!isEditModalOpen);
          }}
          className={`${
            topPillSize === 'small' ? 'w-6 h-6 sm:w-7 sm:h-7' :
            topPillSize === 'large' ? 'w-8 h-8 sm:w-10 sm:h-10' :
            'w-7 h-7 sm:w-8 sm:h-8'
          } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${glassmorphismEnabled
              ? (isDarkMode ? 'bg-white/10 text-white ring-white/10 hover:bg-white/15' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50')
              : (isDarkMode ? 'bg-[#1b1b1b] text-white ring-white/10 hover:bg-[#222]' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50')
            } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0`}
          title={isEditModalOpen ? "Exit Edit Mode" : "Enter Edit Mode"}
          aria-label={isEditModalOpen ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          {isEditModalOpen ? (
            <svg className={`${topPillSize === 'small' ? 'w-3.5 h-3.5' : topPillSize === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className={`${topPillSize === 'small' ? 'w-3.5 h-3.5' : topPillSize === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )}
        </button>

        {/* Quick Add Favorite App Button (left of Settings) */}
        {isEditModalOpen && (
        <div className="relative">
          <button
            onClick={quickAddFavoriteApp}
            className={`${
              topPillSize === 'small' ? 'w-6 h-6 sm:w-7 sm:h-7' :
              topPillSize === 'large' ? 'w-8 h-8 sm:w-10 sm:h-10' :
              'w-7 h-7 sm:w-8 sm:h-8'
            } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${glassmorphismEnabled
                ? (isDarkMode ? 'bg-white/10 text-white ring-white/10 hover:bg-white/15' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50')
                : (isDarkMode ? 'bg-[#1b1b1b] text-white ring-white/10 hover:bg-[#222]' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50')
              } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0`}
            title="Add Favorite App"
            aria-label="Add Favorite App"
          >
            <svg className={`${topPillSize === 'small' ? 'w-3.5 h-3.5' : topPillSize === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        )}

        {/* Halite Folder Button */}
        {isEditModalOpen && (
        <button
          onClick={openHaliteModal}
          className={`${
            topPillSize === 'small' ? 'w-6 h-6 sm:w-7 sm:h-7' :
            topPillSize === 'large' ? 'w-8 h-8 sm:w-10 sm:h-10' :
            'w-7 h-7 sm:w-8 sm:h-8'
          } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${glassmorphismEnabled
              ? (isDarkMode ? 'bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 text-white ring-yellow-500/30 hover:ring-yellow-500/50' : 'bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 text-white ring-yellow-500/30 hover:ring-yellow-500/50')
              : 'bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 text-white ring-yellow-500/30 hover:ring-yellow-500/50'
            } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0`}
          title="Add Halite Folder"
          aria-label="Add Halite Folder"
        >
          <svg className={`${topPillSize === 'small' ? 'w-3.5 h-3.5' : topPillSize === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`${
            topPillSize === 'small' ? 'w-6 h-6 sm:w-7 sm:h-7' :
            topPillSize === 'large' ? 'w-8 h-8 sm:w-10 sm:h-10' :
            'w-7 h-7 sm:w-8 sm:h-8'
          } rounded-full transition-all duration-300 flex items-center justify-center ring-1 ${glassmorphismEnabled
              ? (isDarkMode ? 'bg-white/10 text-white ring-white/10 hover:bg-white/15' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50')
              : (isDarkMode ? 'bg-[#1b1b1b] text-white ring-white/10 hover:bg-[#222]' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50')
            } shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0`}
          title="Settings"
          aria-label="Settings"
        >
          <svg className={`${topPillSize === 'small' ? 'w-3.5 h-3.5' : topPillSize === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        </div>
      </div>


      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        apps={apps}
        onAddApp={addApp}
        isDarkMode={isDarkMode}
        onToggleTheme={() => {
          setIsDarkMode(prev => {
            const next = !prev;
            console.log('🌙 Theme toggled from', prev, 'to', next);
            return next;
          });
        }}
        showAppTitles={showAppTitles}
        hideAppTitleText={hideAppTitleText}
        showSearchBar={showSearchBar}
        onToggleShowAppTitles={() => {
          setShowAppTitles(prev => {
            const next = !prev;
            console.log('📱 Show app titles toggled from', prev, 'to', next);
            return next;
          });
        }}
        onToggleHideAppTitleText={() => {
          setHideAppTitleText(prev => {
            const next = !prev;
            console.log('📱 Hide app title text toggled from', prev, 'to', next);
            return next;
          });
        }}
        onToggleSearchBar={() => {
          setShowSearchBar(prev => {
            const next = !prev;
            console.log('🔎 Show search bar toggled from', prev, 'to', next);
            return next;
          });
        }}
        backgroundImage={backgroundImage}
        onSetBackgroundImage={(url) => {
          console.log('🖼️ Background image changed to:', url);
          
          if (url === 'reload-needed') {
            // Image was saved to IndexedDB, reload to display it
            window.location.reload();
            return;
          }
          
          setBackgroundImage(url);
          
          // Save flag to localStorage
          if (typeof window !== 'undefined') {
            try {
              if (url) {
                localStorage.setItem('hasBackgroundImage', 'true');
              } else {
                localStorage.removeItem('hasBackgroundImage');
              }
              console.log('💾 Background state saved');
            } catch (e) {
              console.error('Failed to save state:', e);
            }
          }
        }}
        backgroundBlur={backgroundBlur}
        onSetBackgroundBlur={(value: number) => setBackgroundBlur(value)}
        animatedGradientBackground={animatedGradientBackground}
        onToggleAnimatedGradientBackground={() => {
          setAnimatedGradientBackground(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') localStorage.setItem('animatedGradientBackground', next.toString());
            return next;
          });
        }}
        animatedGradientPreset={animatedGradientPreset}
        onSetAnimatedGradientPreset={(val: 'default' | 'ocean' | 'sunset' | 'aurora' | 'midnight') => {
          setAnimatedGradientPreset(val);
          if (typeof window !== 'undefined') localStorage.setItem('animatedGradientPreset', val);
        }}
        glassmorphismEnabled={glassmorphismEnabled}
        onToggleGlassmorphism={() => {
          setGlassmorphismEnabled(prev => {
            const next = !prev;
            console.log('🔮 Glassmorphism toggled from', prev, 'to', next);
            if (next) {
              setNormalModeEnabled(false);
            }
            return next;
          });
        }}


        normalModeEnabled={normalModeEnabled}
        onToggleNormalMode={() => {
          setNormalModeEnabled(prev => {
            const next = !prev;
            console.log('📱 Normal mode toggled from', prev, 'to', next);
            if (next) {
              setGlassmorphismEnabled(false);
            }
            return next;
          });
        }}


        appTitleColor={appTitleColor}
        onSetAppTitleColor={(color) => {
          console.log('🎨 App title color changed to:', color);
          setAppTitleColor(color);
        }}
        widgetTextColor={widgetTextColor}
        onSetWidgetTextColor={(color) => {
          console.log('🎨 Widget text color changed to:', color);
          setWidgetTextColor(color);
        }}
        addWidget={addWidget}
        onResetSettings={resetSettings}

        animateIconsEnabled={animateIconsEnabled}
        onToggleAnimateIcons={() => setAnimateIconsEnabled(prev => !prev)}
        hoverAnimationStyle={hoverAnimationStyle}
        onSetHoverAnimationStyle={(style) => setHoverAnimationStyle(style)}
        animateWidgetsEnabled={animateWidgetsEnabled}
        onToggleAnimateWidgets={() => setAnimateWidgetsEnabled(prev => !prev)}
        centerAppsGroup={centerAppsGroup}
        onToggleCenterAppsGroup={() => setCenterAppsGroup(prev => !prev)}
        showBookmarks={showBookmarks}
        onToggleBookmarks={() => setShowBookmarks(prev => !prev)}
        bookmarkStyle={bookmarkStyle}
        onSetBookmarkStyle={setBookmarkStyle}
        showBookmarksTitle={showBookmarksTitle}
        onToggleBookmarksTitle={() => setShowBookmarksTitle(prev => !prev)}

        centerBookmarksGroup={centerBookmarksGroup}
        onToggleCenterBookmarksGroup={() => setCenterBookmarksGroup(prev => !prev)}
        appGroupMarginTop={appGroupMarginTop}
        onSetAppGroupMarginTop={(value) => setAppGroupMarginTop(value)}
        topPillSize={topPillSize}
        onSetTopPillSize={(size) => {
          setTopPillSize(size);
          if (typeof window !== 'undefined') localStorage.setItem('topPillSize', size);
        }}
        topPillStyle={topPillStyle}
        onSetTopPillStyle={(style) => {
          setTopPillStyle(style);
          if (typeof window !== 'undefined') localStorage.setItem('topPillStyle', style);
        }}
        mergeTopPillsCenter={mergeTopPillsCenter}
        onToggleMergeTopPillsCenter={() => {
          setMergeTopPillsCenter(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') localStorage.setItem('mergeTopPillsCenter', next.toString());
            return next;
          });
        }}
        topPillShape={topPillShape}
        onSetTopPillShape={(shape) => {
          setTopPillShape(shape);
          if (typeof window !== 'undefined') localStorage.setItem('topPillShape', shape);
        }}
        dockVisibility={dockVisibility}
        onSetDockVisibility={(visibility) => {
          setDockVisibility(visibility);
          if (typeof window !== 'undefined') localStorage.setItem('dockVisibility', visibility);
        }}
        showTopTime={showTopTime}
        onToggleTopTime={() => {
          setShowTopTime(prev => {
            const newValue = !prev;
            if (typeof window !== 'undefined') {
              localStorage.setItem('showTopTime', newValue.toString());
            }
            return newValue;
          });
        }}
        showBigClock={showBigClock}
        onToggleBigClock={() => {
          setShowBigClock(prev => {
            const newValue = !prev;
            if (typeof window !== 'undefined') {
              localStorage.setItem('showBigClock', newValue.toString());
            }
            return newValue;
          });
        }}
        bigClockMarginTop={bigClockMarginTop}
        onSetBigClockMarginTop={(value) => {
          setBigClockMarginTop(value);
          if (typeof window !== 'undefined') {
            localStorage.setItem('bigClockMarginTop', value.toString());
          }
        }}
        bigClockColor={bigClockColor}
        onSetBigClockColor={(color) => {
          setBigClockColor(color);
          if (typeof window !== 'undefined') localStorage.setItem('bigClockColor', color);
        }}
        bigClockFont={bigClockFont}
        onSetBigClockFont={(font) => {
          setBigClockFont(font);
          if (typeof window !== 'undefined') localStorage.setItem('bigClockFont', font);
        }}
        bigClockSize={bigClockSize}
        onSetBigClockSize={(size) => {
          setBigClockSize(size);
          if (typeof window !== 'undefined') localStorage.setItem('bigClockSize', size);
        }}
        bigClockGlassMode={bigClockGlassMode}
        onToggleBigClockGlassMode={() => {
          setBigClockGlassMode(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') localStorage.setItem('bigClockGlassMode', next.toString());
            return next;
          });
        }}

        greetingStyle={greetingStyle}
        onSetGreetingStyle={(style) => setGreetingStyle(style)}
        searchBarWidth={searchBarWidth}
        onSetSearchBarWidth={(width) => {
          setSearchBarWidth(width);
          // Save immediately
          if (typeof window !== 'undefined') {
            localStorage.setItem('searchBarWidth', width);
            console.log('💾 Search bar width saved immediately:', width);
          }
        }}
        compactSearchBar={compactSearchBar}
        onToggleCompactSearchBar={() => setCompactSearchBar(prev => !prev)}

        monochromeIcons={monochromeIcons}
        appCardBorderRadius={appCardBorderRadius}
        onSetAppCardBorderRadius={setAppCardBorderRadius}
        appCardGapX={appCardGapX}
        onSetAppCardGapX={setAppCardGapX}
        onToggleMonochromeIcons={() => {
          setMonochromeIcons(prev => {
            const newValue = !prev;
            // Save immediately
            if (typeof window !== 'undefined') {
              localStorage.setItem('monochromeIcons', newValue.toString());
              console.log('💾 Monochrome icons saved immediately:', newValue);
            }
            return newValue;
          });
        }}
        removeAppCardBorders={removeAppCardBorders}
        onToggleRemoveAppCardBorders={() => setRemoveAppCardBorders(prev => !prev)}
        appCardSize={appCardSize}
        onSetAppCardSize={setAppCardSize}
        customAppCardSize={customAppCardSize}
        onSetCustomAppCardSize={(size) => {
          setCustomAppCardSize(size);
          if (typeof window !== 'undefined') localStorage.setItem('customAppCardSize', size.toString());
        }}
        appCardInnerShadow={appCardInnerShadow}
        onSetAppCardInnerShadow={setAppCardInnerShadow}
        appCardBackgroundColor={appCardBackgroundColor}
        onSetAppCardBackgroundColor={(color) => {
          setAppCardBackgroundColor(color);
          if (typeof window !== 'undefined') {
            localStorage.setItem('appCardBackgroundColor', color);
          }
        }}

        fontFamily={fontFamily}
        onSetFontFamily={(family) => {
          console.log('Font family selected:', family);
          setFontFamily(family);
        }}
      />

      {/* Context Menu */}
      {contextMenu && (() => {
        // Find the app to check if it's a folder
        const clickedApp = apps.find(app => app.id === contextMenu.appId);
        const isFolder = clickedApp?.type === 'halite';
        
        return (
          <div
            data-context-menu
            className="fixed z-[100]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div
              className={`min-w-[140px] rounded-xl shadow-xl ring-1 overflow-hidden py-1 ${isDarkMode
                ? glassmorphismEnabled
                  ? 'bg-[#2B2B2B]/90 backdrop-blur-md ring-white/20'
                  : 'bg-[#1e1e1e] ring-white/10'
                : glassmorphismEnabled
                  ? 'bg-white/90 backdrop-blur-md ring-gray-200/40'
                  : 'bg-white ring-gray-200'
                }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenInNewTab();
                }}
                className={`w-full px-3 py-1.5 text-left text-sm font-medium transition-colors flex items-center gap-2 ${isDarkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open in new tab
              </button>
              {/* Edit option for all apps */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditingApp(contextMenu.appId);
                }}
                className={`w-full px-3 py-1.5 text-left text-sm font-medium transition-colors flex items-center gap-2 ${isDarkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <svg
                  className="w-4 h-4"
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
                Edit App
              </button>
            </div>
          </div>
        );
      })()}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        apps={apps}
        isDarkMode={isDarkMode}
        glassmorphismEnabled={glassmorphismEnabled}
        onOpenApp={(app) => {
          if (typeof window !== 'undefined') {
            window.open(app.href, '_blank');
          }
        }}
        onOpenSettings={() => setIsSidebarOpen(true)}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
        onOpenStatistics={() => setIsStatisticsOpen(true)}
      />

      {/* Usage Statistics */}
      <UsageStatistics
        isOpen={isStatisticsOpen}
        onClose={() => setIsStatisticsOpen(false)}
        apps={apps}
        appClickCounts={appClickCounts}
        appLastClicked={appLastClicked}
        totalTimeSpent={totalTimeSpent}
        isDarkMode={isDarkMode}
      />

    </main>
  );
}