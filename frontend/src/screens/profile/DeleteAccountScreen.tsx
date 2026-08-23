import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, Alert, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, ShieldIcon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'DeleteAccount'>;
}

const WARNINGS = [
  '모든 플레이 기록이 영구 삭제됩니다',
  '삭제된 데이터는 복구할 수 없어요',
  '소셜 계정 연결도 해제됩니다',
];

export default function DeleteAccountScreen({ navigation }: Props) {
  const { deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      '정말 탈퇴하시겠어요?',
      '모든 플레이 기록과 데이터가 삭제되며 복구할 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await deleteAccount();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">회원 탈퇴</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 gap-4 px-5 pt-10">
        <View className="mb-2 items-center">
          <ShieldIcon size={56} color={COLORS.destructive} fill="#FEF2F2" />
        </View>
        <Text className="text-center text-xl font-bold text-foreground">탈퇴 전에 확인해주세요</Text>
        <View className="gap-2 rounded-xl border border-border bg-red-50 p-4">
          {WARNINGS.map((w, i) => (
            <Text key={i} className="text-sm leading-[22px] text-red-600">• {w}</Text>
          ))}
        </View>

        <Button
          label={loading ? '처리 중...' : '회원 탈퇴하기'}
          onPress={handleDelete}
          variant="destructive"
          className="rounded-xl"
        />
        <Button
          label="돌아가기"
          onPress={() => navigation.goBack()}
          variant="secondary"
          className="rounded-xl bg-muted"
          labelClassName="text-muted-foreground"
        />
      </View>
    </SafeAreaView>
  );
}
