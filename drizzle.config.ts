import { type Config, defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({
  path: '.env.local',
})

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'turso',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
}) satisfies Config
