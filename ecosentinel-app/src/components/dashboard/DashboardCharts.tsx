'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { mockChartData } from '@/data/mock-data';

// ApexCharts must be loaded client-side only
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/* ═══════════════════════════════════════════
   AREA CHART — Environmental Trends
   ═══════════════════════════════════════════ */
function EnvironmentalTrendChart() {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      sparkline: { enabled: false },
    },
    colors: ['#2563EB', '#EF4444', '#F59E0B'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    stroke: { curve: 'smooth', width: 2.5 },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: '#94A3B8', fontSize: '11px' },
        datetimeFormatter: { hour: 'HH:mm' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#94A3B8', fontSize: '11px' } },
    },
    tooltip: {
      x: { format: 'HH:mm' },
      theme: 'light',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontWeight: 500,
      markers: { size: 4, shape: 'circle' as const },
      itemMargin: { horizontal: 12 },
    },
    dataLabels: { enabled: false },
  };

  const series = [
    {
      name: 'Water Level (m)',
      data: mockChartData.waterLevelTrend.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })),
    },
    {
      name: 'Temperature (°C)',
      data: mockChartData.temperatureTrend.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })),
    },
    {
      name: 'PM2.5 (µg/m³)',
      data: mockChartData.pm25Trend.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.value })),
    },
  ];

  return (
    <div className="eco-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4.5 h-4.5 text-primary-600" />
        <h3 className="text-sm font-semibold text-surface-900">Environmental Trends (24h)</h3>
      </div>
      <Chart options={options} series={series} type="area" height={280} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   DONUT CHART — Alert Distribution
   ═══════════════════════════════════════════ */
function AlertDistributionChart() {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    colors: ['#2563EB', '#EF4444', '#F59E0B'],
    labels: mockChartData.alertDistribution.map((d) => d.name),
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { fontSize: '13px', fontWeight: 600, color: '#0F172A' },
            value: { fontSize: '22px', fontWeight: 700, color: '#0F172A', fontFamily: 'Poppins' },
            total: {
              show: true,
              label: 'Total',
              fontSize: '12px',
              color: '#64748B',
              fontWeight: 500,
            },
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontWeight: 500,
      markers: { size: 4, shape: 'circle' as const },
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' },
  };

  const series = mockChartData.alertDistribution.map((d) => d.value);

  return (
    <div className="eco-card">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-4.5 h-4.5 text-warning-500" />
        <h3 className="text-sm font-semibold text-surface-900">Alert Distribution</h3>
      </div>
      <Chart options={options} series={series} type="donut" height={280} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   BAR CHART — Hourly Alerts
   ═══════════════════════════════════════════ */
function HourlyAlertsChart() {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    colors: ['#2563EB', '#EF4444', '#F59E0B'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: 'end',
        columnWidth: '55%',
      },
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: mockChartData.hourlyAlerts.map((h) => h.hour),
      labels: {
        style: { colors: '#94A3B8', fontSize: '10px' },
        rotate: 0,
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#94A3B8', fontSize: '11px' } },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontWeight: 500,
      markers: { size: 4, shape: 'circle' as const },
    },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' },
  };

  const series = [
    { name: 'Flood', data: mockChartData.hourlyAlerts.map((h) => h.flood) },
    { name: 'Fire', data: mockChartData.hourlyAlerts.map((h) => h.fire) },
    { name: 'Pollution', data: mockChartData.hourlyAlerts.map((h) => h.pollution) },
  ];

  return (
    <div className="eco-card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4.5 h-4.5 text-secondary-500" />
        <h3 className="text-sm font-semibold text-surface-900">Alerts by Hour</h3>
      </div>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD CHARTS GRID
   ═══════════════════════════════════════════ */
export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <EnvironmentalTrendChart />
      </div>
      <AlertDistributionChart />
    </div>
  );
}
