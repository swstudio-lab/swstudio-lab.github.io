// 상단 내비게이션 — 모든 페이지 공통
// 사용법: <nav class="topnav pixel" id="site-nav"></nav> 를 두고 이 스크립트를 로드하면
// 메뉴 구조를 그려주고, 현재 페이지에 맞는 active 표시와 드롭다운 열고닫기를 자동으로 처리합니다.
(function () {
    const NAV_ITEMS = [
        {
            href: 'index.html', label: '홈',
            dropdown: [
                { href: 'about.html', label: '💬 소개' },
                { href: 'devlog.html', label: '📓 개발일지' }
            ]
        },
        { href: 'ai-lab.html', label: 'AI 실험실' },
        { href: 'works.html', label: '작업물' },
        {
            href: 'games.html', label: '게임',
            dropdown: [
                { href: 'games.html?mode=solo', label: '🕹️ 혼자 플레이' },
                { href: 'games.html?mode=multi', label: '👥 함께 플레이' }
            ]
        },
        { href: 'etc.html', label: '기타' }
    ];

    function renderNav(){
        const navEl = document.getElementById('site-nav');
        if (!navEl) return;
        const currentPage = location.pathname.split('/').pop() || 'index.html';

        navEl.innerHTML = NAV_ITEMS.map(item => {
            const activeAttr = item.href === currentPage ? ' class="active"' : '';
            const link = `<a href="${item.href}"${activeAttr}>${item.label}</a>`;
            if (!item.dropdown) return link;
            const menu = item.dropdown.map(d => `<a href="${d.href}">${d.label}</a>`).join('');
            return `<div class="nav-drop">${link}<button class="nav-drop-caret" aria-label="${item.label} 하위메뉴 열기">▾</button><div class="nav-drop-menu">${menu}</div></div>`;
        }).join('');
    }
    renderNav();

    // nav 드롭다운(게임 > 혼자/함께) 열고 닫기
    document.querySelectorAll('.nav-drop-caret').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            const drop = btn.closest('.nav-drop');
            document.querySelectorAll('.nav-drop.open').forEach(d => { if (d !== drop) d.classList.remove('open'); });
            drop.classList.toggle('open');
        });
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('.nav-drop')) {
            document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'));
        }
    });
})();
