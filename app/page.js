"use client";
import { useState, useEffect } from "react";

const PASSWORD = "0310";
const C = {
  bg:"#060F1A",surf:"#0A1622",card:"#0E1C2A",b:"#162436",
  gold:"#D4A843",green:"#2ECC71",red:"#E74C3C",amber:"#F39C12",
  grey:"#5D7A8A",text:"#ECE8E0",dim:"#162030",blue:"#3498DB",purple:"#9B59B6",
};
const TABS=["대시보드","적정가","Graham","Buffett","Li Lu","공식","고급지표","버핏도구","기업해독","가격판독","스토리","추천종목"];
const CT=["1년","5년","10년"];

const fN=(v,d=2)=>(v==null||isNaN(+v))?"—":(+v).toFixed(d);
const fB=v=>{if(v==null||isNaN(+v))return"—";const a=Math.abs(+v);return a>=1e12?(v/1e12).toFixed(2)+"T":a>=1e9?(v/1e9).toFixed(2)+"B":a>=1e6?(v/1e6).toFixed(2)+"M":a>=1e3?(v/1e3).toFixed(1)+"K":(+v).toFixed(0);};
const fP=v=>(v==null||isNaN(+v))?"—":((+v)*100).toFixed(1)+"%";
const fKRW=(v,r)=>{if(!v||!r)return"";const k=+v*r;return k>=1e12?"₩"+(k/1e12).toFixed(1)+"조":k>=1e8?"₩"+(k/1e8).toFixed(0)+"억":k>=1e4?"₩"+(k/1e4).toFixed(0)+"만":"₩"+k.toFixed(0);};
const upC=(v,g,w)=>v==null?C.grey:+v>=g?C.green:+v>=w?C.amber:C.red;
const dnC=(v,g,w)=>v==null?C.grey:+v<=g?C.green:+v<=w?C.amber:C.red;

const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:10,padding:"14px",marginBottom:10,...style}}>{children}</div>;
const SH=({t,r,sub,desc})=><div style={{marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.gold}25`}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontFamily:"Georgia,serif",fontSize:13,color:C.gold,fontWeight:600}}>{t}</span>{r}</div>{sub&&<div style={{fontSize:10,color:C.grey,marginTop:2}}>{sub}</div>}{desc&&<div style={{fontSize:10,color:C.amber,marginTop:3,lineHeight:1.5}}>💡 {desc}</div>}</div>;
const Row=({l,v,c,sub,f,desc})=><div style={{padding:"7px 0",borderBottom:`1px solid ${C.b}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:C.grey}}>{l}</div>{f&&<div style={{fontSize:9,color:C.dim,fontFamily:"monospace",marginTop:1,lineHeight:1.4}}>{f}</div>}{desc&&<div style={{fontSize:9,color:C.amber,marginTop:1,lineHeight:1.4}}>💡 {desc}</div>}</div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontFamily:"monospace",fontSize:13,color:c||C.text,fontWeight:600}}>{v}</div>{sub&&<div style={{fontSize:10,color:C.grey,marginTop:1}}>{sub}</div>}</div></div></div>;
const Chk=({l,ok,v,sub,desc,dot})=><div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.b}`}}><div style={{width:18,height:18,flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:dot?"50%":3,fontSize:11,fontWeight:700,background:ok?C.green+"20":C.red+"20",border:`1.5px solid ${ok?C.green:C.red}`,color:ok?C.green:C.red}}>{ok?"✓":"✗"}</div><div style={{flex:1}}><div style={{fontSize:12,color:C.text}}>{l}</div>{sub&&<div style={{fontSize:10,color:C.grey,marginTop:1}}>{sub}</div>}{desc&&<div style={{fontSize:9,color:C.amber,marginTop:1}}>💡 {desc}</div>}</div>{v&&<span style={{fontFamily:"monospace",fontSize:11,color:C.grey,flexShrink:0,marginTop:2}}>{v}</span>}</div>;
const Badge=({l,c})=><span style={{fontFamily:"monospace",fontSize:10,padding:"2px 7px",borderRadius:3,background:(c||C.gold)+"20",border:`1px solid ${c||C.gold}`,color:c||C.gold,whiteSpace:"nowrap"}}>{l}</span>;
const ScoreBar=({label,score,max=100,color,desc})=>{const pct=Math.min(+score||0,max)/max;const c=color||(pct>=.75?C.green:pct>=.5?C.amber:C.red);return<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:C.grey}}>{label}</span><span style={{fontFamily:"monospace",fontSize:11,color:c,fontWeight:700}}>{Math.round(+score||0)}/{max}</span></div><div style={{height:6,background:C.b,borderRadius:3}}><div style={{height:"100%",width:`${pct*100}%`,background:c,borderRadius:3}}/></div>{desc&&<div style={{fontSize:9,color:C.amber,marginTop:2}}>💡 {desc}</div>}</div>;};
const FBox=({title,formula,result,desc})=><div style={{background:C.bg,borderRadius:8,padding:"12px",marginBottom:8,border:`1px solid ${C.b}`}}>{title&&<div style={{fontSize:11,color:C.gold,marginBottom:6,fontWeight:700}}>{title}</div>}<pre style={{fontFamily:"monospace",fontSize:11,color:C.amber,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap"}}>{formula}</pre>{result&&<div style={{fontFamily:"monospace",fontSize:12,color:C.green,marginTop:6,fontWeight:700}}>→ {result}</div>}{desc&&<div style={{fontSize:10,color:C.grey,marginTop:6,lineHeight:1.6,borderTop:`1px solid ${C.b}`,paddingTop:6}}>{desc}</div>}</div>;

function Gauge({s,l}){
  const pct=Math.min(Math.max(+s||0,0),100);
  const p=pct/100;
  const col=p>=.75?C.green:p>=.5?C.amber:C.red;
  const cx=50,cy=50,r=38;
  const angle=Math.PI*p-Math.PI;
  const progressX=cx+r*Math.cos(angle), progressY=cy+r*Math.sin(angle);
  return<div style={{textAlign:"center",padding:"4px"}}>
    <svg width={80} height={50} viewBox="0 0 100 60">
      <path d={`M${cx-r} ${cy} A${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={C.b} strokeWidth={7} strokeLinecap="round"/>
      {p>0&&<path d={`M${cx-r} ${cy} A${r} ${r} 0 ${p>.5?1:0} 1 ${progressX} ${progressY}`} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round"/>}
      <text x={cx} y={cy+6} textAnchor="middle" fill={col} fontSize="14" fontFamily="monospace" fontWeight="700">{Math.round(pct)}</text>
    </svg>
    <div style={{fontSize:10,color:C.grey,marginTop:1}}>{l}</div>
  </div>;
}

function Chart({data,h=120}){
  if(!data||data.length<2)return<div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,borderRadius:6}}><span style={{fontSize:11,color:C.dim}}>데이터 없음</span></div>;
  const nums=data.map(Number).filter(v=>!isNaN(v));
  const mn=Math.min(...nums),mx=Math.max(...nums),rng=mx-mn||1,W=300;
  const pts=nums.map((v,i)=>`${(i/(nums.length-1))*W},${h-((v-mn)/rng)*h}`).join(" ");
  const chg=(nums[nums.length-1]/nums[0]-1)*100;
  const lc=chg>=0?C.green:C.red;
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontFamily:"monospace",fontSize:12,color:C.text,fontWeight:600}}>${fN(nums[nums.length-1])}</span>
      <span style={{fontFamily:"monospace",fontSize:12,color:lc,fontWeight:600}}>{chg>=0?"+":""}{chg.toFixed(2)}%</span>
    </div>
    <svg width="100%" viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lc} stopOpacity="0.2"/><stop offset="100%" stopColor={lc} stopOpacity="0"/></linearGradient></defs>
      <polyline points={`${pts} ${W},${h} 0,${h}`} fill="url(#lg)"/>
      <polyline points={pts} fill="none" stroke={lc} strokeWidth={2}/>
    </svg>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.grey,marginTop:2}}>
      <span>최저 ${fN(mn,0)}</span><span>{nums.length}개</span><span>최고 ${fN(mx,0)}</span>
    </div>
  </div>;
}

