import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'PKM Center - Open Recruitment 2025',
    template: '%s | PKM Center',
  },
  description: 'Platform percepatan riset, pengabdian masyarakat, & kompetisi ilmiah untuk mahasiswa Indonesia. Bergabunglah dengan komunitas peneliti muda terbaik.',
  keywords: ['PKM', 'riset', 'pengabdian masyarakat', 'kompetisi mahasiswa', 'open recruitment', 'organisasi mahasiswa'],
  authors: [{ name: 'PKM Center' }],
  creator: 'PKM Center',
  publisher: 'PKM Center',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://pkmcenter.id',
    siteName: 'PKM Center',
    title: 'PKM Center - Open Recruitment 2025',
    description: 'Bergabunglah dengan komunitas peneliti muda terbaik. Riset, PKM, & Kompetisi Nasional.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PKM Center Open Recruitment 2025',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PKM Center - Open Recruitment 2025',
    description: 'Bergabunglah dengan komunitas peneliti muda terbaik.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  )
}