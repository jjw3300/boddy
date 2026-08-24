import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { DiceIcon, CoinIcon, FingerIcon, WrenchIcon, ChevronRightIcon } from '../../components/Icon';
import { GradientView } from '../../components/GradientView';
import { GradientName } from '../../design/gradients';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'ToolkitHome'>;
}

interface ToolCard {
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  gradient: GradientName;
  route: keyof ToolkitStackParamList;
}

const TOOLS: ToolCard[] = [
  { label: '주사위', desc: '1~6면체 다이스 굴리기 · 흔들어서 굴리기', Icon: DiceIcon, gradient: 'primary', route: 'Dice' },
  { label: '동전 던지기', desc: '앞면 · 뒷면 랜덤 선택 · 흔들어서 던지기', Icon: CoinIcon, gradient: 'warm', route: 'Coin' },
  { label: '선 정하기', desc: '손가락 버티기 대결로 한 명 뽑기', Icon: FingerIcon, gradient: 'deep', route: 'FirstPlayer' },
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
            className="flex-row items-center gap-5 rounded-2xl border border-border bg-card px-6 py-5"
          >
            <GradientView gradient={tool.gradient} className="h-[72px] w-[72px] items-center justify-center rounded-full">
              <tool.Icon size={33} color="#FFFFFF" fill="transparent" />
            </GradientView>
            <View className="flex-1">
              <Text className="text-[22px] font-bold leading-7 text-foreground">{tool.label}</Text>
              <Text className="mt-1 text-[18px] font-medium text-muted-foreground">{tool.desc}</Text>
            </View>
            <ChevronRightIcon size={27} color={COLORS.mutedForeground} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
