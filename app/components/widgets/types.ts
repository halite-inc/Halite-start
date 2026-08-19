export interface Widget {
  id: string;
  type:
    | 'clock'
    | 'weather'
    | 'calendar'
    | 'analog-clock'
    | 'water-tracker'
    | 'quick-notes'
    | 'spacer'
    | 'photo'
    | 'fidget-spinner'
    | 'pomodoro'
    | 'top-apps';
  title: string;
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

export interface BaseWidgetProps {
  widget: Widget;
  isDark: boolean;
  onRemove: () => void;
  isEditModalOpen: boolean;
  backgroundImage?: string;
  glassmorphismEnabled?: boolean;
  widgetTextColor?: 'auto' | 'black' | 'white';
  jiggleIndex?: number;
  animateIconsEnabled?: boolean;
  animateWidgetsEnabled?: boolean;
  hoverAnimationStyle?: HoverAnimationStyle;
}

export function getHoverAnimationClass(
  style: HoverAnimationStyle = 'scale',
  enabled = true
): string {
  if (!enabled) return '';
  switch (style) {
    case 'scale':
      return 'transition-transform duration-200 hover:scale-105';
    case 'tilt':
      return 'transition-transform duration-200 hover:-rotate-3 hover:scale-105';
    case 'skew':
      return 'transition-transform duration-200 hover:-skew-x-6 hover:scale-105';
    case 'spin':
      return 'transition-transform duration-300 hover:rotate-6 hover:scale-105';
    case 'bounce':
      return 'transition-transform duration-200 hover:-translate-y-1 hover:scale-105';
    case 'pulse':
      return 'transition-transform duration-300 hover:scale-110';
    case 'float':
      return 'transition-all duration-300 hover:-translate-y-2 hover:shadow-xl';
    case 'slide':
      return 'transition-transform duration-200 hover:translate-x-1';
    case 'glow':
      return 'transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]';
    default:
      return 'transition-transform duration-200 hover:scale-105';
  }
}
