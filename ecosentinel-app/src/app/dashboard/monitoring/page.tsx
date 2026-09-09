'use client';

import { motion } from 'framer-motion';
import {
  Activity, Thermometer, Droplets, Wind, CloudRain,
  Gauge, Flame, Eye, Radio, Wifi,
} from 'lucide-react';
import { mockNodes } from '@/data/mock-data';
import { cn, formatNumber } from '@/lib/utils';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Gauge Card ─── */
function GaugeCard({ label, value, max, unit, color, icon: Icon, warning, critical }: {
  label: string; value: number; max: number; unit: string; color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; warning: number; critical: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const status = value >= critical ? 'critical' : value >= warning ? 'warning' : 'normal';
  const statusColors = { normal: '#22C55E', warning: '#F59E0B', critical: '#EF4444' };
  const activeColor = statusColors[status];

  const gaugeOptions: ApexCharts.ApexOptions = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    colors: [activeColor],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '65%' },
        track: { background: '#E2E8F0', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: { show: true, fontSize: '20px', fontWeight: 700, fontFamily: 'Poppins', color: '#0F172A', offsetY: 5, formatter: () => `${value}` },
        },
      },
    },
    stroke: { lineCap: 'round' },
  };

  return (
    <motion.div variants={item} className="eco-card text-center group">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{label}</span>
      </div>
      <Chart options={gaugeOptions} series={[pct]} type="radialBar" height={160} />
      <div className="text-xs text-surface-400 mt-1">{unit}</div>
      <div className={cn(
        'mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block',
        status === 'normal' ? 'bg-success-50 text-success-700' : status === 'warning' ? 'bg-warning-50 text-warning-700' : 'bg-critical-50 text-critical-700'
      )}>
        {status.toUpperCase()}
      </div>
    </motion.div>
  );
}

/* ─── Live Sensor Feed ─── */
function LiveSensorFeed() {
  const node = mockNodes[0];
  const readings = [
    { label: 'Temperature', value: node.latestReading.temperature, unit: '°C', icon: Thermometer, color: '#EF4444', max: 60, warning: 38, critical: 45 },
    { label: 'Humidity', value: node.latestReading.humidity, unit: '%', icon: Droplets, color: '#2563EB', max: 100, warning: 85, critical: 95 },
    { label: 'PM2.5', value: node.latestReading.pm25, unit: 'µg/m³', icon: Wind, color: '#F59E0B', max: 300, warning: 60, critical: 150 },
    { label: 'Water Level', value: node.latestReading.waterLevel, unit: 'm', icon: CloudRain, color: '#06B6D4', max: 8, warning: 3, critical: 5 },
    { label: 'Smoke', value: node.latestReading.smokeLevel, unit: 'ppm', icon: Flame, color: '#F97316', max: 600, warning: 200, critical: 500 },
    { label: 'CO₂', value: node.latestReading.co2, unit: 'ppm', icon: Gauge, color: '#8B5CF6', max: 2000, warning: 800, critical: 1500 },
  ];

  return (
    <>
      <motion.div variants={item} className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>Real-Time Monitoring</h2>
          <p className="text-sm text-surface-500 mt-0.5">Live sensor feeds from all active nodes</p>
        </div>
        <div className="eco-badge eco-badge-success">
          <Activity className="w-3 h-3" />
          Live
        </div>
      </motion.div>

      {/* Active Node Selector */}
      <motion.div variants={item} className="eco-card mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse" />
          <span className="text-sm font-semibold text-surface-900">{node.name}</span>
        </div>
        <span className="text-xs text-surface-400">{node.location.address}</span>
        <span className="text-xs text-surface-400 ml-auto font-mono">{node.id}</span>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {readings.map((r) => (
          <GaugeCard key={r.label} {...r} />
        ))}
      </div>

      {/* Sensor Detail Table */}
      <motion.div variants={item} className="eco-card mt-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">All Node Readings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Node</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Temp</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Humidity</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">PM2.5</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Water</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Smoke</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Battery</th>
              </tr>
            </thead>
            <tbody>
              {mockNodes.map((n) => (
                <tr key={n.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-surface-800 text-xs">{n.name}</div>
                    <div className="text-[10px] text-surface-400">{n.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn(
                      'eco-badge text-[10px]',
                      n.status === 'online' ? 'eco-badge-success' : n.status === 'warning' ? 'eco-badge-warning' : 'eco-badge-critical'
                    )}>
                      {n.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-surface-700">{n.latestReading.temperature}°C</td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-surface-700">{n.latestReading.humidity}%</td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-surface-700">{n.latestReading.pm25}</td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-surface-700">{n.latestReading.waterLevel}m</td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-surface-700">{n.latestReading.smokeLevel}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-xs text-surface-700">{n.batteryLevel}%</span>
                      <div className="w-12 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', n.batteryLevel > 50 ? 'bg-success-500' : n.batteryLevel > 20 ? 'bg-warning-500' : 'bg-critical-500')} style={{ width: `${n.batteryLevel}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}

export default function MonitoringPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <LiveSensorFeed />
    </motion.div>
  );
}
