'use cache'

import { and, asc, count, desc, eq, isNotNull, max, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { alias } from 'drizzle-orm/sqlite-core'
import { unstable_cacheTag as cacheTag } from 'next/cache'

import { db } from '@/db'
import {
  commentLikeTable,
  commentTable,
  followTable,
  postLikeTable,
  postTable,
  userTable,
} from '@/db/schema'
import { type Comment, type Post } from '@/types'
import { getImageDimensions } from '@/utils/get-image-dimensions'
import { urlToBuffer } from '@/utils/utils'

export async function getUserInfo({ slug, id }: { slug?: string; id?: string }) {
  cacheTag('user-info')

  const user = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      username: userTable.username,
      image: userTable.image,
    })
    .from(userTable)
    .where(slug ? eq(userTable.username, slug) : id ? eq(userTable.id, id) : undefined)
    .then(res => res[0])

  if (!user) return notFound()

  return user
}

export async function getRootPosts({ page }: { page: number }) {
  cacheTag('root-posts')

  const limit = 6
  const offset = (page - 1) * limit

  const postsData = await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
    })
    .from(postTable)
    .orderBy(desc(postTable.createdAt))
    .offset(offset)
    .limit(limit)

  const posts = await Promise.all(
    postsData.map(async post => {
      const author = await getUserInfo({ id: post.authorId })

      if (post.image) {
        const buffer = await urlToBuffer(post.image)
        const imageDimensions = await getImageDimensions(buffer)

        return { ...post, author, imageDimensions }
      }

      return { ...post, author, imageDimensions: null }
    }),
  )

  const postsQuantity = await db
    .select({
      count: count(),
    })
    .from(postTable)
    .then(res => res[0].count)

  const totalPages = Math.ceil(postsQuantity / limit)

  return { posts, totalPages }
}

export async function getPostId({ postId, slug }: { postId: string; slug: string }) {
  cacheTag('post-id')

  const post = (await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
    })
    .from(postTable)
    .where(eq(postTable.id, postId))
    .leftJoin(userTable, eq(postTable.authorId, userTable.id))
    .then(res => res[0])) as Post

  if (!post) return notFound()

  const author = await getUserInfo({ id: post.authorId })

  if (author.username !== slug) return notFound()

  if (post.image) {
    const buffer = await urlToBuffer(post.image)

    post.imageDimensions = await getImageDimensions(buffer)
  } else {
    post.imageDimensions = null
  }

  return { post: { ...post, author } }
}

export async function getCommentsPostId({ postId }: { postId: string }) {
  cacheTag('comments-of-post')

  const rawComments = await db
    .select({
      id: commentTable.id,
      authorId: commentTable.authorId,
      text: commentTable.text,
      createdAt: commentTable.createdAt,
      parentId: commentTable.parentId,
    })
    .from(commentTable)
    .where(eq(commentTable.postId, postId))

  const uniqueAuthorIds = [...new Set(rawComments.map(comment => comment.authorId))]

  const authors = await Promise.all(
    uniqueAuthorIds.map(async authorId => ({
      authorId,
      data: await getUserInfo({ id: authorId }),
    })),
  )

  const authorMap = Object.fromEntries(authors.map(({ authorId, data }) => [authorId, data]))

  const commentMap = new Map<string, Comment>()
  const topLevelComments: Comment[] = []

  rawComments.forEach(comment => {
    const formattedComment = {
      ...comment,
      author: authorMap[comment.authorId],
      children: [],
    }

    commentMap.set(comment.id, formattedComment)

    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)

      if (parent) {
        parent.children.push(formattedComment)
      }
    } else {
      topLevelComments.push(formattedComment)
    }
  })

  return { comments: topLevelComments }
}

