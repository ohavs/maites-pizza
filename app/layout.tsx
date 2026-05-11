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

const candy = localFont({
  src: '../fonts/candy.ttf',
  variable: '--font-candy',
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
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
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
      <body className={`${rubik.className} ${bisten.variable} ${candy.variable} antialiased`}>
        {children}
        <PWAPrompt />
        <Analytics />
      </body>
    </html>
  )
}
