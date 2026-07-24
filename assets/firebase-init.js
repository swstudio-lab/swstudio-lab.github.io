/*
  사이트 전체가 공유하는 Firebase 프로젝트 연결 설정.
  이 프로젝트의 설정값을 바꿔야 할 일이 생기면 이 파일 하나만 고치면 돼요
  (예전엔 페이지마다 이 설정을 각자 복붙해서 14곳을 따로 고쳐야 했어요).

  이 스크립트는 firebase-app-compat.js / firebase-firestore-compat.js 를
  먼저 불러온 뒤, 그 다음 줄에서 불러와야 해요.

  실패해도(광고 차단기, 오프라인 등) 페이지의 나머지 기능은 계속 작동하도록
  try/catch로 감싸뒀고, 실패 시 window.db 는 null로 남아있어요.
  db를 쓰는 코드는 사용 전에 `if(!db) return;` 같은 방어 코드를 넣어주는 게 안전해요.
*/
window.db = null;
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
}catch(e){
  console.warn('Firebase 연결 실패 — 이 페이지의 저장/실시간 기능이 비활성화돼요:', e);
}