export async function getPostsOfUser({ slug, page }: { slug: string; page: number }) {
  cacheTag('user-posts')

  const limit = 6
  const offset = (page - 1) * limit

  const author = await getUserInfo({ slug })

  const postsData = await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
    })
    .from(postTable)
    .where(eq(postTable.authorId, author.id))
    .orderBy(desc(postTable.createdAt))
    .offset(offset)
    .limit(limit)

  const posts = await Promise.all(
    postsData.map(async post => {
      const postWithAuthor = {
        ...post,
        author,
      }

      if (post.image) {
        const buffer = await urlToBuffer(post.image)
        const imageDimensions = await getImageDimensions(buffer)

        return { ...postWithAuthor, imageDimensions }
      }

      return { ...postWithAuthor, imageDimensions: null }
    }),
  )

  const postsQuantity = await db
    .select({
      count: count(),
    })
    .from(postTable)
    .where(eq(postTable.authorId, author.id))
    .then(res => res[0].count)

  const totalPages = Math.ceil(postsQuantity / limit)

  return { posts, totalPages }
}

export async function getRepliesOfUser({ slug, page }: { slug: string; page: number }) {
  cacheTag('replies-of-user')

  const author = await getUserInfo({ slug })

  const limit = 3

  const postsWithLastReply = await db
    .select({
      postId: commentTable.postId,
      lastReplyCreatedAt: max(commentTable.createdAt),
    })
    .from(commentTable)
    .where(eq(commentTable.authorId, author.id))
    .groupBy(commentTable.postId)
    .orderBy(desc(max(commentTable.createdAt)))

  const paginatedPostIds = postsWithLastReply
    .slice((page - 1) * limit, page * limit)
    .map(post => post.postId)

  const postsWithReplies = await Promise.all(
    paginatedPostIds.map(async postId => {
      const post = await db
        .select({
          id: postTable.id,
          text: postTable.text,
          image: postTable.image,
          authorId: postTable.authorId,
          createdAt: postTable.createdAt,
        })
        .from(postTable)
        .where(eq(postTable.id, postId))
        .then(res => res[0])

      let imageDimensions = null

      if (post.image) {
        const buffer = await urlToBuffer(post.image)

        imageDimensions = await getImageDimensions(buffer)
      }

      const postAuthor = await getUserInfo({ id: post.authorId })

      const replies = await db
        .select({
          id: commentTable.id,
          authorId: commentTable.authorId,
          text: commentTable.text,
          createdAt: commentTable.createdAt,
        })
        .from(commentTable)
        .where(and(eq(commentTable.postId, postId), eq(commentTable.authorId, author.id)))
        .orderBy(desc(commentTable.createdAt))
        .limit(limit)
        .then(res =>
          res.map(reply => ({
            ...reply,
            author,
          })),
        )

      const lastReplyCreatedAt = replies.reduce(
        (latest, reply) =>
          new Date(reply.createdAt) > latest ? new Date(reply.createdAt) : latest,
        new Date(0),
      )

      return {
        ...post,
        author: postAuthor,
        comments: replies,
        imageDimensions,
        lastReplyCreatedAt,
      }
    }),
  )

  const totalPages = Math.ceil(postsWithLastReply.length / limit)

  return { replies: postsWithReplies, totalPages }
}

export async function getMediaPostsOfUser({ slug, page }: { slug: string; page: number }) {
  cacheTag('media-posts')

  const limit = 6
  const offset = (page - 1) * limit

  const author = await getUserInfo({ slug })

  const mediaPostsData = await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
    })
    .from(postTable)
    .where(and(eq(postTable.authorId, author.id), isNotNull(postTable.image)))
    .orderBy(desc(postTable.createdAt))
    .limit(limit)
    .offset(offset)

  const mediaPosts = await Promise.all(
    mediaPostsData.map(async post => {
      const buffer = await urlToBuffer(post.image!)
      const imageDimensions = await getImageDimensions(buffer)

      return { ...post, author, imageDimensions }
    }),
  )

  const mediaPostsQuantity = await db
    .select({
      count: count(),
    })
    .from(postTable)
    .where(and(eq(postTable.authorId, author.id), isNotNull(postTable.image)))
    .then(res => res[0].count)

  const totalPages = Math.ceil(mediaPostsQuantity / limit)

  return { mediaPosts, totalPages }
}

