/**
 * title.js — 타이틀 화면 부팅 연출 + 계정(로그인/회원가입/비번찾기/초기화)
 */

const SAVE_KEY = 'story-archive:case001:auto';
const GAME_URL = 'game.html';

window.titleMusic = new Audio('cases/case001/assets/bgm/title-theme.mp3');
const titleMusic = window.titleMusic;
titleMusic.loop = true;
titleMusic.volume = 0.35;
let musicStarted = false;

function startTitleMusicOnce() {
  if (musicStarted) return;
  musicStarted = true;
  titleMusic.play().catch(() => {
    // 자동재생이 막히면 다음 클릭 때 다시 시도
    musicStarted = false;
  });
}

const bootLines = [
  '[CONNECTING TO ARCHIVE SERVER...]',
  '[ACCESS GRANTED]',
  '[LOADING CASE INDEX...]',
];

// CASE-001에서 실제로 도달 가능한 엔딩들의 endingId 목록 (state의 `ending_${endingId}` 플래그로 기록됨)
// A=truth, B=admin-hands, C=walked-away, D=accomplice
const ENDING_IDS = ['truth', 'admin-hands', 'accomplice', 'walked-away'];

const ENDING_LABELS = {
  'truth': '엔딩 A · 진실을 마주하다',
  'admin-hands': '엔딩 B · 관리자의 새 임무자',
  'walked-away': '엔딩 C · 돌아선 자',
  'accomplice': '엔딩 D · 공범',
};

function countEndings(flags) {
  if (!flags) return 0;
  return ENDING_IDS.filter((id) => flags[`ending_${id}`]).length;
}

// B-2 "완전한 기록" 고정 콘텐츠 — 001 설계의 핵심인 "고정된 사실 + 엔딩마다 갈리는 해석" 구조
const RASHOMON_FACTS = ['R-07은 실존했다', '연구시설은 실존했다', '관리자는 R-07과 관련이 있다'];
const RASHOMON_ENDINGS = [
  { name: '엔딩 A (진실을 마주하다)', text: '진실은 밝혔지만, 순환은 끊기지 않았다' },
  { name: '엔딩 B (관리자의 손 안에서)', text: '신뢰는 잠식이었다' },
  { name: '엔딩 C (돌아선 자)', text: '정체는 끝내 미궁으로 남았다' },
  { name: '엔딩 D (공범)', text: '가장 침착하게 풀어낸 사람이, 가장 깊이 걸려든 셈이었다' },
];
const RASHOMON_TEASER = 'R-03의 마지막 신호는, 아직 어딘가에 남아있을지도 모른다.';

let loggedInUserId = null;
let loggedInHasSave = false;
let loggedInSaveData = null;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function typeLineInto(el, text) {
  return new Promise((resolve) => {
    let i = 0;
    const current = el.textContent ? el.textContent + '\n' : '';
    const step = () => {
      el.textContent = current + text.slice(0, i);
      i++;
      if (i <= text.length) setTimeout(step, 16);
      else resolve();
    };
    step();
  });
}

async function typeBootLog() {
  const el = document.getElementById('boot-log');
  for (const line of bootLines) {
    await typeLineInto(el, line);
    await wait(220);
  }
}

function reveal(el) {
  el.classList.remove('is-hidden');
}
function hide(el) {
  el.classList.add('is-hidden');
}

function setAuthMessage(text, isOk = false) {
  const el = document.getElementById('auth-message');
  el.textContent = text || '';
  el.classList.toggle('is-ok', isOk);
}

function setForgotMessage(text) {
  document.getElementById('forgot-message').textContent = text || '';
}

// ---- 탭 전환 ----
function bindTabs() {
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('is-active');
    tabSignup.classList.remove('is-active');
    reveal(loginForm);
    hide(signupForm);
    setAuthMessage('');
  });
  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('is-active');
    tabLogin.classList.remove('is-active');
    reveal(signupForm);
    hide(loginForm);
    setAuthMessage('');
  });
}

