/*
  사이트 전체가 공유하는 Firebase 프로젝트 연결 설정.
  이 프로젝트의 설정값을 바꿔야 할 일이 생기면 이 파일 하나만 고치면 돼요
  (예전엔 페이지마다 이 설정을 각자 복붙해서 14곳을 따로 고쳐야 했어요).

  이 스크립트는 firebase-app-compat.js / firebase-firestore-compat.js 를
  먼저 불러온 뒤, 그 다음 줄에서 불러와야 해요.

  실패해도(광고 차단기, 오프라인 등) 페이지의 나머지 기능은 계속 작동하도록
  try/catch로 감싸뒀고, 실패 시 window.db 는 null로 남아있어요.
  db를 쓰는 코드는 사용 전에 `if(!db) return;` 같은 방어 코드를 넣어주는 게 안전해요.

  ---- 익명 인증 (window.authReady) ----
  taskflowTeams/racingRooms/balanceVotes/siteStats/dashboardRooms/bombRooms 컬렉션의
  Firestore 쓰기 규칙을 "누구나(if true)"에서 "로그인된(익명 포함) 사용자만
  (if request.auth != null)"로 바꿀 예정이라, 여기서 미리 익명 로그인을 해둔다.
  firebase-auth-compat.js는 페이지마다 따로 <script> 태그를 추가하지 않고 여기서
  동적으로 불러온다 — 이 파일 하나만 고치면 전체 사이트에 적용됨.

  각 페이지에서 저 6개 컬렉션에 처음 쓰기 전에는 반드시
    await window.authReady;
  를 먼저 실행해야 한다 (타이밍이 꼬여서 인증 전에 쓰기가 나가면 규칙에 막힘).
  window.authReady는 성공/실패 상관없이 항상 resolve되므로(끝나기 전에 페이지가
  멈추는 일은 없음), 실패 시엔 그 이후 쓰기 요청이 규칙에 막혀 에러로 처리될 뿐이다.
*/
window.db = null;
window.authReady = Promise.resolve(null);
try{
  const firebaseConfig = {
    apiKey: "AIzaSyB0LRiIpNwdcCkS4Y5Dz4pP9zcLoadO2Xk",
    authDomain: "taskflow-7cb3b.firebaseapp.com",
    projectId: "taskflow-7cb3b",
    storageBucket: "taskflow-7cb3b.firebasestorage.app",
    messagingSenderId: "811223035419",
    appId: "1:811223035419:web:08b972916827147bc2d2be"
  };
  if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();

  window.authReady = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js';
    script.onload = () => {
      try{
        firebase.auth().onAuthStateChanged((user) => {
          if (user) { resolve(user); return; }
          firebase.auth().signInAnonymously().catch((e) => {
            console.warn('Firebase 익명 인증 실패 — 일부 쓰기 기능이 제한될 수 있어요:', e);
            resolve(null);
          });
          // 성공하면 onAuthStateChanged가 user와 함께 다시 호출되어 위에서 resolve됨
        });
      }catch(e){
        console.warn('Firebase 익명 인증 초기화 실패:', e);
        resolve(null);
      }
    };
    script.onerror = () => {
      console.warn('Firebase Auth SDK 로드 실패 — 익명 인증 없이 진행돼요.');
      resolve(null);
    };
    document.head.appendChild(script);
  });
}catch(e){
  console.warn('Firebase 연결 실패 — 이 페이지의 저장/실시간 기능이 비활성화돼요:', e);
}
