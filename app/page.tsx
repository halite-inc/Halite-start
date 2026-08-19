'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import CommandPalette from './components/CommandPalette';
import UsageStatistics from './components/UsageStatistics';
import UpdateNotification from './components/UpdateNotification';

import {
  App,
  Bookmark,
  HoverAnimationStyle,
  TopHeader,
  SearchBar,
  BigClock,
  AppGrid,
  BookmarksBar,
  ActionDock,
} from './components/dashboard';

import {
  Widget,
  WidgetGrid,
  WeatherState,
} from './components/widgets';

import {
  EditAppModal,
  HaliteModal,
  ContextMenu,
  QuickAddModal,
  ResetModal,
} from './components/modals';

import { getImageObjectUrl, deleteImageBlob } from './lib/idb';
import { getFaviconUrl, fetchBestFavicon } from './lib/favicon';

const defaultApps: App[] = [
  { id: 'youtube', title: 'YouTube', href: 'https://youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32' },
  { id: 'github', title: 'GitHub', href: 'https://github.com', icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32' },
  { id: 'pinterest', title: 'Pinterest', href: 'https://pinterest.com', icon: 'https://www.google.com/s2/favicons?domain=pinterest.com&sz=32' },
  { id: 'dribbble', title: 'Dribbble', href: 'https://dribbble.com', icon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=32' },
  { id: 'flipkart', title: 'Flipkart', href: 'https://flipkart.com', icon: 'https://www.google.com/s2/favicons?domain=flipkart.com&sz=32' },
  { id: 'amazon', title: 'Amazon', href: 'https://amazon.com', icon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32' },
  { id: 'booking', title: 'Booking.com', href: 'https://booking.com', icon: 'https://www.google.com/s2/favicons?domain=booking.com&sz=32' },
  { id: 'google', title: 'Google', href: 'https://google.com', icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=32' },
  { id: 'gmail', title: 'Gmail', href: 'https://gmail.com', icon: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png' },
  { id: 'twitter', title: 'Twitter', href: 'https://twitter.com', icon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=32' },
  { id: 'netfree2', title: 'NetFree2', href: 'https://netfree2.cc/home', icon: 'https://www.google.com/s2/favicons?domain=netfree2.cc&sz=32' },
];

const defaultWidgets: Widget[] = [
  { id: 'clock-1', type: 'clock', title: 'Clock Widget' },
  { id: 'weather-1', type: 'weather', title: 'Weather Widget' },
  { id: 'calendar-1', type: 'calendar', title: 'Calendar Widget' },
  { id: 'analog-clock-1', type: 'analog-clock', title: 'Analog Clock Widget' },
];

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [apps, setApps] = useState<App[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showAppTitles, setShowAppTitles] = useState(true);
  const [hideAppTitleText, setHideAppTitleText] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [searchBarWidth, setSearchBarWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');
  const [compactSearchBar, setCompactSearchBar] = useState<boolean>(false);

  const [monochromeIcons, setMonochromeIcons] = useState<boolean>(false);
  const [appCardBorderRadius, setAppCardBorderRadius] = useState<'small' | 'medium' | 'full'>('medium');
  const [removeAppCardBorders, setRemoveAppCardBorders] = useState<boolean>(false);
  const [appCardSize, setAppCardSize] = useState<'small' | 'normal' | 'large' | 'custom'>('normal');
  const [customAppCardSize, setCustomAppCardSize] = useState<number>(64);
  const [appCardGapX, setAppCardGapX] = useState<number>(16);
  const [appCardInnerShadow, setAppCardInnerShadow] = useState<'none' | 'small' | 'medium' | 'large'>('none');
  const [appCardBackgroundColor, setAppCardBackgroundColor] = useState<string>('');

  const [youtubeSearchMode, setYoutubeSearchMode] = useState<boolean>(false);
  const [haliteFolderName, setHaliteFolderName] = useState<string>('');
  const [haliteUrls, setHaliteUrls] = useState<string[]>(['', '', '', '']);
  const [isHaliteModalOpen, setIsHaliteModalOpen] = useState<boolean>(false);
  const [isQuickAppOpen, setIsQuickAppOpen] = useState<boolean>(false);

  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [backgroundBlur, setBackgroundBlur] = useState<number>(0);
  const [bgContrast, setBgContrast] = useState<number>(100);
  const [glassmorphismEnabled, setGlassmorphismEnabled] = useState<boolean>(true);
  const [appTitleColor, setAppTitleColor] = useState<'auto' | 'black' | 'white'>('auto');
  const [widgetTextColor, setWidgetTextColor] = useState<'auto' | 'black' | 'white'>('auto');
  const [normalModeEnabled, setNormalModeEnabled] = useState<boolean>(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const [animateIconsEnabled, setAnimateIconsEnabled] = useState<boolean>(false);
  const [hoverAnimationStyle, setHoverAnimationStyle] = useState<HoverAnimationStyle>('scale');
  const [animateWidgetsEnabled, setAnimateWidgetsEnabled] = useState<boolean>(false);
  const [centerAppsGroup, setCenterAppsGroup] = useState<boolean>(true);
  const [boardLikeAppCards, setBoardLikeAppCards] = useState<boolean>(false);
  const [boardColumns, setBoardColumns] = useState<number>(5);
  const [appTitlePosition, setAppTitlePosition] = useState<'inside' | 'outside'>('outside');

  const [fullRoundedIconsEnabled, setFullRoundedIconsEnabled] = useState<boolean>(false);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(true);
  const [bookmarkStyle, setBookmarkStyle] = useState<'cards' | 'chips' | 'list' | 'minimal' | 'compact' | 'modern'>('cards');
  const [showBookmarksTitle, setShowBookmarksTitle] = useState<boolean>(true);
  const [centerBookmarksGroup, setCenterBookmarksGroup] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [appGroupMarginTop, setAppGroupMarginTop] = useState<number>(180);
  const [userName, setUserName] = useState<string>('user');
  const [greetingStyle, setGreetingStyle] = useState<'hi' | 'welcome' | 'time-based'>('hi');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [appClickCounts, setAppClickCounts] = useState<Record<string, number>>({});
  const [appLastClicked, setAppLastClicked] = useState<Record<string, number>>({});
  const [dailyStatsHistory, setDailyStatsHistory] = useState<Record<string, { clicksToday: number; appClickCounts: Record<string, number> }>>({});
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [clicksToday, setClicksToday] = useState<{ date: string; count: number }>({
    date: new Date().toDateString(),
    count: 0
  });
  const [previousTimeSpent, setPreviousTimeSpent] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());

  const [showTopTime, setShowTopTime] = useState<boolean>(true);
  const [topPillSize, setTopPillSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [topPillStyle, setTopPillStyle] = useState<'card' | 'text'>('card');
  const [mergeTopPillsCenter, setMergeTopPillsCenter] = useState<boolean>(false);
  const [topPillShape, setTopPillShape] = useState<'pill' | 'squircle'>('pill');
  const [animatedGradientBackground, setAnimatedGradientBackground] = useState<boolean>(false);
  const [animatedGradientPreset, setAnimatedGradientPreset] = useState<'default' | 'ocean' | 'sunset' | 'aurora' | 'midnight'>('default');
  const [dockVisibility, setDockVisibility] = useState<'always' | 'hover'>('always');
  const [groupOrder, setGroupOrder] = useState<('clock' | 'apps' | 'widgets')[]>(['clock', 'apps', 'widgets']);

  const [showBigClock, setShowBigClock] = useState<boolean>(false);
  const [bigClockColor, setBigClockColor] = useState<string>('');
  const [bigClockFont, setBigClockFont] = useState<string>('default');
  const [bigClockSize, setBigClockSize] = useState<'small' | 'medium' | 'large' | 'huge'>('medium');
  const [bigClockGlassMode, setBigClockGlassMode] = useState<boolean>(false);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; appId: string } | null>(null);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [editAppTitle, setEditAppTitle] = useState<string>('');
  const [editAppUrl, setEditAppUrl] = useState<string>('');
  const [fontFamily, setFontFamily] = useState<'default' | 'serif' | 'mono' | 'sans' | 'elegant' | 'poppins' | 'fun'>('default');

  const [weatherState, setWeatherState] = useState<WeatherState | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch weather and reverse-geocode location on mount
  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(false);

        if (typeof window === 'undefined' || !navigator.geolocation) {
          throw new Error('Geolocation not supported');
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

        if (!locationResponse.ok) throw new Error('Failed to fetch location data');
        const locationData = await locationResponse.json();

        const mockConditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear'];
        const mockCondition = mockConditions[Math.floor(Math.random() * mockConditions.length)];

        setWeatherState({
          temp: `${Math.round(15 + Math.random() * 20)}°`,
          condition: mockCondition,
          location: locationData.city || locationData.locality || locationData.countryName || 'Unknown',
        });
        setWeatherLoading(false);
      } catch {
        setWeatherError(true);
        setWeatherState({
          temp: '22°',
          condition: 'Sunny',
          location: 'Location unavailable',
        });
        setWeatherLoading(false);
      }
    };

    fetchLocationAndWeather();
  }, []);

  // Time tracking & statistics
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const currentSessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
      const total = previousTimeSpent + currentSessionTime;
      setTotalTimeSpent(total);
      localStorage.setItem('totalTimeSpent', total.toString());
    }, 10000);

    return () => clearInterval(interval);
  }, [sessionStartTime, previousTimeSpent]);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }

      const savedShowAppTitles = localStorage.getItem('showAppTitles');
      if (savedShowAppTitles !== null) {
        setShowAppTitles(savedShowAppTitles === 'true');
      }

      const savedHideAppTitleText = localStorage.getItem('hideAppTitleText');
      if (savedHideAppTitleText !== null) {
        setHideAppTitleText(savedHideAppTitleText === 'true');
      }

      const savedShowSearchBar = localStorage.getItem('showSearchBar');
      if (savedShowSearchBar !== null) {
        setShowSearchBar(savedShowSearchBar === 'true');
      }

      const savedSearchBarWidth = localStorage.getItem('searchBarWidth');
      if (savedSearchBarWidth === 'narrow' || savedSearchBarWidth === 'medium' || savedSearchBarWidth === 'wide') {
        setSearchBarWidth(savedSearchBarWidth);
      }

      const savedCompactSearchBar = localStorage.getItem('compactSearchBar');
      if (savedCompactSearchBar !== null) {
        setCompactSearchBar(savedCompactSearchBar === 'true');
      }

      const savedBg = localStorage.getItem('backgroundImage');
      if (savedBg) {
        setBackgroundImage(savedBg);
      }

      const savedBlur = localStorage.getItem('backgroundBlur');
      if (savedBlur !== null) {
        const parsedBlur = parseInt(savedBlur, 10);
        if (!isNaN(parsedBlur)) setBackgroundBlur(parsedBlur);
      }

      const savedContrast = localStorage.getItem('bgContrast');
      if (savedContrast !== null) {
        const parsed = parseInt(savedContrast, 10);
        if (!isNaN(parsed)) setBgContrast(parsed);
      }

      const savedMonochrome = localStorage.getItem('monochromeIcons');
      if (savedMonochrome !== null) {
        setMonochromeIcons(savedMonochrome === 'true');
      }

      const savedAppTitleColor = localStorage.getItem('appTitleColor');
      if (savedAppTitleColor) {
        setAppTitleColor(savedAppTitleColor as 'auto' | 'black' | 'white');
      }

      const savedWidgetTextColor = localStorage.getItem('widgetTextColor');
      if (savedWidgetTextColor) {
        setWidgetTextColor(savedWidgetTextColor as 'auto' | 'black' | 'white');
      }

      const savedAnimate = localStorage.getItem('animateIconsEnabled');
      if (savedAnimate !== null) {
        setAnimateIconsEnabled(savedAnimate === 'true');
      }

      const savedAnimateWidgets = localStorage.getItem('animateWidgetsEnabled');
      if (savedAnimateWidgets !== null) {
        setAnimateWidgetsEnabled(savedAnimateWidgets === 'true');
      }

      const savedHover = localStorage.getItem('hoverAnimationStyle');
      if (savedHover && ['scale', 'tilt', 'skew', 'spin', 'bounce', 'pulse', 'float', 'slide', 'glow'].includes(savedHover)) {
        setHoverAnimationStyle(savedHover as HoverAnimationStyle);
      }

      const savedAppMargin = localStorage.getItem('appGroupMarginTop');
      if (savedAppMargin !== null) {
        const parsed = parseInt(savedAppMargin, 10);
        if (!isNaN(parsed)) setAppGroupMarginTop(parsed);
      }

      const savedUserName = localStorage.getItem('userName');
      if (savedUserName) {
        setUserName(savedUserName);
      }

      const savedNormal = localStorage.getItem('normalModeEnabled');
      const savedGlass = localStorage.getItem('glassmorphismEnabled');
      if (savedNormal === 'true') {
        setNormalModeEnabled(true);
        setGlassmorphismEnabled(false);
      } else if (savedGlass === 'true') {
        setNormalModeEnabled(false);
        setGlassmorphismEnabled(true);
      } else {
        setNormalModeEnabled(false);
        setGlassmorphismEnabled(true);
      }

      const savedFullRounded = localStorage.getItem('fullRoundedIconsEnabled');
      const savedAppCardBorderRadius = localStorage.getItem('appCardBorderRadius');
      if (savedFullRounded === 'true') {
        setAppCardBorderRadius('full');
      } else if (savedAppCardBorderRadius && ['small', 'medium', 'full'].includes(savedAppCardBorderRadius)) {
        setAppCardBorderRadius(savedAppCardBorderRadius as 'small' | 'medium' | 'full');
      }

      const savedRemoveBorders = localStorage.getItem('removeAppCardBorders');
      if (savedRemoveBorders !== null) {
        setRemoveAppCardBorders(savedRemoveBorders === 'true');
      }

      const savedAppCardSize = localStorage.getItem('appCardSize');
      if (savedAppCardSize && ['small', 'normal', 'large', 'custom'].includes(savedAppCardSize)) {
        setAppCardSize(savedAppCardSize as 'small' | 'normal' | 'large' | 'custom');
      }

      const savedCustomAppCardSize = localStorage.getItem('customAppCardSize');
      if (savedCustomAppCardSize) {
        const parsed = parseInt(savedCustomAppCardSize, 10);
        if (!isNaN(parsed) && parsed >= 32 && parsed <= 150) setCustomAppCardSize(parsed);
      }

      const savedAppCardGapX = localStorage.getItem('appCardGapX');
      if (savedAppCardGapX) {
        const parsed = parseInt(savedAppCardGapX, 10);
        if (!isNaN(parsed)) setAppCardGapX(parsed);
      }

      const savedInnerShadow = localStorage.getItem('appCardInnerShadow');
      if (savedInnerShadow && ['none', 'small', 'medium', 'large'].includes(savedInnerShadow)) {
        setAppCardInnerShadow(savedInnerShadow as 'none' | 'small' | 'medium' | 'large');
      }

      const savedGreetingStyle = localStorage.getItem('greetingStyle');
      if (savedGreetingStyle && ['hi', 'welcome', 'time-based'].includes(savedGreetingStyle)) {
        setGreetingStyle(savedGreetingStyle as 'hi' | 'welcome' | 'time-based');
      }

      const savedFontFamily = localStorage.getItem('fontFamily');
      if (savedFontFamily && ['default', 'serif', 'mono', 'sans', 'elegant', 'poppins', 'fun'].includes(savedFontFamily)) {
        setFontFamily(savedFontFamily as any);
      }

      const savedTopPillSize = localStorage.getItem('topPillSize');
      if (savedTopPillSize && ['small', 'medium', 'large'].includes(savedTopPillSize)) {
        setTopPillSize(savedTopPillSize as 'small' | 'medium' | 'large');
      }

      const savedTopPillStyle = localStorage.getItem('topPillStyle');
      if (savedTopPillStyle && ['card', 'text'].includes(savedTopPillStyle)) {
        setTopPillStyle(savedTopPillStyle as 'card' | 'text');
      }

      const savedMergePills = localStorage.getItem('mergeTopPillsCenter');
      if (savedMergePills !== null) {
        setMergeTopPillsCenter(savedMergePills === 'true');
      }

      const savedTopPillShape = localStorage.getItem('topPillShape');
      if (savedTopPillShape && ['pill', 'squircle'].includes(savedTopPillShape)) {
        setTopPillShape(savedTopPillShape as 'pill' | 'squircle');
      }

      const savedAnimatedBg = localStorage.getItem('animatedGradientBackground');
      if (savedAnimatedBg !== null) {
        setAnimatedGradientBackground(savedAnimatedBg === 'true');
      }

      const savedPreset = localStorage.getItem('animatedGradientPreset');
      if (savedPreset && ['default', 'ocean', 'sunset', 'aurora', 'midnight'].includes(savedPreset)) {
        setAnimatedGradientPreset(savedPreset as any);
      }

      const savedDockVis = localStorage.getItem('dockVisibility');
      if (savedDockVis && ['always', 'hover'].includes(savedDockVis)) {
        setDockVisibility(savedDockVis as any);
      }

      const savedGroupOrder = localStorage.getItem('groupOrder');
      if (savedGroupOrder) {
        try {
          const parsed = JSON.parse(savedGroupOrder);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setGroupOrder(parsed);
          }
        } catch {}
      }

      const savedShowBigClock = localStorage.getItem('showBigClock');
      if (savedShowBigClock !== null) {
        setShowBigClock(savedShowBigClock === 'true');
      }

      const savedBigClockColor = localStorage.getItem('bigClockColor');
      if (savedBigClockColor !== null) setBigClockColor(savedBigClockColor);

      const savedBigClockFont = localStorage.getItem('bigClockFont');
      if (savedBigClockFont) setBigClockFont(savedBigClockFont);

      const savedBigClockSize = localStorage.getItem('bigClockSize');
      if (savedBigClockSize && ['small', 'medium', 'large', 'huge'].includes(savedBigClockSize)) {
        setBigClockSize(savedBigClockSize as any);
      }

      const savedBigClockGlass = localStorage.getItem('bigClockGlassMode');
      if (savedBigClockGlass !== null) setBigClockGlassMode(savedBigClockGlass === 'true');

      const savedShowBookmarks = localStorage.getItem('showBookmarks');
      if (savedShowBookmarks !== null) setShowBookmarks(savedShowBookmarks === 'true');

      const savedBookmarkStyle = localStorage.getItem('bookmarkStyle');
      if (savedBookmarkStyle && ['cards', 'chips', 'list', 'minimal', 'compact', 'modern'].includes(savedBookmarkStyle)) {
        setBookmarkStyle(savedBookmarkStyle as any);
      }

      const savedShowBookmarksTitle = localStorage.getItem('showBookmarksTitle');
      if (savedShowBookmarksTitle !== null) setShowBookmarksTitle(savedShowBookmarksTitle === 'true');

      const savedCenterBookmarks = localStorage.getItem('centerBookmarksGroup');
      if (savedCenterBookmarks !== null) setCenterBookmarksGroup(savedCenterBookmarks === 'true');

      const savedCenterApps = localStorage.getItem('centerAppsGroup');
      if (savedCenterApps !== null) setCenterAppsGroup(savedCenterApps === 'true');

      const savedBoardLike = localStorage.getItem('boardLikeAppCards');
      if (savedBoardLike !== null) setBoardLikeAppCards(savedBoardLike === 'true');

      const savedBoardColumns = localStorage.getItem('boardColumns');
      if (savedBoardColumns) {
        const parsed = parseInt(savedBoardColumns, 10);
        if (!isNaN(parsed)) setBoardColumns(parsed);
      }

      const savedTitlePos = localStorage.getItem('appTitlePosition');
      if (savedTitlePos && ['inside', 'outside'].includes(savedTitlePos)) {
        setAppTitlePosition(savedTitlePos as any);
      }

      const savedApps = localStorage.getItem('favoriteApps');
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        if (Array.isArray(parsed) && parsed.length > 0) setApps(parsed);
        else setApps(defaultApps);
      } else {
        setApps(defaultApps);
      }

      const savedWidgets = localStorage.getItem('widgets');
      if (savedWidgets) {
        const parsed = JSON.parse(savedWidgets);
        if (Array.isArray(parsed) && parsed.length > 0) setWidgets(parsed);
        else setWidgets(defaultWidgets);
      } else {
        setWidgets(defaultWidgets);
      }

      const savedBookmarks = localStorage.getItem('bookmarks');
      if (savedBookmarks) {
        const parsed = JSON.parse(savedBookmarks);
        if (Array.isArray(parsed)) setBookmarks(parsed);
      }

      const savedAppClicks = localStorage.getItem('appClickCounts');
      if (savedAppClicks) {
        setAppClickCounts(JSON.parse(savedAppClicks));
      }

      const savedTimeSpent = localStorage.getItem('totalTimeSpent');
      if (savedTimeSpent) {
        const parsed = parseInt(savedTimeSpent, 10);
        if (!isNaN(parsed)) {
          setPreviousTimeSpent(parsed);
          setTotalTimeSpent(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
      setApps(defaultApps);
      setWidgets(defaultWidgets);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage on change
  useEffect(() => {
    if (isLoading || isResetting || typeof window === 'undefined') return;

    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      localStorage.setItem('showAppTitles', showAppTitles.toString());
      localStorage.setItem('hideAppTitleText', hideAppTitleText.toString());
      localStorage.setItem('showSearchBar', showSearchBar.toString());
      localStorage.setItem('searchBarWidth', searchBarWidth);
      localStorage.setItem('compactSearchBar', compactSearchBar.toString());
      localStorage.setItem('backgroundImage', backgroundImage);
      localStorage.setItem('backgroundBlur', backgroundBlur.toString());
      localStorage.setItem('bgContrast', bgContrast.toString());
      localStorage.setItem('monochromeIcons', monochromeIcons.toString());
      localStorage.setItem('appTitleColor', appTitleColor);
      localStorage.setItem('widgetTextColor', widgetTextColor);
      localStorage.setItem('normalModeEnabled', normalModeEnabled.toString());
      localStorage.setItem('glassmorphismEnabled', glassmorphismEnabled.toString());
      localStorage.setItem('animateIconsEnabled', animateIconsEnabled.toString());
      localStorage.setItem('animateWidgetsEnabled', animateWidgetsEnabled.toString());
      localStorage.setItem('hoverAnimationStyle', hoverAnimationStyle);
      localStorage.setItem('appGroupMarginTop', appGroupMarginTop.toString());
      localStorage.setItem('userName', userName);
      localStorage.setItem('appCardBorderRadius', appCardBorderRadius);
      localStorage.setItem('removeAppCardBorders', removeAppCardBorders.toString());
      localStorage.setItem('appCardSize', appCardSize);
      localStorage.setItem('customAppCardSize', customAppCardSize.toString());
      localStorage.setItem('appCardGapX', appCardGapX.toString());
      localStorage.setItem('appCardInnerShadow', appCardInnerShadow);
      localStorage.setItem('greetingStyle', greetingStyle);
      localStorage.setItem('fontFamily', fontFamily);
      localStorage.setItem('topPillSize', topPillSize);
      localStorage.setItem('topPillStyle', topPillStyle);
      localStorage.setItem('mergeTopPillsCenter', mergeTopPillsCenter.toString());
      localStorage.setItem('topPillShape', topPillShape);
      localStorage.setItem('animatedGradientBackground', animatedGradientBackground.toString());
      localStorage.setItem('animatedGradientPreset', animatedGradientPreset);
      localStorage.setItem('dockVisibility', dockVisibility);
      localStorage.setItem('groupOrder', JSON.stringify(groupOrder));
      localStorage.setItem('showBigClock', showBigClock.toString());
      localStorage.setItem('bigClockColor', bigClockColor);
      localStorage.setItem('bigClockFont', bigClockFont);
      localStorage.setItem('bigClockSize', bigClockSize);
      localStorage.setItem('bigClockGlassMode', bigClockGlassMode.toString());
      localStorage.setItem('showBookmarks', showBookmarks.toString());
      localStorage.setItem('bookmarkStyle', bookmarkStyle);
      localStorage.setItem('showBookmarksTitle', showBookmarksTitle.toString());
      localStorage.setItem('centerBookmarksGroup', centerBookmarksGroup.toString());
      localStorage.setItem('centerAppsGroup', centerAppsGroup.toString());
      localStorage.setItem('boardLikeAppCards', boardLikeAppCards.toString());
      localStorage.setItem('boardColumns', boardColumns.toString());
      localStorage.setItem('appTitlePosition', appTitlePosition);
      localStorage.setItem('favoriteApps', JSON.stringify(apps));
      localStorage.setItem('widgets', JSON.stringify(widgets));
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }, [
    isDarkMode,
    showAppTitles,
    hideAppTitleText,
    showSearchBar,
    searchBarWidth,
    compactSearchBar,
    backgroundImage,
    backgroundBlur,
    bgContrast,
    monochromeIcons,
    appTitleColor,
    widgetTextColor,
    normalModeEnabled,
    glassmorphismEnabled,
    animateIconsEnabled,
    animateWidgetsEnabled,
    hoverAnimationStyle,
    appGroupMarginTop,
    userName,
    appCardBorderRadius,
    removeAppCardBorders,
    appCardSize,
    customAppCardSize,
    appCardGapX,
    appCardInnerShadow,
    greetingStyle,
    fontFamily,
    topPillSize,
    topPillStyle,
    mergeTopPillsCenter,
    topPillShape,
    animatedGradientBackground,
    animatedGradientPreset,
    dockVisibility,
    groupOrder,
    showBigClock,
    bigClockColor,
    bigClockFont,
    bigClockSize,
    bigClockGlassMode,
    showBookmarks,
    bookmarkStyle,
    showBookmarksTitle,
    centerBookmarksGroup,
    centerAppsGroup,
    boardLikeAppCards,
    boardColumns,
    appTitlePosition,
    apps,
    widgets,
    bookmarks,
    isLoading,
    isResetting,
  ]);

  // Apply dark mode class to documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Handle global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        setYoutubeSearchMode((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setContextMenu(null);
        setEditingApp(null);
        setIsHaliteModalOpen(false);
        setIsQuickAppOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const activeApp = apps.find((app) => app.id === active.id);
      const overApp = apps.find((app) => app.id === over?.id);
      if (activeApp && overApp) {
        setApps((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }

      const activeWidget = widgets.find((w) => w.id === active.id);
      const overWidget = widgets.find((w) => w.id === over?.id);
      if (activeWidget && overWidget) {
        setWidgets((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const trackAppClick = (appId: string) => {
    setAppClickCounts((prev) => ({
      ...prev,
      [appId]: (prev[appId] || 0) + 1,
    }));
    setAppLastClicked((prev) => ({
      ...prev,
      [appId]: Date.now(),
    }));
    const todayStr = new Date().toDateString();
    setDailyStatsHistory((prevHistory) => {
      const todayStats = prevHistory[todayStr] || { clicksToday: 0, appClickCounts: {} };
      return {
        ...prevHistory,
        [todayStr]: {
          clicksToday: todayStats.clicksToday + 1,
          appClickCounts: {
            ...todayStats.appClickCounts,
            [appId]: (todayStats.appClickCounts[appId] || 0) + 1,
          },
        },
      };
    });
    setClicksToday((prev) => ({
      date: todayStr,
      count: prev.date === todayStr ? prev.count + 1 : 1,
    }));
  };

  const resetStatistics = () => {
    if (confirm('Are you sure you want to reset all usage statistics?')) {
      setAppClickCounts({});
      setAppLastClicked({});
      setTotalTimeSpent(0);
      setClicksToday({ date: new Date().toDateString(), count: 0 });
      setDailyStatsHistory({});
      localStorage.removeItem('appClickCounts');
      localStorage.removeItem('appLastClicked');
      localStorage.removeItem('totalTimeSpent');
      localStorage.removeItem('clicksToday');
      localStorage.removeItem('dailyStatsHistory');
    }
  };

  const resetSettingsSilently = () => {
    setIsResetting(true);
    localStorage.clear();
    setIsDarkMode(false);
    setAnimatedGradientBackground(false);
    setShowAppTitles(true);
    setShowSearchBar(false);
    setBackgroundImage('');
    setBackgroundBlur(0);
    setGlassmorphismEnabled(true);
    setNormalModeEnabled(false);
    setAppTitleColor('auto');
    setWidgetTextColor('auto');
    setAnimateIconsEnabled(false);
    setAnimateWidgetsEnabled(false);
    setHoverAnimationStyle('scale');
    setAppGroupMarginTop(180);
    setAppCardGapX(16);
    setUserName('user');
    setShowTopTime(false);
    setApps(defaultApps);
    setWidgets(defaultWidgets);
    setGroupOrder(['clock', 'apps', 'widgets']);
    setIsResetting(false);
  };

  const addApp = async (app: App) => {
    const initialIcon = app.icon || getFaviconUrl(app.href);
    const appWithIcon = { ...app, icon: initialIcon };
    setApps((prevApps) => [...prevApps, appWithIcon]);

    if (!app.icon) {
      try {
        const bestIcon = await fetchBestFavicon(app.href);
        setApps((prevApps) =>
          prevApps.map((item) => (item.id === appWithIcon.id ? { ...item, icon: bestIcon } : item))
        );
      } catch {}
    }
  };

  const addWidget = (type: Widget['type']) => {
    const widget: Widget = {
      id: Date.now().toString(),
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
    };
    setWidgets((prev) => [...prev, widget]);
  };

  const handleSearchSubmit = (query: string) => {
    const term = query.trim();
    if (!term) return;
    if (youtubeSearchMode || term.startsWith('yt:') || term.startsWith('!yt')) {
      const clean = term.replace(/^(yt:|!yt\s*)/i, '').trim();
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(clean)}`, '_blank');
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, '_blank');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, appId });
  };

  const handleOpenInNewTab = () => {
    if (!contextMenu) return;
    const app = apps.find((a) => a.id === contextMenu.appId);
    if (app) {
      if (app.type === 'halite' && app.haliteUrls && app.haliteUrls.length > 0) {
        app.haliteUrls.forEach((url) => window.open(url, '_blank', 'noopener,noreferrer'));
      } else {
        window.open(app.href, '_blank', 'noopener,noreferrer');
      }
    }
    setContextMenu(null);
  };

  const startEditingApp = (appId: string) => {
    const app = apps.find((a) => a.id === appId);
    if (app) {
      setEditingApp(app);
      setEditAppTitle(app.title);
      setEditAppUrl(app.href);
    }
    setContextMenu(null);
  };

  const saveEditedApp = () => {
    if (!editingApp || !editAppTitle.trim() || !editAppUrl.trim()) return;
    const raw = editAppUrl.trim();
    const href = raw.startsWith('http') ? raw : `https://${raw}`;
    const icon = getFaviconUrl(href);
    setApps((prev) =>
      prev.map((app) =>
        app.id === editingApp.id
          ? { ...app, title: editAppTitle.trim(), href, icon }
          : app
      )
    );
    setEditingApp(null);
  };

  const addHaliteFolder = () => {
    const validUrls = haliteUrls.filter((url) => url.trim() !== '');
    if (validUrls.length < 2 || validUrls.length > 4) return;

    const normalizedUrls = validUrls.map((url) =>
      url.startsWith('http') ? url : `https://${url}`
    );
    const icons = normalizedUrls.map((url) => getFaviconUrl(url));

    const newFolder: App = {
      id: Date.now().toString(),
      title: haliteFolderName.trim() || 'Folder',
      href: '#',
      type: 'halite',
      haliteUrls: normalizedUrls,
      haliteIcons: icons,
      haliteName: haliteFolderName.trim() || 'Folder',
    };

    setApps((prev) => [...prev, newFolder]);
    setIsHaliteModalOpen(false);
    setHaliteUrls(['', '', '', '']);
    setHaliteFolderName('');
  };

  if (!mounted) {
    return (
      <main className="min-h-screen px-4 py-8 bg-white dark:bg-black">
        <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mt-24 px-1 sm:px-2 lg:px-3 text-center text-gray-500">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-4 py-8 relative transition-colors duration-300 ${
        isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
      } ${
        fontFamily === 'serif'
          ? 'font-serif'
          : fontFamily === 'mono'
          ? 'font-mono'
          : fontFamily === 'sans'
          ? 'font-sans'
          : ''
      }`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      onClick={() => {
        if (contextMenu) setContextMenu(null);
      }}
    >
      {/* Background overlay with blur and contrast */}
      {backgroundImage && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backdropFilter: `blur(${backgroundBlur}px) contrast(${bgContrast}%)`,
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
          }}
        />
      )}

      {/* Top Header Pills & Weather / Greeting Dropdowns */}
      <TopHeader
        userName={userName}
        onSaveUserName={(name) => setUserName(name)}
        greetingStyle={greetingStyle}
        showTopTime={showTopTime}
        topPillSize={topPillSize}
        topPillStyle={topPillStyle}
        mergeTopPillsCenter={mergeTopPillsCenter}
        topPillShape={topPillShape}
        isDarkMode={isDarkMode}
        backgroundImage={backgroundImage}
        glassmorphismEnabled={glassmorphismEnabled}
        weatherState={weatherState}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        onOpenSettings={() => setIsSidebarOpen(true)}
        onOpenStatistics={() => setIsStatisticsOpen(true)}
      />      {/* Main Dashboard Content */}
      <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mt-24 px-1 sm:px-2 lg:px-3 relative z-10">
        {/* Ordered Dashboard Groups */}
        {groupOrder.map((group) => {
          if (group === 'clock') {
            return (
              <BigClock
                key="group-clock"
                showBigClock={showBigClock}
                bigClockColor={bigClockColor}
                bigClockFont={bigClockFont}
                bigClockSize={bigClockSize}
                bigClockGlassMode={bigClockGlassMode}
                isDarkMode={isDarkMode}
                backgroundImage={backgroundImage}
              />
            );
          }

          if (group === 'apps') {
            return (
              <AppGrid
                key="group-apps"
                apps={apps}
                onRemoveApp={(id) => setApps((prev) => prev.filter((a) => a.id !== id))}
                isDarkMode={isDarkMode}
                showAppTitles={showAppTitles}
                hideAppTitleText={hideAppTitleText}
                backgroundImage={backgroundImage}
                glassmorphismEnabled={glassmorphismEnabled}
                appTitleColor={appTitleColor}
                isEditModalOpen={isEditModalOpen}
                animateIconsEnabled={animateIconsEnabled}
                hoverAnimationStyle={hoverAnimationStyle}
                monochromeIcons={monochromeIcons}
                appCardBorderRadius={appCardBorderRadius}
                removeAppCardBorders={removeAppCardBorders}
                appCardSize={appCardSize}
                customAppCardSize={customAppCardSize}
                appCardInnerShadow={appCardInnerShadow}
                appCardBackgroundColor={appCardBackgroundColor}
                appTitlePosition={appTitlePosition}
                appGroupMarginTop={appGroupMarginTop}
                centerAppsGroup={centerAppsGroup}
                boardLikeAppCards={boardLikeAppCards}
                boardColumns={boardColumns}
                appCardGapX={appCardGapX}
                sensors={sensors}
                onDragEnd={handleDragEnd}
                onContextMenu={handleContextMenu}
                onAppClick={trackAppClick}
              />
            );
          }

          if (group === 'widgets') {
            return (
              <WidgetGrid
                key="group-widgets"
                widgets={widgets}
                onRemoveWidget={(id) => setWidgets((prev) => prev.filter((w) => w.id !== id))}
                isDarkMode={isDarkMode}
                isEditModalOpen={isEditModalOpen}
                backgroundImage={backgroundImage}
                glassmorphismEnabled={glassmorphismEnabled}
                widgetTextColor={widgetTextColor}
                animateIconsEnabled={animateIconsEnabled}
                animateWidgetsEnabled={animateWidgetsEnabled}
                hoverAnimationStyle={hoverAnimationStyle}
                centerAppsGroup={centerAppsGroup}
                weatherState={weatherState}
                weatherLoading={weatherLoading}
                weatherError={weatherError}
                apps={apps}
                appClickCounts={appClickCounts}
                sensors={sensors}
                onDragEnd={handleDragEnd}
              />
            );
          }

          return null;
        })}

        {/* Search Bar */}
        <SearchBar
          showSearchBar={showSearchBar}
          compactSearchBar={compactSearchBar}
          searchBarWidth={searchBarWidth}
          glassmorphismEnabled={glassmorphismEnabled}
          isDarkMode={isDarkMode}
          onSearch={handleSearchSubmit}
        />

        {/* Bookmarks Section */}
        <BookmarksBar
          showBookmarks={showBookmarks}
          bookmarks={bookmarks}
          onSetBookmarks={setBookmarks}
          showBookmarksTitle={showBookmarksTitle}
          centerBookmarksGroup={centerBookmarksGroup}
          bookmarkStyle={bookmarkStyle}
          isDarkMode={isDarkMode}
          isEditModalOpen={isEditModalOpen}
          glassmorphismEnabled={glassmorphismEnabled}
        />
      </div>

      {/* Floating Action Dock */}
      <ActionDock
        dockVisibility={dockVisibility}
        topPillSize={topPillSize}
        glassmorphismEnabled={glassmorphismEnabled}
        isDarkMode={isDarkMode}
        isEditModalOpen={isEditModalOpen}
        onToggleEditMode={() => setIsEditModalOpen((prev) => !prev)}
        onQuickAddApp={() => setIsQuickAppOpen(true)}
        onOpenHaliteModal={() => {
          setHaliteUrls(['', '', '', '']);
          setHaliteFolderName('');
          setIsHaliteModalOpen(true);
        }}
        onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
        onOpenSettings={() => setIsSidebarOpen(true)}
      />

      {/* Left Settings Sidebar */}
      <LeftSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        apps={apps}
        onAddApp={addApp}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        showAppTitles={showAppTitles}
        hideAppTitleText={hideAppTitleText}
        showSearchBar={showSearchBar}
        onToggleShowAppTitles={() => setShowAppTitles((prev) => !prev)}
        onToggleHideAppTitleText={() => setHideAppTitleText((prev) => !prev)}
        onToggleSearchBar={() => setShowSearchBar((prev) => !prev)}
        searchBarWidth={searchBarWidth}
        onSetSearchBarWidth={setSearchBarWidth}
        compactSearchBar={compactSearchBar}
        onToggleCompactSearchBar={() => setCompactSearchBar((prev) => !prev)}
        backgroundImage={backgroundImage}
        onSetBackgroundImage={setBackgroundImage}
        backgroundBlur={backgroundBlur}
        onSetBackgroundBlur={setBackgroundBlur}
        bgContrast={bgContrast}
        onSetBgContrast={setBgContrast}
        normalModeEnabled={normalModeEnabled}
        glassmorphismEnabled={glassmorphismEnabled}
        onToggleNormalMode={() => {
          setNormalModeEnabled(true);
          setGlassmorphismEnabled(false);
        }}
        onToggleGlassmorphism={() => {
          setGlassmorphismEnabled(true);
          setNormalModeEnabled(false);
        }}
        appTitleColor={appTitleColor}
        onSetAppTitleColor={setAppTitleColor}
        widgetTextColor={widgetTextColor}
        onSetWidgetTextColor={setWidgetTextColor}
        onResetSettings={resetSettingsSilently}
        animateIconsEnabled={animateIconsEnabled}
        onToggleAnimateIcons={() => setAnimateIconsEnabled((prev) => !prev)}
        hoverAnimationStyle={hoverAnimationStyle}
        onSetHoverAnimationStyle={setHoverAnimationStyle}
        animateWidgetsEnabled={animateWidgetsEnabled}
        onToggleAnimateWidgets={() => setAnimateWidgetsEnabled((prev) => !prev)}
        appGroupMarginTop={appGroupMarginTop}
        onSetAppGroupMarginTop={setAppGroupMarginTop}
        appCardBorderRadius={appCardBorderRadius}
        onSetAppCardBorderRadius={setAppCardBorderRadius}
        removeAppCardBorders={removeAppCardBorders}
        onToggleRemoveAppCardBorders={() => setRemoveAppCardBorders((prev) => !prev)}
        appCardSize={appCardSize}
        onSetAppCardSize={setAppCardSize}
        customAppCardSize={customAppCardSize}
        onSetCustomAppCardSize={setCustomAppCardSize}
        appCardGapX={appCardGapX}
        onSetAppCardGapX={setAppCardGapX}
        appCardInnerShadow={appCardInnerShadow}
        onSetAppCardInnerShadow={setAppCardInnerShadow}
        appCardBackgroundColor={appCardBackgroundColor}
        onSetAppCardBackgroundColor={setAppCardBackgroundColor}
        greetingStyle={greetingStyle}
        onSetGreetingStyle={setGreetingStyle}
        fontFamily={fontFamily}
        onSetFontFamily={setFontFamily}
        showTopTime={showTopTime}
        onToggleTopTime={() => setShowTopTime((prev) => !prev)}
        topPillSize={topPillSize}
        onSetTopPillSize={setTopPillSize}
        topPillStyle={topPillStyle}
        onSetTopPillStyle={setTopPillStyle}
        mergeTopPillsCenter={mergeTopPillsCenter}
        onToggleMergeTopPillsCenter={() => setMergeTopPillsCenter((prev) => !prev)}
        topPillShape={topPillShape}
        onSetTopPillShape={setTopPillShape}
        animatedGradientBackground={animatedGradientBackground}
        onToggleAnimatedGradientBackground={() => setAnimatedGradientBackground((prev) => !prev)}
        animatedGradientPreset={animatedGradientPreset}
        onSetAnimatedGradientPreset={setAnimatedGradientPreset}
        dockVisibility={dockVisibility}
        onSetDockVisibility={setDockVisibility}
        groupOrder={groupOrder}
        onSetGroupOrder={setGroupOrder}
        showBigClock={showBigClock}
        onToggleBigClock={() => setShowBigClock((prev) => !prev)}
        bigClockColor={bigClockColor}
        onSetBigClockColor={setBigClockColor}
        bigClockFont={bigClockFont}
        onSetBigClockFont={setBigClockFont}
        bigClockSize={bigClockSize}
        onSetBigClockSize={setBigClockSize}
        bigClockGlassMode={bigClockGlassMode}
        onToggleBigClockGlassMode={() => setBigClockGlassMode((prev) => !prev)}
        showBookmarks={showBookmarks}
        onToggleBookmarks={() => setShowBookmarks((prev) => !prev)}
        bookmarkStyle={bookmarkStyle}
        onSetBookmarkStyle={setBookmarkStyle}
        showBookmarksTitle={showBookmarksTitle}
        onToggleBookmarksTitle={() => setShowBookmarksTitle((prev) => !prev)}
        centerBookmarksGroup={centerBookmarksGroup}
        onToggleCenterBookmarksGroup={() => setCenterBookmarksGroup((prev) => !prev)}
        centerAppsGroup={centerAppsGroup}
        onToggleCenterAppsGroup={() => setCenterAppsGroup((prev) => !prev)}
        boardLikeAppCards={boardLikeAppCards}
        onToggleBoardLikeAppCards={() => setBoardLikeAppCards((prev) => !prev)}
        boardColumns={boardColumns}
        onSetBoardColumns={setBoardColumns}
        appTitlePosition={appTitlePosition}
        onSetAppTitlePosition={setAppTitlePosition}
        monochromeIcons={monochromeIcons}
        onToggleMonochromeIcons={() => setMonochromeIcons((prev) => !prev)}
        addWidget={addWidget}
        onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
      />

      {/* Right Bookmarks Sidebar */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
        onAddBookmarkClick={() => {
          setIsRightSidebarOpen(false);
          setShowBookmarks(true);
        }}
        isDarkMode={isDarkMode}
        glassmorphismEnabled={glassmorphismEnabled}
      />

      {/* Modals */}
      <EditAppModal
        app={editingApp}
        title={editAppTitle}
        url={editAppUrl}
        isDarkMode={isDarkMode}
        onTitleChange={setEditAppTitle}
        onUrlChange={setEditAppUrl}
        onSave={saveEditedApp}
        onCancel={() => setEditingApp(null)}
      />

      <HaliteModal
        isOpen={isHaliteModalOpen}
        folderName={haliteFolderName}
        urls={haliteUrls}
        isDarkMode={isDarkMode}
        glassmorphismEnabled={glassmorphismEnabled}
        onFolderNameChange={setHaliteFolderName}
        onUrlChange={(index, url) => {
          const newUrls = [...haliteUrls];
          newUrls[index] = url;
          setHaliteUrls(newUrls);
        }}
        onAddFolder={addHaliteFolder}
        onClose={() => setIsHaliteModalOpen(false)}
      />

      <QuickAddModal
        isOpen={isQuickAppOpen}
        apps={apps}
        isDarkMode={isDarkMode}
        glassmorphismEnabled={glassmorphismEnabled}
        onAddApp={addApp}
        onClose={() => setIsQuickAppOpen(false)}
      />

      <ResetModal
        isOpen={showResetModal}
        isDarkMode={isDarkMode}
        onConfirm={resetSettingsSilently}
        onClose={() => setShowResetModal(false)}
      />

      <ContextMenu
        contextMenu={contextMenu}
        isDarkMode={isDarkMode}
        glassmorphismEnabled={glassmorphismEnabled}
        onOpenInNewTab={handleOpenInNewTab}
        onStartEditing={startEditingApp}
        onClose={() => setContextMenu(null)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        apps={apps}
        isDarkMode={isDarkMode}
        glassmorphismEnabled={glassmorphismEnabled}
        onOpenApp={(app) => {
          if (typeof window !== 'undefined') {
            window.open(app.href, '_blank');
          }
        }}
        onOpenSettings={() => setIsSidebarOpen(true)}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        onOpenStatistics={() => setIsStatisticsOpen(true)}
        onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
      />

      {/* Usage Statistics */}
      <UsageStatistics
        isOpen={isStatisticsOpen}
        onClose={() => setIsStatisticsOpen(false)}
        apps={apps}
        appClickCounts={appClickCounts}
        appLastClicked={appLastClicked}
        totalTimeSpent={totalTimeSpent}
        clicksToday={clicksToday.count}
        isDarkMode={isDarkMode}
        onResetStatistics={resetStatistics}
        dailyStatsHistory={dailyStatsHistory}
      />

      {/* Top Center Update Notification & Release Notes Popover */}
      <UpdateNotification
        isDarkMode={isDarkMode}
        glassmorphismEnabled={glassmorphismEnabled}
        mergeTopPillsCenter={mergeTopPillsCenter}
        forcedOpen={isWhatsNewOpen}
        onForcedClose={() => setIsWhatsNewOpen(false)}
      />
    </main>
  );
}