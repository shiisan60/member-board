/**
 * パスワード強度チェックとバリデーションユーティリティ
 */

export interface PasswordStrength {
  score: number; // 0-4のスコア
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
  isValid: boolean;
}

export interface PasswordRequirements {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * パスワードの強度をチェック
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // 要件チェック
  const requirements = checkPasswordRequirements(password);

  // 最小長チェック
  if (password.length < 8) {
    feedback.push('パスワードは8文字以上必要です');
  } else if (password.length >= 8) {
    score += 1;
  }
  if (password.length >= 12) {
    score += 0.5;
  }

  // 大文字チェック
  if (!requirements.hasUpperCase) {
    feedback.push('大文字を含めてください');
  } else {
    score += 0.5;
  }

  // 小文字チェック
  if (!requirements.hasLowerCase) {
    feedback.push('小文字を含めてください');
  } else {
    score += 0.5;
  }

  // 数字チェック
  if (!requirements.hasNumber) {
    feedback.push('数字を含めてください');
  } else {
    score += 0.5;
  }

  // 特殊文字チェック
  if (!requirements.hasSpecialChar) {
    feedback.push('特殊文字（!@#$%^&*など）を含めることを推奨します');
  } else {
    score += 1;
  }

  // よくあるパスワードのチェック
  const commonPasswords = [
    'password', 'Password', '12345678', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
    score = Math.max(0, score - 2);
    feedback.push('よくあるパスワードは避けてください');
  }

  // スコアから強度レベルを決定
  let level: PasswordStrength['level'];
  if (score < 1.5) {
    level = 'weak';
  } else if (score < 2.5) {
    level = 'fair';
  } else if (score < 3) {
    level = 'good';
  } else if (score < 3.5) {
    level = 'strong';
  } else {
    level = 'very-strong';
  }

  // 最低要件を満たしているかチェック
  const isValid = password.length >= 8 && 
                  requirements.hasUpperCase && 
                  requirements.hasLowerCase && 
                  requirements.hasNumber;

  return {
    score: Math.min(4, score),
    level,
    feedback,
    isValid
  };
}

/**
 * パスワードの要件をチェック
 */
export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
}

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 名前のバリデーション
 */
export function validateName(name: string): boolean {
  // 最小2文字、最大50文字
  return name.length >= 2 && name.length <= 50;
}