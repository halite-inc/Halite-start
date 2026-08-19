'use client';

import React, { useState, useEffect } from 'react';
import { BaseWidgetProps } from './types';
import WidgetContainer from './WidgetContainer';

export default function ClockWidget(props: BaseWidgetProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { isDark, widgetTextColor = 'auto' } = props;

  return (
    <WidgetContainer {...props}>
      <div className="text-center flex flex-col justify-center items-center h-full relative z-10">
        <div
          suppressHydrationWarning
          className={`text-3xl sm:text-4xl font-semibold leading-tight tracking-tight font-sans ${
            widgetTextColor === 'auto'
              ? isDark
                ? 'text-white'
                : 'text-gray-800'
              : widgetTextColor === 'black'
              ? 'text-black'
              : 'text-white'
          }`}
        >
          {mounted
            ? time.toLocaleTimeString('en-US', {
                hour12: false,
                hour: 'numeric',
                minute: '2-digit',
              })
            : '00:00'}
        </div>
        <div className="mt-1">
          <span
            suppressHydrationWarning
            className={`px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold text-[10px] sm:text-xs ${
              isDark ? 'bg-white/15' : 'bg-white/60'
            } ${
              widgetTextColor === 'auto'
                ? isDark
                  ? 'text-white'
                  : 'text-gray-800'
                : widgetTextColor === 'black'
                ? 'text-black'
                : 'text-white'
            }`}
          >
            {mounted
              ? time
                  .toLocaleTimeString('en-US', {
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                  .split(' ')[1]
              : 'AM'}
          </span>
        </div>
      </div>
    </WidgetContainer>
  );
}
