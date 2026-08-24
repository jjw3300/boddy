import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { GameSummary, GameType } from '../types';
import { COLORS } from '../design';
import { SearchIcon, ChevronRightIcon, RefreshIcon, DiceIcon } from '../components/Icon';
import { GradientView } from '../components/GradientView';
import { Card } from '../components/Card';
import { Tag, TagColor } from '../components/Tag';

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

// ─── "오늘의 추천 보드게임" 목데이터 ─────────────────────────────────────────
// 게임 DB(BGG) API 키가 아직 발급 전이라, 연동됐을 때 화면이 어떻게 보일지
// 미리 확인할 수 있도록 실제 API 응답과 동일한 모양(GameSummary)의 예시 데이터를 쓴다.
// 실제 연동 시 이 배열과 아래 컴포넌트의 mock 부분만 API 호출로 바꾸면 된다.
const MOCK_DAILY_GAMES: GameSummary[] = [
  {
    bgg_id: -1,
    name: '카탄의 개척자들',
    thumbnail: null,
    min_players: 3,
    max_players: 4,
    play_time: 90,
    weight: 2.4,
    description: '주사위로 자원을 얻고 길과 마을을 지어 섬을 개척하는 전략 게임. 거래와 협상이 승패를 가른다.',
    game_type: 'strategy',
  },
  {
    bgg_id: -2,
    name: '스플렌더',
    thumbnail: null,
    min_players: 2,
    max_players: 4,
    play_time: 30,
    weight: 1.8,
    description: '보석 카드를 모아 발전소를 지어나가는 엔진 빌딩 게임. 규칙이 쉬워 입문용으로도 좋다.',
    game_type: 'strategy',
  },
  {
    bgg_id: -3,
    name: '코드네임',
    thumbnail: null,
    min_players: 4,
    max_players: 8,
    play_time: 15,
    weight: 1.3,
    description: '한 단어로 우리 팀의 단어를 모두 맞추는 팀 파티 게임. 인원이 많을수록 재밌다.',
    game_type: 'party',
  },
  {
    bgg_id: -4,
    name: '아줄',
    thumbnail: null,
    min_players: 2,
    max_players: 4,
    play_time: 45,
    weight: 1.8,
    description: '타일을 모아 나만의 벽을 예쁘게 채워가는 추상 전략 게임. 간단하지만 고민할 거리가 많다.',
    game_type: 'strategy',
  },
];

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

export default function HomeScreen({ navigation }: Props) {
  const [dailyIndex, setDailyIndex] = useState(0);
  const dailyGame = MOCK_DAILY_GAMES[dailyIndex];
  const typeStyle = dailyGame.game_type ? GAME_TYPE_STYLE[dailyGame.game_type] : null;

  function showAnother() {
    setDailyIndex(i => (i + 1) % MOCK_DAILY_GAMES.length);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-6 pb-10" showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="mb-1 mt-5 flex-row items-center gap-2">
          <DiceIcon size={22} color={COLORS.foreground} fill="transparent" />
          <Text className="text-2xl font-extrabold tracking-tight text-foreground">추천</Text>
        </View>
        <Text className="mb-6 text-[13px] font-medium text-muted-foreground">오늘은 어떤 게임을 즐겨볼까요?</Text>

        {/* 추천 질의응답 CTA */}
        <TouchableOpacity onPress={() => navigation.navigate('Recommendation')} activeOpacity={0.9}>
          <GradientView gradient="primary" direction="diagonal" className="rounded-2xl p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
                <SearchIcon size={26} color="#FFFFFF" fill="transparent" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-lg font-extrabold text-white">나에게 맞는 게임 찾기</Text>
                <Text className="text-[13px] font-semibold text-white/90">인원수 · 스타일 · 시간 5문항이면 끝</Text>
              </View>
              <ChevronRightIcon size={22} color="#FFFFFF" />
            </View>
          </GradientView>
        </TouchableOpacity>

        {/* 오늘의 추천 보드게임 */}
        <View className="mb-3 mt-8 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-extrabold text-foreground">오늘의 추천 보드게임</Text>
            <View className="rounded-md bg-accent px-1.5 py-[3px]">
              <Text className="text-[10px] font-extrabold text-accent-foreground">미리보기</Text>
            </View>
          </View>
          <TouchableOpacity onPress={showAnother} className="flex-row items-center gap-1 py-1" activeOpacity={0.7}>
            <RefreshIcon size={13} color={COLORS.mutedForeground} />
            <Text className="text-xs font-bold text-muted-foreground">다른 게임</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('GameDetail', { bggId: dailyGame.bgg_id, game: dailyGame })}
        >
          <Card className="overflow-hidden p-0">
            <GradientView gradient="soft" className="h-[110px] items-center justify-center">
              <Text className="text-5xl">🎲</Text>
            </GradientView>
            <View className="gap-2.5 p-4">
              <Text className="text-[17px] font-extrabold text-foreground">{dailyGame.name}</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {typeStyle && <Tag label={typeStyle.label} color={typeStyle.color} />}
                <Tag label={`👥 ${dailyGame.min_players}~${dailyGame.max_players}`} />
                <Tag label={`⏱ ${dailyGame.play_time}분`} />
                <Tag label={weightLabel(dailyGame.weight)} />
              </View>
              <Text className="text-[13px] font-medium leading-[19px] text-muted-foreground" numberOfLines={2}>
                {dailyGame.description}
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
