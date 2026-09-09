/* ============================================
   ECOSENTINEL AI — Mock Data
   Realistic simulated data for demo purposes
   ============================================ */

import type {
  SensorNode,
  Alert,
  AIPrediction,
  EnvironmentalHealth,
  DashboardKPIs,
  SensorReading,
} from '@/types';

// ── Helper ──────────────────────────────────
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}
function minsAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

// ── Sensor Nodes ────────────────────────────
export const mockNodes: SensorNode[] = [
  {
    id: 'NODE-001',
    name: 'Kaziranga East Tower',
    location: { lat: 26.58, lng: 93.17, address: 'Kaziranga National Park, Assam', zone: 'Zone A' },
    status: 'online',
    type: 'flood',
    lastHeartbeat: minsAgo(2),
    firmware: 'v3.2.1',
    batteryLevel: 87,
    signalStrength: -42,
    healthScore: 94,
    installedDate: '2025-03-15',
    calibrationDate: '2025-12-01',
    latestReading: {
      id: 'R-001', nodeId: 'NODE-001', timestamp: minsAgo(1),
      temperature: 28.4, humidity: 82, pressure: 1008, co2: 412,
      pm25: 22, pm10: 38, waterLevel: 2.8, smokeLevel: 12,
      windSpeed: 14, windDirection: 225, rainfall: 45, soilMoisture: 78, uv: 4,
    },
  },
  {
    id: 'NODE-002',
    name: 'Jim Corbett Watchtower',
    location: { lat: 29.53, lng: 78.77, address: 'Jim Corbett National Park, Uttarakhand', zone: 'Zone B' },
    status: 'online',
    type: 'fire',
    lastHeartbeat: minsAgo(1),
    firmware: 'v3.2.1',
    batteryLevel: 92,
    signalStrength: -38,
    healthScore: 97,
    installedDate: '2025-02-20',
    calibrationDate: '2025-11-15',
    latestReading: {
      id: 'R-002', nodeId: 'NODE-002', timestamp: minsAgo(1),
      temperature: 42.1, humidity: 18, pressure: 1012, co2: 580,
      pm25: 85, pm10: 145, waterLevel: 0.2, smokeLevel: 340,
      windSpeed: 28, windDirection: 180, rainfall: 0, soilMoisture: 15, uv: 9,
    },
  },
  {
    id: 'NODE-003',
    name: 'Delhi NCR Monitor',
    location: { lat: 28.61, lng: 77.23, address: 'Connaught Place, New Delhi', zone: 'Zone C' },
    status: 'online',
    type: 'pollution',
    lastHeartbeat: minsAgo(3),
    firmware: 'v3.1.8',
    batteryLevel: 76,
    signalStrength: -55,
    healthScore: 85,
    installedDate: '2025-01-10',
    calibrationDate: '2025-10-20',
    latestReading: {
      id: 'R-003', nodeId: 'NODE-003', timestamp: minsAgo(2),
      temperature: 34.6, humidity: 45, pressure: 1010, co2: 720,
      pm25: 180, pm10: 295, waterLevel: 0, smokeLevel: 85,
      windSpeed: 8, windDirection: 315, rainfall: 0, soilMoisture: 32, uv: 6,
    },
  },
  {
    id: 'NODE-004',
    name: 'Sundarbans Delta',
    location: { lat: 21.94, lng: 89.18, address: 'Sundarbans, West Bengal', zone: 'Zone D' },
    status: 'online',
    type: 'flood',
    lastHeartbeat: minsAgo(5),
    firmware: 'v3.2.0',
    batteryLevel: 68,
    signalStrength: -62,
    healthScore: 78,
    installedDate: '2025-04-05',
    calibrationDate: '2025-12-10',
    latestReading: {
      id: 'R-004', nodeId: 'NODE-004', timestamp: minsAgo(3),
      temperature: 31.2, humidity: 91, pressure: 1004, co2: 398,
      pm25: 35, pm10: 52, waterLevel: 4.2, smokeLevel: 8,
      windSpeed: 22, windDirection: 135, rainfall: 78, soilMoisture: 95, uv: 3,
    },
  },
  {
    id: 'NODE-005',
    name: 'Western Ghats Station',
    location: { lat: 12.49, lng: 75.73, address: 'Madikeri, Karnataka', zone: 'Zone E' },
    status: 'warning',
    type: 'flood',
    lastHeartbeat: minsAgo(12),
    firmware: 'v3.1.5',
    batteryLevel: 34,
    signalStrength: -78,
    healthScore: 62,
    installedDate: '2025-05-18',
    calibrationDate: '2025-09-01',
    latestReading: {
      id: 'R-005', nodeId: 'NODE-005', timestamp: minsAgo(10),
      temperature: 24.8, humidity: 94, pressure: 1002, co2: 405,
      pm25: 18, pm10: 28, waterLevel: 3.6, smokeLevel: 5,
      windSpeed: 35, windDirection: 270, rainfall: 120, soilMoisture: 92, uv: 2,
    },
  },
  {
    id: 'NODE-006',
    name: 'Rajasthan Fire Watch',
    location: { lat: 26.92, lng: 70.9, address: 'Thar Desert, Rajasthan', zone: 'Zone F' },
    status: 'online',
    type: 'fire',
    lastHeartbeat: minsAgo(1),
    firmware: 'v3.2.1',
    batteryLevel: 95,
    signalStrength: -35,
    healthScore: 99,
    installedDate: '2025-06-01',
    calibrationDate: '2026-01-15',
    latestReading: {
      id: 'R-006', nodeId: 'NODE-006', timestamp: minsAgo(1),
      temperature: 46.3, humidity: 8, pressure: 1015, co2: 450,
      pm25: 42, pm10: 68, waterLevel: 0, smokeLevel: 180,
      windSpeed: 18, windDirection: 90, rainfall: 0, soilMoisture: 5, uv: 11,
    },
  },
  {
    id: 'NODE-007',
    name: 'Mumbai AQI Station',
    location: { lat: 19.076, lng: 72.877, address: 'Marine Drive, Mumbai', zone: 'Zone G' },
    status: 'online',
    type: 'pollution',
    lastHeartbeat: minsAgo(2),
    firmware: 'v3.2.1',
    batteryLevel: 81,
    signalStrength: -48,
    healthScore: 90,
    installedDate: '2025-07-22',
    calibrationDate: '2026-02-01',
    latestReading: {
      id: 'R-007', nodeId: 'NODE-007', timestamp: minsAgo(1),
      temperature: 32.1, humidity: 72, pressure: 1009, co2: 650,
      pm25: 95, pm10: 160, waterLevel: 0.8, smokeLevel: 45,
      windSpeed: 12, windDirection: 200, rainfall: 5, soilMoisture: 55, uv: 7,
    },
  },
  {
    id: 'NODE-008',
    name: 'Himalayan Watch',
    location: { lat: 30.73, lng: 79.07, address: 'Kedarnath, Uttarakhand', zone: 'Zone H' },
    status: 'offline',
    type: 'flood',
    lastHeartbeat: hoursAgo(4),
    firmware: 'v3.1.2',
    batteryLevel: 12,
    signalStrength: -90,
    healthScore: 25,
    installedDate: '2025-08-10',
    calibrationDate: '2025-08-10',
    latestReading: {
      id: 'R-008', nodeId: 'NODE-008', timestamp: hoursAgo(4),
      temperature: 8.2, humidity: 88, pressure: 998, co2: 380,
      pm25: 12, pm10: 18, waterLevel: 5.8, smokeLevel: 2,
      windSpeed: 45, windDirection: 350, rainfall: 95, soilMoisture: 88, uv: 1,
    },
  },
];

