import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Tailwind,
} from '@react-email/components';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-2xl">
            <Section className="bg-white rounded-lg shadow-sm p-8">
              {/* Header */}
              <Section className="mb-8">
                <Text className="text-3xl font-bold text-blue-600 mb-2">
                  Member Board
                </Text>
                <Hr className="border-gray-200" />
              </Section>

              {/* Content */}
              <Section className="mb-8">
                {children}
              </Section>

              {/* Footer */}
              <Hr className="border-gray-200 mb-6" />
              <Section>
                <Text className="text-sm text-gray-500 mb-2">
                  Member Board Team
                </Text>
                <Text className="text-xs text-gray-400">
                  このメールに心当たりがない場合は、無視してください。
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}