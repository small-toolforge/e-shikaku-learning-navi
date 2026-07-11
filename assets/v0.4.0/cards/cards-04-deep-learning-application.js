"use strict";

const APPLICATION_CARDS_VERSION = "v0.4.0-dev.3";

function applicationTerm(id, group, syllabusId, en, kana, ja, desc, examCue, confusion, atlasId, questionIds) {
  return {
    id, type: "term", major: "4. 深層学習の応用", group, syllabusId,
    en, kana, ja, desc, examCue, confusion: confusion || "", atlasId: atlasId || "",
    questionIds: questionIds || [], scope: "syllabus"
  };
}

function applicationFormula(id, group, syllabusId, name, fx, yomi, imi, oboe, rei, variables, mistake, atlasId, questionIds) {
  return {
    id, type: "formula", major: "4. 深層学習の応用", group, syllabusId,
    name, fx, yomi, imi, oboe, rei, variables, mistake, atlasId: atlasId || "",
    questionIds: questionIds || [], scope: "syllabus"
  };
}

function applicationCompare(id, group, syllabusId, left, right, key, atlasId, questionIds) {
  return {
    id, type: "compare", major: "4. 深層学習の応用", group, syllabusId,
    l: left, r: right, key, atlasId: atlasId || "", questionIds: questionIds || [], scope: "syllabus"
  };
}

