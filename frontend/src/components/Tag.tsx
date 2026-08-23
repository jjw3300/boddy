import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '../lib/utils';

export type TagColor = 'info' | 'success' | 'warning' | 'danger' | 'violet' | 'teal' | 'neutral';

const TAG_STYLE: Record<TagColor, { bg: string; text: string }> = {
  info:    { bg: 'bg-blue-50',   text: 'text-blue-700' },
  success: { bg: 'bg-green-50',  text: 'text-green-700' },
  warning: { bg: 'bg-amber-50',  text: 'text-amber-700' },
  danger:  { bg: 'bg-red-50',    text: 'text-red-700' },
  violet:  { bg: 'bg-violet-50', text: 'text-violet-700' },
  teal:    { bg: 'bg-teal-50',   text: 'text-teal-700' },
  neutral: { bg: 'bg-stone-100', text: 'text-stone-600' },
};

interface TagProps extends ViewProps {
  label: string;
  color?: TagColor;
}

/** 게임 유형·난이도·결과 등 카테고리 배지 — 옅은 틴트 배경 + 진한 텍스트 */
export function Tag({ label, color = 'neutral', className, ...props }: TagProps) {
  const c = TAG_STYLE[color];
  return (
    <View className={cn('rounded-md px-2 py-0.5', c.bg, className)} {...props}>
      <Text className={cn('text-[11px] font-semibold', c.text)}>{label}</Text>
    </View>
  );
}
