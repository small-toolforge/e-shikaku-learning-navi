"use strict";
const APP_VERSION="v0.3.1";
const DB_NAME="eshikaku_v1",DB_VER=1,DAY=86400000,ALLOWED_LAB_TAGS=new Set(["","sobel","pool","diff","video"]);
let db,QUESTIONS=[],SRS={},LOGS=[],pendingQuestionBatch=null,session=null,cardTab="term";
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove("show"),2300)}
function today0(){const d=new Date();d.setHours(0,0,0,0);return d.getTime()}
function fmtDate(ts){const d=new Date(ts);return `${d.getMonth()+1}/${d.getDate()}`}
function uid(prefix){return prefix+Date.now()+Math.random().toString(36).slice(2,7)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function isHttpUrl(v){try{const u=new URL(String(v));return u.protocol==="https:"||u.protocol==="http:"}catch(_){return false}}

function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VER);req.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains("questions"))d.createObjectStore("questions",{keyPath:"id"});if(!d.objectStoreNames.contains("logs"))d.createObjectStore("logs",{keyPath:"answerId"});if(!d.objectStoreNames.contains("srs"))d.createObjectStore("srs",{keyPath:"questionId"});if(!d.objectStoreNames.contains("meta"))d.createObjectStore("meta",{keyPath:"key"})};req.onsuccess=e=>{db=e.target.result;resolve(db)};req.onerror=()=>reject(req.error)})}
function getAll(store){return new Promise((resolve,reject)=>{const req=db.transaction(store,"readonly").objectStore(store).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function getOne(store,key){return new Promise((resolve,reject)=>{const req=db.transaction(store,"readonly").objectStore(store).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function putOne(store,value){return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).put(value);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function deleteOne(store,key){return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function clearOne(store){return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function putBatch(store,items){return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite"),os=tx.objectStore(store);items.forEach(item=>os.put(item));tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error||new Error("保存に失敗しました"))})}
function restoreBatch(data){return new Promise((resolve,reject)=>{const tx=db.transaction(["questions","logs","srs","meta"],"readwrite");(data.questions||[]).forEach(x=>tx.objectStore("questions").put(x));(data.logs||[]).forEach(x=>tx.objectStore("logs").put(x));(data.srs||[]).forEach(x=>tx.objectStore("srs").put(x));tx.objectStore("meta").put({key:"lastRestoreAt",value:Date.now()});tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error||new Error("復元に失敗しました"))})}
async function loadAll(){QUESTIONS=await getAll("questions");LOGS=await getAll("logs");SRS={};(await getAll("srs")).forEach(x=>SRS[x.questionId]=x)}

const TERMS=[
{en:"Convolution",kana:"コンヴォリューション",ja:"畳み込み",desc:"小さなフィルタを画像上で動かし、輪郭や模様を取り出す処理"},
{en:"CNN",kana:"シー・エヌ・エヌ",ja:"畳み込みニューラルネットワーク",full:"Convolutional Neural Network（コンヴォリューショナル・ニューラル・ネットワーク）",desc:"画像の特徴を段階的に抽出するネットワーク"},
{en:"Kernel",kana:"カーネル",ja:"フィルタ",desc:"畳み込みで使う小さな数値の窓"},
{en:"Stride",kana:"ストライド",ja:"移動幅",desc:"フィルタを何マスずつ動かすか"},
{en:"Padding",kana:"パディング",ja:"余白埋め",desc:"入力の周囲に余白を加え、端の情報や出力サイズを調整する"},
{en:"Feature Map",kana:"フィーチャー・マップ",ja:"特徴マップ",desc:"畳み込みの出力で、どこにどの特徴があるかを表す"},
{en:"Pooling",kana:"プーリング",ja:"集約",desc:"領域ごとの代表値を取り、サイズを縮小する"},
{en:"ReLU",kana:"レルー",ja:"正規化線形ユニット",full:"Rectified Linear Unit（レクティファイド・リニア・ユニット）",desc:"負の値を0、正の値をそのまま通す活性化関数"},
{en:"Softmax",kana:"ソフトマックス",ja:"ソフトマックス関数",desc:"複数出力を合計1の確率へ変換する"},
{en:"Cross Entropy Loss",kana:"クロス・エントロピー・ロス",ja:"交差エントロピー損失",desc:"正解クラスの予測確率が低いほど大きくなる損失"},
{en:"Overfitting",kana:"オーバーフィッティング",ja:"過学習",desc:"学習データへ合わせすぎ、新しいデータに弱くなる状態"},
{en:"Data Augmentation",kana:"データ・オーグメンテーション",ja:"データ拡張",desc:"回転や反転などで学習データを増やし汎化を高める"},
{en:"Edge Detection",kana:"エッジ・ディテクション",ja:"輪郭検出",desc:"明るさが急に変わる境界を見つける処理"},
{en:"Gradient Descent",kana:"グラディエント・ディセント",ja:"勾配降下法",desc:"損失が小さくなる方向へパラメータを少しずつ動かす最適化法"}
];
const FORMULAS=[
{name:"勾配降下法",fx:"θ ← θ − η∇L(θ)",yomi:"シータを、シータから、イータ掛けるエル・オブ・シータの勾配を引いた値に更新する",imi:"損失が小さくなる方向へ少しずつパラメータを動かす",oboe:"坂を下る向きへ、一歩だけ動く",rei:"θ=2.0、η=0.1、勾配=4.0 → θ=1.6"},
{name:"畳み込み出力サイズ",fx:"出力 = floor((入力 − カーネル + 2×パディング) / ストライド) + 1",yomi:"入力からカーネルを引き、パディングの二倍を足し、ストライドで割って切り捨て、最後に一を足す",imi:"フィルタを置ける回数を数える",oboe:"端を足して、窓を引いて、歩幅で割って、一つ足す",rei:"入力32、カーネル3、Padding1、Stride2 → 16"},
{name:"交差エントロピー損失",fx:"L = − Σ tₖ log(yₖ)",yomi:"エルは、マイナス、シグマ、ティー・ケー掛けるログ・ワイ・ケー",imi:"正解クラスの確率が低いほど大きな罰を与える",oboe:"正解の確率だけを見て、低いほど罰する",rei:"正解確率0.8なら約0.22、0.1なら約2.30"},
{name:"ソフトマックス関数",fx:"yₖ = exp(aₖ) / Σ exp(aᵢ)",yomi:"ワイ・ケーは、エクスポネンシャル・エー・ケーを、全クラスのエクスポネンシャルの合計で割ったもの",imi:"複数の値を合計1の確率へ変換する",oboe:"指数で持ち上げて、合計で割る",rei:"a=(2,1,0) → およそ(0.67,0.24,0.09)"}
];
const COMPARES=[
{l:{t:"Precision",k:"プレシジョン",j:"適合率",d:"陽性と判定した中で本当に陽性だった割合"},r:{t:"Recall",k:"リコール",j:"再現率",d:"本当に陽性のものをどれだけ拾えたか"},key:"分母が違う。Precisionは判定した数、Recallは実際の陽性数"},
{l:{t:"Convolution",k:"コンヴォリューション",j:"畳み込み",d:"学習可能なフィルタで特徴を取り出す"},r:{t:"Pooling",k:"プーリング",j:"集約",d:"代表値で縮小する。通常は学習パラメータなし"},key:"学習する重みがあるかを見る"},
{l:{t:"Max Pooling",k:"マックス・プーリング",j:"最大値プーリング",d:"領域内の最大値を残し、強い特徴を保つ"},r:{t:"Average Pooling",k:"アベレージ・プーリング",j:"平均プーリング",d:"領域内の平均を取り、全体傾向を残す"},key:"尖りを残すか、なめらかに要約するか"},
{l:{t:"L1",k:"エルワン",j:"L1正則化",d:"不要な重みを0にしやすい"},r:{t:"L2",k:"エルツー",j:"L2正則化",d:"重み全体を小さくする"},key:"L1は選別、L2は縮小"},
{l:{t:"Batch Normalization",k:"バッチ・ノーマライゼーション",j:"バッチ正規化",d:"ミニバッチ方向の統計を使う"},r:{t:"Layer Normalization",k:"レイヤー・ノーマライゼーション",j:"層正規化",d:"1サンプル内の特徴方向で正規化する"},key:"BNはバッチ依存、LNはバッチサイズに依存しにくい"},
{l:{t:"Dropout",k:"ドロップアウト",j:"確率的削除",d:"学習時にニューロンをランダムに無効化する"},r:{t:"Data Augmentation",k:"データ・オーグメンテーション",j:"データ拡張",d:"入力データを変形して学習例を増やす"},key:"モデル側を削るか、データ側を増やすか"},
{l:{t:"model.train()",k:"モデル・トレイン",j:"学習モード",d:"Dropoutを有効にし、BatchNormの統計を更新する"},r:{t:"model.eval()",k:"モデル・イーバル",j:"評価モード",d:"Dropoutを無効にし、学習済み統計を使う"},key:"学習時はtrain、評価・推論時はeval"},
{l:{t:"Softmax",k:"ソフトマックス",j:"排他的な多クラス",d:"全クラスの確率を合計1にする"},r:{t:"Sigmoid",k:"シグモイド",j:"独立な二値・マルチラベル",d:"各出力を独立に0〜1へ変換する"},key:"1つだけ選ぶならSoftmax、複数同時ならSigmoid"}
];
const ERROR_REASONS=["用語の意味が分からない","英語用語を思い出せない","数式の意味が分からない","計算を間違えた","似た概念と混同した","コードの形が読めなかった","問題文を読み違えた","選択肢で迷った","知識が抜けていた"];
const SEED_QUESTIONS=[
{id:"q001",category:"深層学習",topic:"Padding",difficulty:"基礎",type:"choice",question:"Paddingとは何ですか？",choices:["フィルタを移動させる幅","入力画像の周囲に追加する余白","フィルタの大きさ","出力チャンネル数"],answer:1,explanation:"Padding（パディング／余白埋め）は入力の周囲に余白を追加する処理です。端の情報を保ち、出力サイズを調整できます。",terms:["Padding"],labTag:""},
{id:"q002",category:"深層学習",topic:"Stride",difficulty:"基礎",type:"choice",question:"Strideが2であるとは、どういう意味ですか？",choices:["フィルタを2マスずつ動かす","フィルタの大きさが2×2","画像の色が2種類","層が2つある"],answer:0,explanation:"Stride（ストライド／移動幅）はフィルタを動かす歩幅です。2なら1マス飛ばしで動くため、出力サイズは小さくなります。",terms:["Stride"]},
{id:"q003",category:"深層学習",topic:"出力サイズ計算",difficulty:"標準",type:"formula",question:"入力サイズ8、カーネル3、Padding0、Stride2のとき、出力サイズはいくつですか？",choices:["2","3","4","6"],answer:1,explanation:"(8−3+0)/2=2.5、切り捨て2、最後に1を足して3です。",formulas:["畳み込み出力サイズ"],terms:["Stride","Padding"]},
{id:"q004",category:"深層学習",topic:"出力サイズ計算",difficulty:"標準",type:"formula",question:"入力サイズ32、カーネル3、Padding1、Stride2の畳み込み後の出力サイズは？",choices:["15","16","17","31"],answer:1,explanation:"(32−3+2×1)/2=15.5、切り捨て15、最後に1を足して16です。Paddingは2倍して足します。",formulas:["畳み込み出力サイズ"],terms:["Padding"]},
{id:"q005",category:"深層学習",topic:"nn.Linearの形状",difficulty:"標準",type:"code",question:"y.shapeとして正しいものはどれですか？",code:"import torch\nimport torch.nn as nn\nx = torch.randn(32, 128)\nlayer = nn.Linear(128, 10)\ny = layer(x)\nprint(y.shape)",choices:["(128, 10)","(32, 128)","(32, 10)","(10, 32)"],answer:2,explanation:"入力xは32件×128特徴量です。nn.Linear(128,10)は最後の次元を128から10へ変換するため、出力は(32,10)です。"},
{id:"q006",category:"深層学習",topic:"Conv2dとStride",difficulty:"標準",type:"code",question:"stride=2は、この層の動きにどう影響しますか？",code:"nn.Conv2d(\n    in_channels=3,\n    out_channels=16,\n    kernel_size=3,\n    stride=2,\n    padding=1\n)",choices:["フィルタを2マスずつ動かし、出力の縦横が約半分になる","チャンネル数が2倍になる","カーネルが2×2になる","学習率が2倍になる"],answer:0,explanation:"strideはフィルタの移動幅です。2にすると出力の空間サイズが約半分になります。",terms:["Stride"]},
{id:"q007",category:"深層学習",topic:"活性化関数",difficulty:"基礎",type:"term",question:"ReLU（レルー）の動きとして正しいものはどれですか？",choices:["負の値を0にし、正の値はそのまま通す","出力を合計1の確率にする","入力を0〜1に圧縮する","入力を平均0に正規化する"],answer:0,explanation:"ReLUはmax(0,x)で、負を0に、正をそのまま通します。",terms:["ReLU"]},
{id:"q008",category:"深層学習",topic:"損失関数",difficulty:"基礎",type:"term",question:"Cross Entropy Loss（交差エントロピー損失）が測っているものは？",choices:["画像の解像度","予測確率と正解のずれ","パラメータの数","学習にかかった時間"],answer:1,explanation:"分類問題で、正解クラスへの予測確率が低いほど大きくなる損失です。",terms:["Cross Entropy Loss"],formulas:["交差エントロピー損失"]},
{id:"q009",category:"画像解析",topic:"エッジ検出",difficulty:"基礎",type:"lab",question:"Sobelフィルタで本の文字や机の縁が目立つようになりました。最も近い説明はどれですか？",choices:["物体の意味を理解している","色名を識別している","画素値の局所的な変化に反応している","画像を高解像度化している"],answer:2,explanation:"Sobelフィルタは隣り合う画素の明るさの差（勾配）を計算します。境界へ反応し、意味理解ではありません。",terms:["Edge Detection","Convolution"],labTag:"sobel"},
{id:"q010",category:"画像解析",topic:"プーリング",difficulty:"基礎",type:"lab",question:"Max Poolingの説明として正しいものはどれですか？",choices:["領域内の最大値を代表として残す","領域内の値をすべて足す","画像を回転させる","色を反転させる"],answer:0,explanation:"Max Poolingは小領域ごとに最大値を取り、サイズを縮小しつつ強い特徴を残します。",terms:["Pooling"],labTag:"pool"},
{id:"q011",category:"機械学習",topic:"過学習",difficulty:"基礎",type:"choice",question:"過学習（Overfitting）への対策として適切でないものはどれですか？",choices:["データ拡張を行う","Dropoutを使う","正則化を加える","学習データへの正答率だけを最大化する"],answer:3,explanation:"学習データの正答率だけを追うと過学習を悪化させます。",terms:["Overfitting","Data Augmentation"]},
{id:"q012",category:"法律・倫理",topic:"個人情報",difficulty:"基礎",type:"choice",question:"個人情報保護法における「個人情報」の説明として最も適切なものは？",choices:["企業の売上データすべて","生存する個人を識別できる情報","匿名加工が済んだ統計情報","公開されていない情報のみ"],answer:1,explanation:"生存する個人に関する情報で、特定の個人を識別できるものです。公開・非公開は要件ではありません。"},
{id:"q101",category:"画像解析",topic:"フレーム差分",difficulty:"基礎",type:"lab",question:"フレーム差分で白く強調されるのは、どのような場所ですか？",choices:["直前のフレームから画素値が大きく変化した（動いた）場所","画像の中で最も明るい場所","色が最も鮮やかな場所","画像の中心に近い場所"],answer:0,explanation:"連続する2フレームの画素値の差なので、動いた物体の輪郭付近が強く出ます。",labTag:"diff"},
{id:"q102",category:"画像解析",topic:"フレームレート",difficulty:"基礎",type:"lab",question:"動画を30fpsから5fpsに落としたとき、主に失われる情報はどれですか？",choices:["時間方向の情報（速い動きの取りこぼし）","1フレームあたりの解像度","色のチャンネル数","画像の縦横比"],answer:0,explanation:"fpsを下げると時間方向のサンプリングが粗くなり、速い動きを見逃します。",labTag:"video"},
{id:"q103",category:"画像解析",topic:"時間平均",difficulty:"標準",type:"lab",question:"動画の時間平均をとると、動いている物体が薄くなる理由として正しいものはどれですか？",choices:["各画素を時間方向に平均するため、一時的にしか現れない値の寄与が小さくなるから","カメラのピントが動く物体に合わないから","平均処理で解像度が下がるから","動く物体は明るさが低いから"],answer:0,explanation:"静止背景は毎フレーム同じ値なので残り、動く物体は各位置に短時間しかいないため薄くなります。",labTag:"video"}
];

function nextReview(old,isCorrect,conf){const s=Object.assign({streak:0,lapses:0,overconfident:0,stage:0},old||{});let days;if(!isCorrect){s.streak=0;s.lapses=(s.lapses||0)+1;s.stage=0;if(conf===2)s.overconfident=(s.overconfident||0)+1;days=1}else{s.streak=(s.streak||0)+1;s.lapses=0;days=conf===0?3:conf===1?7:(s.streak>=3?30:14);s.stage=Math.min((s.stage||0)+1,6)}s.due=today0()+days*DAY;s.lastCorrect=isCorrect;s.lastConf=conf;s.lastAt=Date.now();return s}
function priorityInfo(s){if(!s)return{score:10,why:"新規"};const overdue=Math.max(0,Math.floor((today0()-s.due)/DAY));if(s.lastCorrect===false&&s.lastConf===2)return{score:100+overdue,why:"自信ありで誤答"};if((s.lapses||0)>=2)return{score:90+overdue,why:`${s.lapses}回連続で誤答`};if(overdue>=1)return{score:60+overdue,why:`復習期限を${overdue}日超過`};if(s.lastCorrect&&s.lastConf===0)return{score:50,why:"正解したが自信度が低い"};return{score:20,why:"定着確認"}}
function accuracy(logs){return logs.length?Math.round(100*logs.filter(x=>x.isCorrect).length/logs.length):null}
function streakDays(){const ds=new Set(LOGS.map(l=>{const d=new Date(l.answeredAt);d.setHours(0,0,0,0);return d.getTime()}));let n=0,t=today0();if(!ds.has(t))t-=DAY;while(ds.has(t)){n++;t-=DAY}return n}
function dueQuestions(){const until=today0()+DAY;return QUESTIONS.filter(q=>SRS[q.id]&&SRS[q.id].due<until).sort((a,b)=>priorityInfo(SRS[b.id]).score-priorityInfo(SRS[a.id]).score)}
function newQuestions(){return QUESTIONS.filter(q=>!SRS[q.id])}
