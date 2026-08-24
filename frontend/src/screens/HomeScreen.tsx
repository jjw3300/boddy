import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { COLORS } from '../design';
import { SearchIcon, BookIcon, MapPinIcon, WrenchIcon, DiceIcon } from '../components/Icon';
import { GradientView } from '../components/GradientView';
import { Card } from '../components/Card';

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: Props) {
  const goTab = (tab: string) => navigation.getParent()?.navigate(tab as never);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>

        {/* 그라데이션 히어로 */}
        <GradientView gradient="primary" direction="diagonal" className="rounded-b-[32px] px-6 pb-8 pt-8">
          <View className="items-center">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-white/25">
              <DiceIcon size={32} color="#FFFFFF" fill="transparent" />
            </View>
            <Text className="text-2xl font-extrabold tracking-tight text-white">Boddy</Text>
            <Text className="mt-1 text-sm font-medium text-white/85">보드게임 버디</Text>
          </View>

          {/* 메인 CTA — 히어로 위 떠 있는 화이트 카드 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Recommendation')}
            activeOpacity={0.85}
            className="mt-6 flex-row items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-lg"
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1CC]">
              <SearchIcon size={24} color="#FF9F1C" fill="transparent" />
            </View>
            <View className="flex-1">
              <Text className="mb-0.5 text-base font-bold text-foreground">오늘 게임 추천받기</Text>
              <Text className="text-[13px] font-medium text-muted-foreground">인원수·시간·취향으로 찾아봐요</Text>
            </View>
          </TouchableOpacity>
        </GradientView>

        <View className="px-5">
          {/* 바로가기 */}
          <View className="-mt-1 mb-2 mt-6 flex-row gap-3">
            <ShortcutCard
              label="플레이 기록"
              desc="내 게임 이력 보기"
              Icon={BookIcon}
              gradient="warm"
              onPress={() => goTab('LogTab')}
            />
            <ShortcutCard
              label="게임 도구"
              desc="주사위 · 점수판"
              Icon={WrenchIcon}
              gradient="deep"
              onPress={() => goTab('ToolkitTab')}
            />
          </View>

          {/* 카페 찾기 */}
          <TouchableOpacity
            className="mb-8 mt-2 flex-row items-center gap-2 rounded-lg bg-muted px-4 py-2.5"
            onPress={() => goTab('CafeTab')}
            activeOpacity={0.7}
          >
            <MapPinIcon size={14} color={COLORS.mutedForeground} />
            <Text className="text-xs font-semibold text-muted-foreground">내 주변 보드게임 카페 찾기</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-3 py-4">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-xs text-muted-foreground">오늘은 어떤 게임을 즐겨볼까요</Text>
            <View className="h-px flex-1 bg-border" />
          </View>
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
  gradient: 'primary' | 'warm' | 'deep' | 'soft';
  onPress: () => void;
}

function ShortcutCard({ label, desc, Icon, gradient, onPress }: CardProps) {
  return (
    <TouchableOpacity className="flex-1" activeOpacity={0.7} onPress={onPress}>
      <Card className="min-h-[112px] justify-end p-4">
        <GradientView gradient={gradient} className="mb-2 h-9 w-9 items-center justify-center rounded-lg">
          <Icon size={18} color="#FFFFFF" fill="transparent" />
        </GradientView>
        <Text className="mb-0.5 text-sm font-bold text-foreground">{label}</Text>
        <Text className="text-[11px] font-medium text-muted-foreground">{desc}</Text>
      </Card>
    </TouchableOpacity>
  );
}
