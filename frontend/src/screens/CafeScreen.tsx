import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CafeSummary } from '../types';
import { fetchNearbyCafes } from '../api/cafe';
import { requestLocationPermission, getCurrentPosition, Coords } from '../services/location';
import { COLORS } from '../design';
import { MapPinIcon, RefreshIcon, ChevronRightIcon } from '../components/Icon';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GradientView } from '../components/GradientView';
import { CafeMap } from '../components/CafeMap';

type Status = 'loading' | 'denied' | 'error' | 'ready';

function formatDistance(m: number | null): string {
  if (m === null) return '';
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function CafeCard({ cafe }: { cafe: CafeSummary }) {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(cafe.place_url)} activeOpacity={0.85}>
      <Card className="flex-row items-center gap-3 p-4">
        <GradientView gradient="warm" className="h-11 w-11 items-center justify-center rounded-lg">
          <MapPinIcon size={22} color="#FFFFFF" fill="transparent" />
        </GradientView>
        <View className="flex-1 gap-1">
          <Text className="text-[15px] font-bold text-foreground" numberOfLines={1}>{cafe.name}</Text>
          <Text className="text-[13px] text-muted-foreground" numberOfLines={1}>
            {cafe.road_address ?? cafe.address}
          </Text>
          {cafe.distance_m !== null && (
            <GradientView gradient="soft" className="mt-0.5 self-start rounded-md px-2 py-0.5">
              <Text className="text-[11px] font-extrabold text-foreground">{formatDistance(cafe.distance_m)}</Text>
            </GradientView>
          )}
        </View>
        <ChevronRightIcon size={18} color={COLORS.mutedForeground} />
      </Card>
    </TouchableOpacity>
  );
}

export default function CafeScreen() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [cafes, setCafes] = useState<CafeSummary[]>([]);
  const [userLocation, setUserLocation] = useState<Coords | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        setStatus('denied');
        return;
      }
      const { lat, lng } = await getCurrentPosition();
      setUserLocation({ lat, lng });
      const data = await fetchNearbyCafes(lat, lng);
      setCafes(data.cafes);
      setStatus('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '카페를 불러오지 못했어요.');
      setStatus('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 px-6 pb-1 pt-6">
        <MapPinIcon size={24} color={COLORS.foreground} fill="transparent" />
        <Text className="text-2xl font-bold tracking-tight text-foreground">카페 찾기</Text>
      </View>
      <Text className="mb-4 px-6 text-[13px] text-muted-foreground">내 주변 보드게임 카페</Text>

      {status === 'loading' && (
        <View className="flex-1 items-center justify-center gap-1 px-10">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-sm font-semibold text-muted-foreground">주변 카페를 찾는 중...</Text>
        </View>
      )}

      {status === 'denied' && (
        <View className="flex-1 items-center justify-center gap-1 px-10">
          <GradientView gradient="warm" className="mb-5 h-[92px] w-[92px] items-center justify-center rounded-2xl">
            <MapPinIcon size={40} color="#FFFFFF" fill="transparent" />
          </GradientView>
          <Text className="mb-1.5 text-center text-lg font-bold text-foreground">위치 권한이 필요해요</Text>
          <Text className="mb-5 text-center text-sm font-semibold text-muted-foreground">설정에서 위치 권한을 허용해주세요</Text>
          <Button label="설정 열기" variant="gradient" size="sm" onPress={() => Linking.openSettings()} className="px-5" />
        </View>
      )}

      {status === 'error' && (
        <View className="flex-1 items-center justify-center gap-1 px-10">
          <GradientView gradient="deep" className="mb-5 h-[92px] w-[92px] items-center justify-center rounded-2xl">
            <Text className="text-[42px]">😢</Text>
          </GradientView>
          <Text className="mb-1.5 text-center text-lg font-bold text-foreground">카페를 불러오지 못했어요</Text>
          <Text className="mb-5 text-center text-sm font-semibold text-muted-foreground">{errorMsg}</Text>
          <Button label="다시 시도" variant="gradient" size="sm" onPress={load} className="px-5" />
        </View>
      )}

      {status === 'ready' && userLocation && (
        <View
          style={{
            height: 260, marginHorizontal: 24, marginBottom: 14, borderRadius: 16, overflow: 'hidden',
            backgroundColor: COLORS.muted,
          }}
        >
          <CafeMap userLocation={userLocation} cafes={cafes} style={{ flex: 1 }} />
        </View>
      )}

      {status === 'ready' && cafes.length === 0 && (
        <View className="flex-1 items-center justify-center gap-1 px-10">
          <GradientView gradient="soft" className="mb-5 h-[92px] w-[92px] items-center justify-center rounded-2xl">
            <MapPinIcon size={40} color="#FF9F1C" fill="transparent" />
          </GradientView>
          <Text className="mb-1.5 text-center text-lg font-bold text-foreground">주변에 카페가 없어요</Text>
          <Text className="text-center text-sm font-semibold text-muted-foreground">반경을 넓혀서 다시 찾아볼게요</Text>
        </View>
      )}

      {status === 'ready' && cafes.length > 0 && (
        <FlatList
          data={cafes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <CafeCard cafe={item} />}
          contentContainerClassName="gap-2.5 px-6 pb-8"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity onPress={load} className="mb-2 flex-row items-center gap-1.5 self-end">
              <RefreshIcon size={14} color={COLORS.mutedForeground} />
              <Text className="text-xs font-bold text-muted-foreground">새로고침</Text>
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  );
}
