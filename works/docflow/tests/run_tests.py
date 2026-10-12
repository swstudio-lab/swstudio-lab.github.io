"""DocFlow 회귀 테스트

실행:  python works/docflow/tests/run_tests.py            (전체)
       python works/docflow/tests/run_tests.py synthetic  (합성 이미지 테스트만)
       python works/docflow/tests/run_tests.py photo      (실제 사진 테스트만)
       python works/docflow/tests/run_tests.py ocr        (글자 추출 정확도 비교만 — 몇 분 걸림)
       python works/docflow/tests/run_tests.py serve      (실제 서버 환경에서 업로드→OCR 끝까지만)
       python works/docflow/tests/run_tests.py leak       (비공개 값 유출 검사만 — 몇 초, 어느 테스트를 돌려도 맨 먼저 함)
       python works/docflow/tests/run_tests.py redact     (정보 가리기 — 가상 문서 자동 검출·가린 저장본, redact-make는 가상 문서를 다시 그림)
준비:  pip install playwright  →  python -m playwright install chromium

· 합성 이미지 테스트: 사진 없이 브라우저에서 직접 그린 이미지로 검사 — 항상 실행
· 실제 사진 테스트: tests/private/ 에 사진이 있을 때만 실행 (없으면 SKIP)
  결과 이미지는 tests/private/results/<시각>/ 에 저장 — 문서 내용이 담겨 있어 private 안에 둠(.gitignore)
  자동 판정은 기본 수치(오류 없음·선분 수 등)만 하고, 글자 보존 같은 화질은 저장된 이미지를 눈으로 확인
· 글자 추출 정확도: private/ 의 시연용 PDF와 정답 텍스트로 테스트 이미지(깨끗한 것·사진처럼 합성한 것)를 만들어
  "원본 그대로" vs "글자 추출 카드 처리 후"를 글자 단위로 비교. 결과는 private/results/<시각>/ocr/
  (판정 기준: 글자 추출 카드 처리 후 정확도가 원본 그대로보다 낮아지지 않을 것)

페이지는 실제 사이트와 같은 경로 구조로 띄움: http://docflow.test/works/docflow/index.html, /assets/... = 저장소 루트
"""
import base64, functools, http.server, json, pathlib, re, subprocess, sys, threading, time, urllib.parse
from playwright.sync_api import sync_playwright

TESTS = pathlib.Path(__file__).resolve().parent
DOCFLOW = TESTS.parent
REPO = DOCFLOW.parent.parent
PRIVATE = TESTS / 'private'
BASE = 'http://docflow.test'
PAGE = BASE + '/works/docflow/index.html'
PRIVATE_URL = '/works/docflow/tests/private/'   # 페이지 안에서 private 파일을 불러올 때의 경로

# 페이지에 한 번 넣어두는 공용 도우미
HELPERS = r"""
window.T = {
  copy(c){ const t=document.createElement('canvas'); t.width=c.width; t.height=c.height; t.getContext('2d').drawImage(c,0,0); return t; },
  lum(c){ const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data, a=new Float32Array(c.width*c.height);
          for(let p=0;p<a.length;p++) a[p]=0.299*d[p*4]+0.587*d[p*4+1]+0.114*d[p*4+2]; return a; },
  png(c, max){ const f=Math.min(1,(max||100000)/Math.max(c.width,c.height)); const t=document.createElement('canvas');
          t.width=Math.round(c.width*f); t.height=Math.round(c.height*f); t.getContext('2d').drawImage(c,0,0,t.width,t.height); return t.toDataURL('image/png'); },
  // 사진 불러오기 — 실제 업로드와 같은 경로(loadFile)로
  async load(url, name){
    const blob = await (await fetch(url)).blob();
    loadFile(new File([blob], name, {type: blob.type || 'image/jpeg'}));
    for(let i=0;i<600 && !document.getElementById('fileBadge').textContent.includes(name); i++) await new Promise(r=>setTimeout(r,50));
    await new Promise(r=>setTimeout(r,300));
  },
  // 처리하기 버튼과 같은 경로로 실행
  async process(checks, opts){
    opts = opts || {};
    if(opts.scanMode) scanMode = opts.scanMode;
    checked = new Set(checks); renderSections(); resultCanvas = null;
    const t0 = performance.now();
    document.getElementById('processBtn').click();
    await new Promise(r=>setTimeout(r,50));
    for(let i=0;i<3000 && document.getElementById('spinnerLine').classList.contains('show'); i++) await new Promise(r=>setTimeout(r,100));
    const wb = document.getElementById('warningBox');
    return { canvas: resultCanvas, ms: performance.now()-t0, warning: wb.classList.contains('show') ? wb.textContent : null };
  },
  // 종이(회색 가능) 위에 그림을 그리고 deg만큼 돌린 캔버스 — 같은 변환으로 여러 장(전체/글자만/선만)을 만들 때 씀
  paper(W, H, paperLum, deg, draw){
    const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
    x.fillStyle=`rgb(${paperLum},${paperLum},${paperLum})`; x.fillRect(0,0,W,H);
    x.translate(W/2,H/2); x.rotate(deg*Math.PI/180); x.translate(-W/2,-H/2); draw(x); return c;
  },
  // 사진처럼: 비스듬한 각도(원근) + 책상 배경 + 누런 조명 + 손 그림자 + 어둡고 잡티 + 카톡 압축(긴 변 1400px, JPEG)
  synthPhoto(src, seed){
    let s = seed*9973+7; const rnd = ()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    const W = 1500, H = 2000, sw = src.width, sh = src.height;
    const sd = src.getContext('2d').getImageData(0,0,sw,sh).data;
    const quad = [{x:190,y:170},{x:1330,y:250},{x:1405,y:1860},{x:110,y:1790}];   // 종이 네 모서리(사진 속)
    const Hm = computeHomography(quad, [{x:0,y:0},{x:sw,y:0},{x:sw,y:sh},{x:0,y:sh}]); // 사진 좌표 → 원본 좌표
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'), im = ctx.createImageData(W,H), d = im.data;
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const den = Hm[6]*x + Hm[7]*y + 1, u = (Hm[0]*x + Hm[1]*y + Hm[2])/den, v = (Hm[3]*x + Hm[4]*y + Hm[5])/den;
      let r, g, b;
      if(u >= 0 && v >= 0 && u < sw-1 && v < sh-1){
        const x0=u|0, y0=v|0, tx=u-x0, ty=v-y0, i00=(y0*sw+x0)*4, i10=i00+4, i01=i00+sw*4, i11=i01+4;
        const bl = k=> sd[i00+k]*(1-tx)*(1-ty) + sd[i10+k]*tx*(1-ty) + sd[i01+k]*(1-tx)*ty + sd[i11+k]*tx*ty;
        r = bl(0); g = bl(1); b = bl(2);
      } else { const t = 150 + 12*Math.sin(y/9 + Math.sin(x/40)*2); r = t+18; g = t+6; b = t-12; } // 나뭇결 책상
      // 누런 조명: 왼쪽 위는 따뜻하고 밝게, 오른쪽 아래로 갈수록 어둡게
      const lt = 0.95 - 0.28*((x/W)*0.6 + (y/H)*0.4);
      r *= lt*1.0; g *= lt*0.92; b *= lt*0.72;
      // 손 그림자: 오른쪽 아래에서 들어온 흐린 덩어리
      const dx = (x-1150)/420, dy = (y-1500)/300, dd = Math.sqrt(dx*dx+dy*dy);
      const sh2 = dd < 1 ? 0.55 : dd < 1.6 ? 0.55 + 0.45*((dd-1)/0.6) : 1;
      r *= sh2; g *= sh2; b *= sh2;
      const nz = (rnd()+rnd()+rnd()-1.5)*14;   // 어두운 곳에서 찍은 잡티
      const i = (y*W+x)*4; d[i]=r+nz; d[i+1]=g+nz; d[i+2]=b+nz; d[i+3]=255;
    }
    ctx.putImageData(im,0,0);
    // 살짝 흐리게(초점) + 카톡처럼 긴 변 1400px로 줄이고 JPEG 압축
    const k = document.createElement('canvas'); k.width = Math.round(W*0.7); k.height = Math.round(H*0.7);
    const kx = k.getContext('2d'); kx.filter = 'blur(0.6px)'; kx.drawImage(c, 0, 0, k.width, k.height);
    return k.toDataURL('image/jpeg', 0.72);
  },
  noise(c, amp, seed){ // 사진 같은 잔잡음(재현 가능하게 고정 시드)
    let s=seed||1; const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    const ctx=c.getContext('2d'), im=ctx.getImageData(0,0,c.width,c.height), d=im.data;
    for(let i=0;i<d.length;i+=4){ const n=(rnd()-0.5)*2*amp; d[i]+=n; d[i+1]+=n; d[i+2]+=n; }
    ctx.putImageData(im,0,0); return c;
  },
};
"""

