import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS, FONT, SPACING, RADIUS, BLOCK_SHADOW_SM } from '../../design';
import { ArrowLeftIcon, DiceIcon } from '../../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'AppInfo'>;
}

export default function AppInfoScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.container}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={COLORS.woodDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>앱 정보</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* 앱 로고 + 이름 */}
        <View style={s.logoArea}>
          <View style={s.logoWrapper}>
            <View style={s.logoBlock}>
              <DiceIcon size={44} color={COLORS.woodHighlight} fill={COLORS.woodHighlight} />
            </View>
            <View style={s.logoShadow} />
          </View>
          <Text style={s.appName}>Boddy</Text>
          <Text style={s.appSub}>보드게임 버디</Text>
          <View style={s.versionBadge}>
            <Text style={s.versionText}>v1.0.0</Text>
          </View>
        </View>

        {/* 정보 카드 */}
        <InfoCard>
          <InfoRow label="버전" value="1.0.0" />
          <Divider />
          <InfoRow label="개발자" value="Boddy Team" />
          <Divider />
          <InfoRow label="보드게임 데이터" value="BoardGameGeek API" />
        </InfoCard>

        <SectionLabel text="오픈소스 라이선스" />
        <InfoCard>
          <InfoRow label="React Native" value="0.85.3" />
          <Divider />
          <InfoRow label="React Navigation" value="7.x" />
          <Divider />
          <InfoRow label="BGG XML API" value="v2" />
        </InfoCard>

        <SectionLabel text="문의 및 피드백" />
        <InfoCard>
          <TouchableInfoRow
            label="이메일 문의"
            value="support@boddy.app"
            onPress={() => Linking.openURL('mailto:support@boddy.app')}
          />
        </InfoCard>

        {/* 저작권 */}
        <Text style={s.copyright}>
          © 2026 Boddy. All rights reserved.{'\n'}
          나무처럼 따뜻하게, 게임처럼 즐겁게 🪵
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 서브 컴포넌트 ───────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return <Text style={s.sectionLabel}>{text}</Text>;
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.cardWrapper}>
      <View style={s.card}>{children}</View>
      <View style={s.cardShadow} />
    </View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

function TouchableInfoRow({
  label, value, onPress,
}: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, s.rowValueLink]}>{value}</Text>
    </TouchableOpacity>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.woodLight,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { ...FONT.h3, color: COLORS.textPrimary },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  logoArea: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  logoWrapper: { ...BLOCK_SHADOW_SM, marginBottom: SPACING.sm },
  logoBlock: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.wood,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.woodMid,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  logoShadow: {
    height: 7,
    backgroundColor: COLORS.woodDeep,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    marginHorizontal: 3,
  },
  appName: { ...FONT.h1, fontSize: 30, letterSpacing: 2 },
  appSub: { ...FONT.caption, letterSpacing: 1 },
  versionBadge: {
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginTop: SPACING.xs,
  },
  versionText: { ...FONT.label, color: COLORS.woodDark },

  sectionLabel: {
    ...FONT.label,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  cardWrapper: { ...BLOCK_SHADOW_SM, marginBottom: SPACING.xs },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  cardShadow: {
    height: 5,
    backgroundColor: COLORS.woodLight,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
  },
  rowLabel: { ...FONT.bodyB, color: COLORS.textPrimary },
  rowValue: { ...FONT.body, color: COLORS.textSecondary },
  rowValueLink: { color: COLORS.paintBlue, textDecorationLine: 'underline' },
  divider: {
    height: 1,
    backgroundColor: COLORS.bgDeep,
    marginHorizontal: SPACING.md,
  },
  copyright: {
    ...FONT.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 20,
  },
});
