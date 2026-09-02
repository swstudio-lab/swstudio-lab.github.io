// ==========================================================
// CASE-003 — 3장(관리자 집무실) 스크립트 초안 — 분기점
//
// 체크리스트 대조:
// [진짜 선택] "인사기록" vs "방송코어" — 시간 압박으로 하나만 선택,
//   각각 다른 대조 퍼즐 + 다른 정보 + 5장에서 다른 최종 선택지로 이어짐
// [퍼즐 타입] contradiction(002에서 이미 썼지만, 내용 완전히 다름 —
//   002는 "날짜/문구", 003은 "인수인계 사유 표현" 대조)
// [스탯] empathy(인사기록)/knowledge(방송코어)로 002 사진/지도 분기와
//   같은 축 재사용 — 시리즈 일관성
// ==========================================================

const CASE003_CHAPTER3 = {

  "hq_manager_office": {
    "background": "assets/backgrounds/hq-office.png",
    "bgm": "assets/bgm/hq-office-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "관리자 집무실. 사람은 없지만, 화면과 서류함들이 계속 돌아가고 있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...주인 없는 방인데, 시스템은 계속 일하고 있다." },
      { "speaker": "내레이션", "text": "한쪽엔 인사 계승 기록 캐비닛, 다른 쪽엔 방송코어 단말기가 있다." },
      { "speaker": "관리자", "text": "곧 접속 권한이 재확인됩니다. 시간이 많지 않아요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...하나만 볼 수 있겠다. 뭘 먼저 보지." }
    ],
    "choices": [
      {
        "text": "인사 계승 기록을 살펴본다",
        "setStat": { "empathy": 1 },
        "reaction": "(혼잣말) ...관리자가 어떻게 만들어지는지, 그것부터 알아야겠다.",
        "next": "hq_personnel_path"
      },
      {
        "text": "방송코어 로그를 살펴본다",
        "setStat": { "knowledge": 1 },
        "reaction": "(혼잣말) ...이 신호가 어디서 시작됐는지, 그것부터 알아야겠다.",
        "next": "hq_broadcast_path"
      }
    ]
  },

  // ---- 분기 A: 인사 계승 기록 (관리자가 만들어지는 메커니즘) ----
  "hq_personnel_path": {
    "background": "assets/backgrounds/hq-office.png",
    "bgm": "assets/bgm/hq-office-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "인수인계 기록 넉 장이 걸려있다. 사번이 바뀔 때마다 남기는 사유서다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...전부 형식이 똑같아야 정상 아닌가. 같은 절차니까." },
      {
        "speaker": "내레이션",
        "text": "넉 장을 나란히 놓고 대조한다.",
        "puzzle": {
          "type": "contradiction",
          "prompt": "인수인계 사유서 4부. 같은 절차의 기록이라면 표현도 같아야 한다 — 다른 한 장을 짚어라.",
          "entries": [
            { "id": "log_1", "text": "[인수인계 기록]\n사유: 시스템 처리 (편입 개체 지정)" },
            { "id": "log_2", "text": "[인수인계 기록]\n사유: 시스템 처리 (편입 개체 지정)" },
            { "id": "log_3", "text": "[인수인계 기록]\n사유: 자발적 신뢰 확인" },
            { "id": "log_4", "text": "[인수인계 기록]\n사유: 시스템 처리 (편입 개체 지정)" }
          ],
          "answerId": "log_3",
          "maxWrongAttempts": 3,
          "hint": "(혼잣말) ...나머지 셋은 다 '시스템 처리'라고 적혀있었지.",
          "onSuccessSetStat": { "knowledge": 1 },
          "onFailSetStat": { "suspicion": 1 }
        }
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...\"자발적 신뢰 확인\"이라니. 나머지는 전부 강제 지정이라고 적혀있는데, 이 한 건만 다르다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...\"신뢰는 대가를 남겼다\"던 그 표현, 여기서 나온 거였나." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...대부분은 그냥 강제로 편입시키고, 아주 가끔만 저렇게 \"자발적\"이라고 적어둔다. 이유가 있을 거다." }
    ],
    "next": "hq_office_end"
  },

  // ---- 분기 B: 방송코어 로그 (신호의 진짜 시작점) ----
  "hq_broadcast_path": {
    "background": "assets/backgrounds/hq-office.png",
    "bgm": "assets/bgm/hq-office-hum.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "방송코어 단말기에 이전 기록 넉 장이 떠있다. 시설이 바뀔 때마다 남긴 이전 사유서다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...전부 같은 시스템이 자동으로 기록했을 텐데, 형식이 같아야 정상이겠지." },
      {
        "speaker": "내레이션",
        "text": "넉 장을 화면에 띄워 대조한다.",
        "puzzle": {
          "type": "contradiction",
          "prompt": "시설 이전 기록 4부. 같은 시스템의 자동 기록이라면 표기 방식도 같아야 한다 — 다른 한 장을 짚어라.",
          "entries": [
            { "id": "site_1", "text": "[이전 기록 #11]\n시설명: 등록됨\n상태: 종료" },
            { "id": "site_2", "text": "[이전 기록 #12]\n시설명: 산속 중계탑\n상태: 종료" },
            { "id": "site_3", "text": "[이전 기록 #01]\n시설명: 병원\n상태: 종료·봉인" },
            { "id": "site_4", "text": "[이전 기록 #13]\n시설명: 등록됨\n상태: 진행 중" }
          ],
          "answerId": "site_3",
          "maxWrongAttempts": 3,
          "hint": "(혼잣말) ...번호가 하나만 유난히 작다. #01. 제일 오래됐다는 뜻일까.",
          "onSuccessSetStat": { "knowledge": 1 },
          "onFailSetStat": { "suspicion": 1 }
        }
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...병원. #01. 그리고 상태가 \"종료\"가 아니라 \"종료·봉인\"이다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...그리고 지금 진행 중인 게 #13. 002에서 봤던 그 산속 중계탑, R-03 사건. 그게 열세 번째였다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...근데 병원이 #01이면서 왜 \"봉인\"까지 따로 붙었을까. 다른 시설들이랑 다르게 취급된 거다." }
    ],
    "next": "hq_office_end"
  },

  "hq_office_end": {
    "background": "assets/backgrounds/hq-office.png",
    "bgm": "assets/bgm/hq-office-hum.mp3",
    "lines": [
      { "speaker": "관리자", "text": "...충분히 보셨죠. 다음 구역으로 안내하겠습니다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...말리지도 않는군. 이젠 그냥 지켜보기로 한 건가." },
      { "speaker": "내레이션", "text": "바닥 한쪽에, 아래로 내려가는 좁은 계단이 있다. 표지판엔 아무것도 안 적혀있다." }
    ],
    "next": "hospital_origin_arrival"
    // hospital_origin_arrival(4장)부터는 다음 단계에서 이어서 작성
  }

};
