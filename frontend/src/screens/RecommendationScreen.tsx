import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { RecommendationFilter, PlayStyle, Difficulty, PlayTime, GameType } from '../types';
import { fetchRecommendations } from '../api/recommendation';
import { COLORS, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { ArrowLeftIcon } from '../components/Icon';

type Step = 'player_count' | 'play_style' | 'game_type' | 'difficulty' | 'play_time';
const STEPS: Step[] = ['player_count', 'play_style', 'game_type', 'difficulty', 'play_time'];

const QUESTIONS: Record<Step, { title: string; sub: string }> = {
  player_count: { title: '몇 명이서 즐기시나요?',       sub: '인원 수를 골라주세요' },
  play_style:   { title: '어떤 방식을 선호하세요?',     sub: '게임 진행 스타일' },
  game_type:    { title: '어떤 느낌의 게임을 원하나요?', sub: '게임 유형을 골라주세요' },
  difficulty:   { title: '난이도는 어떻게?',             sub: '어느 정도 머리를 쓸까요' },
  play_time:    { title: '얼마나 플레이하실 건가요?',    sub: '예상 플레이 시간' },
};

type OptionItem = { label: string; value: string; desc: string; color: string; bottomColor: string };

const OPTIONS: Record<Step, OptionItem[]> = {
  player_count: [
    { label: '2명',     value: '2', desc: '1:1 진검승부',  color: COLORS.woodLight,   bottomColor: COLORS.woodMid },
    { label: '3 ~ 4명', value: '3', desc: '소그룹 파티',    color: COLORS.paintYellow + '88', bottomColor: COLORS.paintYellow },
    { label: '5명 이상', value: '5', desc: '대인원 왁자지껄', color: '#F0B0A8',          bottomColor: COLORS.paintRed },
  ],
  play_style: [
    { label: '협력',      value: 'cooperative',  desc: '함께 이기자!',  color: '#B5D5A0', bottomColor: '#4E9E6B' },
    { label: '경쟁',      value: 'competitive',  desc: '내가 이긴다',   color: '#F0B0A8', bottomColor: COLORS.paintRed },
    { label: '상관없음',  value: 'both',          desc: '아무거나 OK',   color: COLORS.woodLight, bottomColor: COLORS.woodMid },
  ],
  game_type: [
    { label: '운빨',   value: 'luck',       desc: '주사위·카드 운 중심',   color: COLORS.paintYellow + '88', bottomColor: COLORS.paintYellow },
    { label: '피지컬', value: 'dexterity',  desc: '손재주·반사신경',        color: '#B5D5A0', bottomColor: '#4E9E6B' },
    { label: '파티',   value: 'party',      desc: '가볍고 신나게',           color: '#F0B0A8', bottomColor: COLORS.paintRed },
    { label: '뇌지컬', value: 'strategy',   desc: '전략·두뇌 싸움',          color: '#A8C8E8', bottomColor: COLORS.paintBlue },
  ],
  difficulty: [
    { label: '쉬움',   value: 'easy',   desc: '입문자도 바로 OK',  color: '#B5D5A0', bottomColor: '#4E9E6B' },
    { label: '보통',   value: 'medium', desc: '약간의 학습 필요',  color: COLORS.woodLight, bottomColor: COLORS.woodMid },
    { label: '어려움', value: 'hard',   desc: '고인물 전용',        color: '#F0B0A8', bottomColor: COLORS.paintRed },
  ],
  play_time: [
    { label: '30분 이내',     value: 'short',  desc: '빠르게 한 판',  color: '#B5D5A0', bottomColor: '#4E9E6B' },
    { label: '30분 ~ 1시간 반', value: 'medium', desc: '적당하게',     color: COLORS.woodLight, bottomColor: COLORS.woodMid },
    { label: '1시간 반 이상', value: 'long',   desc: '풀 올인',        color: '#A8C8E8', bottomColor: COLORS.paintBlue },
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <View style={styles.loadingBlock}>
            <Text style={styles.loadingEmoji}>🎲</Text>
          </View>
          <View style={styles.loadingBlockBottom} />
          <Text style={styles.loadingText}>게임을 찾고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 진행바 */}
      <View style={styles.progressTrack}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= stepIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* 뒤로 가기 */}
      <TouchableOpacity
        onPress={() => stepIndex > 0 ? setStepIndex(stepIndex - 1) : navigation.goBack()}
        style={styles.backBtn}
      >
        <ArrowLeftIcon size={20} color={COLORS.woodDark} />
        <Text style={styles.backText}>이전</Text>
      </TouchableOpacity>

      {/* 질문 */}
      <View style={styles.questionBox}>
        <Text style={styles.stepLabel}>{stepIndex + 1} / {STEPS.length}</Text>
        <Text style={styles.question}>{question.title}</Text>
        <Text style={styles.questionSub}>{question.sub}</Text>
      </View>

      {/* 선택지 */}
      <ScrollView contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {OPTIONS[currentStep].map(option => (
          <View key={option.value} style={styles.optionWrapper}>
            <TouchableOpacity
              style={[styles.optionBlock, { backgroundColor: option.color }]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.85}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDesc}>{option.desc}</Text>
            </TouchableOpacity>
            <View style={[styles.optionBlockBottom, { backgroundColor: option.bottomColor }]} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
    alignSelf: 'center',
  },
  progressDot: {
    width: 28,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.woodLight,
    borderWidth: 1.5,
    borderColor: COLORS.woodMid,
  },
  progressDotActive: {
    backgroundColor: COLORS.wood,
    borderColor: COLORS.woodDark,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.woodDark,
  },
  questionBox: {
    marginTop: 16,
    marginBottom: 28,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  question: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 34,
    marginBottom: 6,
  },
  questionSub: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionsContainer: {
    gap: 14,
    paddingBottom: 32,
  },
  optionWrapper: {
    borderRadius: RADIUS.md,
    overflow: 'visible',
    ...BLOCK_SHADOW_SM,
  },
  optionBlock: {
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    borderBottomWidth: 0,
  },
  optionBlockBottom: {
    height: 7,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  optionLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  loadingBlock: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.wood,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.woodDark,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  loadingBlockBottom: {
    width: 100,
    height: 10,
    backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    marginBottom: 24,
  },
  loadingEmoji: { fontSize: 48 },
  loadingText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
