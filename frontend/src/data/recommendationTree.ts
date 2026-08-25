// ─────────────────────────────────────────────────────────────────────────
// 동적 질문 트리 — 답변마다 다음 질문 노드(next)와 태그 점수(scores)를 함께
// 갖는 그래프 구조.
//
//   genre_major ─A→ strategy_detail ─┐
//              ├─B→ party_detail    ─┼→ play_style → player_count → play_time
//              └─C→ coop_detail     ─┘   → difficulty → luck_vs_skill →
//   interaction_intensity → rule_learning_time → replayability → downtime →
//   (결과)
//
// scores의 tag는 major 태그('major:strategy' 등)이거나 recommendationTaxonomy의
// GenreTag id, 혹은 facet 태그('players:2' 등)다. 장르 소분류 태그는
// game.mechanisms와, facet은 GameSummary 기존 필드와 매칭한다 — 상세는
// recommendationScoring.ts 상단 주석 참고.
//
// 가중치 티어: HIGH=3 / MEDIUM=2 / LOW=1. "상관없음"은 scores: [] — 결과에
// 어떤 영향도 주지 않고 그냥 다음 질문으로 넘어간다.
//
// multiSelect 노드(장르 관련 4개)는 체크박스로 여러 개를 동시에 고를 수 있다.
// 여러 옵션을 고르면 scores가 전부 누적되고, 각 옵션의 next를 모아 "다음 방문
// 큐"를 만든다 — 예를 들어 Q1에서 전략+파티를 동시에 고르면
// [strategy_detail, party_detail]이 큐에 쌓이고, 하나를 마칠 때마다 큐에서
// 다음 걸 꺼내 방문한 뒤 큐가 비면 공통 꼬리(play_style)로 넘어간다.
// advanceFlow()가 이 큐 로직을 구현한다.
//
// "상관없음"은 multiSelect 노드 안에서도 배타적으로 동작해야 자연스럽다
// (다른 걸 고르면서 "다 좋아함"을 같이 고르는 건 모순) — 그 배타 처리는 UI
// 쪽(RecommendationScreen)에서 옵션 id === 'none'을 특별 취급해서 구현한다.
// ─────────────────────────────────────────────────────────────────────────

import { GENRE_TAGS, GenreMajor } from './recommendationTaxonomy';

export const WEIGHT = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

export interface ScoreDelta {
  tag: string;
  weight: number;
}

export interface AnswerOption {
  id: string;
  label: string;
  description: string;
  scores: ScoreDelta[];
  /** 다음 질문 노드 id. null이면 이 답변에서 바로 결과 계산으로 넘어간다 */
  next: string | null;
}

export interface QuestionNode {
  id: string;
  title: string;
  subtitle: string;
  /** true면 여러 옵션을 동시에 선택 가능 ("다음" 버튼으로 확정) */
  multiSelect: boolean;
  /** 옵션이 많은 노드(장르 소분류)만 true — 카드 대신 칩(태그) UI로 압축해서
   *  보여준다. multiSelect이지만 옵션이 몇 개 안 되는 노드는 카드가 더
   *  직관적이라 이 플래그를 켜지 않는다. */
  compact?: boolean;
  /** 인원수/시간처럼 결과에서 아예 제외하는 하드 필터인지 (vs 가중치 스코어링) */
  hardFilter?: boolean;
  options: AnswerOption[];
}

export const ROOT_NODE_ID = 'genre_major';

/** "상관없음" 옵션 — 항상 목록 최상단, 결과에 아무 가중치도 주지 않는다 */
function noneOption(next: string, description = '이 카테고리는 다 좋아요'): AnswerOption {
  return { id: 'none', label: '상관없음 (모두 좋아함)', description, scores: [], next };
}

/**
 * 대분류(major)에 속한 모든 소분류를 recommendationTaxonomy에서 그대로 끌어와
 * 옵션을 만든다 — 손으로 일부만 골라 적지 않기 때문에 "일부만 잘려서 나온다"는
 * 문제가 구조적으로 발생하지 않는다. "상관없음"이 항상 맨 앞에 온다.
 */
function genreOptionsFor(major: GenreMajor, next: string): AnswerOption[] {
  const tags = GENRE_TAGS.filter(t => t.major === major);
  return [
    noneOption(next),
    ...tags.map(t => ({
      id: t.id,
      label: t.label,
      description: t.description,
      scores: [{ tag: t.id, weight: WEIGHT.HIGH }],
      next,
    })),
  ];
}

