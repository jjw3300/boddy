import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, Animated, GestureResponderEvent,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, FingerIcon } from '../../components/Icon';
import { GradientView } from '../../components/GradientView';
import { GradientName } from '../../design/gradients';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'FirstPlayer'>;
}

interface Dot { id: string; x: number; y: number; }
type Phase = 'idle' | 'ready' | 'battle' | 'done';

const MIN_PLAYERS = 2;
const READY_MS = 1300;
const DOT_SIZE = 64;
const DOT_GRADIENTS: GradientName[] = ['primary', 'warm', 'deep'];

// ─── "버티기 대결" ───────────────────────────────────────────────────────────
// Chwazi류의 "손가락 올리기" 아이디어를 빌리되, 한 번에 정답을 보여주는 대신
// 손가락이 하나씩 랜덤하게 "탈락"하며 버티는 사람이 이기는 서바이벌 방식으로
// 재해석했다. 먼저 손을 떼면(포기하면) 바로 탈락 — 끝까지 버틴 손가락이 선.

export default function FirstPlayerScreen({ navigation }: Props) {
  const [dots, setDots] = useState<Dot[]>([]);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');

  // 터치 이벤트는 setState보다 훨씬 빠르게 연속으로 들어오기 때문에, 판정 로직은
  // ref를 단일 진실 소스로 삼는다. state는 화면을 다시 그리기 위한 거울일 뿐이다.
  const phaseRef = useRef<Phase>('idle');
  const participantsRef = useRef<string[]>([]);
  const eliminatedRef = useRef<Set<string>>(new Set());
  const hiddenRef = useRef<Set<string>>(new Set());
  const winnerRef = useRef<string | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  dotsRef.current = dots;

  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const battleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);

  const popAnimsRef = useRef<Map<string, Animated.Value>>(new Map());
  function getPopAnim(id: string) {
    let a = popAnimsRef.current.get(id);
    if (!a) {
      a = new Animated.Value(1);
      popAnimsRef.current.set(id, a);
    }
    return a;
  }

  const winnerGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => () => {
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    if (battleTimerRef.current) clearInterval(battleTimerRef.current);
  }, []);

  function setPhaseBoth(p: Phase) {
    phaseRef.current = p;
    setPhase(p);
  }

  function resetGame() {
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    if (battleTimerRef.current) clearInterval(battleTimerRef.current);
    participantsRef.current = [];
    eliminatedRef.current = new Set();
    hiddenRef.current = new Set();
    winnerRef.current = null;
    popAnimsRef.current.clear();
    winnerGlow.setValue(1);
    setDots([]);
    setEliminated([]);
    setHidden([]);
    setWinner(null);
    setPhaseBoth('idle');
  }

  function popOut(id: string) {
    const anim = getPopAnim(id);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.5, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      hiddenRef.current.add(id);
      setHidden(Array.from(hiddenRef.current));
    });
  }

  function eliminate(ids: string[]) {
    const fresh = ids.filter(id => !eliminatedRef.current.has(id) && id !== winnerRef.current);
    if (fresh.length === 0) return;
    fresh.forEach(id => {
      eliminatedRef.current.add(id);
      popOut(id);
    });
    setEliminated(Array.from(eliminatedRef.current));
    checkForWinner();
  }

  function checkForWinner() {
    if (phaseRef.current !== 'battle') return;
    const survivors = participantsRef.current.filter(id => !eliminatedRef.current.has(id));
    if (survivors.length === 1) {
      const winId = survivors[0];
      winnerRef.current = winId;
      setWinner(winId);
      if (battleTimerRef.current) clearInterval(battleTimerRef.current);
      setPhaseBoth('done');
      Animated.loop(
        Animated.sequence([
          Animated.timing(winnerGlow, { toValue: 1.18, duration: 480, useNativeDriver: true }),
          Animated.timing(winnerGlow, { toValue: 1, duration: 480, useNativeDriver: true }),
        ]),
      ).start();
    } else if (survivors.length === 0) {
      // 마지막 순간 모두 손을 뗌 — 승자 없이 처음부터 다시
      resetGame();
    }
  }

  function startBattle() {
    participantsRef.current = dotsRef.current.map(d => d.id);
    eliminatedRef.current = new Set();
    setEliminated([]);
    setPhaseBoth('battle');

    battleTimerRef.current = setInterval(() => {
      const survivors = participantsRef.current.filter(id => !eliminatedRef.current.has(id));
      if (survivors.length <= 1) {
        if (battleTimerRef.current) clearInterval(battleTimerRef.current);
        checkForWinner();
        return;
      }
      const pick = survivors[Math.floor(Math.random() * survivors.length)];
      eliminate([pick]);
    }, 550 + Math.random() * 350);
  }

  function handleLayout() {
    containerRef.current?.measureInWindow((x, y) => {
      offsetRef.current = { x, y };
    });
  }

  function updateFromEvent(evt: GestureResponderEvent) {
    const liveTouches = evt.nativeEvent.touches ?? [];
    const liveIds = new Set(liveTouches.map(t => t.identifier));

    // 준비/대결 중 손가락을 뗀 경우 — 대결 중이면 즉시 탈락 처리
    if (phaseRef.current === 'ready' || phaseRef.current === 'battle') {
      const lifted = dotsRef.current
        .map(d => d.id)
        .filter(id => !liveIds.has(id) && !eliminatedRef.current.has(id));
      if (lifted.length > 0 && phaseRef.current === 'battle') {
        eliminate(lifted);
      }
    }

    const nextDots: Dot[] = liveTouches.map(t => ({
      id: t.identifier,
      x: t.pageX - offsetRef.current.x,
      y: t.pageY - offsetRef.current.y,
    }));
    setDots(nextDots);

    if (phaseRef.current === 'idle' && nextDots.length >= MIN_PLAYERS) {
      setPhaseBoth('ready');
      readyTimerRef.current = setTimeout(() => {
        if (phaseRef.current === 'ready' && dotsRef.current.length >= MIN_PLAYERS) {
          startBattle();
        } else {
          setPhaseBoth('idle');
        }
      }, READY_MS);
    } else if (phaseRef.current === 'ready' && nextDots.length < MIN_PLAYERS) {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
      setPhaseBoth('idle');
    }
  }

  const statusText = {
    idle: `모두 손가락을 화면에 올려주세요 (최소 ${MIN_PLAYERS}명)`,
    ready: '곧 시작합니다...',
    battle: '버티세요! 마지막까지 남는 손가락이 선이에요',
    done: '🎉 선이 정해졌어요!',
  }[phase];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start px-6 py-2.5">
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
      </TouchableOpacity>

      <View className="mb-1 flex-row items-center gap-2 px-6">
        <FingerIcon size={22} color={COLORS.foreground} fill="transparent" />
        <Text className="text-xl font-bold tracking-tight text-foreground">선 정하기</Text>
      </View>
      <Text className="mb-4 px-6 text-[13px] font-semibold text-muted-foreground">{statusText}</Text>

      <View
        ref={containerRef}
        onLayout={handleLayout}
        className="mx-6 mb-6 flex-1 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card"
        onStartShouldSetResponder={() => phase !== 'done'}
        onMoveShouldSetResponder={() => phase !== 'done'}
        onResponderGrant={updateFromEvent}
        onResponderMove={updateFromEvent}
        onResponderRelease={updateFromEvent}
        onResponderTerminate={updateFromEvent}
      >
        {dots.length === 0 && (
          <View className="flex-1 items-center justify-center">
            <FingerIcon size={40} color={COLORS.mutedForeground} fill="transparent" />
          </View>
        )}

        {dots.map((dot, idx) => {
          if (hidden.includes(dot.id)) return null;
          const isWinner = winner === dot.id;
          const isOut = eliminated.includes(dot.id) && !isWinner;
          const size = isWinner ? DOT_SIZE * 1.5 : DOT_SIZE;
          const anim = isWinner ? winnerGlow : getPopAnim(dot.id);
          const gradient = DOT_GRADIENTS[idx % DOT_GRADIENTS.length];

          return (
            <Animated.View
              key={dot.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: dot.x - size / 2,
                top: dot.y - size / 2,
                transform: [{ scale: anim }],
                opacity: isOut ? anim.interpolate({ inputRange: [0, 1, 1.5], outputRange: [0, 1, 1] }) : 1,
              }}
            >
              <GradientView
                gradient={isWinner ? 'primary' : gradient}
                className="items-center justify-center rounded-full"
                style={{ width: size, height: size }}
              >
                {isWinner && <Text className="text-3xl">👑</Text>}
              </GradientView>
            </Animated.View>
          );
        })}
      </View>

      {phase === 'done' && (
        <View className="gap-2.5 px-6 pb-5">
          <TouchableOpacity
            className="items-center rounded-lg border border-border bg-secondary px-5 py-3"
            onPress={resetGame}
          >
            <Text className="text-[15px] font-extrabold text-secondary-foreground">다시하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
