import Link from 'next/link'

import ToggleInfo from '../info/toggle-info'
import Like from '../like/like'
import Reply from '../comment/reply'

import { timeAgo } from '@/utils/utils'
import { type LikedPostProfile as ILikedPostProfile } from '@/types'

export default function LikedPost({ post, path }: { post: ILikedPostProfile; path: string }) {
  const timeAgoPost = timeAgo(post.createdAt)

  return (
    <article
      key={post.id}
      className='flex flex-col border-x border-b border-neutral-800 last-of-type:rounded-b-md sm:border-l-0 sm:last-of-type:rounded-bl-none'
    >
      <header className='flex items-center justify-between px-1.5 pt-1'>
        <Link
          className='flex w-fit flex-wrap items-center justify-start gap-1 md:gap-1.5'
          href={`/profile/${post.author.username}`}
        >
          <img
            alt={post.author.username}
            className='h-10 w-10 rounded-md object-fill transition-opacity duration-100 ease-linear hover:opacity-70'
            loading='lazy'
            src={post.author.image}
          />
          <h2 className='max-w-32 truncate text-[15px] font-bold text-neutral-200 underline-offset-[3px] hover:underline sm:max-w-64 lg:max-w-full'>
            {post.author.name}
          </h2>
          <h3 className='text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
            @{post.author.username}
          </h3>
          <span className='text-[6px] text-neutral-300'>●</span>
          <p className='text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
            {timeAgoPost}
          </p>
        </Link>
        <ToggleInfo authorId={post.authorId} dataId={post.id} from='post' path={path} />
      </header>
      <div>
        <Link
          className='flex flex-col gap-2 p-1.5 sm:p-2'
          href={`/post/${post.author.username}/${post.id}`}
        >
          {post.text ? (
            <p className='w-full whitespace-pre-line break-words text-base text-neutral-200'>
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
      <footer className='grid w-full grid-cols-2 place-items-center pb-1 sm:pb-1.5'>
        <Reply path={path} postId={post.id} />
        <Like dataId={post.id} from='post' path={path} />
      </footer>
    </article>
  )
}
