"use strict";

const MACHINE_LEARNING_CARDS_VERSION = "v0.4.0-dev.5";

function machineLearningTerm(id, group, syllabusId, en, kana, ja, desc, examCue, confusion, questionIds) {
  return {
    id, type: "term", major: "2. 機械学習", group, syllabusId,
    en, kana, ja, desc, examCue, confusion: confusion || "",
    atlasId: "", questionIds: questionIds || [], scope: "syllabus"
  };
}

function machineLearningFormula(id, group, syllabusId, name, fx, yomi, imi, oboe, rei, variables, mistake) {
  return {
    id, type: "formula", major: "2. 機械学習", group, syllabusId,
    name, fx, yomi, imi, oboe, rei, variables, mistake,
    atlasId: "", questionIds: [], scope: "syllabus"
  };
}

function machineLearningCompare(id, group, syllabusId, left, right, key) {
  return {
    id, type: "compare", major: "2. 機械学習", group, syllabusId,
    l: left, r: right, key, atlasId: "", questionIds: [], scope: "syllabus"
  };
}

const MACHINE_LEARNING_TERM_CARDS = [
  machineLearningTerm("term-2-1-nearest-neighbor", "パターン認識・距離", "2-1-1", "Nearest Neighbor", "ニアレスト・ネイバー", "最近傍法", "未知データに最も近い1件の学習データを探し、そのラベルなどを予測へ使います。", "最も近い1点だけを使う説明なら最近傍法です。", "k近傍法は近いk件の多数決や平均を使います。"),
  machineLearningTerm("term-2-1-knn", "パターン認識・距離", "2-1-1", "k-Nearest Neighbors", "ケイ・ニアレスト・ネイバーズ", "k近傍法", "未知データに近いk件を選び、分類では多数決、回帰では平均などで予測します。", "k、近傍、多数決または平均が手掛かりです。", "kを小さくすると局所的で分散が大きく、大きくすると境界が滑らかになります。"),
  machineLearningTerm("term-2-1-kdtree", "パターン認識・距離", "2-1-1", "kd-tree", "ケーディー・ツリー", "kd木", "多次元空間を軸に沿って再帰的に分割し、近傍探索を高速化する木構造です。", "低～中次元の厳密最近傍探索で使われます。", "高次元では次元の呪いにより探索効率が落ちやすくなります。"),
  machineLearningTerm("term-2-1-ann", "パターン認識・距離", "2-1-1", "Approximate Nearest Neighbor", "アプロキシメイト・ニアレスト・ネイバー", "近似最近傍探索", "完全な最近傍を保証せず、少しの誤差を許して高速・省メモリに近い点を探します。", "大規模・高次元・検索速度重視が手掛かりです。", "分類器のArtificial Neural Networkと略称ANNが同じなので文脈に注意します。"),
  machineLearningTerm("term-2-1-euclidean", "パターン認識・距離", "2-1-2", "Euclidean Distance", "ユークリディアン・ディスタンス", "ユークリッド距離", "2点間の各成分差を二乗して足し、平方根を取る直線距離です。", "L2距離、直線距離、平方根が手掛かりです。", "特徴量の尺度が違うと大きな尺度の変数へ強く影響されます。"),
  machineLearningTerm("term-2-1-manhattan", "パターン認識・距離", "2-1-2", "Manhattan Distance", "マンハッタン・ディスタンス", "マンハッタン距離", "各成分差の絶対値を足した距離で、格子状の街路移動にたとえられます。", "L1距離、絶対値の和が手掛かりです。", "ユークリッド距離のように二乗や平方根を使いません。"),
  machineLearningTerm("term-2-1-lp", "パターン認識・距離", "2-1-2", "Lp Distance", "エルピー・ディスタンス", "Lp距離", "成分差の絶対値をp乗して足し、最後に1/p乗する距離の一般形です。", "p=1でマンハッタン、p=2でユークリッドです。", "pの値により距離空間の形が変わります。"),
  machineLearningTerm("term-2-1-cosine", "パターン認識・距離", "2-1-2", "Cosine Distance", "コサイン・ディスタンス", "コサイン距離", "ベクトルの向きの違いを、コサイン類似度1から引いて表します。", "文書ベクトル・埋め込み・角度の近さが手掛かりです。", "ベクトルの大きさより方向を重視し、ゼロベクトルには注意が必要です。"),
  machineLearningTerm("term-2-1-mahalanobis", "パターン認識・距離", "2-1-2", "Mahalanobis Distance", "マハラノビス・ディスタンス", "マハラノビス距離", "特徴量の分散と相関を共分散行列で補正した距離です。", "共分散行列の逆行列、相関を考慮した距離が手掛かりです。", "共分散が単位行列ならユークリッド距離に対応します。"),

  machineLearningTerm("term-2-1-supervised", "学習の分類", "2-1-3", "Supervised Learning", "スーパーバイズド・ラーニング", "教師あり学習", "入力と正解ラベルの組を使い、未知入力の値やクラスを予測する関数を学習します。", "回帰と分類、正解ラベルあり、損失最小化が手掛かりです。", "教師なし学習は正解ラベルを前提にしません。"),
  machineLearningTerm("term-2-1-unsupervised", "学習の分類", "2-1-3", "Unsupervised Learning", "アンスーパーバイズド・ラーニング", "教師なし学習", "正解ラベルを使わず、データの構造・分布・クラスタ・低次元表現を見つけます。", "クラスタリング、次元削減、ラベルなしが手掛かりです。", "自己教師あり学習はデータ自身から擬似的な教師信号を作ります。"),
  machineLearningTerm("term-2-1-semisupervised", "学習の分類", "2-1-3", "Semi-Supervised Learning", "セミ・スーパーバイズド・ラーニング", "半教師あり学習", "少数のラベル付きデータと多数のラベルなしデータを組み合わせて学習します。", "ラベル付きが少数、未ラベルが大量という構成です。", "教師ありと教師なしの単純な中間ではなく、両方のデータを同一課題へ使います。"),

  machineLearningTerm("term-2-1-linear-regression", "回帰・正則化", "2-1-4", "Linear Regression", "リニア・リグレッション", "線形回帰", "入力特徴の重み付き和と切片で連続値を予測する回帰モデルです。", "予測値が連続、直線・超平面、最小二乗法が手掛かりです。", "ロジスティック回帰は名前に回帰とありますが主に分類へ使います。"),
  machineLearningTerm("term-2-1-least-squares", "回帰・正則化", "2-1-4", "Least Squares Method", "リースト・スクエアズ・メソッド", "最小二乗法", "予測値と正解値の残差二乗和が最小になるパラメータを求めます。", "残差を二乗して合計し、最小化します。", "絶対誤差最小化より外れ値の影響を強く受けます。"),
  machineLearningTerm("term-2-1-lasso", "回帰・正則化", "2-1-4", "Lasso Regression", "ラッソ・リグレッション", "Lasso回帰", "線形回帰の損失へ重みのL1ノルムを加え、一部の係数を0にしやすくします。", "L1正則化、疎な係数、特徴選択が手掛かりです。", "Ridge回帰は係数を小さくしますが通常は0にしにくいです。"),
  machineLearningTerm("term-2-1-ridge", "回帰・正則化", "2-1-4", "Ridge Regression", "リッジ・リグレッション", "Ridge回帰", "線形回帰の損失へ重みのL2ノルム二乗を加え、係数を滑らかに小さくします。", "L2正則化、多重共線性の緩和が手掛かりです。", "Lassoのような明確な特徴選択は起こりにくいです。"),
  machineLearningTerm("term-2-1-underfitting", "回帰・正則化", "2-1-4", "Underfitting", "アンダーフィッティング", "過少適合", "モデルが単純すぎたり学習不足だったりして、訓練データにも十分適合できない状態です。", "訓練誤差も検証誤差も高い、高バイアスが手掛かりです。", "過剰適合では訓練誤差だけ低くなります。"),
  machineLearningTerm("term-2-1-overfitting", "回帰・正則化", "2-1-4", "Overfitting", "オーバーフィッティング", "過剰適合", "訓練データの細かなノイズまで覚え、未知データの性能が低下した状態です。", "訓練誤差は低いが検証誤差が高い、高バリアンスが手掛かりです。", "訓練性能が高いこと自体ではなく、汎化性能との乖離が問題です。", ["q011"]),
  machineLearningTerm("term-2-1-correlation", "回帰・正則化", "2-1-4", "Correlation Coefficient", "コリレーション・コエフィシェント", "相関係数", "2変数の線形な関係の強さと向きを、通常−1から1で表します。", "共分散を標準偏差で割って尺度を除きます。", "相関は因果関係を意味しません。"),
  machineLearningTerm("term-2-1-multicollinearity", "回帰・正則化", "2-1-4", "Multicollinearity", "マルチコリニアリティ", "多重共線性", "説明変数どうしが強く相関し、回帰係数が不安定になる問題です。", "係数の符号が不安定、標準誤差増大、VIFが手掛かりです。", "予測精度が必ず大きく悪化するとは限りませんが係数解釈が難しくなります。"),
  machineLearningTerm("term-2-1-l1", "回帰・正則化", "2-1-4", "L1 Regularization", "エルワン・レギュラライゼーション", "L1正則化", "重みの絶対値和を損失へ加え、不要な係数を0にしやすくします。", "疎性、特徴選択、Lassoが手掛かりです。", "微分できない0付近を含むため最適化方法に工夫が必要な場合があります。"),
  machineLearningTerm("term-2-1-l2", "回帰・正則化", "2-1-4", "L2 Regularization", "エルツー・レギュラライゼーション", "L2正則化", "重みの二乗和を損失へ加え、極端に大きな係数を抑えます。", "Ridge、weight decay、滑らかな縮小が手掛かりです。", "係数を厳密に0へしにくい点がL1との違いです。"),

  machineLearningTerm("term-2-1-logistic-regression", "ロジスティック回帰", "2-1-5", "Logistic Regression", "ロジスティック・リグレッション", "ロジスティック回帰", "線形結合をシグモイド関数へ通し、2値クラスの確率を予測します。", "確率、対数オッズ、シグモイドが手掛かりです。", "予測対象は主にクラスで、連続値回帰とは異なります。"),
  machineLearningTerm("term-2-1-logit", "ロジスティック回帰", "2-1-5", "Logit", "ロジット", "ロジット", "確率pのオッズp/(1−p)へ対数を取った値で、0から1の確率を実数全体へ写します。", "log(p/(1−p))がロジットです。", "ニューラルネットワークではSoftmax前の未正規化スコアもロジットと呼びます。"),
  machineLearningTerm("term-2-1-sigmoid", "ロジスティック回帰", "2-1-5", "Sigmoid Function", "シグモイド・ファンクション", "シグモイド関数", "実数入力を0から1へ滑らかに変換し、2値分類の確率として使います。", "1/(1+e^(−z))、S字曲線が手掛かりです。", "Softmaxは複数クラスの出力を合計1へします。"),
  machineLearningTerm("term-2-1-softmax", "ロジスティック回帰", "2-1-5", "Softmax Function", "ソフトマックス・ファンクション", "ソフトマックス関数", "複数のロジットを指数化して正規化し、合計1のクラス確率へ変換します。", "多クラス単一ラベル、確率合計1が手掛かりです。", "マルチラベルでは各出力へ独立したシグモイドを使うことがあります。"),
  machineLearningTerm("term-2-1-odds", "ロジスティック回帰", "2-1-5", "Odds", "オッズ", "オッズ", "事象が起こる確率pと起こらない確率1−pの比p/(1−p)です。", "確率0.5ならオッズ1です。", "確率とオッズは同じ数値ではありません。"),
  machineLearningTerm("term-2-1-odds-ratio", "ロジスティック回帰", "2-1-5", "Odds Ratio", "オッズ・レシオ", "オッズ比", "2群のオッズを割った比で、説明変数の変化と事象発生の関係を表します。", "ロジスティック回帰係数βを指数化したe^βが手掛かりです。", "リスク比とは分母が異なります。"),

  machineLearningTerm("term-2-1-svm", "サポートベクターマシン", "2-1-6", "Support Vector Machine", "サポート・ベクター・マシン", "サポートベクターマシン", "クラス間のマージンが最大になる分離超平面を求める分類器です。", "最大マージン、サポートベクター、カーネルが手掛かりです。", "決定境界に近い一部のデータが解を決めます。"),
  machineLearningTerm("term-2-1-support-vector", "サポートベクターマシン", "2-1-6", "Support Vector", "サポート・ベクター", "サポートベクター", "決定境界に最も近く、マージンを決める学習データです。", "境界から遠い点より、マージン上や内側の点が重要です。", "全学習データが同じ強さで境界を決めるわけではありません。"),
  machineLearningTerm("term-2-1-max-margin", "サポートベクターマシン", "2-1-6", "Maximum Margin", "マキシマム・マージン", "マージン最大化", "決定境界と最も近い学習点との距離を最大にして汎化性能を高めます。", "境界の幅を最大にするという幾何学的説明です。", "分類誤差だけを最小にする説明とは異なります。"),
  machineLearningTerm("term-2-1-hard-margin", "サポートベクターマシン", "2-1-6", "Hard Margin", "ハード・マージン", "ハードマージン", "すべての学習データを誤分類せず、マージン外へ置く完全分離を要求します。", "線形分離可能、違反を許さない制約が手掛かりです。", "ノイズや外れ値に弱く、分離不能なら解が得られません。"),
  machineLearningTerm("term-2-1-soft-margin", "サポートベクターマシン", "2-1-6", "Soft Margin", "ソフト・マージン", "ソフトマージン", "スラック変数で一部のマージン違反や誤分類を許し、境界の広さと誤差を調整します。", "C、スラック変数、違反許容が手掛かりです。", "Cが大きいほど違反への罰が強くなります。"),
  machineLearningTerm("term-2-1-kernel", "サポートベクターマシン", "2-1-6", "Kernel Method", "カーネル・メソッド", "カーネル法", "高次元特徴空間での内積を、明示的な写像を作らずカーネル関数で計算します。", "カーネルトリック、RBF、多項式カーネルが手掛かりです。", "カーネルはデータ間の類似度として正定値性などの条件を満たす必要があります。"),

  machineLearningTerm("term-2-1-decision-tree", "決定木・アンサンブル", "2-1-7", "Decision Tree", "ディシジョン・ツリー", "決定木", "特徴量の条件分岐を繰り返し、葉でクラスや数値を予測します。", "if-then分岐、解釈性、木構造が手掛かりです。", "深くしすぎると訓練データへ過剰適合しやすくなります。"),
  machineLearningTerm("term-2-1-classification-regression-tree", "決定木・アンサンブル", "2-1-7", "Classification Tree / Regression Tree", "クラシフィケーション・ツリー／リグレッション・ツリー", "分類木／回帰木", "分類木はクラスを、回帰木は連続値を葉の多数派や平均で予測します。", "分類はGiniやEntropy、回帰は二乗誤差減少が典型です。", "木構造は共通ですが分割基準と葉の出力が異なります。"),
  machineLearningTerm("term-2-1-cart", "決定木・アンサンブル", "2-1-7", "CART", "カート", "分類回帰木", "Classification and Regression Treesの略で、二分木を使って分類と回帰を扱います。", "各ノードを2つへ分割する二分木が特徴です。", "決定木一般のすべてが必ずCARTと同じ分割規則とは限りません。"),
  machineLearningTerm("term-2-1-gini", "決定木・アンサンブル", "2-1-7", "Gini Impurity", "ジニ・インピュリティ", "Gini不純度", "ノード内のクラス混在度を1−Σp²で表し、純粋なノードほど0に近づきます。", "CART分類木、純度、1−Σp²が手掛かりです。", "所得格差のGini係数と数式の文脈が異なります。"),
  machineLearningTerm("term-2-1-ensemble", "決定木・アンサンブル", "2-1-7", "Ensemble Learning", "アンサンブル・ラーニング", "アンサンブル学習", "複数モデルの予測を組み合わせ、単一モデルより安定性や精度を高めます。", "多数決、平均、Bagging、Boostingが手掛かりです。", "同じ誤りをするモデルだけを増やしても効果は限定的です。"),
  machineLearningTerm("term-2-1-bagging", "決定木・アンサンブル", "2-1-7", "Bagging", "バギング", "バギング", "Bootstrap標本で複数モデルを独立・並列に学習し、予測を平均や多数決で統合します。", "並列、Bootstrap、分散低減が手掛かりです。", "Boostingは前の弱学習器の誤りを受けて逐次学習します。"),
  machineLearningTerm("term-2-1-random-forest", "決定木・アンサンブル", "2-1-7", "Random Forest", "ランダム・フォレスト", "ランダムフォレスト", "Bootstrap標本と特徴量のランダム選択を使って多数の決定木を学習するBagging系手法です。", "多数の木、Bootstrap、各分割で特徴を一部だけ使う点が手掛かりです。", "勾配ブースティングのように木を逐次的に誤差修正させません。"),
  machineLearningTerm("term-2-1-boosting", "決定木・アンサンブル", "2-1-7", "Boosting", "ブースティング", "ブースティング", "弱学習器を逐次追加し、前段が苦手なデータや残差へ重点を置いて強いモデルを作ります。", "逐次、誤りの重み付け、弱学習器が手掛かりです。", "Baggingは各モデルを独立・並列に学習します。"),
  machineLearningTerm("term-2-1-gradient-boosting", "決定木・アンサンブル", "2-1-7", "Gradient Boosting", "グラディエント・ブースティング", "勾配ブースティング", "現在モデルの損失の負勾配、実務では残差を近似する木を逐次追加します。", "残差、負の勾配、逐次的な木の追加が手掛かりです。", "学習率と木の数の調整が重要で、過剰適合にも注意します。"),

  machineLearningTerm("term-2-1-pca", "次元削減", "2-1-8", "Principal Component Analysis", "プリンシパル・コンポーネント・アナリシス", "主成分分析", "データの分散が大きい直交方向を主成分として求め、情報を保ちながら線形次元削減します。", "共分散行列の固有ベクトル、分散最大化が手掛かりです。", "教師ラベルを使わない線形変換で、t-SNEのような非線形可視化とは異なります。"),
  machineLearningTerm("term-2-1-explained-variance", "次元削減", "2-1-8", "Explained Variance Ratio", "エクスプレインド・ヴェアリアンス・レイシオ", "寄与率", "各主成分の固有値を全固有値の合計で割り、その成分が説明する分散の割合を表します。", "累積寄与率で採用する主成分数を決めます。", "主成分の係数そのものではなく、保持できる分散割合です。"),
  machineLearningTerm("term-2-1-sne", "次元削減", "2-1-8", "Stochastic Neighbor Embedding", "ストキャスティック・ネイバー・エンベディング", "SNE", "高次元と低次元で近傍確率が似るように配置する非線形次元削減法です。", "近傍確率を合わせる可視化手法です。", "t-SNEは低次元側へt分布を使いCrowding Problemを緩和します。"),
  machineLearningTerm("term-2-1-crowding", "次元削減", "2-1-8", "Crowding Problem", "クラウディング・プロブレム", "混雑問題", "高次元で近い多数点を低次元へ配置する十分な空間がなく、点が混み合う問題です。", "SNEからt-SNEへの改良理由として出ます。", "t-SNEでは裾の厚いt分布を低次元側へ使います。"),
  machineLearningTerm("term-2-1-tsne", "次元削減", "2-1-8", "t-SNE", "ティー・エスエヌイー", "t分布型確率的近傍埋め込み", "低次元側へ裾の厚いt分布を使い、局所的な近傍関係を可視化する非線形手法です。", "クラスタ可視化、t分布、Crowding Problemが手掛かりです。", "クラスタ間の距離や面積を定量的に解釈しすぎないよう注意します。"),

  machineLearningTerm("term-2-1-kmeans", "クラスタリング", "2-1-9", "k-means", "ケイ・ミーンズ", "k-means法", "各点を最も近い重心へ割り当て、重心更新を繰り返してクラスタ内二乗距離を小さくします。", "クラスタ数kを先に決め、重心と割当を反復します。", "初期値や外れ値に敏感で、球状クラスタを仮定しやすいです。"),
  machineLearningTerm("term-2-1-hierarchical", "クラスタリング", "2-1-9", "Hierarchical Clustering", "ハイアラーキカル・クラスタリング", "階層的クラスタリング", "近いクラスタを順に結合する凝集型などで、クラスタの階層構造を作ります。", "デンドログラム、結合法、クラスタ数を後から決められる点が手掛かりです。", "k-meansのような重心の反復更新を基本としません。"),
  machineLearningTerm("term-2-1-dendrogram", "クラスタリング", "2-1-9", "Dendrogram", "デンドログラム", "樹形図", "階層的クラスタリングで、クラスタがどの距離で結合されたかを木として表示します。", "横線の高さが結合距離を表す図です。", "枝の左右位置そのものには通常大きな意味はありません。"),
  machineLearningTerm("term-2-1-ward", "クラスタリング", "2-1-9", "Ward's Method", "ウォーズ・メソッド", "ウォード法", "クラスタを結合したときのクラスタ内平方和の増加が最小になる組を選びます。", "分散・平方和の増加を最小化する階層クラスタリングです。", "単純な最近距離や平均距離による結合とは異なります。"),
  machineLearningTerm("term-2-1-average-linkage", "クラスタリング", "2-1-9", "Average Linkage", "アベレージ・リンケージ", "群平均法", "2クラスタに属する全点対の距離平均をクラスタ間距離として結合します。", "全点対距離の平均が手掛かりです。", "最短距離の単連結法、最長距離の完全連結法と区別します。"),

  machineLearningTerm("term-2-1-generalization-error", "汎化・検証", "2-1-10", "Generalization Error", "ジェネラライゼーション・エラー", "汎化誤差", "未知の母集団データに対する期待誤差で、モデルの本当の予測性能を表します。", "テスト誤差は汎化誤差の推定値です。", "訓練誤差が低くても汎化誤差が低いとは限りません。"),
  machineLearningTerm("term-2-1-training-error", "汎化・検証", "2-1-10", "Training Error", "トレーニング・エラー", "訓練誤差", "学習に使ったデータ上で測った誤差です。", "学習データへの適合度を示します。", "モデル選択に訓練誤差だけを使うと過剰適合を見逃します。"),
  machineLearningTerm("term-2-1-bias", "汎化・検証", "2-1-10", "Bias", "バイアス", "バイアス", "学習アルゴリズムの平均予測と真の関数との差で、モデルの単純化による系統的誤差です。", "高バイアスは過少適合と結び付きます。", "統計的なデータ偏りという一般語と、バイアス・バリアンス分解の文脈を区別します。"),
  machineLearningTerm("term-2-1-variance", "汎化・検証", "2-1-10", "Variance", "ヴェアリアンス", "バリアンス", "学習データが変わったときに予測がどれだけ変動するかを表します。", "高バリアンスは過剰適合と結び付きます。", "確率変数の分散と同じ数学的考え方ですが、ここではモデル予測の変動です。"),
  machineLearningTerm("term-2-1-curse-dimensionality", "汎化・検証", "2-1-10", "Curse of Dimensionality", "カース・オブ・ディメンショナリティ", "次元の呪い", "次元が増えると空間が急激に疎になり、必要データ量や探索コストが増える問題です。", "距離差が小さくなる、近傍法が効きにくい、高次元空間が手掛かりです。", "特徴数を増やせば必ず性能が上がるわけではありません。"),
  machineLearningTerm("term-2-1-train-validation-test", "汎化・検証", "2-1-11", "Training / Validation / Test Set", "トレーニング／バリデーション／テスト・セット", "訓練・検証・テスト集合", "訓練は重み更新、検証はモデル選択、テストは最終評価へ使う独立データです。", "テスト集合は最後までモデル選択へ使わないのが原則です。", "検証結果を何度も見て調整すると検証集合へ過剰適合します。"),
  machineLearningTerm("term-2-1-holdout", "汎化・検証", "2-1-11", "Holdout Method", "ホールドアウト・メソッド", "ホールドアウト法", "データを一度だけ訓練用と評価用などへ分割する検証方法です。", "単純・高速ですが分割の偶然性を受けます。", "交差検証は複数の分割を入れ替えて評価します。"),
  machineLearningTerm("term-2-1-kfold", "汎化・検証", "2-1-11", "k-Fold Cross-Validation", "ケイフォールド・クロス・バリデーション", "k分割交差検証法", "データをk個へ分け、各部分を1回ずつ検証用にしてk回評価し平均します。", "全データが訓練と検証へ一度ずつ使われます。", "時系列データでは未来情報が混ざらない分割が必要です。"),

  machineLearningTerm("term-2-1-confusion-matrix", "性能指標", "2-1-12", "Confusion Matrix", "コンフュージョン・マトリックス", "混同行列", "正解クラスと予測クラスの組合せを表にし、TP・FP・FN・TNなどを集計します。", "分類指標の元になる表です。", "行と列のどちらが正解かは資料で異なるため軸ラベルを確認します。"),
  machineLearningTerm("term-2-1-accuracy", "性能指標", "2-1-12", "Accuracy", "アキュラシー", "正解率", "全予測のうち正解した割合です。", "(TP+TN)/全件です。", "クラス不均衡が大きいと多数クラスだけ当てても高くなる場合があります。"),
  machineLearningTerm("term-2-1-precision", "性能指標", "2-1-12", "Precision", "プレシジョン", "適合率", "陽性と予測したもののうち実際に陽性だった割合です。", "FPを減らしたい、誤検知を避けたい場合に重視します。", "Recallは実際の陽性をどれだけ拾ったかです。"),
  machineLearningTerm("term-2-1-recall", "性能指標", "2-1-12", "Recall", "リコール", "再現率", "実際に陽性のもののうち陽性と予測できた割合です。", "FNを減らしたい、見逃しを避けたい場合に重視します。", "Precisionは陽性予測の正しさです。"),
  machineLearningTerm("term-2-1-f1", "性能指標", "2-1-12", "F1 Score", "エフワン・スコア", "F値", "PrecisionとRecallの調和平均で、両者のバランスを1つの値で表します。", "2PR/(P+R)です。", "単純な算術平均ではなく調和平均です。"),
  machineLearningTerm("term-2-1-roc", "性能指標", "2-1-12", "ROC Curve", "アールオーシー・カーブ", "ROC曲線", "分類しきい値を変えたときの偽陽性率FPRと真陽性率TPRの関係を描きます。", "横軸FPR、縦軸TPRです。", "Precision-Recall曲線とは軸が異なります。"),
  machineLearningTerm("term-2-1-auc", "性能指標", "2-1-12", "Area Under the Curve", "エリア・アンダー・ザ・カーブ", "AUC", "ROC曲線などの下側面積で、しきい値に依存しない順位性能を表します。", "ROC-AUCでは1に近いほど良く、ランダムはおよそ0.5です。", "Accuracyのように特定しきい値での正答割合ではありません。"),
  machineLearningTerm("term-2-1-iou", "性能指標", "2-1-12", "Intersection over Union", "インターセクション・オーバー・ユニオン", "IoU", "予測領域と正解領域の共通部分を和集合で割った重なり指標です。", "物体検出・セグメンテーション、交差/和集合が手掛かりです。", "単純な正解画素率ではなく領域の重なりを測ります。"),
  machineLearningTerm("term-2-1-map", "性能指標", "2-1-12", "mean Average Precision", "ミーン・アベレージ・プレシジョン", "mAP", "クラスごとのAverage Precisionを平均した物体検出などの代表指標です。", "複数クラス、Precision-Recall、IoUしきい値が手掛かりです。", "実装やデータセットによりIoUしきい値の定義が異なります。"),
  machineLearningTerm("term-2-1-micro", "性能指標", "2-1-12", "Micro Average", "マイクロ・アベレージ", "micro平均", "全クラスのTP・FP・FNを先に合計してから指標を計算します。", "件数の多いクラスの影響が大きくなります。", "macro平均はクラスごとの指標を等重みで平均します。"),
  machineLearningTerm("term-2-1-macro", "性能指標", "2-1-12", "Macro Average", "マクロ・アベレージ", "macro平均", "クラスごとに指標を計算し、クラスを等重みで平均します。", "少数クラスも多数クラスと同じ1票を持ちます。", "クラス件数の偏りをそのまま反映するmicro平均と区別します。"),
  machineLearningTerm("term-2-1-rmse", "性能指標", "2-1-12", "Root Mean Squared Error", "ルート・ミーン・スクエアド・エラー", "RMSE", "予測誤差を二乗平均して平方根を取り、目的変数と同じ単位へ戻した回帰指標です。", "大きな誤差へ強い罰、MSEの平方根が手掛かりです。", "MAEより外れ値の影響を受けやすいです。"),
  machineLearningTerm("term-2-1-mse", "性能指標", "2-1-12", "Mean Squared Error", "ミーン・スクエアド・エラー", "MSE", "予測値と正解値の差を二乗して平均した回帰指標です。", "二乗により大きな誤差を強く罰します。", "単位は目的変数の単位の二乗になります。"),
  machineLearningTerm("term-2-1-mae", "性能指標", "2-1-12", "Mean Absolute Error", "ミーン・アブソリュート・エラー", "MAE", "予測値と正解値の差の絶対値を平均した回帰指標です。", "誤差の絶対値、目的変数と同じ単位です。", "MSEより外れ値の影響が比較的小さくなります。"),
  machineLearningTerm("term-2-1-perplexity", "性能指標", "2-1-12", "Perplexity", "パープレキシティ", "パープレキシティ", "言語モデルが次トークン候補にどれだけ迷っているかを、平均負対数尤度の指数で表します。", "低いほどモデルが正解系列へ高い確率を与えています。", "語彙分割やデータセットが違うモデル間では単純比較しにくいです。")
];