const APPLICATION_TERM_CARDS = [
  applicationTerm("term-4-1-residual-connection", "画像認識", "4-1-1", "Residual Connection", "レジデュアル・コネクション", "残差接続", "入力xを変換経路の出力F(x)へ足し戻し、深いネットワークでも情報と勾配を流しやすくします。", "F(x)+x、skip connection、identity mappingが出たらResNet系です。", "U-Netのスキップ接続は加算ではなく連結で説明されることが多い点に注意します。", "resnet", ["app-resnet-001"]),
  applicationTerm("term-4-1-bottleneck", "画像認識", "4-1-1", "Bottleneck Block", "ボトルネック・ブロック", "ボトルネック構造", "1×1畳み込みでチャネルを減らし、3×3で処理し、1×1で戻して計算量を抑える残差ブロックです。", "1×1→3×3→1×1の並びを見つけます。", "単なる中間層のユニット数減少ではなく、ResNetの畳み込み構成として覚えます。", "resnet", []),
  applicationTerm("term-4-1-residual-block", "画像認識", "4-1-1", "Residual Block", "レジデュアル・ブロック", "残差ブロック", "畳み込みなどの主経路と入力を迂回させる経路を加算点で合流させる基本単位です。", "ブロックを積み重ねて深層化する説明が出たらResNetです。", "DenseNetのような特徴連結とは区別します。", "resnet", []),
  applicationTerm("term-4-1-wide-resnet", "画像認識", "4-1-1", "WideResNet", "ワイド・レズネット", "幅を広げた残差ネットワーク", "残差ブロックを極端に深くする代わりに、チャネル幅を広げて表現力と学習効率を高めます。", "depthではなくwidthを増やす、という対比が見分け方です。", "通常のResNetも残差接続を使う点は同じです。", "resnet", ["app-resnet-002"]),
  applicationTerm("term-4-1-patch-embedding", "画像認識", "4-1-2", "Patch Embedding", "パッチ・エンベディング", "パッチ埋め込み", "画像を固定サイズの小領域へ分割し、各パッチをTransformerへ入力できるベクトルに変換します。", "画像を単語列のように扱う入口です。", "CNNの通常畳み込みとは目的が異なり、パッチをトークン化します。", "vision-transformer", []),
  applicationTerm("term-4-1-cls-token", "画像認識", "4-1-2", "CLS Token", "シーエルエス・トークン", "分類トークン", "画像全体の情報を集約し、最終表現を分類ヘッドへ渡すための特別なトークンです。", "ViTやBERTで先頭に追加される特別トークンです。", "Position Embeddingは位置情報、CLS Tokenは分類情報の集約です。", "vision-transformer", ["app-vit-001"]),
  applicationTerm("term-4-1-shifted-window", "画像認識", "4-1-2", "Shifted Window", "シフテッド・ウィンドウ", "シフト窓", "局所窓でAttentionを計算した次の層で窓位置をずらし、窓をまたぐ情報交換を可能にします。", "通常窓とずらした窓を交互に使うのがSwin Transformerです。", "画像全体へ一度にSelf-AttentionするViTと区別します。", "vision-transformer", ["app-vit-002"]),

  applicationTerm("term-4-2-bounding-box", "物体検出", "4-2-1", "Bounding Box", "バウンディング・ボックス", "外接矩形", "物体の位置を左上・右下座標や中心・幅・高さで表す矩形です。", "分類だけでなく位置回帰を行うのが物体検出です。", "セグメンテーションの画素マスクとは表現粒度が異なります。", "detection", []),
  applicationTerm("term-4-2-roi", "物体検出", "4-2-1", "Region of Interest", "リージョン・オブ・インタレスト", "関心領域", "画像内で詳しく処理する候補領域です。R-CNN系では候補ごとに分類と位置回帰を行います。", "ROI、proposal、2-stageが同時に出たらR-CNN系です。", "RPNは候補を作るネットワーク、ROIは作られた候補領域です。", "detection", []),
  applicationTerm("term-4-2-rpn", "物体検出", "4-2-1", "Region Proposal Network", "リージョン・プロポーザル・ネットワーク", "領域提案ネットワーク", "特徴マップ上から物体候補領域と物体らしさを予測します。", "RPNが出たらFaster R-CNNの2ステージ検出です。", "YOLOやSSDはRPNとROI処理を挟まず直接予測します。", "detection", ["app-det-001"]),
  applicationTerm("term-4-2-anchor-box", "物体検出", "4-2-1", "Anchor Box", "アンカー・ボックス", "基準箱", "複数の大きさ・縦横比を持つ基準箱から位置とサイズのずれを予測します。", "anchor、default box、offset regressionが手掛かりです。", "FCOSはAnchor-Freeで、基準箱を使いません。", "detection", []),
  applicationTerm("term-4-2-roi-pooling", "物体検出", "4-2-1", "ROI Pooling", "アールオーアイ・プーリング", "領域プーリング", "大きさが異なる候補領域を固定サイズの特徴へ変換します。境界を整数へ丸めるため位置ずれが起こります。", "Fast/Faster R-CNNの固定サイズ化です。", "ROI Alignは丸めず補間し、位置ずれを減らします。", "detection", []),
  applicationTerm("term-4-2-roi-align", "物体検出", "4-2-1", "ROI Align", "アールオーアイ・アライン", "領域整列", "候補領域の座標を丸めず、双線形補間で特徴を取り出して画素レベルの位置ずれを抑えます。", "Mask R-CNNと位置ずれ補正の組合せです。", "ROI Poolingは量子化、ROI Alignは補間です。", "detection", ["app-det-002"]),
  applicationTerm("term-4-2-nms", "物体検出", "4-2-2", "Non-Maximum Suppression", "ノン・マキシマム・サプレッション", "非最大値抑制", "同じ物体を囲む重複ボックスから信頼度の高いものを残し、IoUが高い残りを除去します。", "重複箱の後処理、confidence、IoU thresholdが手掛かりです。", "Hard Negative Miningは負例選択であり、重複除去ではありません。", "detection", []),
  applicationTerm("term-4-2-hard-negative-mining", "物体検出", "4-2-2", "Hard Negative Mining", "ハード・ネガティブ・マイニング", "難しい負例の選別", "背景候補が多すぎるとき、誤分類しやすい負例を優先して学習へ使います。", "SSD、正例と負例の不均衡、難しい背景例が手掛かりです。", "NMSは推論後の重複除去、Hard Negative Miningは学習データ選択です。", "detection", []),
  applicationTerm("term-4-2-fpn", "物体検出", "4-2-3", "Feature Pyramid Network", "フィーチャー・ピラミッド・ネットワーク", "特徴ピラミッドネットワーク", "深い層の意味情報と浅い層の高解像度情報を統合し、複数スケールの物体を検出します。", "top-down path、lateral connection、multi-scaleが手掛かりです。", "画像ピラミッドを複数回推論する方法とは異なり、特徴マップを階層統合します。", "detection", ["app-det-003"]),
  applicationTerm("term-4-2-centerness", "物体検出", "4-2-3", "Center-ness", "センターネス", "中心らしさ", "予測位置が物体中心に近いほど高い値を出し、低品質な箱を抑制するFCOSの指標です。", "Anchor-Free、FCOS、中心からの上下左右距離と組み合わせます。", "分類信頼度そのものではなく、位置の中心らしさを補助評価します。", "detection", ["app-det-003"]),

  applicationTerm("term-4-3-fcn", "セマンティックセグメンテーション", "4-3-1", "Fully Convolutional Network", "フーリー・コンヴォリューショナル・ネットワーク", "全畳み込みネットワーク", "全結合層を畳み込み層へ置き換え、任意サイズ画像から画素単位の予測を出します。", "全結合層を畳み込みへ置換し、密な予測を行います。", "FCOSもFully Convolutionalですが、FCNはセグメンテーション文脈です。", "segmentation", []),
  applicationTerm("term-4-3-unet", "セマンティックセグメンテーション", "4-3-1", "U-Net", "ユーネット", "U字型セグメンテーションネットワーク", "Encoderで縮小し、Decoderで拡大しながら同解像度の特徴をスキップ連結します。", "左右対称のU字、Encoder-Decoder、skip concatが手掛かりです。", "ResNetのスキップは主に加算、U-Netは主に連結です。", "segmentation", ["app-seg-001"]),
  applicationTerm("term-4-3-upsampling", "セマンティックセグメンテーション", "4-3-1", "Up Sampling", "アップ・サンプリング", "空間解像度の拡大", "低解像度の特徴マップを補間や転置畳み込みで拡大し、画素単位出力へ戻します。", "Decoder、deconvolution、bilinear interpolationが手掛かりです。", "Poolingは縮小、Up Samplingは拡大です。", "segmentation", []),
  applicationTerm("term-4-3-instance-segmentation", "セマンティックセグメンテーション", "4-3-1", "Instance Segmentation", "インスタンス・セグメンテーション", "インスタンスセグメンテーション", "同じクラスの複数物体も個体ごとに分けて画素マスクを予測します。", "物体ごとの別マスク、Mask R-CNNが手掛かりです。", "Semantic Segmentationは同じクラスを一つの領域として扱います。", "segmentation", ["app-seg-002"]),
  applicationTerm("term-4-3-panoptic-segmentation", "セマンティックセグメンテーション", "4-3-1", "Panoptic Segmentation", "パノプティック・セグメンテーション", "パノプティックセグメンテーション", "背景などのstuffをクラス分類し、数えられるthingを個体分離して一つの結果へ統合します。", "SemanticとInstanceを統合する説明が手掛かりです。", "単に両結果を並べるだけでなく、全画素へ一貫したラベルを与えます。", "segmentation", []),

  applicationTerm("term-4-4-lsi", "自然言語処理", "4-4-1", "Latent Semantic Indexing", "レイテント・セマンティック・インデクシング", "潜在的意味インデキシング", "単語文書行列を特異値分解し、低次元の潜在意味空間へ圧縮します。", "SVD、単語文書行列、潜在意味が手掛かりです。", "Word2vecは予測学習、LSIは行列分解です。", "word-embedding", []),
  applicationTerm("term-4-4-word2vec", "自然言語処理", "4-4-1", "Word2vec", "ワード・トゥ・ベック", "単語ベクトル学習", "周辺文脈を使う予測課題から、意味的に近い単語が近づく分散表現を学習します。", "CBOW、Skip-gram、Negative Samplingが同時に出ます。", "one-hot表現ではなく密な低次元ベクトルです。", "word-embedding", []),
  applicationTerm("term-4-4-cbow", "自然言語処理", "4-4-1", "Continuous Bag-of-Words", "コンティニュアス・バッグ・オブ・ワーズ", "周辺語から中心語を予測", "前後の周辺単語をまとめて入力し、中心単語を予測します。", "多対1、context→targetがCBOWです。", "Skip-gramは中心語から周辺語を予測します。", "word-embedding", ["app-word-001"]),
  applicationTerm("term-4-4-skipgram", "自然言語処理", "4-4-1", "Skip-gram", "スキップ・グラム", "中心語から周辺語を予測", "中心単語を入力し、その周辺に現れる単語を予測します。", "1対多、target→contextがSkip-gramです。", "CBOWと予測方向を逆にしないようにします。", "word-embedding", ["app-word-001"]),
  applicationTerm("term-4-4-negative-sampling", "自然言語処理", "4-4-1", "Negative Sampling", "ネガティブ・サンプリング", "負例サンプリング", "全語彙へのSoftmaxを計算せず、正例と少数の負例だけを二値分類して計算を軽量化します。", "巨大語彙、少数の負例、Word2vec高速化が手掛かりです。", "Hard Negative Miningは難しい負例を選ぶ物体検出文脈です。", "word-embedding", ["app-word-002"]),
  applicationTerm("term-4-4-mlm", "自然言語処理", "4-4-2", "Masked Language Modeling", "マスクト・ランゲージ・モデリング", "マスク言語モデル", "入力の一部を[MASK]などで隠し、前後の文脈から元のトークンを予測します。", "双方向文脈、BERT、穴埋めが手掛かりです。", "GPTのNext Token Predictionは過去方向だけを使います。", "llm", ["app-llm-001"]),
  applicationTerm("term-4-4-nsp", "自然言語処理", "4-4-2", "Next Sentence Prediction", "ネクスト・センテンス・プレディクション", "次文予測", "2つの文が実際に連続するかを判定するBERTの事前学習課題です。", "文対、segment embedding、BERTが手掛かりです。", "Next Token Predictionは次の単語を予測するGPT系の課題です。", "llm", ["app-llm-001"]),
  applicationTerm("term-4-4-next-token", "自然言語処理", "4-4-3", "Next Token Prediction", "ネクスト・トークン・プレディクション", "次トークン予測", "過去のトークン列を条件に次のトークン確率を予測し、反復して文章を生成します。", "causal mask、自己回帰、GPTが手掛かりです。", "NSPは文の連続関係を判定するBERTの課題です。", "llm", ["app-llm-002"]),
  applicationTerm("term-4-4-rag", "自然言語処理", "4-4-3", "Retrieval-Augmented Generation", "リトリーバル・オーグメンテッド・ジェネレーション", "検索拡張生成", "質問に関連する外部文書を検索し、その内容をコンテキストとして生成モデルへ渡します。", "Retriever、外部文書、Generatorの組合せです。", "モデルの重みを追加学習するFine-tuningとは異なります。", "llm", ["app-llm-003"]),
  applicationTerm("term-4-4-autoregressive", "自然言語処理", "4-4-3", "Autoregressive", "オートリグレッシブ", "自己回帰", "既に生成した要素を条件に次の要素を一つずつ生成します。", "p(xₜ|x₁…xₜ₋₁)、causal、逐次生成が手掛かりです。", "拡散モデルはノイズを段階的に除去して並列的な表現を復元します。", "llm", ["app-llm-002"]),

  applicationTerm("term-4-5-sampling-theorem", "音声処理", "4-5-1", "Sampling Theorem", "サンプリング・セオレム", "標本化定理", "最高周波数の2倍を超えるサンプリング周波数で標本化すれば、元信号を理論上復元できます。", "2倍、Nyquist frequency、aliasingが手掛かりです。", "Nyquist周波数はサンプリング周波数の半分です。", "speech", []),
  applicationTerm("term-4-5-nyquist", "音声処理", "4-5-1", "Nyquist Frequency", "ナイキスト・フリークエンシー", "ナイキスト周波数", "サンプリング周波数の半分で、表現できる最高周波数の上限です。", "fs/2という関係を覚えます。", "最高信号周波数の2倍が必要なSampling Theoremと表裏の関係です。", "speech", []),
  applicationTerm("term-4-5-stft", "音声処理", "4-5-1", "Short-Time Fourier Transform", "ショートタイム・フーリエ・トランスフォーム", "短時間フーリエ変換", "音声を短い窓へ分割し、各区間の周波数成分を求めて時間周波数表現を作ります。", "window function、overlap、spectrogramが手掛かりです。", "FFTは高速計算アルゴリズム、STFTは時間変化を扱う分析手順です。", "speech", ["app-speech-001"]),
  applicationTerm("term-4-5-mel-spectrogram", "音声処理", "4-5-1", "Mel Spectrogram", "メル・スペクトログラム", "メルスペクトログラム", "スペクトログラムの周波数軸を人の聴覚に近いMel尺度へ変換します。", "低周波を細かく、高周波を粗く扱います。", "MFCCはMelスペクトルをさらに対数化・DCTして圧縮します。", "speech", []),
  applicationTerm("term-4-5-mfcc", "音声処理", "4-5-1", "Mel-Frequency Cepstral Coefficients", "メル・フリークエンシー・ケプストラル・コエフィシェンツ", "メル周波数ケプストラム係数", "Melフィルタバンク出力を対数化し、離散コサイン変換して得る音響特徴量です。", "Mel、log、DCT、cepstrumの流れが手掛かりです。", "Mel Spectrogramそのものより低次元の係数表現です。", "speech", []),
  applicationTerm("term-4-5-dilated-causal", "音声処理", "4-5-2", "Dilated Causal Convolution", "ダイレイテッド・コーザル・コンヴォリューション", "拡張因果畳み込み", "未来を参照しない因果畳み込みの間隔を広げ、少ない層で広い過去の受容野を持たせます。", "WaveNet、dilation、causalが手掛かりです。", "通常畳み込みは未来側の入力も参照する場合があります。", "speech", ["app-speech-002"]),
  applicationTerm("term-4-5-ctc", "音声処理", "4-5-3", "Connectionist Temporal Classification", "コネクショニスト・テンポラル・クラシフィケーション", "時系列分類", "入力フレームと出力文字列の厳密な位置対応がなくても、blankと重複を含む全経路を合算して学習します。", "blank、collapse、forward-backward、End-to-End音声認識が手掛かりです。", "Attention型seq2seqとは異なり、単調な位置合わせを前提にします。", "speech", ["app-speech-003"]),

  applicationTerm("term-4-6-autoencoder", "生成モデル", "4-6-2", "Autoencoder", "オートエンコーダー", "自己符号化器", "Encoderで入力を潜在表現へ圧縮し、Decoderで元入力を再構成します。", "入力と教師が同じ、reconstruction lossが手掛かりです。", "VAEは潜在表現を確率分布として扱います。", "generative", []),
  applicationTerm("term-4-6-denoising-ae", "生成モデル", "4-6-2", "Denoising Autoencoder", "デノイジング・オートエンコーダー", "ノイズ除去自己符号化器", "ノイズを加えた入力から元のきれいな入力を再構成し、頑健な特徴表現を学びます。", "corrupted input→clean targetが手掛かりです。", "拡散モデルもノイズ除去を使いますが、多段の確率過程として生成します。", "generative", []),
  applicationTerm("term-4-6-vae", "生成モデル", "4-6-2", "Variational Autoencoder", "ヴァリエーショナル・オートエンコーダー", "変分自己符号化器", "潜在変数の平均と分散を学び、再構成項とKL項を含む変分下限を最大化します。", "μ、σ、KL divergence、Reparameterization Trickが手掛かりです。", "通常AEは潜在点を直接出し、確率分布を強制しません。", "generative", ["app-gen-001"]),
  applicationTerm("term-4-6-reparameterization", "生成モデル", "4-6-2", "Reparameterization Trick", "リパラメータライゼーション・トリック", "再パラメータ化トリック", "確率的サンプリングz=μ+σ⊙εと書き換え、μとσへ勾配を伝えられるようにします。", "εを標準正規分布から取り、学習対象と乱数を分離します。", "単に乱数を固定する方法ではありません。", "generative", ["app-gen-001"]),
  applicationTerm("term-4-6-elbo", "生成モデル", "4-6-2", "Evidence Lower Bound", "エビデンス・ローワー・バウンド", "変分下限", "対数尤度の下限で、再構成の良さと潜在分布を事前分布へ近づける項から構成されます。", "reconstruction termとKL divergenceの組合せです。", "損失として実装すると符号を反転して最小化することがあります。", "generative", []),
  applicationTerm("term-4-6-gan", "生成モデル", "4-6-3", "Generative Adversarial Network", "ジェネレーティブ・アドバーサリアル・ネットワーク", "敵対的生成ネットワーク", "Generatorが偽データを作り、Discriminatorが真偽を判定する二者の敵対学習です。", "minimax、Generator、Discriminatorが手掛かりです。", "VAEのように明示的なEncoderとKL項を必須としません。", "generative", ["app-gen-002"]),
  applicationTerm("term-4-6-mode-collapse", "生成モデル", "4-6-3", "Mode Collapse", "モード・コラプス", "モード崩壊", "Generatorが訓練分布の一部だけを出力し、多様性を失うGAN特有の失敗です。", "似たサンプルばかり生成する説明が手掛かりです。", "勾配消失とは別の現象です。", "generative", ["app-gen-002"]),
  applicationTerm("term-4-6-diffusion", "生成モデル", "4-6-1", "Diffusion Model", "ディフュージョン・モデル", "拡散モデル", "データへ徐々にノイズを加える順過程の逆を学び、ノイズから段階的にデータを生成します。", "noise schedule、denoising、reverse processが手掛かりです。", "GANのような識別器との対戦ではありません。", "generative", ["app-gen-003"]),

  applicationTerm("term-4-7-dqn", "深層強化学習", "4-7-1", "Deep Q-Network", "ディープ・キュー・ネットワーク", "深層Qネットワーク", "行動価値関数Q(s,a)をニューラルネットワークで近似し、最大Qの行動を選びます。", "Q-learning、Experience Replay、target networkが手掛かりです。", "Actor-Criticは方策と価値を別の役割として学習します。", "deep-rl", ["app-rl-001"]),
  applicationTerm("term-4-7-td-learning", "深層強化学習", "4-7-1", "Temporal-Difference Learning", "テンポラル・ディファレンス・ラーニング", "時間差分学習", "現在の価値推定と報酬＋次状態の推定値から作る目標との差で更新します。", "bootstrap、TD error、1-step targetが手掛かりです。", "Monte Carlo法はエピソード終了後の実際の収益を使います。", "deep-rl", []),
  applicationTerm("term-4-7-experience-replay", "深層強化学習", "4-7-1", "Experience Replay", "エクスペリエンス・リプレイ", "経験再生", "状態遷移をバッファへ保存し、ランダムに取り出して時系列相関を弱め、データを再利用します。", "replay buffer、random minibatch、DQNが手掛かりです。", "A3Cは複数Workerで相関を弱め、基本形ではReplay Bufferを使いません。", "deep-rl", ["app-rl-001"]),
  applicationTerm("term-4-7-actor-critic", "深層強化学習", "4-7-2", "Actor-Critic", "アクター・クリティック", "方策と価値の分業", "Actorが行動方策を出し、Criticが価値を評価してActorの更新方向を与えます。", "Actor=policy、Critic=value、advantageが手掛かりです。", "DQNは行動価値を直接出す価値ベース手法です。", "deep-rl", ["app-rl-002"]),

  applicationTerm("term-4-8-contrastive-learning", "様々な学習方法", "4-8-2", "Contrastive Learning", "コントラスティブ・ラーニング", "対照学習", "同じ対象から作ったPositive Pairを近づけ、異なる対象を遠ざける表現を学習します。", "positive pair、augmentation、representation learningが手掛かりです。", "Contrastive Lossは距離学習の損失名としても使われます。", "learning-methods", []),
  applicationTerm("term-4-8-triplet-loss", "様々な学習方法", "4-8-4", "Triplet Loss", "トリプレット・ロス", "三つ組損失", "AnchorとPositiveの距離がAnchorとNegativeの距離よりマージン分だけ小さくなるよう学習します。", "Anchor・Positive・Negativeの3サンプルです。", "Contrastive Lossは通常2サンプルのペア比較です。", "learning-methods", ["app-learn-002"]),
  applicationTerm("term-4-9-gradcam", "深層学習の説明性", "4-9-1", "Grad-CAM", "グラッド・カム", "勾配を使うクラス活性化マップ", "対象クラスの勾配で畳み込み特徴マップを重み付けし、判断に寄与した画像領域を可視化します。", "CNN、最終畳み込み層、ヒートマップが手掛かりです。", "Integrated Gradientsは入力特徴ごとの寄与で、特徴マップを必須としません。", "xai", ["app-xai-001"]),
  applicationTerm("term-4-9-integrated-gradients", "深層学習の説明性", "4-9-1", "Integrated Gradients", "インテグレーテッド・グラディエンツ", "積分勾配", "Baselineから実入力までの直線経路上で勾配を積分し、各入力特徴の寄与を求めます。", "baseline、path integral、入力特徴の帰属が手掛かりです。", "Grad-CAMはCNNの空間ヒートマップ、IGは入力次元ごとの帰属です。", "xai", ["app-xai-002"])
];

