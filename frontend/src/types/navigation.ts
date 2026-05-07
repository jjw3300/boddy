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

export type TabParamList = {
  RecommendTab: undefined;
  LogTab: undefined;
  CafeTab: undefined;
  ToolkitTab: undefined;
};

export type RecommendStackNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<RecommendStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;
