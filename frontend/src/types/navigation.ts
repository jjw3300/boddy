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
  NewLog: undefined;
  LogDetail: { logId: string };
};

export type ToolkitStackParamList = {
  ToolkitHome: undefined;
  Dice: undefined;
  Coin: undefined;
  Scoreboard: undefined;
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
