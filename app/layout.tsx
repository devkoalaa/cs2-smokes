import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CS2 Smoke Tutorials | Domine as Smokes do Counter Strike 2',
  description: 'Aprenda as melhores posições de smoke no Counter Strike 2. Tutoriais interativos para todos os mapas oficiais do CS2.',
  keywords: ['CS2', 'Counter Strike 2', 'smoke', 'tutorial', 'tático', 'mapas', 'gaming'],
  authors: [{ name: 'CS2 Smoke Tutorials' }],
  creator: 'CS2 Smoke Tutorials',
  publisher: 'CS2 Smoke Tutorials',
  openGraph: {
    title: 'CS2 Smoke Tutorials',
    description: 'Domine as smokes do Counter Strike 2 com tutoriais interativos',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CS2 Smoke Tutorials',
    description: 'Domine as smokes do Counter Strike 2 com tutoriais interativos',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
