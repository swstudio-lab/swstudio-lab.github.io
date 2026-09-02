// ==========================================================
// CASE-003 — 4장(병원의 진짜 근원지) 스크립트 초안
//
// 체크리스트 대조:
// [퍼즐 명분] 계단 내려가자마자 "병원보다 오래된 구조물"이라는 게
//   먼저 관찰됨 → "그럼 진짜 시작점은 따로 있나?"는 동기가 생긴 뒤 퍼즐
// [퍼즐 타입] elimination 재사용(1장과 대칭 구조 — 사람 후보 → 장소 후보)
// [분기 무관 핵심 정보 보장] 3장에서 어느 쪽을 택했든, 이 장에서 "13=현재
//   진행 중인 사건 번호, 병원=진짜 시작점 아님" 핵심 정보는 동일하게 확인됨
// [떡밥 회수] 13의 정확한 의미, 왜 병원이었는지(병원이 최초가 아니라 이
//   지하 구조물을 감추기 위해 지어졌다는 것)
// ==========================================================

const CASE003_NEW_ITEMS_CH4 = {
  origin_criteria_note: { image: "assets/items/origin-criteria-note.png", label: "구 시설 판별 기준" },
};

const CASE003_CHAPTER4 = {

  "hospital_origin_arrival": {
    "background": "assets/backgrounds/hospital-origin.png",
    "bgm": "assets/bgm/origin-drone.mp3",
    "lines": [
      { "speaker": "내레이션", "text": "계단을 내려가자, 콘크리트가 아니라 낡은 벽돌 통로가 나온다. 병원보다 훨씬 오래돼 보인다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이거, 병원 시설이 아니다. 훨씬 전부터 있던 구조물 위에 병원을 지은 것 같다." },
      {
        "speaker": "내레이션",
        "text": "3장에서 확인했던 것처럼, 병원은 #01이라고 기록돼있었지 — 그런데 정작 이 통로는, 그 기록에 없다.",
        "condition": { "stat": "knowledge", "gte": 2 }
      },
      { "speaker": "관리자", "text": "여기부터는 공식 기록에 없는 구역입니다. 안내가 어렵겠네요." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...안내를 못 하는 게 아니라, 안 하는 거겠지." }
    ],
    "next": "hospital_origin_search"
  },

  "hospital_origin_search": {
    "background": "assets/backgrounds/hospital-origin.png",
    "bgm": "assets/bgm/origin-drone.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "벽에 붙은 낡은 안내판 — 여러 구역을 가리키는 표지판들이 뒤섞여 있다. 그 옆, 판별 기준이 적힌 종이 한 장.",
        "addItem": "origin_criteria_note",
        "itemImage": "assets/items/origin-criteria-note.png",
        "itemLabel": "구 시설 판별 기준"
      },
      { "speaker": "내레이션", "text": "\"진짜 시작점 판별 — 별 모양 표식 최초 발견 지점 / 공식 이전 기록 없음(비공식) / 병원과 물리적으로 연결됨.\"" },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...셋 다 맞는 곳을 찾으면, 진짜 시작점을 알 수 있겠다." },
      { "speaker": "내레이션", "text": "통로를 따라가며, 다섯 개의 후보 지점을 확인한다." }
    ],
    "next": "hospital_origin_elimination_puzzle"
  },

  "hospital_origin_elimination_puzzle": {
    "background": "assets/backgrounds/hospital-origin.png",
    "bgm": "assets/bgm/origin-drone.mp3",
    "lines": [
      {
        "speaker": "내레이션",
        "text": "다섯 지점을 판별 기준과 하나씩 대조한다.",
        "puzzle": {
          "type": "elimination",
          "prompt": "구 시설 판별 기준(별 모양 최초 발견 / 공식 기록 없음 / 병원과 물리적 연결) 세 조건을 전부 만족하는 지점 하나만 남기고 나머지를 제외하라.",
          "candidates": [
            {
              "id": "site_a", "label": "지점 A · 오래된 공장 터",
              "attributes": ["별 모양 표식: 없음", "공식 기록: 있음", "병원과 연결: 없음"]
            },
            {
              "id": "site_b", "label": "지점 B · 버려진 우물",
              "attributes": ["별 모양 표식: 있음", "공식 기록: 있음", "병원과 연결: 없음"]
            },
            {
              "id": "site_c", "label": "지점 C · 지하 통로 안쪽",
              "attributes": ["별 모양 표식: 있음", "공식 기록: 없음", "병원과 연결: 있음"]
            },
            {
              "id": "site_d", "label": "지점 D · 오래된 창고",
              "attributes": ["별 모양 표식: 없음", "공식 기록: 없음", "병원과 연결: 있음"]
            },
            {
              "id": "site_e", "label": "지점 E · 버려진 예배당",
              "attributes": ["별 모양 표식: 있음", "공식 기록: 있음", "병원과 연결: 있음"]
            }
          ],
          "answerId": "site_c",
          "hint": "(혼잣말) ...세 조건 다 맞는 곳. 하나라도 어긋나면 후보가 아니다.",
          "onSuccessSetStat": { "knowledge": 1 },
          "onFailSetStat": { "suspicion": 1 }
        }
      },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...지점 C. 지하 통로 안쪽. 셋 다 정확히 들어맞는다." },
      { "speaker": "내레이션", "text": "그쪽으로 걸어가자, 통로가 끝나는 곳에 낡은 철문 하나가 있다." },
      { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...병원은 시작이 아니었다. 이걸 감추려고 지어진 거였다." },
      {
        "character": "{gender}-neutral", "speaker": "조사관(나)",
        "text": "(혼잣말) ...그리고 지금 이 순간까지 열세 번. 이 문 너머에 있는 게, 그 열세 번의 진짜 시작이다.",
        "condition": { "stat": "knowledge", "gte": 2 }
      },
      {
        "character": "{gender}-neutral", "speaker": "조사관(나)",
        "text": "(혼잣말) ...몇 번째인지는 모르겠지만, 이 문 너머가 전부의 시작인 건 확실하다.",
        "condition": { "stat": "knowledge", "lt": 2 }
      }
    ],
    "next": "original_records_vault"
    // original_records_vault(5장)부터는 다음 단계에서 이어서 작성
  }

};
