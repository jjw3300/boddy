import React from 'react';
import {
  View, Text, FlatList, Image,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RecommendStackParamList } from '../types/navigation';
import { GameSummary, GameType } from '../types';
import { COLORS } from '../design';
import { ArrowLeftIcon, RefreshIcon, ChevronRightIcon } from '../components/Icon';
import { Tag, TagColor } from '../components/Tag';
import { Button } from '../components/Button';
import { GradientView } from '../components/GradientView';
import { cn } from '../lib/utils';

const GAME_TYPE_STYLE: Record<GameType, { label: string; color: TagColor }> = {
  luck:      { label: '운빨',   color: 'warning' },
  dexterity: { label: '피지컬', color: 'success' },
  party:     { label: '파티',   color: 'danger' },
  strategy:  { label: '뇌지컬', color: 'info' },
};

function weightLabel(weight: number): string {
  if (weight < 2.0) return '쉬움';
  if (weight < 3.5) return '보통';
  return '어려움';
}

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Result'>;
  route: RouteProp<RecommendStackParamList, 'Result'>;
}

// 1~3위는 메달 색으로 강조, 나머지는 기본 회색조 배지
const RANK_BADGE_STYLE: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-[#FFD700]', text: 'text-black' },
  2: { bg: 'bg-[#C0C0C0]', text: 'text-black' },
  3: { bg: 'bg-[#CD7F32]', text: 'text-white' },
};

function rankBadgeStyle(rank: number): { bg: string; text: string } {
  return RANK_BADGE_STYLE[rank] ?? { bg: 'bg-black/70', text: 'text-white' };
}

const FILTER_LABEL: Record<string, string> = {
  player_count: '인원수',
  difficulty: '난이도',
  play_time: '플레이 시간',
  play_style: '협력/경쟁',
};

function GameCard({ game, onPress, isTopPick }: { game: GameSummary; onPress: () => void; isTopPick?: boolean }) {
  const typeStyle = game.game_type ? GAME_TYPE_STYLE[game.game_type] : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View className="relative flex-row items-center overflow-hidden rounded-xl border border-border bg-card">
        {/* 1순위 추천 강조 스트립 */}
        {isTopPick && (
          <GradientView gradient="warm" className="absolute inset-x-0 top-0 h-1" />
        )}

        {/* 등수 배지 — 1~3위는 메달 색으로 강조 */}
        {game.rank !== null && (
          <View className={cn('absolute left-1.5 top-1.5 z-10 min-w-[26px] items-center justify-center rounded-full px-1.5 py-[3px]', rankBadgeStyle(game.rank).bg)}>
            <Text className={cn('text-[11px] font-extrabold', rankBadgeStyle(game.rank).text)}>{game.rank}위</Text>
          </View>
        )}

        {/* 썸네일 */}
        {game.thumbnail ? (
          <Image source={{ uri: game.thumbnail }} className="h-[100px] w-[84px]" />
        ) : (
          <GradientView gradient={isTopPick ? 'warm' : 'primary'} className="h-[100px] w-[84px] items-center justify-center">
            <Text className="rotate-[-6deg] text-3xl">🎲</Text>
          </GradientView>
        )}

        <View className="flex-1 gap-2 p-3.5">
          <Text className="text-[15px] font-extrabold leading-[21px] text-foreground" numberOfLines={2}>{game.name}</Text>

          {/* 태그 */}
          <View className="flex-row flex-wrap gap-1.5">
            {typeStyle && <Tag label={typeStyle.label} color={typeStyle.color} />}
            <Tag label={`👥 ${game.min_players}~${game.max_players}`} />
            <Tag label={`⏱ ${game.play_time}분`} />
            <Tag label={weightLabel(game.weight)} />
          </View>
        </View>

        <ChevronRightIcon size={20} color={COLORS.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

export default function ResultScreen({ navigation, route }: Props) {
  const { results } = route.params;

  if (results.total === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-10">
          <GradientView gradient="soft" className="mb-5 h-[92px] w-[92px] rotate-[5deg] items-center justify-center rounded-3xl border border-border">
            <Text className="text-[42px]">😅</Text>
          </GradientView>
          <Text className="mb-1.5 text-center text-lg font-extrabold text-foreground">조건에 맞는 게임이 없어요</Text>
          <Text className="mb-5 text-center text-sm font-semibold text-muted-foreground">조건을 바꿔서 다시 시도해보세요</Text>
          <Button
            variant="gradient"
            label="다시 찾기"
            size="sm"
            onPress={() => navigation.popToTop()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 py-1.5">
          <ArrowLeftIcon size={20} color={COLORS.foreground} />
          <Text className="text-sm font-bold text-foreground">이전</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-1.5 rounded-lg border border-border bg-accent px-3.5 py-2" onPress={() => navigation.popToTop()}>
          <RefreshIcon size={14} color={COLORS.foreground} />
          <Text className="text-[13px] font-extrabold text-foreground">다시 찾기</Text>
        </TouchableOpacity>
      </View>

      {/* 타이틀 블럭 */}
      <View className="flex-row items-center gap-2.5 px-6 pb-4">
        <Text className="text-xl font-bold tracking-tight text-foreground">추천 게임</Text>
        <View className="rounded-lg border border-border bg-accent px-2.5 py-[3px]">
          <Text className="text-[13px] font-extrabold text-foreground">{results.total}개</Text>
        </View>
      </View>

      {/* 조건을 완화해서 찾은 경우 안내 */}
      {results.relaxed_filters.length > 0 && (
        <View className="mx-6 mb-4 rounded-lg border border-border bg-muted px-3.5 py-3">
          <Text className="text-[12px] font-semibold text-muted-foreground">
            💡 딱 맞는 게임이 없어서{' '}
            <Text className="font-extrabold text-foreground">
              {results.relaxed_filters.map(f => FILTER_LABEL[f] ?? f).join(', ')}
            </Text>
            {' '}조건을 살짝 완화해서 찾았어요
          </Text>
        </View>
      )}

      <FlatList
        data={results.games}
        keyExtractor={item => String(item.bgg_id)}
        renderItem={({ item, index }) => (
          <GameCard
            game={item}
            isTopPick={index === 0}
            onPress={() => navigation.navigate('GameDetail', { bggId: item.bgg_id })}
          />
        )}
        contentContainerClassName="px-6 pb-8 gap-3"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
