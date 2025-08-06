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
import Sidebar from './components/Sidebar';

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

function SortableLinkCard({ app, onRemove, isDark, isEditMode, isEditModalOpen, showAppTitles, backgroundImage, glassmorphismEnabled, appTitleColor }: { app: App; onRemove: (id: string) => void; isDark: boolean; isEditMode: boolean; isEditModalOpen: boolean; showAppTitles: boolean; backgroundImage: string; glassmorphismEnabled: boolean; appTitleColor: 'auto' | 'black' | 'white' }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, disabled: !(isEditMode || isEditModalOpen) });

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
        {...((isEditMode || isEditModalOpen) ? { ...attributes, ...listeners } : {})}
        className={`${showAppTitles ? 'w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] lg:w-[60px] lg:h-[60px]' : 'w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]'} rounded-2xl transition duration-300 flex flex-col items-center justify-center text-center ${backgroundImage ? 'border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]' : 'border-2'} ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          (isEditMode || isEditModalOpen) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        } ${
          glassmorphismEnabled
            ? isDark 
              ? 'bg-black/20 backdrop-blur-md text-white hover:bg-black/30 border-[1.5px] border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
              : 'bg-white/20 backdrop-blur-md text-black hover:bg-white/30 border-[1.5px] border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]'
            : isDark 
              ? 'bg-black text-white hover:bg-gray-900 border-[#2C2D2D] shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.4)]' 
              : 'bg-white text-black hover:bg-gray-50 border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
        }`}
        onClick={() => {
          if (!isEditMode && !isEditModalOpen) {
            window.open(app.href, '_blank', 'noopener,noreferrer');
          }
        }}
      >
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
      
      {/* Remove Button - Only show in edit mode */}
      {(isEditMode || isEditModalOpen) && (
        <button
          onClick={() => onRemove(app.id)}
          className={`absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-opacity duration-200 z-10 ${
            isEditModalOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Remove app"
        >
          ×
        </button>
      )}
    </div>
  );
}

function SortableClockWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white' }) {
  const [time, setTime] = useState(new Date());
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
          glassmorphismEnabled
            ? isDark 
              ? 'bg-indigo-900/20 backdrop-blur-md text-white border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-indigo-50/20 backdrop-blur-md text-indigo-900 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark 
              ? 'bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm' 
              : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 text-indigo-900 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-indigo-100'
        }`}
      >
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
          <div className={`text-2xl sm:text-3xl font-bold leading-none tracking-wider font-mono ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-white' : 'text-gray-800')
              : widgetTextColor === 'black' 
                ? 'text-black' 
                : 'text-white'
          }`}>
            {time.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: 'numeric', 
              minute: '2-digit'
            })}
          </div>
          <div className={`text-xs sm:text-sm font-medium mt-1 leading-none tracking-wide ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-gray-300' : 'text-gray-600')
              : widgetTextColor === 'black' 
                ? 'text-black' 
                : 'text-white'
          }`}>
            {time.toLocaleTimeString('en-US', { 
              hour12: true, 
              hour: 'numeric', 
              minute: '2-digit'
            }).split(' ')[1]}
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

function WeatherWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white' }) {
  const [weather, setWeather] = useState({ temp: '22°', condition: 'Sunny', location: 'Loading...' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
          glassmorphismEnabled
            ? isDark 
              ? 'bg-blue-400/20 backdrop-blur-md text-black border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-blue-300/20 backdrop-blur-md text-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark 
              ? 'bg-gradient-to-br from-blue-400 via-gray-300 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm' 
              : 'bg-gradient-to-br from-blue-300 via-gray-200 to-blue-300 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm'
        }`}
      >
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
          <div className={`text-xs sm:text-sm font-bold leading-none mb-1 ${
            isDark ? 'text-black' : 'text-black'
          }`}>
            {loading ? 'Loading...' : error ? 'Location unavailable' : weather.location}
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="text-xs">
              {loading ? '⏳' : error ? '⚠️' : 
                weather.condition === 'Sunny' ? '☀️' :
                weather.condition === 'Cloudy' ? '☁️' :
                weather.condition === 'Rainy' ? '🌧️' :
                weather.condition === 'Partly Cloudy' ? '⛅' :
                weather.condition === 'Clear' ? '🌙' : '⚡'
              }
            </div>
            <div className={`text-xs leading-none ${
              widgetTextColor === 'auto' 
                ? (isDark ? 'text-black' : 'text-black')
                : widgetTextColor === 'black' 
                  ? 'text-black' 
                  : 'text-white'
            }`}>
              {loading ? 'Getting weather...' : error ? 'Check permissions' : weather.condition}
            </div>
          </div>
          <div className={`text-xs leading-none mb-2 ${
            widgetTextColor === 'auto' 
              ? (isDark ? 'text-black/80' : 'text-black/80')
              : widgetTextColor === 'black' 
                ? 'text-black/80' 
                : 'text-white/80'
          }`}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
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

function CalendarWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white' }) {
  const [date, setDate] = useState(new Date());
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditModalOpen });

  // Get current week dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay + 1); // Start from Monday
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const currentDate = date.getDate();
  const currentMonth = date.toLocaleDateString('en-US', { month: 'long' });

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
          glassmorphismEnabled
            ? isDark 
              ? 'bg-gray-800/20 backdrop-blur-md text-white border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-white/20 backdrop-blur-md text-gray-800 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark 
              ? 'bg-gray-800/90 text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-gray-700/30' 
              : 'bg-white/95 text-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm border border-gray-200/50'
        }`}
      >

        
        <div className="flex flex-col justify-start items-start h-full p-3 pt-6 relative z-10">
          {/* Current Date Display */}
          <div className="flex items-center justify-center w-full mb-4 mt-1">
            <div className={`text-xl font-bold leading-none ${
              widgetTextColor === 'auto' 
                ? (isDark ? 'text-white' : 'text-gray-900')
                : widgetTextColor === 'black' 
                  ? 'text-black' 
                  : 'text-white'
            }`}>
              {currentMonth} <span className="text-2xl">{currentDate}</span>
            </div>
          </div>
          
          {/* Week View */}
          <div className="w-full">
            {/* Days of the week */}
            <div className="flex justify-between mb-1">
              {['T', 'W', 'T', 'F', 'S', 'S', 'M'].map((day, index) => (
                <div key={index} className={`text-xs leading-tight ${
                  widgetTextColor === 'auto' 
                    ? (isDark ? 'text-white' : 'text-gray-500')
                    : widgetTextColor === 'black' 
                      ? 'text-black' 
                      : 'text-white'
                }`}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Dates */}
            <div className="flex justify-between">
              {weekDates.map((weekDate, index) => {
                const isCurrentDay = weekDate.getDate() === currentDate;
                return (
                  <div key={index} className={`w-5 h-5 rounded-full flex items-center justify-center text-xs leading-tight ${
                    isCurrentDay 
                      ? isDark 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-800 text-white'
                      : widgetTextColor === 'auto' 
                        ? (isDark ? 'text-white' : 'text-gray-500')
                        : widgetTextColor === 'black' 
                          ? 'text-black' 
                          : 'text-white'
                  }`}>
                    {weekDate.getDate()}
                  </div>
                );
              })}
            </div>
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

function WaterTrackerWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white' }) {
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
          glassmorphismEnabled
            ? isDark 
              ? 'bg-blue-400/20 backdrop-blur-md text-white border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-blue-300/20 backdrop-blur-md text-white border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark 
              ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm' 
              : 'bg-gradient-to-br from-blue-300 via-cyan-200 to-blue-400 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-blue-200'
        }`}
      >
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

function QuickNotesWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white' }) {
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
          glassmorphismEnabled
            ? isDark 
              ? 'bg-yellow-500/15 backdrop-blur-md text-yellow-100 border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-yellow-400/15 backdrop-blur-md text-yellow-50 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark 
              ? 'bg-gradient-to-br from-orange-600 via-yellow-600 to-orange-700 text-yellow-100 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm border border-orange-500/30' 
              : 'bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 text-yellow-50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm border border-orange-400/30'
        }`}
      >
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

