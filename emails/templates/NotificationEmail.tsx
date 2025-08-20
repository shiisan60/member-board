import { Text } from '@react-email/components';
import Layout from '../components/Layout';
import Button from '../components/Button';

interface NotificationEmailProps {
  username: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export default function NotificationEmail({ 
  username,
  subject,
  message,
  actionUrl,
  actionText
}: NotificationEmailProps) {
  return (
    <Layout title={subject}>
      <Text className="text-2xl font-semibold text-gray-800 mb-6">
        {subject}
      </Text>
      
      <Text className="text-gray-700 mb-4">
        こんにちは {username} さん、
      </Text>
      
      <Text className="text-gray-700 mb-6 whitespace-pre-line">
        {message}
      </Text>
      
      {actionUrl && actionText && (
        <div className="text-center mb-6">
          <Button href={actionUrl} variant="primary">
            {actionText}
          </Button>
        </div>
      )}
    </Layout>
  );
}