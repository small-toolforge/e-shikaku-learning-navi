"use strict";

const ATLAS_VERSION = "v0.4.0-dev.1";

const ATLAS_PAPERS = {
  transformer: {
    id: "transformer",
    title: "Attention Is All You Need",
    kana: "アテンション・イズ・オール・ユー・ニード",
    ja: "必要なのは注意機構だけ",
    year: 2017,
    authors: "Vaswani et al.",
    syllabus: "3. 深層学習の基礎 → (6) Transformer",
    summary: "系列を再帰処理せず、Attentionを中心にEncoderとDecoderを構成するモデルです。",
    sources: [
      { kind: "primary-paper", title: "arXiv: Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762" },
      { kind: "primary-paper", title: "NeurIPS paper page", url: "https://papers.nips.cc/paper/7181-attention-is-all-you-need" }
    ],
    questionIds: ["atlas-transformer-001", "atlas-transformer-002", "atlas-transformer-003"]
  }
};

const TRANSFORMER_NODES = {
  inputEmbedding: {
    en: "Input Embedding", kana: "インプット・エンベディング", ja: "入力埋め込み",
    segment: "encoder", order: 1,
    desc: "入力トークンを連続値ベクトルへ変換します。語そのものの意味を表す土台です。",
    exam: "Embeddingだけでは語順を持たないため、Positional Encodingを加える点を押さえます。"
  },
  encoderPosition: {
    en: "Positional Encoding", kana: "ポジショナル・エンコーディング", ja: "位置符号化",
    segment: "encoder", order: 2,
    desc: "トークン列の順序情報を埋め込みへ加えます。原論文では正弦波・余弦波を用います。",
    exam: "TransformerはRNNのような再帰構造を持たないため、位置情報を別に与えます。"
  },
  selfAttention: {
    en: "Multi-Head Self-Attention", kana: "マルチヘッド・セルフ・アテンション", ja: "多頭自己注意",
    segment: "encoder", order: 3,
    desc: "同じ入力列からQuery・Key・Valueを作り、各位置が他の位置を参照します。複数ヘッドで異なる関係を並行して捉えます。",
    exam: "Encoder側のSelf-Attentionには未来方向を隠すマスクは通常ありません。"
  },
  encoderAddNorm1: {
    en: "Add & Norm", kana: "アッド・アンド・ノーム", ja: "残差加算と層正規化",
    segment: "encoder", order: 4,
    desc: "サブ層の入力を出力へ足す残差接続と、Layer Normalizationを組み合わせます。",
    exam: "AddはSkip Connection、NormはLayer Normalizationです。"
  },
  encoderFFN: {
    en: "Position-wise Feed-Forward Network", kana: "ポジションワイズ・フィードフォワード・ネットワーク", ja: "位置ごとの順伝播ネットワーク",
    segment: "encoder", order: 5,
    desc: "各トークン位置へ同じ2層の全結合ネットワークを独立に適用します。",
    exam: "Attentionが位置間を混ぜ、Feed Forwardが各位置の表現を非線形変換します。"
  },
  encoderAddNorm2: {
    en: "Add & Norm", kana: "アッド・アンド・ノーム", ja: "残差加算と層正規化",
    segment: "encoder", order: 6,
    desc: "Feed Forwardの前後を残差接続でつなぎ、正規化します。",
    exam: "Encoderブロック内にはAdd & Normが2回あります。"
  },
  outputEmbedding: {
    en: "Output Embedding", kana: "アウトプット・エンベディング", ja: "出力系列の埋め込み",
    segment: "decoder", order: 1,
    desc: "学習時は正解系列を1トークンずらしてDecoderへ入力します。推論時は既生成トークンを入力します。",
    exam: "Decoderは次トークン予測のため、未来の正解を直接見ない形にします。"
  },
  decoderPosition: {
    en: "Positional Encoding", kana: "ポジショナル・エンコーディング", ja: "位置符号化",
    segment: "decoder", order: 2,
    desc: "Decoder入力にも順序情報を加えます。",
    exam: "EncoderとDecoderの両側に位置符号化があります。"
  },
  maskedAttention: {
    en: "Masked Multi-Head Self-Attention", kana: "マスクド・マルチヘッド・セルフ・アテンション", ja: "マスク付き多頭自己注意",
    segment: "decoder", order: 3,
    desc: "現在位置より未来のトークンを参照できないようにマスクしたSelf-Attentionです。",
    exam: "未来を隠すのはDecoder最初のAttentionです。"
  },
  decoderAddNorm1: {
    en: "Add & Norm", kana: "アッド・アンド・ノーム", ja: "残差加算と層正規化",
    segment: "decoder", order: 4,
    desc: "Masked Attentionの入力を足し戻し、正規化します。",
    exam: "Decoderブロック内にはAdd & Normが3回あります。"
  },
  crossAttention: {
    en: "Source-Target Attention", kana: "ソース・ターゲット・アテンション", ja: "Encoder–Decoder間の注意",
    segment: "decoder", order: 5,
    desc: "QueryはDecoder側、KeyとValueはEncoder出力から作り、入力系列を参照します。Cross-Attentionとも呼ばれます。",
    exam: "QはDecoder、K/VはEncoderという組合せが重要です。"
  },
  decoderAddNorm2: {
    en: "Add & Norm", kana: "アッド・アンド・ノーム", ja: "残差加算と層正規化",
    segment: "decoder", order: 6,
    desc: "Source-Target Attentionの前後を残差接続でつなぎ、正規化します。",
    exam: "Encoder出力を参照した直後のAdd & Normです。"
  },
  decoderFFN: {
    en: "Position-wise Feed-Forward Network", kana: "ポジションワイズ・フィードフォワード・ネットワーク", ja: "位置ごとの順伝播ネットワーク",
    segment: "decoder", order: 7,
    desc: "各位置へ同じ全結合ネットワークを適用します。",
    exam: "構造はEncoder側のFeed Forwardと同種です。"
  },
  decoderAddNorm3: {
    en: "Add & Norm", kana: "アッド・アンド・ノーム", ja: "残差加算と層正規化",
    segment: "decoder", order: 8,
    desc: "Decoderブロック最後の残差接続と正規化です。",
    exam: "この出力がLinear層へ渡されます。"
  },
  linear: {
    en: "Linear", kana: "リニア", ja: "線形変換",
    segment: "output", order: 9,
    desc: "Decoderの隠れ表現を語彙数と同じ次元のロジットへ変換します。",
    exam: "Softmaxの直前は確率ではなくロジットです。"
  },
  softmax: {
    en: "Softmax", kana: "ソフトマックス", ja: "確率化",
    segment: "output", order: 10,
    desc: "各語彙のロジットを合計1の確率分布へ変換します。",
    exam: "最終出力は次トークンの確率です。"
  }
};

