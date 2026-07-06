"use strict";
/* ---------- 共通UI ---------- */
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function esc(t){return String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(t._tm); t._tm=setTimeout(()=>t.classList.remove("show"),2000);}
function nav(view){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#view-"+view).classList.add("active");
  $$("nav.tabs button").forEach(b=>b.classList.toggle("active",b.dataset.nav===view));
  if(view==="home") renderHome();
  if(view==="study") renderStudy();
  if(view==="cards") renderCards();
  if(view==="lab") renderLab();
  if(view==="stats") renderStats();
  if(view!=="lab") stopCamera();
  window.scrollTo(0,0);
}
$$("nav.tabs button").forEach(b=>b.onclick=()=>nav(b.dataset.nav));

/* ---------- データ取得ヘルパ ---------- */
let QUESTIONS=[], SRS={}, LOGS=[];
async function loadAll(){
  QUESTIONS=await getAll("questions");
  const s=await getAll("srs"); SRS={}; s.forEach(x=>SRS[x.questionId]=x);
  LOGS=await getAll("logs");
}
function dueQuestions(){
  const t0=today0()+DAY; // 今日中が期限のもの
  return QUESTIONS.filter(q=>SRS[q.id]&&SRS[q.id].due<t0)
    .sort((a,b)=>priorityInfo(SRS[b.id]).score-priorityInfo(SRS[a.id]).score);
}
function newQuestions(){return QUESTIONS.filter(q=>!SRS[q.id]);}
function streakDays(){
  const days=new Set(LOGS.map(l=>{const d=new Date(l.answeredAt); d.setHours(0,0,0,0); return d.getTime();}));
  let n=0, t=today0();
  if(!days.has(t)) t-=DAY; // 今日未学習なら昨日から数える
  while(days.has(t)){n++; t-=DAY;}
  return n;
}
function accuracy(logs){if(!logs.length)return null; return Math.round(100*logs.filter(l=>l.isCorrect).length/logs.length);}

/* ---------- ホーム ---------- */
function renderHome(){
  const due=dueQuestions(), news=newQuestions(), acc=accuracy(LOGS), st=streakDays();
  const overdue=QUESTIONS.filter(q=>SRS[q.id]&&SRS[q.id].due<today0()).length;
  const pri=due.slice(0,3).map(q=>{
    const p=priorityInfo(SRS[q.id]);
    return `<li><div><b>${esc(q.topic)}</b><div class="why">${esc(p.why)}</div></div></li>`;
  }).join("")||`<li><span class="muted">今日の復習はありません。学習タブから新しい問題へ。</span></li>`;
  $("#view-home").innerHTML=`
  <div class="card">
    <div class="eyebrow">きょうの状態</div>
    <div class="row">
      <div class="stat"><div class="v">${due.length}<small>問</small></div><div class="l">今日の復習</div></div>
      <div class="stat"><div class="v">${overdue}<small>問</small></div><div class="l">期限超過</div></div>
      <div class="stat"><div class="v">${acc===null?"–":acc+"%"}</div><div class="l">総合正答率</div></div>
      <div class="stat"><div class="v">${st}<small>日</small></div><div class="l">継続学習</div></div>
    </div>
  </div>
  <div class="card">
    <h2>優先して復習</h2>
    <ul class="plist">${pri}</ul>
    <button class="btn primary" id="btnTodayReview" ${due.length?"":"disabled"}>今日の復習を始める(${due.length}問)</button>
    <button class="btn ghost" id="btnNew" ${news.length?"":"disabled"}>新しい問題(${news.length}問)</button>
    <button class="btn ghost" id="btnLabGo">カメラで画像解析</button>
  </div>`;
  $("#btnTodayReview")&&($("#btnTodayReview").onclick=()=>startSession(due,"今日の復習"));
  $("#btnNew").onclick=()=>startSession(shuffle(news).slice(0,10),"新規学習");
  $("#btnLabGo").onclick=()=>nav("lab");
}
function shuffle(a){a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;}

