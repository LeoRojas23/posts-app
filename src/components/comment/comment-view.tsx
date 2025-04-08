import Link from 'next/link'

import Icon from '../icon'
import ToggleInfo from '../info/toggle-info'
import Like from '../like/like'

import Reply from './reply'

import { timeAgo } from '@/utils/utils'
import { type Comment } from '@/types'

interface CommentProps {
  comment: Comment
  slug: string
  id: string
  showForm: boolean
}

export default async function CommentView({ comment, slug, id, showForm }: CommentProps) {
  const commentDate = timeAgo(comment.createdAt)

  return (
    <>
      <div className='flex w-full items-start justify-start gap-1.5'>
        <aside className='w-fit'>
          <Link className='w-full' href={`/profile/${comment.author.username}`}>
            <img
              alt={comment.author.username ?? 'Profile image'}
              className='h-10 min-h-10 w-10 min-w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
              loading='lazy'
              src={comment.author.image ?? ''}
            />
          </Link>
        </aside>

        <div className='flex w-full flex-1 flex-col'>
          <header className='flex w-full items-center justify-between'>
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
              path={`/post/${slug}/${id}`}
            />
          </header>
          <p className='w-full whitespace-break-spaces break-all text-neutral-200'>
            {comment.text}
          </p>
        </div>
      </div>
      <footer className='flex w-full items-start py-1 sm:py-1.5'>
        {showForm ? (
          <Reply commentId={comment.id} postId={id} />
        ) : (
          <div className='flex w-full cursor-not-allowed items-center justify-center gap-1.5 py-1.5'>
            <Icon className='h-6 w-6 text-neutral-200' id='commentIcon' />
            <span className='text-sm font-light tabular-nums text-neutral-200 sm:text-base'>0</span>
          </div>
        )}
        <Like dataId={comment.id} from='comment' />
      </footer>
    </>
  )
}
