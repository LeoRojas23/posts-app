export async function urlToBuffer(url: string) {
  const response = await fetch(url)
  const data = await response.arrayBuffer()

  return Buffer.from(data)
}

const regexPublicId = /\/v\d+\/([^/]+)\.\w{3,4}$/

export const getPublicId = (url: string): string | null => {
  const match = url?.match(regexPublicId)

  return match ? match[1] : null
}

export const STEPS_IMAGE_UPLOAD = {
  READY: 'ready',
  CROP: 'crop',
  COMPLETED: 'completed',
} as const

export const regexMax150Chars = /^[\s\S]{0,150}$/

export const regexMax280Chars = /^[\s\S]{0,280}$/

export const regexAtLeastOneChar = /^\s*\S[\s\S]*$/

export const regexNoWhitespaceOnly = /^(?!\s*$).+/

export const regexComment = /^(?=.*\S)(?!\s+$)(.|\n){0,150}$/

const timeUnits = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hr', seconds: 3600 },
  { unit: 'min', seconds: 60 },
  { unit: 'sec', seconds: 1 },
]

export function timeAgo(timestamp: string) {
  const now = Date.now()
  const diff = (now - new Date(timestamp).getTime()) / 1000

  if (diff < 1) {
    return 'now'
  }

  for (const { unit, seconds } of timeUnits) {
    const interval = Math.floor(diff / seconds)

    if (interval > 0) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''}`
    }
  }
}

export function formatDatePostId(dateString: string) {
  const date = new Date(dateString)

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })

  const formattedDate = dateFormatter.format(date)

  return formattedDate.replace(',', ' ·')
}
