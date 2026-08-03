// 작업물/기타/AI 실험실/게임 목록 페이지 공통 — 카드 렌더링 + 페이지네이션
// assets/icons.js(escHtml, iconSvg)가 먼저 로드되어 있어야 합니다.
const EMPTY_SLOT_HTML = `
    <div class="cart empty">
        <div class="cart-icon" style="justify-content:center; width:100%;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#8f8879" stroke-width="1.6" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
        </div>
        <div class="pixel" style="font-size:10px; letter-spacing:0.05em;">빈 슬롯<br>다음에 만들 걸 여기에</div>
    </div>`;

function cardHtml(it, opts){
    opts = opts || {};
    const wipLabel = opts.wipLabel || '제작중';
    const readyLabel = opts.readyLabel || 'READY';
    const openLabel = opts.openLabel || '→ 열기';
    const tagLabel = it.tag === 'wip' ? wipLabel : readyLabel;
    const tagClass = it.tag === 'wip' ? 'wip' : 'playable';
    const color = it.tag === 'wip' ? '#d9642f' : '#e8b93f';
    if (it.tag === 'wip' || !it.href) {
        return `
        <div class="cart disabled">
            <span class="cart-tag ${tagClass} pixel">${tagLabel}</span>
            <div class="cart-icon">${iconSvg(it.icon, { color })}</div>
            <h3>${escHtml(it.title)}</h3>
            <p>${escHtml(it.desc)}</p>
        </div>`;
    }
    return `
        <a class="cart playable" href="${escHtml(it.href)}">
            <span class="cart-tag ${tagClass} pixel">${tagLabel}</span>
            <div class="cart-icon">${iconSvg(it.icon, { color })}</div>
            <h3>${escHtml(it.title)}</h3>
            <p>${escHtml(it.desc)}</p>
            <div class="cart-play pixel">${openLabel}</div>
        </a>`;
}

// items: 이번 페이지에 보여줄 전체 목록(정렬/필터 완료된 상태)
// gridEl/pagEl: 카드 그리드와 페이지네이션을 그릴 엘리먼트
// page: 요청한 페이지 번호, pageSize: 페이지당 개수
// onPageChange(newPage): 이전/다음 버튼 클릭 시 호출됨
// 반환값: 실제로 적용된(범위 안으로 보정된) 페이지 번호
function renderListingGrid({ items, page, pageSize, gridEl, pagEl, cardOpts, onPageChange }){
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    let html = pageItems.map(it => cardHtml(it, cardOpts)).join('');
    if (clampedPage === totalPages && pageItems.length < pageSize) html += EMPTY_SLOT_HTML;
    gridEl.innerHTML = html || EMPTY_SLOT_HTML;

    if (totalPages > 1) {
        pagEl.style.display = 'flex';
        pagEl.innerHTML = `
            <button id="pg-prev" ${clampedPage<=1?'disabled':''}>← 이전</button>
            <span class="pg-label">${clampedPage} / ${totalPages}</span>
            <button id="pg-next" ${clampedPage>=totalPages?'disabled':''}>다음 →</button>
        `;
        pagEl.querySelector('#pg-prev').addEventListener('click', () => onPageChange(clampedPage - 1));
        pagEl.querySelector('#pg-next').addEventListener('click', () => onPageChange(clampedPage + 1));
    } else {
        pagEl.style.display = 'none';
    }

    return clampedPage;
}
