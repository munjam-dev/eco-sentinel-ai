/* ============================================
   ECOSENTINEL AI — Application Configuration
   ============================================ */

export const APP_CONFIG = {
  name: 'EcoSentinel AI',
  description: 'AI-Powered Environmental Disaster Monitoring Platform',
  version: '1.0.0',
  tagline: 'Protecting Our Planet with Intelligence',
  
  // API
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/live',
  
  // Map defaults
  map: {
    center: { lat: 20.5937, lng: 78.9629 }, // India center
    zoom: 5,
    maxZoom: 18,
    minZoom: 3,
    tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    darkTileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
  
  // Thresholds
  thresholds: {
    temperature: { warning: 38, critical: 45 },
    humidity: { warning: 85, critical: 95 },
    co2: { warning: 800, critical: 1500 },
    pm25: { warning: 60, critical: 150 },
    pm10: { warning: 100, critical: 250 },
    waterLevel: { warning: 3.0, critical: 5.0 },
    smokeLevel: { warning: 200, critical: 500 },
    windSpeed: { warning: 50, critical: 80 },
    rainfall: { warning: 50, critical: 100 },
    aqi: { warning: 100, critical: 200 },
  },
  
  // Refresh intervals (ms)
  refreshIntervals: {
    dashboard: 30000,
    sensors: 10000,
    alerts: 5000,
    predictions: 60000,
    heartbeat: 15000,
  },
  
  // Navigation
  nav: {
    dashboard: { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    monitoring: { label: 'Monitoring', href: '/dashboard/monitoring', icon: 'Activity' },
    map: { label: 'Map', href: '/dashboard/map', icon: 'Map' },
    analytics: { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
    aiInsights: { label: 'AI Insights', href: '/dashboard/ai-insights', icon: 'Brain' },
    historical: { label: 'Historical', href: '/dashboard/historical', icon: 'History' },
    reports: { label: 'Reports', href: '/dashboard/reports', icon: 'FileText' },
    alerts: { label: 'Alerts', href: '/dashboard/alerts', icon: 'Bell' },
    nodes: { label: 'Nodes', href: '/dashboard/nodes', icon: 'Cpu' },
    settings: { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
    about: { label: 'About', href: '/dashboard/about', icon: 'Info' },
  },
} as const;

export type NavKey = keyof typeof APP_CONFIG.nav;
