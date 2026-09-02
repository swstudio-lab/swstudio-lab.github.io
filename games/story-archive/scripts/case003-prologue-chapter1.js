// ==========================================================
// CASE-003 — 프롤로그 + 1장(관리부서 로비/접수처) 스크립트 초안
//
// 체크리스트 대조:
// [설정] R-14는 001/002 사건을 "겪은" 적 없음 — 전부 파일/현재 관찰 기반
// [퍼즐 명분] 로비 채용기준서를 퍼즐 "전에" 먼저 발견 → 왜 후보를 추려야
//   하는지 동기가 생긴 다음에 퍼즐 진입
// [퍼즐 타입] 신규 "소거법 추리(elimination)" 타입 도입 — 001/002의
//   code/contradiction/connect/sequence와 겹치지 않음
// [실패 대가] 오답 시 suspicion 상승, 무한 재시도 아님(엔진에 새 타입
//   요청사항 별도 명시)
// [관리자 대사] "오래된 X, 의미없다" 템플릿 재사용 안 함
// [내레이션/혼잣말] 객관 묘사=내레이션, 판단/추측=혼잣말로 분리
// [인용 금지] 실제로 안 나온 대사를 "그때 그랬잖아요"식으로 인용 안 함
// ==========================================================

// ---- 신규 조건 타입 요청 (엔진) ----
// hasCase001Save는 이미 있음. hasCase002Save도 똑같은 방식으로 추가 필요:
// condition: { hasCase002Save: true/false }

// ---- 신규 아이템/노트 ----
const CASE003_NEW_ITEMS = {
  recruitment_criteria: { image: "assets/items/recruitment-criteria.png", label: "즉시 채용 기준서" },
  candidate_files: { image: "assets/items/candidate-files.png", label: "채용 후보 파일철" },
};
const CASE003_NEW_NOTES = {
  recruitment_criteria: {
    baseNote: "이 회사의 실제 채용 기준. 가족관계 확인 불가, 최근 이직/이사 이력, 실종 신고 시 수색 우선순위 낮음 — 셋 다 맞아야 대상이 된다.",
  },
};

