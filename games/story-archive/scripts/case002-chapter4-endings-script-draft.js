// ==========================================================
// CASE-002 — 4장(서버실, 클라이맥스) + 엔딩 전체 스크립트 초안
// 3장의 "server_room_arrival" 로 여기에 이어붙는다.
// 3장에서 "여기서 멈춘다"를 고르면 곧장 ending_retreat_002로 감(아래 포함).
//
// 명분/해답 배치:
//   명분 — 왜 이 주파수 숫자인가: 화면에 "코드: ####" 식으로 안 보여주고,
//          장치 밑에서 새로 발견하는 구겨진 메모 안에 자연스러운 문장으로
//          숫자가 섞여 있음 — 플레이어가 직접 읽고 추출해야 함
//   명분 — 왜 QTE 난이도가 갈리는가: suspicion이 높으면 "관리자가 이미 이
//          상황을 예의주시하고 있었다"는 게 이 장면 진입 직전 대사로 먼저
//          설명됨(그냥 숫자만 조용히 어려워지는 게 아니라, 왜 어려워지는지
//          납득이 감)
//   해답 — 이 케이스가 스스로 답하는 질문의 완성: "R-03에게 무슨 일이
//          있었는가" = 목소리가 신호에 심겨 지금도 반복되고 있다는 것.
//          2장의 "삼 주 전" 단서가 여기서 완전히 회수됨.
//
// 신규 엔진 요청사항(이 챕터에서 처음 필요해짐):
//   scene.next를 조건부로 분기시키는 기능 — 예:
//   "next": [
//     { "condition": { "stat": "suspicion", "gte": 2 }, "goto": "server_qte_tense" },
//     { "goto": "server_qte_normal" }
//   ]
//   지금까지는 전부 "choices"(플레이어 클릭)로만 분기했는데, 여긴 플레이어
//   선택이 아니라 순수 스탯 값으로 자동 분기해야 하는 첫 지점이라 필요.
// ==========================================================

