import type { Metadata } from 'next'
import { Inter, Manrope, Playfair_Display } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Navbar } from '../components/navbar'

const inter = Inter({ subsets: ['latin'] })
const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'About To Eat - AI-Powered Food Discovery',
  description: 'Discover amazing foods from around the world using AI-powered semantic search. Find dishes by describing flavors, ingredients, or cuisine types.',
  keywords: ['food discovery', 'culinary search', 'AI search', 'international cuisine', 'recipe finder', 'semantic search'],
  authors: [{ name: 'About To Eat Team' }],
}

// Add viewport export to fix the warning
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Clerk keys are available
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                      process.env.CLERK_SECRET_KEY;

  if (!hasClerkKeys && process.env.NODE_ENV === 'production') {
    // Fallback layout without Clerk for production builds
    return (
      <html lang="en" className={`${manrope.variable} ${playfair.variable} antialiased`}>
        <body className="min-h-screen bg-background font-sans">
          <div className="min-h-screen bg-background">
            {/* Simple navbar without auth */}
            <nav className="sticky top-0 z-50 w-full border-b border-primary/30 bg-primary/10 backdrop-blur">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="text-xl font-serif font-semibold text-foreground">About To Eat</div>
                </div>
              </div>
            </nav>
            {children}
          </div>
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider>
      <html lang="en" className={`${manrope.variable} ${playfair.variable} antialiased`}>
        <body className="min-h-screen bg-background font-sans">
          <div className="min-h-screen bg-background">
            <Navbar />
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}