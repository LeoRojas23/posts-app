import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { alphabet, generateRandomString } from 'oslo/crypto'
import { nextCookies } from 'better-auth/next-js'
import { customSession } from 'better-auth/plugins'

import { db } from './db'
import * as schema from './db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      ...schema,
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
    },
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/callback/github',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/callback/google',
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        session: {
          userId: session.userId,
        },
        user: {
          name: user.name,
          // @ts-expect-error: Adittional username field is not fully inferred
          username: user.username,
          id: user.id,
          image: user.image,
        },
      }
    }),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: true,
        defaultValue: generateRandomString(10, alphabet('a-z', '0-9')),
      },
    },
  },
})
