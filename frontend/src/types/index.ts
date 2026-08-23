export interface GameSearchResult {
  bgg_id: number;
  name: string;
  year: string | null;
}

export type PlayStyle = 'cooperative' | 'competitive' | 'both';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PlayTime = 'short' | 'medium' | 'long';
export type GameType = 'luck' | 'dexterity' | 'party' | 'strategy';

export interface RecommendationFilter {
  player_count: number | null;
  play_style: PlayStyle | null;
  difficulty: Difficulty | null;
  play_time: PlayTime | null;
  game_type: GameType | null;
}

export interface GameSummary {
  bgg_id: number;
  name: string;
  thumbnail: string | null;
  min_players: number;
  max_players: number;
  play_time: number;
  weight: number;
  description: string | null;
  game_type: GameType | null;
}

export interface RecommendationResponse {
  games: GameSummary[];
  total: number;
}

export interface CafeSummary {
  id: string;
  name: string;
  address: string;
  road_address: string | null;
  phone: string | null;
  lat: number;
  lng: number;
  distance_m: number | null;
  place_url: string;
}

export interface CafeSearchResponse {
  cafes: CafeSummary[];
  total: number;
}
