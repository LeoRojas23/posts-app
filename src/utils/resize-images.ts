import sharp from 'sharp'

export async function resizeProfileImage(
  fileBuffer: ArrayBuffer | undefined,
  mime: string | undefined,
) {
  if (!fileBuffer) return undefined

  const sharpInstance = sharp(fileBuffer)

  const imageBuffer = await sharpInstance.webp({ lossless: false, quality: 90 }).toBuffer()

  const base64Image = Buffer.from(imageBuffer).toString('base64')

  return 'data:' + mime + ';' + 'base64' + ',' + base64Image
}

export async function resizePostImage(
  fileBuffer: ArrayBuffer | undefined,
  mime: string | undefined,
) {
  if (!fileBuffer) return undefined

  const options = { lossless: false, quality: 90 }
  const resizeOptions = { withoutEnlargement: true }

  const imageBuffer = await sharp(fileBuffer).resize(resizeOptions).webp(options).toBuffer()

  const base64Image = Buffer.from(imageBuffer).toString('base64')

  return 'data:' + mime + ';' + 'base64' + ',' + base64Image
}
