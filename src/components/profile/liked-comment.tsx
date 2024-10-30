import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'

import ToggleInfo from '../info/toggle-info'

import FooterReplyWrapper from './footer-reply-wrapper'

import { type LikedCommentProfile as ILikedCommentProfile } from '@/types'
import { db } from '@/db'
import { commentTable, postTable, userTable } from '@/db/schema'
import { timeAgo } from '@/utils/utils'

interface Props {
  comment: ILikedCommentProfile
  path: string
}

export default async function LikedComment({ comment, path }: Props) {
  const commentDate = timeAgo(comment.createdAt)

  const parentComment = alias(commentTable, 'parentComment')
  const parentAuthor = alias(userTable, 'parentAuthor')
  const postAuthor = alias(userTable, 'postAuthor')

  const commentParent = await db
    .select({
      parentComment: {
        authorUsername: parentAuthor.username,
      },
      post: {
        authorUsername: postAuthor.username,
      },
    })
    .from(commentTable)
    .where(eq(commentTable.id, comment.id))
    .leftJoin(parentComment, eq(commentTable.parentId, parentComment.id))
    .leftJoin(parentAuthor, eq(parentComment.authorId, parentAuthor.id))
    .leftJoin(postTable, eq(commentTable.postId, postTable.id))
    .leftJoin(postAuthor, eq(postAuthor.id, postTable.authorId))
    .then(res => res[0])

  return (
    <article className='flex flex-col border-x border-b border-neutral-800 last-of-type:rounded-b-md sm:border-l-0 sm:last-of-type:rounded-bl-none'>
      <section key={comment.id} className='flex items-start justify-start pr-1.5'>
        <aside className='px-1.5 pt-1'>
          <Link href={`/profile/${comment.author.username}`}>
            <img
              alt={comment.author.username}
              className='h-10 w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
              loading='lazy'
              src={comment.author.image}
            />
          </Link>
        </aside>
        <section className='flex w-full flex-1 flex-col'>
          <header className='flex w-full items-center justify-between'>
            <Link
              className='flex flex-wrap items-center gap-1.5 pt-1'
              href={`/profile/${comment.author?.username}`}
            >
              <h2 className='max-w-28 truncate text-[15px] font-bold text-neutral-200 underline-offset-[3px] hover:underline sm:max-w-64 lg:max-w-full'>
                {comment.author.name}
              </h2>
              <h3 className='text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
                @{comment.author.username}
              </h3>
              <span className='text-[6px] text-neutral-300'>●</span>
              <p className='text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
                {commentDate}
              </p>
            </Link>
            <section className='pt-1'>
              <ToggleInfo
                authorId={comment.authorId}
                dataId={comment.id}
                from='comment'
                path={path}
              />
            </section>
          </header>

          <section className='text-[15px] text-neutral-400'>
            <p>
              Replying to{' '}
              <Link
                className='text-[#56ff50] underline-offset-[3px] hover:underline'
                href={`/profile/${commentParent?.parentComment?.authorUsername ?? commentParent?.post?.authorUsername}`}
              >
                {commentParent?.parentComment?.authorUsername ??
                  commentParent?.post?.authorUsername}
              </Link>
            </p>
          </section>

          <Link
            className='h-full w-full text-neutral-200'
            href={`/post/${commentParent?.post?.authorUsername}/${comment.postId}`}
          >
            {comment.text}
          </Link>
        </section>
      </section>

      <footer>
        <Link href={`/post/${commentParent?.post?.authorUsername}/${comment.postId}`}>
          <FooterReplyWrapper commentId={comment.id} path={path} />
        </Link>
      </footer>
    </article>
  )
}
