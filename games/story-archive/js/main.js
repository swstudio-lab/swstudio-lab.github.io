/**
 * main.js — 게임 실행 초기화
 * Phase 1 목표: 대사 진행 + 선택지 분기 + 변수/플래그 + 세이브/로드 + 스킵/로그가
 * CASE001 짧은 테스트 씬에서 실제로 동작하는지 검증.
 */

const BUILD_VERSION = 'build 2026-08-03-02';
// 어떤 케이스를 플레이할지는 ?case=case002 같은 URL 파라미터로 결정됨(없으면 case001).
// game.html의 인라인 로더 스크립트가 같은 파라미터로 해당 케이스의 scene-data.js를
// 미리 동기적으로 로드해두므로, 여기서는 파라미터만 다시 읽어서 나머지 상태/저장 키를 맞춘다.
const CASE_ID = new URLSearchParams(window.location.search).get('case') || 'case001';
const CASE_BASE = `cases/${CASE_ID}/`;
const CASE_LABEL = CASE_ID.toUpperCase().replace('CASE', 'CASE-'); // 'case002' -> 'CASE-002'

let sceneData = null;
let state = null;
let ui = null;
let sound = null;
let puzzle = null;
let currentLineIndex = 0;

// "이전 대사 다시 보기" 기능용 전역 히스토리 — 씬 경계를 넘어서도 유지됨
// (뒤로 갈 때 flag/item/fx 등 부작용을 다시 실행하지 않기 위해, 이미 실제로 재생된 라인만 기록)
let currentScene = null;
let history = []; // { sceneId, lineIndex, speaker, text, character, position, background, bgm }
let historyPos = -1; // history에서 현재 화면에 표시 중인 위치
let lastRenderedSceneId = null; // 히스토리 이동 중 씬이 바뀌었는지 판단(배경/캐릭터/핫스팟 갱신 여부)에 사용
let hotspotRegistry = {}; // 모든 씬의 hotspot을 id로 모아둔 맵 — 수사노트가 씬 경계 없이 발견물을 조회할 때 사용

// C: 그림자 섬광(2-2) 쿨다운 — 이미 감정적 절정이 아닌 라인에만 고정 배치했지만(트리거 자체는
// 여전히 신뢰), 스킵 모드 등으로 배치된 라인들을 짧은 시간에 연달아 지나칠 경우 남발되지 않도록
// 세션 내 최소 재발동 간격을 둔다. QTE 실패 시의 flashShadow() 재사용은 이 쿨다운과 무관(별도 트리거).
let lastShadowFlashTime = 0;
const SHADOW_FLASH_COOLDOWN_MS = 2 * 60 * 1000;

// 대사 텍스트 안의 플레이스홀더 치환:
// {genderLabel} → 성별 선택 연출/엔딩 A 전용, {statLine} → 2-4 챕터 전환 시 스탯 기반 내면 대사
function resolveText(text) {
  if (!text) return text;
  if (text === '{statLine}') return getStatPersonalityLine();
  if (text.indexOf('{genderLabel}') !== -1) {
    return text.replace(/\{genderLabel\}/g, state.playerGender === 'male' ? '남성' : '여성');
  }
  return text;
}

// 2-4: 스탯은 화면에 안 보이지만, 챕터 전환 시점마다 그때까지 가장 높은 스탯에 따라
// 조사관의 내면을 한 줄로 체감시킨다. 동점 시 우선순위: knowledge > courage > trust > fear.
const STAT_PERSONALITY_LINES = {
  knowledge: '(혼잣말) ...하나씩 맞춰보면 답이 나올 거야.',
  courage: '(혼잣말) ...망설일 시간 없어.',
  trust: '(혼잣말) ...그래도 믿어보자.',
  fear: '(혼잣말) ...손이 떨린다. 아무렇지 않은 척하자.',
};
function getStatPersonalityLine() {
  const priority = ['knowledge', 'courage', 'trust', 'fear'];
  let leader = 'knowledge';
  let leaderVal = -Infinity;
  priority.forEach((key) => {
    const v = state.getStat(key);
    if (v > leaderVal) {
      leaderVal = v;
      leader = key;
    }
  });
  return STAT_PERSONALITY_LINES[leader];
}

function resetHistory() {
  history = [];
  historyPos = -1;
  lastRenderedSceneId = null;
}

async function boot() {
  const root = document.getElementById('game-root');
  ui = new UIManager(root);
  ui.setNoteToastHandler(() => renderInvestigationNotes()); // D: 토스트 클릭 시 바로 수사노트 열기
  sound = new SoundManager(CASE_BASE + 'assets/bgm/title-theme.mp3');
  puzzle = new PuzzleManager(ui, root);
  ui.showVersion(BUILD_VERSION);

  state = new GameState(CASE_ID);

  // file:// 환경(더블클릭 실행)에서도 되도록 fetch 대신
  // scene-data.js에서 미리 로드된 전역 객체를 사용
  sceneData = window.CASE_DATA;
  if (!sceneData) {
    console.error('[main] CASE_DATA가 로드되지 않았습니다. index.html에 scene-data.js 스크립트가 포함되어 있는지 확인하세요.');
    return;
  }
  Object.values(sceneData.scenes).forEach((scene) => {
    (scene.hotspots || []).forEach((spot) => { hotspotRegistry[spot.id] = spot; });
  });

  document.title = `Story Archive — ${CASE_LABEL}`;
  const topBarTitle = document.querySelector('.top-bar__title');
  if (topBarTitle) topBarTitle.textContent = `STORY ARCHIVE // ${CASE_LABEL}`;

  bindGlobalControls();
  subscribeSiteConfig();
  document.getElementById('btn-sound').textContent = sound.enabled ? '🔊 사운드' : '🔇 사운드';
  document.getElementById('btn-sfx').textContent = sound.sfxEnabled ? '🔔 효과음' : '🔕 효과음';
  document.getElementById(sound.bgmMode === 'theme' ? 'bgm-mode-theme' : 'bgm-mode-scene').checked = true;

  // H: URL 파라미터를 직접 조작해 들어오는 등 이 기기에 로컬 세이브가 없거나 오래된 경우에도
  // 로그인된 계정의 엔딩 수집 기록만큼은 항상 먼저 확보해둔다 (아래 분기 전부에 안전망으로 적용됨)
  await loadCloudEndingSafety();

  const params = new URLSearchParams(window.location.search);
  if (params.get('continue') === '1' && state.hasSave('auto')) {
    // 타이틀 화면에서 "이어서 열람"을 이미 선택한 경우 — 다시 묻지 않고 바로 이어감
    resumeSavedGame();
  } else if (params.get('new') === '1') {
    // 타이틀 화면에서 "새 기록 열람"을 이미 선택한 경우 (기존 세이브는 타이틀에서 이미 정리됨)
    startNewGame();
  } else if (state.hasSave('auto')) {
    // game.html에 직접 들어온 경우에만 다시 물어봄
    showContinancePrompt();
  } else {
    startNewGame();
  }
}

