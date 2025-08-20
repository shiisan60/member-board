'use client';

import { useSession } from 'next-auth/react';
import { canEditPost, canDeletePost, isAdmin, getPostPermissions, Permission } from '@/lib/auth/permissions';

/**
 * 権限管理フック
 * ユーザーの権限をチェックするカスタムフック
 */
export function usePermissions() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userRole = (session?.user as any)?.role || 'user';

  return {
    // 投稿編集権限
    canEdit: (postAuthorId: string) => canEditPost(userId, postAuthorId, userRole),
    
    // 投稿削除権限
    canDelete: (postAuthorId: string) => canDeletePost(userId, postAuthorId, userRole),
    
    // 管理者権限
    isAdmin: () => isAdmin(userRole),
    
    // 投稿の全権限を取得
    getPostPermissions: (postAuthorId: string): Permission => 
      getPostPermissions(userId, postAuthorId, userRole),
    
    // ログイン状態
    isAuthenticated: !!session,
    
    // ユーザー情報
    user: {
      id: userId,
      role: userRole,
      name: session?.user?.name,
      email: session?.user?.email,
    }
  };
}

/**
 * 投稿編集権限フック
 */
export function useCanEdit(postAuthorId: string) {
  const { canEdit } = usePermissions();
  return canEdit(postAuthorId);
}

/**
 * 投稿削除権限フック
 */
export function useCanDelete(postAuthorId: string) {
  const { canDelete } = usePermissions();
  return canDelete(postAuthorId);
}

/**
 * 管理者権限フック
 */
export function useIsAdmin() {
  const { isAdmin } = usePermissions();
  return isAdmin();
}