/**
 * state.js — GameState & LocalStorage 관리
 * Story Archive 엔진의 상태(변수/아이템/플래그/진행위치)를 관리합니다.
 */

const STORAGE_PREFIX = 'story-archive:';

class GameState {
  constructor(caseId) {
    this.caseId = caseId;
    this.reset();
  }

  reset() {
    this.currentSceneId = 'start';
    this.stats = {
      trust: 0,
      fear: 0,
      knowledge: 0,
      courage: 0,
    };
    this.items = [];
    this.flags = {};
    this.endingRecords = {}; // { [endingId]: { items, flags, achievedAt } } — 엔딩별 도달 당시 스냅샷
    this.seenNoteStates = {}; // B: 수사노트 항목별로 마지막으로 열람했을 때의 메모 텍스트 (업데이트 배지 판단용)
    this.noteOrder = []; // D: 수사노트 항목(아이템+P&C 발견물)이 "실제로 처음 발견된 순서" — 노트 정렬에 사용
    this.log = []; // { speaker, text }
    this.playerGender = null; // 'male' | 'female'
    this.startedAt = Date.now();
    this.progressPercent = 0;
  }

  // ---- 변수 조작 ----
  addStat(key, amount) {
    if (!(key in this.stats)) this.stats[key] = 0;
    this.stats[key] += amount;
  }

  getStat(key) {
    return this.stats[key] || 0;
  }

  setFlag(key, value = true) {
    this.flags[key] = value;
  }

  hasFlag(key) {
    return !!this.flags[key];
  }

  addItem(item) {
    if (!this.items.includes(item)) this.items.push(item);
  }

  hasItem(item) {
    return this.items.includes(item);
  }

  // D: 아이템 획득이든 P&C 발견물이든, 수사노트에 처음 올라가는 시점에 한 번만 호출.
  // 이 배열의 순서 그대로가 노트 카드 정렬 순서가 된다(종류 구분 없이 실제 발견 순서).
  recordNoteDiscovery(id) {
    if (!this.noteOrder.includes(id)) this.noteOrder.push(id);
  }

  pushLog(speaker, text, sceneId) {
    this.log.push({ speaker, text, sceneId });
  }

  // ---- 조건 평가 ----
  // condition 예시: { flag: "found_key" }, { stat: "trust", gte: 3 }, { item: "old_photo" }
  evaluateCondition(condition) {
    if (!condition) return true;
    if (condition.flag !== undefined) {
      const want = condition.value !== undefined ? condition.value : true;
      return this.flags[condition.flag] === want;
    }
    if (condition.item !== undefined) {
      return this.hasItem(condition.item);
    }
    if (condition.stat !== undefined) {
      const val = this.getStat(condition.stat);
      if (condition.gte !== undefined) return val >= condition.gte;
      if (condition.lte !== undefined) return val <= condition.lte;
      if (condition.eq !== undefined) return val === condition.eq;
    }
    return true;
  }

  // ---- 저장/불러오기 ----
  save(slot = 'auto') {
    const key = `${STORAGE_PREFIX}${this.caseId}:${slot}`;
    const payload = {
      currentSceneId: this.currentSceneId,
      stats: this.stats,
      items: this.items,
      flags: this.flags,
      endingRecords: this.endingRecords,
      seenNoteStates: this.seenNoteStates,
      noteOrder: this.noteOrder,
      log: this.log,
      playerGender: this.playerGender,
      startedAt: this.startedAt,
      progressPercent: this.progressPercent,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('[state] 저장 실패:', e);
      return false;
    }
  }

  load(slot = 'auto') {
    const key = `${STORAGE_PREFIX}${this.caseId}:${slot}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const payload = JSON.parse(raw);
      Object.assign(this, payload);
      return true;
    } catch (e) {
      console.error('[state] 불러오기 실패:', e);
      return false;
    }
  }

  hasSave(slot = 'auto') {
    const key = `${STORAGE_PREFIX}${this.caseId}:${slot}`;
    return localStorage.getItem(key) !== null;
  }

  deleteSave(slot = 'auto') {
    const key = `${STORAGE_PREFIX}${this.caseId}:${slot}`;
    localStorage.removeItem(key);
  }
}

window.GameState = GameState;
