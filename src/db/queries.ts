'server only'

import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  sql,
} from 'drizzle-orm'
import { notFound } from 'next/navigation'

import { db } from '@/db'
import { commentLikeTable, commentTable, postLikeTable, postTable, userTable } from '@/db/schema'
import {
  CommentReply,
  InfoPostId,
  LikedCommentProfile,
  LikedPostProfile,
  MediaPostProfile,
  RepliesProfile,
  type Post,
} from '@/types'
import { getImageDimensions } from '@/utils/get-image-dimensions'
import { urlToBuffer } from '@/utils/utils'

type FetchLikedContentOfUserResult = {
  likedContent: Array<LikedPostProfile | LikedCommentProfile>
  totalPages: number
}

export async function fetchRootPosts(page: number) {
  const limit = 6
  const offset = (page - 1) * limit

  const postsData = (await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
      author: {
        name: userTable.name,
        username: userTable.username,
        image: userTable.image,
      },
    })
    .from(postTable)
    .orderBy(desc(postTable.createdAt))
    .offset(offset)
    .limit(limit)
    .leftJoin(userTable, eq(postTable.authorId, userTable.id))) as Post[]

  const posts = await Promise.all(
    postsData.map(async post => {
      if (post.image) {
        const buffer = await urlToBuffer(post.image)
        const imageDimensions = await getImageDimensions(buffer)

        return { ...post, imageDimensions }
      }

      return { ...post, imageDimensions: null }
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

export async function fetchPostId(postId: string, slug: string) {
  const post = (await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
      author: {
        name: userTable.name,
        username: userTable.username,
        image: userTable.image,
      },
    })
    .from(postTable)
    .where(eq(postTable.id, postId))
    .leftJoin(userTable, eq(postTable.authorId, userTable.id))
    .then(res => res[0])) as InfoPostId

  if (!post || post.author.username !== slug) return notFound()

  if (post.image) {
    const buffer = await urlToBuffer(post.image)

    post.imageDimensions = await getImageDimensions(buffer)
  } else {
    post.imageDimensions = null
  }

  return { post }
}

export async function fetchCommentsPostId(postId: string) {
  const comments = await db.query.commentTable.findMany({
    where: and(eq(commentTable.postId, postId), isNull(commentTable.parentId)),
    orderBy: desc(commentTable.createdAt),
    columns: {
      id: true,
      authorId: true,
      text: true,
      createdAt: true,
    },
    with: {
      author: {
        columns: {
          name: true,
          username: true,
          image: true,
        },
      },
      children: {
        orderBy: desc(commentTable.createdAt),
        columns: {
          id: true,
          authorId: true,
          text: true,
          createdAt: true,
        },
        with: {
          author: {
            columns: {
              name: true,
              username: true,
              image: true,
            },
          },
          children: {
            orderBy: desc(commentTable.createdAt),
            columns: {
              id: true,
              authorId: true,
              text: true,
              createdAt: true,
            },
            with: {
              author: {
                columns: {
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return { comments }
}

export async function fetchUserInfo(slug: string) {
  const user = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      username: userTable.username,
      image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.username, slug))
    .then(res => res[0])

  if (!user) return notFound()

  return user
}

export async function fetchPostsOfUser(slug: string, page: number) {
  const limit = 6
  const offset = (page - 1) * limit

  const userId = await db
    .select({
      id: userTable.id,
    })
    .from(userTable)
    .where(eq(userTable.username, slug))
    .then(res => res[0].id)

  const postsData = (await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
      author: {
        name: userTable.name,
        username: userTable.username,
        image: userTable.image,
      },
    })
    .from(postTable)
    .where(eq(postTable.authorId, userId))
    .orderBy(desc(postTable.createdAt))
    .offset(offset)
    .limit(limit)
    .leftJoin(userTable, eq(postTable.authorId, userTable.id))) as Post[]

  const posts = await Promise.all(
    postsData.map(async post => {
      if (post.image) {
        const buffer = await urlToBuffer(post.image)
        const imageDimensions = await getImageDimensions(buffer)

        return { ...post, imageDimensions }
      }

      return { ...post, imageDimensions: null }
    }),
  )

  const postsQuantity = await db
    .select({
      count: count(),
    })
    .from(postTable)
    .where(eq(postTable.authorId, userId))
    .then(res => res[0].count)

  const totalPages = Math.ceil(postsQuantity / limit)

  return { posts, totalPages }
}

export async function fetchRepliesOfUser(slug: string, page: number) {
  const limit = 3
  const offset = (page - 1) * limit

  const userId = await db
    .select({
      id: userTable.id,
    })
    .from(userTable)
    .where(eq(userTable.username, slug))
    .then(res => res[0].id)

  const postIds = await db
    .selectDistinct({
      postId: commentTable.postId,
    })
    .from(commentTable)
    .where(eq(commentTable.authorId, userId))
    .orderBy(desc(commentTable.createdAt))
    .limit(limit)
    .offset(offset)

  const uniquePostIds = postIds.map(comment => comment.postId)

  const repliesData = (await db.query.postTable.findMany({
    where: inArray(postTable.id, uniquePostIds),
    columns: {
      id: true,
      text: true,
      image: true,
      authorId: true,
      createdAt: true,
    },
    with: {
      author: {
        columns: {
          name: true,
          username: true,
          image: true,
        },
      },
      comments: {
        where: eq(commentTable.authorId, userId),
        orderBy: desc(commentTable.createdAt),
        limit,
        columns: {
          id: true,
          authorId: true,
          text: true,
          createdAt: true,
        },
        with: {
          author: {
            columns: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  })) as RepliesProfile[]

  const replies = await Promise.all(
    repliesData.map(async reply => {
      if (reply.image) {
        const buffer = await urlToBuffer(reply.image)
        const imageDimensions = await getImageDimensions(buffer)

        return { ...reply, imageDimensions }
      }

      return { ...reply, imageDimensions: null }
    }),
  )

  replies.forEach(post => {
    const lastComment = post.comments.reduce((latest: CommentReply | null, comment) => {
      return !latest || latest.createdAt < comment.createdAt ? comment : latest
    }, null)

    post.lastCommentCreatedAt = lastComment
      ? new Date(lastComment.createdAt)
      : new Date(post.createdAt)
  })

  replies.sort((a, b) => b.lastCommentCreatedAt.getTime() - a.lastCommentCreatedAt.getTime())

  const allPostsCount = await db
    .select({
      count: countDistinct(postTable.id),
    })
    .from(postTable)
    .leftJoin(commentTable, eq(postTable.id, commentTable.postId))
    .where(eq(commentTable.authorId, userId))
    .then(res => res[0].count)

  const totalPages = Math.ceil(allPostsCount / limit)

  return { replies, totalPages }
}

export async function fetchMediaPostsOfUser(slug: string, page: number) {
  const limit = 6
  const offset = (page - 1) * limit

  const userId = await db
    .select({
      id: userTable.id,
    })
    .from(userTable)
    .where(eq(userTable.username, slug))
    .then(res => res[0].id)

  const mediaPostsData = (await db
    .select({
      id: postTable.id,
      authorId: postTable.authorId,
      createdAt: postTable.createdAt,
      text: postTable.text,
      image: postTable.image,
      author: {
        name: userTable.name,
        username: userTable.username,
        image: userTable.image,
      },
    })
    .from(postTable)
    .where(and(eq(postTable.authorId, userId), isNotNull(postTable.image)))
    .orderBy(desc(postTable.createdAt))
    .limit(limit)
    .offset(offset)
    .leftJoin(userTable, eq(postTable.authorId, userTable.id))) as MediaPostProfile[]

  const mediaPosts = await Promise.all(
    mediaPostsData.map(async post => {
      const buffer = await urlToBuffer(post.image)
      const imageDimensions = await getImageDimensions(buffer)

      return { ...post, imageDimensions }
    }),
  )

  const mediaPostsQuantity = await db
    .select({
      count: count(),
    })
    .from(postTable)
    .where(and(eq(postTable.authorId, userId), isNotNull(postTable.image)))
    .then(res => res[0].count)

  const totalPages = Math.ceil(mediaPostsQuantity / limit)

  return { mediaPosts, totalPages }
}

export async function fetchLikedContentOfUser(
  slug: string,
  page: number,
): Promise<FetchLikedContentOfUserResult> {
  const limit = 6
  const offset = (page - 1) * limit

  const userId = await db
    .select({
      id: userTable.id,
    })
    .from(userTable)
    .where(eq(userTable.username, slug))
    .then(res => res[0].id)

  const likedPosts = await db
    .select({
      createdAt: postLikeTable.createdAt,
      post: {
        id: postTable.id,
      },
    })
    .from(postLikeTable)
    .where(eq(postLikeTable.userId, userId))
    .leftJoin(postTable, eq(postLikeTable.postId, postTable.id))

  const likedComments = await db
    .select({
      createdAt: commentLikeTable.createdAt,
      comment: {
        id: commentTable.id,
      },
    })
    .from(commentLikeTable)
    .where(eq(commentLikeTable.userId, userId))
    .leftJoin(commentTable, eq(commentLikeTable.commentId, commentTable.id))

  const combinedLikedContent = [
    ...likedPosts.map(item => ({ ...item.post, type: 'post' as const, createdAt: item.createdAt })),
    ...likedComments.map(item => ({
      ...item.comment,
      type: 'comment' as const,
      createdAt: item.createdAt,
    })),
  ]

  combinedLikedContent.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const relevantContentPerPage = combinedLikedContent.slice(offset, offset + limit)

  const likedContent = await Promise.all(
    relevantContentPerPage.map(async item => {
      if (item.type === 'post') {
        const post = (await db
          .select({
            id: postTable.id,
            authorId: postTable.authorId,
            createdAt: postTable.createdAt,
            text: postTable.text,
            image: postTable.image,
            author: {
              name: userTable.name,
              username: userTable.username,
              image: userTable.image,
            },
          })
          .from(postTable)
          .where(eq(postTable.id, item.id!))
          .leftJoin(userTable, eq(postTable.authorId, userTable.id))
          .then(res => res[0])) as LikedPostProfile

        if (post?.image) {
          const buffer = await urlToBuffer(post.image)

          post.imageDimensions = await getImageDimensions(buffer)
        } else {
          post.imageDimensions = null
        }

        return { ...post, type: 'post' as const }
      } else {
        const comment = (await db
          .select({
            id: commentTable.id,
            authorId: commentTable.authorId,
            postId: commentTable.postId,
            text: commentTable.text,
            createdAt: commentTable.createdAt,
            author: {
              name: userTable.name,
              username: userTable.username,
              image: userTable.image,
            },
          })
          .from(commentTable)
          .where(eq(commentTable.id, item.id!))
          .leftJoin(userTable, eq(commentTable.authorId, userTable.id))
          .then(res => res[0])) as LikedCommentProfile

        return { ...comment, type: 'comment' as const }
      }
    }),
  )

  const totalLikedContentCount = likedPosts.length + likedComments.length

  const totalPages = Math.ceil(totalLikedContentCount / limit)

  return { likedContent, totalPages }
}

export async function fetchSearchUsers(query: string, filter: string, page: number | undefined) {
  const limit = 6
  const offset = page ? (page - 1) * limit : 0

  const [users, totalUsers] = await Promise.all([
    db
      .select()
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

  return { users, totalUsers, totalPages }
}

type SearchPostsResult = {
  posts: Post[]
  totalPosts: number
  totalPages: number
}

export async function fetchSearchPosts(
  query: string,
  filter: string,
  page: number | undefined,
): Promise<SearchPostsResult> {
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
        author: {
          name: userTable.name,
          username: userTable.username,
          image: userTable.image,
        },
      })
      .from(postTable)
      .where(sql`lower(${postTable.text}) like ${`%${query.toLowerCase()}%`}`)
      .leftJoin(userTable, eq(userTable.id, postTable.authorId))
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

  const posts: Post[] = await Promise.all(
    postsData.map(async post => {
      let imageDimensions = null

      if (post.image) {
        const buffer = await urlToBuffer(post.image)

        imageDimensions = await getImageDimensions(buffer)
      }

      return { ...post, imageDimensions, author: post.author! }
    }),
  )

  const totalPages = Math.ceil(totalPosts / limit)

  return { posts, totalPosts, totalPages }
}