const ATLAS_QUESTIONS = [
  {
    id: "atlas-transformer-001", category: "深層学習の基礎", topic: "Transformer", difficulty: "基礎", type: "choice",
    question: "TransformerのDecoderで、未来のトークンを参照できないようにする処理はどれですか？",
    choices: ["Encoder側のSelf-Attention", "Masked Multi-Head Attention", "Position-wise Feed Forward", "Linear層"],
    answer: 1,
    explanation: "Decoder最初のMasked Multi-Head Attentionが、現在位置より未来を参照できないようにします。",
    terms: [], formulas: [], labTag: "",
    sources: [{kind:"primary-paper",title:"Attention Is All You Need",url:"https://arxiv.org/abs/1706.03762",year:2017,why:"Decoderのmasked self-attention構造の原典"}]
  },
  {
    id: "atlas-transformer-002", category: "深層学習の基礎", topic: "Transformer", difficulty: "標準", type: "choice",
    question: "Source-Target AttentionにおけるQuery、Key、Valueの組合せとして適切なのはどれですか？",
    choices: ["Q/K/VすべてEncoder出力", "Q/K/VすべてDecoder入力", "QはDecoder、K/VはEncoder出力", "QはEncoder、K/VはDecoder"],
    answer: 2,
    explanation: "Decoder側のQueryが、Encoder出力から作られたKeyとValueを参照します。",
    terms: [], formulas: [], labTag: "",
    sources: [{kind:"primary-paper",title:"Attention Is All You Need",url:"https://arxiv.org/abs/1706.03762",year:2017,why:"Encoder–Decoder attentionの原典"}]
  },
  {
    id: "atlas-transformer-003", category: "深層学習の基礎", topic: "Transformer", difficulty: "基礎", type: "choice",
    question: "TransformerでPositional Encodingを加える主な理由はどれですか？",
    choices: ["語彙数を減らすため", "再帰構造を持たないモデルへ位置情報を与えるため", "勾配を必ず1にするため", "Attentionヘッド数を増やすため"],
    answer: 1,
    explanation: "TransformerはRNNのような再帰構造を使わないため、トークンの順序を位置符号化として明示的に加えます。",
    terms: [], formulas: [], labTag: "",
    sources: [{kind:"primary-paper",title:"Attention Is All You Need",url:"https://arxiv.org/abs/1706.03762",year:2017,why:"位置符号化の原典"}]
  }
];

