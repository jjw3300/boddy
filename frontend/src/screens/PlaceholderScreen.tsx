import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { BookIcon, MapPinIcon, WrenchIcon } from '../components/Icon';

interface Props {
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  iconBg: string;
  iconBgBottom: string;
  iconColor: string;
  iconFill: string;
  title: string;
  description: string;
}

function PlaceholderScreen({ Icon, iconBg, iconBgBottom, iconColor, iconFill, title, description }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        {/* 아이콘 블럭 */}
        <View style={styles.iconBlockWrapper}>
          <View style={[styles.iconBlock, { backgroundColor: iconBg }]}>
            <Icon size={48} color={iconColor} fill={iconFill} />
          </View>
          <View style={[styles.iconBlockBottom, { backgroundColor: iconBgBottom }]} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {/* 준비 중 배지 */}
        <View style={styles.badgeWrapper}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>준비 중이에요</Text>
          </View>
          <View style={styles.badgeBottom} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export function LogScreen() {
  return (
    <PlaceholderScreen
      Icon={BookIcon}
      iconBg={COLORS.woodLight}
      iconBgBottom={COLORS.woodMid}
      iconColor={COLORS.woodDark}
      iconFill={COLORS.woodMid}
      title="플레이 기록"
      description={'그날의 게임을\n다이어리처럼 기록해요'}
    />
  );
}

export function CafeScreen() {
  return (
    <PlaceholderScreen
      Icon={MapPinIcon}
      iconBg="#B5D5A0"
      iconBgBottom="#4E9E6B"
      iconColor="#2E6E47"
      iconFill="#6E9E55"
      title="카페 찾기"
      description={'내 근처 보드게임 카페를\n지도에서 찾아요'}
    />
  );
}

export function ToolkitScreen() {
  return (
    <PlaceholderScreen
      Icon={WrenchIcon}
      iconBg="#A8C8E8"
      iconBgBottom={COLORS.paintBlue}
      iconColor="#2D5E8A"
      iconFill="#4A7FB5"
      title="도구 모음"
      description={'주사위, 점수판, 동전 던지기\n게임 중 필요한 모든 것'}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: 40,
  },
  iconBlockWrapper: {
    marginBottom: 28,
    ...BLOCK_SHADOW_SM,
  },
  iconBlock: {
    width: 110,
    height: 110,
    borderRadius: RADIUS.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 0,
  },
  iconBlockBottom: {
    height: 10,
    width: 110,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  badgeWrapper: {
    ...BLOCK_SHADOW_SM,
  },
  badge: {
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderColor: COLORS.woodMid,
    borderBottomWidth: 0,
  },
  badgeBottom: {
    height: 5,
    backgroundColor: COLORS.woodMid,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.woodDark,
  },
});
