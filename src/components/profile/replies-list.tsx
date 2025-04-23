import Link from 'next/link'

import ToggleInfo from '../info/toggle-info'

import FooterReplyWrapper from './footer-reply-wrapper'

import { type Comment } from '@/types'
import { timeAgo } from '@/utils/utils'

interface Props {
  comments: Omit<Comment, 'children'>[]
  path: string
  postId: string
  authorUsername: string | null
}

export default function RepliesList({ comments, path, authorUsername, postId }: Props) {
  return (
    <>
      {comments.map(comment => {
        const commentDate = timeAgo(comment.createdAt)

        return (
          <section key={comment.id} className='flex last:[&>a>div]:hidden'>
            <Link
              className='flex flex-col items-center justify-start px-1.5'
              href={`/profile/${comment.author.username}`}
            >
              <img
                alt={comment.author.username!}
                className='h-10 min-h-10 w-10 min-w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
                src={comment.author.image!}
              />
              <div className='mx-auto h-full w-[2px] flex-1 bg-neutral-800' />
            </Link>

            <section className='flex w-full flex-1 flex-col'>
              <header className='flex w-full items-center justify-between pr-1 sm:pr-1.5'>
                <Link
                  className='flex flex-wrap items-center gap-1.5'
                  href={`/profile/${comment.author.username}`}
                >
                  <h2 className='truncate text-[15px] leading-[21px] font-bold text-neutral-200 underline-offset-[3px] hover:underline'>
                    {comment.author.name}
                  </h2>
                  <h3 className='truncate text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
                    @{comment.author.username}
                  </h3>
                  <span className='text-[6px] leading-[11px] text-neutral-300'>●</span>
                  <p className='truncate text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
                    {commentDate}
                  </p>
                </Link>
                <ToggleInfo
                  authorId={comment.authorId}
                  dataId={comment.id}
                  from='comment'
                  path={path}
                />
              </header>

              <footer>
                <Link
                  className='h-full w-full text-neutral-200'
                  href={`/post/${authorUsername}/${postId}`}
                >
                  <div>
                    <p className='w-full break-all whitespace-break-spaces text-neutral-200'>
                      {comment.text}
                    </p>
                    <FooterReplyWrapper commentId={comment.id} />
                  </div>
                </Link>
              </footer>
            </section>
          </section>
        )
      })}
    </>
  )
}
