// nav 드롭다운(게임 > 혼자/함께) 열고 닫기 — 모든 페이지 공통
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
