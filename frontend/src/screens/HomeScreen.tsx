import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { COLORS, FONT, SPACING, BLOCK_SHADOW, BLOCK_SHADOW_SM, BLOCK_SHADOW_LG, RADIUS } from '../design';
import { SearchIcon, BookIcon, MapPinIcon, WrenchIcon, DiceIcon } from '../components/Icon';
import { WoodButton } from '../components/WoodButton';

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* 로고 블럭 */}
        <View style={s.logoArea}>
          <View style={s.logoWrapper}>
            <View style={s.logoBlock}>
              <DiceIcon size={52} color={COLORS.woodHighlight} fill={COLORS.woodHighlight} />
            </View>
            <View style={s.logoBlockShadow} />
          </View>
          <Text style={s.appName}>Boddy</Text>
          <Text style={s.appSub}>보드게임 버디</Text>
        </View>

        {/* 메인 추천 블럭 버튼 */}
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
              <Text style={s.mainBtnTitle}>게임 추천받기</Text>
              <Text style={s.mainBtnSub}>취향에 맞는 게임을 찾아드려요</Text>
            </View>
          </View>
        </WoodButton>

        {/* 빠른 접근 */}
        <Text style={s.sectionLabel}>기능 모음</Text>
        <View style={s.quickGrid}>
          {QUICK_ITEMS.map(item => (
            <View key={item.label} style={[s.quickWrapper, BLOCK_SHADOW_SM]}>
              <View style={[s.quickBlock, { backgroundColor: item.color }]}>
                <item.Icon size={26} color={item.iconColor} fill={item.iconFill} />
                <Text style={s.quickLabel}>{item.label}</Text>
                <View style={s.soonBadge}>
                  <Text style={s.soonText}>준비 중</Text>
                </View>
              </View>
              <View style={[s.quickShadow, { backgroundColor: item.shadowColor }]} />
            </View>
          ))}
        </View>

        {/* 하단 문구 */}
        <View style={s.footer}>
          <View style={s.footerDivider} />
          <Text style={s.footerText}>🪵  나무처럼 따뜻하게, 게임처럼 즐겁게</Text>
          <View style={s.footerDivider} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const QUICK_ITEMS = [
  {
    label: '플레이\n기록',
    Icon: BookIcon,
    color: COLORS.woodLight,
    shadowColor: COLORS.woodMid,
    iconColor: COLORS.woodDark,
    iconFill: COLORS.wood,
  },
  {
    label: '카페\n찾기',
    Icon: MapPinIcon,
    color: '#B5D5A0',
    shadowColor: '#5A8A40',
    iconColor: '#2E5A1E',
    iconFill: '#7AB060',
  },
  {
    label: '도구\n모음',
    Icon: WrenchIcon,
    color: '#A8C8E8',
    shadowColor: '#2A5080',
    iconColor: '#1A4070',
    iconFill: '#6090C0',
  },
];

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

  // 로고
  logoArea: { alignItems: 'center', marginTop: SPACING.xxl, marginBottom: SPACING.xl },
  logoWrapper: { marginBottom: SPACING.md, ...BLOCK_SHADOW_LG },
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

  // 메인 버튼
  mainBtnSurface: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 2,
    borderColor: COLORS.woodMid,
    marginBottom: SPACING.xl,
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

  // 섹션 라벨
  sectionLabel: {
    ...FONT.label,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm + 2,
  },

  // 빠른 접근 그리드
  quickGrid: { flexDirection: 'row', gap: SPACING.sm + 2, marginBottom: SPACING.xl },
  quickWrapper: { flex: 1 },
  quickBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    borderBottomWidth: 0,
    minHeight: 120,
  },
  quickShadow: {
    height: 7,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 17,
  },
  soonBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  soonText: { fontSize: 10, fontWeight: '700', color: COLORS.textPrimary },

  // 푸터
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  footerDivider: { flex: 1, height: 1, backgroundColor: COLORS.woodLight },
  footerText: { ...FONT.caption, color: COLORS.textSecondary, fontSize: 12 },
});
