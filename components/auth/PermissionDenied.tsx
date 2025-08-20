'use client';

import { Alert, AlertTitle, Box, Button, Paper } from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface PermissionDeniedProps {
  message?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function PermissionDenied({ 
  message = 'この操作を実行する権限がありません',
  showBackButton = true,
  backUrl
}: PermissionDeniedProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock fontSize="small" />
          アクセス拒否
        </AlertTitle>
        {message}
      </Alert>

      {showBackButton && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            戻る
          </Button>
        </Box>
      )}
    </Paper>
  );
}