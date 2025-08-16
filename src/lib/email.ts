import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import VerificationEmail from '@/emails/verification-email';
import PasswordResetEmail from '@/emails/password-reset-email';
import NotificationEmail from '@/emails/notification-email';

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
  
  const html = render(
    VerificationEmail({
      username,
      verificationUrl,
    })
  );

  await sendEmail({
    to: email,
    subject: 'メールアドレスの確認 - Bubunene Forum',
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  const html = render(
    PasswordResetEmail({
      username,
      resetUrl,
    })
  );

  await sendEmail({
    to: email,
    subject: 'パスワードリセット - Bubunene Forum',
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
): Promise<void> {
  const html = render(
    NotificationEmail({
      username,
      subject,
      message,
      actionUrl,
      actionText,
    })
  );

  await sendEmail({
    to: email,
    subject: `${subject} - Bubunene Forum`,
    html,
  });
}

export async function sendAdminNotification(
  subject: string,
  message: string
): Promise<void> {
  const adminEmail = process.env.EMAIL_ADMIN;
  if (!adminEmail) {
    console.warn('Admin email not configured');
    return;
  }

  await sendEmail({
    to: adminEmail,
    subject: `[Admin] ${subject}`,
    text: message,
  });
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email server connection successful');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}