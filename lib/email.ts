import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import {
  VerificationEmail,
  PasswordResetEmail,
  WelcomeEmail,
  NotificationEmail
} from '../emails';

// Transporter configuration with retry logic
function createTransporter() {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Additional Gmail specific settings
    ...(process.env.EMAIL_HOST === 'smtp.gmail.com' && {
      service: 'gmail',
      tls: {
        rejectUnauthorized: false
      }
    })
  };

  return nodemailer.createTransport(config);
}

const transporter = createTransporter();

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2
};

async function sendEmail(options: EmailOptions, retryCount = 0): Promise<SendEmailResult> {
  try {
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS are required');
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error('Email configuration missing: EMAIL_FROM is required');
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Member Board'} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to} (MessageID: ${result.messageId})`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error(`❌ Error sending email to ${options.to}:`, errorMessage);

    // Retry logic for transient errors
    if (retryCount < RETRY_CONFIG.maxRetries && isRetriableError(error)) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      console.log(`🔄 Retrying email send in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendEmail(options, retryCount + 1);
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

// Determine if an error is retriable
function isRetriableError(error: any): boolean {
  const retriableErrors = [
    'ETIMEDOUT',
    'ECONNRESET',
    'ENOTFOUND',
    'EAI_AGAIN',
    'ECONNREFUSED'
  ];
  
  return retriableErrors.some(code => 
    error.code === code || 
    error.errno === code ||
    (error.message && error.message.includes(code))
  );
}

// Email template validation
export function validateEmailTemplate(templateName: string, props: any): boolean {
  const requiredProps = {
    verification: ['username', 'verificationUrl'],
    'password-reset': ['username', 'resetUrl'],
    welcome: ['username', 'dashboardUrl'],
    notification: ['username', 'subject', 'message']
  };

  const required = requiredProps[templateName as keyof typeof requiredProps];
  if (!required) {
    console.error(`❌ Unknown email template: ${templateName}`);
    return false;
  }

  for (const prop of required) {
    if (!props[prop]) {
      console.error(`❌ Missing required prop '${prop}' for ${templateName} template`);
      return false;
    }
  }

  return true;
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
): Promise<SendEmailResult> {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://member-board-week2.vercel.app';
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;
  
  const html = await render(VerificationEmail({
    username,
    verificationUrl
  }));

  return sendEmail({
    to: email,
    subject: 'メールアドレスの確認 - Member Board',
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string
): Promise<SendEmailResult> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  const html = await render(PasswordResetEmail({
    username,
    resetUrl
  }));

  return sendEmail({
    to: email,
    subject: 'パスワードリセット - Member Board',
    html,
  });
}

export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<SendEmailResult> {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  
  const html = await render(WelcomeEmail({
    username,
    dashboardUrl
  }));

  return sendEmail({
    to: email,
    subject: 'ようこそ Member Board へ！',
    html,
  });
}

export async function sendNotificationEmail(
  email: string,
  username: string,
  subject: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Promise<SendEmailResult> {
  const html = await render(NotificationEmail({
    username,
    subject,
    message,
    actionUrl,
    actionText
  }));

  return sendEmail({
    to: email,
    subject: `${subject} - Member Board`,
    html,
  });
}

export async function sendAdminNotification(
  subject: string,
  message: string
): Promise<SendEmailResult> {
  const adminEmail = process.env.EMAIL_ADMIN;
  if (!adminEmail) {
    console.warn('⚠️ Admin email not configured');
    return {
      success: false,
      error: 'Admin email not configured'
    };
  }

  return sendEmail({
    to: adminEmail,
    subject: `[Admin] ${subject}`,
    text: message,
  });
}

export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.verify();
    console.log('✅ Email server connection successful');
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('❌ Email server connection failed:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Email queue for bulk sending (future enhancement)
export interface EmailQueueItem {
  id: string;
  type: 'verification' | 'password-reset' | 'welcome' | 'notification';
  recipient: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt?: Date;
}

// Bulk email sender with rate limiting
export async function sendBulkEmails(
  emails: EmailOptions[],
  rateLimit: number = 10 // emails per second
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];
  const delay = 1000 / rateLimit; // delay between emails

  for (const emailOptions of emails) {
    const result = await sendEmail(emailOptions);
    results.push(result);
    
    // Rate limiting delay
    if (emails.indexOf(emailOptions) < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return results;
}