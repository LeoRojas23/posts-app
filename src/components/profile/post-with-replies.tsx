import Link from 'next/link'

import ToggleInfo from '../info/toggle-info'
import Like from '../like/like'
import Reply from '../comment/reply'

import { type Post } from '@/types'
import { timeAgo } from '@/utils/utils'

interface Props {
  post: Post
  path: string
}

export default async function PostWithReplies({ post, path }: Props) {
  const timeAgoPost = timeAgo(post.createdAt)

  return (
    <section className='flex'>
      <Link
        className='flex flex-col items-center justify-start px-1.5 pt-1'
        href={`/profile/${post.author.username}`}
      >
        <img
          alt={post.author.username ?? 'Profile image'}
          className='h-10 min-h-10 w-10 min-w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
          src={post.author.image ?? ''}
        />
        <div className='mx-auto h-full w-[2px] flex-1 bg-neutral-800' />
      </Link>

      <section className='flex w-full flex-1 flex-col'>
        <header className='flex w-full items-start justify-between pr-1.5'>
          <Link
            className='flex flex-wrap items-center justify-start gap-1.5 pt-1'
            href={`/profile/${post.author.username}`}
          >
            <h2 className='truncate text-[15px] font-bold leading-[21px] text-neutral-200 underline-offset-[3px] hover:underline'>
              {post.author.name}
            </h2>
            <h3 className='truncate text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
              @{post.author.username}
            </h3>
            <span className='text-[6px] leading-[10px] text-neutral-300'>●</span>
            <span className='text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
              {timeAgoPost}
            </span>
          </Link>
          <ToggleInfo authorId={post.authorId} dataId={post.id} from='post' path={path} />
        </header>
        <div>
          <Link
            className='flex flex-col gap-2 pr-1.5 sm:pr-2'
            href={`/post/${post.author.username}/${post.id}`}
          >
            {post.text ? (
              <p className='w-full whitespace-break-spaces break-all text-base text-neutral-200'>
                {post.text}
              </p>
            ) : null}
            {post.image ? (
              <img
                alt={`${post.text ?? 'Without description'} - by ${post.author.username}`}
                className='mx-auto rounded-md border border-neutral-600'
                height={post.imageDimensions?.height}
                src={post.image}
                width={post.imageDimensions?.width}
              />
            ) : null}
          </Link>
        </div>

        <footer className='flex w-full items-start pb-1 sm:pb-1.5'>
          <Reply postId={post.id} />
          <Like dataId={post.id} from='post' />
        </footer>
      </section>
    </section>
  )
}
