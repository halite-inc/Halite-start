'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export default function FidgetSpinnerWidget({
  widget,
  isDark,
  onRemove,
  isEditModalOpen,
  glassmorphismEnabled = false,
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

  const style = { transform: CSS.Transform.toString(transform), transition };

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

  const [angle, setAngle] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const lastPointerAngleRef = useRef<number | null>(null);
  const armColors = isDark
    ? ['#f472b6', '#22d3ee', '#fbbf24']
    : ['#d946ef', '#06b6d4', '#f59e0b'];

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
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
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
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setAngle((a) => (a + delta) % 360);
      velocityRef.current = delta * 40;
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
  const pointerProps = !isEditModalOpen
    ? { onPointerDown, onPointerMove, onPointerUp }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...dragProps}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${widgetHoverClass} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-white/10 ring-1 ring-white/15'
              : 'bg-white/60 ring-1 ring-white/40'
            : isDark
            ? 'bg-[#111] ring-1 ring-white/10'
            : 'bg-white ring-1 ring-gray-200'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(jiggleIndex % 8) * 60}ms`
            : undefined,
        }}
        onClick={() => {
          if (!isEditModalOpen) {
            kick(960);
            setIsPopping(true);
            setTimeout(() => setIsPopping(false), 160);
          }
        }}
        {...pointerProps}
      >
        <div
          className={`relative transition-transform ${
            isPopping ? 'scale-105' : 'scale-100'
          }`}
          style={{ width: '68%', height: '68%' }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '50% 50%',
            }}
          >
            {[0, 120, 240].map((deg, idx) => (
              <div
                key={`line-${deg}`}
                className="absolute top-1/2 left-1/2"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  style={{
                    width: '2.5px',
                    height: 'calc(50% - 14px)',
                    transform: 'translate(-50%, -98%)',
                    borderRadius: '9999px',
                    background: `linear-gradient(180deg, rgba(255,255,255,${
                      isDark ? 0.12 : 0.18
                    }) 0%, ${armColors[idx]} 65%, ${armColors[idx]} 100%)`,
                    boxShadow: `0 0 8px ${armColors[idx]}33`,
                    opacity: 0.95,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ))}
            {[0, 120, 240].map((deg, idx) => (
              <div
                key={deg}
                className="absolute top-1/2 left-1/2"
                style={{ transform: `rotate(${deg}deg) translateY(-112%)` }}
              >
                <div
                  className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.25)] ${
                    idx === 0
                      ? isDark
                        ? 'bg-fuchsia-400'
                        : 'bg-fuchsia-500'
                      : idx === 1
                      ? isDark
                        ? 'bg-cyan-300'
                        : 'bg-cyan-400'
                      : isDark
                      ? 'bg-amber-300'
                      : 'bg-amber-400'
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full blur-md opacity-60 ${
                      idx === 0
                        ? 'bg-fuchsia-500'
                        : idx === 1
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                      isDark ? 'bg-gray-900' : 'bg-white'
                    }`}
                  />
                </div>
              </div>
            ))}
            <div
              className={`pointer-events-none absolute inset-0 rounded-full ${
                isDark ? 'ring-white/10' : 'ring-black/10'
              }`}
              style={{
                boxShadow: `inset 0 0 0 2px ${
                  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                }`,
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full ${
                  isDark ? 'bg-white' : 'bg-gray-900'
                } shadow-inner flex items-center justify-center`}
              >
                <div
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${
                    isDark ? 'bg-gray-900' : 'bg-white'
                  }`}
                />
                <div
                  className={`pointer-events-none absolute inset-0 rounded-full blur-md opacity-40 ${
                    isDark ? 'bg-white' : 'bg-black'
                  }`}
                />
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
