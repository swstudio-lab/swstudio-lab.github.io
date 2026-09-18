# CASE-003 사운드 출처

전부 CC0(퍼블릭 도메인) — 저작권 표시 의무 없음. 참고용으로 출처만 기록.
원본 저장소: https://github.com/lavenderdotpet/CC0-Public-Domain-Sounds

## bgm/ — 003 전용 신규 5개
- `hq-ambient.mp3` (1장, 로비) — "warfork-cc0" 팩 / ambient/ceilingfan.ogg
- `hq-office-hum.mp3` (3장, 관리자 집무실) — "100-cc0-sfx-2" 팩 /
  sfx100v2_loop_ambient_04.ogg
- `origin-drone.mp3` (4장, 병원 진짜 근원지) — "Micro Pack - Record Fuzzies" /
  Ambient Noise 4.wav
- `vault-hum.mp3` (5장, 원본 기록 보관고) — "Micro Pack - Record Fuzzies" /
  Ambient Noise 2.wav
- `climax-theme-003.mp3` (5장, 클라이맥스) — "Maximiliano-Stradex-Ambient"
  팩 / Ambient_2.mp3 (001의 climax-theme/title-theme이 이 팩의 다른 트랙을
  썼던 것과 같은 음악 패밀리 — 시리즈 톤 일관성 유지 목적으로 골랐음)

## bgm/ — 001에서 그대로 재사용 필요 (이 zip엔 파일 없음, 아래 참고)
- `title-theme.mp3` — case001/case002와 동일 파일. 작업 환경이 리셋돼서
  지금 제가 직접 복사는 못 하고, Claude Code가 실제 프로젝트에서
  cases/case001/assets/bgm/title-theme.mp3를
  cases/case003/assets/bgm/title-theme.mp3로 복사하면 됨(파일이 이미
  프로젝트 안에 있으니 트리비얼한 작업).

## sfx/ — 001/002에서 그대로 재사용 필요 (이 zip엔 파일 없음)
door-creak.mp3, footstep.mp3, item-chime.mp3, paper-flip.mp3,
radio-click.mp3, tape-click.mp3 — 003 스크립트엔 명시적 sfx 태그가 없지만,
main.js의 자동 트리거(아이템 획득 시 item-chime, 관리자 대사 시 radio-click
등)가 케이스 무관하게 항상 동작하니 이 6개도 003 폴더에 있어야 정상 작동함.
title-theme.mp3와 마찬가지로 Claude Code가 cases/case001/assets/sfx/ 전체를
cases/case003/assets/sfx/로 복사하면 됨.

## 참고
파일명/카테고리 기준으로 골랐고 실제로 들어보고 고른 게 아니라서, 반드시
재생해보고 톤이 안 맞으면 알려주세요 — 같은 저장소에 대체 후보가 더 있어서
바로 다른 걸로 교체 가능합니다.

## 파일 길이 참고
hq-ambient: 12.2초 / hq-office-hum: 10.2초 / origin-drone: 27초 /
vault-hum: 11.4초 / climax-theme-003: 111초(1분 51초, climax-theme.mp3와
비슷한 길이대)
