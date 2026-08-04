/**
 * puzzle.js — 퍼즐 및 QTE 이벤트 모듈
 * 'code': 숫자 코드 입력 퍼즐
 * 'connect': 증거 보드 — 카드 2개씩 선택해 관련 있는 쌍 연결
 * 'sequence': 조각을 시간 순서대로 배열
 * 'qte': 제한시간 안에 반응 클릭 (성공/실패 모두 resolve, 실패해도 진행은 계속됨)
 */

class PuzzleManager {
  constructor(ui, root) {
    this.ui = ui;
    this.els = {
      overlay: root.querySelector('#puzzle-overlay'),
      prompt: root.querySelector('#puzzle-prompt'),
      input: root.querySelector('#puzzle-input'),
      feedback: root.querySelector('#puzzle-feedback'),
      submit: root.querySelector('#puzzle-submit'),
      hintBtn: root.querySelector('#puzzle-hint-btn'),

      boardOverlay: root.querySelector('#board-overlay'),
      boardPrompt: root.querySelector('#board-prompt'),
      boardGrid: root.querySelector('#board-grid'),
      boardFeedback: root.querySelector('#board-feedback'),
      boardHintBtn: root.querySelector('#board-hint-btn'),

      seqOverlay: root.querySelector('#sequence-overlay'),
      seqPrompt: root.querySelector('#sequence-prompt'),
      seqAnswer: root.querySelector('#sequence-answer'),
      seqTray: root.querySelector('#sequence-tray'),
      seqFeedback: root.querySelector('#sequence-feedback'),
      seqSubmit: root.querySelector('#sequence-submit'),
      seqReset: root.querySelector('#sequence-reset'),
      seqHintBtn: root.querySelector('#sequence-hint-btn'),

      qteOverlay: root.querySelector('#qte-overlay'),
      qtePrompt: root.querySelector('#qte-prompt'),
      qteTarget: root.querySelector('#qte-target'),
      qteBar: root.querySelector('#qte-bar'),
    };
  }

  async run(puzzleDef) {
    if (puzzleDef.type === 'code') {
      return this.runCodePuzzle(puzzleDef);
    }
    if (puzzleDef.type === 'connect') {
      return this.runConnectPuzzle(puzzleDef);
    }
    if (puzzleDef.type === 'sequence') {
      return this.runSequencePuzzle(puzzleDef);
    }
    if (puzzleDef.type === 'qte') {
      return this.runQTE(puzzleDef);
    }
    console.warn('[puzzle] 알 수 없는 퍼즐 타입, 건너뜀:', puzzleDef);
    return { success: true, skipped: true };
  }

  runCodePuzzle(def) {
    return new Promise((resolve) => {
      const { prompt, code, hint } = def;
      this.els.prompt.textContent = prompt || '';
      this.els.input.value = '';
      this.els.feedback.textContent = '';
      this.els.feedback.classList.remove('is-ok');
      this.els.overlay.classList.add('is-visible');
      this.els.input.focus();

      let hintShown = false;

      const cleanup = () => {
        this.els.overlay.classList.remove('is-visible');
        this.els.submit.removeEventListener('click', onSubmit);
        this.els.input.removeEventListener('keydown', onKeydown);
        this.els.hintBtn.removeEventListener('click', onHint);
      };

      const onSubmit = () => {
        const value = this.els.input.value.trim();
        if (value === String(code)) {
          this.els.feedback.textContent = '일치합니다.';
          this.els.feedback.classList.add('is-ok');
          setTimeout(() => {
            cleanup();
            resolve({ success: true });
          }, 500);
        } else {
          this.els.feedback.classList.remove('is-ok');
          this.els.feedback.textContent = '일치하지 않습니다.';
          this.els.input.value = '';
          this.els.input.focus();
        }
      };

      const onKeydown = (e) => {
        if (e.key === 'Enter') onSubmit();
      };

      const onHint = () => {
        if (!hint) return;
        hintShown = !hintShown;
        this.els.feedback.classList.remove('is-ok');
        this.els.feedback.textContent = hintShown ? hint : '';
      };

      this.els.submit.addEventListener('click', onSubmit);
      this.els.input.addEventListener('keydown', onKeydown);
      this.els.hintBtn.addEventListener('click', onHint);
    });
  }