// H: 로그인된 사용자가 있다면 클라우드에 저장된 ending_* 플래그/endingRecords를 미리 읽어와
// 전역에 보관해둔다. startNewGame()/resumeSavedGame() 양쪽 모두 이 값을 항상 병합하므로,
// URL 파라미터가 어떤 조합으로 들어오든(정상/비정상 모두) 엔딩 수집 기록은 유실되지 않는다.
let pendingCloudEndingFlags = null;
let pendingCloudEndingRecords = null;

// ending_* 엔딩 기록뿐 아니라 seenTutorial(조작법 안내를 이미 봤는지)도 계정 단위로
// 계속 남아있어야 하는 값이라 같은 "새 회차를 시작해도 유실되면 안 되는 플래그" 취급으로 묶음
function pickEndingFlags(flags) {
  const out = {};
  Object.keys(flags || {}).forEach((k) => {
    if (k.startsWith('ending_') || k === 'seenTutorial') out[k] = flags[k];
  });
  return out;
}

async function loadCloudEndingSafety() {
  const userId = window.CloudAuth && window.CloudAuth.getCurrentUser();
  if (!userId || !window.CloudAuth.isCloudAvailable()) return;
  try {
    const res = await window.CloudAuth.getUserSaveData(userId, CASE_ID);
    if (res.ok && res.saveData) {
      pendingCloudEndingFlags = pickEndingFlags(res.saveData.flags);
      pendingCloudEndingRecords = res.saveData.endingRecords || null;
    }
  } catch (e) {
    console.warn('[main] 클라우드 엔딩 기록 확인 실패(로컬 상태로 계속 진행):', e);
  }
}

function showContinancePrompt() {
  const wrap = document.getElementById('continue-prompt');
  wrap.classList.add('is-visible');
  document.getElementById('btn-continue').onclick = () => {
    wrap.classList.remove('is-visible');
    resumeSavedGame();
  };
  document.getElementById('btn-new-game').onclick = () => {
    wrap.classList.remove('is-visible');
    state.deleteSave('auto');
    startNewGame();
  };
}

// 저장된 씬으로 복귀시킨다. 단, 그 씬이 이미 도달했던 엔딩이면
// (사건이 끝난 상태이므로) 엔딩 화면을 다시 띄우는 대신 새 회차를 시작한다.
function resumeSavedGame() {
  state.load('auto');
  // H: 로컬 세이브를 불러온 뒤에도 클라우드 쪽 엔딩 기록이 더 최신/많을 수 있으니 병합
  if (pendingCloudEndingFlags) state.flags = { ...state.flags, ...pendingCloudEndingFlags };
  if (pendingCloudEndingRecords) state.endingRecords = { ...state.endingRecords, ...pendingCloudEndingRecords };

  const savedScene = sceneData.scenes[state.currentSceneId];
  if (savedScene && savedScene.ending) {
    startNewGame();
  } else {
    resetHistory();
    enterScene(state.currentSceneId, true);
  }
}

// 완전 초기화(state.reset)는 하되, 지금까지 모은 엔딩 달성 기록(ending_*)과 엔딩별 스냅샷
// (endingRecords)은 로컬+클라우드 양쪽에서 항상 보존해서 새로 시작한다 — "게임 입장"으로
// 재진입하거나 URL 파라미터를 직접 조작해 들어오는 등 어떤 경로로 여기 도달했든,
// 로드맵/달성도/지금까지의 기록이 유실되지 않도록 하는 유일한 "새 회차 시작" 진입점.
function startNewGame() {
  const preservedEndingFlags = { ...pickEndingFlags(state.flags), ...(pendingCloudEndingFlags || {}) };
  const preservedEndingRecords = { ...(state.endingRecords || {}), ...(pendingCloudEndingRecords || {}) };
  state.reset();
  state.flags = preservedEndingFlags;
  state.endingRecords = preservedEndingRecords;
  resetHistory();
  if (!state.playerGender) {
    showGenderSelect();
  } else {
    enterScene(sceneData.start);
  }
}

// 게임 최초 진입 시 1회 자동으로 뜨고, 이후엔 상단바 "?" 버튼으로 언제든 다시 볼 수 있는
// 조작법 안내. "확인"을 눌러야 닫히며, 첫 진입 흐름에서는 이 Promise가 끝나야 다음으로 진행됨.
function showTutorial() {
  return new Promise((resolve) => {
    const overlay = document.getElementById('tutorial-overlay');
    overlay.classList.add('is-visible');
    const btn = document.getElementById('btn-tutorial-confirm');
    const handler = () => {
      overlay.classList.remove('is-visible');
      btn.removeEventListener('click', handler);
      resolve();
    };
    btn.addEventListener('click', handler);
  });
}

function showGenderSelect() {
  const firstScene = sceneData.scenes[sceneData.start];
  ui.setBackground(CASE_BASE + firstScene.background);
  ui.clearCharacters();
  ui.els.speakerName.textContent = 'SYSTEM';
  ui.els.dialogueText.textContent = '조사관의 모습을 선택하세요.';
  ui.renderChoices(
    [
      { text: '남성 조사관', gender: 'male' },
      { text: '여성 조사관', gender: 'female' },
    ],
    async (choice) => {
      state.playerGender = choice.gender;
      persist();
      if (!state.hasFlag('seenTutorial')) {
        await showTutorial();
        state.setFlag('seenTutorial', true);
        persist();
      }
      enterScene(sceneData.start);
    }
  );
}

