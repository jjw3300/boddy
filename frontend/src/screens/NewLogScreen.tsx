import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogStackParamList } from '../types/navigation';
import { PlayLog, LogPlayer, ResultType, WinLossResult, ResultData } from '../types/log';
import { GameSearchResult } from '../types';
import { searchGames } from '../api/games';
import { saveLog, generateId, todayStr } from '../services/logStorage';
import { COLORS } from '../design';
import { ArrowLeftIcon } from '../components/Icon';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { GradientView } from '../components/GradientView';
import { TagColor } from '../components/Tag';
import { cn } from '../lib/utils';

const STEPS = ['game', 'session', 'result', 'review'] as const;

const WIN_LOSS_TINT: Record<WinLossResult, { bg: string; border: string }> = {
  win:  { bg: 'bg-green-600', border: 'border-green-600' },
  draw: { bg: 'bg-stone-500', border: 'border-stone-500' },
  loss: { bg: 'bg-red-600',   border: 'border-red-600' },
};

const RESULT_TYPES: {
  value: ResultType;
  label: string;
  desc: string;
  tagColor: TagColor;
}[] = [
  { value: 'score',    label: '점수', desc: '숫자 점수',   tagColor: 'info' },
  { value: 'win_loss', label: '승패', desc: 'O / △ / X', tagColor: 'success' },
  { value: 'rank',     label: '순위', desc: '순서 매기기', tagColor: 'warning' },
  { value: 'free',     label: '자유', desc: '자유 입력',   tagColor: 'neutral' },
];

interface Props {
  navigation: NativeStackNavigationProp<LogStackParamList, 'NewLog'>;
}

function newPlayer(name: string): LogPlayer {
  return { id: generateId(), name };
}

