/**
 * AuthContext — 인증 상태 관리
 *
 * 현재는 AsyncStorage 기반 mock 인증을 사용합니다.
 * 실제 SDK 연동 시 아래 주석 처리된 부분을 참고하세요.
 *
 * ── 실제 카카오 로그인 SDK 연동 방법 ────────────────────────────────────────
 * 1. npm install @react-native-seoul/kakao-login
 * 2. android/app/src/main/res/values/strings.xml 에 카카오 앱키 추가:
 *    <string name="kakao_app_key">YOUR_KAKAO_APP_KEY</string>
 * 3. android/app/src/main/AndroidManifest.xml 에 아래 추가:
 *    <activity android:name="com.kakao.sdk.auth.AuthCodeHandlerActivity" ...>
 *       <intent-filter>
 *         <action android:name="android.intent.action.VIEW" />
 *         <category android:name="android.intent.category.DEFAULT" />
 *         <category android:name="android.intent.category.BROWSABLE" />
 *         <data android:host="oauth" android:scheme="kakao${kakao_app_key}" />
 *       </intent-filter>
 *    </activity>
 * 4. login 함수 내 kakaoLogin() 주석 해제
 *
 * ── 실제 구글 로그인 SDK 연동 방법 ──────────────────────────────────────────
 * 1. npm install @react-native-google-signin/google-signin
 * 2. Firebase Console → google-services.json → android/app/ 에 위치
 * 3. android/build.gradle 에 google-services classpath 추가
 * 4. android/app/build.gradle 에 apply plugin: 'com.google.gms.google-services' 추가
 * 5. login 함수 내 googleSignIn() 주석 해제
 */

import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── 타입 ────────────────────────────────────────────────────────────────────

export type LoginProvider = 'kakao' | 'google' | 'guest';

export interface User {
  id: string;
  nickname: string;
  email?: string;
  profileImage?: string;
  provider: LoginProvider;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (provider: LoginProvider) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'nickname' | 'profileImage'>>) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = '@boddy_user';

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 사용자 복원
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setUser(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (u: User | null) => {
    if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(u);
  }, []);

  const login = useCallback(async (provider: LoginProvider) => {
    /*
     * ── 실제 SDK 연동 시 여기를 교체하세요 ──────────────────────────────────
     *
     * [카카오]
     * import { login as kakaoLogin, getProfile } from '@react-native-seoul/kakao-login';
     * const token = await kakaoLogin();
     * const profile = await getProfile();
     * const u: User = {
     *   id: `kakao_${profile.id}`,
     *   nickname: profile.nickname,
     *   email: profile.email,
     *   profileImage: profile.profileImageUrl,
     *   provider: 'kakao',
     * };
     *
     * [구글]
     * import { GoogleSignin } from '@react-native-google-signin/google-signin';
     * GoogleSignin.configure({ webClientId: 'YOUR_WEB_CLIENT_ID' });
     * await GoogleSignin.hasPlayServices();
     * const info = await GoogleSignin.signIn();
     * const u: User = {
     *   id: `google_${info.user.id}`,
     *   nickname: info.user.name ?? '사용자',
     *   email: info.user.email,
     *   profileImage: info.user.photo ?? undefined,
     *   provider: 'google',
     * };
     * ──────────────────────────────────────────────────────────────────────────
     */

    // Mock 구현 — SDK 연동 전까지 사용
    const mockProfiles: Record<LoginProvider, User> = {
      kakao: {
        id: 'kakao_mock_001',
        nickname: '카카오 사용자',
        email: 'kakao@example.com',
        provider: 'kakao',
      },
      google: {
        id: 'google_mock_001',
        nickname: 'Google 사용자',
        email: 'google@example.com',
        provider: 'google',
      },
      guest: {
        id: 'guest_local',
        nickname: '게스트',
        provider: 'guest',
      },
    };

    await persist(mockProfiles[provider]);
  }, [persist]);

  const logout = useCallback(async () => {
    /*
     * 실제 SDK 로그아웃:
     * if (user?.provider === 'kakao') await logout() from '@react-native-seoul/kakao-login'
     * if (user?.provider === 'google') await GoogleSignin.revokeAccess(); await GoogleSignin.signOut();
     */
    await persist(null);
  }, [persist]);

  const deleteAccount = useCallback(async () => {
    /*
     * 실제 SDK 회원탈퇴:
     * if (user?.provider === 'kakao') await unlink() from '@react-native-seoul/kakao-login'
     */
    await persist(null);
  }, [persist]);

  const updateProfile = useCallback(async (data: Partial<Pick<User, 'nickname' | 'profileImage'>>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await persist(updated);
  }, [user, persist]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, deleteAccount, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
