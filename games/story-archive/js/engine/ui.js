/**
 * ui.js — 대화창, 타이핑 효과, 연출, 선택지, 로그 UI
 */

class UIManager {
  constructor(root) {
    this.root = root;
    this.typingSpeed = 22; // ms per char
    this.isTyping = false;
    this.skipMode = false; // 3-1: SKIP 버튼 토글 — 켜져있는 동안 타이핑을 즉시 완성 처리
    this.autoMode = false;
    this._typingTimer = null;

    this.els = {
      background: root.querySelector('#bg-layer'),
      charLeft: root.querySelector('#char-left'),
      charRight: root.querySelector('#char-right'),
      speakerName: root.querySelector('#speaker-name'),
      dialogueText: root.querySelector('#dialogue-text'),
      systemMessageOverlay: root.querySelector('#system-message-overlay'),
      systemMessageText: root.querySelector('#system-message-text'),
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

      shadowFlashLayer: root.querySelector('#shadow-flash-layer'),
      blackoutLayer: root.querySelector('#blackout-layer'),

      hotspotLayer: root.querySelector('#hotspot-layer'),
      closeupOverlay: root.querySelector('#closeup-overlay'),
      closeupImg: root.querySelector('#closeup-img'),
      closeupLabel: root.querySelector('#closeup-label'),
      closeupDiscovery: root.querySelector('#closeup-discovery'),
      closeupCloseBtn: root.querySelector('#closeup-close-btn'),
    };

    this.els.closeupCloseBtn.addEventListener('click', () => this.hideCloseup());
  }