# ---------------- 합성 이미지 테스트 ----------------
# 각 테스트: 페이지에서 실행할 JS(async 함수 본문). { ok, info, images:{이름: dataURL} } 를 돌려줌
SYNTHETIC = {

'표 선 제거 — 회색 종이 + 4° 기울어진 표 (원근 보정 없이)': r"""
  // 사진 01 상황 재현: 종이 밝기 190(고정 기준 200보다 어두움), 표 전체가 4° 기울어짐
  const W=1400, H=1000, PAPER=190, deg=4;
  const cols=[150,300,500,700,900,1100,1250], rows=[]; for(let y=180;y<=820;y+=40) rows.push(y);
  const drawLines = x=>{ x.strokeStyle='rgb(60,60,60)'; x.lineWidth=2;
    for(const y of rows){ x.beginPath(); x.moveTo(cols[0],y); x.lineTo(cols[cols.length-1],y); x.stroke(); }
    for(const cx of cols){ x.beginPath(); x.moveTo(cx,rows[0]); x.lineTo(cx,rows[rows.length-1]); x.stroke(); } };
  const drawText = x=>{ x.fillStyle='rgb(35,35,35)'; x.font='bold 18px sans-serif'; x.textBaseline='middle';
    for(let r=0;r<rows.length-1;r++) for(let k=0;k<cols.length-1;k++)
      x.fillText(k===0 ? String(r+1) : (k===1 ? '가상협력홍보과' : ((r*7+k*3)%9+1)+'60,000'), cols[k]+12, (rows[r]+rows[r+1])/2); };
  const full = T.noise(T.paper(W,H,PAPER,deg,x=>{ drawLines(x); drawText(x); }), 4, 7);
  const textOnly = T.paper(W,H,PAPER,deg,drawText), linesOnly = T.paper(W,H,PAPER,deg,drawLines);
  const out = T.copy(full); removeTableLines(out);
  const Lr=T.lum(out), Lt=T.lum(textOnly), Ll=T.lum(linesOnly);
  // 글자 픽셀 근처(2px)는 선 판정에서 뺌
  const near = new Uint8Array(W*H);
  for(let y=2;y<H-2;y++) for(let x=2;x<W-2;x++) if(Lt[y*W+x]<120) for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) near[(y+dy)*W+x+dx]=1;
  let tN=0,tK=0,lN=0,lK=0,fS=0;
  for(let p=0;p<W*H;p++){
    if(Lt[p]<120){ tN++; if(Lr[p]<150) tK++; }
    else if(Ll[p]<120 && !near[p]){ lN++; if(Lr[p]<150) lK++; fS+=Lr[p]; }
  }
  const textKept=tK/tN, linesLeft=lK/lN, fillMean=fS/lN;
  return { ok: textKept>=0.95 && linesLeft<=0.05 && Math.abs(fillMean-PAPER)<=15,
    info: `글자 보존 ${(textKept*100).toFixed(1)}% (기준 95%↑) · 남은 선 ${(linesLeft*100).toFixed(1)}% (기준 5%↓) · 지운 자리 밝기 ${fillMean.toFixed(0)} (종이 ${PAPER}±15)`,
    images: { before: T.png(full,900), after: T.png(out,900) } };
""",

'표 선 제거 — 색칠된 칸(회색 머리글·파란 띠·노란 칸)은 그대로': r"""
  const W=1200, H=700;
  const cols=[100,350,600,850,1100], rows=[150,200,250,300,350,400,450];
  const draw = x=>{
    x.fillStyle='rgb(200,200,200)'; x.fillRect(cols[0],rows[1],cols[4]-cols[0],rows[2]-rows[1]);   // 연한 회색 머리글
    x.fillStyle='rgb(70,110,190)';  x.fillRect(cols[0],rows[0],cols[4]-cols[0],rows[1]-rows[0]);   // 진한 파란 띠
    x.fillStyle='rgb(250,235,60)';  x.fillRect(cols[3],rows[2],cols[4]-cols[3],rows[6]-rows[2]);   // 노란 칸
    x.strokeStyle='rgb(50,50,50)'; x.lineWidth=2;
    for(const y of rows){ x.beginPath(); x.moveTo(cols[0],y); x.lineTo(cols[4],y); x.stroke(); }
    for(const cx of cols){ x.beginPath(); x.moveTo(cx,rows[0]); x.lineTo(cx,rows[6]); x.stroke(); } };
  const src = T.noise(T.paper(W,H,235,0,draw), 3, 3), out = T.copy(src); removeTableLines(out);
  const a=src.getContext('2d').getImageData(0,0,W,H).data, b=out.getContext('2d').getImageData(0,0,W,H).data;
  // 칸 안쪽(가로·세로 선에서 8px 떨어진 곳)의 색이 그대로인지 — 칸 사이 선을 지운 자리는 빼고 봄
  const region = (x0,y0,x1,y1)=>{ let n=0, diff=0; for(let y=y0+8;y<y1-8;y++) for(let x=x0+8;x<x1-8;x++){ if(cols.some(c=>Math.abs(c-x)<8) || rows.some(r=>Math.abs(r-y)<8)) continue; const i=(y*W+x)*4; diff+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]); n++; } return diff/n/3; };
  const gray=region(cols[0],rows[1],cols[4],rows[2]), blue=region(cols[0],rows[0],cols[4],rows[1]), yellow=region(cols[3],rows[2],cols[4],rows[6]);
  return { ok: gray<3 && blue<3 && yellow<3,
    info: `칸 안쪽 평균 변화 — 회색 ${gray.toFixed(2)} · 파란 ${blue.toFixed(2)} · 노란 ${yellow.toFixed(2)} (기준 각 3 미만)`,
    images: { before: T.png(src,900), after: T.png(out,900) } };
""",

'원근 보정 — 테두리 없는 스캔본: 반듯하면 그대로, 비뚤면 기울기만 바로잡음': r"""
  const W=1600, H=1150;
  const doc = deg=> T.paper(W,H,255,deg,x=>{ x.fillStyle='rgb(30,30,30)'; x.font='22px sans-serif';
    for(let i=0;i<22;i++) x.fillText('국립대학육성사업 성과평가보고서 제출서 — 세부 집행기준 항목 '+(i+1)+'번 내용 확인', 140, 140+i*40); });
  const res = [];
  for(const deg of [0, 3, -2]){
    const r = autoCropDocument(doc(deg));
    const c = r instanceof HTMLCanvasElement ? r : r.canvas, warn = r instanceof HTMLCanvasElement ? null : r.warning;
    const est = estimateSkew(c, 10);
    res.push({ deg, after: est.angle, warn, size: c.width+'x'+c.height });
  }
  const [s0, s3, sm2] = res;
  const ok = s0.size===W+'x'+H && !s0.warn && Math.abs(s3.after)<0.5 && Math.abs(sm2.after)<0.5
    && [s3, sm2].every(s=> !s.warn || s.warn.includes('바로잡았어요'));
  return { ok, info: res.map(s=>`${s.deg}° → ${s.after.toFixed(1)}° ${s.size} 안내=${s.warn||'없음'}`).join(' / ') };
""",

'글자 추출 후처리 — 주소의 빠진 점·₩·혼자 떨어진 기호': r"""
  // 실제 OCR 결과에서 나온 모양을 가상 주소로 바꾼 예시 [OCR 결과, 기대 결과]
  const cases = [
    ['문의 메일: help@docflowkr (평일 09:00~18:00)', '문의 메일: help@docflow.kr (평일 09:00~18:00)'],
    ['담당자 이메일. kim gana@ganaunivac kr', '담당자 이메일. kim gana@ganauniv.ac.kr'],
    ['사업단 누리집: httpsrise ganaunivac kr/notice', '사업단 누리집: https://rise.ganauniv.ac.kr/notice'],
    ['보고서 원문은 wwwganaunivackr/rise/report 에서', '보고서 원문은 www.ganauniv.ac.kr/rise/report 에서'],
    ['누리집 http://www .ganauniv.ac.kr', '누리집 http://www.ganauniv.ac.kr'],
    ['누리집 httpi//www.ganauniv.ac.kr', '누리집 http://www.ganauniv.ac.kr'],
    ['전자우편 | kim@mail.ganauniv.ackr |   -', '전자우편  kim@mail.ganauniv.ac.kr    -'],
    ['문의: abc@navercom, 누리집 www.example.net 참고', '문의: abc@naver.com, 누리집 www.example.net 참고'],
    ['kim@mail.ganauniv.ac.kr Seoul 지역', 'kim@mail.ganauniv.ac.kr Seoul 지역'],     // 주소 뒤 일반 단어는 안 붙임
    ['14 、_ 가상정보화과   2,345,000', '14  가상정보화과   2,345,000'],
    ['。 16 __ 가상기록관   135,000', '16  가상기록관   135,000'],
    ['1. 사업 개요는 다음과 같습니다. 끝.', '1. 사업 개요는 다음과 같습니다. 끝.'],      // 붙어 있는 문장 부호는 그대로
    ['일금 삼백이십오만원정 (' + String.fromCharCode(92) + '3,250,000)', '일금 삼백이십오만원정 (₩3,250,000)'],   // 역슬래시+숫자
    ['총액 한도 - 09:00 ~ 18:00 교육·연구 주 소 : 서울', '총액 한도 - 09:00 ~ 18:00 교육·연구 주 소 : 서울'],
  ];
  const bad = cases.map(([a, want])=> [a, cleanOcrLine(a, []), want]).filter(([a, got, want])=> got !== want);
  return { ok: !bad.length, info: bad.length ? bad.map(([a, got, want])=> `"${a}" → "${got}" (기대 "${want}")`).join(' / ') : `${cases.length}개 예시 모두 기대대로` };
""",
'정보 가리기 — 가림 상자는 항목마다 네모 하나, 표 칸 밖으로 안 넘침': r"""
  // 사진 05 상황: 표 칸 안 이름을 엔진이 글자마다 단어로 나누고, 가운데 글자 상자만 위 칸 선을 넘게 큼.
  // 이메일 단어 상자는 오른쪽 칸 선을 넘음. 글자 추출 없이 단어 위치를 직접 만들어 검사
  const W = 900, H = 400, rows = [100, 200, 300], cols = [100, 400, 800];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#222';
  for(const y of rows) x.fillRect(cols[0], y - 1, cols[2] - cols[0], 3);
  for(const cx of cols) x.fillRect(cx - 1, rows[0], 3, rows[2] - rows[0]);
  const lines = tableLineSegs(findTableLines(c));
  const word = (t, x0, y0, x1, y1, line)=> ({ text: t, conf: 90, bbox: { x0, y0, x1, y1 }, line, chars: [{ t, bbox: { x0, y0, x1, y1 } }] });
  const ocr = { words: [
    word('주', 220, 135, 245, 162, 0), word('경', 245, 92, 270, 175, 0), word('필', 270, 135, 295, 161, 0),  // 가운데만 위 칸 선(100) 넘음
    word('gdhong@mail.ganauniv.ac', 450, 230, 790, 270, 1), word('kr', 795, 232, 830, 268, 1),               // 뒷조각이 오른쪽 선(800) 넘음
  ], lines: [{ text: '홍길동', bbox: {} }, { text: 'gdhong@mail.ganauniv.ac.kr', bbox: {} }] };
  const items = [{ id: 'n', kind: 'name', words: [0, 1, 2], partial: [] }, { id: 'e', kind: 'email', words: [3, 4], partial: [] }];
  const crossing = rs=> rs.filter(b=> lines.h.some(s=> Math.min(s.x1, s.x2) < b.x1 - 3 && Math.max(s.x1, s.x2) > b.x0 + 3 && s.y1 > b.y0 + 1 && s.y1 < b.y1 - 1)
                               || lines.v.some(s=> Math.min(s.y1, s.y2) < b.y1 - 3 && Math.max(s.y1, s.y2) > b.y0 + 3 && s.x1 > b.x0 + 1 && s.x1 < b.x1 - 1)).length;
  const noClip = redactionShapes(ocr, { mode: 'full', items, lines: null }).rects;
  const clip = redactionShapes(ocr, { mode: 'full', items, lines }).rects;
  const fail = [];
  if(!lines || lines.h.length < 3 || lines.v.length < 3) fail.push('표 선을 못 찾음');
  if(crossing(noClip) === 0) fail.push('검사가 넘친 상자를 못 잡음(칸 자르기 없이도 0)');
  if(crossing(clip) !== 0) fail.push(`칸 밖으로 넘친 상자 ${crossing(clip)}개`);
  if(clip.filter(b=> b.id === 'n').length !== 1 || clip.filter(b=> b.id === 'e').length !== 1) fail.push('항목마다 네모 하나가 아님');
  const n = clip.find(b=> b.id === 'n'), e = clip.find(b=> b.id === 'e');
  if(n && !(n.y0 >= 132 && n.y0 <= 135 && n.y1 >= 162 && n.y1 <= 165)) fail.push(`이름 상자 높이가 정상 글자 기준이 아님 (${n.y0}~${n.y1})`);
  if(e && !(e.x1 < 800 && e.x0 <= 447)) fail.push(`이메일 상자가 칸 경계에서 안 잘림 (${e.x0}~${e.x1})`);
  return { ok: !fail.length, info: fail.join(' / ') || `칸 자르기 없으면 넘침 ${crossing(noClip)}개 → 자르면 0개, 항목마다 네모 하나 (이름 ${Math.round(n.y0)}~${Math.round(n.y1)}, 이메일 오른쪽 끝 ${Math.round(e.x1)} < 칸 선 800)` };
""",

'프리셋 — 처리 항목 7개로 정리한 뒤에도 프리셋마다 실행 단계가 이전과 같음': r'''
  // 기준: 정리 전(2026-10-12) 프리셋이 실제로 실행하던 단계(처리 순서대로)
  const BEFORE = {
    '문서 스캔':       ['autoCrop','scanEffect','denoise'],
    '글자 추출 (OCR)': ['autoCrop','scanEffect','denoise','removeLines','trimMargin','ocrText'],
    '정보 가리기':     ['autoCrop','scanEffect','denoise','ocrText','redact'],
    '서명 추출':       ['signatureExtract','denoise','contrast'],
    '도장 추출':       ['denoise','trimMargin','sharpen','stampExtract'],
  };
  const REMOVED = ['배경 제거','흑백 변환','명암 보정','선명도 향상','기울기 자동 보정','노이즈 제거','여백 자동 제거','명암','흑백'];
  const card = n=>[...document.querySelectorAll('.preset-card')].find(el=>el.querySelector('.preset-name').textContent===n);
  const fail = [];
  const rows = [...document.querySelectorAll('.check-row .check-name')].map(e=> e.textContent);
  if(rows.length !== 7) fail.push(`처리 항목 ${rows.length}개 (기대 7)`);
  const groups = [...document.getElementById('sectionsWrap').children].map(g=> g.firstElementChild.textContent);
  if(groups.join('/') !== '문서 정리/추출') fail.push('묶음: ' + groups.join('/'));
  for(const r of REMOVED) if(document.getElementById('sectionsWrap').textContent.includes(r)) fail.push('화면에 남은 이름: ' + r);
  for(const [name, steps] of Object.entries(BEFORE)){
    card(name).click();
    const now = snapshotPageSettings().checks;
    if(now.join(',') !== steps.join(',')) fail.push(`${name}: ${now.join(',')} (이전 ${steps.join(',')})`);
    // 진행 문구에 화면에서 뺀 항목 이름이 나오지 않음
    for(const k of now){ const t = stepLabel(k, now); if(REMOVED.some(r=> t.includes(r))) fail.push(`${name} 진행 문구: ${t}`); }
  }
  // 직접 고르기(세부 설정에서 항목을 직접 바꿈): 스캔 효과만 켜면 잡티 제거가 함께, 정보 가리기를 켜면 글자 추출을 끌 수 없음
  selectedPreset = null; checked = new Set(['scanEffect']); presetExtras = new Set(); renderSections(); renderPresets();
  if(snapshotPageSettings().checks.join(',') !== 'scanEffect,denoise') fail.push('스캔 효과에 잡티 제거가 안 포함됨');
  checked.add('redact'); renderSections();
  const ocrRow = [...document.querySelectorAll('.check-row')].find(r=> r.querySelector('.check-name').textContent === '글자 추출 (OCR)');
  ocrRow.click(); if(!checked.has('ocrText')) fail.push('정보 가리기를 켰는데 글자 추출을 끌 수 있음');
  return { ok: !fail.length, info: fail.join(' / ') || `항목 7개·묶음 2개, 프리셋 ${Object.keys(BEFORE).length}개 실행 단계 이전과 같음, 진행 문구에 뺀 항목 이름 없음` };
''',

'화면 구성 — 탭 3개, 카드 5개(자주 쓰는 순)·한 줄 설명, 세부 설정 접기, 옛 이름 없음': r'''
  const fail = [];
  const tabs = [...document.querySelectorAll('.mode-btn')].map(b=> b.textContent);
  if(tabs.join('/') !== '문서 처리/표 → 엑셀/도장·서명 만들기') fail.push('탭: ' + tabs.join('/'));
  // 처음엔 카드 없이 시작 — 세부 설정은 접혀 있고, 처리하기 아래에 할 일을 고르라는 안내
  if(document.querySelector('.preset-card.selected')) fail.push('처음부터 골라진 카드가 있음');
  if(document.getElementById('settingsFold').open) fail.push('세부 설정이 처음부터 펼쳐져 있음');
  if(document.getElementById('processHint').textContent !== '위에서 할 일을 골라주세요') fail.push('처음 안내: ' + document.getElementById('processHint').textContent);
  const cards = [...document.querySelectorAll('.preset-card')].map(el=> el.querySelector('.preset-name').textContent + ':' + el.querySelector('.preset-tag').textContent);
  const WANT = ['문서 스캔:찍은 문서 → 깔끔한 스캔본', '글자 추출 (OCR):문서 사진 → 복사할 수 있는 글자', '정보 가리기:가릴 정보를 골라 검게 가린 사본',
    '서명 추출:종이 위 서명 → 배경 없는 이미지', '도장 추출:찍힌 도장 → 배경 없는 이미지'];
  if(cards.join('|') !== WANT.join('|')) fail.push('카드: ' + cards.join('|'));
  // 카드를 고르면 접힌 줄에 켜진 항목이 보이고, 항목을 직접 바꾸면 "(직접 바꿈)"
  const sum = ()=> document.getElementById('settingsSummary').textContent;
  [...document.querySelectorAll('.preset-card')][1].click();
  if(sum() !== '— 반듯하게 펴기 · 스캔 효과(흑백) · 표 선 제거 · 글자 추출') fail.push('글자 추출 카드 접힌 줄: ' + sum());
  if(document.getElementById('processHint').textContent !== '이미지를 올려주세요') fail.push('카드 고른 뒤 안내: ' + document.getElementById('processHint').textContent);
  [...document.querySelectorAll('.check-row')].find(r=> r.querySelector('.check-name').textContent === '표 선 제거').click();
  if(!/\(직접 바꿈\)$/.test(sum()) || document.querySelector('.preset-card.selected')) fail.push('직접 바꾼 뒤 접힌 줄: ' + sum());
  // 표 → 엑셀 탭: 준비 중 화면
  const tabBtn = m=> document.querySelector(`.mode-btn[data-mode="${m}"]`);
  tabBtn('table').click();
  const tm = document.getElementById('tableMode');
  if(tm.style.display === 'none' || !tm.textContent.includes('준비 중') || document.getElementById('extractMode').style.display !== 'none') fail.push('표 → 엑셀 탭이 안 열림');
  tabBtn('extract').click();
  if(document.getElementById('extractMode').style.display === 'none') fail.push('문서 처리 탭으로 못 돌아옴');
  // 옛 이름이 화면(보이는 글자·탭 제목)에 남지 않음
  const OLD = ['OCR 최적화','문서 보관','직접 선택하기','자동 체크','도장 추출하기','서명 추출하기','이미지 업로드해서 처리하기','이름 입력해서 만들기','글자 읽기','문서 자동 크롭','처리할 항목 선택','자동 크롭 없이'];
  const html = document.documentElement.outerHTML;
  for(const o of OLD) if(html.includes(o)) fail.push('남은 옛 이름: ' + o);
  return { ok: !fail.length, info: fail.join(' / ') || '탭 3개, 카드 5개·설명, 처음엔 카드 없음·세부 설정 접힘·안내, 접힌 줄 요약·직접 바꿈, 준비 중 화면, 옛 이름 없음' };
''',
}

