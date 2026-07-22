/* 점검 모드 배너 + 팝업 — 모든 페이지 공통
   사용법: 각 페이지 </body> 직전에
   <script src="assets/maintenance.js"></script> (하위 폴더는 ../../assets/maintenance.js)
   한 줄만 추가하면 자동으로 동작합니다. */
(function () {
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyB0LRiIpNwdcCkS4Y5Dz4pP9zcLoadO2Xk",
        authDomain: "taskflow-7cb3b.firebaseapp.com",
        projectId: "taskflow-7cb3b",
        storageBucket: "taskflow-7cb3b.firebasestorage.app",
        messagingSenderId: "811223035419",
        appId: "1:811223035419:web:08b972916827147bc2d2be"
    };

    const CSS = `
        .sticky-top-wrap{ position:sticky; top:0; z-index:15; }
        .maint-banner{
            display:none; align-items:center; justify-content:center; gap:10px;
            background:linear-gradient(90deg, var(--ember), var(--gold));
            color:#1c1208; font-weight:700; font-size:13.5px; letter-spacing:0.01em;
            padding:12px 18px; text-align:center;
            box-shadow:0 2px 12px rgba(0,0,0,0.35);
        }
        .maint-banner.show{ display:flex; }
        .maint-dot{
            width:7px; height:7px; border-radius:50%; background:#1c1208; flex:0 0 auto;
            animation:maintPulse 1.6s ease-in-out infinite;
        }
        @keyframes maintPulse{ 0%,100%{ opacity:1; } 50%{ opacity:0.25; } }

        .maint-overlay{
            display:none; position:fixed; inset:0; z-index:100;
            background:rgba(8,7,5,0.72); backdrop-filter:blur(3px);
            align-items:center; justify-content:center; padding:20px;
        }
        .maint-overlay.show{ display:flex; }
        .maint-modal{
            position:relative; max-width:380px; width:100%;
            background:linear-gradient(180deg, var(--surface2), var(--surface));
            border:1px solid var(--border-lit); border-radius:16px;
            padding:32px 26px 28px; text-align:center;
            box-shadow:0 20px 50px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,185,63,0.08);
            animation:maintPop .3s cubic-bezier(.2,.9,.3,1.1);
            font-family:'Noto Sans KR', sans-serif; color:var(--text);
        }
        @keyframes maintPop{ from{ opacity:0; transform:scale(0.92) translateY(8px); } to{ opacity:1; transform:scale(1) translateY(0); } }
        .maint-close{
            position:absolute; top:12px; right:12px; width:28px; height:28px;
            background:none; border:none; color:var(--muted); font-size:18px; cursor:pointer;
            border-radius:6px; line-height:1; transition:color .15s ease, background .15s ease;
        }
        .maint-close:hover{ color:var(--text); background:rgba(255,255,255,0.06); }
        .maint-modal-icon{
            width:52px; height:52px; margin:0 auto 16px; border-radius:14px;
            background:linear-gradient(135deg, var(--ember), var(--gold));
            display:flex; align-items:center; justify-content:center; font-size:24px;
        }
        .maint-modal-title{ font-size:16px; font-weight:900; margin:0 0 10px; }
        .maint-modal-text{ font-size:13px; color:var(--muted); line-height:1.7; margin:0 0 22px; }
        .maint-modal button.maint-ok{
            background:var(--gold); color:#1c1208; border:none; font-weight:700;
            font-size:12.5px; padding:10px 26px; border-radius:8px; cursor:pointer; font-family:inherit;
        }
    `;

    function injectCss() {
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function buildBannerDom() {
        const nav = document.querySelector('nav.topnav');
        if (!nav) return null; // nav 없는 몰입형 페이지(게임 본편 등)는 배너를 안 붙임
        const wrap = document.createElement('div');
        wrap.className = 'sticky-top-wrap';
        nav.parentNode.insertBefore(wrap, nav);
        const banner = document.createElement('div');
        banner.className = 'maint-banner';
        banner.id = 'maint-banner';
        wrap.appendChild(banner);
        wrap.appendChild(nav);
        return banner;
    }

    function buildPopupDom() {
        const overlay = document.createElement('div');
        overlay.className = 'maint-overlay';
        overlay.id = 'maint-overlay';
        overlay.innerHTML = `
            <div class="maint-modal">
                <button class="maint-close" id="maint-close" aria-label="닫기">✕</button>
                <div class="maint-modal-icon">🚧</div>
                <h3 class="maint-modal-title">단장 중이에요</h3>
                <p class="maint-modal-text" id="maint-text"></p>
                <button class="maint-ok" id="maint-ok">확인했어요</button>
            </div>`;
        document.body.appendChild(overlay);

        function close() {
            overlay.classList.remove('show');
            sessionStorage.setItem('maintDismissed', '1');
        }
        overlay.querySelector('#maint-close').addEventListener('click', close);
        overlay.querySelector('#maint-ok').addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        return overlay;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function ensureFirebase() {
        if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
            return Promise.resolve(); // 이미 이 페이지에서 초기화되어 있음 (games.html 등)
        }
        if (window.firebase && typeof window.firebase.initializeApp === 'function') {
            window.firebase.initializeApp(FIREBASE_CONFIG);
            return Promise.resolve();
        }
        return loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
            .then(() => loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'))
            .then(() => { window.firebase.initializeApp(FIREBASE_CONFIG); });
    }

    injectCss();
    const banner = buildBannerDom();
    const overlay = buildPopupDom();

    ensureFirebase().then(() => {
        const db = window.firebase.firestore();
        db.collection('siteConfig').doc('main').onSnapshot(doc => {
            const isMaint = doc.exists && doc.data().maintenance;
            const msg = (doc.exists && doc.data().maintenanceMsg) ||
                '홈페이지를 더 좋은 모습으로 단장하고 있어요. 곧 새로운 모습으로 찾아올게요!';

            if (banner) {
                if (isMaint) {
                    banner.innerHTML = `<span class="maint-dot"></span><span>${msg}</span>`;
                    banner.classList.add('show');
                } else {
                    banner.classList.remove('show');
                }
            }

            const dismissed = sessionStorage.getItem('maintDismissed') === '1';
            if (isMaint && !dismissed) {
                overlay.querySelector('#maint-text').textContent = msg;
                overlay.classList.add('show');
            } else {
                overlay.classList.remove('show');
            }
        });
    }).catch(e => {
        console.warn('점검 배너 연결 실패 (페이지 나머지 기능엔 영향 없음):', e);
    });
})();
