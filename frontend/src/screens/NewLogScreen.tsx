import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogStackParamList } from '../types/navigation';
import { PlayLog, LogPlayer, ResultType, WinLossResult, ResultData } from '../types/log';
import { GameSearchResult } from '../types';
import { searchGames } from '../api/games';
import { saveLog, generateId, todayStr } from '../services/logStorage';
import { COLORS, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { ArrowLeftIcon } from '../components/Icon';

const STEPS = ['game', 'session', 'result', 'review'] as const;

const RESULT_TYPES: {
  value: ResultType;
  label: string;
  desc: string;
  bg: string;
  bottom: string;
}[] = [
  { value: 'score',    label: '점수', desc: '숫자 점수',   bg: '#A8C8E888', bottom: COLORS.paintBlue },
  { value: 'win_loss', label: '승패', desc: 'O / △ / X', bg: '#B5D5A088', bottom: '#4E9E6B' },
  { value: 'rank',     label: '순위', desc: '순서 매기기', bg: COLORS.paintYellow + '66', bottom: COLORS.paintYellow },
  { value: 'free',     label: '자유', desc: '자유 입력',   bg: COLORS.woodLight, bottom: COLORS.woodMid },
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
        <View style={styles.questionBox}>
          <Text style={styles.stepLabel}>1 / 4</Text>
          <Text style={styles.question}>어떤 게임을 했나요?</Text>
          <Text style={styles.questionSub}>게임 이름을 검색하거나 직접 입력하세요</Text>
        </View>

        {/* Selected game badge */}
        {selectedGame && (
          <View style={styles.selectedGameRow}>
            <View style={styles.selectedGameBadge}>
              <Text style={styles.selectedGameText} numberOfLines={1}>
                ✓  {selectedGame.name}
              </Text>
            </View>
            <TouchableOpacity onPress={clearSelectedGame} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.searchInput}
              value={gameQuery}
              onChangeText={text => {
                setGameQuery(text);
                if (selectedGame) setSelectedGame(null);
              }}
              placeholder="게임 이름 입력..."
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <View style={styles.searchBtnWrapper}>
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
              <Text style={styles.searchBtnText}>검색</Text>
            </TouchableOpacity>
            <View style={styles.searchBtnBottom} />
          </View>
        </View>

        {searching && (
          <View style={styles.searchingBox}>
            <ActivityIndicator color={COLORS.wood} />
            <Text style={styles.searchingText}>검색 중...</Text>
          </View>
        )}

        {searchResults.length > 0 && (
          <View style={styles.resultsList}>
            {searchResults.map(item => (
              <TouchableOpacity
                key={item.bgg_id}
                style={styles.resultItem}
                onPress={() => selectSearchResult(item)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.resultItemName}>{item.name}</Text>
                  {item.year && (
                    <Text style={styles.resultItemYear}>{item.year}년</Text>
                  )}
                </View>
                <Text style={styles.resultItemArrow}>›</Text>
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
        <View style={styles.questionBox}>
          <Text style={styles.stepLabel}>2 / 4</Text>
          <Text style={styles.question}>세션 정보</Text>
          <Text style={styles.questionSub}>날짜와 참여 인원을 설정하세요</Text>
        </View>

        {/* Date */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>날짜</Text>
          <View style={styles.fieldWrapper}>
            <TextInput
              style={styles.fieldInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Players */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>참여자</Text>
          <View style={styles.playersList}>
            {players.map(p => (
              <View key={p.id} style={styles.playerRow}>
                <View style={styles.playerChip}>
                  <Text style={styles.playerChipText}>{p.name}</Text>
                </View>
                {players.length > 1 && (
                  <TouchableOpacity
                    style={styles.removePlayerBtn}
                    onPress={() => removePlayer(p.id)}
                  >
                    <Text style={styles.removePlayerBtnText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.addPlayerRow}>
            <TextInput
              style={styles.addPlayerInput}
              value={playerInput}
              onChangeText={setPlayerInput}
              placeholder="이름 입력..."
              placeholderTextColor={COLORS.textSecondary}
              onSubmitEditing={addPlayer}
              returnKeyType="done"
            />
            <View style={styles.addPlayerBtnWrapper}>
              <TouchableOpacity style={styles.addPlayerBtn} onPress={addPlayer} activeOpacity={0.85}>
                <Text style={styles.addPlayerBtnText}>+ 추가</Text>
              </TouchableOpacity>
              <View style={styles.addPlayerBtnBottom} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  function renderResultStep() {
    return (
      <View>
        <View style={styles.questionBox}>
          <Text style={styles.stepLabel}>3 / 4</Text>
          <Text style={styles.question}>결과를 기록해요</Text>
          <Text style={styles.questionSub}>형식을 선택하고 결과를 입력하세요</Text>
        </View>

        {/* Result type selector */}
        <View style={styles.resultTypeGrid}>
          {RESULT_TYPES.map(rt => {
            const active = resultType === rt.value;
            return (
              <View key={rt.value} style={styles.resultTypeWrapper}>
                <TouchableOpacity
                  style={[
                    styles.resultTypeBlock,
                    { backgroundColor: active ? rt.bg : COLORS.bgDeep },
                    active && styles.resultTypeBlockActive,
                  ]}
                  onPress={() => setResultType(rt.value)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.resultTypeLabel, active && { color: rt.bottom }]}>
                    {rt.label}
                  </Text>
                  <Text style={styles.resultTypeDesc}>{rt.desc}</Text>
                </TouchableOpacity>
                <View style={[
                  styles.resultTypeBottom,
                  { backgroundColor: active ? rt.bottom : COLORS.woodLight },
                ]} />
              </View>
            );
          })}
        </View>

        {/* Result data entry */}
        <View style={styles.resultTableSection}>
          {renderResultTable()}
        </View>
      </View>
    );
  }

  function renderResultTable() {
    if (resultType === 'score') {
      return (
        <View style={styles.resultTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderName]}>참여자</Text>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderValue]}>점수</Text>
          </View>
          {scoreEntries.map((entry, idx) => {
            const player = players.find(p => p.id === entry.player_id);
            return (
              <View key={entry.player_id} style={styles.tableRow}>
                <Text style={styles.tablePlayerName}>{player?.name ?? '-'}</Text>
                <TextInput
                  style={styles.scoreInput}
                  keyboardType="numeric"
                  value={entry.score}
                  onChangeText={val => {
                    const updated = [...scoreEntries];
                    updated[idx] = { ...updated[idx], score: val };
                    setScoreEntries(updated);
                  }}
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
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
        <View style={styles.resultTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderName]}>참여자</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>결과</Text>
          </View>
          {winLossEntries.map((entry, idx) => {
            const player = players.find(p => p.id === entry.player_id);
            return (
              <View key={entry.player_id} style={styles.tableRow}>
                <Text style={styles.tablePlayerName}>{player?.name ?? '-'}</Text>
                <View style={styles.winLossButtons}>
                  {(['win', 'draw', 'loss'] as WinLossResult[]).map(res => {
                    const active = entry.result === res;
                    const label = res === 'win' ? 'O' : res === 'draw' ? '△' : 'X';
                    const activeColor =
                      res === 'win' ? '#4E9E6B' : res === 'draw' ? COLORS.woodMid : COLORS.paintRed;
                    return (
                      <TouchableOpacity
                        key={res}
                        style={[
                          styles.winLossBtn,
                          active && { backgroundColor: activeColor, borderColor: activeColor },
                        ]}
                        onPress={() => {
                          const updated = [...winLossEntries];
                          updated[idx] = { ...updated[idx], result: res };
                          setWinLossEntries(updated);
                        }}
                      >
                        <Text style={[styles.winLossBtnText, active && styles.winLossBtnTextActive]}>
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
        <View style={styles.resultTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderName]}>참여자</Text>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderValue]}>순위</Text>
          </View>
          {rankEntries.map((entry, idx) => {
            const player = players.find(p => p.id === entry.player_id);
            return (
              <View key={entry.player_id} style={styles.tableRow}>
                <Text style={styles.tablePlayerName}>{player?.name ?? '-'}</Text>
                <TextInput
                  style={styles.scoreInput}
                  keyboardType="numeric"
                  value={entry.rank}
                  onChangeText={val => {
                    const updated = [...rankEntries];
                    updated[idx] = { ...updated[idx], rank: val };
                    setRankEntries(updated);
                  }}
                  placeholder="1"
                  placeholderTextColor={COLORS.textSecondary}
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
          style={styles.freeInput}
          multiline
          value={freeText}
          onChangeText={setFreeText}
          placeholder="결과를 자유롭게 입력하세요"
          placeholderTextColor={COLORS.textSecondary}
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
        <View style={styles.questionBox}>
          <Text style={styles.stepLabel}>4 / 4</Text>
          <Text style={styles.question}>한 마디 후기</Text>
          <Text style={styles.questionSub}>게임에 대한 느낌을 남겨보세요 (선택)</Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryGameName}>{gameName || '-'}</Text>
          <Text style={styles.summaryMeta}>
            {date}  ·  {players.length}명  ·  {RESULT_TYPES.find(r => r.value === resultType)?.label}
          </Text>
        </View>

        <View style={styles.sectionBlock}>
          <TextInput
            style={styles.reviewInput}
            multiline
            value={review}
            onChangeText={setReview}
            placeholder="오늘 게임은 어땠나요?"
            placeholderTextColor={COLORS.textSecondary}
            textAlignVertical="top"
          />
        </View>
      </View>
    );
  }

  const nextLabel = stepIndex === STEPS.length - 1 ? '저장하기' : '다음 →';

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressTrack}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]}
          />
        ))}
      </View>

      {/* Back */}
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <ArrowLeftIcon size={20} color={COLORS.woodDark} />
        <Text style={styles.backText}>이전</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {stepIndex === 0 && renderGameStep()}
          {stepIndex === 1 && renderSessionStep()}
          {stepIndex === 2 && renderResultStep()}
          {stepIndex === 3 && renderReviewStep()}
        </ScrollView>

        {/* Next / Save button */}
        <View style={styles.nextArea}>
          <View style={styles.nextBtnWrapper}>
            <TouchableOpacity
              style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
              onPress={handleNext}
              disabled={!canProceed || saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.textOnWood} />
              ) : (
                <Text style={styles.nextBtnText}>{nextLabel}</Text>
              )}
            </TouchableOpacity>
            <View style={[styles.nextBtnBottom, !canProceed && styles.nextBtnBottomDisabled]} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  progressTrack: {
    flexDirection: 'row', gap: 8,
    marginTop: 16, alignSelf: 'center',
  },
  progressDot: {
    width: 28, height: 10, borderRadius: 5,
    backgroundColor: COLORS.woodLight,
    borderWidth: 1.5, borderColor: COLORS.woodMid,
  },
  progressDotActive: { backgroundColor: COLORS.wood, borderColor: COLORS.woodDark },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 24, alignSelf: 'flex-start',
  },
  backText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },

  questionBox: { marginTop: 16, marginBottom: 24 },
  stepLabel: {
    fontSize: 12, fontWeight: '800', color: COLORS.textSecondary,
    letterSpacing: 1, marginBottom: 8,
  },
  question: {
    fontSize: 24, fontWeight: '900', color: COLORS.textPrimary,
    lineHeight: 32, marginBottom: 4,
  },
  questionSub: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },

  // Next button
  nextArea: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  nextBtnWrapper: { ...BLOCK_SHADOW_SM },
  nextBtn: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.woodDark,
    borderBottomWidth: 0,
  },
  nextBtnDisabled: { backgroundColor: COLORS.bgDeep, borderColor: COLORS.woodLight },
  nextBtnBottom: {
    height: 7, backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  nextBtnBottomDisabled: { backgroundColor: COLORS.woodLight },
  nextBtnText: { fontSize: 16, fontWeight: '900', color: COLORS.textOnWood },

  // ─── Step 0: Game search ───────────────────────────────────────
  selectedGameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  selectedGameBadge: {
    flex: 1,
    backgroundColor: '#B5D5A0',
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#4E9E6B',
  },
  selectedGameText: { fontSize: 14, fontWeight: '800', color: '#2E5E3A' },
  clearBtn: {
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: COLORS.bgDeep,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5, borderColor: COLORS.woodLight,
  },
  clearBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  searchBtnWrapper: {},
  searchBtn: {
    backgroundColor: COLORS.paintBlue,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#2D5E8A',
    borderBottomWidth: 0,
  },
  searchBtnBottom: {
    height: 5,
    backgroundColor: '#2D5E8A',
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  searchBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.textOnWood },

  searchingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  searchingText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },

  resultsList: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    backgroundColor: COLORS.cardLight,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.woodLight,
  },
  resultItemName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  resultItemYear: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  resultItemArrow: { fontSize: 20, color: COLORS.woodMid, fontWeight: '300' },

  // ─── Step 1: Session ──────────────────────────────────────────
  sectionBlock: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: COLORS.textSecondary,
    marginBottom: 10, letterSpacing: 0.5,
  },
  fieldWrapper: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fieldInput: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },

  playersList: { gap: 8, marginBottom: 10 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerChip: {
    flex: 1,
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: COLORS.woodMid,
  },
  playerChipText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },
  removePlayerBtn: {
    width: 34, height: 34,
    backgroundColor: '#F0B0A8',
    borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.paintRed,
  },
  removePlayerBtnText: { fontSize: 18, color: COLORS.paintRed, fontWeight: '700' },

  addPlayerRow: { flexDirection: 'row', gap: 8 },
  addPlayerInput: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  addPlayerBtnWrapper: {},
  addPlayerBtn: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: COLORS.woodDark,
    borderBottomWidth: 0,
  },
  addPlayerBtnBottom: {
    height: 5, backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  addPlayerBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.textOnWood },

  // ─── Step 2: Result ──────────────────────────────────────────
  resultTypeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  resultTypeWrapper: { width: '47%' },
  resultTypeBlock: {
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 0,
  },
  resultTypeBlockActive: { borderColor: 'rgba(0,0,0,0.15)' },
  resultTypeBottom: {
    height: 6,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  resultTypeLabel: {
    fontSize: 17, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2,
  },
  resultTypeDesc: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },

  resultTableSection: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    overflow: 'hidden',
  },
  resultTable: {},
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.woodLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tableHeaderCell: { fontSize: 12, fontWeight: '800', color: COLORS.woodDark },
  tableHeaderName: { flex: 2 },
  tableHeaderValue: { flex: 1, textAlign: 'center' },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderColor: COLORS.woodLight,
  },
  tablePlayerName: {
    flex: 2, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary,
  },
  scoreInput: {
    flex: 1,
    borderWidth: 2, borderColor: COLORS.woodLight,
    borderRadius: RADIUS.sm,
    paddingVertical: 6, paddingHorizontal: 4,
    fontSize: 15, fontWeight: '800', color: COLORS.textPrimary,
    backgroundColor: COLORS.bg,
  },

  winLossButtons: { flex: 2, flexDirection: 'row', gap: 6, justifyContent: 'flex-end' },
  winLossBtn: {
    width: 40, height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.woodLight,
    backgroundColor: COLORS.bgDeep,
  },
  winLossBtnText: { fontSize: 15, fontWeight: '900', color: COLORS.textSecondary },
  winLossBtnTextActive: { color: COLORS.textOnWood },

  freeInput: {
    minHeight: 120,
    padding: 14,
    fontSize: 14, fontWeight: '600', color: COLORS.textPrimary,
    lineHeight: 22,
  },

  // ─── Step 3: Review ──────────────────────────────────────────
  summaryCard: {
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.woodMid,
    marginBottom: 20,
  },
  summaryGameName: {
    fontSize: 18, fontWeight: '900', color: COLORS.woodDark, marginBottom: 4,
  },
  summaryMeta: { fontSize: 12, fontWeight: '600', color: COLORS.woodMid },
  reviewInput: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    padding: 14,
    minHeight: 120,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});
