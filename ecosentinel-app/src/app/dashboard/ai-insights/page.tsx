'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, TrendingDown, Minus, Shield,
  AlertTriangle, CheckCircle2, ArrowRight, Sparkles,
  Droplets, Flame, Wind, Target, Zap, Clock,
  ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import { cn, getRelativeTime, formatPercent } from '@/lib/utils';
import { mockPredictions, mockEnvironmentalHealth, mockNodes } from '@/data/mock-data';
import type { AIPrediction, PredictionFactor } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const disasterIcons = { flood: Droplets, fire: Flame, pollution: Wind };
const disasterColors = { flood: '#2563EB', fire: '#EF4444', pollution: '#F59E0B' };
const riskColors = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', critical: '#DC2626' };

/* ─── SHAP Factor Bar ─── */
function FactorBar({ factor }: { factor: PredictionFactor }) {
  const pct = Math.abs(factor.contribution) * 100;
  const statusColors = { normal: '#22C55E', warning: '#F59E0B', critical: '#EF4444' };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-24 text-xs text-surface-500 text-right truncate">{factor.name}</div>
      <div className="flex-1 h-6 bg-surface-100 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 2.5}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: statusColors[factor.status] }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-surface-700">
          {factor.value} {factor.unit}
        </span>
      </div>
      <div className={cn(
        'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full',
        factor.status === 'normal' ? 'bg-success-50 text-success-700'
          : factor.status === 'warning' ? 'bg-warning-50 text-warning-700'
          : 'bg-critical-50 text-critical-700'
      )}>
        {factor.status}
      </div>
    </div>
  );
}

