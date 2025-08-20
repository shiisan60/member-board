"use client"

import React from 'react';
import { Box, LinearProgress, Typography, Chip } from '@mui/material';
import { checkPasswordStrength } from '@/lib/validators';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showDetails = true 
}) => {
  const strength = checkPasswordStrength(password);

  const getColor = () => {
    switch (strength.level) {
      case 'weak': return 'error';
      case 'fair': return 'warning';
      case 'good': return 'info';
      case 'strong': return 'success';
      case 'very-strong': return 'success';
      default: return 'error';
    }
  };

  const getLevelText = () => {
    switch (strength.level) {
      case 'weak': return '弱い';
      case 'fair': return '普通';
      case 'good': return '良い';
      case 'strong': return '強い';
      case 'very-strong': return 'とても強い';
      default: return '';
    }
  };

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ mr: 1 }}>
          パスワード強度:
        </Typography>
        <Chip 
          label={getLevelText()} 
          color={getColor() as "success" | "error" | "warning" | "info"}
          size="small"
        />
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={(strength.score / 4) * 100}
        color={getColor() as "success" | "error" | "warning" | "info"}
        sx={{ height: 6, borderRadius: 3 }}
      />

      {showDetails && strength.feedback.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {strength.feedback.map((feedback, index) => (
            <Typography
              key={index}
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', fontSize: '0.75rem' }}
            >
              • {feedback}
            </Typography>
          ))}
        </Box>
      )}

      {showDetails && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            要件:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <RequirementChip
              label="8文字以上"
              met={password.length >= 8}
            />
            <RequirementChip
              label="大文字"
              met={/[A-Z]/.test(password)}
            />
            <RequirementChip
              label="小文字"
              met={/[a-z]/.test(password)}
            />
            <RequirementChip
              label="数字"
              met={/\d/.test(password)}
            />
            <RequirementChip
              label="特殊文字"
              met={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
              optional
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

interface RequirementChipProps {
  label: string;
  met: boolean;
  optional?: boolean;
}

const RequirementChip: React.FC<RequirementChipProps> = ({ label, met, optional = false }) => {
  return (
    <Chip
      icon={met ? <CheckCircleIcon /> : <CancelIcon />}
      label={optional ? `${label} (推奨)` : label}
      size="small"
      variant={met ? 'filled' : 'outlined'}
      color={met ? 'success' : 'default'}
      sx={{ 
        fontSize: '0.7rem',
        height: 24,
        '& .MuiChip-icon': {
          fontSize: '0.8rem'
        }
      }}
    />
  );
};

export default PasswordStrengthIndicator;
export { PasswordStrengthIndicator };