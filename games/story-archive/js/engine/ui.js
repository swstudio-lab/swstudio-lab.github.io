/**
 * ui.js — 대화창, 타이핑 효과, 연출, 선택지, 로그 UI
 */

class UIManager {
  constructor(root) {
    this.root = root;
    this.typingSpeed = 22; // ms per char
    this.isTyping = false;
    this.skipRequested = false;
    this.autoMode = false;
    this._typingTimer = null;

    this.els = {
      background: root.querySelector('#bg-layer'),
      charLeft: root.querySelector('#char-left'),
      charRight: root.querySelector('#char-right'),
      speakerName: root.querySelector('#speaker-name'),
      dialogueText: root.querySelector('#dialogue-text'),
      choices: root.querySelector('#choices-layer'),
      logPanel: root.querySelector('#log-panel'),
      logList: root.querySelector('#log-list'),
      dialogueBox: root.querySelector('#dialogue-box'),
      versionTag: root.querySelector('#version-tag'),
      itemPopup: root.querySelector('#item-popup'),
      itemPopupTag: root.querySelector('#item-popup-tag'),
      itemPopupImg: root.querySelector('#item-popup-img'),
      itemPopupLabel: root.querySelector('#item-popup-label'),
      itemPopupBtn: root.querySelector('#item-popup-btn'),

      hotspotLayer: root.querySelector('#hotspot-layer'),
      closeupOverlay: root.querySelector('#closeup-overlay'),
      closeupImg: root.querySelector('#closeup-img'),
      closeupLabel: root.querySelector('#closeup-label'),
      closeupCloseBtn: root.querySelector('#closeup-close-btn'),
    };

    this.els.closeupCloseBtn.addEventListener('click', () => this.hideCloseup());
  }

  // P&C 탐색 핫스팟 — 대화 진행과 무관하게 언제든 열고 닫을 수 있는 비차단 팝업
  showCloseup(src, label) {
    this.els.closeupImg.style.backgroundImage = `url("${src}")`;
    this.els.closeupLabel.textContent = label || '';
    this.els.closeupOverlay.classList.add('is-visible');
  }

  hideCloseup() {
    this.els.closeupOverlay.classList.remove('is-visible');
  }

  // hotspots: [{ id, left, top, width, height, closeup, label }] (left/top/width/height는 CSS 값 문자열, 예: "50%")
  // onExamine(hotspot) — 클릭 시 호출, 클로즈업 표시와 상태 기록은 호출부(main.js)에서 처리
  renderHotspots(hotspots, onExamine) {
    this.els.hotspotLayer.innerHTML = '';
    (hotspots || []).forEach((spot) => {
      const el = document.createElement('div');
      el.className = 'hotspot';
      el.style.left = spot.left;
      el.style.top = spot.top;
      el.style.width = spot.width;
      el.style.height = spot.height;
      el.title = spot.label || '';
      el.addEventListener('click', () => onExamine(spot));
      this.els.hotspotLayer.appendChild(el);
    });
  }

  clearHotspots() {
    this.els.hotspotLayer.innerHTML = '';
  }

  // 아이템 획득/확인 팝업 — 사용자가 "확인" 누를 때까지 대기 (Promise)
  // tag: "EVIDENCE ACQUIRED"(신규 획득) 또는 "PAGE REVEALED"(이미 가진 아이템 재확인) 등
  showItemPopup(src, label, tag = 'EVIDENCE ACQUIRED') {
    return new Promise((resolve) => {
      this.els.itemPopupTag.textContent = `[${tag}]`;
      this.els.itemPopupImg.style.backgroundImage = `url("${src}")`;
      this.els.itemPopupLabel.textContent = label || '';
      this.els.itemPopup.classList.add('is-visible');
      const handler = () => {
        this.els.itemPopup.classList.remove('is-visible');
        this.els.itemPopupBtn.removeEventListener('click', handler);
        resolve();
      };
      this.els.itemPopupBtn.addEventListener('click', handler);
    });
  }

  setBackground(src) {
    if (!src) return;
    this.els.background.style.backgroundImage = `url("${src}")`;
  }

