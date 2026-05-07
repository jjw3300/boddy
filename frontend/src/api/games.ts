import BASE_URL from '../config';
import { GameSummary, GameSearchResult } from '../types';

export async function fetchGameDetail(bggId: number): Promise<GameSummary> {
  const response = await fetch(`${BASE_URL}/games/${bggId}`);
  if (!response.ok) {
    throw new Error(`게임 상세 API 오류: ${response.status}`);
  }
  return response.json();
}

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  const response = await fetch(
    `${BASE_URL}/games/search?q=${encodeURIComponent(query)}`,
  );
  if (!response.ok) {
    throw new Error(`게임 검색 API 오류: ${response.status}`);
  }
  return response.json();
}
