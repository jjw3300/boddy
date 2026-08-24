import React from 'react';
import { View, ViewProps, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { cn } from '../lib/utils';
import { GRADIENTS, GradientName } from '../design/gradients';

let uid = 0;

interface GradientViewProps extends ViewProps {
  /** 프리셋 이름(primary/warm/soft/deep) 또는 hex 색상 배열 직접 지정 */
  gradient?: GradientName | string[];
  /** 그라데이션 각도 — 'diagonal'(↘, 기본) | 'horizontal'(→) | 'vertical'(↓) */
  direction?: 'diagonal' | 'horizontal' | 'vertical';
  className?: string;
  children?: React.ReactNode;
}

const DIRECTIONS = {
  diagonal: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
  horizontal: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
  vertical: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
};

/**
 * react-native-svg 기반 그라데이션 배경 — 네이티브 모듈 추가 없이 SVG로 구현.
 * SVG의 퍼센트 width/height는 콘텐츠 기반(intrinsic) 크기의 부모에서 측정 타이밍이
 * 어긋나 깨지는 경우가 있어(예: 텍스트로 크기가 정해지는 칩), onLayout으로 실제
 * 픽셀 크기를 측정해 Svg에 명시적 숫자로 넘긴다.
 */
export function GradientView({
  gradient = 'primary', direction = 'diagonal', className, style, children, onLayout, ...props
}: GradientViewProps) {
  const colors = Array.isArray(gradient) ? gradient : GRADIENTS[gradient];
  const id = React.useMemo(() => `grad-${uid++}`, []);
  const dir = DIRECTIONS[direction];
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(prev => (prev.width !== width || prev.height !== height ? { width, height } : prev));
    onLayout?.(e);
  };

  return (
    <View className={cn('overflow-hidden', className)} style={style} onLayout={handleLayout} {...props}>
      {size.width > 0 && size.height > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id={id} x1={dir.x1} y1={dir.y1} x2={dir.x2} y2={dir.y2}>
              {colors.map((c, i) => (
                <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={size.width} height={size.height} fill={`url(#${id})`} />
        </Svg>
      )}
      {children}
    </View>
  );
}
