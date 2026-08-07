window.CASE_DATA = {
  "id": "case002",
  "title": "CASE-002: 기음 (거짓된 복음)",
  "start": "prologue_registration",

  // 001의 4개 엔딩(truth/admin-hands/walked-away/accomplice)과 별개로, 002는 이 5개
  // endingId를 기준으로 로드맵/엔딩티저의 "전부 모았는지" 판단이 이뤄진다 (main.js가
  // sceneData.allEndingIds를 읽어서 001 하드코딩 폴백 대신 이 목록을 사용함).
  "allEndingIds": ["walked-away-002", "flagged", "silenced", "extracted", "reaching-in"],

  "endingTeaser":
    "파일을 닫기 전, 오래된 메모 하나가 함께 딸려 나온다.\n\n\"병원 쪽에서도 비슷한 신호가 있었다는 얘기, 예전에 들은 적 있다.\"\n\n...13. 그 숫자가 정확히 뭘 세는 건지는, 아직 아무도 모른다.",

  "completeRecordTeaser":
    "[UNCLOSED THREAD — HOSPITAL RELOCATION]\n\n병원이 이전된 시기와, 저 신호가 처음 감지된 시기. 둘이 겹친다는 걸 알아챈 사람은, 아직 아무도 살아서 보고하지 못했다.\n\n관리자: \"같은 역할을 맡고 있을 뿐입니다\" — 그 말, R-07도 들었고, 당신도 들었다.\n\n다음 파일이 곧 열릴 것이다.",

  "items": {
    "symbol_rubbing": { "image": "assets/items/symbol-rubbing.png", "label": "낙인 탁본" },
    "broadcast_logs": { "image": "assets/items/broadcast-logs.png", "label": "방송 로그 사본" },
    "r03_journal": { "image": "assets/items/r03-journal-open.png", "label": "R-03의 개인 기록물" },
    "jamming_device": { "image": "assets/items/jamming-device.png", "label": "방해 장치" },
    "pill_bottle": { "image": "assets/items/pill-bottle.png", "label": "라벨 없는 약병" },
    "newspaper_clipping_copy": { "image": "assets/items/newspaper-clipping-copy.png", "label": "신문 스크랩 사본" }
  },

  "notes": {
    "symbol_rubbing": {
      "baseNote": "누군가 남긴 표식을 종이에 문질러 뜬 것. 001 사건 기록에 남아있는 그 별 모양과 정확히 같다."
    },
    "broadcast_logs": {
      "baseNote": "정기 점검 기록 사본 4부. 셋은 같은 날짜, 하나만 삼 주 전 — 그리고 표현도 미묘하게 다르다."
    },
    "r03_journal": {
      "baseNote": "R-03의 개인 기록물. 신호가 뭔가를 심고 있다는 걸 이미 알아챘던 흔적. 기록은 끝을 맺지 못한 채 끊긴다."
    },
    "jamming_device": {
      "baseNote": "미완성 방해 장치. R-03이 끝내지 못한 일."
    },
    "pill_bottle": {
      "baseNote": "라벨 없는 약병. 성분 표기가 지워져 있다.",
      "updates": [
        {
          "condition": { "flag": "chapter3_entered_case002" },
          "text": "라벨 없는 약병. 001에서도, 002에서도 나타났다. R-03의 메모에 따르면 재고 수량이 사라진 사번 개수와 정확히 맞물려 줄어들고 있다 — 001의 '절대 재고 확인 금지' 경고문이 여기서 진짜 의미를 갖는다."
        }
      ]
    },
    "newspaper_clipping_copy": {
      "baseNote": "빛바랜 신문 스크랩 사본. R-03이 여백에 날짜를 동그라미 쳐뒀다 — 병원이 문 닫은 시기와, 이 탑이 가동을 시작한 시기가 겹친다는 뜻."
    }
  },

  "scenes": {

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
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...파일에서 읽었던 인상이랑 다르다. 이 목소리, 같은 사람이 맞나." },
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
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 표시, 001 파일 사진에 있던 그 별 모양이랑 정확히 같다." },
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
    },

    // ========== 2장 — 내부 복도 + 방송실 ==========
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
    // 이어짐(정답 자체는 대사로 항상 밝혀지되, 몇 번 틀렸는지가 관리자와의 긴장도에 영향을 줌)
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
    },

    // ========== 3장 — R-03의 은신처 ==========
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
        {
          "speaker": "내레이션", "text": "책상 위, 라벨 없는 약병 하나가 놓여있다.",
          "addItem": "pill_bottle"
        },
        {
          "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...이 약, 001 파일에 사진으로 남아있던 그 약병이랑 똑같이 생겼다.",
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
        {
          "speaker": "내레이션", "text": "약병 옆, 빛바랜 신문 스크랩 사본 한 장이 클립으로 고정되어 있다.",
          "addItem": "newspaper_clipping_copy",
          "itemImage": "assets/items/newspaper-clipping-copy.png",
          "itemLabel": "신문 스크랩 사본"
        },
        {
          "speaker": "내레이션", "text": "스크랩 여백에, R-03의 필체로 날짜 하나가 동그라미 쳐져 있다 — 이 중계탑이 가동을 시작한 날짜와 같다."
        },
        {
          "character": "{gender}-neutral", "speaker": "조사관(나)",
          "text": "(혼잣말) ...이거, 001에서 봤던 그 병원 이전 기사잖아. R-03도 이걸 갖고 있었다니.",
          "condition": { "hasCase001Save": true }
        },
        {
          "character": "{gender}-neutral", "speaker": "조사관(나)",
          "text": "(혼잣말) ...병원 이전 기사? 사본까지 만들어서 모아뒀다는 건, R-03 전에도 이걸 조사하던 사람이 있었다는 뜻이다.",
          "condition": { "hasCase001Save": false }
        },
        { "speaker": "관리자", "text": "오래된 자료예요. 지금이랑은 상관없습니다." },
        {
          "character": "{gender}-neutral", "speaker": "조사관(나)",
          "text": "(혼잣말) ...R-03이 이걸 어디서 구했는지가 더 궁금한데. 파일 보관실이라도 뒤졌던 건가."
        },
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
        { "speaker": "R-03 [기록]", "text": "\"...재고 수량이 하나씩 준다. 그것도, 지금까지 사라진 사번 개수랑 정확히 같은 속도로.\"", "typingProfile": "decelerating" },
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
        }
      ]
    },

    // ========== 4장 — 서버실 (클라이맥스) ==========
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

  }
};
