import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { RecommendationFilter, PlayStyle, Difficulty, PlayTime, GameType } from '../types';
import { fetchRecommendations } from '../api/recommendation';
import { COLORS } from '../design';
import { ArrowLeftIcon } from '../components/Icon';
import { TagColor } from '../components/Tag';
import { GradientView } from '../components/GradientView';
import { cn } from '../lib/utils';

type Step = 'player_count' | 'play_style' | 'game_type' | 'difficulty' | 'play_time';
const STEPS: Step[] = ['player_count', 'play_style', 'game_type', 'difficulty', 'play_time'];

const QUESTIONS: Record<Step, { title: string; sub: string }> = {
  player_count: { title: '몇 명이서 즐기시나요?',       sub: '인원 수를 골라주세요' },
  play_style:   { title: '어떤 방식을 선호하세요?',     sub: '게임 진행 스타일' },
  game_type:    { title: '어떤 느낌의 게임을 원하나요?', sub: '게임 유형을 골라주세요' },
  difficulty:   { title: '난이도는 어떻게?',             sub: '어느 정도 머리를 쓸까요' },
  play_time:    { title: '얼마나 플레이하실 건가요?',    sub: '예상 플레이 시간' },
};

type OptionItem = { label: string; value: string; desc: string; tagColor: TagColor };

// 옵션 카드 좌측 강조 바 색상 — Tag 컴포넌트의 팔레트와 톤을 맞춘 고정 클래스 매핑
const ACCENT_BAR_CLASS: Record<TagColor, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  neutral: 'bg-stone-300',
};

const OPTIONS: Record<Step, OptionItem[]> = {
  player_count: [
    { label: '2명',     value: '2', desc: '1:1 진검승부',    tagColor: 'info' },
    { label: '3 ~ 4명', value: '3', desc: '소그룹 파티',      tagColor: 'warning' },
    { label: '5명 이상', value: '5', desc: '대인원 왁자지껄', tagColor: 'danger' },
  ],
  play_style: [
    { label: '협력',     value: 'cooperative', desc: '함께 이기자!', tagColor: 'success' },
    { label: '경쟁',     value: 'competitive', desc: '내가 이긴다',  tagColor: 'danger' },
    { label: '상관없음', value: 'both',         desc: '아무거나 OK',  tagColor: 'neutral' },
  ],
  game_type: [
    { label: '운빨',   value: 'luck',      desc: '주사위·카드 운 중심', tagColor: 'warning' },
    { label: '피지컬', value: 'dexterity', desc: '손재주·반사신경',      tagColor: 'success' },
    { label: '파티',   value: 'party',     desc: '가볍고 신나게',         tagColor: 'danger' },
    { label: '뇌지컬', value: 'strategy',  desc: '전략·두뇌 싸움',        tagColor: 'info' },
  ],
  difficulty: [
    { label: '쉬움',   value: 'easy',   desc: '입문자도 바로 OK', tagColor: 'success' },
    { label: '보통',   value: 'medium', desc: '약간의 학습 필요', tagColor: 'neutral' },
    { label: '어려움', value: 'hard',   desc: '고인물 전용',       tagColor: 'danger' },
  ],
  play_time: [
    { label: '30분 이내',       value: 'short',  desc: '빠르게 한 판', tagColor: 'success' },
    { label: '30분 ~ 1시간 반', value: 'medium', desc: '적당하게',     tagColor: 'neutral' },
    { label: '1시간 반 이상',   value: 'long',   desc: '풀 올인',       tagColor: 'info' },
  ],
};

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Recommendation'>;
}

export default function RecommendationScreen({ navigation }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [filters, setFilters] = useState<RecommendationFilter>({
    player_count: null, play_style: null,
    game_type: null, difficulty: null, play_time: null,
  });
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[stepIndex];
  const question = QUESTIONS[currentStep];

  async function handleSelect(value: string) {
    const updated = { ...filters };
    if (currentStep === 'player_count') { updated.player_count = parseInt(value, 10); }
    else if (currentStep === 'play_style') { updated.play_style = value as PlayStyle; }
    else if (currentStep === 'game_type')  { updated.game_type  = value as GameType; }
    else if (currentStep === 'difficulty') { updated.difficulty = value as Difficulty; }
    else if (currentStep === 'play_time')  { updated.play_time  = value as PlayTime; }
    setFilters(updated);

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setLoading(true);
      try {
        const data = await fetchRecommendations(updated);
        navigation.navigate('Result', { results: data });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background px-6">
        <View className="flex-1 items-center justify-center gap-5">
          <View className="-rotate-6 h-[92px] w-[92px] items-center justify-center rounded-3xl border border-border bg-accent">
            <Text className="text-[42px]">🎲</Text>
          </View>
          <Text className="text-base font-bold text-foreground">게임을 찾고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      {/* 상단 진행바 */}
      <View className="mb-1 mt-4 flex-row gap-1.5 self-center">
        {STEPS.map((_, i) => (
          i <= stepIndex ? (
            <GradientView key={i} gradient="primary" direction="horizontal" className="h-1.5 w-6 rounded-full" />
          ) : (
            <View key={i} className="h-1.5 w-6 rounded-full bg-border" />
          )
        ))}
      </View>

      {/* 뒤로 가기 */}
      <TouchableOpacity
        onPress={() => stepIndex > 0 ? setStepIndex(stepIndex - 1) : navigation.goBack()}
        className="flex-row items-center gap-1.5 self-start py-2.5"
      >
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-bold text-foreground">이전</Text>
      </TouchableOpacity>

      {/* 질문 */}
      <View className="mb-7 mt-4">
        <Text className="mb-2.5 text-xs font-extrabold tracking-wide text-foreground">{stepIndex + 1} / {STEPS.length}</Text>
        <Text className="mb-1.5 text-2xl font-extrabold leading-[33px] text-foreground">{question.title}</Text>
        <Text className="text-sm font-semibold text-muted-foreground">{question.sub}</Text>
      </View>

      {/* 선택지 */}
      <ScrollView contentContainerClassName="gap-4 pb-8" showsVerticalScrollIndicator={false}>
        {OPTIONS[currentStep].map(option => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.85}
          >
            <View className="flex-row items-stretch overflow-hidden rounded-xl border border-border bg-card">
              <View className={cn('w-[8px]', ACCENT_BAR_CLASS[option.tagColor])} />
              <View className="flex-1 px-[27px] py-[27px]">
                <Text className="mb-1.5 text-[27px] font-extrabold text-foreground">{option.label}</Text>
                <Text className="text-[20px] font-semibold text-muted-foreground">{option.desc}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
