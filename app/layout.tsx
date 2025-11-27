import type { Metadata } from 'next';
import './globals.css';
import Toaster from '@/components/Toaster';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Grokipedia vs Wikipedia - Content Comparison',
  description: 'Compare AI-generated Grokipedia content with human-curated Wikipedia articles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-700/50 mt-12 glass">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-slate-400">
            Built for <span className="text-accent-cyan">OriginTrail Hackathon</span> - Challenge 1
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}

