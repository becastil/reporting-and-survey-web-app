import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ConditionalClerkProvider } from '@/components/conditional-clerk-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Survey & Reporting Platform',
  description: 'Modern survey and reporting platform with interactive dashboards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConditionalClerkProvider>
          <Providers>{children}</Providers>
        </ConditionalClerkProvider>
      </body>
    </html>
  )
}