export default function NewLogScreen({ navigation }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  // Step 0 – Game search
  const [gameQuery, setGameQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<{
    bgg_id: number | null;
    name: string;
    thumbnail: string | null;
  } | null>(null);

  // Step 1 – Session
  const [date, setDate] = useState(todayStr());
  const [players, setPlayers] = useState<LogPlayer[]>([newPlayer('나')]);
  const [playerInput, setPlayerInput] = useState('');

  // Step 2 – Result
  const [resultType, setResultType] = useState<ResultType>('score');
  const [scoreEntries, setScoreEntries] = useState<{ player_id: string; score: string }[]>([]);
  const [winLossEntries, setWinLossEntries] = useState<{ player_id: string; result: WinLossResult }[]>([]);
  const [rankEntries, setRankEntries] = useState<{ player_id: string; rank: string }[]>([]);
  const [freeText, setFreeText] = useState('');

  // Step 3 – Review
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // players가 바뀌면 결과 입력 필드를 초기화
  useEffect(() => {
    setScoreEntries(players.map(p => ({ player_id: p.id, score: '' })));
    setWinLossEntries(players.map(p => ({ player_id: p.id, result: 'win' })));
    setRankEntries(players.map(p => ({ player_id: p.id, rank: '' })));
  }, [players]);

  async function handleSearch() {
    const q = gameQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const results = await searchGames(q);
      setSearchResults(results);
    } catch {
      Alert.alert('검색 실패', '게임 검색에 실패했어요. 네트워크를 확인하세요.');
    } finally {
      setSearching(false);
    }
  }

  function selectSearchResult(item: GameSearchResult) {
    setSelectedGame({ bgg_id: item.bgg_id, name: item.name, thumbnail: null });
    setGameQuery(item.name);
    setSearchResults([]);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function clearSelectedGame() {
    setSelectedGame(null);
    setSearchResults([]);
  }

  function addPlayer() {
    const name = playerInput.trim();
    if (!name) return;
    setPlayers(prev => [...prev, newPlayer(name)]);
    setPlayerInput('');
  }

  function removePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  const canProceed = (() => {
    switch (stepIndex) {
      case 0: return selectedGame !== null || gameQuery.trim().length > 0;
      case 1: return players.length > 0;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  })();

  async function handleNext() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      await handleSave();
    }
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const gameName = selectedGame?.name ?? gameQuery.trim();
      const bggId = selectedGame?.bgg_id ?? null;

      const resultData: ResultData = (() => {
        switch (resultType) {
          case 'score':
            return {
              type: 'score' as const,
              entries: scoreEntries.map(e => ({
                player_id: e.player_id,
                score: e.score === '' ? null : Number(e.score),
              })),
            };
          case 'win_loss':
            return { type: 'win_loss' as const, entries: winLossEntries };
          case 'rank':
            return {
              type: 'rank' as const,
              entries: rankEntries.map(e => ({
                player_id: e.player_id,
                rank: e.rank === '' ? null : Number(e.rank),
              })),
            };
          case 'free':
            return { type: 'free' as const, text: freeText };
        }
      })();

      const log: PlayLog = {
        id: generateId(),
        bgg_id: bggId,
        game_name: gameName,
        game_thumbnail: selectedGame?.thumbnail ?? null,
        played_at: date,
        players,
        result_type: resultType,
        result_data: resultData,
        review,
        created_at: new Date().toISOString(),
      };

      await saveLog(log);
      navigation.goBack();
    } catch {
      Alert.alert('저장 실패', '기록 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  // ─── Step renderers ───────────────────────────────────────────────

  function renderGameStep() {
    return (
      <View>
        <View className="mb-6 mt-4">
          <Text className="mb-2 text-xs font-extrabold tracking-wide text-foreground">1 / 4</Text>
          <Text className="mb-1 text-[23px] font-extrabold leading-[31px] text-foreground">어떤 게임을 했나요?</Text>
          <Text className="text-[13px] font-semibold text-muted-foreground">게임 이름을 검색하거나 직접 입력하세요</Text>
        </View>

        {/* Selected game badge */}
        {selectedGame && (
          <View className="mb-3 flex-row items-center gap-2.5">
            <GradientView gradient="primary" className="flex-1 rounded-lg px-3 py-2">
              <Text className="text-sm font-extrabold text-white" numberOfLines={1}>
                ✓  {selectedGame.name}
              </Text>
            </GradientView>
            <TouchableOpacity onPress={clearSelectedGame} className="rounded-lg bg-muted px-2.5 py-2">
              <Text className="text-[13px] font-bold text-muted-foreground">취소</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search row */}
        <View className="mb-3 flex-row gap-2">
          <Input
            className="flex-1"
            value={gameQuery}
            onChangeText={text => {
              setGameQuery(text);
              if (selectedGame) setSelectedGame(null);
            }}
            placeholder="게임 이름 입력..."
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <Button label="검색" size="sm" onPress={handleSearch} />
        </View>

        {searching && (
          <View className="mb-2 flex-row items-center gap-2">
            <ActivityIndicator color={COLORS.primary} />
            <Text className="text-sm font-semibold text-muted-foreground">검색 중...</Text>
          </View>
        )}

        {searchResults.length > 0 && (
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            {searchResults.map(item => (
              <TouchableOpacity
                key={item.bgg_id}
                className="flex-row items-center justify-between border-b border-border px-3.5 py-3"
                onPress={() => selectSearchResult(item)}
                activeOpacity={0.8}
              >
                <View>
                  <Text className="flex-1 text-sm font-bold text-foreground">{item.name}</Text>
                  {item.year && (
                    <Text className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{item.year}년</Text>
                  )}
                </View>
                <Text className="text-xl font-light text-muted-foreground">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  function renderSessionStep() {
    return (
      <View>
        <View className="mb-6 mt-4">
          <Text className="mb-2 text-xs font-extrabold tracking-wide text-foreground">2 / 4</Text>
          <Text className="mb-1 text-[23px] font-extrabold leading-[31px] text-foreground">세션 정보</Text>
          <Text className="text-[13px] font-semibold text-muted-foreground">날짜와 참여 인원을 설정하세요</Text>
        </View>

        {/* Date */}
        <View className="mb-6">
          <Text className="mb-2.5 text-sm font-extrabold tracking-wide text-muted-foreground">날짜</Text>
          <Input
            className="text-base font-bold"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* Players */}
        <View className="mb-6">
          <Text className="mb-2.5 text-sm font-extrabold tracking-wide text-muted-foreground">참여자</Text>
          <View className="mb-2.5 gap-2">
            {players.map(p => (
              <View key={p.id} className="flex-row items-center gap-2">
                <View className="flex-1 rounded-lg bg-accent px-3.5 py-2.5">
                  <Text className="text-sm font-bold text-foreground">{p.name}</Text>
                </View>
                {players.length > 1 && (
                  <TouchableOpacity
                    className="h-[34px] w-[34px] items-center justify-center rounded-lg bg-red-50"
                    onPress={() => removePlayer(p.id)}
                  >
                    <Text className="text-lg font-bold text-red-600">×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View className="flex-row items-center gap-2">
            <Input
              className="flex-1"
              value={playerInput}
              onChangeText={setPlayerInput}
              placeholder="이름 입력..."
              onSubmitEditing={addPlayer}
              returnKeyType="done"
            />
            <Button label="+ 추가" size="sm" onPress={addPlayer} />
          </View>
        </View>
      </View>
    );
  }

  function renderResultStep() {
    return (
      <View>
        <View className="mb-6 mt-4">
          <Text className="mb-2 text-xs font-extrabold tracking-wide text-foreground">3 / 4</Text>
          <Text className="mb-1 text-[23px] font-extrabold leading-[31px] text-foreground">결과를 기록해요</Text>
          <Text className="text-[13px] font-semibold text-muted-foreground">형식을 선택하고 결과를 입력하세요</Text>
        </View>

        {/* Result type selector */}
        <View className="mb-6 flex-row flex-wrap gap-2.5">
          {RESULT_TYPES.map(rt => {
            const active = resultType === rt.value;
            return active ? (
              <GradientView key={rt.value} gradient="primary" className="w-[47%] rounded-xl">
                <TouchableOpacity
                  className="px-4 py-3.5"
                  onPress={() => setResultType(rt.value)}
                  activeOpacity={0.85}
                >
                  <Text className="mb-0.5 text-base font-extrabold text-white">{rt.label}</Text>
                  <Text className="text-[11px] font-semibold text-white/80">{rt.desc}</Text>
                </TouchableOpacity>
              </GradientView>
            ) : (
              <TouchableOpacity
                key={rt.value}
                className="w-[47%] rounded-xl border border-border bg-background px-4 py-3.5"
                onPress={() => setResultType(rt.value)}
                activeOpacity={0.85}
              >
                <Text className="mb-0.5 text-base font-extrabold text-foreground">{rt.label}</Text>
                <Text className="text-[11px] font-semibold text-muted-foreground">{rt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Result data entry */}
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          {renderResultTable()}
        </View>
      </View>
    );
  }

  function renderResultTable() {
    if (resultType === 'score') {
      return (
        <View>
          <View className="flex-row bg-muted px-3.5 py-2.5">
            <Text className="flex-[2] text-xs font-extrabold text-muted-foreground">참여자</Text>
            <Text className="flex-1 text-center text-xs font-extrabold text-muted-foreground">점수</Text>
          </View>
          {scoreEntries.map((entry, idx) => {
            const player = players.find(p => p.id === entry.player_id);
            return (
              <View key={entry.player_id} className="flex-row items-center border-t border-border px-3.5 py-3">
                <Text className="flex-[2] text-sm font-bold text-foreground">{player?.name ?? '-'}</Text>
                <TextInput
                  className="flex-1 rounded-lg border border-border bg-background px-1 py-1.5 text-center text-[15px] font-extrabold text-foreground"
                  keyboardType="numeric"
                  value={entry.score}
                  onChangeText={val => {
                    const updated = [...scoreEntries];
                    updated[idx] = { ...updated[idx], score: val };
                    setScoreEntries(updated);
                  }}
                  placeholder="0"
                  placeholderTextColor={COLORS.mutedForeground}
                  textAlign="center"
                />
              </View>
            );
          })}
        </View>
      );
    }

    if (resultType === 'win_loss') {
      return (
        <View>
          <View className="flex-row bg-muted px-3.5 py-2.5">
            <Text className="flex-[2] text-xs font-extrabold text-muted-foreground">참여자</Text>
            <Text className="flex-[2] text-xs font-extrabold text-muted-foreground">결과</Text>
          </View>
          {winLossEntries.map((entry, idx) => {
            const player = players.find(p => p.id === entry.player_id);
            return (
              <View key={entry.player_id} className="flex-row items-center border-t border-border px-3.5 py-3">
                <Text className="flex-[2] text-sm font-bold text-foreground">{player?.name ?? '-'}</Text>
                <View className="flex-[2] flex-row justify-end gap-1.5">
                  {(['win', 'draw', 'loss'] as WinLossResult[]).map(res => {
                    const active = entry.result === res;
                    const label = res === 'win' ? 'O' : res === 'draw' ? '△' : 'X';
                    const tint = WIN_LOSS_TINT[res];
                    return (
                      <TouchableOpacity
                        key={res}
                        className={cn(
                          'h-9 w-10 items-center justify-center rounded-lg border border-border bg-muted',
                          active && cn(tint.bg, tint.border),
                        )}
                        onPress={() => {
                          const updated = [...winLossEntries];
                          updated[idx] = { ...updated[idx], result: res };
                          setWinLossEntries(updated);
                        }}
                      >
                        <Text className={cn('text-[15px] font-black', active ? 'text-white' : 'text-muted-foreground')}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    if (resultType === 'rank') {
      return (
        <View>
          <View className="flex-row bg-muted px-3.5 py-2.5">
            <Text className="flex-[2] text-xs font-extrabold text-muted-foreground">참여자</Text>
            <Text className="flex-1 text-center text-xs font-extrabold text-muted-foreground">순위</Text>
          </View>
          {rankEntries.map((entry, idx) => {
            const player = players.find(p => p.id === entry.player_id);
            return (
              <View key={entry.player_id} className="flex-row items-center border-t border-border px-3.5 py-3">
                <Text className="flex-[2] text-sm font-bold text-foreground">{player?.name ?? '-'}</Text>
                <TextInput
                  className="flex-1 rounded-lg border border-border bg-background px-1 py-1.5 text-center text-[15px] font-extrabold text-foreground"
                  keyboardType="numeric"
                  value={entry.rank}
                  onChangeText={val => {
                    const updated = [...rankEntries];
                    updated[idx] = { ...updated[idx], rank: val };
                    setRankEntries(updated);
                  }}
                  placeholder="1"
                  placeholderTextColor={COLORS.mutedForeground}
                  textAlign="center"
                />
              </View>
            );
          })}
        </View>
      );
    }

    if (resultType === 'free') {
      return (
        <TextInput
          className="min-h-[120px] p-3.5 text-sm font-semibold leading-[22px] text-foreground"
          multiline
          value={freeText}
          onChangeText={setFreeText}
          placeholder="결과를 자유롭게 입력하세요"
          placeholderTextColor={COLORS.mutedForeground}
          textAlignVertical="top"
        />
      );
    }
    return null;
  }

  function renderReviewStep() {
    const gameName = selectedGame?.name ?? gameQuery.trim();
    return (
      <View>
        <View className="mb-6 mt-4">
          <Text className="mb-2 text-xs font-extrabold tracking-wide text-foreground">4 / 4</Text>
          <Text className="mb-1 text-[23px] font-extrabold leading-[31px] text-foreground">한 마디 후기</Text>
          <Text className="text-[13px] font-semibold text-muted-foreground">게임에 대한 느낌을 남겨보세요 (선택)</Text>
        </View>

        {/* Summary card */}
        <View className="mb-5 rounded-xl bg-accent p-4">
          <Text className="mb-1 text-lg font-extrabold text-accent-foreground">{gameName || '-'}</Text>
          <Text className="text-xs font-semibold text-foreground">
            {date}  ·  {players.length}명  ·  {RESULT_TYPES.find(r => r.value === resultType)?.label}
          </Text>
        </View>

        <View className="mb-6">
          <TextInput
            className="min-h-[120px] rounded-xl border border-border bg-card p-3.5 text-[15px] font-semibold leading-6 text-foreground"
            multiline
            value={review}
            onChangeText={setReview}
            placeholder="오늘 게임은 어땠나요?"
            placeholderTextColor={COLORS.mutedForeground}
            textAlignVertical="top"
          />
        </View>
      </View>
    );
  }

  const nextLabel = stepIndex === STEPS.length - 1 ? '저장하기' : '다음 →';

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Progress dots */}
      <View className="mt-4 flex-row gap-1.5 self-center">
        {STEPS.map((_, i) =>
          i <= stepIndex ? (
            <GradientView key={i} gradient="primary" className="h-1.5 w-6 rounded-full" />
          ) : (
            <View key={i} className="h-1.5 w-6 rounded-full bg-border" />
          ),
        )}
      </View>

      {/* Back */}
      <TouchableOpacity onPress={handleBack} className="flex-row items-center gap-1.5 self-start px-6 py-2.5">
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-bold text-foreground">이전</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="px-6 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {stepIndex === 0 && renderGameStep()}
          {stepIndex === 1 && renderSessionStep()}
          {stepIndex === 2 && renderResultStep()}
          {stepIndex === 3 && renderReviewStep()}
        </ScrollView>

        {/* Next / Save button */}
        <View className="px-6 pb-4 pt-2">
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed || saving}
            activeOpacity={0.85}
            className={cn('items-center justify-center overflow-hidden rounded-xl py-[18px]', !canProceed && 'bg-muted')}
          >
            {canProceed && (
              <GradientView gradient="primary" className="absolute inset-0 rounded-xl" />
            )}
            {saving ? (
              <ActivityIndicator color={canProceed ? '#FFFFFF' : COLORS.primaryForeground} />
            ) : (
              <Text className={cn('text-lg font-bold', canProceed ? 'text-white' : 'text-muted-foreground')}>
                {nextLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
