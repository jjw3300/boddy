import BASE_URL from '../config';
import { GameSummary } from '../types';

export async function fetchGameDetail(bggId: number): Promise<GameSummary> {
  const response = await fetch(`${BASE_URL}/games/${bggId}`);

  if (!response.ok) {
    throw new Error(`게임 상세 API 오류: ${response.status}`);
  }

  return response.json();
}
