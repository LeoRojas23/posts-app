import { z } from 'zod'

import { regexMax280Chars, regexNoWhitespaceOnly } from '@/utils/utils'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']

export const PostImageSchema = z
  .instanceof(File)
  .refine(file => file === undefined || ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: 'Supported image formats are .jpg, .jpeg, .png, .avif, or .webp',
  })
  .refine(file => file === undefined || file.size <= 1024 * 1024 * 4.3, {
    message: 'The image size should not exceed 4,5 MB',
  })

export const CreatePostSchema = z
  .object({
    text: z
      .string()
      .regex(regexNoWhitespaceOnly, {
        message: 'Text content cannot consist solely of whitespace',
      })
      .regex(regexMax280Chars, {
        message: 'Text content cannot exceed 280 characters',
      })
      .optional(),
    image: z.string().url().nullable().optional(),
  })
  .refine(data => data.text ?? data.image, {
    message: 'At least one of text or image must be provided',
  })
