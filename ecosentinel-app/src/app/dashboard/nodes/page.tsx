'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Battery, Wifi, Signal, MapPin, Calendar,
  Search, Filter, Settings, Activity, Clock,
  ChevronRight, CheckCircle2, AlertTriangle, X,
  Droplets, Flame, Wind, WifiOff, Wrench,
} from 'lucide-react';
import { cn, getRelativeTime, formatDate } from '@/lib/utils';
import { mockNodes } from '@/data/mock-data';
import type { SensorNode, DisasterType, NodeStatus } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const disasterIcons: Record<DisasterType, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  flood: Droplets,
  fire: Flame,
  pollution: Wind,
};
const disasterColors: Record<DisasterType, string> = { flood: '#2563EB', fire: '#EF4444', pollution: '#F59E0B' };

const statusConfig: Record<NodeStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  online: { label: 'Online', color: 'text-success-700', bg: 'bg-success-50', icon: CheckCircle2 },
  offline: { label: 'Offline', color: 'text-critical-700', bg: 'bg-critical-50', icon: WifiOff },
  warning: { label: 'Warning', color: 'text-warning-700', bg: 'bg-warning-50', icon: AlertTriangle },
  maintenance: { label: 'Maintenance', color: 'text-surface-600', bg: 'bg-surface-100', icon: Wrench },
};

