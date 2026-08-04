/**
 * cloud-sync.js — Story Archive 계정 시스템
 * 기존 사이트의 racingRooms/taskflowTeams와 동일한 패턴:
 * "정확한 문서 ID(=아이디)를 아는 요청만 get/write 가능, list는 금지"
 *
 * Firestore 컬렉션: storyArchiveUsers/{아이디}
 *   passwordHash, recoveryCodeHash, createdAt, saveData
 *
 * saveData는 케이스별로 네임스페이스가 나뉜 구조: saveData: { case001: {...진행상황...} }
 * 한 계정으로 여러 케이스(002, 003...)의 진행 데이터를 함께 보관하기 위함 —
 * 지금은 case001만 있어서 체감되는 변화는 없지만, 나중에 다른 케이스가 추가돼도
 * 이 구조 덕분에 마이그레이션 없이 확장 가능함.
 * pushSaveData/resetSaveData는 항상 set({..}, {merge:true})로 saveData의 다른 케이스
 * 키는 건드리지 않고 해당 케이스 키만 병합·교체함.
 *
 * 개인정보 없음 — 아이디/비번/복구코드 전부 임의 문자열이고 실명·이메일·전화 등은 받지 않음.
 * 비번/복구코드는 원문 저장 안 하고 SHA-256 해시만 저장.
 */

const AUTH_COLLECTION = 'storyArchiveUsers';
const CURRENT_USER_KEY = 'story-archive:current-user';
const ID_RULE = /^[A-Za-z0-9_]{3,12}$/;
const SAVE_CASE_ID = 'case001'; // logIn/resetSaveData가 saveData에서 꺼내고 지울 케이스 키

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
      saveData: {},
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

    return { ok: true, saveData: (data.saveData && data.saveData[SAVE_CASE_ID]) || null };
  } catch (e) {
    console.error('[cloud-sync] 로그인 실패:', e);
    return { ok: false, reason: '로그인 중 오류가 발생했어요. 다시 시도해주세요.' };
  }
}

// 로그인 세션 복원용 — getCurrentUser()로 로컬에 남아있는 아이디를 비밀번호 재입력 없이
// 다시 불러올 때 사용 (기존 "정확한 문서 ID를 아는 요청만 get 가능" 패턴과 동일한 신뢰 수준)
async function getUserSaveData(id) {
  if (!isCloudAvailable()) return { ok: false, reason: 'offline' };
  try {
    const doc = await window.db.collection(AUTH_COLLECTION).doc(id).get();
    if (!doc.exists) return { ok: false, reason: 'not-found' };
    const data = doc.data();
    return { ok: true, saveData: (data.saveData && data.saveData[SAVE_CASE_ID]) || null };
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

// 계정은 유지, 진행 데이터(saveData)만 초기화 — saveData.case001만 지우고 다른 케이스 키는 손대지 않음
async function resetSaveData(id) {
  if (!isCloudAvailable()) return { ok: false, reason: '지금은 온라인 계정 기능을 쓸 수 없어요 (연결 실패).' };
  try {
    await window.db.collection(AUTH_COLLECTION).doc(id).set({ saveData: { [SAVE_CASE_ID]: null } }, { merge: true });
    return { ok: true };
  } catch (e) {
    console.error('[cloud-sync] 초기화 실패:', e);
    return { ok: false, reason: '초기화 중 오류가 발생했어요.' };
  }
}

// 로컬 진행 상황을 클라우드에 반영 — 실패해도 로컬 저장은 이미 끝난 상태라 게임 진행엔 지장 없음
// payload는 호출부(main.js)에서 이미 { case001: {...} } 형태로 케이스 네임스페이스가 씌워진 채로 넘어옴.
// set({..}, {merge:true})라서 saveData의 다른 케이스 키(예: case002)는 건드리지 않고 이 케이스 키만 병합됨.
async function pushSaveData(id, payload) {
  if (!isCloudAvailable() || !id) return;
  try {
    await window.db.collection(AUTH_COLLECTION).doc(id).set({ saveData: payload }, { merge: true });
  } catch (e) {
    console.warn('[cloud-sync] 클라우드 저장 실패(로컬 저장은 유지됨):', e);
  }
}

window.CloudAuth = {
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
