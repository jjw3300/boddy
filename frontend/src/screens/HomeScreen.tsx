import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { COLORS, BLOCK_SHADOW, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { SearchIcon, BookIcon, MapPinIcon, WrenchIcon, DiceIcon } from '../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 로고 블럭 */}
        <View style={styles.logoArea}>
          <View style={styles.logoBlock}>
            <DiceIcon size={52} color={COLORS.textOnWood} fill={COLORS.textOnWood} />
          </View>
          <Text style={styles.appName}>Boddy</Text>
          <Text style={styles.appSub}>보드게임 버디</Text>
        </View>

        {/* 메인 추천 블럭 버튼 */}
        <View style={styles.mainBlockWrapper}>
          <TouchableOpacity
            style={styles.mainBlock}
            onPress={() => navigation.navigate('Recommendation')}
            activeOpacity={0.85}
          >
            <View style={styles.mainBlockIcon}>
              <SearchIcon size={36} color={COLORS.woodDark} fill={COLORS.woodLight} />
            </View>
            <View style={styles.mainBlockText}>
              <Text style={styles.mainBlockTitle}>게임 추천받기</Text>
              <Text style={styles.mainBlockSub}>취향에 맞는 게임을 찾아드려요</Text>
            </View>
          </TouchableOpacity>
          {/* 블럭 바닥면 */}
          <View style={styles.mainBlockBottom} />
        </View>

        {/* 빠른 접근 블럭 3개 */}
        <Text style={styles.sectionLabel}>기능 모음</Text>
        <View style={styles.quickGrid}>
          {QUICK_ITEMS.map(item => (
            <View key={item.label} style={styles.quickBlockWrapper}>
              <View style={[styles.quickBlock, { backgroundColor: item.color }]}>
                <item.Icon size={28} color={COLORS.woodDark} fill={item.iconFill} />
                <Text style={styles.quickLabel}>{item.label}</Text>
                <View style={styles.quickSoonBadge}>
                  <Text style={styles.quickSoonText}>준비 중</Text>
                </View>
              </View>
              <View style={[styles.quickBlockBottom, { backgroundColor: item.bottomColor }]} />
            </View>
          ))}
        </View>

        {/* 하단 문구 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🪵  나무처럼 따뜻하게, 게임처럼 즐겁게</Text>
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
    bottomColor: COLORS.woodMid,
    iconFill: COLORS.woodMid,
  },
  {
    label: '카페\n찾기',
    Icon: MapPinIcon,
    color: '#B5D5A0',
    bottomColor: '#6E9E55',
    iconFill: '#6E9E55',
  },
  {
    label: '도구\n모음',
    Icon: WrenchIcon,
    color: '#A8C8E8',
    bottomColor: '#4A7FB5',
    iconFill: '#4A7FB5',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 40,
  },
  logoBlock: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.wood,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...BLOCK_SHADOW,
    borderWidth: 2,
    borderColor: COLORS.woodDark,
  },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  appSub: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },

  // 메인 버튼
  mainBlockWrapper: {
    marginBottom: 32,
  },
  mainBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.lg,
    paddingVertical: 22,
    paddingHorizontal: 24,
    gap: 18,
    borderWidth: 2,
    borderColor: COLORS.woodDark,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 1,
  },
  mainBlockBottom: {
    height: 8,
    backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: COLORS.woodDark,
  },
  mainBlockIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.woodLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.woodMid,
  },
  mainBlockText: {
    flex: 1,
  },
  mainBlockTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textOnWood,
    marginBottom: 4,
  },
  mainBlockSub: {
    fontSize: 13,
    color: 'rgba(255,250,240,0.8)',
    fontWeight: '600',
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // 빠른 접근 그리드
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  quickBlockWrapper: {
    flex: 1,
  },
  quickBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    opacity: 0.75,
  },
  quickBlockBottom: {
    height: 6,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    opacity: 0.75,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  quickSoonBadge: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  quickSoonText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
