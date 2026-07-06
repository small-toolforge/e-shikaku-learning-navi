"use strict";
/* =========================================================
   E資格 学習ナビ v0.3.4  (IndexedDB / 問題・カード・間隔反復)
   ========================================================= */

const DB_NAME="eshikaku_v1", DB_VER=1;
let db;
function openDB(){return new Promise((res,rej)=>{
  const rq=indexedDB.open(DB_NAME,DB_VER);
  rq.onupgradeneeded=e=>{
    const d=e.target.result;
    if(!d.objectStoreNames.contains("questions")) d.createObjectStore("questions",{keyPath:"id"});
    if(!d.objectStoreNames.contains("logs")) d.createObjectStore("logs",{keyPath:"answerId"});
    if(!d.objectStoreNames.contains("srs")) d.createObjectStore("srs",{keyPath:"questionId"});
    if(!d.objectStoreNames.contains("meta")) d.createObjectStore("meta",{keyPath:"key"});
  };
  rq.onsuccess=e=>{db=e.target.result; res(db);};
  rq.onerror=()=>rej(rq.error);
});}
function tx(store,mode,fn){return new Promise((res,rej)=>{const t=db.transaction(store,mode),s=t.objectStore(store),out=fn(s);t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error);});}
function put(store,val){return tx(store,"readwrite",s=>s.put(val));}
function getAll(store){return new Promise((res,rej)=>{const rq=db.transaction(store,"readonly").objectStore(store).getAll();rq.onsuccess=()=>res(rq.result);rq.onerror=()=>rej(rq.error);});}
function getOne(store,key){return new Promise((res,rej)=>{const rq=db.transaction(store,"readonly").objectStore(store).get(key);rq.onsuccess=()=>res(rq.result);rq.onerror=()=>rej(rq.error);});}
function clearStore(store){return tx(store,"readwrite",s=>s.clear());}

const TERMS=[
 {en:"Convolution",kana:"コンヴォリューション",ja:"畳み込み",desc:"小さなフィルタを画像上で動かし、輪郭や模様などの特徴を取り出す処理"},
 {en:"CNN",kana:"シー・エヌ・エヌ",ja:"畳み込みニューラルネットワーク",full:"Convolutional Neural Network(コンヴォリューショナル・ニューラル・ネットワーク)",desc:"画像の輪郭や模様を段階的に見つけることが得意なモデル"},
 {en:"Kernel",kana:"カーネル",ja:"フィルタ",desc:"畳み込みで使う小さな数値の窓。3×3などのサイズを持つ"},
 {en:"Stride",kana:"ストライド",ja:"移動幅",desc:"フィルタを何マスずつ動かすか"},
 {en:"Padding",kana:"パディング",ja:"余白埋め",desc:"入力画像の周囲に追加する余白。端の情報を保ち出力サイズを調整する"},
 {en:"Feature Map",kana:"フィーチャー・マップ",ja:"特徴マップ",desc:"畳み込みの出力。どこにどんな特徴があるかを表す"},
 {en:"Pooling",kana:"プーリング",ja:"集約",desc:"領域ごとに代表値(最大や平均)を取り、サイズを縮小する処理"},
 {en:"ReLU",kana:"レルー",ja:"正規化線形ユニット",full:"Rectified Linear Unit(レクティファイド・リニア・ユニット)",desc:"負の値をゼロにし、正の値はそのまま通す活性化関数"},
 {en:"Edge Detection",kana:"エッジ・ディテクション",ja:"輪郭検出",desc:"明るさが急に変わる場所(境界)を見つける処理"},
 {en:"Gradient Descent",kana:"グラディエント・ディセント",ja:"勾配降下法",desc:"損失が小さくなる方向へパラメータを少しずつ動かす最適化法"},
 {en:"Cross Entropy Loss",kana:"クロス・エントロピー・ロス",ja:"交差エントロピー損失",desc:"分類の予測確率が正解からどれだけ外れているかを測る損失"},
 {en:"Softmax",kana:"ソフトマックス",ja:"ソフトマックス関数",desc:"出力を合計1の確率の形に変換する関数"},
 {en:"Data Augmentation",kana:"データ・オーグメンテーション",ja:"データ拡張",desc:"回転・反転・明るさ変更などで学習データを水増しし汎化を高める"},
 {en:"Overfitting",kana:"オーバーフィッティング",ja:"過学習",desc:"学習データに合わせすぎて、新しいデータに弱くなる状態"}
];

