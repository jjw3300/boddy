import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { COLORS } from '../design';
import { SearchIcon, BookIcon, MapPinIcon, WrenchIcon, DiceIcon } from '../components/Icon';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: Props) {
  const goTab = (tab: string) => navigation.getParent()?.navigate(tab as never);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>

        {/* 로고 */}
        <View className="mt-10 mb-8 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <DiceIcon size={32} color={COLORS.primaryForeground} fill="transparent" />
          </View>
          <Text className="text-2xl font-bold tracking-tight text-foreground">Boddy</Text>
          <Text className="mt-1 text-sm text-muted-foreground">보드게임 버디</Text>
        </View>

        {/* 메인 CTA */}
        <Button
          onPress={() => navigation.navigate('Recommendation')}
          className="mb-5 h-auto items-stretch justify-start rounded-2xl px-6 py-6"
        >
          <View className="flex-1 flex-row items-center gap-6">
            <View className="h-[72px] w-[72px] items-center justify-center rounded-xl bg-black/10">
              <SearchIcon size={36} color={COLORS.primaryForeground} fill="transparent" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-2xl font-bold text-primary-foreground">오늘 게임 추천받기</Text>
              <Text className="text-[15px] font-medium text-[#3D3419]">인원수 · 시간 · 취향으로 찾아봐요</Text>
            </View>
          </View>
        </Button>

        {/* 바로가기 */}
        <View className="mb-3 flex-row gap-[18px]">
          <ShortcutCard
            label="플레이 기록"
            desc="내 게임 이력 보기"
            Icon={BookIcon}
            onPress={() => goTab('LogTab')}
          />
          <ShortcutCard
            label="게임 도구"
            desc="주사위 · 점수판"
            Icon={WrenchIcon}
            onPress={() => goTab('ToolkitTab')}
          />
        </View>

        {/* 카페 찾기 */}
        <TouchableOpacity
          className="mb-8 mt-3 flex-row items-center gap-3 rounded-lg bg-muted px-6 py-4"
          onPress={() => goTab('CafeTab')}
          activeOpacity={0.7}
        >
          <MapPinIcon size={21} color={COLORS.mutedForeground} />
          <Text className="text-[18px] font-semibold text-muted-foreground">내 주변 보드게임 카페 찾기</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3 py-4">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-xs text-muted-foreground">오늘은 어떤 게임을 즐겨볼까요</Text>
          <View className="h-px flex-1 bg-border" />
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
  onPress: () => void;
}

function ShortcutCard({ label, desc, Icon, onPress }: CardProps) {
  return (
    <TouchableOpacity className="flex-1" activeOpacity={0.7} onPress={onPress}>
      <Card className="min-h-[168px] justify-end p-6">
        <View className="mb-3 h-[54px] w-[54px] items-center justify-center rounded-lg bg-accent">
          <Icon size={27} color={COLORS.foreground} fill="transparent" />
        </View>
        <Text className="mb-1 text-[21px] font-bold text-foreground">{label}</Text>
        <Text className="text-[17px] font-medium text-muted-foreground">{desc}</Text>
      </Card>
    </TouchableOpacity>
  );
}
