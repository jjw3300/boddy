import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Pressable, SafeAreaView, ScrollView, Vibration,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, TimerIcon } from '../../components/Icon';
import { GradientView } from '../../components/GradientView';
import { Button } from '../../components/Button';
import { cn } from '../../lib/utils';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'TurnTimer'>;
}

type Mode = 'chess' | 'countdown';
type Phase = 'config' | 'running';

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 6;
const CHESS_MINUTE_PRESETS = [3, 5, 10, 15, 30];
const COUNTDOWN_SECOND_PRESETS = [15, 30, 60, 90, 120];
const WARNING_AT_SECONDS = 5;

const PLAYER_GRADIENTS = ['primary', 'warm', 'deep'] as const;

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function TurnTimerScreen({ navigation }: Props) {
  const [phase, setPhase] = useState<Phase>('config');
  const [mode, setMode] = useState<Mode>('countdown');
  const [playerCount, setPlayerCount] = useState(4);
  const [chessMinutes, setChessMinutes] = useState(10);
  const [countdownSeconds, setCountdownSeconds] = useState(60);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [running, setRunning] = useState(true);
  const [justEnded, setJustEnded] = useState(false);

  const warnedRef = useRef(false);
  const timeoutFiredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function start() {
    const initial = mode === 'chess'
      ? Array.from({ length: playerCount }, () => chessMinutes * 60)
      : Array.from({ length: playerCount }, () => countdownSeconds);
    setRemaining(initial);
    setCurrentPlayer(0);
    setRunning(true);
    setJustEnded(false);
    warnedRef.current = false;
    timeoutFiredRef.current = false;
    setPhase('running');
  }

  function backToConfig() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('config');
  }

  function passTurn() {
    if (phase !== 'running') return;
    setJustEnded(false);
    warnedRef.current = false;
    timeoutFiredRef.current = false;
    setCurrentPlayer(prev => {
      const next = (prev + 1) % playerCount;
      if (mode === 'countdown') {
        setRemaining(r => {
          const arr = [...r];
          arr[next] = countdownSeconds;
          return arr;
        });
      }
      return next;
    });
    setRunning(true);
  }

  // 1초마다 현재 플레이어 시간을 깎는다. 5초 전 경고 진동, 0초에 알림 진동 +
  // (카운트다운 모드는) 자동으로 다음 턴으로 넘긴다.
  useEffect(() => {
    if (phase !== 'running' || !running) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const arr = [...prev];
        const left = Math.max(0, arr[currentPlayer] - 1);
        arr[currentPlayer] = left;

        if (left === WARNING_AT_SECONDS && !warnedRef.current) {
          warnedRef.current = true;
          Vibration.vibrate([0, 120, 80, 120]);
        }

        if (left === 0 && !timeoutFiredRef.current) {
          timeoutFiredRef.current = true;
          Vibration.vibrate([0, 300, 120, 300, 120, 300]);
          setJustEnded(true);
          setRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => passTurn(), 700);
        }

        return arr;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, running, currentPlayer]);

  function changePlayerCount(n: number) {
    setPlayerCount(Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, n)));
  }

  const currentRemaining = remaining[currentPlayer] ?? 0;
  const isWarning = currentRemaining > 0 && currentRemaining <= WARNING_AT_SECONDS;
  const isTimeUp = currentRemaining === 0;

  if (phase === 'config') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start px-6 py-2.5">
          <ArrowLeftIcon size={20} color={COLORS.foreground} />
          <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
        </TouchableOpacity>

        <View className="mb-5 flex-row items-center gap-2 px-6">
          <TimerIcon size={22} color={COLORS.foreground} fill="transparent" />
          <Text className="text-xl font-bold tracking-tight text-foreground">턴 타이머</Text>
        </View>

        <ScrollView contentContainerClassName="gap-7 px-6 pb-8" showsVerticalScrollIndicator={false}>
          {/* 방식 선택 */}
          <View>
            <Text className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">방식</Text>
            <View className="flex-row gap-2.5">
              {([
                { id: 'chess' as Mode, label: '체스 타이머', desc: '남은 시간을 누적해서 관리' },
                { id: 'countdown' as Mode, label: '카운트다운', desc: '매 턴 정해진 시간으로 리셋' },
              ]).map(opt => {
                const selected = mode === opt.id;
                return (
                  <TouchableOpacity key={opt.id} onPress={() => setMode(opt.id)} activeOpacity={0.8} className="flex-1">
                    <View className={cn(
                      'rounded-xl border px-4 py-3.5',
                      selected ? 'border-primary bg-accent' : 'border-border bg-card',
                    )}>
                      <Text className="text-[15px] font-extrabold text-foreground">{opt.label}</Text>
                      <Text className="mt-0.5 text-[11px] font-medium text-muted-foreground">{opt.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 인원수 */}
          <View>
            <Text className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">인원수</Text>
            <View className="flex-row items-center gap-5">
              <TouchableOpacity
                onPress={() => changePlayerCount(playerCount - 1)}
                disabled={playerCount <= MIN_PLAYERS}
                activeOpacity={0.7}
                className={cn('h-11 w-11 items-center justify-center rounded-lg bg-primary', playerCount <= MIN_PLAYERS && 'opacity-30')}
              >
                <Text className="text-xl font-bold text-primary-foreground">－</Text>
              </TouchableOpacity>
              <Text className="w-10 text-center text-3xl font-bold text-foreground">{playerCount}</Text>
              <TouchableOpacity
                onPress={() => changePlayerCount(playerCount + 1)}
                disabled={playerCount >= MAX_PLAYERS}
                activeOpacity={0.7}
                className={cn('h-11 w-11 items-center justify-center rounded-lg bg-primary', playerCount >= MAX_PLAYERS && 'opacity-30')}
              >
                <Text className="text-xl font-bold text-primary-foreground">＋</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 시간 설정 */}
          <View>
            <Text className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">
              {mode === 'chess' ? '1인당 총 시간' : '턴당 시간'}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {(mode === 'chess' ? CHESS_MINUTE_PRESETS : COUNTDOWN_SECOND_PRESETS).map(v => {
                const selected = mode === 'chess' ? v === chessMinutes : v === countdownSeconds;
                const label = mode === 'chess' ? `${v}분` : (v < 60 ? `${v}초` : `${v / 60}분`);
                return (
                  <TouchableOpacity
                    key={v}
                    onPress={() => (mode === 'chess' ? setChessMinutes(v) : setCountdownSeconds(v))}
                    activeOpacity={0.7}
                  >
                    {selected ? (
                      <GradientView gradient="primary" className="min-w-[64px] items-center rounded-lg px-4 py-2.5">
                        <Text className="text-[14px] font-bold text-white">{label}</Text>
                      </GradientView>
                    ) : (
                      <View className="min-w-[64px] items-center rounded-lg border border-border bg-background px-4 py-2.5">
                        <Text className="text-[14px] font-bold" style={{ color: COLORS.mutedForeground }}>{label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-5">
          <Button variant="gradient" label="시작하기" onPress={start} className="h-14 rounded-xl" labelClassName="text-[16px]" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 py-2.5">
        <TouchableOpacity onPress={backToConfig} className="flex-row items-center gap-1.5 py-1.5">
          <ArrowLeftIcon size={20} color={COLORS.foreground} />
          <Text className="text-sm font-semibold text-foreground">설정으로</Text>
        </TouchableOpacity>
        <View className="rounded-md bg-accent px-2.5 py-[3px]">
          <Text className="text-[11px] font-extrabold text-accent-foreground">
            {mode === 'chess' ? '체스 타이머' : '카운트다운'}
          </Text>
        </View>
      </View>

      {/* 플레이어 칩 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2.5 px-6 py-3"
        className="grow-0"
      >
        {Array.from({ length: playerCount }, (_, i) => {
          const active = i === currentPlayer;
          const gradient = PLAYER_GRADIENTS[i % PLAYER_GRADIENTS.length];
          const timeUp = (remaining[i] ?? 0) === 0;
          return (
            <View
              key={i}
              className={cn(
                'items-center justify-center rounded-xl border px-4 py-2.5',
                active ? 'border-primary' : 'border-border',
              )}
            >
              {active ? (
                <GradientView gradient={gradient} className="absolute inset-0 rounded-xl" />
              ) : null}
              <Text className={cn('text-[13px] font-extrabold', active ? 'text-white' : 'text-foreground')}>
                P{i + 1}
              </Text>
              {mode === 'chess' && (
                <Text className={cn('mt-0.5 text-[11px] font-bold', active ? 'text-white/90' : timeUp ? 'text-destructive' : 'text-muted-foreground')}>
                  {timeUp ? '시간 초과' : formatTime(remaining[i] ?? 0)}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* 탭하면 턴 넘김 */}
      <Pressable onPress={passTurn} className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-base font-bold text-muted-foreground">Player {currentPlayer + 1} 차례</Text>
        <Text
          className={cn(
            'text-[88px] font-extrabold',
            isTimeUp ? 'text-destructive' : isWarning ? 'text-[#EA580C]' : 'text-foreground',
          )}
        >
          {formatTime(currentRemaining)}
        </Text>
        {justEnded ? (
          <Text className="mt-3 text-lg font-extrabold text-destructive">⏰ 시간 종료!</Text>
        ) : (
          <Text className="mt-3 text-sm font-semibold text-muted-foreground">화면을 탭하면 다음 플레이어로 넘어가요</Text>
        )}
      </Pressable>

      {/* 컨트롤 */}
      <View className="flex-row gap-2.5 px-6 pb-5">
        <TouchableOpacity
          onPress={() => setRunning(r => !r)}
          activeOpacity={0.8}
          className="flex-1 items-center rounded-xl border border-border bg-secondary py-4"
        >
          <Text className="text-[15px] font-extrabold text-secondary-foreground">{running ? '일시정지' : '재개'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={start} activeOpacity={0.8} className="flex-1 items-center rounded-xl border border-border bg-secondary py-4">
          <Text className="text-[15px] font-extrabold text-secondary-foreground">다시 시작</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