const FORMULAS=[
 {name:"勾配降下法",fx:"θ ← θ − η∇L(θ)",yomi:"シータを、シータから、イータ掛けるエル・オブ・シータの勾配を引いた値に更新する",imi:"損失が小さくなる方向へ、少しずつパラメータを動かす",oboe:"坂を下る向きへ、一歩だけ動く",rei:"θ=2.0、η=0.1、勾配=4.0 のとき → θ = 2.0 − 0.1×4.0 = 1.6"},
 {name:"畳み込み出力サイズ",fx:"出力 = floor((入力 − カーネル + 2×パディング) / ストライド) + 1",yomi:"出力サイズは、入力サイズからカーネルサイズを引き、パディングを二倍したものを足し、ストライドで割って切り捨て、最後に一を足します",imi:"フィルタが入力の上を何回置けるかを数えている",oboe:"端を足して、窓を引いて、歩幅で割って、一つ足す",rei:"入力32、カーネル3、Padding1、Stride2 → (32−3+2)/2=15.5 → 切り捨て15 → +1 = 16"},
 {name:"交差エントロピー損失",fx:"L = − Σ t_k log(y_k)",yomi:"エルは、マイナス、シグマ、ティー・ケー掛けるログ・ワイ・ケー",imi:"正解クラスの予測確率が低いほど、損失が大きくなる",oboe:"正解の確率だけを見て、低いほど罰する",rei:"正解クラスの予測確率が0.8 → L=−log(0.8)≒0.22。0.1なら L≒2.30 と大きくなる"},
 {name:"ソフトマックス関数",fx:"y_k = exp(a_k) / Σ exp(a_i)",yomi:"ワイ・ケーは、エクスポネンシャル・エー・ケーを、全クラスのエクスポネンシャルの合計で割ったもの",imi:"出力を合計1の確率に変換する。大きい値ほど高い確率になる",oboe:"指数で持ち上げて、合計で割る",rei:"a=(2,1,0) → exp=(7.39,2.72,1.00) → 合計11.11 → y≒(0.67,0.24,0.09)"}
];

