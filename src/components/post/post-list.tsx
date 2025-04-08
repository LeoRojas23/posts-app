import Link from 'next/link'

import ToggleInfo from '../info/toggle-info'
import Like from '../like/like'
import Reply from '../comment/reply'

import { cn } from '@/utils/cn'
import { type Post } from '@/types'
import { timeAgo } from '@/utils/utils'

interface Props {
  posts: Post[]
  path: string
  className: string
}

export default async function PostList({ posts, path, className }: Props) {
  return (
    <>
      {posts?.map(post => {
        const timeAgoPost = timeAgo(post.createdAt)

        return (
          <article key={post.id} className={cn(className)}>
            <header className='flex items-center justify-between px-1.5 pt-1'>
              <Link
                className='flex w-fit items-center justify-start gap-1'
                href={`/profile/${post.author.username}`}
              >
                <img
                  alt={post.author.username ?? 'Profile image'}
                  className='h-10 w-10 rounded-md object-contain transition-opacity duration-100 ease-linear hover:opacity-70'
                  loading='lazy'
                  src={post.author.image ?? ''}
                />
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
                className='flex flex-col gap-2 p-1.5 sm:p-2'
                href={`/post/${post.author.username}/${post.id}`}
              >
                {post.text ? (
                  <p className='w-full whitespace-break-spaces break-all text-neutral-200'>
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
            <footer className='grid w-full grid-cols-2 items-start pb-1 sm:pb-1.5'>
              <Reply postId={post.id} />
              <Like dataId={post.id} from='post' />
            </footer>
          </article>
        )
      })}
    </>
  )
}
