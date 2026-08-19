export interface App {
  id: string;
  title: string;
  href: string;
  icon?: string;
  type?: 'default' | 'halite';
  haliteUrls?: string[];
  haliteIcons?: string[];
  haliteName?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  href: string;
  icon?: string;
}

export type HoverAnimationStyle =
  | 'scale'
  | 'tilt'
  | 'skew'
  | 'spin'
  | 'bounce'
  | 'pulse'
  | 'float'
  | 'slide'
  | 'glow';

export type DashboardGroup = 'clock' | 'apps' | 'widgets';
