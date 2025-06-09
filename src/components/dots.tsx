import { cn } from '@/utils/cn'

const dots = 'h-1.5 w-1.5 rounded-full animate-bounce'

export default function Dots({ bgColor }: { bgColor: string }) {
  return (
    <div className='flex w-full items-center justify-center gap-[2px]'>
      <span className={cn(dots, bgColor, '[animation-delay:-0.3s]')} />
      <span className={cn(dots, bgColor, '[animation-delay:-0.15s]')} />
      <span className={cn(dots, bgColor)} />
    </div>
  )
}
