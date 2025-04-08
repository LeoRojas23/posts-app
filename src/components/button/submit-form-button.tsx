'use client'

import { type ButtonHTMLAttributes } from 'react'

import Dots from '../dots'

import { cn } from '@/utils/cn'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className: string
  disableDots?: boolean
  fromToggleFollow?: boolean
  pending: boolean
}

export default function SubmitFormButton({
  children,
  className,
  disableDots = false,
  fromToggleFollow = false,
  pending,
  ...props
}: Props) {
  return (
    <button
      className={cn('grid place-items-center', className, {
        'place-items-start': disableDots,
      })}
      disabled={!fromToggleFollow && pending}
      type='submit'
      {...props}
    >
      <span
        className={cn('col-start-1 row-start-1', {
          'pointer-events-none opacity-0': !disableDots && pending,
        })}
      >
        {children}
      </span>
      {!disableDots && (
        <span
          className={cn('col-start-1 row-start-1', {
            'pointer-events-none opacity-0': !disableDots && !pending,
          })}
        >
          <Dots />
        </span>
      )}
    </button>
  )
}
