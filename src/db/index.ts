import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

import * as schema from '@/db/schema'

dotenv.config({
  path: '.env.local',
})

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
})

export const db = drizzle(client, { schema })
