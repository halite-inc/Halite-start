'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export default function CalendarWidget({
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
}: BaseWidgetProps) {
  const [date] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => setMounted(true), []);

  const currentDate = mounted ? date.getDate() : new Date().getDate();
  const currentMonth = mounted
    ? date.toLocaleDateString('en-US', { month: 'long' })
    : new Date().toLocaleDateString('en-US', { month: 'long' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widgetHoverClass =
    animateWidgetsEnabled && animateIconsEnabled
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
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-gray-800/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-white/20 backdrop-blur-md text-gray-800 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark
            ? 'bg-gray-800/90 text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-gray-700/30'
            : 'bg-white/95 text-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm border border-gray-200/50'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(Math.abs(widget.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 8) * 60}ms`
            : undefined,
        }}
      >
        <div className="pointer-events-none absolute -top-6 -right-8 w-20 h-20 bg-gradient-to-br from-indigo-500/15 via-violet-500/15 to-fuchsia-500/15 blur-2xl" />

        <div className="flex flex-col items-center justify-between h-full w-full p-2.5 sm:p-3 relative z-10 select-none">
          <div
            suppressHydrationWarning
            className={`text-[9px] sm:text-[10px] md:text-xs font-extrabold tracking-widest uppercase ${
              widgetTextColor === 'black'
                ? 'text-rose-600'
                : widgetTextColor === 'white'
                ? 'text-rose-400'
                : 'text-rose-500'
            }`}
          >
            {currentMonth}
          </div>

          <div
            suppressHydrationWarning
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-none my-auto tracking-tighter ${
              widgetTextColor === 'auto'
                ? isDark
                  ? 'text-white'
                  : 'text-gray-800'
                : widgetTextColor === 'black'
                ? 'text-black'
                : 'text-white'
            }`}
          >
            {currentDate}
          </div>

          <div
            suppressHydrationWarning
            className={`text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider ${
              widgetTextColor === 'auto'
                ? isDark
                  ? 'text-white/60'
                  : 'text-gray-500'
                : widgetTextColor === 'black'
                ? 'text-black/60'
                : 'text-white/70'
            }`}
          >
            {mounted
              ? date.toLocaleDateString('en-US', { weekday: 'short' })
              : new Date().toLocaleDateString('en-US', { weekday: 'short' })}
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
