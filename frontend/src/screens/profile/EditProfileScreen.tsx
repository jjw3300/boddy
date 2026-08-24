import React, { useState } from 'react';
import {
  View, Text, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, UserIcon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { GradientView } from '../../components/GradientView';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;
}

export default function EditProfileScreen({ navigation }: Props) {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert('닉네임을 입력해주세요');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 16) {
      Alert.alert('닉네임은 2~16자여야 해요');
      return;
    }
    try {
      setSaving(true);
      await updateProfile({ nickname: trimmed });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
          <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={24} color={COLORS.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-foreground">프로필 편집</Text>
          <View className="w-10" />
        </View>

        <ScrollView contentContainerClassName="px-5 pb-10 pt-8">
          {/* 아바타 */}
          <View className="mb-8 items-center">
            <GradientView gradient="primary" className="mb-2 h-24 w-24 items-center justify-center rounded-full">
              <UserIcon size={48} color="#FFFFFF" fill="transparent" />
            </GradientView>
            <Text className="mt-1 text-xs text-muted-foreground">프로필 이미지는 연동 계정에서 가져와요</Text>
          </View>

          {/* 닉네임 입력 */}
          <View className="mb-8">
            <Text className="mb-2 text-xs font-semibold tracking-wide text-foreground">닉네임</Text>
            <Input
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
              maxLength={16}
              autoFocus
              className="h-auto py-3.5 text-base font-semibold"
            />
            <Text className="mt-1 text-right text-xs text-muted-foreground">{nickname.length}/16자</Text>
          </View>

          {/* 저장 버튼 */}
          <Button
            onPress={handleSave}
            disabled={saving}
            label={saving ? '저장 중...' : '저장하기'}
            variant="gradient"
            className="h-auto rounded-xl py-4"
            labelClassName="text-[17px] font-extrabold"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
