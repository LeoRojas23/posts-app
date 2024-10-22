import { eq } from 'drizzle-orm'
import { generateId } from 'lucia'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { alphabet, generateRandomString } from 'oslo/crypto'

import { db } from '@/db'
import { oauthAccountTable, userTable } from '@/db/schema'
import { lucia } from '@/lib/lucia'
import { google } from '@/lib/oauth'
import { BASE_URL } from '@/utils/base-url'

interface GoogleUser {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  picture: string
  locale: string
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const codeVerifier = cookies().get('codeVerifier')?.value
    const savedState = cookies().get('state')?.value

    if (!codeVerifier || !savedState) {
      return NextResponse.json(
        { error: 'Code verifier or saved state is not exists' },
        { status: 400 },
      )
    }

    if (savedState !== state) {
      return NextResponse.json({ error: 'State does not match' }, { status: 400 })
    }

    const { accessToken, accessTokenExpiresAt, refreshToken } =
      await google.validateAuthorizationCode(code, codeVerifier)

    const googleRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    })

    const googleData = (await googleRes.json()) as GoogleUser

    await db.transaction(async tx => {
      const user = await tx.query.userTable.findFirst({
        where: eq(userTable.id, googleData.id),
      })

      if (!user) {
        const createdUserRes = await tx
          .insert(userTable)
          .values({
            id: googleData.id,
            email: googleData.email,
            name: googleData.name,
            image: googleData.picture,
            username: generateRandomString(10, alphabet('a-z', '0-9')),
          })
          .returning({
            id: userTable.id,
          })

        if (createdUserRes.length === 0) {
          tx.rollback()

          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }

        const createdOAuthAccountRes = await tx.insert(oauthAccountTable).values({
          id: generateId(15),
          userId: googleData.id,
          provider: 'google',
          providerUserId: googleData.id,
          accessToken,
          expiresAt: accessTokenExpiresAt,
        })

        if (!createdOAuthAccountRes) {
          tx.rollback()

          return NextResponse.json({ error: 'Failed to create OAuthAccountRes' }, { status: 500 })
        }
      } else {
        const updatedOAuthAccountRes = await tx
          .update(oauthAccountTable)
          .set({
            accessToken,
            expiresAt: accessTokenExpiresAt,
            refreshToken,
          })
          .where(eq(oauthAccountTable.id, googleData.id))

        if (!updatedOAuthAccountRes) {
          tx.rollback()

          return NextResponse.json({ error: 'Failed to update OAuthAccountRes' }, { status: 500 })
        }
      }

      return NextResponse.redirect(new URL('/', BASE_URL), {
        status: 302,
      })
    })

    const session = await lucia.createSession(googleData.id, {
      expiresIn: 60 * 60 * 24 * 30,
    })

    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    cookies().set('state', '', {
      expires: new Date(0),
    })

    cookies().set('codeVerifier', '', {
      expires: new Date(0),
    })

    return NextResponse.redirect(new URL('/', BASE_URL), {
      status: 302,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'An unknown error has occurred' }, { status: 500 })
    }
  }
}
