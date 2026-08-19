'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export default function WaterTrackerWidget({
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
  const [waterIntake, setWaterIntake] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`waterIntake_${widget.id}`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [lastResetDate, setLastResetDate] = useState(() => {
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
    const today = new Date().toDateString();
    if (today !== lastResetDateRef.current) {
      setWaterIntake(0);
      setLastResetDate(today);
      lastResetDateRef.current = today;
      localStorage.setItem(`waterIntake_${widget.id}`, '0');
      localStorage.setItem(`lastResetDate_${widget.id}`, today);
    }
  }, [widget.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`waterIntake_${widget.id}`, waterIntake.toString());
    }
  }, [waterIntake, widget.id]);

  const addWater = () => {
    setWaterIntake((prev) => prev + 250);
  };

  const removeWater = () => {
    setWaterIntake((prev) => Math.max(0, prev - 250));
  };

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
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-blue-400/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-blue-300/20 backdrop-blur-md text-white border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark
            ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm'
            : 'bg-gradient-to-br from-blue-300 via-cyan-200 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-blue-200'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(jiggleIndex % 8) * 60}ms`
            : undefined,
        }}
      >
        <div className="text-center flex flex-col justify-center items-center h-full relative px-2 py-3">
          <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none">
            <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div
              className="absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div
              className="absolute top-6 left-6 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>
            <div
              className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDelay: '1.5s' }}
            ></div>
          </div>

          <div className="relative mb-2">
            <div
              className={`text-2xl p-2 rounded-full border-2 border-white/40 bg-white/15 backdrop-blur-sm shadow-lg transition-all duration-300 ${
                waterIntake > 0 ? 'scale-110 border-white/60 bg-white/20' : ''
              }`}
            >
              💧
            </div>
            {waterIntake > 0 && (
              <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md scale-110 opacity-100 transition-opacity duration-300"></div>
            )}
          </div>

          <div
            className={`text-sm font-bold mb-2 leading-none tracking-wide ${
              widgetTextColor === 'auto'
                ? isDark
                  ? 'text-white drop-shadow-sm'
                  : 'text-white drop-shadow-sm'
                : widgetTextColor === 'black'
                ? 'text-black drop-shadow-sm'
                : 'text-white drop-shadow-sm'
            }`}
          >
            {waterIntake}ml
          </div>

          <div className="w-14 h-1 bg-white/20 rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-white/60 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min((waterIntake / 2000) * 100, 100)}%`,
              }}
            ></div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={removeWater}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg z-10 ${
                isDark
                  ? 'bg-red-500/80 hover:bg-red-400 text-white border border-red-400/50'
                  : 'bg-red-400 hover:bg-red-300 text-white border border-red-300/50'
              }`}
              title="Remove 250ml"
            >
              -
            </button>

            <div
              className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                isDark
                  ? 'bg-white/10 text-white/80'
                  : 'bg-white/20 text-white/90'
              }`}
            >
              {Math.ceil(waterIntake / 250)}
            </div>

            <button
              onClick={addWater}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg z-10 ${
                isDark
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
