// 아이콘 SVG + HTML 이스케이프 — 여러 페이지에서 공통으로 쓰는 유틸
const ICON_PATHS = {
    sword: '<line x1="19" y1="5" x2="9" y2="15"/><line x1="7" y1="17" x2="11" y2="13"/><line x1="9" y1="15" x2="6" y2="18"/><circle cx="5" cy="19" r="1" fill="C"/>',
    grid: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M6 6l2 2M18 6l-2 2" stroke-width="1.4"/>',
    horse: '<path d="M4 18c2-6 5-10 9-10 3 0 4 2 4 4 0 3-2 4-5 4"/><circle cx="17" cy="8" r="1" fill="C"/><path d="M8 18h9"/><path d="M6 15l-2 3M20 15l2 3"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="10" x2="9" y2="20"/><line x1="15" y1="10" x2="15" y2="20"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    card: '<rect x="4" y="3" width="10" height="16" rx="2" transform="rotate(-8 9 11)"/><rect x="11" y="4" width="10" height="16" rx="2" transform="rotate(8 16 12)"/><circle cx="16" cy="11" r="1.4" fill="C"/>',
    clock: '<circle cx="12" cy="12" r="8"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="15" y2="14"/>',
    box: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 9v11"/>',
    star: '<path d="M12 3l2.6 5.9L21 9.6l-4.8 4.2 1.4 6.6L12 17l-5.6 3.4 1.4-6.6L3 9.6l6.4-.7z"/>',
    sparkle: '<path d="M12 4l1.5 5.5L19 11l-5.5 1.5L12 18l-1.5-5.5L5 11l5.5-1.5L12 4z"/>'
};

function iconSvg(key, opts){
    opts = opts || {};
    const color = opts.color || '#e8b93f';
    const size = opts.size || 30;
    const inner = (ICON_PATHS[key] || ICON_PATHS.box).replace(/C/g, color);
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

function escHtml(s){ return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
