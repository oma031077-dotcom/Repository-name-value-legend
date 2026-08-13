export async function POST(request) {
  try {
    const { d, type } = await request.json();
    const fN = (v,dd=2) => (v==null||isNaN(+v)) ? "—" : (+v).toFixed(dd);
    const fB = v => { if(!v||isNaN(+v)) return "—"; const a=Math.abs(+v); return a>=1e12?(v/1e12).toFixed(2)+"T":a>=1e9?(v/1e9).toFixed(2)+"B":a>=1e6?(v/1e6).toFixed(2)+"M":(+v).toFixed(0); };
    const fP = v => (v==null||isNaN(+v)) ? "—" : ((+v)*100).toFixed(1)+"%";

    const baseInfo = `
기업명: ${d.name} (${d.ticker})
섹터: ${d.sector} / ${d.industry}
현재가: $${fN(d.price)} | 시총: ${fB(d.marketCap)} | 베타: ${fN(d.beta)}
매출: ${fB(d.revenue)} | 순이익: ${fB(d.netIncome)} | FCF: ${fB(d.fcf)}
매출성장: ${fP(d.revenueGrowth)} | 순이익성장: ${fP(d.netIncomeGrowth)}
ROE: ${fP(d.roe)} | ROIC: ${fP(d.roic)} | 매출총이익률: ${fP(d.grossMargin)}
영업이익률: ${fP(d.opMargin)} | 순이익률: ${fP(d.profMargin)}
PER: ${fN(d.pe,1)}x | PBR: ${fN(d.pb,2)}x | EV/EBITDA: ${fN(d.evEbitda,1)}x
부채비율: ${fN(d.deRatio,2)} | 유동비율: ${fN(d.currentRatio,2)} | 이자보상배율: ${fN(d.interestCoverage,1)}x
Graham IV: $${fN(d.grahamIV)} (마진 ${fN(d.grahamMargin,1)}%) | DCF: $${fN(d.dcfIV)}
Piotroski F-Score: ${d.fScore}/9 | Altman Z-Score: ${fN(d.zScore,2)} | Beneish M-Score: ${fN(d.mScore,2)}
EPS 5년 CAGR: ${fP(d.epsCagr5y)} | WACC: ${fP(d.wacc)}
`;

    let prompt = "";

    if (type === "decoder") {
      prompt = `당신은 CPA(공인회계사) 출신 가치투자 전문가입니다. Warren Buffett, Charlie Munger, Peter Lynch의 철학으로 기업을 분석합니다.

${baseInfo}

아래 형식으로 ${d.name}(${d.ticker}) 기업 해독 카드를 작성하세요.

## 2분 드릴 한 문장
(초등학생에게 2분 안에 설명 가능한 수준. 업계 용어 금지. 이 회사가 어떻게 돈을 버는지 한 문장으로. 예: "코카콜라는 전 세계 사람들이 평생 마시는 음료를 만들어 슈퍼마켓·식당·자판기에 팔고, 한 번 브랜드에 익숙해지면 평생 바꾸지 않는 습관을 파는 회사입니다.")

## 돈 버는 구조
사업부문별 매출과 이익 비중. 어디서 진짜 돈을 버는지.
형식:
- [사업부문]: 매출 비중 XX% | 이익 기여 추정 XX% | 특징
(데이터로 확인된 내용만. 모르면 "확인 필요")

## 이 업종의 핵심 KPI
매출·이익 외에 이 업종에서 진짜 봐야 할 지표 3개와 현재 수치.
형식:
- [KPI명]: [현재값] — [왜 중요한지 한 줄]

## 경쟁우위 (해자) 분석
해자의 종류와 강도. 매출총이익률 ${fP(d.grossMargin)} 기준으로 판단.
- 해자 종류: (브랜드/네트워크효과/전환비용/원가우위/규모경제 중)
- 해자 강도: 강함/보통/약함
- 근거: (구체적 수치 기반)

## 망하는 시나리오 → 리스크 3개
나열이 아닌 이야기로. "이 회사가 망한다면..." 으로 시작하는 한 문장 시나리오 후 리스크 3개.
- 리스크 1: [제목] — [구체적 내용]
- 리스크 2: [제목] — [구체적 내용]  
- 리스크 3: [제목] — [구체적 내용]

## 재무 신호등
아래 항목별로 ✅ 양호 / ⚠️ 주의 / 🚨 위험 중 하나와 한 줄 이유:
- 수익성 (ROE ${fP(d.roe)}, 영업이익률 ${fP(d.opMargin)})
- 성장성 (매출성장 ${fP(d.revenueGrowth)})
- 재무건전성 (부채비율 ${fN(d.deRatio,2)}, 유동비율 ${fN(d.currentRatio,2)})
- 현금창출력 (FCF ${fB(d.fcf)}, FCF마진 ${fP(d.fcfMargin)})
- 이익 품질 (Piotroski ${d.fScore}/9, Beneish ${fN(d.mScore,2)})

## 아직 모르는 것
이 카드로 답이 안 나온 질문 2~3개. 다음에 더 파봐야 할 곳.

규칙: 모르는 것은 추정하지 말고 "확인 필요"로 표기. 매매 신호("사라/팔아라") 절대 금지.`;

    } else if (type === "price") {
      const impliedG = d.fcfPerSh && d.price && d.wacc
        ? Math.max(d.wacc - d.fcfPerSh / d.price, 0)
        : null;

      prompt = `당신은 CPA(공인회계사) 출신 가치투자 전문가입니다. 역DCF(Reverse DCF)로 현재 주가가 요구하는 성장률을 분석합니다.

${baseInfo}
역DCF 계산 결과:
- 시장 내재 성장률 (역DCF): ${impliedG ? fP(impliedG) : "계산불가"}
- 실제 EPS 5년 CAGR: ${fP(d.epsCagr5y)}
- 실제 매출 성장률 (YoY): ${fP(d.revenueGrowth)}
- WACC (베타 기반): ${fP(d.wacc)}
- FCF: ${fB(d.fcf)} | FCF/주: $${fN(d.fcfPerSh)}

아래 형식으로 ${d.name}(${d.ticker}) 가격 판독 카드를 작성하세요.

## 결론 — 두 문장으로
첫 문장: "지금 ${d.name} 주가는 앞으로 10년간 매년 약 X%의 FCF 성장을 가정하고 있습니다."
두 번째 문장: "그런데 지난 실제 성장률은 Y%였습니다."
(수치는 위 데이터 기반으로 계산. 모르면 추정하지 말고 "데이터 부족으로 계산불가"라고 적을 것)

## 시장이 요구하는 것 vs 실제 성적
- 시장 요구 성장률: X%
- 실제 과거 성장률: Y%
- 판정: [요구치가 과거보다 높으면 "시장이 과도한 기대 중 — 고평가 가능성" / 낮으면 "현실적 기대 — 저평가 가능성" / 비슷하면 "적정한 기대치"]
- 핵심 질문: "X% 성장을 앞으로도 유지할 수 있는가?"

## 민감도 분석 (할인율별 요구 성장률)
| 할인율(WACC) | 요구 성장률 | 판정 |
|---|---|---|
| 8% (안정 낙관) | X% | |
| 9% (기본) | X% | |
| 10% (일반) | X% | |
| 12% (보수적) | X% | |
(각 할인율에서 현재가를 정당화하는 FCF 성장률 역산. 실제 계산으로. 암산 금지)

## FCF 품질 점검
- FCF vs 순이익 비율: ${d.fcf && d.netIncome ? fP(+d.fcf/+d.netIncome) : "계산불가"}
- 이상치 여부: FCF가 정상 범위인지 판단
- 신뢰도: 높음/보통/낮음 + 이유

## 이익 vs 현금 교차검증
영업이익(${fB(d.opIncome)})과 FCF(${fB(d.fcf)})의 방향성 비교.
반대로 움직이면 🚨 경고, 같은 방향이면 ✅ 정상.

## 이 숫자는 판단의 시작이지 답이 아닙니다
앞으로 더 파봐야 할 핵심 질문 2개.

규칙: "사라/팔아라" 절대 금지. 역DCF는 시장의 기대치만 보여주며 적정가를 말하지 않음을 명시.`;

    } else if (type === "story") {
      prompt = `당신은 CPA(공인회계사) 출신 가치투자 전문가입니다. 재무 데이터로 기업의 지난 흐름을 분석합니다.

${baseInfo}
연간 실적 추이:
${d.incHistory?.map(y => `${y.year}: 매출 ${fB(y.revenue)}, 순이익 ${fB(y.netIncome)}, EPS $${fN(y.eps)}, 총이익률 ${fP(y.grossMargin)}, 영업이익률 ${fP(y.opMargin)}`).join('\n') || "데이터 없음"}

아래 형식으로 ${d.name}(${d.ticker}) 스토리 분석 카드를 작성하세요.

## 지난 3~5년을 한 문장으로
이 기간 이 회사에 무슨 일이 있었는지 한 문장 스토리. 나열 금지, 이야기로.

## 재무 흐름의 변화
매출/이익/FCF/마진의 추세를 분석. 개선 중인지 악화 중인지.
- 매출 흐름: 
- 이익 품질 변화: 
- 마진 추세: 개선/유지/악화 + 이유

## 수익성 추세 신호등
- 매출총이익률 추세: ✅/⚠️/🚨
- 영업이익률 추세: ✅/⚠️/🚨
- FCF 전환율 추세: ✅/⚠️/🚨

## 재무건전성 변화
부채·현금·자기자본의 흐름.
- 부채비율 ${fN(d.deRatio,2)}: 개선/악화?
- 순부채 ${fB(d.netDebt)}: 감소/증가 추세?
- 자기자본 성장률 ${fP(d.equityGrowth)}

## 핵심 경고 신호
Beneish M-Score ${fN(d.mScore,2)}, Altman Z-Score ${fN(d.zScore,2)}, Piotroski ${d.fScore}/9 기반
🚨 있으면 구체적으로, 없으면 "현재 주요 경고 신호 없음"

## 지금 이 회사의 스토리
위 모든 것을 종합해서 "지금 이 회사는 어떤 국면인가"를 한 단락으로.
(성장 가속화 / 성숙 안정 / 턴어라운드 / 하락 중 / 구조적 변화 중 등)

규칙: 데이터에 있는 사실과 해석을 명확히 구분. [사실] [해석] 태그 사용. "사라/팔아라" 절대 금지.`;
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      }),
    });

    if (!res.ok) throw new Error("Claude API " + res.status);
    const json = await res.json();
    const text = json.content?.find(b => b.type === "text")?.text || "";
    return Response.json({ result: text });

  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