// ---- 로그인 ----
function bindLogin() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('login-id').value.trim();
    const pw = document.getElementById('login-pw').value;
    if (!id || !pw) {
      setAuthMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    setAuthMessage('확인 중...');
    const res = await window.CloudAuth.logIn(id, pw);
    if (!res.ok) {
      setAuthMessage(res.reason);
      return;
    }
    enterWelcome(id, res.saveData);
  });
}

// ---- 회원가입 ----
function bindSignup() {
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('signup-id').value.trim();
    const pw = document.getElementById('signup-pw').value;

    const idErr = window.CloudAuth.validateId(id);
    if (idErr) { setAuthMessage(idErr); return; }
    const pwErr = window.CloudAuth.validatePassword(pw);
    if (pwErr) { setAuthMessage(pwErr); return; }

    setAuthMessage('가입 처리 중...');
    const res = await window.CloudAuth.signUp(id, pw);
    if (!res.ok) {
      setAuthMessage(res.reason);
      return;
    }
    showRecoveryCode(res.recoveryCode, () => enterWelcome(id, null));
  });
}

function showRecoveryCode(code, onAck) {
  document.getElementById('recovery-code-display').textContent = code;
  const overlay = document.getElementById('recovery-overlay');
  overlay.classList.add('is-visible');
  const ackBtn = document.getElementById('btn-recovery-ack');
  const handler = () => {
    overlay.classList.remove('is-visible');
    ackBtn.removeEventListener('click', handler);
    onAck();
  };
  ackBtn.addEventListener('click', handler);
}

// ---- 로그인 성공 후 환영 패널 ----
function enterWelcome(id, saveData) {
  loggedInUserId = id;
  loggedInHasSave = !!saveData;
  loggedInSaveData = saveData || null;
  window.CloudAuth.setCurrentUser(id);

  // 클라우드에 저장된 진행상황을 로컬 세이브 슬롯에 반영 (없으면 로컬 세이브도 비움)
  if (saveData) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } else {
    localStorage.removeItem(SAVE_KEY);
  }

  hide(document.getElementById('auth-panel'));
  reveal(document.getElementById('welcome-panel'));

  const text = document.getElementById('welcome-text');
  text.textContent = saveData
    ? `${id}님, 이어서 진행할 기록이 있습니다.`
    : `${id}님, 새로운 조사를 시작합니다.`;
  document.getElementById('btn-reset-save').classList.toggle('is-hidden', !saveData);

  const endingCount = countEndings(saveData && saveData.flags);
  document.getElementById('ending-progress').textContent =
    `CASE-001 달성도: ${endingCount}/${ENDING_IDS.length} 엔딩 진입`;
  updateRecapButtons(endingCount);

  if (endingCount > 0) {
    typeLineInto(document.getElementById('boot-log'), '[경고: 이전 세션의 잔사 데이터가 감지되었습니다]');
  }
}

// B-1/B-2 버튼 잠금 상태 갱신 — B-1은 엔딩 1개 이상, B-2는 4개 전부 모아야 열림
function updateRecapButtons(endingCount) {
  const btnPersonal = document.getElementById('btn-recap-personal');
  const btnRashomon = document.getElementById('btn-recap-rashomon');
  btnPersonal.disabled = endingCount === 0;
  btnPersonal.textContent = endingCount === 0 ? '지금까지의 기록 (엔딩 필요)' : '지금까지의 기록';
  btnRashomon.disabled = endingCount < ENDING_IDS.length;
  btnRashomon.textContent =
    endingCount < ENDING_IDS.length
      ? `완전한 기록 (${endingCount}/${ENDING_IDS.length} 엔딩 수집)`
      : '완전한 기록';
}

