/**
 * puzzle.js — 퍼즐 및 QTE 이벤트 모듈
 * 'code': 숫자 코드 입력 퍼즐
 * 'connect': 증거 보드 — 카드 2개씩 선택해 관련 있는 쌍 연결
 * 'sequence': 조각을 시간 순서대로 배열
 * 'contradiction': 모순찾기 — 텍스트 블록 여러 개 중 미묘하게 다른 하나를 짚음.
 *   오답이 maxWrongAttempts(기본 3)에 도달하면 정답을 못 찾은 채로 그 판을 그대로
 *   종료(success:false)한다 — 무한 재시도 없이, 실패해도 진행은 막지 않되 정보를 덜
 *   얻은 채 넘어가게 하기 위함(002 설계).
 * 'qte': 제한시간 안에 반응 클릭 (성공/실패 모두 resolve, 실패해도 진행은 계속됨)
 */

class PuzzleManager {
  constructor(ui, root) {
    this.ui = ui;
    this.root = root;
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

      contradictionOverlay: root.querySelector('#contradiction-overlay'),
      contradictionPrompt: root.querySelector('#contradiction-prompt'),
      contradictionGrid: root.querySelector('#contradiction-grid'),
      contradictionFeedback: root.querySelector('#contradiction-feedback'),
      contradictionHintBtn: root.querySelector('#contradiction-hint-btn'),
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
    if (puzzleDef.type === 'contradiction') {
      return this.runContradictionPuzzle(puzzleDef);
    }
    if (puzzleDef.type === 'qte') {
      return this.runQTE(puzzleDef);
    }
    console.warn('[puzzle] 알 수 없는 퍼즐 타입, 건너뜀:', puzzleDef);
    return { success: true, skipped: true };
  }