const MACHINE_LEARNING_FORMULA_CARDS = [
  machineLearningFormula("formula-2-1-euclidean", "パターン認識・距離", "2-1-2", "ユークリッド距離", "d(x,y)=√Σᵢ(xᵢ−yᵢ)²", "エックスとワイの距離は、各成分の差の二乗を足して平方根", "2点を結ぶ直線距離です。", "二乗して足し、最後にルート", "x=(0,0), y=(3,4)ならd=5", "iは特徴の番号", "標準化せず尺度の違う特徴を混ぜると結果が偏ります。"),
  machineLearningFormula("formula-2-1-manhattan", "パターン認識・距離", "2-1-2", "マンハッタン距離", "d(x,y)=Σᵢ|xᵢ−yᵢ|", "各成分の差の絶対値を全部足す", "格子上を縦横に移動する距離です。", "絶対値を足すだけ", "(0,0)と(3,4)なら7", "iは特徴の番号", "平方根や二乗は使いません。"),
  machineLearningFormula("formula-2-1-lp", "パターン認識・距離", "2-1-2", "Lp距離", "dₚ(x,y)=(Σᵢ|xᵢ−yᵢ|ᵖ)^(1/p)", "差の絶対値をピー乗して足し、全体をピー分の一乗", "L1・L2距離を含む一般形です。", "p=1はマンハッタン、p=2はユークリッド", "p=2なら通常の直線距離", "pは1以上の値", "pの指定を見落とさないようにします。"),
  machineLearningFormula("formula-2-1-cosine", "パターン認識・距離", "2-1-2", "コサイン距離", "d_cos(x,y)=1−(x·y)/(||x||||y||)", "一引く、エックスとワイの内積を、それぞれの長さの積で割ったもの", "ベクトルの方向差を測ります。", "類似度を1から引く", "同じ向きなら類似度1、距離0", "||x||はベクトルのL2ノルム", "ゼロベクトルでは分母が0になります。"),
  machineLearningFormula("formula-2-1-mahalanobis", "パターン認識・距離", "2-1-2", "マハラノビス距離", "d(x,y)=√((x−y)ᵀΣ⁻¹(x−y))", "差ベクトル転置、共分散行列の逆、差ベクトルを掛けて平方根", "分散と相関を補正した距離です。", "共分散の逆で尺度と相関を補正", "相関した特徴を二重に数えにくくする", "Σは共分散行列", "共分散行列が特異だと逆行列を直接求められません。"),
  machineLearningFormula("formula-2-1-linear", "回帰・正則化", "2-1-4", "線形回帰の予測", "ŷ=wᵀx+b", "ワイ・ハットは、ダブリュー転置掛けるエックス足すビー", "特徴の重み付き和と切片で予測します。", "重み掛ける特徴を足して切片", "x=(2,3), w=(1,4), b=1ならŷ=15", "wは係数、bは切片", "入力と重みの次元を一致させます。"),
  machineLearningFormula("formula-2-1-least-squares", "回帰・正則化", "2-1-4", "最小二乗目的関数", "min_w Σᵢ(yᵢ−ŷᵢ)²", "ダブリューについて、正解と予測の差の二乗和を最小にする", "残差二乗和が最小の係数を求めます。", "残差を二乗して全部足す", "誤差2と−2はどちらも4として数える", "iはデータ番号", "外れ値の大きな誤差が二乗で強く効きます。"),
  machineLearningFormula("formula-2-1-lasso", "回帰・正則化", "2-1-4", "Lasso回帰", "min_w L(w)+λΣⱼ|wⱼ|", "損失に、ラムダ掛ける重みの絶対値和を加えて最小化", "L1罰則で係数を疎にします。", "絶対値は0を作りやすい", "不要特徴の係数が0になることがある", "λは正則化強度", "λを大きくしすぎると過少適合します。"),
  machineLearningFormula("formula-2-1-ridge", "回帰・正則化", "2-1-4", "Ridge回帰", "min_w L(w)+λΣⱼwⱼ²", "損失に、ラムダ掛ける重みの二乗和を加えて最小化", "L2罰則で大きな係数を抑えます。", "二乗で滑らかに縮める", "相関した特徴の係数を安定化する", "λは正則化強度", "切片を正則化対象へ含めるかは実装で確認します。"),
  machineLearningFormula("formula-2-1-correlation", "回帰・正則化", "2-1-4", "Pearson相関係数", "r=Cov(X,Y)/(σ_Xσ_Y)", "エックスとワイの共分散を、両方の標準偏差の積で割る", "線形な共変動を尺度に依存しない−1から1へ正規化します。", "共分散を標準偏差で割る", "完全な正の直線関係なら1", "σは標準偏差", "相関0でも非線形関係が存在する場合があります。"),
  machineLearningFormula("formula-2-1-sigmoid", "ロジスティック回帰", "2-1-5", "シグモイド関数", "σ(z)=1/(1+e^(−z))", "シグマ・ゼットは、一を、一足すイーのマイナスゼット乗で割る", "実数を0から1の確率へ写します。", "ゼット0なら0.5", "z=0でσ=0.5", "zは線形結合", "大きな正負領域では勾配が小さくなります。"),
  machineLearningFormula("formula-2-1-logit", "ロジスティック回帰", "2-1-5", "ロジット", "logit(p)=log(p/(1−p))", "ピーのロジットは、ピーを一引くピーで割った値の対数", "確率を実数全体の対数オッズへ変換します。", "確率→オッズ→対数", "p=0.5ならlogit=0", "0<p<1", "p=0や1では無限大方向へ発散します。"),
  machineLearningFormula("formula-2-1-odds", "ロジスティック回帰", "2-1-5", "オッズ", "odds=p/(1−p)", "オッズは、起こる確率を起こらない確率で割る", "事象が起こる見込みと起こらない見込みの比です。", "確率0.5でオッズ1", "p=0.8ならodds=4", "pは事象確率", "確率0.8をオッズ0.8としないようにします。"),
  machineLearningFormula("formula-2-1-odds-ratio", "ロジスティック回帰", "2-1-5", "オッズ比", "OR=odds₁/odds₀=e^β", "オッズ比は二群のオッズの比、ロジスティック係数ではイーのベータ乗", "説明変数1単位変化によるオッズの倍率を表します。", "係数を指数化するとオッズ倍率", "β=log2ならOR=2", "βはロジスティック回帰係数", "オッズ比2を確率が2倍とそのまま解釈しません。"),
  machineLearningFormula("formula-2-1-softmax", "ロジスティック回帰", "2-1-5", "ソフトマックス関数", "p_k=e^{z_k}/Σⱼe^{z_j}", "クラスケーの確率は、イーのロジットケー乗を、全クラスの指数和で割る", "複数ロジットを合計1の確率へ変換します。", "指数化して全体で割る", "ロジット全体へ同じ定数を足しても確率は変わらない", "kはクラス番号", "数値安定化のため最大ロジットを引く実装が一般的です。"),
  machineLearningFormula("formula-2-1-svm-margin", "サポートベクターマシン", "2-1-6", "SVMのマージン", "margin=2/||w||", "マージン幅は、二を重みベクトルの長さで割る", "正規化された2本の境界間の幅で、||w||を小さくすると広がります。", "重みの長さを小さくしてマージンを広げる", "||w||=2なら幅1", "wは分離超平面の法線", "定義により片側マージン1/||w||と表す場合があります。"),
  machineLearningFormula("formula-2-1-soft-margin", "サポートベクターマシン", "2-1-6", "ソフトマージンSVM", "min 1/2||w||²+CΣᵢξᵢ", "重み二乗の半分と、シー掛けるスラック変数の和を最小化", "広いマージンと違反罰則の折り合いを付けます。", "Cは違反への厳しさ", "C大で誤分類を強く罰する", "ξはマージン違反量", "Cが大きいほど必ず汎化性能が高いとは限りません。"),
  machineLearningFormula("formula-2-1-gini", "決定木・アンサンブル", "2-1-7", "Gini不純度", "Gini=1−Σₖpₖ²", "一引く、各クラス確率の二乗和", "ノード内のクラス混在度を表します。", "1クラスだけなら0", "2クラスが半々なら0.5", "p_kはノード内のクラス割合", "所得格差のGini係数と混同しないようにします。"),
  machineLearningFormula("formula-2-1-explained-variance", "次元削減", "2-1-8", "主成分の寄与率", "r_k=λ_k/Σⱼλ_j", "ケー番目の寄与率は、その固有値を全固有値の和で割る", "各主成分が説明する分散割合です。", "固有値の割合", "固有値が5,3,2なら第1成分は0.5", "λ_kは第k主成分の固有値", "主成分ベクトルの各係数とは別の量です。"),
  machineLearningFormula("formula-2-1-kmeans", "クラスタリング", "2-1-9", "k-means目的関数", "J=Σᵢ||xᵢ−μ_{cᵢ}||²", "各データと所属クラスタ重心の距離二乗を全部足す", "クラスタ内平方和を最小化します。", "点を近い重心へ、重心を点の平均へ", "各クラスタの点が重心へ集まるほど小さい", "μは重心、c_iは所属クラスタ", "局所最適解へ収束するため初期値で結果が変わります。"),
  machineLearningFormula("formula-2-1-accuracy", "性能指標", "2-1-12", "Accuracy", "Accuracy=(TP+TN)/(TP+TN+FP+FN)", "真陽性と真陰性を、全件数で割る", "全体の正解割合です。", "正解を全部足して全件で割る", "90件正解/100件なら0.9", "TP/TN/FP/FNは混同行列要素", "不均衡データでは高Accuracyだけで判断しません。"),
  machineLearningFormula("formula-2-1-precision", "性能指標", "2-1-12", "Precision", "Precision=TP/(TP+FP)", "真陽性を、陽性と予測した全件で割る", "陽性予測の正しさです。", "予測陽性を分母にする", "TP=8, FP=2なら0.8", "FPは誤検知", "Recallの分母は実際の陽性です。"),
  machineLearningFormula("formula-2-1-recall", "性能指標", "2-1-12", "Recall", "Recall=TP/(TP+FN)", "真陽性を、実際に陽性の全件で割る", "実陽性を拾えた割合です。", "実際陽性を分母にする", "TP=8, FN=2なら0.8", "FNは見逃し", "Precisionの分母は予測陽性です。"),
  machineLearningFormula("formula-2-1-f1", "性能指標", "2-1-12", "F1 Score", "F1=2PR/(P+R)", "二掛けるプレシジョン掛けるリコールを、その和で割る", "PrecisionとRecallの調和平均です。", "低い方へ強く引かれる平均", "P=1,R=0.5ならF1≈0.67", "PはPrecision、RはRecall", "PとRの単純平均ではありません。"),
  machineLearningFormula("formula-2-1-iou", "性能指標", "2-1-12", "IoU", "IoU=|Prediction∩Truth|/|Prediction∪Truth|", "予測と正解の共通部分を、和集合で割る", "領域の重なり度合いです。", "交差を和で割る", "共通60、和100なら0.6", "分子は共通領域、分母は重複を二重計上しない和集合", "共通部分を予測面積だけで割るPrecisionとは異なります。"),
  machineLearningFormula("formula-2-1-mse", "性能指標", "2-1-12", "MSE", "MSE=(1/n)Σᵢ(yᵢ−ŷᵢ)²", "正解と予測の差を二乗して足し、件数で割る", "平均二乗誤差です。", "大きな誤差を強く罰する", "誤差1と3ならMSE=(1+9)/2=5", "nは件数", "目的変数と単位が二乗になる点に注意します。"),
  machineLearningFormula("formula-2-1-rmse", "性能指標", "2-1-12", "RMSE", "RMSE=√((1/n)Σᵢ(yᵢ−ŷᵢ)²)", "平均二乗誤差の平方根", "MSEを元の単位へ戻した指標です。", "二乗平均して最後にルート", "MSE=9ならRMSE=3", "nは件数", "誤差を先に平均してから平方根を取ります。"),
  machineLearningFormula("formula-2-1-mae", "性能指標", "2-1-12", "MAE", "MAE=(1/n)Σᵢ|yᵢ−ŷᵢ|", "正解と予測の差の絶対値を足し、件数で割る", "平均絶対誤差です。", "絶対値の平均", "誤差1と3ならMAE=2", "nは件数", "二乗しないためMSEより外れ値への罰が弱いです。"),
  machineLearningFormula("formula-2-1-perplexity", "性能指標", "2-1-12", "Perplexity", "PPL=exp(−(1/N)Σₜlog p(wₜ|w_{<t}))", "各正解トークンの対数確率の負平均を取り、その指数", "言語モデルの平均的な迷いの大きさです。", "平均クロスエントロピーを指数へ戻す", "全候補へ均等に4分の1ならPPL=4", "Nはトークン数", "低いほど良いですが異なるトークナイザ間の単純比較は避けます。")
];

