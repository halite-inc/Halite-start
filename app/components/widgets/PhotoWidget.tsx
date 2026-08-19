'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';
import { getImageObjectUrl, saveImageBlob } from '../../lib/idb';

export default function PhotoWidget({
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    let revokedUrl: string | null = null;
    (async () => {
      try {
        const url = await getImageObjectUrl(`photo_${widget.id}`);
        if (url) {
          setPhotoUrl(url);
          revokedUrl = url;
        }
      } catch {}
    })();
    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [widget.id]);

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-300 ${widgetHoverClass} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          glassmorphismEnabled
            ? isDark
              ? 'bg-white/10 ring-1 ring-white/15'
              : 'bg-white/70 ring-1 ring-white/40'
            : isDark
            ? 'bg-[#111] ring-1 ring-white/10'
            : 'bg-white ring-1 ring-gray-200'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(jiggleIndex % 8) * 60}ms`
            : undefined,
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`text-center px-2 ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}
          >
            <div className="text-[10px] mb-1">No photo</div>
            {isEditModalOpen && (
              <label
                className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md cursor-pointer ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await saveImageBlob(`photo_${widget.id}`, file);
                      const url = await getImageObjectUrl(`photo_${widget.id}`);
                      if (url) setPhotoUrl(url);
                    } catch {}
                  }}
                />
                Upload
              </label>
            )}
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
