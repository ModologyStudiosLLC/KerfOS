import type { Metadata } from 'next'
import { Inter, Sora, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kerfos.com'),
  title: {
    default: 'KerfOS — CNC Cabinet Software for Woodworkers',
    template: '%s | KerfOS',
  },
  description: 'Design cabinets, generate precise cut lists, and export G-code for your CNC in minutes. Free to start. No $10,000 license required.',
  keywords: ['CNC cabinet software', 'cabinet design software', 'cut list generator', 'G-code export', 'woodworking software', 'ShopBot', 'Shapeoko', 'X-Carve', 'GRBL', 'parametric cabinets'],
  authors: [{ name: 'Modology Studios', url: 'https://modologystudios.com' }],
  creator: 'Modology Studios',
  openGraph: {
    title: 'KerfOS — CNC Cabinet Software for Woodworkers',
    description: 'Design cabinets, generate precise cut lists, and export G-code for your CNC in minutes. Free to start.',
    url: 'https://kerfos.com',
    siteName: 'KerfOS',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KerfOS — CNC Cabinet Software',
    description: 'Design cabinets, generate cut lists, and export G-code in minutes. Free to start.',
    creator: '@modologystudios',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://kerfos.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}
