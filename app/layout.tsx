import React from "react"
import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const rubik = Rubik({ 
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-rubik',
});

const bisten = localFont({
  src: '../fonts/Bisten.otf',
  variable: '--font-bisten',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Maites Pizza',
  description: 'הזמינו את הפיצה המושלמת שלכם',
  manifest: '/manifest.json',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF5E00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { PWAPrompt } from '@/components/pwa-prompt'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.className} ${bisten.variable} antialiased`}>
        {children}
        <PWAPrompt />
        <Analytics />
      </body>
    </html>
  )
}
