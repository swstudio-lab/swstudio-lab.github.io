// 오늘의 방문자 수 — Firestore(siteStats)로 직접 집계, footer가 있는 페이지에만 배지를 표시
(function () {
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyB0LRiIpNwdcCkS4Y5Dz4pP9zcLoadO2Xk",
        authDomain: "taskflow-7cb3b.firebaseapp.com",
        projectId: "taskflow-7cb3b",
        storageBucket: "taskflow-7cb3b.firebasestorage.app",
        messagingSenderId: "811223035419",
        appId: "1:811223035419:web:08b972916827147bc2d2be"
    };

    function todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function injectBadgeDom() {
        const footer = document.querySelector('footer');
        if (!footer) return null;
        const badge = document.createElement('div');
        badge.id = 'visitor-badge';
        badge.style.cssText = 'margin-top:10px; font-size:11px; color:var(--muted); opacity:0.8;';
        badge.textContent = '오늘의 방문자를 세는 중...';
        footer.appendChild(badge);
        return badge;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src; s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function ensureFirebase() {
        if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
            return Promise.resolve();
        }
        if (window.firebase && typeof window.firebase.initializeApp === 'function') {
            window.firebase.initializeApp(FIREBASE_CONFIG);
            return Promise.resolve();
        }
        return loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
            .then(() => loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'))
            .then(() => { window.firebase.initializeApp(FIREBASE_CONFIG); });
    }

    const badge = injectBadgeDom();

    ensureFirebase().then(() => {
        const db = window.firebase.firestore();
        const dateKey = todayStr();
        const ref = db.collection('siteStats').doc(dateKey);
        const flagKey = 'visited_' + dateKey;

        // 카운트는 공개 여부와 상관없이 항상 집계함
        if (!localStorage.getItem(flagKey)) {
            ref.set({ visits: firebase.firestore.FieldValue.increment(1) }, { merge: true })
                .then(() => { try { localStorage.setItem(flagKey, '1'); } catch (e) {} })
                .catch(() => {});
        }

        if (!badge) return;

        let isPublic = true; // 설정을 아직 못 받아왔을 땐 기본으로 공개 취급 (깜빡임 방지)
        let latestCount = 0;

        function renderBadge(){
            if (!isPublic) { badge.style.display = 'none'; return; }
            badge.style.display = '';
            badge.textContent = `오늘의 방문자 ${latestCount.toLocaleString()}명`;
        }

        db.collection('siteConfig').doc('main').onSnapshot(doc => {
            isPublic = !doc.exists || doc.data().showVisitorCount !== false;
            renderBadge();
        }, () => {});

        ref.onSnapshot(doc => {
            latestCount = doc.exists ? (doc.data().visits || 0) : 0;
            renderBadge();
        }, () => { badge.style.display = 'none'; });
    }).catch(() => {
        if (badge) badge.style.display = 'none';
    });
})();
