// ==========================================================
// CASE-002 — 2장(내부 복도 + 방송실) 실제 대사 스크립트 초안
// 1장(case002-chapter1-script-draft.js)의 "tower_entry" / "tower_entry_after_ask"
// 둘 다 next: "tower_corridor_intro" 로 여기에 이어붙는다.
//
// 이 챕터에서 "명분"과 "해답"을 이렇게 배치했다:
//   명분 — 왜 방송실인가: 복도에서부터 잡음이 새어나오는 방향으로 자연스럽게
//          이끌림(귀로 따라가는 것 = 조사관 직업적 반응, 게임적 강제 아님)
//   명분 — 왜 이 퍼즐인가: "정기 점검은 자동화라 사람이 손댈 일이 없다"는
//          관리자 대사를 퍼즐 풀기 "전에" 심어서, 대조 작업 자체가 "그럼 이건
//          왜 손을 탄 흔적이 있지?"라는 조사관 자신의 의문에서 나온 행동이 되게 함
//   해답 — 이 챕터가 주는 것: "삼 주 전" = R-03이 사라진 시점과 겹친다는 확신.
//          완전한 답(그게 R-03의 목소리라는 것)은 아직 안 줌 — 4장 몫으로 남김
// ==========================================================

const NEW_ITEMS_CH2 = {
  broadcast_logs: { image: "assets/items/broadcast-logs.png", label: "방송 로그 사본" },
};

const NEW_NOTES_CH2 = {
  broadcast_logs: {
    baseNote: "정기 점검 기록 사본 4부. 셋은 같은 날짜, 하나만 삼 주 전 — 그리고 표현도 미묘하게 다르다.",
  },
};

const CASE002_CHAPTER2_SCENES = {

  "tower_corridor_intro": {
    "background": "assets/backgrounds/tower-corridor.png",
    "bgm": "assets/bgm/tower-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "안쪽은 좁고 어둡다. 벽마다 알아볼 수 없는 문자들이 빼곡히 적혀있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...글자가 아니라, 같은 말을 계속 눌러쓴 것처럼 보인다." },
      { "speaker": "내레이션", "text": "복도 안쪽에서, 낮은 잡음이 규칙적으로 새어 나온다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...소리가 나는 쪽으로 가보자. 조사는 원래 귀로 먼저 하는 거니까." },
      { "speaker": "내레이션", "text": "소리를 따라가자, 작은 방송 제어실 문이 나온다." }
    ],
    "next": "broadcast_room_entry"
  },

  "broadcast_room_entry": {
    "background": "assets/backgrounds/tower-corridor.png",
    "bgm": "assets/bgm/tower-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "작은 방송 제어실. 낡은 릴테이프 여러 개가 선반에 정리되어 있다." },
      {
        "speaker": "내레이션",
        "text": "그 옆, 클립보드에 정기 점검 기록 사본 4부가 끼워져 있다.",
        "addItem": "broadcast_logs",
        "itemImage": "assets/items/broadcast-logs.png",
        "itemLabel": "방송 로그 사본"
      },
      { "speaker": "관리자", "text": "그건 오래된 정기 점검 기록입니다. 의미 없어요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "정기 점검이면, 누가 담당합니까?" },
      { "speaker": "관리자", "text": "아무도요. 그건 자동으로 처리됩니다. 사람이 손댈 일이 없어요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...'사람이 손댈 일이 없다'라. 그럼 이 네 장, 전부 똑같아야 정상 아닌가." },
      { "speaker": "내레이션", "text": "클립보드를 넘겨본다. 넉 장, 얼핏 보기엔 다 같은 문구다." }
    ],
    "next": "broadcast_contradiction_puzzle"
  },

  "broadcast_contradiction_puzzle": {
    "background": "assets/backgrounds/tower-corridor.png",
    "bgm": "assets/bgm/tower-hum.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "넉 장을 나란히 놓고 하나하나 대조한다.",
        "puzzle": {
          "type": "contradiction",
          "prompt": "정기 점검 기록 4부. 자동화된 기록이라면 전부 같아야 한다 — 다른 한 장을 짚어라.",
          "entries": [
            { "id": "log_1", "text": "[정기 점검 기록 — 07/16]\n\"...신호 안정. 이상 없음. 다음 점검까지 대기.\"" },
            { "id": "log_2", "text": "[정기 점검 기록 — 07/16]\n\"...신호 안정. 이상 없음. 다음 점검까지 대기.\"" },
            { "id": "log_3", "text": "[정기 점검 기록 — 06/25]\n\"...신호, 안정적임. 이상 없음. 다음 점검까지, 대기.\"" },
            { "id": "log_4", "text": "[정기 점검 기록 — 07/16]\n\"...신호 안정. 이상 없음. 다음 점검까지 대기.\"" }
          ],
          "answerId": "log_3",
          "maxWrongAttempts": 3,
          "onFailSetStat": { "suspicion": 1 },
          "onSuccessSetStat": { "knowledge": 1 }
        }
      }
    ],
    "next": "broadcast_reveal"
  },

  // suspicion이 오답 누적으로 올라간 경우 / 안 올라간 경우 둘 다 다음 줄부터는 동일하게
  // 이어짐(정답 자체는 항상 맞히고 넘어가는 구조 — 001 코드퍼즐과 달리 "몇 번 틀렸는지"가
  // 정보 손실이 아니라 관리자와의 긴장도에 영향을 주는 방식으로 설계했기 때문)
  "broadcast_reveal": {
    "background": "assets/backgrounds/tower-corridor.png",
    "bgm": "assets/bgm/tower-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "하나만 다르다. 나머지 셋은 전부 같은 날짜인데, 이것만 삼 주 전이다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...날짜만 다른 게 아니야. 말투도 미묘하게 다르다. 쉼표 하나까지." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이거, 나중에 끼워 넣은 거다. 누군가 삼 주 전에 손을 댔다." },
      { "speaker": "관리자", "text": "...예리하시네요." },
      { "speaker": "관리자", "text": "그래도 지금 조사엔 상관없는 부분입니다. 자동화 시스템도 가끔 오류가 나요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...방금 그건, 부정이 아니라 변명이었다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...삼 주 전. R-03이 실종 처리된 시점이랑, 겹치지 않나?" },
      { "speaker": "내레이션", "text": "확신할 순 없다. 하지만 우연이라기엔, 너무 정확히 겹친다." },
      { "speaker": "내레이션", "text": "복도 끝, 잠긴 철문 하나가 더 있다." }
    ],
    "next": "tower_locked_door"
  },

  "tower_locked_door": {
    "background": "assets/backgrounds/tower-corridor.png",
    "bgm": "assets/bgm/tower-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "철문에는 자물쇠가 없다. 그냥, 오랫동안 아무도 열지 않은 것처럼 뻑뻑하다." },
      { "speaker": "관리자", "text": "그 안쪽은 R-03이 마지막으로 머물렀던 곳입니다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...아까 그 로그, 여기서 확인할 수 있을지도 모른다." },
      { "speaker": "내레이션", "text": "문을 민다. 삐걱이며 열린다." }
    ],
    "next": "r03_hideout_entry"
    // r03_hideout_entry부터는 3장 — 다음 단계에서 이어서 작성
  }

};
