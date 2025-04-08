'use client'

import {
  createContext,
  Suspense,
  use,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
} from 'react'

type Follow = {
  followerId: string
  followingId: string
}

type FollowAction =
  | { type: 'ADD_FOLLOW'; payload: { followerId: string; followingId: string } }
  | { type: 'REMOVE_FOLLOW'; payload: { followerId: string; followingId: string } }

type FollowContextType = {
  follow: Follow[]
  addFollow: (followerId: string, followingId: string) => void
  removeFollow: (followerId: string, followingId: string) => void
}

const FollowContext = createContext<FollowContextType | undefined>(undefined)

function followReducer(current: Follow[], action: FollowAction) {
  switch (action.type) {
    case 'ADD_FOLLOW': {
      const { followerId, followingId } = action.payload

      return [...current, { followerId: followerId, followingId: followingId }]
    }

    case 'REMOVE_FOLLOW': {
      const { followerId, followingId } = action.payload

      return current.filter(
        data => !(data.followerId === followerId && data.followingId === followingId),
      )
    }

    default:
      return current
  }
}

export function FollowProvider({
  children,
  followPromise,
}: {
  children: React.ReactNode
  followPromise: Promise<Follow[]>
}) {
  const initialFollow = use(followPromise)
  const [optimisticFollow, updateOptimisticFollow] = useOptimistic(initialFollow, followReducer)

  const addFollow = useCallback(
    (followerId: string, followingId: string) => {
      updateOptimisticFollow({ type: 'ADD_FOLLOW', payload: { followerId, followingId } })
    },
    [updateOptimisticFollow],
  )

  const removeFollow = useCallback(
    (followerId: string, followingId: string) => {
      updateOptimisticFollow({ type: 'REMOVE_FOLLOW', payload: { followerId, followingId } })
    },
    [updateOptimisticFollow],
  )

  const value = useMemo(
    () => ({
      follow: optimisticFollow,
      addFollow,
      removeFollow,
    }),
    [optimisticFollow, addFollow, removeFollow],
  )

  return (
    <FollowContext.Provider value={value}>
      <Suspense>{children}</Suspense>
    </FollowContext.Provider>
  )
}

export function useFollow() {
  const context = useContext(FollowContext)

  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider')
  }

  return context
}
