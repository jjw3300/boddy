import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps, StyleSheet } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { GradientView } from './GradientView';
import { GradientName } from '../design/gradients';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg active:opacity-80',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary border border-border',
        outline: 'bg-background border border-border',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive',
        gradient: 'bg-transparent',
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-9 px-3.5',
        lg: 'h-14 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const labelVariants = cva('text-[15px] font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground',
      gradient: 'text-white',
    },
    size: {
      default: '',
      sm: 'text-[13px]',
      lg: 'text-base',
      icon: '',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  loading?: boolean;
  className?: string;
  labelClassName?: string;
  /** variant="gradient"일 때 사용할 그라데이션 프리셋 또는 hex 배열 (기본: primary) */
  gradient?: GradientName | string[];
  children?: React.ReactNode;
}

export function Button({
  variant, size, label, loading, disabled, gradient,
  className, labelClassName, children, ...props
}: ButtonProps) {
  const isGradient = variant === 'gradient';
  return (
    <Pressable
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size }),
        isGradient && 'overflow-hidden',
        (disabled || loading) && 'opacity-40',
        className,
      )}
      {...props}
    >
      {isGradient && (
        <GradientView gradient={gradient ?? 'primary'} style={StyleSheet.absoluteFill} />
      )}
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'default' ? '#1C1917' : isGradient ? '#FFFFFF' : '#78716C'} />
      ) : label ? (
        <Text className={cn(labelVariants({ variant, size }), labelClassName)}>{label}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