function AnalogClockWidget({ widget, isDark, onRemove, isEditModalOpen, backgroundImage, glassmorphismEnabled, widgetTextColor }: { widget: Widget; isDark: boolean; onRemove: () => void; isEditModalOpen: boolean; backgroundImage: string; glassmorphismEnabled: boolean; widgetTextColor: 'auto' | 'black' | 'white' }) {
  const [time, setTime] = useState(new Date());
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate clock hands angles
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;
  
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
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        } ${
          isEditModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          glassmorphismEnabled
            ? isDark 
              ? 'bg-gray-900/20 backdrop-blur-md text-white border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-white/20 backdrop-blur-md text-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
            : isDark 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm' 
              : 'bg-gradient-to-br from-white via-gray-50 to-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-gray-100'
        }`}
      >
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
  const [apps, setApps] = useState<App[]>(defaultApps);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAppTitles, setShowAppTitles] = useState(true);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [glassmorphismEnabled, setGlassmorphismEnabled] = useState(false);
  const [appTitleColor, setAppTitleColor] = useState<'auto' | 'black' | 'white'>('auto');
  const [widgetTextColor, setWidgetTextColor] = useState<'auto' | 'black' | 'white'>('auto');

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

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load apps and theme from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApps = localStorage.getItem('favoriteApps');
      if (savedApps) {
        setApps(JSON.parse(savedApps));
      }
      
      const savedWidgets = localStorage.getItem('widgets');
      if (savedWidgets) {
        setWidgets(JSON.parse(savedWidgets));
      }
      
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }

          const savedBackgroundImage = localStorage.getItem('backgroundImage');
    if (savedBackgroundImage) {
      setBackgroundImage(savedBackgroundImage);
    }

        const savedGlassmorphismEnabled = localStorage.getItem('glassmorphismEnabled');
    if (savedGlassmorphismEnabled) {
      setGlassmorphismEnabled(savedGlassmorphismEnabled === 'true');
    }

    const savedAppTitleColor = localStorage.getItem('appTitleColor');
    if (savedAppTitleColor) {
      setAppTitleColor(savedAppTitleColor as 'auto' | 'black' | 'white');
    }

    const savedWidgetTextColor = localStorage.getItem('widgetTextColor');
    if (savedWidgetTextColor) {
      setWidgetTextColor(savedWidgetTextColor as 'auto' | 'black' | 'white');
    }
    }
  }, []);

  // Save apps to localStorage whenever apps change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteApps', JSON.stringify(apps));
    }
  }, [apps]);

  // Save widgets to localStorage whenever widgets change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('widgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  // Save theme to localStorage and apply to document
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, mounted]);

  // Save background image to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundImage', backgroundImage);
    }
  }, [backgroundImage]);



  // Save glassmorphism setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('glassmorphismEnabled', glassmorphismEnabled.toString());
    }
  }, [glassmorphismEnabled]);

  // Save app title color setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appTitleColor', appTitleColor);
    }
  }, [appTitleColor]);

  // Save widget text color setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('widgetTextColor', widgetTextColor);
    }
  }, [widgetTextColor]);

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

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>My Favorites</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen px-4 py-8 transition-all duration-300 ${
      backgroundImage 
        ? 'bg-cover bg-center bg-no-repeat' 
        : 'bg-background'
    }`} style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}>
      <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mt-24 px-1 sm:px-2 lg:px-3">
        {/* Apps Grid with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={apps.map(app => app.id)} strategy={rectSortingStrategy}>
            <div className="mb-6 mt-[240px]">
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 3xl:grid-cols-14 gap-y-10 gap-x-0.5 sm:gap-y-11 sm:gap-x-0.5 lg:gap-x-0.5 auto-rows-[40px] sm:auto-rows-[48px] lg:auto-rows-[60px]">
                {apps.map((app) => (
                  <SortableLinkCard
                    key={app.id}
                    app={app}
                    onRemove={removeApp}
                    isDark={isDarkMode}
                    isEditMode={isEditMode}
                    isEditModalOpen={isEditModalOpen}
                    showAppTitles={showAppTitles}
                    backgroundImage={backgroundImage}
                    glassmorphismEnabled={glassmorphismEnabled}
                    appTitleColor={appTitleColor}
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
                  {widgets.map((widget) => (
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
                        widgetTextColor={widgetTextColor}
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
                          widgetTextColor={widgetTextColor}
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
                            widgetTextColor={widgetTextColor}
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
                              widgetTextColor={widgetTextColor}
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
                              widgetTextColor={widgetTextColor}
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
                              widgetTextColor={widgetTextColor}
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

      {/* Floating Buttons Card */}
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full shadow-lg border p-2 flex gap-2 z-30 ${
        glassmorphismEnabled
          ? isDarkMode 
            ? 'bg-black/20 backdrop-blur-md border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
            : 'bg-white/20 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
          : isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Edit Button */}
        <button
          onClick={() => {
            if (!isEditMode) {
              setIsEditMode(true);
              setIsEditModalOpen(true);
            } else {
              setIsEditMode(false);
            }
          }}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center ${
            isEditMode ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
          } text-white`}
          title={isEditMode ? 'Exit edit mode' : 'Add widgets'}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Add Button */}
        <button
          onClick={() => {
            setIsSidebarOpen(true);
            setIsEditModalOpen(false);
            setIsEditMode(false);
          }}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
          title="Add new app"
                  >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
      </div>

      {/* Sidebar */}
              <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          apps={apps}
          onAddApp={addApp}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          showAppTitles={showAppTitles}
          onToggleShowAppTitles={() => setShowAppTitles(!showAppTitles)}
          backgroundImage={backgroundImage}
          onSetBackgroundImage={setBackgroundImage}
          glassmorphismEnabled={glassmorphismEnabled}
          onToggleGlassmorphism={() => setGlassmorphismEnabled(!glassmorphismEnabled)}
          appTitleColor={appTitleColor}
          onSetAppTitleColor={setAppTitleColor}
          widgetTextColor={widgetTextColor}
          onSetWidgetTextColor={setWidgetTextColor}
        />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* Modal */}
          <div className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md rounded-[2rem] shadow-2xl transition-all duration-300 ease-out z-50 pointer-events-auto mb-6 ${
            isModalClosing ? 'animate-slide-down' : 'animate-slide-up'
          } ${
            glassmorphismEnabled
              ? isDarkMode 
                ? 'bg-[#2B2B2B]/90 backdrop-blur-md border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                : 'bg-white/90 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
              : isDarkMode ? 'bg-[#2B2B2B]' : 'bg-white'
          }`}>
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1"></div>
                <h2 className={`text-lg font-semibold text-center flex-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Add Widgets
                </h2>
                <div className="flex-1 flex justify-end">
                                  <button
                  onClick={() => {
                    setIsModalClosing(true);
                    setTimeout(() => {
                      setIsEditModalOpen(false);
                      setIsEditMode(false);
                      setIsModalClosing(false);
                    }, 300);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`space-y-3 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <p className={`text-xs text-center max-w-xs mx-auto ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Widget functionality coming soon! This will allow you to add custom widgets to your dashboard.
                </p>
                
                {/* Widget Options with Previews */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Weather Widget Preview */}
                  <button
                    onClick={() => addWidget('weather')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold">22°</div>
                        <div className="text-sm">Sunny</div>
                      </div>
                      <p className="text-xs font-medium">Weather</p>
                    </div>
                  </button>
                  
                  {/* Clock Widget Preview */}
                  <button
                    onClick={() => addWidget('clock')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold">2:30</div>
                      </div>
                      <p className="text-xs font-medium">Clock</p>
                    </div>
                  </button>

                  {/* Calendar Widget Preview */}
                  <button
                    onClick={() => addWidget('calendar')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold">15</div>
                        <div className="text-sm">Mon</div>
                      </div>
                      <p className="text-xs font-medium">Calendar</p>
                    </div>
                  </button>

                  {/* Analog Clock Widget Preview */}
                  <button
                    onClick={() => addWidget('analog-clock')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="relative w-16 h-16">
                          <div className={`w-full h-full rounded-full border-2 flex items-center justify-center ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          }`}>
                            <div className={`w-0.5 h-1 rounded-full ${
                              isDarkMode ? 'bg-white' : 'bg-gray-800'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-medium">Analog</p>
                    </div>
                  </button>

                  {/* Water Tracker Widget Preview */}
                  <button
                    onClick={() => addWidget('water-tracker')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-black border-gray-300'
                      }`}>
                        <div className="text-base font-bold text-blue-400">0ml</div>
                        <div className="text-sm">Water</div>
                      </div>
                      <p className="text-xs font-medium">Water</p>
                    </div>
                  </button>

                  {/* Quick Notes Widget Preview */}
                  <button
                    onClick={() => addWidget('quick-notes')}
                    className={`p-3 rounded-xl transition-all duration-300 hover:border-blue-400 hover:text-blue-400 hover:skew-x-3 hover:skew-y-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-xl shadow border-2 mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-amber-900 text-amber-100 border-amber-700' : 'bg-amber-800 text-amber-100 border-amber-600'
                      }`}>
                        <div className="text-xs text-center leading-tight">
                          <div className="text-amber-300/70">New note...</div>
                        </div>
                      </div>
                      <p className="text-xs font-medium">Quick Notes</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}