# ---------------- 실제 사진 테스트 ----------------
# (사진 파일, 처리 항목, 옵션, 검사) — 검사는 결과 dict를 받아 (ok, 설명)을 돌려줌
OCR = ['autoCrop', 'scanEffect', 'trimMargin', 'denoise', 'removeLines']
def segs_between(lo, hi):
    return lambda r: (lo <= r['segV'] <= hi, f"세로 선분 {r['segV']}개 (기대 {lo}~{hi})")
def no_error(r):
    return (True, '오류 없음')
PHOTO = [
    ('photo01.jpg',          ['removeLines'],               {}, segs_between(10, 12)),
    ('photo01.jpg',          ['autoCrop', 'removeLines'],   {}, segs_between(10, 12)),
    ('photo01.jpg',          OCR,                           {'scanMode': 'bw'}, no_error),
    ('photo01_original.jpg', ['removeLines'],               {}, no_error),
    ('photo01_original.jpg', ['autoCrop', 'scanEffect', 'denoise', 'removeLines'], {'scanMode': 'color'}, segs_between(10, 12)),
    ('photo02.jpg',          ['autoCrop', 'removeLines'],   {}, no_error),
    ('photo03.jpg',          ['removeLines'],               {}, no_error),
    ('photo04.jpg',          ['removeLines'],               {}, no_error),
    ('photo05.jpg',          ['autoCrop', 'scanEffect'],    {'scanMode': 'bw'}, no_error),
]
PHOTO_JS = r"""
  const [file, checks, opts] = ARGS;
  await T.load('/works/docflow/tests/private/'+file, file);
  // 표 선 제거가 있으면 그 단계의 선분 수를 기록
  let segV = -1, segH = -1; const orig = PROCESSORS.removeLines;
  PROCESSORS.removeLines = async (c, s)=>{ const r = await orig(c, s); const D = removeTableLines.debug; if(D){ segV=D.segments.v.length; segH=D.segments.h.length; } return r; };
  const r = await T.process(checks, opts);
  PROCESSORS.removeLines = orig;
  return { ok: !!r.canvas, segV, segH, ms: r.ms, warning: r.warning, size: r.canvas ? r.canvas.width+'x'+r.canvas.height : '-',
           images: r.canvas ? { result: T.png(r.canvas) } : {} };
"""

# ---------------- 글자 추출(OCR) 정확도 비교 ----------------
OCR_PDF = 'DocFlow_시연용_문서.pdf'
OCR_ANSWER = 'DocFlow_시연용_문서_정답텍스트.txt'
OCR_PRESET = ['autoCrop', 'scanEffect', 'trimMargin', 'denoise', 'removeLines', 'ocrText']
# 한글·영문이 섞인 가상 문서(테스트가 직접 그림 — 실제 기관·인물과 무관) — 영문·이메일·웹 주소가 읽히는지 확인용
MIXED_LINES = [
    ('title', '가나대학교 RISE 사업단 성과 보고 (2026년 2분기)'),
    ('h', '1. 사업 개요'),
    ('b', '2026년도 RISE 사업과 LINC 3.0 후속 과제를 함께 운영합니다.'),
    ('b', '기관 영문명: Gana National University Industry-Academic Cooperation Foundation'),
    ('b', '담당자 이메일: kim.gana@ganauniv.ac.kr'),
    ('b', '사업단 누리집: https://rise.ganauniv.ac.kr/notice'),
    ('b', '문의 메일: help@docflow.kr (평일 09:00~18:00)'),
    ('h', '2. 추진 실적'),
    ('b', '문서 이미지 처리 도구 DocFlow로 증빙 서류 120건을 정리했습니다.'),
    ('b', '협력 기관: Hanbit Education Consulting, K-Edu Lab'),
    ('b', '하반기에는 AI 기반 학습 분석(Learning Analytics) 시범 운영을 추진합니다.'),
    ('b', '보고서 원문은 www.ganauniv.ac.kr/rise/report 에서 내려받을 수 있습니다.'),
]
MIXED_EN = ['RISE', 'LINC', 'GanaNationalUniversity', 'Industry-AcademicCooperationFoundation', 'kim.gana@ganauniv.ac.kr',
            'https://rise.ganauniv.ac.kr/notice', 'help@docflow.kr', 'DocFlow', 'HanbitEducationConsulting', 'K-EduLab',
            'AI', 'LearningAnalytics', 'www.ganauniv.ac.kr/rise/report']
PAGE_EN = ['DocFlow', 'SAMPLE']   # 시연 문서의 영문(공백 빼고 비교)

