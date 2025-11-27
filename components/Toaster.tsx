'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgb(15, 23, 42)',
          color: '#e2e8f0',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '0.75rem',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#e2e8f0',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(5, 46, 22, 0.3)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#e2e8f0',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(76, 5, 25, 0.3)',
          },
        },
      }}
    />
  );
}

