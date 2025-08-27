'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, Home, Info, Github, ExternalLink } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                About To Eat
              </h1>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            
            <Link
              href="/about"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/about')
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </Link>

            {/* GitHub Link */}
            <a
              href="https://github.com/louis-adriano/about-to-eat-rag-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}