function bindGlobalControls() {
  document.getElementById('dialogue-box').addEventListener('click', onAdvance);
  // 시스템 메시지 오버레이가 대사창을 완전히 덮으므로, 클릭으로 진행하려면 여기도 같은 핸들러가 필요
  document.getElementById('system-message-overlay').addEventListener('click', onAdvance);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') onAdvance();
    if (e.code === 'ArrowLeft') goBack();
    if (e.key === 'Escape') ui.toggleLog(true);
  });

  // 대사창에 붙어있는 "이전" 버튼 — 클릭이 dialogue-box까지 버블링되면 되감기와 동시에
  // onAdvance()도 같이 발동해버리므로 stopPropagation으로 막는다
  document.getElementById('btn-back').addEventListener('click', (e) => {
    e.stopPropagation();
    goBack();
  });

  document.getElementById('btn-log').addEventListener('click', () => ui.toggleLog(true));
  document.getElementById('btn-log-close').addEventListener('click', () => ui.toggleLog(false));

  document.getElementById('btn-sound-settings').addEventListener('click', () => {
    document.getElementById('sound-panel').classList.add('is-visible');
  });
  document.getElementById('btn-sound-panel-close').addEventListener('click', () => {
    document.getElementById('sound-panel').classList.remove('is-visible');
  });

  document.getElementById('btn-sound').addEventListener('click', (e) => {
    const on = sound.toggle();
    e.target.textContent = on ? '🔊 사운드' : '🔇 사운드';
  });

  document.getElementById('btn-sfx').addEventListener('click', (e) => {
    const on = sound.toggleSfx();
    e.target.textContent = on ? '🔔 효과음' : '🔕 효과음';
  });

  document.querySelectorAll('input[name="bgm-mode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      sound.setBgmMode(e.target.value);
      const scene = sceneData.scenes[state.currentSceneId];
      sound.playBgm(scene && scene.bgm ? CASE_BASE + scene.bgm : null);
    });
  });

  document.getElementById('btn-auto').addEventListener('click', (e) => {
    ui.autoMode = ui.autoMode === true ? false : true;
    e.target.classList.toggle('is-active', ui.autoMode === true);
    // 오토를 켠 순간 이미 클릭 대기 중인 줄이 있다면 바로 이어서 진행시킴
    if (ui.autoMode === true && pendingAdvance) {
      const fn = pendingAdvance;
      pendingAdvance = null;
      fn();
    }
  });

  document.getElementById('btn-skip').addEventListener('click', (e) => {
    ui.skipMode = !ui.skipMode;
    e.target.classList.toggle('is-active', ui.skipMode);
    if (ui.skipMode === true && pendingAdvance) {
      const fn = pendingAdvance;
      pendingAdvance = null;
      fn();
    }
  });

  document.getElementById('btn-journal').addEventListener('click', () => renderJournal());
  document.getElementById('btn-journal-close').addEventListener('click', () => {
    document.getElementById('journal-overlay').classList.remove('is-visible');
  });

  document.getElementById('btn-notes').addEventListener('click', () => renderInvestigationNotes());
  document.getElementById('btn-notes-close').addEventListener('click', () => {
    document.getElementById('notes-overlay').classList.remove('is-visible');
  });

  // G: 게임 진행 중 타이틀로 돌아가기 (persist()가 매 라인마다 이미 자동 저장하므로 데이터 손실 없음)
  document.getElementById('btn-title').addEventListener('click', () => {
    document.getElementById('title-confirm-overlay').classList.add('is-visible');
  });
  document.getElementById('btn-title-confirm-no').addEventListener('click', () => {
    document.getElementById('title-confirm-overlay').classList.remove('is-visible');
  });
  document.getElementById('btn-title-confirm-yes').addEventListener('click', () => {
    persist();
    window.location.href = 'index.html';
  });

  // 조작법 안내를 언제든 다시 볼 수 있는 안전장치 — 이미 seenTutorial이어도 그냥 다시 띄우기만 함
  document.getElementById('btn-help').addEventListener('click', () => {
    showTutorial();
  });

  document.getElementById('btn-ending-title').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.getElementById('btn-ending-restart').addEventListener('click', async () => {
    state.deleteSave('auto');
    const userId = window.CloudAuth && window.CloudAuth.getCurrentUser();
    if (userId) {
      await window.CloudAuth.resetSaveData(userId, CASE_ID);
    }
    document.getElementById('ending-screen').classList.remove('is-visible');
    document.getElementById('game-root').classList.remove('fear-overlay');
    startNewGame();
  });

  document.getElementById('btn-roadmap-toggle').addEventListener('click', (e) => {
    const isVisible = document.getElementById('roadmap-panel').classList.toggle('is-visible');
    e.target.textContent = isVisible ? '전체 파일 목록 확인 ▴' : '전체 파일 목록 확인 ▾';
  });

  // 로드맵 카드 클릭 — is-locked/is-open은 siteConfig 실시간 구독(subscribeSiteConfig)이
  // 계속 갱신하므로, 클릭 시점의 현재 클래스를 그때그때 확인한다(바인딩 시점 고정 아님).
  // 열려있으면 그 케이스로 바로 진입(지금 열람 중인 케이스를 다시 누르면 game.html이
  // 세이브 유무를 자체 판단해 이어하기를 물어봄), 잠겨있으면 접근 거부 문구만 띄운다.
  document.querySelectorAll('.roadmap-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('is-locked')) {
        document.getElementById('roadmap-flavor').textContent = '[ACCESS DENIED]';
        return;
      }
      const targetCase = item.dataset.case;
      if (!targetCase) return;
      window.location.href = `game.html?case=${targetCase}`;
    });
  });

  document.getElementById('btn-ending-continue-case002').addEventListener('click', () => {
    window.location.href = 'game.html?case=case002';
  });
}

// ---- siteConfig 실시간 구독 — case002Released가 켜지기 전까지는 002를 항상 잠긴 것으로
// 취급(안전한 기본값). visitor-counter.js의 showVisitorCount/isPublic 패턴과 동일하게
// onSnapshot으로 새로고침 없이 즉시 반영한다. manage-9k2x71.html에서 이 값을 토글함.
let case002Released = false;

