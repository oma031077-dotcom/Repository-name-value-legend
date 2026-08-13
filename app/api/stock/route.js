const AV_KEY = process.env.AV_KEY || "6ZXNTFU1VNXFKLW2";
const AV = "https://www.alphavantage.co/query";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const n = v => { const x = parseFloat(v); return isNaN(x) ? null : x; };

async function av(params) {
  for (let i = 0; i <= 2; i++) {
    try {
      const url = AV + "?" + new URLSearchParams({ ...params, apikey: AV_KEY });
      const res = await fetch(url);
      if (!res.ok) throw new Error("AV " + res.status);
      const json = await res.json();
      if (json["Note"] || json["Information"]) {
        if (i < 2) { await sleep(15000); continue; }
        return null;
      }
      return json;
    } catch(e) {
      if (i < 2) await sleep(3000); else return null;
    }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker")?.toUpperCase().trim();
  if (!ticker) return Response.json({ error: "티커를 입력하세요" }, { status: 400 });

  try {
    const overview = await av({ function: "OVERVIEW", symbol: ticker });
    if (!overview?.Symbol) throw new Error(`${ticker} 티커를 찾을 수 없습니다.`);
    await sleep(1200);
    const quoteData   = await av({ function: "GLOBAL_QUOTE", symbol: ticker }); await sleep(1200);
    const incomeData  = await av({ function: "INCOME_STATEMENT", symbol: ticker }); await sleep(1200);
    const balanceData = await av({ function: "BALANCE_SHEET", symbol: ticker }); await sleep(1200);
    const cashData    = await av({ function: "CASH_FLOW", symbol: ticker }); await sleep(1200);
    const monthlyData = await av({ function: "TIME_SERIES_MONTHLY_ADJUSTED", symbol: ticker }); await sleep(1200);
    const fxData      = await av({ function: "CURRENCY_EXCHANGE_RATE", from_currency: "USD", to_currency: "KRW" });

    const q   = quoteData?.["Global Quote"] || {};
    const inc = incomeData?.annualReports || [];
    const bs  = balanceData?.annualReports || [];
    const cf  = cashData?.annualReports || [];
    const usdKrw = n(fxData?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"]) || 1350;

    const i0=inc[0]||{}, i1=inc[1]||{}, i2=inc[2]||{}, i3=inc[3]||{}, i4=inc[4]||{};
    const b0=bs[0]||{}, b1=bs[1]||{};
    const c0=cf[0]||{}, c1=cf[1]||{};

    const price=n(q["05. price"]), change1d=n(q["10. change percent"]?.replace("%",""))/100;
    const name=overview.Name||ticker, sector=overview.Sector||"", industry=overview.Industry||"";
    const marketCap=n(overview.MarketCapitalization), pe=n(overview.PERatio), pb=n(overview.PriceToBookRatio);
    const eps=n(overview.EPS), bvps=n(overview.BookValue), beta=n(overview.Beta);
    const high52=n(overview["52WeekHigh"]), low52=n(overview["52WeekLow"]);
    const divYield=n(overview.DividendYield), divAmt=n(overview.DividendPerShare);
    const sharesOut=n(overview.SharesOutstanding);
    const roe=n(overview.ReturnOnEquityTTM), roa=n(overview.ReturnOnAssetsTTM);
    const opMarginOv=n(overview.OperatingMarginTTM), profMarginOv=n(overview.ProfitMargin);
    const revTTM=n(overview.RevenueTTM), grossProfTTM=n(overview.GrossProfitTTM);
    const ebitda=n(overview.EBITDA), evEbitda=n(overview.EVToEBITDA), evRevenue=n(overview.EVToRevenue);
    const peg=n(overview.PEGRatio), targetPrice=n(overview.AnalystTargetPrice), forwardPE=n(overview.ForwardPE);
    const grossMarginOv=grossProfTTM&&revTTM?grossProfTTM/revTTM:null;

    const revenue=n(i0.totalRevenue)||revTTM, revPrev=n(i1.totalRevenue);
    const revenueGrowth=revenue&&revPrev?(revenue-revPrev)/Math.abs(revPrev):null;
    const netIncome=n(i0.netIncome), netIncome1=n(i1.netIncome);
    const grossProfit=n(i0.grossProfit), opIncome=n(i0.operatingIncome);
    const interestExp=n(i0.interestExpense), rd=n(i0.researchAndDevelopment);
    const grossMargin=(grossProfit&&revenue?grossProfit/revenue:null)??grossMarginOv;
    const opMargin=(opIncome&&revenue?opIncome/revenue:null)??opMarginOv;
    const profMargin=(netIncome&&revenue?netIncome/revenue:null)??profMarginOv;
    const netIncomeGrowth=netIncome&&netIncome1?(netIncome-netIncome1)/Math.abs(netIncome1):null;
    const epsGrowth1y=n(i0.reportedEPS)&&n(i1.reportedEPS)?(n(i0.reportedEPS)-n(i1.reportedEPS))/Math.abs(n(i1.reportedEPS)):null;

    const eps0=n(i0.reportedEPS)||eps, eps1=n(i1.reportedEPS), eps4=n(i4.reportedEPS)||n(i3.reportedEPS);
    let epsCagr5y=null;
    if(eps0&&eps4&&eps4>0&&eps0>0) epsCagr5y=Math.pow(eps0/eps4,1/4)-1;
    else if(eps0&&eps1&&eps1>0&&eps0>0) epsCagr5y=(eps0-eps1)/Math.abs(eps1);

    const totalCash=n(b0.cashAndCashEquivalentsAtCarryingValue)||n(b0.cashAndShortTermInvestments);
    const totalDebt=n(b0.shortLongTermDebtTotal)||(n(b0.shortTermDebt)||0)+(n(b0.longTermDebt)||0);
    const equity=n(b0.totalShareholderEquity), equity1=n(b1.totalShareholderEquity);
    const totalAssets=n(b0.totalAssets), totalAssets1=n(b1.totalAssets);
    const currAssets=n(b0.totalCurrentAssets), currLiab=n(b0.totalCurrentLiabilities);
    const totalLiab=n(b0.totalLiabilities), inventory=n(b0.inventory);
    const receivables=n(b0.currentNetReceivables), receivables1=n(b1.currentNetReceivables);
    const retainedEarnings=n(b0.retainedEarnings), ppe=n(b0.propertyPlantEquipmentNet);
    const currentRatio=currAssets&&currLiab?currAssets/currLiab:null;
    const quickRatio=currAssets&&inventory&&currLiab?(currAssets-inventory)/currLiab:null;
    const deRatio=totalDebt&&equity?totalDebt/equity:null;
    const netDebt=totalDebt&&totalCash?totalDebt-totalCash:null;
    const debtToAssets=totalDebt&&totalAssets?totalDebt/totalAssets:null;
    const roic=netIncome&&equity&&totalDebt?netIncome/(equity+totalDebt):null;
    const equityGrowth=equity&&equity1?(equity-equity1)/Math.abs(equity1):null;
    const assetTurnover=revenue&&totalAssets?revenue/totalAssets:null;
    const equityMultiplier=totalAssets&&equity?totalAssets/equity:null;
    const dupont=profMargin&&assetTurnover&&equityMultiplier?profMargin*assetTurnover*equityMultiplier:null;
    const grossProfitability=grossProfit&&totalAssets?grossProfit/totalAssets:null;

    const opCF=n(c0.operatingCashflow), opCF1=n(c1.operatingCashflow);
    const capex=Math.abs(n(c0.capitalExpenditures)||0), capex1=Math.abs(n(c1.capitalExpenditures)||0);
    const depr=n(c0.depreciationDepletionAndAmortization);
    const fcf=opCF!=null?opCF-capex:null, fcf1=opCF1!=null?opCF1-capex1:null;
    const ownerEarnings=netIncome&&depr?netIncome+depr-capex:null;
    const fcfPerSh=fcf&&sharesOut?fcf/sharesOut:null;
    const fcfMargin=fcf&&revenue?fcf/revenue:null;
    const fcfGrowth=fcf&&fcf1&&fcf1!==0?(fcf-fcf1)/Math.abs(fcf1):null;
    const interestCoverage=opIncome&&interestExp?opIncome/Math.abs(interestExp):null;
    const capexIntensity=capex&&revenue?capex/revenue:null;

    // FCF 이상치 감지 (3년 평균 대비 ±40%)
    const fcfValues=[fcf,fcf1].filter(v=>v!=null);
    const fcfAvg=fcfValues.length>0?fcfValues.reduce((a,b)=>a+b,0)/fcfValues.length:null;
    const fcfAnomaly=fcf&&fcfAvg?Math.abs(fcf-fcfAvg)/Math.abs(fcfAvg)>0.4:false;

    // 이익 vs 현금 교차검증
    const profitCashDivergence=opIncome&&fcf?(opIncome>0&&fcf<0)||(opIncome<0&&fcf>0):false;

    const ev=marketCap&&totalDebt!=null&&totalCash!=null?marketCap+totalDebt-totalCash:null;
    const evFcf=ev&&fcf&&fcf>0?ev/fcf:null;
    const evEbit=ev&&opIncome&&opIncome>0?ev/opIncome:null;
    const evNopat=ev&&opIncome&&opIncome>0?ev/(opIncome*0.79):null;
    const priceFcf=price&&fcfPerSh&&fcfPerSh>0?price/fcfPerSh:null;
    const priceSales=price&&sharesOut&&revenue?price/(revenue/sharesOut):null;
    const earningsYield=ebitda&&ev&&ev>0?ebitda/ev:null;
    const fcfYield=fcf&&marketCap?fcf/marketCap:null;
    const acquirersMult=ev&&opIncome&&opIncome>0?ev/opIncome:null;
    const returnOnCapital=opIncome&&currAssets&&currLiab?opIncome/Math.max((currAssets-currLiab)+(ppe||0),1):null;

    // WACC
    const riskFreeRate=0.043, erp=0.055;
    const betaVal=(beta&&beta>0&&beta<3)?beta:1.0;
    const costOfEquity=riskFreeRate+betaVal*erp;
    const wacc=equity&&totalDebt?(equity/(equity+totalDebt))*costOfEquity+(totalDebt/(equity+totalDebt))*0.04*0.79:costOfEquity;
    const discountRate=Math.max(wacc,0.07);

    // 정밀 적정가
    const grahamG=Math.max(0,Math.min(epsCagr5y||revenueGrowth||0.05,0.15));
    const gv=grahamG*100;
    const grahamIV=eps&&eps>0?(eps*(8.5+2*gv)*4.4)/(0.042*100):null;
    const grahamNum=eps&&bvps&&eps>0&&bvps>0?Math.sqrt(22.5*eps*bvps):null;
    const dcfGrowth=Math.min(grahamG,0.12);
    const terminalG=Math.min(dcfGrowth*0.4,0.04);
    let dcfIV=null;
    if(fcfPerSh&&fcfPerSh>0&&discountRate>terminalG){
      let v=0;
      for(let yr=1;yr<=5;yr++) v+=(fcfPerSh*Math.pow(1+dcfGrowth,yr))/Math.pow(1+discountRate,yr);
      v+=(fcfPerSh*Math.pow(1+dcfGrowth,5)*(1+terminalG))/((discountRate-terminalG)*Math.pow(1+discountRate,5));
      dcfIV=v;
    } else if(eps&&eps>0&&discountRate>terminalG){
      let v=0;
      for(let yr=1;yr<=5;yr++) v+=(eps*Math.pow(1+dcfGrowth,yr))/Math.pow(1+discountRate,yr);
      v+=(eps*Math.pow(1+dcfGrowth,5)*(1+terminalG))/((discountRate-terminalG)*Math.pow(1+discountRate,5));
      dcfIV=v;
    }
    const lynchGR=(epsCagr5y||epsGrowth1y||revenueGrowth||0.05)*100;
    const lynchFV=eps&&eps>0&&lynchGR>0?eps*Math.max(lynchGR,1):null;
    const epv=opIncome&&opIncome>0?(opIncome*0.79)/discountRate/(sharesOut||1):null;
    const divG=Math.min(grahamG,0.06);
    const ddmIV=divAmt&&divAmt>0&&discountRate>divG?divAmt*(1+divG)/(discountRate-divG):null;
    const acquirerIV=opIncome&&sharesOut&&opIncome>0?(opIncome*0.79*15-(totalDebt||0)+(totalCash||0))/sharesOut:null;

    const grahamMargin=grahamIV&&price?(grahamIV-price)/grahamIV*100:null;
    const gnMargin=grahamNum&&price?(grahamNum-price)/grahamNum*100:null;
    const dcfMargin=dcfIV&&price?(dcfIV-price)/dcfIV*100:null;
    const lynchMargin=lynchFV&&price?(lynchFV-price)/lynchFV*100:null;
    const ncav=currAssets&&totalLiab?currAssets-totalLiab:null;
    const allFV=[grahamIV,grahamNum,dcfIV,lynchFV,epv,ddmIV,acquirerIV].filter(v=>v&&v>0&&v<price*10&&v>price*0.1);
    const sortedFV=[...allFV].sort((a,b)=>a-b);
    const fairValueMed=sortedFV.length>0?sortedFV[Math.floor(sortedFV.length/2)]:null;
    const fairValueLow=sortedFV.length>0?sortedFV[0]:null;
    const fairValueHigh=sortedFV.length>0?sortedFV[sortedFV.length-1]:null;
    const medMargin=fairValueMed&&price?(fairValueMed-price)/fairValueMed*100:null;

    // Piotroski
    let fScore=0; const fDetails=[];
    const push=(nm,ok)=>{fDetails.push({n:nm,ok:!!ok});if(ok)fScore++;};
    push("순이익 양수",netIncome>0); push("ROA 양수",roa>0);
    push("영업현금흐름 양수",opCF>0); push("현금흐름>순이익",opCF&&netIncome&&opCF>netIncome);
    const dR1=n(b1.shortLongTermDebtTotal)&&n(b1.totalShareholderEquity)?n(b1.shortLongTermDebtTotal)/n(b1.totalShareholderEquity):null;
    push("부채비율 감소",deRatio&&dR1&&deRatio<dR1);
    const cr1=n(b1.totalCurrentAssets)&&n(b1.totalCurrentLiabilities)?n(b1.totalCurrentAssets)/n(b1.totalCurrentLiabilities):null;
    push("유동비율 증가",currentRatio&&cr1&&currentRatio>cr1); push("신주발행 없음",true);
    const gm1=n(i1.grossProfit)&&n(i1.totalRevenue)?n(i1.grossProfit)/n(i1.totalRevenue):null;
    push("매출총이익률 증가",grossMargin&&gm1&&grossMargin>gm1);
    const at1=revPrev&&totalAssets1?revPrev/totalAssets1:null;
    push("자산회전율 증가",assetTurnover&&at1&&assetTurnover>at1);

    // Altman Z
    const wc=currAssets&&currLiab?currAssets-currLiab:null;
    let zScore=null;
    if(wc&&totalAssets&&opIncome&&marketCap&&revenue&&totalLiab)
      zScore=1.2*(wc/totalAssets)+1.4*((retainedEarnings||0)/totalAssets)+3.3*(opIncome/totalAssets)+0.6*(marketCap/totalLiab)+(revenue/totalAssets);

    // Beneish
    let mScore=null;
    try{
      if(receivables&&receivables1&&revenue&&revPrev&&grossMargin&&gm1){
        const dsri=(receivables/revenue)/(receivables1/revPrev);
        const gmi=gm1/grossMargin, sgi=revenue/revPrev;
        const tata=opIncome&&totalAssets?(opIncome-(opCF||0))/totalAssets:0;
        const lvgi=deRatio&&dR1?deRatio/dR1:1;
        mScore=-4.84+0.920*dsri+0.528*gmi+0.892*sgi+4.679*tata-0.327*lvgi;
      }
    }catch(e){}

    // Ohlson
    let oScore=null;
    try{
      if(totalAssets&&totalLiab&&netIncome&&opCF){
        const ta=Math.log(Math.max(totalAssets,1)), tlta=totalLiab/totalAssets;
        const wcta=wc?wc/totalAssets:0, clca=currLiab&&currAssets?currLiab/currAssets:0;
        const oeneg=totalLiab>totalAssets?1:0, nita=netIncome/totalAssets, futl=opCF/totalLiab;
        const intwo=(netIncome<0&&netIncome1<0)?1:0;
        const chin=netIncome&&netIncome1?(netIncome-netIncome1)/(Math.abs(netIncome)+Math.abs(netIncome1)):0;
        oScore=-1.32-0.407*ta+6.03*tlta-1.43*wcta+0.076*clca-1.72*oeneg-2.37*nita-1.83*futl+0.285*intwo-0.521*chin;
      }
    }catch(e){}

    // Quality Score
    let qualityScore=0;
    if(roe&&roe>0.15)qualityScore+=20;else if(roe&&roe>0.10)qualityScore+=10;
    if(grossProfitability&&grossProfitability>0.33)qualityScore+=20;else if(grossProfitability&&grossProfitability>0.20)qualityScore+=10;
    if(fcf&&netIncome&&netIncome>0&&fcf/netIncome>0.8)qualityScore+=20;else if(fcf&&fcf>0)qualityScore+=10;
    if(deRatio!=null&&deRatio<0.3)qualityScore+=20;else if(deRatio!=null&&deRatio<0.8)qualityScore+=10;
    if(grahamG>0.10)qualityScore+=20;else if(grahamG>0.03)qualityScore+=10;

    const monthly=monthlyData?.["Monthly Adjusted Time Series"]||{};
    const mDates=Object.keys(monthly).sort();
    const allClose=mDates.map(d=>parseFloat(monthly[d]["5. adjusted close"])).filter(v=>!isNaN(v));
    const prices1y=allClose.slice(-12), prices5y=allClose.slice(-60), prices10y=allClose.slice(-120);
    const cagr5y=prices5y.length>5?Math.pow(prices5y[prices5y.length-1]/prices5y[0],1/5)-1:null;
    const cagr10y=prices10y.length>10?Math.pow(prices10y[prices10y.length-1]/prices10y[0],1/10)-1:null;
    const marginTrend=inc.slice(0,5).reverse().map(y=>({
      year:(y.fiscalDateEnding||"").slice(0,4),
      gross:n(y.grossProfit)&&n(y.totalRevenue)?n(y.grossProfit)/n(y.totalRevenue):null,
      op:n(y.operatingIncome)&&n(y.totalRevenue)?n(y.operatingIncome)/n(y.totalRevenue):null,
      net:n(y.netIncome)&&n(y.totalRevenue)?n(y.netIncome)/n(y.totalRevenue):null,
    }));
    const incHistory=inc.slice(0,5).reverse().map(y=>({
      year:(y.fiscalDateEnding||"").slice(0,4),
      revenue:n(y.totalRevenue), netIncome:n(y.netIncome), eps:n(y.reportedEPS),
      grossMargin:n(y.grossProfit)&&n(y.totalRevenue)?n(y.grossProfit)/n(y.totalRevenue):null,
      opMargin:n(y.operatingIncome)&&n(y.totalRevenue)?n(y.operatingIncome)/n(y.totalRevenue):null,
      netMargin:n(y.netIncome)&&n(y.totalRevenue)?n(y.netIncome)/n(y.totalRevenue):null,
    }));

    return Response.json({
      name,ticker,sector,industry,beta,usdKrw,price,marketCap,change1d,high52,low52,targetPrice,
      eps,pe,forwardPE,pb,bvps,peg,divYield,divAmt,sharesOutstanding:sharesOut,
      evEbitda,evRevenue,evFcf,evEbit,evNopat,priceFcf,priceSales,ev,earningsYield,fcfYield,acquirersMult,returnOnCapital,
      revenue,grossProfit,opIncome,netIncome,ebitda,interestExp,rd,
      revenueGrowth,netIncomeGrowth,epsGrowth1y,epsCagr5y,fcfGrowth,equityGrowth,
      grahamG,gv,wacc,discountRate,costOfEquity,
      grossMargin,opMargin,profMargin,fcfMargin,roe,roa,roic,grossProfitability,
      totalCash,totalDebt,netDebt,equity,totalAssets,currAssets,currLiab,totalLiab,
      currentRatio,quickRatio,deRatio,debtToAssets,interestCoverage,capexIntensity,
      opCF,capex,depr,fcf,ownerEarnings,fcfPerSh,fcfAvg,fcfAnomaly,profitCashDivergence,
      assetTurnover,equityMultiplier,dupont,
      grahamIV,grahamNum,dcfIV,lynchFV,epv,ddmIV,acquirerIV,ncav,
      grahamMargin,gnMargin,dcfMargin,lynchMargin,medMargin,fairValueMed,fairValueLow,fairValueHigh,
      fScore,fDetails,zScore,mScore,oScore,qualityScore,
      cagr5y,cagr10y,marginTrend,incHistory,prices1y,prices5y,prices10y,
    });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
