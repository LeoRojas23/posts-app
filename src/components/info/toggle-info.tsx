import { headers } from 'next/headers'

import Icon from '../icon'
import DeleteButton from '../button/delete-button'
import ToggleFollowUser from '../follow/toggle-follow-user'

import { auth } from '@/auth'

interface Props {
  authorId: string
  dataId: string
  path: string
  from: 'post' | 'comment'
}

export default async function ToggleInfo({ authorId, dataId, path, from }: Props) {
  const user = await auth.api.getSession({ headers: await headers() })

  return (
    <aside className='relative h-full w-fit'>
      <details className='[&>summary>svg]:open:bg-[#3d3d3d90]' name='toggleInfo'>
        <summary className='list-none'>
          <Icon
            className='h-6 w-6 cursor-pointer rounded-md text-neutral-200 transition-colors duration-100 ease-linear hover:bg-[#3d3d3d90]'
            id='toggleMoreInfo'
          />
        </summary>
        <section className='absolute -right-0.5 top-[26px] z-[5] flex w-48 flex-col items-start justify-center gap-1.5 rounded-md border border-neutral-800 bg-[#0a0a0a] text-neutral-200'>
          {user?.session.userId === authorId ? (
            <DeleteButton dataId={dataId} from={from} path={path} />
          ) : (
            <ToggleFollowUser
              showIcon
              sessionUserId={user?.session.userId}
              userToFollow={authorId}
            />
          )}
        </section>
      </details>
    </aside>
  )
}