const CASE002_CHAPTER4_SCENES = {

  "server_room_arrival": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/server-drone.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "방 전체가 낮게 웅웅거린다. 중앙 콘솔에 미완성 장치가 놓여있다." },
      {
        "speaker": "내레이션",
        "text": "손을 대기 전, 장치 밑에 뭔가 끼어있는 게 보인다.",
        "addItem": "jamming_device",
        "itemImage": "assets/items/jamming-device.png",
        "itemLabel": "방해 장치"
      },
      { "speaker": "관리자", "text": "거기 서십시오. 그 장치는 손대지 않는 게 좋습니다." }
    ],
    "next": "server_note_found"
  },

  "server_note_found": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/server-drone.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "장치 밑에 끼어있던 건, 구겨진 메모 한 장이다." },
      { "speaker": "R-03 [기록]", "text": "\"...주파수가 자꾸 108.4로 돌아온다. 왜 자꾸 거기로 돌아오는지 모르겠다.\"", "typingProfile": "decelerating" },
      { "speaker": "R-03 [기록]", "text": "\"...그 숫자, 계속 반복해서 들린다. 108. 4. 108. 4.\"", "typingProfile": "decelerating" },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...108.4. 이 다이얼에 맞추면 되는 건가." },
      {
        "speaker": "관리자", "text": "무전 상태 계속 확인하고 있습니다. 이상 있으시면 바로 말씀하세요.",
        "condition": { "stat": "suspicion", "gte": 2 }
      },
      {
        "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이미 지켜보고 있었다는 뜻이다. 조심해야겠다.",
        "condition": { "stat": "suspicion", "gte": 2 }
      }
    ],
    "next": [
      { "condition": { "stat": "suspicion", "gte": 2 }, "goto": "server_qte_tense" },
      { "goto": "server_qte_normal" }
    ]
  },

  "server_qte_normal": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/server-drone.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "다이얼을 108.4에 맞춘다." },
      {
        "speaker": "내레이션",
        "text": "장치에 다이얼이 달려있다.",
        "puzzle": {
          "type": "code",
          "prompt": "방해 장치의 주파수 다이얼.",
          "code": "1084",
          "onSuccessSetStat": { "knowledge": 1 }
        }
      },
      { "speaker": "내레이션", "text": "장치가 낮게 진동하기 시작한다. 잡음이 흔들린다." },
      { "speaker": "관리자", "text": "지금이라도 멈추십시오." },
      { "character": "{gender}-resolve", "speaker": "조사관(나)", "text": "(혼잣말) ...이번엔 끝까지 한다." },
      {
        "speaker": "내레이션",
        "text": "머릿속이 갑자기 무거워진다. 누군가 억지로 생각을 밀어넣으려 한다.",
        "fx": "bloodbleed", "highlight": true,
        "puzzle": {
          "type": "qte", "prompt": "...놓치지 마.", "duration": 5000,
          "onSuccessSetFlag": "qte_reflex_success", "onSuccessSetStat": { "courage": 1 },
          "onFailSetFlag": "qte_reflex_fail", "onFailSetStat": { "fear": 1 }
        }
      }
    ],
    "next": "server_reveal"
  },

  "server_qte_tense": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/server-drone.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "다이얼을 108.4에 맞춘다." },
      {
        "speaker": "내레이션",
        "text": "장치에 다이얼이 달려있다.",
        "puzzle": {
          "type": "code",
          "prompt": "방해 장치의 주파수 다이얼.",
          "code": "1084",
          "onSuccessSetStat": { "knowledge": 1 }
        }
      },
      { "speaker": "내레이션", "text": "장치가 낮게 진동하기 시작한다. 잡음이 흔들린다." },
      { "speaker": "관리자", "text": "지금이라도 멈추십시오. 정말로, 마지막 기회입니다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...목소리가 아까보다 급하다. 진짜로 뭔가 오고 있다." },
      { "character": "{gender}-resolve", "speaker": "조사관(나)", "text": "(혼잣말) ...이번엔 끝까지 한다." },
      {
        "speaker": "내레이션",
        "text": "머릿속이 짓눌린다. 이번엔 훨씬 빠르고, 훨씬 세게.",
        "fx": "bloodbleed", "highlight": true,
        "puzzle": {
          "type": "qte", "prompt": "...놓치지 마.", "duration": 3200,
          "onSuccessSetFlag": "qte_reflex_success", "onSuccessSetStat": { "courage": 1 },
          "onFailSetFlag": "qte_reflex_fail", "onFailSetStat": { "fear": 1 }
        }
      }
    ],
    "next": "server_reveal"
  },

  "server_reveal": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/server-drone.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "정신이 다시 또렷해진다. 벗어났다.", "condition": { "flag": "qte_reflex_success" } },
      { "speaker": "내레이션", "text": "잠깐, 생각이 끊겼다. 방금 뭘 하려고 했더라... 아니, 상관없다. 다시 집중하자.", "condition": { "flag": "qte_reflex_fail" } },
      { "speaker": "내레이션", "text": "잡음이 뚝 끊긴다. 방송이, 한순간 완전한 정적이 된다." },
      { "speaker": "내레이션", "text": "그리고 그 정적 사이로, 아주 짧게 — 육성이 새어 나온다." },
      { "speaker": "", "text": "[BROADCAST — UNSCHEDULED]", "effect": "decode" },
      { "speaker": "R-03 [방송]", "text": "\"...신호 안정. 이상 없음. 다음 점검까지, 대기.\"", "typingProfile": "decelerating" },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 목소리." },
      { "speaker": "내레이션", "text": "2장에서 봤던 그 문구. \"신호, 안정적임. 이상 없음. 다음 점검까지, 대기.\" 쉼표 하나까지 똑같다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...삼 주 전 그 로그. 자동이 아니었다. 이 목소리가 읽은 거였어." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...R-03. 당신, 사라진 게 아니었군요." },
      { "speaker": "내레이션", "text": "죽지 않았다. 신호 안에 목소리가 심긴 채, 지금도 같은 말을 반복하고 있다." },
      { "speaker": "관리자", "text": "(갈라지는 목소리) ...당신, 이런 식으로 나올 줄은—" },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(지금 이 말, R-03한테도 똑같이 했을까.)" }
    ],
    "next": [
      { "condition": { "stat": "suspicion", "gte": 2 }, "goto": "ending_caught_002" },
      { "goto": "server_final_choice" }
    ]
  },

  "server_final_choice": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/climax-theme.mp3",
    "lines": [
      { "speaker": "관리자", "text": "...어떻게 하시겠어요, 조사관님." }
    ],
    "choices": [
      {
        "text": "장치를 완전히 파괴해 신호를 끊는다",
        "reaction": "(혼잣말) ...더는 아무도 여기 걸리게 둘 수 없다.",
        "next": "ending_break_002"
      },
      {
        "text": "장치는 그대로 두고, 확보한 것만 챙겨 철수한다",
        "reaction": "(혼잣말) ...지금은 이게 최선이다. 살아서 나가는 게 먼저다.",
        "next": "ending_recover_002"
      },
      {
        "text": "위험을 감수하고, R-03을 신호에서 끌어내려 시도한다",
        "condition": [
          { "stat": "empathy", "gte": 1 },
          { "stat": "courage", "gte": 2 }
        ],
        "reaction": "(혼잣말) ...이 사람, 여기 두고 갈 수 없다.",
        "next": "ending_release_002"
      }
    ]
  },

  // ---------------- 엔딩들 ----------------

  "ending_retreat_002": {
    "background": "assets/backgrounds/tower-corridor.png",
    "bgm": "assets/bgm/storm-rain.mp3",
    "ending": true,
    "endingId": "walked-away-002",
    "title": "엔딩: 돌아선 자, 두 번째",
    "lines": [
      { "text": "당신은 그 문을 열지 않기로 했다." },
      { "text": "탑을 내려오는 길, 관리자는 평소와 다름없이 사무적이었다." },
      { "text": "보고서를 제출한다. R-03의 기록물엔 '미회수'라고 적힌다." },
      { "text": "(엔딩: 돌아선 자 — R-07도, 이번에도, 마지막 문 앞에서 걸음을 돌린 사람이 있었다)" }
    ]
  },

  "ending_caught_002": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/climax-theme.mp3",
    "ending": true,
    "endingId": "flagged",
    "title": "엔딩: 너무 많이 물었다",
    "lines": [
      { "text": "관리자: \"진작 말씀드렸을 텐데요. 캐물어서 좋을 게 없다고.\"" },
      { "text": "장치를 만지기도 전에, 방 전체 조명이 꺼진다." },
      { "text": "다음 순간 눈을 떴을 때, 당신은 여전히 이 탑 안에 있었다 — 다만 사번이 바뀌어 있었다." },
      { "text": "조사관 프로필: {genderLabel} — 사번 R-14 배정 완료." },
      { "text": "(엔딩: 너무 많이 물었다 — 의심은 정당했지만, 들키지 않는 것도 재주다)" }
    ]
  },

  "ending_break_002": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/climax-theme.mp3",
    "ending": true,
    "endingId": "silenced",
    "title": "엔딩: 침묵시키다",
    "lines": [
      { "text": "장치를 바닥에 내려친다. 스파크가 튀고, 잡음이 완전히 멎는다." },
      { "text": "R-03의 목소리도, 그 순간을 끝으로 다시는 들리지 않았다." },
      { "text": "구했다고 해야 할지, 두 번 죽인 거라고 해야 할지 — 아직도 모르겠다." },
      { "text": "보고서엔 '신호원 파괴, 위협 제거'라고만 적는다. 그게 사실의 전부는 아니지만." },
      { "text": "(엔딩: 침묵시키다 — 신호는 끊겼다. 그게 구원이었는지는, 아무도 알려주지 않는다)" }
    ]
  },

  "ending_recover_002": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/climax-theme.mp3",
    "ending": true,
    "endingId": "extracted",
    "title": "엔딩: 확보",
    "lines": [
      { "text": "장치도, 신호도, 그대로 둔 채 나온다." },
      { "text": "손에 쥔 건 기록물 하나, 낙인 탁본 하나, 그리고 대답할 수 없는 질문 몇 개뿐이다." },
      { "text": "탑을 내려오는 내내, 관리자는 한마디도 하지 않았다." },
      { "text": "보고서를 제출하고 파일을 닫는다. 다음 사번이, 곧 배정될 것이다." },
      { "text": "(엔딩: 확보 — 아무것도 해결하지 못했지만, 적어도 다음 사람에게 넘길 것은 남겼다)" }
    ]
  },

  "ending_release_002": {
    "background": "assets/backgrounds/server-room.png",
    "bgm": "assets/bgm/climax-theme.mp3",
    "ending": true,
    "endingId": "reaching-in",
    "title": "엔딩: 손을 뻗다",
    "lines": [
      { "text": "다이얼을 반대로 돌린다. 위험하다는 걸 알면서도." },
      { "text": "잡음이 커졌다가, 한순간 완전히 사람 목소리로 바뀐다.", "condition": { "flag": "qte_reflex_success" } },
      { "text": "\"...누구세요?\" 삼 주 만에, R-03이 처음으로 다른 말을 한다.", "condition": { "flag": "qte_reflex_success" } },
      { "text": "잡음이 커지기만 하다가, 결국 아무것도 바뀌지 않은 채 잦아든다.", "condition": { "flag": "qte_reflex_fail" } },
      { "text": "손을 뻗었지만, 닿지 않았다. R-03의 목소리는 여전히 같은 말만 반복한다.", "condition": { "flag": "qte_reflex_fail" } },
      { "text": "관리자가 다급하게 무전을 보낸다. 이런 반응은 처음 본다는 듯이." },
      { "text": "(엔딩: 손을 뻗다 — 이 신호가 사람을 완전히 지우는 게 아니라면, 되돌릴 수도 있는 걸지도 모른다)" }
    ]
  }

};
