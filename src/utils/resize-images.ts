import sharp from 'sharp'

export async function resizeImage({
  fileBuffer,
  mime,
  from,
}: {
  fileBuffer: ArrayBuffer | undefined
  mime: string | undefined
  from: 'post' | 'profile'
}) {
  if (!fileBuffer) return undefined

  const imageBuffer = await sharp(fileBuffer)
    .resize({
      withoutEnlargement: true,
      width: from === 'post' ? 740 : 300,
      height: from === 'post' ? 480 : 300,
      fit: 'inside',
    })
    .webp({ lossless: false, quality: 90 })
    .toBuffer()

  const base64Image = Buffer.from(imageBuffer).toString('base64')

  return 'data:' + mime + ';' + 'base64' + ',' + base64Image
}