  // P&C 탐색 핫스팟 — 대화 진행과 무관하게 언제든 열고 닫을 수 있는 비차단 팝업
  // discoveryText: 1-4 — P&C에서만 얻을 수 있는 실제 단서 텍스트 (없으면 영역 자체를 숨김)
  showCloseup(src, label, discoveryText) {
    this.els.closeupImg.style.backgroundImage = `url("${src}")`;
    this.els.closeupLabel.textContent = label || '';
    if (this.els.closeupDiscovery) {
      this.els.closeupDiscovery.textContent = discoveryText || '';
      this.els.closeupDiscovery.style.display = discoveryText ? '' : 'none';
    }
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
      // 표정 전환 크로스페이드: 살짝 페이드아웃 → 이미지 교체 → 페이드인 (이미 화면에 있던 상태라
      // 슬라이드는 넣지 않음 — 매 표정 변화마다 들어왔다 나가는 것처럼 보이면 산만함)
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.backgroundImage = newBg;
        el.style.opacity = '1';
      }, 160);
    } else {
      // 화면에 없던 상태에서 새로 등장 — 왼쪽 슬롯은 왼쪽에서, 오른쪽 슬롯은 오른쪽에서
      // 슥 들어오게 해서 자리에 따른 방향성을 줌.
      // char-sprite--right는 CSS에서 scaleX(-1)로 좌우반전돼 있으므로, translateX를 먼저
      // 적용한 뒤 scaleX(-1)을 이어붙여야(반전 전 좌표계 기준 이동) 화면상 방향이 맞음.
      const fromX = slot === 'left' ? '-30px' : '30px';
      const mirror = slot === 'right' ? ' scaleX(-1)' : '';
      el.style.transition = 'none';
      el.style.transform = `translateX(${fromX})${mirror}`;
      void el.offsetWidth; // reflow
      el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      el.style.backgroundImage = newBg;
      el.style.opacity = '1';
      el.style.transform = `translateX(0)${mirror}`;
    }
  }

  clearCharacters() {
    this.setCharacter('left', null);
    this.setCharacter('right', null);
  }

  // 화자 이름 표시 + 대사창 자체를 화자에 따라 다르게 배치/스타일링.
  // 관리자는 이미지 없이 "대사창이 오른쪽에, 청록/글리치 톤으로 뜬다"는 것만으로
  // 실체 없는 존재라는 느낌을 줌 (기존 검은 실루엣 이미지는 어색해서 제거).
  setSpeaker(speaker) {
    this.els.speakerName.textContent = speaker || '';
    const isAdmin = speaker === '관리자';
    this.els.speakerName.classList.toggle('is-admin-speaker', isAdmin);
    this.els.dialogueBox.classList.toggle('is-admin', isAdmin);
  }

  showVersion(text) {
    if (this.els.versionTag) this.els.versionTag.textContent = text;
  }

  // 대사 한 줄 출력 (타이핑 효과 포함). 완료 시 resolve.
  // N: profile === 'decelerating'이면 처음엔 빠르고 정갈하다가 후반부로 갈수록 한 글자씩
  // 느려지고, 마지막엔 글리치처럼 급히 마무리됨 (R-07/R-03 로그처럼 감정이 무너지는 대사용)
  typeLine(speaker, text, profile) {
    return new Promise((resolve) => {
      this.setSpeaker(speaker);
      this.els.dialogueText.textContent = '';
      this.isTyping = true;

      // SKIP 모드면 타이핑 애니메이션 없이 즉시 완성된 텍스트를 보여줌
      if (this.skipMode) {
        this.els.dialogueText.textContent = text;
        this.isTyping = false;
        resolve();
        return;
      }

      // 타이핑 도중 스킵 요청이 오면 이 함수로 즉시 완성 처리
      this._finishTyping = () => {
        clearTimeout(this._typingTimer);
        this.els.dialogueText.textContent = text;
        this.isTyping = false;
        this._finishTyping = null;
        resolve();
      };

      const total = text.length;
      let i = 0;
      const step = () => {
        if (i < total) {
          this.els.dialogueText.textContent += text[i];
          i++;
          let delay = this.typingSpeed;
          if (profile === 'decelerating') {
            const ratio = i / total;
            delay = ratio > 0.85 ? this.typingSpeed * 0.4 : this.typingSpeed * (0.5 + ratio * 1.8);
          }
          this._typingTimer = setTimeout(step, delay);
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
      this.setSpeaker(speaker);

      // SKIP 모드면 디코딩 애니메이션 없이 즉시 완성된 텍스트를 보여줌
      if (this.skipMode) {
        this.els.dialogueText.textContent = text;
        this.isTyping = false;
        resolve();
        return;
      }

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

  // speaker가 빈 문자열인 "시스템 메시지" 전용 — 하단 대사창이 아니라 화면 중앙 별도 박스에
  // decodeLine과 같은 노이즈-스크램블 연출로 표시. 개행은 스크램블 대상에서 제외해서
  // [PROFILE REGISTERED] 같은 여러 줄짜리 메시지도 레이아웃이 흔들리지 않게 함.
  showSystemMessage(text, duration = 900) {
    return new Promise((resolve) => {
      this.els.systemMessageOverlay.classList.add('is-visible');
      this.isTyping = true;

      if (this.skipMode) {
        this.els.systemMessageText.textContent = text;
        this.isTyping = false;
        resolve();
        return;
      }

      this._finishTyping = () => {
        clearInterval(this._systemMessageTimer);
        this.els.systemMessageText.textContent = text;
        this.isTyping = false;
        this._finishTyping = null;
        resolve();
      };

      const noiseChars = '!<>-_\\/[]{}—=+*^?#$%&';
      const el = this.els.systemMessageText;
      let frame = 0;
      const totalFrames = Math.max(8, Math.floor(duration / 40));
      this._systemMessageTimer = setInterval(() => {
        frame++;
        const revealCount = Math.floor((frame / totalFrames) * text.length);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (i < revealCount || text[i] === ' ' || text[i] === '\n') out += text[i];
          else out += noiseChars[Math.floor(Math.random() * noiseChars.length)];
        }
        el.textContent = out;
        if (frame >= totalFrames) {
          clearInterval(this._systemMessageTimer);
          el.textContent = text;
          this.isTyping = false;
          this._finishTyping = null;
          resolve();
        }
      }, 40);
    });
  }

  hideSystemMessage() {
    this.els.systemMessageOverlay.classList.remove('is-visible');
  }

  // 화면 가장자리에서 붉은 기운이 번지는 연출 (공포 임계치 등에 사용)
  bloodBleed() {
    this.root.classList.add('screen-bloodbleed');
    setTimeout(() => this.root.classList.remove('screen-bloodbleed'), 1400);
  }

  // O: 아주 중요한 대사 1~2곳에만 제한적으로 쓰는 강조 펄스 — 텍스트 색이 짧게 핏빛으로
  // 변했다가 원래 색으로 돌아옴 (남발 시 효과 죽음, 그림자섬광과 같은 원칙)
  pulseHighlight() {
    const el = this.els.dialogueText;
    el.classList.remove('dialogue-highlight-pulse');
    void el.offsetWidth; // reflow — 연달아 호출돼도 애니메이션이 재시작되게 함
    el.classList.add('dialogue-highlight-pulse');
  }

  flashScreen() {
    this.root.classList.add('screen-flash');
    setTimeout(() => this.root.classList.remove('screen-flash'), 180);
  }

  shakeScreen() {
    this.root.classList.add('screen-shake');
    setTimeout(() => this.root.classList.remove('screen-shake'), 400);
  }

  // 2-2: "그림자 섬광" — 예측 불가능한 타이밍에 왜곡된 형체가 화면을 슥 스쳐 지나가는
  // 리미널호러 연출. 화면 중앙에 딱 나타났다 사라지면 렌더링 버그처럼 보이기 쉬워서,
  // 아주 흐릿하게(blur) 만들고 좌→우 또는 우→좌로 천천히 드리프트하며 지나가게 함.
  flashShadow(src, duration = 900) {
    const el = this.els.shadowFlashLayer;
    if (!el) return;
    el.style.backgroundImage = `url("${src}")`;
    el.style.top = `${8 + Math.random() * 45}%`;
    const cls = Math.random() < 0.5 ? 'sweep-ltr' : 'sweep-rtl';
    el.classList.remove('sweep-ltr', 'sweep-rtl');
    void el.offsetWidth; // reflow — 연달아 발동돼도 애니메이션이 재시작되게 함
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), duration);
  }

  // 2-1 QTE 실패 등 "완전 암전" 순간 연출
  flashBlackout(duration = 300) {
    const el = this.els.blackoutLayer;
    if (!el) return;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, duration);
  }
}

window.UIManager = UIManager;
