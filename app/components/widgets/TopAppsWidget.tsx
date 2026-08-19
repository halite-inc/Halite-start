'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

interface AppItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
}

interface TopAppsWidgetProps extends BaseWidgetProps {
  apps: AppItem[];
  appClickCounts: Record<string, number>;
}

export default function TopAppsWidget({
  widget,
  isDark,
  onRemove,
  isEditModalOpen,
  glassmorphismEnabled = false,
  widgetTextColor = 'auto',
  jiggleIndex = 0,
  animateIconsEnabled = true,
  animateWidgetsEnabled = true,
  hoverAnimationStyle = 'scale',
  apps,
  appClickCounts,
}: TopAppsWidgetProps) {
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
    zIndex: isDragging ? 50 : 1,
  };

  const topApps = [...apps]
    .sort((a, b) => (appClickCounts[b.id] || 0) - (appClickCounts[a.id] || 0))
    .slice(0, 4);

  const getHoverClass = () => {
    if (isEditModalOpen) return '';
    if (!animateWidgetsEnabled) return 'transition-all duration-300';
    switch (hoverAnimationStyle) {
      case 'scale':
        return 'transition-transform duration-300 hover:scale-105';
      case 'tilt':
        return 'transition-all duration-300 hover:rotate-2 hover:scale-105';
      case 'skew':
        return 'transition-all duration-300 hover:-skew-x-2 hover:scale-105';
      case 'spin':
        return 'transition-all duration-500 hover:rotate-12 hover:scale-105';
      case 'bounce':
        return 'transition-all duration-300 hover:-translate-y-2 hover:scale-105';
      case 'pulse':
        return 'transition-all duration-300 hover:scale-105 hover:animate-pulse';
      case 'float':
        return 'transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl';
      case 'slide':
        return 'transition-all duration-300 hover:translate-x-2 hover:scale-105';
      case 'glow':
        return `transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]`;
      default:
        return 'transition-transform duration-300 hover:scale-105';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col p-2.5 sm:p-3 md:p-3.5 transition-all duration-300 relative overflow-hidden ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          isEditModalOpen
            ? 'cursor-grab active:cursor-grabbing ' +
              (jiggleIndex % 2 === 0 ? 'animate-jiggle-1' : 'animate-jiggle-2')
            : 'cursor-default ' + getHoverClass()
        } ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-gray-900/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-white/20 backdrop-blur-md text-black border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm'
            : 'bg-gradient-to-br from-white via-gray-50 to-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-gray-100'
        }`}
      >
        <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 w-full justify-center">
          {topApps.map((app) => (
            <div
              key={app.id}
              className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-[8px] sm:rounded-lg ${
                isDark ? 'bg-white/10' : 'bg-black/5'
              } hover:scale-105 transition-transform cursor-pointer w-full`}
              onPointerDown={(e) => {
                if (!isEditModalOpen) {
                  e.stopPropagation();
                  window.open(app.href, '_blank');
                }
              }}
            >
              {app.icon ? (
                <img
                  src={app.icon}
                  alt={app.title}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-[4px] sm:rounded-[5px] shrink-0 shadow-sm ${
                    animateIconsEnabled
                      ? 'transition-transform duration-300 hover:scale-110'
                      : ''
                  }`}
                />
              ) : (
                <div
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-[4px] sm:rounded-[5px] shrink-0 shadow-sm flex items-center justify-center text-[7px] sm:text-[8px] font-bold ${
                    isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                  } ${
                    animateIconsEnabled
                      ? 'transition-transform duration-300 hover:scale-110'
                      : ''
                  }`}
                >
                  {app.title.substring(0, 1).toUpperCase()}
                </div>
              )}
              <span
                className={`text-[8px] sm:text-[9px] md:text-[10px] font-medium truncate w-full text-left ${
                  widgetTextColor === 'auto'
                    ? isDark
                      ? 'text-white/90'
                      : 'text-gray-700'
                    : `text-${widgetTextColor}`
                }`}
              >
                {app.title}
              </span>
            </div>
          ))}

          {Array.from({ length: Math.max(0, 4 - topApps.length) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-[8px] sm:rounded-lg ${
                  isDark ? 'bg-white/5 opacity-50' : 'bg-black/5 opacity-50'
                } w-full`}
              >
                <div
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-[4px] sm:rounded-[5px] shrink-0 ${
                    isDark ? 'bg-white/10' : 'bg-black/10'
                  }`}
                ></div>
                <div
                  className={`w-12 sm:w-16 h-1.5 sm:h-2 rounded-full ${
                    isDark ? 'bg-white/10' : 'bg-black/10'
                  }`}
                ></div>
              </div>
            )
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`absolute -top-2 -right-2 p-1 sm:p-1.5 rounded-full shadow-md z-10 hover:scale-110 transition-transform ${
            isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-600'
          }`}
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
