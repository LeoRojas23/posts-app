export interface FileWithPreview extends File {
  preview: string
}

export interface SessionAuth {
  id: string
  userId: string
  fresh: boolean
  expiresAt: Date
}

export interface UserAuth {
  id: string
  username: string
  name: string
  image: string
  createdAt: Date
}

interface ImageDimensions {
  width: number | undefined
  height: number | undefined
}

export interface Followers {
  followerId: string
  followingId: string
}

export interface Following {
  followerId: string
  followingId: string
}

export interface PostLike {
  userId: string
  postId: string
  createdAt: Date
}

export interface CommentLike {
  userId: string
  createdAt: Date
  commentId: string
}

export interface CountCommentChildren {
  children: number
}

export interface Post {
  id: string
  authorId: string
  createdAt: string
  text: string | null
  image: string | null
  author: {
    name: string
    username: string
    image: string
  }
  imageDimensions: ImageDimensions | null
}

export interface UserSearchResult {
  id: string
  email: string | null
  name: string
  username: string
  image: string
  createdAt: string
}

export interface CommentReply {
  id: string
  authorId: string
  text: string
  createdAt: string
  author: {
    username: string
    name: string
    image: string
  }
}

export interface RepliesProfile {
  id: string
  text: string | null
  image: string | null
  authorId: string
  createdAt: string
  author: {
    username: string
    name: string
    image: string
  }
  comments: CommentReply[]
  imageDimensions: ImageDimensions | null
  lastCommentCreatedAt: Date
}

export interface MediaPostProfile {
  id: string
  text: string | null
  image: string
  createdAt: string
  authorId: string
  author: {
    name: string
    username: string
    image: string
  }
  imageDimensions: ImageDimensions | null
}

export interface LikedPostProfile extends Post {
  type: 'post'
}

export interface LikedCommentProfile {
  id: string
  authorId: string
  postId: string
  text: string
  createdAt: string
  author: {
    name: string
    username: string
    image: string
  }
  type: 'comment'
}

export interface InfoPostId {
  id: string
  authorId: string
  createdAt: string
  text: string | null
  image: string | null
  author: {
    name: string
    username: string
    image: string
  }
  imageDimensions: ImageDimensions | null
}

export interface CommentOfPostId {
  id: string
  authorId: string
  text: string
  createdAt: string
  author: {
    name: string
    username: string
    image: string
  }
  children: CommentOfPostId[]
}

export interface UserInfoLayout {
  id: string
  name: string
  username: string
  image: string
}
