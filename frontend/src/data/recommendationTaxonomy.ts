// ─────────────────────────────────────────────────────────────────────────
// 보드게임 장르 분류 체계 — 대분류(운빨/피지컬/파티/뇌지컬) 밑에 세부 메커니즘
// 소분류를 둔다. 질문 트리(recommendationTree.ts)의 각 답변이 여기 정의된
// GenreTagId에 점수를 배분하고, 게임 DB의 게임마다 매칭되는 GenreTagId 배열을
// 붙여두면(백엔드 작업 필요 — 하단 주석 참고) 그 교집합 가중치 합으로 랭킹한다.
// ─────────────────────────────────────────────────────────────────────────

/** 대분류 — 기존 GameType('luck'|'dexterity'|'party'|'strategy')과 1:1 매칭 */
export type GenreMajor = 'luck' | 'dexterity' | 'party' | 'strategy';

export interface GenreTag {
  id: string;
  major: GenreMajor;
  label: string;
  englishLabel: string;
  /** 사용자에게 보여줄 쉬운 한 줄 설명 */
  description: string;
}

export const GENRE_TAGS: GenreTag[] = [
  // ─── 뇌지컬 / 전략 ───────────────────────────────────────────────────────
  {
    id: 'worker_placement', major: 'strategy', label: '일꾼 놓기', englishLabel: 'Worker Placement',
    description: '내 일꾼 말로 원하는 액션 칸을 먼저 차지해서 이득을 얻어요',
  },
  {
    id: 'dice_worker_placement', major: 'strategy', label: '주사위 일꾼 놓기', englishLabel: 'Dice Worker Placement',
    description: '주사위 눈이 곧 일꾼의 능력치나 행동 조건이 돼요',
  },
  {
    id: 'deck_building', major: 'strategy', label: '덱 빌딩', englishLabel: 'Deck Building',
    description: '게임 중에 카드를 사 모아 내 덱을 점점 강하게 키워요',
  },
  {
    id: 'bag_building', major: 'strategy', label: '백 빌딩', englishLabel: 'Bag Building',
    description: '주머니에 토큰을 채워 넣으며 뽑기 확률을 유리하게 만들어요',
  },
  {
    id: 'engine_building', major: 'strategy', label: '엔진 빌딩', englishLabel: 'Engine Building',
    description: '카드/효과를 연쇄로 세팅해 턴마다 굴러가는 효율을 극대화해요',
  },
  {
    id: 'tile_placement', major: 'strategy', label: '타일 놓기', englishLabel: 'Tile Placement',
    description: '보드에 타일을 이어 붙이며 영토나 길을 넓혀가요',
  },
  {
    id: 'polyomino', major: 'strategy', label: '테트리스류 / 폴리오미노', englishLabel: 'Polyomino',
    description: '여러 모양의 블록을 빈칸에 요령 있게 채워 넣어요',
  },
  {
    id: 'drafting', major: 'strategy', label: '드래프팅', englishLabel: 'Drafting',
    description: '펼쳐진 카드·주사위 중 하나씩 돌아가며 골라 가져가요',
  },
  {
    id: 'rondel', major: 'strategy', label: '론델', englishLabel: 'Rondel',
    description: '원형으로 놓인 액션 칸을 정해진 규칙대로 돌며 골라요',
  },
  {
    id: 'ap_system', major: 'strategy', label: 'AP 시스템', englishLabel: 'Action Point System',
    description: '매 턴 주어진 행동 포인트를 원하는 곳에 자유롭게 배분해요',
  },
  {
    id: '4x', major: 'strategy', label: '4X', englishLabel: '4X (Explore/Expand/Exploit/Exterminate)',
    description: '탐험-확장-착취-정복이 결합된 대형 문명/제국 경영 게임이에요',
  },
  {
    id: 'programming', major: 'strategy', label: '프로그래밍', englishLabel: 'Programming',
    description: '행동 순서를 미리 짜서 예약해두고 한 번에 실행해요',
  },
  {
    id: 'mancala', major: 'strategy', label: '만칼라', englishLabel: 'Mancala',
    description: '말을 집어 칸마다 하나씩 뿌리며 이동시키는 고전 방식이에요',
  },
  {
    id: 'abstract', major: 'strategy', label: '추상 전략', englishLabel: 'Abstract Strategy',
    description: '테마나 운 없이 규칙과 수읽기만으로 겨뤄요 (바둑·체스류)',
  },
  {
    id: 'tcg', major: 'strategy', label: 'TCG / LCG / UCG', englishLabel: 'Trading/Living/Universal Card Game',
    description: '내가 미리 짜온 전용 카드 덱으로 상대와 맞붙어요',
  },

  // ─── 파티 / 심리 / 상호작용 ─────────────────────────────────────────────
  {
    id: 'bluffing', major: 'party', label: '블러핑', englishLabel: 'Bluffing',
    description: '거짓말과 허세로 상대를 속이거나 속임수를 읽어내요',
  },
  {
    id: 'hidden_role', major: 'party', label: '마피아 / 히든 롤', englishLabel: 'Hidden Role / Social Deduction',
    description: '숨겨진 정체를 대화와 정황으로 찾아내는 게임이에요',
  },
  {
    id: 'auction', major: 'party', label: '경매', englishLabel: 'Auction',
    description: '높은 값을 부른 사람이 보상을 가져가는 입찰 방식이에요',
  },
  {
    id: 'negotiation', major: 'party', label: '협상 / 정치', englishLabel: 'Negotiation / Political',
    description: '거래·동맹·배신을 오가며 이득을 챙기는 방식이에요',
  },
  {
    id: 'deduction', major: 'party', label: '디덕션 / 추리', englishLabel: 'Deduction',
    description: '단서를 논리적으로 조합해 정답을 찾아내요',
  },
  {
    id: 'escape_room', major: 'party', label: '방탈출', englishLabel: 'Escape Room',
    description: '퍼즐과 암호를 풀어 제한 시간 안에 탈출해요',
  },

  // ─── 피지컬 / 협동 / 기타 ────────────────────────────────────────────────
  {
    id: 'cooperative', major: 'dexterity', label: '협동 / 반협동', englishLabel: 'Cooperative / Semi-Cooperative',
    description: '다같이 힘을 합쳐 시스템을 이겨요 (배신자가 섞이기도 해요)',
  },
  {
    id: 'push_your_luck', major: 'dexterity', label: '푸시 유어 럭', englishLabel: 'Push Your Luck',
    description: '더 큰 보상을 위해 위험을 무릅쓰고 운을 시험해요',
  },
  {
    id: 'roll_and_write', major: 'dexterity', label: '롤 앤 라이트', englishLabel: 'Roll & Write',
    description: '주사위나 카드 결과를 내 시트에 직접 적어가며 진행해요',
  },
  {
    id: 'trick_taking', major: 'dexterity', label: '트릭 테이킹', englishLabel: 'Trick-Taking',
    description: '정해진 문양을 따라 카드를 내고 가장 높은 카드가 점수를 얻어요',
  },
  {
    id: 'climbing', major: 'dexterity', label: '클라이밍', englishLabel: 'Climbing',
    description: '앞사람보다 높은 족보를 내며 손패를 먼저 털어내요',
  },
  {
    id: 'hand_management', major: 'dexterity', label: '핸드 관리', englishLabel: 'Hand Management',
    description: '손에 든 카드의 타이밍과 조합을 계산해 최적으로 써요',
  },
  {
    id: 'legacy', major: 'dexterity', label: '레거시', englishLabel: 'Legacy',
    description: '스티커를 붙이거나 카드를 찢는 등 플레이 결과가 계속 이어져요',
  },
];

export const GENRE_TAG_MAP: Record<string, GenreTag> = Object.fromEntries(
  GENRE_TAGS.map(tag => [tag.id, tag]),
);

// ─────────────────────────────────────────────────────────────────────────
// TODO(백엔드): GameSummary에 mechanisms: string[](위 GenreTag id 배열) 필드 추가 필요.
// BGG XML API의 <item><boardgamemechanic> 태그를 이 GenreTag 목록으로 매핑해서
// 채워 넣으면 된다 (예: BGG "Worker Placement" → 'worker_placement').
// bgg_api_token 발급 전이라 현재는 실제 매칭 데이터가 없다 — 그 전까지는
// recommendationTree.ts의 점수를 기존 GameType(대분류)에만 합산해 사용한다.
// ─────────────────────────────────────────────────────────────────────────
