import { z } from 'zod'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']

export const ImageSchema = z
  .instanceof(File)
  .refine(file => file === undefined || ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: 'Supported image formats are .jpeg, .jpg, .png, .webp, or .avif',
  })
  .refine(file => file === undefined || file.size <= 1024 * 1024 * 4.3, {
    message: 'The image size should not exceed 4,5 MB',
  })
  .refine(
    file =>
      new Promise(resolve => {
        const reader = new FileReader()

        reader.onload = e => {
          const img = new Image()

          img.onload = () => {
            const meetsDimension = img.width >= 200 && img.height >= 200

            resolve(meetsDimension)
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      }),
    { message: 'The image size should be at least 200px by 200px' },
  )
