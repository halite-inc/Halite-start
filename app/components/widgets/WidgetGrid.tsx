'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  SensorDescriptor,
  SensorOptions,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Widget, HoverAnimationStyle } from './types';
import ClockWidget from './ClockWidget';
import WeatherWidget, { WeatherState } from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import WaterTrackerWidget from './WaterTrackerWidget';
import QuickNotesWidget from './QuickNotesWidget';
import PhotoWidget from './PhotoWidget';
import FidgetSpinnerWidget from './FidgetSpinnerWidget';
import SpacerWidget from './SpacerWidget';
import PomodoroWidget from './PomodoroWidget';
import TopAppsWidget from './TopAppsWidget';
import AnalogClockWidget from './AnalogClockWidget';
import { App } from '../dashboard/types';

interface WidgetGridProps {
  widgets: Widget[];
  onRemoveWidget: (id: string) => void;
  isDarkMode: boolean;
  isEditModalOpen: boolean;
  backgroundImage?: string;
  glassmorphismEnabled?: boolean;
  widgetTextColor?: 'auto' | 'black' | 'white';
  animateIconsEnabled?: boolean;
  animateWidgetsEnabled?: boolean;
  hoverAnimationStyle?: HoverAnimationStyle;
  centerAppsGroup?: boolean;
  weatherState: WeatherState | null;
  weatherLoading: boolean;
  weatherError: boolean;
  apps: App[];
  appClickCounts: Record<string, number>;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
}

export default function WidgetGrid({
  widgets,
  onRemoveWidget,
  isDarkMode,
  isEditModalOpen,
  backgroundImage,
  glassmorphismEnabled = false,
  widgetTextColor = 'auto',
  animateIconsEnabled = true,
  animateWidgetsEnabled = true,
  hoverAnimationStyle = 'scale',
  centerAppsGroup = true,
  weatherState,
  weatherLoading,
  weatherError,
  apps,
  appClickCounts,
  sensors,
  onDragEnd,
}: WidgetGridProps) {
  if (widgets.length === 0) return null;

  return (
    <div className="mt-12">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={widgets.map((widget) => widget.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className={`${
              centerAppsGroup
                ? 'grid w-fit mx-auto [grid-template-columns:repeat(1,max-content)] sm:[grid-template-columns:repeat(2,max-content)] md:[grid-template-columns:repeat(3,max-content)] lg:[grid-template-columns:repeat(4,max-content)] xl:[grid-template-columns:repeat(5,max-content)] 2xl:[grid-template-columns:repeat(6,max-content)] 3xl:[grid-template-columns:repeat(7,max-content)]'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7'
            } gap-y-4 sm:gap-y-5 ${
              centerAppsGroup
                ? 'gap-x-2 sm:gap-x-3 lg:gap-x-4'
                : 'gap-x-0 sm:gap-x-1 lg:gap-x-2'
            }`}
          >
            {widgets.map((widget, index) => {
              const baseProps = {
                widget,
                isDark: isDarkMode,
                onRemove: () => onRemoveWidget(widget.id),
                isEditModalOpen,
                backgroundImage,
                glassmorphismEnabled,
                widgetTextColor,
                jiggleIndex: index,
                animateIconsEnabled,
                animateWidgetsEnabled,
                hoverAnimationStyle,
              };

              switch (widget.type) {
                case 'clock':
                  return <ClockWidget key={widget.id} {...baseProps} />;
                case 'weather':
                  return (
                    <WeatherWidget
                      key={widget.id}
                      {...baseProps}
                      sharedWeather={weatherState}
                      sharedLoading={weatherLoading}
                      sharedError={weatherError}
                    />
                  );
                case 'calendar':
                  return <CalendarWidget key={widget.id} {...baseProps} />;
                case 'water-tracker':
                  return <WaterTrackerWidget key={widget.id} {...baseProps} />;
                case 'quick-notes':
                  return <QuickNotesWidget key={widget.id} {...baseProps} />;
                case 'photo':
                  return <PhotoWidget key={widget.id} {...baseProps} />;
                case 'fidget-spinner':
                  return <FidgetSpinnerWidget key={widget.id} {...baseProps} />;
                case 'spacer':
                  return <SpacerWidget key={widget.id} {...baseProps} />;
                case 'pomodoro':
                  return <PomodoroWidget key={widget.id} {...baseProps} />;
                case 'top-apps':
                  return (
                    <TopAppsWidget
                      key={widget.id}
                      {...baseProps}
                      apps={apps}
                      appClickCounts={appClickCounts}
                    />
                  );
                case 'analog-clock':
                  return <AnalogClockWidget key={widget.id} {...baseProps} />;
                default:
                  return null;
              }
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
