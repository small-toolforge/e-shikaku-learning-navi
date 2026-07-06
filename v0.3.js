/* E資格 学習ナビ v0.3.0 拡張モジュール
   index.html v0.2をPWA上で拡張する互換レイヤー。
   端末内処理のみ。動画・カメラ映像はアップロードしない。 */
(() => {
  "use strict";
  const V3_VERSION = "v0.3.0";

  const V3_SEED = [
    {id:"q101",category:"画像解析",topic:"フレーム差分",difficulty:"基礎",type:"lab",
     question:"フレーム差分で白く強調されるのは、どのような場所ですか？",
     choices:["直前のフレームから画素値が大きく変化した（動いた）場所","画像の中で最も明るい場所","色が最も鮮やかな場所","画像の中心に近い場所"],
     answer:0,explanation:"フレーム差分は連続する2フレームの画素値の差の絶対値です。時間方向に変化した場所、つまり動いた物体の輪郭付近が強く出ます。明るさそのものではなく変化量を見る点が重要です。",
     terms:[],formulas:[],labTag:"diff"},
    {id:"q102",category:"画像解析",topic:"フレームレート",difficulty:"基礎",type:"lab",
     question:"動画を30fpsから5fpsに落としたとき、主に失われる情報はどれですか？",
     choices:["時間方向の情報（速い動きの取りこぼし）","1フレームあたりの解像度","色のチャンネル数","画像の縦横比"],
     answer:0,explanation:"fpsは1秒あたりのフレーム数です。下げると時間方向のサンプリングが粗くなり、速い動きを見逃します。各フレームの解像度や色とは別の情報です。",
     terms:[],formulas:[],labTag:"video"},
    {id:"q103",category:"画像解析",topic:"時間平均",difficulty:"標準",type:"lab",
     question:"動画の時間平均をとると、動いている物体が薄く見える理由として正しいものはどれですか？",
     choices:["各画素を時間方向に平均するため、一時的にしか現れない値の寄与が小さくなるから","カメラのピントが動く物体に合わないから","平均処理で解像度が下がるから","動く物体は明るさが低いから"],
     answer:0,explanation:"時間平均では、静止した背景は毎フレーム同じ値なので残り、動く物体は各位置に短時間しかいないため平均への寄与が小さくなります。",
     terms:[],formulas:[],labTag:"video"}
  ];

  const V3_COMPARES = [
    {l:["Precision","プレシジョン","適合率","陽性と判定した中で、本当に陽性だった割合"],r:["Recall","リコール","再現率","本当に陽性のものを、どれだけ拾えたか"],k:"分母が違う。Precisionは「判定した数」、Recallは「実際の正解数」"},
    {l:["Convolution","コンヴォリューション","畳み込み","フィルタで特徴を取り出す。重みは学習で決まる"],r:["Pooling","プーリング","集約","領域を代表値で縮小する。学習するものがない"],k:"学習するのはConvolutionだけ。Poolingにパラメータはない"},
    {l:["Max Pooling","マックス・プーリング","最大値プーリング","領域内の最大値を残す。強い特徴が残る"],r:["Average Pooling","アベレージ・プーリング","平均プーリング","領域内の平均を取る。全体をなめらかに要約する"],k:"尖りを残すならMax、全体の傾向ならAverage"},
    {l:["L1 Regularization","エルワン・レギュラリゼーション","L1正則化","重みの絶対値を罰する。不要な重みを0にしやすい"],r:["L2 Regularization","エルツー・レギュラリゼーション","L2正則化","重みの二乗を罰する。重み全体を小さくする"],k:"0を作りやすいのがL1、小さく縮めるのがL2"},
    {l:["Batch Normalization","バッチ・ノーマライゼーション","バッチ正規化","ミニバッチの統計量で正規化。train/evalで動きが違う"],r:["Layer Normalization","レイヤー・ノーマライゼーション","層正規化","1サンプル内の特徴方向で正規化。Transformerでよく使う"],k:"バッチに依存するBN、1サンプル内で完結するLN"},
    {l:["model.train()","モデル・トレイン","学習モード","DropoutやBatchNormを学習用の挙動にする"],r:["model.eval()","モデル・イーバル","評価モード","Dropoutを止め、BatchNormの推論時統計量を使う"],k:"学習中はtrain、評価・推論時はeval。no_gradとは別の役割"},
    {l:["Softmax","ソフトマックス","クラス間で合計1の確率","複数クラスが互いに排他的な分類に使う"],r:["Sigmoid","シグモイド","各出力を0〜1へ","各ラベルを独立に持てる。複数ラベル分類に使える"],k:"クラスが1つだけならSoftmax、複数同時ならSigmoid"},
    {l:["Precision","プレシジョン","適合率","陽性判定のうち本当に陽性だった割合"],r:["Accuracy","アキュラシー","正解率","全体のうち正解した割合。クラス不均衡では注意"],k:"Precisionは陽性判定の質、Accuracyは全体の正答割合"}
  ];

  function v3Css() {
    if (document.getElementById("v3-style")) return;
    const s=document.createElement("style"); s.id="v3-style";
    s.textContent=`
      .v3-row{display:flex;gap:10px;align-items:stretch}.v3-col{flex:1;background:var(--mist);border-radius:10px;padding:10px}
      .v3-vs{align-self:center;color:var(--sub);font-size:.75rem}.v3-itbl{border-collapse:collapse;font-family:Consolas,monospace;font-size:.8rem}
      .v3-itbl td{border:1px solid var(--line);padding:3px 6px;text-align:right;background:var(--card)}
      .v3-kern td{background:var(--shu-soft);color:var(--shu);font-weight:700}
      .v3-labgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v3-labgrid figure{margin:0}.v3-labgrid canvas{width:100%;display:block;border-radius:10px;background:#111}
      .v3-labgrid figcaption{text-align:center;color:var(--sub);font-size:.72rem;margin-top:3px}
      @media(max-width:420px){.v3-row{gap:6px}.v3-col{padding:8px}.v3-vs{font-size:.62rem}}
    `;
    document.head.appendChild(s);
  }

  function safeUrl(raw) {
    try {
      const u=new URL(String(raw||""));
      return ["https:","http:"].includes(u.protocol) ? u.href : "";
    } catch (_) { return ""; }
  }
  const KIND={jdla:"JDLA公式資料","primary-paper":"原典論文","official-doc":"公式ドキュメント",support:"補助解説"};
  function sourcesHtml(q) {
    if(!Array.isArray(q.sources)||!q.sources.length) return "";
    return `<div class="label">根拠を確認</div>`+q.sources.map(s=>{
      const u=safeUrl(s.url), title=esc(s.title||u||""), meta=[s.authors,s.year].filter(Boolean).map(esc).join(", ");
      const titleHtml=u?`<a href="${esc(u)}" target="_blank" rel="noopener">${title}</a>`:title;
      return `<div style="margin-top:6px"><span class="tag ai">${esc(KIND[s.kind]||s.kind||"参考")}</span>${titleHtml}${meta?` <span class="muted">${meta}</span>`:""}${s.why?`<div class="muted">${esc(s.why)}</div>`:""}</div>`;
    }).join("");
  }

  async function seedV3() {
    for(let i=0;i<80&&!window.db;i++) await new Promise(r=>setTimeout(r,50));
    if(!window.db) return;
    const flag=await getOne("meta","seedVersionV3");
    if(flag) return;
    for(const q of V3_SEED) {
      const exists=await getOne("questions",q.id);
      if(!exists) await put("questions",q);
    }
    await put("meta",{key:"seedVersionV3",value:1,at:Date.now()});
    await loadAll();
  }

  function patchFeedback() {
    const base=renderFeedback;
    renderFeedback=function(q,isCorrect) {
      base(q,isCorrect);
      const html=sourcesHtml(q);
      const target=$("#btnGpt");
      if(html&&target) target.insertAdjacentHTML("beforebegin",html);
    };
  }

  function patchCards() {
    renderCards=function() {
      v3Css();
      $("#view-cards").innerHTML=`
        <div class="subtabs">
          <button id="v3Term" class="${cardTab==="term"?"active":""}">用語</button>
          <button id="v3Fx" class="${cardTab==="fx"?"active":""}">数式</button>
          <button id="v3Cmp" class="${cardTab==="cmp"?"active":""}">比較</button>
        </div><div id="cardList"></div>`;
      $("#v3Term").onclick=()=>{cardTab="term";renderCards();};
      $("#v3Fx").onclick=()=>{cardTab="fx";renderCards();};
      $("#v3Cmp").onclick=()=>{cardTab="cmp";renderCards();};
      const box=$("#cardList");
      if(cardTab==="cmp") {
        box.innerHTML=V3_COMPARES.map(c=>`
          <div class="card"><div class="v3-row">
            <div class="v3-col"><b><ruby>${esc(c.l[0])}<rt>${esc(c.l[1])}</rt></ruby></b><div class="yaku">${esc(c.l[2])}</div><div class="muted">${esc(c.l[3])}</div></div>
            <div class="v3-vs">vs</div>
            <div class="v3-col"><b><ruby>${esc(c.r[0])}<rt>${esc(c.r[1])}</rt></ruby></b><div class="yaku">${esc(c.r[2])}</div><div class="muted">${esc(c.r[3])}</div></div>
          </div><div style="margin-top:8px;color:var(--shu);font-size:.82rem;font-weight:700">見分け方：${esc(c.k)}</div></div>`).join("");
      } else if(cardTab==="term") {
        box.innerHTML=TERMS.map(t=>`<div class="card termcard"><div class="word"><ruby>${esc(t.en)}<rt>${esc(t.kana)}</rt></ruby></div>${t.full?`<div class="muted">${esc(t.full)}</div>`:""}<div class="yaku">${esc(t.ja)}</div><div class="muted">${esc(t.desc)}</div></div>`).join("");
      } else {
        box.innerHTML=FORMULAS.map(f=>`<div class="card"><h2>${esc(f.name)}</h2><div class="fx">${esc(f.fx)}</div><div class="label">読み方</div><div>${esc(f.yomi)}</div><div class="label">意味</div><div>${esc(f.imi)}</div><div class="label">覚え方</div><div>「${esc(f.oboe)}」</div><div class="label">具体例</div><div class="muted">${esc(f.rei)}</div></div>`).join("");
      }
    };
  }

  function patchImportAndStats() {
    const baseStats=renderStats;
    renderStats=function() {
      baseStats();
      const ver=$("#appVer"); if(ver) ver.textContent=V3_VERSION;
      const add=$("#qAdd"); if(add) add.onclick=v3ImportQuestions;
    };
  }
  async function v3ImportQuestions() {
    try {
      const raw=$("#qJson").value.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```\s*$/,"");
      const arr=JSON.parse(raw);
      if(!Array.isArray(arr)) throw new Error("配列で貼り付けてください");
      let count=0;
      for(const q of arr) {
        if(!q.id||!q.question||!Array.isArray(q.choices)||q.choices.length<2||typeof q.answer!=="number") throw new Error(`必須項目不足: ${q.id||"(id無し)"}`);
        q.category=q.category||"未分類"; q.topic=q.topic||""; q.type=q.type||"choice";
        await put("questions",q); count++;
      }
      await loadAll(); $("#qJson").value=""; toast(`${count}問を取り込みました`); renderStats();
    } catch(e) { toast("取り込み失敗:"+e.message); }
  }

  let stream=null, raf=null, source="camera", mode="original", frozen=false, threshold=128, poolMode="max", lowres=64;
  let lastGray=null,lastW=0,lastH=0,prev=null,bg=null,avg=null,fps=30,lastDraw=0,needDraw=false,sel=null,videoUrl="";
  const camModes=[["original","元画像"],["rgb","RGB分解"],["gray","グレースケール"],["binary","二値化"],["blur","ぼかし"],["sobel","輪郭検出（Sobel）"],["lowres","解像度比較"],["pool","プーリング比較"]];
  const vidModes=[["original","元映像"],["diff","フレーム差分"],["bg","背景差分"],["avg","時間平均"],["sobel","エッジ検出"],["lowres","解像度低下"],["fps","fps低下"]];
  const themes={original:"動画は連続する画像に時間方向の情報が加わったものです。",rgb:"RGBは3枚の数値行列として扱われます。",gray:"色を捨て、明るさだけにする前処理です。",binary:"閾値で白黒へ分けます。",blur:"近くの画素を平均して細部やノイズを弱めます。",sobel:"近くの画素の明るさの差から境界を強調します。",lowres:"解像度を下げると、空間方向の情報量が減ります。",pool:"近傍の情報を代表値で集約します。",diff:"前フレームとの差。動いた場所が強調されます。",bg:"記憶した背景との差。背景から変わった場所が残ります。",avg:"時間方向の平均。動く物体は薄くなります。",fps:"右側だけ更新頻度を下げ、時間情報の減少を比較します。"};

  function patchLab() {
    const oldNav=nav;
    nav=function(view) { if(view!=="lab") v3Stop(); return oldNav(view); };
    renderLab=v3RenderLab;
    window.addEventListener("pagehide",v3Stop);
  }
  function activeVideo(){return $("#v3-video");}
  function v3RenderLab() {
    v3Css();
    const modes=source==="camera"?camModes:vidModes;
    if(!modes.some(x=>x[0]===mode)) mode="original";
    $("#view-lab").innerHTML=`
      <div class="subtabs"><button id="v3Cam" class="${source==="camera"?"active":""}">カメララボ</button><button id="v3Vid" class="${source==="video"?"active":""}">動画ラボ</button></div>
      <div class="card labwrap">
        <div class="muted">映像・動画は端末内でのみ処理します。アップロード・自動保存はしません。</div>
        <div id="v3Source"></div>
        <div class="modes" id="v3Modes">${modes.map(x=>`<button data-m="${x[0]}" class="${x[0]===mode?"sel":""}">${x[1]}</button>`).join("")}</div>
        <div id="v3Ctl"></div>
        <div class="v3-labgrid"><figure><canvas id="v3Orig" width="320" height="240"></canvas><figcaption>元映像</figcaption></figure><figure><canvas id="v3Proc" width="320" height="240"></canvas><figcaption id="v3Cap">処理後</figcaption></figure></div>
        <div class="muted" id="v3Hint" style="display:${frozen?"":"none"}">停止中です。左の画像をタップすると3×3領域とSobel計算を確認できます。</div>
        <div id="v3Inspector"></div>
        <div class="card" style="margin:0;background:var(--mist);border:none"><div class="eyebrow">今日のテーマ</div><div id="v3Theme">${themes[mode]}</div></div>
        <button class="btn shu" id="v3Quiz">この実験の確認問題を解く</button>
      </div>
      <video id="v3-video" playsinline muted style="display:none"></video>`;
    $("#v3Cam").onclick=()=>{if(source!=="camera"){v3Stop();source="camera";mode="original";v3RenderLab();}};
    $("#v3Vid").onclick=()=>{if(source!=="video"){v3Stop();source="video";mode="original";v3RenderLab();}};
    $$("#v3Modes button").forEach(b=>b.onclick=()=>{mode=b.dataset.m;sel=null;$("#v3Inspector").innerHTML="";$("#v3Theme").textContent=themes[mode];$("#v3Cap").textContent=modes.find(x=>x[0]===mode)[1];if(mode==="avg")avg=null;v3Controls();});
    $("#v3Quiz").onclick=v3Quiz;
    $("#v3Orig").onclick=v3Inspect;
    v3SourceControls();v3Controls();
  }
  function v3SourceControls() {
    const box=$("#v3Source"); if(!box)return;
    if(source==="camera") {
      box.innerHTML=`<div class="row"><button class="btn primary" style="flex:2;margin-top:0" id="v3Start">カメラを起動</button><button class="btn ghost" style="flex:1;margin-top:0" id="v3Freeze" ${stream?"":"disabled"}>${frozen?"再開":"一時停止"}</button></div>`;
      $("#v3Start").onclick=v3StartCamera;$("#v3Freeze").onclick=v3Freeze;
    } else {
      box.innerHTML=`<div class="row"><label class="btn ghost" style="flex:2;margin-top:0">動画を選択<input id="v3Pick" type="file" accept="video/*" style="display:none"></label><button class="btn ghost" style="flex:1;margin-top:0" id="v3Play" disabled>再生</button><button class="btn ghost" style="flex:1;margin-top:0" id="v3Step" disabled>コマ送り</button></div>`;
      $("#v3Pick").onchange=v3LoadVideo;
      const v=activeVideo();if(v&&v.src){$("#v3Play").disabled=false;$("#v3Step").disabled=false;}
      $("#v3Play").onclick=v3Play;$("#v3Step").onclick=v3Step;
    }
  }
  function v3Controls() {
    const box=$("#v3Ctl");if(!box)return;
    if(mode==="binary") {box.innerHTML=`<div class="label">閾値: <span id="v3Th">${threshold}</span></div><input id="v3Range" type="range" min="0" max="255" value="${threshold}">`;$("#v3Range").oninput=e=>{threshold=+e.target.value;$("#v3Th").textContent=threshold;};}
    else if(mode==="pool") {box.innerHTML=`<div class="confbar"><button id="v3Max" class="${poolMode==="max"?"sel":""}">Max Pooling</button><button id="v3Avg" class="${poolMode==="avg"?"sel":""}">Average Pooling</button></div>`;$("#v3Max").onclick=()=>{poolMode="max";v3Controls();};$("#v3Avg").onclick=()=>{poolMode="avg";v3Controls();};}
    else if(mode==="lowres") {box.innerHTML=`<div class="confbar"><button data-r="224">224</button><button data-r="64" class="sel">64</button><button data-r="32">32</button></div>`;box.querySelectorAll("button").forEach(b=>b.onclick=()=>{lowres=+b.dataset.r;box.querySelectorAll("button").forEach(x=>x.classList.toggle("sel",x===b));});}
    else if(mode==="bg") {box.innerHTML=`<button class="btn ghost small" id="v3Bg">いまの画面を背景として記憶</button>`;$("#v3Bg").onclick=()=>{if(lastGray){bg=lastGray.slice();toast("背景を記憶しました");}else toast("先に動画を再生してください");};}
    else if(mode==="fps") {box.innerHTML=`<div class="confbar">${[30,10,5].map(n=>`<button data-f="${n}" class="${fps===n?"sel":""}">${n} fps</button>`).join("")}</div>`;box.querySelectorAll("button").forEach(b=>b.onclick=()=>{fps=+b.dataset.f;lastDraw=0;v3Controls();});}
    else box.innerHTML="";
  }
  async function v3StartCamera() {
    try {v3Stop();stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:640}},audio:false});const v=activeVideo();v.srcObject=stream;await v.play();v3SourceControls();v3Loop();toast("カメラを起動しました");}
    catch(e){toast("カメラを起動できません:"+e.name);}
  }
  function v3LoadVideo(e){const f=e.target.files[0];if(!f)return;const v=activeVideo();if(videoUrl)URL.revokeObjectURL(videoUrl);videoUrl=URL.createObjectURL(f);v.src=videoUrl;v.onloadeddata=()=>{needDraw=true;v3SourceControls();if(!raf)v3Loop();toast("動画を読み込みました");};v.load();e.target.value="";}
  function v3Play(){const v=activeVideo();if(!v.src)return;if(v.paused){v.play();$("#v3Play").textContent="停止";}else{v.pause();$("#v3Play").textContent="再生";}}
  function v3Step(){const v=activeVideo();if(!v.src)return;v.pause();v.currentTime=Math.min(v.duration||Infinity,v.currentTime+1/30);needDraw=true;$("#v3Play").textContent="再生";}
  function v3Freeze(){frozen=!frozen;sel=null;const h=$("#v3Hint");if(h)h.style.display=frozen?"":"none";$("#v3Freeze").textContent=frozen?"再開":"一時停止";if(!frozen)$("#v3Inspector").innerHTML="";else toast("一時停止しました。左の画像をタップしてください");}
  function v3Stop(){if(raf)cancelAnimationFrame(raf),raf=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}const v=activeVideo();if(v&&!v.paused)v.pause();frozen=false;prev=bg=avg=null;sel=null;}
  function v3Loop(ts){raf=requestAnimationFrame(v3Loop);const co=$("#v3Orig"),cp=$("#v3Proc"),v=activeVideo();if(!co||!cp||!v){cancelAnimationFrame(raf);raf=null;return;}if(frozen)return;if(source==="video"&&v.paused&&!needDraw)return;if(source==="camera"&&!stream)return;const W=v.videoWidth,H=v.videoHeight;if(!W||!H)return;const w=320,h=Math.max(2,Math.round(w*H/W));if(co.width!==w||co.height!==h){co.width=w;co.height=h;prev=bg=avg=null;}const g=co.getContext("2d",{willReadFrequently:true});g.drawImage(v,0,0,w,h);const img=g.getImageData(0,0,w,h),d=img.data,gray=new Float32Array(w*h);for(let i=0,p=0;i<d.length;i+=4,p++)gray[p]=.299*d[i]+.587*d[i+1]+.114*d[i+2];lastGray=gray;lastW=w;lastH=h;const out=cp.getContext("2d");if(mode==="fps"){if(ts-lastDraw>=1000/fps){out.putImageData(img,0,0);lastDraw=ts;}}else out.putImageData(v3Process(img,gray,w,h),0,0);if(mode==="diff")prev=gray.slice();needDraw=false;}
  function v3Process(img,g,w,h){const o=new ImageData(w,h),d=img.data,od=o.data,set=(p,r,gg,b)=>{let i=p*4;od[i]=r;od[i+1]=gg;od[i+2]=b;od[i+3]=255;};if(mode==="original")return img;if(mode==="gray"){for(let p=0;p<g.length;p++)set(p,g[p],g[p],g[p]);return o;}if(mode==="binary"){for(let p=0;p<g.length;p++){let x=g[p]>threshold?255:0;set(p,x,x,x);}return o;}if(mode==="rgb"){let a=Math.floor(h/3);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x,i=p*4;if(y<a)set(p,d[i],0,0);else if(y<a*2)set(p,0,d[i+1],0);else set(p,0,0,d[i+2]);}return o;}if(mode==="blur"){for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0,n=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2){let yy=y+dy,xx=x+dx;if(yy>=0&&yy<h&&xx>=0&&xx<w){s+=g[yy*w+xx];n++;}}let z=s/n;set(y*w+x,z,z,z);}return o;}if(mode==="sobel"){for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){let p=y*w+x,gx=-g[p-w-1]-2*g[p-1]-g[p+w-1]+g[p-w+1]+2*g[p+1]+g[p+w+1],gy=-g[p-w-1]-2*g[p-w]-g[p-w+1]+g[p+w-1]+2*g[p+w]+g[p+w+1],z=Math.min(255,Math.hypot(gx,gy));set(p,z,z,z);}return o;}if(mode==="lowres"){let s=Math.max(1,Math.round(w/lowres));for(let y=0;y<h;y++)for(let x=0;x<w;x++){let q=(Math.floor(y/s)*s*w+Math.floor(x/s)*s)*4;set(y*w+x,d[q],d[q+1],d[q+2]);}return o;}if(mode==="pool"){for(let by=0;by<h;by+=8)for(let bx=0;bx<w;bx+=8){let mx=0,s=0,n=0;for(let y=by;y<Math.min(by+8,h);y++)for(let x=bx;x<Math.min(bx+8,w);x++){let z=g[y*w+x];mx=Math.max(mx,z);s+=z;n++;}let z=poolMode==="max"?mx:s/n;for(let y=by;y<Math.min(by+8,h);y++)for(let x=bx;x<Math.min(bx+8,w);x++)set(y*w+x,z,z,z);}return o;}if(mode==="diff"||mode==="bg"){let base=mode==="diff"?prev:bg;if(!base||base.length!==g.length){for(let p=0;p<g.length;p++)set(p,mode==="bg"?40:0,mode==="bg"?40:0,mode==="bg"?40:0);}else for(let p=0;p<g.length;p++){let z=Math.min(255,Math.abs(g[p]-base[p])*(mode==="diff"?3:2.5));set(p,z,z,z);}return o;}if(mode==="avg"){if(!avg||avg.length!==g.length)avg=g.slice();else for(let p=0;p<g.length;p++)avg[p]+=(g[p]-avg[p])*.05;for(let p=0;p<g.length;p++)set(p,avg[p],avg[p],avg[p]);return o;}return img;}
  function v3Inspect(e){if(!lastGray){toast("先に映像を表示してください");return;}const v=activeVideo(),paused=(source==="camera"&&frozen)||(source==="video"&&v&&v.paused);if(!paused){toast(source==="camera"?"一時停止してからタップしてください":"動画を停止してからタップしてください");return;}const r=e.currentTarget.getBoundingClientRect(),x=Math.max(1,Math.min(lastW-2,Math.floor((e.clientX-r.left)*lastW/r.width))),y=Math.max(1,Math.min(lastH-2,Math.floor((e.clientY-r.top)*lastH/r.height)));sel={x,y};v3Inspector();}
  function v3Inspector(){if(!sel||!lastGray)return;let gx=0,gy=0,vals=[],tx=[],ty=[],kx=[[-1,0,1],[-2,0,2],[-1,0,1]],ky=[[-1,-2,-1],[0,0,0],[1,2,1]];for(let dy=-1;dy<=1;dy++){let row=[];for(let dx=-1;dx<=1;dx++){let z=Math.round(lastGray[(sel.y+dy)*lastW+sel.x+dx]),a=kx[dy+1][dx+1],b=ky[dy+1][dx+1];row.push(z);gx+=z*a;gy+=z*b;if(a)tx.push(`${a>0?"+":""}${a}×${z}`);if(b)ty.push(`${b>0?"+":""}${b}×${z}`);}vals.push(row);}const table=(a,c="")=>`<table class="v3-itbl ${c}">${a.map(r=>`<tr>${r.map(z=>`<td>${z}</td>`).join("")}</tr>`).join("")}</table>`,mag=Math.round(Math.hypot(gx,gy));$("#v3Inspector").innerHTML=`<div class="card" style="margin:0"><h2>畳み込みインスペクタ</h2><div class="v3-row"><div><div class="label">入力3×3</div>${table(vals)}</div><div><div class="label">Sobel X</div>${table(kx,"v3-kern")}</div><div><div class="label">Sobel Y</div>${table(ky,"v3-kern")}</div></div><div class="label">掛ける → 足す</div><div class="muted">Gx = ${esc(tx.join(" "))} = <b>${gx}</b></div><div class="muted">Gy = ${esc(ty.join(" "))} = <b>${gy}</b></div><div class="label">出力の大きさ</div><b>√(Gx² + Gy²) = ${mag}</b><div class="label">読み方</div><div>「左側をマイナス、右側をプラスとして、左右の明るさの差を計算する。上下も同じように計算し、差が大きいほど境界として強く反応する」</div><div class="label">解釈</div><div>${mag>100?"この位置は強い境界です。":"この位置は比較的平坦で、境界としての反応は弱めです。"}</div></div>`;}
  function v3Quiz(){const map={sobel:"sobel",pool:"pool",diff:"diff",bg:"diff",avg:"video",fps:"video",lowres:source==="video"?"video":""},tag=map[mode]||"";let qs=QUESTIONS.filter(q=>q.type==="lab"&&(!tag||q.labTag===tag));if(!qs.length)qs=QUESTIONS.filter(q=>q.type==="lab");if(!qs.length){toast("画像解析の問題が未登録です");return;}startSession(shuffle(qs),"画像解析ラボ 確認問題");}

  async function boot() {
    v3Css();
    await seedV3();
    patchFeedback(); patchCards(); patchImportAndStats(); patchLab();
    if(document.querySelector("#view-home.active")) renderHome();
  }
  boot().catch(e=>console.warn("v0.3 extension initialization failed",e));
})();
