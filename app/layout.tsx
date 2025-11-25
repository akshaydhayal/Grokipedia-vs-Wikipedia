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
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Grokipedia vs Wikipedia
            </h1>
            <p className="text-sm text-gray-600">
              Content Comparison & Trust Annotation
            </p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
            Built for OriginTrail Hackathon - Challenge 1
          </div>
        </footer>
      </body>
    </html>
  );
}

