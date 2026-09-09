'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Droplets, Flame, Wind,
  Clock, ChevronRight, X, Bell,
} from 'lucide-react';
import { cn, getRelativeTime, getSeverityColor } from '@/lib/utils';
import { useAlertStore, useAppStore } from '@/stores';
import type { Alert, DisasterType } from '@/types';

const disasterIcons: Record<DisasterType, React.ComponentType<{ className?: string }>> = {
  flood: Droplets,
  fire: Flame,
  pollution: Wind,
};

function AlertCard({ alert }: { alert: Alert }) {
  const Icon = disasterIcons[alert.type] || AlertTriangle;
  const colors = getSeverityColor(alert.severity);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all duration-200',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn('mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
          <Icon className={cn('w-4 h-4', colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-semibold uppercase tracking-wider', colors.text)}>
              {alert.severity}
            </span>
            <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
          </div>
          <h4 className="text-xs font-medium text-surface-900 truncate">{alert.title}</h4>
          <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">{alert.message}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-surface-400">
            <Clock className="w-3 h-3" />
            {getRelativeTime(alert.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AlertPanel() {
  const { alertPanelOpen, toggleAlertPanel } = useAppStore();
  const { alerts, filterType, setFilterType } = useAlertStore();

  const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged');
  const filtered = filterType === 'all' ? activeAlerts : activeAlerts.filter((a) => a.type === filterType);

  return (
    <AnimatePresence>
      {alertPanelOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
          className="hidden xl:flex flex-col bg-white border-l border-surface-200 overflow-hidden flex-shrink-0"
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-surface-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-critical-500" />
              <h3 className="text-sm font-semibold text-surface-900">Live Alerts</h3>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-critical-100 text-critical-700">
                {activeAlerts.length}
              </span>
            </div>
            <button
              onClick={toggleAlertPanel}
              className="p-1.5 rounded-lg hover:bg-surface-50 text-surface-400"
              aria-label="Close alert panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 p-3 border-b border-surface-100 flex-shrink-0">
            {(['all', 'flood', 'fire', 'pollution'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors capitalize',
                  filterType === type
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-surface-500 hover:bg-surface-50 border border-transparent'
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-sm text-surface-400">
                No active alerts
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
