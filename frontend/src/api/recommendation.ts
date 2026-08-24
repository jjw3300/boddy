import BASE_URL from '../config';
import { RecommendationFilter, RecommendationResponse } from '../types';

export async function fetchRecommendations(
  filters: RecommendationFilter,
): Promise<RecommendationResponse> {
  const response = await fetch(`${BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `추천 API 오류: ${response.status}`);
  }

  return response.json();
}
