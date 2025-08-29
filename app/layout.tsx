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
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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