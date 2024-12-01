import NextAuth, { DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import { db } from './db'
import { DrizzleAdapter } from './db/drizzle-adapter'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      username: string
      createdAt: string
    } & DefaultSession['user']
    expires: string
    sessionToken: string
    userId: string
  }
}

declare module 'next-auth/adapters' {
  export interface AdapterUser {
    username: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [GitHub, Google],
})