  // F: 카드/조각 배치를 퍼즐이 열릴 때마다(재도전 포함) 새로 무작위화 — 내용을 안 읽고
  // 위치만 외워서 푸는 것을 방지 (Fisher-Yates)
  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 3-3: 오답 3회 누적 시 [추가 힌트 발생] 알림 + 힌트 버튼 강조
  showToast(text) {
    const el = document.getElementById('puzzle-toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('is-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('is-visible'), 1800);
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

  // items: [{ id, label, image? }], pairs: [[idA, idB], ...], connectMessages: { "idA|idB"(정렬됨): "연결 시 문구" },
  // hint?: string(레벨1), hint2?: string(오답 3회 누적 후 레벨1을 대체하는 더 직접적인 힌트)
  runConnectPuzzle(def) {
    return new Promise((resolve) => {
      const { prompt, items, pairs, connectMessages = {}, hint, hint2 } = def;
      const pairKey = (a, b) => [a, b].sort().join('|');
      const pairSet = new Set(pairs.map(([a, b]) => pairKey(a, b)));
      const connected = new Set();
      const cardEls = {};
      let selected = null;
      let hintShown = false;
      let wrongCount = 0;
      let hint2Unlocked = false;

      this.els.boardPrompt.textContent = prompt || '';
      this.els.boardFeedback.textContent = '';
      this.els.boardFeedback.classList.remove('is-ok');
      this.els.boardGrid.innerHTML = '';
      this.els.boardOverlay.classList.add('is-visible');
      this.els.boardHintBtn.classList.remove('is-emphasized');

      const onHint = () => {
        if (!hint) return;
        hintShown = !hintShown;
        this.els.boardFeedback.classList.remove('is-ok');
        this.els.boardFeedback.textContent = hintShown ? (hint2Unlocked && hint2 ? hint2 : hint) : '';
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
          wrongCount++;
          this.els.boardFeedback.classList.remove('is-ok');
          this.els.boardFeedback.textContent = '연관성이 보이지 않는다.';
          cardEls[selected].classList.remove('is-selected');
          selected = null;
          if (wrongCount >= 3 && !hint2Unlocked && hint2) {
            hint2Unlocked = true;
            this.els.boardHintBtn.classList.add('is-emphasized');
            this.showToast('[추가 힌트 발생]');
          }
        }
      };

      this.shuffleArray(items).forEach((item) => {
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

  // fragments: [{ id, text }], order: 정답 순서의 id 배열,
  // hint?: string(레벨1), hint2?: string(오답 3회 누적 후 레벨1을 대체하는 더 직접적인 힌트)
  runSequencePuzzle(def) {
    return new Promise((resolve) => {
      const { prompt, fragments, order, hint, hint2 } = def;
      const shuffled = this.shuffleArray(fragments);
      let answer = [];
      let hintShown = false;
      let wrongCount = 0;
      let hint2Unlocked = false;

      this.els.seqPrompt.textContent = prompt || '';
      this.els.seqFeedback.textContent = '';
      this.els.seqFeedback.classList.remove('is-ok');
      this.els.seqOverlay.classList.add('is-visible');
      this.els.seqHintBtn.classList.remove('is-emphasized');

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
          wrongCount++;
          this.els.seqFeedback.classList.remove('is-ok');
          this.els.seqFeedback.textContent = '순서가 맞지 않습니다. 다시 시도하세요.';
          answer = [];
          renderAnswer();
          renderTray();
          if (wrongCount >= 3 && !hint2Unlocked && hint2) {
            hint2Unlocked = true;
            this.els.seqHintBtn.classList.add('is-emphasized');
            this.showToast('[추가 힌트 발생]');
          }
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
        this.els.seqFeedback.textContent = hintShown ? (hint2Unlocked && hint2 ? hint2 : hint) : '';
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

  // entries: [{ id, text }], answerId: 정답 id, maxWrongAttempts?: 오답 허용 횟수(기본 3),
  // hint?: string — 정답을 맞히면 success:true, 오답이 maxWrongAttempts에 도달하면 정답을
  // 못 찾은 채로 success:false로 종료(무한 재시도 없음 — 002 설계 의도)
  runContradictionPuzzle(def) {
    return new Promise((resolve) => {
      const { prompt, entries, answerId, maxWrongAttempts = 3, hint } = def;
      let wrongCount = 0;
      let settled = false;
      let hintShown = false;
      const cardEls = {};

      this.els.contradictionPrompt.textContent = prompt || '';
      this.els.contradictionFeedback.textContent = '';
      this.els.contradictionFeedback.classList.remove('is-ok');
      this.els.contradictionGrid.innerHTML = '';
      this.els.contradictionOverlay.classList.add('is-visible');

      const onHint = () => {
        if (!hint) return;
        hintShown = !hintShown;
        this.els.contradictionFeedback.classList.remove('is-ok');
        this.els.contradictionFeedback.textContent = hintShown ? hint : '';
      };
      if (this.els.contradictionHintBtn) {
        this.els.contradictionHintBtn.classList.toggle('is-hidden', !hint);
        this.els.contradictionHintBtn.addEventListener('click', onHint);
      }

      const cleanup = () => {
        this.els.contradictionOverlay.classList.remove('is-visible');
        if (this.els.contradictionHintBtn) this.els.contradictionHintBtn.removeEventListener('click', onHint);
      };

      const onEntryClick = (id) => {
        if (settled) return;
        const card = cardEls[id];
        if (id === answerId) {
          settled = true;
          card.classList.add('is-connected');
          this.els.contradictionFeedback.classList.add('is-ok');
          this.els.contradictionFeedback.textContent = '이거다.';
          Object.values(cardEls).forEach((el) => { el.style.pointerEvents = 'none'; });
          setTimeout(() => {
            cleanup();
            resolve({ success: true });
          }, 700);
        } else {
          wrongCount++;
          card.classList.add('is-selected');
          setTimeout(() => card.classList.remove('is-selected'), 220);
          this.els.contradictionFeedback.classList.remove('is-ok');
          if (wrongCount >= maxWrongAttempts) {
            settled = true;
            this.els.contradictionFeedback.textContent = '...시간이 없다. 일단 넘어가자.';
            Object.values(cardEls).forEach((el) => { el.style.pointerEvents = 'none'; });
            setTimeout(() => {
              cleanup();
              resolve({ success: false });
            }, 700);
          } else {
            this.els.contradictionFeedback.textContent = `다른 곳이다. (${wrongCount}/${maxWrongAttempts})`;
          }
        }
      };

      this.shuffleArray(entries).forEach((entry) => {
        const card = document.createElement('div');
        card.className = 'contradiction-card';
        const text = document.createElement('p');
        text.className = 'contradiction-card-text';
        text.textContent = entry.text;
        card.appendChild(text);
        card.addEventListener('click', () => onEntryClick(entry.id));
        this.els.contradictionGrid.appendChild(card);
        cardEls[entry.id] = card;
      });
    });
  }

  // duration(ms) 안에 화면 속 숨겨진 qte-target을 찾아 클릭하면 성공, 시간 초과되면 실패
  // (실패해도 진행은 계속됨). 남은 시간은 숫자/바가 아니라 화면 흔들림+붉은기 강도로만 체감됨.
  runQTE(def) {
    return new Promise((resolve) => {
      const duration = def.duration || 5000;
      this.els.qtePrompt.textContent = def.prompt || '지금 반응하라!';
      this.els.qteOverlay.classList.add('is-visible');
      if (this.root) this.root.classList.add('qte-danger');
      this.root && this.root.style.setProperty('--qte-danger', '0');

      // 타겟을 화면 속 임의의 위치(가장자리 쪽 흐릿한 지점)에 숨겨서 직접 찾아 클릭하게 함
      const top = 22 + Math.random() * 56; // 22%~78%
      const left = 12 + Math.random() * 76; // 12%~88%
      this.els.qteTarget.style.top = `${top}%`;
      this.els.qteTarget.style.left = `${left}%`;

      let settled = false;
      const startedAt = performance.now();
      let rafId = null;

      const tick = () => {
        if (settled) return;
        const ratio = Math.min(1, (performance.now() - startedAt) / duration);
        this.els.qteOverlay.style.backgroundColor = `rgba(90,10,10,${0.15 + ratio * 0.55})`;
        if (this.root) this.root.style.setProperty('--qte-danger', ratio.toFixed(3));
        if (ratio < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      const cleanup = () => {
        this.els.qteOverlay.classList.remove('is-visible');
        this.els.qteOverlay.style.backgroundColor = '';
        if (this.root) {
          this.root.classList.remove('qte-danger');
          this.root.style.removeProperty('--qte-danger');
        }
        this.els.qteTarget.removeEventListener('click', onHit);
        if (rafId) cancelAnimationFrame(rafId);
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
