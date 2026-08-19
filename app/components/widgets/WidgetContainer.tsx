'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps, getHoverAnimationClass } from './types';

interface WidgetContainerProps extends BaseWidgetProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export default function WidgetContainer({
  widget,
  isDark,
  onRemove,
  isEditModalOpen,
  glassmorphismEnabled = false,
  jiggleIndex = 0,
  animateIconsEnabled = true,
  animateWidgetsEnabled = true,
  hoverAnimationStyle = 'scale',
  children,
  className = '',
  innerClassName = '',
}: WidgetContainerProps) {
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
      className={`relative group ${isDragging ? 'z-50' : ''} ${className}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-white/10 backdrop-blur-xl backdrop-saturate-150 text-white ring-1 ring-white/15 shadow-[0_10px_28px_rgba(0,0,0,0.30)]'
              : 'bg-white/55 backdrop-blur-xl backdrop-saturate-150 text-gray-900 ring-1 ring-white/40 shadow-[0_10px_28px_rgba(0,0,0,0.12)]'
            : isDark
              ? 'bg-white/12 backdrop-blur-xl text-white ring-1 ring-white/10 shadow-[0_10px_26px_rgba(0,0,0,0.35)]'
              : 'bg-white/80 backdrop-blur-xl text-gray-900 ring-1 ring-white/50 shadow-[0_10px_26px_rgba(0,0,0,0.10)]'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''} ${innerClassName}`}
        style={{
          animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined,
        }}
      >
        {/* iOS-like sheen and soft highlights */}
        <div className="pointer-events-none absolute -top-10 -left-12 w-28 h-28 rounded-full bg-white/60 blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -bottom-12 -right-14 w-36 h-36 rounded-full bg-white/40 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.0)_45%)] opacity-70" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" />

        {children}
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
