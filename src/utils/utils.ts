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

export const TRANSFORMATION_EFFECTS = {
  zombie:
    'gen_replace:from_people;to_a%20terrifying%20zombie%20with%20greenish%20gray%20skin%20and%20mangled%20facial%20features%20wearing%20a%20tattered%20fur%20cloak%20and%20holding%20a%20bloodied%20axe;preserve-geometry_true;multiple_true',
  'background-zombie':
    'gen_background_replace:prompt_A%20dark%20and%20foreboding%20graveyard%20scene%20with%20overgrown%20tombstones%20shrouded%20in%20mist%20and%20ghostly%20figures%20lurking%20in%20the%20shadows%20beneath%20a%20blood-red%20moon;seed_1',
  vampire:
    'gen_replace:from_people;to_a%20terrifying%20vampire%20with%20pale%20skin%20and%20sharp%20fangs%20wearing%20a%20long%20black%20cape%20and%20holding%20a%20gothic%20candelabrum%20or%20any%20relevant%20object%20that%20fits%20the%20vampire%20theme;preserve-geometry_true;multiple_false',
  'background-vampire':
    'gen_background_replace:prompt_A%20gloomy%20graveyard%20at%20midnight%20with%20ancient%20tombstones%20overgrown%20with%20vines%20and%20dark%20clouds%20hovering%20overhead%20while%20a%20full%20moon%20casts%20an%20eerie%20light%20on%20the%20scene;seed_2',
  terrifying:
    'gen_background_replace:prompt_An%20abandoned%20hospital%20with%20dark%20hallways%20flickering%20fluorescent%20lights%20rusted%20hospital%20beds%20and%20medical%20equipment%20scattered%20across%20the%20floor%20walls%20covered%20in%20peeling%20paint%20and%20bloody%20handprints%20thick%20fog%20rolling%20in%20and%20echoes%20of%20distant%20whispers;seed_1',
  clown:
    'gen_replace:from_people;to_a%20malevolent%20clown%20with%20a%20twisted%20smile%20wearing%20a%20tattered%20costume%20covered%20in%20blood%20and%20holding%20a%20bloody%20balloon;preserve-geometry_true;multiple_false',
  'background-clown':
    'gen_background_replace:prompt_A%20a%20creepy%20circus%20scene%20with%20dilapidated%20tents%20and%20blood%20stains%20on%20the%20ground%20with%20faint%20echoes%20of%20laughter%20and%20shadows%20of%20ominous%20figures%20lurking%20in%20the%20background;seed_2',
}

export type TransformationEffectKeys = keyof typeof TRANSFORMATION_EFFECTS

type BackgroundEffectKeys = 'background-zombie' | 'background-vampire' | 'background-clown'

export const BACKGROUND_FILTER_MAP = new Map<string, BackgroundEffectKeys>([
  ['zombie', 'background-zombie'],
  ['vampire', 'background-vampire'],
  ['clown', 'background-clown'],
])

export type MainOptionKeys = 'zombie' | 'vampire' | 'terrifying' | 'clown'

export const STEPS_FORM_CREATE_POST = {
  TEXT: 'text',
  CROP: 'crop',
  APPLY_FILTER: 'applyFilter',
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