/* ---------- 学習メニュー ---------- */
function renderStudy(){
  const cats=[...new Set(QUESTIONS.map(q=>q.category))];
  const weak=QUESTIONS.filter(q=>SRS[q.id]&&(SRS[q.id].lapses>=1||(SRS[q.id].lastCorrect===false)));
  const codes=QUESTIONS.filter(q=>q.type==="code");
  const fxs=QUESTIONS.filter(q=>q.type==="formula");
  $("#view-study").innerHTML=`
  <div class="card"><h2>ドリル</h2>
    <button class="btn primary" id="stWeak" ${weak.length?"":"disabled"}>弱点ドリル(${weak.length}問)</button>
    <button class="btn ghost" id="stCode" ${codes.length?"":"disabled"}>コード読解(${codes.length}問)</button>
    <button class="btn ghost" id="stFx" ${fxs.length?"":"disabled"}>数式問題(${fxs.length}問)</button>
    <button class="btn ghost" id="stAll">全問からランダム10問</button>
  </div>
  <div class="card"><h2>分野別</h2>
    ${cats.map(c=>{
      const qs=QUESTIONS.filter(q=>q.category===c);
      const lg=LOGS.filter(l=>qs.some(q=>q.id===l.questionId));
      const ac=accuracy(lg);
      return `<button class="btn ghost small" data-cat="${esc(c)}">${esc(c)}(${qs.length}問${ac===null?"":" / 正答率"+ac+"%"})</button>`;
    }).join("")}
  </div>`;
  $("#stWeak").onclick=()=>startSession(shuffle(weak),"弱点ドリル");
  $("#stCode").onclick=()=>startSession(shuffle(codes),"コード読解");
  $("#stFx").onclick=()=>startSession(shuffle(fxs),"数式問題");
  $("#stAll").onclick=()=>startSession(shuffle(QUESTIONS).slice(0,10),"ランダム演習");
  $$("#view-study [data-cat]").forEach(b=>b.onclick=()=>startSession(shuffle(QUESTIONS.filter(q=>q.category===b.dataset.cat)),b.dataset.cat));
}

