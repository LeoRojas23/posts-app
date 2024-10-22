import { GitHub, Google } from 'arctic'

import { BASE_URL } from '@/utils/base-url'

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  BASE_URL + '/api/oauth/google',
)

export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, {
  redirectURI: BASE_URL + '/api/oauth/github',
})