function setRoadmapCaseOpen(caseId, isOpen) {
  const item = document.querySelector(`.roadmap-item[data-case="${caseId}"]`);
  if (!item) return;
  item.classList.toggle('is-open', isOpen);
  item.classList.toggle('is-locked', !isOpen);
  const statusEl = item.querySelector('.roadmap-case-status');
  if (statusEl) statusEl.textContent = isOpen ? '[OPEN]' : '[LOCKED]';
}

// CASE-001의 엔딩에서만 노출되는 버튼이므로, case002Released 값과 무관하게 다른
// 케이스를 플레이 중일 땐(CASE_ID !== 'case001') 항상 숨겨둔다.
function updateCase002ContinueButton() {
  const btn = document.getElementById('btn-ending-continue-case002');
  if (!btn) return;
  btn.classList.toggle('is-hidden', !(CASE_ID === 'case001' && case002Released));
}

function subscribeSiteConfig() {
  if (!window.db) return;
  window.db.collection('siteConfig').doc('main').onSnapshot((doc) => {
    case002Released = !!doc.exists && doc.data().case002Released === true;
    setRoadmapCaseOpen('case002', case002Released);
    updateCase002ContinueButton();
  }, () => {});
}

function renderJournal() {
  const grid = document.getElementById('journal-items');
  grid.innerHTML = '';

  if (state.items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'journal-empty';
    empty.textContent = '아직 확보한 증거가 없습니다.';
    grid.appendChild(empty);
  } else {
    state.items.forEach((itemId) => {
      const meta = sceneData.items && sceneData.items[itemId];
      if (!meta) return;
      const card = document.createElement('div');
      card.className = 'journal-item-card';
      const img = document.createElement('div');
      img.className = 'journal-item-img';
      img.style.backgroundImage = `url("${CASE_BASE + meta.image}")`;
      const label = document.createElement('p');
      label.className = 'journal-item-label';
      label.textContent = meta.label;
      card.appendChild(img);
      card.appendChild(label);
      grid.appendChild(card);
    });
  }

  const noteEl = document.getElementById('journal-hidden-note');
  const unlock = sceneData.journalUnlock;
  if (unlock && state.getStat('knowledge') >= unlock.knowledgeThreshold) {
    noteEl.classList.remove('is-locked');
    noteEl.textContent = unlock.note;
  } else {
    noteEl.classList.add('is-locked');
    noteEl.textContent = '[???] — 아직 실마리가 부족하다.';
  }

  document.getElementById('journal-overlay').classList.add('is-visible');
}

function enterScene(sceneId, resuming = false) {
  const scene = sceneData.scenes[sceneId];
  if (!scene) {
    console.error('[main] 존재하지 않는 씬:', sceneId);
    return;
  }
  state.currentSceneId = sceneId;
  currentLineIndex = resuming ? currentLineIndexFromLog() : 0;

  currentScene = scene;
  lastRenderedSceneId = sceneId; // 정방향 진행이 실제로 이 씬의 배경/캐릭터를 렌더링함

  ui.setBackground(CASE_BASE + scene.background);
  ui.clearCharacters();
  ui.hideSystemMessage();
  sound.playBgm(scene.bgm ? CASE_BASE + scene.bgm : null);
  // 3-2: 장소 이동 시 발소리 — 최초 진입(프롤로그)이나 세이브 이어하기 시에는 재생하지 않음
  if (!resuming && sceneId !== sceneData.start) {
    sound.playSfx(CASE_BASE + 'assets/sfx/footstep.mp3');
  }
  ui.renderHotspots(scene.hotspots, onExamineHotspot);
  updateFearOverlay(); // 세이브 이어하기 등으로 fear가 이미 임계치를 넘은 상태로 진입할 수도 있으므로 씬 진입 시에도 재확인

  if (scene.ending) {
    ui.clearHotspots();
    renderEnding(scene);
    return;
  }

  playLines(scene, 0);
}

// P&C 탐색 핫스팟 클릭 — 대사 진행과 무관하게 즉시 클로즈업을 보여줌 (필수 진행 요소 아님)
// discoveryText/onDiscoverSetStat: 1-4 — P&C를 순수 감상용이 아니라 실제 단서/보상 수단으로 만듦
function onExamineHotspot(spot) {
  const alreadyExamined = state.hasFlag(`examined_${spot.id}`);
  ui.showCloseup(CASE_BASE + spot.closeup, spot.label || '', spot.discoveryText || '');
  if (!alreadyExamined) {
    state.setFlag(`examined_${spot.id}`, true);
    if (spot.onDiscoverSetStat) {
      Object.entries(spot.onDiscoverSetStat).forEach(([k, v]) => state.addStat(k, v));
    }
    state.recordNoteDiscovery(spot.id);
    ui.showNoteToast(spot.label || '새로운 단서');
    persist();
  }
}

// ---- 수사노트 (1-3): 지금까지 모은 아이템 + P&C 발견물을 한 곳에서 보여주고,
// 스토리 진행에 따라 갱신되는 "조사관의 메모"를 함께 보여준다. 엔딩 이후에만 열리는
// 기존 "기록보관소"(journal)와 달리 플레이 도중 언제든 열 수 있다.
// 발견 당시 메모를 지우고 새 메모로 "교체"하면 뭐가 왜 바뀌었는지 알아보기 힘들다는 피드백 —
// 대신 처음 발견했을 때 메모는 그대로 남기고, 조건을 만족한 갱신 내용을 아래에 이어붙여서
// "점점 채워지는" 형태로 보여준다. updates가 없는 단순 메모는 기존처럼 한 줄만 표시.
function getNoteText(id, fallback) {
  const def = sceneData.notes && sceneData.notes[id];
  if (!def) return fallback;
  const updates = def.updates || [];
  if (updates.length === 0) return def.baseNote;
  const parts = [`[처음 발견했을 때]\n${def.baseNote}`];
  updates.forEach((u) => {
    if (state.evaluateCondition(u.condition)) parts.push(`[${u.label || '그 이후'}]\n${u.text}`);
  });
  return parts.join('\n\n');
}

