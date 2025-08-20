import { Text, Link } from '@react-email/components';
import Layout from '../components/Layout';
import Button from '../components/Button';

interface VerificationEmailProps {
  username: string;
  verificationUrl: string;
}

export default function VerificationEmail({ 
  username, 
  verificationUrl 
}: VerificationEmailProps) {
  return (
    <Layout title="メールアドレスの確認 - Member Board">
      <Text className="text-2xl font-semibold text-gray-800 mb-6">
        メールアドレスの確認
      </Text>
      
      <Text className="text-gray-700 mb-4">
        こんにちは {username} さん、
      </Text>
      
      <Text className="text-gray-700 mb-4">
        Member Boardへのご登録ありがとうございます。
      </Text>
      
      <Text className="text-gray-700 mb-6">
        以下のボタンをクリックして、メールアドレスを確認してください。
      </Text>
      
      <div className="text-center mb-6">
        <Button href={verificationUrl} variant="primary">
          メールアドレスを確認
        </Button>
      </div>
      
      <Text className="text-gray-600 text-sm mb-2">
        ボタンが機能しない場合は、以下のリンクをブラウザにコピーしてください：
      </Text>
      
      <Text className="text-blue-600 text-sm break-all">
        <Link href={verificationUrl} className="text-blue-600">
          {verificationUrl}
        </Link>
      </Text>
    </Layout>
  );
}