const AV_KEY = process.env.AV_KEY || "6ZXNTFU1VNXFKLW2";
const AV = "https://www.alphavantage.co/query";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const n = v => { const x = parseFloat(v); return isNaN(x) ? null : x; };

const CANDIDATES = [
  "AAPL","MSFT","KO","JNJ","PG","WMT","BRK-B","JPM","V","MA",
  "HD","MCD","NKE","IBM","XOM","CVX","PEP","MO","ABBV","PFE",
  "MRK","UNH","COST","TGT","LOW","DE","CAT","HON","GOOGL","META",
  "AMZN","NVDA","ORCL","CSCO","INTC","QCOM","TXN","WFC","BAC","PM"
];

function calcScore(o) {
  let s = 0;
  const pe=n(o.PERatio), pb=n(o.PriceToBookRatio), roe=n(o.ReturnOnEquityTTM);
  const pm=n(o.ProfitMargin), beta=n(o.Beta), peg=n(o.PEGRatio);
  const gm=n(o.GrossProfitTTM)&&n(o.RevenueTTM)?n(o.GrossProfitTTM)/n(o.RevenueTTM):null;
  const dy=n(o.DividendYield), om=n(o.OperatingMarginTTM);
  if(pe>0&&pe<=12)s+=25;else if(pe>0&&pe<=15)s+=20;else if(pe>0&&pe<=20)s+=12;else if(pe>0&&pe<=25)s+=6;
  if(pb>0&&pb<=1.0)s+=20;else if(pb>0&&pb<=1.5)s+=15;else if(pb>0&&pb<=2.5)s+=8;
  if(roe>=0.20)s+=20;else if(roe>=0.15)s+=13;else if(roe>=0.10)s+=6;
  if(gm>=0.40)s+=15;else if(gm>=0.25)s+=8;
  if(om>=0.15)s+=8;else if(om>=0.08)s+=4;
  if(beta>0&&beta<=0.8)s+=6;else if(beta<=1.0)s+=4;else if(beta<=1.2)s+=2;
  if(peg>0&&peg<=1.0)s+=6;
  if(dy>0.02)s+=5;else if(dy>0)s+=2;
  return Math.min(s,100);
}

export async function GET() {
  const results = [];
  const sample = [...CANDIDATES].sort(()=>Math.random()-0.5).slice(0,8);
  for (const ticker of sample) {
    try {
      const url = AV+"?"+new URLSearchParams({function:"OVERVIEW",symbol:ticker,apikey:AV_KEY});
      const res = await fetch(url);
      const o = await res.json();
      if(!o.Symbol){await sleep(1200);continue;}
      const sc=calcScore(o), eps=n(o.EPS), bvps=n(o.BookValue);
      const egr=n(o.QuarterlyEarningsGrowthYOY)||0.05;
      const gv=Math.min(egr*100,15);
      const grahamIV=eps>0?(eps*(8.5+2*gv)*4.4)/(0.042*100):null;
      const grahamNum=eps>0&&bvps>0?Math.sqrt(22.5*eps*bvps):null;
      const hi52=n(o["52WeekHigh"]), lo52=n(o["52WeekLow"]);
      const approxPrice=hi52&&lo52?(hi52+lo52)/2:null;
      const margin=grahamIV&&approxPrice?(grahamIV-approxPrice)/grahamIV*100:null;
      results.push({
        ticker, name:o.Name, sector:o.Sector,
        pe:n(o.PERatio), pb:n(o.PriceToBookRatio),
        roe:n(o.ReturnOnEquityTTM),
        gm:n(o.GrossProfitTTM)&&n(o.RevenueTTM)?n(o.GrossProfitTTM)/n(o.RevenueTTM):null,
        score:sc, grahamIV, grahamNum, margin,
        divYield:n(o.DividendYield), beta:n(o.Beta), eps, bvps, peg:n(o.PEGRatio),
      });
    } catch(e){}
    await sleep(1200);
  }
  results.sort((a,b)=>b.score-a.score);
  return Response.json({results, scanned:sample.length});
}
