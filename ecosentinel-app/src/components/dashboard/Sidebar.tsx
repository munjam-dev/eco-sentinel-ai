'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Map, BarChart3, Brain,
  History, FileText, Bell, Cpu, Settings, Info,
  Shield, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Monitoring', href: '/dashboard/monitoring', icon: Activity },
  { label: 'Map', href: '/dashboard/map', icon: Map },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'AI Insights', href: '/dashboard/ai-insights', icon: Brain },
  { label: 'Historical', href: '/dashboard/historical', icon: History },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Alerts', href: '/dashboard/alerts', icon: Bell, badge: 5 },
  { label: 'Nodes', href: '/dashboard/nodes', icon: Cpu },
  { divider: true } as const,
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'About', href: '/dashboard/about', icon: Info },
];

type NavItemType = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: number } | { divider: true };

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
        className={cn(
          'h-full bg-white border-r border-surface-200 flex flex-col flex-shrink-0 z-40 transition-all duration-200',
          'fixed lg:relative inset-y-0 left-0',
          !sidebarOpen && 'max-lg:-translate-x-full'
        )}
      >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-surface-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-sm font-bold text-surface-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)' }}>
                EcoSentinel
              </span>
              <span className="text-[10px] text-surface-400 -mt-0.5">AI Platform v1.0</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {(navItems as NavItemType[]).map((item, i) => {
          if ('divider' in item) {
            return <div key={`div-${i}`} className="my-2 mx-2 border-t border-surface-100" />;
          }

          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary-50 rounded-xl"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 relative z-10 transition-colors',
                  isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'
                )}
              />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {sidebarOpen && item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto relative z-10 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[11px] font-semibold rounded-full bg-critical-500 text-white"
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="flex-shrink-0 p-2.5 border-t border-surface-100">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm text-surface-400 hover:bg-surface-50 hover:text-surface-600 transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  </>
);
}
