'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { App, HoverAnimationStyle } from './types';
import { getImageObjectUrl } from '../../lib/idb';

export interface AppCardProps {
  app: App;
  onRemove: (id: string) => void;
  isDark: boolean;
  showAppTitles: boolean;
  hideAppTitleText: boolean;
  backgroundImage?: string;
  glassmorphismEnabled: boolean;
  appTitleColor: 'auto' | 'black' | 'white';
  isEditModalOpen: boolean;
  jiggleIndex: number;
  animateIconsEnabled: boolean;
  hoverAnimationStyle: HoverAnimationStyle;
  monochromeIcons: boolean;
  onContextMenu: (e: React.MouseEvent, appId: string) => void;
  appCardBorderRadius: 'small' | 'medium' | 'full';
  removeAppCardBorders: boolean;
  appCardSize?: 'small' | 'normal' | 'large' | 'custom';
  customAppCardSize?: number;
  appCardInnerShadow?: 'none' | 'small' | 'medium' | 'large';
  appCardBackgroundColor?: string;
  appTitlePosition?: 'inside' | 'outside';
  onAppClick?: (appId: string) => void;
}

export function SortableLinkCard({
  app,
  onRemove,
  isDark,
  showAppTitles,
  hideAppTitleText,
  backgroundImage,
  glassmorphismEnabled,
  appTitleColor,
  isEditModalOpen,
  jiggleIndex,
  animateIconsEnabled,
  hoverAnimationStyle,
  monochromeIcons,
  onContextMenu,
  appCardBorderRadius,
  removeAppCardBorders,
  appCardSize = 'normal',
  customAppCardSize = 64,
  appCardInnerShadow = 'none',
  appCardBackgroundColor,
  appTitlePosition = 'outside',
  onAppClick,
}: AppCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, disabled: !isEditModalOpen });

  const [iconSrc, setIconSrc] = useState<string | undefined>(app.icon);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const isFaceprep = app.href.includes('faceprep.online');
    const isExamly = app.href.includes('rec215.examly.io');
    const isVektorcad = app.href.includes('rec.vektorcad.com');
    const isGmail = app.href.includes('gmail.com');

    if (isFaceprep) {
      setIconSrc('/faceprep.png');
    } else if (isExamly) {
      setIconSrc('/raj.png');
    } else if (isVektorcad) {
      setIconSrc('/vlogo2.svg');
    } else if (isGmail) {
      setIconSrc('https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png');
    } else if (app.icon?.startsWith('idb:')) {
      const key = app.icon.replace('idb:', '');
      getImageObjectUrl(key).then((url) => {
        if (isMounted && url) {
          setIconSrc(url);
          objectUrlRef.current = url;
        }
      });
    } else {
      setIconSrc(app.icon);
    }
    return () => {
      isMounted = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [app.icon, app.href]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isYouTube = (() => {
    try {
      const url = new URL(app.href.startsWith('http') ? app.href : `https://${app.href}`);
      return url.hostname.includes('youtube.com');
    } catch {
      return false;
    }
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

  const sizeClasses = {
    small: 'w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] lg:w-[52px] lg:h-[52px]',
    normal: 'w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] lg:w-[60px] lg:h-[60px]',
    large: 'w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]',
  };
  const currentSizeClass =
    appCardSize === 'custom' ? '' : sizeClasses[appCardSize] || sizeClasses.normal;

  const innerShadowClasses = {
    none: '',
    small: 'shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]',
    medium: 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]',
    large: 'shadow-[inset_0_4px_8px_rgba(0,0,0,0.25)]',
  };
  const currentInnerShadowClass = innerShadowClasses[appCardInnerShadow] || '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${
        showAppTitles ? 'w-[40px] sm:w-[48px] lg:w-[60px]' : 'w-[48px] sm:w-[60px] lg:w-[70px]'
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`${currentSizeClass} ${
          appCardBorderRadius === 'small'
            ? 'rounded-lg'
            : appCardBorderRadius === 'full'
            ? 'rounded-full'
            : 'rounded-2xl'
        } transition duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${
          backgroundImage || removeAppCardBorders
            ? 'border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]'
            : 'border'
        } ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''} ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        } ${
          glassmorphismEnabled
            ? isDark
              ? `bg-black/20 backdrop-blur-md text-white hover:bg-black/30 ${
                  removeAppCardBorders
                    ? ''
                    : 'border-[1.5px] border-white/15 hover:border-white/25'
                } shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]`
              : `bg-white/20 backdrop-blur-md text-black hover:bg-white/30 ${
                  removeAppCardBorders
                    ? ''
                    : 'border-[1.5px] border-white/30 hover:border-white/40'
                } shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]`
            : isDark
            ? `bg-black text-white hover:bg-gray-900 ${
                removeAppCardBorders ? '' : 'border border-[#2C2D2D]'
              } shadow-[inset_0_0_20px_rgba(255,255,255,0.15),0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_0_25px_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.4)]`
            : `bg-white text-black hover:bg-white ${
                removeAppCardBorders ? '' : 'border border-[#e0e0e0]'
              } shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]`
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}${extraClasses} ${hoverClass}`}
        style={{
          animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined,
          ...(appCardBackgroundColor ? { backgroundColor: appCardBackgroundColor } : {}),
          ...(appCardSize === 'custom' && customAppCardSize
            ? { width: `${customAppCardSize}px`, height: `${customAppCardSize}px` }
            : {}),
        }}
        onClick={(e) => {
          if (!isEditModalOpen) {
            onAppClick?.(app.id);
            if (e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
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
        {appCardInnerShadow !== 'none' && (
          <div
            className={`pointer-events-none absolute inset-0 rounded-inherit ${currentInnerShadowClass}`}
            style={{ borderRadius: 'inherit' }}
          />
        )}
        <div className="relative z-10">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={`${app.title} icon`}
              className={`${
                appCardSize === 'custom'
                  ? 'w-[60%] h-[60%]'
                  : showAppTitles
                  ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8'
                  : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10'
              } rounded-full shadow-sm ${iconBgClass} ${
                monochromeIcons ? 'grayscale contrast-125' : ''
              }`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`${
              showAppTitles && appTitlePosition === 'outside'
                ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8'
                : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10'
            } rounded-full shadow-sm flex items-center justify-center text-lg ${iconBgClass} ${
              iconSrc ? 'hidden' : ''
            } ${isDark ? 'text-gray-600' : 'text-gray-600'}`}
          >
            🔗
          </div>
        </div>

        {showAppTitles && appTitlePosition === 'inside' && (
          <div
            className={`absolute bottom-0.5 sm:bottom-1 left-0 right-0 text-center z-20 ${
              hideAppTitleText ? 'invisible' : ''
            }`}
          >
            <span
              className={`block max-w-[95%] mx-auto truncate text-[9px] sm:text-[10px] font-bold ${
                appTitleColor === 'auto'
                  ? isDark
                    ? 'text-white drop-shadow-md'
                    : 'text-gray-800 drop-shadow-sm'
                  : appTitleColor === 'black'
                  ? 'text-black drop-shadow-sm'
                  : 'text-white drop-shadow-md'
              }`}
            >
              {app.title}
            </span>
          </div>
        )}
      </div>

      {showAppTitles && appTitlePosition === 'outside' && (
        <div
          className={`mt-2 text-center w-full ${hideAppTitleText ? 'invisible' : ''}`}
        >
          <span
            className={`block max-w-full truncate text-xs font-medium ${
              appTitleColor === 'auto'
                ? isDark
                  ? 'text-white'
                  : 'text-gray-800'
                : appTitleColor === 'black'
                ? 'text-black'
                : 'text-white'
            }`}
          >
            {app.title}
          </span>
        </div>
      )}

      {isEditModalOpen && (
        <button
          onClick={() => onRemove(app.id)}
          className={`absolute -top-2 -right-2 ${
            glassmorphismEnabled
              ? isDark
                ? 'bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 hover:text-red-400'
                : 'bg-white/40 backdrop-blur-xl border border-black/10 text-black hover:bg-white/60 hover:text-red-500'
              : isDark
              ? 'bg-[#1e1e1e] border border-[#333] text-white hover:bg-[#333] hover:text-red-400'
              : 'bg-white border border-gray-200 text-black hover:bg-gray-100 hover:text-red-500'
          } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-all duration-200 z-10 shadow-lg`}
          title="Remove app"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function HaliteCard({
  app,
  onRemove,
  isDark,
  showAppTitles,
  hideAppTitleText,
  backgroundImage,
  glassmorphismEnabled,
  appTitleColor,
  isEditModalOpen,
  jiggleIndex,
  animateIconsEnabled,
  hoverAnimationStyle,
  monochromeIcons,
  onContextMenu,
  appCardBorderRadius,
  removeAppCardBorders,
  appCardSize = 'normal',
  customAppCardSize = 64,
  appCardInnerShadow = 'none',
  appCardBackgroundColor,
  appTitlePosition = 'outside',
  onAppClick,
}: AppCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, disabled: !isEditModalOpen });

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

  const displayIcons = haliteIcons.map((icon, idx) => {
    const url = haliteUrls[idx];
    if (url && url.includes('faceprep.online')) {
      return '/faceprep.png';
    } else if (url && url.includes('rec215.examly.io')) {
      return '/raj.png';
    } else if (url && url.includes('rec.vektorcad.com')) {
      return '/vlogo2.svg';
    }
    return icon;
  });

  const handleClick = () => {
    if (!isEditModalOpen && haliteUrls.length > 0) {
      onAppClick?.(app.id);
      haliteUrls.forEach((url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }
  };

  const sizeClasses = {
    small: 'w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] lg:w-[52px] lg:h-[52px]',
    normal: 'w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] lg:w-[60px] lg:h-[60px]',
    large: 'w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]',
  };
  const currentSizeClass =
    appCardSize === 'custom' ? '' : sizeClasses[appCardSize] || sizeClasses.normal;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${
        showAppTitles ? 'w-[40px] sm:w-[48px] lg:w-[60px]' : 'w-[48px] sm:w-[60px] lg:w-[70px]'
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`${currentSizeClass} ${
          appCardBorderRadius === 'small'
            ? 'rounded-lg'
            : appCardBorderRadius === 'full'
            ? 'rounded-full'
            : 'rounded-2xl'
        } transition duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer ${
          backgroundImage || removeAppCardBorders
            ? 'border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]'
            : 'border'
        } ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''} ${
          glassmorphismEnabled
            ? isDark
              ? `bg-black/20 backdrop-blur-md text-white hover:bg-black/30 ${
                  removeAppCardBorders
                    ? ''
                    : 'border-[1.5px] border-white/15 hover:border-white/25'
                } shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]`
              : `bg-white/20 backdrop-blur-md text-black hover:bg-white/30 ${
                  removeAppCardBorders
                    ? ''
                    : 'border-[1.5px] border-white/30 hover:border-white/40'
                } shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]`
            : isDark
            ? `bg-black text-white hover:bg-gray-900 ${
                removeAppCardBorders ? '' : 'border border-[#2C2D2D]'
              } shadow-[inset_0_0_20px_rgba(255,255,255,0.15),0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_0_25px_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.4)]`
            : `bg-white text-black hover:bg-white ${
                removeAppCardBorders ? '' : 'border border-[#e0e0e0]'
              } shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]`
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''} ${hoverClass}`}
        style={{
          animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined,
          ...(appCardBackgroundColor ? { backgroundColor: appCardBackgroundColor } : {}),
          ...(appCardSize === 'custom' && customAppCardSize
            ? { width: `${customAppCardSize}px`, height: `${customAppCardSize}px` }
            : {}),
        }}
        onClick={handleClick}
        onContextMenu={(e) => {
          if (!isEditModalOpen) {
            onContextMenu(e, app.id);
          }
        }}
      >
        <div className="grid grid-cols-2 gap-0.5 p-1 w-full h-full items-center justify-items-center relative z-10">
          {displayIcons.slice(0, 4).map((icon, idx) => (
            <div
              key={idx}
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full overflow-hidden flex items-center justify-center bg-white/10"
            >
              {icon ? (
                <img
                  src={icon}
                  alt={`Tab ${idx + 1}`}
                  className={`w-full h-full object-cover ${
                    monochromeIcons ? 'grayscale contrast-125' : ''
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-[6px]">🔗</span>
              )}
            </div>
          ))}
        </div>

        {showAppTitles && appTitlePosition === 'inside' && (
          <div
            className={`absolute bottom-0.5 sm:bottom-1 left-0 right-0 text-center z-20 ${
              hideAppTitleText ? 'invisible' : ''
            }`}
          >
            <span
              className={`block max-w-[95%] mx-auto truncate text-[9px] sm:text-[10px] font-bold ${
                appTitleColor === 'auto'
                  ? isDark
                    ? 'text-white drop-shadow-md'
                    : 'text-gray-800 drop-shadow-sm'
                  : appTitleColor === 'black'
                  ? 'text-black drop-shadow-sm'
                  : 'text-white drop-shadow-md'
              }`}
            >
              {app.title}
            </span>
          </div>
        )}
      </div>

      {showAppTitles && appTitlePosition === 'outside' && (
        <div
          className={`mt-2 text-center w-full ${hideAppTitleText ? 'invisible' : ''}`}
        >
          <span
            className={`block max-w-full truncate text-xs font-medium ${
              appTitleColor === 'auto'
                ? isDark
                  ? 'text-white'
                  : 'text-gray-800'
                : appTitleColor === 'black'
                ? 'text-black'
                : 'text-white'
            }`}
          >
            {app.title}
          </span>
        </div>
      )}

      {isEditModalOpen && (
        <button
          onClick={() => onRemove(app.id)}
          className={`absolute -top-2 -right-2 ${
            glassmorphismEnabled
              ? isDark
                ? 'bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 hover:text-red-400'
                : 'bg-white/40 backdrop-blur-xl border border-black/10 text-black hover:bg-white/60 hover:text-red-500'
              : isDark
              ? 'bg-[#1e1e1e] border border-[#333] text-white hover:bg-[#333] hover:text-red-400'
              : 'bg-white border border-gray-200 text-black hover:bg-gray-100 hover:text-red-500'
          } rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-all duration-200 z-10 shadow-lg`}
          title="Remove folder"
        >
          ×
        </button>
      )}
    </div>
  );
}