// ── Alerts ──────────────────────────────────
export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    nodeId: 'NODE-004',
    nodeName: 'Sundarbans Delta',
    type: 'flood',
    severity: 'critical',
    status: 'active',
    title: 'Critical Water Level — Sundarbans Delta',
    message: 'Water level has exceeded 4.0m threshold. Immediate evacuation advisory recommended for low-lying areas.',
    timestamp: minsAgo(8),
    location: { lat: 21.94, lng: 89.18, address: 'Sundarbans, West Bengal' },
    sensorValues: { waterLevel: 4.2, rainfall: 78, humidity: 91 },
    aiRecommendation: 'Deploy emergency response team. Predicted water level to reach 5.1m within 6 hours. Evacuate settlements within 2km radius.',
  },
  {
    id: 'ALT-002',
    nodeId: 'NODE-002',
    nodeName: 'Jim Corbett Watchtower',
    type: 'fire',
    severity: 'high',
    status: 'active',
    title: 'Elevated Fire Risk — Jim Corbett',
    message: 'Smoke levels at 340 units with temperature 42.1°C and humidity at 18%. High probability of forest fire.',
    timestamp: minsAgo(15),
    location: { lat: 29.53, lng: 78.77, address: 'Jim Corbett NP, Uttarakhand' },
    sensorValues: { temperature: 42.1, smokeLevel: 340, humidity: 18, windSpeed: 28 },
    aiRecommendation: 'Alert fire brigade. Wind direction suggests fire spread toward eastern quadrant. Create firebreak at grid reference E7.',
  },
  {
    id: 'ALT-003',
    nodeId: 'NODE-003',
    nodeName: 'Delhi NCR Monitor',
    type: 'pollution',
    severity: 'high',
    status: 'active',
    title: 'Severe Air Quality — Delhi NCR',
    message: 'PM2.5 at 180 µg/m³ — AQI category: Very Poor. Health advisory issued.',
    timestamp: minsAgo(22),
    location: { lat: 28.61, lng: 77.23, address: 'New Delhi' },
    sensorValues: { pm25: 180, pm10: 295, co2: 720 },
    aiRecommendation: 'Issue public health advisory. Recommend N95 masks for outdoor workers. Expected to worsen by evening due to temperature inversion.',
  },
  {
    id: 'ALT-004',
    nodeId: 'NODE-008',
    nodeName: 'Himalayan Watch',
    type: 'flood',
    severity: 'critical',
    status: 'active',
    title: 'Node Offline + Critical Water Level',
    message: 'Node NODE-008 offline for 4 hours. Last reading showed water level at 5.8m (critical). Possible flash flood.',
    timestamp: hoursAgo(4),
    location: { lat: 30.73, lng: 79.07, address: 'Kedarnath, Uttarakhand' },
    sensorValues: { waterLevel: 5.8, rainfall: 95, windSpeed: 45 },
    aiRecommendation: 'URGENT: Deploy aerial reconnaissance. Node communication lost — possible infrastructure damage. Flash flood probability: 87%.',
  },
  {
    id: 'ALT-005',
    nodeId: 'NODE-006',
    nodeName: 'Rajasthan Fire Watch',
    type: 'fire',
    severity: 'medium',
    status: 'acknowledged',
    title: 'Elevated Temperature Warning',
    message: 'Temperature at 46.3°C with extremely low humidity (8%). Conditions favorable for wildfire.',
    timestamp: minsAgo(45),
    location: { lat: 26.92, lng: 70.9, address: 'Thar Desert, Rajasthan' },
    sensorValues: { temperature: 46.3, humidity: 8, smokeLevel: 180 },
    aiRecommendation: 'Monitor closely. Smoke levels rising. If wind shifts to westerly, fire risk escalates to HIGH.',
    acknowledgedBy: 'Ops Team Lead',
  },
  {
    id: 'ALT-006',
    nodeId: 'NODE-005',
    nodeName: 'Western Ghats Station',
    type: 'flood',
    severity: 'medium',
    status: 'active',
    title: 'Heavy Rainfall Warning — Western Ghats',
    message: 'Rainfall at 120mm/hr. Water level approaching warning threshold at 3.6m. Low battery warning on node.',
    timestamp: minsAgo(35),
    location: { lat: 12.49, lng: 75.73, address: 'Madikeri, Karnataka' },
    sensorValues: { waterLevel: 3.6, rainfall: 120, humidity: 94 },
    aiRecommendation: 'Rainfall predicted to continue for 8 more hours. Water level may reach 4.5m. Prepare evacuation for riverside settlements.',
  },
];