def ocr_references():
    """정답 텍스트를 쪽별로 나누고, 직인·결재 도장 안 글자를 뺀 것도 만듦 → {page: {'all': ..., 'nostamp': ...}}"""
    lines = (PRIVATE / OCR_ANSWER).read_text(encoding='utf-8').splitlines()
    starts = [i for i, l in enumerate(lines) if '시연용 가상 문서 · SAMPLE' in l]   # 쪽마다 맨 위 머리말
    p2 = starts[1] if len(starts) > 1 else len(lines)
    pages = {1: lines[:p2], 2: lines[p2:]}
    # 2쪽의 결재 도장(홍길동인·김가나인·이다라인)과 직인(산학협력단인) 안 글자 — OCR 이미지에서 직인을 빼므로 채점에서 제외
    drop_lines = {'동인', '김가', '나인', '이다', '라인', '력 산', '인 협'}
    def nostamp(ls):
        out = []
        for l in ls:
            t = l.strip()
            if t in drop_lines: continue
            t = re.sub(r'^재\s+홍길$', '재', t)
            t = re.sub(r'산학협력단장\s+단 학$', '산학협력단장', t)
            out.append(t)
        return '\n'.join(out)
    return {p: {'all': '\n'.join(ls), 'nostamp': nostamp(ls)} for p, ls in pages.items()}

# 페이지 안에서: 시연 PDF → 깨끗한 이미지(200dpi) + 사진처럼 합성한 이미지, 한영 혼합 문서도 같은 두 가지로
OCR_MAKE_JS = r"""
  const [pdfUrl, mixed] = ARGS;
  const out = {};
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  for(let n=1; n<=pdf.numPages; n++){
    const page = await pdf.getPage(n), vp = page.getViewport({ scale: 200/72 });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,c.width,c.height);
    await page.render({ canvasContext: x, viewport: vp }).promise;
    out['page'+n+'_clean'] = c.toDataURL('image/png');
    out['page'+n+'_photo'] = T.synthPhoto(c, n);
  }
  // 한영 혼합 문서(본문 30px ≈ 200dpi의 10.5pt)
  const c = document.createElement('canvas'); c.width = 1654; c.height = 1300;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,c.width,c.height); x.fillStyle = '#111';
  let y = 150;
  for(const [k, t] of mixed){
    x.font = (k==='title' ? 'bold 44px' : k==='h' ? 'bold 34px' : '30px') + " 'Malgun Gothic','Noto Sans KR',sans-serif";
    x.fillText(t, 140, y); y += k==='title' ? 110 : 72;
  }
  out['mixed_clean'] = c.toDataURL('image/png');
  out['mixed_photo'] = T.synthPhoto(c, 5);
  return out;

"""

# 페이지 안에서: 이미지 하나를 ① 원본 그대로 ② 글자 추출 카드 처리 후 로 읽고, 정답과 비교
OCR_RUN_JS = r"""
  const [url, name, refs, en, preset] = ARGS;
  const img = new Image(); img.src = url; await img.decode();
  const raw = cloneCanvasFromImage(img);
  const a = await ocrRecognize(raw, { prepare: false });           // ① 원본 그대로 (DocFlow 처리·OCR용 정리 없이)
  await T.load(url, name);                                         // ② 글자 추출 카드으로 처리(글자 추출 포함)
  const t0 = performance.now();
  const r = await T.process(preset, { scanMode: 'bw' });
  const procMs = performance.now() - t0;
  const b = lastOcrPages[0];
  // 공백을 뺀 글자 단위 비교: 정확도 = 1 − 편집거리/정답 글자 수, 재현율 = 순서 무관하게 정답 글자가 몇 % 나왔는지
  // 공백 제거 + 모양이 같은 문자 맞춤: Tesseract는 가운뎃점(·)을 한글 자모 "ㆍ"로 내놓음
  const strip = t=> (t||'').replace(/\s+/g, '').replace(/[ㆍ∙•]/g, '·');
  const lev = (x, y)=>{ let prev = new Int32Array(y.length+1).map((_,j)=>j), cur = new Int32Array(y.length+1);
    for(let i=1;i<=x.length;i++){ cur[0]=i; for(let j=1;j<=y.length;j++) cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1] + (x[i-1]===y[j-1]?0:1)); [prev,cur]=[cur,prev]; }
    return prev[y.length]; };
  const recall = (ref, hyp)=>{ const m = new Map(); for(const ch of hyp) m.set(ch, (m.get(ch)||0)+1); let k=0; for(const ch of ref){ const v=m.get(ch)||0; if(v){ k++; m.set(ch,v-1); } } return k/ref.length; };
  const score = text=>{ const h = strip(text), o = {};
    for(const [k, ref] of Object.entries(refs || {})){ const rr = strip(ref); o[k] = { acc: Math.max(0, 1 - lev(rr, h)/rr.length), recall: recall(rr, h) }; }
    return o; };
  // 엉뚱한 영어: 결과의 영문 덩어리(2자 이상) 중 정답에 없는 것 / 영문: 확인할 영문·이메일·주소 중 그대로 읽힌 것
  const refTok = new Set(((refs && refs.all) || '').match(/[A-Za-z]{2,}/g)?.map(s=>s.toLowerCase()) || []);
  const spur = text=> refs ? (text.match(/[A-Za-z]{2,}/g) || []).filter(t=> !refTok.has(t.toLowerCase())) : null;
  const enHit = text=>{ const h = strip(text); return en.filter(e=> h.includes(e)); };
  const pack = (o, extra)=> ({ text: o ? o.text : '', conf: o ? o.meanConf : 0, ms: o ? o.ms : 0, score: score(o && o.text),
    spur: o ? spur(o.text) : null, en: o ? enHit(o.text) : [], low: o ? o.lowConfList : [], ...extra });
  return {
    raw:  pack(a),
    proc: pack(b, { procMs, warning: r.warning }),
    enN: en.length,
    images: { processed: T.png(r.canvas), ocr_input: b ? T.png(b.ocrCanvas) : null },
  };
"""

def run_ocr_tests(fresh_page, out_dir):
    """결과 표(마크다운)를 돌려줌 — 실패 수와 함께"""
    if not ((PRIVATE / OCR_PDF).is_file() and (PRIVATE / OCR_ANSWER).is_file()):
        print('  SKIP  tests/private/ 에 시연용 PDF·정답 텍스트가 없어서 건너뜀')
        return 0, None
    od = out_dir / 'ocr'; od.mkdir(parents=True, exist_ok=True)
    refs = ocr_references()
    mixed_ref = '\n'.join(t for _, t in MIXED_LINES)
    pg = fresh_page()
    imgs = pg.evaluate('async (ARGS) => {' + OCR_MAKE_JS + '}', [PRIVATE_URL + urllib.parse.quote(OCR_PDF), [list(x) for x in MIXED_LINES]])
    pg.close()
    cases = []   # (이름, 주소, 정답{nostamp, all} 또는 None, 확인할 영문 목록)
    for key, url in imgs.items():
        (od / f'{key}.{"jpg" if url.startswith("data:image/jpeg") else "png"}').write_bytes(base64.b64decode(url.split(',', 1)[1]))
        if key.startswith('page'):
            page = int(key[4])
            cases.append((key, url, {'nostamp': refs[page]['nostamp'], 'all': refs[page]['all']}, PAGE_EN))
        else:
            cases.append((key, url, {'nostamp': mixed_ref, 'all': mixed_ref}, MIXED_EN))
    if (PRIVATE / 'photo01.jpg').is_file():
        cases.append(('photo01', PRIVATE_URL + 'photo01.jpg', None, []))   # 실제 사진 — 정답 없음(참고용)
    exp05 = PRIVATE / 'photo05_expected.json'   # 실제 영문·이메일은 공개하면 안 돼서 private에 따로 둠
    if (PRIVATE / 'photo05.jpg').is_file() and exp05.is_file():
        cases.append(('photo05', PRIVATE_URL + 'photo05.jpg', None, json.loads(exp05.read_text(encoding='utf-8'))['en']))
    rows, fails = [], 0
    pct = lambda x: f'{x*100:.1f}%'
    for key, url, ref, en in cases:
        pg = fresh_page()
        t0 = time.time()
        r = pg.evaluate('async (ARGS) => {' + OCR_RUN_JS + '}', [url, key + ('.jpg' if 'photo' in key else '.png'), ref, en, OCR_PRESET])
        pg.close()
        for k in ('processed', 'ocr_input'):
            v = r['images'].get(k)
            if v: (od / f'{key}_{k}.png').write_bytes(base64.b64decode(v.split(',', 1)[1]))
        (od / f'{key}_text_raw.txt').write_text(r['raw']['text'], encoding='utf-8')
        (od / f'{key}_text_processed.txt').write_text(r['proc']['text'], encoding='utf-8')
        rows.append((key, r))
        enTxt = f" · 영문 {len(r['raw']['en'])}/{r['enN']} → {len(r['proc']['en'])}/{r['enN']}" if r['enN'] else ''
        if ref:
            ra, pa = r['raw']['score']['nostamp'], r['proc']['score']['nostamp']
            ok = pa['acc'] >= ra['acc'] - 0.01
            fails += 0 if ok else 1
            print(f"  {'PASS' if ok else 'FAIL'}  {key}  원본 그대로 {pct(ra['acc'])} → 글자 추출 카드 후 {pct(pa['acc'])}"
                  f"  (엉뚱한 영어 {len(r['raw']['spur'])} → {len(r['proc']['spur'])}{enTxt}, 인식 {r['proc']['ms']/1000:.1f}s, 전체 처리 {r['proc']['procMs']/1000:.1f}s)")
        else:
            print(f"  INFO  {key}  평균 신뢰도 원본 그대로 {r['raw']['conf']}% → 글자 추출 카드 후 {r['proc']['conf']}%{enTxt}"
                  f"  (인식 {r['proc']['ms']/1000:.1f}s, 전체 처리 {r['proc']['procMs']/1000:.1f}s)")
    # 요약표
    def cell(r, which, k, f):
        sc = r[which]['score'].get(k) if r[which]['score'] else None
        return f'{sc[f]*100:.1f}%' if sc else '-'
    def n_spur(r, w): return '-' if r[w]['spur'] is None else str(len(r[w]['spur']))
    def n_en(r, w): return '-' if not r['enN'] else f"{len(r[w]['en'])}/{r['enN']}"
    md = ['| 이미지 | 정확도 원본 → 글자 추출 카드 | (직인 포함) | 엉뚱한 영어 | 영문·이메일 | 평균 신뢰도 | 인식 시간 | 전체 처리 시간 |',
          '|---|---|---|---|---|---|---|---|']
    for key, r in rows:
        md.append(f"| {key} | {cell(r,'raw','nostamp','acc')} → **{cell(r,'proc','nostamp','acc')}** | {cell(r,'raw','all','acc')} → {cell(r,'proc','all','acc')} | "
                  f"{n_spur(r,'raw')} → {n_spur(r,'proc')} | {n_en(r,'raw')} → {n_en(r,'proc')} | "
                  f"{r['raw']['conf']}% → {r['proc']['conf']}% | {r['proc']['ms']/1000:.1f}s | {r['proc']['procMs']/1000:.1f}s |")
    table = '\n'.join(md)
    (od / 'summary.md').write_text('# 글자 추출 정확도 비교\n\n정확도 = 1 − 글자 편집거리 ÷ 정답 글자 수 (공백 제외). 기본은 직인·결재 도장 안 글자 제외.\n'
                                   '엉뚱한 영어 = 결과의 영문 덩어리(2자 이상) 중 정답에 없는 것. 영문·이메일 = 확인할 영문·이메일·주소 중 그대로 읽힌 것.\n\n' + table + '\n', encoding='utf-8')
    (od / 'summary.json').write_text(json.dumps({k: {w: {kk: vv for kk, vv in r[w].items() if kk != 'text'} for w in ('raw', 'proc')} for k, r in rows}, ensure_ascii=False, indent=1), encoding='utf-8')
    return fails, table
