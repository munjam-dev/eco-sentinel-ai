'use client';

import { useAppStore } from '@/stores';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AlertPanel from '@/components/dashboard/AlertPanel';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Header />
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* Content */}
          <main className="flex-1 overflow-y-auto min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
          {/* Alert Panel */}
          <AlertPanel />
        </div>
      </div>
    </div>
  );
}
