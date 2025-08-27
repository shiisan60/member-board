import { z } from 'zod';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, '投稿内容を入力してください')
    .max(500, '投稿は500文字以内で入力してください'),
  images: z.array(z.string().url()).optional(),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, '投稿内容を入力してください')
    .max(500, '投稿は500文字以内で入力してください'),
  images: z.array(z.string().url()).optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(200, 'コメントは200文字以内で入力してください'),
  postId: z.string(),
  parentId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'メッセージを入力してください')
    .max(1000, 'メッセージは1000文字以内で入力してください'),
  recipientId: z.string(),
  conversationId: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  bio: z
    .string()
    .max(160, '自己紹介は160文字以内で入力してください')
    .optional(),
  image: z.string().url().optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1, '検索キーワードを入力してください'),
  type: z.enum(['posts', 'users', 'all']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchInput = z.infer<typeof searchSchema>;