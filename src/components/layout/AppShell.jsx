import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-finance-grid bg-[size:48px_48px]">
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1 lg:pl-72">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <motion.main
            className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
