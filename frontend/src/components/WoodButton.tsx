import React, { useRef } from 'react';
import {
  Animated, Pressable, Text, StyleSheet, StyleProp, ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, RADIUS } from '../design';

interface WoodButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  label?: string;
  bg?: string;
  bottomColor?: string;
  depth?: number;      // API 호환성 유지용, 더 이상 사용 안 함
  radius?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  testID?: string;
}

/**
 * Toss 스타일 버튼 — scale 애니메이션 + 하단 border accent로 깊이 표현
 * 기존 translateY + 그림자 띠 방식 제거
 */
export function WoodButton({
  onPress,
  children,
  label,
  bg = COLORS.wood,
  bottomColor,
  radius = RADIUS.md,
  style,
  labelStyle,
  disabled = false,
}: WoodButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 80,
      bounciness: 0,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : pressIn}
      onPressOut={disabled ? undefined : pressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          s.surface,
          {
            backgroundColor: bg,
            borderRadius: radius,
            // 하단 border accent로 두께감 표현 (어색한 그림자 띠 대신)
            borderBottomWidth: bottomColor ? 3 : 0,
            borderBottomColor: bottomColor,
          },
          style,
          disabled && s.disabled,
        ]}
      >
        {label ? (
          <Text style={[s.label, labelStyle]}>{label}</Text>
        ) : (
          children
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── 소형 텍스트 버튼 ──────────────────────────────────────────────────────────

interface SmallWoodButtonProps {
  label: string;
  onPress: () => void;
  bg?: string;
  bottomColor?: string;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

export function SmallWoodButton({
  label,
  onPress,
  bg = COLORS.wood,
  bottomColor = COLORS.woodDark,
  labelStyle,
  style,
}: SmallWoodButtonProps) {
  return (
    <WoodButton
      onPress={onPress}
      bg={bg}
      bottomColor={bottomColor}
      radius={RADIUS.sm}
      style={[s.smallSurface, style]}
      label={label}
      labelStyle={[s.smallLabel, labelStyle]}
    />
  );
}

// ─── 위험 버튼 ─────────────────────────────────────────────────────────────────

export function DangerWoodButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <WoodButton
      onPress={onPress}
      bg={COLORS.dangerBg}
      bottomColor={COLORS.danger}
      radius={RADIUS.md}
      style={[s.dangerSurface, style]}
      label={label}
      labelStyle={s.dangerLabel}
    />
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    // 부드러운 그림자 (토스 스타일)
    shadowColor: 'rgba(61,35,20,1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    // 미세한 상단 하이라이트
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textOnWood,
  },
  disabled: {
    opacity: 0.45,
  },
  smallSurface: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textOnWood,
  },
  dangerSurface: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderColor: 'rgba(192,57,43,0.2)',
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
  },
});