// D: 카드 하나(아이템 또는 P&C 발견물)를 id로 만들어주는 헬퍼 — noteOrder 정렬에 사용
function buildNoteEntry(id) {
  const itemMeta = sceneData.items[id];
  if (itemMeta) {
    return { id, image: itemMeta.image, label: itemMeta.label, note: getNoteText(id, itemMeta.label) };
  }
  const hotspot = hotspotRegistry[id];
  if (hotspot && state.hasFlag(`examined_${id}`)) {
    return {
      id,
      image: hotspot.closeup,
      label: hotspot.label,
      note: getNoteText(id, hotspot.discoveryText || hotspot.label),
    };
  }
  return null;
}

// D: 정렬 기준은 state.noteOrder(실제 발견 순서). 이 필드가 없던 구버전 세이브 데이터를 위해,
// noteOrder에 없지만 실제로는 보유 중인 아이템/발견물은 뒤쪽에 이어붙여 누락 없이 보여준다.
function collectNoteEntries() {
  const entries = [];
  const seen = new Set();
  state.noteOrder.forEach((id) => {
    const entry = buildNoteEntry(id);
    if (entry) { entries.push(entry); seen.add(id); }
  });
  state.items.forEach((itemId) => {
    if (seen.has(itemId)) return;
    const entry = buildNoteEntry(itemId);
    if (entry) { entries.push(entry); seen.add(itemId); }
  });
  Object.keys(state.flags)
    .filter((f) => f.startsWith('examined_') && state.flags[f])
    .forEach((flagKey) => {
      const hotspotId = flagKey.slice('examined_'.length);
      if (seen.has(hotspotId)) return;
      const entry = buildNoteEntry(hotspotId);
      if (entry) { entries.push(entry); seen.add(hotspotId); }
    });
  return entries;
}

// B: 수사노트 업데이트 알림 배지 — 마지막으로 노트를 열었을 때와 비교해 새로 바뀐/추가된
// 메모가 있으면 상단바 버튼에 펄싱 점을 띄운다. persist()가 거의 모든 상태 변화 지점에서
// 호출되므로, 특정 조건마다 배지 로직을 따로 심을 필요 없이 여기 한 곳에서 항상 재계산한다.
function checkNoteUpdates() {
  const entries = collectNoteEntries();
  const hasUnseen = entries.some((e) => state.seenNoteStates[e.id] !== e.note);
  document.getElementById('btn-notes').classList.toggle('has-badge', hasUnseen);
}

function renderInvestigationNotes() {
  const grid = document.getElementById('notes-grid');
  const detailImg = document.getElementById('notes-detail-img');
  const detailLabel = document.getElementById('notes-detail-label');
  const detailText = document.getElementById('notes-detail-text');
  grid.innerHTML = '';
  detailImg.style.backgroundImage = '';
  detailLabel.textContent = '';
  detailText.textContent = '카드를 선택하면 조사관의 메모를 볼 수 있습니다.';

  const entries = collectNoteEntries();
  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'journal-empty';
    empty.textContent = '아직 기록할 단서가 없습니다.';
    grid.appendChild(empty);
  } else {
    entries.forEach((entry, i) => {
      const card = document.createElement('div');
      card.className = 'journal-item-card notes-item-card';
      // K: 처음 발견했을 때 이후로 갱신 문단이 새로 붙은 카드에만 표시 — 이미 본 적 있는 항목의
      // 메모 내용이 지난번 열람 시점과 달라졌을 때만이며, 신규 발견 자체는 습득 시 토스트로 이미
      // 알렸으므로 여기 배지 대상에서 제외한다(seenNoteStates[id]가 undefined면 신규 발견).
      const isUpdated = state.seenNoteStates[entry.id] !== undefined && state.seenNoteStates[entry.id] !== entry.note;
      if (isUpdated) card.classList.add('has-update');
      const img = document.createElement('div');
      img.className = 'journal-item-img';
      img.style.backgroundImage = `url("${CASE_BASE + entry.image}")`;
      const label = document.createElement('p');
      label.className = 'journal-item-label';
      label.textContent = entry.label;
      card.appendChild(img);
      card.appendChild(label);
      card.addEventListener('click', () => {
        grid.querySelectorAll('.notes-item-card').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        detailImg.style.backgroundImage = `url("${CASE_BASE + entry.image}")`;
        detailLabel.textContent = entry.label;
        detailText.textContent = entry.note;
      });
      grid.appendChild(card);
      if (i === 0) card.click();
    });
  }

  // B: 노트를 실제로 열어봤으니 지금 시점의 메모 내용을 "확인함"으로 기록 — 배지 해제
  entries.forEach((e) => { state.seenNoteStates[e.id] = e.note; });
  document.getElementById('btn-notes').classList.remove('has-badge');
  persist();

  document.getElementById('notes-overlay').classList.add('is-visible');
}

function currentLineIndexFromLog() {
  // Phase 1: 씬 재진입 시 처음부터 — 정교한 라인 단위 이어하기는 Phase 2에서 보강
  return 0;
}

// choice.condition은 단일 조건 객체 또는 조건 배열(AND)을 지원
function isChoiceAvailable(choice) {
  if (!choice.condition) return true;
  const conditions = Array.isArray(choice.condition) ? choice.condition : [choice.condition];
  return conditions.every((c) => state.evaluateCondition(c));
}

// scene.next는 문자열(기존) 또는 조건부 분기 배열을 지원 —
// [{ condition: {...}, goto: "..." }, { goto: "..." }] 형태로, 위에서부터 순서대로 조건을
// 만족하는 첫 항목의 goto로 이동. condition이 없는 항목은 항상 통과(기본값/최종 폴백).
// 플레이어 클릭(choices)이 아니라 스탯 값만으로 자동 분기해야 하는 지점(002 4장)에 사용.
function resolveSceneNext(next) {
  if (!Array.isArray(next)) return next;
  const branch = next.find((b) => !b.condition || state.evaluateCondition(b.condition));
  return branch ? branch.goto : null;
}