// ---- B-1: "지금까지의 기록" — 대사 원문을 그대로 나열하지 않고, 실제로 겪은 사건을
// 3인칭 요약 서술로 정리해서 보여줌. 판단 기준은 그 엔딩에 도달했을 당시의 items/flags
// 스냅샷(endingRecords)뿐이라 (개별 대사 선택지는 별도 플래그가 없어 정확히 복원할 수 없음)
// 확실히 알 수 있는 사건(아이템 발견, 문을 열었는지, QTE 성패, 최종 엔딩)만 서술한다.
// 엔딩을 여러 개 모았다면 ◀ ▶ 로 각 엔딩의 기록을 넘겨가며 볼 수 있다.
function buildEndingSummaryParagraphs(endingId, record) {
  const items = (record && record.items) || [];
  const flags = (record && record.flags) || {};
  const has = (id) => items.includes(id);
  const paragraphs = [];

  paragraphs.push(
    '1장, 폐병원. 형광등이 위태롭게 깜빡이는 복도에서 당신은 부서진 신분증 조각을 발견했다. ' +
    '사번은 R-07. 관리자는 다정하게 안내했지만, 몇 번이나 말끝을 흐리며 서두르는 기색을 보였다.'
  );

  if (has('torn_photo') || has('alley_key')) {
    paragraphs.push(
      '2장, 골목. 신문 스크랩에 적힌 주소를 따라 병원 밖으로 나선 당신은 얼굴이 뜯겨나간 사진 한 장과, ' +
      '로커 철문 안에 숨겨진 지하 출입 열쇠를 찾아냈다. 단서를 대수롭지 않게 넘기려는 관리자의 태도가, ' +
      '조금씩 마음에 걸리기 시작했다.'
    );
  }

  if (has('voice_recorder')) {
    paragraphs.push(
      '3장, 지하실. 열쇠로 연 문 너머에서 당신은 R-07이 남긴 개인 녹음기를 발견했다. ' +
      '녹음 속엔 경고가 담겨 있었다 — "그 문, 열기 전에 한 번만 더 생각해."'
    );
  }

  if (flags.opened_door === true) {
    paragraphs.push('경고에도 불구하고, 당신은 안쪽 철문을 열기로 했다.');
  } else if (flags.opened_door === false) {
    paragraphs.push('결국 당신은 그 문을 열지 않고 돌아서기로 했다.');
  }

  if (has('research_notebook')) {
    paragraphs.push(
      '4장, 연구시설. 흩어져 있던 증거들을 하나하나 연결한 끝에, 관리자를 향한 의심은 점점 확신으로 바뀌어갔다.'
    );
  }

  if (flags.qte_reflex_success) {
    paragraphs.push('관리자의 정체가 드러나는 결정적 순간, 몸이 먼저 반응했다. 아슬아슬하게 무너지지 않았다.');
  } else if (flags.qte_reflex_fail) {
    paragraphs.push('관리자의 정체가 드러나는 결정적 순간, 손이 늦게 움직였다. 심장이 쿵, 내려앉았다.');
  }

  const endingParagraphs = {
    'truth': '그리고 당신은 끝까지 진실을 세상에 공개하기로 했다. 진실은 밝혀졌지만, 위험은 미처 눈치채지 못한 채였다.',
    'admin-hands': '그리고 당신은 관리자를 믿고 조용히 물러서기로 했다. 신뢰는, 대가를 남겼다.',
    'walked-away': '그리고 당신은 지하실 문 앞에서 돌아서기로 했다. R-07의 정체는 끝내 밝혀지지 않았다.',
    'accomplice':
      '그리고 당신은 서두르지 않고, 모든 것을 침착하게 정리해 기록해두기로 했다. ' +
      '그 기록이 다음 사람을 위한 이정표였다는 사실은, 훨씬 나중에야 알게 되었다.',
  };
  paragraphs.push(endingParagraphs[endingId] || '...이야기는 아직 끝나지 않았다.');

  return paragraphs;
}

