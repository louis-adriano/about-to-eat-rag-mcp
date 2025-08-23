import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '../components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'About To Eat - Food Discovery App',
  description: 'Discover foods from around the world using AI-powered semantic search. Find dishes by describing flavors, ingredients, or cuisine types.',
  keywords: ['food', 'cuisine', 'recipe', 'AI search', 'international food', 'semantic search'],
  authors: [{ name: 'About To Eat Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}