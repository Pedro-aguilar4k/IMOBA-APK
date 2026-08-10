import type { Metadata, Viewport } from 'next'
import { OrientationLock } from '@/components/orientation-lock'

export const metadata: Metadata = {
  title: {
    default: 'ImobApp',
    template: '%s | ImobApp',
  },
  description: 'Gestão segura de imóveis, contratos, locatários e pagamentos.',
  applicationName: 'ImobApp',
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

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
      <OrientationLock />
    </>
  )
}
