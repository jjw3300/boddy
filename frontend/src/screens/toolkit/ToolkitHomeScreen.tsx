import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { DiceIcon, CoinIcon, TrophyIcon, FingerIcon, WrenchIcon, ChevronRightIcon } from '../../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'ToolkitHome'>;
}

interface ToolCard {
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  accentFg: string;
  accentBgClass: string;
  route: keyof ToolkitStackParamList;
}

const TOOLS: ToolCard[] = [
  { label: '주사위', desc: '1~6면체 다이스 굴리기', Icon: DiceIcon, accentFg: '#2563EB', accentBgClass: 'bg-blue-50', route: 'Dice' },
  { label: '동전 던지기', desc: '앞면 · 뒷면 랜덤 선택', Icon: CoinIcon, accentFg: '#D97706', accentBgClass: 'bg-amber-50', route: 'Coin' },
  { label: '점수판', desc: '플레이어별 실시간 기록', Icon: TrophyIcon, accentFg: '#16A34A', accentBgClass: 'bg-green-50', route: 'Scoreboard' },
  { label: '선 정하기', desc: '첫 번째 플레이어 뽑기', Icon: FingerIcon, accentFg: '#7C3AED', accentBgClass: 'bg-violet-50', route: 'FirstPlayer' },
];

export default function ToolkitHomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* 헤더 */}
      <View className="flex-row items-center gap-2 px-5 pb-1 pt-5">
        <WrenchIcon size={22} color={COLORS.foreground} fill="transparent" />
        <Text className="text-2xl font-bold tracking-tight text-foreground">도구 모음</Text>
      </View>
      <Text className="mb-5 px-5 text-[13px] text-muted-foreground">게임 중 필요한 모든 것</Text>

      <ScrollView
        contentContainerClassName="gap-2.5 px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {TOOLS.map(tool => (
          <TouchableOpacity
            key={tool.route}
            onPress={() => navigation.navigate(tool.route as any)}
            activeOpacity={0.6}
            className="flex-row items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5"
          >
            <View className={`h-12 w-12 items-center justify-center rounded-full ${tool.accentBgClass}`}>
              <tool.Icon size={22} color={tool.accentFg} fill="transparent" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold leading-5 text-foreground">{tool.label}</Text>
              <Text className="mt-0.5 text-xs font-medium text-muted-foreground">{tool.desc}</Text>
            </View>
            <ChevronRightIcon size={18} color={COLORS.mutedForeground} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
