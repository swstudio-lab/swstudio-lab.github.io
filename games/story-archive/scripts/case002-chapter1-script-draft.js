// ==========================================================
// CASE-002 — 프롤로그 + 1장(중계탑 외벽) 실제 대사 스크립트 초안
// 001의 scene-data.js와 동일한 스키마. 이대로 cases/case002/scene-data.js에
// 옮겨 붙이면 됨(단, 상단 items/notes 정의는 기존 파일 구조에 맞게 병합 필요).
// ==========================================================

// ---- 상단 items 정의에 추가 ----
const NEW_ITEMS = {
  symbol_rubbing: { image: "assets/items/symbol-rubbing.png", label: "낙인 탁본" },
};

// ---- 상단 notes 정의에 추가 ----
const NEW_NOTES = {
  symbol_rubbing: {
    baseNote: "누군가 남긴 표식을 종이에 문질러 뜬 것. 001의 지하실에서 봤던 그 별 모양과 정확히 같다.",
  },
};

const CASE002_CHAPTER1_SCENES = {

  // ========== 프롤로그 ==========
  "prologue_registration": {
    "background": "assets/backgrounds/tower-exterior.png",
    "bgm": "assets/bgm/title-theme.mp3",
    "lines": [
      { "speaker": "", "text": "[RESUMING SESSION...]", "effect": "decode" },
      { "speaker": "", "text": "[신규 등록 절차 진행 중...]", "effect": "decode" },
      { "speaker": "내레이션", "text": "사번 발급. 데이터 등록. 낯익은 과정이다 — 아니, 낯익을 리가 없는데." },
      { "speaker": "내레이션", "text": "화면에 얼굴이 떠오른다. 잠깐, 반사된 자신의 얼굴을 보다가 멈칫한다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...나, 처음 온 게 맞나?" },
      { "speaker": "관리자", "text": "시스템 지연입니다. 신경 쓰지 마세요. 사번 배정하겠습니다 — R-11." },
      { "speaker": "내레이션", "text": "사번 R-11. 방금 전까지, 이 자리엔 아무도 없었다." },
      { "speaker": "관리자", "text": "새 임무입니다. CASE-001 종결 보고서, 열람 권한 드릴게요." },
      { "speaker": "내레이션", "text": "파일을 넘긴다. R-07. 실종, 수사 종결. 그리고 그 끝에 적힌 사번 하나." },
      { "speaker": "내레이션", "text": "R-03." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...내가 겪은 일도 아닌데, 왜 이렇게 익숙하지." },
      { "speaker": "관리자", "text": "신호 발신지 — 산속 버려진 중계탑입니다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이번엔 처음부터 의심하고 시작하자." },
      { "speaker": "", "text": "[CASE-002: 기음 (거짓된 복음)]", "effect": "decode" }
    ],
    "next": "tower_approach"
  },

  // ========== 1장 — 중계탑 외벽 ==========
  "tower_approach": {
    "background": "assets/backgrounds/tower-exterior.png",
    "bgm": "assets/bgm/storm-rain.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "산길을 오른다. 빗줄기가 거세다. 나무 사이로 낡은 철탑이 보인다." },
      { "speaker": "관리자", "text": "관리자입니다. 신호 확인. 목적지는 이 앞 중계탑입니다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...목소리가 달라졌다. 아니, 같은 사람이 아닌 건가." },
      { "speaker": "관리자", "text": "같은 역할을 맡고 있을 뿐입니다. 개인적인 질문은 나중에 하시죠." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...'역할'이라. 그럼 나도 그런 건가." },
      { "speaker": "내레이션", "text": "외벽을 따라 걷다, 정문 대신 반쯤 뜯긴 환기구를 발견한다." }
    ],
    "next": "tower_exterior_search"
  },

  "tower_exterior_search": {
    "background": "assets/backgrounds/tower-exterior.png",
    "bgm": "assets/bgm/storm-rain.mp3",
    "hotspots": [
      {
        "id": "mark_a", "left": "22%", "top": "58%", "width": "8%", "height": "10%",
        "closeup": "assets/closeups/mark-a.png", "label": "외벽 첫 번째 자국",
        "discoveryText": "빗물 사이로 긁힌 자국이 드러난다 — 숫자 '1'."
      },
      {
        "id": "mark_b", "left": "47%", "top": "44%", "width": "8%", "height": "10%",
        "closeup": "assets/closeups/mark-b.png", "label": "외벽 두 번째 자국",
        "discoveryText": "여기도 마찬가지다 — 숫자 '9'."
      },
      {
        "id": "mark_c", "left": "68%", "top": "62%", "width": "8%", "height": "10%",
        "closeup": "assets/closeups/mark-c.png", "label": "외벽 세 번째 자국",
        "discoveryText": "세 번째. 숫자 '3'. 전부 사람 손 높이에 맞춰 새겨져 있다."
      }
    ],
    "lines": [
      { "speaker": "내레이션", "text": "외벽을 따라 걷는다. 군데군데 긁힌 자국이 눈에 띈다." },
      {
        "character": "{gender}-neutral", "speaker": "조사관(나)",
        "text": "(혼잣말) ...이거, 비바람에 우연히 생긴 자국이 아니다. 누군가 일부러, 사람 손 닿는 높이에만 남겼어."
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...먼저 온 누군가가 남긴 표식 같은데. 하나씩 찾아보자." },
      { "speaker": "내레이션", "text": "세 개의 자국을 전부 확인했다. 1, 9, 3." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...1, 9, 3. 뭔가의 코드 같은데." },
      { "speaker": "내레이션", "text": "환기구 덮개에 녹슨 다이얼 자물쇠가 달려있다." }
    ],
    "next": "tower_dial_puzzle"
  },

  "tower_dial_puzzle": {
    "background": "assets/backgrounds/tower-exterior.png",
    "bgm": "assets/bgm/storm-rain.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "다이얼에 손을 올린다.",
        "puzzle": {
          "type": "code",
          "prompt": "환기구 덮개의 3자리 다이얼.\n(외벽에서 찾은 숫자: 1, 9, 3)",
          "code": "193",
          "hint": "찾은 순서대로 그대로 입력하면?",
          "onSuccessSetStat": { "knowledge": 1 }
        }
      },
      { "speaker": "내레이션", "text": "철컥. 잠금이 풀린다.", "fx": "flash", "sfx": "door-creak" },
      {
        "speaker": "내레이션",
        "text": "환기구 안쪽, 비닐에 싸인 종이 한 장. 뭔가를 문질러 뜬 자국이다.",
        "addItem": "symbol_rubbing",
        "itemImage": "assets/items/symbol-rubbing.png",
        "itemLabel": "낙인 탁본"
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 표시, 001 지하실에서 봤던 그 별 모양이랑 정확히 같다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) 그때도 우연이 아니라더니 — 여기까지 이어져 있었나." },
      { "speaker": "관리자", "text": "오래된 낙서예요. 안으로 들어가시죠." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...1, 9, 3. 더하면 13이잖아." },
      { "speaker": "내레이션", "text": "찜찜한 느낌을 지울 수 없지만, 지금은 넘어가는 수밖에 없다." }
    ],
    "choices": [
      {
        "text": "관리자에게 이 숫자에 대해 물어본다",
        "setStat": { "suspicion": 1 },
        "reaction": "(혼잣말) ...캐물어서 좋을 게 있을지 모르겠지만.",
        "next": "tower_entry_after_ask"
      },
      {
        "text": "아무 말 없이 넘어간다",
        "reaction": "(혼잣말) ...일단 지금은, 혼자만 알고 있자.",
        "next": "tower_entry"
      }
    ]
  },

  "tower_entry_after_ask": {
    "background": "assets/backgrounds/tower-exterior.png",
    "bgm": "assets/bgm/storm-rain.mp3",
    "lines": [
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "13이라는 숫자, 뭔가 의미가 있습니까?" },
      { "speaker": "관리자", "text": "...글쎄요. 저희 쪽 기록엔 딱히." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...대답이 반 박자 늦었다. 모르는 게 아니라, 말할지 고민한 거다." },
      { "speaker": "관리자", "text": "그보다, 안으로 들어가시는 게 먼저일 것 같은데요." },
      { "speaker": "내레이션", "text": "환기구 안쪽으로 몸을 밀어 넣는다." }
    ],
    "next": "tower_corridor_intro"
  },

  "tower_entry": {
    "background": "assets/backgrounds/tower-exterior.png",
    "bgm": "assets/bgm/storm-rain.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "환기구 안쪽으로 몸을 밀어 넣는다." }
    ],
    "next": "tower_corridor_intro"
  }

  // "tower_corridor_intro"부터는 2장 — 다음 단계에서 이어서 작성
};