# ---------------- 정보 가리기 ----------------
# 가상 문서 2종(테스트가 직접 그림 → tests/fixtures/, 저장소에 올림). 가짜임이 분명한 값만 씀:
#  이름에 "(가상)", 주민·외국인번호는 형식만 맞고 검증 숫자가 틀린 값, 이메일은 예약 도메인 example.com/org, 값 옆에 "(가상)"
# 줄: (모양, 글자). 기대값: (종류, 값) — 자동 검출이 찾아야 하는 것. 사업자등록번호·날짜·금액은 잡으면 안 되는 미끼
FIXTURES = TESTS / 'fixtures'
REDACT_DOCS = {
    'redact_bankbook': {
        'size': (1654, 1500),
        'lines': [
            ('title', '통장 사본 — 가상 데이터 · SAMPLE'),
            ('b', '가나은행 (가상 은행 · SAMPLE)'),
            ('b', '예금주: 홍길동(가상)'),
            ('b', '계좌번호: 123-456789-01-234 (가상)'),
            ('b', '주민등록번호: 900101-1234567 (가상)'),
            ('b', '연락처: 010-2345-6789 (가상)'),
            ('b', '이메일: gildong.hong@example.com (가상)'),
            ('b', '지점 전화: 02-123-4567 (가상)'),
            ('b', '신규일: 2026-03-02 (가상)'),
            ('s', '이 문서는 테스트용 가상 데이터입니다 · SAMPLE'),
        ],
        'expect': [('account', '123-456789-01-234'), ('rrn', '900101-1234567'), ('phone', '010-2345-6789'),
                   ('email', 'gildong.hong@example.com'), ('phone', '02-123-4567'), ('name', '홍길동')],
    },
    'redact_lecture_pay': {
        'size': (1654, 2000),
        'lines': [
            ('title', '강사료 지급 명세서 (가상 데이터 · SAMPLE)'),
            ('b', '업체명: 한빛교육컨설팅(가상)   사업자등록번호: 123-45-67890 (가상)'),
            ('b', '지급일: 2026-09-30   총 지급액: 1,500,000원 (가상)'),
            ('h', '1. 성명: 홍길동(가상)'),
            ('b', '주민등록번호 850315-2345671 (가상)   휴대폰 010-3456-7890 (가상)'),
            ('b', '가나은행 계좌 110-234-567890 (가상)   이메일 hong.gd@example.org'),
            ('b', '지급액 500,000원 (원천징수 16,500원)'),
            ('h', '2. 성명: 김가나(가상)'),
            ('b', '주민등록번호 920720-1357913 (가상)   휴대폰 010-4567-8901 (가상)'),
            ('b', '다라은행 계좌 352-0123-4567-83 (가상)   이메일 kim.gana@example.com'),
            ('b', '지급액 600,000원'),
            ('h', '3. 성명: John Sample(가상)'),
            ('b', '외국인등록번호 880412-5246803 (가상)   휴대폰 010-5678-9012 (가상)'),
            ('b', '마바은행 계좌 1002-345-678901 (가상)   이메일 john.sample@example.org'),
            ('b', '지급액 400,000원'),
            ('s', '이 문서는 테스트용 가상 데이터입니다 · SAMPLE'),
        ],
        'expect': [('rrn', '850315-2345671'), ('phone', '010-3456-7890'), ('account', '110-234-567890'), ('email', 'hong.gd@example.org'),
                   ('rrn', '920720-1357913'), ('phone', '010-4567-8901'), ('account', '352-0123-4567-83'), ('email', 'kim.gana@example.com'),
                   ('frn', '880412-5246803'), ('phone', '010-5678-9012'), ('account', '1002-345-678901'), ('email', 'john.sample@example.org'),
                   ('name', '홍길동'), ('name', '김가나'), ('name', 'John Sample')],
    },
}
REDACT_PRESET = ['autoCrop', 'scanEffect', 'denoise', 'ocrText']

def rrn_check_ok(v):
    """주민·외국인등록번호 검증 숫자가 맞는지 — 가상 값은 일부러 틀려야 함"""
    d = [int(c) for c in v if c.isdigit()]
    return (11 - sum(a * b for a, b in zip(d[:12], [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5])) % 11) % 10 == d[12]

REDACT_MAKE_JS = r"""
  const [size, lines] = ARGS;
  const c = document.createElement('canvas'); c.width = size[0]; c.height = size[1];
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,c.width,c.height);
  let y = 150;
  for(const [k, t] of lines){
    x.fillStyle = k==='s' ? '#555' : '#111';
    x.font = (k==='title' ? 'bold 44px' : k==='h' ? 'bold 34px' : k==='s' ? '26px' : '30px') + " 'Malgun Gothic','Noto Sans KR',sans-serif";
    x.fillText(t, 140, y); y += k==='title' ? 110 : k==='h' ? 80 : 72;
  }
  // 가상 데이터 표시 — 오른쪽 위 빨간 테두리 도장 모양
  x.strokeStyle = '#c33'; x.lineWidth = 4; x.strokeRect(c.width-330, 40, 260, 70);
  x.fillStyle = '#c33'; x.font = "bold 32px 'Malgun Gothic',sans-serif"; x.fillText('SAMPLE 가상', c.width-310, 88);
  return { clean: c.toDataURL('image/png'), photo: T.synthPhoto(c, size[1] % 97) };
"""

# 페이지 안에서: 처리(글자 추출까지) → 자동 검출 → 기대값과 맞추기 → 가리기 적용 → 다시 읽기·검정 픽셀·PDF 확인
REDACT_RUN_JS = r"""
  const [url, name, expect, preset, scan] = ARGS;
  await T.load(url, name);
  const r = await T.process(preset, { scanMode: scan || 'color' });
  const ocr = lastOcrPages[0];
  if(!ocr) return { ok: false, info: '글자 추출 결과 없음 ' + (r.warning || '') };
  const items = detectSensitive(ocr);
  // 비교용: 붙은 괄호("홍길동(가상)")는 빼고, 숫자 자리 오인식 맞추고, 글자·숫자·@·점만
  const norm = s=> normDigits(s.replace(/[(（][^)）]*[)）]?/g, '')).toLowerCase().replace(/[^0-9a-z@.가-힣]/g, '');
  const lev = (a, b)=>{ let p = [...Array(b.length+1).keys()], c = []; for(let i=1;i<=a.length;i++){ c=[i]; for(let j=1;j<=b.length;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[b.length]; };
  // 기대값마다 같은 종류의 자동 검출 중 글자가 같은 것(이메일은 편집거리 2 이하)을 찾고,
  // 남은 것은 같은 종류끼리 순서대로 짝지음 — 글자는 틀리게 읽혔어도 그 자리를 잡아 가리는 것("읽기 틀림")
  const used = new Set(), found = [];
  for(const [kind, val] of expect){
    const k = items.findIndex((it, i)=> !used.has(i) && it.kind === kind && lev(norm(it.text), norm(val)) <= (kind === 'email' ? 2 : 0));
    if(k >= 0) used.add(k);
    found.push({ kind, val, hit: k >= 0, got: k >= 0 ? items[k].text : null });
  }
  for(const f of found){
    if(f.hit) continue;
    const k = items.findIndex((it, i)=> !used.has(i) && it.kind === f.kind);
    if(k >= 0){ used.add(k); f.hit = true; f.misread = items[k].text; }
  }
  const wrong = items.filter((_, i)=> !used.has(i)).map(it=> it.kind + ':' + it.text);
  // 읽힘: 기대값이 읽은 글자에 그대로 들어 있는지(표 안 글자를 제대로 읽었는지 — 검출과 따로 셈)
  const textN = norm(ocr.text);
  const readable = expect.filter(([k, v])=> textN.includes(norm(v))).length;
  // 전체 가리기 글자 창에서 ■ 바로 뒤에 주소 조각(kr·com·…)이 남으면 이메일 뒷부분을 덜 가린 것
  const L = redactPage ? redactPage.red.lines : null;   // 처리할 때 찾은 표 선(검토 화면과 같은 것)
  const fullText = redactOcrText(ocr, { mode: 'full', items });
  // 이메일은 길이·모양이 드러나지 않게 ■ 덩어리 하나로 — ■ 옆에 점·@가 남으면 모양이 드러난 것
  const emailShape = [...fullText.matchAll(/■+[.@]+■*|[.@]+■+/g)].map(m=> m[0]);
  const addrLeft = [...fullText.matchAll(/■\s?(\.?[A-Za-z0-9-]*\.?(?:kr|com|net|org))/g)].map(m=> m[1]);
  // 일부만 가리기 — 텍스트 창 글자
  const partText = redactOcrText(ocr, { mode: 'partial', items, lines: L });
  // 저장할 때처럼 전체 가리기(불투명 검정) → 다시 읽어서 찾은 값이 안 읽히는지
  const red = { mode: 'full', items, lines: L };
  const out = applyRedaction(r.canvas, ocr, red);
  const again = await ocrRecognize(await makeOcrSource(out, { checks: [], scanMode: 'color' }));   // 처리할 때와 같은 글자 추출 경로
  const againN = norm(again.text);
  // 이메일은 아이디(@ 앞), 번호는 숫자 전체가 다시 읽히면 샌 것 (끝자리만 보면 가리지 않는 사업자등록번호와 겹침)
  const key = f=> f.kind === 'email' ? norm(f.val.split('@')[0]) : norm(f.val);
  const leaked = found.filter(f=> f.hit && againN.includes(key(f))).map(f=> f.val);
  // 가린 상자 안쪽이 완전한 검정인지(가장자리 1px 안쪽 모든 픽셀)
  const { rects } = redactionShapes(ocr, red);
  const d = out.getContext('2d').getImageData(0, 0, out.width, out.height).data;
  let notBlack = 0, px = 0;
  for(const b of rects) for(let yy=Math.ceil(b.y0)+1; yy<Math.floor(b.y1); yy++) for(let xx=Math.ceil(b.x0)+1; xx<Math.floor(b.x1); xx++){
    if(xx<0 || yy<0 || xx>=out.width || yy>=out.height) continue;
    const i = (yy*out.width+xx)*4; px++; if(d[i] || d[i+1] || d[i+2]) notBlack++;
  }
  // 가림 상자 모양: ① 항목 하나는 줄마다 네모 하나 ② 칸 테두리를 넘지 않음 — 결과 이미지에서 표 선을 새로 찾아 상자 안쪽을
  //  가로지르는 선이 있으면 넘친 것(사진 05에서 이름 상자가 울퉁불퉁하고 위 칸 쪽으로 삐져나왔었음)
  const perItem = new Map(); for(const b of rects) perItem.set(b.id, (perItem.get(b.id) || 0) + 1);
  const notOne = items.filter(it=> (perItem.get(it.id) || 0) !== new Set(it.words.map(wi=> ocr.words[wi].line)).size).map(it=> it.kind);
  // (표 선을 지운 결과면 결과에서는 못 찾으므로 처리할 때 기억해 둔 선으로 — 글자 추출 카드 + 정보 가리기)
  const fresh = findTableLines(r.canvas).segments;
  const tl = fresh.h.length + fresh.v.length >= 3 || !L ? fresh : L, overflow = [];
  const crosses = (b, s, horiz)=>{
    const [a0, a1, lo, hi] = horiz ? [Math.min(s.x1, s.x2), Math.max(s.x1, s.x2), b.x0, b.x1] : [Math.min(s.y1, s.y2), Math.max(s.y1, s.y2), b.y0, b.y1];
    const a = Math.max(a0, lo), z = Math.min(a1, hi); if(z - a < 3) return false;
    const m = (a + z)/2, t = horiz ? (s.x2 === s.x1 ? 0 : (m - s.x1)/(s.x2 - s.x1)) : (s.y2 === s.y1 ? 0 : (m - s.y1)/(s.y2 - s.y1));
    const v = horiz ? s.y1 + (s.y2 - s.y1)*t : s.x1 + (s.x2 - s.x1)*t;
    return horiz ? v > b.y0 + 1 && v < b.y1 - 1 : v > b.x0 + 1 && v < b.x1 - 1;
  };
  const partRects = redactionShapes(ocr, { mode: 'partial', items, lines: L }).rects;
  for(const b of [...rects, ...partRects]){
    if(tl.h.some(s=> crosses(b, s, true)) || tl.v.some(s=> crosses(b, s, false))) overflow.push((items.find(it=> it.id === b.id) || {}).kind);
  }
  // PDF: 문서 정보(만든 프로그램·날짜 등)가 비었는지, 글자 층(pdf.js로 꺼낼 수 있는 글자)이 없는지
  const pdfBytes = new Uint8Array(await redactedPdfBlob(out).arrayBuffer());
  const pdfS = new TextDecoder('latin1').decode(pdfBytes);
  const pdfInfo = [...pdfS.matchAll(/\/(Producer|CreationDate|ModDate|Creator|Title|Author|Subject|Keywords) \(([^)]*)\)/g)].filter(m=> m[2].trim()).map(m=> m[1]);
  const pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const pdfText = (await (await pdfDoc.getPage(1)).getTextContent()).items.length > 0;
  return { ok: true, found, wrong, leaked, readable, addrLeft, emailShape, notOne, overflow, nLines: tl.h.length + tl.v.length, nRects: rects.length, notBlack, px, pdfInfo, pdfText, partText, text: ocr.text, size: r.canvas.width + 'x' + r.canvas.height,
           images: { preview: T.png(applyRedaction(r.canvas, ocr, red, { preview: true })), saved: T.png(out) } };
"""