/* ─── Prediction Card ─── */
function PredictionCard({ prediction }: { prediction: AIPrediction }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = disasterIcons[prediction.type];
  const color = disasterColors[prediction.type];
  const risk = riskColors[prediction.riskLevel];

  return (
    <motion.div variants={item} className="eco-card">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}14` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-surface-900 capitalize">{prediction.type} Risk</span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: `${risk}14`, color: risk }}
            >
              {prediction.riskLevel}
            </span>
            <span className="text-xs text-surface-400 ml-auto">{getRelativeTime(prediction.predictedAt)}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-surface-400" />
              <span className="text-xs text-surface-600 font-medium">
                Confidence: <span className="text-surface-900 font-bold">{prediction.confidence}%</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {prediction.trend === 'increasing' ? (
                <TrendingUp className="w-3.5 h-3.5 text-critical-500" />
              ) : prediction.trend === 'decreasing' ? (
                <TrendingDown className="w-3.5 h-3.5 text-success-500" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-surface-400" />
              )}
              <span className={cn(
                'text-xs font-medium capitalize',
                prediction.trend === 'increasing' ? 'text-critical-600'
                  : prediction.trend === 'decreasing' ? 'text-success-600'
                  : 'text-surface-500'
              )}>
                {prediction.trend}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-surface-400" />
              <span className="text-xs text-surface-500">
                Acc: {prediction.historicalAccuracy}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="mt-4 p-3 rounded-xl bg-surface-50 border border-surface-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          <span className="text-[10px] font-semibold text-primary-700 uppercase tracking-wider">AI Recommendation</span>
        </div>
        <p className="text-xs text-surface-600 leading-relaxed">{prediction.recommendation}</p>
      </div>

      {/* Expand SHAP Factors */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
      >
        {expanded ? (
          <>Hide Factor Analysis <ChevronUp className="w-3.5 h-3.5" /></>
        ) : (
          <>View Factor Analysis (SHAP) <ChevronDown className="w-3.5 h-3.5" /></>
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 border-t border-surface-100 pt-3"
        >
          {prediction.factors.map((f) => (
            <FactorBar key={f.name} factor={f} />
          ))}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-surface-400">
            <Info className="w-3 h-3" />
            Bar width represents SHAP contribution to prediction
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Environmental Health Score ─── */
function HealthOverview() {
  const h = mockEnvironmentalHealth;
  const scoreColor = h.overallScore >= 70 ? '#22C55E' : h.overallScore >= 40 ? '#F59E0B' : '#EF4444';

  const metrics = [
    { label: 'Flood Risk', value: h.floodRisk, color: '#2563EB', icon: Droplets },
    { label: 'Fire Risk', value: h.fireRisk, color: '#EF4444', icon: Flame },
    { label: 'Pollution Index', value: Math.min(h.pollutionIndex, 100), color: '#F59E0B', icon: Wind },
    { label: 'AQI', value: Math.min(h.airQualityIndex / 3, 100), color: '#8B5CF6', icon: Shield },
    { label: 'Water Quality', value: h.waterQualityIndex, color: '#06B6D4', icon: Droplets },
  ];

  return (
    <motion.div variants={item} className="eco-card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-surface-900">Environmental Health Overview</h3>
      </div>

      <div className="flex items-center gap-8">
        {/* Big score */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={scoreColor} strokeWidth="8"
              strokeDasharray={`${h.overallScore * 2.64} 264`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: scoreColor, fontFamily: 'var(--font-heading)' }}>
              {h.overallScore}
            </span>
            <span className="text-[10px] text-surface-400">/ 100</span>
          </div>
        </div>

        {/* Metric bars */}
        <div className="flex-1 space-y-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-surface-500 flex items-center gap-1.5">
                  <m.icon className="w-3 h-3" style={{ color: m.color }} />
                  {m.label}
                </span>
                <span className="font-semibold text-surface-700">{Math.round(m.value)}%</span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: m.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(
        'mt-6 flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
        h.trend === 'improving' ? 'bg-success-50 text-success-700'
          : h.trend === 'deteriorating' ? 'bg-critical-50 text-critical-700'
          : 'bg-surface-50 text-surface-600'
      )}>
        {h.trend === 'improving' ? <TrendingUp className="w-3.5 h-3.5" /> : h.trend === 'deteriorating' ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
        Environment is <span className="font-semibold">{h.trend}</span> — Updated {getRelativeTime(h.lastUpdated)}
      </div>
    </motion.div>
  );
}

/* ─── Model Performance Stats ─── */
function ModelPerformance() {
  const models = [
    { name: 'Flood Predictor (XGBoost)', accuracy: 94.5, precision: 92.1, recall: 96.3, f1: 94.2, color: '#2563EB' },
    { name: 'Fire Detector (XGBoost)', accuracy: 88.3, precision: 85.7, recall: 91.2, f1: 88.4, color: '#EF4444' },
    { name: 'AQI Forecaster (LSTM)', accuracy: 92.1, precision: 90.5, recall: 93.8, f1: 92.1, color: '#F59E0B' },
  ];

  return (
    <motion.div variants={item} className="eco-card">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-5 h-5 text-secondary-500" />
        <h3 className="text-sm font-semibold text-surface-900">Model Performance</h3>
      </div>

      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.name} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: model.color }} />
              <span className="text-xs font-semibold text-surface-800">{model.name}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Accuracy', value: model.accuracy },
                { label: 'Precision', value: model.precision },
                { label: 'Recall', value: model.recall },
                { label: 'F1 Score', value: model.f1 },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-base font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.value}%
                  </div>
                  <div className="text-[10px] text-surface-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   AI INSIGHTS PAGE
   ═══════════════════════════════════════════ */
export default function AIInsightsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            AI Insights
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Machine learning predictions and explainable AI analysis</p>
        </div>
        <div className="eco-badge eco-badge-info">
          <Brain className="w-3.5 h-3.5" />
          {mockPredictions.length} Active Predictions
        </div>
      </motion.div>

      {/* Health Overview */}
      <HealthOverview />

      {/* Predictions */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning-500" />
          <h2 className="text-base font-semibold text-surface-900">Active Predictions</h2>
        </div>
        <div className="space-y-4">
          {mockPredictions.map((p) => (
            <PredictionCard key={p.id} prediction={p} />
          ))}
        </div>
      </motion.div>

      {/* Model Performance */}
      <ModelPerformance />
    </motion.div>
  );
}
