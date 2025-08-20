import { prisma } from '@/lib/prisma';

// 監査ログの重要度レベル
export enum AuditSeverity {
  INFO = 'INFO',
  WARN = 'WARN', 
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// 監査イベントの種類
export enum AuditAction {
  // 認証関連
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  
  // 投稿関連
  POST_CREATE = 'POST_CREATE',
  POST_UPDATE = 'POST_UPDATE',
  POST_DELETE = 'POST_DELETE',
  POST_VIEW = 'POST_VIEW',
  
  // セキュリティ関連
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  NOSQL_INJECTION_ATTEMPT = 'NOSQL_INJECTION_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // 管理者関連
  ADMIN_ACTION = 'ADMIN_ACTION',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

// 監査ログのインターフェース
export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details: Record<string, any>;
  severity: AuditSeverity;
  source: string;
}

/**
 * 監査ログの作成
 */
export async function createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    // 本番環境でのみデータベースに記録
    if (process.env.NODE_ENV === 'production') {
      // TODO: AuditLogテーブルの作成が必要
      // await prisma.auditLog.create({
      //   data: {
      //     ...entry,
      //     timestamp: new Date(),
      //     details: JSON.stringify(entry.details)
      //   }
      // });
    }
    
    // 開発環境では常にコンソールに出力
    const logEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    console.log(`[AUDIT] ${logEntry.severity}: ${logEntry.action}`, {
      userId: logEntry.userId,
      ip: logEntry.ipAddress,
      resource: logEntry.resource,
      details: logEntry.details,
      timestamp: logEntry.timestamp.toISOString()
    });
    
    // 重要度が高い場合は警告として出力
    if (entry.severity === AuditSeverity.ERROR || entry.severity === AuditSeverity.CRITICAL) {
      console.warn(`[SECURITY ALERT] ${logEntry.action}:`, logEntry);
    }
    
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // 監査ログの作成失敗は致命的ではないので、エラーをログに出力するのみ
  }
}

/**
 * リクエスト情報から監査ログの基本情報を抽出
 */
export function extractRequestInfo(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const headers = request.headers;
  
  // IPアドレスを取得
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  let ipAddress = '127.0.0.1';
  
  if (forwarded) {
    ipAddress = forwarded.split(',')[0].trim();
  } else if (realIP) {
    ipAddress = realIP;
  }
  
  // User-Agentを取得
  const userAgent = headers.get('user-agent') || 'Unknown';
  
  return {
    ipAddress,
    userAgent
  };
}

/**
 * 認証関連のイベントをログ
 */
export async function logAuthEvent(
  action: AuditAction.LOGIN_SUCCESS | AuditAction.LOGIN_FAILED | AuditAction.LOGOUT | AuditAction.REGISTER,
  request: Request,
  userId?: string,
  details: Record<string, any> = {}
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  
  await createAuditLog({
    userId,
    ipAddress,
    userAgent,
    action,
    details,
    severity: action === AuditAction.LOGIN_FAILED ? AuditSeverity.WARN : AuditSeverity.INFO,
    source: 'AUTH'
  });
}

/**
 * 投稿関連のイベントをログ
 */
export async function logPostEvent(
  action: AuditAction.POST_CREATE | AuditAction.POST_UPDATE | AuditAction.POST_DELETE | AuditAction.POST_VIEW,
  request: Request,
  userId: string,
  postId: string,
  details: Record<string, any> = {}
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  
  await createAuditLog({
    userId,
    ipAddress,
    userAgent,
    action,
    resource: 'POST',
    resourceId: postId,
    details,
    severity: action === AuditAction.POST_DELETE ? AuditSeverity.WARN : AuditSeverity.INFO,
    source: 'POST'
  });
}

/**
 * セキュリティイベントをログ
 */
export async function logSecurityEvent(
  action: AuditAction.RATE_LIMIT_EXCEEDED | AuditAction.XSS_ATTEMPT | AuditAction.NOSQL_INJECTION_ATTEMPT | AuditAction.UNAUTHORIZED_ACCESS | AuditAction.INVALID_INPUT,
  request: Request,
  userId?: string,
  details: Record<string, any> = {}
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  
  await createAuditLog({
    userId,
    ipAddress,
    userAgent,
    action,
    details,
    severity: AuditSeverity.ERROR,
    source: 'SECURITY'
  });
}

/**
 * 管理者アクションをログ
 */
export async function logAdminEvent(
  request: Request,
  userId: string,
  action: string,
  details: Record<string, any> = {}
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  
  await createAuditLog({
    userId,
    ipAddress,
    userAgent,
    action: AuditAction.ADMIN_ACTION,
    details: { ...details, adminAction: action },
    severity: AuditSeverity.WARN,
    source: 'ADMIN'
  });
}

/**
 * 監査ログの検索・分析（管理者用）
 */
export interface AuditLogQuery {
  userId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  limit?: number;
}

export async function queryAuditLogs(query: AuditLogQuery): Promise<AuditLogEntry[]> {
  // 開発環境では空配列を返す
  if (process.env.NODE_ENV !== 'production') {
    return [];
  }
  
  // 本番環境での実装
  // TODO: AuditLogテーブルからの検索実装
  return [];
}

/**
 * セキュリティメトリクスの取得
 */
export interface SecurityMetrics {
  totalEvents: number;
  securityEvents: number;
  topAttackers: Array<{ ipAddress: string; count: number }>;
  eventsByType: Record<string, number>;
  recentAlerts: AuditLogEntry[];
}

export async function getSecurityMetrics(hours: number = 24): Promise<SecurityMetrics> {
  // 開発環境では空のメトリクスを返す
  if (process.env.NODE_ENV !== 'production') {
    return {
      totalEvents: 0,
      securityEvents: 0,
      topAttackers: [],
      eventsByType: {},
      recentAlerts: []
    };
  }
  
  // 本番環境での実装
  // TODO: 統計データの取得実装
  return {
    totalEvents: 0,
    securityEvents: 0,
    topAttackers: [],
    eventsByType: {},
    recentAlerts: []
  };
}