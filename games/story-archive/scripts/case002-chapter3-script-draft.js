// ==========================================================
// CASE-002 — 3장(R-03의 은신처) 실제 대사 스크립트 초안
// 2장의 "tower_locked_door" -> next: "r03_hideout_entry" 로 여기에 이어붙는다.
//
// 명분/해답 배치:
//   명분 — 왜 "사진 vs 지도" 중 하나만 고르는가: 시간 압박(밖에서 들리는 소리)을
//          입장 직후 바로 심어서, "다 보고 싶지만 그럴 시간이 없다"가 자연스럽게
//          플레이어의 선택이 되게 함
//   명분 — 왜 서랍 코드가 "0347"인가: (1) 방 전체에 R-03이 강박적으로 남긴
//          숫자 47을 입장 직후 먼저 보여주고, (2) 1장에서 이미 심어둔 "R-07도
//          자기 사번을 코드에 쓰는 버릇이 있었다"는 패턴을 조사관이 직접
//          떠올려서 R-03도 같았을 거라 추리 — 즉 "이 조사관들 특유의 버릇"이라는
//          시리즈 차원의 이유가 생김 (게임이 알려주는 게 아니라 조사관이 유추함)
//   해답 — 이 챕터가 주는 것: R-03이 "신호가 뭔가를 심고 있다"는 걸 이미
//          알아챘었다는 것, 그리고 혼자 해결하려다 실패했다는 정황까지.
//          "R-03이 정확히 어떻게 됐는지"의 최종 답은 4장에서 완성됨(0번 참고)
// ==========================================================

const NEW_NOTES_CH3_UPDATES = {
  // 001의 pill_bottle 노트에 002용 조건부 업데이트 추가 (기존 노트 오브젝트에 병합)
  pill_bottle: {
    updates: [
      {
        condition: { flag: "chapter3_entered_case002" },
        text: "라벨 없는 약병. 001에서도, 002에서도 나타났다. 우연이라기엔 너무 정확히 반복된다.",
      },
    ],
  },
};

