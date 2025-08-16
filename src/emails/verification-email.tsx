import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  username: string;
  verificationUrl: string;
}

export const VerificationEmail = ({
  username,
  verificationUrl,
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bubunene Forum - メールアドレスの確認</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Bubunene Forum</Text>
          <Hr style={hr} />
          <Text style={paragraph}>こんにちは {username} さん、</Text>
          <Text style={paragraph}>
            Bubunene Forumへのご登録ありがとうございます。
            以下のボタンをクリックして、メールアドレスを確認してください。
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={verificationUrl}>
              メールアドレスを確認
            </Button>
          </Section>
          <Text style={paragraph}>
            ボタンが機能しない場合は、以下のリンクをブラウザにコピーしてください：
          </Text>
          <Link href={verificationUrl} style={link}>
            {verificationUrl}
          </Link>
          <Hr style={hr} />
          <Text style={footer}>
            このメールに心当たりがない場合は、無視してください。
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
  backgroundColor: '#3b82f6',
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

export default VerificationEmail;