async function playLines(scene, index) {
  if (index >= scene.lines.length) {
    if (scene.choices && scene.choices.length) {
      const visibleChoices = scene.choices.filter(isChoiceAvailable);
      ui.renderChoices(visibleChoices, (choice) => handleChoice(choice));
    } else if (scene.next) {
      const nextId = resolveSceneNext(scene.next);
      if (nextId) enterScene(nextId);
    }
    return;
  }

  const line = scene.lines[index];

  if (line.setFlag) Object.entries(line.setFlag).forEach(([k, v]) => state.setFlag(k, v));
  if (line.setStat) Object.entries(line.setStat).forEach(([k, v]) => state.addStat(k, v));
  const isNewItemThisLine = line.addItem && !state.hasItem(line.addItem);
  if (line.addItem) {
    state.addItem(line.addItem);
    // D: itemImage가 없는(팝업 없이 조용히 지급되는) addItem도 노트에는 똑같이 올라가야 하므로
    // 발견 순서 기록은 itemImage 유무와 무관하게 여기서 한 번만 처리
    if (isNewItemThisLine) state.recordNoteDiscovery(line.addItem);
  }
  if (line.fx === 'flash') ui.flashScreen();
  if (line.fx === 'shake') ui.shakeScreen();
  if (line.fx === 'bloodbleed') ui.bloodBleed();
  if (line.fx === 'shadowflash') {
    const now = Date.now();
    if (now - lastShadowFlashTime >= SHADOW_FLASH_COOLDOWN_MS) {
      lastShadowFlashTime = now;
      ui.flashShadow(CASE_BASE + 'assets/vfx/shadow-flash.png');
      sound.playImpact();
    }
  }
  if (line.sfx) sound.playSfx(CASE_BASE + `assets/sfx/${line.sfx}.mp3`);

  if (line.condition && !state.evaluateCondition(line.condition)) {
    playLines(scene, index + 1);
    return;
  }

  if (line.character) {
    const pos = line.position === 'right' ? 'right' : 'left';
    const resolvedChar = line.character.replace('{gender}', state.playerGender);
    ui.setCharacter(pos, CASE_BASE + `assets/characters/${resolvedChar}.png`);
  }

  // 화자 기반 자동 sfx — 관리자 대사는 무전 클릭음(또렷하게), 대괄호 태그가 붙은
  // 화자([로그 03]/[개인 로그]/[기록]/[방송] 등 — 녹음·기록 재생을 뜻함)는 테이프
  // 클릭음. 예전엔 'R-07'로 시작하는지만 봐서 001에만 통했는데, 정작 이 규칙의
  // 본질은 이름이 아니라 "이 대사가 녹음 재생이냐"였으므로 대괄호 유무로 일반화함
  // — 앞으로 다른 케이스의 R-03/R-11 등 누구 기록이든 케이스 안 가리고 통함.
  if (line.speaker === '관리자') {
    sound.playSfx(CASE_BASE + 'assets/sfx/radio-click.mp3', 1.0);
  } else if (line.speaker && /\[.+\]/.test(line.speaker)) {
    sound.playSfx(CASE_BASE + 'assets/sfx/tape-click.mp3');
  }

  const resolvedText = resolveText(line.text);
  // speaker가 빈 문자열 — "누가 하는 말"이 아니라 시스템이 보여주는 메시지이므로
  // 하단 대사창 대신 화면 중앙 오버레이에 표시 (기존 노이즈-디코딩 연출은 그대로 유지)
  if (line.speaker === '') {
    await ui.showSystemMessage(resolvedText);
  } else {
    ui.hideSystemMessage();
    if (line.effect === 'decode') {
      await ui.decodeLine(line.speaker, resolvedText);
    } else {
      await ui.typeLine(line.speaker, resolvedText, line.typingProfile);
    }
  }
  if (line.highlight) ui.pulseHighlight();
  ui.appendLog(line.speaker, resolvedText);
  state.pushLog(line.speaker, resolvedText, state.currentSceneId);

  if (line.addItem && line.itemImage) {
    sound.playSfx(CASE_BASE + 'assets/sfx/item-chime.mp3');
    await ui.showItemPopup(CASE_BASE + line.itemImage, line.itemLabel || line.addItem, 'EVIDENCE ACQUIRED');
    if (isNewItemThisLine) ui.showNoteToast(line.itemLabel || line.addItem);
  } else if (line.itemReveal && line.itemImage) {
    // 이미 가진 아이템을 다시 펼쳐보는 연출 — 인벤토리에 새로 추가되지 않음, 반복 재생 가능
    sound.playSfx(CASE_BASE + 'assets/sfx/paper-flip.mp3');
    await ui.showItemPopup(CASE_BASE + line.itemImage, line.itemLabel || '', 'PAGE REVEALED');
  } else if (line.addItem && isNewItemThisLine) {
    // D: 팝업 없이 조용히 지급되는 아이템도 최소한 토스트로는 "수사노트에 추가됐다"는 걸 알려준다
    ui.showNoteToast(line.itemLabel || line.addItem);
  }

  if (line.puzzle) {
    // 증거 보드(connect) 카드 이미지는 scene-data.js에도 다른 에셋들과 같은 규칙으로
    // CASE_BASE 상대경로로 적어두므로, puzzle.js에 넘기기 전에 여기서 절대경로로 보정한다.
    const puzzleDef =
      line.puzzle.type === 'connect'
        ? { ...line.puzzle, items: line.puzzle.items.map((it) => (it.image ? { ...it, image: CASE_BASE + it.image } : it)) }
        : line.puzzle;
    const result = await puzzle.run(puzzleDef);
    if (result.success) {
      if (line.puzzle.onSuccessSetFlag) state.setFlag(line.puzzle.onSuccessSetFlag, true);
      if (line.puzzle.onSuccessSetStat) {
        Object.entries(line.puzzle.onSuccessSetStat).forEach(([k, v]) => state.addStat(k, v));
      }
      // 2-1: QTE 성공 시 긴장이 확 풀리는 느낌을 주기 위해 bgm을 잠깐 죽였다가 복귀시킴
      if (line.puzzle.type === 'qte') sound.duckBgm();
    } else if (!result.skipped) {
      // QTE 등 실패해도 다음으로 진행되는 퍼즐 타입에서 실패 페널티 적용
      if (line.puzzle.onFailSetFlag) state.setFlag(line.puzzle.onFailSetFlag, true);
      if (line.puzzle.onFailSetStat) {
        Object.entries(line.puzzle.onFailSetStat).forEach(([k, v]) => state.addStat(k, v));
      }
      // 2-1: QTE 실패 시 강한 연출 — 완전 암전 + 그림자 섬광 + 사운드 임팩트
      if (line.puzzle.type === 'qte') {
        ui.flashBlackout(300);
        ui.flashShadow(CASE_BASE + 'assets/vfx/shadow-flash.png');
        sound.playImpact();
      }
    }
    // E: 퍼즐/QTE를 실제로 진행했다면(스킵 케이스 제외) SKIP을 강제로 끔 — 켜진 채로 있으면
    // 퍼즐 직후의 중요한 반응 대사까지 다시 빨리감기로 지나가버리므로, 여기서부터는 유저가
    // 다시 눌러야 SKIP이 재개되게 한다.
    if (!result.skipped && ui.skipMode === true) {
      ui.skipMode = false;
      document.getElementById('btn-skip').classList.remove('is-active');
    }
  }

  // 이 라인을 전역 히스토리에 기록 (뒤로가기용, 씬 경계를 넘어서도 유지됨) — 부작용은 이미 위에서 처리 완료된 상태
  history.push({
    sceneId: state.currentSceneId,
    lineIndex: index,
    speaker: line.speaker,
    text: resolvedText,
    character: line.character,
    position: line.position,
    background: scene.background,
    bgm: scene.bgm,
  });
  historyPos = history.length - 1;

  if (ui.skipMode === true) {
    setTimeout(() => advanceLine(), 150);
  } else if (ui.autoMode === true) {
    setTimeout(() => advanceLine(), 900);
  } else {
    pendingAdvance = () => advanceLine();
  }

  updateFearOverlay();
  persist();
  updateProgress();
}

