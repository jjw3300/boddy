import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView,
  Animated, Easing, Vibration, Alert,
} from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, RouletteIcon } from '../../components/Icon';
import { Button } from '../../components/Button';
import {
  getPresets, savePreset, deletePreset, generatePresetId, RoulettePreset,
} from '../../services/roulettePresets';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Roulette'>;
}

const MAX_ITEMS = 12;
const MIN_ITEMS = 2;
const WHEEL_SIZE = 280;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const WHEEL_COLORS = [
  '#FFE55C', '#FF9F1C', '#FF5E7E', '#7C3AED', '#16A34A',
  '#0D9488', '#DC2626', '#2563EB', '#D97706', '#DB2777',
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

let _itemKey = 0;
function nextItemKey() { return String(++_itemKey); }

export default function RouletteScreen({ navigation }: Props) {
  const [items, setItems] = useState<{ key: string; text: string }[]>([
    { key: nextItemKey(), text: '항목 1' },
    { key: nextItemKey(), text: '항목 2' },
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [presets, setPresets] = useState<RoulettePreset[]>([]);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  const rotAnim = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);

  useEffect(() => {
    getPresets().then(setPresets);
  }, []);

  function addItem() {
    const text = newItemText.trim();
    if (!text || items.length >= MAX_ITEMS) return;
    setItems(prev => [...prev, { key: nextItemKey(), text }]);
    setNewItemText('');
  }

  function removeItem(key: string) {
    if (items.length <= MIN_ITEMS) return;
    setItems(prev => prev.filter(i => i.key !== key));
  }

  function loadPreset(preset: RoulettePreset) {
    if (spinning) return;
    setItems(preset.items.map(text => ({ key: nextItemKey(), text })));
    setResult(null);
  }

  async function confirmSavePreset() {
    const name = presetNameInput.trim();
    if (!name) return;
    const preset: RoulettePreset = { id: generatePresetId(), name, items: items.map(i => i.text) };
    await savePreset(preset);
    setPresets(await getPresets());
    setPresetNameInput('');
    setSavingPreset(false);
  }

  function removePreset(id: string) {
    Alert.alert('프리셋 삭제', '이 프리셋을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive', onPress: async () => {
          await deletePreset(id);
          setPresets(await getPresets());
        },
      },
    ]);
  }

  function spin() {
    if (spinning || items.length < MIN_ITEMS) return;
    setSpinning(true);
    setResult(null);

    const n = items.length;
    const seg = 360 / n;
    const winnerIndex = Math.floor(Math.random() * n);
    const jitter = (Math.random() - 0.5) * seg * 0.7;
    // 포인터(맨 위)에 winnerIndex 조각이 오려면 최종 회전각(mod 360)이 이 값이어야 한다.
    const targetAngle = (((360 - (winnerIndex * seg + seg / 2)) % 360) + 360) % 360;
    const spins = 5 + Math.floor(Math.random() * 3);

    // rotationRef.current는 이전 스핀들이 누적된 절대 회전값이라, 그 나머지(mod 360)
    // 기준으로 목표각까지 얼마나 더 돌아야 하는지 계산해야 한다. 이걸 안 하고 그냥
    // targetAngle을 더하면 두 번째 스핀부터 이전 스핀의 나머지만큼 어긋나서, 화면에
    // 멈춘 조각과 결과 텍스트가 달라지는 버그가 있었다.
    const currentAngle = ((rotationRef.current % 360) + 360) % 360;
    const deltaToTarget = ((targetAngle - currentAngle) % 360 + 360) % 360;
    const delta = spins * 360 + deltaToTarget + jitter;
    const nextRotation = rotationRef.current + delta;

    Animated.timing(rotAnim, {
      toValue: nextRotation,
      duration: 4200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rotationRef.current = nextRotation;
      setSpinning(false);
      setResult(items[winnerIndex].text);
      Vibration.vibrate([0, 60, 60, 60, 60, 120]);
    });
  }

  const seg = 360 / items.length;
  const rotateStyle = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1deg'] });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start px-6 py-2.5">
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
      </TouchableOpacity>

      <View className="mb-4 flex-row items-center gap-2 px-6">
        <RouletteIcon size={22} color={COLORS.foreground} fill="transparent" />
        <Text className="text-xl font-bold tracking-tight text-foreground">룰렛</Text>
      </View>

      <ScrollView contentContainerClassName="items-center gap-6 px-6 pb-8" showsVerticalScrollIndicator={false}>
        {/* 룰렛 휠 */}
        <View className="items-center">
          <View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE + 20 }}>
            {/* 포인터 (고정) */}
            <View className="absolute left-1/2 top-0 z-10" style={{ marginLeft: -12 }}>
              <View style={{
                width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 20,
                borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.foreground,
              }} />
            </View>

            <Animated.View style={{ marginTop: 20, transform: [{ rotate: rotateStyle }] }}>
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
                {items.map((item, i) => {
                  const startAngle = i * seg;
                  const endAngle = (i + 1) * seg;
                  const midAngle = startAngle + seg / 2;
                  const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
                  const labelPos = polarToCartesian(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_RADIUS * 0.62, midAngle);
                  // 라디얼 정렬 + 뒤집힘 방지: 회전값이 ±90도를 넘어가면(= 거꾸로 보이면) 180도 보정
                  let labelRotation = midAngle - 90;
                  if (labelRotation > 90) labelRotation -= 180;
                  return (
                    <G key={item.key}>
                      <Path
                        d={wedgePath(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_RADIUS - 3, startAngle, endAngle)}
                        fill={color}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                      <SvgText
                        x={labelPos.x}
                        y={labelPos.y}
                        fill="#1C1917"
                        fontSize={13}
                        fontWeight="bold"
                        textAnchor="middle"
                        transform={`rotate(${labelRotation} ${labelPos.x} ${labelPos.y})`}
                      >
                        {truncate(item.text, 8)}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
            </Animated.View>
          </View>

          {result && !spinning && (
            <View className="mt-5 items-center rounded-xl border border-primary bg-accent px-6 py-3">
              <Text className="text-[12px] font-bold text-accent-foreground">🎉 결과</Text>
              <Text className="mt-0.5 text-xl font-extrabold text-foreground">{result}</Text>
            </View>
          )}

          <View className="mt-5 w-full px-6">
            <Button
              variant="gradient"
              label={spinning ? '돌아가는 중...' : '돌리기'}
              onPress={spin}
              disabled={spinning || items.length < MIN_ITEMS}
              className="h-14 rounded-xl"
              labelClassName="text-[16px]"
            />
          </View>
        </View>

        {/* 항목 편집 */}
        <View className="w-full">
          <Text className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground">
            항목 ({items.length}/{MAX_ITEMS})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {items.map((item, i) => (
              <View key={item.key} className="flex-row items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-3.5 pr-2">
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }} />
                <Text className="text-[13px] font-bold text-foreground">{item.text}</Text>
                {items.length > MIN_ITEMS && (
                  <TouchableOpacity onPress={() => removeItem(item.key)} className="ml-0.5 h-5 w-5 items-center justify-center rounded-full bg-muted">
                    <Text className="text-[11px] font-bold text-muted-foreground">×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {items.length < MAX_ITEMS && (
            <View className="mt-3 flex-row items-center gap-2">
              <TextInput
                className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground"
                value={newItemText}
                onChangeText={setNewItemText}
                placeholder="항목 입력 (예: 벌칙, 팀 이름...)"
                placeholderTextColor={COLORS.mutedForeground}
                onSubmitEditing={addItem}
                returnKeyType="done"
              />
              <Button label="+ 추가" size="sm" onPress={addItem} />
            </View>
          )}
        </View>

        {/* 프리셋 */}
        <View className="w-full">
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="text-xs font-semibold tracking-wide text-muted-foreground">저장된 프리셋</Text>
            <TouchableOpacity onPress={() => setSavingPreset(v => !v)}>
              <Text className="text-[12px] font-extrabold text-primary">현재 목록 저장</Text>
            </TouchableOpacity>
          </View>

          {savingPreset && (
            <View className="mb-3 flex-row items-center gap-2">
              <TextInput
                className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground"
                value={presetNameInput}
                onChangeText={setPresetNameInput}
                placeholder="프리셋 이름"
                placeholderTextColor={COLORS.mutedForeground}
                onSubmitEditing={confirmSavePreset}
                returnKeyType="done"
              />
              <Button label="저장" size="sm" onPress={confirmSavePreset} />
            </View>
          )}

          {presets.length === 0 ? (
            <Text className="text-[12px] font-medium text-muted-foreground">아직 저장된 프리셋이 없어요</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {presets.map(preset => (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => loadPreset(preset)}
                  onLongPress={() => removePreset(preset.id)}
                  activeOpacity={0.7}
                  className="rounded-full border border-border bg-card px-4 py-2"
                >
                  <Text className="text-[13px] font-bold text-foreground">{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {presets.length > 0 && (
            <Text className="mt-2 text-[11px] font-medium text-muted-foreground">탭하면 불러오기, 길게 누르면 삭제</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
