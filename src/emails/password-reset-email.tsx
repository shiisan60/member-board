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

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  username,
  resetUrl,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bubunene Forum - パスワードリセット</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Bubunene Forum</Text>
          <Hr style={hr} />
          <Text style={paragraph}>こんにちは {username} さん、</Text>
          <Text style={paragraph}>
            パスワードリセットのリクエストを受け付けました。
            以下のボタンをクリックして、新しいパスワードを設定してください。
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={resetUrl}>
              パスワードをリセット
            </Button>
          </Section>
          <Text style={paragraph}>
            このリンクは30分間有効です。期限が切れた場合は、再度リセットをリクエストしてください。
          </Text>
          <Text style={paragraph}>
            ボタンが機能しない場合は、以下のリンクをブラウザにコピーしてください：
          </Text>
          <Link href={resetUrl} style={link}>
            {resetUrl}
          </Link>
          <Hr style={hr} />
          <Text style={footer}>
            このメールに心当たりがない場合は、無視してください。
            あなたのパスワードは変更されません。
          </Text>
          <Text style={footer}>
            セキュリティ上の理由から、このリクエストはIPアドレスから送信されました。
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

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#ef4444',
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

export default PasswordResetEmail;