export const RECOMMENDATION_TREE: Record<string, QuestionNode> = {
  // ─── Q1. 장르 대분류 ─────────────────────────────────────────────────────
  genre_major: {
    id: 'genre_major',
    title: '오늘 어떤 스타일의 게임이 당기나요?',
    subtitle: '끌리는 느낌을 모두 골라주세요 (복수 선택 가능)',
    multiSelect: true,
    options: [
      {
        id: 'strategy',
        label: '머리를 쓰는 전략 게임',
        description: '깊이 있게 계산하고 최적화하는 재미',
        scores: [{ tag: 'major:strategy', weight: WEIGHT.HIGH }],
        next: 'strategy_detail',
      },
      {
        id: 'party',
        label: '대화와 눈치 싸움',
        description: '속임수와 심리전이 오가는 파티 게임',
        scores: [{ tag: 'major:party', weight: WEIGHT.HIGH }],
        next: 'party_detail',
      },
      {
        id: 'coop',
        label: '함께 즐기는 협력/가벼운 게임',
        description: '다같이 힘을 합치거나 편하게 즐기는 게임',
        scores: [{ tag: 'major:dexterity', weight: WEIGHT.HIGH }],
        next: 'coop_detail',
      },
    ],
  },

  // ─── Q2-A/B/C. 장르 소분류 — 대분류에 속한 전체 목록을 그대로 노출 ───────
  strategy_detail: {
    id: 'strategy_detail',
    title: '전략 게임 중 선호하는 메커니즘은?',
    subtitle: '재밌게 즐겼던 방식을 모두 골라주세요 (복수 선택 가능)',
    multiSelect: true,
    compact: true,
    options: genreOptionsFor('strategy', 'play_style'),
  },
  party_detail: {
    id: 'party_detail',
    title: '어떤 형태의 상호작용을 원하시나요?',
    subtitle: '좋아하는 긴장감을 모두 골라주세요 (복수 선택 가능)',
    multiSelect: true,
    compact: true,
    options: genreOptionsFor('party', 'play_style'),
  },
  coop_detail: {
    id: 'coop_detail',
    title: '어떤 협력/가벼운 방식을 좋아하세요?',
    subtitle: '편하게 즐기고 싶은 결을 모두 골라주세요 (복수 선택 가능)',
    multiSelect: true,
    compact: true,
    options: genreOptionsFor('dexterity', 'play_style'),
  },

  // ─── Q3. 진행 스타일 (기존, High weight — 복수 선택 가능) ────────────────
  play_style: {
    id: 'play_style',
    title: '어떤 방식을 선호하세요?',
    subtitle: '게임 진행 스타일을 모두 골라주세요 (복수 선택 가능)',
    multiSelect: true,
    options: [
      { id: 'none', label: '상관없음 (모두 좋아함)', description: '아무거나 OK', scores: [], next: 'player_count' },
      { id: 'cooperative', label: '협력', description: '함께 이기자!', scores: [{ tag: 'style:cooperative', weight: WEIGHT.HIGH }], next: 'player_count' },
      { id: 'competitive', label: '경쟁', description: '내가 이긴다', scores: [{ tag: 'style:competitive', weight: WEIGHT.HIGH }], next: 'player_count' },
    ],
  },

  // ─── Q4. 인원수 (기존, Hard Filter) ──────────────────────────────────────
  player_count: {
    id: 'player_count',
    title: '몇 명이서 즐기시나요?',
    subtitle: '인원 수를 골라주세요',
    multiSelect: false,
    hardFilter: true,
    options: [
      { id: '1', label: '1명', description: '혼자서 즐기는 솔로 플레이', scores: [{ tag: 'players:1', weight: 1 }], next: 'play_time' },
      { id: '2', label: '2명', description: '1:1 진검승부', scores: [{ tag: 'players:2', weight: 1 }], next: 'play_time' },
      { id: '3', label: '3~4명', description: '소그룹 파티', scores: [{ tag: 'players:3', weight: 1 }], next: 'play_time' },
      { id: '5', label: '5명 이상', description: '대인원 왁자지껄', scores: [{ tag: 'players:5', weight: 1 }], next: 'play_time' },
    ],
  },

  // ─── Q5(신규). 한 판당 소요 시간 (Hard Filter, 4단계로 세분화) ──────────
  play_time: {
    id: 'play_time',
    title: '한 판에 얼마나 걸리면 좋을까요?',
    subtitle: '예상 플레이 시간 (결과에서 이 범위로 걸러져요)',
    multiSelect: false,
    hardFilter: true,
    options: [
      { id: 'short', label: '30분 이내', description: '빠르게 한 판', scores: [{ tag: 'time:short', weight: 1 }], next: 'difficulty' },
      { id: 'medium1', label: '30분~1시간', description: '적당하게', scores: [{ tag: 'time:medium1', weight: 1 }], next: 'difficulty' },
      { id: 'medium2', label: '1시간~2시간', description: '제대로 즐기기', scores: [{ tag: 'time:medium2', weight: 1 }], next: 'difficulty' },
      { id: 'long', label: '2시간 이상', description: '풀 올인', scores: [{ tag: 'time:long', weight: 1 }], next: 'difficulty' },
    ],
  },

  // ─── Q6. 난이도 (기존, High weight) ──────────────────────────────────────
  difficulty: {
    id: 'difficulty',
    title: '난이도는 어떻게?',
    subtitle: '어느 정도 머리를 쓸까요',
    multiSelect: false,
    options: [
      { id: 'easy', label: '쉬움', description: '입문자도 바로 OK', scores: [{ tag: 'difficulty:easy', weight: WEIGHT.HIGH }], next: 'luck_vs_skill' },
      { id: 'medium', label: '보통', description: '약간의 학습 필요', scores: [{ tag: 'difficulty:medium', weight: WEIGHT.HIGH }], next: 'luck_vs_skill' },
      { id: 'hard', label: '어려움', description: '고인물 전용', scores: [{ tag: 'difficulty:hard', weight: WEIGHT.HIGH }], next: 'luck_vs_skill' },
    ],
  },

  // ─── Q7(신규). 운 vs 실력 비율 (High weight) ─────────────────────────────
  luck_vs_skill: {
    id: 'luck_vs_skill',
    title: '운과 실력, 어느 쪽이 더 좋아요?',
    subtitle: '승패를 가르는 요소',
    multiSelect: false,
    options: [
      { id: 'skill', label: '100% 실력승부', description: '운 없이 순수하게 겨뤄요', scores: [{ tag: 'luck:none', weight: WEIGHT.HIGH }], next: 'interaction_intensity' },
      { id: 'mixed', label: '전략 중심 + 약간의 변수', description: '적당한 긴장감', scores: [{ tag: 'luck:some', weight: WEIGHT.HIGH }], next: 'interaction_intensity' },
      { id: 'luck', label: '운과 도파민 폭발', description: '한방 역전의 재미', scores: [{ tag: 'luck:high', weight: WEIGHT.HIGH }], next: 'interaction_intensity' },
    ],
  },

  // ─── Q8(신규). 상호작용 및 딴지 강도 (High weight) ───────────────────────
  interaction_intensity: {
    id: 'interaction_intensity',
    title: '다른 사람과 얼마나 부딪히고 싶으세요?',
    subtitle: '상호작용 강도',
    multiSelect: false,
    options: [
      { id: 'low', label: '각자 내 거 하기', description: '평화주의, 방해 없이', scores: [{ tag: 'interaction:low', weight: WEIGHT.HIGH }], next: 'rule_learning_time' },
      { id: 'mid', label: '은근한 자리 싸움', description: '선점하고 견제하는 정도', scores: [{ tag: 'interaction:mid', weight: WEIGHT.HIGH }], next: 'rule_learning_time' },
      { id: 'high', label: '대놓고 뺏고 공격하기', description: '매운맛, 직접 대결', scores: [{ tag: 'interaction:high', weight: WEIGHT.HIGH }], next: 'rule_learning_time' },
    ],
  },

  // ─── Q9(신규). 룰 설명/숙지 난이도 (Medium weight) ───────────────────────
  rule_learning_time: {
    id: 'rule_learning_time',
    title: '룰 설명은 얼마나 걸려도 괜찮아요?',
    subtitle: '처음 배우는 데 걸리는 시간',
    multiSelect: false,
    options: [
      { id: 'quick', label: '3분 컷', description: '바로 시작하고 싶어요', scores: [{ tag: 'rules:quick', weight: WEIGHT.MEDIUM }], next: 'replayability' },
      { id: 'normal', label: '10분 내외', description: '적당히 설명 들을게요', scores: [{ tag: 'rules:normal', weight: WEIGHT.MEDIUM }], next: 'replayability' },
      { id: 'deep', label: '20분 이상', description: '깊게 파고들 준비 됐어요', scores: [{ tag: 'rules:deep', weight: WEIGHT.MEDIUM }], next: 'replayability' },
    ],
  },

  // ─── Q10(신규). 리플레이성 및 변화도 (Medium weight) ─────────────────────
  replayability: {
    id: 'replayability',
    title: '다시 할 때 어떤 느낌이면 좋을까요?',
    subtitle: '리플레이성',
    multiSelect: false,
    options: [
      { id: 'variable', label: '매판 새로운 변주', description: '할 때마다 다르게 흘러가요', scores: [{ tag: 'replay:variable', weight: WEIGHT.MEDIUM }], next: 'downtime' },
      { id: 'familiar', label: '익숙함 속 수싸움', description: '같은 판이어도 매번 새로운 수', scores: [{ tag: 'replay:familiar', weight: WEIGHT.MEDIUM }], next: 'downtime' },
      { id: 'story', label: '스토리 및 일회성', description: '한 번의 여정을 즐겨요', scores: [{ tag: 'replay:story', weight: WEIGHT.MEDIUM }], next: 'downtime' },
    ],
  },

  // ─── Q11(신규, 마지막). 다운타임 / 턴 대기 시간 (Medium weight) ──────────
  downtime: {
    id: 'downtime',
    title: '내 차례를 기다리는 시간은 어때야 하나요?',
    subtitle: '다운타임 (마지막 질문이에요!)',
    multiSelect: false,
    options: [
      { id: 'low', label: '지루한 건 싫어요', description: '동시 진행이나 스피디한 편이 좋아요', scores: [{ tag: 'downtime:low', weight: WEIGHT.MEDIUM }], next: null },
      { id: 'high', label: '남의 턴 구경도 재밌어요', description: '느긋하게 즐겨도 괜찮아요', scores: [{ tag: 'downtime:high', weight: WEIGHT.MEDIUM }], next: null },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 진행 상태 & 다음 노드 계산 — 화면(RecommendationScreen)이 들고 있을 상태.
// multiSelect 노드는 여러 옵션의 next를 "방문 큐"에 순서대로 쌓아두고, 큐가
// 빌 때까지 하나씩 방문한 뒤에야 공통 꼬리(play_style)로 넘어간다.
// ─────────────────────────────────────────────────────────────────────────

export interface FlowState {
  /** null이면 질문이 모두 끝난 것 — accumulated를 채점에 넘긴다 */
  currentNodeId: string | null;
  /** 아직 방문하지 않은 노드 id 큐 (multiSelect에서 여러 개를 고르면 쌓임) */
  pendingQueue: string[];
  /** 지금까지 쌓인 점수 */
  accumulated: ScoreDelta[];
  visited: string[];
}

export function createInitialFlowState(): FlowState {
  return { currentNodeId: ROOT_NODE_ID, pendingQueue: [], accumulated: [], visited: [] };
}

/**
 * 현재 노드에서 선택된 옵션(들)을 확정하고 다음 상태를 계산한다.
 * - single-select: selectedOptionIds는 항상 길이 1.
 * - multiSelect: 선택된 옵션들의 scores를 모두 더하고, next들을 큐에 추가한다.
 * state.currentNodeId가 null인 상태로는 호출하지 않는다 (호출 쪽에서 null이면
 * 바로 결과 계산으로 넘어가고 advanceFlow를 다시 부르지 않는다).
 */
export function advanceFlow(state: FlowState & { currentNodeId: string }, selectedOptionIds: string[]): FlowState {
  const node = RECOMMENDATION_TREE[state.currentNodeId];
  const selected = node.options.filter(o => selectedOptionIds.includes(o.id));

  const newScores = selected.flatMap(o => o.scores);
  const newNextIds = [...new Set(selected.map(o => o.next).filter((id): id is string => id !== null))];

  // 여러 갈래(예: 전략+파티+협력 상세)가 같은 다음 질문(예: play_style)을
  // 가리키는 경우가 흔하다 — 이미 큐에 있거나 이미 지나온 질문이면 다시 넣지
  // 않아야 그 질문이 갈래 수만큼 중복으로 나오는 걸 막는다.
  const queue = [
    ...state.pendingQueue,
    ...newNextIds.filter(id =>
      id !== state.currentNodeId
      && !state.pendingQueue.includes(id)
      && !state.visited.includes(id),
    ),
  ];
  const visited = [...state.visited, state.currentNodeId];
  const accumulated = [...state.accumulated, ...newScores];

  const [nextNodeId, ...restQueue] = queue;

  return {
    currentNodeId: nextNodeId ?? null,
    pendingQueue: restQueue,
    accumulated,
    visited,
  };
}
