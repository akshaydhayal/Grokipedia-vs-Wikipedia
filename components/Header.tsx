'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="glass border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="block">
              <h1 className="text-3xl font-bold gradient-text">
                Grokipedia vs Wikipedia
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Content Comparison & Trust Annotation
              </p>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white'
                  : 'text-slate-300 hover:text-white hover:bg-dark-tertiary/50'
              }`}
            >
              Compare
            </Link>
            <Link
              href="/assets"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === '/assets'
                  ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white'
                  : 'text-slate-300 hover:text-white hover:bg-dark-tertiary/50'
              }`}
            >
              All Published Knowledge Assets
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}


