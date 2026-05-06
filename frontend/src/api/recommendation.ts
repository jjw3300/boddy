import { RecommendationFilter, RecommendationResponse } from '../types';

const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // Android 에뮬레이터 → localhost 매핑

export async function fetchRecommendations(
  filters: RecommendationFilter,
): Promise<RecommendationResponse> {
  const response = await fetch(`${BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error(`추천 API 오류: ${response.status}`);
  }

  return response.json();
}
