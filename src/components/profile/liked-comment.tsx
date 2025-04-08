import Link from 'next/link'

import ToggleInfo from '../info/toggle-info'

import FooterReplyWrapper from './footer-reply-wrapper'

import { type LikedComment } from '@/types'
import { timeAgo } from '@/utils/utils'
import { getLikedCommentParent } from '@/db/queries'

interface Props {
  comment: LikedComment
  path: string
}

export default async function LikedComment({ comment, path }: Props) {
  const commentDate = timeAgo(comment.createdAt)

  const { commentParent } = await getLikedCommentParent({ commentId: comment.id })

  return (
    <article className='flex flex-col border-x border-b border-neutral-800 last-of-type:rounded-b-md sm:border-l-0 sm:last-of-type:rounded-bl-none'>
      <section key={comment.id} className='flex items-start justify-start pr-1.5'>
        <aside className='px-1.5 pt-1'>
          <Link href={`/profile/${comment.author.username}`}>
            <img
              alt={comment.author.username ?? 'Profile image'}
              className='h-10 min-h-10 w-10 min-w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
              loading='lazy'
              src={comment.author.image ?? ''}
            />
          </Link>
        </aside>
        <section className='flex w-full flex-1 flex-col'>
          <header className='flex w-full items-center justify-between'>
            <Link
              className='flex flex-wrap items-center gap-1.5 pt-1'
              href={`/profile/${comment.author?.username}`}
            >
              <h2 className='truncate text-[15px] font-bold leading-[21px] text-neutral-200 underline-offset-[3px] hover:underline'>
                {comment.author.name}
              </h2>
              <h3 className='truncate text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
                @{comment.author.username}
              </h3>
              <span className='text-[6px] leading-[11px] text-neutral-300'>●</span>
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

          <section className='text-[15px] leading-[21px] text-neutral-400'>
            <p>
              Replying to{' '}
              <Link
                className='text-[#00b4f1] underline-offset-[3px] hover:underline'
                href={`/profile/${commentParent?.parentCommentUsername ?? commentParent?.postAuthorUsername}`}
              >
                {commentParent?.parentCommentUsername ?? commentParent?.postAuthorUsername}
              </Link>
            </p>
          </section>

          <Link
            className='h-full w-full text-neutral-200'
            href={`/post/${commentParent?.postAuthorUsername}/${comment.postId}`}
          >
            <p className='w-full whitespace-break-spaces break-all text-neutral-200'>
              {comment.text}
            </p>
          </Link>
        </section>
      </section>

      <footer>
        <Link href={`/post/${commentParent?.postAuthorUsername}/${comment.postId}`}>
          <FooterReplyWrapper commentId={comment.id} />
        </Link>
      </footer>
    </article>
  )
}
