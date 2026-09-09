'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  History, Calendar, TrendingUp, TrendingDown, Minus,
  Download, Filter, BarChart3, Activity, Clock,
  Droplets, Flame, Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockChartData, generateTimeSeries } from '@/data/mock-data';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Long-Range Area Chart ─── */
function HistoricalChart({ metric, color, title }: { metric: string; color: string; title: string }) {
  const baseValues: Record<string, { base: number; variance: number }> = {
    temperature: { base: 32, variance: 10 },
    waterLevel: { base: 2.5, variance: 2 },
    pm25: { base: 85, variance: 50 },
    humidity: { base: 65, variance: 25 },
    smoke: { base: 120, variance: 80 },
    co2: { base: 550, variance: 150 },
  };

  const config = baseValues[metric] || { base: 50, variance: 20 };
  const data = generateTimeSeries(168, config.base, config.variance, 'stable');

  const options: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', zoom: { enabled: true } },
    colors: [color],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.02, stops: [0, 90, 100] } },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#E2E8F0', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    xaxis: { type: 'datetime', labels: { style: { colors: '#94A3B8', fontSize: '10px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#94A3B8', fontSize: '10px' } } },
    tooltip: { x: { format: 'dd MMM HH:mm' }, theme: 'light' },
    dataLabels: { enabled: false },
  };

  const series = [{ name: title, data: data.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })) }];

  return <Chart options={options} series={series} type="area" height={220} />;
}

/* ─── Comparison Chart ─── */
function ComparisonChart() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#2563EB', '#EF4444', '#F59E0B'],
    stroke: { curve: 'smooth', width: 2.5 },
    grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      labels: { style: { colors: '#94A3B8', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: '#94A3B8', fontSize: '11px' } } },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', fontWeight: 500, markers: { size: 4, shape: 'circle' as const } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' },
  };

  const series = [
    { name: 'Flood Alerts', data: [12, 15, 8, 22, 35, 42, 28, 18, 25] },
    { name: 'Fire Alerts', data: [5, 3, 8, 12, 18, 25, 22, 15, 10] },
    { name: 'Pollution Alerts', data: [18, 22, 20, 15, 12, 8, 14, 20, 28] },
  ];

  return <Chart options={options} series={series} type="line" height={300} />;
}

/* ═══════════════════════════════════════════
   HISTORICAL PAGE
   ═══════════════════════════════════════════ */
export default function HistoricalPage() {
  const [range, setRange] = useState('7D');
  const ranges = ['24H', '7D', '30D', '90D', '1Y'];

  const metrics = [
    { key: 'temperature', title: 'Temperature', icon: Flame, color: '#EF4444', unit: '°C' },
    { key: 'waterLevel', title: 'Water Level', icon: Droplets, color: '#2563EB', unit: 'm' },
    { key: 'pm25', title: 'PM2.5', icon: Wind, color: '#F59E0B', unit: 'µg/m³' },
    { key: 'humidity', title: 'Humidity', icon: Activity, color: '#06B6D4', unit: '%' },
    { key: 'smoke', title: 'Smoke Level', icon: Flame, color: '#F97316', unit: 'ppm' },
    { key: 'co2', title: 'CO₂', icon: BarChart3, color: '#8B5CF6', unit: 'ppm' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Historical Data
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Explore past environmental readings and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  range === r ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="eco-btn eco-btn-secondary eco-btn-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Monthly Comparison */}
      <motion.div variants={item} className="eco-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4.5 h-4.5 text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-900">Monthly Alert Trends</h3>
        </div>
        <ComparisonChart />
      </motion.div>

      {/* Individual Metric Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <motion.div key={m.key} variants={item} className="eco-card">
            <div className="flex items-center gap-2 mb-3">
              <m.icon className="w-4 h-4" style={{ color: m.color }} />
              <h3 className="text-sm font-semibold text-surface-900">{m.title}</h3>
              <span className="text-xs text-surface-400 ml-auto">{m.unit}</span>
            </div>
            <HistoricalChart metric={m.key} color={m.color} title={m.title} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
