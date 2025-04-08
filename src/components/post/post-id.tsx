import Link from 'next/link'

import Icon from '../icon'
import CreateReplyPostId from '../comment/create-reply-post-id'
import Image from '../image'
import ToggleInfo from '../info/toggle-info'
import Like from '../like/like'

import { formatDatePostId } from '@/utils/utils'
import { cn } from '@/utils/cn'
import { getPostId, getCommentsCountOfPost } from '@/db/queries'

interface Props {
  slug: string
  id: string
}

export default async function PostId({ slug, id }: Props) {
  const [{ post }, commentsCount] = await Promise.all([
    getPostId({ postId: id, slug }),
    getCommentsCountOfPost({ postId: id }),
  ])

  const time = formatDatePostId(post.createdAt)

  return (
    <article
      className={cn('w-full border-r border-neutral-800', {
        'lg:rounded-b-md': !commentsCount,
      })}
    >
      <header className='flex items-center justify-between px-1.5 pt-1'>
        <div className='flex w-fit items-center justify-start gap-1'>
          <Link href={`/profile/${post.author.username}`}>
            <img
              alt={post.author.username!}
              className='h-10 min-h-10 w-10 min-w-10 rounded-md object-cover transition-opacity duration-100 ease-linear hover:opacity-70'
              loading='lazy'
              src={post.author.image!}
            />
          </Link>
          <div className='flex flex-col'>
            <Link className='w-fit' href={`/profile/${post.author.username}`}>
              <h2 className='truncate text-[15px] font-bold leading-[21px] text-neutral-200 underline-offset-[3px] hover:underline'>
                {post.author.name}
              </h2>
            </Link>
            <Link className='w-fit' href={`/profile/${post.author.username}`}>
              <h3 className='truncate text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
                @{post.author.username}
              </h3>
            </Link>
          </div>
        </div>
        <ToggleInfo
          authorId={post.authorId}
          dataId={post.id}
          from='post'
          path={`/post/${slug}/${id}`}
        />
      </header>
      <div className='flex flex-col gap-2 p-1.5 sm:p-2'>
        {post.text ? (
          <p className='w-full whitespace-break-spaces break-all text-neutral-200'>{post.text}</p>
        ) : null}
        {post.image ? (
          <Image
            alt={`${post.text ?? 'Without description'} - Image of ${post.author.username}`}
            className='mx-auto rounded-md border border-neutral-600'
            height={post.imageDimensions?.height}
            srcImage={post.image}
            width={post.imageDimensions?.width}
          />
        ) : null}
      </div>
      <section className='px-1.5 pt-1 sm:pt-1'>
        <span className='text-neutral-400'>{time}</span>
      </section>
      <footer className='flex w-full border-t border-t-neutral-800 px-1.5 py-1 text-neutral-200 sm:py-1.5'>
        <div className='flex w-full items-center justify-center'>
          <label
            className='group/reply-svg-post-id flex w-fit cursor-pointer items-center justify-center gap-1.5 py-1.5'
            htmlFor='focusTextarea'
          >
            <Icon
              className='h-6 w-6 transition-colors duration-100 ease-linear group-hover/reply-svg-post-id:text-[#00b4f1]'
              id='commentIcon'
            />
            <span className='text-sm font-light tabular-nums text-neutral-200 sm:text-base'>
              {commentsCount}
            </span>
          </label>
        </div>
        <Like dataId={post.id} from='post' />
      </footer>
      <CreateReplyPostId postId={post.id} roundedBottom={commentsCount} />
    </article>
  )
}
