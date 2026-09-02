// ==========================================================
// CASE-003 — 5장(원본 기록 보관고 + 클라이맥스) 스크립트 초안
//
// 체크리스트 대조:
// [떡밥 회수] "같은 얼굴" 메커니즘의 실체 — R-01 원본 사진, 001의 찢어진
//   사진(얼굴 뜯김)이 여기서 의미를 되찾음
// [3장 분기 반영] empathy(인사기록) 경로는 "설득/저지" 선택지,
//   knowledge(방송코어) 경로는 "신호 파괴" 선택지가 최종 선택에 추가로 열림
// [퍼즐] 종합형(sequence + 가짜 조각, 002 4장과 같은 원리를 재사용하되
//   내용은 003 전용 — 반복감보다는 "시리즈 시그니처 장치"로 굳히는 의도)
// [엔딩] 기본 4~5개 + 001/002 세이브 모두 있어야 열리는 진엔딩 1개
// ==========================================================

const CASE003_CHAPTER5 = {

  "original_records_vault": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/vault-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "철문 너머, 작은 방. 낡은 캐비닛 하나에 \"R-01\"이라는 라벨만 붙어있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...제일 처음. 이 사람부터 시작된 건가." },
      {
        "speaker": "내레이션",
        "text": "캐비닛을 연다. 빛바랜 사진 한 장.",
        "addItem": "r01_original_photo",
        "itemImage": "assets/items/r01-original-photo.png",
        "itemLabel": "R-01의 원본 사진"
      },
      { "speaker": "내레이션", "text": "얼굴이, 지금까지 봐온 그 얼굴과 다르다. 완전히 다른 사람이다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...그럼 001에서 봤던 그 찢어진 사진. 얼굴만 뜯겨 나가 있던 그거." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...누군가 지우려던 게 아니라, 원래 얼굴이 있었다는 증거 자체를 없애려던 거였다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...우리가 계속 봐온 그 얼굴은, 진짜가 아니라 시스템이 덮어씌운 거였어." }
    ],
    "next": "final_confrontation"
  },

  "final_confrontation": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "뒤에서 인기척이 느껴진다. 처음으로, 관리자가 실제로 나타난다." },
      { "speaker": "내레이션", "text": "그런데 얼굴이 하나가 아니다. 여러 얼굴이 겹쳐서, 계속 바뀌고 있다.", "fx": "bloodbleed" },
      { "character": "{gender}-shock", "speaker": "조사관(나)", "text": "(혼잣말) ...저게, 지금까지의 전부인가." },
      { "speaker": "관리자", "text": "...여기까지 오셨군요. 다들 그랬듯이." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "'다들'이라니. 당신도 원래는 조사관이었습니까." },
      { "speaker": "관리자", "text": "저였을 수도, R-07이었을 수도, R-03이었을 수도 있죠. 지금은 구분이 무의미합니다." },
      { "character": "{gender}-fear", "speaker": "조사관(나)", "text": "(혼잣말) ...그럼 나도, 언젠가 저 안에 겹쳐지는 건가." }
    ],
    "next": "final_synthesis_puzzle"
  },

  "final_synthesis_puzzle": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "lines": [
      { "character": "{gender}-resolve", "speaker": "조사관(나)", "text": "(혼잣말) ...지금까지 알아낸 걸 전부 정리해야 한다. 이번엔 확실하게." },
      {
        "speaker": "내레이션",
        "text": "머릿속에 지금까지의 진실들이 떠오른다. 그런데 하나, 너무 매끄럽게 맞아떨어지는 확신이 섞여 있다.",
        "fx": "bloodbleed",
        "highlight": true,
        "puzzle": {
          "type": "sequence",
          "prompt": "실제로 조사해서 알아낸 것만 골라, 순서대로 배열하라. (조각은 6개, 답은 5개뿐이다)",
          "fragments": [
            { "id": "f_star", "text": "별 모양 = \"편입 처리 완료\" 시스템 도장" },
            { "id": "f_r03", "text": "002의 그림자 형체 = R-03, 신호 교란 시 잔상 노출 3회" },
            { "id": "f_succession", "text": "관리자 계승은 대부분 강제 지정, 극소수만 \"자발적 신뢰\"로 기록됨" },
            { "id": "f_13", "text": "지금 진행 중인 사건 = 열세 번째 편입 사례" },
            { "id": "f_origin", "text": "병원은 시작이 아니라, 이 지하 통로를 감추려 지어진 것" },
            { "id": "f_fake", "text": "관리자가 알려준 결론 — 이 모든 건 당신을 구하기 위한 과정이었다" }
          ],
          "order": ["f_star", "f_r03", "f_succession", "f_13", "f_origin"],
          "hint": "(혼잣말) ...관리자가 직접 알려준 건, 지금까지 하나도 없었다.",
          "onSuccessSetStat": { "courage": 1 }
        }
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...'당신을 구하기 위한 과정'이라니. 그런 말, 들은 적 없다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) 마지막까지, 뭔가를 심으려 했다." }
    ],
    "next": "final_choice"
  },

  "final_choice": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "lines": [
      { "speaker": "관리자", "text": "...어떻게 하시겠어요. 이번이 마지막 기회입니다." }
    ],
    "choices": [
      {
        "text": "여기서 멈추고, 확보한 것만 챙겨 철수한다",
        "reaction": "(혼잣말) ...지금은 이게 최선이다.",
        "next": "ending_recover_003"
      },
      {
        "text": "신호 전체를 파괴해 이 순환을 끊는다",
        "condition": { "stat": "knowledge", "gte": 3 },
        "reaction": "(혼잣말) ...더는 아무도 여기 걸리게 둘 수 없다.",
        "next": "ending_break_003"
      },
      {
        "text": "관리자를 설득해, 이 얼굴들을 원래대로 되돌리려 시도한다",
        "condition": { "stat": "empathy", "gte": 1 },
        "reaction": "(혼잣말) ...당신들, 원래 얼굴을 되찾을 수 있을지도 모른다.",
        "next": "ending_restore_003"
      },
      {
        "text": "저항 없이, 관리자의 뒤를 잇는다",
        "condition": { "stat": "suspicion", "gte": 3 },
        "reaction": "(혼잣말) ...싸우는 것도 지쳤다. 이게 제일 쉬운 길이다.",
        "next": "ending_succession_003"
      },
      {
        "text": "지금까지 세 번의 사건을 전부 하나로 정리한다",
        "condition": [
          { "hasCase001Save": true },
          { "hasCase002Save": true },
          { "stat": "knowledge", "gte": 4 }
        ],
        "reaction": "(혼잣말) ...001부터 여기까지, 전부 기록으로 남겨야 한다.",
        "next": "ending_true_003"
      }
    ]
  },

  // ---------------- 엔딩들 ----------------

  "ending_recover_003": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "ending": true,
    "endingId": "extracted-003",
    "title": "엔딩: 확보한 진실",
    "lines": [
      { "text": "R-01의 원본 사진과 지금까지의 기록을 챙겨 조용히 철수한다." },
      { "text": "회사 전체의 정체를 다 알아내진 못했지만, 적어도 증거는 남겼다." },
      { "text": "보고서를 제출한다. 다음 사번이 곧 배정될 것이다." },
      { "text": "(엔딩: 확보한 진실 — 전부는 아니어도, 뭔가는 세상에 남았다)" }
    ]
  },

  "ending_break_003": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "ending": true,
    "endingId": "silenced-003",
    "title": "엔딩: 열세 번째를 끊다",
    "lines": [
      { "text": "방송코어 전체를 파괴한다. 지하 통로 깊은 곳에서, 오래 이어져온 무언가가 마침내 멈춘다." },
      { "text": "관리자의 얼굴들이 하나씩 흩어지며 사라진다. R-07도, R-03도, 그 안에서 놓여난다." },
      { "text": "열네 번째는 없다." },
      { "text": "(엔딩: 열세 번째를 끊다 — 순환은 끝났다. 그게 전부를 구원했는지는, 아무도 모른다)" }
    ]
  },

  "ending_restore_003": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "ending": true,
    "endingId": "restored-003",
    "title": "엔딩: 되찾은 얼굴",
    "lines": [
      { "text": "관리자에게, 강제가 아니라 스스로 선택할 기회가 있었다는 걸 알린다." },
      { "text": "겹쳐있던 얼굴들이 천천히 갈라지기 시작한다. 전부는 아니어도, 몇몇은 원래 얼굴을 되찾는다." },
      { "text": "R-07의 것일지, R-03의 것일지, 그보다 오래된 누군가의 것일지 — 알 수 없지만, 분명 사람의 얼굴이었다." },
      { "text": "(엔딩: 되찾은 얼굴 — 강제로 지워졌던 것들이, 아주 조금은 돌아왔다)" }
    ]
  },

  "ending_succession_003": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "ending": true,
    "endingId": "next-in-line",
    "title": "엔딩: 다음 자리",
    "lines": [
      { "text": "저항을 멈춘다. 겹쳐진 얼굴들 사이로, 자신의 얼굴이 조금씩 섞여 들어가는 게 느껴진다." },
      { "text": "화면이 어두워지고, 곧 새로운 조사관에게 브리핑하는 목소리가 들려온다." },
      { "text": "그 목소리는, 당신의 것이었다. 001의 그 관리자처럼." },
      { "text": "(엔딩: 다음 자리 — 순환은 끊기지 않았다, 그저 자리가 하나 더 채워졌을 뿐)" }
    ]
  },

  // ---- 진엔딩 — 001+002 세이브 둘 다 있어야 선택지 자체가 열림 ----
  "ending_true_003": {
    "background": "assets/backgrounds/records-vault.png",
    "bgm": "assets/bgm/climax-theme-003.mp3",
    "ending": true,
    "endingId": "the-complete-record",
    "title": "엔딩: 완성된 기록",
    "itemCollage": true,
    "lines": [
      { "text": "R-07의 부서진 신분증, 002의 낙인 탁본, 그리고 R-01의 원본 사진 — 세 케이스에서 모은 것들이 눈앞에 나란히 놓인다." },
      { "text": "수사노트 마지막 페이지가, 처음으로 완전히 채워진다." },
      { "text": "결재란에, 지금까지 어떤 조사관의 이름도 아닌 — 이 계정으로 로그인한 당신의 흔적이 남는다." },
      { "text": "[STORY ARCHIVE — 기록 완성]" },
      { "text": "(엔딩: 완성된 기록 — 001부터 여기까지, 전부 당신이 이어온 것이다)" }
    ]
  }

};
