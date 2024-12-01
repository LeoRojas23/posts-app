import { and, eq } from 'drizzle-orm'
import { Adapter, AdapterAccount, AdapterSession, AdapterUser } from 'next-auth/adapters'
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import { Awaitable } from '@auth/core/types'
import { VerificationToken, AdapterAuthenticator } from '@auth/core/adapters'

import { users, accounts, sessions, verificationTokens, authenticators } from './schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DrizzleAdapter(client: BaseSQLiteDatabase<'sync' | 'async', any, any>): Adapter {
  return {
    async createUser(user) {
      const { name, email, image, emailVerified, username } = user

      return (await client
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name,
          email,
          image,
          emailVerified,
          username: username || email.split('@')[0],
        })
        .returning()
        .then(res => res[0] ?? null)) as Awaitable<AdapterUser>
    },
    async getUser(userId: string) {
      const result = (await client.select().from(users).where(eq(users.id, userId)).get()) ?? null

      return result as Awaitable<AdapterUser | null>
    },
    async getUserByEmail(email: string) {
      const result = (await client.select().from(users).where(eq(users.email, email)).get()) ?? null

      return result as Awaitable<AdapterUser | null>
    },
    async createSession(data: { sessionToken: string; userId: string; expires: Date }) {
      return client.insert(sessions).values(data).returning().get()
    },
    async getSessionAndUser(sessionToken: string) {
      const result =
        (await client
          .select({
            session: sessions,
            user: users,
          })
          .from(sessions)
          .where(eq(sessions.sessionToken, sessionToken))
          .innerJoin(users, eq(users.id, sessions.userId))
          .get()) ?? null

      return result as Awaitable<{
        session: AdapterSession
        user: AdapterUser
      } | null>
    },
    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
      if (!data.id) {
        throw new Error('No user id.')
      }

      const result = await client
        .update(users)
        .set(data)
        .where(eq(users.id, data.id))
        .returning()
        .get()

      if (!result) {
        throw new Error('User not found.')
      }

      return result as Awaitable<AdapterUser>
    },
    async updateSession(data: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      const result = await client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning()
        .get()

      return result ?? null
    },
    async linkAccount(data: AdapterAccount) {
      await client.insert(accounts).values(data).run()
    },
    async getUserByAccount(account: Pick<AdapterAccount, 'provider' | 'providerAccountId'>) {
      const result = await client
        .select({
          account: accounts,
          user: users,
        })
        .from(accounts)
        .innerJoin(users, eq(accounts.userId, users.id))
        .where(
          and(
            eq(accounts.provider, account.provider),
            eq(accounts.providerAccountId, account.providerAccountId),
          ),
        )
        .get()

      const user = result?.user ?? null

      return user as Awaitable<AdapterUser | null>
    },
    async deleteSession(sessionToken: string) {
      await client.delete(sessions).where(eq(sessions.sessionToken, sessionToken)).run()
    },
    async createVerificationToken(data: VerificationToken) {
      return client.insert(verificationTokens).values(data).returning().get()
    },
    async useVerificationToken(params: { identifier: string; token: string }) {
      const result = await client
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, params.identifier),
            eq(verificationTokens.token, params.token),
          ),
        )
        .returning()
        .get()

      return result ?? null
    },
    async deleteUser(id: string) {
      await client.delete(users).where(eq(users.id, id)).run()
    },
    async unlinkAccount(params: Pick<AdapterAccount, 'provider' | 'providerAccountId'>) {
      await client
        .delete(accounts)
        .where(
          and(
            eq(accounts.provider, params.provider),
            eq(accounts.providerAccountId, params.providerAccountId),
          ),
        )
        .run()
    },
    async getAccount(providerAccountId: string, provider: string) {
      return client
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)),
        )
        .then(res => res[0] ?? null) as Promise<AdapterAccount | null>
    },
    async createAuthenticator(data: AdapterAuthenticator) {
      return client
        .insert(authenticators)
        .values(data)
        .returning()
        .then(res => res[0] ?? null) as Awaitable<AdapterAuthenticator>
    },
    async getAuthenticator(credentialID: string) {
      return client
        .select()
        .from(authenticators)
        .where(eq(authenticators.credentialID, credentialID))
        .then(res => res[0] ?? null) as Awaitable<AdapterAuthenticator | null>
    },
    async listAuthenticatorsByUserId(userId: string) {
      return client
        .select()
        .from(authenticators)
        .where(eq(authenticators.userId, userId))
        .then(res => res) as Awaitable<AdapterAuthenticator[]>
    },
    async updateAuthenticatorCounter(credentialID: string, newCounter: number) {
      const authenticator = await client
        .update(authenticators)
        .set({ counter: newCounter })
        .where(eq(authenticators.credentialID, credentialID))
        .returning()
        .then(res => res[0])

      if (!authenticator) throw new Error('Authenticator not found.')

      return authenticator as Awaitable<AdapterAuthenticator>
    },
  }
}