// fear가 일정 수치를 넘으면 그 이후 화면에 미세한 붉은 노이즈를 지속적으로 덧씌움
// fear는 게임 내에서 감소하지 않으므로 매번 재계산해도 한 번 켜지면 계속 켜져 있음
function updateFearOverlay() {
  const threshold = 2;
  document.getElementById('game-root').classList.toggle('fear-overlay', state.getStat('fear') >= threshold);
}

// 다음으로 진행: 이미 봤던 라인이 히스토리에 남아있으면(뒤로 갔다가 다시 앞으로 가는 경우)
// 그걸 먼저 다시 보여주고, 히스토리 끝(frontier)까지 왔으면 그때 진짜 다음 라인을 새로 재생함
function advanceLine() {
  if (historyPos < history.length - 1) {
    historyPos++;
    showHistoryEntry(historyPos);
    return;
  }
  const frontier = history[history.length - 1];
  // 선택지 reaction 한 줄이 frontier면, "다음 줄"이 아니라 "다음 씬 진입"으로 이어져야 함
  if (frontier && frontier.reactionNext) {
    enterScene(frontier.reactionNext);
    return;
  }
  const nextIndex = frontier && frontier.sceneId === state.currentSceneId ? frontier.lineIndex + 1 : 0;
  playLines(currentScene, nextIndex);
}

// 이전 라인으로: 히스토리에 기록된 것만 보여줌 (flag/item/fx 등 재실행 안 함) — 씬 경계를 넘어서도 동작
function goBack() {
  // 다음 줄이 아직 타이핑 중일 때 바로 되감으면, 진행 중이던 typeLine()의 setTimeout 체인이
  // 되감긴 화면 위에 계속 글자를 이어붙이는 레이스가 생긴다. 타이핑 중이면 우선 그 줄을
  // (클릭해서 넘기는 것과 동일하게) 즉시 완성만 시키고, 실제 되감기는 다음 클릭에서 수행한다.
  if (ui.isTyping) {
    ui.requestAdvance();
    return;
  }
  if (historyPos <= 0) return;
  historyPos--;
  showHistoryEntry(historyPos);
}

function showHistoryEntry(pos) {
  const entry = history[pos];
  if (!entry) return;
  const scene = sceneData.scenes[entry.sceneId];

  // 씬이 바뀌는 경계를 넘어갈 때만 배경/캐릭터/핫스팟/bgm을 다시 적용 (같은 씬 안에서는 불필요)
  if (entry.sceneId !== lastRenderedSceneId) {
    ui.setBackground(CASE_BASE + entry.background);
    ui.clearCharacters();
    sound.playBgm(entry.bgm ? CASE_BASE + entry.bgm : null);
    ui.renderHotspots(scene.hotspots, onExamineHotspot);
    lastRenderedSceneId = entry.sceneId;
  }

  if (entry.character) {
    const side = entry.position === 'right' ? 'right' : 'left';
    const resolvedChar = entry.character.replace('{gender}', state.playerGender);
    ui.setCharacter(side, CASE_BASE + `assets/characters/${resolvedChar}.png`);
  }
  // 시스템 메시지를 되감아 다시 볼 때도 중앙 오버레이로 표시
  if (entry.speaker === '') {
    ui.els.systemMessageText.textContent = entry.text;
    ui.els.systemMessageOverlay.classList.add('is-visible');
  } else {
    ui.hideSystemMessage();
    ui.setSpeaker(entry.speaker);
    ui.els.dialogueText.textContent = entry.text;
  }
  ui.isTyping = false;
  pendingAdvance = () => advanceLine();
}

let pendingAdvance = null;

// 로컬 저장 + (로그인 상태면) 클라우드 저장까지 함께 처리
function persist() {
  state.save('auto');
  checkNoteUpdates();
  const userId = window.CloudAuth && window.CloudAuth.getCurrentUser();
  if (userId) {
    const raw = localStorage.getItem(`story-archive:${CASE_ID}:auto`);
    // saveData는 케이스별로 네임스페이스가 나뉜 구조(saveData.case001)라, 여기서 미리 감싸서 보낸다 —
    // 나중에 다른 케이스가 같은 계정을 공유해도 서로의 진행 데이터를 덮어쓰지 않는다.
    if (raw) window.CloudAuth.pushSaveData(userId, { [CASE_ID]: JSON.parse(raw) });
  }
}

