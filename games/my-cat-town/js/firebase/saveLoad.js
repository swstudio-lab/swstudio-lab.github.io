/**
 * saveLoad.js — 마이 캣 타운 세이브/로드
 *
 * cloud-sync.js(window.CatTownAuth)가 관리하는 catTownUsers/{아이디} 문서의
 * saveData 필드에 게임 상태(js/data/game_data_structure.json 형태)를 저장/불러온다.
 * 로그인 여부 판단은 CatTownAuth.getCurrentUser()(로컬에 남은 현재 로그인 아이디) 기준.
 */

const DEFAULT_DATA_URL = 'js/data/game_data_structure.json';
let cachedDefaultData = null;

// game_data_structure.json 안의 설명용 "_설명" 필드/원소를 걷어내고 실제 기본값만 남긴다.
function stripExplanationFields(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => !(typeof item === 'string' && item.startsWith('_설명')))
      .map(stripExplanationFields);
  }
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === '_설명') continue;
      result[key] = stripExplanationFields(val);
    }
    return result;
  }
  return value;
}

async function loadDefaultGameData() {
  if (!cachedDefaultData) {
    const res = await fetch(DEFAULT_DATA_URL);
    const raw = await res.json();
    cachedDefaultData = stripExplanationFields(raw);
  }
  return JSON.parse(JSON.stringify(cachedDefaultData));
}

// 현재 로그인한 사용자의 uid로 users_.../catTown 저장 데이터를 채워서 저장.
async function saveGameData(data) {
  const id = window.CatTownAuth.getCurrentUser();
  if (!id) {
    console.warn('[saveLoad] 로그인되어 있지 않아 저장할 수 없어요.');
    return { ok: false, reason: 'not-logged-in' };
  }
  data.meta = data.meta || {};
  data.meta.uid = id;
  data.meta.lastSavedAt = new Date().toISOString();
  await window.CatTownAuth.pushSaveData(id, data);
  return { ok: true };
}

// 로그인한 사용자의 저장 데이터를 불러온다. 문서가 있어도 saveData가 비어있으면(첫 플레이)
// 기본값으로 새로 채워서 저장해두고 그 값을 반환한다.
async function loadGameData() {
  const id = window.CatTownAuth.getCurrentUser();
  if (!id) {
    return { ok: false, reason: 'not-logged-in' };
  }

  const res = await window.CatTownAuth.getUserSaveData(id);
  if (res.ok && res.saveData) {
    return { ok: true, data: res.saveData };
  }

  const defaults = await loadDefaultGameData();
  defaults.meta.uid = id;
  defaults.meta.lastSavedAt = new Date().toISOString();
  await window.CatTownAuth.pushSaveData(id, defaults);
  return { ok: true, data: defaults };
}

window.SaveLoad = { saveGameData, loadGameData };
