import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// サーバーサイドでのDOMPurifyセットアップ
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * XSS対策 - HTMLサニタイゼーション
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // DOMPurifyでHTMLをサニタイズ
  const clean = purify.sanitize(input, {
    ALLOWED_TAGS: [], // HTMLタグは一切許可しない（プレーンテキストのみ）
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // タグを除去してもコンテンツは保持
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  });
  
  return clean;
}

/**
 * 基本的なテキストサニタイゼーション
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * NoSQLインジェクション対策（MongoDB用）
 */
export function sanitizeMongoInput(input: any): any {
  if (input === null || input === undefined) {
    return input;
  }
  
  // プリミティブ型の場合
  if (typeof input !== 'object') {
    return input;
  }
  
  // 配列の場合
  if (Array.isArray(input)) {
    return input.map(sanitizeMongoInput);
  }
  
  // オブジェクトの場合
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(input)) {
    // MongoDB演算子を含むキーを除去
    if (key.startsWith('$')) {
      console.warn(`Potentially dangerous MongoDB operator removed: ${key}`);
      continue;
    }
    
    // キー名のサニタイゼーション
    const sanitizedKey = key.replace(/[$.]/g, '');
    
    // 値の再帰的サニタイゼーション
    sanitized[sanitizedKey] = sanitizeMongoInput(value);
  }
  
  return sanitized;
}

/**
 * XSS攻撃パターンの検知
 */
export function containsXSS(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  const xssPatterns = [
    // Script tags
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<script[\s\S]*?>/gi,
    
    // JavaScript events
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^>\s]+/gi,
    
    // JavaScript URLs
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:\s*text\s*\/\s*html/gi,
    
    // Iframe and object tags
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    
    // Meta and link tags
    /<meta[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    
    // Style with javascript
    /<style[\s\S]*?>[\s\S]*?javascript[\s\S]*?<\/style>/gi,
    /style\s*=\s*["'][^"']*javascript[^"']*["']/gi,
    
    // Expression() in CSS
    /expression\s*\(/gi,
    
    // Import statement
    /@import/gi,
    
    // Base64 encoded javascript
    /data:.*base64.*javascript/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * 入力値の検証と正規化
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedChars?: string;
  sanitize?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

export function validateAndSanitize(input: string, rules: ValidationRule): ValidationResult {
  const errors: string[] = [];
  let sanitized = input || '';
  
  // 必須チェック
  if (rules.required && !sanitized.trim()) {
    errors.push('この項目は必須です');
    return { isValid: false, sanitized: '', errors };
  }
  
  // XSS攻撃検知（サニタイゼーション前）
  if (containsXSS(sanitized)) {
    errors.push('不正なスクリプトが検出されました');
    return { isValid: false, sanitized: '', errors };
  }
  
  // サニタイゼーション
  if (rules.sanitize !== false) {
    sanitized = sanitizeHTML(sanitized);
  }
  
  // 長さチェック
  if (rules.minLength && sanitized.length < rules.minLength) {
    errors.push(`最低${rules.minLength}文字以上入力してください`);
  }
  
  if (rules.maxLength && sanitized.length > rules.maxLength) {
    errors.push(`${rules.maxLength}文字以内で入力してください`);
    sanitized = sanitized.substring(0, rules.maxLength);
  }
  
  // パターンマッチ
  if (rules.pattern && !rules.pattern.test(sanitized)) {
    errors.push('入力形式が正しくありません');
  }
  
  // 許可文字チェック
  if (rules.allowedChars) {
    const allowedRegex = new RegExp(`[^${rules.allowedChars}]`);
    if (allowedRegex.test(sanitized)) {
      errors.push('使用できない文字が含まれています');
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * 投稿内容の検証ルール
 */
export const POST_VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 20,
    sanitize: true,
    allowedChars: 'a-zA-Z0-9ぁ-んァ-ン一-龯ー\\s\\-_.,!?()[]「」'
  } as ValidationRule,
  
  content: {
    required: true,
    minLength: 1,
    maxLength: 200,
    sanitize: true,
    allowedChars: 'a-zA-Z0-9ぁ-んァ-ン一-龯ー\\s\\-_.,!?()[]「」\\n\\r'
  } as ValidationRule
};

/**
 * ユーザー入力の検証ルール
 */
export const USER_VALIDATION_RULES = {
  email: {
    required: true,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    sanitize: true
  } as ValidationRule,
  
  name: {
    required: false,
    maxLength: 50,
    sanitize: true,
    allowedChars: 'a-zA-Z0-9ぁ-んァ-ン一-龯ー\\s\\-_'
  } as ValidationRule,
  
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    sanitize: false // パスワードはサニタイズしない
  } as ValidationRule
};

/**
 * 危険な文字列パターンの検出
 */
const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
];

export function detectDangerousContent(input: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * セキュリティログ用の関数
 */
export function logSecurityEvent(event: {
  type: 'XSS_ATTEMPT' | 'NOSQL_INJECTION' | 'INVALID_INPUT';
  input: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  console.warn('Security Event:', {
    ...event,
    timestamp: new Date().toISOString(),
  });
  
  // 本番環境では監査ログに記録
  if (process.env.NODE_ENV === 'production') {
    // TODO: 監査ログシステムと連携
  }
}