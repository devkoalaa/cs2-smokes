import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { MobileSidebarProvider } from '@/contexts/MobileSidebarContext'
import { AuthLoading } from '@/components/auth/AuthLoading'
import { GlobalMobileSidebar } from '@/components/global-mobile-sidebar'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

// Custom font configuration
const newAmsterdamFont = {
  variable: '--font-new-amsterdam',
  className: 'font-new-amsterdam'
}

export const metadata: Metadata = {
  metadataBase: new URL('https://cs2.devkoala.com'),
  title: { default: 'CS2 Hub', template: '%s | CS2 Hub' },
  description: 'Smokes por mapa e o histórico de partidas do grupo.',
  keywords: ['CS2', 'Counter Strike 2', 'smoke', 'mapas', 'partidas', 'estatísticas'],
  authors: [{ name: 'CS2 Hub' }],
  creator: 'CS2 Hub',
  publisher: 'CS2 Hub',
  openGraph: {
    title: 'CS2 Hub',
    description: 'Smokes por mapa e o histórico de partidas do grupo.',
    siteName: 'CS2 Hub',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CS2 Hub',
    description: 'Smokes por mapa e o histórico de partidas do grupo.',
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
          <MobileSidebarProvider>
            {children}
            <AuthLoading />
            <GlobalMobileSidebar />
            <Toaster />
            <Analytics />
          </MobileSidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
