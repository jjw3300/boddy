import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RecommendationResponse } from './index';

export type RecommendStackParamList = {
  Home: undefined;
  Recommendation: undefined;
  Result: { results: RecommendationResponse };
  GameDetail: { bggId: number };
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
