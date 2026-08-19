'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseWidgetProps } from './types';

export interface WeatherState {
  temp: string;
  condition: string;
  location: string;
}

export function WeatherDropdownContent({
  weatherState,
  weatherLoading,
  weatherError,
  glassmorphismEnabled,
  isDarkMode,
}: {
  weatherState: WeatherState | null;
  weatherLoading: boolean;
  weatherError: boolean;
  glassmorphismEnabled: boolean;
  isDarkMode: boolean;
}) {
  const isDarkText = glassmorphismEnabled && !isDarkMode;

  return (
    <div className="flex flex-col justify-center items-start relative z-10 w-full text-left">
      <div
        suppressHydrationWarning
        className={`text-xs sm:text-sm font-bold leading-none mb-1.5 ${
          isDarkText ? 'text-black' : 'text-white'
        }`}
      >
        {weatherLoading
          ? 'Loading...'
          : weatherError
          ? 'Location unavailable'
          : weatherState?.location || 'Unknown'}
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="text-sm">
          {weatherLoading
            ? '⏳'
            : weatherError
            ? '⚠️'
            : weatherState?.condition === 'Sunny'
            ? '☀️'
            : weatherState?.condition === 'Cloudy'
            ? '☁️'
            : weatherState?.condition === 'Rainy'
            ? '🌧️'
            : weatherState?.condition === 'Partly Cloudy'
            ? '⛅'
            : weatherState?.condition === 'Clear'
            ? '🌙'
            : '⚡'}
        </div>
        <div
          suppressHydrationWarning
          className={`text-xs font-medium leading-none ${
            isDarkText ? 'text-black/90' : 'text-white/95'
          }`}
        >
          {weatherLoading
            ? 'Getting weather...'
            : weatherError
            ? 'Check permissions'
            : weatherState?.condition}
        </div>
      </div>
      <div
        suppressHydrationWarning
        className={`text-[10px] leading-none mb-2.5 ${
          isDarkText ? 'text-black/70' : 'text-white/75'
        }`}
      >
        {new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })}
      </div>
      <div
        className={`text-2xl font-bold leading-none ${
          isDarkText ? 'text-blue-900' : 'text-blue-200'
        }`}
      >
        {weatherLoading ? '...' : weatherState?.temp}
      </div>
    </div>
  );
}

interface WeatherWidgetProps extends BaseWidgetProps {
  sharedWeather?: WeatherState | null;
  sharedLoading?: boolean;
  sharedError?: boolean;
}

export default function WeatherWidget({
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
  sharedWeather,
  sharedLoading,
  sharedError,
}: WeatherWidgetProps) {
  const [localWeather, setLocalWeather] = useState<WeatherState>({
    temp: '22°',
    condition: 'Sunny',
    location: 'Loading...',
  });
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const weather =
    sharedWeather !== undefined
      ? sharedWeather || { temp: '22°', condition: 'Sunny', location: 'Location unavailable' }
      : localWeather;
  const loading = sharedLoading !== undefined ? sharedLoading : localLoading;
  const error = sharedError !== undefined ? sharedError : localError;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    if (sharedWeather !== undefined) {
      setMounted(true);
      return;
    }
    const fetchLocationAndWeather = async () => {
      try {
        setLocalLoading(true);
        setLocalError(false);

        if (typeof window === 'undefined' || !navigator.geolocation) {
          throw new Error('Geolocation not available');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 15000,
            enableHighAccuracy: false,
            maximumAge: 300000,
          });
        });

        const { latitude, longitude } = position.coords;
        const locationResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (!locationResponse.ok) {
          throw new Error('Failed to fetch location data');
        }

        const locationData = await locationResponse.json();
        const mockConditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear'];
        const mockCondition = mockConditions[Math.floor(Math.random() * mockConditions.length)];

        setLocalWeather({
          temp: `${Math.round(15 + Math.random() * 20)}°`,
          condition: mockCondition,
          location:
            locationData.city ||
            locationData.locality ||
            locationData.countryName ||
            'Unknown',
        });
        setLocalLoading(false);
      } catch (err) {
        console.error('Error fetching location/weather:', err);
        setLocalError(true);
        setLocalWeather({
          temp: '22°',
          condition: 'Sunny',
          location: 'Location unavailable',
        });
        setLocalLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchLocationAndWeather();
    }
    setMounted(true);
  }, [sharedWeather]);

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
              ? 'bg-blue-400/20 backdrop-blur-md text-black border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-blue-300/20 backdrop-blur-md text-black border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark
            ? 'bg-gradient-to-br from-blue-400 via-gray-300 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm'
            : 'bg-gradient-to-br from-blue-300 via-gray-200 to-blue-300 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm'
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{
          animationDelay: isEditModalOpen
            ? `${(Math.abs(widget.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 8) * 60}ms`
            : undefined,
        }}
      >
        {/* Rain droplet effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-6 left-6 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-10 left-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-12 right-6 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>

        <div className="flex flex-col justify-center items-start h-full px-4 pl-6 relative z-10 w-full">
          <div
            suppressHydrationWarning
            className={`text-xs sm:text-sm font-bold leading-none mb-1 ${
              widgetTextColor === 'auto'
                ? isDark
                  ? 'text-white'
                  : 'text-gray-900'
                : widgetTextColor === 'black'
                ? 'text-black'
                : 'text-white'
            }`}
          >
            {mounted
              ? loading
                ? 'Loading...'
                : error
                ? 'Location unavailable'
                : weather.location
              : 'Loading...'}
          </div>
          <div className="flex items-center gap-1.5 relative z-10">
            <div className="text-xs">
              {mounted
                ? loading
                  ? '⏳'
                  : error
                  ? '⚠️'
                  : weather.condition === 'Sunny'
                  ? '☀️'
                  : weather.condition === 'Cloudy'
                  ? '☁️'
                  : weather.condition === 'Rainy'
                  ? '🌧️'
                  : weather.condition === 'Partly Cloudy'
                  ? '⛅'
                  : weather.condition === 'Clear'
                  ? '🌙'
                  : '⚡'
                : '⏳'}
            </div>
            <div
              suppressHydrationWarning
              className={`text-xs leading-none ${
                widgetTextColor === 'auto'
                  ? isDark
                    ? 'text-white/90'
                    : 'text-gray-700'
                  : widgetTextColor === 'black'
                  ? 'text-black'
                  : 'text-white'
              }`}
            >
              {mounted
                ? loading
                  ? 'Getting weather...'
                  : error
                  ? 'Check permissions'
                  : weather.condition
                : 'Getting weather...'}
            </div>
          </div>
          <div
            suppressHydrationWarning
            className={`text-xs leading-none mb-2 ${
              widgetTextColor === 'auto'
                ? isDark
                  ? 'text-white/70'
                  : 'text-gray-500'
                : widgetTextColor === 'black'
                ? 'text-black/80'
                : 'text-white/80'
            }`}
          >
            {mounted
              ? new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              : ''}
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold leading-none ${
              widgetTextColor === 'auto'
                ? isDark
                  ? 'text-blue-200'
                  : 'text-blue-800'
                : widgetTextColor === 'black'
                ? 'text-black'
                : 'text-white'
            }`}
          >
            {loading ? '...' : weather.temp}
          </div>
        </div>
      </div>

      {/* Delete Button */}
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
