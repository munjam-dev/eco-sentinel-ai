/* ============================================
   ECOSENTINEL AI — Zustand Stores
   ============================================ */

import { create } from 'zustand';
import type { Alert, SensorNode, DisasterType, Theme } from '@/types';
import { mockAlerts, mockNodes } from '@/data/mock-data';

// ── App Store ───────────────────────────────
interface AppState {
  theme: Theme;
  sidebarOpen: boolean;
  alertPanelOpen: boolean;
  searchQuery: string;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  toggleAlertPanel: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  alertPanelOpen: true,
  searchQuery: '',
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAlertPanel: () => set((s) => ({ alertPanelOpen: !s.alertPanelOpen })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

// ── Alert Store ─────────────────────────────
interface AlertState {
  alerts: Alert[];
  selectedAlert: Alert | null;
  filterType: DisasterType | 'all';
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  selectAlert: (alert: Alert | null) => void;
  setFilterType: (type: DisasterType | 'all') => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: mockAlerts,
  selectedAlert: null,
  filterType: 'all',
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),
  selectAlert: (selectedAlert) => set({ selectedAlert }),
  setFilterType: (filterType) => set({ filterType }),
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged' as const } : a
      ),
    })),
  resolveAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id
          ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
          : a
      ),
    })),
}));

// ── Node Store ──────────────────────────────
interface NodeState {
  nodes: SensorNode[];
  selectedNode: SensorNode | null;
  setNodes: (nodes: SensorNode[]) => void;
  selectNode: (node: SensorNode | null) => void;
  updateNode: (id: string, updates: Partial<SensorNode>) => void;
}

export const useNodeStore = create<NodeState>((set) => ({
  nodes: mockNodes,
  selectedNode: null,
  setNodes: (nodes) => set({ nodes }),
  selectNode: (selectedNode) => set({ selectedNode }),
  updateNode: (id, updates) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
}));

// ── Map Store ───────────────────────────────
interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  showHeatmap: boolean;
  showClusters: boolean;
  visibleTypes: DisasterType[];
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  toggleHeatmap: () => void;
  toggleClusters: () => void;
  toggleType: (type: DisasterType) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: { lat: 20.5937, lng: 78.9629 },
  zoom: 5,
  showHeatmap: false,
  showClusters: false,
  visibleTypes: ['flood', 'fire', 'pollution'],
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),
  toggleClusters: () => set((s) => ({ showClusters: !s.showClusters })),
  toggleType: (type) =>
    set((s) => ({
      visibleTypes: s.visibleTypes.includes(type)
        ? s.visibleTypes.filter((t) => t !== type)
        : [...s.visibleTypes, type],
    })),
}));