// ── AI Predictions ──────────────────────────
export const mockPredictions: AIPrediction[] = [
  {
    id: 'PRED-001',
    type: 'flood',
    riskLevel: 'critical',
    confidence: 91.2,
    predictedAt: minsAgo(5),
    validUntil: new Date(Date.now() + 6 * 3600_000).toISOString(),
    location: { lat: 21.94, lng: 89.18, radius: 15 },
    recommendation: 'Immediate evacuation of low-lying settlements within 15km radius. Deploy 3 rescue boats to Sundarbans Delta sector.',
    trend: 'increasing',
    historicalAccuracy: 94.5,
    factors: [
      { name: 'Water Level', value: 4.2, contribution: 0.35, unit: 'm', threshold: 3.0, status: 'critical' },
      { name: 'Rainfall', value: 78, contribution: 0.28, unit: 'mm/hr', threshold: 50, status: 'critical' },
      { name: 'Soil Moisture', value: 95, contribution: 0.18, unit: '%', threshold: 85, status: 'critical' },
      { name: 'Humidity', value: 91, contribution: 0.12, unit: '%', threshold: 85, status: 'warning' },
      { name: 'Wind Speed', value: 22, contribution: 0.07, unit: 'km/h', threshold: 50, status: 'normal' },
    ],
  },
  {
    id: 'PRED-002',
    type: 'fire',
    riskLevel: 'high',
    confidence: 84.7,
    predictedAt: minsAgo(10),
    validUntil: new Date(Date.now() + 12 * 3600_000).toISOString(),
    location: { lat: 29.53, lng: 78.77, radius: 8 },
    recommendation: 'Pre-position fire brigade at eastern corridor. Create 200m firebreak along grid E6-E8. Prepare aerial water-dropping operations.',
    trend: 'increasing',
    historicalAccuracy: 88.3,
    factors: [
      { name: 'Smoke Level', value: 340, contribution: 0.32, unit: 'ppm', threshold: 200, status: 'critical' },
      { name: 'Temperature', value: 42.1, contribution: 0.28, unit: '°C', threshold: 38, status: 'critical' },
      { name: 'Humidity', value: 18, contribution: 0.22, unit: '%', threshold: 30, status: 'critical' },
      { name: 'Wind Speed', value: 28, contribution: 0.12, unit: 'km/h', threshold: 50, status: 'normal' },
      { name: 'Soil Moisture', value: 15, contribution: 0.06, unit: '%', threshold: 25, status: 'warning' },
    ],
  },
  {
    id: 'PRED-003',
    type: 'pollution',
    riskLevel: 'high',
    confidence: 88.5,
    predictedAt: minsAgo(3),
    validUntil: new Date(Date.now() + 24 * 3600_000).toISOString(),
    location: { lat: 28.61, lng: 77.23, radius: 25 },
    recommendation: 'Issue public health advisory level 3. Recommend schools closure. Deploy mobile air purification units to hospitals.',
    trend: 'increasing',
    historicalAccuracy: 92.1,
    factors: [
      { name: 'PM2.5', value: 180, contribution: 0.38, unit: 'µg/m³', threshold: 60, status: 'critical' },
      { name: 'PM10', value: 295, contribution: 0.25, unit: 'µg/m³', threshold: 100, status: 'critical' },
      { name: 'CO2', value: 720, contribution: 0.18, unit: 'ppm', threshold: 800, status: 'warning' },
      { name: 'Wind Speed', value: 8, contribution: 0.12, unit: 'km/h', threshold: 15, status: 'warning' },
      { name: 'Temperature', value: 34.6, contribution: 0.07, unit: '°C', threshold: 38, status: 'normal' },
    ],
  },
];

