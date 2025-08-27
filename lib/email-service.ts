import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import {
  VerificationEmail,
  PasswordResetEmail,
  WelcomeEmail,
  NotificationEmail
} from '../emails';

// Email service configuration with multiple providers support
interface EmailProvider {
  name: string;
  createTransporter: () => nodemailer.Transporter;
  priority: number;
  enabled: boolean;
}

class EmailService {
  private providers: EmailProvider[] = [];
  private currentProviderIndex = 0;
  private healthStatus: Map<string, { healthy: boolean; lastCheck: Date; error?: string }> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Primary: Gmail
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.providers.push({
        name: 'Gmail',
        priority: 1,
        enabled: true,
        createTransporter: () => nodemailer.createTransporter({
          host: process.env.EMAIL_HOST!,
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER!,
            pass: process.env.EMAIL_PASS!,
          },
          tls: {
            rejectUnauthorized: false
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 10 // 10 emails per second
        })
      });
    }

    // Fallback: SendGrid (if configured)
    if (process.env.SENDGRID_API_KEY) {
      this.providers.push({
        name: 'SendGrid',
        priority: 2,
        enabled: true,
        createTransporter: () => nodemailer.createTransporter({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY!
          }
        })
      });
    }

    // Fallback: AWS SES (if configured)
    if (process.env.AWS_SES_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.providers.push({
        name: 'AWS SES',
        priority: 3,
        enabled: true,
        createTransporter: () => nodemailer.createTransporter({
          host: `email-smtp.${process.env.AWS_SES_REGION}.amazonaws.com`,
          port: 587,
          secure: false,
          auth: {
            user: process.env.AWS_ACCESS_KEY_ID!,
            pass: process.env.AWS_SECRET_ACCESS_KEY!
          }
        })
      });
    }

    // Sort by priority
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  private async getHealthyTransporter(): Promise<{ transporter: nodemailer.Transporter; provider: string } | null> {
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[(this.currentProviderIndex + i) % this.providers.length];
      
      if (!provider.enabled) continue;

      try {
        const transporter = provider.createTransporter();
        
        // Quick health check with timeout
        const verifyPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        );

        await Promise.race([verifyPromise, timeoutPromise]);
        
        this.healthStatus.set(provider.name, {
          healthy: true,
          lastCheck: new Date()
        });

        this.currentProviderIndex = (this.currentProviderIndex + i) % this.providers.length;
        console.log(`✅ Using email provider: ${provider.name}`);
        
        return { transporter, provider: provider.name };
      } catch (error: any) {
        console.warn(`⚠️ Provider ${provider.name} is unhealthy:`, error.message);
        this.healthStatus.set(provider.name, {
          healthy: false,
          lastCheck: new Date(),
          error: error.message
        });
      }
    }

    return null;
  }

  public async sendEmail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: any[];
  }): Promise<{ success: boolean; messageId?: string; error?: string; provider?: string }> {
    // Validate email configuration
    if (!process.env.EMAIL_FROM) {
      console.error('❌ EMAIL_FROM environment variable is not set');
      return {
        success: false,
        error: 'Email service not configured: EMAIL_FROM is missing'
      };
    }

    // Get healthy transporter
    const transport = await this.getHealthyTransporter();
    if (!transport) {
      console.error('❌ No healthy email providers available');
      
      // Log to monitoring service if available
      if (process.env.SENTRY_DSN) {
        // Sentry error logging would go here
      }
      
      return {
        success: false,
        error: 'All email providers are currently unavailable'
      };
    }

    const { transporter, provider } = transport;

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Member Board'} <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
        headers: {
          'X-Provider': provider,
          'X-Entity-Ref-ID': new Date().getTime().toString()
        }
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent via ${provider} to ${options.to} (ID: ${result.messageId})`);
      
      // Close transporter connection pool
      transporter.close();
      
      return {
        success: true,
        messageId: result.messageId,
        provider
      };
    } catch (error: any) {
      console.error(`❌ Failed to send email via ${provider}:`, error.message);
      
      // Mark provider as unhealthy
      const providerConfig = this.providers.find(p => p.name === provider);
      if (providerConfig) {
        providerConfig.enabled = false;
        setTimeout(() => {
          providerConfig.enabled = true;
        }, 60000); // Re-enable after 1 minute
      }

      // Close transporter connection pool
      transporter.close();
      
      return {
        success: false,
        error: error.message,
        provider
      };
    }
  }

  public async getHealthStatus() {
    const status: any = {
      providers: [],
      overallHealth: 'unknown'
    };

    for (const provider of this.providers) {
      const health = this.healthStatus.get(provider.name);
      status.providers.push({
        name: provider.name,
        enabled: provider.enabled,
        priority: provider.priority,
        ...health
      });
    }

    const healthyCount = status.providers.filter((p: any) => p.healthy).length;
    if (healthyCount === 0) {
      status.overallHealth = 'critical';
    } else if (healthyCount < this.providers.length) {
      status.overallHealth = 'degraded';
    } else {
      status.overallHealth = 'healthy';
    }

    return status;
  }

  // Test email configuration
  public async testConfiguration(): Promise<{ success: boolean; details: any }> {
    const results: any = {
      providers: [],
      configuration: {
        EMAIL_FROM: process.env.EMAIL_FROM ? '✅' : '❌',
        EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME ? '✅' : '❌',
        EMAIL_ADMIN: process.env.EMAIL_ADMIN ? '✅' : '❌'
      }
    };

    for (const provider of this.providers) {
      try {
        const transporter = provider.createTransporter();
        await transporter.verify();
        results.providers.push({
          name: provider.name,
          status: '✅ Connected',
          priority: provider.priority
        });
        transporter.close();
      } catch (error: any) {
        results.providers.push({
          name: provider.name,
          status: '❌ Failed',
          error: error.message,
          priority: provider.priority
        });
      }
    }

    return {
      success: results.providers.some((p: any) => p.status.includes('✅')),
      details: results
    };
  }
}

// Singleton instance
const emailService = new EmailService();

// Exported functions that use the service
export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.AUTH_URL}/api/auth/verify?token=${token}`;
  
  try {
    const html = await render(VerificationEmail({
      username,
      verificationUrl
    }));

    return emailService.sendEmail({
      to: email,
      subject: 'メールアドレスの確認 - Member Board',
      html,
    });
  } catch (error: any) {
    console.error('Failed to render verification email:', error);
    return {
      success: false,
      error: 'Failed to generate email template'
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resetUrl = `${process.env.NEXTAUTH_URL || process.env.AUTH_URL}/reset-password?token=${token}`;
  
  try {
    const html = await render(PasswordResetEmail({
      username,
      resetUrl
    }));

    return emailService.sendEmail({
      to: email,
      subject: 'パスワードリセット - Member Board',
      html,
    });
  } catch (error: any) {
    console.error('Failed to render password reset email:', error);
    return {
      success: false,
      error: 'Failed to generate email template'
    };
  }
}

export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const dashboardUrl = `${process.env.NEXTAUTH_URL || process.env.AUTH_URL}/dashboard`;
  
  try {
    const html = await render(WelcomeEmail({
      username,
      dashboardUrl
    }));

    return emailService.sendEmail({
      to: email,
      subject: 'ようこそ Member Board へ！',
      html,
    });
  } catch (error: any) {
    console.error('Failed to render welcome email:', error);
    return {
      success: false,
      error: 'Failed to generate email template'
    };
  }
}

export async function sendNotificationEmail(
  email: string,
  username: string,
  subject: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const html = await render(NotificationEmail({
      username,
      subject,
      message,
      actionUrl,
      actionText
    }));

    return emailService.sendEmail({
      to: email,
      subject: `${subject} - Member Board`,
      html,
    });
  } catch (error: any) {
    console.error('Failed to render notification email:', error);
    return {
      success: false,
      error: 'Failed to generate email template'
    };
  }
}

export async function testEmailConnection(): Promise<{ success: boolean; details?: any; error?: string }> {
  const result = await emailService.testConfiguration();
  return {
    success: result.success,
    details: result.details,
    error: result.success ? undefined : 'No email providers are configured or accessible'
  };
}

export async function getEmailHealthStatus() {
  return emailService.getHealthStatus();
}

// Export the service for advanced usage
export { emailService };