/**
 * sound.js — Sound & Web Audio Manager
 * BGM은 같은 트랙이 이어질 때는 재시작하지 않고, 트랙이 바뀔 때만 크로스페이드로 전환합니다.
 * 트랙 자체가 짧아서(원곡 길이 몇 초) 네이티브 loop로는 반복 지점에서 뚝 끊기는 게 들리는 파일들이
 * 있어서, loop는 직접 구현합니다 — 재생 위치가 끝에 가까워지면 같은 트랙을 하나 더 겹쳐 틀고
 * 크로스페이드로 이어붙이는 "seamless loop" 방식(끝나기 전 미리 재생 → 겹쳐서 자연스럽게 이음).
 */

class SoundManager {
  constructor(themeSrc) {
    this.enabled = this._loadPref('story-archive:sound-enabled');
    this.sfxEnabled = this._loadPref('story-archive:sfx-enabled');
    this.bgmMode = this._loadStringPref('story-archive:bgm-mode', 'scene'); // 'scene' | 'theme'
    this.themeSrc = themeSrc || null;

    this.currentBgm = null; // 재생 "의도" 중인 원본 src (트랙 변경 여부 판단용, bgmMode 반영 후 값)
    this.bgmEl = null; // 현재 페이드인 완료(또는 진행 중)인 재생 엘리먼트

    this.BGM_VOLUME = 0.6;
    this.CROSSFADE_MS = 1000; // 트랙 자체가 바뀔 때
    this.LOOP_CROSSFADE_MS = 700; // 같은 트랙이 루프로 이어질 때
  }

  _loadPref(key) {
    const v = localStorage.getItem(key);
    return v === null ? true : v === 'true';
  }

  _loadStringPref(key, fallback) {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  }

