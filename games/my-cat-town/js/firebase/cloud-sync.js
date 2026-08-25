/**
 * cloud-sync.js — 마이 캣 타운 계정 시스템
 *
 * games/story-archive/js/cloud-sync.js와 같은 패턴을 따른다:
 * "정확한 문서 ID(=아이디)를 아는 요청만 get/write 가능, list는 금지".
 * 다만 계정이 서로 섞이지 않도록 컬렉션 이름은 분리한다.
 *
 * Firestore 컬렉션: catTownUsers/{아이디}
 *   passwordHash, recoveryCodeHash, createdAt, saveData
 *
 * story-archive는 케이스별(case001, case002 ...)로 saveData를 네임스페이스
 * 나눠 쓰지만, 마이 캣 타운은 세이브가 하나뿐이라 saveData에 게임 상태
 * 객체(js/data/game_data_structure.json 형태)를 그대로 저장한다.
 *
 * 개인정보 없음 — 아이디/비번/복구코드 전부 임의 문자열이고 실명·이메일·전화 등은
 * 받지 않음. 비번/복구코드는 원문 저장 안 하고 SHA-256 해시만 저장.
 */

const AUTH_COLLECTION = 'catTownUsers';
const CURRENT_USER_KEY = 'my-cat-town:current-user';
const ID_RULE = /^[A-Za-z0-9_]{3,12}$/;

// ---- 유틸 ----
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function genRecoveryCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 헷갈리는 0/O, 1/I 제외
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function validateId(id) {
  if (!ID_RULE.test(id)) return '아이디는 영문/숫자/밑줄 3~12자로 입력해주세요.';
  return null;
}

function validatePassword(pw) {
  if (pw.length < 4 || pw.length > 12) return '비밀번호는 4~12자로 입력해주세요.';
  if (/\s/.test(pw)) return '비밀번호에 공백은 넣을 수 없어요.';
  return null;
}

function isCloudAvailable() {
  return !!window.db;
}

// ---- 현재 로그인 사용자 ----
function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}
function setCurrentUser(id) {
  localStorage.setItem(CURRENT_USER_KEY, id);
}
function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ---- 계정 기능 ----
async function checkIdAvailable(id) {
  if (!isCloudAvailable()) return { ok: false, reason: 'offline' };
  try {
    const doc = await window.db.collection(AUTH_COLLECTION).doc(id).get();
    return { ok: true, available: !doc.exists };
  } catch (e) {
    console.error('[cloud-sync] 아이디 확인 실패:', e);
    return { ok: false, reason: 'error' };
  }
}

async function signUp(id, password) {
  const idErr = validateId(id);
  if (idErr) return { ok: false, reason: idErr };
  const pwErr = validatePassword(password);
  if (pwErr) return { ok: false, reason: pwErr };
  if (!isCloudAvailable()) return { ok: false, reason: '지금은 온라인 계정 기능을 쓸 수 없어요 (연결 실패).' };

  try {
    const ref = window.db.collection(AUTH_COLLECTION).doc(id);
    const existing = await ref.get();
    if (existing.exists) return { ok: false, reason: '이미 사용 중인 아이디예요.' };

    const passwordHash = await sha256(password);
    const recoveryCode = genRecoveryCode();
    const recoveryCodeHash = await sha256(recoveryCode);

    await ref.set({
      passwordHash,
      recoveryCodeHash,
      createdAt: Date.now(),
      saveData: null,
    });

    return { ok: true, recoveryCode };
  } catch (e) {
    console.error('[cloud-sync] 회원가입 실패:', e);
    return { ok: false, reason: '가입 중 오류가 발생했어요. 다시 시도해주세요.' };
  }
}

async function logIn(id, password) {
  if (!isCloudAvailable()) return { ok: false, reason: '지금은 온라인 계정 기능을 쓸 수 없어요 (연결 실패).' };
  try {
    const ref = window.db.collection(AUTH_COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { ok: false, reason: '존재하지 않는 아이디예요.' };

    const data = doc.data();
    const passwordHash = await sha256(password);
    if (passwordHash !== data.passwordHash) return { ok: false, reason: '비밀번호가 일치하지 않아요.' };

    return { ok: true, saveData: data.saveData || null };
  } catch (e) {
    console.error('[cloud-sync] 로그인 실패:', e);
    return { ok: false, reason: '로그인 중 오류가 발생했어요. 다시 시도해주세요.' };
  }
}

// 로그인 세션 복원용 — getCurrentUser()로 로컬에 남아있는 아이디를 비밀번호 재입력 없이
// 다시 불러올 때 사용 (story-archive와 동일한 "정확한 문서 ID를 아는 요청만 get 가능" 신뢰 수준)
async function getUserSaveData(id) {
  if (!isCloudAvailable()) return { ok: false, reason: 'offline' };
  try {
    const doc = await window.db.collection(AUTH_COLLECTION).doc(id).get();
    if (!doc.exists) return { ok: false, reason: 'not-found' };
    const data = doc.data();
    return { ok: true, saveData: data.saveData || null };
  } catch (e) {
    console.error('[cloud-sync] 세션 복원 실패:', e);
    return { ok: false, reason: 'error' };
  }
}

async function resetPassword(id, recoveryCode, newPassword) {
  const pwErr = validatePassword(newPassword);
  if (pwErr) return { ok: false, reason: pwErr };
  if (!isCloudAvailable()) return { ok: false, reason: '지금은 온라인 계정 기능을 쓸 수 없어요 (연결 실패).' };

  try {
    const ref = window.db.collection(AUTH_COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { ok: false, reason: '존재하지 않는 아이디예요.' };

    const data = doc.data();
    const codeHash = await sha256(recoveryCode.toUpperCase());
    if (codeHash !== data.recoveryCodeHash) return { ok: false, reason: '복구 코드가 일치하지 않아요.' };

    const passwordHash = await sha256(newPassword);
    await ref.update({ passwordHash });
    return { ok: true };
  } catch (e) {
    console.error('[cloud-sync] 비번 재설정 실패:', e);
    return { ok: false, reason: '재설정 중 오류가 발생했어요. 다시 시도해주세요.' };
  }
}

// 계정은 유지, 진행 데이터(saveData)만 초기화
async function resetSaveData(id) {
  if (!isCloudAvailable()) return { ok: false, reason: '지금은 온라인 계정 기능을 쓸 수 없어요 (연결 실패).' };
  try {
    await window.db.collection(AUTH_COLLECTION).doc(id).set({ saveData: null }, { merge: true });
    return { ok: true };
  } catch (e) {
    console.error('[cloud-sync] 초기화 실패:', e);
    return { ok: false, reason: '초기화 중 오류가 발생했어요.' };
  }
}

// 현재 진행 상황을 클라우드에 반영 — saveData 필드를 통째로 교체(merge:true라 passwordHash 등
// 계정 필드는 건드리지 않음)
async function pushSaveData(id, payload) {
  if (!isCloudAvailable() || !id) return;
  try {
    await window.db.collection(AUTH_COLLECTION).doc(id).set({ saveData: payload }, { merge: true });
  } catch (e) {
    console.warn('[cloud-sync] 클라우드 저장 실패:', e);
  }
}

window.CatTownAuth = {
  ID_RULE,
  validateId,
  validatePassword,
  checkIdAvailable,
  signUp,
  logIn,
  getUserSaveData,
  resetPassword,
  resetSaveData,
  pushSaveData,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  isCloudAvailable,
};
