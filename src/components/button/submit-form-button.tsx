'use client'

import { type ButtonHTMLAttributes } from 'react'
import { useFormStatus } from 'react-dom'

import Dots from '../dots'

import { cn } from '@/utils/cn'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className: string
  disableDots?: boolean
}

export default function SubmitFormButton({
  children,
  className,
  disableDots = false,
  ...props
}: Props) {
  const { pending } = useFormStatus()

  return (
    <button className={cn('h-9', className)} disabled={pending} type='submit' {...props}>
      {disableDots ? children : pending ? <Dots /> : children}
    </button>
  )
}
