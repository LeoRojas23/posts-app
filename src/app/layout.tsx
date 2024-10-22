import './globals.css'
import type { Metadata } from 'next'

import { Inter } from 'next/font/google'

import { cn } from '@/utils/cn'
import ToastProvider from '@/components/toast-provider'
import Nav from '@/components/nav/nav'
import { FollowProvider } from '@/components/follow/follow-context'
import { db } from '@/db'
import { followTable } from '@/db/schema'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Posts',
  description: 'An application with wonderful things.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const followData = db.select().from(followTable)

  return (
    <html lang='en'>
      <body className={cn('mx-auto h-full w-full lg:max-w-5xl', inter.className)}>
        <FollowProvider followPromise={followData}>
          <ToastProvider />
          <Nav />
          {children}
        </FollowProvider>
      </body>
    </html>
  )
}
