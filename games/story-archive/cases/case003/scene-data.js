window.CASE_DATA = {
  "id": "case003",
  "title": "CASE-003: 편입 (열세 번째 기록)",
  "start": "prologue_registration_003",

  // 001의 4개 엔딩, 002의 5개 엔딩과 별개로, 003은 이 5개 endingId를 기준으로
  // 로드맵/엔딩티저의 "전부 모았는지" 판단이 이뤄진다.
  "allEndingIds": ["extracted-003", "silenced-003", "restored-003", "next-in-line", "the-complete-record"],

  "endingTeaser":
    "보고서를 제출하고 나니, 화면 한구석에 작은 알림이 뜬다.\n\n\"미열람 기록이 있습니다.\"\n\n...이 사건에는, 아직 확인하지 못한 결말이 남아있다.",

  "completeRecordTeaser":
    "[ARCHIVE — CASE-003 전체 결말 확인]\n\n다섯 갈래의 결말을 전부 확인했다. 그런데 마지막 화면에, 지워진 줄 알았던 로그 하나가 다시 떠오른다.\n\n발신자 표기 없음. 숫자 하나만 남아있다 — 14.\n\n...열네 번째는, 정말 없는 걸까.",

  "items": {
    "recruitment_criteria": { "image": "assets/items/recruitment-criteria.png", "label": "즉시 채용 기준서" },
    "candidate_files": { "image": "assets/items/candidate-files.png", "label": "채용 후보 파일철" },
    "stamped_file": { "image": "assets/items/stamped-file.png", "label": "표식 찍힌 옛 파일" },
    "system_manual": { "image": "assets/items/system-manual.png", "label": "도장 규정 안내문" },
    "r03_file": { "image": "assets/items/r03-file.png", "label": "R-03 개인 파일" },
    "signal_leak_log": { "image": "assets/items/signal-leak-log.png", "label": "신호 교란 잔상 기록" },
    "origin_criteria_note": { "image": "assets/items/origin-criteria-note.png", "label": "구 시설 판별 기준" },
    "r01_original_photo": { "image": "assets/items/r01-original-photo.png", "label": "R-01의 원본 사진" }
  },

  "notes": {
    "recruitment_criteria": {
      "baseNote": "이 회사의 실제 채용 기준. 가족관계 확인 불가, 최근 이직/이사 이력, 실종 신고 시 수색 우선순위 낮음 — 셋 다 맞아야 대상이 된다."
    },
    // (star-image-mismatch-dialogue-fix.md #1) 이미지로 나온 별 모양 도장이 001/002의
    // 손 흠집과 다르게 나와서, "정확히 일치"가 아니라 "본사 정식 도장 vs 현장 손 흠집"으로 순화.
    "stamped_file": {
      "baseNote": "표지 구석에 낯익은 표식이 찍혀있다. 손으로 급하게 그은 흠집이 아니라, 정식으로 찍힌 도장이다."
    },
    "system_manual": {
      "baseNote": "도장 규정 안내문. 편입 처리 시 찍는 공식 인장의 용도가 적혀있다. 그런데 도식은, 실제 파일에 찍힌 것과 모양이 다르다."
    },
    "r03_file": {
      "baseNote": "R-03의 개인 파일. 표지에도 그 별 모양이 찍혀있다."
    },
    "signal_leak_log": {
      "baseNote": "신호 교란 시 잔상 노출 기록. 특정 편입 개체의 이름과 횟수가 적혀있다."
    },
    "origin_criteria_note": {
      "baseNote": "진짜 시작점 판별 기준. 별 모양 표식 최초 발견 지점 / 공식 이전 기록 없음(비공식) / 병원과 물리적으로 연결됨 — 셋 다 맞는 곳이 진짜 시작점이다."
    },
    "r01_original_photo": {
      "baseNote": "빛바랜 사진 한 장. 얼굴이 지금까지 봐온 조사관들과 완전히 다르다 — 원래 얼굴이 따로 있었다는 증거일지도 모른다."
    }
  },

  "scenes": {

    // ========== 프롤로그 ==========
    "prologue_registration_003": {
      "background": "assets/backgrounds/hq-lobby.png",
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
    },

    // ========== 2장 — 인사기록보관실 ==========
    "hq_records_room": {
      "background": "assets/backgrounds/hq-records-room.png",
      "bgm": "assets/bgm/hq-ambient.mp3",
      "lines": [
        { "speaker": "관리자", "text": "...권한 확인됐습니다. 들어가시죠." },
        { "speaker": "내레이션", "text": "사번별로 정리된 파일 캐비닛이 끝없이 늘어서 있다. 조명은 절반쯤 나가있다." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...감사 대상 부서치고, 정리는 잘 되어있네." },
        { "speaker": "내레이션", "text": "가까운 캐비닛을 열어본다. 오래된 파일 표지마다, 구석에 작은 표식이 찍혀있다." },
        // (star-image-mismatch-dialogue-fix.md #2)
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 모양, 낯익다. 001/002 파일에서 본 건 손으로 새긴 흠집이었는데, 이건 제대로 된 도장이다. 정식 규격이 따로 있었나 보다.", "condition": { "hasCase001Save": true } },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 모양, 어디선가 본 것 같기도 한데. 기분 탓이겠지.", "condition": { "hasCase001Save": false } },
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
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...002 사건 기록에 있던 그 이름이다.", "condition": { "hasCase001Save": true } },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...R-03. 낯선 이름이다. 이 사람도 여기서 사라진 건가.", "condition": { "hasCase001Save": false } },
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
              // (star-image-mismatch-dialogue-fix.md #4)
              "stamped|manual": "규정에 적힌 공식 인장과, 실제 파일에 찍힌 표식이 서로 다르다. 용도는 같다 — \"편입 처리 완료\" — 그런데 현장에서는 규정과 다른 방식으로 찍혀왔다.",
              "r03file|leaklog": "R-03의 파일 옆에 붙은 로그 — \"편입 개체 R-03, 신호 교란 감지 시 잔상 노출: 3회. 위치: 산속 중계탑.\" 002에서 스쳐 지나가던 그 형체가, 정확히 세 번 등장했던 그 그림자가, R-03이었다는 확증이다."
            },
            "hint": "(혼잣말) ...표식은 규정이랑, 이름은 기록이랑 짝지어보자.",
            "onSuccessSetStat": { "knowledge": 1 }
          }
        },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...별 모양은 낙서도, 경고도 아니었다. 그냥 도장이었다. \"처리 완료\"라는." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...001/002 파일에서 봤던 그 손으로 새긴 흠집도, 결국 같은 뜻이었다. 그냥 표현 방식이 달랐을 뿐.", "condition": { "hasCase001Save": true } },
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
    },

    // ========== 3장 — 관리자 집무실 (분기점) ==========
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

    // ---- 분기 A: 인사 계승 기록 ----
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

    // ---- 분기 B: 방송코어 로그 ----
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
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...그리고 지금 진행 중인 게 #13. 002 파일에서 읽었던 그 산속 중계탑, R-03 사건. 그게 열세 번째였다.", "condition": { "hasCase001Save": true } },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...그리고 지금 진행 중인 게 #13. 지금 이 감사 자체가, 열세 번째 사례라는 뜻이다.", "condition": { "hasCase001Save": false } },
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
    },

    // ========== 4장 — 병원의 진짜 근원지 ==========
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
    },

    // ========== 5장 — 원본 기록 보관고 + 클라이맥스 ==========
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
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...그럼 001 파일에 있던 그 찢어진 사진. 얼굴만 뜯겨 나가 있었다던 그거.", "condition": { "hasCase001Save": true } },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...누군가 일부러 얼굴을 지운 사례가, 이번이 처음이 아닐 수도 있겠다.", "condition": { "hasCase001Save": false } },
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
        { "speaker": "내레이션", "text": "그런데 얼굴이 하나가 아니다. 여러 얼굴이 겹쳐서, 계속 바뀌고 있다.", "fx": "facesOverlap" },
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
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "마지막까지, 뭔가를 심으려 했다." }
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
      "itemCollage": [
        { "case": "case001", "image": "assets/items/broken-badge.png", "label": "R-07의 부서진 신분증" },
        { "case": "case002", "image": "assets/items/symbol-rubbing.png", "label": "002의 낙인 탁본" },
        { "case": "case003", "image": "assets/items/r01-original-photo.png", "label": "R-01의 원본 사진" }
      ],
      "lines": [
        { "text": "R-07의 부서진 신분증, 002의 낙인 탁본, 그리고 R-01의 원본 사진 — 세 케이스에서 모은 것들이 눈앞에 나란히 놓인다." },
        { "text": "수사노트 마지막 페이지가, 처음으로 완전히 채워진다." },
        { "text": "결재란에, 지금까지 어떤 조사관의 이름도 아닌 — 이 계정으로 로그인한 당신의 흔적이 남는다." },
        { "text": "[STORY ARCHIVE — 기록 완성]" },
        { "text": "(엔딩: 완성된 기록 — 001부터 여기까지, 전부 당신이 이어온 것이다)" }
      ]
    }

  }

};
