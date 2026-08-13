# VALUE LEGEND PRO
## Graham · Buffett · Li Lu 가치투자 전문 분석 툴

### 실행 방법

```bash
# 1. 이 폴더에서
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 열기
http://localhost:3000
```

### 기능
- 티커 입력 → 실시간 재무 데이터 자동 수집 (FMP API)
- Graham 내재가치, Graham Number, NCAV, 7대 기준 자동 계산
- Buffett 오너어닝, DCF, 해자 체크리스트 자동 계산
- Li Lu 5대 프레임워크 자동 평가
- 5년/10년 주가 차트
- Claude AI 심층 투자보고서 자동 생성

### 주의
- FMP 무료 플랜: 하루 250 API 콜 (티커당 8콜 사용)
- Node.js 18 이상 필요