const APPLICATION_FORMULA_CARDS = [
  applicationFormula("formula-4-1-residual", "画像認識", "4-1-1", "残差接続", "H(x) = F(x) + x", "エイチ・オブ・エックスは、エフ・オブ・エックス足すエックス", "学習した残差写像F(x)へ入力xを足し、目的写像H(x)を作ります。", "変換した結果に、元の入力を足し戻す", "F(x)=2、x=3ならH(x)=5", "H: ブロック出力、F: 主経路の変換、x: 入力", "加算と連結を混同しないこと。ResNetは基本的に加算です。", "resnet", ["app-resnet-001"]),
  applicationFormula("formula-4-2-iou", "物体検出", "4-2-1", "Intersection over Union", "IoU = |A ∩ B| / |A ∪ B|", "アイオーユーは、エーとビーの共通部分の面積を、和集合の面積で割る", "予測領域と正解領域の重なりを0から1で評価します。", "重なった面積を、両方を合わせた面積で割る", "共通部分40、和集合100ならIoU=0.4", "A: 予測領域、B: 正解領域", "分母をAとBの面積の単純和にせず、重複を一度だけ数える和集合にします。", "detection", []),
  applicationFormula("formula-4-2-ap-map", "物体検出", "4-2-1", "Average Precision / mAP", "mAP = (1/C) Σ AP_c", "エムエーピーは、シー分の一掛ける、各クラスのエーピーの合計", "各クラスのPrecision-Recall曲線の面積APを平均した物体検出指標です。", "クラスごとの検出精度を平均する", "3クラスのAPが0.8、0.6、0.7ならmAP=0.7", "C: クラス数、AP_c: クラスcのAverage Precision", "Accuracyの平均ではありません。IoU閾値の条件も確認します。", "detection", []),
  applicationFormula("formula-4-5-stft", "音声処理", "4-5-1", "短時間フーリエ変換", "X(m,ω) = Σ x[n] w[n−m] e^(−jωn)", "エックス・オブ・エム・オメガは、エックス・エヌ掛ける窓関数と複素指数の積を、エヌについて足し合わせる", "信号へ時間窓を掛け、窓位置mごとに周波数成分を求めます。", "短く切って、窓を掛けて、区間ごとにフーリエ変換", "窓を少しずつずらすと時間×周波数のスペクトログラムになります", "x[n]: 波形、w: 窓関数、m: 窓位置、ω: 角周波数", "FFTは計算方法、STFTは窓をずらして時間変化を扱う処理です。", "speech", ["app-speech-001"]),
  applicationFormula("formula-4-6-reparameterization", "生成モデル", "4-6-2", "再パラメータ化", "z = μ + σ ⊙ ε,  ε ~ N(0,I)", "ゼットは、ミュー足すシグマ掛けるイプシロン。イプシロンは標準正規分布に従う", "乱数εを外へ分離し、μとσを決定的な計算として逆伝播可能にします。", "平均に、標準偏差掛ける標準正規乱数を足す", "μ=2、σ=0.5、ε=1ならz=2.5", "μ: 平均、σ: 標準偏差、ε: 標準正規乱数", "σ²をそのまま掛けず、標準偏差σを使います。", "generative", ["app-gen-001"]),
  applicationFormula("formula-4-6-elbo", "生成モデル", "4-6-2", "変分下限", "ELBO = E_q[log p(x|z)] − KL(q(z|x) || p(z))", "エルボーは、再構成対数尤度の期待値から、近似事後分布と事前分布のケーエル・ダイバージェンスを引く", "データ再構成を良くしつつ、潜在分布を事前分布へ近づけます。", "よく戻す力から、潜在分布のずれを引く", "再構成項が高くKLが小さいほどELBOは大きくなります", "q: 近似事後、p(z): 事前分布、p(x|z): Decoder", "損失として実装すると−ELBOを最小化するため符号が逆になります。", "generative", []),
  applicationFormula("formula-4-6-gan", "生成モデル", "4-6-3", "GANのMinimax目的", "min_G max_D  E_x[log D(x)] + E_z[log(1−D(G(z)))]", "ジェネレーターについて最小化し、ディスクリミネーターについて最大化する、実データのログ判定と偽データのログ判定の和", "Discriminatorは真偽を正しく判定し、Generatorは偽データを本物と思わせるよう競います。", "見破る側を強くし、作る側は見破られないようにする", "D(x)は1へ、D(G(z))は0へ近づけたいのがDiscriminatorです", "G: 生成器、D: 識別器、x: 実データ、z: 潜在ノイズ", "Generator更新時の実装では飽和回避のため−log D(G(z))を使うことがあります。", "generative", ["app-gen-002"]),
  applicationFormula("formula-4-7-qlearning", "深層強化学習", "4-7-1", "Q学習の更新", "Q(s,a) ← Q(s,a) + α[r + γ max_a' Q(s',a') − Q(s,a)]", "キュー・エス・エーを、現在のキューに、アルファ掛ける、報酬足すガンマ掛ける次状態の最大キューから現在のキューを引いた値を足して更新する", "現在のQ値を、TD誤差の一部だけ目標へ近づけます。", "今の予測を、報酬と次の最大価値へ少し近づける", "α=0.1、TD誤差=2ならQへ0.2を加えます", "α: 学習率、γ: 割引率、r: 報酬、s': 次状態", "SARSAは次に実際に選んだ行動のQを使い、Q学習は最大Qを使います。", "deep-rl", []),
  applicationFormula("formula-4-8-triplet", "様々な学習方法", "4-8-4", "Triplet Loss", "L = max(0, d(a,p) − d(a,n) + m)", "エルは、ゼロと、アンカー・ポジティブ距離からアンカー・ネガティブ距離を引きマージンを足した値の、大きい方", "PositiveをAnchorへ近づけ、Negativeをマージン以上遠ざけます。", "似たものは近く、違うものはマージン分遠く", "d(a,p)=0.4、d(a,n)=0.9、m=0.3ならL=0", "a: Anchor、p: Positive、n: Negative、m: Margin", "距離の符号を逆にしないこと。Positive距離を小さくします。", "learning-methods", ["app-learn-002"]),
  applicationFormula("formula-4-9-integrated-gradients", "深層学習の説明性", "4-9-1", "Integrated Gradients", "IG_i(x) = (x_i−x'_i) ∫₀¹ ∂F(x'+α(x−x'))/∂x_i dα", "アイジー・アイは、入力とベースラインの差に、ベースラインから入力までの経路上の勾配をゼロから一まで積分した値を掛ける", "Baselineから実入力までの経路で勾配を平均し、特徴iの寄与を求めます。", "入力差掛ける、道中の勾配の積分", "黒画像をbaselineにして画像まで徐々に変化させ、各画素の寄与を求めます", "x: 入力、x': Baseline、F: モデル出力、α: 経路位置", "一点の勾配だけではなく、経路全体を積分します。", "xai", ["app-xai-002"])
];

