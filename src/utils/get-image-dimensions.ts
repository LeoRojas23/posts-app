import { imageSize } from 'image-size'

export async function getImageDimensions(data: Buffer) {
  if (!data) return null

  try {
    const { width, height } = imageSize(data)

    return { width, height }
  } catch (error) {
    console.log('Error obtaining image dimensions', error)

    return null
  }
}
