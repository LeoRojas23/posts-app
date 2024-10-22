import Link from 'next/link'

import ToggleInfo from '../info/toggle-info'

import FooterReplyWrapper from './footer-reply-wrapper'

import { type CommentReply } from '@/types'
import { timeAgoComment } from '@/utils/utils'

interface Props {
  comments: CommentReply[]
  path: string
  postId: string
  authorUsername: string | null
}

export default function RepliesList({ comments, path, authorUsername, postId }: Props) {
  return (
    <>
      {comments.map(comment => {
        const commentDate = timeAgoComment(comment.createdAt)

        return (
          <section key={comment.id} className='flex [&>a>div]:last:hidden'>
            <Link
              className='flex flex-col items-center justify-start px-1.5'
              href={`/profile/${comment.author.username}`}
            >
              <img
                alt={comment.author.username}
                className='h-10 w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
                src={comment.author.image}
              />
              <div className='mx-auto h-full w-[2px] flex-1 bg-neutral-800' />
            </Link>

            <section className='flex w-full flex-1 flex-col'>
              <header className='flex w-full items-center justify-between pr-1 sm:pr-1.5'>
                <Link
                  className='flex flex-wrap items-center gap-1.5'
                  href={`/profile/${comment.author.username}`}
                >
                  <h2 className='max-w-32 truncate text-[15px] font-bold text-neutral-200 underline-offset-[3px] hover:underline sm:max-w-64 lg:max-w-full'>
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
                    <p className='text-neutral-200'>{comment.text}</p>
                    <FooterReplyWrapper commentId={comment.id} path={path} />
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