function AICard({title,content,loading,onGenerate,btnLabel="생성하기"}){
  const renderMd=(text)=>text.split("\n").map((line,i)=>{
    if(line.startsWith("## "))return<h3 key={i} style={{fontFamily:"Georgia,serif",fontSize:14,color:C.gold,margin:"20px 0 8px",borderBottom:`1px solid ${C.gold}28`,paddingBottom:5}}>{line.slice(3)}</h3>;
    if(line.startsWith("# "))return<h2 key={i} style={{fontFamily:"Georgia,serif",fontSize:16,color:C.gold,margin:"0 0 12px"}}>{line.slice(2)}</h2>;
    if(line.startsWith("- "))return<div key={i} style={{padding:"3px 0 3px 12px",borderLeft:`2px solid ${C.gold}45`,fontSize:12,marginBottom:3,color:C.text}}>{line.slice(2)}</div>;
    if(line.startsWith("| "))return<div key={i} style={{fontFamily:"monospace",fontSize:11,color:C.text,padding:"3px 0",borderBottom:`1px solid ${C.b}`}}>{line}</div>;
    if(line.match(/^[✅⚠️🚨]/))return<div key={i} style={{fontSize:12,color:C.text,padding:"4px 0"}}>{line}</div>;
    if(line.startsWith("**")&&line.endsWith("**"))return<div key={i} style={{fontWeight:700,color:C.gold,marginTop:8,fontSize:13}}>{line.replace(/\*\*/g,"")}</div>;
    return<div key={i} style={{fontSize:12,color:C.text,lineHeight:1.8,minHeight:line.trim()?undefined:8}}>{line}</div>;
  });
  if(!content&&!loading)return(
    <Card style={{textAlign:"center",padding:"30px 20px"}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:16,color:C.gold,marginBottom:8}}>{title}</div>
      <button onClick={onGenerate} style={{background:C.gold,color:"#06101A",border:"none",borderRadius:8,padding:"12px 28px",fontWeight:700,fontSize:13,cursor:"pointer"}}>{btnLabel}</button>
    </Card>
  );
  if(loading)return<Card style={{textAlign:"center",padding:"30px"}}><div style={{color:C.gold,fontFamily:"monospace",fontSize:12,letterSpacing:1}}>AI 분석중... (약 10~20초)</div></Card>;
  return<Card>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span style={{fontFamily:"Georgia,serif",fontSize:13,color:C.gold,fontWeight:600}}>{title}</span>
      <button onClick={onGenerate} style={{background:"transparent",border:`1px solid ${C.b}`,color:C.grey,borderRadius:4,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>↺ 재생성</button>
    </div>
    <div style={{lineHeight:1.8}}>{renderMd(content)}</div>
  </Card>;
}

function calcScores(d){
  let g=0,b=0,l=0;
  const{pe,pb,currentRatio,deRatio,divYield,grahamMargin,roe,opMargin,grossMargin,fcf,netIncome,revenueGrowth,beta}=d;
  if(+pe>0&&+pe<=15)g+=20;else if(+pe>0&&+pe<=20)g+=10;
  if(+pb>0&&+pb<=1.5)g+=15;else if(+pb>0&&+pb<=2.5)g+=8;
  if(+currentRatio>=2)g+=15;else if(+currentRatio>=1.5)g+=8;
  if(+deRatio<=.5)g+=15;else if(+deRatio<=1)g+=8;
  if(+divYield>0)g+=10;
  if(+grahamMargin>=33)g+=25;else if(+grahamMargin>=15)g+=12;
  if(+roe>=.2)b+=25;else if(+roe>=.15)b+=15;
  if(+opMargin>=.2)b+=20;else if(+opMargin>=.1)b+=10;
  if(+grossMargin>=.4)b+=20;else if(+grossMargin>=.25)b+=10;
  if(+deRatio<=.3)b+=15;else if(+deRatio<=.8)b+=8;
  if(+fcf>0&&+netIncome>0&&+fcf/+netIncome>=.8)b+=20;else if(+fcf>0)b+=10;
  if(+roe>=.2)l+=20;else if(+roe>=.12)l+=10;
  if(+grossMargin>=.5)l+=20;else if(+grossMargin>=.3)l+=12;
  if(+revenueGrowth>=.15)l+=25;else if(+revenueGrowth>=.05)l+=12;
  if(+fcf>0)l+=20;
  if(+beta>0&&+beta<1)l+=15;else if(+beta>0&&+beta<1.5)l+=8;
  return{gScore:Math.min(g,100),bScore:Math.min(b,100),lScore:Math.min(l,100)};
}

function LoginScreen({onLogin}){
  const [pw,setPw]=useState(""), [err,setErr]=useState(false);
  const try_=()=>{if(pw===PASSWORD)onLogin();else{setErr(true);setPw("");setTimeout(()=>setErr(false),1500);}};
  return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{textAlign:"center",padding:"40px 20px",maxWidth:320,width:"100%"}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:28,color:C.gold,marginBottom:4,letterSpacing:2,fontWeight:700}}>VALUE LEGEND</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:13,color:C.gold,marginBottom:4,opacity:.7}}>PRO</div>
      <div style={{fontSize:10,color:C.grey,marginBottom:36,letterSpacing:3,fontFamily:"monospace"}}>GRAHAM · BUFFETT · LI LU</div>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&try_()} placeholder="비밀번호" maxLength={4} style={{width:"100%",background:C.card,border:`1px solid ${err?C.red:C.b}`,color:C.text,padding:"14px",fontSize:20,fontFamily:"monospace",borderRadius:8,outline:"none",textAlign:"center",letterSpacing:8,boxSizing:"border-box"}}/>
      {err&&<div style={{color:C.red,fontSize:12,marginTop:8}}>비밀번호가 틀렸습니다</div>}
      <button onClick={try_} style={{width:"100%",background:C.gold,color:"#06101A",border:"none",borderRadius:8,padding:"13px",fontWeight:700,fontSize:15,cursor:"pointer",marginTop:12}}>입력</button>
    </div>
  </div>;
}

