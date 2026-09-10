'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, Bell, Sun, Moon, ChevronRight,
  Shield, Wifi, WifiOff, CloudSun, MapPin,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';

function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((s) =>
    s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function Header() {
  const pathname = usePathname();
  const { sidebarOpen, searchQuery, setSearchQuery, toggleSidebar } = useAppStore();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);

    // Fetch live Open-Meteo weather
    const fetchWeather = async () => {
      try {
        const weatherUrl = process.env.NEXT_PUBLIC_WEATHER_API_URL || "https://api.open-meteo.com/v1/forecast?latitude=22&longitude=79&current=temperature_2m,relative_humidity_2m";
        const res = await fetch(weatherUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.current) {
            setTemperature(Math.round(data.current.temperature_2m));
            setHumidity(Math.round(data.current.relative_humidity_2m));
          }
        }
      } catch (err) {
        setTemperature(28);
      }
    };
    fetchWeather();

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="h-16" />;

  const breadcrumbs = getBreadcrumb(pathname);

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-50 text-surface-500"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-surface-300" />}
              <span className={cn(
                i === breadcrumbs.length - 1
                  ? 'text-surface-900 font-medium'
                  : 'text-surface-400'
              )}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search nodes, alerts, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-50 border border-surface-200 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
            aria-label="Search"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-surface-400 bg-surface-100 rounded border border-surface-200">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Status + Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Weather */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-100" title={humidity ? `Relative Humidity: ${humidity}%` : 'Atmospheric Live Reading'}>
          <CloudSun className="w-4 h-4 text-warning-500" />
          <span className="text-xs text-surface-600 font-medium">
            {temperature !== null ? `${temperature}°C` : '28°C'}
          </span>
          {humidity !== null && (
            <span className="text-[10px] text-surface-400 font-mono">({humidity}%)</span>
          )}
        </div>

        {/* System Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 border border-success-100">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-xs text-success-700 font-medium">System Online</span>
        </div>

        {/* Date & Time */}
        <div className="hidden lg:flex flex-col items-end text-right">
          <span className="text-xs font-medium text-surface-900 tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
            {currentTime}
          </span>
          <span className="text-[10px] text-surface-400">{currentDate}</span>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-8 bg-surface-200" />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl hover:bg-surface-50 text-surface-500 hover:text-surface-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-critical-500 rounded-full border-2 border-white" />
        </button>

        {/* Theme Toggle (placeholder for now) */}
        <button
          className="p-2 rounded-xl hover:bg-surface-50 text-surface-500 hover:text-surface-700 transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
          ES
        </div>
      </div>
    </header>
  );
}