  // 전체 소리 스위치 — BGM + 모든 SFX(효과음 스위치와 무관하게) 다 끔
  setEnabled(value) {
    this.enabled = value;
    localStorage.setItem('story-archive:sound-enabled', String(value));
    if (!value) {
      if (this.bgmEl) this.bgmEl.pause();
    } else if (this.currentBgm) {
      this.playBgm(this.currentBgm);
    }
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  // 효과음 전용 스위치 — BGM은 그대로 두고 무전기 클릭음 등 개별 SFX만 끔
  setSfxEnabled(value) {
    this.sfxEnabled = value;
    localStorage.setItem('story-archive:sfx-enabled', String(value));
  }

  toggleSfx() {
    this.setSfxEnabled(!this.sfxEnabled);
    return this.sfxEnabled;
  }

  // 'scene'(장면별 자동 전환, 기본) | 'theme'(타이틀 테마를 게임 내내 유지)
  setBgmMode(mode) {
    this.bgmMode = mode;
    localStorage.setItem('story-archive:bgm-mode', mode);
  }

  // src가 없으면(아직 에셋 미준비) 조용히 무시 — "준비중" 정책
  // bgmMode가 'theme'면 호출자가 뭘 넘기든 항상 themeSrc를 재생한다 — 그래서 main.js는
  // 모드를 신경 쓰지 않고 매번 "이 씬의 bgm"을 그대로 넘기기만 하면 된다.
  playBgm(src) {
    const target = this.bgmMode === 'theme' ? this.themeSrc : src;

    if (!target) {
      this.currentBgm = null;
      if (this.bgmEl) {
        this._detachLoopWatch(this.bgmEl);
        this.bgmEl.pause();
      }
      return;
    }

    const trackChanged = this.currentBgm !== target;
    this.currentBgm = target;

    if (!trackChanged) {
      // 같은 챕터 안 하위 씬 전환 등 — 이미 재생 중이면 그대로 둔다
      if (!this.bgmEl) {
        this._spawnBgm(target, false);
      } else if (this.enabled && this.bgmEl.paused) {
        this.bgmEl.play().catch(() => {
          // 브라우저 자동재생 정책 — 사용자 첫 클릭 이후 재시도됨
        });
      }
      return;
    }

    if (!this.enabled) {
      // 재생/페이드 없이 트랙만 교체해두고, setEnabled(true)가 다시 호출될 때 이어서 재생되게 함
      if (this.bgmEl) {
        this._detachLoopWatch(this.bgmEl);
        this.bgmEl.pause();
      }
      const el = new Audio(target);
      el.volume = this.BGM_VOLUME;
      this.bgmEl = el;
      return;
    }

    this._spawnBgm(target, true);
  }

  // fadeIn: 기존에 재생 중이던 트랙과 겹쳐 크로스페이드할지 여부 (트랙 변경 시, 그리고 루프 반복 시 모두 true)
  _spawnBgm(src, fadeIn) {
    const prevEl = this.bgmEl;
    const newEl = new Audio(src);
    newEl.volume = fadeIn ? 0 : this.BGM_VOLUME;
    newEl.play().catch(() => {});
    this.bgmEl = newEl;
    this._watchForSeamlessLoop(newEl, src);

    if (fadeIn) {
      this._fadeVolume(newEl, 0, this.BGM_VOLUME, this.CROSSFADE_MS);
    }

    if (prevEl) {
      this._detachLoopWatch(prevEl);
      this._fadeVolume(prevEl, prevEl.volume, 0, this.CROSSFADE_MS, () => prevEl.pause());
    }
  }

  // 재생 위치가 끝나기 직전이면(원곡이 짧아 네이티브 loop로는 끊김이 들리는 파일들 대응),
  // 끊기기 전에 같은 트랙을 하나 더 띄워 크로스페이드로 자연스럽게 이어붙인다
  _watchForSeamlessLoop(el, src) {
    let triggered = false;
    const check = () => {
      if (triggered || this.bgmEl !== el || !this.enabled) return;
      if (!el.duration || Number.isNaN(el.duration)) return;
      if (el.duration - el.currentTime <= this.LOOP_CROSSFADE_MS / 1000) {
        triggered = true;
        this._spawnBgm(src, true);
      }
    };
    el.addEventListener('timeupdate', check);
    el._loopCheck = check;
  }

  _detachLoopWatch(el) {
    if (el && el._loopCheck) el.removeEventListener('timeupdate', el._loopCheck);
  }

  // el의 볼륨을 duration(ms)에 걸쳐 from → to로 선형 보간
  _fadeVolume(el, from, to, duration, onDone) {
    const stepMs = 50;
    const steps = Math.max(1, Math.round(duration / stepMs));
    let step = 0;
    el.volume = from;
    const timer = setInterval(() => {
      step++;
      const t = Math.min(1, step / steps);
      el.volume = from + (to - from) * t;
      if (step >= steps) {
        clearInterval(timer);
        el.volume = to;
        if (onDone) onDone();
      }
    }, stepMs);
  }

  stopBgm() {
    if (this.bgmEl) {
      this._detachLoopWatch(this.bgmEl);
      this.bgmEl.pause();
    }
    this.currentBgm = null;
  }

  // src가 없으면 조용히 무시 (효과음 에셋 준비 전) — 전체 소리 OFF거나 효과음만 OFF여도 재생 안 함
  playSfx(src, volume = 0.8) {
    if (!this.enabled || !this.sfxEnabled || !src) return;
    const el = new Audio(src);
    el.volume = volume;
    el.play().catch(() => {});
  }

  // 저음 임팩트 + 노이즈 스침을 Web Audio로 즉석 합성 — 별도 파일 없이 QTE 실패/그림자 섬광 등
  // "무언가 스쳐 지나갔다" 순간에 쓰는 짧은 충격음. 실패해도(구형 브라우저 등) 조용히 무시.
  playImpact() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      const ctx = this._ctx || (this._ctx = new (window.AudioContext || window.webkitAudioContext)());
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.26);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      const bufferSize = Math.floor(ctx.sampleRate * 0.2);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      noise.connect(noiseGain).connect(ctx.destination);
      noise.start(now);
    } catch (e) {
      // Web Audio 미지원 환경 — 조용히 무시
    }
  }

  // QTE 성공 등 "긴장이 풀리는" 순간 — bgm을 잠깐 죽였다가 자연스럽게 원래 볼륨으로 복귀
  duckBgm(dip = 900) {
    if (!this.bgmEl) return;
    const original = this.BGM_VOLUME;
    this._fadeVolume(this.bgmEl, this.bgmEl.volume, original * 0.25, 200, () => {
      setTimeout(() => {
        if (this.bgmEl) this._fadeVolume(this.bgmEl, this.bgmEl.volume, original, dip);
      }, 250);
    });
  }
}

window.SoundManager = SoundManager;
