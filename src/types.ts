export interface FileWithPreview extends File {
  preview: string
}

interface ImageDimensions {
  width: number | undefined
  height: number | undefined
}

export interface Post {
  id: string
  authorId: string
  createdAt: string
  text: string | null
  image: string | null
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  imageDimensions: ImageDimensions | null
}

export interface Comment {
  id: string
  authorId: string
  text: string
  createdAt: string
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  children: Comment[]
}

export interface RepliesProfile extends Post {
  comments: Omit<Comment, 'children'>[]
  lastReplyCreatedAt: Date
}

export interface LikedComment extends Omit<Comment, 'children'> {
  postId: string
}

export interface UserInfoLayout {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

export type CreatePostResponse = {
  success: boolean
  message: string
  payload?: string
}

export type CreateCommentResponse = {
  success: boolean
  message: string
  payload?: string
}

export type ToggleLikeResponse = {
  success: boolean
  message: string
}

export type UpdateSettingsResponse = {
  success: boolean
  message: string
  payload?: {
    name: string | undefined
    username: string | undefined
  }
}
