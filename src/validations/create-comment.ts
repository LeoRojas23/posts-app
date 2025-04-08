import { z } from 'zod'

import { regexAtLeastOneChar, regexMax150Chars } from '@/utils/utils'

export const CreateCommentSchema = z.object({
  text: z
    .string()
    .regex(regexAtLeastOneChar, {
      message: 'The comment must contain at least one character',
    })
    .regex(regexMax150Chars, {
      message: 'The comment cannot exceed 150 characters',
    }),
  postId: z.string().min(1),
  parentId: z.string().min(1).optional(),
})

export type CreateComment = z.infer<typeof CreateCommentSchema>
