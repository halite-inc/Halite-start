'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export default function QuickNotesWidget({
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
              ? 'bg-yellow-500/15 backdrop-blur-md text-yellow-100 border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-yellow-400/15 backdrop-blur-md text-yellow-50 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark
            ? 'bg-gradient-to-br from-orange-600 via-yellow-600 to-orange-700 text-yellow-100 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm border border-orange-500/30'
            : 'bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 text-yellow-50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm border border-orange-400/30'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(jiggleIndex % 8) * 60}ms`
            : undefined,
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-3 left-4 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
        </div>

        <div className="flex flex-col justify-start items-start h-full p-3 relative z-10 w-full">
          <div className="w-full h-full">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="New note..."
              className={`w-full h-full bg-transparent border-none outline-none resize-none text-xs leading-tight placeholder-yellow-200/70 ${
                widgetTextColor === 'auto'
                  ? isDark
                    ? 'text-yellow-100'
                    : 'text-yellow-50'
                  : widgetTextColor === 'black'
                  ? 'text-black'
                  : 'text-white'
              }`}
              style={{
                fontFamily: 'inherit',
                lineHeight: '1.2',
              }}
              onFocus={(e) => e.target.select()}
            />
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
