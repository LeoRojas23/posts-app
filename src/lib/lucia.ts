import { Lucia } from 'lucia'
import { cache } from 'react'
import { cookies } from 'next/headers'

import { adapter } from './adapter'

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: attributes => {
    return {
      username: attributes.username,
      name: attributes.name,
      image: attributes.image,
      createdAt: attributes.createdAt,
    }
  },
})

export const validateRequest = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null

  if (!sessionId) {
    return {
      user: null,
      session: null,
    }
  }

  const { user, session } = await lucia.validateSession(sessionId)

  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id)

      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()

      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
  } catch {
    // Next.js throws error when attempting to set cookies when rendering page
  }

  return {
    user,
    session,
  }
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: {
      username: string
      name: string
      image: string
      createdAt: Date
    }
  }
}
