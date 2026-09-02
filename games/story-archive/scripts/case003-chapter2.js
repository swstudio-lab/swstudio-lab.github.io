// ==========================================================
// CASE-003 — 2장(인사기록보관실) 스크립트 초안
//
// 체크리스트 대조:
// [퍼즐 명분] "표지마다 별 모양이 찍혀있다"를 먼저 목격 → 왜 대조해야
//   하는지 동기가 생긴 다음 퍼즐 진입
// [퍼즐 타입] connect(001/002에서 이미 쓴 타입이지만, 내용 자체가
//   새로운 회수라 반복감 없음 — 002 evidence board는 "관계 발견"이었다면
//   이번엔 "규정과 실물 대조"라 성격이 다름)
// [떡밥 회수] 별 모양 = 편입 완료 도장 / 002 그림자 = R-03 잔상 3회,
//   숫자까지 정확히 일치
// [관리자 대사] 새로운 패턴 — 이번엔 "말을 아예 안 함"(침묵으로 반응)으로
//   변주, 지금까지 안 쓴 회피 방식
// ==========================================================

const CASE003_NEW_ITEMS_CH2 = {
  stamped_file: { image: "assets/items/stamped-file.png", label: "표식 찍힌 옛 파일" },
  system_manual: { image: "assets/items/system-manual.png", label: "도장 규정 안내문" },
  r03_file: { image: "assets/items/r03-file.png", label: "R-03 개인 파일" },
  signal_leak_log: { image: "assets/items/signal-leak-log.png", label: "신호 교란 잔상 기록" },
};
const CASE003_NEW_NOTES_CH2 = {
  stamped_file: { baseNote: "표지 구석에 낯익은 별 모양이 찍혀있다. 001/002에서 계속 보던 그 표식과 똑같다." },
  system_manual: { baseNote: "도장 규정 안내문. 별 모양 도장의 정확한 용도가 적혀있다." },
  r03_file: { baseNote: "R-03의 개인 파일. 표지에도 그 별 모양이 찍혀있다." },
  signal_leak_log: { baseNote: "신호 교란 시 잔상 노출 기록. 특정 편입 개체의 이름과 횟수가 적혀있다." },
};

const CASE003_CHAPTER2 = {

  "hq_records_room": {
    "background": "assets/backgrounds/hq-records-room.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      { "speaker": "관리자", "text": "...권한 확인됐습니다. 들어가시죠." },
      { "speaker": "내레이션", "text": "사번별로 정리된 파일 캐비닛이 끝없이 늘어서 있다. 조명은 절반쯤 나가있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...감사 대상 부서치고, 정리는 잘 되어있네." },
      { "speaker": "내레이션", "text": "가까운 캐비닛을 열어본다. 오래된 파일 표지마다, 구석에 작은 표식이 찍혀있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 모양, 낯익다. 001에서도 002에서도 계속 봤던 그 별 모양이잖아." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...근데 왜 파일마다 도장처럼 찍혀있지? 낙서가 아니라 규정이었나." }
    ],
    "next": "hq_records_search"
  },

  "hq_records_search": {
    "background": "assets/backgrounds/hq-records-room.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "표식 찍힌 옛 파일 한 부를 챙긴다.",
        "addItem": "stamped_file",
        "itemImage": "assets/items/stamped-file.png",
        "itemLabel": "표식 찍힌 옛 파일"
      },
      {
        "speaker": "내레이션",
        "text": "근처 서랍에서, 도장 규정이 적힌 안내문도 발견한다.",
        "addItem": "system_manual",
        "itemImage": "assets/items/system-manual.png",
        "itemLabel": "도장 규정 안내문"
      },
      { "speaker": "내레이션", "text": "안쪽 캐비닛, \"R-03\" 라벨이 붙은 칸이 따로 있다." },
      {
        "speaker": "내레이션",
        "text": "R-03의 개인 파일을 꺼낸다.",
        "addItem": "r03_file",
        "itemImage": "assets/items/r03-file.png",
        "itemLabel": "R-03 개인 파일"
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...002 사건 기록에 있던 그 이름이다." },
      {
        "speaker": "내레이션",
        "text": "그 파일 옆에, 얇은 로그 한 장이 클립으로 끼워져 있다.",
        "addItem": "signal_leak_log",
        "itemImage": "assets/items/signal-leak-log.png",
        "itemLabel": "신호 교란 잔상 기록"
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이것들, 따로 볼 게 아니라 서로 맞춰봐야 할 것 같다." }
    ],
    "next": "hq_records_connect_puzzle"
  },

  "hq_records_connect_puzzle": {
    "background": "assets/backgrounds/hq-records-room.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "네 개의 자료를 책상 위에 펼쳐놓고 대조한다.",
        "puzzle": {
          "type": "connect",
          "prompt": "관련 있는 두 쌍을 찾아 이어라.",
          "items": [
            { "id": "stamped", "label": "표식 찍힌 옛 파일", "image": "assets/items/stamped-file.png" },
            { "id": "manual", "label": "도장 규정 안내문", "image": "assets/items/system-manual.png" },
            { "id": "r03file", "label": "R-03 개인 파일", "image": "assets/items/r03-file.png" },
            { "id": "leaklog", "label": "신호 교란 잔상 기록", "image": "assets/items/signal-leak-log.png" }
          ],
          "pairs": [
            ["stamped", "manual"],
            ["r03file", "leaklog"]
          ],
          "connectMessages": {
            "stamped|manual": "별 모양 도장 규정과 파일의 표식이 정확히 일치한다. \"편입 처리 완료\"를 뜻하는 시스템 도장이었다 — 001/002에서 계속 보던 그 표식의 정체.",
            "r03file|leaklog": "R-03의 파일 옆에 붙은 로그 — \"편입 개체 R-03, 신호 교란 감지 시 잔상 노출: 3회. 위치: 산속 중계탑.\" 002에서 스쳐 지나가던 그 형체가, 정확히 세 번 등장했던 그 그림자가, R-03이었다는 확증이다."
          },
          "hint": "(혼잣말) ...표식은 규정이랑, 이름은 기록이랑 짝지어보자.",
          "onSuccessSetStat": { "knowledge": 1 }
        }
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...별 모양은 낙서도, 경고도 아니었다. 그냥 도장이었다. \"처리 완료\"라는." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...그리고 R-03. 세 번이나 새어 나왔었구나. 그 사람, 정말 거기 있었다." }
    ],
    "next": "hq_records_manager_silence"
  },

  "hq_records_manager_silence": {
    "background": "assets/backgrounds/hq-records-room.png",
    "bgm": "assets/bgm/hq-ambient.mp3",
    "lines": [
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "이 도장, 관리자님도 아시죠?" },
      { "speaker": "내레이션", "text": "대답이 없다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "관리자님?" },
      { "speaker": "내레이션", "text": "몇 초간, 무전은 그저 조용하다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...지금까지는 늘 뭐라도 둘러댔는데. 이번엔 아예 말을 안 한다." },
      { "speaker": "관리자", "text": "...다음 구역으로 이동하시죠." },
      { "speaker": "내레이션", "text": "보관실 안쪽, \"관리자 집무실\"이라 적힌 문이 하나 더 있다." }
    ],
    "next": "hq_manager_office"
    // hq_manager_office(3장, 분기 지점)부터는 다음 단계에서 이어서 작성
  }

};
