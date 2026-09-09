import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx for conditional class composition
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with commas and optional decimal places
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 30) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Get severity color classes
 */
export function getSeverityColor(severity: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-critical-50',
        text: 'text-critical-700',
        border: 'border-critical-200',
        dot: 'bg-critical-500',
      };
    case 'high':
      return {
        bg: 'bg-warning-50',
        text: 'text-warning-700',
        border: 'border-warning-200',
        dot: 'bg-warning-500',
      };
    case 'medium':
      return {
        bg: 'bg-primary-50',
        text: 'text-primary-700',
        border: 'border-primary-200',
        dot: 'bg-primary-500',
      };
    default:
      return {
        bg: 'bg-success-50',
        text: 'text-success-700',
        border: 'border-success-200',
        dot: 'bg-success-500',
      };
  }
}

/**
 * Get disaster type icon name and color
 */
export function getDisasterMeta(type: string): {
  icon: string;
  color: string;
  bgColor: string;
  label: string;
} {
  switch (type) {
    case 'flood':
      return {
        icon: 'Droplets',
        color: 'text-primary-600',
        bgColor: 'bg-primary-50',
        label: 'Flood',
      };
    case 'fire':
      return {
        icon: 'Flame',
        color: 'text-critical-600',
        bgColor: 'bg-critical-50',
        label: 'Fire',
      };
    case 'pollution':
      return {
        icon: 'Wind',
        color: 'text-warning-600',
        bgColor: 'bg-warning-50',
        label: 'Pollution',
      };
    default:
      return {
        icon: 'AlertTriangle',
        color: 'text-surface-600',
        bgColor: 'bg-surface-50',
        label: 'Unknown',
      };
  }
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string, format: 'short' | 'long' | 'datetime' = 'short'): string {
  const date = new Date(dateString);
  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'datetime':
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
  }
}

/**
 * Get AQI category
 */
export function getAQICategory(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: 'success' };
  if (aqi <= 100) return { label: 'Moderate', color: 'warning' };
  if (aqi <= 200) return { label: 'Poor', color: 'warning' };
  if (aqi <= 300) return { label: 'Very Poor', color: 'critical' };
  return { label: 'Severe', color: 'critical' };
}
