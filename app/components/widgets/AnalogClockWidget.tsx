'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export default function AnalogClockWidget({
  widget,
  isDark,
  onRemove,
  isEditModalOpen,
  glassmorphismEnabled = false,
}: BaseWidgetProps) {
  const [time, setTime] = useState<Date>(new Date());
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
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const seconds = mounted ? time.getSeconds() : 0;
  const minutes = mounted ? time.getMinutes() : 0;
  const hours = mounted ? time.getHours() % 12 : 0;

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
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-gray-900/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-white/20 backdrop-blur-md text-black border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm'
            : 'bg-gradient-to-br from-white via-gray-50 to-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-gray-100'
        }`}
      >
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-26 lg:h-26 xl:w-28 xl:h-28">
          <div
            className={`w-full h-full rounded-full ${
              isDark ? 'bg-black' : 'bg-white'
            } shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center relative p-2`}
          >
            <div
              className={`absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              XII
            </div>
            <div
              className={`absolute top-1/2 right-2 transform -translate-y-1/2 text-xs font-medium ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              III
            </div>
            <div
              className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              VI
            </div>
            <div
              className={`absolute top-1/2 left-2 transform -translate-y-1/2 text-xs font-medium ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              IX
            </div>

            {[1, 2, 4, 5, 7, 8, 10, 11].map((hour) => {
              const angle = (hour / 12) * 360;
              const radius = 3;
              const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius;
              const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius;

              return (
                <div
                  key={hour}
                  className="absolute w-0.5 h-1 bg-gray-400 rounded-full"
                  style={{
                    left: `calc(50% + ${x}rem)`,
                    top: `calc(50% + ${y}rem)`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                />
              );
            })}

            <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 z-10 shadow-sm"></div>
          </div>

          <div
            className="absolute top-1/2 left-1/2 w-1 h-8 origin-bottom bg-gray-800 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)`,
            }}
          ></div>

          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-10 origin-bottom bg-gray-800 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)`,
            }}
          ></div>

          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-11 origin-bottom bg-red-500 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${secondDegrees}deg)`,
            }}
          ></div>
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
