"use strict";

const MATH_RECOVERY_QUESTIONS_VERSION = "v0.4.0-dev.22";

function mathRecoveryQuestion(
  id, topic, difficulty, syllabusId, question, choices, answer, explanation, cardIds,
  questionPolarity = "normal", calculationPattern = null
) {
  return Object.assign(
    syllabusQuestion(
      id, "数学的基礎", topic, difficulty, syllabusId,
      question, choices, answer, explanation, cardIds
    ),
    { examPriority: 2, questionPolarity, calculationPattern }
  );
}

const MATH_RECOVERY_QUESTIONS = [
  mathRecoveryQuestion(
    "math-q025", "条件付き確率", "基礎", "1-2-1",
    "P(A∩B)=0.18、P(B)=0.60のとき、P(A|B)はいくつですか？",
    ["0.108", "0.30", "0.42", "3.33"], 1,
    "P(A|B)=P(A∩B)/P(B)=0.18/0.60=0.30です。読み方は『ビーが起きた条件のもとでエーが起きる確率は、エーかつビーの確率をビーの確率で割る』です。",
    ["term-1-2-conditional-probability", "formula-1-2-conditional", "compare-1-2-joint-conditional"],
    "normal", "conditional_probability"
  ),
  mathRecoveryQuestion(
    "math-q026", "条件付き確率", "標準", "1-2-1",
    "P(A∩B)=0.12、P(B)=0.30のときの条件付き確率について、不適切な説明はどれですか？",
    ["P(A|B)は0.12÷0.30で求める", "P(A|B)=0.40である", "P(A|B)は0.30÷0.12で求める", "条件Bが起きた世界に絞ってAの割合を求める"], 2,
    "条件付き確率はP(A|B)=P(A∩B)/P(B)なので、0.12÷0.30=0.40です。分子と分母を逆にしないことが重要です。",
    ["term-1-2-conditional-probability", "formula-1-2-conditional", "compare-1-2-joint-conditional"],
    "incorrect_choice", "conditional_probability"
  ),
  mathRecoveryQuestion(
    "math-q027", "ベイズ則", "標準", "1-2-2",
    "P(A)=0.20、P(B|A)=0.80、P(B)=0.40のとき、ベイズ則でP(A|B)を求めるといくつですか？",
    ["0.10", "0.20", "0.32", "0.40"], 3,
    "P(A|B)=P(B|A)P(A)/P(B)=0.80×0.20÷0.40=0.40です。読み方は『事後確率は、尤度掛ける事前確率を、証拠の確率で割る』です。",
    ["term-1-2-bayes", "formula-1-2-bayes"],
    "normal", "bayes"
  ),
  mathRecoveryQuestion(
    "math-q028", "ベイズ則", "標準", "1-2-2",
    "有病率10%、感度90%、偽陽性率10%の検査について、陽性だった人が実際に有病である確率を求める過程として不適切なものはどれですか？",
    ["P(有病|陽性)=0.9÷0.1=9とする", "P(有病∩陽性)=0.9×0.1=0.09とする", "P(陽性)=0.9×0.1+0.1×0.9=0.18とする", "P(有病|陽性)=0.09÷0.18=0.5とする"], 0,
    "陽性者全体には真陽性0.09と偽陽性0.09が含まれるため、事後確率は0.09÷0.18=0.5です。感度を偽陽性率で直接割る計算はベイズ則ではありません。",
    ["term-1-2-bayes", "formula-1-2-bayes"],
    "incorrect_choice", "bayes"
  ),
  mathRecoveryQuestion(
    "math-q029", "平均・分散・標準偏差", "標準", "1-2-1",
    "データ[2,4,6,8]の母標準偏差として最も近い値はどれですか？",
    ["5.00", "2.24", "4.00", "20.00"], 1,
    "平均は5、平均との差の二乗和は9+1+1+9=20、母分散は20÷4=5です。標準偏差は分散の平方根なので√5≈2.24です。",
    ["term-1-2-expectation", "term-1-2-variance", "formula-1-2-variance"],
    "normal", "standard_deviation"
  ),
  mathRecoveryQuestion(
    "math-q030", "平均・分散・標準偏差", "基礎", "1-2-1",
    "データ[1,1,5,5]の母標準偏差はいくつですか？",
    ["4", "16", "2", "√2"], 2,
    "平均は3です。平均との差は-2,-2,2,2で、二乗平均は4なので母分散は4、標準偏差は√4=2です。",
    ["term-1-2-expectation", "term-1-2-variance", "formula-1-2-variance"],
    "normal", "standard_deviation"
  ),
  mathRecoveryQuestion(
    "math-q031", "共分散・相関係数", "標準", "1-2-1",
    "XとYの共分散が6、Xの標準偏差が2、Yの標準偏差が3のとき、相関係数はいくつですか？",
    ["-1", "0.5", "6", "1"], 3,
    "相関係数r=Cov(X,Y)/(σXσY)=6÷(2×3)=1です。読み方は『相関係数は、共分散を二つの標準偏差の積で割る』です。",
    ["term-1-2-covariance", "formula-1-2-covariance"],
    "normal", "correlation"
  ),
  mathRecoveryQuestion(
    "math-q032", "共分散・相関係数", "標準", "1-2-1",
    "共分散が-4、Xの標準偏差が2、Yの標準偏差が4であるときの計算・解釈として不適切なものはどれですか？",
    ["相関係数は-2である", "相関係数は-4÷(2×4)=-0.5である", "負の相関なので、一方が増えると他方が減る傾向を示す", "相関係数は共分散を標準偏差で正規化した量である"], 0,
    "相関係数は-4÷8=-0.5です。共分散をそのまま使わず、二つの標準偏差の積で割って-1から1の範囲へ正規化します。",
    ["term-1-2-covariance", "formula-1-2-covariance"],
    "incorrect_choice", "correlation"
  ),
  mathRecoveryQuestion(
    "math-q033", "固有値・固有ベクトル", "標準", "1-1-2",
    "行列A=[[2,1],[1,2]]の大きい方の固有値はいくつですか？",
    ["2", "3", "1", "4"], 1,
    "det(A-λI)=(2-λ)^2-1=0より、λ=3,1です。大きい方の固有値は3です。固有値はAv=λvを満たす倍率です。",
    ["term-1-1-eigenvalue", "term-1-1-eigenvector", "formula-1-1-eigen"],
    "normal", "eigenvalue"
  ),
  mathRecoveryQuestion(
    "math-q034", "固有値・固有ベクトル", "基礎", "1-1-2",
    "A=[[4,0],[0,2]]、v=[1,0]ᵀについて不適切な説明はどれですか？",
    ["Av=[4,0]ᵀである", "vはAの固有ベクトルである", "vに対応する固有値は2である", "Av=4vが成り立つ"], 2,
    "Av=[4,0]ᵀ=4vなので、vに対応する固有値は4です。読み方は『エー掛けるブイは、ラムダ掛けるブイ』です。",
    ["term-1-1-eigenvalue", "term-1-1-eigenvector", "formula-1-1-eigen"],
    "incorrect_choice", "eigenvalue"
  ),
  mathRecoveryQuestion(
    "math-q035", "PCA", "標準", "1-1-2",
    "PCAで共分散行列の固有値が[5,3,2]のとき、第1・第2主成分を残した累積寄与率はいくつですか？",
    ["50%", "70%", "100%", "80%"], 3,
    "累積寄与率は採用する固有値の和を全固有値の和で割ります。(5+3)÷(5+3+2)=8÷10=80%です。",
    ["term-1-1-eigenvalue", "term-1-1-eigenvector", "compare-1-1-eigen-svd"],
    "normal", "pca_explained_variance"
  ),
  mathRecoveryQuestion(
    "math-q036", "PCA", "基礎", "1-1-2",
    "PCAで2つの主成分の固有値が9と1のとき、第1主成分だけを残す場合の寄与率はいくつですか？",
    ["90%", "10%", "81%", "99%"], 0,
    "第1主成分の寄与率は9÷(9+1)=0.9=90%です。PCAでは大きい固有値に対応する方向ほど分散を多く保持します。",
    ["term-1-1-eigenvalue", "term-1-1-eigenvector"],
    "normal", "pca_explained_variance"
  ),
  mathRecoveryQuestion(
    "math-q037", "特異値分解", "標準", "1-1-2",
    "行列の特異値が4と3のとき、特異値の二乗和を全エネルギーとみなし、最大の特異値だけを残す割合はいくつですか？",
    ["40%", "64%", "75%", "80%"], 1,
    "特異値の二乗和は4²+3²=25で、最大特異値が持つ割合は4²÷25=16÷25=64%です。",
    ["term-1-1-singular-value", "term-1-1-singular-vector", "formula-1-1-svd", "compare-1-1-eigen-svd"],
    "normal", "svd"
  ),
  mathRecoveryQuestion(
    "math-q038", "特異値分解", "標準", "1-1-2",
    "特異値が5,2,1の行列をランク1近似するときの説明として不適切なものはどれですか？",
    ["最大の特異値5に対応する成分を残す", "捨てる特異値の二乗和は2²+1²=5である", "フロベニウスノルムで見た近似誤差は5である", "大きい特異値ほど強い方向を表す"], 2,
    "ランク1近似で捨てる成分の二乗和は5ですが、フロベニウスノルムの誤差はその平方根√5です。5そのものではありません。",
    ["term-1-1-singular-value", "term-1-1-singular-vector", "formula-1-1-svd"],
    "incorrect_choice", "svd"
  ),
  mathRecoveryQuestion(
    "math-q039", "L1ノルム", "基礎", "1-1-2",
    "ベクトルx=[-3,4,-2]のL1ノルムはいくつですか？",
    ["5", "7", "√29", "9"], 3,
    "L1ノルムは各要素の絶対値の和なので、|-3|+|4|+|-2|=3+4+2=9です。読み方は『絶対値を全部足す』です。",
    [], "normal", "l1_norm"
  ),
  mathRecoveryQuestion(
    "math-q040", "L1ノルム", "基礎", "1-1-2",
    "ベクトルx=[1,-2,3]のL1ノルムはいくつですか？",
    ["6", "√14", "2", "0"], 0,
    "L1ノルムは|1|+|-2|+|3|=1+2+3=6です。符号をそのまま足さず、絶対値にしてから合計します。",
    [], "normal", "l1_norm"
  ),
  mathRecoveryQuestion(
    "math-q041", "L2ノルム", "基礎", "1-1-2",
    "ベクトルx=[-3,4]のL2ノルムはいくつですか？",
    ["7", "5", "25", "1"], 1,
    "L2ノルムは二乗和の平方根なので、√((-3)²+4²)=√25=5です。読み方は『各要素を二乗して足し、その平方根を取る』です。",
    [], "normal", "l2_norm"
  ),
  mathRecoveryQuestion(
    "math-q042", "L2ノルム", "基礎", "1-1-2",
    "ベクトルx=[1,2,2]のL2ノルムはいくつですか？",
    ["5", "√5", "3", "9"], 2,
    "L2ノルムは√(1²+2²+2²)=√9=3です。L1ノルムのように絶対値をそのまま足す計算とは区別します。",
    [], "normal", "l2_norm"
  ),
  mathRecoveryQuestion(
    "math-q043", "コサイン類似度・距離", "標準", "1-1-2",
    "a=[1,0]、b=[1,1]のコサイン類似度として最も近い値はどれですか？",
    ["0", "0.5", "1", "0.707"], 3,
    "コサイン類似度は(a・b)/(||a||₂||b||₂)=1/(1×√2)=1/√2≈0.707です。読み方は『内積を二つのL2ノルムの積で割る』です。",
    [], "normal", "cosine_similarity"
  ),
  mathRecoveryQuestion(
    "math-q044", "コサイン類似度・距離", "基礎", "1-1-2",
    "a=[1,0]、b=[0,2]について、コサイン距離を1−コサイン類似度と定義するとき、不適切な説明はどれですか？",
    ["コサイン距離は0である", "aとbの内積は0である", "コサイン類似度は0である", "コサイン距離は1である"], 0,
    "2つのベクトルは直交するため内積0、コサイン類似度0です。ここではコサイン距離=1−類似度と定義しているので距離は1です。",
    [], "incorrect_choice", "cosine_distance"
  ),
  mathRecoveryQuestion(
    "math-q045", "エントロピー・クロスエントロピー", "基礎", "1-3-1",
    "確率が[0.5,0.5]の2択分布のエントロピーをlog₂で計算すると何ビットですか？",
    ["0", "1", "2", "0.5"], 1,
    "H(p)=-Σp log₂p=-(0.5×(-1)+0.5×(-1))=1ビットです。読み方は『マイナス、確率掛けるその確率のログを全部足す』です。",
    ["term-1-3-entropy", "formula-1-3-entropy"],
    "normal", "entropy"
  ),
  mathRecoveryQuestion(
    "math-q046", "エントロピー・クロスエントロピー", "標準", "1-3-1",
    "正解分布p=[1,0]、予測分布q=[0.8,0.2]のクロスエントロピーについて不適切な説明はどれですか？",
    ["自然対数なら損失は-ln(0.8)である", "値は約0.223である", "正解クラスが先頭なので-ln(0.2)を使う", "正解クラスの予測確率が1へ近づくほど損失は小さくなる"], 2,
    "one-hotの正解分布では正解クラスだけが残るため、H(p,q)=-ln(0.8)≈0.223です。予測qの正解クラス確率を見ることが重要です。",
    ["term-1-3-cross-entropy", "formula-1-3-cross-entropy", "compare-1-3-entropy-cross"],
    "incorrect_choice", "cross_entropy"
  ),
  mathRecoveryQuestion(
    "math-q047", "KLダイバージェンス", "標準", "1-3-1",
    "p=[1,0]、q=[0.5,0.5]のKLダイバージェンスD_KL(p||q)をlog₂で計算すると何ビットですか？",
    ["0", "0.5", "2", "1"], 3,
    "D_KL(p||q)=Σp log₂(p/q)です。pの第1成分だけが残り、1×log₂(1/0.5)=log₂2=1ビットです。",
    ["term-1-3-kl", "formula-1-3-kl", "compare-1-3-kl-js"],
    "normal", "kl_divergence"
  ),
  mathRecoveryQuestion(
    "math-q048", "KLダイバージェンス", "基礎", "1-3-1",
    "p=[0.25,0.75]、q=[0.25,0.75]のとき、D_KL(p||q)はいくつですか？",
    ["0", "0.25", "0.75", "1"], 0,
    "pとqが同一分布なら各項のlog(p/q)=log1=0なので、KLダイバージェンスは0です。KLは一般に非対称ですが、同一分布では0になります。",
    ["term-1-3-kl", "formula-1-3-kl", "compare-1-3-kl-js"],
    "normal", "kl_divergence"
  )
];
