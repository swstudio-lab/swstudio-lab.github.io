/*
  🎲 오늘의 랜덤 콘텐츠
  - 메인 페이지 중간에 자연스럽게 끼워 넣는 "오늘은 뭐가 나올까" 카드.
  - 기본은 오늘 날짜를 시드로 써서 "오늘 하루는 모두에게 같은 게 나옴" → 나중에 방문자가 늘면
    "너 오늘 메인에서 그거 봤어?" 하고 공유되기 좋게 하기 위한 설계.
  - [다른 거 뽑기]를 누르면 그 순간엔 진짜 랜덤으로 바뀜 (날짜 시드 무시).

  ── 콘텐츠 추가하는 법 ──
  아래 CONTENT 배열에 객체 하나 더 추가하면 끝. 예:
  { category:'fun', icon:'😂', title:'오늘의 OO', body:'짧은 한 줄', link:null }
  category는 'game' | 'tool' | 'fun' | 'dev' 중 하나 (카드 색깔이 자동으로 달라짐).
  link가 있으면 "자세히 보기" 버튼이, 없으면 안 뜸 (텍스트만 보여주는 카드는 link 생략).
*/
(function(){
  "use strict";

  const CONTENT = [
    // ── 게임 (이미 만든 것들 소개) ──
    { category:'game', icon:'🎮', title:'오늘의 미니게임 — 폭탄 돌리기', body:'터지기 전에 넘겨야 하는 그 게임.', link:'games/bomb-pass/index.html', linkLabel:'플레이하기' },
    { category:'game', icon:'🐎', title:'오늘의 미니게임 — 경마 배팅', body:'가상 머니로 즐기는 경마 배팅 게임.', link:'games/horse-race/index.html', linkLabel:'플레이하기' },
    { category:'game', icon:'🗡️', title:'오늘의 미니게임 — 던전 RPG', body:'짧게 즐기는 텍스트 던전 탐험.', link:'games/dungeon-rpg/index.html', linkLabel:'플레이하기' },
    { category:'game', icon:'🃏', title:'오늘의 미니게임 — 짝 맞추기', body:'카드 뒤집어서 짝 맞추는 기억력 게임.', link:'games/memory-match/index.html', linkLabel:'플레이하기' },
    { category:'game', icon:'📜', title:'오늘의 미니게임 — K-USLE 자격증', body:'5초 무소음 미니게임으로 나만의 뇌절 자격증 발급받기.', link:'games/k-usle/index.html', linkLabel:'플레이하기' },
    { category:'game', icon:'✂️', title:'오늘의 실험 — AI 게임 빌더', body:'가위바위보/퀴즈를 직접 조립해보는 AI 실험실.', link:'ai-lab/rps-builder/index.html', linkLabel:'구경하기' },

    // ── 기타(재미) — 이미 만든 것들 소개 ──
    { category:'fun', icon:'⚖️', title:'오늘의 밸런스게임', body:'고민되는 양자택일, 다른 사람들 선택도 같이 볼 수 있어요.', link:'etc/balance-game/index.html', linkLabel:'해보기' },
    { category:'fun', icon:'🔮', title:'오늘의 운세', body:'오늘 하루 운세 가볍게 확인하기.', link:'etc/fortune/index.html', linkLabel:'해보기' },
    { category:'fun', icon:'📅', title:'오늘의 연휴 계산기', body:'다음 연휴까지 며칠 남았는지 바로 확인.', link:'etc/holiday-calc/index.html', linkLabel:'확인하기' },

    // ── 업무툴 맛보기 — 이미 만든 작업물 소개 ──
    { category:'tool', icon:'✅', title:'오늘의 작업물 — TaskFlow', body:'팀 할일 관리 보드. 실시간으로 같이 씁니다.', link:'works/todo-wbs/index.html', linkLabel:'자세히 보기' },
    { category:'tool', icon:'🧮', title:'오늘의 작업물 — 함수식 마법사', body:'엑셀 함수식을 조건만 넣으면 자동으로 만들어줘요.', link:'works/excel-wizard/index.html', linkLabel:'자세히 보기' },
    { category:'tool', icon:'📊', title:'오늘의 작업물 — DataLoom', body:'엑셀 업로드하면 대시보드가 자동으로 만들어져요.', link:'works/dataloom/index.html', linkLabel:'자세히 보기' },
    { category:'tool', icon:'🖨️', title:'오늘의 작업물 — DocFlow', body:'문서 이미지 자동 크롭·기울기 보정·도장 추출 도구.', link:'works/docflow/index.html', linkLabel:'자세히 보기' },

    // ── 오늘의 꿀팁(엑셀) ──
    { category:'tool', icon:'💡', title:'오늘의 엑셀 함수', body:'=UNIQUE(범위) — 중복 없는 값만 쏙 뽑아줘요 (최신 엑셀 한정).' },
    { category:'tool', icon:'💡', title:'오늘의 엑셀 함수', body:'=XLOOKUP(찾을값, 찾을범위, 반환범위) — VLOOKUP보다 유연하고, 왼쪽 열도 찾을 수 있어요.' },
    { category:'tool', icon:'💡', title:'오늘의 엑셀 함수', body:'Ctrl + Shift + L — 선택 범위에 필터를 즉시 적용/해제해요.' },
    { category:'tool', icon:'💡', title:'오늘의 엑셀 함수', body:'=TEXTJOIN(", ", TRUE, 범위) — 범위의 값들을 구분자로 이어붙여요 (빈 셀은 건너뜀).' },
    { category:'tool', icon:'💡', title:'오늘의 엑셀 함수', body:'F4 — 방금 한 작업을 그대로 반복 실행해요. 서식 복사 같은 반복작업에 유용해요.' },

    // ── 오늘의 개발 팁(JS) ──
    { category:'dev', icon:'💻', title:'오늘의 JavaScript 팁', body:"Array.prototype.at(-1) 을 쓰면 배열의 마지막 요소를 인덱스 계산 없이 바로 가져올 수 있어요." },
    { category:'dev', icon:'💻', title:'오늘의 JavaScript 팁', body:"??(nullish coalescing)는 null/undefined일 때만 기본값을 써요. 0이나 '' 는 그대로 유지돼요." },
    { category:'dev', icon:'💻', title:'오늘의 JavaScript 팁', body:"console.table(배열) 을 쓰면 객체 배열을 표 형태로 예쁘게 볼 수 있어요." },
    { category:'dev', icon:'💻', title:'오늘의 JavaScript 팁', body:"structuredClone(obj) 으로 객체를 깊은 복사할 수 있어요 (JSON 왕복 안 해도 돼요)." },

    // ── 오늘의 직장인 명언(오리지널 병맛 명언 — 실존 인물 인용 아님) ──
    { category:'fun', icon:'💬', title:'오늘의 명언', body:'"퇴근은 예술이다. 매일 다른 타이밍에 완성해야 하니까." — K-USLE 평가원' },
    { category:'fun', icon:'💬', title:'오늘의 명언', body:'"회의가 길어지는 이유는 답이 없어서가 아니라, 답을 말하기 무서워서다." — K-USLE 평가원' },
    { category:'fun', icon:'💬', title:'오늘의 명언', body:'"월요일은 인간이 만든 것 중 가장 재현성 높은 고통이다." — K-USLE 평가원' },
    { category:'fun', icon:'💬', title:'오늘의 명언', body:'"야근은 능력이 아니라 일정관리의 실패를 증명하는 자격증이다." — K-USLE 평가원' },

    // ── 오늘의 TMI ──
    { category:'fun', icon:'🧠', title:'오늘의 TMI', body:'월요일 오전 9~10시가 한 주 중 커피 소비량이 제일 많은 시간대라고 해요.' },
    { category:'fun', icon:'🧠', title:'오늘의 TMI', body:"'수고하세요'는 원래 윗사람이 아랫사람한테 쓰던 인사말이었대요." },
    { category:'fun', icon:'🧠', title:'오늘의 TMI', body:'점심 후 졸림은 의지 문제가 아니라, 소화 때문에 뇌로 가는 혈류가 줄어서 그런 거예요.' },

    // ── 오늘의 드립 ──
    { category:'fun', icon:'😂', title:'오늘의 드립', body:'Q. 회사에서 가장 빠른 사람은? A. 정시 퇴근하는 사람.' },
    { category:'fun', icon:'😂', title:'오늘의 드립', body:'Q. 야근할 때 제일 친한 친구는? A. 배달앱.' },
    { category:'fun', icon:'😂', title:'오늘의 드립', body:'Q. 월요일이 싫어하는 요일은? A. 없음. 월요일은 모두를 싫어함.' },
  ];

  const CATEGORY_STYLE = {
    game: { grad:'linear-gradient(135deg,#7c5cff,#4facfe)', label:'GAME' },
    tool: { grad:'linear-gradient(135deg,#10b981,#3b82f6)', label:'TOOL' },
    fun:  { grad:'linear-gradient(135deg,#f5b942,#f2994a)', label:'FUN' },
    dev:  { grad:'linear-gradient(135deg,#22d3ee,#a855f7)', label:'DEV' },
  };

  // 오늘 날짜(YYYY-MM-DD)를 숫자 시드로 바꿔서, 같은 날엔 항상 같은 인덱스가 나오게 함
  function dailySeedIndex(len){
    const d = new Date();
    const key = `${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`;
    let hash = 0;
    for(let i=0;i<key.length;i++){ hash = (hash*31 + key.charCodeAt(i)) | 0; }
    return Math.abs(hash) % len;
  }
  function randomIndex(len){ return Math.floor(Math.random()*len); }
  // 방금 본 카드(exclude)는 피해서 뽑음. 콘텐츠가 1개뿐이면 어차피 피할 게 없으니 그냥 반환.
  function randomIndexExcluding(len, exclude){
    if(len <= 1) return 0;
    let idx = randomIndex(len);
    while(idx === exclude){ idx = randomIndex(len); }
    return idx;
  }

  let currentIndex = -1;

  function render(index){
    currentIndex = index;
    const item = CONTENT[index];
    const style = CATEGORY_STYLE[item.category];
    const root = document.getElementById('dailyPick');
    if(!root) return;

    root.innerHTML = `
      <div class="dp-card" style="--dp-grad:${style.grad}">
        <div class="dp-top">
          <span class="dp-tag">${style.label}</span>
          <button class="dp-reroll" id="dpReroll" title="다른 카드 뽑기">🔄 다시 뽑기</button>
        </div>
        <div class="dp-icon">${item.icon}</div>
        <div class="dp-title">${item.title}</div>
        <div class="dp-body">${item.body}</div>
        ${item.link ? `<a class="dp-link" href="${item.link}">${item.linkLabel || '보러 가기'} →</a>` : ''}
      </div>
    `;
    document.getElementById('dpReroll').addEventListener('click', ()=>{
      render(randomIndexExcluding(CONTENT.length, currentIndex));
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    render(dailySeedIndex(CONTENT.length));
  });
})();
