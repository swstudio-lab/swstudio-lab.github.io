// GA4 로더 — 모든 페이지 공통
// 사용법: 다른 스크립트에서 window.gaEvent('이벤트이름', {상세정보}) 호출하면 GA4로 전송됨
(function () {
    const id = window.GA4_MEASUREMENT_ID;

    // 측정 ID가 아직 실제 값으로 안 바뀌었으면 조용히 무시 (사이트는 정상 작동)
    if (!id || id.indexOf('XXXX') !== -1) {
        window.gaEvent = function () {};
        return;
    }

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id);

    // 다른 스크립트에서 안전하게 이벤트를 보낼 수 있는 함수
    window.gaEvent = function (name, params) {
        try { gtag('event', name, params || {}); } catch (e) {}
    };
})();
