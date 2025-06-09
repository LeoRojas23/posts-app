'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v2 as cloudinary } from 'cloudinary'
import { and, eq } from 'drizzle-orm'
import { unstable_expireTag as expireTag } from 'next/cache'
import { cookies, headers } from 'next/headers'
import sharp from 'sharp'
import { del } from '@vercel/blob'

import { db } from '@/db'
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
import { getPublicId } from '@/utils/utils'
import {
  type ToggleLikeResponse,
  type CreateCommentResponse,
  type CreatePostResponse,
  UpdateSettingsResponse,
} from '@/types'
import { auth } from '@/auth'

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadImageToCloudinary(dataUri: string) {
  try {
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      transformation: [{ radius: 6 }],
      invalidate: true,
    })

    ;(await cookies()).set('image-url-cld', uploadResult.url, { httpOnly: true })

    return uploadResult
  } catch {
    throw new Error('Failed to upload image to Cloudinary.')
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

export async function processImage({
  url,
  mime,
  from,
}: {
  url: string
  mime: string | undefined
  from: 'post' | 'profile'
}) {
  ;(await cookies()).set('blob-image-url', url, {
    httpOnly: true,
  })

  const fileBuffer = await fetch(url).then(res => res.arrayBuffer())

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

export async function getSignature() {
  const timestamp = Math.round(new Date().getTime() / 1000)

  const signature = cloudinary.utils.api_sign_request({ timestamp }, cloudinaryConfig.api_secret!)

  return { timestamp, signature }
}

export async function manageAuth({
  action,
  provider,
}: {
  action: 'signIn' | 'signOut'
  provider: 'google' | 'github' | undefined
}) {
  if (action === 'signOut') {
    await auth.api.signOut({ headers: await headers() })

    return
  } else if (action === 'signIn' && provider) {
    const res = await auth.api.signInSocial({ body: { provider: provider } })

    if (res.url) {
      return redirect(res.url)
    } else {
      throw new Error('Redirect url not found')
    }
  }
}

export const createPost = async ({
  text,
  image,
}: {
  text: string | undefined
  image: string | null
}): Promise<CreatePostResponse> => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user)
    return {
      success: false,
      message: 'Authentication required.',
    }

  const result = CreatePostSchema.safeParse({ text, image })

  if (!result.success) {
    let errorMessage = ''

    result.error.issues.forEach(issue => {
      errorMessage = errorMessage + issue.message + '. '
    })

    return {
      success: false,
      message: errorMessage,
      payload: text,
    }
  }

  const cookieStore = await cookies()
  const imageUrl = cookieStore.get('blob-image-url')?.value

  Promise.all([
    db.insert(postTable).values({
      authorId: user.session.userId,
      text: result.data.text,
      image: image ?? null,
    }),
    cookieStore.delete('image-url-cld'),
    cookieStore.delete('blob-image-url'),
    imageUrl ? del(imageUrl) : Promise.resolve(),
  ])

  expireTag('root-posts', 'user-posts', 'media-posts', 'search-posts')

  return {
    success: true,
    message: 'Post created successfully',
  }
}

export const createComment = async ({
  formData,
  postId,
  parentId,
}: {
  formData: FormData
  postId: string
  parentId?: string
}): Promise<CreateCommentResponse> => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user)
    return {
      success: false,
      message: 'Authentication required.',
    }

  const content = Object.fromEntries(formData.entries())

  const text = Object.values(content)[0]

  const result = CreateCommentSchema.safeParse({ text, postId, parentId })

  if (!result.success) {
    let errorMessage = ''

    result.error.issues.forEach(issue => {
      errorMessage = errorMessage + issue.message + '. '
    })

    return {
      success: false,
      message: errorMessage,
      payload: text as string,
    }
  }

  await db.insert(commentTable).values({
    text: result.data.text,
    postId: result.data.postId,
    authorId: user.session.userId,
    parentId: result.data.parentId ?? null,
  })

  expireTag(
    'comments-count-of-comment',
    'comments-count-of-post',
    'comments-of-post',
    'replies-of-user',
    'comments-count-of-reply',
  )

  return {
    success: true,
    message: 'Comment created successfully',
  }
}

export const deleteData = async ({
  dataId,
  from,
  path,
}: {
  dataId: string
  from: 'post' | 'comment'
  path: string
}) => {
  if (from === 'post') {
    await deletePost({ postId: dataId })
  } else {
    await deleteComment(dataId)
    revalidatePath(path)

    return
  }

  if (path.startsWith('/post')) {
    redirect('/')
  }
}

export const deletePost = async ({ postId }: { postId: string }) => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user) return

  const urlImagePost = await db
    .select({
      image: postTable.image,
    })
    .from(postTable)
    .where(and(eq(postTable.id, postId), eq(postTable.authorId, user.session.userId)))
    .then(res => res[0])

  await db
    .delete(postTable)
    .where(and(eq(postTable.id, postId), eq(postTable.authorId, user.session.userId)))

  if (urlImagePost) {
    deleteCloudinaryImage(urlImagePost.image)
  }

  expireTag(
    'root-posts',
    'post-id',
    'user-posts',
    'replies-of-user',
    'media-posts',
    'liked-posts',
    'search-posts',
    'comments-count-of-reply',
  )
}

export const deleteComment = async (commentId: string) => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user) return

  await db.delete(commentTable).where(eq(commentTable.id, commentId))
}

