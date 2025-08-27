'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { snsApi } from '@/lib/sns/api/client';
import { CreatePostInput, UpdatePostInput } from '@/lib/sns/validations';
import { useSocket } from '@/hooks/useSocket';
import { Post } from '@/lib/sns/types';

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam }) => snsApi.posts.getFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
};

export const usePost = (id: string) => {
  return useInfiniteQuery({
    queryKey: ['posts', id],
    queryFn: () => snsApi.posts.getById(id),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { emit } = useSocket();

  return useMutation({
    mutationFn: (data: CreatePostInput) => snsApi.posts.create(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      emit('post:create', newPost);
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) =>
      snsApi.posts.update(id, data),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => snsApi.posts.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { emit } = useSocket();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? snsApi.posts.unlike(postId) : snsApi.posts.like(postId),
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const updatePost = (post: Post) => ({
        ...post,
        isLiked: !isLiked,
        likesCount: post.likesCount + (isLiked ? -1 : 1),
      });

      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (old: any) => {
          if (!old) return old;
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: page.data.map((post: Post) =>
                  post.id === postId ? updatePost(post) : post
                ),
              })),
            };
          }
          return old.id === postId ? updatePost(old) : old;
        }
      );
    },
    onSuccess: (_, { postId, isLiked }) => {
      if (!isLiked) {
        emit('post:like', { postId });
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};