import { NextResponse } from 'next/server'

import { resizeImage } from '@/utils/resize-images'
import { uploadImageToCloudinary } from '@/actions/actions'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const content = Object.fromEntries(formData.entries())

    const imageFile = Object.values(content)[0] as File
    const from = formData.get('from') as 'post' | 'profile'

    if (!imageFile) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 })
    }

    const fileBuffer = await imageFile.arrayBuffer()
    const mime = imageFile.type

    const optimizedFile = await resizeImage({ fileBuffer, mime, from })

    const result = await uploadImageToCloudinary(optimizedFile)

    if (!result?.secure_url) {
      return NextResponse.json(
        { error: 'Failed to upload the image to Cloudinary.' },
        { status: 400 },
      )
    }

    return NextResponse.json({ url: result.secure_url }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error ocurred while processing the image.' + error },
      { status: 400 },
    )
  }
}
