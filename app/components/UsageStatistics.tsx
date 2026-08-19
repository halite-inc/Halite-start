import { useMemo, useState } from 'react';

interface App {
  id: string;
  title: string;
  href: string;
  icon?: string;
  type?: 'default' | 'halite';
}

interface UsageStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
  apps: App[];
  appClickCounts: Record<string, number>;
  appLastClicked: Record<string, number>;
  totalTimeSpent: number;
  clicksToday?: number;
  isDarkMode: boolean;
  glassmorphismEnabled?: boolean;
  onResetStatistics?: () => void;
  dailyStatsHistory?: Record<string, { clicksToday: number, appClickCounts: Record<string, number> }>;
}

export default function UsageStatistics({
  isOpen,
  onClose,
  apps,
  appClickCounts,
  appLastClicked,
  totalTimeSpent,
  clicksToday = 0,
  isDarkMode,
  glassmorphismEnabled = false,
  onResetStatistics,
  dailyStatsHistory = {},
}: UsageStatisticsProps) {
  const [dateOffset, setDateOffset] = useState(0);

  const selectedDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d.toDateString();
  }, [dateOffset]);

  const isToday = dateOffset === 0;

  const currentClicksToday = isToday ? clicksToday : (dailyStatsHistory[selectedDateStr]?.clicksToday || 0);
  const currentAppClickCounts = isToday ? appClickCounts : (dailyStatsHistory[selectedDateStr]?.appClickCounts || {});

  // Get most clicked apps
  const mostClickedApps = useMemo(() => {
    const appsWithClicks = apps
      .map(app => ({
        ...app,
        clicks: currentAppClickCounts[app.id] || 0,
        lastClicked: appLastClicked[app.id] || 0,
      }))
      .filter(app => app.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return appsWithClicks;
  }, [apps, currentAppClickCounts, appLastClicked]);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Calculate total clicks
  const totalClicks = Object.values(currentAppClickCounts).reduce((sum, count) => sum + count, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Statistics Panel */}
      <div
        className={`relative w-full max-w-4xl max-h-[85vh] rounded-[24px] overflow-hidden backdrop-blur-xl border shadow-2xl ring-1 ${
          isDarkMode
            ? 'bg-[#1A1A1A]/80 border-white/10 ring-white/10'
            : 'bg-white/80 border-black/10 ring-black/5'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b grid grid-cols-3 items-center ${
          isDarkMode ? 'border-white/10' : 'border-gray-200'
        }`}>
          {/* Left: Title */}
          <div className="flex items-center">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Usage Statistics
            </h2>
          </div>

          {/* Center: Date Switcher */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-full p-1">
              <button 
                onClick={() => setDateOffset(prev => Math.max(prev - 1, -90))}
                className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className={`text-sm font-medium px-2 min-w-[80px] text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {isToday ? 'Today' : selectedDateStr.split(' ').slice(1, 3).join(' ')}
              </span>
              <button 
                onClick={() => setDateOffset(prev => prev < 0 ? prev + 1 : 0)}
                disabled={isToday}
                className={`p-1 rounded-full transition-colors ${isToday ? 'opacity-25 cursor-not-allowed text-gray-400 dark:text-gray-600' : isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Right: Reset & Close */}
          <div className="flex items-center justify-end gap-3">
            {onResetStatistics && (
              <button
                onClick={onResetStatistics}
                title="Reset Statistics"
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-3xl relative overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                  <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2v4h-2V2h2zm-1 20c-4.411 0-8-3.589-8-8s3.589-8 8-8c1.558 0 3.018.45 4.258 1.218l-1.157 1.693A5.962 5.962 0 0012 8c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6h2c0 4.411-3.589 8-8 8zm9.707-13.293l-4-4-1.414 1.414L18.586 9H13v2h5.586l-2.293 2.293 1.414 1.414 4-4a.999.999 0 000-1.414z" />
                  </svg>
                </div>
                <div className={`text-sm font-medium mb-1 relative z-10 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  📈 Clicks Today
                </div>
                <div className={`text-2xl font-bold relative z-10 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentClicksToday.toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-3xl relative overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                  <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2v4h-2V2h2zm-1 20c-4.411 0-8-3.589-8-8s3.589-8 8-8c1.558 0 3.018.45 4.258 1.218l-1.157 1.693A5.962 5.962 0 0012 8c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6h2c0 4.411-3.589 8-8 8zm9.707-13.293l-4-4-1.414 1.414L18.586 9H13v2h5.586l-2.293 2.293 1.414 1.414 4-4a.999.999 0 000-1.414z" />
                  </svg>
                </div>
                <div className={`text-sm font-medium mb-1 relative z-10 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  🖱️ Total Clicks
                </div>
                <div className={`text-2xl font-bold relative z-10 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalClicks.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Most Clicked Apps */}
            <div>
              <h3 className={`text-base font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                🏆 Most Clicked Apps
              </h3>

              {mostClickedApps.length === 0 ? (
                <div className={`text-center py-12 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <p>No app usage data yet</p>
                  <p className="text-sm mt-2">Start clicking apps to see statistics</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {mostClickedApps.map((app, index) => (
                    <div
                      key={app.id}
                      className={`flex items-center gap-3 p-2.5 px-3.5 rounded-2xl transition-colors ${
                        isDarkMode
                          ? 'bg-white/5 hover:bg-white/10'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {/* Rank */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0
                          ? 'bg-yellow-500 text-white'
                          : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                              ? 'bg-orange-600 text-white'
                              : isDarkMode
                                ? 'bg-white/10 text-gray-400'
                                : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Icon */}
                      {app.icon ? (
                        <img src={app.icon} alt={app.title} className="w-7 h-7 rounded-lg flex-shrink-0 object-cover" />
                      ) : (
                        <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-semibold ${isDarkMode ? 'bg-white/10 text-white/50' : 'bg-gray-200 text-gray-500'}`}>
                          {app.title.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* App Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {app.title}
                        </div>
                        <div className={`text-[11px] truncate ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {app.href}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-sm font-semibold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {app.clicks} clicks
                        </div>
                        <div className={`text-[11px] ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {formatDate(app.lastClicked)}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex-shrink-0 w-20">
                        <div className={`h-1.5 rounded-full overflow-hidden ${
                          isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                        }`}>
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{
                              width: `${(app.clicks / mostClickedApps[0].clicks) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
