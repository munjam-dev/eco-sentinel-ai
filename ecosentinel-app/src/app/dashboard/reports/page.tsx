'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Calendar, Clock, Filter,
  CheckCircle2, AlertTriangle, Loader2, File,
  BarChart3, ChevronRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Report } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const mockReports: Report[] = [
  {
    id: 'RPT-001', title: 'Daily Environmental Summary', type: 'daily',
    generatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    period: { start: new Date(Date.now() - 24 * 3600_000).toISOString(), end: new Date().toISOString() },
    format: 'pdf', status: 'ready',
    summary: 'Complete environmental health summary with 5 active alerts, 847 predictions, and 6/8 nodes online.',
  },
  {
    id: 'RPT-002', title: 'Weekly Alert Analysis', type: 'weekly',
    generatedAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    period: { start: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(), end: new Date().toISOString() },
    format: 'pdf', status: 'ready',
    summary: 'Detailed alert breakdown by type, severity, and response time. Includes AI recommendation effectiveness analysis.',
  },
  {
    id: 'RPT-003', title: 'Monthly Sensor Performance', type: 'monthly',
    generatedAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    period: { start: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(), end: new Date().toISOString() },
    format: 'excel', status: 'ready',
    summary: 'Node uptime, signal quality, battery trends, and calibration status across all 8 sensor nodes.',
  },
  {
    id: 'RPT-004', title: 'Flood Incident — Sundarbans Delta', type: 'incident',
    generatedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    period: { start: new Date(Date.now() - 12 * 3600_000).toISOString(), end: new Date().toISOString() },
    format: 'pdf', status: 'ready',
    summary: 'Critical water level incident report with timeline, AI predictions, sensor data, and recommended actions.',
  },
  {
    id: 'RPT-005', title: 'Air Quality Compliance Report', type: 'custom',
    generatedAt: new Date(Date.now() - 72 * 3600_000).toISOString(),
    period: { start: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(), end: new Date().toISOString() },
    format: 'csv', status: 'ready',
    summary: 'PM2.5 and PM10 readings against NAAQS standards. Includes exceedance analysis for Delhi NCR region.',
  },
  {
    id: 'RPT-006', title: 'Q3 Environmental Assessment', type: 'custom',
    generatedAt: new Date().toISOString(),
    period: { start: new Date(Date.now() - 90 * 24 * 3600_000).toISOString(), end: new Date().toISOString() },
    format: 'pdf', status: 'generating',
    summary: 'Quarterly environmental health assessment with trend analysis and predictive model evaluation.',
  },
];

const typeColors: Record<string, { bg: string; text: string }> = {
  daily: { bg: 'bg-primary-50', text: 'text-primary-700' },
  weekly: { bg: 'bg-secondary-50', text: 'text-secondary-700' },
  monthly: { bg: 'bg-success-50', text: 'text-success-700' },
  incident: { bg: 'bg-critical-50', text: 'text-critical-700' },
  custom: { bg: 'bg-warning-50', text: 'text-warning-700' },
};

const formatIcons: Record<string, string> = {
  pdf: '📄',
  excel: '📊',
  csv: '📋',
};

/* ─── Report Card ─── */
function ReportCard({ report }: { report: Report }) {
  const typeStyle = typeColors[report.type] || typeColors.custom;

  return (
    <motion.div variants={item} className="eco-card eco-card-interactive group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center text-2xl flex-shrink-0">
          {formatIcons[report.format] || '📄'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', typeStyle.bg, typeStyle.text)}>
              {report.type}
            </span>
            <span className="text-[10px] text-surface-400 uppercase">{report.format}</span>
          </div>
          <h4 className="text-sm font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">{report.title}</h4>
          <p className="text-xs text-surface-500 mt-1 line-clamp-2">{report.summary}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] text-surface-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(report.period.start)} — {formatDate(report.period.end)}
            </span>
            <span className="text-[10px] text-surface-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Generated {formatDate(report.generatedAt, 'datetime')}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {report.status === 'ready' ? (
            <button className="eco-btn eco-btn-primary eco-btn-sm">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          ) : report.status === 'generating' ? (
            <div className="flex items-center gap-1.5 text-xs text-primary-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-critical-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              Failed
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   REPORTS PAGE
   ═══════════════════════════════════════════ */
export default function ReportsPage() {
  const [filterType, setFilterType] = useState('all');

  const filtered = filterType === 'all' ? mockReports : mockReports.filter((r) => r.type === filterType);

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Reports
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Generate and download environmental reports</p>
        </div>
        <button className="eco-btn eco-btn-primary eco-btn-sm">
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: mockReports.length, icon: File, color: '#2563EB' },
          { label: 'Ready', value: mockReports.filter((r) => r.status === 'ready').length, icon: CheckCircle2, color: '#22C55E' },
          { label: 'Generating', value: mockReports.filter((r) => r.status === 'generating').length, icon: Loader2, color: '#F59E0B' },
          { label: 'This Month', value: 12, icon: Calendar, color: '#8B5CF6' },
        ].map((s) => (
          <div key={s.label} className="eco-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}14` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</div>
              <div className="text-xs text-surface-500">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex gap-1.5">
        {['all', 'daily', 'weekly', 'monthly', 'incident', 'custom'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize',
              filterType === t ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-surface-500 hover:bg-surface-50 border border-transparent'
            )}
          >
            {t}
          </button>
        ))}
      </motion.div>

      {/* Report List */}
      <div className="space-y-3">
        {filtered.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </motion.div>
  );
}
