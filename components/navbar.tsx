'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, Heart, Home, Info, Github, Settings } from 'lucide-react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { useUser as useClerkUser } from '@clerk/clerk-react'; // or correct import path

export function Navbar() {
  const pathname = usePathname();

  // Check if Clerk is properly configured
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  const clerkUser = useClerkUser();
  const isSignedIn = !!clerkUser.isSignedIn; // ensures boolean

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/30 bg-primary/10 backdrop-blur supports-[backdrop-filter]:bg-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="p-2 bg-primary rounded-xl shadow-lg">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <Heart className="w-3 h-3 text-red-500 absolute -top-1 -right-1 fill-current" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-serif font-semibold text-foreground">About To Eat</h1>
              <p className="text-xs text-muted-foreground font-sans">AI Food Discovery</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Discover
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              About
            </Link>
            {hasClerkKeys && isSignedIn && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-1">
              <Link
                href="/"
                className={`p-2 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                }`}
              >
                <Home className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className={`p-2 rounded-lg transition-colors ${
                  isActive('/about')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                }`}
              >
                <Info className="w-4 h-4" />
              </Link>
              {hasClerkKeys && isSignedIn && (
                <Link
                  href="/admin"
                  className={`p-2 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Auth Actions */}
            {hasClerkKeys ? (
              isSignedIn ? (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8'
                    }
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-foreground hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-primary/5">
                    Sign In
                  </button>
                </SignInButton>
              )
            ) : (
              <div className="text-xs text-muted-foreground px-2">
                Auth Disabled
              </div>
            )}

            {/* GitHub Link */}
            <a
              href="https://github.com/louis-adriano/about-to-eat-rag-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}