// 실제로 달성한 엔딩 id들을 도달한 순서대로(옛날 세이브라 achievedAt이 없으면 ENDING_IDS 순서로) 정렬
function getAchievedEndingIds(saveData) {
  const flags = (saveData && saveData.flags) || {};
  const records = (saveData && saveData.endingRecords) || {};
  return ENDING_IDS.filter((id) => flags[`ending_${id}`]).sort((a, b) => {
    const ta = (records[a] && records[a].achievedAt) || 0;
    const tb = (records[b] && records[b].achievedAt) || 0;
    return ta - tb;
  });
}

let recapEndingIds = [];
let recapIndex = 0;

function renderRecapPersonal() {
  recapEndingIds = getAchievedEndingIds(loggedInSaveData);
  recapIndex = Math.max(0, recapEndingIds.length - 1); // 가장 최근에 도달한 엔딩부터 보여줌
  renderRecapPage();
}

function renderRecapPage() {
  const list = document.getElementById('recap-list');
  const nav = document.getElementById('recap-nav');
  const navLabel = document.getElementById('recap-nav-label');
  const prevBtn = document.getElementById('btn-recap-prev');
  const nextBtn = document.getElementById('btn-recap-next');
  list.innerHTML = '';

  if (recapEndingIds.length === 0) {
    const p = document.createElement('p');
    p.className = 'recap-text';
    p.textContent = '아직 이렇다 할 사건을 겪지 않았다. 아카이브 복도에 발을 들인 지 얼마 되지 않았다.';
    list.appendChild(p);
    hide(nav);
    return;
  }

  const endingId = recapEndingIds[recapIndex];
  const records = (loggedInSaveData && loggedInSaveData.endingRecords) || {};
  // 이 기능이 추가되기 전에 이미 도달했던 엔딩은 별도 스냅샷이 없으므로,
  // 현재 세이브에 남아있는 items/flags로 최대한 대체해서 보여준다.
  const record = records[endingId] || {
    items: (loggedInSaveData && loggedInSaveData.items) || [],
    flags: (loggedInSaveData && loggedInSaveData.flags) || {},
  };
  const paragraphs = buildEndingSummaryParagraphs(endingId, record);

  paragraphs.forEach((text) => {
    const p = document.createElement('p');
    p.className = 'recap-text';
    p.textContent = text;
    list.appendChild(p);
  });

  // 엔딩 이름표는 몇 개를 모았든 항상 표시하고, ◀ ▶ 버튼은 2개 이상일 때만 보여준다.
  reveal(nav);
  const multiple = recapEndingIds.length > 1;
  navLabel.textContent = multiple
    ? `${ENDING_LABELS[endingId] || endingId} (${recapIndex + 1}/${recapEndingIds.length})`
    : `${ENDING_LABELS[endingId] || endingId}`;
  prevBtn.classList.toggle('is-hidden', !multiple);
  nextBtn.classList.toggle('is-hidden', !multiple);
  if (multiple) {
    prevBtn.disabled = recapIndex === 0;
    nextBtn.disabled = recapIndex === recapEndingIds.length - 1;
  }
}

// ---- B-2: "완전한 기록" — 001 설계의 핵심 구조를 정리해서 보여주는 고정 콘텐츠 ----
function renderRashomon() {
  const el = document.getElementById('rashomon-content');
  el.innerHTML = '';

  const factsTitle = document.createElement('p');
  factsTitle.className = 'rashomon-section-title';
  factsTitle.textContent = '[고정된 사실]';
  el.appendChild(factsTitle);

  RASHOMON_FACTS.forEach((fact) => {
    const p = document.createElement('p');
    p.className = 'rashomon-fact';
    p.textContent = `- ${fact}`;
    el.appendChild(p);
  });

  const branchTitle = document.createElement('p');
  branchTitle.className = 'rashomon-section-title';
  branchTitle.textContent = '[하지만 당신이 어떻게 조사했느냐에 따라]';
  el.appendChild(branchTitle);

  RASHOMON_ENDINGS.forEach((ending) => {
    const p = document.createElement('p');
    p.className = 'rashomon-ending-row';
    const name = document.createElement('span');
    name.className = 'rashomon-ending-name';
    name.textContent = ending.name;
    p.appendChild(name);
    p.appendChild(document.createTextNode(` → ${ending.text}`));
    el.appendChild(p);
  });

  const teaser = document.createElement('p');
  teaser.className = 'rashomon-teaser';
  teaser.textContent = RASHOMON_TEASER;
  el.appendChild(teaser);
}

