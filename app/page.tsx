'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LeftSidebar from './components/LeftSidebar';
import { getImageObjectUrl, deleteImageBlob } from './lib/idb';

interface App {
  id: string;
  title: string;
  href: string;
  icon?: string;
}

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes';
  title: string;
}

const defaultApps: App[] = [
  { id: 'youtube', title: 'YouTube', href: 'https://youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32' },
  { id: 'github', title: 'GitHub', href: 'https://github.com', icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32' },
  { id: 'pinterest', title: 'Pinterest', href: 'https://pinterest.com', icon: 'https://www.google.com/s2/favicons?domain=pinterest.com&sz=32' },
  { id: 'dribbble', title: 'Dribbble', href: 'https://dribbble.com', icon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=32' },
  { id: 'flipkart', title: 'Flipkart', href: 'https://flipkart.com', icon: 'https://www.google.com/s2/favicons?domain=flipkart.com&sz=32' },
  { id: 'amazon', title: 'Amazon', href: 'https://amazon.com', icon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32' },
  { id: 'booking', title: 'Booking.com', href: 'https://booking.com', icon: 'https://www.google.com/s2/favicons?domain=booking.com&sz=32' },

  { id: 'google', title: 'Google', href: 'https://google.com', icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=32' },
  { id: 'gmail', title: 'Gmail', href: 'https://gmail.com', icon: 'https://www.google.com/s2/favicons?domain=gmail.com&sz=32' },
  { id: 'twitter', title: 'Twitter', href: 'https://twitter.com', icon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=32' },
  { id: 'netfree2', title: 'NetFree2', href: 'https://netfree2.cc/home', icon: 'https://www.google.com/s2/favicons?domain=netfree2.cc&sz=32' },
];

const defaultWidgets: Widget[] = [
  { id: 'clock-1', type: 'clock', title: 'Clock Widget' },
  { id: 'weather-1', type: 'weather', title: 'Weather Widget' },
  { id: 'calendar-1', type: 'calendar', title: 'Calendar Widget' },
  { id: 'analog-clock-1', type: 'analog-clock', title: 'Analog Clock Widget' },
  { id: 'water-tracker-1', type: 'water-tracker', title: 'Water Tracker Widget' },
  { id: 'quick-notes-1', type: 'quick-notes', title: 'Quick Notes Widget' },
];

// Function to get favicon URL
const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

function SortableLinkCard({ app, onRemove, isDark, showAppTitles, backgroundImage, glassmorphismEnabled, liquidGlassEnabled, appTitleColor, isEditModalOpen, jiggleIndex }: { app: App; onRemove: (id: string) => void; isDark: boolean; showAppTitles: boolean; backgroundImage: string; glassmorphismEnabled: boolean; liquidGlassEnabled: boolean; appTitleColor: 'auto' | 'black' | 'white'; isEditModalOpen: boolean; jiggleIndex: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, disabled: !isEditModalOpen });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${showAppTitles ? 'w-[40px] sm:w-[48px] lg:w-[60px]' : 'w-[48px] sm:w-[60px] lg:w-[70px]'} ${isDragging ? 'z-50' : ''}`}
    >
      {/* App Card */}
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`${showAppTitles ? 'w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] lg:w-[60px] lg:h-[60px]' : 'w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]'} rounded-2xl transition duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${backgroundImage ? 'border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]' : 'border-2'} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        } ${
          liquidGlassEnabled
            ? 'bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/15'
            : glassmorphismEnabled
              ? (isDark 
                  ? 'bg-black/20 backdrop-blur-md text-white hover:bg-black/30 border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
                  : 'bg-white/20 backdrop-blur-md text-black hover:bg-white/30 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]')
              : (isDark 
                  ? 'bg-black text-white hover:bg-gray-900 border-[#2C2D2D] shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.4)]' 
                  : 'bg-white text-black hover:bg-gray-50 border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]')
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
        onClick={() => {
          if (!isEditModalOpen) {
            window.location.href = app.href;
          }
        }}
      >
        {liquidGlassEnabled && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-30" />
        )}
        {/* App Icon */}
        <div>
          {app.icon ? (
            <img 
              src={app.icon} 
              alt={`${app.title} icon`}
              className={`${showAppTitles ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8' : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10'} rounded-full shadow-sm bg-white`}
              onError={(e) => {
                // Show a fallback icon if the image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          {/* Fallback icon if no image or image fails to load */}
          <div className={`${showAppTitles ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8' : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10'} rounded-full shadow-sm flex items-center justify-center text-lg bg-white ${app.icon ? 'hidden' : ''} ${
            isDark ? 'text-gray-600' : 'text-gray-600'
          }`}>
            🔗
          </div>
        </div>
      </div>
      
      {/* App Title - Below the card */}
      {showAppTitles && (
        <div className="mt-2 text-center w-full">
          <span className={`truncate text-xs font-medium ${
            appTitleColor === 'auto' 
              ? (isDark ? 'text-white' : 'text-gray-800')
              : appTitleColor === 'black' 
                ? 'text-black' 
                : 'text-white'
          }`}>{app.title}</span>
        </div>
      )}
      
      {/* Delete Button - Only show when edit modal is open */}
      {isEditModalOpen && (
        <button
          onClick={() => onRemove(app.id)}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-100 transition-opacity duration-200 z-10"
          title="Remove app"
        >
          ×
        </button>
      )}
    </div>
  );
}

function SortableClockWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, liquidGlassEnabled, widgetTextColor, jiggleIndex }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; liquidGlassEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number }) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading flag
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          liquidGlassEnabled
            ? 'bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            : glassmorphismEnabled
            ? (isDark 
                  ? 'bg-indigo-900/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                  : 'bg-indigo-50/20 backdrop-blur-md text-indigo-900 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark 
                  ? 'bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 text-indigo-900 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-indigo-100')
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(parseInt(widget.id, 10) % 8) * 60}ms` : undefined }}
      >
        {liquidGlassEnabled && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-20" />
        )}
        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-1/2 right-1 w-1 h-1 bg-white/30 rounded-full"></div>
        
        {/* Dashed border frame */}
        <div className={`absolute inset-2 border border-dashed rounded-[2rem] ${
          isDark ? 'border-white/40' : 'border-indigo-300/40'
        }`}></div>
        
        <div className="text-center flex flex-col justify-center items-center h-full relative z-10">
          <div suppressHydrationWarning className={`text-2xl sm:text-3xl font-bold leading-none tracking-wider font-mono ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-white' : 'text-gray-800')
              : widgetTextColor === 'black' 
                ? 'text-black' 
                : 'text-white'
          }`}>
            {mounted ? time.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: '2-digit' }) : '00:00'}
          </div>
          <div suppressHydrationWarning className={`text-xs sm:text-sm font-medium mt-1 leading-none tracking-wide ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-gray-300' : 'text-gray-600')
              : widgetTextColor === 'black' 
                ? 'text-black' 
                : 'text-white'
          }`}>
            {mounted ? time.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' }).split(' ')[1] : 'AM'}
          </div>
        </div>
      </div>
      
      {/* Delete Button - Only show when edit modal is open */}
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

function WeatherWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, liquidGlassEnabled, widgetTextColor, jiggleIndex }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; liquidGlassEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number }) {
  const [weather, setWeather] = useState({ temp: '22°', condition: 'Sunny', location: 'Loading...' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
    const fetchLocationAndWeather = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          throw new Error('Not in browser environment');
        }
        
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        // Get current location with better error handling
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 15000,
            enableHighAccuracy: false, // Changed to false for better compatibility
            maximumAge: 300000 // 5 minutes cache
          });
        });

        const { latitude, longitude } = position.coords;
        
        // Fetch location name using reverse geocoding
        const locationResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        
        if (!locationResponse.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const locationData = await locationResponse.json();
        
        // For demo purposes, using mock weather data since we need an API key
        // In a real app, you would use a weather API like OpenWeatherMap or WeatherAPI
        const mockConditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear'];
        const mockCondition = mockConditions[Math.floor(Math.random() * mockConditions.length)];
        
        setWeather({
          temp: `${Math.round(15 + Math.random() * 20)}°`, // More realistic temperature range
          condition: mockCondition,
          location: locationData.city || locationData.locality || locationData.countryName || 'Unknown'
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching location/weather:', error);
        setError(true);
        setWeather({
          temp: '22°',
          condition: 'Sunny',
          location: 'Location unavailable'
        });
        setLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      fetchLocationAndWeather();
    }
    setMounted(true);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-start justify-center transition-all duration-300 relative overflow-hidden ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          liquidGlassEnabled
            ? 'bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            : glassmorphismEnabled
            ? (isDark 
                  ? 'bg-blue-400/20 backdrop-blur-md text-black border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                  : 'bg-blue-300/20 backdrop-blur-md text-black border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark 
                  ? 'bg-gradient-to-br from-blue-400 via-gray-300 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-blue-300 via-gray-200 to-blue-300 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm')
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(parseInt(widget.id, 10) % 8) * 60}ms` : undefined }}
      >
        {liquidGlassEnabled && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-20" />
        )}
        {/* Rain droplet effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-6 left-6 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-10 left-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-12 right-6 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>
        
        <div className="flex flex-col justify-center items-start h-full px-4 pl-6 relative z-10">
          <div suppressHydrationWarning className={`text-xs sm:text-sm font-bold leading-none mb-1 ${
            isDark ? 'text-black' : 'text-black'
          }`}>
            {mounted ? (loading ? 'Loading...' : error ? 'Location unavailable' : weather.location) : 'Loading...'}
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="text-xs">
              {mounted ? (loading ? '⏳' : error ? '⚠️' : 
                weather.condition === 'Sunny' ? '☀️' :
                weather.condition === 'Cloudy' ? '☁️' :
                weather.condition === 'Rainy' ? '🌧️' :
                weather.condition === 'Partly Cloudy' ? '⛅' :
                weather.condition === 'Clear' ? '🌙' : '⚡') : '⏳'}
            </div>
            <div suppressHydrationWarning className={`text-xs leading-none ${
              widgetTextColor === 'auto' 
                ? (isDark ? 'text-black' : 'text-black')
                : widgetTextColor === 'black' 
                  ? 'text-black' 
                  : 'text-white'
            }`}>
              {mounted ? (loading ? 'Getting weather...' : error ? 'Check permissions' : weather.condition) : 'Getting weather...'}
            </div>
          </div>
          <div suppressHydrationWarning className={`text-xs leading-none mb-2 ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-black/80' : 'text-black/80')
              : widgetTextColor === 'black' 
                ? 'text-black/80' 
                : 'text-white/80'
          }`}>
            {mounted ? new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold leading-none ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-blue-800' : 'text-blue-800')
              : widgetTextColor === 'black' 
                ? 'text-black' 
                : 'text-white'
          }`}>
            {loading ? '...' : weather.temp}
          </div>
        </div>
      </div>
      
      {/* Delete Button - Only show when edit modal is open */}
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

function CalendarWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, liquidGlassEnabled, widgetTextColor, jiggleIndex }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; liquidGlassEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number }) {
  const [date, setDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  // Get current week dates (Monday-first)
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
    const weekStart = new Date(today);
    // Adjust so Monday is the start; handle Sunday gracefully
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    weekStart.setDate(today.getDate() + diffToMonday);
    
    const weekDates = [] as Date[];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDates.push(d);
    }
    return weekDates;
  };

  useEffect(() => setMounted(true), []);
  const weekDates = getWeekDates();
  const currentDate = mounted ? date.getDate() : new Date().getDate();
  const currentMonth = mounted ? date.toLocaleDateString('en-US', { month: 'long' }) : new Date().toLocaleDateString('en-US', { month: 'long' });
  const today = new Date();
  const isSameDay = (a: Date, b: Date) => (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col transition-all duration-300 relative overflow-hidden ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          liquidGlassEnabled
            ? 'bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            : glassmorphismEnabled
            ? (isDark 
                  ? 'bg-gray-800/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                  : 'bg-white/20 backdrop-blur-md text-gray-800 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark 
                  ? 'bg-gray-800/90 text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-gray-700/30' 
                  : 'bg-white/95 text-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm border border-gray-200/50')
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(parseInt(widget.id, 10) % 8) * 60}ms` : undefined }}
      >
        {liquidGlassEnabled && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-20" />
        )}
        {/* Subtle accent */}
        <div className="pointer-events-none absolute -top-6 -right-8 w-20 h-20 bg-gradient-to-br from-indigo-500/15 via-violet-500/15 to-fuchsia-500/15 blur-2xl" />

        {/* Center current day number overlay with top margin */}
        <div className="absolute inset-0 flex justify-center items-start z-0 pointer-events-none">
          <div className={`mt-[43.5px] sm:mt-[51.5px] text-5xl sm:text-6xl font-extrabold tracking-tight ${
            liquidGlassEnabled
              ? (isDark ? 'text-white/25' : 'text-gray-900/25')
              : glassmorphismEnabled
                ? (isDark ? 'text-white/20' : 'text-gray-900/20')
                : (isDark ? 'text-white/12' : 'text-gray-900/12')
          }`}>
            {currentDate}
          </div>
        </div>
        

        <div className="flex flex-col justify-start items-start h-full p-3 pt-6 relative z-10">
          {/* Current Date Display */}
          <div className="flex items-center justify-center w-full mt-[12px] mb-3">
            <div suppressHydrationWarning className={`text-[13px] sm:text-sm font-semibold leading-none ${
              widgetTextColor === 'auto' 
                ? (isDark ? 'text-white' : 'text-gray-900')
                : widgetTextColor === 'black' 
                  ? 'text-black' 
                  : 'text-white'
            }`}>
              {currentMonth}
            </div>
          </div>
          
          {/* Week View removed for minimal look */}
        </div>
      </div>
      
      {/* Delete Button - Only show when edit modal is open */}
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

function WaterTrackerWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, liquidGlassEnabled, widgetTextColor, jiggleIndex }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; liquidGlassEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number }) {
  const [waterIntake, setWaterIntake] = useState(() => {
    // Initialize with saved value or 0
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`waterIntake_${widget.id}`);
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [lastResetDate, setLastResetDate] = useState(() => {
    // Initialize with saved date or today
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
    // Check for daily reset
    const today = new Date().toDateString();
    
    if (today !== lastResetDateRef.current) {
      // Reset for new day
      setWaterIntake(0);
      setLastResetDate(today);
      lastResetDateRef.current = today;
      localStorage.setItem(`waterIntake_${widget.id}`, '0');
      localStorage.setItem(`lastResetDate_${widget.id}`, today);
    }
  }, [widget.id]);

  useEffect(() => {
    // Save water intake to localStorage whenever it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem(`waterIntake_${widget.id}`, waterIntake.toString());
    }
  }, [waterIntake, widget.id]);

  const addWater = () => {
    setWaterIntake(prev => prev + 250); // 250ml per glass
  };

  const removeWater = () => {
    setWaterIntake(prev => Math.max(0, prev - 250)); // 250ml per glass, minimum 0
  };

  const saveWaterData = () => {
    localStorage.setItem(`waterIntake_${widget.id}`, waterIntake.toString());
    localStorage.setItem(`lastResetDate_${widget.id}`, lastResetDate);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          liquidGlassEnabled
            ? 'bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            : glassmorphismEnabled
            ? (isDark 
                  ? 'bg-blue-400/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                  : 'bg-blue-300/20 backdrop-blur-md text-white border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark 
                  ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-blue-300 via-cyan-200 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-blue-200')
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        {liquidGlassEnabled && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-20" />
        )}
        <div className="text-center flex flex-col justify-center items-center h-full relative px-2 py-3">
          {/* Animated water droplets background */}
          <div className="absolute inset-0 opacity-20 overflow-hidden">
            <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-6 left-6 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-8 right-2 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          </div>
          
          {/* Main water icon with enhanced styling */}
          <div className="relative mb-2">
            <div className={`text-2xl p-2 rounded-full border-2 border-white/40 bg-white/15 backdrop-blur-sm shadow-lg transition-all duration-300 ${
              waterIntake > 0 ? 'scale-110 border-white/60 bg-white/20' : ''
            }`}>
              💧
            </div>
            {/* Glow effect - only when water is added */}
            {waterIntake > 0 && (
              <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md scale-110 opacity-100 transition-opacity duration-300"></div>
            )}
          </div>
          
          {/* Water intake display with better typography */}
          <div className={`text-sm font-bold mb-2 leading-none tracking-wide ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-white drop-shadow-sm' : 'text-white drop-shadow-sm')
              : widgetTextColor === 'black' 
                ? 'text-black drop-shadow-sm' 
                : 'text-white drop-shadow-sm'
          }`}>
            {waterIntake}ml
          </div>
          
          {/* Progress indicator */}
          <div className="w-14 h-1 bg-white/20 rounded-full mb-2 overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min((waterIntake / 2000) * 100, 100)}%` }}
            ></div>
          </div>
          
          {/* Enhanced buttons with better UX */}
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
            
            {/* Center indicator */}
            <div className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
              isDark ? 'bg-white/10 text-white/80' : 'bg-white/20 text-white/90'
            }`}>
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
      
      {/* Delete Button - Only show when edit modal is open */}
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

function QuickNotesWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, liquidGlassEnabled, widgetTextColor, jiggleIndex }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; liquidGlassEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...(isEditModalOpen ? { ...attributes, ...listeners } : {})}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col transition-all duration-300 relative overflow-hidden ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          liquidGlassEnabled
            ? 'bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            : glassmorphismEnabled
            ? (isDark 
                  ? 'bg-yellow-500/15 backdrop-blur-md text-yellow-100 border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                  : 'bg-yellow-400/15 backdrop-blur-md text-yellow-50 border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark 
                  ? 'bg-gradient-to-br from-orange-600 via-yellow-600 to-orange-700 text-yellow-100 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm border border-orange-500/30' 
                  : 'bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 text-yellow-50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm border border-orange-400/30')
        } ${isEditModalOpen && !isDragging ? 'ios-jiggle' : ''}`}
        style={{ animationDelay: isEditModalOpen ? `${(jiggleIndex % 8) * 60}ms` : undefined }}
      >
        {liquidGlassEnabled && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-20" />
        )}
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-3 left-4 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
        </div>
        
        <div className="flex flex-col justify-start items-start h-full p-3 relative z-10">
          <div className="w-full h-full">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="New note..."
              className={`w-full h-full bg-transparent border-none outline-none resize-none text-xs leading-tight placeholder-yellow-200/70 ${
                widgetTextColor === 'auto' 
                  ? (isDark ? 'text-yellow-100' : 'text-yellow-50')
                  : widgetTextColor === 'black' 
                    ? 'text-black' 
                    : 'text-white'
              }`}
              style={{ 
                fontFamily: 'inherit',
                lineHeight: '1.2'
              }}
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>
      </div>
      
      {/* Delete Button - Only show when edit modal is open */}
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



function AnalogClockWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, liquidGlassEnabled, widgetTextColor, jiggleIndex }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; liquidGlassEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white'; jiggleIndex: number }) {
  const [time, setTime] = useState(new Date());
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
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  useEffect(() => setMounted(true), []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate clock hands angles
  const seconds = mounted ? time.getSeconds() : 0;
  const minutes = mounted ? time.getMinutes() : 0;
  const hours = mounted ? (time.getHours() % 12) : 0;
  
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
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          liquidGlassEnabled
            ? 'bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            : glassmorphismEnabled
            ? (isDark 
                  ? 'bg-gray-900/20 backdrop-blur-md text-white border-[1.5px] border-white/15 hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                  : 'bg-white/20 backdrop-blur-md text-black border-[1.5px] border-white/30 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]')
              : (isDark 
                  ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-white via-gray-50 to-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-gray-100')
        }`}
      >
        {liquidGlassEnabled && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-20" />
        )}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-26 lg:h-26 xl:w-28 xl:h-28">
          {/* Clock face */}
          <div className={`w-full h-full rounded-full ${isDark ? 'bg-black' : 'bg-white'} shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center relative p-2`}>
            {/* Roman numerals for cardinal hours */}
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>XII</div>
            <div className={`absolute top-1/2 right-2 transform -translate-y-1/2 text-xs font-medium ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>III</div>
            <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>VI</div>
            <div className={`absolute top-1/2 left-2 transform -translate-y-1/2 text-xs font-medium ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>IX</div>
            
            {/* Hour markers (small dashes) */}
            {[1, 2, 4, 5, 7, 8, 10, 11].map((hour) => {
              const angle = (hour / 12) * 360;
              const radius = 3; // Adjusted for padding
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              
              return (
                <div
                  key={hour}
                  className="absolute w-0.5 h-1 bg-gray-400 rounded-full"
                  style={{
                    left: `calc(50% + ${x}rem)`,
                    top: `calc(50% + ${y}rem)`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`
                  }}
                />
              );
            })}
            
            {/* Clock center dot */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 z-10 shadow-sm"></div>
          </div>
          
          {/* Hour hand */}
          <div 
            className="absolute top-1/2 left-1/2 w-1 h-8 origin-bottom bg-gray-800 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)`
            }}
          ></div>
          
          {/* Minute hand */}
          <div 
            className="absolute top-1/2 left-1/2 w-0.5 h-10 origin-bottom bg-gray-800 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)`
            }}
          ></div>
          
          {/* Second hand */}
          <div 
            className="absolute top-1/2 left-1/2 w-0.5 h-11 origin-bottom bg-red-500 rounded-full"
            style={{
              transform: `translateX(-50%) translateY(-100%) rotate(${secondDegrees}deg)`
            }}
          ></div>
        </div>
      </div>
      
      {/* Delete Button - Only show when edit modal is open */}
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

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [apps, setApps] = useState<App[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showAppTitles, setShowAppTitles] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [glassmorphismEnabled, setGlassmorphismEnabled] = useState<boolean>(false);
  const [appTitleColor, setAppTitleColor] = useState<'auto' | 'black' | 'white'>('auto');
  const [widgetTextColor, setWidgetTextColor] = useState<'auto' | 'black' | 'white'>('auto');
  const [liquidGlassEnabled, setLiquidGlassEnabled] = useState<boolean>(false);
  const [normalModeEnabled, setNormalModeEnabled] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading flag
  const [isResetting, setIsResetting] = useState(false); // Add reset flag

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);



  // Load saved state on mount to avoid hydration mismatch
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    console.log('🔄 Loading saved state from localStorage...');
    setIsLoading(true); // Set loading to true before loading
    
    try {
      // Load apps
      const savedApps = localStorage.getItem('favoriteApps');
      if (savedApps) {
        const parsedApps = JSON.parse(savedApps);
        setApps(parsedApps);
        console.log('✅ Apps loaded:', parsedApps.length);
      } else {
        setApps(defaultApps);
        console.log('🔄 No apps saved, using defaults');
      }

      // Load widgets
      const savedWidgets = localStorage.getItem('widgets');
      if (savedWidgets) {
        const parsedWidgets = JSON.parse(savedWidgets);
        setWidgets(parsedWidgets);
        console.log('✅ Widgets loaded:', parsedWidgets.length);
      } else {
        setWidgets(defaultWidgets);
        console.log('🔄 No widgets saved, using defaults');
      }

      // Load theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        console.log('✅ Theme loaded from localStorage:', savedTheme);
        
        // Apply theme to document immediately
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Use system preference if no theme saved
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        console.log('🌐 Using system preference:', prefersDark ? 'dark' : 'light');
        
        // Apply system preference to document
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Load show app titles
      const savedShowAppTitles = localStorage.getItem('showAppTitles');
      if (savedShowAppTitles !== null) {
        setShowAppTitles(savedShowAppTitles === 'true');
        console.log('✅ Show app titles loaded:', savedShowAppTitles === 'true');
      }
      const savedShowSearchBar = localStorage.getItem('showSearchBar');
      if (savedShowSearchBar !== null) {
        setShowSearchBar(savedShowSearchBar === 'true');
        console.log('✅ Show search bar loaded:', savedShowSearchBar === 'true');
      }
      const savedSearchTerm = localStorage.getItem('searchTerm');
      if (savedSearchTerm !== null) {
        setSearchTerm(savedSearchTerm);
      }

      // Load background image, prefer IndexedDB
      (async () => {
        try {
          const urlFromIdb = await getImageObjectUrl('backgroundImage');
          if (urlFromIdb) {
            setBackgroundImage(urlFromIdb);
            document.documentElement.style.setProperty('--app-bg-image', `url(${urlFromIdb.replace(/'/g, "\\'")})`);
            document.documentElement.classList.add('has-app-bg');
            console.log('✅ Background image loaded from IndexedDB');
            return;
          }
        } catch {}
        const savedBackgroundImage = localStorage.getItem('backgroundImage');
        if (savedBackgroundImage) {
          setBackgroundImage(savedBackgroundImage);
          document.documentElement.style.setProperty('--app-bg-image', `url(${savedBackgroundImage.replace(/'/g, "\\'")})`);
          document.documentElement.classList.add('has-app-bg');
          console.log('✅ Background image loaded from localStorage');
        }
      })();

      // Load app title color
      const savedAppTitleColor = localStorage.getItem('appTitleColor');
      if (savedAppTitleColor) {
        setAppTitleColor(savedAppTitleColor as 'auto' | 'black' | 'white');
        console.log('✅ App title color loaded:', savedAppTitleColor);
      }

      // Load widget text color
      const savedWidgetTextColor = localStorage.getItem('widgetTextColor');
      if (savedWidgetTextColor) {
        setWidgetTextColor(savedWidgetTextColor as 'auto' | 'black' | 'white');
        console.log('✅ Widget text color loaded:', savedWidgetTextColor);
      }

      // Load visual modes - this is critical for persistence
      const savedNormal = localStorage.getItem('normalModeEnabled');
      const savedGlass = localStorage.getItem('glassmorphismEnabled');
      const savedLiquid = localStorage.getItem('liquidGlassEnabled');
      
      console.log('🔍 Mode settings found in localStorage:', { 
        normal: savedNormal, 
        glass: savedGlass, 
        liquid: savedLiquid 
      });
      
      // Set modes based on saved values, ensuring only one is active
      if (savedNormal === 'true') {
        setNormalModeEnabled(true);
        setGlassmorphismEnabled(false);
        setLiquidGlassEnabled(false);
        console.log('✅ Normal mode restored from localStorage');
      } else if (savedGlass === 'true') {
        setNormalModeEnabled(false);
        setGlassmorphismEnabled(true);
        setLiquidGlassEnabled(false);
        console.log('✅ Glassmorphism mode restored from localStorage');
      } else if (savedLiquid === 'true') {
        setNormalModeEnabled(false);
        setGlassmorphismEnabled(false);
        setLiquidGlassEnabled(true);
        console.log('✅ Liquid glass mode restored from localStorage');
      } else {
        // No modes saved, default to normal
        setNormalModeEnabled(true);
        setGlassmorphismEnabled(false);
        setLiquidGlassEnabled(false);
        console.log('🔄 No modes saved, defaulting to normal mode');
      }
      
      // Log the states immediately after setting them
      console.log('🔄 States set during loading:', {
        normal: savedNormal === 'true',
        glass: savedGlass === 'true',
        liquid: savedLiquid === 'true'
      });
      
      // Force a re-render after setting all states
      setTimeout(() => {
        console.log('🔄 Final state after loading:', {
          normal: normalModeEnabled,
          glass: glassmorphismEnabled,
          liquid: liquidGlassEnabled
        });
      }, 100);
      
      console.log('✅ All settings loaded successfully');
      setIsLoading(false); // Mark loading as complete
      console.log('🚀 Loading complete - save effect now enabled');
      
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      // Fallback to defaults on error
      setApps(defaultApps);
      setWidgets(defaultWidgets);
      setNormalModeEnabled(true);
      setGlassmorphismEnabled(false);
      setLiquidGlassEnabled(false);
      setIsLoading(false); // Mark loading as complete even on error
    }
  }, [mounted]);

  // Save apps to localStorage only when explicitly changed by user (not during load/reset)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isResetting && !isLoading) {
      localStorage.setItem('favoriteApps', JSON.stringify(apps));
    }
  }, [apps, isResetting, isLoading]);

  // Save widgets to localStorage only when explicitly changed by user (not during load/reset)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isResetting && !isLoading) {
      localStorage.setItem('widgets', JSON.stringify(widgets));
    }
  }, [widgets, isResetting, isLoading]);

  // Reset completion - localStorage saving is now passive and only happens on user changes
  useEffect(() => {
    if (isResetting && apps.length > 0 && widgets.length > 0) {
      const timer = setTimeout(() => {
        setIsResetting(false);
        console.log('🔄 Reset complete - localStorage is now read-only until user makes changes');
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isResetting, apps, widgets]);



  // Comprehensive save effect for all settings - only save on user changes, not during load/reset
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && !isResetting) { // Only save when not loading and not resetting
      console.log('💾 Saving user settings to localStorage:', {
        theme: isDarkMode ? 'dark' : 'light',
        showAppTitles,
        showSearchBar,
        searchTerm,
        backgroundImage,
        normalModeEnabled,
        glassmorphismEnabled,
        liquidGlassEnabled,
        appTitleColor,
        widgetTextColor
      });

      // Save theme
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      
      // Save show app titles
      localStorage.setItem('showAppTitles', showAppTitles.toString());
      localStorage.setItem('showSearchBar', showSearchBar.toString());
      localStorage.setItem('searchTerm', searchTerm);
      
      // Save background image only if it's a data URL or remote URL.
      // For IndexedDB case we use object URL at runtime and don't persist the blob in localStorage.
      if (!backgroundImage.startsWith('blob:')) {
        localStorage.setItem('backgroundImage', backgroundImage);
      }
      
      // Save visual modes
      localStorage.setItem('normalModeEnabled', normalModeEnabled.toString());
      localStorage.setItem('glassmorphismEnabled', glassmorphismEnabled.toString());
      localStorage.setItem('liquidGlassEnabled', liquidGlassEnabled.toString());
      
      // Save colors
      localStorage.setItem('appTitleColor', appTitleColor);
      localStorage.setItem('widgetTextColor', widgetTextColor);

      // Apply theme to document
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        console.log('🌙 Dark mode applied to document');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('☀️ Light mode applied to document');
      }

      // Apply background image
      if (backgroundImage) {
        document.documentElement.style.setProperty('--app-bg-image', `url(${backgroundImage.replace(/'/g, "\\'")})`);
        document.documentElement.classList.add('has-app-bg');
      } else {
        document.documentElement.style.setProperty('--app-bg-image', 'none');
        document.documentElement.classList.remove('has-app-bg');
      }

      console.log('✅ All settings saved to localStorage successfully');
    }
  }, [
    isDarkMode, 
    showAppTitles, 
    backgroundImage, 
    normalModeEnabled, 
    glassmorphismEnabled, 
    liquidGlassEnabled, 
    appTitleColor, 
    widgetTextColor,
    isLoading,
    isResetting
  ]);

  const resetSettings = () => {
    // Show confirmation dialog
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        '⚠️ Are you sure you want to reset all settings?\n\n' +
        'This will:\n' +
        '• Reset all visual settings to defaults\n' +
        '• Restore default app cards (YouTube, GitHub, etc.)\n' +
        '• Restore default widgets (Clock, Weather, etc.)\n' +
        '• Clear all custom apps and widgets\n' +
        '• Clear all saved preferences\n\n' +
        'This action cannot be undone!'
      );
      
      if (!confirmed) {
        console.log('❌ Reset cancelled by user');
        return;
      }
    }
    
    console.log('🔄 Resetting all settings to defaults...');
    
    // Set reset flag to prevent useEffect from overwriting localStorage
    setIsResetting(true);
    
    // Clear localStorage first and ensure it's completely empty
    if (typeof window !== 'undefined') {
      localStorage.clear();
      
      // Double-check that localStorage is actually cleared
      if (localStorage.length > 0) {
        console.warn('⚠️ localStorage not fully cleared, forcing removal of remaining items');
        // Force remove any remaining items
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      console.log('🗑️ localStorage cleared, length:', localStorage.length);
    }
    
    // Reset visual settings to defaults
    setIsDarkMode(false);
    setShowAppTitles(true);
    setBackgroundImage('');
    setGlassmorphismEnabled(false);
    setLiquidGlassEnabled(false);
    setNormalModeEnabled(true);
    setAppTitleColor('auto');
    setWidgetTextColor('auto');
    
    // Restore default apps and widgets
    setApps(defaultApps);
    setWidgets(defaultWidgets);
    
    // Set default values in localStorage immediately after clearing
    if (typeof window !== 'undefined') {
      try {
        // Set default values in localStorage
        localStorage.setItem('theme', 'light');
        localStorage.setItem('showAppTitles', 'true');
        localStorage.setItem('backgroundImage', '');
        localStorage.setItem('normalModeEnabled', 'true');
        localStorage.setItem('glassmorphismEnabled', 'false');
        localStorage.setItem('liquidGlassEnabled', 'false');
        localStorage.setItem('appTitleColor', 'auto');
        localStorage.setItem('widgetTextColor', 'auto');
        
        // Save apps and widgets with explicit stringification
        const appsJson = JSON.stringify(defaultApps);
        const widgetsJson = JSON.stringify(defaultWidgets);
        
        localStorage.setItem('favoriteApps', appsJson);
        localStorage.setItem('widgets', widgetsJson);
        
        // Add timestamp for reset tracking
        localStorage.setItem('lastResetDate', new Date().toDateString());
        
        // Simple verification that save was successful
        if (localStorage.getItem('favoriteApps') === appsJson && localStorage.getItem('widgets') === widgetsJson) {
          console.log('✅ Default apps and widgets saved to localStorage successfully');
        } else {
          console.warn('⚠️ localStorage save verification failed, but continuing...');
        }
        
        // Verify the save was successful
        const savedApps = localStorage.getItem('favoriteApps');
        const savedWidgets = localStorage.getItem('widgets');
        console.log('🔍 Verification - saved apps:', savedApps ? JSON.parse(savedApps).length : 'none');
        console.log('🔍 Verification - saved widgets:', savedWidgets ? JSON.parse(savedWidgets).length : 'none');
        
        // Simple verification that save was successful
        if (savedApps === appsJson && savedWidgets === widgetsJson) {
          console.log('✅ All settings reset to defaults and saved to localStorage successfully');
        } else {
          console.warn('⚠️ localStorage save verification failed, but continuing...');
        }
      } catch (error) {
        console.error('❌ Error saving to localStorage during reset:', error);
      }
    }
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--app-bg-image', 'none');
      document.documentElement.classList.remove('has-app-bg');
    }
    
    // Note: isResetting will be set to false by a useEffect when the state updates complete
  };

  const addApp = (app: App) => {
    // Add favicon URL to the app
    const appWithIcon = {
      ...app,
      icon: getFaviconUrl(app.href)
    };
    setApps([...apps, appWithIcon]);
  };

  const addWidget = (type: 'clock' | 'weather' | 'calendar' | 'analog-clock' | 'water-tracker' | 'quick-notes') => {
    const widget: Widget = {
      id: Date.now().toString(),
      type,
      title: type === 'clock' ? 'Clock Widget' : type === 'weather' ? 'Weather Widget' : type === 'calendar' ? 'Calendar Widget' : type === 'analog-clock' ? 'Analog Clock Widget' : type === 'water-tracker' ? 'Water Tracker Widget' : 'Quick Notes Widget'
    };
    setWidgets([...widgets, widget]);
  };

  const quickAddFavoriteApp = () => {
    if (typeof window === 'undefined') return;
    const title = window.prompt('Enter app name (e.g., Twitter, GitHub)');
    if (!title || !title.trim()) return;
    const rawUrl = window.prompt('Enter URL (e.g., twitter.com or https://twitter.com)');
    if (!rawUrl || !rawUrl.trim()) return;
    const url = rawUrl.trim();
    const normalizedHref = url.startsWith('http') ? url : `https://${url}`;
    const app: App = {
      id: Date.now().toString(),
      title: title.trim(),
      href: normalizedHref,
    };
    addApp(app);
  };

  const removeApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Handle app reordering
      const activeApp = apps.find(app => app.id === active.id);
      const overApp = apps.find(app => app.id === over?.id);
      
      if (activeApp && overApp) {
        setApps((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
      
      // Handle widget reordering
      const activeWidget = widgets.find(widget => widget.id === active.id);
      const overWidget = widgets.find(widget => widget.id === over?.id);
      
      if (activeWidget && overWidget) {
        setWidgets((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
      
      // Handle cross-type reordering (app to widget position or vice versa)
      if (activeApp && overWidget) {
        // Move app to widget position
        setApps((appItems) => {
          const oldIndex = appItems.findIndex((item) => item.id === active.id);
          const newIndex = widgets.findIndex((item) => item.id === over?.id);
          return arrayMove(appItems, oldIndex, newIndex);
        });
      }
      
      if (activeWidget && overApp) {
        // Move widget to app position
        setWidgets((widgetItems) => {
          const oldIndex = widgetItems.findIndex((item) => item.id === active.id);
          const newIndex = apps.findIndex((item) => item.id === over?.id);
          return arrayMove(widgetItems, oldIndex, newIndex);
        });
      }
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <main className="min-h-screen px-4 py-8 bg-white">
        <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mt-24 px-1 sm:px-2 lg:px-3">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main suppressHydrationWarning
      className={`min-h-screen px-4 py-8 transition-all duration-300 ${
        backgroundImage ? 'bg-cover bg-center bg-no-repeat' : ''
      } ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}
      style={{
        ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
        backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff'
      }}
    >
      {/* Global keyframes for iOS-style jiggle */}
      <style>{`
        @keyframes iosJiggle {
          0%, 100% { transform: rotate(-1deg) translateY(0); }
          50% { transform: rotate(1deg) translateY(-0.5px); }
        }
        .ios-jiggle {
          animation: iosJiggle 0.22s ease-in-out infinite;
        }
      `}</style>
      {/* Apple Liquid Glass overlays */}
      {liquidGlassEnabled && (
        <>
          <div className="liquid-glass-overlay" />
          <div className="liquid-glass-noise" />
        </>
      )}
      <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mt-24 px-1 sm:px-2 lg:px-3">

        {/* Search Bar moved into sidebar (below Widgets). Page-level bar removed. */}

        {/* Apps Grid with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={apps.map(app => app.id)} strategy={rectSortingStrategy}>
            <div className="mb-6 mt-[240px]">
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 3xl:grid-cols-14 gap-y-10 gap-x-0.5 sm:gap-y-11 sm:gap-x-0.5 lg:gap-x-0.5 auto-rows-[40px] sm:auto-rows-[48px] lg:auto-rows-[60px]">
                {apps
                  .filter(app => {
                    if (!searchTerm) return true;
                    const term = searchTerm.toLowerCase();
                    return app.title.toLowerCase().includes(term) || (app.icon ?? '').toLowerCase().includes(term) || app.href.toLowerCase().includes(term);
                  })
                  .map((app, index) => (
                  <SortableLinkCard
                    key={app.id}
                    app={app}
                    onRemove={removeApp}
                    isDark={isDarkMode}
                    showAppTitles={showAppTitles}
                    backgroundImage={backgroundImage}
                    glassmorphismEnabled={glassmorphismEnabled}
                     liquidGlassEnabled={liquidGlassEnabled}
                    appTitleColor={appTitleColor}
                    isEditModalOpen={isEditModalOpen}
                    jiggleIndex={index}
                  />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>

        {/* Widget Area */}
        {widgets.length > 0 && (
          <div className="mt-12">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={widgets.map(widget => widget.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-y-4 gap-x-0 sm:gap-y-5 sm:gap-x-1 lg:gap-x-2">
                  {widgets.map((widget, index) => (
                    widget.type === 'clock' ? (
                      <SortableClockWidget
                        key={widget.id}
                        widget={widget}
                        isDark={isDarkMode}
                        onRemove={() => {
                          setWidgets(widgets.filter(w => w.id !== widget.id));
                        }}
                        isEditModalOpen={isEditModalOpen}
                        backgroundImage={backgroundImage}
                         glassmorphismEnabled={glassmorphismEnabled}
                         liquidGlassEnabled={liquidGlassEnabled}
                        widgetTextColor={widgetTextColor}
                        jiggleIndex={index}
                      />
                    ) : (
                      widget.type === 'weather' ? (
                        <WeatherWidget
                          key={widget.id}
                          widget={widget}
                          isDark={isDarkMode}
                          onRemove={() => {
                            setWidgets(widgets.filter(w => w.id !== widget.id));
                          }}
                          isEditModalOpen={isEditModalOpen}
                          backgroundImage={backgroundImage}
                             glassmorphismEnabled={glassmorphismEnabled}
                             liquidGlassEnabled={liquidGlassEnabled}
                          widgetTextColor={widgetTextColor}
                          jiggleIndex={index}
                        />
                      ) : (
                        widget.type === 'calendar' ? (
                          <CalendarWidget
                            key={widget.id}
                            widget={widget}
                            isDark={isDarkMode}
                            onRemove={() => {
                              setWidgets(widgets.filter(w => w.id !== widget.id));
                            }}
                            isEditModalOpen={isEditModalOpen}
                            backgroundImage={backgroundImage}
                               glassmorphismEnabled={glassmorphismEnabled}
                               liquidGlassEnabled={liquidGlassEnabled}
                            widgetTextColor={widgetTextColor}
                            jiggleIndex={index}
                          />
                        ) : (
                          widget.type === 'water-tracker' ? (
                            <WaterTrackerWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                               glassmorphismEnabled={glassmorphismEnabled}
                               liquidGlassEnabled={liquidGlassEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                            />
                          ) : widget.type === 'quick-notes' ? (
                            <QuickNotesWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                                liquidGlassEnabled={liquidGlassEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                            />
                          ) : (
                            <AnalogClockWidget
                              key={widget.id}
                              widget={widget}
                              isDark={isDarkMode}
                              onRemove={() => {
                                setWidgets(widgets.filter(w => w.id !== widget.id));
                              }}
                              isEditModalOpen={isEditModalOpen}
                              backgroundImage={backgroundImage}
                              glassmorphismEnabled={glassmorphismEnabled}
                               liquidGlassEnabled={liquidGlassEnabled}
                              widgetTextColor={widgetTextColor}
                              jiggleIndex={index}
                            />
                          )
                        )
                      )
                    )
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {apps.length === 0 && (
          <div className={`text-center mt-8 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>No apps added yet. Click the + button to add your first app!</p>
          </div>
        )}
      </div>

      {/* Floating Action Dock */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-5 sm:right-5 rounded-full shadow-lg border px-1.5 py-1.5 sm:px-2 sm:py-2 flex items-center gap-1 sm:gap-2 backdrop-blur-xl z-30 ${
          liquidGlassEnabled
            ? 'bg-white/10 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
            : glassmorphismEnabled
              ? (isDarkMode
                  ? 'bg-black/30 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
                  : 'bg-white/40 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.12)]')
              : (isDarkMode
                  ? 'bg-[#0f1115]/80 border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.45)]'
                  : 'bg-white/80 border-gray-200/60 shadow-[0_10px_25px_rgba(0,0,0,0.08)]')
        }`}
      >
        {/* Edit Mode Button */}
        <button
          onClick={() => {
            setIsEditModalOpen(!isEditModalOpen);
          }}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white ring-1 ring-white/10 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center`}
          title={isEditModalOpen ? "Exit Edit Mode" : "Enter Edit Mode"}
          aria-label={isEditModalOpen ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          {isEditModalOpen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )}
        </button>

        {/* Quick Add Favorite App Button (left of Settings) */}
        <button
          onClick={quickAddFavoriteApp}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white ring-1 ring-white/10 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center"
          title="Add Favorite App"
          aria-label="Add Favorite App"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        {/* Settings Button */}
        <button
          onClick={() => {
            setIsSidebarOpen(prev => !prev);
          }}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white ring-1 ring-white/10 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center`}
          title="Dashboard Settings"
          aria-label="Dashboard Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        apps={apps}
        onAddApp={addApp}
        isDarkMode={isDarkMode}
        onToggleTheme={() => {
          setIsDarkMode(prev => {
            const next = !prev;
            console.log('🌙 Theme toggled from', prev, 'to', next);
            return next;
          });
        }}
        showAppTitles={showAppTitles}
        showSearchBar={showSearchBar}
        searchTerm={searchTerm}
        onToggleShowAppTitles={() => {
          setShowAppTitles(prev => {
            const next = !prev;
            console.log('📱 Show app titles toggled from', prev, 'to', next);
            return next;
          });
        }}
        onToggleSearchBar={() => {
          setShowSearchBar(prev => {
            const next = !prev;
            console.log('🔎 Show search bar toggled from', prev, 'to', next);
            return next;
          });
        }}
        onSearch={(term) => setSearchTerm(term)}
        backgroundImage={backgroundImage}
        onSetBackgroundImage={(url) => {
          console.log('🖼️ Background image changed to:', url);
          if (typeof window !== 'undefined' && url && !url.startsWith('blob:') && !url.startsWith('idb:')) {
            try { localStorage.setItem('backgroundImage', url); } catch {}
          }
          setBackgroundImage(url);
          if (typeof window !== 'undefined' && url) {
            window.location.reload();
          }
        }}
        glassmorphismEnabled={glassmorphismEnabled}
        onToggleGlassmorphism={() => {
          setGlassmorphismEnabled(prev => {
            const next = !prev;
            console.log('🔮 Glassmorphism toggled from', prev, 'to', next);
            if (next) {
              setLiquidGlassEnabled(false);
              setNormalModeEnabled(false);
            }
            return next;
          });
        }}
        liquidGlassEnabled={liquidGlassEnabled}
        onToggleLiquidGlass={() => {
          setLiquidGlassEnabled(prev => {
            const next = !prev;
            console.log('💧 Liquid glass toggled from', prev, 'to', next);
            if (next) {
              setGlassmorphismEnabled(false);
              setNormalModeEnabled(false);
            }
            return next;
          });
        }}
        normalModeEnabled={normalModeEnabled}
        onToggleNormalMode={() => {
          setNormalModeEnabled(prev => {
            const next = !prev;
            console.log('📱 Normal mode toggled from', prev, 'to', next);
            if (next) {
              setGlassmorphismEnabled(false);
              setLiquidGlassEnabled(false);
            }
            return next;
          });
        }}
        appTitleColor={appTitleColor}
        onSetAppTitleColor={(color) => {
          console.log('🎨 App title color changed to:', color);
          setAppTitleColor(color);
        }}
        widgetTextColor={widgetTextColor}
        onSetWidgetTextColor={(color) => {
          console.log('🎨 Widget text color changed to:', color);
          setWidgetTextColor(color);
        }}
        addWidget={addWidget}
        onResetSettings={resetSettings}
      />



    </main>
  );
}