# 페이지 안에서: 사용자처럼 "정보 가리기" 프리셋 → 처리 → 검토 화면 조작(누르기·형광펜·두 손가락·되돌리기) → 저장 확인
REDACT_UI_JS = r"""
  const fail = [], log = [];
  const $ = id=> document.getElementById(id);
  document.getElementById('noticeOverlay').classList.remove('show');
  await T.load('/works/docflow/tests/fixtures/redact_bankbook.png', 'redact_bankbook.png');
  [...document.querySelectorAll('.preset-card')].find(el=> el.textContent.includes('정보 가리기')).click();
  if(!checked.has('ocrText') || !checked.has('redact') || scanMode !== 'color' || selectedFormat !== 'pdf') fail.push('프리셋 구성');
  const ocrRow = [...document.querySelectorAll('.check-row')].find(r=> r.querySelector('.check-name').textContent === '글자 추출 (OCR)');
  ocrRow.click(); if(!checked.has('ocrText')) fail.push('정보 가리기가 켜져 있는데 글자 추출을 끌 수 있음');
  $('processBtn').click();
  await new Promise(r=> setTimeout(r, 50));
  for(let i=0; i<3000 && $('spinnerLine').classList.contains('show'); i++) await new Promise(r=> setTimeout(r, 100));
  if(!$('redactPanel').classList.contains('show')) return { ok: false, info: '검토 화면이 안 열림' };
  if(getComputedStyle($('downloadBtn')).display !== 'none') fail.push('가리는 중에 일반 다운로드가 보임');
  const P = redactPage, items = ()=> P.red.items, nAuto = items().length;
  log.push(`자동 ${nAuto}개`);
  const cv = $('redactCanvas');
  const toClient = (x, y)=>{ const r = cv.getBoundingClientRect(); return { clientX: r.left + x * r.width / cv.width, clientY: r.top + y * r.height / cv.height }; };
  const wordAt = re=> P.ocr.words.findIndex(w=> re.test(w.text));
  const center = wi=>{ const b = P.ocr.words[wi].bbox; return toClient((b.x0+b.x1)/2, (b.y0+b.y1)/2); };
  // ① 단어 누르기 → 선택, 다시 누르기 → 해제, 되돌리기 → 다시 선택
  // 예금주 이름은 "이름 후보"로 미리 골라져 있음 → 목록에 "이름 후보" 표시
  if(!items().some(it=> it.kind === 'name')) fail.push('예금주 이름 후보 없음');
  if(![...$('redactList').children].some(el=> el.textContent.includes('이름 후보'))) fail.push('목록에 "이름 후보" 표시 없음');
  // 이름은 엔진이 "홍 | 길 | 동"처럼 글자마다 나누기도 함 — 가운데 글자를 눌러 해제, 다시 누르면 이름 전체가 골라져야 함
  const wName = wordAt(/길/);
  cv.dispatchEvent(new MouseEvent('click', { bubbles: true, ...center(wName) }));
  if(items().some(it=> it.kind === 'name') || items().length !== nAuto - 1) fail.push('이름 후보를 눌러도 해제 안 됨');
  cv.dispatchEvent(new MouseEvent('click', { bubbles: true, ...center(wName) }));
  if(items().length !== nAuto || items().at(-1).kind !== 'word') fail.push('단어 누르기로 선택 안 됨');
  else { const t = items().at(-1).words.map(i=> P.ocr.words[i].text).join(''); log.push(`"길"을 눌러 고른 것: ${t}`); if(!t.includes('홍길동')) fail.push('이름 일부만 골라짐: ' + t); }
  cv.dispatchEvent(new MouseEvent('click', { bubbles: true, ...center(wName) }));
  if(items().length !== nAuto - 1) fail.push('다시 눌러도 해제 안 됨');
  redactUndo(); if(items().length !== nAuto) fail.push('되돌리기(해제 취소) 안 됨');
  // 자동 검출을 눌러 해제 → 되돌리기
  const wRrn = P.ocr.words.findIndex((w, i)=> items().some(it=> it.kind === 'rrn' && it.words.includes(i)));
  cv.dispatchEvent(new MouseEvent('click', { bubbles: true, ...center(wRrn) }));
  if(items().some(it=> it.kind === 'rrn')) fail.push('자동 검출 해제 안 됨');
  redactUndo(); if(!items().some(it=> it.kind === 'rrn')) fail.push('자동 검출 해제 되돌리기 안 됨');
  // ② 일부만 가리기 → 읽은 글자 창
  document.querySelector('[data-rmode="partial"]').click();
  const ta = $('ocrTextArea').value;
  if(!/900101-1■{6}/.test(ta)) fail.push('일부만: 주민번호 글자 창 ' + (ta.match(/900101\S*/) || ['없음'])[0]);
  if(!/010-■{4}-6789/.test(ta)) fail.push('일부만: 전화 글자 창');
  if(!/이메일: ■{8} /.test(ta)) fail.push('일부만: 이메일이 ■ 덩어리 하나로 가려지지 않음');
  if(/홍길동/.test(ta)) fail.push('직접 고른 이름이 글자 창에 보임');
  document.querySelector('[data-rmode="full"]').click();
  if(!/주민등록번호:? ■{14} /.test($('ocrTextArea').value)) fail.push('전체: 주민번호가 다 가려지지 않음');
  // ③ 형광펜: 단어 위로 그으면 그 단어 선택, 빈 곳에 그으면 그은 자리 칠하기
  document.querySelector('[data-rtool="pen"]').click();
  if(cv.style.touchAction !== 'none' || !$('redactTools').classList.contains('sticky')) fail.push('형광펜: 터치 처리·도구 줄 고정 안 됨');
  const pe = (type, id, c)=> cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, pointerType: 'touch', isPrimary: id === 1, ...c }));
  const swipe = (pts, id = 1)=>{ pe('pointerdown', id, pts[0]); for(const q of pts.slice(1)) pe('pointermove', id, q); pe('pointerup', id, pts.at(-1)); };
  const wDate = wordAt(/^2026-03-02/), b = P.ocr.words[wDate].bbox;
  const before = items().length;
  swipe([toClient(b.x0 + 2, (b.y0+b.y1)/2), toClient((b.x0+b.x1)/2, (b.y0+b.y1)/2), toClient(b.x1 - 2, (b.y0+b.y1)/2)]);
  const it3 = items().at(-1);
  if(items().length !== before + 1 || it3.kind !== 'word' || !it3.words.includes(wDate)) fail.push('형광펜으로 단어 선택 안 됨');
  const W = cv.width, H = cv.height;
  swipe([toClient(W*0.55, H*0.92), toClient(W*0.7, H*0.92), toClient(W*0.85, H*0.93)]);
  if(items().at(-1).kind !== 'stroke') fail.push('빈 곳 획이 칠하기로 안 남음');
  // 두 손가락: 확대만, 획은 남지 않음
  const nBefore = items().length, z0 = RZ.zoom;
  pe('pointerdown', 1, toClient(W*0.4, H*0.5)); pe('pointerdown', 2, toClient(W*0.6, H*0.5));
  pe('pointermove', 1, toClient(W*0.3, H*0.5)); pe('pointermove', 2, toClient(W*0.7, H*0.5));
  pe('pointerup', 1, toClient(W*0.3, H*0.5)); pe('pointerup', 2, toClient(W*0.7, H*0.5));
  if(items().length !== nBefore) fail.push('두 손가락 확대 중에 칠해짐');
  if(!(RZ.zoom > z0 * 1.5)) fail.push(`두 손가락으로 확대 안 됨 (${z0.toFixed(2)} → ${RZ.zoom.toFixed(2)})`);
  log.push(`확대 ${Math.round(z0*100)}% → ${Math.round(RZ.zoom*100)}%`);
  // ④ 저장 확인 → PDF, PNG (저장 함수를 가로채 결과만 받음)
  let saved = null; const origBlob = saveBlobFile, origCanvas = saveCanvasFile;
  window.saveBlobFile = (blob, name)=>{ saved = { blob, name }; };
  window.saveCanvasFile = (canvas, name, mime)=>{ saved = { canvas, name, mime }; };
  $('redactSaveBtn').click();
  if(!$('redactConfirm').classList.contains('show') || !$('redactConfirmImg').src.startsWith('data:image')) fail.push('저장 확인 화면 안 뜸');
  $('redactBackBtn').click();
  if($('redactConfirm').classList.contains('show') || saved) fail.push('돌아가서 고치기가 저장해 버림');
  $('redactSaveBtn').click(); $('redactDoSaveBtn').click();
  if(!saved || !saved.blob || saved.name !== 'DocFlow_가림.pdf') fail.push('PDF 저장 안 됨');
  else {
    const bytes = new Uint8Array(await saved.blob.arrayBuffer());
    log.push(`PDF ${Math.round(bytes.length/1024)}KB`);   // pdf.js가 바이트를 작업자로 넘기며 비우므로 먼저 잼
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    if((await (await doc.getPage(1)).getTextContent()).items.length) fail.push('PDF에 글자 층');
  }
  saved = null;
  $('redactSaveBtn').click();
  [...$('redactFormatRow').children].find(el=> el.textContent === 'PNG').click();
  $('redactDoSaveBtn').click();
  if(!saved || !saved.canvas || saved.mime !== 'image/png') fail.push('PNG 저장 안 됨');
  else {
    // 가린 자리(형광펜 단어 2026-03-02)가 완전히 검정인지
    const d = saved.canvas.getContext('2d').getImageData(Math.round((b.x0+b.x1)/2), Math.round((b.y0+b.y1)/2), 1, 1).data;
    if(d[0] || d[1] || d[2]) fail.push('PNG의 가린 자리가 검정이 아님');
  }
  window.saveBlobFile = origBlob; window.saveCanvasFile = origCanvas;
  // ⑤ 정보 가리기를 끄고 다시 처리하면 검토 화면이 닫히고 일반 다운로드가 돌아옴
  checked.delete('redact'); renderSections();
  $('processBtn').click(); await new Promise(r=> setTimeout(r, 50));
  for(let i=0; i<3000 && $('spinnerLine').classList.contains('show'); i++) await new Promise(r=> setTimeout(r, 100));
  if($('redactPanel').classList.contains('show') || getComputedStyle($('downloadBtn')).display === 'none') fail.push('가리기 끈 뒤에도 검토 화면이 남음');
  return { ok: !fail.length, info: (fail.join(' / ') || '누르기·해제·되돌리기·일부만·형광펜·두 손가락·저장 확인 정상') + ' · ' + log.join(' · ') };
"""

