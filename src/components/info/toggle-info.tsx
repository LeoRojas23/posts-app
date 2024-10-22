import Icon from '../icon'
import DeleteButton from '../button/delete-button'
import ToggleFollowUser from '../follow/toggle-follow-user'

import { validateRequest } from '@/lib/lucia'

interface Props {
  authorId: string
  dataId: string
  path: string
  from: 'post' | 'comment'
}

export default async function ToggleInfo({ authorId, dataId, path, from }: Props) {
  const { user } = await validateRequest()

  return (
    <aside className='relative h-full w-fit'>
      <details className='[&>summary>svg]:open:bg-neutral-700' name='toggleInfo'>
        <summary className='list-none'>
          <Icon
            className='h-6 w-6 cursor-pointer rounded-md text-neutral-200 transition-colors duration-100 ease-linear hover:bg-neutral-700'
            id='toggleMoreInfo'
          />
        </summary>
        <section className='absolute -right-0.5 top-[26px] z-[5] flex w-48 flex-col items-start justify-center gap-1.5 rounded-md border border-neutral-800 bg-[#0a0a0a] text-neutral-200'>
          {user?.id === authorId ? (
            <DeleteButton dataId={dataId} from={from} path={path} />
          ) : (
            <ToggleFollowUser showIcon path={path} session={user} userToFollow={authorId} />
          )}
        </section>
      </details>
    </aside>
  )
}
