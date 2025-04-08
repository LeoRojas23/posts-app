'use client'

import Icon from '../icon'

import { cn } from '@/utils/cn'

interface Props {
  likesLength: number
  colorHeart: boolean
}

export default function ToggleLikeButton({ likesLength, colorHeart }: Props) {
  return (
    <button
      className='group/like-svg mx-auto flex w-fit cursor-pointer items-center justify-center gap-1.5 py-1.5'
      type='submit'
    >
      <Icon
        className={cn(
          'h-6 w-6 transition-colors duration-100 ease-linear sm:group-hover/like-svg:text-[#ff9e9e]',
          {
            'text-[#ff3939]': colorHeart,
            'text-neutral-200': !colorHeart,
          },
        )}
        id={colorHeart ? 'filledHeart' : 'emptyHeart'}
      />
      <span className='text-sm font-light tabular-nums text-neutral-200 sm:text-base'>
        {likesLength}
      </span>
    </button>
  )
}
