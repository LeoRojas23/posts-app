import { z } from 'zod'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']

export const ProfileImageSchema = z
  .instanceof(File)
  .refine(file => file === undefined || ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: 'Supported image formats are .jpeg, .jpg, .png, .webp, or .avif',
  })
  .refine(file => file === undefined || file.size <= 1024 * 1024 * 4.3, {
    message: 'The image size should not exceed 4,5 MB',
  })

export const UpdateSettingsSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: 'The name must have at least 2 characters',
      })
      .max(50, {
        message: 'The name must have a maximum of 50 characters',
      })
      .regex(/^[a-zA-Z0-9_áéíóúÁÉÍÓÚüÜ\s-]+$/, {
        message: 'The name can contain uppercase, lowercase, numbers, underscores, and spaces',
      })
      .optional(),
    username: z
      .string()
      .min(3, {
        message: 'The username must have at least 3 characters',
      })
      .max(15, {
        message: 'The username must have a maximum of 15 characters',
      })
      .regex(/^[a-zA-Z0-9_áéíóúÁÉÍÓÚüÜ]+$/, {
        message: 'The username can contain uppercase, lowercase, numbers and underscores',
      })
      .optional(),
    image: ProfileImageSchema.optional(),
  })
  .refine(
    data => {
      if (data.name ?? data.username ?? data.image) {
        return true
      }
    },
    { message: 'Try to update your profile' },
  )