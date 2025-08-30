import { Suspense } from 'react';
import EmailVerifiedContent from './EmailVerifiedContent';

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <EmailVerifiedContent />
    </Suspense>
  );
}