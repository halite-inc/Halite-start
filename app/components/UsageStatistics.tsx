import { useMemo } from 'react';

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
}: UsageStatisticsProps) {
  // Get most clicked apps
  const mostClickedApps = useMemo(() => {
    const appsWithClicks = apps
      .map(app => ({
        ...app,
        clicks: appClickCounts[app.id] || 0,
        lastClicked: appLastClicked[app.id] || 0,
      }))
      .filter(app => app.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return appsWithClicks;
  }, [apps, appClickCounts, appLastClicked]);

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
  const totalClicks = Object.values(appClickCounts).reduce((sum, count) => sum + count, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Statistics Panel */}
      <div
        className={`relative w-full max-w-4xl max-h-[85vh] rounded-[32px] shadow-2xl overflow-hidden ${
          glassmorphismEnabled
            ? isDarkMode
              ? 'bg-[#2B2B2B]/80 backdrop-blur-md border border-[#444]'
              : 'bg-white/80 backdrop-blur-md border border-gray-400'
            : isDarkMode
              ? 'bg-[#121212] border border-[#444]'
              : 'bg-white border border-gray-400'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Usage Statistics
            </h2>
            <p className={`text-sm font-medium pt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Track your app usage and time spent
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onResetStatistics && (
              <button
                onClick={onResetStatistics}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  isDarkMode
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                Reset
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  ⏱️ Total Clicks Today
                </div>
                <div className={`text-2xl font-bold relative z-10 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {clicksToday.toLocaleString()}
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

              <div className={`p-4 rounded-3xl relative overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                  <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                  </svg>
                </div>
                <div className={`text-sm font-medium mb-1 relative z-10 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  📱 Apps Used
                </div>
                <div className={`text-2xl font-bold relative z-10 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {mostClickedApps.length}
                </div>
              </div>
            </div>

            {/* Most Clicked Apps */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${
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
                <div className="space-y-2">
                  {mostClickedApps.map((app, index) => (
                    <div
                      key={app.id}
                      className={`flex items-center gap-4 p-4 rounded-3xl transition-colors ${
                        isDarkMode
                          ? 'bg-white/5 hover:bg-white/10'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {/* Rank */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
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
                        <img src={app.icon} alt={app.title} className="w-8 h-8 rounded-lg flex-shrink-0 object-cover" />
                      ) : (
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-semibold ${isDarkMode ? 'bg-white/10 text-white/50' : 'bg-gray-200 text-gray-500'}`}>
                          {app.title.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* App Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {app.title}
                        </div>
                        <div className={`text-xs truncate ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {app.href}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex-shrink-0 text-right">
                        <div className={`font-semibold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {app.clicks} clicks
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {formatDate(app.lastClicked)}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex-shrink-0 w-24">
                        <div className={`h-2 rounded-full overflow-hidden ${
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
