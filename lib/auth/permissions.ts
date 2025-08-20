/**
 * 権限管理システム
 * ユーザーの役割と権限を管理するユーティリティ
 */

// 権限レベルの定義
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// 権限タイプの定義
export interface Permission {
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
}

// 投稿の権限チェック
export function canEditPost(
  userId: string | undefined,
  postAuthorId: string,
  userRole: string = Role.USER
): boolean {
  if (!userId) return false;
  
  // 管理者は全ての投稿を編集可能
  if (userRole === Role.ADMIN) return true;
  
  // 一般ユーザーは自分の投稿のみ編集可能
  return userId === postAuthorId;
}

// 投稿の削除権限チェック
export function canDeletePost(
  userId: string | undefined,
  postAuthorId: string,
  userRole: string = Role.USER
): boolean {
  if (!userId) return false;
  
  // 管理者は全ての投稿を削除可能
  if (userRole === Role.ADMIN) return true;
  
  // 一般ユーザーは自分の投稿のみ削除可能
  return userId === postAuthorId;
}

// 管理者権限チェック
export function isAdmin(userRole: string | undefined): boolean {
  return userRole === Role.ADMIN;
}

// モデレーター権限チェック
export function isModerator(userRole: string | undefined): boolean {
  return userRole === Role.MODERATOR || userRole === Role.ADMIN;
}

// 投稿作成権限チェック
export function canCreatePost(userId: string | undefined): boolean {
  // ログインユーザーは全員投稿可能
  return !!userId;
}

// 投稿に対する全権限を取得
export function getPostPermissions(
  userId: string | undefined,
  postAuthorId: string,
  userRole: string = Role.USER
): Permission {
  return {
    canEdit: canEditPost(userId, postAuthorId, userRole),
    canDelete: canDeletePost(userId, postAuthorId, userRole),
    canManage: isAdmin(userRole)
  };
}

// ユーザー管理権限チェック
export function canManageUsers(userRole: string | undefined): boolean {
  return userRole === Role.ADMIN;
}

// 権限エラーメッセージ
export const PERMISSION_ERRORS = {
  UNAUTHORIZED: '認証が必要です',
  FORBIDDEN: '権限がありません',
  NOT_OWNER: 'この投稿を操作する権限がありません',
  NOT_ADMIN: '管理者権限が必要です',
  POST_NOT_FOUND: '投稿が見つかりません'
} as const;

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
} as const;