export const toggleLike = async ({
  dataId,
  from,
}: {
  dataId: string
  from: 'post' | 'comment'
}): Promise<ToggleLikeResponse> => {
  if (from === 'post') {
    return await toggleLikePost({ postId: dataId })
  } else {
    return await toggleLikeComment({ commentId: dataId })
  }
}

export const toggleLikePost = async ({
  postId,
}: {
  postId: string
}): Promise<ToggleLikeResponse> => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user)
    return {
      success: false,
      message: 'Authentication required.',
    }

  const existLike = await db
    .select({
      userId: postLikeTable.userId,
    })
    .from(postLikeTable)
    .where(and(eq(postLikeTable.userId, user.session.userId), eq(postLikeTable.postId, postId)))
    .then(res => res[0])

  if (existLike) {
    await db
      .delete(postLikeTable)
      .where(and(eq(postLikeTable.userId, user.session.userId), eq(postLikeTable.postId, postId)))
  } else {
    await db.insert(postLikeTable).values({
      userId: user.session.userId,
      postId,
    })
  }

  expireTag('likes-of-post', 'liked-posts')

  return {
    success: true,
    message: 'Toggle liked successfully',
  }
}

export const toggleLikeComment = async ({
  commentId,
}: {
  commentId: string
}): Promise<ToggleLikeResponse> => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user)
    return {
      success: false,
      message: 'Authentication required',
    }

  const existLike = await db
    .select({
      userId: commentLikeTable.userId,
    })
    .from(commentLikeTable)
    .where(
      and(
        eq(commentLikeTable.userId, user.session.userId),
        eq(commentLikeTable.commentId, commentId),
      ),
    )
    .then(res => res[0])

  if (existLike) {
    await db
      .delete(commentLikeTable)
      .where(
        and(
          eq(commentLikeTable.commentId, commentId),
          eq(commentLikeTable.userId, user.session.userId),
        ),
      )
  } else {
    await db.insert(commentLikeTable).values({
      userId: user.session.userId,
      commentId,
    })
  }

  expireTag('likes-of-comment', 'liked-comments')

  return {
    success: true,
    message: 'Toggle liked successfully',
  }
}

export const toggleFollow = async ({ userToFollow }: { userToFollow: string }) => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user) return

  if (user.session.userId === userToFollow) return

  const existingFollow = await db
    .select({
      followerId: followTable.followerId,
    })
    .from(followTable)
    .where(
      and(
        eq(followTable.followerId, user.session.userId),
        eq(followTable.followingId, userToFollow),
      ),
    )
    .then(res => res[0])

  if (existingFollow) {
    await db
      .delete(followTable)
      .where(
        and(
          eq(followTable.followerId, user.session.userId),
          eq(followTable.followingId, userToFollow),
        ),
      )
  } else {
    await db.insert(followTable).values({
      followerId: user.session.userId,
      followingId: userToFollow,
    })
  }

  expireTag('follows-promise', 'follows-count')
}

export const clearImageData = async () => {
  const cookieStore = await cookies()
  const blobUrl = cookieStore.get('blob-image-url')!.value
  const imageUrl = cookieStore.get('image-url-cld')!.value

  await Promise.all([
    del(blobUrl),
    deleteCloudinaryImage(imageUrl),
    cookieStore.delete('image-url-cld'),
    cookieStore.delete('blob-image-url'),
  ])
}

export const updateSettings = async ({
  name,
  username,
  image,
}: {
  name: string | undefined
  username: string | undefined
  image: string | null
}): Promise<UpdateSettingsResponse> => {
  const user = await auth.api.getSession({ headers: await headers() })

  if (!user)
    return {
      success: false,
      message: 'Authentication required.',
    }

  const result = UpdateSettingsSchema.safeParse({ name, username, image })

  if (!result.success) {
    let errorMessage = ''

    result.error.issues.forEach(issue => {
      errorMessage = errorMessage + issue.message + '. '
    })

    return {
      success: false,
      message: errorMessage,
      payload: {
        name,
        username,
      },
    }
  }

  if (result.data.username !== undefined) {
    if (result.data.username === user.user.username) {
      return {
        success: false,
        message: 'Username cannot be the same as your current username.',
        payload: {
          name,
          username,
        },
      }
    }

    const existingUser = await db
      .select({
        username: userTable.username,
      })
      .from(userTable)
      .where(eq(userTable.username, result.data.username))
      .then(res => res[0])

    if (existingUser) {
      return {
        success: false,
        message: 'Username is taken.',
        payload: {
          name,
          username,
        },
      }
    }
  }

  const imageProfile = await db
    .select({
      image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.id, user.session.userId))
    .then(res => res[0].image)

  const newImage = image ?? imageProfile

  const cookieStore = await cookies()

  await Promise.all([
    db
      .update(userTable)
      .set({
        image: newImage,
        name: result.data.name,
        username: result.data.username,
      })
      .where(eq(userTable.id, user.session.userId)),
    cookieStore.delete('blob-image-url'),
    cookieStore.delete('image-url-cld'),
    image && imageProfile ? deleteCloudinaryImage(imageProfile) : Promise.resolve(),
  ])

  const redirectUsername = result.data.username ?? user.user.username

  expireTag('search-users', 'user-info')

  return redirect(`/profile/${redirectUsername}`)
}