// ---- 링크 공유 ----
let shareToastTimer = null;
function showShareToast(text) {
  const el = document.getElementById('share-toast');
  el.textContent = text;
  el.classList.add('is-visible');
  clearTimeout(shareToastTimer);
  shareToastTimer = setTimeout(() => el.classList.remove('is-visible'), 2000);
}

function bindShareButton() {
  document.getElementById('btn-share').addEventListener('click', async () => {
    const shareData = { title: 'Story Archive', url: window.location.href };

    // navigator.share()는 http/https secure context에서만 정상 동작이 보장됨.
    // file://로 직접 열어서 테스트하는 경우 등 프로토콜이 다르면 아예 시도하지 않음 —
    // 일부 크롬 빌드/임베디드 환경에서 file:// URL을 그대로 네이티브 공유 API에 넘기면
    // 정상적으로 거부되지 않고 렌더러가 RESULT_CODE_KILLED_BAD_MESSAGE로 죽는 크래시가 있음.
    const canUseNativeShare =
      typeof navigator.share === 'function' &&
      window.isSecureContext &&
      /^https?:$/.test(window.location.protocol) &&
      (typeof navigator.canShare !== 'function' || navigator.canShare(shareData));

    if (canUseNativeShare) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // 사용자가 공유 시트를 취소한 경우 등 — 조용히 무시
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      showShareToast('링크가 복사되었습니다');
    } catch (e) {
      showShareToast('복사에 실패했어요. 주소창에서 직접 복사해주세요.');
    }
  });
}

function bindRecapButtons() {
  document.getElementById('btn-recap-personal').addEventListener('click', () => {
    renderRecapPersonal();
    document.getElementById('recap-overlay').classList.add('is-visible');
  });
  document.getElementById('btn-recap-close').addEventListener('click', () => {
    document.getElementById('recap-overlay').classList.remove('is-visible');
  });
  document.getElementById('btn-recap-prev').addEventListener('click', () => {
    if (recapIndex > 0) {
      recapIndex--;
      renderRecapPage();
    }
  });
  document.getElementById('btn-recap-next').addEventListener('click', () => {
    if (recapIndex < recapEndingIds.length - 1) {
      recapIndex++;
      renderRecapPage();
    }
  });
  document.getElementById('btn-recap-rashomon').addEventListener('click', () => {
    renderRashomon();
    document.getElementById('rashomon-overlay').classList.add('is-visible');
  });
  document.getElementById('btn-rashomon-close').addEventListener('click', () => {
    document.getElementById('rashomon-overlay').classList.remove('is-visible');
  });
}