const CASE003_PROLOGUE_AND_CHAPTER1 = {

  // ========== 프롤로그 ==========
  "prologue_registration_003": {
    "bgm": "assets/bgm/title-theme.mp3",
    "lines": [
      { "speaker": "", "text": "[RESUMING SESSION...]", "effect": "decode" },
      { "speaker": "", "text": "[신규 등록 절차 진행 중...]", "effect": "decode" },
      { "speaker": "내레이션", "text": "사번 발급. 데이터 등록." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...낯익은 과정이다. 아니, 낯익을 리가 없는데." },
      { "speaker": "내레이션", "text": "화면에 얼굴이 떠오른다. 그런데 한순간, 다른 얼굴이 겹쳤다 사라진 것 같았다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...방금 그거, 뭐였지?" },
      { "speaker": "관리자", "text": "화면 지연입니다. 자주 있는 일이에요. 사번 배정하겠습니다 — R-14." },
      { "speaker": "관리자", "text": "이번엔 현장이 아니라, 본사 내부 감사입니다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...내부 감사? 처음 듣는 업무 방식인데." },
      { "speaker": "관리자", "text": "최근 편입 처리 건수가 비정상적으로 많다는 보고가 있었습니다. 확인이 필요해요." },
      {
        "speaker": "내레이션",
        "text": "열람 권한이 열린다. CASE-001, CASE-002 — 둘 다 종결 처리되어 있다.",
        "condition": { "hasCase001Save": true }
      },
      {
        "character": "{gender}-neutral", "speaker": "조사관(나)",
        "text": "(혼잣말) ...R-07, 그리고 R-03. 파일로만 봐도 서늘한 기록이다.",
        "condition": { "hasCase001Save": true }
      },
      {
        "speaker": "내레이션",
        "text": "열람 가능한 과거 기록은 없다. 백지에 가까운 채로 시작해야 한다.",
        "condition": { "hasCase001Save": false }
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...일단 가보자. '편입 처리'라는 말부터 이상하지만." },
      { "speaker": "", "text": "[CASE-003]", "effect": "decode" }
    ],
    "next": "hq_arrival"
  },

  // ========== 1장 — 관리부서 로비/접수처 ==========
  "hq_arrival": {
    "background": "assets/backgrounds/hq-lobby.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "낡은 건물 로비. 안내데스크엔 아무도 없다. 대기석 줄만 끝없이 늘어서 있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...현장 조사만 하다가, 이 회사 사무실 자체는 처음 와본다." },
      { "speaker": "관리자", "text": "안내데스크 위 서류함, 확인해보시죠." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...본사인데 관리자는 여전히 목소리뿐이군." }
    ],
    "next": "hq_desk_search"
  },

  "hq_desk_search": {
    "background": "assets/backgrounds/hq-lobby.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "서류함 안, 코팅된 안내문 한 장이 있다.",
        "addItem": "recruitment_criteria",
        "itemImage": "assets/items/recruitment-criteria.png",
        "itemLabel": "즉시 채용 기준서"
      },
      { "speaker": "내레이션", "text": "\"즉시 채용 대상 — 가족관계 확인 불가 / 최근 이직·이사 이력 있음 / 실종 신고 시 수색 우선순위 낮음.\"" },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이게 채용 기준이라고? 사라져도 아무도 안 찾을 사람을 고른다는 뜻이잖아." },
      { "speaker": "내레이션", "text": "그 옆, 대기석에 놓인 채용 후보 파일철." },
      {
        "speaker": "내레이션",
        "text": "다섯 명의 후보 파일이 나란히 놓여있다.",
        "addItem": "candidate_files",
        "itemImage": "assets/items/candidate-files.png",
        "itemLabel": "채용 후보 파일철"
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 중 하나가 다음이라는 건가. 기준서대로 대조해보면 알 수 있을지도." },
      { "speaker": "관리자", "text": "그건 그냥 서류 정리 중인 겁니다. 신경 안 쓰셔도 돼요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...'정리 중'인 서류를 굳이 대기석에 펼쳐놨을까." }
    ],
    "next": "hq_candidate_elimination_puzzle"
  },

  "hq_candidate_elimination_puzzle": {
    "background": "assets/backgrounds/hq-lobby.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "다섯 개의 파일을 기준서와 하나씩 대조한다.",
        "puzzle": {
          "type": "elimination",
          "prompt": "즉시 채용 기준서(가족관계 확인 불가 / 최근 이직·이사 이력 / 실종 신고 시 수색 우선순위 낮음) 세 조건을 전부 만족하는 후보 하나만 남기고 나머지를 제외하라.",
          "candidates": [
            {
              "id": "cand_1", "label": "후보 1 · 34세",
              "attributes": ["가족관계: 배우자·자녀 있음", "최근 이사 이력: 없음", "수색 우선순위: 높음"]
            },
            {
              "id": "cand_2", "label": "후보 2 · 41세",
              "attributes": ["가족관계: 확인 불가", "최근 이사 이력: 3개월 전", "수색 우선순위: 보통"]
            },
            {
              "id": "cand_3", "label": "후보 3 · 27세",
              "attributes": ["가족관계: 확인 불가", "최근 이사 이력: 없음", "수색 우선순위: 보통"]
            },
            {
              "id": "cand_4", "label": "후보 4 · 52세",
              "attributes": ["가족관계: 형제 있음", "최근 이직 이력: 2개월 전", "수색 우선순위: 낮음"]
            },
            {
              "id": "cand_5", "label": "후보 5 · 29세",
              "attributes": ["가족관계: 확인 불가", "최근 이직 이력: 1개월 전", "수색 우선순위: 낮음"]
            }
          ],
          "answerId": "cand_5",
          "hint": "(혼잣말) ...기준서 세 줄, 전부 다 맞아야 한다. 하나라도 어긋나면 대상이 아니다.",
          "onSuccessSetStat": { "knowledge": 1 },
          "onFailSetStat": { "suspicion": 1 }
        }
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...후보 5. 셋 다 정확히 들어맞는다." },
      { "speaker": "관리자", "text": "...찾으셨네요. 예상보다 빠르시군요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...방금 그 말, 부정을 안 했다." }
    ],
    "next": "hq_lobby_end"
  },

  "hq_lobby_end": {
    "background": "assets/backgrounds/hq-lobby.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "로비 안쪽, \"인사기록보관실\"이라 적힌 철문이 하나 있다." },
      { "speaker": "관리자", "text": "감사 절차상, 그쪽은 권한 확인이 더 필요합니다. 잠시만요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이번엔 순순히 안 열어주는군." }
    ],
    "next": "hq_records_room"
    // hq_records_room(2장, 인사기록보관실)부터는 다음 단계에서 이어서 작성
  }

};
