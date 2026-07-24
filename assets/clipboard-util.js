/*
  클립보드 복사 공용 함수.
  최신 clipboard API가 안 되는 환경(권한 문제, 오래된 브라우저 등)이면
  옛날 방식(execCommand)으로 한 번 더 시도해요.
  둘 다 실패하면 false를 돌려주니, 호출하는 쪽에서 prompt() 등으로 안내해주면 돼요.

  사용법: const ok = await copyTextToClipboard('복사할 텍스트');
*/
async function copyTextToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    try{
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }catch(e2){
      return false;
    }
  }
}
window.copyTextToClipboard = copyTextToClipboard;
