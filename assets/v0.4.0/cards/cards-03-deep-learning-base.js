"use strict";

const DEEP_LEARNING_BASE_CARDS_VERSION = "v0.4.0-dev.7";

function deepLearningBaseTerm(id, group, syllabusId, en, kana, ja, desc, examCue, confusion, atlasId) {
  return {
    id, type: "term", major: "3. 深層学習の基礎", group, syllabusId,
    en, kana, ja, desc, examCue, confusion: confusion || "",
    atlasId: atlasId || "", questionIds: [], scope: "syllabus"
  };
}

function deepLearningBaseFormula(id, group, syllabusId, name, fx, yomi, imi, oboe, rei, variables, mistake, atlasId) {
  return {
    id, type: "formula", major: "3. 深層学習の基礎", group, syllabusId,
    name, fx, yomi, imi, oboe, rei, variables, mistake,
    atlasId: atlasId || "", questionIds: [], scope: "syllabus"
  };
}

function deepLearningBaseCompare(id, group, syllabusId, left, right, key, atlasId) {
  return {
    id, type: "compare", major: "3. 深層学習の基礎", group, syllabusId,
    l: left, r: right, key, atlasId: atlasId || "", questionIds: [], scope: "syllabus"
  };
}

const DEEP_LEARNING_BASE_TERM_CARDS = [
  deepLearningBaseTerm("term-3-1-mlp", "順伝播型ネットワーク", "3-1-1", "Multi-Layer Perceptron", "マルチレイヤー・パーセプトロン", "多層パーセプトロン", "全結合層と非線形活性化を複数段重ね、入力から出力へ一方向に情報を伝えるネットワークです。", "全結合層を重ねた順伝播型ネットワークならMLPです。", "単層パーセプトロンだけではXORのような非線形分離を表現できません。"),
  deepLearningBaseTerm("term-3-1-fully-connected", "順伝播型ネットワーク", "3-1-1", "Fully Connected Layer", "フーリー・コネクテッド・レイヤー", "全結合層", "前の層の全ユニットと次の層の全ユニットを重み付きで接続する層です。", "入力を平坦化して重み行列と掛ける説明が手掛かりです。", "畳み込み層のような局所接続や重み共有は行いません。"),
  deepLearningBaseTerm("term-3-1-weight-bias", "順伝播型ネットワーク", "3-1-1", "Weights and Biases", "ウェイツ・アンド・バイアシズ", "重みとバイアス", "重みは入力の影響度、バイアスは活性化のしきい値や平行移動を調整する学習パラメータです。", "Wx+bのWが重み、bがバイアスです。", "機械学習一般のbiasと、ニューラルネットのバイアス項を混同しないようにします。"),
  deepLearningBaseTerm("term-3-1-forward", "順伝播型ネットワーク", "3-1-1", "Forward Propagation", "フォワード・プロパゲーション", "順伝播", "入力から各層の線形変換と活性化を順に計算し、予測値と損失を得る処理です。", "入力から出力へ進む計算が順伝播、損失から勾配を戻す処理が逆伝播です。", "学習時だけでなく推論時にも順伝播を使います。"),
  deepLearningBaseTerm("term-3-1-output-logit", "順伝播型ネットワーク", "3-1-2", "Output Layer and Logits", "アウトプット・レイヤー・アンド・ロジッツ", "出力層とロジット", "ロジットはSigmoidやSoftmaxへ入れる前の未正規化スコアで、出力層は課題に合わせて予測形式へ変換します。", "確率化前のスコアがlogitです。回帰は線形出力、分類はSigmoidやSoftmaxが典型です。", "ロジットを確率とみなさず、活性化後の値と区別します。"),
  deepLearningBaseTerm("term-3-1-loss", "順伝播型ネットワーク", "3-1-2", "Loss Function", "ロス・ファンクション", "損失関数", "予測と正解のずれを単一の値にまとめ、学習で最小化する目的関数です。", "回帰ではMSEやMAE、分類ではCross Entropyが代表です。", "訓練損失の低下が、そのまま未知データの性能を保証するわけではありません。"),
  deepLearningBaseTerm("term-3-1-regression-loss", "順伝播型ネットワーク", "3-1-2", "MSE and MAE", "エムエスイー・アンド・エムエーイー", "平均二乗誤差と平均絶対誤差", "MSEは誤差を二乗して大きな外れを強く罰し、MAEは絶対値を使って外れ値の影響を比較的抑えます。", "二乗ならMSE、絶対値ならMAEです。", "RMSEはMSEの平方根で、目的変数と同じ単位へ戻します。"),
  deepLearningBaseTerm("term-3-1-classification-loss", "順伝播型ネットワーク", "3-1-3", "Binary and Categorical Cross Entropy", "バイナリー・アンド・カテゴリカル・クロス・エントロピー", "二値・多クラス交差エントロピー", "二値分類やマルチラベルにはBCE、多クラス単一ラベルにはSoftmaxとCategorical Cross Entropyを使います。", "Sigmoid+BCEか、Softmax+多クラスCross Entropyかを見分けます。", "確率にlogを取るため、実装では数値安定化されたlogits版を使うことがあります。"),
  deepLearningBaseTerm("term-3-1-one-hot", "順伝播型ネットワーク", "3-1-3", "One-Hot Vector", "ワンホット・ベクター", "one-hotベクトル", "正解クラスの要素だけを1、他を0にしたカテゴリ表現です。", "多クラス分類の正解ラベル表現として頻出します。", "クラス間の順序や距離は表現しません。"),
  deepLearningBaseTerm("term-3-1-multilabel-ordinal", "順伝播型ネットワーク", "3-1-3", "Multi-Label Classification and Ordinal Regression", "マルチラベル・クラシフィケーション・アンド・オーディナル・リグレッション", "マルチラベル分類と順序回帰", "マルチラベル分類は複数ラベルを同時に許し、順序回帰は大小関係を持つカテゴリを予測します。", "複数クラス同時成立ならSigmoid、段階評価など順序があるならOrdinal Regressionです。", "多クラス単一ラベル分類とは出力制約が異なります。"),
  deepLearningBaseTerm("term-3-1-sigmoid", "活性化関数", "3-1-4", "Sigmoid Function", "シグモイド・ファンクション", "シグモイド関数", "実数を0から1へ写し、二値分類の確率やゲート値に使われます。", "出力0〜1、z=0で0.5、二値分類やLSTMゲートが手掛かりです。", "絶対値の大きい入力では飽和して勾配が小さくなります。"),
  deepLearningBaseTerm("term-3-1-temperature", "活性化関数", "3-1-4", "Temperature Parameter", "テンパラチャー・パラメーター", "温度パラメータ", "Softmaxのロジットを温度Tで割り、出力分布の鋭さを調整します。", "Tが高いほど平坦、低いほど最大クラスへ集中します。", "温度を上げると確率がより確信的になる、という逆理解に注意します。"),
  deepLearningBaseTerm("term-3-1-relu", "活性化関数", "3-1-4", "Rectified Linear Unit", "レクティファイド・リニア・ユニット", "ReLU", "入力が正ならそのまま、負なら0を返す活性化関数です。", "max(0,x)という区分線形関数がReLUです。", "負領域で勾配0が続くとDying ReLUが起こります。"),
  deepLearningBaseTerm("term-3-1-leaky-relu", "活性化関数", "3-1-4", "Leaky ReLU", "リーキー・レルー", "Leaky ReLU", "負の入力にも小さな傾きを残し、Dying ReLUを緩和します。", "負側が完全な0ではなくαxになる点がReLUとの違いです。", "αを学習するPReLUとは区別します。"),
  deepLearningBaseTerm("term-3-1-gelu", "活性化関数", "3-1-4", "Gaussian Error Linear Unit", "ガウシアン・エラー・リニア・ユニット", "GELU", "入力を確率的なゲートのように滑らかに通す活性化で、Transformer系で広く使われます。", "Transformer、滑らかなReLU類似関数が手掛かりです。", "ReLUのように負値を必ず0へ切り捨てません。", "transformer"),
  deepLearningBaseTerm("term-3-1-tanh", "活性化関数", "3-1-4", "Hyperbolic Tangent", "ハイパボリック・タンジェント", "tanh・双曲線正接", "実数を−1から1へ写す中心化されたS字型活性化関数です。", "出力範囲−1〜1で、RNNの候補状態などに使われます。", "Sigmoidと同様に大きな正負入力で飽和します。"),

  deepLearningBaseTerm("term-3-2-learning-rate", "最適化・誤差逆伝播", "3-2-1", "Learning Rate", "ラーニング・レート", "学習率", "勾配に沿ってパラメータを1回にどれだけ更新するかを決めます。", "大きすぎると発散、小さすぎると学習が遅く停滞しやすくなります。", "学習率はモデルの重みそのものではなく更新幅の係数です。"),
  deepLearningBaseTerm("term-3-2-gradient-descent", "最適化・誤差逆伝播", "3-2-1", "Gradient Descent", "グラディエント・ディセント", "勾配降下法・最急降下法", "損失が最も増える勾配と反対方向へパラメータを更新します。", "θ←θ−η∇Lが基本形です。", "全データ勾配、確率的勾配、ミニバッチ勾配を区別します。"),
  deepLearningBaseTerm("term-3-2-minibatch", "最適化・誤差逆伝播", "3-2-1", "Mini-Batch, Batch Size and Epoch", "ミニバッチ・バッチサイズ・アンド・エポック", "ミニバッチ・バッチサイズ・エポック", "データの一部を1更新に使う集合がミニバッチ、その件数がバッチサイズ、全訓練データを一巡する単位がエポックです。", "更新回数とデータ一巡を混同しないことが重要です。", "1 epoch内に複数iterationが存在します。"),
  deepLearningBaseTerm("term-3-2-pathological-curvature", "最適化・誤差逆伝播", "3-2-1", "Pathological Curvature", "パソロジカル・カーバチャー", "病的曲率", "方向によって損失面の曲率が大きく異なり、単純な勾配降下が谷をジグザグに進む状態です。", "細長い谷、振動、Momentumで改善という説明が手掛かりです。", "局所最適だけを指す言葉ではありません。"),
  deepLearningBaseTerm("term-3-2-momentum", "最適化・誤差逆伝播", "3-2-1", "Momentum", "モメンタム", "Momentum", "過去の更新方向を速度として蓄積し、同じ方向を加速しながら振動を抑えます。", "慣性・速度変数・病的曲率の谷で前進が手掛かりです。", "現在の勾配だけで更新する通常SGDと区別します。"),
  deepLearningBaseTerm("term-3-2-nesterov", "最適化・誤差逆伝播", "3-2-1", "Nesterov Accelerated Gradient", "ネステロフ・アクセラレーテッド・グラディエント", "Nesterovの加速勾配法", "Momentumで先に進む位置を見越して勾配を評価し、行き過ぎを補正します。", "look-ahead位置で勾配を計算する点がMomentumとの違いです。", "単にMomentum係数を大きくした手法ではありません。"),
  deepLearningBaseTerm("term-3-2-backprop", "最適化・誤差逆伝播", "3-2-2", "Backpropagation", "バックプロパゲーション", "誤差逆伝播法", "出力側の損失勾配を連鎖律で入力側へ戻し、各パラメータの偏微分を効率よく求めます。", "損失から後ろ向きに局所微分を掛け合わせます。", "最適化アルゴリズムそのものではなく、勾配を計算する方法です。"),
  deepLearningBaseTerm("term-3-2-chain-delta", "最適化・誤差逆伝播", "3-2-2", "Chain Rule and Delta", "チェーン・ルール・アンド・デルタ", "連鎖律とデルタ", "合成関数の微分を局所微分の積へ分解し、各層へ伝わる誤差信号をデルタとして表します。", "計算グラフの分岐では勾配を足し、直列では掛けます。", "デルタは有限差分のΔとは文脈が異なる場合があります。"),
  deepLearningBaseTerm("term-3-2-autodiff", "最適化・誤差逆伝播", "3-2-2", "Automatic Differentiation", "オートマチック・ディファレンシエーション", "自動微分", "基本演算の微分規則と計算グラフを使い、数式を手で展開せず正確な導関数を計算します。", "深層学習の逆モード自動微分は出力が少なくパラメータが多い場合に効率的です。", "数値微分の近似や数式処理による記号微分とは異なります。"),
  deepLearningBaseTerm("term-3-2-computational-graph", "最適化・誤差逆伝播", "3-2-2", "Computational Graph", "コンピュテーショナル・グラフ", "計算グラフ", "演算をノード、データ依存を辺として表し、順伝播値と逆伝播勾配を管理します。", "分岐・合流を持つ演算グラフと局所微分が手掛かりです。", "ニューラルネットの層だけでなく損失まで含めて表します。"),
  deepLearningBaseTerm("term-3-2-adagrad", "最適化・誤差逆伝播", "3-2-3", "AdaGrad", "アダグラッド", "AdaGrad", "各パラメータの過去の勾配二乗和に応じて学習率を下げ、更新頻度の低い特徴を相対的に大きく更新します。", "勾配二乗和が単調増加し、学習率が減り続けます。", "長期学習では学習率が小さくなりすぎることがあります。"),
  deepLearningBaseTerm("term-3-2-rmsprop", "最適化・誤差逆伝播", "3-2-3", "RMSProp", "アールエムエスプロップ", "RMSProp", "勾配二乗の指数移動平均で更新幅を調整し、AdaGradの学習率が下がり続ける問題を緩和します。", "勾配二乗の移動平均を分母に使います。", "Momentum項を必須とする手法ではありません。"),
  deepLearningBaseTerm("term-3-2-adam", "最適化・誤差逆伝播", "3-2-3", "Adam", "アダム", "Adam", "勾配の一次モーメントと二次モーメントの指数移動平均を使い、パラメータごとに更新幅を適応させます。", "Momentum相当のmとRMSProp相当のv、バイアス補正が手掛かりです。", "weight decayを明示的に分離するAdamWとは区別します。"),
  deepLearningBaseTerm("term-3-2-xavier", "初期化・正則化", "3-2-4", "Xavier / Glorot Initialization", "ザビエル／グロロット・イニシャライゼーション", "Xavier・Glorot初期化", "前後のユニット数に応じて重み分散を調整し、層を通る信号の分散を保ちます。", "Sigmoidやtanh系、fan-inとfan-outを使う初期化が手掛かりです。", "ReLU系ではHe初期化が選ばれることが多いです。"),
  deepLearningBaseTerm("term-3-2-he", "初期化・正則化", "3-2-4", "He / Kaiming Initialization", "ヘ／カイミング・イニシャライゼーション", "He・Kaiming初期化", "ReLUで負側が0になることを考慮し、主にfan-inへ基づいて重み分散を設定します。", "ReLUと分散2/fan-inの組合せが手掛かりです。", "tanh向けXavier初期化と区別します。"),
  deepLearningBaseTerm("term-3-2-gradient-problems", "初期化・正則化", "3-2-2", "Vanishing, Exploding and Gradient Clipping", "ヴァニッシング・エクスプローディング・アンド・グラディエント・クリッピング", "勾配消失・勾配爆発・勾配クリッピング", "層や時間を遡る積で勾配が極端に小さくなるのが消失、大きくなるのが爆発で、クリッピングは大きな勾配を上限内へ抑えます。", "深いネットやRNN、連続するヤコビアンの積が手掛かりです。", "クリッピングは勾配消失を直接解決する方法ではありません。"),

  deepLearningBaseTerm("term-3-3-l1-sparse", "初期化・正則化", "3-3-1", "L1 Regularization and Sparse Representation", "エルワン・レギュラライゼーション・アンド・スパース・リプレゼンテーション", "L1正則化とスパース表現", "重みの絶対値和を罰則へ加え、不要な重みを0にしやすくします。", "疎性・特徴選択・絶対値が手掛かりです。", "L2正則化は通常、重みを小さくしても完全な0にはしにくいです。"),
  deepLearningBaseTerm("term-3-3-l2-decay", "初期化・正則化", "3-3-1", "L2 Regularization and Weight Decay", "エルツー・レギュラライゼーション・アンド・ウェイト・ディケイ", "L2正則化とweight decay", "大きな重みへ二乗罰則を課すか、更新時に重みを減衰させてモデルの複雑さを抑えます。", "重み二乗和、係数縮小、weight decayが手掛かりです。", "適応的最適化ではL2罰則と分離型weight decayが同一にならない場合があります。"),
  deepLearningBaseTerm("term-3-3-dropout", "初期化・正則化", "3-3-2", "Dropout", "ドロップアウト", "ドロップアウト", "学習時にユニット出力を確率的に0へし、特定ユニットへの共適応を抑えます。", "学習時にユニットを消し、推論時は全ユニットを使います。", "推論時にも無条件で同じマスクを使うわけではありません。"),
  deepLearningBaseTerm("term-3-3-dropconnect", "初期化・正則化", "3-3-2", "DropConnect", "ドロップコネクト", "ドロップコネクト", "ユニット出力ではなく、接続重みを確率的に0へする正則化です。", "Dropoutは活性、DropConnectは重みを落とします。", "名前が似ていますが削除対象が異なります。"),
  deepLearningBaseTerm("term-3-3-early-stopping", "初期化・正則化", "3-3-3", "Early Stopping", "アーリー・ストッピング", "早期終了", "検証損失が改善しなくなった時点で学習を止め、過剰適合を抑えます。", "訓練損失ではなく検証指標を監視し、patienceを設ける説明が典型です。", "最終epochの重みより最良時点の重みを復元する運用があります。"),

  deepLearningBaseTerm("term-3-4-receptive-cells", "畳み込みニューラルネットワーク", "3-4-1", "Receptive Field, Simple and Complex Cells", "リセプティブ・フィールド・シンプル・アンド・コンプレックス・セルズ", "受容野・単純型細胞・複雑型細胞", "受容野は出力が参照する入力範囲で、単純型細胞は局所的な線や向き、複雑型細胞は位置ずれに頑健な特徴へ対応づけられます。", "Hubel-Wiesel、局所受容野、位置不変性が手掛かりです。", "受容野の理論値と実際に強く寄与する有効受容野は一致しない場合があります。", "resnet"),
  deepLearningBaseTerm("term-3-4-feature-channel", "畳み込みニューラルネットワーク", "3-4-1", "Feature Map and Channel", "フィーチャー・マップ・アンド・チャネル", "特徴マップとチャネル", "畳み込み結果の空間配置が特徴マップで、各フィルタが異なる特徴チャネルを出力します。", "高さ×幅×チャネル数でCNNの中間表現を捉えます。", "入力RGBチャネルと、畳み込み後の特徴チャネルを区別します。", "resnet"),
  deepLearningBaseTerm("term-3-4-filter-kernel", "畳み込みニューラルネットワーク", "3-4-1", "Filter and Kernel", "フィルター・アンド・カーネル", "フィルタとカーネル", "局所領域へ同じ重みを滑らせて特徴を検出する小さな重み行列です。", "局所接続と重み共有が全結合層との違いです。", "文脈によりfilterが出力チャネル全体、kernelが各入力チャネルの小行列を指す場合があります。", "resnet"),
  deepLearningBaseTerm("term-3-4-padding-stride", "畳み込みニューラルネットワーク", "3-4-1", "Padding and Stride", "パディング・アンド・ストライド", "パディングとストライド", "Paddingは入力周辺を補い、Strideはカーネルを移動する間隔を決めます。", "Same paddingは出力空間サイズ維持、Stride>1はダウンサンプリングが手掛かりです。", "カーネルサイズだけで出力サイズを決めず、paddingとstrideを含めます。", "resnet"),
  deepLearningBaseTerm("term-3-4-im2col", "畳み込みニューラルネットワーク", "3-4-1", "im2col", "イメージ・トゥ・カラム", "im2col", "入力画像の局所パッチを列へ展開し、畳み込みを高速な行列積として計算する実装技法です。", "畳み込みをGEMMへ変換する説明が手掛かりです。", "パッチが重複して展開されるため一時メモリが増えます。"),
  deepLearningBaseTerm("term-3-4-pointwise", "畳み込みニューラルネットワーク", "3-4-2", "Point-Wise / 1x1 Convolution", "ポイントワイズ／ワン・バイ・ワン・コンヴォリューション", "point-wise・1×1畳み込み", "各空間位置でチャネル方向を線形結合し、チャネル数の圧縮・拡張や特徴混合を行います。", "空間サイズを変えずチャネルを変換する1×1畳み込みです。", "空間的な近傍を直接見る範囲は1画素ですが、チャネル間は混合します。", "resnet"),
  deepLearningBaseTerm("term-3-4-depthwise-group", "畳み込みニューラルネットワーク", "3-4-2", "Depth-Wise and Grouped Convolution", "デプスワイズ・アンド・グループド・コンヴォリューション", "depth-wise・グループ化畳み込み", "Grouped Convolutionはチャネルを群へ分け、Depth-Wiseは各入力チャネルを独立に畳み込みます。", "Depth-Wiseのgroups数は入力チャネル数です。", "Depth-Wiseだけではチャネル間を混合しないため、Point-Wiseと組み合わせます。", "vision-transformer"),
  deepLearningBaseTerm("term-3-4-up-transposed", "畳み込みニューラルネットワーク", "3-4-2", "Upsampling and Transposed Convolution", "アップサンプリング・アンド・トランスポーズド・コンヴォリューション", "アップサンプリングと逆畳み込み", "補間などで空間サイズを拡大するのがUpsampling、学習可能な線形変換で拡大するのがTransposed Convolutionです。", "セグメンテーションのDecoderや生成モデルで解像度を上げます。", "Transposed Convolutionは通常の畳み込みを数学的に逆変換するとは限りません。", "segmentation"),
  deepLearningBaseTerm("term-3-4-pooling", "畳み込みニューラルネットワーク", "3-4-3", "Max, Lp and Global Average Pooling", "マックス・エルピー・アンド・グローバル・アベレージ・プーリング", "Max・Lp・Global Average Pooling", "Maxは局所最大、Lpはp乗平均型、GAPは各チャネルの空間平均を1値へまとめます。", "GAPは全空間を平均して全結合層を減らす用途が代表です。", "Poolingは通常、学習パラメータを持たないダウンサンプリングです。", "resnet"),

  deepLearningBaseTerm("term-3-5-rnn", "リカレントニューラルネットワーク", "3-5-1", "Recurrent Neural Network", "リカレント・ニューラル・ネットワーク", "RNN", "前時刻の隠れ状態を次時刻へ再利用し、系列の過去情報を保持します。", "h_t=f(Wx_t+Uh_(t−1))という再帰が手掛かりです。", "長期依存では勾配消失・爆発が起こりやすくなります。"),
  deepLearningBaseTerm("term-3-5-bptt-birnn", "リカレントニューラルネットワーク", "3-5-1", "BPTT and Bidirectional RNN", "ビー・ピー・ティー・ティー・アンド・バイダイレクショナル・アールエヌエヌ", "BPTTと双方向RNN", "BPTTは時間方向へ展開して逆伝播し、双方向RNNは過去方向と未来方向の系列を別々に処理して結合します。", "時間展開がBPTT、前後文脈を同時利用するのがBidirectional RNNです。", "双方向RNNは未来入力が使えない逐次生成にはそのまま使えません。"),
  deepLearningBaseTerm("term-3-5-lstm", "リカレントニューラルネットワーク", "3-5-2", "Long Short-Term Memory", "ロング・ショートターム・メモリー", "LSTM", "メモリーセルと複数ゲートで情報を保持・更新し、単純RNNより長期依存を学びやすくします。", "忘却・入力・出力ゲートとcell stateが手掛かりです。", "隠れ状態hとメモリーセルcを区別します。"),
  deepLearningBaseTerm("term-3-5-lstm-gates", "リカレントニューラルネットワーク", "3-5-2", "Forget, Input and Output Gates", "フォーゲット・インプット・アンド・アウトプット・ゲーツ", "忘却・入力・出力ゲート", "忘却ゲートは過去セルを残す割合、入力ゲートは新情報を書き込む割合、出力ゲートは隠れ状態へ見せる割合を決めます。", "各ゲートはSigmoidで0〜1の値を作るのが典型です。", "候補セル値は通常tanhで作り、ゲート値そのものとは異なります。"),
  deepLearningBaseTerm("term-3-5-memory-cell", "リカレントニューラルネットワーク", "3-5-2", "Memory Cell", "メモリー・セル", "メモリーセル", "LSTMで時系列を通じて情報を運ぶ状態cで、加算的な更新により勾配を流しやすくします。", "cell state c_tとhidden state h_tの2状態を持つ点がLSTMの特徴です。", "GRUは独立したメモリーセルを持たず状態を統合します。"),
  deepLearningBaseTerm("term-3-5-gru", "リカレントニューラルネットワーク", "3-5-2", "Gated Recurrent Unit", "ゲーテッド・リカレント・ユニット", "GRU", "更新ゲートとリセットゲートで情報を制御し、LSTMより少ないパラメータで長期依存へ対応します。", "update gateとreset gate、cell stateの分離なしが手掛かりです。", "LSTMの出力ゲートと同じ構成ではありません。"),
  deepLearningBaseTerm("term-3-5-seq2seq", "リカレントニューラルネットワーク", "3-5-3", "Encoder-Decoder / Sequence-to-Sequence", "エンコーダー・デコーダー／シーケンス・トゥ・シーケンス", "エンコーダ・デコーダとseq2seq", "Encoderが入力系列を表現へ変換し、Decoderが条件付きで出力系列を生成します。", "機械翻訳など入力長と出力長が異なる系列変換が典型です。", "固定長ベクトルだけへ圧縮する初期seq2seqのボトルネックをAttentionが緩和します。"),
  deepLearningBaseTerm("term-3-5-attention", "リカレントニューラルネットワーク", "3-5-3", "Attention Mechanism", "アテンション・メカニズム", "アテンション機構", "Queryと各Keyの関連度から重みを作り、Valueの重み付き和として必要な情報を取り出します。", "Query・Key・Valueと重み付き和が基本です。", "Self-AttentionはQ/K/Vが同じ系列由来という特殊なAttentionです。", "transformer"),

  deepLearningBaseTerm("term-3-6-self-scaled", "Transformer", "3-6-1", "Self-Attention and Scaled Dot-Product Attention", "セルフ・アテンション・アンド・スケールド・ドットプロダクト・アテンション", "Self-AttentionとScaled Dot-Product Attention", "同一系列からQ/K/Vを作り、QK転置を√d_kで割ってSoftmaxし、Vを重み付き集約します。", "系列内の全要素間関係と、√d_kによるスケーリングが手掛かりです。", "スケーリングは内積が大きくなりSoftmaxが飽和するのを抑えます。", "transformer"),
  deepLearningBaseTerm("term-3-6-source-masked", "Transformer", "3-6-1", "Source-Target and Masked Attention", "ソース・ターゲット・アンド・マスクト・アテンション", "Source-Target AttentionとMasked Attention", "Source-TargetではDecoderのQueryがEncoderのKey/Valueを参照し、Masked Attentionは未来トークンへの参照を遮断します。", "QはDecoder、K/VはEncoderならSource-Target、未来を−∞で隠すならMaskedです。", "Padding maskとcausal maskは目的が異なります。", "transformer"),
  deepLearningBaseTerm("term-3-6-multihead-position", "Transformer", "3-6-1", "Multi-Head Attention and Positional Encoding", "マルチヘッド・アテンション・アンド・ポジショナル・エンコーディング", "Multi-Head AttentionとPositional Encoding", "複数の射影空間でAttentionを並列計算し、再帰を持たないモデルへ位置情報を加えます。", "複数headの連結と、sin/cosまたは学習型の位置表現が手掛かりです。", "head数を増やしても各headの次元を同じままにすると計算量が増えるため、通常は分割します。", "transformer"),

  deepLearningBaseTerm("term-3-7-image-augmentation", "汎化性能向上", "3-7-1", "Image Data Augmentation", "イメージ・データ・オーグメンテーション", "画像データ拡張", "Random Flip・Erase・Crop・Rotate、ノイズ、Contrast、Brightnessなどラベルを保つ変換で学習例を増やします。", "訓練時だけランダム変換を行い、汎化性能を上げます。", "課題の意味を壊す変換を無条件に使わないようにします。"),
  deepLearningBaseTerm("term-3-7-randaugment-mixup", "汎化性能向上", "3-7-1", "RandAugment and MixUp", "ランドオーグメント・アンド・ミックスアップ", "RandAugmentとMixUp", "RandAugmentは変換数と強度を単純化して探索し、MixUpは2例の入力とラベルを同じ比率で線形混合します。", "画像変換の組合せならRandAugment、入力とラベルの凸結合ならMixUpです。", "MixUpのラベルはone-hotのままではなく混合されたsoft labelになります。"),
  deepLearningBaseTerm("term-3-7-text-audio-augmentation", "汎化性能向上", "3-7-2", "EDA and Audio Augmentation", "イーディーエー・アンド・オーディオ・オーグメンテーション", "自然言語・音声データ拡張", "EDAは同義語置換・挿入・交換・削除を使い、音声ではノイズ、音量変更、ピッチシフトなどを使います。", "データ種別ごとに意味やラベルを保つ変換を選びます。", "文章の語順や音声の話者属性を壊すほど強い変換に注意します。"),
  deepLearningBaseTerm("term-3-7-specaugment", "汎化性能向上", "3-7-2", "SpecAugment", "スペックオーグメント", "SpecAugment", "音声スペクトログラムの時間帯や周波数帯をマスクし、音声認識モデルの汎化を高めます。", "time maskingとfrequency maskingが手掛かりです。", "生波形へ直接矩形マスクを置く手法ではありません。", "speech"),
  deepLearningBaseTerm("term-3-7-normalization", "汎化性能向上", "3-7-3", "Batch, Layer, Instance and Group Normalization", "バッチ・レイヤー・インスタンス・アンド・グループ・ノーマライゼーション", "Batch・Layer・Instance・Group Normalization", "正規化する軸を変えて学習を安定化します。BatchNormはバッチ統計、LayerNormはサンプル内特徴、InstanceNormは各チャネル、GroupNormはチャネル群を使います。", "どの軸で平均・分散を取るかを問われます。", "小バッチではBatchNormの統計が不安定になり、LayerNormやGroupNormが候補になります。"),
  deepLearningBaseTerm("term-3-7-ensemble", "汎化性能向上", "3-7-4", "Ensemble, Bootstrap and Stacking", "アンサンブル・ブートストラップ・アンド・スタッキング", "アンサンブル・ブートストラップ・スタッキング", "複数モデルを組み合わせ、Bootstrap再標本化や、別モデルで予測を統合するStackingなどで分散や誤差を減らします。", "Baggingは独立並列、Boostingは逐次、Stackingはメタモデルで統合します。", "同じ誤りをするモデルだけを増やしても効果は限定的です。"),
  deepLearningBaseTerm("term-3-7-hyperparameter", "汎化性能向上", "3-7-5", "Hyperparameter Optimization", "ハイパーパラメーター・オプティマイゼーション", "ハイパーパラメータ調整", "学習率、層数、ユニット数、dropout率、batch sizeなど、学習では直接更新しない設定を検証性能で選びます。", "Grid Search、Random Search、Bayesian Optimizationを区別します。", "テストデータを探索に使うと評価が楽観的になります。")
];

