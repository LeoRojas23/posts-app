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

export const STEPS_FORM_CREATE_POST = {
  START: 'start',
  CROP: 'crop',
  COMPLETED: 'completed',
} as const

export const regexMax150Chars = /^[\s\S]{0,150}$/

export const regexMax280Chars = /^[\s\S]{0,280}$/

export const regexAtLeastOneChar = /^\s*\S[\s\S]*$/

export const regexNoWhitespaceOnly = /^(?!\s*$).+/

export const regexComment = /^(?=.*\S)(?!\s+$)(.|\n){0,150}$/

export function timeAgoPost(timestamp: string) {
  const now = new Date().getTime()
  const diff = (now - new Date(timestamp).getTime()) / 1000

  if (diff < 1) {
    return 'now'
  }

  const minutes = Math.floor(diff / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) {
    return `${years} year`
  } else if (months > 0) {
    return `${months} month`
  } else if (days > 0) {
    return `${days} day`
  } else if (hours > 0) {
    return `${hours} hr`
  } else if (minutes > 0) {
    return `${minutes} min`
  } else {
    return `${Math.floor(diff)} sec`
  }
}

export function timeAgoComment(timestamp: string) {
  const now = new Date().getTime()
  const diff = (now - new Date(timestamp).getTime()) / 1000

  if (diff < 1) {
    return 'now'
  }

  const minutes = Math.floor(diff / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    return dateFormatter.format(new Date(timestamp))
  }

  if (hours > 0) {
    return `${hours}h`
  }

  if (minutes > 0) {
    return `${minutes}m`
  }

  return `${Math.floor(diff)}s`
}

export function formatDatePostId(dateString: string) {
  const date = new Date(dateString)

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedDate = dateFormatter.format(date)

  const dateParts = formattedDate.split(', ')

  const time = dateParts.slice(0, 2).join(', ')

  const datePart = dateParts.slice(2).join('')

  return `${datePart} · ${time}`
}
