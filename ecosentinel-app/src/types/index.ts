/* ============================================
   ECOSENTINEL AI — Core Type Definitions
   ============================================ */

// Disaster Types
export type DisasterType = 'flood' | 'fire' | 'pollution';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type NodeStatus = 'online' | 'offline' | 'warning' | 'maintenance';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated';

// Sensor Reading
export interface SensorReading {
  id: string;
  nodeId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  co2: number;
  pm25: number;
  pm10: number;
  waterLevel: number;
  smokeLevel: number;
  windSpeed: number;
  windDirection: number;
  rainfall: number;
  soilMoisture: number;
  uv: number;
}

// Node
export interface SensorNode {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    zone: string;
  };
  status: NodeStatus;
  type: DisasterType;
  lastHeartbeat: string;
  firmware: string;
  batteryLevel: number;
  signalStrength: number;
  latestReading: SensorReading;
  healthScore: number;
  installedDate: string;
  calibrationDate: string;
}

// Alert
export interface Alert {
  id: string;
  nodeId: string;
  nodeName: string;
  type: DisasterType;
  severity: Severity;
  status: AlertStatus;
  title: string;
  message: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  sensorValues: Record<string, number>;
  aiRecommendation?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

// AI Prediction
export interface AIPrediction {
  id: string;
  type: DisasterType;
  riskLevel: Severity;
  confidence: number;
  predictedAt: string;
  validUntil: string;
  location: {
    lat: number;
    lng: number;
    radius: number;
  };
  factors: PredictionFactor[];
  recommendation: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  historicalAccuracy: number;
}

export interface PredictionFactor {
  name: string;
  value: number;
  contribution: number; // SHAP value
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

// Environmental Health
export interface EnvironmentalHealth {
  overallScore: number;
  floodRisk: number;
  fireRisk: number;
  pollutionIndex: number;
  airQualityIndex: number;
  waterQualityIndex: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  lastUpdated: string;
}

// Dashboard KPIs
export interface DashboardKPIs {
  activeAlerts: number;
  activeAlertsTrend: number;
  onlineNodes: number;
  totalNodes: number;
  aiHealthScore: number;
  aiHealthTrend: number;
  avgResponseTime: number;
  responseTrend: number;
  predictionsToday: number;
  accuracy: number;
}

// Chart Data
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  data: TimeSeriesPoint[] | number[];
  color?: string;
}

// Report
export interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'incident';
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  format: 'pdf' | 'excel' | 'csv';
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
  summary: string;
}

// Navigation
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

// Theme
export type Theme = 'light' | 'dark';

// WebSocket Events
export interface WSMessage {
  type: 'sensor_update' | 'alert' | 'prediction' | 'node_status' | 'heartbeat';
  payload: unknown;
  timestamp: string;
}

// Analytics
export interface AnalyticsQuery {
  metric: string;
  startDate: string;
  endDate: string;
  nodeIds?: string[];
  disasterType?: DisasterType;
  interval: '1h' | '6h' | '1d' | '1w' | '1m';
}

export interface AnalyticsResult {
  metric: string;
  series: ChartSeries[];
  summary: {
    min: number;
    max: number;
    avg: number;
    current: number;
  };
}
