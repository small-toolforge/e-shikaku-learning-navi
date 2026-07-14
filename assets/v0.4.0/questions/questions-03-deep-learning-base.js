"use strict";

const DEEP_LEARNING_BASE_QUESTIONS = [
  syllabusQuestion(
    "dl-q001", "深層学習の基礎", "多層パーセプトロン", "基礎", "3-1-1",
    "多層パーセプトロンで、線形変換だけを何層重ねても表現できないものはどれですか？",
    ["入力次元の変更", "XORのような非線形な決定境界", "重み付き和", "バイアスによる平行移動"], 1,
    "線形変換を重ねても全体は線形変換のままです。XORなどの非線形関係を表すには、層の間へ非線形活性化関数を入れます。",
    ["term-3-1-mlp", "term-3-1-fully-connected"]
  ),
  syllabusQuestion(
    "dl-q002", "深層学習の基礎", "全結合層", "標準", "3-1-1",
    "入力ベクトルxが4次元、出力zが3次元で、z=Wx+bとする場合、Wの形状として適切なものはどれですか？",
    ["4×4", "4×3", "3×4", "3×3"], 2,
    "列ベクトルxへ左からWを掛けて3次元を得るため、Wは出力次元×入力次元の3×4です。",
    ["term-3-1-weight-bias", "formula-3-1-affine"]
  ),
  syllabusQuestion(
    "dl-q003", "深層学習の基礎", "回帰損失", "基礎", "3-1-2",
    "外れ値の大きな誤差をMAEより強く罰する損失関数はどれですか？",
    ["MSE", "Accuracy", "Binary Cross Entropy", "IoU"], 0,
    "MSEは誤差を二乗するため、大きな誤差の影響がMAEより強くなります。",
    ["term-3-1-regression-loss", "formula-3-1-mse", "formula-3-1-mae", "compare-3-1-mse-mae"]
  ),
  syllabusQuestion(
    "dl-q004", "深層学習の基礎", "出力層とロジット", "標準", "3-1-2",
    "ロジットの説明として適切なものはどれですか？",
    ["必ず0から1に収まる確率", "正解ラベルそのもの", "入力データの標準偏差", "SigmoidやSoftmaxへ入れる前の未正規化スコア"], 3,
    "ロジットは確率化前のスコアです。二値分類ではSigmoid、多クラス分類ではSoftmaxへ入力することが代表的です。",
    ["term-3-1-output-logit", "term-3-1-loss"]
  ),
  syllabusQuestion(
    "dl-q005", "深層学習の基礎", "分類損失", "基礎", "3-1-3",
    "1つの画像に「犬」と「屋外」のような複数ラベルが同時に成立する課題で、代表的な出力と損失の組合せはどれですか？",
    ["SoftmaxとMSE", "各クラスのSigmoidとBinary Cross Entropy", "線形出力とMAEだけ", "ArgmaxとIoU"], 1,
    "マルチラベル分類では各ラベルを独立な二値分類として扱い、クラスごとのSigmoidとBCEを使うのが代表的です。",
    ["term-3-1-classification-loss", "formula-3-1-bce", "compare-3-1-bce-cce", "compare-3-1-multiclass-multilabel"]
  ),
  syllabusQuestion(
    "dl-q006", "深層学習の基礎", "多クラスとマルチラベル", "標準", "3-1-3",
    "多クラス単一ラベル分類とマルチラベル分類の違いとして正しいものはどれですか？",
    ["両方とも出力確率の合計が必ず1", "マルチラベルはクラス間に必ず順序がある", "多クラスは排他的な1クラス、マルチラベルは複数クラスが同時に成立可能", "多クラスでは損失関数を使わない"], 2,
    "多クラス単一ラベルは候補から1つを選び、マルチラベルは複数ラベルが同時に真になれます。",
    ["term-3-1-multilabel-ordinal", "compare-3-1-multiclass-multilabel", "compare-3-1-sigmoid-softmax"]
  ),
  syllabusQuestion(
    "dl-q007", "深層学習の基礎", "温度付きSoftmax", "標準", "3-1-4",
    "同じロジットに対してSoftmaxの温度Tを高くしたとき、一般に出力分布はどうなりますか？",
    ["より平坦になる", "最大クラスへより集中する", "すべて0になる", "クラス数が減る"], 0,
    "ロジットを大きなTで割るとクラス間の差が縮み、確率分布は平坦になります。Tを低くすると鋭くなります。",
    ["term-3-1-temperature", "formula-3-1-softmax-temperature"]
  ),
  syllabusQuestion(
    "dl-q008", "深層学習の基礎", "活性化関数", "標準", "3-1-4",
    "活性化関数の説明として正しいものはどれですか？",
    ["ReLUは負の入力にも必ず小さな傾きを持つ", "Leaky ReLUは負の入力を必ず0にする", "GELUは出力を必ず0から1へ制限する", "Leaky ReLUは負側に小さな傾きを残し、Dying ReLUを緩和する"], 3,
    "ReLUは負側を0にしますが、Leaky ReLUは負側にも小さな傾きを残します。GELUはTransformer系で使われる滑らかな活性化です。",
    ["term-3-1-relu", "term-3-1-leaky-relu", "term-3-1-gelu", "compare-3-1-relu-leaky", "compare-3-1-relu-gelu"]
  ),
  syllabusQuestion(
    "dl-q009", "深層学習の基礎", "ミニバッチ", "基礎", "3-2-1",
    "訓練データ1000件をバッチサイズ100で学習するとき、1エポック当たりの更新回数として基本的な値はどれですか？",
    ["1回", "10回", "100回", "1000回"], 1,
    "1000件を100件ずつ処理するため、1エポックは基本的に10ミニバッチ、10更新です。端数やdrop_last設定がある場合は変わります。",
    ["term-3-2-minibatch", "compare-3-2-full-mini"]
  ),
  syllabusQuestion(
    "dl-q010", "深層学習の基礎", "Nesterov加速勾配", "標準", "3-2-1",
    "Nesterov Accelerated Gradientが通常のMomentumと異なる点はどれですか？",
    ["過去の更新方向を一切使わない", "学習率を必ず0にする", "Momentumで先に進んだ位置を見越して勾配を評価する", "損失ではなくAccuracyだけで更新する"], 2,
    "Nesterov法はlook-ahead位置で勾配を計算し、Momentumの行き過ぎを早めに補正します。",
    ["term-3-2-momentum", "term-3-2-nesterov", "compare-3-2-momentum-nag"]
  ),
  syllabusQuestion(
    "dl-q011", "深層学習の基礎", "誤差逆伝播", "基礎", "3-2-2",
    "誤差逆伝播法の役割として最も適切なものはどれですか？",
    ["連鎖律を使って各パラメータの勾配を効率的に求める", "学習率を自動で決める", "訓練データを増やす", "モデルを量子化する"], 0,
    "誤差逆伝播は勾配の計算方法です。求めた勾配を使って実際に重みを更新するのはSGDやAdamなどの最適化手法です。",
    ["term-3-2-backprop", "term-3-2-gradient-descent", "formula-3-2-gradient-descent"]
  ),
  syllabusQuestion(
    "dl-q012", "深層学習の基礎", "計算グラフ", "標準", "3-2-2",
    "計算グラフで1つの値が2つの経路へ分岐し、後で損失へ影響する場合、逆伝播で元の値へ戻る勾配は一般にどうなりますか？",
    ["片方の経路だけを選ぶ", "常に0にする", "2つの勾配を掛けるだけ", "各経路から戻る勾配を足し合わせる"], 3,
    "同じ変数が複数経路で損失へ影響する場合、各経路の偏微分を合計します。直列の合成関数では局所微分を掛けます。",
    ["term-3-2-chain-delta", "term-3-2-autodiff", "term-3-2-computational-graph"]
  ),
  syllabusQuestion(
    "dl-q013", "深層学習の基礎", "AdaGradとRMSProp", "標準", "3-2-3",
    "AdaGradで長期学習時に起こりやすい問題はどれですか？",
    ["勾配二乗和が必ず減り続ける", "累積二乗和が増え、実効学習率が小さくなりすぎる", "一次モーメントが必ず発散する", "学習率が自動的に無限大になる"], 1,
    "AdaGradは過去の勾配二乗を累積するため分母が増え続け、更新が極端に小さくなることがあります。RMSPropは指数移動平均で緩和します。",
    ["term-3-2-adagrad", "term-3-2-rmsprop", "formula-3-2-adagrad", "formula-3-2-rmsprop", "compare-3-2-adagrad-rmsprop"]
  ),
  syllabusQuestion(
    "dl-q014", "深層学習の基礎", "Adam", "標準", "3-2-3",
    "Adamが主に保持する2種類の統計はどれですか？",
    ["入力平均と出力平均", "訓練誤差と検証誤差", "勾配の一次モーメントと勾配二乗の二次モーメント", "重みの最大値と最小値"], 2,
    "Adamは勾配の指数移動平均mと、勾配二乗の指数移動平均vを用い、初期の0への偏りを補正します。",
    ["term-3-2-adam", "formula-3-2-adam", "compare-3-2-rmsprop-adam"]
  ),
  syllabusQuestion(
    "dl-q015", "深層学習の基礎", "パラメータ初期化", "基礎", "3-2-4",
    "活性化関数と代表的な初期化の対応として適切なものはどれですか？",
    ["tanhにはXavier、ReLUにはHe", "tanhにはHe、ReLUには常にゼロ初期化", "どちらも全重みを1にする", "活性化関数と初期化は無関係"], 0,
    "XavierはSigmoid・tanh系、HeはReLU系を想定した分散設計が代表的です。全重みを同じ値にすると対称性が破れません。",
    ["term-3-2-xavier", "term-3-2-he", "formula-3-2-xavier", "formula-3-2-he", "compare-3-2-xavier-he"]
  ),
  syllabusQuestion(
    "dl-q016", "深層学習の基礎", "勾配消失・爆発", "標準", "3-2-4",
    "勾配クリッピングが直接対処する現象はどれですか？",
    ["勾配消失", "過少適合", "データリーク", "勾配爆発"], 3,
    "勾配クリッピングは勾配のノルムや値を上限内へ抑え、勾配爆発を緩和します。勾配消失を直接解決する手法ではありません。",
    ["term-3-2-gradient-problems"]
  ),
  syllabusQuestion(
    "dl-q017", "深層学習の基礎", "L1・L2正則化", "基礎", "3-3-1",
    "不要な重みを厳密な0にしやすく、スパース表現や特徴選択につながりやすい正則化はどれですか？",
    ["L2正則化", "L1正則化", "Batch Normalization", "Early Stopping"], 1,
    "L1は重みの絶対値和を罰則へ加え、0の重みを作りやすくします。L2は通常、重みを滑らかに縮小します。",
    ["term-3-3-l1-sparse", "term-3-3-l2-decay", "compare-3-3-l1-l2"]
  ),
  syllabusQuestion(
    "dl-q018", "深層学習の基礎", "Weight Decay", "標準", "3-3-1",
    "Weight Decayの基本的な目的として適切なものはどれですか？",
    ["入力画像の解像度を上げる", "クラス数を増やす", "大きな重みを抑えてモデルの複雑さと過剰適合を軽減する", "ラベルをone-hotへ変換する"], 2,
    "Weight Decayは更新時に重みを減衰させ、大きな重みを抑えます。適応的最適化ではL2罰則と分離したAdamWなども使われます。",
    ["term-3-3-l2-decay", "compare-3-3-l1-l2"]
  ),
  syllabusQuestion(
    "dl-q019", "深層学習の基礎", "DropoutとDropConnect", "基礎", "3-3-2",
    "DropoutとDropConnectの違いとして正しいものはどれですか？",
    ["Dropoutはユニット出力、DropConnectは接続重みを確率的に0にする", "Dropoutは重み、DropConnectはラベルを削除する", "両者とも推論時だけ使う", "両者ともデータを物理的に削除する"], 0,
    "Dropoutは活性値へマスクを掛け、DropConnectは重みへマスクを掛けます。",
    ["term-3-3-dropout", "term-3-3-dropconnect", "compare-3-3-dropout-dropconnect"]
  ),
  syllabusQuestion(
    "dl-q020", "深層学習の基礎", "Dropout", "標準", "3-3-2",
    "一般的なDropoutの学習時と推論時の扱いとして適切なものはどれですか？",
    ["学習時は無効、推論時だけランダム削除", "学習時も推論時も必ず同じマスク", "推論時に全ユニットを削除", "学習時にランダム削除し、推論時は全ユニットを使うよう尺度を整える"], 3,
    "Dropoutは学習時に確率的なマスクを使います。Inverted Dropoutでは学習時に尺度補正し、推論時はそのまま全ユニットを使います。",
    ["term-3-3-dropout"]
  ),
  syllabusQuestion(
    "dl-q021", "深層学習の基礎", "早期終了", "基礎", "3-3-3",
    "Early Stoppingで通常監視するものはどれですか？",
    ["訓練データの件数だけ", "検証損失や検証指標の改善", "テストデータの正解ラベルを使った更新", "重みのファイルサイズだけ"], 1,
    "検証性能が一定期間改善しないときに学習を止め、最良時点の重みへ戻すことで過剰適合を抑えます。",
    ["term-3-3-early-stopping"]
  ),
  syllabusQuestion(
    "dl-q022", "深層学習の基礎", "陰的正則化", "標準", "3-3-3",
    "ハイパーパラメータ調整やEarly Stoppingの判断にテストデータを繰り返し使うべきでない主な理由はどれですか？",
    ["テストデータは読み込めないから", "学習時間が必ず短くなるから", "テスト集合へ選択が適合し、最終評価が楽観的になるから", "損失関数が不要になるから"], 2,
    "調整には検証集合を使い、テスト集合は最終的な未使用データとして評価へ残します。",
    ["term-3-3-early-stopping", "term-3-7-hyperparameter"]
  ),
  syllabusQuestion(
    "dl-q023", "深層学習の基礎", "畳み込み出力サイズ", "標準", "3-4-1",
    "入力サイズI=7、Padding P=1、Kernel K=3、Stride S=2の畳み込み出力サイズOはいくつですか？",
    ["4", "3", "5", "7"], 0,
    "O=⌊(I+2P−K)/S⌋+1=⌊(7+2−3)/2⌋+1=4です。",
    ["term-3-4-padding-stride", "formula-3-4-output-size", "compare-3-4-valid-same"]
  ),
  syllabusQuestion(
    "dl-q024", "深層学習の基礎", "im2col", "標準", "3-4-1",
    "im2colの説明として適切なものはどれですか？",
    ["画像をクラスラベルへ変換する", "フィルタをランダムに削除する", "出力チャネルを必ず1にする", "局所パッチを行列へ展開し、畳み込みを行列積として計算する"], 3,
    "im2colは画像パッチを列へ展開し、最適化されたGEMMを使えるようにします。一方で重複展開による一時メモリ増加があります。",
    ["term-3-4-im2col", "term-3-4-filter-kernel"]
  ),
  syllabusQuestion(
    "dl-q025", "深層学習の基礎", "Depthwise Separable Convolution", "標準", "3-4-2",
    "Depthwise Separable Convolutionの典型的な処理順はどれですか？",
    ["1×1畳み込みだけを2回", "チャネルごとのDepth-Wise畳み込みの後、1×1 Point-Wise畳み込みでチャネルを混合", "全結合層の後にRNN", "Max Poolingの後にSoftmaxだけ"], 1,
    "Depth-Wiseは各入力チャネルを独立に空間処理し、Point-Wiseの1×1畳み込みがチャネル間を混合します。",
    ["term-3-4-pointwise", "term-3-4-depthwise-group", "compare-3-4-standard-depthwise"]
  ),
  syllabusQuestion(
    "dl-q026", "深層学習の基礎", "アップサンプリング", "標準", "3-4-2",
    "Transposed Convolutionについて正しい説明はどれですか？",
    ["通常の畳み込みの出力から元入力を必ず完全復元する", "学習パラメータを持たない最近傍補間だけを指す", "学習可能な線形変換として空間サイズの拡大に使われるが、通常の畳み込みの厳密な逆とは限らない", "必ず空間サイズを小さくする"], 2,
    "Transposed Convolutionはセグメンテーションや生成モデルのDecoderで解像度を上げるために使われますが、元画像の完全な逆変換を保証しません。",
    ["term-3-4-up-transposed"]
  ),
  syllabusQuestion(
    "dl-q027", "深層学習の基礎", "プーリング", "基礎", "3-4-3",
    "Global Average Poolingの説明として適切なものはどれですか？",
    ["各特徴チャネルの空間全体を平均し、チャネルごとに1値へまとめる", "小窓内の最大値だけを残す", "チャネル数を必ず2倍にする", "学習時だけ重みをランダム削除する"], 0,
    "GAPは高さ×幅の全位置を平均し、各チャネルを1つの値へまとめます。全結合層のパラメータ削減にも使われます。",
    ["term-3-4-pooling", "compare-3-4-max-gap"]
  ),
  syllabusQuestion(
    "dl-q028", "深層学習の基礎", "Max Pooling", "標準", "3-4-3",
    "一般的なMax Poolingについて正しいものはどれですか？",
    ["必ず学習可能な重み行列を持つ", "クラス確率を計算する", "時系列の未来をマスクする", "局所領域の最大値を取り、通常は学習パラメータを持たず空間を縮小する"], 3,
    "Max Poolingは局所最大値を選ぶダウンサンプリングで、通常は学習パラメータを持ちません。",
    ["term-3-4-pooling", "compare-3-4-max-gap"]
  ),
  syllabusQuestion(
    "dl-q029", "深層学習の基礎", "BPTT", "基礎", "3-5-1",
    "BPTTの説明として適切なものはどれですか？",
    ["画像をパッチへ分割する", "RNNを時間方向へ展開し、各時刻で共有された重みへ勾配を戻す", "Attentionのhead数を増やす", "バッチ統計を移動平均する"], 1,
    "Backpropagation Through TimeはRNNを時間方向の計算グラフとして展開し、時刻を遡って勾配を計算します。",
    ["term-3-5-rnn", "term-3-5-bptt-birnn", "formula-3-5-rnn"]
  ),
  syllabusQuestion(
    "dl-q030", "深層学習の基礎", "双方向RNN", "標準", "3-5-1",
    "双方向RNNを未来入力がまだ存在しないリアルタイム逐次生成へ、そのまま適用しにくい理由はどれですか？",
    ["重みを共有できないから", "損失関数を使えないから", "逆方向のRNNが未来側の入力を必要とするから", "必ず画像入力が必要だから"], 2,
    "双方向RNNは過去方向と未来方向の両方の文脈を利用するため、未来入力が未到着の厳密なオンライン生成にはそのまま使えません。",
    ["term-3-5-bptt-birnn"]
  ),
  syllabusQuestion(
    "dl-q031", "深層学習の基礎", "LSTM", "基礎", "3-5-2",
    "LSTMの忘却ゲートf_tが1、入力ゲートi_tが0に近いとき、セル状態c_tは主にどうなりますか？",
    ["過去のセル状態をほぼ保持する", "必ず0になる", "現在入力だけへ置き換わる", "クラス確率へ変換される"], 0,
    "c_t=f_t⊙c_(t−1)+i_t⊙c̃_tなので、f_t≈1、i_t≈0なら過去セルをほぼそのまま保持します。",
    ["term-3-5-lstm", "term-3-5-lstm-gates", "term-3-5-memory-cell", "formula-3-5-lstm-gates"]
  ),
  syllabusQuestion(
    "dl-q032", "深層学習の基礎", "LSTMとGRU", "標準", "3-5-2",
    "GRUをLSTMと区別する特徴として適切なものはどれですか？",
    ["忘却・入力・出力の3ゲートと独立セル状態を必ず持つ", "再帰結合を持たない", "Attentionだけで状態を更新する", "更新ゲートとリセットゲートを使い、独立したセル状態を持たない"], 3,
    "GRUはupdate gateとreset gateで状態を制御し、LSTMより構造が簡潔です。LSTMは独立したcell stateと3ゲートが代表的です。",
    ["term-3-5-lstm", "term-3-5-gru", "compare-3-5-lstm-gru", "compare-3-5-rnn-lstm"]
  ),
  syllabusQuestion(
    "dl-q033", "深層学習の基礎", "seq2seq", "標準", "3-5-3",
    "初期のEncoder-Decoder型seq2seqで、入力系列を固定長ベクトル1つへ圧縮する問題を緩和した仕組みはどれですか？",
    ["DropConnect", "Attention機構", "Max Pooling", "Weight Decay"], 1,
    "AttentionはDecoderが各時刻でEncoderの複数出力を重み付き参照できるため、固定長ベクトルだけに全情報を詰め込むボトルネックを緩和します。",
    ["term-3-5-seq2seq", "term-3-5-attention"]
  ),
  syllabusQuestion(
    "dl-q034", "深層学習の基礎", "Attention", "基礎", "3-5-3",
    "一般的なAttentionにおけるQuery、Key、Valueの役割として適切なものはどれですか？",
    ["Queryが値、Keyが損失、Valueが学習率", "3つは常に同じ行列でなければならない", "QueryとKeyの関連度で重みを作り、Valueを重み付き集約する", "Valueだけから重みを作り、Queryを削除する"], 2,
    "QueryとKeyの類似度からAttention重みを計算し、その重みでValueを集約します。Self-AttentionではQ/K/Vが同一系列由来です。",
    ["term-3-5-attention", "term-3-6-self-scaled", "formula-3-6-attention"]
  ),
  syllabusQuestion(
    "dl-q035", "深層学習の基礎", "Scaled Dot-Product Attention", "標準", "3-6-1",
    "Scaled Dot-Product AttentionでQKᵀを√d_kで割る主な理由はどれですか？",
    ["Key次元が大きいと内積が大きくなり、Softmaxが飽和して勾配が小さくなるのを抑える", "Valueの次元を必ず1にする", "未来トークンを削除する", "位置情報を追加する"], 0,
    "d_kが大きいと内積の分散も大きくなるため、√d_kでスケールしてSoftmaxが極端に尖るのを抑えます。",
    ["term-3-6-self-scaled", "formula-3-6-attention"]
  ),
  syllabusQuestion(
    "dl-q036", "深層学習の基礎", "Masked・Source-Target Attention", "標準", "3-6-1",
    "Transformer DecoderのSource-Target AttentionにおけるQ、K、Vの由来として適切なものはどれですか？",
    ["Q/K/VすべてEncoder出力", "Q/K/Vすべて入力埋め込み", "QはEncoder、K/VはDecoder", "QはDecoder側、K/VはEncoder出力"], 3,
    "Decoder側のQueryがEncoder出力のKeyとValueを参照します。DecoderのMasked Self-Attentionは未来トークンを遮断します。",
    ["term-3-6-source-masked", "compare-3-6-attention-self", "term-3-6-multihead-position"]
  ),
  syllabusQuestion(
    "dl-q037", "深層学習の基礎", "画像データ拡張", "基礎", "3-7-1",
    "RandAugmentとMixUpの説明として適切なものはどれですか？",
    ["両方とも検証データだけに適用する", "RandAugmentは変換数・強度を使い、MixUpは2例の入力とラベルを同じ比率で混合する", "RandAugmentは重みを0にし、MixUpは層を削除する", "両方とも必ずラベルを変更しない"], 1,
    "RandAugmentは画像変換の種類・強度を簡潔に探索し、MixUpは入力とラベルの凸結合を作ります。",
    ["term-3-7-image-augmentation", "term-3-7-randaugment-mixup", "formula-3-7-mixup"]
  ),
  syllabusQuestion(
    "dl-q038", "深層学習の基礎", "MixUp", "標準", "3-7-1",
    "MixUpでx̃=0.7x_i+0.3x_jとしたとき、ラベルの扱いとして適切なものはどれですか？",
    ["必ずy_iだけを使う", "必ずy_jだけを使う", "ỹ=0.7y_i+0.3y_jとして同じ比率で混合する", "ラベルを削除する"], 2,
    "MixUpは入力とラベルを同じλで混ぜます。分類ラベルはsoft labelになります。",
    ["term-3-7-randaugment-mixup", "formula-3-7-mixup"]
  ),
  syllabusQuestion(
    "dl-q039", "深層学習の基礎", "自然言語・音声データ拡張", "基礎", "3-7-2",
    "EDAの代表的な自然言語データ拡張に含まれるものはどれですか？",
    ["同義語置換・ランダム挿入・交換・削除", "ROI Align", "Experience Replay", "Weight Decayだけ"], 0,
    "EDAは文の意味をできるだけ保ちながら、同義語置換、挿入、交換、削除などで文章を変換します。",
    ["term-3-7-text-audio-augmentation"]
  ),
  syllabusQuestion(
    "dl-q040", "深層学習の基礎", "SpecAugment", "標準", "3-7-2",
    "SpecAugmentが主にマスクする対象はどれですか？",
    ["ニューラルネットの重み行列だけ", "画像のBounding Box", "正解ラベルのクラス番号", "音声スペクトログラムの時間帯と周波数帯"], 3,
    "SpecAugmentはスペクトログラム上でtime maskingとfrequency maskingを行い、音声認識モデルを頑健にします。",
    ["term-3-7-specaugment"]
  ),
  syllabusQuestion(
    "dl-q041", "深層学習の基礎", "正規化", "基礎", "3-7-3",
    "Batch NormalizationとLayer Normalizationの違いとして適切なものはどれですか？",
    ["両方とも推論時に必ず現在のバッチ統計を使う", "BatchNormはバッチ統計へ依存し、LayerNormは各サンプル内の特徴を正規化する", "LayerNormは画像の解像度を上げる", "BatchNormは重みを量子化する"], 1,
    "BatchNormはミニバッチ統計を使い、推論時は通常移動平均を使います。LayerNormは各サンプル内で完結し、系列モデルや小バッチでも使いやすいです。",
    ["term-3-7-normalization", "formula-3-7-batchnorm", "compare-3-7-batch-layer"]
  ),
  syllabusQuestion(
    "dl-q042", "深層学習の基礎", "Group Normalization", "標準", "3-7-3",
    "非常に小さいバッチサイズでBatchNormの統計が不安定な場合、候補となる正規化はどれですか？",
    ["NMS", "MixUp", "Group NormalizationやLayer Normalization", "CTC"], 2,
    "GroupNormやLayerNormはバッチ軸の統計へ強く依存しないため、小バッチでの候補になります。",
    ["term-3-7-normalization", "compare-3-7-batch-layer"]
  ),
  syllabusQuestion(
    "dl-q043", "深層学習の基礎", "アンサンブル", "基礎", "3-7-4",
    "Bagging、Boosting、Stackingの対応として適切なものはどれですか？",
    ["Baggingは並列的、Boostingは逐次的、Stackingはメタモデルで予測を統合する", "すべて単一モデルだけを使う", "Baggingは必ず誤差の大きい例を逐次重視する", "Stackingは学習データを使わない"], 0,
    "Baggingは再標本化したデータで複数モデルを独立学習し、Boostingは前段の誤りを意識して逐次学習し、Stackingは別のモデルで予測を統合します。",
    ["term-3-7-ensemble"]
  ),
  syllabusQuestion(
    "dl-q044", "深層学習の基礎", "Stacking", "標準", "3-7-4",
    "Stackingでメタモデルへ入力する代表的な情報はどれですか？",
    ["元モデルのソースコード", "GPUの温度", "画像のファイル名だけ", "複数のベースモデルが出した予測値"], 3,
    "Stackingは複数ベースモデルの予測を特徴として、メタモデルが最終予測を学習します。リークを防ぐためout-of-fold予測を使うことがあります。",
    ["term-3-7-ensemble"]
  ),
  syllabusQuestion(
    "dl-q045", "深層学習の基礎", "Grid・Random Search", "基礎", "3-7-5",
    "Grid SearchとRandom Searchの違いとして正しいものはどれですか？",
    ["Grid Searchは過去結果から代理モデルを更新する", "Grid Searchは候補値の直積を試し、Random Searchは分布から無作為に候補を選ぶ", "Random Searchは必ず全組合せを試す", "両方ともテスト集合で調整する"], 1,
    "Grid Searchは離散候補の全組合せ、Random Searchは探索空間から無作為抽出です。重要な次元が少ない場合、Random Searchが効率的なことがあります。",
    ["term-3-7-hyperparameter", "compare-3-7-grid-random"]
  ),
  syllabusQuestion(
    "dl-q046", "深層学習の基礎", "Bayesian Optimization", "標準", "3-7-5",
    "Bayesian Optimizationの説明として適切なものはどれですか？",
    ["候補を常に辞書順で試す", "過去結果を無視して無作為抽出だけを行う", "過去の評価結果から代理モデルを更新し、獲得関数で次の候補を選ぶ", "学習可能な重みをすべて0にする"], 2,
    "Bayesian Optimizationは評価コストの高いハイパーパラメータ探索で、代理モデルと獲得関数を使って次の評価点を選びます。",
    ["term-3-7-hyperparameter", "compare-3-7-random-bayesian"]
  )
];