// ── Environmental Health ────────────────────
export const mockEnvironmentalHealth: EnvironmentalHealth = {
  overallScore: 62,
  floodRisk: 78,
  fireRisk: 71,
  pollutionIndex: 165,
  airQualityIndex: 182,
  waterQualityIndex: 45,
  trend: 'deteriorating',
  lastUpdated: minsAgo(1),
};

// ── Dashboard KPIs ──────────────────────────
export const mockKPIs: DashboardKPIs = {
  activeAlerts: 5,
  activeAlertsTrend: 12.5,
  onlineNodes: 6,
  totalNodes: 8,
  aiHealthScore: 62,
  aiHealthTrend: -4.2,
  avgResponseTime: 1.8,
  responseTrend: -8.3,
  predictionsToday: 847,
  accuracy: 91.4,
};

// ── Time Series Generator ───────────────────
export function generateTimeSeries(
  hours: number,
  baseValue: number,
  variance: number,
  trend: 'up' | 'down' | 'stable' = 'stable'
): { timestamp: string; value: number }[] {
  const points: { timestamp: string; value: number }[] = [];
  const now = Date.now();
  const interval = (hours * 3600_000) / 100;

  for (let i = 0; i < 100; i++) {
    const trendFactor = trend === 'up' ? i * 0.02 : trend === 'down' ? -i * 0.02 : 0;
    const noise = (Math.random() - 0.5) * variance;
    const value = Math.max(0, baseValue + trendFactor * baseValue + noise);
    points.push({
      timestamp: new Date(now - (100 - i) * interval).toISOString(),
      value: Math.round(value * 10) / 10,
    });
  }
  return points;
}

// ── Chart Data Generators ───────────────────
export const mockChartData = {
  temperatureTrend: generateTimeSeries(24, 32, 8, 'up'),
  humidityTrend: generateTimeSeries(24, 65, 20, 'stable'),
  pm25Trend: generateTimeSeries(24, 85, 40, 'up'),
  waterLevelTrend: generateTimeSeries(24, 2.5, 1.5, 'up'),
  smokeTrend: generateTimeSeries(24, 120, 80, 'up'),
  co2Trend: generateTimeSeries(24, 550, 100, 'stable'),

  alertDistribution: [
    { name: 'Flood', value: 12, color: '#2563EB' },
    { name: 'Fire', value: 8, color: '#EF4444' },
    { name: 'Pollution', value: 15, color: '#F59E0B' },
  ],

  nodeStatusDistribution: [
    { name: 'Online', value: 6, color: '#22C55E' },
    { name: 'Warning', value: 1, color: '#F59E0B' },
    { name: 'Offline', value: 1, color: '#EF4444' },
  ],

  hourlyAlerts: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    flood: Math.floor(Math.random() * 5),
    fire: Math.floor(Math.random() * 3),
    pollution: Math.floor(Math.random() * 4),
  })),

  weeklyTrend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    alerts: Math.floor(Math.random() * 20 + 5),
    predictions: Math.floor(Math.random() * 100 + 50),
  })),
};
