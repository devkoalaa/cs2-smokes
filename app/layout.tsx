import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthLoading } from '@/components/auth/AuthLoading'
import './globals.css'

// Custom font configuration
const newAmsterdamFont = {
  variable: '--font-new-amsterdam',
  className: 'font-new-amsterdam'
}

export const metadata: Metadata = {
  title: 'CS2 Smoke Hub | Domine as Smokes do Counter Strike 2',
  description: 'O arsenal de smokes definitivo, alimentado e validado pela comunidade.',
  keywords: ['CS2', 'Counter Strike 2', 'smoke', 'tutorial', 'tático', 'mapas', 'gaming'],
  authors: [{ name: 'CS2 Smoke Hub' }],
  creator: 'CS2 Smoke Hub',
  publisher: 'CS2 Smoke Hub',
  openGraph: {
    title: 'CS2 Smoke Hub',
    description: 'O arsenal de smokes definitivo, alimentado e validado pela comunidade.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CS2 Smoke Hub',
    description: 'O arsenal de smokes definitivo, alimentado e validado pela comunidade.',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${newAmsterdamFont.variable}`}>
        <AuthProvider>
          {children}
          <AuthLoading />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