  setCharacter(slot, src) {
    const el = slot === 'left' ? this.els.charLeft : this.els.charRight;
    if (!el) return;
    if (!src) {
      el.style.opacity = '0';
      return;
    }
    const newBg = `url("${src}")`;
    // "이미 같은 이미지면 무시"는 실제로 화면에 보이고 있을 때만 적용해야 함 —
    // clearCharacters() 등으로 숨겨진(opacity 0) 상태에서 backgroundImage만 이전 값이 남아있는 경우
    // (예: 씬이 바뀌어도 같은 표정을 다시 쓰는 경우, 이 게임에서 흔함) 여기서 그냥 리턴해버리면
    // 캐릭터가 다시는 나타나지 않는 버그가 생긴다.
    if (el.style.backgroundImage === newBg && el.style.opacity === '1') return;

    if (el.style.opacity === '1' && el.style.backgroundImage) {
      // 표정 전환 크로스페이드: 살짝 페이드아웃 → 이미지 교체 → 페이드인
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.backgroundImage = newBg;
        el.style.opacity = '1';
      }, 160);
    } else {
      el.style.backgroundImage = newBg;
      el.style.opacity = '1';
    }
  }

  clearCharacters() {
    this.setCharacter('left', null);
    this.setCharacter('right', null);
  }

  showVersion(text) {
    if (this.els.versionTag) this.els.versionTag.textContent = text;
  }

  // 대사 한 줄 출력 (타이핑 효과 포함). 완료 시 resolve.
  typeLine(speaker, text) {
    return new Promise((resolve) => {
      this.els.speakerName.textContent = speaker || '';
      this.els.dialogueText.textContent = '';
      this.isTyping = true;
      this.skipRequested = false;

      // 타이핑 도중 스킵 요청이 오면 이 함수로 즉시 완성 처리
      this._finishTyping = () => {
        clearTimeout(this._typingTimer);
        this.els.dialogueText.textContent = text;
        this.isTyping = false;
        this._finishTyping = null;
        resolve();
      };

      let i = 0;
      const step = () => {
        if (i < text.length) {
          this.els.dialogueText.textContent += text[i];
          i++;
          this._typingTimer = setTimeout(step, this.typingSpeed);
        } else {
          this.isTyping = false;
          this._finishTyping = null;
          resolve();
        }
      };
      step();
    });
  }

  // 타이핑 중이면 즉시 완성만 시키고(다음 줄로는 안 넘어감), 이미 완성됐으면 다음으로 진행하라는 신호
  requestAdvance() {
    if (this.isTyping) {
      if (this._finishTyping) this._finishTyping();
      return false;
    }
    return true; // 다음 줄로 진행 가능
  }

  renderChoices(choices, onSelect) {
    this.els.choices.innerHTML = '';
    this.els.choices.classList.add('is-visible');
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.addEventListener('click', () => {
        this.els.choices.classList.remove('is-visible');
        this.els.choices.innerHTML = '';
        onSelect(choice);
      });
      this.els.choices.appendChild(btn);
    });
  }

  appendLog(speaker, text) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="log-speaker">${speaker || '???'}</span><span class="log-text">${text}</span>`;
    this.els.logList.appendChild(line);
  }

  toggleLog(show) {
    this.els.logPanel.classList.toggle('is-open', show);
  }

  // 노이즈 글자가 지지직거리다 실제 텍스트로 맞춰지는 "디코딩" 연출
  // (예: [UNLOCKING FILE...] 같은 시스템 로그 라인에 사용)
  decodeLine(speaker, text, duration = 700) {
    return new Promise((resolve) => {
      this.els.speakerName.textContent = speaker || '';
      const noiseChars = '!<>-_\\/[]{}—=+*^?#$%&';
      const el = this.els.dialogueText;
      let frame = 0;
      const totalFrames = Math.max(8, Math.floor(duration / 40));
      const interval = setInterval(() => {
        frame++;
        const revealCount = Math.floor((frame / totalFrames) * text.length);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (i < revealCount || text[i] === ' ') out += text[i];
          else out += noiseChars[Math.floor(Math.random() * noiseChars.length)];
        }
        el.textContent = out;
        if (frame >= totalFrames) {
          clearInterval(interval);
          el.textContent = text;
          this.isTyping = false;
          resolve();
        }
      }, 40);
    });
  }

  // 화면 가장자리에서 붉은 기운이 번지는 연출 (공포 임계치 등에 사용)
  bloodBleed() {
    this.root.classList.add('screen-bloodbleed');
    setTimeout(() => this.root.classList.remove('screen-bloodbleed'), 1400);
  }

  flashScreen() {
    this.root.classList.add('screen-flash');
    setTimeout(() => this.root.classList.remove('screen-flash'), 180);
  }

  shakeScreen() {
    this.root.classList.add('screen-shake');
    setTimeout(() => this.root.classList.remove('screen-shake'), 400);
  }
}

window.UIManager = UIManager;
