'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle, Cpu, Brain, Clock,
  TrendingUp, TrendingDown, Minus,
  Droplets, Flame, Wind, Activity,
  ArrowUpRight, ArrowDownRight,
  Shield, Zap, Target, BarChart3,
} from 'lucide-react';
import { cn, formatNumber, formatPercent, getRelativeTime, getSeverityColor } from '@/lib/utils';
import { mockKPIs, mockAlerts, mockNodes, mockChartData, mockPredictions, mockEnvironmentalHealth } from '@/data/mock-data';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const DashboardMap = dynamic(() => import('@/components/dashboard/DashboardMap'), { ssr: false, loading: () => <MapSkeleton /> });
const DashboardCharts = dynamic(() => import('@/components/dashboard/DashboardCharts'), { ssr: false, loading: () => <ChartSkeleton /> });

/* ─── Skeletons ─── */
function MapSkeleton() {
  return <div className="eco-card h-[400px] animate-shimmer" />;
}
function ChartSkeleton() {
  return <div className="eco-card h-[300px] animate-shimmer" />;
}

/* ─── Animation Variants ─── */
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/* ═══════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════ */
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
}

function KPICard({ title, value, subtitle, trend, icon: Icon, color, bgColor }: KPICardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <motion.div variants={item} className="eco-card group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{ background: bgColor }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium',
            isPositive ? 'bg-critical-50 text-critical-600' : isNegative ? 'bg-success-50 text-success-600' : 'bg-surface-100 text-surface-500'
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isNegative ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </div>
      <div className="text-sm text-surface-500 mt-1">{title}</div>
      {subtitle && <div className="text-xs text-surface-400 mt-0.5">{subtitle}</div>}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   AI HEALTH SCORE
   ═══════════════════════════════════════════ */
function AIHealthCard() {
  const health = mockEnvironmentalHealth;
  const scoreColor = health.overallScore >= 70 ? '#22C55E' : health.overallScore >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div variants={item} className="eco-card h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-900">AI Environmental Health</h3>
        </div>

        <div className="flex items-center gap-6">
          {/* Score circle */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={scoreColor} strokeWidth="8"
                strokeDasharray={`${health.overallScore * 2.64} 264`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold" style={{ color: scoreColor, fontFamily: 'var(--font-heading)' }}>
                {health.overallScore}
              </span>
            </div>
          </div>

          {/* Risk bars */}
          <div className="flex-1 space-y-3">
            {[
              { label: 'Flood Risk', value: health.floodRisk, color: '#2563EB', icon: Droplets },
              { label: 'Fire Risk', value: health.fireRisk, color: '#EF4444', icon: Flame },
              { label: 'Air Quality', value: 100 - health.pollutionIndex / 3, color: '#F59E0B', icon: Wind },
            ].map((risk) => (
              <div key={risk.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-500 flex items-center gap-1">
                    <risk.icon className="w-3 h-3" style={{ color: risk.color }} />
                    {risk.label}
                  </span>
                  <span className="font-medium text-surface-700">{Math.round(risk.value)}%</span>
                </div>
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${risk.value}%`, background: risk.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(
        'mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
        health.trend === 'improving' ? 'bg-success-50 text-success-700'
          : health.trend === 'deteriorating' ? 'bg-critical-50 text-critical-700'
            : 'bg-surface-50 text-surface-600'
      )}>
        {health.trend === 'improving' ? <TrendingUp className="w-3.5 h-3.5" /> : health.trend === 'deteriorating' ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
        Environment is <span className="font-semibold">{health.trend}</span> — Updated {getRelativeTime(health.lastUpdated)}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   RECENT ALERTS TIMELINE
   ═══════════════════════════════════════════ */
function RecentAlerts() {
  const recentAlerts = mockAlerts.slice(0, 4);

  const disasterIcons = {
    flood: Droplets,
    fire: Flame,
    pollution: Wind,
  };

  return (
    <motion.div variants={item} className="eco-card h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            <h3 className="text-sm font-semibold text-surface-900">Recent Alerts</h3>
          </div>
          <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">View All</span>
        </div>

        <div className="space-y-3">
          {recentAlerts.map((alert, i) => {
            const Icon = disasterIcons[alert.type];
            const colors = getSeverityColor(alert.severity);
            return (
              <div key={alert.id} className={cn('flex items-start gap-3 p-2.5 rounded-xl border transition-colors hover:bg-surface-50', colors.border)}>
                <div className={cn('mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
                  <Icon className={cn('w-4 h-4', colors.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', colors.text)}>{alert.severity}</span>
                    <span className="text-[10px] text-surface-400">•</span>
                    <span className="text-[10px] text-surface-400">{getRelativeTime(alert.timestamp)}</span>
                  </div>
                  <p className="text-xs text-surface-700 font-medium mt-0.5 truncate">{alert.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   ACTIVE NODES MINI CARDS
   ═══════════════════════════════════════════ */
function ActiveNodes() {
  const nodes = mockNodes.slice(0, 4);
  const statusColors = {
    online: 'bg-success-500',
    warning: 'bg-warning-500',
    offline: 'bg-critical-500',
    maintenance: 'bg-surface-400',
  };

  return (
    <motion.div variants={item} className="eco-card h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-secondary-500" />
            <h3 className="text-sm font-semibold text-surface-900">Active Nodes</h3>
          </div>
          <span className="eco-badge eco-badge-success text-[10px]">
            {mockNodes.filter((n) => n.status === 'online').length}/{mockNodes.length} Online
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {nodes.map((node) => (
            <div key={node.id} className="p-3 rounded-xl bg-surface-50 border border-surface-100 hover:border-surface-200 transition-colors cursor-pointer">
              <div className="flex items-center gap-1.5 mb-2">
                <div className={cn('w-2 h-2 rounded-full', statusColors[node.status])} />
                <span className="text-[10px] font-medium text-surface-400 uppercase">{node.status}</span>
              </div>
              <div className="text-xs font-semibold text-surface-800 truncate">{node.name}</div>
              <div className="text-[10px] text-surface-400 mt-0.5">{node.id}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-surface-400">Battery</span>
                <span className="text-[10px] font-medium text-surface-600">{node.batteryLevel}%</span>
              </div>
              <div className="mt-1 h-1 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    node.batteryLevel > 50 ? 'bg-success-500' : node.batteryLevel > 20 ? 'bg-warning-500' : 'bg-critical-500'
                  )}
                  style={{ width: `${node.batteryLevel}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════ */
export default function DashboardPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Command Center
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Real-time environmental monitoring overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="eco-badge eco-badge-success">
            <Activity className="w-3 h-3" />
            Live
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Alerts"
          value={mockKPIs.activeAlerts}
          trend={mockKPIs.activeAlertsTrend}
          icon={AlertTriangle}
          color="#EF4444"
          bgColor="#FEF2F2"
          subtitle="Across all zones"
        />
        <KPICard
          title="Online Nodes"
          value={`${mockKPIs.onlineNodes}/${mockKPIs.totalNodes}`}
          icon={Cpu}
          color="#06B6D4"
          bgColor="#ECFEFF"
          subtitle="75% operational"
        />
        <KPICard
          title="AI Health Score"
          value={mockKPIs.aiHealthScore}
          trend={mockKPIs.aiHealthTrend}
          icon={Brain}
          color="#8B5CF6"
          bgColor="#F5F3FF"
          subtitle="Environmental index"
        />
        <KPICard
          title="Avg Response Time"
          value={`${mockKPIs.avgResponseTime}s`}
          trend={mockKPIs.responseTrend}
          icon={Zap}
          color="#22C55E"
          bgColor="#F0FDF4"
          subtitle="Last 24 hours"
        />
      </div>

      {/* Map */}
      <motion.div variants={item}>
        <DashboardMap />
      </motion.div>

      {/* Charts */}
      <motion.div variants={item}>
        <DashboardCharts />
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <AIHealthCard />
        <RecentAlerts />
        <ActiveNodes />
      </div>
    </motion.div>
  );
}
