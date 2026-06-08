import React, { useRef } from 'react';
import {
  Animated, Pressable, View, Text, StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, RADIUS, BLOCK_DEPTH } from '../design';

interface WoodButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  label?: string;
  bg?: string;
  bottomColor?: string;
  depth?: number;
  radius?: number;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
  testID?: string;
}

/**
 * 나무 블럭 버튼 — 눌렸을 때 바닥면이 사라지며 블럭이 내려앉는 효과
 *
 * 구조:
 *   <wrapper paddingBottom=depth>
 *     <shadow absolute-bottom />   ← 항상 바닥에 고정
 *     <surface translateY 0→depth /> ← 눌리면 내려앉음 + shadow 덮음
 *   </wrapper>
 */
export function WoodButton({
  onPress,
  children,
  label,
  bg = COLORS.wood,
  bottomColor = COLORS.woodDark,
  depth = BLOCK_DEPTH,
  radius = RADIUS.md,
  style,
  labelStyle,
  disabled = false,
}: WoodButtonProps) {
  const anim = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.timing(anim, { toValue: 1, duration: 70, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.timing(anim, { toValue: 0, duration: 110, useNativeDriver: true }).start();
  };

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, depth] });
  const shadowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : pressIn}
      onPressOut={disabled ? undefined : pressOut}
      disabled={disabled}
    >
      <View style={[s.wrapper, { paddingBottom: depth }, disabled && s.disabled]}>
        {/* 바닥면 그림자 레이어 */}
        <Animated.View
          style={[
            s.shadow,
            {
              backgroundColor: bottomColor,
              borderRadius: radius,
              opacity: shadowOpacity,
            },
          ]}
        />
        {/* 버튼 표면 */}
        <Animated.View
          style={[
            s.surface,
            { backgroundColor: bg, borderRadius: radius, transform: [{ translateY }] },
            style,
          ]}
        >
          {label ? (
            <Text style={[s.label, labelStyle]}>{label}</Text>
          ) : (
            children
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

// ─── 소형 텍스트 버튼 (헤더용) ──────────────────────────────────────────────

interface SmallWoodButtonProps {
  label: string;
  onPress: () => void;
  bg?: string;
  bottomColor?: string;
  labelStyle?: TextStyle;
  style?: ViewStyle;
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
      depth={4}
      radius={RADIUS.sm}
      style={[s.smallSurface, style]}
      label={label}
      labelStyle={[s.smallLabel, labelStyle]}
    />
  );
}

// ─── 위험 버튼 (로그아웃·탈퇴용) ────────────────────────────────────────────

export function DangerWoodButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <WoodButton
      onPress={onPress}
      bg={COLORS.dangerBg}
      bottomColor={COLORS.dangerDark}
      depth={5}
      radius={RADIUS.md}
      style={[s.dangerSurface, style]}
      label={label}
      labelStyle={s.dangerLabel}
    />
  );
}

const s = StyleSheet.create({
  wrapper: {
    // paddingBottom은 props로 설정
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
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
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
  },
});
