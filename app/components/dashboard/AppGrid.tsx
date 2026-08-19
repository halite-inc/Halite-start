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
import { App, HoverAnimationStyle } from './types';
import { SortableLinkCard, HaliteCard } from './SortableAppCard';

interface AppGridProps {
  apps: App[];
  onRemoveApp: (id: string) => void;
  isDarkMode: boolean;
  showAppTitles: boolean;
  hideAppTitleText?: boolean;
  backgroundImage?: string;
  glassmorphismEnabled: boolean;
  appTitleColor: 'auto' | 'black' | 'white';
  isEditModalOpen: boolean;
  animateIconsEnabled: boolean;
  hoverAnimationStyle: HoverAnimationStyle;
  monochromeIcons: boolean;
  appCardBorderRadius: 'small' | 'medium' | 'full';
  removeAppCardBorders: boolean;
  appCardSize?: 'small' | 'normal' | 'large' | 'custom';
  customAppCardSize?: number;
  appCardInnerShadow?: 'none' | 'small' | 'medium' | 'large';
  appCardBackgroundColor?: string;
  appTitlePosition?: 'inside' | 'outside';
  appGroupMarginTop: number;
  centerAppsGroup?: boolean;
  boardLikeAppCards?: boolean;
  boardColumns?: number;
  appCardGapX: number;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  onContextMenu: (e: React.MouseEvent, appId: string) => void;
  onAppClick?: (appId: string) => void;
}

export default function AppGrid({
  apps,
  onRemoveApp,
  isDarkMode,
  showAppTitles,
  hideAppTitleText = false,
  backgroundImage,
  glassmorphismEnabled,
  appTitleColor,
  isEditModalOpen,
  animateIconsEnabled,
  hoverAnimationStyle,
  monochromeIcons,
  appCardBorderRadius,
  removeAppCardBorders,
  appCardSize = 'normal',
  customAppCardSize = 64,
  appCardInnerShadow = 'none',
  appCardBackgroundColor,
  appTitlePosition = 'outside',
  appGroupMarginTop,
  centerAppsGroup = true,
  boardLikeAppCards = false,
  boardColumns = 6,
  appCardGapX = 16,
  sensors,
  onDragEnd,
  onContextMenu,
  onAppClick,
}: AppGridProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={apps.map((app) => app.id)}
        strategy={rectSortingStrategy}
      >
        <div className="mb-6" style={{ marginTop: `${appGroupMarginTop}px` }}>
          <div
            className={`${
              boardLikeAppCards
                ? `grid w-fit mx-auto bg-white/30 dark:bg-black/40 backdrop-blur-3xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/40 shadow-xl dark:shadow-2xl`
                : centerAppsGroup
                ? 'grid w-fit mx-auto'
                : 'grid'
            } ${
              boardLikeAppCards
                ? ''
                : centerAppsGroup
                ? '[grid-template-columns:repeat(3,max-content)] xs:[grid-template-columns:repeat(4,max-content)] sm:[grid-template-columns:repeat(5,max-content)] md:[grid-template-columns:repeat(6,max-content)] lg:[grid-template-columns:repeat(8,max-content)] xl:[grid-template-columns:repeat(10,max-content)] 2xl:[grid-template-columns:repeat(12,max-content)] 3xl:[grid-template-columns:repeat(14,max-content)]'
                : 'grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 3xl:grid-cols-14'
            } gap-y-10 sm:gap-y-11 auto-rows-[40px] sm:auto-rows-[48px] lg:auto-rows-[60px]`}
            style={{
              columnGap: `${appCardGapX}px`,
              ...(boardLikeAppCards
                ? { gridTemplateColumns: `repeat(${boardColumns}, max-content)` }
                : {}),
            }}
          >
            {apps.map((app, index) =>
              app.type === 'halite' ? (
                <HaliteCard
                  key={app.id}
                  app={app}
                  onRemove={onRemoveApp}
                  isDark={isDarkMode}
                  showAppTitles={showAppTitles}
                  hideAppTitleText={hideAppTitleText}
                  backgroundImage={backgroundImage}
                  glassmorphismEnabled={glassmorphismEnabled}
                  appTitleColor={appTitleColor}
                  isEditModalOpen={isEditModalOpen}
                  jiggleIndex={index}
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
                  onContextMenu={onContextMenu}
                  onAppClick={onAppClick}
                />
              ) : (
                <SortableLinkCard
                  key={app.id}
                  app={app}
                  onRemove={onRemoveApp}
                  isDark={isDarkMode}
                  showAppTitles={showAppTitles}
                  hideAppTitleText={hideAppTitleText}
                  backgroundImage={backgroundImage}
                  glassmorphismEnabled={glassmorphismEnabled}
                  appTitleColor={appTitleColor}
                  isEditModalOpen={isEditModalOpen}
                  jiggleIndex={index}
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
                  onContextMenu={onContextMenu}
                  onAppClick={onAppClick}
                />
              )
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
