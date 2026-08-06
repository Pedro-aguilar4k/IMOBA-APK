import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { OrientationLock } from '@/components/orientation-lock'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Gestão Imobiliária',
    template: '%s | Gestão Imobiliária',
  },
  description: 'Gestão segura de imóveis, contratos, locatários e pagamentos.',
  applicationName: 'Gestão Imobiliária',
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
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className="min-h-svh bg-background antialiased">
        {children}
        <OrientationLock />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
