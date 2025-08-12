export interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  content: string
  published: boolean
  authorId: string
  author?: User
  comments?: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  postId: string
  post?: Post
  authorId: string
  author?: User
  createdAt: Date
  updatedAt: Date
}