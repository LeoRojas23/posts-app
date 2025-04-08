import CommentView from './comment-view'

import { getCommentsPostId } from '@/db/queries'

interface Props {
  slug: string
  id: string
}

export default async function Comments({ slug, id }: Props) {
  const { comments } = await getCommentsPostId({ postId: id })

  return (
    <section>
      {comments.map(comment => {
        return (
          <article
            key={comment.id}
            className='border-r border-neutral-800 px-1.5 pt-1 last:border-b sm:pt-1.5 sm:last:rounded-br-md'
          >
            <CommentView showForm comment={comment} id={id} slug={slug} />

            {comment?.children.map(child => {
              return (
                <article
                  key={child.id}
                  className='ml-2 border-l-2 border-neutral-800/100 pl-0.5 sm:ml-4'
                >
                  <CommentView showForm comment={child} id={id} slug={slug} />

                  {child?.children.map(subchild => {
                    return (
                      <article
                        key={subchild.id}
                        className='ml-4 border-l-2 border-neutral-800/80 pl-0.5 sm:ml-6'
                      >
                        <CommentView comment={subchild} id={id} showForm={false} slug={slug} />
                      </article>
                    )
                  })}
                </article>
              )
            })}
          </article>
        )
      })}
    </section>
  )
}
