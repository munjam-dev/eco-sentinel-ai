'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Droplets, Flame, Wind, Cpu, MapPin, AlertTriangle, Brain } from 'lucide-react';
import { mockNodes } from '@/data/mock-data';
import { cn, getSeverityColor } from '@/lib/utils';
import { APP_CONFIG } from '@/config/app';
import type { DisasterType } from '@/types';
import 'leaflet/dist/leaflet.css';

/* ─── Custom Marker Icons ─── */
function createMarkerIcon(type: DisasterType, status: string): L.DivIcon {
  const colors: Record<DisasterType, string> = {
    flood: '#2563EB',
    fire: '#EF4444',
    pollution: '#F59E0B',
  };
  const color = colors[type] || '#64748B';
  const isOffline = status === 'offline';

  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    html: `
      <div style="
        width: 36px; height: 36px; border-radius: 50%;
        background: ${isOffline ? '#94A3B8' : color};
        border: 3px solid white;
        box-shadow: 0 2px 8px ${isOffline ? 'rgba(0,0,0,0.15)' : color + '60'};
        display: flex; align-items: center; justify-content: center;
        position: relative;
        ${!isOffline ? 'animation: marker-pulse 2s ease-in-out infinite;' : ''}
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${type === 'flood' ? '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>' : ''}
          ${type === 'fire' ? '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>' : ''}
          ${type === 'pollution' ? '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>' : ''}
        </svg>
        ${!isOffline ? `<div style="
          position: absolute; width: 100%; height: 100%;
          border-radius: 50%; background: ${color};
          opacity: 0.3; animation: marker-ring 2s ease-out infinite;
        "></div>` : ''}
      </div>
      <style>
        @keyframes marker-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes marker-ring { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(2.2); opacity: 0; } }
      </style>
    `,
  });
}

/* ─── Node Popup ─── */
function NodePopup({ node }: { node: typeof mockNodes[0] }) {
  const disasterLabels: Record<DisasterType, string> = { flood: 'Flood Monitor', fire: 'Fire Watch', pollution: 'Air Quality' };
  const disasterColors: Record<DisasterType, string> = { flood: '#2563EB', fire: '#EF4444', pollution: '#F59E0B' };

  return (
    <div className="p-4 min-w-[280px]" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ background: node.status === 'online' ? '#22C55E' : node.status === 'warning' ? '#F59E0B' : '#EF4444' }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: disasterColors[node.type] }}>
          {disasterLabels[node.type]}
        </span>
      </div>
      <h3 className="text-base font-bold text-surface-900 mb-0.5">{node.name}</h3>
      <p className="text-xs text-surface-400 mb-3">{node.location.address}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Temp', value: `${node.latestReading.temperature}°C` },
          { label: 'Humidity', value: `${node.latestReading.humidity}%` },
          { label: 'PM2.5', value: `${node.latestReading.pm25}` },
          { label: 'Water', value: `${node.latestReading.waterLevel}m` },
        ].map((m) => (
          <div key={m.label} className="bg-surface-50 rounded-lg p-2">
            <div className="text-[10px] text-surface-400">{m.label}</div>
            <div className="text-sm font-semibold text-surface-800">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-surface-400">
          <Cpu className="w-3 h-3" />
          {node.id}
        </div>
        <span className="text-surface-300">•</span>
        <span className="text-surface-400">Battery: {node.batteryLevel}%</span>
      </div>
    </div>
  );
}

/* ─── Map Component ─── */
export default function DashboardMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="eco-card h-[400px] animate-shimmer" />;

  return (
    <div className="eco-card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4.5 h-4.5 text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-900">Monitoring Map</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {[
            { label: 'Flood', color: '#2563EB' },
            { label: 'Fire', color: '#EF4444' },
            { label: 'Pollution', color: '#F59E0B' },
          ].map((legend) => (
            <div key={legend.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: legend.color }} />
              <span className="text-surface-500">{legend.label}</span>
            </div>
          ))}
        </div>
      </div>
      <MapContainer
        center={[APP_CONFIG.map.center.lat, APP_CONFIG.map.center.lng]}
        zoom={APP_CONFIG.map.zoom}
        style={{ height: 400, width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={APP_CONFIG.map.tileUrl} />
        {mockNodes.map((node) => (
          <Marker
            key={node.id}
            position={[node.location.lat, node.location.lng]}
            icon={createMarkerIcon(node.type, node.status)}
          >
            <Popup closeButton={false} className="eco-popup">
              <NodePopup node={node} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
