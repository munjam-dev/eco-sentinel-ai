'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, CheckCircle2, Clock, Filter,
  Droplets, Flame, Wind, MapPin, Sparkles, X,
  ChevronDown, Eye, EyeOff, Search,
} from 'lucide-react';
import { cn, getRelativeTime, getSeverityColor } from '@/lib/utils';
import { useAlertStore } from '@/stores';
import type { Alert, DisasterType, Severity } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const disasterIcons: Record<DisasterType, React.ComponentType<{ className?: string }>> = {
  flood: Droplets,
  fire: Flame,
  pollution: Wind,
};

const statusLabels = {
  active: { label: 'Active', color: 'bg-critical-500' },
  acknowledged: { label: 'Acknowledged', color: 'bg-warning-500' },
  resolved: { label: 'Resolved', color: 'bg-success-500' },
  escalated: { label: 'Escalated', color: 'bg-purple-500' },
};

/* ─── Alert Detail Modal ─── */
function AlertDetail({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const Icon = disasterIcons[alert.type];
  const colors = getSeverityColor(alert.severity);
  const { acknowledgeAlert, resolveAlert } = useAlertStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header bar */}
        <div className={cn('h-2 rounded-t-2xl', colors.bg)} style={{
          background: alert.type === 'flood' ? '#2563EB' : alert.type === 'fire' ? '#EF4444' : '#F59E0B',
        }} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
                <Icon className={cn('w-5 h-5', colors.text)} />
              </div>
              <div>
                <span className={cn('text-xs font-bold uppercase tracking-wider', colors.text)}>{alert.severity}</span>
                <h3 className="text-base font-semibold text-surface-900">{alert.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-surface-600 leading-relaxed mb-4">{alert.message}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-surface-50">
              <div className="text-[10px] text-surface-400 uppercase">Location</div>
              <div className="text-xs font-medium text-surface-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {alert.location.address}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-50">
              <div className="text-[10px] text-surface-400 uppercase">Time</div>
              <div className="text-xs font-medium text-surface-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {getRelativeTime(alert.timestamp)}
              </div>
            </div>
          </div>

          {/* Sensor values */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-surface-500 uppercase mb-2">Sensor Values</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(alert.sensorValues).map(([key, val]) => (
                <div key={key} className="px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-100">
                  <span className="text-[10px] text-surface-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="text-sm font-bold text-surface-800">{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          {alert.aiRecommendation && (
            <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 mb-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-[10px] font-semibold text-primary-700 uppercase tracking-wider">AI Recommendation</span>
              </div>
              <p className="text-xs text-primary-800 leading-relaxed">{alert.aiRecommendation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {alert.status === 'active' && (
              <button
                onClick={() => { acknowledgeAlert(alert.id); onClose(); }}
                className="eco-btn eco-btn-secondary eco-btn-sm flex-1"
              >
                <Eye className="w-3.5 h-3.5" />
                Acknowledge
              </button>
            )}
            {(alert.status === 'active' || alert.status === 'acknowledged') && (
              <button
                onClick={() => { resolveAlert(alert.id); onClose(); }}
                className="eco-btn eco-btn-primary eco-btn-sm flex-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Alert Row ─── */
function AlertRow({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  const Icon = disasterIcons[alert.type];
  const colors = getSeverityColor(alert.severity);
  const status = statusLabels[alert.status];

  return (
    <motion.div
      variants={item}
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md',
        colors.border,
        'bg-white hover:bg-surface-50'
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
        <Icon className={cn('w-5 h-5', colors.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-[10px] font-bold uppercase tracking-wider', colors.text)}>{alert.severity}</span>
          <span className="text-[10px] text-surface-300">•</span>
          <span className="text-[10px] text-surface-400 capitalize">{alert.type}</span>
        </div>
        <h4 className="text-sm font-medium text-surface-900 truncate">{alert.title}</h4>
        <p className="text-xs text-surface-500 truncate mt-0.5">{alert.message}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full', status.color)} />
          <span className="text-[10px] font-medium text-surface-500">{status.label}</span>
        </div>
        <span className="text-[10px] text-surface-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getRelativeTime(alert.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   ALERTS PAGE
   ═══════════════════════════════════════════ */
export default function AlertsPage() {
  const { alerts } = useAlertStore();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterType, setFilterType] = useState<DisasterType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = alerts.filter((a) => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && !a.nodeName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const countByStatus = (status: string) => alerts.filter((a) => a.status === status).length;

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Alert Management
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Monitor and respond to environmental alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="eco-badge eco-badge-critical">
            <AlertTriangle className="w-3 h-3" />
            {countByStatus('active')} Active
          </div>
          <div className="eco-badge eco-badge-warning">
            {countByStatus('acknowledged')} Acknowledged
          </div>
          <div className="eco-badge eco-badge-success">
            {countByStatus('resolved')} Resolved
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="eco-card flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:border-primary-300"
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DisasterType | 'all')}
          className="px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:border-primary-300"
        >
          <option value="all">All Types</option>
          <option value="flood">Flood</option>
          <option value="fire">Fire</option>
          <option value="pollution">Pollution</option>
        </select>

        {/* Severity filter */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as Severity | 'all')}
          className="px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:border-primary-300"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:border-primary-300"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </motion.div>

      {/* Alert List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert) => (
            <AlertRow key={alert.id} alert={alert} onClick={() => setSelectedAlert(alert)} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="eco-card text-center py-12">
            <Bell className="w-10 h-10 text-surface-300 mx-auto mb-3" />
            <p className="text-sm text-surface-500">No alerts matching your filters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <AlertDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
