export async function POST(request) {
  try {
    const { d } = await request.json();
    const fN=(v,dd=2)=>(v==null||isNaN(+v))?"—":(+v).toFixed(dd);
    const fB=v=>{if(v==null||isNaN(+v))return"—";const a=Math.abs(+v);return a>=1e12?(v/1e12).toFixed(2)+"T":a>=1e9?(v/1e9).toFixed(2)+"B":a>=1e6?(v/1e6).toFixed(2)+"M":(+v).toFixed(0);};
    const fP=v=>(v==null||isNaN(+v))?"—":((+v)*100).toFixed(1)+"%";

    const prompt = `당신은 Graham·Buffett·Li Lu 철학의 최고 수준 가치투자 애널리스트입니다.

${d.name}(${d.ticker}) 실제 재무 데이터:
현재가:$${fN(d.price)} | 시총:${fB(d.marketCap)} | 베타:${fN(d.beta)}
PER:${fN(d.pe,1)}x | PBR:${fN(d.pb,2)}x | EPS:$${fN(d.eps)}
Graham IV:$${fN(d.grahamIV)} (마진 ${fN(d.grahamMargin,1)}%) | Graham#:$${fN(d.grahamNum)} | DCF IV:$${fN(d.dcfIV)}
매출:${fB(d.revenue)} | 순이익:${fB(d.netIncome)} | 매출성장:${fP(d.revenueGrowth)}
ROE:${fP(d.roe)} | 영업이익률:${fP(d.opMargin)} | 매출총이익률:${fP(d.grossMargin)}
FCF:${fB(d.fcf)} | 오너어닝:${fB(d.ownerEarnings)} | D/E:${fN(d.deRatio,2)} | 유동비율:${fN(d.currentRatio,2)}
Piotroski F-Score:${d.fScore}/9 | Altman Z-Score:${fN(d.zScore,2)}
Graham:${d.gScore}/100 | Buffett:${d.bScore}/100 | Li Lu:${d.lScore}/100

# ${d.name} (${d.ticker}) 가치투자 심층 분석 보고서

## 1. Benjamin Graham 관점
Graham 7대 기준 수치 대입, 내재가치·안전마진·NCAV 상세 분석 (700자 이상)

## 2. Warren Buffett 관점
해자 종류·강도, 오너어닝, ROE/ROIC, 자본배분, DCF 분석 (700자 이상)

## 3. Li Lu 관점
문명 진보 부합성, 불가역적 성장, 집중투자 적합성 (700자 이상)

## 4. 종합 투자 의견
**투자 등급:** 강력매수/매수/관망/매도/강력매도
**목표주가:** $X ~ $Y
**핵심 강점:**
- 강점1
- 강점2
- 강점3
**핵심 리스크:**
- 리스크1
- 리스크2
- 리스크3
**최종 의견:** (500자 이상)`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) throw new Error("Claude API " + res.status);
    const json = await res.json();
    return Response.json({ report: json.content?.find(b=>b.type==="text")?.text || "" });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
