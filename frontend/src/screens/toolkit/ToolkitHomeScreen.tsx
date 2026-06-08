import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS, FONT, SPACING, BLOCK_SHADOW, RADIUS } from '../../design';
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
    label: '주사위 굴리기',
    desc: '1~6면체 주사위를\n마음껏 굴려요',
    Icon: DiceIcon,
    bg: COLORS.woodLight,
    bottomColor: COLORS.woodDark,
    iconColor: COLORS.woodDark,
    iconFill: COLORS.wood,
    route: 'Dice',
  },
  {
    label: '동전 던지기',
    desc: '앞면? 뒷면?\n운에 맡겨요',
    Icon: CoinIcon,
    bg: '#FFF0B0',
    bottomColor: '#9A7A00',
    iconColor: '#7A5A00',
    iconFill: '#FFE066',
    route: 'Coin',
  },
  {
    label: '점수판',
    desc: '실시간 점수를\n함께 기록해요',
    Icon: TrophyIcon,
    bg: '#B5D5A0',
    bottomColor: '#2E6040',
    iconColor: '#1E4828',
    iconFill: '#6EC98A',
    route: 'Scoreboard',
  },
  {
    label: '선 정하기',
    desc: '누가 먼저?\n랜덤으로 정해요',
    Icon: FingerIcon,
    bg: '#F0B0A8',
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
        <WrenchIcon size={24} color={COLORS.woodDark} fill={COLORS.woodMid} />
        <Text style={s.title}>도구 모음</Text>
      </View>
      <Text style={s.subtitle}>게임 중 필요한 모든 것</Text>

      <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
        {TOOLS.map(tool => (
          <WoodButton
            key={tool.route}
            onPress={() => navigation.navigate(tool.route as any)}
            bg={tool.bg}
            bottomColor={tool.bottomColor}
            depth={7}
            radius={RADIUS.lg}
            style={s.cardSurface}
          >
            <View style={s.cardInner}>
              <View style={s.iconArea}>
                <tool.Icon size={44} color={tool.iconColor} fill={tool.iconFill} />
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
  cardSurface: {
    width: '47%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    // BLOCK_SHADOW는 WoodButton 외부에서 적용할 수 없으므로 elevation만
    elevation: 4,
    shadowColor: '#3D1A08',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  cardInner: {
    padding: SPACING.md,
    paddingBottom: SPACING.md + 4,
    minHeight: 170,
    justifyContent: 'flex-end',
  },
  iconArea: { marginBottom: SPACING.sm + 2 },
  cardLabel: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    opacity: 0.8,
  },
});
