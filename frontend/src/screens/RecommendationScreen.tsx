import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { RecommendationFilter, PlayStyle, Difficulty, PlayTime, GameType } from '../types';
import { fetchRecommendations } from '../api/recommendation';

const COLORS = {
  bg: '#F5ECD7',
  card: '#E8D5B0',
  primary: '#8B5E3C',
  text: '#3E2A1E',
  subtext: '#7A5C3A',
  selected: '#C8860A',
  white: '#FFFDF5',
};

type Step = 'player_count' | 'play_style' | 'game_type' | 'difficulty' | 'play_time';

const STEPS: Step[] = ['player_count', 'play_style', 'game_type', 'difficulty', 'play_time'];

const QUESTIONS: Record<Step, string> = {
  player_count: '몇 명이서 즐기시나요?',
  play_style: '어떤 방식을 선호하세요?',
  game_type: '어떤 스타일의 게임을 원하세요?',
  difficulty: '게임 난이도는요?',
  play_time: '얼마나 플레이할 예정인가요?',
};

type OptionItem = { label: string; value: string; emoji: string; desc: string };

const OPTIONS: Record<Step, OptionItem[]> = {
  player_count: [
    { label: '2명', value: '2', emoji: '👥', desc: '1:1 대결' },
    { label: '3~4명', value: '3', emoji: '👨‍👩‍👧', desc: '소그룹' },
    { label: '5명 이상', value: '5', emoji: '🎉', desc: '대인원' },
  ],
  play_style: [
    { label: '협력', value: 'cooperative', emoji: '🤝', desc: '함께 이기자' },
    { label: '경쟁', value: 'competitive', emoji: '⚔️', desc: '내가 이긴다' },
    { label: '상관없음', value: 'both', emoji: '🎲', desc: '아무거나' },
  ],
  game_type: [
    { label: '운빨', value: 'luck', emoji: '🎰', desc: '주사위·카드 운 중심' },
    { label: '피지컬', value: 'dexterity', emoji: '🤸', desc: '손재주·반사신경' },
    { label: '파티', value: 'party', emoji: '🥳', desc: '가볍고 신나게' },
    { label: '뇌지컬', value: 'strategy', emoji: '🧠', desc: '전략·두뇌 싸움' },
  ],
  difficulty: [
    { label: '쉬움', value: 'easy', emoji: '😊', desc: '입문자도 OK' },
    { label: '보통', value: 'medium', emoji: '🤔', desc: '약간의 학습 필요' },
    { label: '어려움', value: 'hard', emoji: '🔥', desc: '고인물 환영' },
  ],
  play_time: [
    { label: '30분 이내', value: 'short', emoji: '⚡', desc: '빠르게 한 판' },
    { label: '30분~1시간 반', value: 'medium', emoji: '⏱️', desc: '적당히' },
    { label: '1시간 반 이상', value: 'long', emoji: '🌙', desc: '올인' },
  ],
};

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Recommendation'>;
}

export default function RecommendationScreen({ navigation }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [filters, setFilters] = useState<RecommendationFilter>({
    player_count: null,
    play_style: null,
    game_type: null,
    difficulty: null,
    play_time: null,
  });
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  async function handleSelect(value: string) {
    const updated = { ...filters };

    if (currentStep === 'player_count') { updated.player_count = parseInt(value, 10); }
    else if (currentStep === 'play_style') { updated.play_style = value as PlayStyle; }
    else if (currentStep === 'game_type') { updated.game_type = value as GameType; }
    else if (currentStep === 'difficulty') { updated.difficulty = value as Difficulty; }
    else if (currentStep === 'play_time') { updated.play_time = value as PlayTime; }

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
          <Text style={styles.loadingEmoji}>🎲</Text>
          <Text style={styles.loadingText}>게임을 찾고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <TouchableOpacity
        onPress={() => stepIndex > 0 ? setStepIndex(stepIndex - 1) : navigation.goBack()}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>← 이전</Text>
      </TouchableOpacity>

      <View style={styles.questionBox}>
        <Text style={styles.stepLabel}>{stepIndex + 1} / {STEPS.length}</Text>
        <Text style={styles.question}>{QUESTIONS[currentStep]}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {OPTIONS[currentStep].map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionCard}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <View style={styles.optionTextBox}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDesc}>{option.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    marginTop: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.selected,
    borderRadius: 3,
  },
  backBtn: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: COLORS.subtext,
    fontSize: 15,
    fontWeight: '600',
  },
  questionBox: {
    marginTop: 32,
    marginBottom: 36,
  },
  stepLabel: {
    fontSize: 13,
    color: COLORS.subtext,
    marginBottom: 10,
    fontWeight: '500',
  },
  question: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 34,
  },
  optionsContainer: {
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 16,
  },
  optionEmoji: { fontSize: 30 },
  optionTextBox: { flex: 1 },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    color: COLORS.subtext,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingEmoji: { fontSize: 56 },
  loadingText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
  },
});
