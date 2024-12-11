import React from 'react';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import type { PlayHistory } from '../types/spotify';

interface Props {
  recentTracks: PlayHistory[];
  fullView?: boolean;
}

interface ListeningPattern {
  hours: Record<number, number>;
  days: Record<number, number>;
  months: Record<number, number>;
  segments: Record<string, number>;
}

const timeSegments = {
  'Early Morning': [5, 6, 7, 8],
  'Morning': [9, 10, 11],
  'Afternoon': [12, 13, 14, 15, 16],
  'Evening': [17, 18, 19, 20],
  'Night': [21, 22, 23, 0, 1, 2, 3, 4],
};

export default function ListeningHabits({ recentTracks, fullView }: Props) {
  const patterns = recentTracks.reduce((acc: ListeningPattern, { played_at }) => {
    const date = new Date(played_at);
    const hour = date.getHours();
    const day = date.getDay();
    const month = date.getMonth();

    // Update basic patterns
    acc.hours[hour] = (acc.hours[hour] || 0) + 1;
    acc.days[day] = (acc.days[day] || 0) + 1;
    acc.months[month] = (acc.months[month] || 0) + 1;

    // Update time segments
    const segment = Object.entries(timeSegments).find(([_, hours]) => 
      hours.includes(hour)
    )?.[0] || 'Night';
    acc.segments[segment] = (acc.segments[segment] || 0) + 1;

    return acc;
  }, {
    hours: {},
    days: {},
    months: {},
    segments: {},
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const peakHour = Object.entries(patterns.hours)
    .sort(([, a], [, b]) => b - a)[0];
  const peakDay = Object.entries(patterns.days)
    .sort(([, a], [, b]) => b - a)[0];
  const favoriteTimeSegment = Object.entries(patterns.segments)
    .sort(([, a], [, b]) => b - a)[0];

  const totalDuration = recentTracks.reduce((sum, { track }) => sum + track.duration_ms, 0);
  const totalMinutes = Math.round(totalDuration / (1000 * 60));
  const avgSessionLength = Math.round(totalMinutes / Object.values(patterns.segments).reduce((a, b) => a + b, 0));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <Clock className="w-6 h-6 text-green-500" />
        Listening Habits
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Listening Time</span>
              <span className="text-white font-medium">{totalMinutes} mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg. Session Length</span>
              <span className="text-white font-medium">{avgSessionLength} mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Favorite Time</span>
              <span className="text-white font-medium">
                {favoriteTimeSegment?.[0] || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Peak Hour</span>
              <span className="text-white font-medium">
                {peakHour ? `${peakHour[0]}:00` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Time Distribution</h3>
          <div className="space-y-3">
            {Object.entries(patterns.segments).sort(([, a], [, b]) => b - a).map(([segment, count]) => {
              const percentage = Math.round((count / recentTracks.length) * 100);
              return (
                <div key={segment} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{segment}</span>
                    <span className="text-gray-400">{percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Pattern</h3>
          <div className="space-y-3">
            {dayNames.map((day, index) => {
              const count = patterns.days[index] || 0;
              const maxCount = Math.max(...Object.values(patterns.days));
              const percentage = Math.round((count / maxCount) * 100);
              return (
                <div key={day} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{day}</span>
                    <span className="text-gray-400">{count} plays</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {fullView && (
        <>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">24-Hour Activity</h3>
            <div className="h-48 flex items-end gap-2">
              {Array.from({ length: 24 }).map((_, hour) => {
                const count = patterns.hours[hour] || 0;
                const maxCount = Math.max(...Object.values(patterns.hours));
                const height = Math.max((count / maxCount) * 100, 5);
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-green-500 rounded-t transition-all hover:bg-green-400"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400 rotate-45 origin-left">
                      {hour}:00
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
            <div className="space-y-3">
              {monthNames.map((month, index) => {
                const count = patterns.months[index] || 0;
                const maxCount = Math.max(...Object.values(patterns.months));
                const percentage = Math.round((count / maxCount) * 100);
                return (
                  <div key={month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{month}</span>
                      <span className="text-gray-400">{count} plays</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}