def run_redact_tests(fresh_page, out_dir, remake=False):
    fails = 0
    for name, doc in REDACT_DOCS.items():
        for kind, v in doc['expect']:
            if kind in ('rrn', 'frn') and rrn_check_ok(v):
                print(f'  FAIL  {name}: 가상 주민번호 {v}의 검증 숫자가 맞음 — 실제 번호일 수 있으니 바꿀 것')
                fails += 1
    FIXTURES.mkdir(exist_ok=True)
    for name, doc in REDACT_DOCS.items():
        if remake or not (FIXTURES / f'{name}.png').is_file() or not (FIXTURES / f'{name}_photo.jpg').is_file():
            pg = fresh_page()
            im = pg.evaluate('async (ARGS) => {' + REDACT_MAKE_JS + '}', [list(doc['size']), [list(x) for x in doc['lines']]])
            pg.close()
            (FIXTURES / f'{name}.png').write_bytes(base64.b64decode(im['clean'].split(',', 1)[1]))
            (FIXTURES / f'{name}_photo.jpg').write_bytes(base64.b64decode(im['photo'].split(',', 1)[1]))
            print(f'  가상 문서 그림: tests/fixtures/{name}.png, {name}_photo.jpg')
    od = out_dir / 'redact'
    total = {}   # 종류 → [찾은 수, 기대 수]
    # (주소, 파일, 기대값, 실제 값 가림, 처리 항목, 스캔 색상, 놓쳐도 되는 종류)
    cases = [(f'/works/docflow/tests/fixtures/{f}', f, doc['expect'], False, REDACT_PRESET, 'color', ())
             for name, doc in REDACT_DOCS.items() for f in (f'{name}.png', f'{name}_photo.jpg')]
    # 실제 사진 05 — 표 안의 연락처·이메일(기대값은 private에만). 결과에 실제 값이 찍히지 않게 가려서 출력
    exp05 = PRIVATE / 'photo05_expected.json'
    if (PRIVATE / 'photo05.jpg').is_file() and exp05.is_file():
        e = json.loads(exp05.read_text(encoding='utf-8'))
        cases.append((PRIVATE_URL + 'photo05.jpg', 'photo05.jpg',
                       [('phone', v) for v in e.get('phones', [])] + [('email', v) for v in e['en'] if '@' in v]
                       + [('name', v) for v in e.get('names', [])], True, REDACT_PRESET, 'color', ()))
        # 글자 추출 카드 + 정보 가리기(흑백, 표 선을 지운 뒤 여백 정리) — 칸 자르기는 지우기 전에 기억한 선으로. 이 경로에서는
        # 항목 이름 "성 명"을 "성 멍"으로 읽어 이름 후보를 놓치기도 해서 이름은 놓쳐도 됨
        cases.append((PRIVATE_URL + 'photo05.jpg', 'photo05.jpg (글자 추출 카드 + 정보 가리기)', cases[-1][2], True,
                      ['autoCrop', 'scanEffect', 'trimMargin', 'denoise', 'removeLines', 'ocrText', 'redact'], 'bw', ('name',)))
    else:
        print('  SKIP  photo05.jpg — tests/private/ 에 사진·기대값이 없어서 건너뜀')
    # 실제 사진 01 — 개인정보가 없는 예산 표(손글씨 취소선 칸 있음). 아무것도 잡히면 안 됨("Zzms@o0"를 이메일로 잡았었음)
    for f in ('photo01.jpg', 'photo01_original.jpg'):
        if (PRIVATE / f).is_file():
            cases.append((PRIVATE_URL + f, f, [], True, REDACT_PRESET, 'color', ()))
    mask = lambda v: (v[:1] + '…') if v else v   # 실제 값은 첫 글자만(한글 이름은 3자라 앞 3자면 이름 전체가 보였음)
    for url, file, expect, private, preset, scan, optional in cases:
            pg = fresh_page()
            t0 = time.time()
            try:
                r = pg.evaluate('async (ARGS) => {' + REDACT_RUN_JS + '}', [url, file.split(' ')[0], [list(x) for x in expect], preset, scan])
            except Exception as e:
                r = {'ok': False, 'info': f'오류: {e}'}
            pg.close()
            if not r['ok']:
                fails += 1
                print(f"  FAIL  {file}  {r.get('info')}")
                continue
            od.mkdir(parents=True, exist_ok=True)
            stem = re.sub(r'[^\w.-]+', '_', pathlib.Path(file.split(' ')[0]).stem + ('_ocrpreset' if ' ' in file else ''))
            for k, v in r['images'].items():
                (od / f'{stem}_{k}.png').write_bytes(base64.b64decode(v.split(',', 1)[1]))
            (od / f'{stem}_text.txt').write_text(r['text'] + '\n\n── 일부만 가리기 ──\n' + r['partText'], encoding='utf-8')
            by = {}
            for f in r['found']:
                a = by.setdefault(f['kind'], [0, 0]); a[1] += 1; a[0] += f['hit']
                t = total.setdefault(f['kind'], [0, 0]); t[1] += 1; t[0] += f['hit']
            hit = sum(f['hit'] for f in r['found'])
            # 판정: 깨끗한 가상 문서와 사진 05는 모두 찾고 잘못 잡은 것 없어야 함. 가상 사진 합성은 기록만
            strict = not file.endswith('_photo.jpg')
            ok_detect = (all(f['hit'] for f in r['found'] if f['kind'] not in optional) and not r['wrong']) if strict else True
            ok_save = not r['leaked'] and not r['addrLeft'] and not r['emailShape'] and not r['notOne'] and not r['overflow'] and r['notBlack'] == 0 and not r['pdfInfo'] and not r['pdfText']
            ok = ok_detect and ok_save
            fails += 0 if ok else 1
            kinds = ' · '.join(f'{REDACT_LABEL.get(k, k)} {a[0]}/{a[1]}' for k, a in by.items())
            show = mask if private else (lambda v: v)
            miss = [f"{f['kind']}:{show(f['val'])}" for f in r['found'] if not f['hit']]
            print(f"  {'PASS' if ok else 'FAIL'}  {file}  자동 검출 {hit}/{len(r['found'])} ({kinds}) · 잘못 잡음 {len(r['wrong'])} · 그대로 읽힘 {r['readable']}/{len(r['found'])}"
                  f"  ({time.time()-t0:.0f}s, {r['size']})")
            if miss: print(f'        놓침: {", ".join(miss)}')
            misread = [f"{show(f['val'])} → {show(f['misread'])}" for f in r['found'] if f.get('misread')]
            if misread: print(f'        읽기 틀림(자리는 잡아 가림): {", ".join(misread)}')
            if r['wrong']: print(f'        잘못 잡음: {", ".join(show(w) for w in r["wrong"])}')
            print(f"        가림 상자 {r['nRects']}개 — 네모 하나가 아닌 항목 {len(r['notOne'])}개 · 칸 밖으로 넘친 상자 {len(r['overflow'])}개 (표 선 {r['nLines']}개 기준)"
                  + (f" {r['notOne']} {r['overflow']}" if r['notOne'] or r['overflow'] else ''))
            if r['emailShape']: print(f'        이메일 모양(점·@)이 글자 창에 남음: {", ".join(show(v) for v in r["emailShape"])}')
            if r['addrLeft']: print(f'        이메일 뒷부분이 안 가려짐: {", ".join(show(v) for v in r["addrLeft"])}')
            print(f"        저장본 — 다시 읽어서 보인 값 {len(r['leaked'])}개{(' ' + ', '.join(show(v) for v in r['leaked'])) if r['leaked'] else ''}"
                  f" · 가린 자리 검정 아닌 픽셀 {r['notBlack']}/{r['px']} · PDF 문서 정보 {r['pdfInfo'] or '없음'} · PDF 글자 층 {'있음' if r['pdfText'] else '없음'}")
    pg = fresh_page()
    t0 = time.time()
    try:
        r = pg.evaluate('async () => {' + REDACT_UI_JS + '}')
    except Exception as e:
        r = {'ok': False, 'info': f'오류: {e}'}
    pg.close()
    fails += 0 if r['ok'] else 1
    print(f"  {'PASS' if r['ok'] else 'FAIL'}  검토 화면 조작 ({time.time()-t0:.0f}s)\n        {r['info']}")
    if total:
        print('  종류별 합계(깨끗한 이미지+사진): ' + ' · '.join(f'{REDACT_LABEL.get(k, k)} {a[0]}/{a[1]}' for k, a in total.items()))
        print(f'  결과: {od}')
    return fails
REDACT_LABEL = {'rrn': '주민', 'frn': '외국인', 'phone': '전화', 'account': '계좌', 'email': '이메일', 'name': '이름 후보'}

# ---------------- 실제 서버 환경 (Live Server처럼) ----------------
# 다른 테스트는 페이지 요청을 가로채 파일을 넣어 주지만, 여기서는 진짜 정적 서버를 띄움 — 저장소 루트를 사이트 루트로,
# 확장자대로 Content-Type, gzip 자동 처리 없음(VS Code Live Server·깃허브 페이지와 같은 방식).
# 사용자와 같은 흐름(파일 선택 → 글자 추출 카드 → 처리하기)으로 OCR이 끝까지 되는지, 엔진·언어 파일을 못 받을 때
# 멈추지 않고 원인에 맞는 안내가 나오는지 확인. (Live Server에서 OCR 엔진을 불러오지 못했던 일로 추가)
def start_static_server():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(REPO)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f'http://127.0.0.1:{srv.server_address[1]}'

