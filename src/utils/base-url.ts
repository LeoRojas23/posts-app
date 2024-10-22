const isProduction = process.env.NODE_ENV === 'production'

export const BASE_URL = isProduction
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : process.env.NEXT_PUBLIC_BASE_URL