const DEEP_LEARNING_BASE_FORMULA_CARDS = [
  deepLearningBaseFormula("formula-3-1-affine", "順伝播型ネットワーク", "3-1-1", "全結合層のアフィン変換", "z=W x+b", "ゼットは、ダブリュー掛けるエックス足すビー", "入力を重み付き和とバイアスで次層のロジットへ変換します。", "重み行列・入力・バイアス", "xが2次元、出力3次元ならWは3行2列", "Wは重み行列、bはバイアス", "行列の向きと次元を確認します。"),
  deepLearningBaseFormula("formula-3-1-mse", "順伝播型ネットワーク", "3-1-2", "平均二乗誤差", "MSE=(1/N)Σᵢ(yᵢ−ŷᵢ)²", "エヌ分の一掛ける、正解と予測の差の二乗和", "回帰誤差を二乗平均し、大きな誤差を強く罰します。", "差を二乗して平均", "誤差2と−2はいずれも4", "Nはデータ数", "目的変数の単位は二乗になります。"),
  deepLearningBaseFormula("formula-3-1-mae", "順伝播型ネットワーク", "3-1-2", "平均絶対誤差", "MAE=(1/N)Σᵢ|yᵢ−ŷᵢ|", "エヌ分の一掛ける、正解と予測の差の絶対値和", "回帰誤差の絶対値を平均します。", "絶対値だから外れ値へ比較的頑健", "誤差2と−2はいずれも2", "Nはデータ数", "0で微分不能ですが劣勾配などで扱えます。"),
  deepLearningBaseFormula("formula-3-1-bce", "順伝播型ネットワーク", "3-1-3", "Binary Cross Entropy", "L=−[y log p+(1−y)log(1−p)]", "マイナス、ワイ掛けるログピー足す、一引くワイ掛けるログ一引くピー", "二値ラベルの正解側確率が低いほど大きく罰します。", "正例項と負例項の2つ", "y=1なら−log p", "pは正例確率", "p=0や1付近では数値安定化が必要です。"),
  deepLearningBaseFormula("formula-3-1-cross-entropy", "順伝播型ネットワーク", "3-1-3", "多クラスCross Entropy", "L=−Σₖ yₖ log pₖ", "マイナス、クラスごとの正解ラベル掛ける予測確率の対数の和", "one-hot正解なら正解クラス確率の負の対数になります。", "正解クラスだけが残る", "正解確率0.8なら損失は−log0.8", "kはクラス番号", "SoftmaxとCross Entropyを別々に計算すると数値誤差が増える場合があります。"),
  deepLearningBaseFormula("formula-3-1-sigmoid", "活性化関数", "3-1-4", "シグモイド関数", "σ(z)=1/(1+e^(−z))", "シグマ・ゼットは、一を、一足すイーのマイナスゼット乗で割る", "実数を0から1へ写します。", "z=0なら0.5", "z=0でσ=0.5", "zは入力ロジット", "大きな正負入力で勾配が小さくなります。"),
  deepLearningBaseFormula("formula-3-1-softmax-temperature", "活性化関数", "3-1-4", "温度付きSoftmax", "pᵢ=exp(zᵢ/T)/Σⱼexp(zⱼ/T)", "アイ番目の確率は、ゼットアイ割るティーの指数を、全クラスの指数和で割る", "ロジットを確率分布へ変換し、Tで鋭さを調整します。", "T高いと平坦、T低いと鋭い", "同じlogitsでもT=2では差が縮む", "Tは温度", "指数計算前に最大logitを引くと安定します。"),
  deepLearningBaseFormula("formula-3-1-tanh", "活性化関数", "3-1-4", "tanh", "tanh(z)=(e^z−e^(−z))/(e^z+e^(−z))", "イーのゼット乗引くイーのマイナスゼット乗を、その和で割る", "入力を−1から1へ写す中心化されたS字関数です。", "シグモイドを−1〜1へ広げた形", "z=0で0", "zは入力", "飽和領域では勾配消失が起こります。"),
  deepLearningBaseFormula("formula-3-1-relu", "活性化関数", "3-1-4", "ReLU", "f(x)=max(0,x)", "エフ・エックスは、ゼロとエックスの大きい方", "正値をそのまま通し、負値を0にします。", "正ならx、負なら0", "x=3なら3、x=−2なら0", "xは入力", "x=0での微分値は実装上いずれかに定めます。"),
  deepLearningBaseFormula("formula-3-2-gradient-descent", "最適化・誤差逆伝播", "3-2-1", "勾配降下の更新式", "θ_(t+1)=θ_t−η∇_θL(θ_t)", "次のシータは、現在のシータ引く、学習率掛ける損失の勾配", "損失が減る方向へパラメータを更新します。", "勾配と反対方向", "勾配2、η=0.1なら0.2減らす", "ηは学習率", "符号を逆にすると勾配上昇になります。"),
  deepLearningBaseFormula("formula-3-2-momentum", "最適化・誤差逆伝播", "3-2-1", "Momentum更新", "v_t=βv_(t−1)+g_t,  θ_t=θ_(t−1)−ηv_t", "速度は過去速度掛けるベータ足す現在勾配、重みは速度分だけ更新", "過去の方向を蓄積して加速し、横方向の振動を平均化します。", "勾配の移動平均を速度にする", "同じ符号の勾配が続くと速度が増える", "βはMomentum係数", "ライブラリにより速度の符号定義が異なります。"),
  deepLearningBaseFormula("formula-3-2-adagrad", "最適化・誤差逆伝播", "3-2-3", "AdaGrad", "G_t=G_(t−1)+g_t²,  θ_t=θ_(t−1)−ηg_t/(√G_t+ε)", "勾配二乗和を蓄積し、その平方根で現在勾配を割って更新", "頻繁に大きい勾配を持つパラメータの学習率を自動的に下げます。", "二乗和は増え続ける", "更新が進むほど分母が大きくなる", "εはゼロ除算防止", "学習率が下がりすぎて停止する場合があります。"),
  deepLearningBaseFormula("formula-3-2-rmsprop", "最適化・誤差逆伝播", "3-2-3", "RMSProp", "v_t=ρv_(t−1)+(1−ρ)g_t²,  θ_t=θ_(t−1)−ηg_t/(√v_t+ε)", "勾配二乗の指数移動平均を作り、その平方根で勾配を割る", "過去すべてではなく最近の勾配二乗を重視します。", "AdaGradの累積を移動平均へ", "古い勾配の影響はρで減衰", "ρは減衰率", "一次モーメントは標準RMSPropの必須要素ではありません。"),
  deepLearningBaseFormula("formula-3-2-adam", "最適化・誤差逆伝播", "3-2-3", "Adam", "m_t=β₁m_(t−1)+(1−β₁)g_t,  v_t=β₂v_(t−1)+(1−β₂)g_t²", "一次モーメントと二次モーメントの指数移動平均を更新する", "勾配平均と勾配二乗平均を組み合わせ、バイアス補正後に更新幅を決めます。", "MomentumとRMSPropを組み合わせる", "mは方向、vは尺度を表す", "β₁・β₂は減衰率", "初期のmとvが0へ偏るためバイアス補正を使います。"),
  deepLearningBaseFormula("formula-3-2-xavier", "初期化・正則化", "3-2-4", "Xavier初期化の分散", "Var(w)≈2/(fan_in+fan_out)", "重みの分散は、入力数と出力数の和で二を割る", "前後の層で活性と勾配の分散を保つ目安です。", "fan-inとfan-outの両方", "入力100・出力100なら分散約0.01", "fanは接続数", "一様分布版と正規分布版で範囲や標準偏差表現が異なります。"),
  deepLearningBaseFormula("formula-3-2-he", "初期化・正則化", "3-2-4", "He初期化の分散", "Var(w)≈2/fan_in", "重みの分散は、入力接続数で二を割る", "ReLUで半分程度が0になることを考慮します。", "ReLUなら2/fan-in", "fan-in=100なら分散0.02", "fan_inは入力接続数", "ReLU以外の活性化では適切なgainが異なります。"),
  deepLearningBaseFormula("formula-3-4-output-size", "畳み込みニューラルネットワーク", "3-4-1", "畳み込み出力サイズ", "O=⌊(I+2P−K)/S⌋+1", "出力は、入力足す二パディング引くカーネルをストライドで割って切り下げ、最後に一を足す", "入力・padding・kernel・strideから空間出力サイズを求めます。", "入れて、引いて、割って、足す", "I=7,P=1,K=3,S=2ならO=4", "I入力、P padding、K kernel、S stride", "dilationがある場合は有効カーネルサイズへ置き換えます。", "resnet"),
  deepLearningBaseFormula("formula-3-5-rnn", "リカレントニューラルネットワーク", "3-5-1", "RNNの状態更新", "h_t=φ(W_xx_t+W_hh_(t−1)+b)", "時刻ティーの隠れ状態は、現在入力と前時刻状態の重み付き和を活性化", "現在入力と過去状態から新しい隠れ状態を作ります。", "現在xと過去hを足して活性化", "文章の各トークンで同じ重みを共有", "tは時刻", "長系列ではヤコビアンの積により勾配問題が起こります。"),
  deepLearningBaseFormula("formula-3-5-lstm-gates", "リカレントニューラルネットワーク", "3-5-2", "LSTMのセル更新", "c_t=f_t⊙c_(t−1)+i_t⊙c̃_t,  h_t=o_t⊙tanh(c_t)", "新しいセルは忘却ゲート掛ける過去セル足す入力ゲート掛ける候補、隠れ状態は出力ゲート掛けるセルのタンジェント", "ゲートで過去情報を残す量と新情報を書く量を制御します。", "忘れて足して、出力で見せる", "f=1,i=0なら過去セルを保持", "⊙は要素積", "セル状態cと隠れ状態hを入れ替えないようにします。"),
  deepLearningBaseFormula("formula-3-6-attention", "Transformer", "3-6-1", "Scaled Dot-Product Attention", "Attention(Q,K,V)=softmax(QKᵀ/√d_k)V", "アテンションは、キュー掛けるキー転置をルート・ディーケーで割ってソフトマックスし、バリューを掛ける", "QueryとKeyの類似度から重みを作り、Valueを集約します。", "QK転置、ルートd_k、Softmax、V", "1つのQueryが全Keyへ重みを配る", "d_kはKeyの次元", "Softmaxを取る軸とmask適用位置を確認します。", "transformer"),
  deepLearningBaseFormula("formula-3-7-batchnorm", "汎化性能向上", "3-7-3", "Batch Normalization", "x̂=(x−μ_B)/√(σ_B²+ε),  y=γx̂+β", "エックスからバッチ平均を引き、バッチ分散とイプシロンの平方根で割り、ガンマとベータで変換", "ミニバッチ統計で標準化し、学習可能な尺度と移動を加えます。", "標準化してγβで戻せる", "平均0・分散1へした後に再調整", "μ_B・σ_B²はバッチ統計", "推論時は通常、移動平均統計を使います。"),
  deepLearningBaseFormula("formula-3-7-mixup", "汎化性能向上", "3-7-1", "MixUp", "x̃=λx_i+(1−λ)x_j,  ỹ=λy_i+(1−λ)y_j", "新しい入力とラベルは、二つの例をラムダと一引くラムダで混ぜる", "入力とラベルを同じ混合率で補間します。", "入力もラベルも同じλ", "λ=0.7なら一方70%、他方30%", "λは通常Beta分布から取得", "入力だけ混ぜてラベルをhard labelのままにしないようにします。")
];