/* ─── Node Detail Modal ─── */
function NodeDetail({ node, onClose }: { node: SensorNode; onClose: () => void }) {
  const TypeIcon = disasterIcons[node.type];
  const status = statusConfig[node.status];
  const StatusIcon = status.icon;

  const readings = [
    { label: 'Temperature', value: `${node.latestReading.temperature}°C`, threshold: node.type === 'fire' },
    { label: 'Humidity', value: `${node.latestReading.humidity}%` },
    { label: 'PM2.5', value: `${node.latestReading.pm25} µg/m³`, threshold: node.type === 'pollution' },
    { label: 'PM10', value: `${node.latestReading.pm10} µg/m³` },
    { label: 'CO₂', value: `${node.latestReading.co2} ppm` },
    { label: 'Water Level', value: `${node.latestReading.waterLevel} m`, threshold: node.type === 'flood' },
    { label: 'Smoke', value: `${node.latestReading.smokeLevel} ppm` },
    { label: 'Wind Speed', value: `${node.latestReading.windSpeed} km/h` },
    { label: 'Rainfall', value: `${node.latestReading.rainfall} mm/hr` },
    { label: 'Soil Moisture', value: `${node.latestReading.soilMoisture}%` },
    { label: 'Pressure', value: `${node.latestReading.pressure} hPa` },
    { label: 'UV Index', value: `${node.latestReading.uv}` },
  ];

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
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="h-2 rounded-t-2xl" style={{ background: disasterColors[node.type] }} />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${disasterColors[node.type]}14` }}>
                <TypeIcon className="w-6 h-6" style={{ color: disasterColors[node.type] }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-900">{node.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-surface-400 font-mono">{node.id}</span>
                  <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', status.bg, status.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Location', value: node.location.address, icon: MapPin },
              { label: 'Battery', value: `${node.batteryLevel}%`, icon: Battery },
              { label: 'Signal', value: `${node.signalStrength} dBm`, icon: Signal },
              { label: 'Health', value: `${node.healthScore}/100`, icon: Activity },
              { label: 'Firmware', value: node.firmware, icon: Settings },
              { label: 'Zone', value: node.location.zone, icon: MapPin },
              { label: 'Installed', value: formatDate(node.installedDate), icon: Calendar },
              { label: 'Calibrated', value: formatDate(node.calibrationDate), icon: Wrench },
            ].map((info) => (
              <div key={info.label} className="p-2.5 rounded-lg bg-surface-50 border border-surface-100">
                <div className="flex items-center gap-1 text-[10px] text-surface-400 uppercase mb-1">
                  <info.icon className="w-3 h-3" />
                  {info.label}
                </div>
                <div className="text-xs font-medium text-surface-800 truncate">{info.value}</div>
              </div>
            ))}
          </div>

          {/* Latest Readings */}
          <h4 className="text-xs font-semibold text-surface-500 uppercase mb-3">Latest Sensor Readings</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {readings.map((r) => (
              <div key={r.label} className={cn(
                'p-2.5 rounded-lg border',
                r.threshold ? 'bg-warning-50 border-warning-100' : 'bg-surface-50 border-surface-100'
              )}>
                <div className="text-[10px] text-surface-400">{r.label}</div>
                <div className="text-sm font-bold text-surface-800">{r.value}</div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-surface-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last heartbeat: {getRelativeTime(node.lastHeartbeat)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Node Card ─── */
function NodeCard({ node, onClick }: { node: SensorNode; onClick: () => void }) {
  const TypeIcon = disasterIcons[node.type];
  const status = statusConfig[node.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      variants={item}
      onClick={onClick}
      className="eco-card eco-card-interactive group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${disasterColors[node.type]}14` }}>
            <TypeIcon className="w-5 h-5" style={{ color: disasterColors[node.type] }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-900">{node.name}</h4>
            <span className="text-[10px] text-surface-400 font-mono">{node.id}</span>
          </div>
        </div>
        <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', status.bg, status.color)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      <div className="text-xs text-surface-500 flex items-center gap-1 mb-3">
        <MapPin className="w-3 h-3" />
        {node.location.address}
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-1.5 rounded-lg bg-surface-50">
          <div className="text-[10px] text-surface-400">Health</div>
          <div className={cn('text-sm font-bold', node.healthScore >= 80 ? 'text-success-600' : node.healthScore >= 50 ? 'text-warning-600' : 'text-critical-600')}>
            {node.healthScore}
          </div>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-surface-50">
          <div className="text-[10px] text-surface-400">Battery</div>
          <div className={cn('text-sm font-bold', node.batteryLevel > 50 ? 'text-success-600' : node.batteryLevel > 20 ? 'text-warning-600' : 'text-critical-600')}>
            {node.batteryLevel}%
          </div>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-surface-50">
          <div className="text-[10px] text-surface-400">Signal</div>
          <div className="text-sm font-bold text-surface-700">{node.signalStrength}</div>
        </div>
      </div>

      {/* Battery bar */}
      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', node.batteryLevel > 50 ? 'bg-success-500' : node.batteryLevel > 20 ? 'bg-warning-500' : 'bg-critical-500')}
          style={{ width: `${node.batteryLevel}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[10px] text-surface-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getRelativeTime(node.lastHeartbeat)}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-500 transition-colors" />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   NODES PAGE
   ═══════════════════════════════════════════ */
export default function NodesPage() {
  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DisasterType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<NodeStatus | 'all'>('all');

  const filtered = mockNodes.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (searchQuery && !n.name.toLowerCase().includes(searchQuery.toLowerCase()) && !n.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    online: mockNodes.filter((n) => n.status === 'online').length,
    warning: mockNodes.filter((n) => n.status === 'warning').length,
    offline: mockNodes.filter((n) => n.status === 'offline').length,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Sensor Nodes
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage and monitor IoT sensor network</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="eco-badge eco-badge-success">{statusCounts.online} Online</div>
          <div className="eco-badge eco-badge-warning">{statusCounts.warning} Warning</div>
          <div className="eco-badge eco-badge-critical">{statusCounts.offline} Offline</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="eco-card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:border-primary-300"
          />
        </div>
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as NodeStatus | 'all')}
          className="px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:border-primary-300"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="warning">Warning</option>
          <option value="offline">Offline</option>
        </select>
      </motion.div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((node) => (
          <NodeCard key={node.id} node={node} onClick={() => setSelectedNode(node)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="eco-card text-center py-12">
          <Cpu className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-500">No nodes matching your filters</p>
        </div>
      )}

      {/* Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
