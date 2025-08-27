export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  content: string;
  images?: string[];
  authorId: string;
  author: User;
  likes: Like[];
  comments: Comment[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  post?: Post;
  authorId: string;
  author: User;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  id: string;
  postId?: string;
  post?: Post;
  commentId?: string;
  comment?: Comment;
  userId: string;
  user: User;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  follower: User;
  followingId: string;
  following: User;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  recipientId: string;
  recipient: User;
  conversationId: string;
  conversation?: Conversation;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'mention';
  userId: string;
  user: User;
  actorId: string;
  actor: User;
  postId?: string;
  post?: Post;
  commentId?: string;
  comment?: Comment;
  messageId?: string;
  message?: Message;
  isRead: boolean;
  createdAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}