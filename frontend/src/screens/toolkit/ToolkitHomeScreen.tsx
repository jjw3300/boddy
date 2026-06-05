import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS, BLOCK_SHADOW, RADIUS } from '../../design';
import { DiceIcon, CoinIcon, TrophyIcon, FingerIcon, WrenchIcon } from '../../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'ToolkitHome'>;
}

interface ToolCard {
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  bg: string;
  bottom: string;
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
    bottom: COLORS.woodMid,
    iconColor: COLORS.woodDark,
    iconFill: COLORS.wood,
    route: 'Dice',
  },
  {
    label: '동전 던지기',
    desc: '앞면? 뒷면?\n운에 맡겨요',
    Icon: CoinIcon,
    bg: '#FFF0B0',
    bottom: COLORS.paintYellow,
    iconColor: '#8A6A00',
    iconFill: '#FFE066',
    route: 'Coin',
  },
  {
    label: '점수판',
    desc: '실시간 점수를\n함께 기록해요',
    Icon: TrophyIcon,
    bg: '#B5D5A0',
    bottom: '#4E9E6B',
    iconColor: '#2E5E3A',
    iconFill: '#6EC98A',
    route: 'Scoreboard',
  },
  {
    label: '선 정하기',
    desc: '누가 먼저?\n랜덤으로 정해요',
    Icon: FingerIcon,
    bg: '#F0B0A8',
    bottom: COLORS.paintRed,
    iconColor: '#8A2A1E',
    iconFill: '#F07870',
    route: 'FirstPlayer',
  },
];

export default function ToolkitHomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <WrenchIcon size={24} color={COLORS.woodDark} fill={COLORS.woodMid} />
        <Text style={styles.title}>도구 모음</Text>
      </View>
      <Text style={styles.subtitle}>게임 중 필요한 모든 것</Text>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {TOOLS.map(tool => (
          <View key={tool.route} style={styles.cardWrapper}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: tool.bg }]}
              onPress={() => navigation.navigate(tool.route as any)}
              activeOpacity={0.82}
            >
              <View style={styles.iconArea}>
                <tool.Icon size={44} color={tool.iconColor} fill={tool.iconFill} />
              </View>
              <Text style={styles.cardLabel}>{tool.label}</Text>
              <Text style={styles.cardDesc}>{tool.desc}</Text>
            </TouchableOpacity>
            <View style={[styles.cardBottom, { backgroundColor: tool.bottom }]} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWrapper: {
    width: '47%',
    ...BLOCK_SHADOW,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    paddingBottom: 22,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 0,
    minHeight: 170,
    justifyContent: 'flex-end',
  },
  cardBottom: {
    height: 8,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  iconArea: {
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
