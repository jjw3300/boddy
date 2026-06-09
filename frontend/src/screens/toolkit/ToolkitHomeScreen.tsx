import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS, FONT, SPACING, RADIUS } from '../../design';
import { DiceIcon, CoinIcon, TrophyIcon, FingerIcon, WrenchIcon } from '../../components/Icon';
import { WoodButton } from '../../components/WoodButton';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'ToolkitHome'>;
}

interface ToolCard {
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  bg: string;
  bottomColor: string;
  iconColor: string;
  iconFill: string;
  route: keyof ToolkitStackParamList;
}

const TOOLS: ToolCard[] = [
  {
    label: '주사위',
    desc: '1~6면체',
    Icon: DiceIcon,
    bg: COLORS.woodLight,
    bottomColor: COLORS.woodDark,
    iconColor: COLORS.woodDark,
    iconFill: COLORS.wood,
    route: 'Dice',
  },
  {
    label: '동전 던지기',
    desc: '앞면 / 뒷면',
    Icon: CoinIcon,
    bg: '#FFF0B0',
    bottomColor: '#9A7A00',
    iconColor: '#7A5A00',
    iconFill: '#FFE066',
    route: 'Coin',
  },
  {
    label: '점수판',
    desc: '실시간 기록',
    Icon: TrophyIcon,
    bg: '#C8E8B8',
    bottomColor: '#2E6040',
    iconColor: '#1E4828',
    iconFill: '#6EC98A',
    route: 'Scoreboard',
  },
  {
    label: '선 정하기',
    desc: '랜덤 순서',
    Icon: FingerIcon,
    bg: '#F0C8C0',
    bottomColor: '#8A2820',
    iconColor: '#6A1A10',
    iconFill: '#F07870',
    route: 'FirstPlayer',
  },
];

export default function ToolkitHomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.container}>
      {/* 헤더 */}
      <View style={s.header}>
        <WrenchIcon size={22} color={COLORS.woodDark} fill={COLORS.woodMid} />
        <Text style={s.title}>도구 모음</Text>
      </View>
      <Text style={s.subtitle}>게임 중 필요한 모든 것</Text>

      <ScrollView
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
      >
        {TOOLS.map(tool => (
          <WoodButton
            key={tool.route}
            onPress={() => navigation.navigate(tool.route as any)}
            bg={tool.bg}
            bottomColor={tool.bottomColor}
            radius={RADIUS.lg}
            style={s.card}
          >
            <View style={s.cardInner}>
              <View style={[s.iconCircle, { backgroundColor: `${tool.iconFill}60` }]}>
                <tool.Icon size={32} color={tool.iconColor} fill={tool.iconFill} />
              </View>
              <Text style={[s.cardLabel, { color: tool.iconColor }]}>{tool.label}</Text>
              <Text style={[s.cardDesc, { color: tool.iconColor }]}>{tool.desc}</Text>
            </View>
          </WoodButton>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  title: { ...FONT.h1, fontSize: 24 },
  subtitle: {
    ...FONT.caption,
    fontSize: 13,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  grid: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  card: {
    width: '47%',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cardInner: {
    padding: SPACING.md,
    paddingTop: SPACING.md + 4,
    paddingBottom: SPACING.md + 2,
    gap: SPACING.xs,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
});
