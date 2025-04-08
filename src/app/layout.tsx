import './globals.css'
import type { Metadata } from 'next'

import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

import { cn } from '@/utils/cn'
import ToastProvider from '@/components/toast-provider'
import Nav from '@/components/nav/nav'
import { FollowProvider } from '@/components/follow/follow-context'
import { getFollowsPromise } from '@/db/queries'

const geistSans = Geist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Posts',
  description: 'An application with wonderful things.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const followData = getFollowsPromise()

  return (
    <html lang='en'>
      <body className={cn('mx-auto h-full w-full lg:max-w-5xl', geistSans.className)}>
        <FollowProvider followPromise={followData}>
          <Analytics />
          <ToastProvider />
          <Nav />
          {children}
        </FollowProvider>
      </body>
    </html>
  )
}
