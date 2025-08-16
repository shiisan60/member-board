import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NotificationEmailProps {
  username: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export const NotificationEmail = ({
  username,
  subject,
  message,
  actionUrl,
  actionText = 'View Details',
}: NotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bubunene Forum - {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Bubunene Forum</Text>
          <Hr style={hr} />
          <Text style={heading}>{subject}</Text>
          <Text style={paragraph}>こんにちは {username} さん、</Text>
          <Text style={paragraph}>{message}</Text>
          {actionUrl && (
            <>
              <Section style={btnContainer}>
                <Button style={button} href={actionUrl}>
                  {actionText}
                </Button>
              </Section>
              <Text style={paragraph}>
                ボタンが機能しない場合は、以下のリンクをブラウザにコピーしてください：
              </Text>
              <Link href={actionUrl} style={link}>
                {actionUrl}
              </Link>
            </>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            このメールは通知設定に基づいて送信されました。
            通知設定を変更するには、アカウント設定をご確認ください。
          </Text>
          <Text style={footer}>
            Bubunene Forum Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '40px 0',
};

const heading = {
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  marginTop: '10px',
};

export default NotificationEmail;