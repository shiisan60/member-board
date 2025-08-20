import { Text, Link } from '@react-email/components';
import Layout from '../components/Layout';
import Button from '../components/Button';

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

export default function PasswordResetEmail({ 
  username, 
  resetUrl 
}: PasswordResetEmailProps) {
  return (
    <Layout title="パスワードリセット - Member Board">
      <Text className="text-2xl font-semibold text-gray-800 mb-6">
        パスワードリセット
      </Text>
      
      <Text className="text-gray-700 mb-4">
        こんにちは {username} さん、
      </Text>
      
      <Text className="text-gray-700 mb-4">
        パスワードリセットのご要求を受け付けました。
      </Text>
      
      <Text className="text-gray-700 mb-6">
        以下のボタンをクリックして、新しいパスワードを設定してください。
      </Text>
      
      <div className="text-center mb-6">
        <Button href={resetUrl} variant="danger">
          パスワードをリセット
        </Button>
      </div>
      
      <Text className="text-gray-600 text-sm mb-2">
        ボタンが機能しない場合は、以下のリンクをブラウザにコピーしてください：
      </Text>
      
      <Text className="text-blue-600 text-sm break-all mb-4">
        <Link href={resetUrl} className="text-blue-600">
          {resetUrl}
        </Link>
      </Text>
      
      <Text className="text-orange-600 font-medium text-sm">
        <strong>注意：</strong> このリンクは1時間で期限切れになります。
      </Text>
    </Layout>
  );
}