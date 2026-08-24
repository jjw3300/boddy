import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RecommendationResponse, GameSummary } from './index';

export type RecommendStackParamList = {
  Home: undefined;
  Recommendation: undefined;
  Result: { results: RecommendationResponse };
  // game이 주어지면 상세 API 호출 없이 바로 그 데이터를 보여준다 —
  // "오늘의 추천" 미리보기처럼 아직 백엔드에 없는 목데이터를 보여줄 때 사용.
  GameDetail: { bggId: number; game?: GameSummary };
};

export type LogStackParamList = {
  LogList: undefined;
  NewLog: { initialPlayers?: { name: string; score: number }[] } | undefined;
  LogDetail: { logId: string };
  Scoreboard: undefined;
};

export type ToolkitStackParamList = {
  ToolkitHome: undefined;
  Dice: undefined;
  Coin: undefined;
  FirstPlayer: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  AppInfo: undefined;
  DeleteAccount: undefined;
  Login: undefined;
};

export type TabParamList = {
  RecommendTab: undefined;
  LogTab: undefined;
  CafeTab: undefined;
  ToolkitTab: undefined;
  ProfileTab: undefined;
};

export type RecommendStackNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<RecommendStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;
