import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSummary } from '../types';

const STORAGE_KEY = '@boddy:recent_recommendation';

export interface RecentRecommendation {
  games: GameSummary[];
  createdAt: string; // ISO
}

export async function saveRecentRecommendation(games: GameSummary[]): Promise<void> {
  const data: RecentRecommendation = { games, createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getRecentRecommendation(): Promise<RecentRecommendation | null> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : null;
}
