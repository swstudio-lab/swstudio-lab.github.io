window.CASE_DATA = {
  "id": "case001",
  "title": "CASE-001: 잊혀진 기록",
  "start": "archive_prologue",
  "items": {
    "broken_badge": { "image": "assets/items/broken-badge.png", "label": "부서진 신분증 — R-07" },
    "newspaper_clipping": { "image": "assets/items/newspaper-clipping.png", "label": "빛바랜 신문 스크랩" },
    "pill_bottle": { "image": "assets/items/pill-bottle.png", "label": "라벨 없는 약병" },
    "torn_photo": { "image": "assets/items/torn-photo.png", "label": "찢어진 사진" },
    "alley_key": { "image": "assets/items/alley-key.png", "label": "지하 출입 열쇠" },
    "voice_recorder": { "image": "assets/items/voice-recorder.png", "label": "R-07의 개인 녹음기" },
    "research_notebook": { "image": "assets/items/research-notebook-open.png", "label": "연구 노트" }
  },
  "journalUnlock": {
    "knowledgeThreshold": 3,
    "note": "[주석 — 조사관 개인 메모] R-03... 그 이름이 자꾸 마음에 걸린다. 관리자가 무심코 흘린 그 이름, 어디선가 들어본 것 같은데 기억이 나지 않는다. 어쩌면, 나도 예전에 이 아카이브를 거쳐 간 적이 있는 건 아닐까."
  },
  "notes": {
    "newspaper_clipping": {
      "baseNote": "빛바랜 신문 스크랩. 병원 이전 논란에 관한 기사.",
      "updates": [
        { "condition": { "flag": "chapter4_entered" }, "text": "...병원이 이전한 시기와 연구시설이 폐쇄된 시기가 정확히 겹친다. 우연일 리 없다." }
      ]
    },
    "pill_bottle": {
      "baseNote": "라벨 없는 약병. '절대 재고 확인 금지'라는 메모.",
      "updates": [
        { "condition": { "item": "voice_recorder" }, "text": "...R-07의 목소리, 뒤로 갈수록 둔했다. 이 약, 그것과 관련 있을지도." }
      ]
    },
    "broken_badge": {
      "baseNote": "부서진 신분증. 사번 R-07.",
      "updates": [
        { "condition": { "flag": "confrontation_seen" }, "text": "...이 사번 체계, R-01부터 있었다는 뜻이다. R-07은 일곱 번째였을 뿐이다." }
      ]
    },
    "wheelchair": {
      "baseNote": "바퀴 자국이 아직 마르지 않았다. 최근까지 쓰였다.",
      "updates": [
        { "condition": { "flag": "chapter4_entered" }, "text": "...이 사건, 우리가 생각한 것보다 훨씬 최근에 벌어진 일이다." }
      ]
    },
    "torn_photo": { "baseNote": "얼굴이 뜯겨나간 사진. 두 사람 중 하나는, 지워졌다." },
    "alley_key": { "baseNote": "꼬리표엔 '지하 — B'. 이 열쇠가 어디로 이어질지, 그때는 몰랐다." },
    "voice_recorder": { "baseNote": "R-07이 남긴 마지막 경고. \"그 문, 열기 전에 한 번만 더 생각해.\"" },
    "research_notebook": { "baseNote": "표지가 심하게 헤진 연구 노트. 안에는 낯선 이름들과 날짜들이 가득하다." }
  },
  "scenes": {
    "archive_prologue": {
      "background": "assets/backgrounds/abandoned-hospital.png",
      "lines": [
        { "speaker": "", "text": "[PROFILE REGISTERED]\n조사관 유형: {genderLabel}\n사번: 발급 대기중...", "effect": "decode" },
        { "speaker": "", "text": "[ARCHIVE ACCESS LOG]", "effect": "decode" },
        { "speaker": "내레이션", "text": "\"Story Archive\" — 실종 사건을 기록하고, 그 기록을 파는 곳. 유가족도, 경찰도 아닌 곳에서 돈을 받고 사라진 사람들의 이야기를 판다." },
        { "speaker": "내레이션", "text": "채용공고는 간단했다. \"아카이브 조사관 모집. 경력 무관. 사유 불문. 즉시 채용.\"" },
        { "speaker": "내레이션", "text": "면접은 없었다. 그날로 계정이 발급됐다." },
        { "character": "{gender}-neutral", "position": "left", "speaker": "조사관(나)", "text": "(혼잣말) ...너무 쉽게 들어온 것 같은데, 뭐 어때. 지금 필요한 건 그냥 이거였으니까." },
        { "speaker": "내레이션", "text": "첫 배정 파일. CASE-001. 사번 R-07. 담당 조사관, 실종." },
        { "speaker": "내레이션", "text": "\"현장에 직접 접속해 기록을 수집하십시오. 관리자가 안내할 것입니다.\"" },
        { "speaker": "내레이션", "text": "계약서 맨 아래, 작은 글씨 — \"기록된 것은 사라지지 않습니다.\"" },
        { "speaker": "내레이션", "text": "어디서 본 문구 같은데, 기억이 안 난다." }
      ],
      "next": "corridor_intro"
    },

    "corridor_intro": {
      "background": "assets/backgrounds/abandoned-hospital.png",
      "bgm": "assets/bgm/hospital-ambience.mp3",
      "hotspots": [
        { "id": "wheelchair", "left": "48%", "top": "53%", "width": "9%", "height": "15%", "closeup": "assets/closeups/wheelchair.png", "label": "덩그러니 놓인 휠체어", "discoveryText": "바퀴 자국이 아직 마르지 않았다. 이 휠체어, 최근까지 쓰였다.", "onDiscoverSetStat": { "knowledge": 1 } }
      ],
      "lines": [
        { "speaker": "", "text": "[UNLOCKING FILE...]", "effect": "decode" },
        { "speaker": "내레이션", "text": "형광등 하나가 위태롭게 깜빡인다. 그 빛이 닿을 때마다 복도 끝이 잠깐씩 나타났다 사라진다.", "fx": "shadowflash" },
        { "speaker": "내레이션", "text": "아카이브 시스템 — 파일명 CASE-001. 담당자: R-07. 상태: 실종, 수사 미종결.", "setFlag": { "visited_start": true } },
        { "character": "{gender}-neutral", "position": "left", "speaker": "조사관(나)", "text": "...이 자리, 얼마 만이지." },

        { "speaker": "내레이션", "text": "[무전 연결음]" },
        { "speaker": "관리자", "text": "관리자입니다. 신호 잡히나요? 좋습니다, 이제 시작하죠." },
        { "speaker": "관리자", "text": "힘든 임무라는 거 압니다. R-07은... 좋은 조사관이었어요. 그러니까 우리도 최선을 다해 찾아야죠." },
        { "speaker": "관리자", "text": "무리하지 마세요. 위험하다 싶으면 언제든 철수해도 됩니다. 제가 계속 지켜보고 있을 테니까." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...생각보다 다정하네." },
        { "speaker": "관리자", "text": "그것도 들립니다. 마이크가 항상 켜져 있어서요." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...항상, 이라고." },
        { "speaker": "관리자", "text": "자, 눈앞부터 살펴보시죠." },

        { "speaker": "내레이션", "text": "복도는 생각보다 넓다. 오른쪽엔 반쯤 열린 병실 문들이 줄지어 있고, 왼쪽 끝엔 간호사 스테이션으로 보이는 자리가 보인다." },
        { "speaker": "내레이션", "text": "복도 한가운데, 주인 없는 휠체어 하나가 덩그러니 놓여있다. 그 옆에 뭔가 반짝인다." },
        {
          "speaker": "내레이션",
          "text": "부서진 신분증 조각. 사번 R-07. 손끝에 닿는 순간, 차갑다.",
          "addItem": "broken_badge",
          "itemImage": "assets/items/broken-badge.png",
          "itemLabel": "부서진 신분증 — R-07",
          "fx": "flash"
        },
        { "speaker": "관리자", "text": "찾으셨군요. 잘하셨어요. 그게 첫 단서가 될 겁니다." },
        { "speaker": "관리자", "text": "...잠깐, 이 기록 형식 — 예전에 R-03 때도... 아니, R-07보다 먼저였나. 이거랑 똑같은 양식을 썼던 것 같은데." },
        { "speaker": "관리자", "text": "아, 신경 쓰지 마세요. 그냥 혼잣말이었어요. 계속하죠." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(방금 그 이름, 어디서 들어본 것 같기도 하고.)" },
        { "speaker": "내레이션", "text": "오른쪽 병실 중 하나로 들어가 보기로 한다." }
      ],
      "next": "patient_room"
    },

    "patient_room": {
      "background": "assets/backgrounds/patient-room.png",
      "bgm": "assets/bgm/hospital-ambience.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "매트리스는 뒤집혀 있고, 협탁 위엔 누렇게 바랜 종이 한 장이 놓여 있다.", "fx": "shadowflash" },
        {
          "speaker": "내레이션",
          "text": "지역 신문 스크랩. 날짜는 알아볼 수 없지만, '병원 이전 결정, 주민들 반발' 같은 제목이 겨우 보인다.",
          "addItem": "newspaper_clipping",
          "itemImage": "assets/items/newspaper-clipping.png",
          "itemLabel": "빛바랜 신문 스크랩"
        },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "이 병원, 그냥 낡아서 버려진 게 아니었나." },
        { "speaker": "관리자", "text": "오래된 얘기예요. 지금 사건이랑은 상관없으니 신경 쓰지 마세요." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(상관없다면서 왜 저렇게 빨리 대답하지.)" },
        { "speaker": "내레이션", "text": "복도로 돌아 나와, 이번엔 간호사 스테이션 쪽으로 향한다." }
      ],
      "next": "nurse_station"
    },

    "nurse_station": {
      "background": "assets/backgrounds/nurse-station.png",
      "bgm": "assets/bgm/hospital-ambience.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "서랍 하나가 반쯤 열려 있다." },
        {
          "speaker": "내레이션",
          "text": "먼지 쌓인 약병 하나. 라벨은 지워졌지만, 손으로 쓴 메모가 테이프로 붙어있다 — '절대 재고 확인 금지'.",
          "addItem": "pill_bottle",
          "itemImage": "assets/items/pill-bottle.png",
          "itemLabel": "라벨 없는 약병"
        },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "'재고 확인 금지'라니, 병원 약품에?" },
        { "speaker": "관리자", "text": "그런 것까지 하나하나 신경 쓰면 끝이 없어요. 본론에 집중하죠." },
        { "speaker": "내레이션", "text": "그때, 복도 저편 낡은 스피커에서 지지직거리는 소리가 새어 나온다.", "fx": "shadowflash" }
      ],
      "next": "corridor_logs"
    },

    "corridor_logs": {
      "background": "assets/backgrounds/abandoned-hospital.png",
      "bgm": "assets/bgm/hospital-ambience.mp3",
      "lines": [
        { "speaker": "", "text": "[SIGNAL DETECTED — PLAYBACK...]", "effect": "decode" },
        { "speaker": "R-07 [로그 03]", "text": "...이상 없음. 자료 회수 완료. 다음 구역으로 이동한다.", "typingProfile": "decelerating" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "목소리가... 너무 멀쩡한데." },
        { "speaker": "관리자", "text": "초반 기록이니까요. 더 들어보면 도움이 될 거예요." },

        { "speaker": "내레이션", "text": "잡음이 다시 커졌다 작아지길 반복한다. 몇 초 후, 다른 조각이 이어 재생된다." },
        { "speaker": "R-07 [로그 07]", "text": "...관리자가 준 좌표가, 실제 도면이랑 안 맞는다. 다시 한번 확인해야겠다.", "typingProfile": "decelerating" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(도면이 안 맞았다고?)" },
        { "speaker": "관리자", "text": "오래된 자료라 오차가 있었던 것뿐이에요. 그때 다 정리된 문제입니다." },

        { "speaker": "내레이션", "text": "스피커가 다시 지지직거리다, 이번엔 목소리가 조금 다르게 들린다 — 아주 살짝, 서두르는 듯한 어조로." },
        { "speaker": "R-07 [로그 09]", "text": "...괜찮다. 별일 아니다. 그냥 예정보다 조금 늦어지는 것뿐이다.", "typingProfile": "decelerating" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(방금 그거, 스스로한테 하는 말 같았는데.)" },
        { "speaker": "관리자", "text": "자, 여기까지만 들으시죠. 나머지는 진행하시면서 차차 확인하고요." },
        { "speaker": "관리자", "text": "지금까지 확보한 것만으로도 충분히 의미 있는 진전이에요. 계속 진행하시겠어요?" }
      ],
      "choices": [
        { "text": "관리자님 말대로 좀 더 들어본다", "setStat": { "trust": 1 }, "reaction": "(혼잣말) ...일단은 믿어보자.", "next": "alley_arrival" },
        { "text": "혼자 다른 병실부터 더 살펴본다", "setStat": { "knowledge": 1 }, "reaction": "(혼잣말) ...전부 믿을 순 없지.", "next": "alley_arrival" }
      ]
    },

    "alley_arrival": {
      "background": "assets/backgrounds/back-alley.png",
      "bgm": "assets/bgm/alley-rain.mp3",
      "hotspots": [
        { "id": "alley_door", "left": "59%", "top": "50%", "width": "7%", "height": "11%", "closeup": "assets/closeups/alley-door.png", "label": "골목 안쪽 철문", "discoveryText": "자물쇠 옆, 손톱으로 눌러쓴 낙서: '배지 번호, 거꾸로'." }
      ],
      "lines": [
        { "speaker": "내레이션", "text": "신문 스크랩에 적힌 주소를 따라 병원 밖으로 나온다. 비가 내리고 있다.", "fx": "shadowflash" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "{statLine}" },
        { "speaker": "관리자", "text": "여기까지 오셨네요. 좋습니다 — 다음 단서는 이 근처에 있을 거예요." },
        { "character": "{gender}-neutral", "position": "left", "speaker": "조사관(나)", "text": "(생각보다 위치를 정확히 아네.)" },
        { "speaker": "내레이션", "text": "젖은 아스팔트 위로 가로등 불빛이 흔들린다. 골목 안쪽, 쓰레기통 사이에 뭔가 끼여 있다." },
        {
          "speaker": "내레이션",
          "text": "찢어진 사진 한 장. 두 사람이 함께 있었던 것 같은데, 한쪽 얼굴이 완전히 뜯겨나가 있다.",
          "addItem": "torn_photo",
          "itemImage": "assets/items/torn-photo.png",
          "itemLabel": "찢어진 사진",
          "fx": "flash"
        },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "얼굴을 왜 일부러 뜯어낸 거지." },
        { "speaker": "관리자", "text": "훼손된 사진이야 흔하죠. 계속 가보시죠." },
        { "speaker": "내레이션", "text": "골목 안쪽으로 더 들어가자, 벽에 붙은 낡은 로커 철문 하나가 보인다." }
      ],
      "next": "alley_search"
    },

    "alley_search": {
      "background": "assets/backgrounds/back-alley.png",
      "bgm": "assets/bgm/alley-rain.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "로커 철문에 잠금장치가 달려있다. 숫자 다이얼식이다." },
        { "speaker": "내레이션", "text": "그 옆 벽에, 뭔가 손으로 눌러쓴 듯한 흔적이 있다. 어두워서 잘 알아보기 힘들다." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(낙서인가... 뭔가 적혀있는 것 같긴 한데.)" },
        { "speaker": "관리자", "text": "낙서일 뿐이에요. 별 의미 없을 겁니다." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(별 의미 없다면서 이번에도 빨리 넘어가려고 하네.)" },
        { "speaker": "내레이션", "text": "가지고 있는 신분증 조각을 다시 꺼내본다. 사번 R-07." }
      ],
      "next": "alley_puzzle"
    },

    "alley_puzzle": {
      "background": "assets/backgrounds/back-alley.png",
      "bgm": "assets/bgm/alley-rain.mp3",
      "lines": [
        {
          "speaker": "내레이션",
          "text": "로커 철문 다이얼에 손을 올린다.",
          "puzzle": {
            "type": "code",
            "prompt": "로커 철문 다이얼 자물쇠.\n(신분증 사번: R-07)",
            "code": "70",
            "hint": "사번 07을 거꾸로 읽으면?",
            "onSuccessSetStat": { "knowledge": 1 }
          }
        },
        { "speaker": "내레이션", "text": "딸깍. 잠금이 풀린다.", "fx": "flash", "sfx": "door-creak" },
        {
          "speaker": "내레이션",
          "text": "로커 안엔 낡은 열쇠 하나뿐이다. 꼬리표엔 '지하 — B'라고만 적혀있다.",
          "addItem": "alley_key",
          "itemImage": "assets/items/alley-key.png",
          "itemLabel": "지하 출입 열쇠"
        },
        { "speaker": "관리자", "text": "...이런 것까지 남겨뒀을 줄이야. 잘하셨어요." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "이번엔 좀 놀란 것 같은데." },
        { "speaker": "관리자", "text": "기분 탓이에요. 자, 이 정도면 오늘은 충분히 진전이 있었네요." },
        { "speaker": "관리자", "text": "이 열쇠, 어떻게 하시겠어요?" }
      ],
      "choices": [
        { "text": "지금 바로 지하로 향한다", "setStat": { "courage": 1 }, "reaction": "(혼잣말) ...망설이면 더 무서워질 뿐이다.", "next": "basement_entry" },
        { "text": "일단 기록해두고 신중하게 접근한다", "setStat": { "fear": 1 }, "reaction": "(혼잣말) ...서두르다 놓치는 것도 있으니까.", "next": "basement_entry" }
      ]
    },

    "basement_entry": {
      "background": "assets/backgrounds/basement.png",
      "bgm": "assets/bgm/basement-hum.mp3",
      "hotspots": [
        { "id": "basement_door_glimpse", "left": "47%", "top": "34%", "width": "17%", "height": "37%", "closeup": "assets/closeups/basement-door.png", "label": "지하 안쪽 철문", "discoveryText": "긁힌 자국. 자세히 보니 숫자다 — '13'." }
      ],
      "lines": [
        { "speaker": "내레이션", "text": "지하로 이어지는 문에 열쇠를 꽂는다. 오래 안 쓴 자물쇠답지 않게, 뜻밖에 부드럽게 돌아간다.", "sfx": "door-creak" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "{statLine}" },
        { "speaker": "관리자", "text": "...여기까지 오실 줄은 몰랐네요." },
        { "character": "{gender}-neutral", "position": "left", "speaker": "조사관(나)", "text": "몰랐다고요? 저 여기로 보낸 사람이 누군데." },
        { "speaker": "관리자", "text": "표현이 잘못됐네요. 그만큼 빠르다는 뜻이었어요." },
        { "speaker": "내레이션", "text": "공기가 무겁다. 낡은 상자들 사이로, 누군가 오래 머문 흔적이 있는 구석 하나가 눈에 띈다.", "fx": "shadowflash" },
        { "speaker": "내레이션", "text": "담요, 손전등, 반쯤 먹다 만 통조림. 여기서 살다시피 했던 것 같다." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(사무실이 아니라 여기서 지냈다고?)" },
        { "speaker": "관리자", "text": "임무에 몰입하는 스타일이었으니까요. 특별한 일은 아니에요." }
      ],
      "next": "basement_safe"
    },

    "basement_safe": {
      "background": "assets/backgrounds/basement.png",
      "bgm": "assets/bgm/basement-hum.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "담요 밑, 작은 금속 상자 하나가 반쯤 가려져 있다. 숫자 다이얼이 달려있다." },
        { "speaker": "내레이션", "text": "상자 옆 벽면에, 뭔가 긁힌 자국이 있다. 어두워서 잘 보이지 않는다." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(숫자인가... 여기도 뭔가 남겨놨네.)" },
        { "speaker": "관리자", "text": "그런 낙서까지 다 의미 있게 볼 필요는 없어요." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(신문 스크랩 때도, 로커 철문 때도 똑같은 말을 했었지.)" },
        {
          "speaker": "내레이션",
          "text": "상자를 끌어당겨 다이얼에 손을 올린다.",
          "puzzle": {
            "type": "code",
            "prompt": "금속 상자의 4자리 다이얼.\n(신분증 사번: R-07)",
            "code": "0713",
            "hint": "사번(07)과 벽의 낙서(13)를 순서대로 이어붙이면?",
            "onSuccessSetStat": { "knowledge": 1 }
          }
        },
        { "speaker": "내레이션", "text": "철컥. 상자가 열린다.", "fx": "flash" },
        {
          "speaker": "내레이션",
          "text": "안에는 개인용 보이스 레코더 하나뿐이다. 배터리는 아직 살아있다.",
          "addItem": "voice_recorder",
          "itemImage": "assets/items/voice-recorder.png",
          "itemLabel": "R-07의 개인 녹음기"
        },
        { "speaker": "관리자", "text": "...그런 것도 갖고 있었군요. 몰랐던 부분이네요." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "이번엔 진짜로 몰랐던 것처럼 들리는데." },
        { "speaker": "내레이션", "text": "재생 버튼을 누른다." },
        { "speaker": "", "text": "[PLAYING PERSONAL LOG — UNLISTED]", "effect": "decode" },
        { "speaker": "R-07 [개인 로그]", "text": "...관리자 몰래 이걸 남긴다. 혹시 몰라서.", "typingProfile": "decelerating" },
        { "speaker": "R-07 [개인 로그]", "text": "그 사람 목소리, 어딘가 익숙하다. 처음부터 그랬는데, 이제야 왜인지 알 것 같다.", "typingProfile": "decelerating" },
        { "speaker": "R-07 [개인 로그]", "text": "만약 이걸 누군가 듣고 있다면 — 그 문, 열기 전에 한 번만 더 생각해.", "typingProfile": "decelerating", "highlight": true },
        { "speaker": "내레이션", "text": "녹음은 거기서 끊긴다.", "fx": "bloodbleed" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "..." },
        { "speaker": "관리자", "text": "잡음 때문에 잘 안 들리네요. 대수롭지 않은 내용 같은데, 계속 진행하시죠." },
        { "speaker": "내레이션", "text": "상자 안쪽 깊숙한 곳, 지하 더 안쪽으로 이어지는 철문이 보인다. 굳게 잠겨있다." }
      ],
      "next": "basement_door"
    },

    "basement_door": {
      "background": "assets/backgrounds/basement.png",
      "bgm": "assets/bgm/basement-hum.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "철문 앞에 선다. 손잡이는 차갑고, 문 틈으로 옅은 바람이 새어 나온다." },
        { "speaker": "관리자", "text": "이 문 너머가 마지막입니다. R-07이 마지막으로 향했던 곳이에요." },
        { "speaker": "관리자", "text": "여기서 멈추셔도 됩니다. 지금까지 확보한 것만으로도 충분한 보고가 될 거예요." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(녹음기에 남겼던 그 말이 자꾸 걸린다.)" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(혼잣말) ...생각해보면, 그 휠체어도 오래된 게 아니었다. 이 사건은 우리가 생각한 것보다 훨씬 최근에 벌어진 일이다.", "condition": { "flag": "examined_wheelchair" } },
        { "speaker": "관리자", "text": "어떻게 하시겠어요?" }
      ],
      "choices": [
        { "text": "문을 연다", "setFlag": { "opened_door": true }, "reaction": "(혼잣말) ...여기까지 와서 돌아갈 순 없다.", "next": "research_facility_arrival" },
        { "text": "여기서 돌아간다", "setFlag": { "opened_door": false }, "reaction": "(혼잣말) ...아니, 이건 아니야. 여기까지만 하자.", "next": "ending_retreat" }
      ]
    },

    "research_facility_arrival": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/lab-interference.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "연구소 철문 너머, 공기 자체가 다르다. 깨진 집기, 흩어진 서류, 천장에 늘어진 전선들.", "setFlag": { "chapter4_entered": true } },
        { "speaker": "내레이션", "text": "저 안쪽, 비상구 표시등만 붉게 깜빡이고 있다.", "fx": "shadowflash" },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "{statLine}" },
        { "speaker": "관리자", "text": "(평소보다 아주 조금 늦게) ...예, 여기가 맞습니다. R-07이 마지막으로 향했던 곳." },
        { "character": "{gender}-neutral", "position": "left", "speaker": "조사관(나)", "text": "(방금, 대답이 반 박자 늦었다.)" },
        { "speaker": "관리자", "text": "죄송해요, 신호가 좀 불안정해서요. 계속하시죠." },
        { "speaker": "내레이션", "text": "부서진 선반 아래쪽, 먼지가 그을린 노트 한 권이 놓여 있다." },
        {
          "speaker": "내레이션",
          "text": "연구 노트. 표지가 심하게 헤진 이 책이 지금은 펼쳐볼 엄두가 안 든다.",
          "addItem": "research_notebook",
          "itemImage": "assets/items/research-notebook-closed.png",
          "itemLabel": "연구 노트 (덮인 상태)",
          "fx": "flash"
        },
        { "speaker": "관리자", "text": "...그건 저도 예상 못했던 겁니다. 어차피 열어봐야 해요." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(또 저 말투다. \"예상 못했다\"는 말, 이번이 몇 번째지.)" },
        { "speaker": "내레이션", "text": "노트를 배낭에 집어넣고, 방 안쪽을 더 살펴보기로 한다." }
      ],
      "next": "evidence_board"
    },

    "evidence_board": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/lab-interference.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "지금까지 모은 것들을 전부 꺼내 바닥에 펼쳐놓는다." },
        { "speaker": "내레이션", "text": "부서진 신분증, 빛바랜 신문 스크랩, 찢어진 사진 — 그리고 이 방 곳곳의 흔적들. 나란히 놓으니 뭔가 이상하다." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "하나씩 보면 별거 아닌데, 나란히 놓으니 뭔가 이상하다." },
        {
          "speaker": "내레이션",
          "text": "연관 있어 보이는 것끼리, 두 개씩 짚어 연결해본다.",
          "puzzle": {
            "type": "connect",
            "prompt": "지금까지 모은 단서들. 연관 있어 보이는 것끼리 두 개씩 선택해 연결하세요.",
            "items": [
              { "id": "badge", "label": "신분증 (R-07)", "image": "assets/items/broken-badge.png" },
              { "id": "notebook_cover", "label": "연구 노트 표지", "image": "assets/items/research-notebook-closed.png" },
              { "id": "photo", "label": "찢어진 사진", "image": "assets/items/torn-photo.png" },
              { "id": "voice_recorder_card", "label": "R-07의 개인 녹음기", "image": "assets/items/voice-recorder.png" },
              { "id": "clipping", "label": "신문 스크랩 (병원 이전)", "image": "assets/items/newspaper-clipping.png" },
              { "id": "wall_mark", "label": "지하실 벽 낙서 위치", "image": "assets/items/wall-mark.png" }
            ],
            "pairs": [
              ["badge", "notebook_cover"],
              ["photo", "voice_recorder_card"],
              ["clipping", "wall_mark"]
            ],
            "connectMessages": {
              "badge|notebook_cover": "필체가 같다.",
              "photo|voice_recorder_card": "목소리는, 사진 속 인물도 알지 모릅니다.",
              "clipping|wall_mark": "네 개의 시기, 같은 장소를 가리키고 있었다."
            },
            "hint": "몇몇 흔적들은, 다른 물건에서도 똑같이 반복되고 있다.",
            "hint2": "신분증과 연구 노트 표지 — 이 둘의 필체를 비교해보세요. 나머지 두 쌍도 같은 방식(사진은 소리와, 신문은 장소와)으로 짝지어져 있습니다.",
            "onSuccessSetStat": { "knowledge": 1 }
          }
        },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(전부 연결된다. 우연이라기엔 너무 많다.)" },
        { "speaker": "내레이션", "text": "세 조합을 다 연결하자, 노트를 펼쳐볼 용기가 생긴다." },
        {
          "speaker": "내레이션",
          "text": "가져온 연구 노트를 조심스럽게 펼친다.",
          "itemReveal": true,
          "itemImage": "assets/items/research-notebook-open.png",
          "itemLabel": "연구 노트 (펼쳐진 상태)"
        }
      ],
      "next": "timeline_recap"
    },

    "timeline_recap": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/lab-interference.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "노트 사이사이, 날짜 없는 메모 조각들이 흩어져 있다. 순서가 뒤죽박죽이다.", "fx": "shadowflash" },
        {
          "speaker": "내레이션",
          "text": "조각들을 시간 순서대로 맞춰본다.",
          "puzzle": {
            "type": "sequence",
            "prompt": "노트 사이 흩어진 메모 조각들. 시간 순서대로 눌러 배열하세요.",
            "fragments": [
              { "id": "f1", "text": "\"이상 없음, 자료 회수 완료.\"" },
              { "id": "f2", "text": "\"관리자가 준 좌표가 실제 도면이랑 안 맞는다.\"" },
              { "id": "f3", "text": "\"괜찮다. 예정보다 조금 늦어지는 것뿐이다.\"" },
              { "id": "f4", "text": "\"...관리자는, 원래도 이 자리에 있던 사람이 아니었다.\" (신규 조각)" }
            ],
            "order": ["f1", "f2", "f3", "f4"],
            "hint": "다시 들어보면, 말투에 미묘한 차이가 있다는 걸 눈치챌 수 있을지도 모른다.",
            "hint2": "목소리는 이 순서로 변합니다 — 냉정한 보고 → 미묘한 의심 → 애써 참는 안심 → 확신에 찬 깨달음.",
            "onSuccessSetStat": { "knowledge": 1 }
          }
        },
        { "speaker": "내레이션", "text": "순서를 맞추자, 지금까지 조각조각 들었던 로그들이 하나의 흐름으로 이어진다 — 의심 → 자기 위안 → 확신." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(처음부터 끝까지, 무너지고 있었다.)" }
      ],
      "next": "confrontation"
    },

    "confrontation": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/climax-theme.mp3",
      "lines": [
        { "speaker": "관리자", "text": "...다 보셨군요.", "setFlag": { "confrontation_seen": true } },
        { "character": "{gender}-neutral", "position": "left", "speaker": "조사관(나)", "text": "이제 좀 확실해졌습니다." },
        { "speaker": "관리자", "text": "(아주 짧게, 목소리가 한 번 갈라진다) 저는— 저는 그냥, 관리자였습니다.", "fx": "shake" },
        { "speaker": "관리자", "text": "(목소리가 이상하게 겹쳐 들린다) 그냥... 편해지세요." },
        {
          "speaker": "내레이션",
          "text": "머릿속이 갑자기 무거워진다. 누군가 억지로 생각을 밀어넣으려 한다.",
          "fx": "bloodbleed",
          "highlight": true,
          "puzzle": {
            "type": "qte",
            "prompt": "정신을 붙잡아라!",
            "duration": 5000,
            "onSuccessSetFlag": "qte_reflex_success",
            "onSuccessSetStat": { "courage": 1 },
            "onFailSetFlag": "qte_reflex_fail",
            "onFailSetStat": { "fear": 1 }
          }
        },
        { "speaker": "내레이션", "text": "정신이 다시 또렷해진다. 벗어났다.", "condition": { "flag": "qte_reflex_success" } },
        { "speaker": "내레이션", "text": "잠깐, 생각이 끊겼다. 방금 뭘 하려고 했더라... 아니, 상관없다. 다시 집중하자.", "condition": { "flag": "qte_reflex_fail" } },
        { "speaker": "관리자", "text": "지금이라도 늦지 않았어요. 여기서 발을 빼세요. 제가 나머지 정리하겠습니다." },
        { "character": "{gender}-neutral", "speaker": "조사관(나)", "text": "(지금 이 말, R-07한테도 똑같이 했을까.)" },
        { "speaker": "관리자", "text": "어떻게 하시겠어요, 조사관님." }
      ],
      "next": "confrontation_final"
    },

    "confrontation_final": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/climax-theme.mp3",
      "lines": [
        { "speaker": "내레이션", "text": "심장이 뛰는 소리가 스피커 잡음 사이로 섞여 든다." },
        { "speaker": "관리자", "text": "어떻게 하시겠어요?" }
      ],
      "choices": [
        { "text": "관리자를 믿고 철수한다", "reaction": "(혼잣말) ...그래, 이 정도면 충분해.", "next": "ending_b" },
        { "text": "끝까지 진실을 공개한다", "reaction": "(혼잣말) ...이제 와서 물러설 순 없다.", "next": "ending_a" },
        {
          "text": "침착하게, 모든 걸 정리해서 기록해둔다",
          "condition": [
            { "stat": "knowledge", "gte": 2 },
            { "stat": "fear", "eq": 0 },
            { "stat": "courage", "gte": 2 },
            { "item": "broken_badge" },
            { "item": "newspaper_clipping" },
            { "item": "pill_bottle" },
            { "item": "torn_photo" },
            { "item": "alley_key" },
            { "item": "voice_recorder" }
          ],
          "reaction": "(혼잣말) ...서두르지 않는다. 하나씩, 전부.",
          "next": "ending_d"
        }
      ]
    },

    "ending_a": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/climax-theme.mp3",
      "ending": true,
      "endingId": "truth",
      "title": "엔딩: 진실을 마주하다",
      "lines": [
        { "text": "노트를, 배지를, 사진을 — 가진 것 전부를 챙겨 아카이브 밖으로 나온다." },
        { "text": "보고서를 제출한다. 예상대로, 아무도 크게 반응하지 않는다." },
        { "text": "며칠 후, 시스템에 신규 실종 사건 하나가 자동으로 생성된다. R-08." },
        { "text": "조사관 프로필: {genderLabel} — 사번 R-08 배정 완료." },
        { "text": "그건, 당신의 실종이었다." },
        { "text": "(엔딩 A: 진실을 마주하다 — 진실은 밝혔지만, 위험을 눈치채지 못했다)" }
      ]
    },

    "ending_b": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/climax-theme.mp3",
      "ending": true,
      "endingId": "admin-hands",
      "title": "엔딩: 관리자의 새 임무자",
      "lines": [
        { "text": "...알겠어요. 관리자님을 믿을게요." },
        { "text": "잘 생각하셨어요." },
        { "text": "철수하는 길, 무전 너머로 관리자의 목소리가 흔들려온다 — 방금 전 비상구 앞에서 R-07의 목소리와, 완전히 같은 톤으로." },
        { "text": "화면이 어두워진다. 곧, 새로운 신호가 조사관에게 브리핑하는 목소리가 들려온다." },
        { "text": "\"관리자입니다. 신호 잡히나요? 좋습니다, 이제 시작하죠.\"" },
        { "text": "그 목소리는, 당신의 것이었다." },
        { "text": "(엔딩 B: 관리자의 새 임무자 — 신뢰는 대가를 남겼다)" }
      ]
    },

    "ending_d": {
      "background": "assets/backgrounds/research-facility.png",
      "bgm": "assets/bgm/climax-theme.mp3",
      "ending": true,
      "endingId": "accomplice",
      "title": "엔딩: 공범",
      "lines": [
        { "text": "(서두르지 않는다. 전부, 하나하나 정리해서 기록해둔다.)" },
        { "text": "노트의 진짜 마지막 장 — 뒤표지 안쪽에, 아무도 못 봤던 한 줄이 숨겨져 있었다." },
        { "text": "\"이 기록들은 전부, 다음 사람을 위한 이정표다. 여기까지 왔다면 — 축하한다. 이제 당신 차례다.\"" },
        { "text": "R-07은 사라진 게 아니었다. 남기로 선택한 것이었다." },
        { "text": "지금까지의 모든 단서는, 처음부터 당신을 여기로 이끌기 위해 설계된 것이었다." },
        { "text": "(엔딩 D: 공범 — 가장 침착하고 유능하게 파고든 사람일수록, 가장 깊이 걸려들었을 것이다)" }
      ]
    },

    "ending_retreat": {
      "background": "assets/backgrounds/abandoned-hospital.png",
      "bgm": "assets/bgm/hospital-ambience.mp3",
      "ending": true,
      "endingId": "walked-away",
      "title": "엔딩: 돌아선 자",
      "lines": [
        { "text": "당신은 그 문을 열지 않기로 했다." },
        { "text": "지상으로 돌아 나오는 동안, 관리자는 평소와 다름없이 다정했다." },
        { "text": "보고서를 제출하고, 파일을 닫고, 아카이브 단말기 앞을 떠난다." },
        { "text": "그날 밤, 자기 방 거울 앞에서 — 등 뒤로 아주 짧게, 그림자 하나가 스쳐 지나갔다." },
        { "text": "아무 설명도 없이." },
        { "text": "(엔딩 C: 돌아선 자 — R-07의 정체는 끝내 밝혀지지 않는다)" }
      ]
    }
  }
};
