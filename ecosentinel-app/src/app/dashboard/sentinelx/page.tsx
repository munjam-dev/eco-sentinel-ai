'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CloudRain, Droplets, Flame, Radio, RefreshCw, Wifi, WifiOff } from 'lucide-react';

type Telemetry = Record<string, unknown>;
type NodeSnapshot = {
  nodeId: string;
  type: string;
  receivedAt: number;
  telemetry: Telemetry;
  riskScore?: number;
  riskCategory?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws/live';

function valueOf(data: Telemetry, ...keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

function display(value: unknown, unit = '') {
  if (value === null || value === undefined || value === '') return 'Unavailable';
  if (typeof value === 'number') return `${Number(value.toFixed(1))}${unit}`;
  if (typeof value === 'boolean') return value ? 'Detected' : 'Not detected';
  return `${String(value)}${unit}`;
}

function riskColor(risk?: string) {
  const normalized = (risk ?? 'UNKNOWN').toUpperCase();
  if (normalized === 'CRITICAL' || normalized === 'HIGH') return 'border-red-200 bg-red-50 text-red-800';
  if (normalized === 'MEDIUM' || normalized === 'WARNING') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (normalized === 'LOW') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function Metric({ label, value, unit }: { label: string; value: unknown; unit?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold text-slate-900">{display(value, unit)}</p>
    </div>
  );
}

export default function SentinelXLivePage() {
  const [connected, setConnected] = useState(false);
  const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
  const [nodes, setNodes] = useState<Record<string, NodeSnapshot>>({});
  const [connectionMessage, setConnectionMessage] = useState('Connecting to the live telemetry feed…');
  const [feedError, setFeedError] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    let retryDelay = 1000;

    const connect = () => {
      if (disposed) return;
      try {
        socket = new WebSocket(WS_URL);
        socket.onopen = () => {
          retryDelay = 1000;
          setConnected(true);
          setFeedError(null);
          setConnectionMessage('WebSocket connected. Waiting for sensor telemetry…');
        };
        socket.onmessage = (message) => {
          setLastMessageAt(Date.now());
          try {
            const event = JSON.parse(message.data);
            if (event.event !== 'sensor_update' || !event.payload) return;
            const payload = event.payload;
            const telemetry = payload.telemetry ?? {};
            const nodeId = String(payload.node_id ?? telemetry.node_id ?? telemetry.nodeId ?? 'UNKNOWN');
            setNodes((current) => ({
              ...current,
              [nodeId]: {
                nodeId,
                type: String(payload.disaster_type ?? telemetry.type ?? 'ENVIRONMENT'),
                receivedAt: Date.now(),
                telemetry,
                riskScore: typeof payload.risk_score === 'number' ? payload.risk_score : undefined,
                riskCategory: typeof payload.risk_category === 'string' ? payload.risk_category : (typeof telemetry.risk === 'string' ? telemetry.risk : undefined),
              },
            }));
            setConnectionMessage('Receiving telemetry from the backend.');
          } catch {
            setFeedError('Received an unreadable WebSocket message. Check backend event format.');
          }
        };
        socket.onerror = () => {
          setFeedError('Cannot read the live feed. Check the backend URL and WebSocket endpoint.');
        };
        socket.onclose = () => {
          setConnected(false);
          if (disposed) return;
          setConnectionMessage('Connection lost. Reconnecting…');
          retryTimer = setTimeout(connect, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 15000);
        };
      } catch {
        setConnected(false);
        setFeedError('Unable to create a WebSocket connection. Verify NEXT_PUBLIC_WS_URL.');
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      }
    };

    connect();
    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, []);

  const sortedNodes = useMemo(() => Object.values(nodes).sort((a, b) => b.receivedAt - a.receivedAt), [nodes]);
  const now = clock;
  const onlineCount = sortedNodes.filter((node) => now - node.receivedAt < 20000).length;
  const highCount = sortedNodes.filter((node) => ['HIGH', 'CRITICAL'].includes((node.riskCategory ?? '').toUpperCase())).length;
  const lastMessageText = lastMessageAt ? new Date(lastMessageAt).toLocaleTimeString() : 'No messages received yet';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Activity className="h-4 w-4" /> SENTINELX 2.0
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Live Sensor Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Live readings received through the EcoSentinel FastAPI WebSocket. Missing data is shown as unavailable, never as a safe reading.</p>
          </div>
          <a href={`${API_URL}/api/v1/docs`} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-100">
            <Radio className="h-4 w-4" /> API diagnostics
          </a>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-500"><span>WebSocket</span>{connected ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}</div>
            <p className="mt-3 text-2xl font-bold">{connected ? 'Connected' : 'Disconnected'}</p>
            <p className="mt-1 text-xs text-slate-500">{connectionMessage}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Recently active nodes</p>
            <p className="mt-3 text-2xl font-bold">{onlineCount} <span className="text-base font-medium text-slate-400">/ {sortedNodes.length}</span></p>
            <p className="mt-1 text-xs text-slate-500">A node is recent if a packet arrived within 20 seconds.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">High / critical reports</p>
            <p className="mt-3 text-2xl font-bold">{highCount}</p>
            <p className="mt-1 text-xs text-slate-500">Based on latest received risk category, not a certified warning.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Last WebSocket message</p>
            <p className="mt-3 text-lg font-bold">{lastMessageText}</p>
            <p className="mt-1 text-xs text-slate-500">Client receive time</p>
          </div>
        </section>

        {feedError && <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" /><span>{feedError}</span></div>}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Sensor nodes</h2>
              <p className="mt-1 text-sm text-slate-500">Cards populate when the backend broadcasts a sensor_update event.</p>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {connected ? <Activity className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {connected ? 'Listening' : 'Reconnecting'}
            </span>
          </div>

          {sortedNodes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <Radio className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="mt-3 font-semibold">Waiting for the first sensor packet</h3>
              <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">Check that both ESP32 nodes can reach the backend, then confirm a successful telemetry ingestion request in the API logs.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {sortedNodes.map((node) => {
                const stale = Date.now() - node.receivedAt >= 20000;
                const t = node.telemetry;
                const flood = node.type.toUpperCase().includes('FLOOD');
                const mq2Raw = valueOf(t, 'mq2_raw', 'mq2Raw');
                const mq2Concentration = valueOf(t, 'mq2_smoke', 'mq2');
                const sensorFault = valueOf(t, 'water_sensor_valid', 'waterSensorValid') === false || valueOf(t, 'climate_sensor_valid', 'climateSensorValid') === false;
                const firmware = valueOf(t, 'firmware_version', 'firmwareVersion');
                return (
                  <article key={node.nodeId} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-3">{flood ? <Droplets className="h-5 w-5 text-sky-700" /> : <Flame className="h-5 w-5 text-orange-700" />}</div>
                        <div><h3 className="font-bold">{node.nodeId}</h3><p className="text-xs uppercase tracking-wide text-slate-500">{node.type}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2"><div className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskColor(node.riskCategory)}`}>{node.riskCategory ?? 'Risk unavailable'}</div>{sensorFault && <div className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Sensor fault</div>}{stale && <div className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Offline / stale</div>}</div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {flood ? <>
                        <Metric label="Water level" value={valueOf(t, 'water_level', 'waterLevel')} unit=" cm" />
                        <Metric label="Rain detected" value={valueOf(t, 'rain')} />
                        <Metric label="Temperature" value={valueOf(t, 'temperature')} unit=" °C" />
                        <Metric label="Humidity" value={valueOf(t, 'humidity')} unit="%" />
                        <Metric label="Pressure (BME280)" value={valueOf(t, 'pressure_hpa', 'pressureHpa')} unit=" hPa" />
                        <Metric label="Climate sensor valid" value={valueOf(t, 'climate_sensor_valid', 'climateSensorValid')} />
                        <Metric label="Water sensor" value={valueOf(t, 'water_sensor_valid', 'waterSensorValid')} />
                        <Metric label="Rain ADC" value={valueOf(t, 'rain_raw', 'rainRaw')} />
                      </> : <>
                        <Metric label="MQ-2 raw ADC" value={mq2Raw ?? (t.mq2_units === 'adc_raw' || t.mq2Units === 'adc_raw' ? mq2Concentration : null)} />
                        <Metric label="Calibrated gas concentration" value={mq2Concentration && t.mq2_units !== 'adc_raw' && t.mq2Units !== 'adc_raw' ? mq2Concentration : null} unit=" ppm" />
                        <Metric label="Flame indication" value={valueOf(t, 'flame_detected', 'flameDetected', 'flame')} />
                        <Metric label="MQ-2 digital alarm" value={valueOf(t, 'mq2_digital_alarm', 'mq2DigitalAlarm')} />
                      </>}
                      <Metric label="Battery estimate" value={valueOf(t, 'battery_level', 'battery')} unit="%" />
                      <Metric label="Battery voltage" value={valueOf(t, 'battery_voltage', 'batteryVoltage')} unit=" V" />
                      <Metric label="Wi-Fi RSSI" value={valueOf(t, 'rssi', 'signal')} unit=" dBm" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span>{stale ? 'STALE — no packet in 20 seconds' : 'Recent telemetry'}</span>
                      <span>Received {new Date(node.receivedAt).toLocaleTimeString()}</span>
                      <span>Firmware {display(firmware)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="text-xs leading-relaxed text-slate-500">Prototype monitoring only. Hobby MQ-2, IR and ultrasonic modules are not certified life-safety instruments. Do not rely on this dashboard as the sole flood or fire warning system.</footer>
      </div>
    </main>
  );
}
