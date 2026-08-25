// ─────────────────────────────────────────────────────────────────────────
// 질문 트리 답변으로 쌓인 태그 점수(ScoreDelta[])를 게임 목록에 대조해 채점하고
// 상위 N개를 뽑는다. 장르 소분류 태그는 game.mechanisms(선택 필드, 백엔드에서
// BGG 메커니즘 태그를 채워줘야 함)와 매칭하고, major/players/difficulty/time
// facet은 GameSummary의 기존 필드(game_type, min~max_players, weight,
// play_time)로 직접 매칭한다 — 이 4가지는 게임마다 이미 있는 값이라 백엔드
// 변경 없이 지금 바로 동작한다.
// ─────────────────────────────────────────────────────────────────────────

import { GameSummary, RecommendationFilter, GameType, PlayStyle, Difficulty, PlayTime } from '../types';
import { ScoreDelta } from './recommendationTree';

/** 백엔드가 mechanisms를 채워주기 전까지는 이 필드 없이도 동작하도록 optional */
export type TaggableGame = GameSummary & { mechanisms?: string[] };

export interface ScoredGame {
  game: TaggableGame;
  score: number;
}

function difficultyBucket(weight: number): 'difficulty:easy' | 'difficulty:medium' | 'difficulty:hard' {
  if (weight < 2.0) return 'difficulty:easy';
  if (weight < 3.5) return 'difficulty:medium';
  return 'difficulty:hard';
}

function timeBucket(minutes: number): 'time:short' | 'time:medium' | 'time:long' {
  if (minutes <= 30) return 'time:short';
  if (minutes <= 90) return 'time:medium';
  return 'time:long';
}

function matchesPlayerBucket(game: TaggableGame, tag: string): boolean {
  if (tag === 'players:1') return game.min_players <= 1 && game.max_players >= 1;
  if (tag === 'players:2') return game.min_players <= 2 && game.max_players >= 2;
  if (tag === 'players:3') return game.min_players <= 4 && game.max_players >= 3;
  if (tag === 'players:5') return game.max_players >= 5;
  return false;
}

/** 태그 하나에 대해 게임이 매칭되면 delta.weight를, 아니면 0을 반환 */
function scoreOne(game: TaggableGame, delta: ScoreDelta): number {
  const { tag, weight } = delta;

  if (tag.startsWith('major:')) {
    return game.game_type === tag.slice('major:'.length) ? weight : 0;
  }
  if (tag.startsWith('players:')) {
    return matchesPlayerBucket(game, tag) ? weight : 0;
  }
  if (tag.startsWith('difficulty:')) {
    return difficultyBucket(game.weight) === tag ? weight : 0;
  }
  if (tag.startsWith('time:')) {
    return timeBucket(game.play_time) === tag ? weight : 0;
  }
  // 장르 소분류 태그 — mechanisms가 아직 없는 게임은 그냥 0점(감점 아님)
  return game.mechanisms?.includes(tag) ? weight : 0;
}

export function scoreGame(game: TaggableGame, accumulated: ScoreDelta[]): number {
  return accumulated.reduce((sum, delta) => sum + scoreOne(game, delta), 0);
}

