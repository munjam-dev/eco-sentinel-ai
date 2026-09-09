'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Map as MapIcon, MapPin, Filter, Layers, Eye,
  Droplets, Flame, Wind, Cpu, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockNodes } from '@/data/mock-data';
import { APP_CONFIG } from '@/config/app';
import { useMapStore } from '@/stores';
import type { DisasterType } from '@/types';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const disasterIcons: Record<DisasterType, React.ComponentType<{ className?: string }>> = {
  flood: Droplets,
  fire: Flame,
  pollution: Wind,
};
const disasterColors: Record<DisasterType, string> = { flood: '#2563EB', fire: '#EF4444', pollution: '#F59E0B' };

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [leafletLib, setLeafletLib] = useState<any>(null);
  const { visibleTypes, toggleType } = useMapStore();

  useEffect(() => {
    import('leaflet').then((L) => {
      setLeafletLib(L.default || L);
      setMounted(true);
    });
  }, []);

  const filteredNodes = mockNodes.filter((n) => visibleTypes.includes(n.type));

  if (!mounted || !leafletLib) {
    return (
      <div className="space-y-6">
        <div className="eco-card h-16 animate-shimmer" />
        <div className="eco-card h-[600px] animate-shimmer" />
      </div>
    );
  }

  const createIcon = (type: DisasterType, status: string) => {
    const color = disasterColors[type] || '#2563EB';
    return leafletLib.divIcon({
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
      html: `
        <div style="
          width: 36px; height: 36px; border-radius: 50%;
          background: ${status === 'offline' ? '#94A3B8' : color};
          border: 3px solid white;
          box-shadow: 0 2px 8px ${status === 'offline' ? 'rgba(0,0,0,0.15)' : color + '60'};
          display: flex; align-items: center; justify-content: center;
        "></div>
      `,
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Monitoring Map
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Geographic view of all sensor nodes and zones</p>
        </div>
        <div className="flex items-center gap-2">
          {(['flood', 'fire', 'pollution'] as const).map((type) => {
            const Icon = disasterIcons[type];
            const active = visibleTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                  active ? 'border-surface-300 bg-white shadow-sm' : 'border-transparent bg-surface-100 text-surface-400'
                )}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: active ? disasterColors[type] : '#CBD5E1' }} />
                {type}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Flood Monitors', count: mockNodes.filter((n) => n.type === 'flood').length, color: '#2563EB', icon: Droplets },
          { label: 'Fire Watchers', count: mockNodes.filter((n) => n.type === 'fire').length, color: '#EF4444', icon: Flame },
          { label: 'Air Quality', count: mockNodes.filter((n) => n.type === 'pollution').length, color: '#F59E0B', icon: Wind },
        ].map((s) => (
          <div key={s.label} className="eco-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}14` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>{s.count}</div>
              <div className="text-xs text-surface-500">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Full Map */}
      <motion.div variants={item} className="eco-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4.5 h-4.5 text-primary-600" />
            <h3 className="text-sm font-semibold text-surface-900">Sensor Network</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-surface-400" />
            <span className="text-xs text-surface-500">{filteredNodes.length} nodes visible</span>
          </div>
        </div>
        <MapContainer
          center={[APP_CONFIG.map.center.lat, APP_CONFIG.map.center.lng]}
          zoom={APP_CONFIG.map.zoom}
          style={{ height: 600, width: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url={APP_CONFIG.map.tileUrl} />
          {filteredNodes.map((node) => (
            <Marker key={node.id} position={[node.location.lat, node.location.lng]} icon={createIcon(node.type, node.status)}>
              <Popup closeButton={false}>
                <div className="p-4 min-w-[260px]" style={{ fontFamily: 'var(--font-body)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: node.status === 'online' ? '#22C55E' : node.status === 'warning' ? '#F59E0B' : '#EF4444' }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: disasterColors[node.type] }}>{node.type} Monitor</span>
                  </div>
                  <h3 className="text-base font-bold text-surface-900">{node.name}</h3>
                  <p className="text-xs text-surface-400 mb-3">{node.location.address}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-50 rounded-lg p-2">
                      <div className="text-[10px] text-surface-400">Temp</div>
                      <div className="text-sm font-semibold text-surface-800">{node.latestReading.temperature}°C</div>
                    </div>
                    <div className="bg-surface-50 rounded-lg p-2">
                      <div className="text-[10px] text-surface-400">Health</div>
                      <div className="text-sm font-semibold text-surface-800">{node.healthScore}%</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </motion.div>
    </motion.div>
  );
}
