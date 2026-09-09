'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  BarChart3, TrendingUp, TrendingDown, Calendar,
  Download, Filter, ArrowUpRight, ArrowDownRight,
  Activity, Droplets, Flame, Wind, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockChartData, mockKPIs, mockNodes } from '@/data/mock-data';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Time Range Selector ─── */
function TimeRangeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ranges = ['1H', '6H', '24H', '7D', '30D', '90D'];
  return (
    <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
            value === r ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/* ─── Stat Summary Card ─── */
function StatCard({ label, value, trend, unit, icon: Icon, color }: {
  label: string; value: string; trend: number; unit: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string;
}) {
  const isUp = trend > 0;
  return (
    <motion.div variants={item} className="eco-card">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}14` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className={cn(
          'flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-medium',
          isUp ? 'bg-critical-50 text-critical-600' : 'bg-success-50 text-success-600'
        )}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>{value}</div>
      <div className="text-xs text-surface-400 mt-1">{label} <span className="text-surface-300">({unit})</span></div>
    </motion.div>
  );
}

/* ─── Trend Area Chart ─── */
function TrendChart({ range }: { range: string }) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', animations: { enabled: true, speed: 600 } },
    colors: ['#2563EB', '#EF4444', '#F59E0B', '#22C55E'],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#E2E8F0', strokeDashArray: 4, xaxis: { lines: { show: false } }, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#94A3B8', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: '#94A3B8', fontSize: '10px' } } },
    tooltip: { x: { format: 'HH:mm' }, theme: 'light' },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', fontWeight: 500, markers: { size: 4, shape: 'circle' as const } },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: 'Water Level', data: mockChartData.waterLevelTrend.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })) },
    { name: 'Temperature', data: mockChartData.temperatureTrend.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })) },
    { name: 'PM2.5', data: mockChartData.pm25Trend.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })) },
    { name: 'Humidity', data: mockChartData.humidityTrend.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })) },
  ];

  return <Chart options={options} series={series} type="area" height={320} />;
}

/* ─── Bar Comparison Chart ─── */
function WeeklyBarChart() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#2563EB', '#8B5CF6'],
    plotOptions: { bar: { borderRadius: 6, borderRadiusApplication: 'end', columnWidth: '50%' } },
    grid: { borderColor: '#E2E8F0', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    xaxis: { categories: mockChartData.weeklyTrend.map((w) => w.day), labels: { style: { colors: '#94A3B8', fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#94A3B8', fontSize: '11px' } } },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', fontWeight: 500, markers: { size: 4, shape: 'circle' as const } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' },
  };

  const series = [
    { name: 'Alerts', data: mockChartData.weeklyTrend.map((w) => w.alerts) },
    { name: 'Predictions', data: mockChartData.weeklyTrend.map((w) => w.predictions) },
  ];

  return <Chart options={options} series={series} type="bar" height={300} />;
}

/* ─── Radar Chart ─── */
function RadarChart() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'radar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#2563EB', '#EF4444'],
    xaxis: { categories: ['Flood', 'Fire', 'Pollution', 'Temperature', 'Air Quality', 'Response Time'] },
    yaxis: { show: false },
    markers: { size: 3 },
    fill: { opacity: 0.15 },
    stroke: { width: 2 },
    legend: { position: 'bottom', fontSize: '11px', markers: { size: 4, shape: 'circle' as const } },
    plotOptions: { radar: { polygons: { strokeColors: '#E2E8F0', connectorColors: '#E2E8F0', fill: { colors: ['#F8FAFC', '#FFFFFF'] } } } },
  };

  const series = [
    { name: 'Current', data: [78, 71, 65, 82, 55, 90] },
    { name: 'Threshold', data: [60, 60, 60, 60, 60, 60] },
  ];

  return <Chart options={options} series={series} type="radar" height={320} />;
}

/* ─── Heatmap Chart ─── */
function HeatmapChart() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'heatmap', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#2563EB'],
    plotOptions: { heatmap: { shadeIntensity: 0.5, radius: 4, colorScale: { ranges: [
      { from: 0, to: 2, name: 'Low', color: '#22C55E' },
      { from: 3, to: 5, name: 'Medium', color: '#F59E0B' },
      { from: 6, to: 10, name: 'High', color: '#EF4444' },
    ] } } },
    dataLabels: { enabled: false },
    xaxis: { labels: { style: { colors: '#94A3B8', fontSize: '10px' } } },
    yaxis: { labels: { style: { colors: '#94A3B8', fontSize: '11px' } } },
    tooltip: { theme: 'light' },
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const series = daysOfWeek.map((day) => ({
    name: day,
    data: Array.from({ length: 24 }, (_, h) => ({
      x: `${h}:00`,
      y: Math.floor(Math.random() * 10),
    })),
  }));

  return <Chart options={options} series={series} type="heatmap" height={280} />;
}

/* ─── Node Performance Table ─── */
function NodePerformanceTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-100">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Node</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Zone</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Health</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Uptime</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Alerts</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-surface-400 uppercase tracking-wider">Signal</th>
          </tr>
        </thead>
        <tbody>
          {mockNodes.map((n) => (
            <tr key={n.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
              <td className="py-3 px-3">
                <div className="font-medium text-surface-800 text-xs">{n.name}</div>
                <div className="text-[10px] text-surface-400">{n.id}</div>
              </td>
              <td className="py-3 px-3 text-xs text-surface-500">{n.location.zone}</td>
              <td className="py-3 px-3 text-right">
                <span className={cn(
                  'text-xs font-semibold',
                  n.healthScore >= 80 ? 'text-success-600' : n.healthScore >= 50 ? 'text-warning-600' : 'text-critical-600'
                )}>{n.healthScore}%</span>
              </td>
              <td className="py-3 px-3 text-right text-xs font-mono text-surface-700">
                {n.status === 'offline' ? '—' : `${(95 + Math.random() * 5).toFixed(1)}%`}
              </td>
              <td className="py-3 px-3 text-right text-xs font-mono text-surface-700">
                {Math.floor(Math.random() * 8)}
              </td>
              <td className="py-3 px-3 text-right text-xs font-mono text-surface-700">
                {n.signalStrength} dBm
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ANALYTICS PAGE
   ═══════════════════════════════════════════ */
export default function AnalyticsPage() {
  const [range, setRange] = useState('24H');

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Analytics
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Environmental data analysis and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeSelector value={range} onChange={setRange} />
          <button className="eco-btn eco-btn-secondary eco-btn-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Temperature" value="34.2°" trend={8.4} unit="24h avg" icon={Flame} color="#EF4444" />
        <StatCard label="Avg PM2.5" value="85.3" trend={12.1} unit="µg/m³" icon={Wind} color="#F59E0B" />
        <StatCard label="Max Water Level" value="5.8m" trend={15.5} unit="peak" icon={Droplets} color="#2563EB" />
        <StatCard label="Total Predictions" value="847" trend={-3.2} unit="today" icon={Activity} color="#8B5CF6" />
      </div>

      {/* Main Trend Chart */}
      <motion.div variants={item} className="eco-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-primary-600" />
            <h3 className="text-sm font-semibold text-surface-900">Environmental Trends</h3>
          </div>
          <span className="text-xs text-surface-400">Last {range}</span>
        </div>
        <TrendChart range={range} />
      </motion.div>

      {/* Two Column: Bar + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="eco-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4.5 h-4.5 text-primary-600" />
            <h3 className="text-sm font-semibold text-surface-900">Weekly Comparison</h3>
          </div>
          <WeeklyBarChart />
        </motion.div>

        <motion.div variants={item} className="eco-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4.5 h-4.5 text-critical-500" />
            <h3 className="text-sm font-semibold text-surface-900">Risk Radar Analysis</h3>
          </div>
          <RadarChart />
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div variants={item} className="eco-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4.5 h-4.5 text-warning-500" />
          <h3 className="text-sm font-semibold text-surface-900">Alert Frequency Heatmap</h3>
          <span className="text-xs text-surface-400 ml-auto">Alerts per hour across the week</span>
        </div>
        <HeatmapChart />
      </motion.div>

      {/* Node Performance */}
      <motion.div variants={item} className="eco-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-900">Node Performance</h3>
          <button className="eco-btn eco-btn-ghost eco-btn-sm">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
        <NodePerformanceTable />
      </motion.div>
    </motion.div>
  );
}
