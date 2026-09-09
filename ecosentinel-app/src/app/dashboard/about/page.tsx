'use client';

import { motion } from 'framer-motion';
import {
  Shield, Mail, Globe,
  Cpu, Brain, Activity, Zap, Target, Users,
  Heart, Code2, ExternalLink, Star, CheckCircle2,
  Droplets, Flame, Wind, Layers, FileText,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AboutPage() {
  const techStack = [
    { category: 'Frontend', items: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'ApexCharts', 'Leaflet'] },
    { category: 'Backend', items: ['FastAPI', 'Python', 'WebSockets', 'PostgreSQL', 'Supabase'] },
    { category: 'AI / ML', items: ['XGBoost', 'SHAP', 'Scikit-learn', 'Pandas', 'NumPy'] },
    { category: 'IoT', items: ['ESP32', 'LoRa', 'MQTT', 'Environmental Sensors'] },
  ];

  const features = [
    { icon: Activity, label: 'Real-Time Monitoring', description: 'Live sensor feeds with WebSocket streaming' },
    { icon: Brain, label: 'AI Predictions', description: '94% accurate disaster forecasting with XGBoost' },
    { icon: Shield, label: 'Multi-Hazard Detection', description: 'Floods, fires, and pollution in one platform' },
    { icon: Layers, label: 'Explainable AI', description: 'SHAP-based feature importance analysis' },
    { icon: Cpu, label: 'IoT Integration', description: 'ESP32 nodes with LoRa-ready architecture' },
    { icon: FileText, label: 'Automated Reports', description: 'PDF, Excel, and CSV with AI insights' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      {/* Hero */}
      <motion.div variants={item} className="eco-card overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-secondary-500/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
                EcoSentinel AI
              </h1>
              <p className="text-sm text-surface-500">AI-Powered Environmental Disaster Monitoring Platform</p>
            </div>
          </div>
          <p className="text-sm text-surface-600 leading-relaxed max-w-2xl">
            EcoSentinel AI is a comprehensive environmental monitoring platform that leverages IoT sensors,
            machine learning, and explainable AI to detect, predict, and respond to natural disasters in real-time.
            Built for government agencies, conservation organizations, and disaster management authorities.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs text-surface-400 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" />
              Version 1.0.0
            </span>
            <span className="text-xs text-surface-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-critical-500" />
              Built with passion for the planet
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key Features */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold text-surface-900 mb-3">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.label} className="eco-card flex items-start gap-3 py-4">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-4.5 h-4.5 text-primary-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-surface-900">{f.label}</h4>
                <p className="text-xs text-surface-500 mt-0.5">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold text-surface-900 mb-3">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {techStack.map((group) => (
            <div key={group.category} className="eco-card">
              <h4 className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-3">{group.category}</h4>
              <div className="space-y-2">
                {group.items.map((tech) => (
                  <div key={tech} className="flex items-center gap-2 text-xs text-surface-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-500 flex-shrink-0" />
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platform Stats */}
      <motion.div variants={item} className="eco-card">
        <h2 className="text-sm font-semibold text-surface-900 mb-4">Platform Capabilities</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { value: '10K+', label: 'Sensors', icon: Cpu },
            { value: '94%', label: 'AI Accuracy', icon: Target },
            { value: '<2s', label: 'Response', icon: Zap },
            { value: '99.9%', label: 'Uptime', icon: Activity },
            { value: '3', label: 'Disaster Types', icon: Shield },
            { value: '15+', label: 'Agencies', icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2">
              <stat.icon className="w-4 h-4 text-primary-500 mx-auto mb-1.5" />
              <div className="text-lg font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
              <div className="text-[10px] text-surface-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={item} className="text-center py-6">
        <p className="text-xs text-surface-400">
          © 2026 EcoSentinel AI Platform. Protecting our planet with intelligence.
        </p>
      </motion.div>
    </motion.div>
  );
}
