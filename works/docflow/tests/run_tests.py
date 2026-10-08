"""DocFlow 회귀 테스트

실행:  python works/docflow/tests/run_tests.py            (전체)
       python works/docflow/tests/run_tests.py synthetic  (합성 이미지 테스트만)
       python works/docflow/tests/run_tests.py photo      (실제 사진 테스트만)
준비:  pip install playwright  →  python -m playwright install chromium

· 합성 이미지 테스트: 사진 없이 브라우저에서 직접 그린 이미지로 검사 — 항상 실행
· 실제 사진 테스트: tests/private/ 에 사진이 있을 때만 실행 (없으면 SKIP)
  결과 이미지는 tests/private/results/<시각>/ 에 저장 — 문서 내용이 담겨 있어 private 안에 둠(.gitignore)
  자동 판정은 기본 수치(오류 없음·선분 수 등)만 하고, 글자 보존 같은 화질은 저장된 이미지를 눈으로 확인
"""
import base64, json, pathlib, sys, time
from playwright.sync_api import sync_playwright

TESTS = pathlib.Path(__file__).resolve().parent
DOCFLOW = TESTS.parent
PRIVATE = TESTS / 'private'
BASE = 'http://docflow.test'

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

'프리셋 — OCR·문서 보관 구성과 "포함됨" 표시': r"""
  const card = n=>[...document.querySelectorAll('.preset-card')].find(el=>el.textContent.includes(n));
  const row = n=>[...document.querySelectorAll('.check-row')].find(el=>el.querySelector('.check-name').textContent===n);
  const fail = [];
  card('OCR 최적화').click();
  if(!checked.has('autoCrop')) fail.push('OCR: 원근 보정 빠짐');
  if(checked.has('deskew') || checked.has('grayscale')) fail.push('OCR: 기울기/흑백 변환이 체크됨');
  if(!row('기울기 자동 보정').classList.contains('disabled')) fail.push('원근 보정 켜짐인데 기울기 보정이 흐리지 않음');
  row('기울기 자동 보정').click(); if(checked.has('deskew')) fail.push('포함된 기울기 보정이 클릭으로 체크됨');
  if(!row('흑백 변환').classList.contains('disabled')) fail.push('스캔 효과(흑백)인데 흑백 변환이 흐리지 않음');
  row('문서 자동 크롭 · 원근 보정').click(); // 원근 보정 끄기
  if(row('기울기 자동 보정').classList.contains('disabled')) fail.push('원근 보정을 꺼도 기울기 보정이 흐림');
  card('문서 보관').click();
  if(checked.has('deskew')) fail.push('문서 보관: 기울기 보정이 체크됨');
  return { ok: !fail.length, info: fail.join(' / ') || 'OCR·문서 보관 구성, 포함됨 표시·클릭 차단 정상' };
""",
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
  await T.load('/private/'+file, file);
  // 표 선 제거가 있으면 그 단계의 선분 수를 기록
  let segV = -1, segH = -1; const orig = PROCESSORS.removeLines;
  PROCESSORS.removeLines = async (c, s)=>{ const r = await orig(c, s); const D = removeTableLines.debug; if(D){ segV=D.segments.v.length; segH=D.segments.h.length; } return r; };
  const r = await T.process(checks, opts);
  PROCESSORS.removeLines = orig;
  return { ok: !!r.canvas, segV, segH, ms: r.ms, warning: r.warning, size: r.canvas ? r.canvas.width+'x'+r.canvas.height : '-',
           images: r.canvas ? { result: T.png(r.canvas) } : {} };
"""


def main():
    sys.stdout.reconfigure(encoding='utf-8')  # Windows 콘솔(cp949)에서 한글·이모지 안내 문구 출력 오류 방지
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    photos_ready = PRIVATE.exists() and any(PRIVATE.glob('photo*.jpg'))
    out_dir = PRIVATE / 'results' / time.strftime('%Y%m%d-%H%M%S')
    fails = 0

    def route(r):
        url = r.request.url
        if url == BASE + '/index.html':
            return r.fulfill(path=str(DOCFLOW / 'index.html'), content_type='text/html; charset=utf-8')
        if url.startswith(BASE + '/private/'):
            f = PRIVATE / url[len(BASE + '/private/'):]
            return r.fulfill(path=str(f)) if f.is_file() else r.fulfill(status=404)
        return r.continue_()

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
            pg.goto(BASE + '/index.html')
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
        browser.close()

    print(f"\n{'모두 통과' if not fails else f'실패 {fails}건'}")
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