function syllabusItem(id, major, group, topic, detail, keywords, resources, atlasId) {
  return { id, major, group, topic, detail, keywords, resources: resources || ["planned"], atlasId: atlasId || "", scope: "シラバス掲載" };
}

const SYLLABUS_INDEX = [
  syllabusItem("1-1-1","1. 数学的基礎","線形代数","行列演習","行列・テンソルの積、勾配",["行列のランク","テンソル","アダマール積"],["term","formula"]),
  syllabusItem("1-1-2","1. 数学的基礎","線形代数","固有値分解・特異値分解","",["固有値","固有ベクトル","対角化","特異値","特異ベクトル"],["term","formula"]),
  syllabusItem("1-2-1","1. 数学的基礎","確率・統計","一般的な確率分布","確率の基礎",["確率変数","同時確率","条件付き確率","周辺確率","確率質量関数","確率密度関数","期待値","分散","共分散"],["term","formula"]),
  syllabusItem("1-2-2","1. 数学的基礎","確率・統計","一般的な確率分布","ベルヌーイ分布・多項分布",["ベルヌーイ試行","二項分布","カテゴリカル分布"],["term","formula"]),
  syllabusItem("1-2-3","1. 数学的基礎","確率・統計","一般的な確率分布","ガウス分布・t分布",["混合ガウス分布","中心極限定理"],["term","formula"]),
  syllabusItem("1-2-4","1. 数学的基礎","確率・統計","確率モデルにおけるパラメータ推定","",["ベイズ則","ナイーブベイズ","平均二乗誤差","対数尤度","ダイバージェンス","最尤推定","MAP推定","ベイズ推定"],["term","formula"]),
  syllabusItem("1-3-1","1. 数学的基礎","情報理論","情報理論","",["自己情報量","相互情報量","エントロピー","条件付きエントロピー","結合エントロピー","クロスエントロピー","KLダイバージェンス","JSダイバージェンス"],["term","formula"]),

  syllabusItem("2-1-1","2. 機械学習","機械学習の基礎","パターン認識","k近傍法・近傍法",["kd-tree","近似最近傍"],["term"]),
  syllabusItem("2-1-2","2. 機械学習","機械学習の基礎","パターン認識","距離計算",["コサイン距離","ユークリッド距離","マンハッタン距離","Lp距離","マハラノビス距離"],["term","formula","compare"]),
  syllabusItem("2-1-3","2. 機械学習","機械学習の基礎","機械学習の分類","",["機械学習","教師あり学習","教師なし学習","半教師あり学習"],["term","compare"]),
  syllabusItem("2-1-4","2. 機械学習","機械学習の基礎","教師あり学習①","線形回帰・Lasso回帰・Ridge回帰",["ノルム","過少適合","過剰適合","最小二乗法","相関係数","多重共線性","L1正則化","L2正則化"],["term","formula","compare"]),
  syllabusItem("2-1-5","2. 機械学習","機械学習の基礎","教師あり学習②","ロジスティック回帰",["ロジット","シグモイド関数","ロジスティック関数","ソフトマックス関数","オッズ","オッズ比"],["term","formula","compare"]),
  syllabusItem("2-1-6","2. 機械学習","機械学習の基礎","教師あり学習③","サポートベクターマシン",["サポートベクター","マージン最大化","ハードマージン","ソフトマージン","カーネル法"],["term","concept"]),
  syllabusItem("2-1-7","2. 機械学習","機械学習の基礎","教師あり学習④","決定木・Random Forest・勾配ブースティング",["分類木","回帰木","CART","Gini係数","アンサンブル","バギング","ブースティング"],["term","compare","concept"]),
  syllabusItem("2-1-8","2. 機械学習","機械学習の基礎","教師なし学習①","次元圧縮",["主成分分析","寄与率","SNE","Crowding Problem","t-SNE"],["term","concept"]),
  syllabusItem("2-1-9","2. 機械学習","機械学習の基礎","教師なし学習②","クラスタリング",["k-means","階層的クラスタリング","デンドログラム","ウォード法","群平均法"],["term","concept"]),
  syllabusItem("2-1-10","2. 機械学習","機械学習の基礎","機械学習の課題","過剰適合・過少適合",["汎化誤差","訓練誤差","バイアス","バリアンス","正則化","次元の呪い"],["term","compare"]),
  syllabusItem("2-1-11","2. 機械学習","機械学習の基礎","検証集合","訓練・検証・テスト",["訓練誤差","汎化誤差","ホールドアウト法","k-分割交差検証法"],["term","compare"]),
  syllabusItem("2-1-12","2. 機械学習","機械学習の基礎","性能指標","",["Accuracy","Precision","Recall","F値","ROC曲線","AUC","IoU","mAP","micro平均","macro平均","RMSE","MSE","MAE","混同行列","パープレキシティ"],["term","formula","compare"]),

  syllabusItem("3-1-1","3. 深層学習の基礎","順伝播型ネットワーク","多層パーセプトロン","",["全結合層","重み","バイアス"],["term","concept"]),
  syllabusItem("3-1-2","3. 深層学習の基礎","順伝播型ネットワーク","出力層と損失関数","回帰",["平均二乗誤差","平均絶対誤差"],["formula","compare"]),
  syllabusItem("3-1-3","3. 深層学習の基礎","順伝播型ネットワーク","出力層と損失関数","分類",["バイナリクロスエントロピー","クロスエントロピー誤差","ソフトマックス関数","one-hotベクトル","マルチラベル分類","順序回帰"],["formula","compare"]),
  syllabusItem("3-1-4","3. 深層学習の基礎","順伝播型ネットワーク","活性化関数","",["シグモイド関数","温度パラメータ","勾配消失","ReLU","Leaky ReLU","GELU","tanh","双曲線関数"],["term","formula","compare"]),
  syllabusItem("3-2-1","3. 深層学習の基礎","深層モデルのための最適化","基本的なアルゴリズム","SGD・モメンタム",["学習率","最急降下法","ミニバッチ","Pathological Curvature","Momentum","Nesterov Accelerated Gradient"],["term","formula","concept"]),
  syllabusItem("3-2-2","3. 深層学習の基礎","深層モデルのための最適化","誤差逆伝播法","",["連鎖律","偏微分によるデルタ","勾配消失","自動微分","計算グラフ"],["term","formula","concept"]),
  syllabusItem("3-2-3","3. 深層学習の基礎","深層モデルのための最適化","適応的学習率","",["AdaGrad","RMSProp","Adam"],["term","compare"]),
  syllabusItem("3-2-4","3. 深層学習の基礎","深層モデルのための最適化","パラメータ初期化","",["Xavier法","Glorot法","Kaiming法","He法"],["term","compare"]),
  syllabusItem("3-3-1","3. 深層学習の基礎","深層モデルのための正則化","パラメータノルムペナルティー","",["L1正則化","スパース表現","L2正則化","weight decay"],["term","compare"]),
  syllabusItem("3-3-2","3. 深層学習の基礎","深層モデルのための正則化","確率的削除","",["ドロップアウト","ドロップコネクト"],["term","compare"]),
  syllabusItem("3-3-3","3. 深層学習の基礎","深層モデルのための正則化","陰的正則化","",["早期終了","バッチサイズ","学習率の調整"],["term"]),
  syllabusItem("3-4-1","3. 深層学習の基礎","畳み込みニューラルネットワーク","基本的な畳み込み演算","",["単純型細胞","複雑型細胞","受容野","特徴マップ","フィルタ","カーネル","パディング","ストライド","im2col","チャネル"],["term","formula","lab","question"]),
  syllabusItem("3-4-2","3. 深層学習の基礎","畳み込みニューラルネットワーク","特別な畳み込み","",["point-wise畳み込み","1x1畳み込み","depth-wise畳み込み","グループ化畳み込み","アップサンプリング","逆畳み込み"],["term","concept"]),
  syllabusItem("3-4-3","3. 深層学習の基礎","畳み込みニューラルネットワーク","プーリング","",["Max pooling","Lp pooling","Global Average Pooling"],["term","compare","lab"]),
  syllabusItem("3-5-1","3. 深層学習の基礎","リカレントニューラルネットワーク","RNN","",["順伝播","BPTT","双方向RNN"],["atlas","concept"],"rnn"),
  syllabusItem("3-5-2","3. 深層学習の基礎","リカレントニューラルネットワーク","ゲート機構","",["勾配消失","忘却ゲート","入力ゲート","出力ゲート","LSTM","GRU","リセットゲート","メモリーセル"],["atlas","compare"],"rnn"),
  syllabusItem("3-5-3","3. 深層学習の基礎","リカレントニューラルネットワーク","系列変換","",["エンコーダ・デコーダ","sequence-to-sequence","seq2seq","アテンション機構"],["atlas","concept"],"rnn"),
  syllabusItem("3-6-1","3. 深層学習の基礎","Transformer","Transformer","",["Self-Attention","Scaled Dot-Product Attention","Source Target Attention","Masked Attention","Multi-Head Attention","Positional Encoding"],["atlas","question"],"transformer"),
  syllabusItem("3-7-1","3. 深層学習の基礎","汎化性能向上","データ集合の拡張","画像",["ノイズ付与","Random Flip","Random Erase","Random Crop","Contrast","Brightness","Rotate","RandAugment","MixUp"],["term","lab"]),
  syllabusItem("3-7-2","3. 深層学習の基礎","汎化性能向上","データ集合の拡張","自然言語・音声",["EDA","MixUp","ノイズ付与","ボリューム変更","ピッチシフト","SpecAugment"],["term","concept"]),
  syllabusItem("3-7-3","3. 深層学習の基礎","汎化性能向上","正規化","",["Batch Normalization","Layer Normalization","Instance Normalization","Group Normalization"],["term","compare"]),
  syllabusItem("3-7-4","3. 深層学習の基礎","汎化性能向上","アンサンブル手法","",["バギング","ブースティング","ブートストラップ","スタッキング"],["term","compare"]),
  syllabusItem("3-7-5","3. 深層学習の基礎","汎化性能向上","ハイパーパラメータ調整","",["学習率","レイヤー層数","ユニット数","ドロップアウト割合","バッチサイズ","グリッドサーチ","ランダムサーチ","ベイズ最適化"],["term","compare"]),

  syllabusItem("4-1-1","4. 深層学習の応用","画像認識","ResNet・WideResNet","",["残差接続","skip-connection","ボトルネック構造","Residual Block"],["atlas","question"],"resnet"),
  syllabusItem("4-1-2","4. 深層学習の応用","画像認識","Vision Transformer","",["Shifted window","CLS token","Position embedding"],["atlas","compare"],"vit"),
  syllabusItem("4-2-1","4. 深層学習の応用","物体検出","Faster R-CNN・Mask R-CNN","",["Bounding Box","mAP","ROI","end-to-end","2ステージ検出","Selective Search","Fast R-CNN","RPN","Anchor box","ROI Pooling","ROI Align","インスタンスセグメンテーション"],["atlas","compare"],"detection"),
  syllabusItem("4-2-2","4. 深層学習の応用","物体検出","YOLO・SSD","",["1ステージ検出","デフォルトボックス","NMS","ハードネガティブマイニング"],["atlas","compare"],"detection"),
  syllabusItem("4-2-3","4. 深層学習の応用","物体検出","FCOS","",["Anchor-Free","FPN","センターネス","アンビギュアスサンプル"],["atlas","compare"],"detection"),
  syllabusItem("4-3-1","4. 深層学習の応用","セマンティックセグメンテーション","FCN・U-Net","",["スキップコネクション","アップサンプリング","インスタンスセグメンテーション","パノプティックセグメンテーション"],["atlas","compare"],"unet"),
  syllabusItem("4-4-1","4. 深層学習の応用","自然言語処理","Word Embedding","",["LSI","Word2vec","n-gram","skip gram","CBOW","ネガティブサンプリング"],["atlas","compare"],"word-embedding"),
  syllabusItem("4-4-2","4. 深層学習の応用","自然言語処理","BERT","",["MLM","NSP","事前学習","ファインチューニング","positional embeddings","segment embeddings"],["atlas","question"],"bert-gpt"),
  syllabusItem("4-4-3","4. 深層学習の応用","自然言語処理","GPT-n・RAG","",["基盤モデル","Next token prediction","Few Shot learning","Zero Shot learning","Prompt Based Learning","RAG"],["atlas","question"],"bert-gpt"),
  syllabusItem("4-5-1","4. 深層学習の応用","音声処理","サンプリング・STFT・メル尺度","",["サンプリング定理","窓関数","ナイキスト周波数","短時間フーリエ変換","高速フーリエ変換","ケプストラム","メルスペクトログラム","MFCC"],["formula","concept"]),
  syllabusItem("4-5-2","4. 深層学習の応用","音声処理","WaveNet","",["Text-to-Speech","Dilated Causal Convolution","GTU","Residual Block","Skip Connection"],["atlas","concept"],"wavenet"),
  syllabusItem("4-5-3","4. 深層学習の応用","音声処理","CTC","",["End-to-Endモデル","ビームサーチ","前向き・後ろ向きアルゴリズム"],["concept"]),
  syllabusItem("4-6-1","4. 深層学習の応用","生成モデル","識別モデルと生成モデル","",["識別モデル","自己回帰","生成モデル","拡散モデル","フローベース生成モデル"],["atlas","compare"],"generative"),
  syllabusItem("4-6-2","4. 深層学習の応用","生成モデル","オートエンコーダ","",["オートエンコーダ","Denoising autoencoder"],["atlas","concept"],"generative"),
  syllabusItem("4-6-3","4. 深層学習の応用","生成モデル","VAE","",["VAE","Reparameterization Trick","変分下限"],["atlas","formula"],"generative"),
  syllabusItem("4-6-4","4. 深層学習の応用","生成モデル","GAN","",["生成器","識別器","モード崩壊","Wasserstein GAN","DCGAN"],["atlas","compare"],"generative"),
  syllabusItem("4-6-5","4. 深層学習の応用","生成モデル","条件付きGAN","",["Conditional GAN","CycleGAN"],["atlas","compare"],"generative"),
  syllabusItem("4-7-1","4. 深層学習の応用","深層強化学習","DQN","",["行動価値関数","TD学習","Q学習","Experience replay"],["atlas","question"],"rl"),
  syllabusItem("4-7-2","4. 深層学習の応用","深層強化学習","A3C","",["Policy Gradient","Actor-Critic法"],["atlas","compare"],"rl"),
  syllabusItem("4-8-1","4. 深層学習の応用","様々な学習方法","転移学習","",["ファインチューニング","ドメイン適応","ドメインシフト"],["term","compare"]),
  syllabusItem("4-8-2","4. 深層学習の応用","様々な学習方法","半教師あり・自己教師あり","",["Self-Training","Co-Training","Contrastive learning"],["concept","compare"]),
  syllabusItem("4-8-3","4. 深層学習の応用","様々な学習方法","能動学習","",["Uncertainty Sampling","Least Confident","Representative Sampling"],["concept","compare"]),
  syllabusItem("4-8-4","4. 深層学習の応用","様々な学習方法","距離学習","",["表現学習","Siamese network","contrastive loss","Triplet loss","Triplet network"],["atlas","formula"],"metric-learning"),
  syllabusItem("4-8-5","4. 深層学習の応用","様々な学習方法","メタ学習","",["MAML","Model-Agnostic","meta-objective"],["concept"]),
  syllabusItem("4-9-1","4. 深層学習の応用","深層学習の説明性","判断根拠の可視化","",["XAI","Grad-CAM","Integrated Gradients"],["atlas","lab"],"xai"),
  syllabusItem("4-9-2","4. 深層学習の応用","深層学習の説明性","モデルの近似","",["局所的な解釈","大域的な解釈","LIME","SHAP","Shapley Value","協力ゲーム理論"],["atlas","compare"],"xai"),

  syllabusItem("5-1-1","5. 開発・運用環境","エッジコンピューティング","モデルの軽量化","",["エッジコンピューティング","プルーニング","枝刈り","蒸留","Distillation","量子化","Quantization"],["atlas","compare"],"compression"),
  syllabusItem("5-2-1","5. 開発・運用環境","分散処理","並列分散処理","",["分散深層学習","モデル並列化","データ並列化"],["atlas","compare"],"distributed"),
  syllabusItem("5-2-2","5. 開発・運用環境","分散処理","連合学習","",["Federated learning","クロスデバイス学習","クロスサイロ学習","Federated Averaging","Local Model","Global Model"],["atlas","concept"],"distributed"),
  syllabusItem("5-3-1","5. 開発・運用環境","アクセラレータ","デバイスによる高速化","",["SIMD","SIMT","MIMD","GPU","TPU"],["term","compare"]),
  syllabusItem("5-4-1","5. 開発・運用環境","環境構築","コンテナ型仮想化","",["仮想化環境","ホスト型","ハイパーバイザー型","コンテナ型","Docker","Dockerfile"],["term","compare"])
];
