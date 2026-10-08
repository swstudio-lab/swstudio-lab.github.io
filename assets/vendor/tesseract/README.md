# Tesseract.js (DocFlow OCR용, 로컬 보관)

문서가 기기 밖으로 나가지 않도록 CDN 대신 이 폴더에서 불러옵니다. DocFlow에서 "글자 읽기(OCR)"를 실행할 때만 불러옵니다.

| 파일 | 출처 | 라이선스 |
|---|---|---|
| tesseract.min.js, worker.min.js | npm `tesseract.js@7.0.0` (dist) | Apache-2.0 (LICENSE-tesseract.js.md) |
| tesseract-core-simd-lstm.wasm.js, tesseract-core-lstm.wasm.js | npm `tesseract.js-core@7.0.0` | Apache-2.0 (LICENSE-tesseract.js-core) |
| lang/kor.traineddata.gz, lang/eng.traineddata.gz | npm `@tesseract.js-data/kor@1.0.0`, `@tesseract.js-data/eng@1.0.0` (`4.0.0_best_int`, 원본: tesseract-ocr/tessdata_best) | Apache-2.0 (tessdata), 패키지 MIT |

- 코어는 LSTM 전용 두 가지만 넣음: WebAssembly SIMD가 되는 브라우저는 simd-lstm, 안 되면 lstm (DocFlow가 직접 골라서 지정)
- 언어 데이터는 best_int(정수형 LSTM) — tesseract.js 기본값, 정확도와 크기의 균형
