'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, Heart, Home, Info, Github, Settings, MessageCircle, Menu, X } from 'lucide-react';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/clerk-react';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if Clerk is properly configured
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  const clerkUser = useUser();
  const isSignedIn = !!clerkUser.isSignedIn; // ensures boolean

  const isActive = (path: string) => pathname === path;

  const navigationLinks = [
    { href: '/', label: 'Discover', icon: Home },
    { href: '/agent', label: 'Agent', icon: MessageCircle },
    { href: '/about', label: 'About', icon: Info },
    ...(hasClerkKeys && isSignedIn ? [{ href: '/admin', label: 'Admin', icon: Settings }] : [])
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/30 bg-primary/10 backdrop-blur supports-[backdrop-filter]:bg-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Mobile Optimized */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="p-1.5 sm:p-2 bg-primary rounded-lg sm:rounded-xl shadow-lg">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 fill-current" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-serif font-semibold text-foreground">About To Eat</h1>
              <p className="text-xs text-muted-foreground font-sans">AI Food Discovery</p>
            </div>
            {/* Mobile Logo Text */}
            <div className="sm:hidden">
              <h1 className="text-base font-serif font-semibold text-foreground">About To Eat</h1>
            </div>
          </Link>

          {/* Desktop Navigation Links - Hidden on Mobile */}
          <div className="hidden lg:flex items-center gap-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button - Only visible on mobile/tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Auth Actions - Responsive */}
            {hasClerkKeys ? (
              isSignedIn ? (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: 'w-7 h-7 sm:w-8 sm:h-8'
                    }
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <button className="text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary/5">
                    Sign In
                  </button>
                </SignInButton>
              )
            ) : (
              <div className="text-xs text-muted-foreground px-1 sm:px-2">
                Auth Disabled
              </div>
            )}

            {/* GitHub Link - Hidden on small mobile */}
            <a
              href="https://github.com/louis-adriano/about-to-eat-rag-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile/Tablet Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-primary/20 bg-white/95 backdrop-blur-sm">
            <div className="px-2 py-3 space-y-1">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile-only GitHub link */}
              <a
                href="https://github.com/louis-adriano/about-to-eat-rag-mcp"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-foreground hover:text-primary hover:bg-primary/5 sm:hidden"
              >
                <Github className="w-4 h-4" />
                <span className="font-medium">GitHub</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}