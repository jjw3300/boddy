export type ResultType = 'score' | 'win_loss' | 'rank' | 'free';
export type WinLossResult = 'win' | 'loss' | 'draw';

export interface LogPlayer {
  id: string;
  name: string;
  user_id?: string; // 추후 실제 유저 연결용
}

export interface ScoreEntry {
  player_id: string;
  score: number | null;
}

export interface WinLossEntry {
  player_id: string;
  result: WinLossResult;
}

export interface RankEntry {
  player_id: string;
  rank: number | null;
}

export type ResultData =
  | { type: 'score'; entries: ScoreEntry[] }
  | { type: 'win_loss'; entries: WinLossEntry[] }
  | { type: 'rank'; entries: RankEntry[] }
  | { type: 'free'; text: string };

export interface PlayLog {
  id: string;
  bgg_id: number | null;
  game_name: string;
  game_thumbnail: string | null;
  played_at: string;       // YYYY-MM-DD
  players: LogPlayer[];
  result_type: ResultType;
  result_data: ResultData;
  review: string;
  created_at: string;      // ISO timestamp
}
