import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'

import { db } from '@/db'
import { sessionTable, userTable } from '@/db/schema'

export const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable)