// ---- 게임 입장 / 초기화 / 로그아웃 ----
function bindWelcomePanel() {
  document.getElementById('btn-enter-game').addEventListener('click', () => {
    const param = loggedInHasSave ? 'continue' : 'new';
    window.location.href = `${GAME_URL}?${param}=1`;
  });

  document.getElementById('btn-reset-save').addEventListener('click', () => {
    document.getElementById('reset-confirm-overlay').classList.add('is-visible');
  });

  document.getElementById('btn-confirm-reset').addEventListener('click', async () => {
    document.getElementById('reset-confirm-overlay').classList.remove('is-visible');
    await window.CloudAuth.resetSaveData(loggedInUserId);
    localStorage.removeItem(SAVE_KEY);
    loggedInHasSave = false;
    document.getElementById('welcome-text').textContent = `${loggedInUserId}님, 진행 데이터가 초기화되었습니다.`;
    document.getElementById('btn-reset-save').classList.add('is-hidden');
    document.getElementById('ending-progress').textContent = `CASE-001 달성도: 0/${ENDING_IDS.length} 엔딩 진입`;
    loggedInSaveData = null;
    updateRecapButtons(0);
  });

  document.getElementById('btn-cancel-reset').addEventListener('click', () => {
    document.getElementById('reset-confirm-overlay').classList.remove('is-visible');
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    window.CloudAuth.clearCurrentUser();
    loggedInUserId = null;
    loggedInHasSave = false;
    loggedInSaveData = null;
    hide(document.getElementById('welcome-panel'));
    reveal(document.getElementById('auth-panel'));
    document.getElementById('login-id').value = '';
    document.getElementById('login-pw').value = '';
    setAuthMessage('');
  });
}

// ---- 비밀번호 찾기 ----
function bindForgotPassword() {
  document.getElementById('btn-forgot-pw').addEventListener('click', () => {
    document.getElementById('forgot-id').value = '';
    document.getElementById('forgot-code').value = '';
    document.getElementById('forgot-newpw').value = '';
    setForgotMessage('');
    document.getElementById('forgot-overlay').classList.add('is-visible');
  });

  document.getElementById('btn-forgot-cancel').addEventListener('click', () => {
    document.getElementById('forgot-overlay').classList.remove('is-visible');
  });

  document.getElementById('btn-forgot-submit').addEventListener('click', async () => {
    const id = document.getElementById('forgot-id').value.trim();
    const code = document.getElementById('forgot-code').value.trim();
    const newPw = document.getElementById('forgot-newpw').value;
    if (!id || !code || !newPw) {
      setForgotMessage('모든 항목을 입력해주세요.');
      return;
    }
    setForgotMessage('처리 중...');
    const res = await window.CloudAuth.resetPassword(id, code, newPw);
    if (!res.ok) {
      setForgotMessage(res.reason);
      return;
    }
    setForgotMessage('');
    document.getElementById('forgot-overlay').classList.remove('is-visible');
    setAuthMessage('비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.', true);
  });
}

async function boot() {
  window.addEventListener('pointerdown', startTitleMusicOnce, { once: true });

  await typeBootLog();
  await wait(200);

  reveal(document.getElementById('title-logo'));
  reveal(document.getElementById('title-sub'));
  await wait(300);

  bindTabs();
  bindLogin();
  bindSignup();
  bindWelcomePanel();
  bindForgotPassword();
  bindRecapButtons();
  bindShareButton();

  if (!window.CloudAuth.isCloudAvailable()) {
    reveal(document.getElementById('auth-panel'));
    setAuthMessage('온라인 계정 서버에 연결할 수 없어요. 인터넷 연결을 확인해주세요.');
    return;
  }

  // 이미 로그인된 세션(로컬에 남아있는 아이디)이 있으면 비밀번호를 다시 묻지 않고
  // 바로 welcome-panel로 이어감 — 엔딩 화면에서 "타이틀로 돌아가기"를 눌렀을 때 등
  const rememberedId = window.CloudAuth.getCurrentUser();
  if (rememberedId) {
    const res = await window.CloudAuth.getUserSaveData(rememberedId);
    if (res.ok) {
      enterWelcome(rememberedId, res.saveData);
      return;
    }
    // 계정이 사라졌거나 조회 실패 — 남아있는 세션 정리하고 로그인 화면으로
    window.CloudAuth.clearCurrentUser();
  }

  reveal(document.getElementById('auth-panel'));
}

// M: 다른 탭으로 전환하면 탭 제목이 순간 바뀌었다가, 돌아오면 원래대로 — "게임이 지켜보고 있다"는 공포감
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? '[CASE-001] 어디 보고 계십니까?' : 'Story Archive';
});

window.addEventListener('DOMContentLoaded', boot);
