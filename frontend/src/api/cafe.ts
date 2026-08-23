import BASE_URL from '../config';
import { CafeSearchResponse } from '../types';

export async function fetchNearbyCafes(
  lat: number,
  lng: number,
  radiusM: number = 2000,
): Promise<CafeSearchResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radiusM),
  });
  const response = await fetch(`${BASE_URL}/cafes?${params.toString()}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `카페 검색 API 오류: ${response.status}`);
  }
  return response.json();
}
