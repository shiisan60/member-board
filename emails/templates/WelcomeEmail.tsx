import { Text } from '@react-email/components';
import Layout from '../components/Layout';
import Button from '../components/Button';

interface WelcomeEmailProps {
  username: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({ 
  username, 
  dashboardUrl 
}: WelcomeEmailProps) {
  return (
    <Layout title="ようこそ Member Board へ！">
      <Text className="text-2xl font-semibold text-gray-800 mb-6">
        ようこそ Member Board へ！
      </Text>
      
      <Text className="text-gray-700 mb-4">
        {username} さん、ようこそ！
      </Text>
      
      <Text className="text-gray-700 mb-4">
        Member Boardへのご登録が完了しました。🎉
      </Text>
      
      <Text className="text-gray-700 mb-6">
        Member Boardでは以下のことができます：
      </Text>
      
      <ul className="text-gray-700 mb-6 pl-4">
        <li className="mb-2">• 投稿の作成と共有</li>
        <li className="mb-2">• 他のメンバーとの交流</li>
        <li className="mb-2">• プロフィールのカスタマイズ</li>
        <li className="mb-2">• コミュニティへの参加</li>
      </ul>
      
      <Text className="text-gray-700 mb-6">
        早速ダッシュボードにアクセスして、Member Boardの機能を体験してみてください！
      </Text>
      
      <div className="text-center mb-6">
        <Button href={dashboardUrl} variant="primary">
          ダッシュボードに移動
        </Button>
      </div>
      
      <Text className="text-gray-600 text-sm">
        ご質問やサポートが必要な場合は、いつでもお気軽にお問い合わせください。
      </Text>
    </Layout>
  );
}