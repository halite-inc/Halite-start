'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export default function SpacerWidget({
  widget,
  isDark,
  onRemove,
  isEditModalOpen,
  jiggleIndex = 0,
  animateIconsEnabled = true,
  animateWidgetsEnabled = true,
  hoverAnimationStyle = 'scale',
}: BaseWidgetProps) {
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
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${
          isEditModalOpen
            ? isDark
              ? 'border-2 border-dashed border-white/30'
              : 'border-2 border-dashed border-gray-400'
            : 'border-0'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(jiggleIndex % 8) * 60}ms`
            : undefined,
        }}
      >
        {isEditModalOpen && (
          <div
            className={`text-[10px] uppercase tracking-wider ${
              isDark ? 'text-white/70' : 'text-gray-600/80'
            }`}
          >
            Spacer
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
