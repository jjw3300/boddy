import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { fetchRecommendations } from '../api/recommendation';
import {
  RECOMMENDATION_TREE, ROOT_NODE_ID, createInitialFlowState, advanceFlow, FlowState,
} from '../data/recommendationTree';
import { deriveFilterFromScores, applyPreciseTimeFilter } from '../data/recommendationScoring';
import { COLORS } from '../design';
import { ArrowLeftIcon } from '../components/Icon';
import { TagColor } from '../components/Tag';
import { GradientView } from '../components/GradientView';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

// 옵션 카드 좌측 강조 바 색상 — 노드 안에서 순서대로 돌려쓴다
const ACCENT_PALETTE: TagColor[] = ['info', 'warning', 'danger', 'success', 'violet', 'teal'];
const ACCENT_BAR_CLASS: Record<TagColor, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  neutral: 'bg-stone-300',
};

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Recommendation'>;
}

export default function RecommendationScreen({ navigation }: Props) {
  const [flow, setFlow] = useState<FlowState>(createInitialFlowState());
  const [history, setHistory] = useState<FlowState[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const node = flow.currentNodeId ? RECOMMENDATION_TREE[flow.currentNodeId] : null;

  async function submit(finalFlow: FlowState) {
    setLoading(true);
    setError(null);
    try {
      const filters = deriveFilterFromScores(finalFlow.accumulated);
      const data = await fetchRecommendations(filters);
      // 시간 질문이 이제 4단계 하드 필터라 백엔드가 아는 3단계보다 더 정확하게
      // 한 번 더 걸러야 진짜 "이 시간 안에" 필터가 된다.
      const filteredGames = applyPreciseTimeFilter(data.games, finalFlow.accumulated);
      navigation.navigate('Result', { results: { games: filteredGames, total: filteredGames.length } });
    } catch (e) {
      setError(e instanceof Error ? e.message : '추천을 받아오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }

  function confirmSelection(ids: string[]) {
    const { currentNodeId } = flow;
    if (!currentNodeId) return;
    setHistory(h => [...h, flow]);
    const next = advanceFlow({ ...flow, currentNodeId }, ids);
    setSelectedIds([]);
    if (next.currentNodeId === null) {
      submit(next);
      return;
    }
    setFlow(next);
  }

  function toggleOption(optionId: string) {
    if (!node) return;
    if (!node.multiSelect) {
      confirmSelection([optionId]);
      return;
    }
    // "상관없음"은 다른 선택과 공존할 수 없다 — 고르면 나머지를 다 지우고,
    // "상관없음"이 이미 선택된 상태에서 다른 걸 고르면 "상관없음"을 뺀다.
    setSelectedIds(prev => {
      if (optionId === 'none') {
        return prev.includes('none') ? [] : ['none'];
      }
      const withoutNone = prev.filter(id => id !== 'none');
      return withoutNone.includes(optionId)
        ? withoutNone.filter(id => id !== optionId)
        : [...withoutNone, optionId];
    });
  }

  function goBack() {
    if (history.length === 0) {
      navigation.goBack();
      return;
    }
    setFlow(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
    setSelectedIds([]);
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

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background px-6">
        <View className="flex-1 items-center justify-center gap-1">
          <GradientView gradient="deep" className="mb-5 h-[92px] w-[92px] items-center justify-center rounded-3xl">
            <Text className="text-[42px]">😢</Text>
          </GradientView>
          <Text className="mb-1.5 text-center text-lg font-extrabold text-foreground">추천을 받아오지 못했어요</Text>
          <Text className="mb-5 text-center text-sm font-semibold text-muted-foreground">{error}</Text>
          <View className="flex-row gap-2.5">
            <Button label="다시 시도" variant="gradient" size="sm" onPress={() => submit(flow)} />
            <Button
              label="처음부터"
              variant="outline"
              size="sm"
              onPress={() => { setError(null); setFlow(createInitialFlowState()); setHistory([]); }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!node) return null;

  const totalSteps = flow.visited.length + flow.pendingQueue.length + 1;
  const currentIndex = flow.visited.length; // 0-based
  const isFirstQuestion = flow.currentNodeId === ROOT_NODE_ID && history.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      {/* 상단 진행바 — 다중선택으로 갈래가 늘어나면 실시간으로 함께 늘어난다 */}
      <View className="mb-1 mt-4 flex-row flex-wrap gap-1.5 self-center">
        {Array.from({ length: totalSteps }, (_, i) => (
          i <= currentIndex ? (
            <GradientView key={i} gradient="primary" direction="horizontal" className="h-1.5 w-6 rounded-full" />
          ) : (
            <View key={i} className="h-1.5 w-6 rounded-full bg-border" />
          )
        ))}
      </View>

      {/* 뒤로 가기 */}
      <TouchableOpacity onPress={goBack} className="flex-row items-center gap-1.5 self-start py-2.5">
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-bold text-foreground">{isFirstQuestion ? '이전' : '이전 질문'}</Text>
      </TouchableOpacity>

      {/* 질문 */}
      <View className="mb-7 mt-4">
        <Text className="mb-2.5 text-xs font-extrabold tracking-wide text-foreground">{currentIndex + 1} / {totalSteps}</Text>
        <Text className="mb-1.5 text-2xl font-extrabold leading-[33px] text-foreground">{node.title}</Text>
        <Text className="text-sm font-semibold text-muted-foreground">{node.subtitle}</Text>
      </View>

      {/* 선택지 — 80% 축소 (padding 24→19, 라벨 24→19, 설명 18→14, gap 14→11) */}
      <ScrollView contentContainerClassName="gap-[11px] pb-8" showsVerticalScrollIndicator={false}>
        {node.options.map((option, i) => {
          const isSelected = selectedIds.includes(option.id);
          const accentColor = ACCENT_PALETTE[i % ACCENT_PALETTE.length];
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => toggleOption(option.id)}
              activeOpacity={0.85}
            >
              <View
                className={cn(
                  'flex-row items-stretch overflow-hidden rounded-xl border bg-card',
                  isSelected ? 'border-primary' : 'border-border',
                )}
              >
                <View className={cn('w-[6px]', ACCENT_BAR_CLASS[accentColor])} />
                <View className="flex-1 px-[19px] py-[19px]">
                  <Text className="mb-1 text-[19px] font-extrabold text-foreground">{option.label}</Text>
                  <Text className="text-[14px] font-semibold text-muted-foreground">{option.description}</Text>
                </View>
                {node.multiSelect && (
                  <View className="items-center justify-center pr-4">
                    <View
                      className={cn(
                        'h-[22px] w-[22px] items-center justify-center rounded-md border-2',
                        isSelected ? 'border-primary bg-primary' : 'border-border bg-transparent',
                      )}
                    >
                      {isSelected && <Text className="text-xs font-extrabold text-primary-foreground">✓</Text>}
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 다중선택 노드는 확정 버튼으로 다음 질문으로 넘어간다 */}
      {node.multiSelect && (
        <View className="pb-5 pt-2">
          <Button
            label={selectedIds.length > 0 ? `${selectedIds.length}개 선택 · 다음` : '하나 이상 골라주세요'}
            variant="gradient"
            disabled={selectedIds.length === 0}
            onPress={() => confirmSelection(selectedIds)}
            className="h-14 rounded-xl"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
