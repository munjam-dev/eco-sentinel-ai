'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Palette, Globe, Clock,
  Save, RotateCcw, Monitor, Mail, Smartphone,
  Lock, Database, Wifi, Sliders, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Toggle Switch ─── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative w-10 h-5.5 rounded-full transition-all duration-200',
        enabled ? 'bg-primary-600' : 'bg-surface-300'
      )}
    >
      <div className={cn(
        'absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200',
        enabled ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  );
}

/* ─── Settings Section ─── */
function SettingsSection({ title, icon: Icon, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={item} className="eco-card">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-surface-100">
        <Icon className="w-5 h-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

/* ─── Setting Row ─── */
function SettingRow({ label, description, children }: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-surface-800">{label}</div>
        <div className="text-xs text-surface-400 mt-0.5">{description}</div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════ */
export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Settings
        </h1>
        <p className="text-sm text-surface-500 mt-0.5">Configure your dashboard and notification preferences</p>
      </motion.div>

      {/* Notification Settings */}
      <SettingsSection title="Notifications" icon={Bell}>
        <SettingRow label="Email Alerts" description="Receive alert notifications via email">
          <Toggle enabled={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
        </SettingRow>
        <SettingRow label="Push Notifications" description="Browser push notifications for new alerts">
          <Toggle enabled={pushAlerts} onChange={() => setPushAlerts(!pushAlerts)} />
        </SettingRow>
        <SettingRow label="Sound Alerts" description="Play sound when critical alerts arrive">
          <Toggle enabled={soundAlerts} onChange={() => setSoundAlerts(!soundAlerts)} />
        </SettingRow>
        <SettingRow label="Critical Only" description="Only notify for critical severity alerts">
          <Toggle enabled={criticalOnly} onChange={() => setCriticalOnly(!criticalOnly)} />
        </SettingRow>
      </SettingsSection>

      {/* Display Settings */}
      <SettingsSection title="Display" icon={Palette}>
        <SettingRow label="Dark Mode" description="Switch to dark theme (coming soon)">
          <Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </SettingRow>
        <SettingRow label="Compact View" description="Use compact layout for data tables">
          <Toggle enabled={compactView} onChange={() => setCompactView(!compactView)} />
        </SettingRow>
        <SettingRow label="Show Heatmap" description="Display heatmap overlay on monitoring map">
          <Toggle enabled={showHeatmap} onChange={() => setShowHeatmap(!showHeatmap)} />
        </SettingRow>
      </SettingsSection>

      {/* Data Settings */}
      <SettingsSection title="Data & Refresh" icon={Database}>
        <SettingRow label="Auto Refresh" description="Automatically refresh dashboard data">
          <Toggle enabled={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} />
        </SettingRow>
        <SettingRow label="Refresh Interval" description="How often to refresh live data">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:border-primary-300"
          >
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="300">5 minutes</option>
          </select>
        </SettingRow>
        <SettingRow label="Timezone" description="Display timezone for timestamps">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:border-primary-300"
          >
            <option value="Asia/Kolkata">IST (India)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">EST (US)</option>
            <option value="Europe/London">GMT (UK)</option>
          </select>
        </SettingRow>
      </SettingsSection>

      {/* System Info */}
      <SettingsSection title="System Information" icon={Monitor}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Platform', value: 'EcoSentinel AI v1.0.0' },
            { label: 'Frontend', value: 'Next.js 16.3' },
            { label: 'API Status', value: 'Connected' },
            { label: 'WebSocket', value: 'Active' },
            { label: 'Nodes Online', value: '6 / 8' },
            { label: 'Last Sync', value: 'Just now' },
          ].map((info) => (
            <div key={info.label} className="p-2.5 rounded-lg bg-surface-50 border border-surface-100">
              <div className="text-[10px] text-surface-400 uppercase">{info.label}</div>
              <div className="text-xs font-medium text-surface-800 mt-0.5">{info.value}</div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Save bar */}
      <motion.div variants={item} className="flex items-center gap-3 pt-2">
        <button className="eco-btn eco-btn-primary">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button className="eco-btn eco-btn-ghost">
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </motion.div>
    </motion.div>
  );
}
