'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v2 as cloudinary } from 'cloudinary'
import { and, eq } from 'drizzle-orm'
import { generateCodeVerifier, generateState } from 'arctic'
import { cookies } from 'next/headers'

import { db } from '@/db'
import { resizePostImage, resizeProfileImage } from '@/utils/resize-images'
import {
  commentLikeTable,
  commentTable,
  followTable,
  postLikeTable,
  postTable,
  userTable,
} from '@/db/schema'
import { CreatePostSchema } from '@/validations/create-post'
import { CreateCommentSchema } from '@/validations/create-comment'
import { UpdateSettingsSchema } from '@/validations/update-settings'
import { lucia, validateRequest } from '@/lib/lucia'
import { github, google } from '@/lib/oauth'
import {
  BACKGROUND_FILTER_MAP,
  getPublicId,
  MainOptionKeys,
  TRANSFORMATION_EFFECTS,
} from '@/utils/utils'

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

async function uploadImageToCloudinary(fileUri: string | undefined) {
  if (!fileUri) return undefined

  try {
    const uploadResult = await cloudinary.uploader.unsigned_upload(
      fileUri,
      'upload-unsigned-images',
    )

    return uploadResult
  } catch (error) {
    console.log(error)
    throw new Error('Failed to upload image to Cloudinary.')
  }
}

async function uploadProfileImageToCloudinary(fileUri: string | undefined) {
  if (!fileUri) return undefined

  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      transformation: [{ radius: 6 }],
      invalidate: true,
    })

    return result
  } catch {
    throw new Error('Failed to upload profile image to Cloudinary.')
  }
}

async function deleteCloudinaryImage(imageUrl: string | null) {
  if (!imageUrl) return

  const publicId = getPublicId(imageUrl)

  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true })
    } catch {
      throw new Error(`Failed to delete image from cloudinary`)
    }
  }
}

export async function getSignature() {
  const timestamp = Math.round(new Date().getTime() / 1000)

  const signature = cloudinary.utils.api_sign_request({ timestamp }, cloudinaryConfig.api_secret!)

  return { timestamp, signature }
}

export const createGoogleAuthorizationURL = async () => {
  try {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    cookies().set('codeVerifier', codeVerifier, {
      httpOnly: true,
    })

    cookies().set('state', state, {
      httpOnly: true,
    })

    const authorizationURL = await google.createAuthorizationURL(state, codeVerifier, {
      scopes: ['email', 'profile'],
    })

    return {
      success: true,
      data: authorizationURL,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        error: error.message,
      }
    }

    return {
      error: 'An unknown error occurred',
    }
  }
}

export const createGithubAuthorizationURL = async () => {
  try {
    const state = generateState()

    cookies().set('state', state, {
      httpOnly: true,
    })

    const authorizationURL = await github.createAuthorizationURL(state, {
      scopes: ['user:email'],
    })

    return {
      success: true,
      data: authorizationURL,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        error: error.message,
      }
    }

    return {
      error: 'An unknown error occurred',
    }
  }
}

export const signOut = async () => {
  try {
    const { session } = await validateRequest()

    if (!session) {
      return {
        error: 'Unauthorized',
      }
    }

    await lucia.invalidateSession(session.id)

    const sessionCookie = lucia.createBlankSessionCookie()

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return {
      success: true,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        error: error.message,
      }
    }

    return {
      error: 'An unknown error occurred',
    }
  }
}

export const processAndUploadImage = async (formData: FormData) => {
  const imageFile = formData.get('postImage') as File

  if (!imageFile) return

  try {
    const fileBuffer = await imageFile.arrayBuffer()
    const mime = imageFile.type

    const optimizedFile = await resizePostImage(fileBuffer, mime)

    const result = await uploadImageToCloudinary(optimizedFile)

    if (!result?.secure_url) {
      return { error: 'Failed to upload image to Cloudinary.' }
    }

    return { url: result.secure_url }
  } catch {
    return {
      error: 'An error ocurred while processing the image.',
    }
  }
}

export async function applyFilterToImage(url: string, keyValue: MainOptionKeys) {
  try {
    const publicId = getPublicId(url)

    if (!publicId) {
      throw new Error('Invalid publicId')
    }

    const transformationEffects: Array<string> = [TRANSFORMATION_EFFECTS[keyValue]]

    const backgroundSelected = BACKGROUND_FILTER_MAP.get(keyValue)

    if (backgroundSelected) {
      transformationEffects.push(TRANSFORMATION_EFFECTS[backgroundSelected])
    }

    const transformedUrl = cloudinary.url(publicId, {
      transformation: transformationEffects.map(effect => ({ effect })),
      radius: 6,
    })

    return transformedUrl
  } catch (error) {
    console.log(error)

    throw new Error('Failed to apply filter to image')
  }
}

export const createPost = async (formData: FormData, imageUrl: string | null) => {
  const { session } = await validateRequest()

  if (!session) return

  const text = (formData.get('postText') as string) || undefined

  const result = CreatePostSchema.safeParse({ text, image: imageUrl })

  if (!result.success) {
    let errorMessage = ''

    result.error.issues.forEach(issue => {
      errorMessage = errorMessage + issue.message + '. '
    })

    return {
      error: errorMessage,
    }
  }

  await db.insert(postTable).values({
    authorId: session.userId,
    text: result.data.text,
    image: imageUrl ?? null,
  })

  revalidatePath('/')
}

export const deleteData = async (dataId: string, from: 'post' | 'comment', path: string) => {
  if (from === 'post') {
    await deletePost(dataId)
  } else {
    await deleteComment(dataId)
    revalidatePath(path)

    return
  }

  if (path.startsWith('/post')) {
    redirect('/')
  } else {
    revalidatePath(path)
  }
}

