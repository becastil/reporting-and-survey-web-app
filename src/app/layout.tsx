import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AppClerkProvider } from '@/components/app-clerk-provider'
import { assertClerkEnv } from '@/lib/init-clerk'

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
  // Validate required Clerk env only in production
  assertClerkEnv()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppClerkProvider>
          <Providers>{children}</Providers>
        </AppClerkProvider>
      </body>
    </html>
  )
}