  // items: [{ id, label, image? }], pairs: [[idA, idB], ...], connectMessages: { "idA|idB"(정렬됨): "연결 시 문구" }, hint?: string
  runConnectPuzzle(def) {
    return new Promise((resolve) => {
      const { prompt, items, pairs, connectMessages = {}, hint } = def;
      const pairKey = (a, b) => [a, b].sort().join('|');
      const pairSet = new Set(pairs.map(([a, b]) => pairKey(a, b)));
      const connected = new Set();
      const cardEls = {};
      let selected = null;
      let hintShown = false;

      this.els.boardPrompt.textContent = prompt || '';
      this.els.boardFeedback.textContent = '';
      this.els.boardFeedback.classList.remove('is-ok');
      this.els.boardGrid.innerHTML = '';
      this.els.boardOverlay.classList.add('is-visible');

      const onHint = () => {
        if (!hint) return;
        hintShown = !hintShown;
        this.els.boardFeedback.classList.remove('is-ok');
        this.els.boardFeedback.textContent = hintShown ? hint : '';
      };
      this.els.boardHintBtn.addEventListener('click', onHint);

      const onCardClick = (id) => {
        const card = cardEls[id];
        if (connected.has(id)) return;

        if (selected === null) {
          selected = id;
          card.classList.add('is-selected');
          return;
        }
        if (selected === id) {
          card.classList.remove('is-selected');
          selected = null;
          return;
        }

        const key = pairKey(selected, id);
        if (pairSet.has(key)) {
          connected.add(selected);
          connected.add(id);
          cardEls[selected].classList.remove('is-selected');
          cardEls[selected].classList.add('is-connected');
          card.classList.add('is-connected');
          this.els.boardFeedback.classList.add('is-ok');
          this.els.boardFeedback.textContent = connectMessages[key] || '연결됨.';
          selected = null;

          if (connected.size === items.length) {
            setTimeout(() => {
              this.els.boardOverlay.classList.remove('is-visible');
              this.els.boardHintBtn.removeEventListener('click', onHint);
              resolve({ success: true });
            }, 900);
          }
        } else {
          this.els.boardFeedback.classList.remove('is-ok');
          this.els.boardFeedback.textContent = '연관성이 보이지 않는다.';
          cardEls[selected].classList.remove('is-selected');
          selected = null;
        }
      };

      items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'board-card';
        if (item.image) {
          const img = document.createElement('div');
          img.className = 'board-card-img';
          img.style.backgroundImage = `url("${item.image}")`;
          card.appendChild(img);
        }
        const label = document.createElement('p');
        label.className = 'board-card-label';
        label.textContent = item.label;
        card.appendChild(label);
        card.addEventListener('click', () => onCardClick(item.id));
        this.els.boardGrid.appendChild(card);
        cardEls[item.id] = card;
      });
    });
  }

  // fragments: [{ id, text }], order: 정답 순서의 id 배열, hint?: string
  runSequencePuzzle(def) {
    return new Promise((resolve) => {
      const { prompt, fragments, order, hint } = def;
      const shuffled = [...fragments].sort(() => Math.random() - 0.5);
      let answer = [];
      let hintShown = false;

      this.els.seqPrompt.textContent = prompt || '';
      this.els.seqFeedback.textContent = '';
      this.els.seqFeedback.classList.remove('is-ok');
      this.els.seqOverlay.classList.add('is-visible');

      const renderTray = () => {
        this.els.seqTray.innerHTML = '';
        shuffled
          .filter((f) => !answer.includes(f.id))
          .forEach((f) => {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'seq-tile';
            tile.textContent = f.text;
            tile.addEventListener('click', () => {
              answer.push(f.id);
              renderAnswer();
              renderTray();
            });
            this.els.seqTray.appendChild(tile);
          });
      };

      const renderAnswer = () => {
        this.els.seqAnswer.innerHTML = '';
        answer.forEach((id, i) => {
          const frag = fragments.find((f) => f.id === id);
          const row = document.createElement('div');
          row.className = 'sequence-answer-row';
          row.textContent = `${i + 1}. ${frag.text}`;
          row.addEventListener('click', () => {
            answer = answer.filter((a) => a !== id);
            renderAnswer();
            renderTray();
          });
          this.els.seqAnswer.appendChild(row);
        });
      };

      const onSubmit = () => {
        if (answer.length !== order.length) {
          this.els.seqFeedback.classList.remove('is-ok');
          this.els.seqFeedback.textContent = '아직 순서를 다 채우지 않았습니다.';
          return;
        }
        const isCorrect = order.every((id, i) => answer[i] === id);
        if (isCorrect) {
          this.els.seqFeedback.classList.add('is-ok');
          this.els.seqFeedback.textContent = '순서가 맞습니다.';
          setTimeout(() => {
            cleanup();
            resolve({ success: true });
          }, 600);
        } else {
          this.els.seqFeedback.classList.remove('is-ok');
          this.els.seqFeedback.textContent = '순서가 맞지 않습니다. 다시 시도하세요.';
          answer = [];
          renderAnswer();
          renderTray();
        }
      };

      const onReset = () => {
        answer = [];
        renderAnswer();
        renderTray();
        this.els.seqFeedback.textContent = '';
      };

      const onHint = () => {
        if (!hint) return;
        hintShown = !hintShown;
        this.els.seqFeedback.classList.remove('is-ok');
        this.els.seqFeedback.textContent = hintShown ? hint : '';
      };

      const cleanup = () => {
        this.els.seqOverlay.classList.remove('is-visible');
        this.els.seqSubmit.removeEventListener('click', onSubmit);
        this.els.seqReset.removeEventListener('click', onReset);
        this.els.seqHintBtn.removeEventListener('click', onHint);
      };

      this.els.seqSubmit.addEventListener('click', onSubmit);
      this.els.seqReset.addEventListener('click', onReset);
      this.els.seqHintBtn.addEventListener('click', onHint);

      renderTray();
      renderAnswer();
    });
  }

  // duration(ms) 안에 qte-target을 클릭하면 성공, 시간 초과되면 실패 — 실패해도 진행은 계속됨
  runQTE(def) {
    return new Promise((resolve) => {
      const duration = def.duration || 5000;
      this.els.qtePrompt.textContent = def.prompt || '지금 반응하라!';
      this.els.qteOverlay.classList.add('is-visible');

      this.els.qteBar.style.transition = 'none';
      this.els.qteBar.style.width = '100%';
      void this.els.qteBar.offsetWidth; // 강제 reflow — transition 재시작을 위함
      this.els.qteBar.style.transition = `width ${duration}ms linear`;
      this.els.qteBar.style.width = '0%';

      let settled = false;

      const cleanup = () => {
        this.els.qteOverlay.classList.remove('is-visible');
        this.els.qteTarget.removeEventListener('click', onHit);
        clearTimeout(timer);
      };

      const onHit = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve({ success: true });
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve({ success: false });
      }, duration);

      this.els.qteTarget.addEventListener('click', onHit);
    });
  }
}

window.PuzzleManager = PuzzleManager;
