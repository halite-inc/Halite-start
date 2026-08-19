'use client';

import React, { useState, useEffect } from 'react';

interface BigClockProps {
  showBigClock: boolean;
  bigClockColor?: string;
  bigClockFont?: string;
  bigClockSize?: 'small' | 'medium' | 'large' | 'huge';
  bigClockGlassMode?: boolean;
  isDarkMode: boolean;
  backgroundImage?: string;
}

export default function BigClock({
  showBigClock,
  bigClockColor = '',
  bigClockFont = 'default',
  bigClockSize = 'medium',
  bigClockGlassMode = false,
  isDarkMode,
  backgroundImage,
}: BigClockProps) {
  const [bigClockTime, setBigClockTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setBigClockTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!showBigClock) return null;

  const fontStyle =
    bigClockFont === 'default'
      ? undefined
      : bigClockFont === 'serif'
      ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
      : bigClockFont === 'mono'
      ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      : bigClockFont === 'elegant'
      ? '"Helvetica Neue Thin", "Helvetica Neue Light", "Segoe UI Light", "Roboto Light", sans-serif'
      : bigClockFont === 'fun'
      ? '"Comic Sans MS", "Chalkboard SE", cursive'
      : bigClockFont === 'poppins'
      ? 'Poppins, sans-serif'
      : bigClockFont === 'playfair'
      ? 'var(--font-playfair), "Playfair Display", Georgia, serif'
      : bigClockFont === 'raleway'
      ? 'var(--font-raleway), Raleway, sans-serif'
      : bigClockFont === 'space'
      ? 'var(--font-space-grotesk), "Space Grotesk", sans-serif'
      : bigClockFont === 'bebas'
      ? 'var(--font-bebas-neue), "Bebas Neue", sans-serif'
      : bigClockFont === 'pacifico'
      ? 'var(--font-pacifico), Pacifico, cursive'
      : bigClockFont === 'outfit'
      ? 'var(--font-outfit), Outfit, sans-serif'
      : undefined;

  const colorStyle = !bigClockGlassMode
    ? bigClockColor || (backgroundImage || isDarkMode ? 'white' : '#111827')
    : undefined;

  const gradientStyle = bigClockGlassMode
    ? {
        backgroundImage: `linear-gradient(to bottom, ${
          bigClockColor || 'white'
        }cc, ${bigClockColor || 'white'}33)`,
        backgroundClip: 'text' as const,
      }
    : {};

  return (
    <div className="w-full flex justify-center mb-8 pointer-events-none relative z-10">
      <div className="flex flex-col items-center justify-center transition-all duration-300 select-none">
        <span
          className={`font-bold tracking-tight leading-none transition-all duration-300 ${
            bigClockSize === 'small'
              ? 'text-5xl sm:text-6xl md:text-7xl'
              : bigClockSize === 'large'
              ? 'text-8xl sm:text-9xl md:text-[10rem]'
              : bigClockSize === 'huge'
              ? 'text-9xl sm:text-[10rem] md:text-[12rem]'
              : 'text-7xl sm:text-8xl md:text-9xl'
          } ${
            bigClockGlassMode ? 'bg-clip-text text-transparent drop-shadow-lg' : ''
          }`}
          style={{
            ...gradientStyle,
            color: colorStyle,
            fontFamily: fontStyle,
          }}
        >
          {mounted
            ? bigClockTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
            : '00:00'}
        </span>
        <span
          className={`font-medium tracking-wide opacity-80 mt-2 transition-all duration-300 ${
            bigClockSize === 'small'
              ? 'text-lg sm:text-xl'
              : bigClockSize === 'large'
              ? 'text-2xl sm:text-3xl'
              : bigClockSize === 'huge'
              ? 'text-3xl sm:text-4xl'
              : 'text-xl sm:text-2xl'
          } ${
            bigClockGlassMode ? 'bg-clip-text text-transparent drop-shadow-md' : ''
          }`}
          style={{
            ...gradientStyle,
            color: colorStyle,
            fontFamily: fontStyle,
          }}
        >
          {mounted
            ? bigClockTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            : ''}
        </span>
      </div>
    </div>
  );
}