/** accumulated(질문 트리를 지나며 쌓인 점수)로 games를 채점해 상위 topN을 반환 */
export function rankTopGames(games: TaggableGame[], accumulated: ScoreDelta[], topN = 10): ScoredGame[] {
  return games
    .map(game => ({ game, score: scoreGame(game, accumulated) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// ─────────────────────────────────────────────────────────────────────────
// 지금 백엔드(/recommendations)는 태그 점수가 아니라 기존 RecommendationFilter
// (player_count/play_style/difficulty/play_time/game_type 다섯 필드)를 받는
// 필터 방식이다. 새 질문 트리로 쌓인 accumulated 점수 중 major/players/
// difficulty/time/style facet만 뽑아 그 필터 모양으로 변환해서 기존 API를
// 그대로 호출한다 (장르 소분류 태그는 백엔드가 mechanisms를 지원하기 전까지는
// 결과에 반영되지 않는다 — 위 rankTopGames를 쓰는 완전 클라이언트 채점 경로로
// 바꾸기 전까지의 임시 다리 역할).
// ─────────────────────────────────────────────────────────────────────────

const MAJOR_TAGS: GameType[] = ['strategy', 'party', 'dexterity', 'luck'];

export function deriveFilterFromScores(accumulated: ScoreDelta[]): RecommendationFilter {
  const totals = new Map<string, number>();
  for (const { tag, weight } of accumulated) {
    totals.set(tag, (totals.get(tag) ?? 0) + weight);
  }

  let bestMajor: GameType | null = null;
  let bestMajorScore = 0;
  for (const major of MAJOR_TAGS) {
    const score = totals.get(`major:${major}`) ?? 0;
    if (score > bestMajorScore) {
      bestMajor = major;
      bestMajorScore = score;
    }
  }

  const findFacet = (prefix: string) => {
    const key = [...totals.keys()].find(t => t.startsWith(prefix));
    return key ? key.slice(prefix.length) : null;
  };

  const playerBucket = findFacet('players:');

  return {
    game_type: bestMajor,
    player_count: playerBucket ? Number(playerBucket) : null,
    difficulty: findFacet('difficulty:') as Difficulty | null,
    play_time: legacyTimeBucket(findFacet('time:')),
    play_style: resolvePlayStyle(totals),
  };
}

// 진행 스타일도 체크박스 다중 선택이라 "협력"과 "경쟁"을 동시에 고를 수 있다 —
// 둘 다 골랐거나 아무 것도 안 골랐으면("상관없음") 필터 없이 both와 동일하게,
// 하나만 골랐으면 그 값 그대로 백엔드에 넘긴다.
function resolvePlayStyle(totals: Map<string, number>): PlayStyle | null {
  const hasCooperative = totals.has('style:cooperative');
  const hasCompetitive = totals.has('style:competitive');
  if (hasCooperative && hasCompetitive) return 'both';
  if (hasCooperative) return 'cooperative';
  if (hasCompetitive) return 'competitive';
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// 플레이 시간 질문은 이제 4단계(30분 이내/30분~1시간/1시간~2시간/2시간 이상)
// 하드 필터인데, 백엔드는 아직 3단계(short/medium/long)만 안다. 서버 호출
// 때는 근사치로 매핑해서 넉넉히 받아오고, applyPreciseTimeFilter로 응답을
// 정확한 분 단위 범위로 한 번 더 걸러서 진짜 하드 필터처럼 동작하게 만든다.
// ─────────────────────────────────────────────────────────────────────────

const TIME_BUCKET_TO_LEGACY: Record<string, PlayTime> = {
  short: 'short',
  medium1: 'medium',
  medium2: 'medium',
  long: 'long',
};

function legacyTimeBucket(bucket: string | null): PlayTime | null {
  return bucket ? (TIME_BUCKET_TO_LEGACY[bucket] ?? null) : null;
}

const TIME_BUCKET_MINUTES: Record<string, [number, number]> = {
  short: [0, 30],
  medium1: [30, 60],
  medium2: [60, 120],
  long: [120, Infinity],
};

/** accumulated에 담긴 정확한 시간 버킷(예: 'time:medium2')으로 games를 한 번 더 걸러낸다 */
export function applyPreciseTimeFilter<T extends { play_time: number }>(games: T[], accumulated: ScoreDelta[]): T[] {
  const timeTag = accumulated.find(d => d.tag.startsWith('time:'));
  if (!timeTag) return games;

  const bucket = timeTag.tag.slice('time:'.length);
  const range = TIME_BUCKET_MINUTES[bucket];
  if (!range) return games;

  const [min, max] = range;
  return games.filter(g => g.play_time >= min && g.play_time <= max);
}
