import { Post, Comment, Like, Follow, Message, Conversation, Notification, PaginatedResponse } from '../types';
import { CreatePostInput, UpdatePostInput, CreateCommentInput, SendMessageInput } from '../validations';

const API_BASE = '/api/sns';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const snsApi = {
  posts: {
    getFeed: (cursor?: string) =>
      fetchAPI<PaginatedResponse<Post>>(`/posts/feed${cursor ? `?cursor=${cursor}` : ''}`),
    
    getById: (id: string) =>
      fetchAPI<Post>(`/posts/${id}`),
    
    create: (data: CreatePostInput) =>
      fetchAPI<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: UpdatePostInput) =>
      fetchAPI<Post>(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      fetchAPI<{ success: boolean }>(`/posts/${id}`, {
        method: 'DELETE',
      }),
    
    like: (id: string) =>
      fetchAPI<Like>(`/posts/${id}/like`, {
        method: 'POST',
      }),
    
    unlike: (id: string) =>
      fetchAPI<{ success: boolean }>(`/posts/${id}/like`, {
        method: 'DELETE',
      }),
  },

  comments: {
    getByPostId: (postId: string, cursor?: string) =>
      fetchAPI<PaginatedResponse<Comment>>(`/comments?postId=${postId}${cursor ? `&cursor=${cursor}` : ''}`),
    
    create: (data: CreateCommentInput) =>
      fetchAPI<Comment>('/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      fetchAPI<{ success: boolean }>(`/comments/${id}`, {
        method: 'DELETE',
      }),
  },

  follows: {
    getFollowers: (userId: string, cursor?: string) =>
      fetchAPI<PaginatedResponse<Follow>>(`/users/${userId}/followers${cursor ? `?cursor=${cursor}` : ''}`),
    
    getFollowing: (userId: string, cursor?: string) =>
      fetchAPI<PaginatedResponse<Follow>>(`/users/${userId}/following${cursor ? `?cursor=${cursor}` : ''}`),
    
    follow: (userId: string) =>
      fetchAPI<Follow>(`/users/${userId}/follow`, {
        method: 'POST',
      }),
    
    unfollow: (userId: string) =>
      fetchAPI<{ success: boolean }>(`/users/${userId}/follow`, {
        method: 'DELETE',
      }),
  },

  messages: {
    getConversations: (cursor?: string) =>
      fetchAPI<PaginatedResponse<Conversation>>(`/messages/conversations${cursor ? `?cursor=${cursor}` : ''}`),
    
    getMessages: (conversationId: string, cursor?: string) =>
      fetchAPI<PaginatedResponse<Message>>(`/messages/${conversationId}${cursor ? `?cursor=${cursor}` : ''}`),
    
    send: (data: SendMessageInput) =>
      fetchAPI<Message>('/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    markAsRead: (messageId: string) =>
      fetchAPI<{ success: boolean }>(`/messages/${messageId}/read`, {
        method: 'PUT',
      }),
  },

  notifications: {
    getAll: (cursor?: string) =>
      fetchAPI<PaginatedResponse<Notification>>(`/notifications${cursor ? `?cursor=${cursor}` : ''}`),
    
    getUnreadCount: () =>
      fetchAPI<{ count: number }>('/notifications/unread-count'),
    
    markAsRead: (id: string) =>
      fetchAPI<{ success: boolean }>(`/notifications/${id}/read`, {
        method: 'PUT',
      }),
    
    markAllAsRead: () =>
      fetchAPI<{ success: boolean }>('/notifications/read-all', {
        method: 'PUT',
      }),
  },
};