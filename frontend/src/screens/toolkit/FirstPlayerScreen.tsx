import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS, BLOCK_SHADOW, BLOCK_SHADOW_SM, RADIUS } from '../../design';
import { ArrowLeftIcon, FingerIcon } from '../../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'FirstPlayer'>;
}

// 룰렛 슬롯 딜레이 시퀀스 (ms) — 빠르게 시작해 점점 느려짐
const ROULETTE_DELAYS = [70, 70, 80, 90, 110, 130, 160, 200, 250, 310, 380, 460, 540];

const WINNER_COLORS = [
  { bg: '#FFF0B0', border: '#E8A020', text: '#8A6A00' },
  { bg: '#B5D5A0', border: '#4E9E6B', text: '#2E5E3A' },
  { bg: '#F0B0A8', border: '#D4473C', text: '#8A1A10' },
  { bg: '#A8C8E8', border: '#4A7FB5', text: '#1E4A7A' },
  { bg: COLORS.woodLight, border: COLORS.woodMid, text: COLORS.woodDark },
];

let _pid = 0;
function pid() { return String(++_pid); }

export default function FirstPlayerScreen({ navigation }: Props) {
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([
    { id: pid(), name: '플레이어 1' },
    { id: pid(), name: '플레이어 2' },
  ]);
  const [nameInput, setNameInput] = useState('');
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const winnerScale = useRef(new Animated.Value(1)).current;

  function addPlayer() {
    const name = nameInput.trim() || `플레이어 ${players.length + 1}`;
    setPlayers(prev => [...prev, { id: pid(), name }]);
    setNameInput('');
  }

  function removePlayer(id: string) {
    if (players.length <= 2) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
    setHighlighted(null);
    setWinner(null);
  }

  function pickFirst() {
    if (animating || players.length < 2) return;
    setAnimating(true);
    setWinner(null);
    setHighlighted(null);

    const winnerIdx = Math.floor(Math.random() * players.length);

    let step = 0;
    // 총 스텝 = ROULETTE_DELAYS.length, 마지막에 winnerIdx에 도달
    // i번째 스텝에서 표시할 인덱스: winnerIdx에서 역방향으로 계산
    function nextStep() {
      const remaining = ROULETTE_DELAYS.length - step;
      const idx = (winnerIdx - remaining + players.length * 10) % players.length;
      setHighlighted(idx);

      if (step >= ROULETTE_DELAYS.length - 1) {
        // 마지막: winner 확정
        setHighlighted(winnerIdx);
        setWinner(players[winnerIdx].name);
        setAnimating(false);

        // 당첨 애니메이션
        Animated.sequence([
          Animated.timing(winnerScale, { toValue: 1.12, duration: 160, useNativeDriver: true }),
          Animated.timing(winnerScale, { toValue: 0.96, duration: 120, useNativeDriver: true }),
          Animated.timing(winnerScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
          Animated.timing(winnerScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
        return;
      }

      step++;
      setTimeout(nextStep, ROULETTE_DELAYS[step] ?? 500);
    }

    setTimeout(nextStep, ROULETTE_DELAYS[0]);
  }

  function reset() {
    setHighlighted(null);
    setWinner(null);
    winnerScale.setValue(1);
  }

  const canPick = players.length >= 2 && !animating;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeftIcon size={20} color={COLORS.woodDark} />
        <Text style={styles.backText}>도구 모음</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <FingerIcon size={24} color={COLORS.woodDark} fill={COLORS.woodMid} />
        <Text style={styles.title}>선 정하기</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 플레이어 목록 */}
        <View style={styles.playerList}>
          {players.map((p, idx) => {
            const isHighlighted = highlighted === idx;
            const isWinner = winner !== null && isHighlighted;
            const colorSet = WINNER_COLORS[idx % WINNER_COLORS.length];

            const cardContent = (
              <View
                style={[
                  styles.playerCard,
                  isHighlighted && { backgroundColor: colorSet.bg, borderColor: colorSet.border },
                ]}
              >
                <Text
                  style={[
                    styles.playerName,
                    isHighlighted && { color: colorSet.text },
                  ]}
                >
                  {isWinner ? '🎉  ' : ''}{p.name}
                  {isWinner ? '  🎉' : ''}
                </Text>
                {players.length > 2 && !animating && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removePlayer(p.id)}
                  >
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            );

            return isWinner ? (
              <Animated.View
                key={p.id}
                style={[styles.playerWrapper, { transform: [{ scale: winnerScale }] }]}
              >
                {cardContent}
                <View style={[styles.cardBottom, { backgroundColor: colorSet.border }]} />
              </Animated.View>
            ) : (
              <View key={p.id} style={styles.playerWrapper}>
                {cardContent}
                <View
                  style={[
                    styles.cardBottom,
                    isHighlighted && { backgroundColor: colorSet.border },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* 플레이어 추가 */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="이름 추가..."
            placeholderTextColor={COLORS.textSecondary}
            onSubmitEditing={addPlayer}
            returnKeyType="done"
            editable={!animating}
          />
          <View style={styles.addBtnWrapper}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={addPlayer}
              activeOpacity={0.85}
              disabled={animating}
            >
              <Text style={styles.addBtnText}>+ 추가</Text>
            </TouchableOpacity>
            <View style={styles.addBtnBottom} />
          </View>
        </View>

        {/* 결과 안내 */}
        {winner && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>첫 번째 플레이어</Text>
            <Text style={styles.resultName}>{winner}</Text>
          </View>
        )}

        {/* 버튼 영역 */}
        <View style={styles.btnRow}>
          {winner && (
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>다시 정하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 정하기 버튼 (하단 고정) */}
      <View style={styles.pickArea}>
        <View style={styles.pickBtnWrapper}>
          <TouchableOpacity
            style={[styles.pickBtn, !canPick && styles.pickBtnDisabled]}
            onPress={pickFirst}
            disabled={!canPick}
            activeOpacity={0.85}
          >
            <Text style={styles.pickBtnText}>
              {animating ? '정하는 중...' : '👆  선 정하기!'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.pickBtnBottom, !canPick && styles.pickBtnBottomDisabled]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 24, alignSelf: 'flex-start',
  },
  backText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },

  playerList: { gap: 10, marginBottom: 16 },
  playerWrapper: { ...BLOCK_SHADOW_SM },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    borderWidth: 2, borderColor: COLORS.woodLight, borderBottomWidth: 0,
    paddingVertical: 16, paddingHorizontal: 20,
  },
  cardBottom: {
    height: 6, backgroundColor: COLORS.woodLight,
    borderBottomLeftRadius: RADIUS.md, borderBottomRightRadius: RADIUS.md,
    borderWidth: 2, borderTopWidth: 0, borderColor: COLORS.woodLight,
  },
  playerName: {
    flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.textPrimary,
  },
  removeBtn: {
    width: 28, height: 28,
    backgroundColor: '#F0B0A8',
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.paintRed,
  },
  removeBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.paintRed },

  addRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  addInput: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    borderWidth: 2, borderColor: COLORS.woodLight,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: COLORS.textPrimary, fontWeight: '600',
  },
  addBtnWrapper: {},
  addBtn: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 2, borderColor: COLORS.woodDark, borderBottomWidth: 0,
  },
  addBtnBottom: {
    height: 5, backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.sm, borderBottomRightRadius: RADIUS.sm,
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.textOnWood },

  resultBox: {
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.woodMid,
    marginBottom: 12,
  },
  resultTitle: { fontSize: 12, fontWeight: '800', color: COLORS.woodMid, letterSpacing: 1, marginBottom: 4 },
  resultName: { fontSize: 26, fontWeight: '900', color: COLORS.woodDark },

  btnRow: { alignItems: 'center' },
  resetBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: COLORS.bgDeep,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5, borderColor: COLORS.woodLight,
  },
  resetBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary },

  pickArea: { paddingHorizontal: 24, paddingBottom: 20 },
  pickBtnWrapper: { ...BLOCK_SHADOW },
  pickBtn: {
    backgroundColor: COLORS.paintRed,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2.5, borderColor: '#8A1A10', borderBottomWidth: 0,
  },
  pickBtnDisabled: { backgroundColor: COLORS.bgDeep, borderColor: COLORS.woodLight },
  pickBtnBottom: {
    height: 8, backgroundColor: '#8A1A10',
    borderBottomLeftRadius: RADIUS.lg, borderBottomRightRadius: RADIUS.lg,
  },
  pickBtnBottomDisabled: { backgroundColor: COLORS.woodLight },
  pickBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.textOnWood },
});
