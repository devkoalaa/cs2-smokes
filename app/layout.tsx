import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/AuthContext'
import { ServiceWorker } from '@/components/service-worker'
import { Toaster } from '@/components/ui/toaster'
import { BRAND } from '@/lib/brand'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: `${BRAND.name} · ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: ['CS2', 'Counter-Strike 2', 'smokes', 'granadas', 'mapas', 'partidas', 'estatísticas', 'mapa de abates', 'Premier'],
  authors: [{ name: BRAND.name, url: BRAND.url }],
  creator: BRAND.name,
  publisher: BRAND.name,
  openGraph: { title: BRAND.name, description: BRAND.description, siteName: BRAND.name, type: 'website', locale: 'pt_BR' },
  twitter: { card: 'summary_large_image', title: BRAND.name, description: BRAND.description },
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: 'black' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: BRAND.background,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <ServiceWorker />
      </body>
    </html>
  )
}
