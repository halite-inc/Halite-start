'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export default function PomodoroWidget({
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
      const timer = setInterval(() => setTime((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (time === 0) {
      setIsRunning(false);
    }
  }, [isRunning, time]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const progress = 1 - time / (25 * 60);

  const widgetHoverClass =
    animateWidgetsEnabled && animateIconsEnabled
      ? hoverAnimationStyle === 'tilt'
        ? 'hover:-rotate-3 hover:translate-y-[-2px]'
        : hoverAnimationStyle === 'skew'
        ? 'hover:skew-x-3 hover:skew-y-1'
        : hoverAnimationStyle === 'spin'
        ? 'hover:rotate-180'
        : hoverAnimationStyle === 'bounce'
        ? 'hover:animate-bounce'
        : hoverAnimationStyle === 'pulse'
        ? 'hover:animate-pulse'
        : hoverAnimationStyle === 'float'
        ? 'hover:-translate-y-2'
        : hoverAnimationStyle === 'slide'
        ? 'hover:translate-x-2'
        : hoverAnimationStyle === 'glow'
        ? 'hover:shadow-lg hover:shadow-red-400/50'
        : 'hover:scale-110 hover:-translate-y-0.5'
      : '';

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        onClick={() => !isEditModalOpen && setIsRunning(!isRunning)}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-red-400/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-red-300/20 backdrop-blur-md text-white border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark
            ? 'bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm'
            : 'bg-gradient-to-br from-red-400 via-orange-400 to-red-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-red-200'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(jiggleIndex % 8) * 60}ms`
            : undefined,
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: `conic-gradient(from 0deg, rgba(255,255,255,0.3) ${
              progress * 360
            }deg, transparent ${progress * 360}deg)`,
          }}
        />
        <div
          className={`text-lg sm:text-xl font-bold ${
            widgetTextColor === 'auto'
              ? isDark
                ? 'text-white'
                : 'text-white'
              : widgetTextColor === 'black'
              ? 'text-black'
              : 'text-white'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xs mt-1 opacity-80">🍅</div>
      </div>
      {isEditModalOpen && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold z-10"
        >
          ×
        </button>
      )}
    </div>
  );
}
