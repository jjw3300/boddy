import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '../lib/utils';
import { COLORS } from '../design';

export function Input({ className, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={COLORS.mutedForeground}
      className={cn(
        'h-11 rounded-lg border border-input bg-background px-3 text-[15px] text-foreground',
        className,
      )}
      {...props}
    />
  );
}
