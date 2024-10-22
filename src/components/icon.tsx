import { type SVGProps } from 'react'

export default function Icon({ id, ...props }: SVGProps<SVGSVGElement> & { id: string }) {
  return (
    <svg {...props}>
      <use href={`/sprite.svg#${id}`} />
    </svg>
  )
}
