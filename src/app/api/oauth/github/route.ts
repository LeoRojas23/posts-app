import { eq } from 'drizzle-orm'
import { generateId } from 'lucia'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { alphabet, generateRandomString } from 'oslo/crypto'

import { github } from '@/lib/oauth'
import { lucia } from '@/lib/lucia'
import { oauthAccountTable, userTable } from '@/db/schema'
import { db } from '@/db'

interface GithubUser {
  id: string
  name: string | null
  avatar_url: string
  login: string
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

    const savedState = cookies().get('state')?.value

    if (!savedState) {
      return NextResponse.json({ error: 'Saved state is not exists' }, { status: 400 })
    }

    if (savedState !== state) {
      return NextResponse.json({ error: 'State does not match' }, { status: 400 })
    }

    const { accessToken } = await github.validateAuthorizationCode(code)

    const githubRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    })

    const githubData = (await githubRes.json()) as GithubUser

    await db.transaction(async tx => {
      const user = await tx.query.userTable.findFirst({
        where: eq(userTable.id, githubData.id),
      })

      if (!user) {
        const createdUserRes = await tx
          .insert(userTable)
          .values({
            id: githubData.id,
            name: githubData.name ?? generateRandomString(10, alphabet('a-z', '0-9')),
            image: githubData.avatar_url,
            username: githubData.login,
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
          userId: githubData.id,
          provider: 'github',
          providerUserId: githubData.id,
          accessToken,
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
          })
          .where(eq(oauthAccountTable.id, githubData.id))

        if (!updatedOAuthAccountRes) {
          tx.rollback()

          return NextResponse.json({ error: 'Failed to update OAuthAccountRes' }, { status: 500 })
        }
      }

      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SERVER_URL), {
        status: 302,
      })
    })

    const session = await lucia.createSession(githubData.id, {
      expiresIn: 60 * 60 * 24 * 30,
    })

    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    cookies().set('state', '', {
      expires: new Date(0),
    })

    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SERVER_URL), {
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
