"use strict";

const PASS_RECOVERY_QUESTIONS_VERSION = "v0.4.0-dev.28";

function passRecoveryQuestion(
  id, category, topic, difficulty, syllabusId, question, choices, answer, explanation, cardIds,
  calculationPattern = null
) {
  return Object.assign(
    syllabusQuestion(
      id, category, topic, difficulty, syllabusId,
      question, choices, answer, explanation, cardIds
    ),
    { examPriority: 2, questionPolarity: "normal", calculationPattern }
  );
}

const PASS_RECOVERY_QUESTIONS = [
  passRecoveryQuestion(
    "math-q049", "数学的基礎", "PCA", "標準", "1-1-2",
    "PCAで共分散行列の固有値が[6,2,1,1]のとき、第1・第2主成分を残した累積寄与率はいくつですか？",
    ["80%", "60%", "75%", "90%"], 0,
    "累積寄与率は、残す固有値の和を全固有値の和で割ります。(6+2)÷(6+2+1+1)=8÷10=0.8=80%です。読み方は『上位2つの固有値の合計を、全固有値の合計で割る』です。",
    ["term-1-1-eigenvalue", "compare-1-1-eigen-svd"],
    "pca_explained_variance"
  ),
  passRecoveryQuestion(
    "math-q050", "数学的基礎", "特異値分解", "標準", "1-1-2",
    "ある行列の特異値が[7,3,0,0]のとき、この行列のランクはいくつですか？",
    ["1", "2", "3", "4"], 1,
    "行列のランクは0でない特異値の個数に一致します。7と3の2個が非ゼロなのでランクは2です。Singular Value（シンギュラー・バリュー／特異値）が0でない方向の数を数えます。",
    ["term-1-1-singular-value", "formula-1-1-svd", "compare-1-1-eigen-svd"],
    "svd_rank"
  ),
  passRecoveryQuestion(
    "math-q051", "数学的基礎", "コサイン類似度・距離", "標準", "1-1-2",
    "a=[1,2]、b=[-1,-2]について、コサイン距離を1−コサイン類似度と定義するとき、コサイン距離はいくつですか？",
    ["0", "1", "2", "-1"], 2,
    "bはaと完全に逆向きなのでコサイン類似度は-1です。したがってコサイン距離は1-(-1)=2です。読み方は『1からコサイン類似度マイナス1を引くので2』です。",
    [],
    "cosine_distance"
  ),
  passRecoveryQuestion(
    "math-q052", "数学的基礎", "クロスエントロピー", "標準", "1-3-1",
    "正解分布p=[0,0,1]、予測分布q=[0.1,0.2,0.7]のクロスエントロピーを自然対数で計算すると、最も近い値はどれですか？",
    ["2.303", "1.609", "0.700", "0.357"], 3,
    "one-hotの正解分布では正解クラスの項だけが残ります。H(p,q)=-ln(0.7)≈0.357です。読み方は『正解クラスの予測確率0.7の自然対数にマイナスを付ける』です。",
    ["term-1-3-cross-entropy", "formula-1-3-cross-entropy", "compare-1-3-entropy-cross"],
    "cross_entropy"
  ),

  passRecoveryQuestion(
    "dla-q031", "深層学習の応用", "Attentionの出力形状", "標準", "3-6-1",
    "Attention重みの形状がB×H×T_q×T_k、Valueの形状がB×H×T_k×d_vのとき、両者を掛けた出力形状はどれですか？",
    ["B×H×T_q×d_v", "B×H×T_k×d_v", "B×T_q×T_k", "B×H×d_v×d_v"], 0,
    "T_kの次元で積和を取るため、Query位置T_qとValue次元d_vが残り、B×H×T_q×d_vになります。読み方は『バッチ、ヘッド、クエリ長、バリュー次元』です。",
    ["term-3-5-attention", "term-3-6-self-scaled"],
    "attention_output_shape"
  ),
  passRecoveryQuestion(
    "dla-q032", "深層学習の応用", "Attentionの行列サイズ", "標準", "3-6-1",
    "Self-AttentionでB=2、H=8、系列長T=128のとき、Attentionスコア行列B×H×T×Tの全要素数はいくつですか？",
    ["131,072", "262,144", "16,384", "2,048"], 1,
    "要素数は2×8×128×128です。128²=16,384、さらに16倍して262,144です。Self-Attention（セルフ・アテンション／自己注意）のスコア行列は系列長Tに対してT²で増えます。",
    ["term-3-5-attention", "term-3-6-self-scaled"],
    "attention_matrix_elements"
  ),
  passRecoveryQuestion(
    "dla-q033", "深層学習の応用", "ViTの埋め込み形状", "標準", "4-1-2",
    "224×224画像を16×16パッチへ分割し、CLS Tokenを1つ加え、各トークンを512次元へ埋め込むViTがあります。バッチをBとしたとき、Transformerへ入る代表的な形状はどれですか？",
    ["B×196×768", "B×512×197", "B×197×512", "B×224×224×3"], 2,
    "224÷16=14なので14×14=196パッチです。CLS Token（シーエルエス・トークン／分類トークン）を加えて197トークン、各トークンが512次元なのでB×197×512です。",
    ["term-4-1-patch-embedding", "term-4-1-cls-token", "term-3-6-multihead-position"],
    "vit_embedding_shape"
  ),
  passRecoveryQuestion(
    "dla-q034", "深層学習の応用", "ViTとAttention計算量", "標準", "4-1-2",
    "同じ224×224画像でパッチサイズを16×16から8×8へ半分にすると、CLS Tokenの影響を無視した場合、Self-Attentionのスコア行列要素数はおよそ何倍になりますか？",
    ["2倍", "4倍", "8倍", "16倍"], 3,
    "パッチサイズを半分にすると縦横のパッチ数が各2倍になり、トークン数は4倍になります。Attentionスコアはトークン数の二乗T²なので、要素数は4²=16倍です。読み方は『トークン4倍、その二乗で16倍』です。",
    ["term-4-1-patch-embedding", "term-3-6-self-scaled"],
    "vit_attention_complexity"
  )
];