const SEED_QUESTIONS=[
 {id:"q001",category:"深層学習",topic:"Padding",difficulty:"基礎",type:"choice",question:"Paddingとは何ですか?",choices:["フィルタを移動させる幅","入力画像の周囲に追加する余白","フィルタの大きさ","出力チャンネル数"],answer:1,explanation:"Padding(パディング/余白埋め)は入力の周囲に余白を追加する処理です。端の情報を保ち、出力サイズを調整できます。",terms:["Padding"],labTag:""},
 {id:"q002",category:"深層学習",topic:"Stride",difficulty:"基礎",type:"choice",question:"Strideが2であるとは、どういう意味ですか?",choices:["フィルタを2マスずつ動かす","フィルタの大きさが2×2","画像の色が2種類","層が2つある"],answer:0,explanation:"Stride(ストライド/移動幅)はフィルタを動かす歩幅です。2なら1マス飛ばしで動くため、出力サイズは小さくなります。",terms:["Stride"]},
 {id:"q003",category:"深層学習",topic:"出力サイズ計算",difficulty:"標準",type:"formula",question:"入力サイズ8、カーネル3、Padding0、Stride2のとき、出力サイズはいくつですか?",choices:["2","3","4","6"],answer:1,explanation:"(8−3+0)/2=2.5 → 切り捨て2 → +1 = 3。「端を足して、窓を引いて、歩幅で割って、一つ足す」。",formulas:["畳み込み出力サイズ"],terms:["Stride","Padding"]},
 {id:"q004",category:"深層学習",topic:"出力サイズ計算",difficulty:"標準",type:"formula",question:"入力サイズ32、カーネル3、Padding1、Stride2の畳み込み後の出力サイズは?",choices:["15","16","17","31"],answer:1,explanation:"(32−3+2×1)/2 = 31/2 = 15.5 → 切り捨て15 → +1 = 16。Paddingは2倍して足す点に注意。",formulas:["畳み込み出力サイズ"],terms:["Padding"]},
 {id:"q005",category:"深層学習",topic:"nn.Linearの形状",difficulty:"標準",type:"code",question:"y.shapeとして正しいものはどれですか?",code:"import torch\nimport torch.nn as nn\nx = torch.randn(32, 128)\nlayer = nn.Linear(128, 10)\ny = layer(x)\nprint(y.shape)",choices:["(128, 10)","(32, 128)","(32, 10)","(10, 32)"],answer:2,explanation:"入力xは「32件のデータ × 128個の特徴量」。nn.Linear(128,10)は最後の次元を128→10へ変換するため、出力は(32, 10)です。",terms:[]},
 {id:"q006",category:"深層学習",topic:"Conv2dとStride",difficulty:"標準",type:"code",question:"stride=2 は、この層の動きにどう影響しますか?",code:"nn.Conv2d(\n    in_channels=3,\n    out_channels=16,\n    kernel_size=3,\n    stride=2,\n    padding=1\n)",choices:["フィルタを2マスずつ動かし、出力の縦横が約半分になる","チャンネル数が2倍になる","カーネルが2×2になる","学習率が2倍になる"],answer:0,explanation:"strideはフィルタの移動幅。2にすると出力の空間サイズが約1/2になり、ダウンサンプリングの役割を持ちます。",terms:["Stride"]},
 {id:"q007",category:"深層学習",topic:"活性化関数",difficulty:"基礎",type:"term",question:"ReLU(レルー)の動きとして正しいものはどれですか?",choices:["負の値をゼロにし、正の値はそのまま通す","出力を合計1の確率にする","入力を0〜1に圧縮する","入力を平均0に正規化する"],answer:0,explanation:"ReLU = Rectified Linear Unit(正規化線形ユニット)。max(0, x)で、負をゼロに、正をそのまま通します。勾配消失を起こしにくいのが利点。",terms:["ReLU"]},
 {id:"q008",category:"深層学習",topic:"損失関数",difficulty:"基礎",type:"term",question:"Cross Entropy Loss(交差エントロピー損失)が測っているものは?",choices:["画像の解像度","予測確率と正解のずれ","パラメータの数","学習にかかった時間"],answer:1,explanation:"分類問題で、正解クラスに対する予測確率が低いほど大きくなる損失です。−Σ t_k log(y_k)。",terms:["Cross Entropy Loss"],formulas:["交差エントロピー損失"]},
 {id:"q009",category:"画像解析",topic:"エッジ検出",difficulty:"基礎",type:"lab",question:"Sobelフィルタで本の文字や机の縁が目立つようになりました。最も近い説明はどれですか?",choices:["物体の意味を理解している","色名を識別している","画素値の局所的な変化に反応している","画像を高解像度化している"],answer:2,explanation:"Sobelフィルタは隣り合う画素の明るさの差(勾配)を計算します。境界=明るさが急に変わる場所が強調されます。意味理解ではありません。",terms:["Edge Detection","Convolution"],labTag:"sobel"},
 {id:"q010",category:"画像解析",topic:"プーリング",difficulty:"基礎",type:"lab",question:"Max Poolingの説明として正しいものはどれですか?",choices:["領域内の最大値を代表として残す","領域内の値をすべて足す","画像を回転させる","色を反転させる"],answer:0,explanation:"Max Poolingは小領域ごとに最大値を取り、サイズを縮小しつつ強い特徴を残します。Average Poolingは平均値を取ります。",terms:["Pooling"],labTag:"pool"},
 {id:"q011",category:"機械学習",topic:"過学習",difficulty:"基礎",type:"choice",question:"過学習(Overfitting)への対策として適切でないものはどれですか?",choices:["データ拡張を行う","Dropoutを使う","正則化を加える","学習データへの正答率だけを最大化する"],answer:3,explanation:"過学習は学習データに合わせすぎた状態。学習データの正答率だけを追うと悪化します。データ拡張・Dropout・正則化は代表的な対策です。",terms:["Overfitting","Data Augmentation"]},
 {id:"q012",category:"法律・倫理",topic:"個人情報",difficulty:"基礎",type:"choice",question:"個人情報保護法における「個人情報」の説明として最も適切なものは?",choices:["企業の売上データすべて","生存する個人を識別できる情報","匿名加工が済んだ統計情報","公開されていない情報のみ"],answer:1,explanation:"個人情報は「生存する個人に関する情報で、特定の個人を識別できるもの」。公開・非公開は要件ではありません。",terms:[]}
];