export default function App(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [inp,setInp]=useState(""), [loading,setLoad]=useState(false), [step,setStep]=useState(""), [err,setErr]=useState(""), [d,setD]=useState(null);
  const [tab,setTab]=useState(0), [ct,setCt]=useState(1), [krw,setKrw]=useState(false);
  const [favorites,setFavorites]=useState([]), [history,setHistory]=useState([]), [showFav,setShowFav]=useState(false);
  const [recs,setRecs]=useState(null), [recLoad,setRecLoad]=useState(false);
  const [decoder,setDecoder]=useState(null), [decoderLoad,setDecoderLoad]=useState(false);
  const [priceCard,setPriceCard]=useState(null), [priceLoad,setPriceLoad]=useState(false);
  const [storyCard,setStoryCard]=useState(null), [storyLoad,setStoryLoad]=useState(false);

  useEffect(()=>{
    try{
      const f=localStorage.getItem("vl_fav"); if(f)setFavorites(JSON.parse(f));
      const h=localStorage.getItem("vl_hist"); if(h)setHistory(JSON.parse(h));
    }catch(e){}
  },[]);

  if(!loggedIn) return <LoginScreen onLogin={()=>setLoggedIn(true)}/>;

  const analyze=async(ticker)=>{
    const tk=(ticker||inp).trim().toUpperCase();
    if(!tk){setErr("티커를 입력하세요.");return;}
    setLoad(true);setErr("");setD(null);setTab(0);setShowFav(false);
    setDecoder(null);setPriceCard(null);setStoryCard(null);
    const steps=["기업 개요·밸류에이션","현재 주가","손익계산서","재무상태표","현금흐름표","주가 차트","환율"];
    let si=0; setStep(steps[0]+" 수집중...");
    const iv=setInterval(()=>{si=(si+1)%steps.length;setStep(steps[si]+" 수집중...");},4000);
    try{
      const res=await fetch(`/api/stock?ticker=${tk}`);
      const raw=await res.json();
      if(raw.error)throw new Error(raw.error);
      const scored={...raw,...calcScores({...raw,grahamMargin:raw.grahamMargin})};
      setD(scored);
      const newHist=[{ticker:tk,name:raw.name,price:raw.price,ts:Date.now()},...history.filter(h=>h.ticker!==tk)].slice(0,10);
      setHistory(newHist);
      try{localStorage.setItem("vl_hist",JSON.stringify(newHist));}catch(e){}
    }catch(e){setErr(e.message);}
    finally{clearInterval(iv);setLoad(false);setStep("");}
  };

  const aiAnalyze=async(type,setter,setLoading)=>{
    if(!d)return;
    setLoading(true);setter(null);
    try{
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({d,type})});
      const json=await res.json();
      if(json.error)throw new Error(json.error);
      setter(json.result);
    }catch(e){setter("오류: "+e.message);}
    finally{setLoading(false);}
  };

  const toggleFav=(ticker,name)=>{
    const isFav=favorites.some(f=>f.ticker===ticker);
    const newFav=isFav?favorites.filter(f=>f.ticker!==ticker):[...favorites,{ticker,name}];
    setFavorites(newFav);
    try{localStorage.setItem("vl_fav",JSON.stringify(newFav));}catch(e){}
  };

  const isFav=d&&favorites.some(f=>f.ticker===d.ticker);
  const getChart=()=>{if(!d)return[];return[d.prices1y,d.prices5y,d.prices10y][ct]||d.prices5y||[];};
  const px=v=>krw&&d?.usdKrw?fKRW(v,d.usdKrw):`$${fN(v)}`;
  const dd=d, total=dd?Math.round((dd.gScore+dd.bScore+dd.lScore)/3):0;

  const warnings=[];
  if(dd){
    if(dd.mScore&&dd.mScore>-1.78)warnings.push("⚠ 회계조작 의심 (Beneish M-Score "+fN(dd.mScore,2)+")");
    if(dd.zScore&&dd.zScore<1.81)warnings.push("⚠ 부도 위험 (Altman Z-Score "+fN(dd.zScore,2)+")");
    if(dd.deRatio&&dd.deRatio>2)warnings.push("⚠ 부채비율 과다 (D/E "+fN(dd.deRatio,2)+")");
    if(dd.currentRatio&&dd.currentRatio<1)warnings.push("⚠ 유동성 위기 (유동비율 "+fN(dd.currentRatio,2)+")");
    if(dd.fcf&&dd.fcf<0)warnings.push("⚠ FCF 음수 (현금 유출 중)");
    if(dd.fcfAnomaly)warnings.push("⚠ FCF 이상치 감지 (3년 평균 대비 ±40% 이탈)");
    if(dd.profitCashDivergence)warnings.push("⚠ 이익·현금 역방향 (회계 조작 가능성 점검 필요)");
  }

  return<div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"system-ui,-apple-system,sans-serif"}}>
    {/* HEADER */}
    <div style={{background:C.surf,borderBottom:`1px solid ${C.b}`,position:"sticky",top:0,zIndex:20}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0 5px",flexWrap:"wrap"}}>
          <div style={{minWidth:100}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:14,color:C.gold,letterSpacing:1,fontWeight:700}}>VALUE LEGEND</div>
            <div style={{fontSize:7,color:C.dim,letterSpacing:2,fontFamily:"monospace"}}>GRAHAM·BUFFETT·LI LU</div>
          </div>
          <div style={{display:"flex",gap:6,flex:1,minWidth:160}}>
            <input value={inp} onChange={e=>setInp(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&analyze()} placeholder="AAPL, MSFT, KO..." style={{flex:1,background:C.bg,border:`1px solid ${C.b}`,color:C.text,padding:"8px 10px",fontSize:13,fontFamily:"monospace",borderRadius:6,outline:"none",minWidth:0}}/>
            <button onClick={()=>analyze()} disabled={loading} style={{background:loading?C.grey:C.gold,color:"#06101A",border:"none",borderRadius:6,padding:"8px 14px",fontWeight:700,fontSize:13,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap"}}>{loading?"조회중":"분석"}</button>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {dd&&<button onClick={()=>toggleFav(dd.ticker,dd.name)} style={{background:isFav?C.gold+"20":"transparent",border:`1px solid ${isFav?C.gold:C.b}`,color:isFav?C.gold:C.grey,borderRadius:6,padding:"7px 9px",fontSize:13,cursor:"pointer"}}>{isFav?"★":"☆"}</button>}
            <button onClick={()=>setShowFav(!showFav)} style={{background:showFav?C.purple+"20":"transparent",border:`1px solid ${showFav?C.purple:C.b}`,color:showFav?C.purple:C.grey,borderRadius:6,padding:"7px 8px",fontSize:11,cursor:"pointer"}}>목록</button>
            {dd&&<button onClick={()=>setKrw(!krw)} style={{background:krw?C.gold+"20":"transparent",border:`1px solid ${krw?C.gold:C.b}`,color:krw?C.gold:C.grey,borderRadius:6,padding:"7px 8px",fontSize:11,cursor:"pointer"}}>{krw?"USD":"KRW"}</button>}
            <button onClick={()=>setLoggedIn(false)} style={{background:"transparent",border:`1px solid ${C.b}`,color:C.grey,borderRadius:6,padding:"7px 8px",fontSize:11,cursor:"pointer"}}>나가기</button>
          </div>
        </div>
        {dd&&<div style={{display:"flex",overflowX:"auto",gap:0}}>
          {TABS.map((t,i)=><button key={i} onClick={()=>setTab(i)} style={{background:"transparent",border:"none",borderBottom:tab===i?`2px solid ${C.gold}`:"2px solid transparent",color:tab===i?C.gold:C.grey,padding:"6px 10px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t}</button>)}
        </div>}
      </div>
    </div>

    <div style={{maxWidth:1100,margin:"0 auto",padding:"10px 12px"}}>
      {/* 즐겨찾기 패널 */}
      {showFav&&<Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div><div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:8}}>★ 즐겨찾기</div>
            {favorites.length===0?<div style={{fontSize:11,color:C.grey}}>없음 (★로 추가)</div>:favorites.map((f,i)=><button key={i} onClick={()=>analyze(f.ticker)} style={{display:"block",width:"100%",textAlign:"left",background:C.bg,border:`1px solid ${C.b}`,color:C.text,borderRadius:5,padding:"7px 10px",fontSize:12,cursor:"pointer",marginBottom:4,fontFamily:"monospace"}}>{f.ticker} <span style={{color:C.grey,fontSize:10}}>{f.name?.slice(0,15)}</span></button>)}
          </div>
          <div><div style={{fontSize:11,color:C.blue,fontWeight:700,marginBottom:8}}>최근 검색</div>
            {history.length===0?<div style={{fontSize:11,color:C.grey}}>없음</div>:history.slice(0,8).map((h,i)=><button key={i} onClick={()=>analyze(h.ticker)} style={{display:"block",width:"100%",textAlign:"left",background:C.bg,border:`1px solid ${C.b}`,color:C.text,borderRadius:5,padding:"7px 10px",fontSize:12,cursor:"pointer",marginBottom:4,fontFamily:"monospace"}}>{h.ticker} <span style={{color:C.grey,fontSize:10}}>${fN(h.price)}</span></button>)}
          </div>
        </div>
      </Card>}

      {/* 위험 배너 */}
      {warnings.length>0&&<div style={{background:C.red+"15",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 14px",marginBottom:10}}>
        {warnings.map((w,i)=><div key={i} style={{fontSize:12,color:C.red,fontWeight:600,marginBottom:2}}>{w}</div>)}
      </div>}

      {err&&<div style={{background:C.red+"18",border:`1px solid ${C.red}55`,borderRadius:8,padding:"12px",marginBottom:10,color:C.red,fontSize:13}}>⚠ {err}</div>}

      {loading&&<div style={{textAlign:"center",padding:"50px 20px"}}>
        <div style={{color:C.gold,fontFamily:"monospace",fontSize:13,letterSpacing:1,marginBottom:6}}>{step}</div>
        <div style={{color:C.grey,fontSize:11,marginBottom:16}}>약 40~50초 소요 (API 분당 5콜 제한)</div>
      </div>}

      {!dd&&!loading&&!err&&<div style={{textAlign:"center",padding:"40px 20px"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:20,color:C.gold,marginBottom:8}}>가치투자 전문 분석 툴</div>
        <div style={{color:C.grey,fontSize:13,lineHeight:1.9,marginBottom:20}}>
          적정가 7가지 · Graham · Buffett · Li Lu<br/>
          Piotroski · Altman · Beneish · Ohlson · Magic Formula<br/>
          기업해독 · 가격판독 · 스토리 · 버핏도구 · 추천종목
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
          {["AAPL","MSFT","KO","JNJ","GOOGL","META","NVDA","TSLA","AMZN","BRK-B"].map(t=>(
            <button key={t} onClick={()=>{setInp(t);analyze(t);}} style={{background:C.card,border:`1px solid ${C.b}`,color:C.grey,borderRadius:6,padding:"8px 14px",fontSize:12,cursor:"pointer",fontFamily:"monospace"}}>{t}</button>
          ))}
        </div>
        {history.length>0&&<div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
          {history.slice(0,5).map((h,i)=><button key={i} onClick={()=>analyze(h.ticker)} style={{background:C.card,border:`1px solid ${C.b}`,color:C.blue,borderRadius:5,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>{h.ticker}</button>)}
        </div>}
      </div>}

      {/* ══ 대시보드 ══ */}
      {dd&&tab===0&&<div>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div><div style={{fontFamily:"Georgia,serif",fontSize:18,color:C.text,fontWeight:700}}>{dd.name}</div><div style={{fontSize:11,color:C.grey,marginTop:2}}>{dd.ticker} · {dd.sector} · {dd.industry}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:C.text}}>{px(dd.price)}</div>{krw&&<div style={{fontSize:11,color:C.grey}}>${fN(dd.price)}</div>}<div style={{fontFamily:"monospace",fontSize:13,color:+dd.change1d>=0?C.green:C.red,fontWeight:600}}>{+dd.change1d>=0?"▲":"▼"}{Math.abs(+(dd.change1d||0)*100).toFixed(2)}%</div></div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8,padding:"8px 0",borderTop:`1px solid ${C.b}`,fontSize:11}}>
            {[{l:"시총",v:fB(dd.marketCap)},{l:"52주",v:`${px(dd.high52)}/${px(dd.low52)}`},{l:"베타",v:fN(dd.beta,2)},{l:"목표가",v:dd.targetPrice?px(dd.targetPrice):"—"},{l:"EPS",v:`$${fN(dd.eps)}`},{l:"환율",v:dd.usdKrw?`₩${dd.usdKrw?.toFixed(0)}`:"—"},{l:"5Y CAGR",v:dd.cagr5y?fP(dd.cagr5y):"—"}].map((x,i)=>(
              <div key={i}><span style={{color:C.grey}}>{x.l}: </span><span style={{color:C.text,fontFamily:"monospace",fontWeight:600}}>{x.v}</span></div>
            ))}
          </div>
        </Card>

        <Card>
          <SH t="종합 투자 점수" desc="Graham(안전마진), Buffett(해자·현금), Li Lu(성장·불가역) 자동 채점"/>
          <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",marginBottom:12}}>
            <Gauge s={dd.gScore} l="Graham"/><Gauge s={dd.bScore} l="Buffett"/><Gauge s={dd.lScore} l="Li Lu"/><Gauge s={total} l="종합"/>
          </div>
          <ScoreBar label="Graham (안전마진·밸류에이션)" score={dd.gScore} desc="75+ 강력매수 / 50+ 매수 고려"/>
          <ScoreBar label="Buffett (해자·현금흐름·수익성)" score={dd.bScore} desc="ROE·FCF·마진 기반"/>
          <ScoreBar label="Li Lu (성장·불가역·자본효율)" score={dd.lScore} desc="성장성·불가역성·해자"/>
          {dd.qualityScore!=null&&<ScoreBar label="Quality Score (QMJ)" score={dd.qualityScore} desc="수익성·안전성·성장 복합"/>}
          {dd.fScore!=null&&<ScoreBar label="Piotroski F-Score" score={dd.fScore} max={9} color={dd.fScore>=7?C.green:dd.fScore>=4?C.amber:C.red} desc="7+ 강한 매수신호 / 0-3 주의"/>}
        </Card>

        <Card>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:13,color:C.gold,fontWeight:600}}>주가 차트</span>
            <div style={{display:"flex",gap:4}}>{CT.map((t,i)=><button key={i} onClick={()=>setCt(i)} style={{background:ct===i?C.gold+"22":"transparent",border:`1px solid ${ct===i?C.gold:C.b}`,color:ct===i?C.gold:C.grey,borderRadius:4,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>{t}</button>)}</div>
          </div>
          <Chart data={getChart()} h={130}/>
          <div style={{display:"flex",gap:16,marginTop:8,fontSize:11,flexWrap:"wrap"}}>
            {dd.cagr5y&&<span style={{color:C.grey}}>5년 CAGR: <span style={{color:+dd.cagr5y>0?C.green:C.red,fontFamily:"monospace",fontWeight:600}}>{fP(dd.cagr5y)}</span></span>}
            {dd.cagr10y&&<span style={{color:C.grey}}>10년 CAGR: <span style={{color:+dd.cagr10y>0?C.green:C.red,fontFamily:"monospace",fontWeight:600}}>{fP(dd.cagr10y)}</span></span>}
          </div>
        </Card>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Card style={{marginBottom:0}}><SH t="밸류에이션"/>
            <Row l="PER" v={dd.pe?`${fN(dd.pe,1)}x`:"—"} c={dnC(dd.pe,15,25)} desc="15이하 저평가"/>
            <Row l="Forward PER" v={dd.forwardPE?`${fN(dd.forwardPE,1)}x`:"—"} c={dnC(dd.forwardPE,12,20)} desc="미래 이익 기준"/>
            <Row l="PBR" v={dd.pb?`${fN(dd.pb,2)}x`:"—"} c={dnC(dd.pb,1.5,3)} desc="1배이하 순자산 이하"/>
            <Row l="PEG" v={dd.peg?`${fN(dd.peg,2)}x`:"—"} c={dnC(dd.peg,1,2)} desc="1이하 성장대비 저평가"/>
            <Row l="EV/EBITDA" v={dd.evEbitda?`${fN(dd.evEbitda,1)}x`:"—"} c={dnC(dd.evEbitda,10,20)} desc="10배이하 저평가"/>
            <Row l="P/FCF" v={dd.priceFcf?`${fN(dd.priceFcf,1)}x`:"—"} c={dnC(dd.priceFcf,15,25)} desc="FCF 기준"/>
            <Row l="배당수익률" v={+dd.divYield>0?fP(dd.divYield):"무배당"}/>
          </Card>
          <Card style={{marginBottom:0}}><SH t="수익성"/>
            <Row l="ROE" v={fP(dd.roe)} c={upC(dd.roe,.15,.10)} desc="15%+ 강한 해자"/>
            <Row l="ROA" v={fP(dd.roa)} c={upC(dd.roa,.08,.04)} desc="부채 제거 순수 효율"/>
            <Row l="ROIC" v={fP(dd.roic)} c={upC(dd.roic,.12,.08)} desc="WACC 초과시 가치창출"/>
            <Row l="매출총이익률" v={fP(dd.grossMargin)} c={upC(dd.grossMargin,.40,.20)} desc="40%+ 브랜드·가격결정력"/>
            <Row l="영업이익률" v={fP(dd.opMargin)} c={upC(dd.opMargin,.15,.08)} desc="15%+ 효율적 운영"/>
            <Row l="순이익률" v={fP(dd.profMargin)} c={upC(dd.profMargin,.10,.05)}/>
            <Row l="FCF 마진" v={fP(dd.fcfMargin)} c={upC(dd.fcfMargin,.10,.05)} desc="실제 현금창출 비율"/>
          </Card>
        </div>

        <Card>
          <SH t="적정가 한눈에" desc="7가지 방법. 현재가가 범위 아래면 저평가"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {[
              {l:"현재가",v:px(dd.price),c:C.gold},
              {l:"Graham IV",v:dd.grahamIV?px(dd.grahamIV):"—",c:+dd.grahamIV>+dd.price?C.green:C.red,sub:dd.grahamMargin?`마진 ${fN(dd.grahamMargin,1)}%`:""},
              {l:"Graham#",v:dd.grahamNum?px(dd.grahamNum):"—",c:+dd.grahamNum>+dd.price?C.green:C.red,sub:dd.gnMargin?`마진 ${fN(dd.gnMargin,1)}%`:""},
              {l:"DCF (2단계)",v:dd.dcfIV?px(dd.dcfIV):"—",c:+dd.dcfIV>+dd.price?C.green:C.red,sub:dd.dcfMargin?`마진 ${fN(dd.dcfMargin,1)}%`:""},
              {l:"Lynch FV",v:dd.lynchFV?px(dd.lynchFV):"—",c:+dd.lynchFV>+dd.price?C.green:C.red,sub:dd.lynchMargin?`마진 ${fN(dd.lynchMargin,1)}%`:""},
              {l:"중앙값",v:dd.fairValueMed?px(dd.fairValueMed):"—",c:+dd.fairValueMed>+dd.price?C.green:C.red,sub:dd.medMargin?`마진 ${fN(dd.medMargin,1)}%`:""},
            ].map((x,i)=><div key={i} style={{background:C.bg,borderRadius:6,padding:"10px",textAlign:"center",border:`1px solid ${x.c}30`}}>
              <div style={{fontSize:9,color:C.grey,marginBottom:3}}>{x.l}</div>
              <div style={{fontFamily:"monospace",fontSize:13,color:x.c,fontWeight:700}}>{x.v}</div>
              {x.sub&&<div style={{fontSize:9,color:x.c,marginTop:2}}>{x.sub}</div>}
            </div>)}
          </div>
          {dd.fairValueLow&&<div style={{background:C.bg,borderRadius:6,padding:"10px",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.grey,marginBottom:3}}>적정가 범위 (7가지 방법)</div>
            <div style={{fontFamily:"monospace",fontSize:16,color:C.amber,fontWeight:700}}>{px(dd.fairValueLow)} ~ {px(dd.fairValueHigh)}</div>
            <div style={{fontSize:11,color:+dd.price<+dd.fairValueLow?C.green:+dd.price>+dd.fairValueHigh?C.red:C.amber,marginTop:6,fontWeight:700}}>
              {+dd.price<+dd.fairValueLow?"✓ 저평가 — 매수 고려":+dd.price>+dd.fairValueHigh?"⚠ 고평가 — 주의":"→ 적정가 범위 내"}
            </div>
            {dd.medMargin!=null&&<div style={{fontSize:10,color:C.grey,marginTop:3}}>중앙값 기준 안전마진 {fN(dd.medMargin,1)}%</div>}
          </div>}
        </Card>

        {dd.incHistory?.length>0&&<Card>
          <SH t="연간 실적 추이"/>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"monospace"}}>
            <thead><tr style={{color:C.grey}}>{["연도","매출","순이익","EPS","총이익률","영업이익률","순이익률"].map(h=><th key={h} style={{textAlign:h==="연도"?"left":"right",padding:"5px 4px",borderBottom:`1px solid ${C.b}`,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{dd.incHistory.map((y,i)=><tr key={i} style={{borderBottom:`1px solid ${C.b}`}}>
              <td style={{padding:"6px 4px",color:C.gold,fontWeight:700}}>{y.year}</td>
              <td style={{textAlign:"right",padding:"6px 4px"}}>{fB(y.revenue)}</td>
              <td style={{textAlign:"right",padding:"6px 4px",color:+y.netIncome>0?C.green:C.red,fontWeight:600}}>{fB(y.netIncome)}</td>
              <td style={{textAlign:"right",padding:"6px 4px"}}>${fN(y.eps)}</td>
              <td style={{textAlign:"right",padding:"6px 4px",color:upC(y.grossMargin,.40,.20)}}>{fP(y.grossMargin)}</td>
              <td style={{textAlign:"right",padding:"6px 4px",color:upC(y.opMargin,.15,.08)}}>{fP(y.opMargin)}</td>
              <td style={{textAlign:"right",padding:"6px 4px",color:upC(y.netMargin,.10,.05)}}>{fP(y.netMargin)}</td>
            </tr>)}</tbody>
          </table></div>
        </Card>}
      </div>}

      {/* ══ 적정가 ══ */}
      {dd&&tab===1&&<div>
        <Card>
          <SH t="적정가 종합" desc="여러 방법 결과가 비슷할수록 신뢰도 높음"/>
          <div style={{background:C.bg,borderRadius:8,padding:"14px",marginBottom:12,textAlign:"center"}}>
            <div style={{fontSize:10,color:C.grey,marginBottom:4}}>적정가 범위 (7가지 방법)</div>
            <div style={{fontFamily:"monospace",fontSize:20,color:C.amber,fontWeight:700}}>{dd.fairValueLow?px(dd.fairValueLow):"—"} ~ {dd.fairValueHigh?px(dd.fairValueHigh):"—"}</div>
            <div style={{fontFamily:"monospace",fontSize:14,color:C.gold,marginTop:4}}>중앙값: {dd.fairValueMed?px(dd.fairValueMed):"—"}</div>
            <div style={{fontSize:12,color:+dd.price<+dd.fairValueLow?C.green:+dd.price>+dd.fairValueHigh?C.red:C.amber,marginTop:6,fontWeight:700}}>
              현재가 {px(dd.price)} → {+dd.price<+dd.fairValueLow?"✓ 저평가":+dd.price>+dd.fairValueHigh?"⚠ 고평가":"→ 적정가"}
            </div>
          </div>
          <Row l="① Graham 수정공식" v={dd.grahamIV?px(dd.grahamIV):"—"} c={+dd.grahamIV>+dd.price?C.green:C.red} sub={dd.grahamMargin?`마진 ${fN(dd.grahamMargin,1)}% (기준 33%)`:""}  f={`EPS×(8.5+2g)×4.4/Y  g=${fN((dd.grahamG||.05)*100,1)}% (EPS 5년CAGR 기반)`} desc="Graham 핵심공식. 안전마진 33%+ 기준"/>
          <Row l="② Graham Number" v={dd.grahamNum?px(dd.grahamNum):"—"} c={+dd.grahamNum>+dd.price?C.green:C.red} sub={dd.gnMargin?`마진 ${fN(dd.gnMargin,1)}%`:""} f="√(22.5×EPS×BPS)" desc="PER×PBR≤22.5 만족점. 보수적 하한선"/>
          <Row l="③ DCF 2단계" v={dd.dcfIV?px(dd.dcfIV):"—"} c={+dd.dcfIV>+dd.price?C.green:C.red} sub={dd.dcfMargin?`마진 ${fN(dd.dcfMargin,1)}%`:""} f={`고성장5년+영구성장  WACC=${fN((dd.wacc||0.10)*100,1)}%, g=${fN((dd.grahamG||.05)*100,1)}%`} desc="베타 기반 WACC. EPS 5년CAGR 성장률"/>
          <Row l="④ Lynch FV (PEG=1)" v={dd.lynchFV?px(dd.lynchFV):"—"} c={+dd.lynchFV>+dd.price?C.green:C.red} sub={dd.lynchMargin?`마진 ${fN(dd.lynchMargin,1)}%`:""} f="EPS×EPS성장률%" desc="피터 린치. PEG<1 저평가"/>
          <Row l="⑤ EPV (수익력가치)" v={dd.epv?px(dd.epv):"—"} c={dd.epv&&+dd.epv>+dd.price?C.green:C.red} f="EBIT×(1-세율)/WACC/주식수" desc="Greenwald. 성장없다고 가정한 보수적 하한선"/>
          <Row l="⑥ DDM (배당할인)" v={dd.ddmIV?px(dd.ddmIV):"—"} c={dd.ddmIV&&+dd.ddmIV>+dd.price?C.green:C.red} f="DPS/(r-g)" desc="배당주에 적합"/>
          <Row l="⑦ Acquirer's IV" v={dd.acquirerIV?px(dd.acquirerIV):"—"} c={dd.acquirerIV&&+dd.acquirerIV>+dd.price?C.green:C.red} f="NOPAT×15배 기준" desc="기업 인수 관점 적정가"/>
          <Row l="NCAV (청산가치)" v={dd.ncav?fB(dd.ncav):"—"} f="유동자산-총부채" desc="이하 거래시 담배꽁초 매수"/>
          <Row l="애널리스트 목표가" v={dd.targetPrice?px(dd.targetPrice):"—"} c={C.blue} sub={dd.targetPrice&&dd.price?`업사이드 ${((+dd.targetPrice/+dd.price-1)*100).toFixed(1)}%`:""}/>
          <Row l="FCF 수익률" v={dd.fcfYield?fP(dd.fcfYield):"—"} c={upC(dd.fcfYield,.05,.03)} desc="채권수익률보다 높으면 저평가"/>
        </Card>
      </div>}

      {/* ══ Graham ══ */}
      {dd&&tab===2&&<div>
        <Card><SH t="Graham 내재가치" r={<Badge l={`Graham ${dd.gScore}/100`} c={dd.gScore>=70?C.green:dd.gScore>=50?C.amber:C.red}/>} sub="Security Analysis(1934) · Intelligent Investor(1949)" desc="안전마진 확보 + 정량 기준 충족"/>
          <Row l="현재가" v={px(dd.price)} sub={fKRW(dd.price,dd.usdKrw)}/>
          <Row l="Graham 수정공식 IV" v={dd.grahamIV?px(dd.grahamIV):"—"} c={+dd.grahamIV>+dd.price?C.green:C.red} f={`IV=EPS×(8.5+2g)×4.4/Y  g=${fN((dd.grahamG||.05)*100,1)}% (EPS 5년CAGR)`} sub={dd.grahamMargin?`안전마진 ${fN(dd.grahamMargin,1)}%`:""}/>
          <Row l="Graham Number" v={dd.grahamNum?px(dd.grahamNum):"—"} c={+dd.grahamNum>+dd.price?C.green:C.red} f="√(22.5×EPS×BPS)" sub={dd.gnMargin?`마진 ${fN(dd.gnMargin,1)}%`:""}/>
          <Row l="NCAV" v={dd.ncav?fB(dd.ncav):"—"} f="유동자산-총부채"/>
          <Row l="Lynch FV" v={dd.lynchFV?px(dd.lynchFV):"—"} c={+dd.lynchFV>+dd.price?C.green:C.red} f="EPS×성장률%" sub={dd.lynchMargin?`마진 ${fN(dd.lynchMargin,1)}%`:""}/>
          <Row l="EPS" v={`$${fN(dd.eps)}`}/><Row l="BPS" v={`$${fN(dd.bvps)}`}/>
          <Row l="EPS 5년 CAGR (g값)" v={fP(dd.epsCagr5y||dd.grahamG)} c={C.gold} desc="Graham IV 계산에 사용되는 성장률. 과거 5년 EPS 복합성장률"/>
        </Card>
        <Card><SH t="Graham 7대 기준" desc="5개 이상 충족 시 Graham 기준 투자 적합"/>
          {[
            {l:"① 적정 기업 규모",sub:"매출 $1억+",ok:+dd.revenue>=1e8,v:fB(dd.revenue),desc:"중소기업 제외"},
            {l:"② 재무 건전성",sub:"유동비율 ≥ 2.0",ok:+dd.currentRatio>=2,v:fN(dd.currentRatio,2)+"x",desc:"단기 채무를 2배 커버"},
            {l:"③ 이익 안정성",sub:"순이익 양수",ok:+dd.netIncome>0,v:fB(dd.netIncome),desc:"10년 연속 흑자 이상적"},
            {l:"④ 배당 지속성",sub:"배당 지급",ok:+dd.divYield>0,v:+dd.divYield>0?fP(dd.divYield):"무배당",desc:"20년+ 지속 이상적"},
            {l:"⑤ 이익 성장",sub:"매출성장 ≥ 3%",ok:+dd.revenueGrowth>=.03,v:fP(dd.revenueGrowth),desc:"10년간 33%+ 성장 기준"},
            {l:"⑥ 적정 PER",sub:"PER ≤ 15배",ok:+dd.pe>0&&+dd.pe<=15,v:dd.pe?fN(dd.pe,1)+"x":"—"},
            {l:"⑦ PER×PBR ≤ 22.5",sub:"복합 기준",ok:+dd.pe&&+dd.pb&&+dd.pe*+dd.pb<=22.5,v:+dd.pe&&+dd.pb?fN(+dd.pe*+dd.pb,1):"—",desc:"15×1.5=22.5"},
          ].map((x,i)=><Chk key={i} l={x.l} ok={x.ok} v={x.v} sub={x.sub} desc={x.desc}/>)}
        </Card>
        <Card><SH t="재무건전성"/>
          <Row l="유동비율" v={fN(dd.currentRatio,2)+"x"} c={upC(dd.currentRatio,2,1.5)} f="유동자산/유동부채" desc="2.0+ 우수"/>
          <Row l="당좌비율" v={fN(dd.quickRatio,2)+"x"} c={upC(dd.quickRatio,1.5,1)} f="(유동자산-재고)/유동부채"/>
          <Row l="부채비율 D/E" v={fN(dd.deRatio,2)+"x"} c={dnC(dd.deRatio,.5,1)} desc="0.5이하 안전"/>
          <Row l="이자보상배율" v={dd.interestCoverage?`${fN(dd.interestCoverage,1)}x`:"—"} c={upC(dd.interestCoverage,5,2)} desc="5배+ 우수"/>
          <Row l="순부채" v={fB(dd.netDebt)} c={+dd.netDebt<0?C.green:C.grey} sub={+dd.netDebt<0?"순현금 보유":""}/>
          <Row l="총현금" v={fB(dd.totalCash)} sub={fKRW(dd.totalCash,dd.usdKrw)}/>
          <Row l="총부채" v={fB(dd.totalDebt)}/><Row l="자기자본" v={fB(dd.equity)}/>
        </Card>
      </div>}

      {/* ══ Buffett ══ */}
      {dd&&tab===3&&<div>
        <Card><SH t="오너어닝 & FCF" r={<Badge l={`Buffett ${dd.bScore}/100`} c={dd.bScore>=70?C.green:dd.bScore>=50?C.amber:C.red}/>} sub="Berkshire 주주서한 1986+" desc="'내 주머니에 얼마의 현금이 들어오는가'"/>
          <Row l="오너어닝" v={fB(dd.ownerEarnings)} c={+dd.ownerEarnings>0?C.green:C.red} f="순이익+D&A-Capex" desc="1986 주주서한. 진정한 수익력"/>
          <Row l="FCF" v={fB(dd.fcf)} c={+dd.fcf>0?C.green:C.red} f="영업CF-Capex"/>
          <Row l="주당 FCF" v={dd.fcfPerSh?`$${fN(dd.fcfPerSh)}`:"—"}/>
          <Row l="DCF 내재가치" v={dd.dcfIV?px(dd.dcfIV):"—"} c={+dd.dcfIV>+dd.price?C.green:C.red} f={`2단계DCF  WACC=${fN((dd.wacc||0.10)*100,1)}%, g=${fN((dd.grahamG||.05)*100,1)}%`}/>
          <Row l="→ DCF 마진" v={dd.dcfMargin?`${fN(dd.dcfMargin,1)}%`:"—"} c={+dd.dcfMargin>=25?C.green:+dd.dcfMargin>=0?C.amber:C.red} desc="25%+ 매수 고려"/>
          <Row l="FCF/순이익" v={dd.fcf&&dd.netIncome?`${(+dd.fcf/+dd.netIncome*100).toFixed(0)}%`:"—"} c={+dd.fcf&&+dd.netIncome&&+dd.fcf/+dd.netIncome>=.8?C.green:C.amber} desc="80%+ 이익품질 우수"/>
          <Row l="Capex 집약도" v={dd.capexIntensity?fP(dd.capexIntensity):"—"} c={dnC(dd.capexIntensity,.05,.15)} desc="낮을수록 자본효율 높음"/>
          <Row l="영업CF" v={fB(dd.opCF)}/><Row l="Capex" v={fB(dd.capex)}/><Row l="D&A" v={fB(dd.depr)}/>
        </Card>
        <Card><SH t="해자 & 수익성"/>
          <Row l="ROE" v={fP(dd.roe)} c={upC(dd.roe,.20,.12)} f="순이익/자기자본" desc="15%+ 강한 해자"/>
          <Row l="ROA" v={fP(dd.roa)} c={upC(dd.roa,.08,.04)}/><Row l="ROIC" v={fP(dd.roic)} c={upC(dd.roic,.12,.08)} f="순이익/(자기자본+총부채)" desc="WACC 초과 시 가치창출"/>
          <Row l="DuPont ROE" v={dd.dupont?fP(dd.dupont):"—"} f="순이익률×자산회전율×레버리지" desc="부채로 ROE 높이면 주의"/>
          <Row l="Gross Profitability" v={dd.grossProfitability?fP(dd.grossProfitability):"—"} f="매출총이익/총자산" c={upC(dd.grossProfitability,.33,.20)} desc="Novy-Marx(2013). 0.33+ 우수"/>
          <Row l="매출총이익률" v={fP(dd.grossMargin)} c={upC(dd.grossMargin,.40,.25)} desc="40%+ 브랜드파워"/>
          <Row l="영업이익률" v={fP(dd.opMargin)} c={upC(dd.opMargin,.20,.10)}/><Row l="순이익률" v={fP(dd.profMargin)} c={upC(dd.profMargin,.15,.08)}/>
          <Row l="Acquirer's Multiple" v={dd.acquirersMult?`${fN(dd.acquirersMult,1)}x`:"—"} f="EV/EBIT" desc="Carlisle. 낮을수록 저렴"/>
        </Card>
        <Card><SH t="Buffett 체크리스트"/>
          {[
            {l:"ROE ≥ 15%",ok:+dd.roe>=.15,v:fP(dd.roe)},{l:"매출총이익률 ≥ 40%",ok:+dd.grossMargin>=.40,v:fP(dd.grossMargin)},
            {l:"영업이익률 ≥ 15%",ok:+dd.opMargin>=.15,v:fP(dd.opMargin)},{l:"부채비율 D/E ≤ 0.5",ok:+dd.deRatio<=.5,v:fN(dd.deRatio,2)},
            {l:"FCF 양수",ok:+dd.fcf>0,v:fB(dd.fcf)},{l:"오너어닝 양수",ok:+dd.ownerEarnings>0,v:fB(dd.ownerEarnings)},
            {l:"저베타 ≤ 1.2",ok:+dd.beta>0&&+dd.beta<=1.2,v:fN(dd.beta,2)},{l:"FCF/순이익 ≥ 80%",ok:+dd.fcf&&+dd.netIncome&&+dd.fcf/+dd.netIncome>=.8,v:dd.fcf&&dd.netIncome?`${(+dd.fcf/+dd.netIncome*100).toFixed(0)}%`:"—"},
            {l:"이자보상배율 ≥ 3x",ok:+dd.interestCoverage>=3,v:dd.interestCoverage?`${fN(dd.interestCoverage,1)}x`:"—"},
            {l:"Capex 집약도 ≤ 10%",ok:+dd.capexIntensity<=.10,v:dd.capexIntensity?fP(dd.capexIntensity):"—"},
          ].map((x,i)=><Chk key={i} l={x.l} ok={x.ok} v={x.v}/>)}
        </Card>
      </div>}

      {/* ══ Li Lu ══ */}
      {dd&&tab===4&&<div>
        <Card><SH t="Li Lu 정량 평가" r={<Badge l={`Li Lu ${dd.lScore}/100`} c={dd.lScore>=70?C.green:dd.lScore>=50?C.amber:C.red}/>} sub="Himalaya Capital — 문명 진보 방향에 베팅" desc="'문명의 진보는 불가역적이다'"/>
          {[
            {l:"ROE ≥ 20%",sub:"장기 복리 핵심",ok:+dd.roe>=.20,v:fP(dd.roe),desc:"20%+ 기업은 10년 후 놀라운 복리"},
            {l:"매출총이익률 ≥ 50%",sub:"압도적 해자",ok:+dd.grossMargin>=.50,v:fP(dd.grossMargin),desc:"소프트웨어·플랫폼 특성"},
            {l:"매출성장 ≥ 15%",sub:"불가역적 성장",ok:+dd.revenueGrowth>=.15,v:fP(dd.revenueGrowth),desc:"한번 쓰면 못 돌아가는 수요"},
            {l:"FCF 양수",sub:"자생적 자본창출",ok:+dd.fcf>0,v:fB(dd.fcf)},
            {l:"저베타 ≤ 1.0",sub:"안정적 사업",ok:+dd.beta>0&&+dd.beta<=1.0,v:fN(dd.beta,2),desc:"예측 가능한 사업모델"},
            {l:"영업이익률 ≥ 20%",sub:"운영 레버리지",ok:+dd.opMargin>=.20,v:fP(dd.opMargin)},
            {l:"부채비율 ≤ 0.3",sub:"보수적 재무",ok:+dd.deRatio<=.3,v:fN(dd.deRatio,2)},
            {l:"순이익 성장 양수",sub:"실제 이익 증가",ok:+dd.netIncomeGrowth>0,v:fP(dd.netIncomeGrowth)},
          ].map((x,i)=><Chk key={i} l={x.l} ok={x.ok} v={x.v} sub={x.sub} desc={x.desc} dot/>)}
        </Card>
        <Card><SH t="Li Lu 5대 프레임워크"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[
              {t:"비즈니스 이해",q:"10년 후에도 동일 사업?",m:`FCF: ${fB(dd.fcf)}`,ok:+dd.fcf>0,d:"이해 못하면 투자 안함"},
              {t:"경쟁우위 해자",q:"매출총이익률 압도적?",m:fP(dd.grossMargin),ok:+dd.grossMargin>=.40,d:"모방 불가능한 우위"},
              {t:"경영진 신뢰",q:"자본 효율적 배분?",m:`ROE: ${fP(dd.roe)}`,ok:+dd.roe>=.15,d:"소유자 마인드로 경영"},
              {t:"불가역적 성장",q:"구조적 성장 지속?",m:fP(dd.revenueGrowth),ok:+dd.revenueGrowth>=.10,d:"문명 진보 방향과 일치"},
              {t:"안전마진",q:"저평가 구간?",m:`마진 ${fN(dd.grahamMargin,1)}%`,ok:+dd.grahamMargin>=20,d:"좋아도 비싸면 안됨"},
            ].map((f,i)=><div key={i} style={{background:C.bg,borderRadius:6,padding:"10px",border:`1px solid ${f.ok?C.green+"50":C.b}`}}>
              <div style={{fontSize:9,color:C.gold,textTransform:"uppercase",letterSpacing:1,marginBottom:3,fontWeight:700}}>{f.t}</div>
              <div style={{fontSize:10,color:C.grey,marginBottom:2}}>{f.q}</div>
              <div style={{fontSize:9,color:C.amber,marginBottom:5}}>💡 {f.d}</div>
              <div style={{fontFamily:"monospace",fontSize:12,color:f.ok?C.green:C.red,fontWeight:700}}>{f.m}</div>
              <div style={{fontSize:9,color:f.ok?C.green:C.red,marginTop:2}}>{f.ok?"✓ 충족":"✗ 미충족"}</div>
            </div>)}
          </div>
        </Card>
      </div>}

      {/* ══ 공식 ══ */}
      {dd&&tab===5&&<div>
        <Card><SH t="Graham 공식"/>
          <FBox title="① Graham 수정 내재가치 (1962)" formula={`IV = EPS × (8.5 + 2g) × 4.4 / Y\nEPS=$${fN(dd.eps)}, g=${fN((dd.grahamG||.05)*100,1)}% (EPS 5년CAGR), Y=4.2%`} result={dd.grahamIV?`$${fN(dd.grahamIV)} (마진 ${fN(dd.grahamMargin,1)}%)`:"계산불가"} desc="8.5=무성장PER / g=EPS 5년CAGR (과거 성장률 기반) / 4.4=기준무위험수익률"/>
          <FBox title="② Graham Number" formula={`√(22.5×EPS×BPS) = √(22.5×$${fN(dd.eps)}×$${fN(dd.bvps)})`} result={dd.grahamNum?`$${fN(dd.grahamNum)} (마진 ${fN(dd.gnMargin,1)}%)`:"계산불가"} desc="PER×PBR≤22.5 만족점"/>
          <FBox title="③ NCAV" formula={`유동자산-총부채 = ${fB(dd.currAssets)}-${fB(dd.totalLiab)} = ${dd.ncav?fB(dd.ncav):"계산불가"}`} desc="청산가치. 이하 거래시 담배꽁초 매수기준"/>
        </Card>
        <Card><SH t="Buffett 공식"/>
          <FBox title="④ 오너어닝 (1986)" formula={`OE=순이익+D&A-Capex\n=${fB(dd.netIncome)}+${fB(dd.depr)}-${fB(dd.capex)} = ${fB(dd.ownerEarnings)}`} desc="진정한 현금창출력"/>
          <FBox title="⑤ DCF 2단계 (베타 기반 WACC)" formula={`WACC = ${fP(dd.wacc)} (rf=4.3%+β×ERP, β=${fN(dd.beta,2)})\ng = ${fP(dd.grahamG)} (EPS 5년CAGR)\n고성장5년+영구성장 합산\n= ${dd.dcfIV?`$${fN(dd.dcfIV)}`:"계산불가"}`} desc="단순 10% 고정 대신 베타 기반 동적 WACC 사용"/>
          <FBox title="⑥ DuPont ROE 분해" formula={`ROE=순이익률×자산회전율×레버리지\n=${fP(dd.profMargin)}×${fN(dd.assetTurnover,2)}x×${fN(dd.equityMultiplier,2)}x = ${fP(dd.dupont)}`} desc="ROE 상승 원인 파악"/>
        </Card>
        <Card><SH t="논문 기반 공식"/>
          <FBox title="⑦ Lynch FV (PEG=1)" formula={`EPS×성장률(%) = $${fN(dd.eps)}×${fN((dd.epsCagr5y||dd.grahamG||.05)*100,1)} = ${dd.lynchFV?`$${fN(dd.lynchFV)}`:"계산불가"}`} desc="피터 린치. PEG<1 저평가"/>
          <FBox title="⑧ Magic Formula (Greenblatt 2005)" formula={`수익수익률=EBITDA/EV=${dd.earningsYield?fP(dd.earningsYield):"—"}\nROC=EBIT/투하자본=${dd.returnOnCapital?fP(dd.returnOnCapital):"—"}\nEV=${fB(dd.ev)}`} desc="두 지표 순위 합산. 연30%+ 백테스트"/>
          <FBox title="⑨ Novy-Marx GP/A (2013)" formula={`GP/A=매출총이익/총자산\n=${fB(dd.grossProfit)}/${fB(dd.totalAssets)} = ${dd.grossProfitability?fP(dd.grossProfitability):"계산불가"}`} desc="0.33+ 수익성 우수. 향후 주가수익률 예측력↑"/>
          <FBox title="⑩ EPV (Greenwald)" formula={`EPV=EBIT×(1-세율)/WACC/주식수\n=${fB(dd.opIncome)}×0.79/${fP(dd.wacc)}/${fB(dd.sharesOutstanding)} = ${dd.epv?`$${fN(dd.epv)}`:"계산불가"}`} desc="성장없다고 가정 시 현재 수익력 가치"/>
          <FBox title="⑪ Acquirer's Multiple (Carlisle)" formula={`EV/EBIT=${dd.acquirersMult?fN(dd.acquirersMult,1)+"x":"계산불가"}`} desc="역대 최고 수익률 멀티플"/>
        </Card>
      </div>}

      {/* ══ 고급지표 ══ */}
      {dd&&tab===6&&<div>
        <Card><SH t="Piotroski F-Score (9점)" r={<Badge l={`${dd.fScore}/9 ${dd.fScore>=7?"우수":dd.fScore>=4?"양호":"주의"}`} c={dd.fScore>=7?C.green:dd.fScore>=4?C.amber:C.red}/>} sub="Joseph Piotroski, Journal of Accounting Research (2000)" desc="7+ 강한 매수 / 0-3 주의"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>{(dd.fDetails||[]).map((f,i)=><Chk key={i} l={f.n} ok={f.ok}/>)}</div>
          <div style={{marginTop:8,padding:10,background:C.bg,borderRadius:6}}><div style={{fontSize:10,color:C.amber,lineHeight:1.7}}>💡 수익성(4) + 레버리지/유동성(3) + 운영효율(2) = 9점 만점</div></div>
        </Card>
        <Card><SH t="Altman Z-Score" r={<Badge l={dd.zScore?`Z=${fN(dd.zScore,2)} ${dd.zScore>=2.99?"안전":dd.zScore>=1.81?"주의":"위험"}`:"계산중"} c={dd.zScore&&dd.zScore>=2.99?C.green:dd.zScore&&dd.zScore>=1.81?C.amber:C.red}/>} sub="Edward Altman, Journal of Finance (1968)" desc="2년 내 부도 예측. 정확도 80-90%"/>
          <FBox formula={`Z=1.2×X1+1.4×X2+3.3×X3+0.6×X4+X5\nZ=${dd.zScore?fN(dd.zScore,2):"계산불가"}`} result={dd.zScore?(dd.zScore>=2.99?"안전(Z≥2.99)":dd.zScore>=1.81?"주의(1.81~2.99)":"위험(Z<1.81)"):"계산불가"} desc="Z≥2.99 안전 / 1.81~2.99 주의 / Z<1.81 위험"/>
        </Card>
        <Card><SH t="Beneish M-Score (회계조작)" r={<Badge l={dd.mScore?`M=${fN(dd.mScore,2)} ${dd.mScore>-1.78?"조작의심":"정상"}`:"계산중"} c={dd.mScore&&dd.mScore>-1.78?C.red:C.green}/>} sub="Messod Beneish, Financial Analysts Journal (1999)" desc="M>-1.78 조작 의심. 엔론·월드컴 사전 탐지"/>
          <div style={{background:C.bg,borderRadius:6,padding:"12px",border:`1px solid ${C.b}`}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:C.amber}}>M-Score = {dd.mScore?fN(dd.mScore,2):"계산불가"}</div>
            {dd.mScore&&<div style={{fontFamily:"monospace",fontSize:13,color:dd.mScore>-1.78?C.red:C.green,marginTop:4,fontWeight:700}}>{dd.mScore>-1.78?"⚠ 조작 의심 — 추가 확인 필요":"✓ 정상 범위"}</div>}
          </div>
        </Card>
        <Card><SH t="Ohlson O-Score (부도확률)" r={<Badge l={dd.oScore?`O=${fN(dd.oScore,2)} ${dd.oScore>-0.3?"위험":dd.oScore>-1?"주의":"안전"}`:"계산중"} c={dd.oScore&&dd.oScore>-0.3?C.red:dd.oScore&&dd.oScore>-1?C.amber:C.green}/>} sub="James Ohlson (1980)"/>
          <div style={{background:C.bg,borderRadius:6,padding:"10px",border:`1px solid ${C.b}`}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:C.amber}}>O-Score = {dd.oScore?fN(dd.oScore,2):"계산불가"}</div>
            {dd.oScore&&<div style={{fontFamily:"monospace",fontSize:13,color:dd.oScore>-0.3?C.red:dd.oScore>-1?C.amber:C.green,marginTop:4,fontWeight:700}}>부도확률 ≈ {(1/(1+Math.exp(-dd.oScore))*100).toFixed(1)}%</div>}
          </div>
        </Card>
        <Card><SH t="성장성 & EV 지표"/>
          <Row l="매출 성장률 YoY" v={fP(dd.revenueGrowth)} c={upC(dd.revenueGrowth,.15,.05)}/><Row l="순이익 성장률" v={fP(dd.netIncomeGrowth)} c={+dd.netIncomeGrowth>0?C.green:C.red}/>
          <Row l="EPS 성장률 YoY" v={fP(dd.epsGrowth1y)} c={+dd.epsGrowth1y>0?C.green:C.red}/><Row l="EPS 5년 CAGR" v={fP(dd.epsCagr5y)} c={+dd.epsCagr5y>0.10?C.green:+dd.epsCagr5y>0.05?C.amber:C.red} desc="Graham IV 계산에 사용"/>
          <Row l="FCF 성장률" v={fP(dd.fcfGrowth)} c={+dd.fcfGrowth>0?C.green:C.red}/><Row l="기업가치 EV" v={fB(dd.ev)} f="시총+총부채-현금"/>
          <Row l="EV/EBITDA" v={dd.evEbitda?`${fN(dd.evEbitda,1)}x`:"—"} c={dnC(dd.evEbitda,10,20)}/><Row l="EV/EBIT" v={dd.evEbit?`${fN(dd.evEbit,1)}x`:"—"} c={dnC(dd.evEbit,12,25)}/>
          <Row l="EV/NOPAT" v={dd.evNopat?`${fN(dd.evNopat,1)}x`:"—"} desc="세후영업이익 기준"/><Row l="EV/FCF" v={dd.evFcf?`${fN(dd.evFcf,1)}x`:"—"} c={dnC(dd.evFcf,15,30)}/>
          <Row l="FCF 수익률" v={dd.fcfYield?fP(dd.fcfYield):"—"} c={upC(dd.fcfYield,.05,.03)} desc="채권수익률보다 높으면 저평가"/>
          <Row l="이익수익률(1/PER)" v={dd.pe?fP(1/+dd.pe):"—"}/><Row l="WACC (베타 기반)" v={fP(dd.wacc)} desc={`rf=4.3%, β=${fN(dd.beta,2)}, ERP=5.5%`}/>
        </Card>
      </div>}

      {/* ══ 버핏 도구 ══ */}
      {dd&&tab===7&&(()=>{
        const eps=+dd.eps||0, pe=+dd.pe||0, price=+dd.price||0, g=dd.grahamG||0.05;
        const buffettBuy10=dd.fcfPerSh&&dd.fcfPerSh>0?dd.fcfPerSh*(1+g)/(0.10-Math.min(g,0.09)):eps>0?eps/0.10*(1+g):null;
        const buffettBuy15=dd.fcfPerSh&&dd.fcfPerSh>0?dd.fcfPerSh*(1+g)/(0.15-Math.min(g,0.14)):eps>0?eps/0.15*(1+g):null;
        let breakEvenG=null;
        if(eps>0&&pe>0&&price>0) breakEvenG=Math.pow(price/eps/pe,1/10)-1;
        const sim=[0.03,0.05,0.08,0.10,0.12,0.15].map(gr=>({rate:gr,eps10:eps>0?eps*Math.pow(1+gr,10):null,price10:eps>0&&pe>0?eps*Math.pow(1+gr,10)*pe:null}));
        return<div>
          <Card>
            <SH t="버핏 매수가 계산기" desc="목표 수익률을 달성하려면 지금 얼마에 사야 하는가"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:C.bg,borderRadius:8,padding:"14px",textAlign:"center",border:`1px solid ${C.green}40`}}>
                <div style={{fontSize:10,color:C.grey,marginBottom:4}}>목표수익률 10% 최대 매수가</div>
                <div style={{fontFamily:"monospace",fontSize:20,color:C.green,fontWeight:700}}>{buffettBuy10?`$${fN(buffettBuy10)}`:"—"}</div>
                <div style={{fontSize:10,color:C.grey,marginTop:4}}>현재가 대비 {buffettBuy10?((buffettBuy10/price-1)*100).toFixed(1)+"%":"—"}</div>
                <div style={{fontSize:9,color:C.amber,marginTop:4}}>💡 이 가격 이하에서 매수해야 연 10% 가능</div>
              </div>
              <div style={{background:C.bg,borderRadius:8,padding:"14px",textAlign:"center",border:`1px solid ${C.gold}40`}}>
                <div style={{fontSize:10,color:C.grey,marginBottom:4}}>목표수익률 15% 최대 매수가</div>
                <div style={{fontFamily:"monospace",fontSize:20,color:C.gold,fontWeight:700}}>{buffettBuy15?`$${fN(buffettBuy15)}`:"—"}</div>
                <div style={{fontSize:10,color:C.grey,marginTop:4}}>현재가 대비 {buffettBuy15?((buffettBuy15/price-1)*100).toFixed(1)+"%":"—"}</div>
                <div style={{fontSize:9,color:C.amber,marginTop:4}}>💡 버핏 기준. 연 15% 목표</div>
              </div>
            </div>
            <div style={{background:C.bg,borderRadius:6,padding:"10px",fontSize:10,color:C.amber,lineHeight:1.7}}>
              💡 사용 성장률 g={fP(dd.grahamG)} (EPS 5년CAGR) · WACC={fP(dd.wacc)} (베타 기반)
            </div>
          </Card>
          <Card>
            <SH t="역 DCF — 현재 주가가 말하는 것" desc="현재 주가를 정당화하려면 앞으로 몇 % 성장해야 하는가"/>
            <div style={{background:C.bg,borderRadius:8,padding:"16px",textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:11,color:C.grey,marginBottom:6}}>현재가 ${fN(price)}를 정당화하는 시장 내재 성장률</div>
              <div style={{fontFamily:"monospace",fontSize:24,color:C.amber,fontWeight:700}}>{breakEvenG?fP(breakEvenG):"—"}</div>
              <div style={{fontSize:11,color:breakEvenG&&g&&breakEvenG>g?C.red:C.green,marginTop:6,fontWeight:700}}>
                {breakEvenG&&g?(breakEvenG>g?"⚠ 시장이 과도한 성장 기대 — 고평가 가능":"✓ 현실적 기대 — 적정 또는 저평가"):""}
              </div>
              <div style={{fontSize:10,color:C.amber,marginTop:4}}>💡 실제 예상 g={fP(dd.grahamG)}보다 높으면 고평가, 낮으면 저평가</div>
            </div>
            <Row l="실제 예상 성장률 (EPS 5년CAGR)" v={fP(dd.epsCagr5y||dd.grahamG)} c={C.gold}/>
            <Row l="시장 내재 성장률 (역DCF)" v={breakEvenG?fP(breakEvenG):"—"} c={breakEvenG&&dd.grahamG&&breakEvenG>dd.grahamG?C.red:C.green}/>
            <Row l="판정" v={breakEvenG&&dd.grahamG?(breakEvenG>dd.grahamG?"고평가 의심":"저평가 가능"):"—"} c={breakEvenG&&dd.grahamG?(breakEvenG>dd.grahamG?C.red:C.green):C.grey}/>
          </Card>
          <Card>
            <SH t="10년 후 주가 시뮬레이터" desc="성장률별 10년 후 예상 주가. 현재 PER 유지 가정"/>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"monospace"}}>
                <thead><tr style={{color:C.grey}}>{["연 성장률","10년 후 EPS","10년 후 주가","현재 대비","연 수익률"].map(h=><th key={h} style={{textAlign:"right",padding:"6px 6px",borderBottom:`1px solid ${C.b}`,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                <tbody>{sim.map((s,i)=>{
                  const ret=s.price10&&price?Math.pow(s.price10/price,1/10)-1:null;
                  const isReal=Math.abs(s.rate-(dd.grahamG||0.05))<0.015;
                  return<tr key={i} style={{borderBottom:`1px solid ${C.b}`,background:isReal?C.gold+"10":"transparent"}}>
                    <td style={{padding:"7px 6px",color:isReal?C.gold:C.text,fontWeight:isReal?700:400,textAlign:"right"}}>{fP(s.rate)}{isReal?" ←":""}</td>
                    <td style={{textAlign:"right",padding:"7px 6px"}}>${fN(s.eps10)}</td>
                    <td style={{textAlign:"right",padding:"7px 6px",color:s.price10&&s.price10>price?C.green:C.red}}>{s.price10?`$${fN(s.price10)}`:"—"}</td>
                    <td style={{textAlign:"right",padding:"7px 6px",color:s.price10&&s.price10>price?C.green:C.red}}>{s.price10?`${((s.price10/price-1)*100).toFixed(0)}%`:"—"}</td>
                    <td style={{textAlign:"right",padding:"7px 6px",color:ret&&ret>0.10?C.green:ret&&ret>0.06?C.amber:C.red}}>{ret?fP(ret):"—"}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
            <div style={{fontSize:10,color:C.grey,marginTop:8}}>💡 현재 PER {fN(pe,1)}배 유지 가정</div>
          </Card>
        </div>;
      })()}

      {/* ══ 기업 해독 ══ */}
      {dd&&tab===8&&<AICard title={`${dd.name} 기업 해독 카드`} content={decoder} loading={decoderLoad} onGenerate={()=>aiAnalyze("decoder",setDecoder,setDecoderLoad)} btnLabel="기업 해독 카드 생성 (AI)"/>}

      {/* ══ 가격 판독 ══ */}
      {dd&&tab===9&&<AICard title={`${dd.name} 가격 판독 카드`} content={priceCard} loading={priceLoad} onGenerate={()=>aiAnalyze("price",setPriceCard,setPriceLoad)} btnLabel="가격 판독 카드 생성 (AI)"/>}

      {/* ══ 스토리 ══ */}
      {dd&&tab===10&&<AICard title={`${dd.name} 스토리 분석 카드`} content={storyCard} loading={storyLoad} onGenerate={()=>aiAnalyze("story",setStoryCard,setStoryLoad)} btnLabel="스토리 분석 카드 생성 (AI)"/>}

      {/* ══ 추천 종목 ══ */}
      {tab===11&&<div>
        <Card>
          <SH t="가치투자 추천 종목 스캔" desc="Graham·Buffett 점수 기준 S&P500 우량주 자동 스캔"/>
          {!recs&&!recLoad&&<div style={{textAlign:"center",padding:"30px"}}>
            <div style={{color:C.grey,fontSize:13,marginBottom:16,lineHeight:1.8}}>Graham·Buffett 기준으로 S&P500 우량주 자동 스캔<br/><span style={{fontSize:11,color:C.dim}}>약 30~40초 소요</span></div>
            <button onClick={async()=>{setRecLoad(true);setRecs(null);try{const r=await fetch("/api/recommend");const j=await r.json();setRecs(j);}catch(e){setRecs({error:e.message});}finally{setRecLoad(false);}}} style={{background:C.gold,color:"#06101A",border:"none",borderRadius:8,padding:"13px 32px",fontWeight:700,fontSize:14,cursor:"pointer"}}>지금 스캔하기</button>
          </div>}
          {recLoad&&<div style={{textAlign:"center",padding:"40px"}}><div style={{color:C.gold,fontFamily:"monospace",fontSize:13}}>S&P500 우량주 스캔중...</div></div>}
          {recs?.error&&<div style={{color:C.red,fontSize:13}}>{recs.error}</div>}
          {recs?.results&&<div>
            <div style={{fontSize:11,color:C.grey,marginBottom:12}}>{recs.scanned}개 종목 스캔 완료</div>
            {recs.results.map((r,i)=>(
              <div key={i} style={{background:C.bg,borderRadius:8,padding:"14px",marginBottom:8,border:`1px solid ${r.score>=70?C.green:r.score>=50?C.gold:C.b}`,cursor:"pointer"}} onClick={()=>{setInp(r.ticker);analyze(r.ticker);setTab(0);}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><span style={{fontFamily:"monospace",fontSize:14,color:C.gold,fontWeight:700}}>{r.ticker}</span><span style={{fontSize:11,color:C.grey,marginLeft:8}}>{r.name?.slice(0,20)}</span><div style={{fontSize:10,color:C.dim,marginTop:2}}>{r.sector}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontSize:16,color:r.score>=70?C.green:r.score>=50?C.gold:C.amber,fontWeight:700}}>{r.score}점</div><div style={{fontSize:9,color:C.grey}}>/100점</div></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                  {[{l:"PER",v:r.pe?`${fN(r.pe,1)}x`:"—",c:r.pe&&r.pe<=15?C.green:r.pe&&r.pe<=25?C.amber:C.red},{l:"PBR",v:r.pb?`${fN(r.pb,2)}x`:"—",c:r.pb&&r.pb<=1.5?C.green:r.pb&&r.pb<=3?C.amber:C.red},{l:"ROE",v:r.roe?fP(r.roe):"—",c:r.roe&&r.roe>=0.15?C.green:r.roe&&r.roe>=0.10?C.amber:C.red},{l:"총이익률",v:r.gm?fP(r.gm):"—",c:r.gm&&r.gm>=0.40?C.green:r.gm&&r.gm>=0.25?C.amber:C.red}].map((x,j)=>(
                    <div key={j} style={{background:C.card,borderRadius:4,padding:"6px",textAlign:"center"}}><div style={{fontSize:9,color:C.grey,marginBottom:2}}>{x.l}</div><div style={{fontFamily:"monospace",fontSize:11,color:x.c,fontWeight:600}}>{x.v}</div></div>
                  ))}
                </div>
                {r.grahamIV&&<div style={{marginTop:8,fontSize:10,color:C.grey}}>Graham IV: <span style={{color:C.gold,fontFamily:"monospace"}}>${fN(r.grahamIV)}</span>{r.margin&&<span style={{color:r.margin>0?C.green:C.red,marginLeft:8}}>마진 {fN(r.margin,1)}%</span>}<span style={{color:C.blue,marginLeft:12,fontWeight:600}}>→ 클릭해서 상세 분석</span></div>}
              </div>
            ))}
            <button onClick={()=>setRecs(null)} style={{background:"transparent",border:`1px solid ${C.b}`,color:C.grey,borderRadius:6,padding:"8px 16px",fontSize:11,cursor:"pointer",marginTop:4}}>↺ 다시 스캔</button>
          </div>}
        </Card>
      </div>}
    </div>

    <div style={{borderTop:`1px solid ${C.b}`,padding:"12px",textAlign:"center",marginTop:16}}>
      <div style={{fontSize:10,color:C.dim,fontFamily:"monospace"}}>VALUE LEGEND PRO · Alpha Vantage · 투자 결정의 책임은 본인에게 있습니다</div>
    </div>
  </div>;
}