const MACHINE_LEARNING_COMPARE_CARDS = [
  machineLearningCompare("compare-2-1-nn-knn", "パターン認識・距離", "2-1-1", {t:"Nearest Neighbor",k:"ニアレスト・ネイバー",j:"最も近い1件",d:"局所変動へ敏感"}, {t:"k-NN",k:"ケイ・ニアレスト・ネイバーズ",j:"近いk件",d:"多数決・平均で平滑化"}, "1件だけなら最近傍法、k件を集約するならk近傍法です。"),
  machineLearningCompare("compare-2-1-euclidean-cosine", "パターン認識・距離", "2-1-2", {t:"Euclidean",k:"ユークリディアン",j:"位置の直線距離",d:"大きさと方向の両方"}, {t:"Cosine",k:"コサイン",j:"ベクトルの向き",d:"長さの影響を正規化"}, "座標の離れ具合ならEuclidean、文書や埋め込みの方向ならCosineです。"),
  machineLearningCompare("compare-2-1-manhattan-mahalanobis", "パターン認識・距離", "2-1-2", {t:"Manhattan",k:"マンハッタン",j:"絶対差の和",d:"L1距離"}, {t:"Mahalanobis",k:"マハラノビス",j:"分散・相関を補正",d:"共分散逆行列"}, "絶対値を足すだけならManhattan、共分散行列があればMahalanobisです。"),
  machineLearningCompare("compare-2-1-supervised-unsupervised", "学習の分類", "2-1-3", {t:"Supervised",k:"スーパーバイズド",j:"正解ラベルあり",d:"回帰・分類"}, {t:"Unsupervised",k:"アンスーパーバイズド",j:"正解ラベルなし",d:"クラスタ・次元削減"}, "目的変数を使うなら教師あり、データ構造を探すなら教師なしです。"),
  machineLearningCompare("compare-2-1-lasso-ridge", "回帰・正則化", "2-1-4", {t:"Lasso",k:"ラッソ",j:"L1正則化",d:"係数を0にしやすい"}, {t:"Ridge",k:"リッジ",j:"L2正則化",d:"係数を滑らかに縮小"}, "特徴選択・疎性ならLasso、多重共線性を安定化し全特徴を残すならRidgeです。"),
  machineLearningCompare("compare-2-1-under-over", "回帰・正則化", "2-1-4", {t:"Underfitting",k:"アンダーフィッティング",j:"訓練にも合わない",d:"高バイアス"}, {t:"Overfitting",k:"オーバーフィッティング",j:"訓練だけ良い",d:"高バリアンス"}, "訓練・検証とも悪ければ過少、訓練だけ良く検証が悪ければ過剰です。"),
  machineLearningCompare("compare-2-1-linear-logistic", "ロジスティック回帰", "2-1-5", {t:"Linear Regression",k:"リニア・リグレッション",j:"連続値を予測",d:"重み付き和をそのまま出力"}, {t:"Logistic Regression",k:"ロジスティック・リグレッション",j:"クラス確率を予測",d:"Sigmoid・Logit"}, "連続値なら線形回帰、2値確率ならロジスティック回帰です。"),
  machineLearningCompare("compare-2-1-sigmoid-softmax", "ロジスティック回帰", "2-1-5", {t:"Sigmoid",k:"シグモイド",j:"各出力を独立に0～1",d:"2値・マルチラベル"}, {t:"Softmax",k:"ソフトマックス",j:"全クラス合計1",d:"多クラス単一ラベル"}, "複数ラベルを同時に許すならSigmoid、1クラスだけ選ぶならSoftmaxです。"),
  machineLearningCompare("compare-2-1-hard-soft-margin", "サポートベクターマシン", "2-1-6", {t:"Hard Margin",k:"ハード・マージン",j:"違反を許さない",d:"完全分離が必要"}, {t:"Soft Margin",k:"ソフト・マージン",j:"違反を許容",d:"スラック変数とC"}, "誤分類ゼロ制約ならHard、ノイズを考慮して罰則調整するならSoftです。"),
  machineLearningCompare("compare-2-1-linear-kernel-svm", "サポートベクターマシン", "2-1-6", {t:"Linear SVM",k:"リニア・エスブイエム",j:"元空間で線形境界",d:"高速・解釈しやすい"}, {t:"Kernel SVM",k:"カーネル・エスブイエム",j:"高次元で非線形境界",d:"RBF・多項式"}, "線形分離ならLinear、カーネルトリックで曲線境界を作るならKernelです。"),
  machineLearningCompare("compare-2-1-bagging-boosting", "決定木・アンサンブル", "2-1-7", {t:"Bagging",k:"バギング",j:"独立・並列",d:"Bootstrapで分散低減"}, {t:"Boosting",k:"ブースティング",j:"逐次・依存",d:"前段の誤りを修正"}, "並列に平均するならBagging、前モデルの弱点を順に直すならBoostingです。"),
  machineLearningCompare("compare-2-1-rf-gb", "決定木・アンサンブル", "2-1-7", {t:"Random Forest",k:"ランダム・フォレスト",j:"Bagging系",d:"多数の独立木と特徴サンプリング"}, {t:"Gradient Boosting",k:"グラディエント・ブースティング",j:"Boosting系",d:"残差へ木を逐次追加"}, "独立木の平均ならRandom Forest、残差を順に学ぶならGradient Boostingです。"),
  machineLearningCompare("compare-2-1-pca-tsne", "次元削減", "2-1-8", {t:"PCA",k:"ピーシーエー",j:"線形・分散最大",d:"主成分と寄与率"}, {t:"t-SNE",k:"ティー・エスエヌイー",j:"非線形・局所近傍",d:"可視化向け"}, "再現可能な線形圧縮ならPCA、局所構造の2D可視化ならt-SNEです。"),
  machineLearningCompare("compare-2-1-kmeans-hierarchical", "クラスタリング", "2-1-9", {t:"k-means",k:"ケイ・ミーンズ",j:"kを先に指定",d:"重心を反復更新"}, {t:"Hierarchical",k:"ハイアラーキカル",j:"階層を構築",d:"デンドログラムで後から切る"}, "重心と割当を反復するならk-means、樹形図を作るなら階層法です。"),
  machineLearningCompare("compare-2-1-bias-variance", "汎化・検証", "2-1-10", {t:"High Bias",k:"ハイ・バイアス",j:"モデルが単純",d:"訓練・検証とも誤差大"}, {t:"High Variance",k:"ハイ・ヴェアリアンス",j:"データへ敏感",d:"訓練小・検証大"}, "両方悪いならBias、訓練と検証の差が大きいならVarianceを疑います。"),
  machineLearningCompare("compare-2-1-holdout-kfold", "汎化・検証", "2-1-11", {t:"Holdout",k:"ホールドアウト",j:"一度だけ分割",d:"高速だが分割依存"}, {t:"k-Fold CV",k:"ケイフォールド",j:"k回入替評価",d:"安定するが計算増"}, "1回分割ならHoldout、各部分を順に検証へ使うならk-Foldです。"),
  machineLearningCompare("compare-2-1-precision-recall", "性能指標", "2-1-12", {t:"Precision",k:"プレシジョン",j:"陽性予測の正しさ",d:"FPを嫌う"}, {t:"Recall",k:"リコール",j:"実陽性の捕捉率",d:"FNを嫌う"}, "誤検知を避けるならPrecision、見逃しを避けるならRecallです。"),
  machineLearningCompare("compare-2-1-micro-macro", "性能指標", "2-1-12", {t:"Micro Average",k:"マイクロ・アベレージ",j:"全件をまとめて集計",d:"多数クラスの影響大"}, {t:"Macro Average",k:"マクロ・アベレージ",j:"クラスごとに平均",d:"各クラスを等重み"}, "件数ベースで集計するならmicro、少数クラスも同じ重みならmacroです。"),
  machineLearningCompare("compare-2-1-mse-mae", "性能指標", "2-1-12", {t:"MSE / RMSE",k:"エムエスイー／アールエムエスイー",j:"誤差を二乗",d:"大外れを強く罰する"}, {t:"MAE",k:"エムエーイー",j:"誤差の絶対値",d:"外れ値に比較的頑健"}, "大きな誤差を強く重視するならMSE系、典型的な誤差幅ならMAEです。"),
  machineLearningCompare("compare-2-1-accuracy-auc", "性能指標", "2-1-12", {t:"Accuracy",k:"アキュラシー",j:"特定しきい値の正解率",d:"不均衡に弱い"}, {t:"ROC-AUC",k:"アールオーシー・エーユーシー",j:"しきい値横断の順位性能",d:"曲線下面積"}, "決めたしきい値での正答割合はAccuracy、しきい値全体の識別順位はAUCです。")
];

TERMS.push(...MACHINE_LEARNING_TERM_CARDS);
FORMULAS.push(...MACHINE_LEARNING_FORMULA_CARDS);
COMPARES.push(...MACHINE_LEARNING_COMPARE_CARDS);