const SEED_V2=[
 {id:"q101",category:"画像解析",topic:"フレーム差分",difficulty:"基礎",type:"lab",question:"動画のフレーム差分で白く強調されるのは、どのような場所ですか?",choices:["直前のフレームから画素値が大きく変化した(動いた)場所","画像の中で最も明るい場所","色が最も鮮やかな場所","画像の中心に近い場所"],answer:0,explanation:"フレーム差分は連続する2フレームの画素値の差の絶対値。時間方向に変化した場所=動いた物体の輪郭付近が強く出ます。「明るさそのもの」ではなく「変化量」を見ている点が重要です。",terms:[],formulas:[],labTag:"diff"},
 {id:"q102",category:"画像解析",topic:"フレームレート",difficulty:"基礎",type:"lab",question:"動画を30fpsから5fpsに落としたとき、主に失われる情報はどれですか?",choices:["時間方向の情報(速い動きの取りこぼし)","1フレームあたりの解像度","色のチャンネル数","画像の縦横比"],answer:0,explanation:"fpsは1秒あたりのフレーム数で、下げると時間方向のサンプリングが粗くなり、速い動きを見逃します。各フレームの解像度(空間方向)や色は変わりません。空間の情報量(解像度)と時間の情報量(fps)を区別するのがポイントです。",terms:[],formulas:[],labTag:"video"},
 {id:"q103",category:"画像解析",topic:"時間平均",difficulty:"標準",type:"lab",question:"動画の時間平均をとると、動いている物体が薄く(半透明に)なる理由として正しいものはどれですか?",choices:["各画素を時間方向に平均するため、一時的にしか現れない値の寄与が小さくなるから","カメラのピントが動く物体に合わないから","平均処理で解像度が下がるから","動く物体は明るさが低いから"],answer:0,explanation:"時間平均は画素ごとに複数フレームの値を平均します。静止した背景は毎フレーム同じ値なので強く残り、動く物体は各位置に短時間しかいないため平均への寄与が小さく、薄くなります。",terms:[],formulas:[],labTag:"video"}
];

