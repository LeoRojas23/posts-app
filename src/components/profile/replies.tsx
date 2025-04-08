import Link from 'next/link'

import PostWithReplies from './post-with-replies'
import RepliesList from './replies-list'

import { type RepliesProfile as RepliesProfileType } from '@/types'
import { getCommentsCountOfReply } from '@/db/queries'

interface Props {
  path: string
  replies: RepliesProfileType[]
  slug: string
}

export default async function Replies({ path, replies, slug }: Props) {
  return (
    <>
      {replies?.map(reply => (
        <article
          key={reply.id}
          className='flex w-full flex-col border-x border-b border-neutral-800 last-of-type:rounded-b-md sm:border-l-0 sm:last-of-type:rounded-bl-none'
        >
          <PostWithReplies path={path} post={reply} />

          <ReplyInfo postAuthor={reply.author.username} postId={reply.id} slug={slug} />

          <RepliesList
            authorUsername={reply.author.username}
            comments={reply.comments}
            path={path}
            postId={reply.id}
          />
        </article>
      ))}
    </>
  )
}

async function ReplyInfo({
  postId,
  slug,
  postAuthor,
}: {
  postId: string
  slug: string
  postAuthor: string | null
}) {
  const commentsCount = await getCommentsCountOfReply({ slug, postId })

  return (
    <>
      {commentsCount > 3 && (
        <Link
          className='ml-[25px] cursor-pointer border-l-2 border-l-neutral-800 py-1 transition-colors duration-100 ease-linear hover:bg-neutral-800'
          href={`/post/${postAuthor}/${postId}`}
        >
          <span className='pl-2 text-[#00b4f1]'>More replies of {slug}</span>
        </Link>
      )}
    </>
  )
}
