/**
 * main.js — 게임 실행 초기화
 * Phase 1 목표: 대사 진행 + 선택지 분기 + 변수/플래그 + 세이브/로드 + 스킵/로그가
 * CASE001 짧은 테스트 씬에서 실제로 동작하는지 검증.
 */

const BUILD_VERSION = 'build 2026-08-03-02';
const CASE_ID = 'case001';
const CASE_BASE = `cases/${CASE_ID}/`;

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

function resetHistory() {
  history = [];
  historyPos = -1;
  lastRenderedSceneId = null;
}

async function boot() {
  const root = document.getElementById('game-root');
  ui = new UIManager(root);
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

  bindGlobalControls();
  document.getElementById('btn-sound').textContent = sound.enabled ? '🔊 사운드' : '🔇 사운드';
  document.getElementById('btn-sfx').textContent = sound.sfxEnabled ? '🔔 효과음' : '🔕 효과음';
  document.getElementById(sound.bgmMode === 'theme' ? 'bgm-mode-theme' : 'bgm-mode-scene').checked = true;

  const params = new URLSearchParams(window.location.search);
  if (params.get('continue') === '1' && state.hasSave('auto')) {
    // 타이틀 화면에서 "이어서 열람"을 이미 선택한 경우 — 다시 묻지 않고 바로 이어감
    state.load('auto');
    resetHistory();
    enterScene(state.currentSceneId, true);
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

function showContinancePrompt() {
  const wrap = document.getElementById('continue-prompt');
  wrap.classList.add('is-visible');
  document.getElementById('btn-continue').onclick = () => {
    wrap.classList.remove('is-visible');
    state.load('auto');
    resetHistory();
    enterScene(state.currentSceneId, true);
  };
  document.getElementById('btn-new-game').onclick = () => {
    wrap.classList.remove('is-visible');
    state.deleteSave('auto');
    startNewGame();
  };
}

function startNewGame() {
  state.reset();
  resetHistory();
  if (!state.playerGender) {
    showGenderSelect();
  } else {
    enterScene(sceneData.start);
  }
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
    (choice) => {
      state.playerGender = choice.gender;
      persist();
      enterScene(sceneData.start);
    }
  );
}

function bindGlobalControls() {
  document.getElementById('dialogue-box').addEventListener('click', onAdvance);
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

  document.getElementById('btn-skip').addEventListener('click', () => {
    ui.skipRequested = true;
  });

  document.getElementById('btn-journal').addEventListener('click', () => renderJournal());
  document.getElementById('btn-journal-close').addEventListener('click', () => {
    document.getElementById('journal-overlay').classList.remove('is-visible');
  });

  document.getElementById('btn-ending-title').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.getElementById('btn-ending-restart').addEventListener('click', async () => {
    state.deleteSave('auto');
    const userId = window.CloudAuth && window.CloudAuth.getCurrentUser();
    if (userId) {
      await window.CloudAuth.resetSaveData(userId);
    }
    document.getElementById('ending-screen').classList.remove('is-visible');
    document.getElementById('game-root').classList.remove('fear-overlay');
    startNewGame();
  });

  document.getElementById('btn-roadmap-toggle').addEventListener('click', (e) => {
    const isVisible = document.getElementById('roadmap-panel').classList.toggle('is-visible');
    e.target.textContent = isVisible ? '전체 파일 목록 확인 ▴' : '전체 파일 목록 확인 ▾';
  });

  document.querySelectorAll('.roadmap-item.is-locked').forEach((item) => {
    item.addEventListener('click', () => {
      document.getElementById('roadmap-flavor').textContent = '[ACCESS DENIED]';
    });
  });
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
  sound.playBgm(scene.bgm ? CASE_BASE + scene.bgm : null);
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
function onExamineHotspot(spot) {
  ui.showCloseup(CASE_BASE + spot.closeup, spot.label || '');
  state.setFlag(`examined_${spot.id}`, true);
  persist();
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

async function playLines(scene, index) {
  if (index >= scene.lines.length) {
    if (scene.choices && scene.choices.length) {
      const visibleChoices = scene.choices.filter(isChoiceAvailable);
      ui.renderChoices(visibleChoices, (choice) => handleChoice(choice));
    } else if (scene.next) {
      enterScene(scene.next);
    }
    return;
  }

  const line = scene.lines[index];

  if (line.setFlag) Object.entries(line.setFlag).forEach(([k, v]) => state.setFlag(k, v));
  if (line.setStat) Object.entries(line.setStat).forEach(([k, v]) => state.addStat(k, v));
  if (line.addItem) state.addItem(line.addItem);
  if (line.fx === 'flash') ui.flashScreen();
  if (line.fx === 'shake') ui.shakeScreen();
  if (line.fx === 'bloodbleed') ui.bloodBleed();

  if (line.condition && !state.evaluateCondition(line.condition)) {
    playLines(scene, index + 1);
    return;
  }

  if (line.character) {
    const pos = line.position === 'right' ? 'right' : 'left';
    const resolvedChar = line.character.replace('{gender}', state.playerGender);
    ui.setCharacter(pos, CASE_BASE + `assets/characters/${resolvedChar}.png`);
  }

  // 화자 기반 자동 sfx: 관리자 대사는 무전 클릭음, R-07 로그 재생은 테이프 클릭음
  if (line.speaker === '관리자') {
    sound.playSfx(CASE_BASE + 'assets/sfx/radio-click.mp3');
  } else if (line.speaker && line.speaker.startsWith('R-07')) {
    sound.playSfx(CASE_BASE + 'assets/sfx/tape-click.mp3');
  }

  if (line.effect === 'decode') {
    await ui.decodeLine(line.speaker, line.text);
  } else {
    await ui.typeLine(line.speaker, line.text);
  }
  ui.appendLog(line.speaker, line.text);
  state.pushLog(line.speaker, line.text, state.currentSceneId);

  if (line.addItem && line.itemImage) {
    await ui.showItemPopup(CASE_BASE + line.itemImage, line.itemLabel || line.addItem, 'EVIDENCE ACQUIRED');
  } else if (line.itemReveal && line.itemImage) {
    // 이미 가진 아이템을 다시 펼쳐보는 연출 — 인벤토리에 새로 추가되지 않음, 반복 재생 가능
    await ui.showItemPopup(CASE_BASE + line.itemImage, line.itemLabel || '', 'PAGE REVEALED');
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
    } else if (!result.skipped) {
      // QTE 등 실패해도 다음으로 진행되는 퍼즐 타입에서 실패 페널티 적용
      if (line.puzzle.onFailSetFlag) state.setFlag(line.puzzle.onFailSetFlag, true);
      if (line.puzzle.onFailSetStat) {
        Object.entries(line.puzzle.onFailSetStat).forEach(([k, v]) => state.addStat(k, v));
      }
    }
  }

  // 이 라인을 전역 히스토리에 기록 (뒤로가기용, 씬 경계를 넘어서도 유지됨) — 부작용은 이미 위에서 처리 완료된 상태
  history.push({
    sceneId: state.currentSceneId,
    lineIndex: index,
    speaker: line.speaker,
    text: line.text,
    character: line.character,
    position: line.position,
    background: scene.background,
    bgm: scene.bgm,
  });
  historyPos = history.length - 1;

  if (ui.autoMode === true) {
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
  ui.els.speakerName.textContent = entry.speaker || '';
  ui.els.dialogueText.textContent = entry.text;
  ui.isTyping = false;
  pendingAdvance = () => advanceLine();
}

let pendingAdvance = null;

// 로컬 저장 + (로그인 상태면) 클라우드 저장까지 함께 처리
function persist() {
  state.save('auto');
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
  if (choice.addItem) state.addItem(choice.addItem);
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

  if (ui.autoMode === true) {
    setTimeout(() => advanceLine(), 900);
  } else {
    pendingAdvance = () => advanceLine();
  }
}

// 엔딩과 무관하게 공통으로 붙는 R-03 떡밥 — 어떤 엔딩으로 끝나든 동일하게 노출
const ENDING_TEASER =
  '기록을 정리하던 중, 오래된 로그 하나가 자동으로 딸려 올라온다.\n\n발신자 표기: R-03.\n\n...이 사건은, 아직 끝나지 않았다.';

function renderEnding(scene) {
  document.getElementById('ending-screen').classList.add('is-visible');
  document.getElementById('ending-title').textContent = scene.title || '엔딩';
  document.getElementById('ending-body').textContent = (scene.lines || []).map((l) => l.text).join('\n\n');
  document.getElementById('ending-teaser').textContent = ENDING_TEASER;

  // 시리즈 로드맵은 엔딩을 볼 때마다 접힌 상태로 초기화 (매번 처음부터 발견하는 재미를 위해)
  document.getElementById('roadmap-panel').classList.remove('is-visible');
  document.getElementById('btn-roadmap-toggle').textContent = '전체 파일 목록 확인 ▾';
  document.getElementById('roadmap-flavor').textContent = '';

  state.setFlag(`ending_${scene.endingId}`, true);
  persist();
}

function updateProgress() {
  const total = Object.keys(sceneData.scenes).length;
  const visited = Object.keys(state.flags).filter((f) => f.startsWith('visited_')).length;
  state.progressPercent = Math.min(100, Math.round((visited / total) * 100));
}

window.addEventListener('DOMContentLoaded', boot);
