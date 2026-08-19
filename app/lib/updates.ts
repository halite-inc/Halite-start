export interface ChangelogItem {
  id: string;
  category: 'feature' | 'improvement' | 'fix' | 'performance';
  title: string;
  description: string;
  icon?: string;
}

export interface ReleaseInfo {
  version: string;
  releaseDate: string;
  headline: string;
  summary: string;
  highlights: ChangelogItem[];
}

export const CURRENT_VERSION = 'v5.45';

export const LATEST_RELEASE: ReleaseInfo = {
  version: CURRENT_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Halite",
  summary: 'A major refresh bringing faster load times, refined top pill controls, enhanced command palette, and sleek glassmorphism effects.',
  highlights: [
    {
      id: 'cmd-palette',
      category: 'feature',
      title: 'Command Palette (Cmd + K)',
      description: 'Quickly search apps, trigger actions, switch themes, and navigate your dashboard without lifting your fingers.',
      icon: '⚡',
    },
    {
      id: 'usage-stats',
      category: 'feature',
      title: 'Usage Statistics & Insights',
      description: 'Track your most visited websites, daily click activity, and time spent on your start dashboard.',
      icon: '📊',
    },
    {
      id: 'top-pill-customization',
      category: 'improvement',
      title: 'Top Pill Customization',
      description: 'Customize top pill shape (pill or squircle), switch between card and text-only modes, and merge center widgets.',
      icon: '🎨',
    },
    {
      id: 'idb-cache',
      category: 'performance',
      title: 'High-Res Wallpaper Caching',
      description: 'Store crystal clear custom wallpapers locally in IndexedDB without localStorage quotas or lag.',
      icon: '🖼️',
    },
    {
      id: 'glass-effects',
      category: 'improvement',
      title: 'Apple Liquid Glass & Animations',
      description: 'Upgraded frosted glass shaders, dynamic reflections, and 9 customizable hover animation styles.',
      icon: '✨',
    },
    {
      id: 'smart-favicons',
      category: 'fix',
      title: 'Smart Favicon & Metadata Detection',
      description: 'Improved high-resolution icon scraping and automatic website title detection for newly added links.',
      icon: '🔍',
    },
  ],
};
