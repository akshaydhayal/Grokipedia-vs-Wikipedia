import type { Metadata } from 'next';
import './globals.css';

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
        <header className="glass border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <h1 className="text-3xl font-bold gradient-text">
              Grokipedia vs Wikipedia
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Content Comparison & Trust Annotation
            </p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-700/50 mt-12 glass">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-slate-400">
            Built for <span className="text-accent-cyan">OriginTrail Hackathon</span> - Challenge 1
          </div>
        </footer>
      </body>
    </html>
  );
}