/* ---------- 出題セッション ---------- */
let session=null;
function startSession(list,title){
  if(!list.length){toast("対象の問題がありません"); return;}
  session={list,title,idx:0,correct:0,startAt:Date.now()};
  nav("quiz"); renderQuestion();
}
function renderQuestion(){
  const q=session.list[session.idx];
  session.qStart=Date.now(); session.sel=null; session.conf=null;
  $("#view-quiz").innerHTML=`
  <div class="muted" style="margin-bottom:8px">${esc(session.title)} ${session.idx+1} / ${session.list.length}</div>
  <div class="card">
    <div><span class="tag">${esc(q.category)}</span><span class="tag">${esc(q.topic)}</span><span class="tag">${esc(q.difficulty||"")}</span></div>
    ${q.code?`<pre>${esc(q.code)}</pre>`:""}
    <p style="font-weight:700; font-size:1.05rem">Q. ${esc(q.question)}</p>
    <div id="choices">${q.choices.map((c,i)=>
      `<button class="choice" data-i="${i}"><span class="abc">${"ABCD"[i]}</span>${esc(c)}</button>`).join("")}</div>
    <div class="label">自信度</div>
    <div class="confbar" id="confbar">
      <button data-c="0">低い</button><button data-c="1">普通</button><button data-c="2">高い</button>
    </div>
    <button class="btn primary" id="btnGrade" disabled>採点する</button>
    <button class="btn ghost small" id="btnQuit">中断してホームへ</button>
  </div>`;
  $$("#choices .choice").forEach(b=>b.onclick=()=>{
    $$("#choices .choice").forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel"); session.sel=+b.dataset.i; updateGradeBtn();});
  $$("#confbar button").forEach(b=>b.onclick=()=>{
    $$("#confbar button").forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel"); session.conf=+b.dataset.c; updateGradeBtn();});
  $("#btnGrade").onclick=grade;
  $("#btnQuit").onclick=()=>nav("home");
}
function updateGradeBtn(){$("#btnGrade").disabled=!(session.sel!==null&&session.conf!==null);}

async function grade(){
  const q=session.list[session.idx];
  const isCorrect=session.sel===q.answer;
  if(isCorrect) session.correct++;
  const timeSec=Math.round((Date.now()-session.qStart)/1000);
  const srs=nextReview(SRS[q.id],isCorrect,session.conf);
  srs.questionId=q.id; SRS[q.id]=srs; await put("srs",srs);
  const log={answerId:"a"+Date.now()+Math.random().toString(36).slice(2,6),
    questionId:q.id,answeredAt:Date.now(),isCorrect,selectedAnswer:session.sel,
    confidence:session.conf,answerTimeSeconds:timeSec,errorReason:null,
    repetitionStage:srs.stage,sourceDevice:/Mobi/.test(navigator.userAgent)?"スマホ":"PC"};
  LOGS.push(log); await put("logs",log); session.lastLog=log;
  renderFeedback(q,isCorrect);
}
const MARK_O='<svg viewBox="0 0 100 100"><path d="M50 12 C 27 12, 12 30, 12 50 C 12 72, 30 88, 50 88 C 72 88, 88 71, 88 50 C 88 30, 72 14, 52 13"/></svg>';
const MARK_X='<svg viewBox="0 0 100 100"><path d="M20 20 L80 80 M80 20 L20 80"/></svg>';

const SOURCE_KIND={"jdla":"JDLA公式資料","primary-paper":"原典論文","official-doc":"公式ドキュメント","support":"補助解説"};
function sourceCards(q){
  if(!q.sources||!q.sources.length) return "";
  return `<div class="label">根拠を確認</div>`+q.sources.map(s=>{
    const kind=esc(SOURCE_KIND[s.kind]||s.kind||"参考");
    const title=esc(s.title||s.url||"");
    const meta=[s.authors,s.year].filter(Boolean).map(esc).join(", ");
    const inner=s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener">${title}</a>`:title;
    return `<div style="margin-top:6px"><span class="tag ai">${kind}</span>${inner}
      ${meta?`<span class="muted"> ${meta}</span>`:""}
      ${s.why?`<div class="muted">${esc(s.why)}</div>`:""}</div>`;
  }).join("");
}
function renderFeedback(q,isCorrect){
  const termCards=(q.terms||[]).map(name=>{
    const t=TERMS.find(x=>x.en===name); if(!t) return "";
    return `<hr class="divider"><div class="termcard">
      <div class="word"><ruby>${esc(t.en)}<rt>${esc(t.kana)}</rt></ruby></div>
      ${t.full?`<div class="muted">${esc(t.full)}</div>`:""}
      <div class="yaku">${esc(t.ja)}</div><div class="muted">${esc(t.desc)}</div></div>`;
  }).join("");
  const fxCards=(q.formulas||[]).map(name=>{
    const f=FORMULAS.find(x=>x.name===name); if(!f) return "";
    return `<hr class="divider"><div class="fx">${esc(f.fx)}</div>
      <div class="label">読み方</div><div>${esc(f.yomi)}</div>
      <div class="label">覚え方</div><div>${esc(f.oboe)}</div>`;
  }).join("");
  $("#view-quiz").innerHTML=`
  <div class="muted" style="margin-bottom:8px">${esc(session.title)} ${session.idx+1} / ${session.list.length}</div>
  <div class="card">
    <div class="mark">${isCorrect?MARK_O:MARK_X}</div>
    <div style="text-align:center; font-weight:700; color:var(--shu)">${isCorrect?"正解":"不正解"}</div>
    <p style="font-weight:700">Q. ${esc(q.question)}</p>
    ${q.code?`<pre>${esc(q.code)}</pre>`:""}
    <div>${q.choices.map((c,i)=>`<button class="choice ${i===q.answer?"correct":(i===session.sel?"wrong":"")}" disabled>
      <span class="abc">${"ABCD"[i]}</span>${esc(c)}</button>`).join("")}</div>
    <div class="label">解説</div><div>${esc(q.explanation)}</div>
    ${sourceCards(q)}${termCards}${fxCards}
    ${!isCorrect?`<div class="label">誤答の原因(次回の出し方に反映)</div>
      <div class="reasons" id="reasons">${ERROR_REASONS.map((r,i)=>`<button data-r="${i}">${esc(r)}</button>`).join("")}</div>`:""}
    <div class="muted" style="margin-top:12px">次回復習:${fmtDate(SRS[q.id].due)}</div>
    <button class="btn ghost small" id="btnGpt">GPT相談文をコピー</button>
    <button class="btn primary" id="btnNext">${session.idx+1<session.list.length?"次の問題へ":"結果を見る"}</button>
  </div>`;
  $$("#reasons button").forEach(b=>b.onclick=async()=>{
    $$("#reasons button").forEach(x=>x.classList.remove("sel")); b.classList.add("sel");
    session.lastLog.errorReason=ERROR_REASONS[+b.dataset.r]; await put("logs",session.lastLog);});
  $("#btnGpt").onclick=()=>copyGptPrompt(q,isCorrect);
  $("#btnNext").onclick=()=>{
    session.idx++;
    if(session.idx<session.list.length) renderQuestion(); else renderResult();
  };
}
function renderResult(){
  const n=session.list.length, c=session.correct;
  $("#view-quiz").innerHTML=`
  <div class="card" style="text-align:center">
    <div class="eyebrow">${esc(session.title)} おつかれさまでした</div>
    <div class="big">${c} / ${n} 問正解</div>
    <div class="muted">誤答した問題は明日以降の復習に自動登録されました</div>
    <button class="btn primary" id="rHome">ホームへ戻る</button>
  </div>`;
  $("#rHome").onclick=()=>nav("home");
}

function copyGptPrompt(q,isCorrect){
  const conf=["低い","普通","高い"][session.conf];
  const reason=session.lastLog.errorReason||"(未選択)";
  const text=`E資格の復習です。\n【分野】\n${q.category}:${q.topic}\n【問題】\n${q.question}\n${q.code?"\n【コード】\n"+q.code+"\n":""}【選択肢】\n${q.choices.map((c,i)=>"ABCD"[i]+". "+c).join("\n")}\n【私の回答】\n${"ABCD"[session.sel]}. ${q.choices[session.sel]}\n【正答】\n${"ABCD"[q.answer]}. ${q.choices[q.answer]}\n【結果】${isCorrect?"正解":"不正解"} / 【自信度】${conf}\n【誤答原因】\n${isCorrect?"—":reason}\n以下の順で説明してください。\n1. 用語の原語・発音用フリガナ・日本語訳\n2. 数式があれば読み方\n3. 考え方の手順\n4. 間違えやすいポイント\n5. 類題を2問`;
  navigator.clipboard.writeText(text).then(()=>toast("相談文をコピーしました")).catch(()=>{prompt("コピーしてください",text);});
}

let cardTab="term";
function renderCards(){
  $("#view-cards").innerHTML=`<div class="subtabs"><button id="ctTerm" class="${cardTab==="term"?"active":""}">用語</button><button id="ctFx" class="${cardTab==="fx"?"active":""}">数式</button><button id="ctCmp" class="${cardTab==="cmp"?"active":""}">比較</button></div><div id="cardList"></div>`;
  $("#ctTerm").onclick=()=>{cardTab="term";renderCards();};$("#ctFx").onclick=()=>{cardTab="fx";renderCards();};$("#ctCmp").onclick=()=>{cardTab="cmp";renderCards();};
  const el=$("#cardList");
  if(cardTab==="cmp"){
    el.innerHTML=COMPARES.map(c=>`<div class="card"><div class="cmprow"><div class="cmpcol"><div class="word" style="font-size:1.05rem;font-weight:700"><ruby>${esc(c.l.t)}<rt>${esc(c.l.kana)}</rt></ruby></div><div class="yaku">${esc(c.l.ja)}</div><div class="muted">${esc(c.l.d)}</div></div><div class="cmpvs">vs</div><div class="cmpcol"><div class="word" style="font-size:1.05rem;font-weight:700"><ruby>${esc(c.r.t)}<rt>${esc(c.r.kana)}</rt></ruby></div><div class="yaku">${esc(c.r.ja)}</div><div class="muted">${esc(c.r.d)}</div></div></div><div class="label">見分け方</div><div style="color:var(--shu);font-weight:700">${esc(c.key)}</div></div>`).join("");return;
  }
  if(cardTab==="term")el.innerHTML=TERMS.map(t=>`<div class="card termcard"><div class="word"><ruby>${esc(t.en)}<rt>${esc(t.kana)}</rt></ruby></div>${t.full?`<div class="muted">${esc(t.full)}</div>`:""}<div class="yaku">${esc(t.ja)}</div><div class="muted">${esc(t.desc)}</div></div>`).join("");
  else el.innerHTML=FORMULAS.map(f=>`<div class="card"><h2>${esc(f.name)}</h2><div class="fx">${esc(f.fx)}</div><div class="label">読み方</div><div>${esc(f.yomi)}</div><div class="label">意味</div><div>${esc(f.imi)}</div><div class="label">覚え方</div><div>「${esc(f.oboe)}」</div><div class="label">具体例</div><div class="muted">${esc(f.rei)}</div></div>`).join("");
}
