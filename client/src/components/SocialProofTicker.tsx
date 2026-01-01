import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TrendingUp, MapPin, Users } from 'lucide-react';

interface PurchaseActivity {
  id: number;
  installerName: string;
  location: string;
  leadCount: number;
  createdAt: string;
}

export function SocialProofTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: activities, isLoading } = trpc.tracking.recentPurchases.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (!activities || activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [activities]);

  if (isLoading || !activities || activities.length === 0) {
    return null;
  }

  const current = activities[currentIndex];

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-3 shadow-sm max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
        <div className="flex items-center gap-2 text-green-700 shrink-0">
          <TrendingUp className="h-4 w-4 animate-pulse" />
          <span className="font-semibold">Recent Activity</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-700 min-w-0">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0" />
            <span className="font-medium truncate max-w-[120px] sm:max-w-none">{current.installerName}</span>
          </div>
          <span className="text-gray-500 hidden sm:inline">from</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="font-medium truncate max-w-[100px] sm:max-w-none">{current.location}</span>
          </div>
          <span className="text-gray-500 hidden sm:inline">just purchased</span>
          <span className="font-bold text-green-600 shrink-0">{current.leadCount} lead{current.leadCount > 1 ? 's' : ''}</span>
        </div>
        <div className="text-xs text-gray-500 shrink-0 sm:ml-auto">
          {getTimeAgo(current.createdAt)}
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function SocialProofBadge() {
  const { data: activities } = trpc.tracking.recentPurchases.useQuery(undefined, {
    refetchInterval: 30000,
  });

  if (!activities || activities.length === 0) {
    return null;
  }

  const totalPurchases = activities.length;
  const totalLeads = activities.reduce((sum: number, a: PurchaseActivity) => sum + a.leadCount, 0);

  return (
    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
      <TrendingUp className="h-4 w-4" />
      <span>{totalPurchases} installers purchased {totalLeads} leads today</span>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