const CASE002_CHAPTER3_SCENES = {

  "r03_hideout_entry": {
    "background": "assets/backgrounds/r03-hideout.png",
    "bgm": "assets/bgm/hideout-quiet.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "좁은 관리실. 벽 한쪽이 온통 메모와 사진, 붉은 실로 덮여있다.", "setFlag": { "chapter3_entered_case002": true } },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...여기, 숫자가 계속 반복된다. 47. 47. 또 47." },
      { "speaker": "내레이션", "text": "사진 모서리에도, 메모 여백에도, 심지어 벽지 위에도 — 같은 숫자가 긁혀 있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...뭘 셌던 걸까." },
      { "speaker": "내레이션", "text": "바깥 복도 쪽에서, 아까 그 잡음이 다시 가까워진다.", "fx": "shadowflash" },
      { "speaker": "관리자", "text": "오래 머무를 곳은 아닙니다. 필요한 것만 빠르게 보고 나오시죠." }
    ],
    "next": "r03_hideout_choice"
  },

  "r03_hideout_choice": {
    "background": "assets/backgrounds/r03-hideout.png",
    "bgm": "assets/bgm/hideout-quiet.mp3",
    "lines": [
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...시간이 없다. 뭘 먼저 볼지 정해야 한다." }
    ],
    "choices": [
      {
        "text": "벽에 붙은 사진들을 먼저 본다",
        "setStat": { "empathy": 1 },
        "next": "r03_hideout_photos"
      },
      {
        "text": "벽에 붙은 지도/노선도를 먼저 본다",
        "setStat": { "knowledge": 1 },
        "next": "r03_hideout_map"
      }
    ]
  },

  // ---- 분기 A: 사진 (감정적 몰입, grief 표정과 자연스럽게 이어짐) ----
  "r03_hideout_photos": {
    "background": "assets/backgrounds/r03-hideout.png",
    "bgm": "assets/bgm/hideout-quiet.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "사진들은 대부분 사람들 얼굴이다. 밑에 작게 사번이 적혀있다. R-01, R-02, R-04..." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...R-03만 없다. 자기 자신은 안 붙여놨어." },
      { "speaker": "내레이션", "text": "사진들 중 하나, 유독 손때가 많이 묻어있다. 뒷면에 작은 글씨가 있다." },
      { "speaker": "내레이션", "text": "\"이 사람은 나보다 먼저 알아챘다. 그리고 아무 말 없이 사라졌다.\"" },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...R-03도, 혼자가 아니라는 걸 알고 있었다." }
    ],
    "next": "r03_hideout_desk"
  },

  // ---- 분기 B: 지도 (전략적 정보, 13/반복 스레드 강화) ----
  "r03_hideout_map": {
    "background": "assets/backgrounds/r03-hideout.png",
    "bgm": "assets/bgm/hideout-quiet.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "지도에는 이 중계탑만 표시된 게 아니다. 붉은 실이 지도 밖 다른 지점들까지 이어져 있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...여기 하나가 아니다. 최소 여러 곳." },
      { "speaker": "내레이션", "text": "지도 구석, 작게 적힌 숫자 목록이 있다. 순서도 규칙도 없어 보이는데, 끝자리마다 동그라미가 쳐져 있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이것도 뭔가를 세고 있었던 건가. 47이랑은 다른 걸 세는 것 같은데." }
    ],
    "next": "r03_hideout_desk"
  },

  // ---- 합류 지점 ----
  "r03_hideout_desk": {
    "background": "assets/backgrounds/r03-hideout.png",
    "bgm": "assets/bgm/hideout-quiet.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "책상 위, 라벨 없는 약병 하나가 놓여있다." },
      {
        "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 약, 001 병원 조사 때 봤던 그 라벨 없는 약병이다. 똑같은 성분이야.",
        "condition": { "hasCase001Save": true }
      },
      {
        "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...라벨 없는 약병. 성분 표기가 지워져 있다. 수상한 약이다.",
        "condition": { "hasCase001Save": false }
      },
      { "speaker": "관리자", "text": "흔한 약입니다. 별 의미 없어요." },
      { "speaker": "내레이션", "text": "약병 옆, 찢어진 신분증 조각. 사번 앞자리 \"03\"만 겨우 보인다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...R-07도 그랬다. 자기 사번을 뒤에 붙이는 버릇. 코드마다, 자물쇠마다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...R-03도 같은 버릇이었다면. 03, 그리고 사방에 널린 47." },
      { "speaker": "내레이션", "text": "책상 서랍에 작은 다이얼 자물쇠가 달려있다." }
    ],
    "next": "r03_drawer_puzzle"
  },

  "r03_drawer_puzzle": {
    "background": "assets/backgrounds/r03-hideout.png",
    "bgm": "assets/bgm/hideout-quiet.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "서랍 다이얼에 손을 올린다.",
        "puzzle": {
          "type": "code",
          "prompt": "책상 서랍의 4자리 다이얼.\n(사번 조각: 03 / 방 안에 반복된 숫자: 47)",
          "code": "0347",
          "hint": "사번(03)과 방 안 곳곳의 그 숫자(47)를 순서대로 이어붙이면?",
          "onSuccessSetStat": { "knowledge": 1 }
        }
      },
      { "speaker": "내레이션", "text": "달칵. 서랍이 열린다.", "fx": "flash" },
      {
        "speaker": "내레이션",
        "text": "서랍 안, R-03의 개인 기록물이 펼쳐진 채로 있다.",
        "addItem": "r03_journal",
        "itemImage": "assets/items/r03-journal-open.png",
        "itemLabel": "R-03의 개인 기록물"
      }
    ],
    "next": "r03_journal_reveal"
  },

  "r03_journal_reveal": {
    "background": "assets/backgrounds/r03-hideout.png",
    "bgm": "assets/bgm/hideout-quiet.mp3",
    "lines": [
      { "speaker": "R-03 [기록]", "text": "\"...47일째. 아무도 못 믿겠다.\"", "typingProfile": "decelerating" },
      { "speaker": "R-03 [기록]", "text": "\"...이 신호, 사람을 재우는 게 아니다. 뭔가를 심고 있다.\"", "typingProfile": "decelerating" },
      { "speaker": "R-03 [기록]", "text": "\"...전에도 이런 신호가 있었다는 얘길 들은 적 있다. 병원 쪽에서.\"", "typingProfile": "decelerating" },
      { "speaker": "R-03 [기록]", "text": "\"관리자한테 말했다간 끝이다. 혼자 해야 한다.\"", "typingProfile": "decelerating" },
      { "speaker": "내레이션", "text": "기록은 거기서 끊긴다." },
      { "character": "{gender}-grief", "speaker": "조사관(나)", "text": "(혼잣말) ...끝까지 못 갔구나, 이 사람도." },
      { "speaker": "관리자", "text": "여기까지 온 것만으로도 충분한 성과입니다. 돌아가시겠습니까?" }
    ],
    "choices": [
      {
        "text": "여기서 멈춘다",
        "setStat": { "fear": 1 },
        "reaction": "(혼잣말) ...아니, 여기서 더 가면 나도 R-03처럼 될 것 같다.",
        "next": "ending_retreat_002"
      },
      {
        "text": "서버실로 향한다",
        "setStat": { "courage": 1 },
        "reaction": "(혼잣말) ...R-03이 못 끝낸 걸, 내가 끝내야 한다.",
        "next": "server_room_arrival"
        // ending_retreat_002 / server_room_arrival — 4장 및 엔딩은 다음 단계에서 작성
      }
    ]
  }

};