const COMPARES=[
 {l:{t:"Precision",kana:"プレシジョン",ja:"適合率",d:"陽性と判定した中で、本当に陽性だった割合"},r:{t:"Recall",kana:"リコール",ja:"再現率",d:"本当に陽性のものを、どれだけ拾えたか"},key:"分母が違う。Precisionは「判定した数」、Recallは「実際の正解数」"},
 {l:{t:"Convolution",kana:"コンヴォリューション",ja:"畳み込み",d:"フィルタで特徴を取り出す。重みは学習で決まる"},r:{t:"Pooling",kana:"プーリング",ja:"集約",d:"領域を代表値で縮小する。学習するものがない"},key:"学習するのはConvolutionだけ。Poolingにパラメータはない"},
 {l:{t:"Max Pooling",kana:"マックス・プーリング",ja:"最大値プーリング",d:"領域内の最大値を残す。強い特徴が残る"},r:{t:"Average Pooling",kana:"アベレージ・プーリング",ja:"平均プーリング",d:"領域内の平均を取る。全体をなめらかに要約"},key:"尖りを残すか、ならすか"},
 {l:{t:"L1正則化",kana:"エルワン",ja:"ラッソ",d:"重みの絶対値に罰則。重みがゼロになりやすい(スパース)"},r:{t:"L2正則化",kana:"エルツー",ja:"リッジ",d:"重みの二乗に罰則。重みを全体的に小さくする"},key:"L1は選別(ゼロにする)、L2は縮小(小さくする)"},
 {l:{t:"Batch Normalization",kana:"バッチ・ノーマライゼーション",ja:"バッチ正規化",d:"ミニバッチ方向の統計で正規化。推論時は移動平均を使う"},r:{t:"Layer Normalization",kana:"レイヤー・ノーマライゼーション",ja:"層正規化",d:"1サンプル内の特徴方向で正規化。バッチサイズに依存しない"},key:"BNは縦(バッチ方向)、LNは横(特徴方向)。Transformerで使うのはLN"},
 {l:{t:"Dropout",kana:"ドロップアウト",ja:"ドロップアウト",d:"学習時にニューロンをランダムに無効化してモデル側を頑健に"},r:{t:"Data Augmentation",kana:"データ・オーグメンテーション",ja:"データ拡張",d:"回転・反転などでデータ側を水増しして汎化を高める"},key:"モデルを削るか、データを増やすか。目的は同じ過学習対策"},
 {l:{t:"model.train()",kana:"トレイン",ja:"学習モード",d:"Dropout有効。BatchNormはバッチ統計を使い更新する"},r:{t:"model.eval()",kana:"イーバル",ja:"推論モード",d:"Dropout無効。BatchNormは学習済みの移動平均を使う"},key:"切り替え忘れが精度低下の定番原因。勾配を止めるのは別途no_grad()"},
 {l:{t:"Softmax",kana:"ソフトマックス",ja:"ソフトマックス関数",d:"多クラスを合計1の確率に変換。クラスは排他的"},r:{t:"Sigmoid",kana:"シグモイド",ja:"シグモイド関数",d:"各出力を独立に0〜1へ。マルチラベルや二値に使う"},key:"排他ならSoftmax、独立ならSigmoid"}
];

const ERROR_REASONS=["用語の意味が分からない","英語用語が読めない・思い出せない","数式の意味が分からない","数式の計算を間違えた","似た概念と混同した","コードの形が読めなかった","問題文を読み違えた","選択肢で迷った","たまたま知識が抜けていた"];
const DAY=86400000;
function today0(){const d=new Date();d.setHours(0,0,0,0);return d.getTime();}
function fmtDate(ts){const d=new Date(ts);return `${d.getMonth()+1}/${d.getDate()}`;}
function nextReview(srs,isCorrect,conf){const s=srs||{streak:0,lapses:0,overconfident:0,stage:0};let days;if(!isCorrect){s.streak=0;s.lapses=(s.lapses||0)+1;s.stage=0;if(conf===2)s.overconfident=(s.overconfident||0)+1;days=1;}else{s.streak=(s.streak||0)+1;s.lapses=0;if(conf===0)days=3;else if(conf===1)days=7;else days=s.streak>=3?30:14;s.stage=Math.min((s.stage||0)+1,6);}s.due=today0()+days*DAY;s.lastCorrect=isCorrect;s.lastConf=conf;s.lastAt=Date.now();return s;}
function priorityInfo(srs){if(!srs)return{score:10,why:"新規"};const overdue=Math.max(0,Math.floor((today0()-srs.due)/DAY));if(srs.lastCorrect===false&&srs.lastConf===2)return{score:100+overdue,why:"自信ありで誤答"};if((srs.lapses||0)>=2)return{score:90+overdue,why:`${srs.lapses}回連続で誤答`};if(overdue>=1)return{score:60+overdue,why:`復習期限を${overdue}日超過`};if(srs.lastCorrect===true&&srs.lastConf===0)return{score:50,why:"正解したが自信度が低い"};return{score:20,why:"定着確認"};}
