import { z } from 'zod'

import { regexMax280Chars, regexNoWhitespaceOnly } from '@/utils/utils'

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
