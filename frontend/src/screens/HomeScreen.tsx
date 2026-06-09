import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { COLORS, FONT, SPACING, BLOCK_SHADOW_SM, BLOCK_SHADOW_LG, RADIUS } from '../design';
import { SearchIcon, BookIcon, MapPinIcon, WrenchIcon, DiceIcon } from '../components/Icon';
import { WoodButton } from '../components/WoodButton';

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: Props) {
  const goTab = (tab: string) => navigation.getParent()?.navigate(tab as never);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* 로고 */}
        <View style={s.logoArea}>
          <View style={[s.logoWrapper, BLOCK_SHADOW_LG]}>
            <View style={s.logoBlock}>
              <DiceIcon size={52} color={COLORS.woodHighlight} fill={COLORS.woodHighlight} />
            </View>
            <View style={s.logoBlockShadow} />
          </View>
          <Text style={s.appName}>Boddy</Text>
          <Text style={s.appSub}>보드게임 버디</Text>
        </View>

        {/* 메인 CTA */}
        <WoodButton
          onPress={() => navigation.navigate('Recommendation')}
          bg={COLORS.wood}
          bottomColor={COLORS.woodDeep}
          depth={8}
          radius={RADIUS.lg}
          style={s.mainBtnSurface}
        >
          <View style={s.mainBtnInner}>
            <View style={s.mainBtnIcon}>
              <SearchIcon size={36} color={COLORS.woodDark} fill={COLORS.woodLight} />
            </View>
            <View style={s.mainBtnText}>
              <Text style={s.mainBtnTitle}>오늘 게임 추천받기</Text>
              <Text style={s.mainBtnSub}>인원수 · 시간 · 취향으로 찾아봐요</Text>
            </View>
          </View>
        </WoodButton>

        {/* 바로가기 */}
        <View style={s.shortcutRow}>
          <ShortcutCard
            label="플레이 기록"
            desc="내 게임 이력 보기"
            Icon={BookIcon}
            bg={COLORS.woodLight}
            shadowColor={COLORS.woodMid}
            iconColor={COLORS.woodDark}
            iconFill={COLORS.wood}
            onPress={() => goTab('LogTab')}
          />
          <ShortcutCard
            label="게임 도구"
            desc="주사위 · 점수판"
            Icon={WrenchIcon}
            bg="#A8C8E8"
            shadowColor="#2A5080"
            iconColor="#1A4070"
            iconFill="#6090C0"
            onPress={() => goTab('ToolkitTab')}
          />
        </View>

        {/* 카페 출시 예정 */}
        <View style={s.comingSoon}>
          <MapPinIcon size={14} color={COLORS.textMuted} />
          <Text style={s.comingSoonText}>보드게임 카페 찾기 — 준비 중이에요</Text>
        </View>

        <View style={s.footer}>
          <View style={s.divider} />
          <Text style={s.footerText}>나무처럼 따뜻하게, 게임처럼 즐겁게</Text>
          <View style={s.divider} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ShortcutCard ─────────────────────────────────────────────────────────────

interface CardProps {
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  bg: string;
  shadowColor: string;
  iconColor: string;
  iconFill: string;
  onPress: () => void;
}

function ShortcutCard({ label, desc, Icon, bg, shadowColor, iconColor, iconFill, onPress }: CardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[s.cardOuter, BLOCK_SHADOW_SM]}
      onPress={onPress}
    >
      <View style={[s.cardBlock, { backgroundColor: bg }]}>
        <Icon size={30} color={iconColor} fill={iconFill} />
        <Text style={[s.cardLabel, { color: iconColor }]}>{label}</Text>
        <Text style={[s.cardDesc, { color: iconColor, opacity: 0.7 }]}>{desc}</Text>
      </View>
      <View style={[s.cardShadow, { backgroundColor: shadowColor }]} />
    </TouchableOpacity>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

  logoArea: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  logoWrapper: { marginBottom: SPACING.md },
  logoBlock: {
    width: 104,
    height: 104,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.wood,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.woodMid,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  logoBlockShadow: {
    height: 10,
    backgroundColor: COLORS.woodDeep,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: COLORS.woodDeep,
    marginHorizontal: 5,
  },
  appName: { ...FONT.display, color: COLORS.textPrimary, letterSpacing: 3 },
  appSub: { ...FONT.caption, fontSize: 13, letterSpacing: 2, marginTop: SPACING.xs },

  mainBtnSurface: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 2,
    borderColor: COLORS.woodMid,
    marginBottom: SPACING.lg,
  },
  mainBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.md + 4,
  },
  mainBtnIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.woodLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.woodMid,
  },
  mainBtnText: { flex: 1 },
  mainBtnTitle: { ...FONT.h2, color: COLORS.textOnWood, marginBottom: SPACING.xs },
  mainBtnSub: { fontSize: 13, color: 'rgba(255,250,240,0.8)', fontWeight: '600' },

  shortcutRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardOuter: { flex: 1 },
  cardBlock: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.07)',
    borderBottomWidth: 0,
    gap: SPACING.xs,
    minHeight: 112,
    justifyContent: 'flex-end',
  },
  cardShadow: {
    height: 6,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  cardLabel: { fontSize: 14, fontWeight: '800' },
  cardDesc: { fontSize: 11, fontWeight: '600' },

  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.bgDeep,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  comingSoonText: { ...FONT.caption, color: COLORS.textMuted, fontSize: 12 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.woodLight },
  footerText: { ...FONT.caption, color: COLORS.textSecondary, fontSize: 12 },
});