const APPLICATION_COMPARE_CARDS = [
  applicationCompare("compare-4-1-resnet-wide", "画像認識", "4-1-1", {t:"ResNet",k:"レズネット",j:"深さを残差接続で支える",d:"Residual Blockを深く積み重ねる"}, {t:"WideResNet",k:"ワイド・レズネット",j:"幅を広げる",d:"残差ブロックのチャネル数を増やす"}, "どちらも残差接続。ResNetは深さ、WideResNetは幅が主な対比です。", "resnet", ["app-resnet-002"]),
  applicationCompare("compare-4-1-vit-swin", "画像認識", "4-1-2", {t:"Vision Transformer",k:"ヴィジョン・トランスフォーマー",j:"全体パッチAttention",d:"CLS tokenとPosition embedding"}, {t:"Swin Transformer",k:"スウィン・トランスフォーマー",j:"局所窓の階層Attention",d:"Shifted Windowで窓間を接続"}, "CLS token中心ならViT、Window MSAとShifted WindowならSwinです。", "vision-transformer", ["app-vit-002"]),
  applicationCompare("compare-4-2-two-one-stage", "物体検出", "4-2", {t:"Two-stage",k:"ツー・ステージ",j:"候補生成後に分類",d:"RPN→ROI→Class/Box"}, {t:"One-stage",k:"ワン・ステージ",j:"画像全体から直接予測",d:"YOLO、SSD、FCOS"}, "RPNやROIがあれば2ステージ、密に直接出すなら1ステージです。", "detection", ["app-det-001"]),
  applicationCompare("compare-4-2-faster-mask", "物体検出", "4-2-1", {t:"Faster R-CNN",k:"ファスター・アールシーエヌエヌ",j:"箱とクラス",d:"RPN＋ROI Pooling"}, {t:"Mask R-CNN",k:"マスク・アールシーエヌエヌ",j:"箱・クラス・個体マスク",d:"ROI Align＋Mask Branch"}, "マスク分岐とROI Alignが加わるのがMask R-CNNです。", "detection", ["app-det-002"]),
  applicationCompare("compare-4-2-yolo-ssd", "物体検出", "4-2-2", {t:"YOLO",k:"ヨーロー",j:"グリッドから一括予測",d:"高速な1ステージ検出"}, {t:"SSD",k:"エスエスディー",j:"複数特徴マップで検出",d:"Default BoxとHard Negative Mining"}, "どちらも1ステージ。Default BoxとHard Negative Miningが強ければSSDです。", "detection", []),
  applicationCompare("compare-4-2-anchor-fcos", "物体検出", "4-2-3", {t:"Anchor-based",k:"アンカー・ベースド",j:"基準箱から補正",d:"RPN、SSDなど"}, {t:"FCOS",k:"エフコス",j:"Anchor-Free",d:"上下左右距離＋Center-ness"}, "基準箱のoffsetならAnchor-based、位置から直接距離を出すならFCOSです。", "detection", ["app-det-003"]),
  applicationCompare("compare-4-3-semantic-instance", "セマンティックセグメンテーション", "4-3-1", {t:"Semantic",k:"セマンティック",j:"クラス単位",d:"同クラスの物体を区別しない"}, {t:"Instance",k:"インスタンス",j:"個体単位",d:"同クラスでも物体ごとに別マスク"}, "クラス領域だけならSemantic、物体IDまで分けるならInstanceです。", "segmentation", ["app-seg-002"]),
  applicationCompare("compare-4-3-instance-panoptic", "セマンティックセグメンテーション", "4-3-1", {t:"Instance",k:"インスタンス",j:"Thingを個体分離",d:"数えられる物体中心"}, {t:"Panoptic",k:"パノプティック",j:"Thing＋Stuff",d:"全画素をSemanticとInstanceで統合"}, "背景を含む全画素まで一貫して扱うのがPanopticです。", "segmentation", []),
  applicationCompare("compare-4-4-cbow-skipgram", "自然言語処理", "4-4-1", {t:"CBOW",k:"シーボウ",j:"周辺→中心",d:"複数の文脈から中心語を予測"}, {t:"Skip-gram",k:"スキップ・グラム",j:"中心→周辺",d:"中心語から複数の周辺語を予測"}, "矢印の向きだけをまず固定します。CBOWは周辺から中心です。", "word-embedding", ["app-word-001"]),
  applicationCompare("compare-4-4-bert-gpt", "自然言語処理", "4-4-2", {t:"BERT",k:"バート",j:"双方向Encoder",d:"MLM、NSP、文理解"}, {t:"GPT",k:"ジーピーティー",j:"自己回帰Decoder",d:"Next Token Prediction、生成"}, "[MASK]穴埋めならBERT、Causal Maskで次語生成ならGPTです。", "llm", ["app-llm-001","app-llm-002"]),
  applicationCompare("compare-4-4-gpt-rag", "自然言語処理", "4-4-3", {t:"GPT only",k:"ジーピーティー",j:"モデル内部知識で生成",d:"Promptから次トークンを生成"}, {t:"RAG",k:"ラグ",j:"外部検索を追加",d:"Retriever→Documents→Generator"}, "外部文書を取得してコンテキストへ入れる工程があればRAGです。", "llm", ["app-llm-003"]),
  applicationCompare("compare-4-5-mel-mfcc", "音声処理", "4-5-1", {t:"Mel Spectrogram",k:"メル・スペクトログラム",j:"時間×Mel周波数",d:"画像状のスペクトル表現"}, {t:"MFCC",k:"エムエフシーシー",j:"ケプストラム係数",d:"Log MelをDCTして低次元化"}, "スペクトル画像ならMel、DCT後の係数列ならMFCCです。", "speech", []),
  applicationCompare("compare-4-6-ae-vae", "生成モデル", "4-6-2", {t:"Autoencoder",k:"オートエンコーダー",j:"決定的な潜在表現",d:"再構成誤差中心"}, {t:"VAE",k:"ブイエーイー",j:"確率的な潜在分布",d:"μ・σ、KL、Reparameterization"}, "潜在分布とKL項があればVAEです。", "generative", ["app-gen-001"]),
  applicationCompare("compare-4-6-vae-gan", "生成モデル", "4-6", {t:"VAE",k:"ブイエーイー",j:"尤度下限を最適化",d:"Encoder/Decoder、ELBO"}, {t:"GAN",k:"ギャン",j:"敵対学習",d:"Generator/Discriminator"}, "KLと再構成ならVAE、真偽対戦ならGANです。", "generative", ["app-gen-001","app-gen-002"]),
  applicationCompare("compare-4-6-gan-diffusion", "生成モデル", "4-6", {t:"GAN",k:"ギャン",j:"一回のGenerator生成",d:"敵対学習、Mode Collapse"}, {t:"Diffusion",k:"ディフュージョン",j:"反復ノイズ除去",d:"順過程と逆過程"}, "識別器との対戦はGAN、ノイズを段階的に除くのはDiffusionです。", "generative", ["app-gen-002","app-gen-003"]),
  applicationCompare("compare-4-7-dqn-a3c", "深層強化学習", "4-7", {t:"DQN",k:"ディーキューエヌ",j:"価値ベース",d:"Q学習、Replay Buffer"}, {t:"A3C",k:"エースリーシー",j:"方策＋価値",d:"非同期Worker、Actor-Critic"}, "Q(s,a)と経験再生ならDQN、複数WorkerとActor/CriticならA3Cです。", "deep-rl", ["app-rl-001","app-rl-002"]),
  applicationCompare("compare-4-8-pair-triplet", "様々な学習方法", "4-8-4", {t:"Siamese / Contrastive",k:"サイアミーズ／コントラスティブ",j:"2サンプル比較",d:"Positive/Negative Pair"}, {t:"Triplet Network",k:"トリプレット・ネットワーク",j:"3サンプル比較",d:"Anchor/Positive/Negative"}, "2つならContrastive Loss、3つならTriplet Lossです。", "learning-methods", ["app-learn-002"]),
  applicationCompare("compare-4-9-gradcam-ig", "深層学習の説明性", "4-9-1", {t:"Grad-CAM",k:"グラッド・カム",j:"CNN特徴マップ",d:"クラス勾配で空間ヒートマップ"}, {t:"Integrated Gradients",k:"インテグレーテッド・グラディエンツ",j:"入力特徴の寄与",d:"Baselineから入力まで勾配積分"}, "畳み込み特徴マップならGrad-CAM、Baselineと経路積分ならIGです。", "xai", ["app-xai-001","app-xai-002"]),
  applicationCompare("compare-4-9-lime-shap", "深層学習の説明性", "4-9-2", {t:"LIME",k:"ライム",j:"局所代理モデル",d:"周辺を摂動し単純モデルで近似"}, {t:"SHAP",k:"シャップ",j:"Shapley Value",d:"特徴連合への公平な寄与配分"}, "局所的な線形近似ならLIME、協力ゲーム理論ならSHAPです。", "xai", ["app-xai-003"])
];

TERMS.push(...APPLICATION_TERM_CARDS);
FORMULAS.push(...APPLICATION_FORMULA_CARDS);
COMPARES.push(...APPLICATION_COMPARE_CARDS);