function onAdvance() {
  const canAdvance = ui.requestAdvance();
  if (canAdvance && pendingAdvance) {
    const fn = pendingAdvance;
    pendingAdvance = null;
    fn();
  }
}

function handleChoice(choice) {
  if (choice.setFlag) Object.entries(choice.setFlag).forEach(([k, v]) => state.setFlag(k, v));
  if (choice.setStat) Object.entries(choice.setStat).forEach(([k, v]) => state.addStat(k, v));
  if (choice.addItem) {
    const isNewChoiceItem = !state.hasItem(choice.addItem);
    state.addItem(choice.addItem);
    if (isNewChoiceItem) {
      state.recordNoteDiscovery(choice.addItem);
      const meta = sceneData.items[choice.addItem];
      ui.showNoteToast((meta && meta.label) || choice.addItem);
    }
  }
  updateFearOverlay();
  persist();

  if (choice.reaction) {
    playReaction(choice.reaction, choice.next);
  } else {
    enterScene(choice.next);
  }
}

// 선택 직후 조사관의 짧은 반응 한 줄 — 현재 씬(배경/bgm)은 그대로 유지한 채 대사 하나만 재생하고,
// 다음 진행(advanceLine)에서 next 씬으로 넘어간다. flag/setStat은 이미 handleChoice에서 처리된
// 뒤라 이 대사 자체는 상태에 아무 영향을 주지 않고, 히스토리에 기록되어 뒤로가기로도 다시 볼 수 있다.
async function playReaction(text, nextSceneId) {
  const resolvedChar = '{gender}-neutral'.replace('{gender}', state.playerGender);
  ui.setCharacter('left', CASE_BASE + `assets/characters/${resolvedChar}.png`);

  await ui.typeLine('조사관(나)', text);
  ui.appendLog('조사관(나)', text);
  state.pushLog('조사관(나)', text, state.currentSceneId);

  history.push({
    sceneId: state.currentSceneId,
    lineIndex: -1, // 씬의 lines 배열에 속하지 않는 합성 라인이라 사용되지 않음 (reactionNext로 다음 진행 결정)
    speaker: '조사관(나)',
    text,
    character: '{gender}-neutral',
    position: 'left',
    background: currentScene.background,
    bgm: currentScene.bgm,
    reactionNext: nextSceneId,
  });
  historyPos = history.length - 1;

  if (ui.skipMode === true) {
    setTimeout(() => advanceLine(), 150);
  } else if (ui.autoMode === true) {
    setTimeout(() => advanceLine(), 900);
  } else {
    pendingAdvance = () => advanceLine();
  }
}

// 001 전용 폴백 콘텐츠 — 다른 케이스의 scene-data.js가 allEndingIds/endingTeaser/
// completeRecordTeaser를 직접 정의하지 않으면(즉 001이면) 이 값들을 그대로 사용한다.
// 케이스마다 결말 목록과 다음 편 떡밥이 다르므로, 있으면 sceneData 쪽을 우선한다.
const CASE001_ENDING_TEASER =
  '기록을 정리하던 중, 오래된 로그 하나가 자동으로 딸려 올라온다.\n\n발신자 표기: R-03. 기록 일자, R-07보다 한참 이전.\n\n...이 사건은, 아직 끝나지 않았다.';
const CASE001_COMPLETE_RECORD_TEASER =
  '[UNCLOSED FILE — SIGNAL DETECTED]\n\nR-03. 발신 위치, 산속. 좌표는 불명확하지만, 신호는 반복되고 있다.\n기상 기록: 폭우. 그날도, 그 이후로도 계속.\n\n이 사건들, R-07 하나로 끝나지 않는다.\n다음 파일이 곧 열릴 것이다.';
const CASE001_ALL_ENDING_IDS = ['truth', 'admin-hands', 'walked-away', 'accomplice'];

function renderEnding(scene) {
  document.getElementById('ending-screen').classList.add('is-visible');
  document.getElementById('ending-title').textContent = scene.title || '엔딩';
  document.getElementById('ending-body').textContent = (scene.lines || []).map((l) => resolveText(l.text)).join('\n\n');

  // 시리즈 로드맵은 엔딩을 볼 때마다 접힌 상태로 초기화 (매번 처음부터 발견하는 재미를 위해)
  document.getElementById('roadmap-panel').classList.remove('is-visible');
  document.getElementById('btn-roadmap-toggle').textContent = '전체 파일 목록 확인 ▾';
  document.getElementById('roadmap-flavor').textContent = '';

  const allEndingIds = sceneData.allEndingIds || CASE001_ALL_ENDING_IDS;
  const endingTeaser = sceneData.endingTeaser || CASE001_ENDING_TEASER;
  const completeRecordTeaser = sceneData.completeRecordTeaser || CASE001_COMPLETE_RECORD_TEASER;

  state.setFlag(`ending_${scene.endingId}`, true);
  const hasAllEndings = allEndingIds.every((id) => state.flags[`ending_${id}`]);
  document.getElementById('ending-teaser').textContent = hasAllEndings ? completeRecordTeaser : endingTeaser;

  // 해당 엔딩에 도달했을 당시의 아이템/플래그 스냅샷을 따로 보관해둔다.
  // 이후 다른 회차를 진행해 items/flags가 덮어써져도, 타이틀의 "지금까지의 기록"에서
  // 이 엔딩을 다시 골랐을 때는 그때 그 기록 그대로 보여주기 위함.
  state.endingRecords = state.endingRecords || {};
  state.endingRecords[scene.endingId] = {
    items: [...state.items],
    flags: { ...state.flags },
    achievedAt: Date.now(),
  };

  persist();
}

function updateProgress() {
  const total = Object.keys(sceneData.scenes).length;
  const visited = Object.keys(state.flags).filter((f) => f.startsWith('visited_')).length;
  state.progressPercent = Math.min(100, Math.round((visited / total) * 100));
}

// M: 다른 탭으로 전환하면 탭 제목이 순간 바뀌었다가, 돌아오면 원래대로 — "게임이 지켜보고 있다"는 공포감
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? `[${CASE_LABEL}] 어디 보고 계십니까?` : `Story Archive — ${CASE_LABEL}`;
});

window.addEventListener('DOMContentLoaded', boot);
