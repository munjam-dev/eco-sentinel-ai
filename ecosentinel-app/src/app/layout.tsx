import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoSentinel AI — Environmental Disaster Monitoring Platform',
  description:
    'AI-powered platform for real-time environmental disaster monitoring. Detect floods, forest fires, and air pollution with ESP32 sensors, machine learning predictions, and explainable AI.',
  keywords: [
    'environmental monitoring',
    'disaster management',
    'AI prediction',
    'flood detection',
    'fire detection',
    'air pollution',
    'IoT sensors',
    'ESP32',
  ],
  authors: [{ name: 'EcoSentinel AI Team' }],
  openGraph: {
    title: 'EcoSentinel AI',
    description: 'AI-Powered Environmental Disaster Monitoring Platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