export async function getLikedPosts({ slug, page }: { slug: string; page: number }) {
  cacheTag('liked-posts')

  const limit = 6
  const offset = (page - 1) * limit

  const profileUser = await getUserInfo({ slug })

  const likedPostsData = await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
    })
    .from(postLikeTable)
    .where(eq(postLikeTable.userId, profileUser.id))
    .innerJoin(postTable, eq(postLikeTable.postId, postTable.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(postLikeTable.createdAt))

  const likedPosts = await Promise.all(
    likedPostsData.map(async post => {
      const postAuthor = await getUserInfo({ id: post.authorId })

      const postWithAuthor = {
        ...post,
        author: postAuthor,
      }

      if (post.image) {
        const buffer = await urlToBuffer(post.image)
        const imageDimensions = await getImageDimensions(buffer)

        return { ...postWithAuthor, imageDimensions }
      }

      return { ...postWithAuthor, imageDimensions: null }
    }),
  )

  const postsQuantity = await db
    .select({
      count: count(),
    })
    .from(postLikeTable)
    .where(eq(postLikeTable.userId, profileUser.id))
    .then(res => res[0].count)

  const totalPages = Math.ceil(postsQuantity / limit)

  return { likedPosts, totalPages }
}

export async function getLikedComments({ slug, page }: { slug: string; page: number }) {
  cacheTag('liked-comments')

  const limit = 6
  const offset = (page - 1) * limit

  const profileUser = await getUserInfo({ slug })

  const likedCommentsData = await db
    .select({
      id: commentTable.id,
      authorId: commentTable.authorId,
      postId: commentTable.postId,
      text: commentTable.text,
      createdAt: commentTable.createdAt,
    })
    .from(commentLikeTable)
    .where(eq(commentLikeTable.userId, profileUser.id))
    .innerJoin(commentTable, eq(commentLikeTable.commentId, commentTable.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(commentLikeTable.createdAt))

  const likedComments = await Promise.all(
    likedCommentsData.map(async comment => {
      const commentAuthor = await getUserInfo({ id: comment.authorId })

      return {
        ...comment,
        author: commentAuthor,
      }
    }),
  )

  const commentsQuantity = await db
    .select({
      count: count(),
    })
    .from(commentLikeTable)
    .where(eq(commentLikeTable.userId, profileUser.id))
    .then(res => res[0].count)

  const totalPages = Math.ceil(commentsQuantity / limit)

  return { likedComments, totalPages }
}

export async function getLikedCommentParent({ commentId }: { commentId: string }) {
  const parentComment = alias(commentTable, 'parentComment')

  const rawData = await db
    .select({
      parentComment: {
        authorId: parentComment.authorId,
      },
      post: {
        authorId: postTable.authorId,
      },
    })
    .from(commentTable)
    .where(eq(commentTable.id, commentId))
    .leftJoin(parentComment, eq(commentTable.parentId, parentComment.id))
    .leftJoin(postTable, eq(commentTable.postId, postTable.id))
    .then(res => res[0])

  if (!rawData) return { commentParent: null }

  const parentAuthor = rawData.parentComment?.authorId
    ? await getUserInfo({ id: rawData.parentComment.authorId })
    : null

  const postAuthor = rawData.post?.authorId
    ? await getUserInfo({ id: rawData.post.authorId })
    : null

  return {
    commentParent: {
      parentCommentUsername: parentAuthor?.username,
      postAuthorUsername: postAuthor?.username,
    },
  }
}

export async function getSearchUsers({
  query,
  filter,
  page,
}: {
  query: string
  filter: string
  page: number | undefined
}) {
  cacheTag('search-users')

  const limit = 6
  const offset = page ? (page - 1) * limit : 0

  const [usersData, totalUsers] = await Promise.all([
    db
      .select({
        id: userTable.id,
        image: userTable.image,
        name: userTable.name,
        username: userTable.username,
      })
      .from(userTable)
      .where(
        sql`lower(${userTable.name}) like ${`%${query.toLowerCase()}%`} OR lower(${userTable.username}) like ${`%${query.toLowerCase()}%`}`,
      )
      .limit(filter && filter === 'users' ? limit : 3)
      .orderBy(asc(userTable.createdAt))
      .offset(offset),
    db
      .select({
        count: count(userTable.id),
      })
      .from(userTable)
      .where(
        sql`lower(${userTable.name}) like ${`%${query.toLowerCase()}%`} OR lower(${userTable.username}) like ${`%${query.toLowerCase()}%`}`,
      )
      .then(res => res[0].count),
  ])

  const totalPages = Math.ceil(totalUsers / limit)

  return { users: usersData, totalUsers, totalPages }
}

export async function getSearchPosts({
  query,
  filter,
  page,
}: {
  query: string
  filter: string
  page: number | undefined
}) {
  cacheTag('search-posts')

  const limit = 6
  const offset = page ? (page - 1) * limit : 0

  const [postsData, totalPosts] = await Promise.all([
    db
      .select({
        id: postTable.id,
        authorId: postTable.authorId,
        createdAt: postTable.createdAt,
        text: postTable.text,
        image: postTable.image,
      })
      .from(postTable)
      .where(sql`lower(${postTable.text}) like ${`%${query.toLowerCase()}%`}`)
      .orderBy(desc(postTable.createdAt))
      .limit(filter && filter === 'posts' ? limit : 3)
      .offset(offset),
    db
      .select({
        count: count(),
      })
      .from(postTable)
      .where(sql`lower(${postTable.text}) like ${`%${query.toLowerCase()}%`}`)
      .then(res => res[0].count),
  ])

  const posts = await Promise.all(
    postsData.map(async post => {
      const postAuthor = await getUserInfo({ id: post.authorId })

      const postWithAuthor = {
        ...post,
        author: postAuthor,
      }

      let imageDimensions = null

      if (post.image) {
        const buffer = await urlToBuffer(post.image)

        imageDimensions = await getImageDimensions(buffer)
      }

      return { ...postWithAuthor, imageDimensions }
    }),
  )

  const totalPages = Math.ceil(totalPosts / limit)

  return { posts, totalPosts, totalPages }
}

export async function getFollowsPromise() {
  cacheTag('follows-promise')

  return db.select().from(followTable)
}

export async function getFollowsCount({ sessionUserId }: { sessionUserId: string | undefined }) {
  cacheTag('follows-count')

  if (!sessionUserId) {
    return { followingCount: 0, followersCount: 0 }
  }

  const [followingCount, followersCount] = await Promise.all([
    db
      .select({
        count: count(),
      })
      .from(followTable)
      .where(eq(followTable.followerId, sessionUserId))
      .then(res => res[0].count),
    db
      .select({
        count: count(),
      })
      .from(followTable)
      .where(eq(followTable.followingId, sessionUserId))
      .then(res => res[0].count),
  ])

  return { followingCount, followersCount }
}

export async function getCommentsCountOfComment({ commentId }: { commentId: string }) {
  cacheTag('comments-count-of-comment')

  return await db
    .select({
      count: count(),
    })
    .from(commentTable)
    .where(eq(commentTable.parentId, commentId))
    .then(res => res[0].count)
}

export async function getCommentsCountOfPost({ postId }: { postId: string }) {
  cacheTag('comments-count-of-post')

  return await db
    .select({
      count: count(),
    })
    .from(commentTable)
    .where(eq(commentTable.postId, postId))
    .then(res => res[0].count)
}

export async function getCommentsCountOfReply({ slug, postId }: { slug: string; postId: string }) {
  cacheTag('comments-count-of-reply')

  const user = await getUserInfo({ slug })

  return await db
    .select({
      count: count(),
    })
    .from(commentTable)
    .where(and(eq(commentTable.authorId, user.id), eq(commentTable.postId, postId)))
    .then(res => res[0].count)
}

export async function getLikesOfPost({ postId }: { postId: string }) {
  cacheTag('likes-of-post')

  return await db
    .select({
      userId: postLikeTable.userId,
    })
    .from(postLikeTable)
    .where(eq(postLikeTable.postId, postId))
}

export async function getLikesOfComment({ commentId }: { commentId: string }) {
  cacheTag('likes-of-comment')

  return await db
    .select({
      userId: commentLikeTable.userId,
    })
    .from(commentLikeTable)
    .where(eq(commentLikeTable.commentId, commentId))
}
