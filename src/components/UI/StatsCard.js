import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendValue,
  progress,
  variant = 'default',
  onClick,
}) {
  const getColorValue = (colorName) => {
    const colors = {
      primary: '#22c55e',
      secondary: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
    };
    return colors[colorName] || colors.primary;
  };

  const cardVariants = {
    default: {
      background: '#ffffff',
      color: '#1e293b',
    },
    gradient: {
      background: `linear-gradient(135deg, ${getColorValue(color)} 0%, ${getColorValue(color)}dd 100%)`,
      color: '#ffffff',
    },
    outlined: {
      background: '#ffffff',
      color: '#1e293b',
      border: `2px solid ${getColorValue(color)}`,
    },
  };

  const cardStyle = cardVariants[variant];

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        background: cardStyle.background,
        color: cardStyle.color,
        border: cardStyle.border,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header with Icon */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                variant="body2"
                sx={{
                  opacity: variant === 'gradient' ? 0.9 : 0.7,
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  lineHeight: 1.2,
                  color: variant === 'gradient' ? 'inherit' : getColorValue(color),
                }}
              >
                {value}
              </Typography>
            </Box>
            
            {icon && (
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: variant === 'gradient' 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : `${getColorValue(color)}15`,
                  color: variant === 'gradient' ? 'inherit' : getColorValue(color),
                }}
              >
                {icon}
              </Avatar>
            )}
          </Stack>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                opacity: variant === 'gradient' ? 0.8 : 0.6,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Progress Bar */}
          {progress !== undefined && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: variant === 'gradient' 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : `${getColorValue(color)}20`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: variant === 'gradient' ? 'rgba(255, 255, 255, 0.8)' : getColorValue(color),
                    borderRadius: 3,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: 'block',
                  opacity: variant === 'gradient' ? 0.8 : 0.6,
                }}
              >
                {progress}% Complete
              </Typography>
            </Box>
          )}

          {/* Trend Indicator */}
          {trend && trendValue && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={trendValue}
                size="small"
                sx={{
                  bgcolor: trend === 'up' 
                    ? variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : '#dcfce7'
                    : variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : '#fef2f2',
                  color: trend === 'up'
                    ? variant === 'gradient' ? 'inherit' : '#166534'
                    : variant === 'gradient' ? 'inherit' : '#dc2626',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  opacity: variant === 'gradient' ? 0.8 : 0.6,
                }}
              >
                vs last month
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default StatsCard;