export const toggleLike = async (dataId: string, from: 'post' | 'comment', path: string) => {
  if (from === 'post') {
    await toggleLikePost(dataId)
  } else {
    await toggleLikeComment(dataId)
  }

  revalidatePath(path)
}

export const deletePost = async (postId: string) => {
  const { session } = await validateRequest()

  if (!session) return

  const urlImagePost = await db.query.postTable.findFirst({
    where: and(eq(postTable.id, postId), eq(postTable.authorId, session.userId)),
    columns: {
      image: true,
    },
  })

  await db
    .delete(postTable)
    .where(and(eq(postTable.id, postId), eq(postTable.authorId, session.userId)))

  if (urlImagePost) {
    deleteCloudinaryImage(urlImagePost.image)
  }
}

export const toggleLikePost = async (postId: string) => {
  const { session } = await validateRequest()

  if (!session) return

  const existLike = await db
    .select({
      userId: postLikeTable.userId,
    })
    .from(postLikeTable)
    .where(and(eq(postLikeTable.userId, session.userId), eq(postLikeTable.postId, postId)))
    .then(res => res[0])

  if (existLike) {
    await db
      .delete(postLikeTable)
      .where(and(eq(postLikeTable.userId, session.userId), eq(postLikeTable.postId, postId)))
  } else {
    await db.insert(postLikeTable).values({
      userId: session.userId,
      postId,
    })
  }
}

export const followUser = async (userToFollow: string, path: string) => {
  const { session } = await validateRequest()

  if (!session) return

  if (session.userId === userToFollow) return

  const existingFollow = await db
    .select({
      followerId: followTable.followerId,
    })
    .from(followTable)
    .where(
      and(eq(followTable.followerId, session.userId), eq(followTable.followingId, userToFollow)),
    )
    .then(res => res[0])

  if (existingFollow) {
    await db
      .delete(followTable)
      .where(
        and(eq(followTable.followerId, session.userId), eq(followTable.followingId, userToFollow)),
      )
  } else {
    await db.insert(followTable).values({
      followerId: session.userId,
      followingId: userToFollow,
    })
  }

  revalidatePath(path)
}

export const createComment = async (
  formData: FormData,
  postId: string,
  path: string,
  parentId?: string,
) => {
  const { session } = await validateRequest()

  if (!session) return

  const content = Object.fromEntries(formData.entries())

  const text = Object.values(content)[0]

  const result = CreateCommentSchema.safeParse({ text, postId, parentId })

  if (!result.success) {
    let errorMessage = ''

    result.error.issues.forEach(issue => {
      errorMessage = errorMessage + issue.message + '. '
    })

    return {
      error: errorMessage,
    }
  }

  await db.insert(commentTable).values({
    text: result.data.text,
    postId: result.data.postId,
    authorId: session.userId,
    parentId: result.data.parentId ?? null,
  })

  revalidatePath(path)
}

export const deleteComment = async (commentId: string) => {
  const { session } = await validateRequest()

  if (!session) return

  await db.delete(commentTable).where(eq(commentTable.id, commentId))
}

export const toggleLikeComment = async (commentId: string) => {
  const { session } = await validateRequest()

  if (!session) return

  const existLike = await db
    .select({
      userId: commentLikeTable.userId,
    })
    .from(commentLikeTable)
    .where(
      and(eq(commentLikeTable.userId, session.userId), eq(commentLikeTable.commentId, commentId)),
    )
    .then(res => res[0])

  if (existLike) {
    await db
      .delete(commentLikeTable)
      .where(
        and(eq(commentLikeTable.commentId, commentId), eq(commentLikeTable.userId, session.userId)),
      )
  } else {
    await db.insert(commentLikeTable).values({
      userId: session.userId,
      commentId,
    })
  }
}

export const updateSettings = async (formData: FormData) => {
  const { user } = await validateRequest()

  if (!user) return

  const name = (formData.get('name') as string) || undefined
  const username = (formData.get('username') as string) || undefined
  const image = (formData.get('profileImage') as File) || undefined
  const imageFile = image?.size > 0 ? image : undefined

  const result = UpdateSettingsSchema.safeParse({ name, username, image: imageFile })

  if (!result.success) {
    let errorMessage = ''

    result.error.issues.forEach(issue => {
      errorMessage = errorMessage + issue.message + '. '
    })

    return {
      error: errorMessage,
    }
  }

  const fileBuffer = await result.data.image?.arrayBuffer()
  const mime = result.data.image?.type

  const fileImageOptimized = await resizeProfileImage(fileBuffer, mime)

  if (result.data.username !== undefined && result.data.username !== user.username) {
    const existingUser = await db
      .select({
        username: userTable.username,
      })
      .from(userTable)
      .where(eq(userTable.username, result.data.username))
      .then(res => res[0])

    if (existingUser) {
      return {
        error: 'Username is taken.',
      }
    }
  }

  const cloudinaryImage = await uploadProfileImageToCloudinary(fileImageOptimized)

  const imageProfile = await db
    .select({
      image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.id, user.id))
    .then(res => res[0])

  await db
    .update(userTable)
    .set({
      image: cloudinaryImage?.secure_url,
      name: result.data.name,
      username: result.data.username,
    })
    .where(eq(userTable.id, user.id))

  if (result.data.image) {
    await deleteCloudinaryImage(imageProfile.image)
  }

  const redirectUsername = result.data.username ?? user.username

  return redirect(`/profile/${redirectUsername}`)
}
