import { Crop } from 'react-image-crop'

import { FileWithPreview } from '@/types'

export function generateCroppedImageBlob(
  image: HTMLImageElement,
  crop: Crop,
  file: FileWithPreview,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const pixelRatio = window.devicePixelRatio
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingEnabled = true
  ctx.save()

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  ctx.translate(-cropX, -cropY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )

  ctx.restore()

  return new Promise(resolve => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          console.error('Error generating blob')
          resolve(null)

          return
        }
        resolve(blob)
      },
      file.type || 'image/jpeg',
      1,
    )
  })
}
