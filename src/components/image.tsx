'use client'
import { useEffect } from 'react'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

import { cn } from '@/utils/cn'

interface Props {
  srcImage: string
  alt: string
  width?: number | undefined
  height?: number | undefined
  className?: string
  fromProfile?: boolean
}

export default function Image({
  srcImage,
  alt,
  width,
  height,
  className,
  fromProfile = false,
}: Props) {
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: () => import('photoswipe'),
    })

    lightbox.init()

    return () => {
      lightbox.destroy()
    }
  }, [])

  return (
    <div className='pswp-gallery' id='gallery'>
      <a
        data-pswp-height={fromProfile ? 399 : height}
        data-pswp-width={fromProfile ? 399 : width}
        href={srcImage}
        rel='noopener'
        target='_blank'
      >
        <img alt={alt} className={cn(className)} height={height} src={srcImage} width={width} />
      </a>
    </div>
  )
}