const DEEP_LEARNING_BASE_COMPARE_CARDS = [
  deepLearningBaseCompare("compare-3-1-mse-mae", "順伝播型ネットワーク", "3-1-2", {t:"MSE",k:"エムエスイー",j:"誤差を二乗",d:"大外れを強く罰する"}, {t:"MAE",k:"エムエーイー",j:"誤差の絶対値",d:"外れ値に比較的頑健"}, "二乗ならMSE、絶対値ならMAEです。"),
  deepLearningBaseCompare("compare-3-1-bce-cce", "順伝播型ネットワーク", "3-1-3", {t:"Binary Cross Entropy",k:"バイナリー・クロス・エントロピー",j:"各出力を二値判定",d:"Sigmoid・マルチラベル"}, {t:"Categorical Cross Entropy",k:"カテゴリカル・クロス・エントロピー",j:"全クラスから1つ",d:"Softmax・単一ラベル"}, "独立した複数ラベルならBCE、排他的な多クラスならCategorical Cross Entropyです。"),
  deepLearningBaseCompare("compare-3-1-sigmoid-softmax", "活性化関数", "3-1-4", {t:"Sigmoid",k:"シグモイド",j:"各要素を独立に0〜1",d:"合計は1とは限らない"}, {t:"Softmax",k:"ソフトマックス",j:"全クラスを同時正規化",d:"確率合計1"}, "二値・マルチラベルならSigmoid、多クラス単一ラベルならSoftmaxです。"),
  deepLearningBaseCompare("compare-3-1-multiclass-multilabel", "順伝播型ネットワーク", "3-1-3", {t:"Multi-Class",k:"マルチクラス",j:"候補から1クラス",d:"Softmax"}, {t:"Multi-Label",k:"マルチラベル",j:"複数ラベル同時成立",d:"クラスごとのSigmoid"}, "排他的な1つを選ぶか、複数が同時に真になれるかで見分けます。"),
  deepLearningBaseCompare("compare-3-1-sigmoid-tanh", "活性化関数", "3-1-4", {t:"Sigmoid",k:"シグモイド",j:"0〜1",d:"中心が0.5"}, {t:"tanh",k:"タンジェント・ハイパボリック",j:"−1〜1",d:"0中心"}, "確率・ゲートならSigmoid、正負の状態候補ならtanhが典型です。"),
  deepLearningBaseCompare("compare-3-1-relu-leaky", "活性化関数", "3-1-4", {t:"ReLU",k:"レルー",j:"負側は0",d:"簡単・高速"}, {t:"Leaky ReLU",k:"リーキー・レルー",j:"負側に小傾斜",d:"Dying ReLUを緩和"}, "負領域を完全に切るか、小さな勾配を残すかで区別します。"),
  deepLearningBaseCompare("compare-3-1-relu-gelu", "活性化関数", "3-1-4", {t:"ReLU",k:"レルー",j:"区分線形",d:"負値を0"}, {t:"GELU",k:"ゲルー",j:"滑らかな確率的ゲート",d:"Transformerで頻出"}, "CNNの基本ならReLU、Transformerで滑らかな活性化ならGELUが典型です。", "transformer"),
  deepLearningBaseCompare("compare-3-2-full-mini", "最適化・誤差逆伝播", "3-2-1", {t:"Full Batch",k:"フル・バッチ",j:"全データで1更新",d:"安定だが重い"}, {t:"Mini-Batch",k:"ミニバッチ",j:"一部データで更新",d:"GPU効率と確率性"}, "全件勾配か、小分けした近似勾配かで見分けます。"),
  deepLearningBaseCompare("compare-3-2-sgd-momentum", "最適化・誤差逆伝播", "3-2-1", {t:"SGD",k:"エスジーディー",j:"現在勾配中心",d:"単純"}, {t:"Momentum",k:"モメンタム",j:"過去方向を速度へ蓄積",d:"振動抑制・加速"}, "速度変数や慣性があればMomentumです。"),
  deepLearningBaseCompare("compare-3-2-momentum-nag", "最適化・誤差逆伝播", "3-2-1", {t:"Momentum",k:"モメンタム",j:"現在位置で勾配",d:"速度を加える"}, {t:"NAG",k:"エヌエージー",j:"先読み位置で勾配",d:"行き過ぎを補正"}, "look-aheadで勾配を評価するのがNesterovです。"),
  deepLearningBaseCompare("compare-3-2-adagrad-rmsprop", "最適化・誤差逆伝播", "3-2-3", {t:"AdaGrad",k:"アダグラッド",j:"勾配二乗を累積",d:"学習率が下がり続ける"}, {t:"RMSProp",k:"アールエムエスプロップ",j:"二乗の指数移動平均",d:"最近の勾配を重視"}, "全履歴の累積か、減衰する移動平均かで区別します。"),
  deepLearningBaseCompare("compare-3-2-rmsprop-adam", "最適化・誤差逆伝播", "3-2-3", {t:"RMSProp",k:"アールエムエスプロップ",j:"二次モーメント中心",d:"勾配尺度を調整"}, {t:"Adam",k:"アダム",j:"一次・二次モーメント",d:"方向と尺度を調整"}, "mとvの両方、バイアス補正があればAdamです。"),
  deepLearningBaseCompare("compare-3-2-xavier-he", "初期化・正則化", "3-2-4", {t:"Xavier",k:"ザビエル",j:"fan-inとfan-out",d:"tanh・Sigmoid向け"}, {t:"He",k:"ヘ",j:"2/fan-in",d:"ReLU向け"}, "活性化がtanh系ならXavier、ReLU系ならHeが基本です。"),
  deepLearningBaseCompare("compare-3-3-l1-l2", "初期化・正則化", "3-3-1", {t:"L1",k:"エルワン",j:"絶対値和",d:"0を作り疎にする"}, {t:"L2",k:"エルツー",j:"二乗和",d:"滑らかに縮小"}, "特徴選択・スパースならL1、係数を全体に小さくするならL2です。"),
  deepLearningBaseCompare("compare-3-3-dropout-dropconnect", "初期化・正則化", "3-3-2", {t:"Dropout",k:"ドロップアウト",j:"ユニット出力を削除",d:"活性へマスク"}, {t:"DropConnect",k:"ドロップコネクト",j:"接続重みを削除",d:"重みへマスク"}, "落とす対象がユニットか重みかで見分けます。"),
  deepLearningBaseCompare("compare-3-4-valid-same", "畳み込みニューラルネットワーク", "3-4-1", {t:"VALID Padding",k:"バリッド・パディング",j:"補完なし",d:"出力が縮む"}, {t:"SAME Padding",k:"セイム・パディング",j:"周辺を補完",d:"stride 1でサイズ維持"}, "paddingなしで縮むならVALID、空間サイズ維持ならSAMEです。", "resnet"),
  deepLearningBaseCompare("compare-3-4-max-gap", "畳み込みニューラルネットワーク", "3-4-3", {t:"Max Pooling",k:"マックス・プーリング",j:"局所最大",d:"局所的に縮小"}, {t:"Global Average Pooling",k:"グローバル・アベレージ・プーリング",j:"全空間平均",d:"チャネルごと1値"}, "小窓ごとに最大を取るか、特徴マップ全体を平均するかで区別します。", "resnet"),
  deepLearningBaseCompare("compare-3-4-standard-depthwise", "畳み込みニューラルネットワーク", "3-4-2", {t:"Standard Convolution",k:"スタンダード・コンヴォリューション",j:"空間とチャネルを同時混合",d:"計算量大"}, {t:"Depthwise Separable",k:"デプスワイズ・セパラブル",j:"Depth-Wise後に1×1",d:"軽量"}, "チャネル別の空間畳み込みとPoint-Wiseを分けるのがDepthwise Separableです。", "vision-transformer"),
  deepLearningBaseCompare("compare-3-5-rnn-lstm", "リカレントニューラルネットワーク", "3-5-2", {t:"Simple RNN",k:"シンプル・アールエヌエヌ",j:"単一隠れ状態",d:"長期依存が苦手"}, {t:"LSTM",k:"エルエスティーエム",j:"セルと3ゲート",d:"長期依存を保持"}, "忘却・入力・出力ゲートとcell stateがあればLSTMです。"),
  deepLearningBaseCompare("compare-3-5-lstm-gru", "リカレントニューラルネットワーク", "3-5-2", {t:"LSTM",k:"エルエスティーエム",j:"3ゲート+cell state",d:"表現力が高い"}, {t:"GRU",k:"ジーアールユー",j:"update/resetゲート",d:"比較的軽量"}, "独立したcell stateと出力ゲートならLSTM、2ゲートで状態統合ならGRUです。"),
  deepLearningBaseCompare("compare-3-6-attention-self", "Transformer", "3-6-1", {t:"Cross Attention",k:"クロス・アテンション",j:"QとK/Vが別系列",d:"DecoderがEncoderを参照"}, {t:"Self-Attention",k:"セルフ・アテンション",j:"Q/K/Vが同一系列",d:"系列内関係"}, "Qの系列とK/Vの系列が同じか別かで見分けます。", "transformer"),
  deepLearningBaseCompare("compare-3-7-batch-layer", "汎化性能向上", "3-7-3", {t:"Batch Normalization",k:"バッチ・ノーマライゼーション",j:"バッチ軸の統計",d:"推論時は移動平均"}, {t:"Layer Normalization",k:"レイヤー・ノーマライゼーション",j:"各サンプル内の特徴",d:"系列・小バッチに強い"}, "バッチ統計へ依存するか、各サンプル内で完結するかで区別します。", "transformer"),
  deepLearningBaseCompare("compare-3-7-grid-random", "汎化性能向上", "3-7-5", {t:"Grid Search",k:"グリッド・サーチ",j:"格子状に全組合せ",d:"低次元なら網羅的"}, {t:"Random Search",k:"ランダム・サーチ",j:"分布から無作為抽出",d:"重要次元を探索しやすい"}, "候補値の直積を全部試すならGrid、予算内で無作為に試すならRandomです。"),
  deepLearningBaseCompare("compare-3-7-random-bayesian", "汎化性能向上", "3-7-5", {t:"Random Search",k:"ランダム・サーチ",j:"過去結果を使わない",d:"並列化しやすい"}, {t:"Bayesian Optimization",k:"ベイジアン・オプティマイゼーション",j:"代理モデルで次点選択",d:"高コスト評価を節約"}, "過去の評価結果から獲得関数で次候補を選ぶのがBayesian Optimizationです。")
];

TERMS.push(...DEEP_LEARNING_BASE_TERM_CARDS);
FORMULAS.push(...DEEP_LEARNING_BASE_FORMULA_CARDS);
COMPARES.push(...DEEP_LEARNING_BASE_COMPARE_CARDS);