def run_serve_tests(browser):
    photo = PRIVATE / 'photo01.jpg'
    if not photo.is_file():
        print('  SKIP  tests/private/photo01.jpg 가 없어서 건너뜀')
        return 0
    srv, base = start_static_server()
    fails = 0
    cases = [
        ('정상 — 업로드 → 글자 추출 카드 → 글자 추출 끝까지', None, None),
        ('엔진 파일을 못 받을 때 — 멈추지 않고 안내', 'tesseract.min.js', '엔진 파일'),
        ('언어 파일을 못 받을 때 — 멈추지 않고 안내', 'kor.traineddata.gz', '언어 데이터'),
    ]
    try:
        for name, block, want in cases:
            ctx = browser.new_context(); pg = ctx.new_page()
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            if block: pg.route(f'**/{block}', lambda r: r.fulfill(status=404, body='Not Found'))
            t0 = time.time()
            try:
                pg.goto(base + '/works/docflow/index.html')
                pg.evaluate("document.querySelectorAll('.notice-overlay').forEach(e=>e.classList.remove('show'))")
                pg.set_input_files('#fileInput', str(photo))
                pg.wait_for_function("/×/.test(document.getElementById('fileBadge').textContent)", timeout=60000)
                pg.wait_for_timeout(800)
                pg.click('.preset-card:has-text("글자 추출")')
                pg.click('#processBtn'); pg.wait_for_timeout(300)
                pg.wait_for_function("!document.getElementById('spinnerLine').classList.contains('show')", timeout=240000)
                warn = pg.inner_text('#warningBox') if pg.is_visible('#warningBox') else ''
                panel = pg.is_visible('#ocrPanel')
                text = pg.input_value('#ocrTextArea') if panel else ''
                w, h = pg.evaluate("[resultCanvas.width, resultCanvas.height]")
                if want is None:
                    ok = panel and not warn and len(re.findall(r'[가-힣]', text)) > 50 and w > h and not errs
                    info = f'읽은 한글 {len(re.findall(r"[가-힣]", text))}자 · 결과 {w}x{h}(가로) · 안내 {warn or "없음"}'
                else:
                    ok = (not panel) and want in warn and '인터넷 연결을 확인' not in warn and not errs
                    info = f'안내: {warn[:60]}…'
            except Exception as e:
                ok, info = False, f'오류/시간 초과: {str(e)[:120]}'
            ctx.close()
            fails += 0 if ok else 1
            print(f"  {'PASS' if ok else 'FAIL'}  {name}  ({time.time()-t0:.0f}s)\n        {info}" + (f"\n        페이지 오류: {errs[:2]}" if errs else ''))
    finally:
        srv.shutdown()
    return fails


# ---------------- 비공개 값 유출 검사 ----------------
# private/의 기대값 JSON(photo05_expected.json 등)에 적힌 실제 값이 저장소에 올라가는 파일(git이 추적하는 파일 +
# 아직 추적 안 했지만 .gitignore에 없어 다음 커밋에 들어갈 수 있는 파일)에 들어 있으면 실패.
# 2026-10-12 사진 05의 실제 이메일·담당자 이름이 테스트·주석·NOTES에 들어간 채 커밋됐던 일로 추가(올리기 전에 기록에서 지움).
# 실제 값은 출력하지 않고 "파일:줄 (종류)"만 알려줌
LEAK_SKIP_KEYS = ('_',)            # "_설명" 같은 설명용 키는 실제 값이 아님
LEAK_ORG_COMMON = {'mail', 'www', 'ac', 'co', 'or', 'go', 're', 'ne', 'kr', 'com', 'net', 'org'}

def private_leak_patterns():
    pats = []
    def add(kind, value):
        if not isinstance(value, str) or len(value.strip()) < 3:
            return
        v = value.strip()
        if re.fullmatch(r'[가-힣]{2,5}', v):          # 한글 이름 — 엔진이 글자마다 나눈 모양("가|나|다", "가 나 다")도
            pats.append((kind, re.compile(r'[\s|]?'.join(map(re.escape, v)))))
        elif re.fullmatch(r'[\d\s().+-]{9,}', v):     # 전화번호 — 구분자(-, ., 공백, 괄호)가 달라도
            digits = re.sub(r'\D', '', v)
            pats.append((kind, re.compile(r'[\s().-]?'.join(digits))))
        else:
            pats.append((kind, re.compile(re.escape(v), re.I)))
            if '@' in v:                              # 이메일 — 아이디만, 기관 도메인만 들어가도(점이 빠진 OCR 모양 포함)
                uid, dom = v.split('@', 1)
                if len(uid) >= 3:
                    pats.append((kind + ' 아이디', re.compile(r'(?<![\w.])' + re.escape(uid) + r'(?![\w])', re.I)))
                for part in dom.split('.'):
                    if len(part) >= 3 and part.lower() not in LEAK_ORG_COMMON:
                        pats.append((kind + ' 도메인', re.compile(re.escape(part) + r'(?=\.?(?:ac|co|or|go|kr|com|net|org))', re.I)))
    def walk(kind, node):
        if isinstance(node, dict):
            for k, v in node.items():
                if not k.startswith(LEAK_SKIP_KEYS): walk(k, v)
        elif isinstance(node, list):
            for v in node: walk(kind, v)
        else:
            add(kind, node)
    files = sorted(PRIVATE.glob('*.json')) if PRIVATE.is_dir() else []
    for f in files:
        walk(f.stem, json.loads(f.read_text(encoding='utf-8')))
    return files, pats

def run_leak_check():
    files, pats = private_leak_patterns()
    if not pats:
        print('  SKIP  비공개 값 유출 검사 — tests/private/ 에 기대값 JSON이 없어서 건너뜀')
        return 0
    git = lambda *a: subprocess.run(['git', *a, '-z'], cwd=REPO, capture_output=True).stdout.decode('utf-8').split('\0')
    targets = sorted({f for f in git('ls-files') + git('ls-files', '--others', '--exclude-standard') if f})
    found, checked = [], 0
    for rel in targets:
        fp = REPO / rel
        if not fp.is_file() or fp.stat().st_size > 20_000_000:
            continue
        try:
            text = fp.read_bytes().decode('utf-8')
        except UnicodeDecodeError:
            continue                                   # 그림·엔진 파일 등 글자가 아닌 파일
        checked += 1
        for i, line in enumerate(text.splitlines(), 1):
            kinds = sorted({k for k, p in pats if p.search(line)})
            if kinds: found.append(f'{rel}:{i} ({", ".join(kinds)})')
    ok = not found
    print(f"  {'PASS' if ok else 'FAIL'}  비공개 값 유출 검사 — 기대값 {len(files)}개 파일의 값 {len(pats)}가지 × 올라가는 글자 파일 {checked}개"
          + ('' if ok else f'\n        실제 값이 들어 있는 곳 {len(found)}곳 (값은 출력하지 않음):'))
    for loc in found[:50]: print(f'          {loc}')
    if len(found) > 50: print(f'          … 외 {len(found) - 50}곳')
    return 0 if ok else 1


def main():
    sys.stdout.reconfigure(encoding='utf-8')  # Windows 콘솔(cp949)에서 한글·이모지 안내 문구 출력 오류 방지
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    # 비공개 값 유출 검사는 어느 테스트를 돌리든 맨 먼저(브라우저 없이 몇 초)
    print('■ 비공개 값 유출 검사 (private 기대값의 실제 값이 저장소 파일에 있는지)')
    fails = run_leak_check()
    if which == 'leak':
        print(f"\n{'모두 통과' if not fails else f'실패 {fails}건'}")
        sys.exit(1 if fails else 0)
    photos_ready = PRIVATE.exists() and any(PRIVATE.glob('photo*.jpg'))
    out_dir = PRIVATE / 'results' / time.strftime('%Y%m%d-%H%M%S')

    def route(r):
        # 저장소 루트를 사이트 루트로 — index.html의 ../../assets/ (pdf.js·OCR 엔진 등)도 실제 사이트처럼 불러옴
        path = urllib.parse.unquote(urllib.parse.urlsplit(r.request.url).path)
        f = (REPO / path.lstrip('/')).resolve()
        if REPO in f.parents and f.is_file():
            ctype = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.gz': 'application/gzip'}.get(f.suffix)
            return r.fulfill(path=str(f), content_type=ctype) if ctype else r.fulfill(path=str(f))
        return r.fulfill(status=404)

    def save(prefix, images):
        if not images:
            return
        out_dir.mkdir(parents=True, exist_ok=True)
        for k, v in images.items():
            (out_dir / f'{prefix}_{k}.png').write_bytes(base64.b64decode(v.split(',', 1)[1]))

    with sync_playwright() as p:
        browser = p.chromium.launch()

        def fresh_page():
            pg = browser.new_page()
            pg.route(BASE + '/**', route)
            pg.goto(PAGE)
            pg.evaluate(HELPERS)
            return pg

        if which in ('all', 'synthetic'):
            print('■ 합성 이미지 테스트')
            for i, (name, body) in enumerate(SYNTHETIC.items(), 1):
                pg = fresh_page()
                t0 = time.time()
                try:
                    res = pg.evaluate('async () => {' + body + '}')
                except Exception as e:
                    res = {'ok': False, 'info': f'오류: {e}'}
                pg.close()
                fails += 0 if res['ok'] else 1
                print(f"  {'PASS' if res['ok'] else 'FAIL'}  {name}  ({time.time()-t0:.1f}s)\n        {res['info']}")
                if not res['ok'] and photos_ready:  # 실패했을 때만 비교 이미지를 private에 남김
                    save(f's{i}', res.get('images'))

        if which in ('all', 'photo'):
            print('■ 실제 사진 테스트')
            if not photos_ready:
                print('  SKIP  tests/private/ 에 photo*.jpg 가 없어서 건너뜀')
            else:
                for i, (file, checks, opts, check) in enumerate(PHOTO, 1):
                    label = f"{file} [{', '.join(checks)}]"
                    if not (PRIVATE / file).is_file():
                        print(f'  SKIP  {label} — 사진 없음')
                        continue
                    pg = fresh_page()
                    try:
                        res = pg.evaluate('async (ARGS) => {' + PHOTO_JS + '}', [file, checks, opts])
                        ok, info = check(res) if res['ok'] else (False, '결과 없음')
                    except Exception as e:
                        res, ok, info = {}, False, f'오류: {e}'
                    pg.close()
                    fails += 0 if ok else 1
                    save(f'p{i:02d}_{pathlib.Path(file).stem}', res.get('images'))
                    extra = f" · {res.get('size')} · {res.get('ms', 0)/1000:.1f}s · 안내={res.get('warning') or '없음'}" if res else ''
                    print(f"  {'PASS' if ok else 'FAIL'}  {label}\n        {info}{extra}")
                if out_dir.exists():
                    print(f'  결과 이미지: {out_dir}')
        if which in ('all', 'redact', 'redact-make'):
            print('■ 정보 가리기 (가상 문서 — 자동 검출·가린 저장본)')
            fails += run_redact_tests(fresh_page, out_dir, remake=which == 'redact-make')

        if which in ('all', 'serve'):
            print('■ 실제 서버 환경 (Live Server처럼 띄워 업로드 → OCR)')
            fails += run_serve_tests(browser)

        if which in ('all', 'ocr'):
            print('■ 글자 추출(OCR) 정확도 비교')
            f_ocr, table = run_ocr_tests(fresh_page, out_dir)
            fails += f_ocr
            if table:
                print('\n' + table)
                print(f'  결과: {out_dir / "ocr"}')
        browser.close()

    print(f"\n{'모두 통과' if not fails else f'실패 {fails}건'}")
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
