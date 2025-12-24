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
  isDarkMode: boolean;
}

export default function UsageStatistics({
  isOpen,
  onClose,
  apps,
  appClickCounts,
  appLastClicked,
  totalTimeSpent,
  isDarkMode,
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
        className={`relative w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode
            ? 'bg-[#1a1a1a] ring-1 ring-white/10'
            : 'bg-white ring-1 ring-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Usage Statistics
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your app usage and time spent
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  ⏱️ Time Spent
                </div>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatTime(totalTimeSpent)}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  🖱️ Total Clicks
                </div>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalClicks.toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  📱 Apps Used
                </div>
                <div className={`text-2xl font-bold ${
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
                      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
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
