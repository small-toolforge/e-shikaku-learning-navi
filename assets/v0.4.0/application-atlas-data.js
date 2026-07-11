"use strict";

const APPLICATION_ATLAS_VERSION = "v0.4.0-dev.2";

function applicationNode(id, x, y, w, h, label, en, kana, ja, desc, exam, kind) {
  return { id, x, y, w, h, label, en, kana, ja, desc, exam, kind: kind || "default" };
}

function applicationEdge(from, to, label, dashed) {
  return { from, to, label: label || "", dashed: Boolean(dashed) };
}

const APPLICATION_ATLASES = [
  {
    id: "resnet",
    order: 10,
    category: "4-(1) 画像認識",
    title: "ResNet / WideResNet",
    kana: "レズネット／ワイド・レズネット",
    ja: "残差ネットワーク／幅を広げた残差ネットワーク",
    summary: "残差写像F(x)と恒等写像xを足すことで、深いネットワークでも勾配と情報を流しやすくする構造です。WideResNetは深さだけでなくチャネル幅を広げます。",
    syllabus: ["残差接続（skip-connection）", "ボトルネック構造", "Residual Block", "WideResNet"],
    viewBox: "0 0 760 430",
    nodes: [
      applicationNode("input", 25, 175, 105, 58, ["Input", "x"], "Input", "インプット", "入力", "残差ブロックへ入る特徴量です。恒等経路にも分岐します。", "xが主経路とスキップ経路へ分かれる図を見たら残差接続です。", "input"),
      applicationNode("conv1", 180, 95, 125, 58, ["Conv", "1×1 / 3×3"], "Convolution", "コンヴォリューション", "畳み込み", "特徴を変換する主経路です。ボトルネックでは1×1、3×3、1×1を組み合わせます。", "1×1でチャネルを絞り、3×3で処理し、1×1で戻す並びがボトルネックです。", "main"),
      applicationNode("conv2", 365, 95, 125, 58, ["Conv", "3×3"], "Convolution", "コンヴォリューション", "畳み込み", "残差写像F(x)を学習します。", "ResNetは直接H(x)ではなくF(x)=H(x)-xを学ぶ説明が定番です。", "main"),
      applicationNode("skip", 260, 285, 160, 58, ["Identity / 1×1", "Skip Connection"], "Skip Connection", "スキップ・コネクション", "残差接続", "入力xをほぼそのまま後段へ送ります。形状が違うときは1×1畳み込みで合わせます。", "恒等写像または1×1畳み込みが加算点へ直結します。", "skip"),
      applicationNode("add", 545, 175, 80, 58, ["Add", "+"], "Addition", "アディション", "加算", "主経路のF(x)とスキップ経路のxを足し、H(x)=F(x)+xを作ります。", "足し算ならResidual、連結ならDenseNetやU-Netの可能性を疑います。", "merge"),
      applicationNode("output", 660, 175, 80, 58, ["ReLU", "Output"], "Output", "アウトプット", "出力", "加算後の特徴を次の残差ブロックへ渡します。", "同じ構造が多数積み重なる点もResNetの特徴です。", "output")
    ],
    edges: [
      applicationEdge("input", "conv1"), applicationEdge("conv1", "conv2"), applicationEdge("conv2", "add", "F(x)"),
      applicationEdge("input", "skip", "x", true), applicationEdge("skip", "add", "identity", true), applicationEdge("add", "output")
    ],
    reading: ["入力xを主経路とスキップ経路へ分ける", "主経路で残差写像F(x)を計算する", "F(x)+xを加算する", "WideResNetでは残差ブロックのチャネル幅を広げる"],
    compare: [["ResNet", "深さを増やし、残差接続で学習を安定化"], ["WideResNet", "極端に深くせず、チャネル幅を広げて表現力を増やす"], ["Bottleneck", "1×1→3×3→1×1で計算量とチャネル数を調整"]],
    questionIds: ["app-resnet-001", "app-resnet-002"],
    sources: [{ title: "Deep Residual Learning for Image Recognition", url: "https://arxiv.org/abs/1512.03385", year: 2015 }, { title: "Wide Residual Networks", url: "https://arxiv.org/abs/1605.07146", year: 2016 }]
  },
  {
    id: "vision-transformer",
    order: 20,
    category: "4-(1) 画像認識",
    title: "Vision Transformer / Swin Transformer",
    kana: "ヴィジョン・トランスフォーマー／スウィン・トランスフォーマー",
    ja: "画像Transformer／シフト窓を使う階層型画像Transformer",
    summary: "画像をパッチへ分割し、トークン列としてTransformerへ入力します。Swin Transformerは局所窓とShifted Windowで計算量を抑えつつ窓をまたぐ情報を交換します。",
    syllabus: ["Shifted window", "CLS token", "Position embedding", "Vision Transformer"],
    viewBox: "0 0 760 440",
    nodes: [
      applicationNode("image", 20, 180, 100, 62, ["Image"], "Image", "イメージ", "画像", "入力画像です。", "ViTでは画像をそのまま畳み込むのではなくパッチ列へ変換します。", "input"),
      applicationNode("patch", 155, 180, 120, 62, ["Patch", "Split"], "Patch Split", "パッチ・スプリット", "パッチ分割", "画像を固定サイズの小領域へ分割します。", "画像を単語のようなトークンへ置き換える入口です。", "main"),
      applicationNode("embed", 315, 95, 145, 62, ["Patch Embedding", "+ Position"], "Patch Embedding", "パッチ・エンベディング", "パッチ埋め込み", "各パッチをベクトル化し、位置埋め込みを加えます。", "Position embeddingはパッチの並び順を伝えます。", "position"),
      applicationNode("cls", 315, 275, 145, 62, ["CLS Token"], "Classification Token", "クラシフィケーション・トークン", "分類トークン", "画像全体の分類結果を集約する特別なトークンです。", "CLS tokenの出力を分類ヘッドへ渡すのがViTの典型です。", "special"),
      applicationNode("encoder", 500, 180, 130, 62, ["Transformer", "Encoder"], "Transformer Encoder", "トランスフォーマー・エンコーダー", "Transformerエンコーダ", "Self-Attentionでパッチ間の関係を学習します。", "ViTは基本的にEncoderのみを使います。", "attention"),
      applicationNode("head", 660, 180, 80, 62, ["Head"], "Classification Head", "クラシフィケーション・ヘッド", "分類ヘッド", "CLS tokenなどを用いてクラスを予測します。", "最後は線形層などで分類します。", "output"),
      applicationNode("window", 500, 325, 175, 62, ["Window MSA", "Shifted Window"], "Shifted Window", "シフテッド・ウィンドウ", "シフト窓", "Swinでは局所窓内で注意を計算し、次層で窓をずらして窓間を接続します。", "通常窓とシフト窓を交互に使うのがSwinの識別点です。", "skip")
    ],
    edges: [applicationEdge("image", "patch"), applicationEdge("patch", "embed"), applicationEdge("cls", "encoder"), applicationEdge("embed", "encoder"), applicationEdge("encoder", "head"), applicationEdge("embed", "window", "Swin", true), applicationEdge("window", "head", "hierarchy", true)],
    reading: ["画像をパッチへ分割する", "パッチ埋め込みと位置埋め込みを作る", "ViTではCLS tokenを含めてEncoderへ入れる", "Swinでは局所窓とShifted Windowを交互に使う"],
    compare: [["ViT", "画像全体のパッチ列へSelf-Attention。CLS tokenを使う"], ["Swin", "局所窓・Shifted Window・階層構造で高解像度画像に対応"], ["CNN", "局所的な畳み込みを積み重ね、受容野を広げる"]],
    questionIds: ["app-vit-001", "app-vit-002"],
    sources: [{ title: "An Image is Worth 16x16 Words", url: "https://arxiv.org/abs/2010.11929", year: 2020 }, { title: "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows", url: "https://arxiv.org/abs/2103.14030", year: 2021 }]
  },
  {
    id: "detection",
    order: 30,
    category: "4-(2) 物体検出",
    title: "Faster / Mask R-CNN・YOLO / SSD・FCOS",
    kana: "ファスター／マスク・アールシーエヌエヌ、ヨーロー／エスエスディー、エフコス",
    ja: "2ステージ・1ステージ・アンカーフリー物体検出の比較",
    summary: "物体検出は、候補領域を先に作る2ステージ、画像全体から直接予測する1ステージ、アンカーを使わないアンカーフリーに大別できます。",
    syllabus: ["RPN", "ROI Pooling / ROI Align", "Anchor box", "NMS", "FPN", "Center-ness", "mAP"],
    viewBox: "0 0 760 560",
    nodes: [
      applicationNode("image", 20, 245, 90, 62, ["Image"], "Image", "イメージ", "画像", "検出対象の入力画像です。", "以後の分岐で2ステージ、1ステージ、アンカーフリーを見分けます。", "input"),
      applicationNode("backbone", 145, 245, 115, 62, ["Backbone", "/ FPN"], "Backbone", "バックボーン", "特徴抽出器", "CNNなどで特徴マップを作ります。FPNは複数解像度の特徴を統合します。", "FPNは小物体から大物体まで扱うための多段特徴です。", "main"),
      applicationNode("rpn", 315, 65, 120, 62, ["RPN", "Proposals"], "Region Proposal Network", "リージョン・プロポーザル・ネットワーク", "領域提案ネットワーク", "候補領域を作ります。", "RPNが出てきたらFaster R-CNN系の2ステージです。", "attention"),
      applicationNode("roi", 485, 65, 120, 62, ["ROI Align", "Class + Box"], "ROI Align", "アールオーアイ・アライン", "領域整列", "候補領域から固定サイズの特徴を取り出し、分類と箱回帰を行います。", "Mask R-CNNではROI Alignとマスク分岐が重要です。", "merge"),
      applicationNode("mask", 650, 65, 90, 62, ["Mask", "Branch"], "Mask Branch", "マスク・ブランチ", "マスク分岐", "各物体の画素マスクを予測します。", "物体ごとのマスクならインスタンスセグメンテーションです。", "output"),
      applicationNode("dense", 315, 245, 120, 62, ["Dense", "Predictions"], "Dense Prediction", "デンス・プレディクション", "密な予測", "YOLOやSSDは多数の位置からクラスと箱を直接予測します。", "RPNやROIを挟まず一度に予測するのが1ステージです。", "main"),
      applicationNode("anchor", 485, 245, 120, 62, ["Anchor /", "Default Box"], "Anchor Box", "アンカー・ボックス", "基準箱", "複数形状の基準箱から位置と大きさを補正します。SSDではdefault boxと呼びます。", "Anchor boxとdefault boxはほぼ同じ役割です。", "position"),
      applicationNode("nms", 650, 245, 90, 62, ["NMS"], "Non-Maximum Suppression", "ノン・マキシマム・サプレッション", "非最大値抑制", "重複する予測箱を信頼度に基づいて除去します。", "IoUが高い重複箱を整理する後処理です。", "output"),
      applicationNode("fcos", 315, 425, 120, 62, ["FCOS", "Anchor-Free"], "Fully Convolutional One-Stage", "フーリー・コンヴォリューショナル・ワンステージ", "アンカーフリー検出", "各位置から上下左右の箱距離を直接予測します。", "アンカーを使わず位置ごとの距離とcenternessを出すのがFCOSです。", "main"),
      applicationNode("center", 500, 425, 125, 62, ["Center-ness"], "Center-ness", "センターネス", "中心らしさ", "箱の中心に近い予測を高く評価します。", "FCOS特有のキーワードとして出やすいです。", "special"),
      applicationNode("metric", 650, 425, 90, 62, ["mAP"], "mean Average Precision", "ミーン・アベレージ・プレシジョン", "平均適合率", "複数クラス・IoU条件で検出性能を評価します。", "物体検出の代表評価指標です。", "output")
    ],
    edges: [applicationEdge("image", "backbone"), applicationEdge("backbone", "rpn", "2-stage"), applicationEdge("rpn", "roi"), applicationEdge("roi", "mask", "Mask R-CNN"), applicationEdge("backbone", "dense", "1-stage"), applicationEdge("dense", "anchor"), applicationEdge("anchor", "nms"), applicationEdge("backbone", "fcos", "anchor-free"), applicationEdge("fcos", "center"), applicationEdge("center", "metric")],
    reading: ["2ステージはRPN→ROI→分類・回帰", "Mask R-CNNはマスク分岐を追加", "YOLO/SSDは1ステージで直接予測", "FCOSはAnchor-FreeでCenter-nessを使う"],
    compare: [["Faster R-CNN", "RPNで候補生成後にROI処理する2ステージ"], ["Mask R-CNN", "Faster R-CNNへマスク分岐とROI Alignを追加"], ["YOLO / SSD", "1ステージ。SSDはdefault boxとhard negative mining"], ["FCOS", "Anchor-Free。FPNとCenter-nessを利用"]],
    questionIds: ["app-det-001", "app-det-002", "app-det-003"],
    sources: [{ title: "Faster R-CNN", url: "https://arxiv.org/abs/1506.01497", year: 2015 }, { title: "Mask R-CNN", url: "https://arxiv.org/abs/1703.06870", year: 2017 }, { title: "You Only Look Once", url: "https://arxiv.org/abs/1506.02640", year: 2015 }, { title: "SSD: Single Shot MultiBox Detector", url: "https://arxiv.org/abs/1512.02325", year: 2015 }, { title: "FCOS: Fully Convolutional One-Stage Object Detection", url: "https://arxiv.org/abs/1904.01355", year: 2019 }]
  },
  {
    id: "segmentation",
    order: 40,
    category: "4-(3) セマンティックセグメンテーション",
    title: "FCN / U-Net",
    kana: "エフシーエヌ／ユーネット",
    ja: "全畳み込みネットワーク／U字型セグメンテーションネットワーク",
    summary: "画像を画素単位で分類します。U-NetはEncoderで縮小し、Decoderで拡大しながら同解像度の特徴をスキップ接続で連結します。",
    syllabus: ["アップサンプリング", "スキップコネクション", "インスタンスセグメンテーション", "パノプティックセグメンテーション"],
    viewBox: "0 0 760 500",
    nodes: [
      applicationNode("input", 20, 215, 90, 62, ["Image"], "Image", "イメージ", "画像", "入力画像です。", "出力が箱ではなく画素ラベルになる点が検出との違いです。", "input"),
      applicationNode("enc1", 145, 145, 110, 62, ["Encoder", "High Res"], "Encoder", "エンコーダー", "符号化器", "浅い層で位置情報を多く持つ特徴を抽出します。", "U-Netでは同じ解像度のDecoderへ特徴を渡します。", "main"),
      applicationNode("enc2", 285, 215, 110, 62, ["Down", "Sampling"], "Down Sampling", "ダウン・サンプリング", "縮小", "解像度を下げて広い受容野の特徴を得ます。", "Encoder側は縮小、Decoder側は拡大です。", "main"),
      applicationNode("bottle", 425, 285, 110, 62, ["Bottleneck"], "Bottleneck", "ボトルネック", "最深部", "最も圧縮された表現です。", "U字の底に位置します。", "merge"),
      applicationNode("dec2", 565, 215, 110, 62, ["Up", "Sampling"], "Up Sampling", "アップ・サンプリング", "拡大", "空間解像度を復元します。", "逆畳み込みや補間で拡大します。", "main"),
      applicationNode("dec1", 565, 75, 110, 62, ["Decoder", "Concat"], "Decoder", "デコーダー", "復号器", "Encoderの特徴を連結し、細かな位置情報を回復します。", "U-Netのskip connectionは通常、加算ではなくチャネル方向の連結です。", "skip"),
      applicationNode("mask", 650, 355, 90, 62, ["Pixel", "Mask"], "Segmentation Mask", "セグメンテーション・マスク", "画素マスク", "各画素へクラスを割り当てます。", "Semanticはクラス単位、Instanceは物体個体単位、Panopticは両者を統合します。", "output")
    ],
    edges: [applicationEdge("input", "enc1"), applicationEdge("enc1", "enc2"), applicationEdge("enc2", "bottle"), applicationEdge("bottle", "dec2"), applicationEdge("dec2", "dec1"), applicationEdge("dec1", "mask"), applicationEdge("enc1", "dec1", "skip / concat", true), applicationEdge("enc2", "dec2", "skip / concat", true)],
    reading: ["Encoderで縮小しながら特徴抽出", "ボトルネックで広い文脈を捉える", "Decoderでアップサンプリング", "同解像度のEncoder特徴を連結して位置情報を戻す"],
    compare: [["FCN", "全結合層を畳み込みへ置換し、画素単位の出力を作る"], ["U-Net", "Encoder-Decoderと同解像度のスキップ連結"], ["Semantic", "同じクラスの物体をまとめて画素分類"], ["Instance", "物体ごとに別マスク"], ["Panoptic", "SemanticとInstanceを統合"]],
    questionIds: ["app-seg-001", "app-seg-002"],
    sources: [{ title: "Fully Convolutional Networks for Semantic Segmentation", url: "https://arxiv.org/abs/1411.4038", year: 2014 }, { title: "U-Net: Convolutional Networks for Biomedical Image Segmentation", url: "https://arxiv.org/abs/1505.04597", year: 2015 }]
  },
  {
    id: "word-embedding",
    order: 50,
    category: "4-(4) 自然言語処理",
    title: "Word Embedding",
    kana: "ワード・エンベディング",
    ja: "単語埋め込み",
    summary: "単語を意味的な近さを保つ低次元ベクトルへ変換します。Word2vecではCBOWとSkip-gramが代表で、Negative Samplingで計算を軽くします。",
    syllabus: ["LSI", "Word2vec", "n-gram", "Skip-gram", "CBOW", "Negative Sampling"],
    viewBox: "0 0 760 470",
    nodes: [
      applicationNode("corpus", 20, 200, 100, 62, ["Corpus"], "Corpus", "コーパス", "文書集合", "学習に使う文章の集合です。", "前後の単語関係を学習材料にします。", "input"),
      applicationNode("ngram", 155, 90, 120, 62, ["n-gram"], "n-gram", "エヌグラム", "連続語列", "連続するn個の語や文字を単位として扱います。", "局所的な並びを数える古典的表現です。", "main"),
      applicationNode("cbow", 155, 240, 120, 62, ["CBOW", "context→word"], "Continuous Bag-of-Words", "コンティニュアス・バッグ・オブ・ワーズ", "周辺語から中心語", "周辺の単語から中心単語を予測します。", "多対1がCBOWです。", "main"),
      applicationNode("skipgram", 315, 240, 120, 62, ["Skip-gram", "word→context"], "Skip-gram", "スキップ・グラム", "中心語から周辺語", "中心単語から周辺単語を予測します。", "1対多がSkip-gramです。", "main"),
      applicationNode("negative", 475, 240, 130, 62, ["Negative", "Sampling"], "Negative Sampling", "ネガティブ・サンプリング", "負例サンプリング", "全語彙Softmaxの代わりに少数の負例だけを学習します。", "計算量を減らす近似手法です。", "special"),
      applicationNode("vector", 640, 200, 100, 62, ["Word", "Vector"], "Word Vector", "ワード・ベクター", "単語ベクトル", "意味や用法の近い単語が近い位置に配置されます。", "ベクトル演算で類似度やアナロジーを扱えます。", "output"),
      applicationNode("lsi", 315, 390, 130, 58, ["LSI / SVD"], "Latent Semantic Indexing", "レイテント・セマンティック・インデクシング", "潜在的意味インデキシング", "単語文書行列を特異値分解して潜在意味空間へ圧縮します。", "Word2vecは予測学習、LSIは行列分解です。", "skip")
    ],
    edges: [applicationEdge("corpus", "ngram"), applicationEdge("corpus", "cbow"), applicationEdge("cbow", "skipgram", "compare", true), applicationEdge("cbow", "negative"), applicationEdge("skipgram", "negative"), applicationEdge("negative", "vector"), applicationEdge("corpus", "lsi", "matrix", true), applicationEdge("lsi", "vector", "latent", true)],
    reading: ["文章から文脈ペアを作る", "CBOWは周辺語から中心語", "Skip-gramは中心語から周辺語", "Negative Samplingで全語彙計算を避ける", "LSIはSVDによる行列分解"],
    compare: [["CBOW", "周辺語→中心語。学習が比較的速い"], ["Skip-gram", "中心語→周辺語。希少語を学びやすい"], ["Negative Sampling", "少数の負例だけで近似学習"], ["LSI", "単語文書行列をSVDで低次元化"]],
    questionIds: ["app-word-001", "app-word-002"],
    sources: [{ title: "Efficient Estimation of Word Representations in Vector Space", url: "https://arxiv.org/abs/1301.3781", year: 2013 }]
  },
  {
    id: "llm",
    order: 60,
    category: "4-(4) 自然言語処理",
    title: "BERT / GPT / RAG",
    kana: "バート／ジーピーティー／ラグ",
    ja: "双方向事前学習・自己回帰生成・検索拡張生成",
    summary: "BERTは文脈表現の理解、GPTは次トークン予測による生成、RAGは外部検索結果を文脈へ加える方式です。Transformer構造との役割の違いを整理します。",
    syllabus: ["MLM", "NSP", "Next token prediction", "Few Shot", "Zero Shot", "Prompt Based Learning", "RAG"],
    viewBox: "0 0 760 560",
    nodes: [
      applicationNode("text", 20, 245, 90, 62, ["Text"], "Text", "テキスト", "入力文", "言語モデルへ与える文章です。", "BERTとGPTで学習目標が異なります。", "input"),
      applicationNode("bert", 155, 65, 120, 62, ["BERT", "Encoder"], "Bidirectional Encoder Representations from Transformers", "バイディレクショナル・エンコーダー・リプレゼンテーションズ・フロム・トランスフォーマーズ", "双方向Encoder表現", "前後両方向の文脈を使うEncoder型モデルです。", "分類・抽出・文理解ではBERT系が典型です。", "attention"),
      applicationNode("mlm", 320, 65, 125, 62, ["MLM", "[MASK]"], "Masked Language Modeling", "マスクト・ランゲージ・モデリング", "マスク言語モデル", "隠した単語を前後文脈から予測します。", "[MASK]を当てる学習目標ならBERTです。", "special"),
      applicationNode("nsp", 500, 65, 120, 62, ["NSP", "sentence pair"], "Next Sentence Prediction", "ネクスト・センテンス・プレディクション", "次文予測", "2文が連続するかを判定するBERTの事前学習課題です。", "segment embeddingと文対入力もBERTの手掛かりです。", "output"),
      applicationNode("gpt", 155, 245, 120, 62, ["GPT", "Decoder"], "Generative Pre-trained Transformer", "ジェネラティブ・プリトレインド・トランスフォーマー", "生成事前学習Transformer", "過去トークンだけを見て次トークンを予測します。", "自己回帰・causal mask・next token predictionがGPT系です。", "attention"),
      applicationNode("next", 320, 245, 125, 62, ["Next Token", "Prediction"], "Next Token Prediction", "ネクスト・トークン・プレディクション", "次トークン予測", "直前までのトークンから次を予測し、繰り返して文章を生成します。", "生成は1トークンずつ自己回帰的に進みます。", "special"),
      applicationNode("prompt", 500, 245, 120, 62, ["Zero / Few Shot", "Prompt"], "Prompt Based Learning", "プロンプト・ベースド・ラーニング", "プロンプト型学習", "指示や少数例をプロンプトへ含め、追加学習なしまたは少量で課題を解きます。", "Zero-shotは例なし、Few-shotは少数例ありです。", "output"),
      applicationNode("query", 155, 430, 120, 62, ["Query", "Retriever"], "Retriever", "リトリーバー", "検索器", "質問から外部文書を検索します。", "RAGはモデル内部知識だけでなく外部文書を取得します。", "main"),
      applicationNode("docs", 320, 430, 125, 62, ["Retrieved", "Documents"], "Retrieved Documents", "リトリーブド・ドキュメンツ", "検索文書", "検索された根拠文書です。", "検索結果をコンテキストへ追加します。", "position"),
      applicationNode("generator", 500, 430, 120, 62, ["Generator", "+ Context"], "Generator", "ジェネレーター", "生成器", "質問と検索文書を使って回答を生成します。", "RetrieverとGeneratorの組合せがRAGです。", "output")
    ],
    edges: [applicationEdge("text", "bert", "understand"), applicationEdge("bert", "mlm"), applicationEdge("mlm", "nsp"), applicationEdge("text", "gpt", "generate"), applicationEdge("gpt", "next"), applicationEdge("next", "prompt"), applicationEdge("text", "query", "RAG"), applicationEdge("query", "docs"), applicationEdge("docs", "generator")],
    reading: ["BERTはEncoder型でMLMを使う", "GPTはDecoder型でNext token predictionを使う", "Zero-shotとFew-shotは例の数で区別", "RAGは検索器で文書を取得して生成器へ渡す"],
    compare: [["BERT", "双方向Encoder。MLM、NSP、文理解・分類"], ["GPT", "自己回帰Decoder。Next token prediction、文章生成"], ["RAG", "Retrieverで外部文書を取得し、Generatorへ根拠として渡す"]],
    questionIds: ["app-llm-001", "app-llm-002", "app-llm-003"],
    sources: [{ title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", url: "https://arxiv.org/abs/1810.04805", year: 2018 }, { title: "Language Models are Unsupervised Multitask Learners", url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf", year: 2019 }, { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", year: 2020 }]
  },
  {
    id: "speech",
    order: 70,
    category: "4-(5) 音声処理",
    title: "STFT / Mel / MFCC・WaveNet・CTC",
    kana: "エスティーエフティー／メル／エムエフシーシー、ウェーブネット、シーティーシー",
    ja: "音響特徴・波形生成・可変長音声認識",
    summary: "音声は時間波形を窓ごとに周波数へ変換し、MelスペクトログラムやMFCCへします。WaveNetは因果的な拡張畳み込みで波形を生成し、CTCはフレーム列と文字列の位置合わせを学習します。",
    syllabus: ["サンプリング定理", "窓関数", "ナイキスト周波数", "STFT / FFT", "メルスペクトログラム", "MFCC", "WaveNet", "CTC"],
    viewBox: "0 0 760 580",
    nodes: [
      applicationNode("wave", 20, 95, 100, 62, ["Waveform"], "Waveform", "ウェーブフォーム", "音声波形", "時間方向の振幅信号です。", "サンプリング周波数の半分がナイキスト周波数です。", "input"),
      applicationNode("window", 155, 95, 120, 62, ["Window", "Function"], "Window Function", "ウィンドウ・ファンクション", "窓関数", "短い区間へ分け、端の不連続を抑えます。", "音声は時間変化するため短時間区間で周波数解析します。", "main"),
      applicationNode("stft", 315, 95, 120, 62, ["STFT / FFT"], "Short-Time Fourier Transform", "ショートタイム・フーリエ・トランスフォーム", "短時間フーリエ変換", "各窓を周波数成分へ変換します。", "時間×周波数のスペクトログラムを作ります。", "main"),
      applicationNode("mel", 475, 95, 120, 62, ["Mel", "Spectrogram"], "Mel Spectrogram", "メル・スペクトログラム", "メルスペクトログラム", "人の聴覚に近いMel尺度へ周波数軸を変換します。", "MFCCの前段にも使われます。", "position"),
      applicationNode("mfcc", 640, 95, 100, 62, ["MFCC"], "Mel-Frequency Cepstral Coefficients", "メル・フリークエンシー・ケプストラル・コエフィシェンツ", "メル周波数ケプストラム係数", "Melスペクトルを圧縮した代表的な音響特徴です。", "音声認識の古典的特徴量として頻出です。", "output"),
      applicationNode("text", 20, 295, 100, 62, ["Text"], "Text", "テキスト", "入力テキスト", "音声合成で読み上げる文章です。", "Text-to-Speechの入口です。", "input"),
      applicationNode("wavenet", 180, 295, 145, 62, ["WaveNet", "Dilated Causal"], "Dilated Causal Convolution", "ダイレイテッド・コーザル・コンヴォリューション", "拡張因果畳み込み", "未来を見ず、間隔を空けた畳み込みで広い過去を参照します。", "Dilated Causal Convolution、GTU、Residual/SkipがWaveNetです。", "attention"),
      applicationNode("audio", 370, 295, 115, 62, ["Generated", "Audio"], "Generated Audio", "ジェネレーテッド・オーディオ", "生成音声", "1サンプルずつ自己回帰的に波形を生成します。", "WaveNetは音声波形生成モデルです。", "output"),
      applicationNode("frames", 180, 475, 145, 62, ["Frame", "Probabilities"], "Frame Probabilities", "フレーム・プロバビリティーズ", "フレーム確率", "各時刻で文字・空白の確率を出します。", "CTCはblankを含む経路を合算します。", "main"),
      applicationNode("ctc", 370, 475, 115, 62, ["CTC", "Collapse"], "Connectionist Temporal Classification", "コネクショニスト・テンポラル・クラシフィケーション", "時系列分類", "重複とblankを除去して可変長文字列へ変換します。", "入力と正解の厳密な時刻対応が不要です。", "merge"),
      applicationNode("beam", 540, 475, 120, 62, ["Beam Search"], "Beam Search", "ビーム・サーチ", "ビーム探索", "有望な複数候補を残して文字列を探索します。", "貪欲法より複数候補を保つ探索です。", "output")
    ],
    edges: [applicationEdge("wave", "window"), applicationEdge("window", "stft"), applicationEdge("stft", "mel"), applicationEdge("mel", "mfcc"), applicationEdge("text", "wavenet"), applicationEdge("wavenet", "audio"), applicationEdge("wave", "frames", "ASR", true), applicationEdge("frames", "ctc"), applicationEdge("ctc", "beam")],
    reading: ["波形を窓で区切りSTFTする", "Mel尺度へ変換しMFCCを作る", "WaveNetはDilated Causal Convolutionで波形生成", "CTCはblankを含む全アラインメントを扱う"],
    compare: [["STFT", "短時間ごとの周波数分布"], ["Mel Spectrogram", "人の聴覚に近い周波数尺度"], ["MFCC", "Melスペクトルをケプストラム係数へ圧縮"], ["WaveNet", "因果・拡張畳み込みによる音声波形生成"], ["CTC", "入力フレームと出力文字列の位置合わせを不要にする損失"]],
    questionIds: ["app-speech-001", "app-speech-002", "app-speech-003"],
    sources: [{ title: "WaveNet: A Generative Model for Raw Audio", url: "https://arxiv.org/abs/1609.03499", year: 2016 }, { title: "Connectionist Temporal Classification", url: "https://www.cs.toronto.edu/~graves/icml_2006.pdf", year: 2006 }]
  },
  {
    id: "generative",
    order: 80,
    category: "4-(6) 生成モデル",
    title: "Autoencoder / VAE / GAN / Diffusion / Flow",
    kana: "オートエンコーダー／ブイエーイー／ギャン／ディフュージョン／フロー",
    ja: "代表的な生成モデルの比較",
    summary: "生成モデルはデータ分布を学び、新しいデータを作ります。潜在変数、敵対学習、ノイズ除去、可逆変換など、学習原理の違いで整理します。",
    syllabus: ["自己回帰", "拡散モデル", "フローベース生成モデル", "Denoising AE", "VAE", "Reparameterization Trick", "GAN", "WGAN", "DCGAN", "Conditional GAN", "CycleGAN"],
    viewBox: "0 0 760 620",
    nodes: [
      applicationNode("data", 20, 270, 90, 62, ["Data"], "Data", "データ", "実データ", "学習対象の分布です。", "識別モデルは境界、生成モデルは分布を学びます。", "input"),
      applicationNode("ae", 150, 55, 125, 62, ["AE / DAE", "Encode→Decode"], "Autoencoder", "オートエンコーダー", "自己符号化器", "入力を潜在表現へ圧縮し、元入力を再構成します。DAEはノイズ入力から元データを復元します。", "再構成誤差が中心です。", "main"),
      applicationNode("vae", 330, 55, 125, 62, ["VAE", "μ, σ → z"], "Variational Autoencoder", "ヴァリエーショナル・オートエンコーダー", "変分自己符号化器", "潜在分布の平均と分散を学び、再パラメータ化してサンプリングします。", "再構成項とKL項、Reparameterization Trickが目印です。", "attention"),
      applicationNode("ganG", 150, 225, 125, 62, ["Generator", "z → fake"], "Generator", "ジェネレーター", "生成器", "潜在ノイズから偽データを作ります。", "GANは生成器と識別器の対戦です。", "main"),
      applicationNode("ganD", 330, 225, 125, 62, ["Discriminator", "real / fake"], "Discriminator", "ディスクリミネーター", "識別器", "実データと偽データを見分けます。", "mode collapseは生成器が少数パターンしか出さない現象です。", "merge"),
      applicationNode("diffusion", 150, 395, 125, 62, ["Diffusion", "noise↔data"], "Diffusion Model", "ディフュージョン・モデル", "拡散モデル", "順過程でノイズを加え、逆過程で段階的にノイズを除去して生成します。", "ノイズ除去を反復する生成方式です。", "position"),
      applicationNode("flow", 330, 395, 125, 62, ["Normalizing", "Flow"], "Flow-based Model", "フロー・ベースド・モデル", "フローベース生成", "可逆変換で単純分布とデータ分布を対応付け、尤度を厳密に計算します。", "可逆写像とヤコビアンが手掛かりです。", "special"),
      applicationNode("ar", 150, 545, 125, 62, ["Autoregressive", "p(xₜ|x<t)"], "Autoregressive Model", "オートリグレッシブ・モデル", "自己回帰モデル", "過去の出力を条件に次の要素を順番に生成します。", "生成は逐次的で並列化しにくい点が特徴です。", "main"),
      applicationNode("sample", 535, 270, 180, 62, ["Generated Samples"], "Generated Samples", "ジェネレーテッド・サンプルズ", "生成サンプル", "学習した分布から新しいデータを生成します。", "方式ごとの学習目標と生成手順を区別します。", "output")
    ],
    edges: [applicationEdge("data", "ae"), applicationEdge("ae", "vae"), applicationEdge("vae", "sample"), applicationEdge("data", "ganD", "real"), applicationEdge("ganG", "ganD", "adversarial"), applicationEdge("ganG", "sample"), applicationEdge("data", "diffusion"), applicationEdge("diffusion", "sample"), applicationEdge("data", "flow"), applicationEdge("flow", "sample"), applicationEdge("data", "ar"), applicationEdge("ar", "sample")],
    reading: ["AEは再構成、VAEは確率的潜在変数", "GANはGeneratorとDiscriminatorの対戦", "Diffusionはノイズ付与の逆過程", "Flowは可逆変換と厳密尤度", "自己回帰は過去出力を条件に逐次生成"],
    compare: [["AE / DAE", "再構成。DAEはノイズから元入力を復元"], ["VAE", "確率的潜在変数。再パラメータ化と変分下限"], ["GAN", "敵対学習。mode collapseに注意"], ["Diffusion", "ノイズ除去を多数ステップ反復"], ["Flow", "可逆変換。厳密尤度計算"], ["Autoregressive", "1要素ずつ逐次生成"]],
    questionIds: ["app-gen-001", "app-gen-002", "app-gen-003"],
    sources: [{ title: "Auto-Encoding Variational Bayes", url: "https://arxiv.org/abs/1312.6114", year: 2013 }, { title: "Generative Adversarial Nets", url: "https://arxiv.org/abs/1406.2661", year: 2014 }, { title: "Denoising Diffusion Probabilistic Models", url: "https://arxiv.org/abs/2006.11239", year: 2020 }, { title: "Density Estimation using Real NVP", url: "https://arxiv.org/abs/1605.08803", year: 2016 }]
  },
  {
    id: "deep-rl",
    order: 90,
    category: "4-(7) 深層強化学習",
    title: "DQN / A3C / Actor-Critic",
    kana: "ディーキューエヌ／エースリーシー／アクター・クリティック",
    ja: "価値ベース・非同期方策勾配・方策と価値の分業",
    summary: "DQNは行動価値Qを深層ネットワークで近似し、Experience Replayを使います。A3Cは複数Actorを非同期に動かし、Actor-Criticで方策と価値を同時に学習します。",
    syllabus: ["行動価値関数", "TD学習", "Q学習", "Experience Replay", "Policy Gradient", "Actor-Critic"],
    viewBox: "0 0 760 560",
    nodes: [
      applicationNode("state", 20, 230, 90, 62, ["State", "s"], "State", "ステート", "状態", "環境から観測する状態です。", "強化学習は状態・行動・報酬・次状態で整理します。", "input"),
      applicationNode("dqn", 160, 75, 120, 62, ["DQN", "Q(s,a)"], "Deep Q-Network", "ディープ・キュー・ネットワーク", "深層Qネットワーク", "状態から各行動の価値Q(s,a)を出します。", "最大Qの行動を選び、TD誤差で学習します。", "attention"),
      applicationNode("replay", 330, 75, 125, 62, ["Experience", "Replay"], "Experience Replay", "エクスペリエンス・リプレイ", "経験再生", "遷移を保存し、ランダムに取り出して相関を弱めます。", "DQNの安定化技法です。", "special"),
      applicationNode("td", 500, 75, 120, 62, ["TD Target", "r+γmaxQ"], "Temporal Difference", "テンポラル・ディファレンス", "時間差分", "現在予測と1ステップ先を使った目標との差を学習します。", "Q学習は方策外でmax Qを使います。", "merge"),
      applicationNode("actor", 160, 275, 120, 62, ["Actor", "π(a|s)"], "Actor", "アクター", "方策", "どの行動を選ぶかを出します。", "Actorは行動、Criticは評価です。", "main"),
      applicationNode("critic", 330, 275, 125, 62, ["Critic", "V(s)"], "Critic", "クリティック", "価値評価", "状態や行動の価値を推定し、Actorの更新を助けます。", "Actor-Criticは方策勾配の分散を抑えます。", "main"),
      applicationNode("workers", 500, 275, 120, 62, ["A3C", "Workers"], "Asynchronous Advantage Actor-Critic", "アシンクロナス・アドバンテージ・アクター・クリティック", "非同期Actor-Critic", "複数環境のWorkerが非同期に勾配を共有します。", "Replay Bufferではなく複数Workerで相関を弱めます。", "special"),
      applicationNode("action", 650, 230, 90, 62, ["Action", "a"], "Action", "アクション", "行動", "方策やQ値に基づいて選ぶ行動です。", "行動後に報酬と次状態を受け取ります。", "output"),
      applicationNode("reward", 330, 455, 125, 62, ["Reward", "r"], "Reward", "リワード", "報酬", "環境から受け取る評価信号です。", "教師ラベルではなく累積報酬を最大化します。", "output")
    ],
    edges: [applicationEdge("state", "dqn"), applicationEdge("dqn", "replay"), applicationEdge("replay", "td"), applicationEdge("td", "action"), applicationEdge("state", "actor"), applicationEdge("actor", "critic", "advantage"), applicationEdge("critic", "workers"), applicationEdge("workers", "action"), applicationEdge("action", "reward", "environment", true), applicationEdge("reward", "state", "next state", true)],
    reading: ["DQNはQ(s,a)をニューラルネットで近似", "Experience Replayで経験をランダム再生", "Actorは方策、Criticは価値", "A3Cは複数Workerを非同期実行"],
    compare: [["DQN", "価値ベース。Q学習、TD、Experience Replay"], ["Policy Gradient", "方策を直接最適化"], ["Actor-Critic", "Actorが方策、Criticが価値"], ["A3C", "複数Workerによる非同期Actor-Critic"]],
    questionIds: ["app-rl-001", "app-rl-002"],
    sources: [{ title: "Playing Atari with Deep Reinforcement Learning", url: "https://arxiv.org/abs/1312.5602", year: 2013 }, { title: "Asynchronous Methods for Deep Reinforcement Learning", url: "https://arxiv.org/abs/1602.01783", year: 2016 }]
  },
  {
    id: "learning-methods",
    order: 100,
    category: "4-(8) 様々な学習方法",
    title: "Transfer / Self-Supervised / Active / Metric / Meta Learning",
    kana: "トランスファー／セルフ・スーパーバイズド／アクティブ／メトリック／メタ・ラーニング",
    ja: "転移・自己教師あり・能動・距離・メタ学習",
    summary: "限られたラベルや新しいタスクへ対応するための学習方法を、何を再利用するか、誰がラベルを選ぶか、何を近づけるか、何を学ぶかで整理します。",
    syllabus: ["Fine-tuning", "Domain Adaptation", "Self-Training", "Co-Training", "Contrastive Learning", "Uncertainty Sampling", "Siamese / Triplet", "MAML"],
    viewBox: "0 0 760 620",
    nodes: [
      applicationNode("pretrain", 20, 270, 100, 62, ["Pretrained", "Model"], "Pretrained Model", "プリトレインド・モデル", "事前学習済みモデル", "大規模データで学習済みの知識です。", "転移学習ではこの重みを新課題へ使います。", "input"),
      applicationNode("transfer", 160, 55, 130, 62, ["Fine-tuning", "Domain Adapt"], "Transfer Learning", "トランスファー・ラーニング", "転移学習", "事前学習重みを新しい課題へ調整します。Domain Adaptationは入力分布の差へ適応します。", "ドメインシフトは学習時と利用時の分布差です。", "main"),
      applicationNode("self", 160, 185, 130, 62, ["Self / Semi", "Supervised"], "Self-Supervised Learning", "セルフ・スーパーバイズド・ラーニング", "自己教師あり学習", "データ自身から擬似的な教師信号を作ります。Semi-supervisedは少数ラベルと大量未ラベルを使います。", "Self-Trainingは擬似ラベル、Co-Trainingは異なるビューを使います。", "main"),
      applicationNode("contrastive", 340, 185, 135, 62, ["Contrastive", "Learning"], "Contrastive Learning", "コントラスティブ・ラーニング", "対照学習", "同じ対象の変換例を近づけ、異なる対象を遠ざけます。", "positive pairとnegative pairの距離を扱います。", "attention"),
      applicationNode("active", 160, 315, 130, 62, ["Active", "Learning"], "Active Learning", "アクティブ・ラーニング", "能動学習", "モデルが学習に有効な未ラベルデータを選び、人へラベルを依頼します。", "Least ConfidentやUncertainty Samplingは不確かな例を選びます。", "special"),
      applicationNode("metric", 160, 445, 130, 62, ["Metric", "Learning"], "Metric Learning", "メトリック・ラーニング", "距離学習", "同じクラスを近づけ、異なるクラスを遠ざける埋め込みを学びます。", "Siameseは2サンプル、Tripletはanchor/positive/negativeの3サンプルです。", "position"),
      applicationNode("siamese", 340, 445, 135, 62, ["Siamese /", "Triplet"], "Siamese Network", "サイアミーズ・ネットワーク", "シャムネットワーク", "同じ重みを共有するネットワークでサンプルを比較します。", "Contrastive lossは2組、Triplet lossは3組です。", "merge"),
      applicationNode("meta", 160, 555, 130, 50, ["MAML"], "Model-Agnostic Meta-Learning", "モデル・アグノスティック・メタ・ラーニング", "モデル非依存メタ学習", "少数回の更新で新タスクへ適応しやすい初期値を学びます。", "内側更新とメタ目的関数を区別します。", "main"),
      applicationNode("adapt", 570, 270, 150, 62, ["Adapt to", "New Task"], "Adaptation", "アダプテーション", "新課題への適応", "少ないラベルや分布変化へ効率よく適応します。", "各手法の『何を選ぶ・近づける・再利用する』を見分けます。", "output")
    ],
    edges: [applicationEdge("pretrain", "transfer"), applicationEdge("transfer", "adapt"), applicationEdge("pretrain", "self"), applicationEdge("self", "contrastive"), applicationEdge("contrastive", "adapt"), applicationEdge("pretrain", "active"), applicationEdge("active", "adapt"), applicationEdge("pretrain", "metric"), applicationEdge("metric", "siamese"), applicationEdge("siamese", "adapt"), applicationEdge("pretrain", "meta"), applicationEdge("meta", "adapt")],
    reading: ["転移学習は事前学習重みを再利用", "自己教師ありはデータ自身から教師信号", "能動学習はラベル付けすべき例を選ぶ", "距離学習は埋め込み空間の距離を学ぶ", "MAMLは素早く適応できる初期値を学ぶ"],
    compare: [["Transfer Learning", "学習済み知識を新タスクへ再利用"], ["Self/Semi-Supervised", "未ラベルデータを活用"], ["Active Learning", "ラベルを付けるデータを選ぶ"], ["Metric Learning", "距離・埋め込みを学ぶ"], ["Meta Learning", "学び方や初期値を学ぶ"]],
    questionIds: ["app-learn-001", "app-learn-002", "app-learn-003"],
    sources: [{ title: "A Simple Framework for Contrastive Learning of Visual Representations", url: "https://arxiv.org/abs/2002.05709", year: 2020 }, { title: "FaceNet: A Unified Embedding for Face Recognition and Clustering", url: "https://arxiv.org/abs/1503.03832", year: 2015 }, { title: "Model-Agnostic Meta-Learning for Fast Adaptation of Deep Networks", url: "https://arxiv.org/abs/1703.03400", year: 2017 }]
  },
  {
    id: "xai",
    order: 110,
    category: "4-(9) 深層学習の説明性",
    title: "Grad-CAM / Integrated Gradients / LIME / SHAP",
    kana: "グラッド・カム／インテグレーテッド・グラディエンツ／ライム／シャップ",
    ja: "判断根拠の可視化とモデル近似",
    summary: "説明可能AIは、モデル内部の勾配や特徴マップを使う方法と、モデルを外から局所的・大域的に近似する方法に分けて整理できます。",
    syllabus: ["XAI", "Grad-CAM", "Integrated Gradients", "LIME", "SHAP", "Shapley Value", "協力ゲーム理論"],
    viewBox: "0 0 760 540",
    nodes: [
      applicationNode("input", 20, 230, 90, 62, ["Input"], "Input", "インプット", "入力", "説明対象の画像や表形式データです。", "どの特徴が予測へ効いたかを調べます。", "input"),
      applicationNode("model", 145, 230, 110, 62, ["Black-box", "Model"], "Black-box Model", "ブラックボックス・モデル", "説明対象モデル", "予測を出す深層学習モデルです。", "内部情報を使うか、入出力だけを使うかが分岐点です。", "main"),
      applicationNode("gradcam", 310, 55, 130, 62, ["Grad-CAM", "Feature Map"], "Gradient-weighted Class Activation Mapping", "グラディエント・ウェイテッド・クラス・アクティベーション・マッピング", "勾配付き特徴可視化", "畳み込み層の特徴マップをクラス勾配で重み付けし、注目領域をヒートマップ化します。", "画像・CNN・粗い空間ヒートマップがGrad-CAMです。", "attention"),
      applicationNode("ig", 500, 55, 130, 62, ["Integrated", "Gradients"], "Integrated Gradients", "インテグレーテッド・グラディエンツ", "積分勾配", "基準入力から実入力までの経路で勾配を積分し、各入力特徴の寄与を求めます。", "baselineからinputまで積分する説明が識別点です。", "position"),
      applicationNode("lime", 310, 330, 130, 62, ["LIME", "Local Surrogate"], "Local Interpretable Model-agnostic Explanations", "ローカル・インタープリタブル・モデル・アグノスティック・エクスプレネーションズ", "局所近似説明", "説明したい一点の周辺で入力を摂動し、単純な代理モデルを学習します。", "局所的・モデル非依存・摂動がLIMEです。", "special"),
      applicationNode("shap", 500, 330, 130, 62, ["SHAP", "Shapley Value"], "SHapley Additive exPlanations", "シャープレイ・アディティブ・エクスプレネーションズ", "Shapley値説明", "特徴の組合せへの貢献を協力ゲーム理論のShapley Valueで配分します。", "公平な寄与配分・協力ゲーム理論がSHAPです。", "merge"),
      applicationNode("explain", 655, 230, 85, 62, ["Reason"], "Explanation", "エクスプレネーション", "説明結果", "ヒートマップや特徴寄与として提示します。", "局所説明と大域説明の違いも確認します。", "output")
    ],
    edges: [applicationEdge("input", "model"), applicationEdge("model", "gradcam", "internal"), applicationEdge("model", "ig", "gradient"), applicationEdge("model", "lime", "perturb", true), applicationEdge("model", "shap", "coalitions", true), applicationEdge("gradcam", "explain"), applicationEdge("ig", "explain"), applicationEdge("lime", "explain"), applicationEdge("shap", "explain")],
    reading: ["Grad-CAMはCNN特徴マップと勾配", "Integrated Gradientsはbaselineから入力まで勾配を積分", "LIMEは一点周辺を単純モデルで近似", "SHAPはShapley Valueで特徴寄与を配分"],
    compare: [["Grad-CAM", "CNN内部。画像の注目領域を粗いヒートマップ表示"], ["Integrated Gradients", "勾配を経路積分。入力特徴ごとの寄与"], ["LIME", "局所的な代理モデル。モデル非依存"], ["SHAP", "Shapley Value。局所説明を集約して大域分析にも利用"]],
    questionIds: ["app-xai-001", "app-xai-002", "app-xai-003"],
    sources: [{ title: "Grad-CAM: Visual Explanations from Deep Networks", url: "https://arxiv.org/abs/1610.02391", year: 2016 }, { title: "Axiomatic Attribution for Deep Networks", url: "https://arxiv.org/abs/1703.01365", year: 2017 }, { title: "Why Should I Trust You? Explaining the Predictions of Any Classifier", url: "https://arxiv.org/abs/1602.04938", year: 2016 }, { title: "A Unified Approach to Interpreting Model Predictions", url: "https://arxiv.org/abs/1705.07874", year: 2017 }]
  }
];

function applicationQuestion(id, topic, question, choices, answer, explanation, sourceTitle, sourceUrl) {
  return { id, category: "深層学習の応用", topic, difficulty: "標準", type: "choice", question, choices, answer, explanation, terms: [], formulas: [], sources: sourceUrl ? [{ kind: "primary-paper", title: sourceTitle, url: sourceUrl }] : [] };
}

const APPLICATION_QUESTIONS = [
  applicationQuestion("app-resnet-001", "ResNet", "残差ブロックの基本式として最も適切なものはどれですか？", ["H(x)=F(x)+x", "H(x)=F(x)×x", "H(x)=softmax(x)", "H(x)=x−F(x)のみ"], 0, "ResNetは主経路の残差写像F(x)とスキップ経路の入力xを加算します。", "Deep Residual Learning for Image Recognition", "https://arxiv.org/abs/1512.03385"),
  applicationQuestion("app-resnet-002", "WideResNet", "WideResNetの説明として適切なものはどれですか？", ["層を必ず1000層以上にする", "残差ブロックのチャネル幅を広げる", "スキップ接続を削除する", "畳み込みをすべてRNNへ置換する"], 1, "WideResNetは深さだけでなく残差ブロックの幅を広げ、表現力と学習効率を高めます。", "Wide Residual Networks", "https://arxiv.org/abs/1605.07146"),
  applicationQuestion("app-vit-001", "Vision Transformer", "Vision TransformerでCLS tokenが主に使われる目的はどれですか？", ["画像の分類情報を集約する", "画像を圧縮ファイルへ変換する", "勾配を0にする", "アンカーボックスを生成する"], 0, "ViTではCLS tokenの最終表現を分類ヘッドへ渡す構成が代表的です。", "An Image is Worth 16x16 Words", "https://arxiv.org/abs/2010.11929"),
  applicationQuestion("app-vit-002", "Swin Transformer", "Shifted Windowの役割として最も適切なものはどれですか？", ["局所窓をずらし、隣接窓の情報交換を可能にする", "全画素を常に一つの窓へ入れる", "位置情報を完全に削除する", "画像を音声へ変換する"], 0, "Swin Transformerは通常窓とずらした窓を交互に使い、局所計算を保ちながら窓間を接続します。", "Swin Transformer", "https://arxiv.org/abs/2103.14030"),
  applicationQuestion("app-det-001", "Faster R-CNN", "RPNが登場するモデル系統はどれですか？", ["Faster R-CNNの2ステージ検出", "Word2vec", "VAE", "CTC"], 0, "RPNはRegion Proposal Networkで、Faster R-CNNの候補領域生成を担います。", "Faster R-CNN", "https://arxiv.org/abs/1506.01497"),
  applicationQuestion("app-det-002", "Mask R-CNN", "Mask R-CNNがFaster R-CNNへ追加する代表的な要素はどれですか？", ["物体マスク予測の分岐とROI Align", "次トークン予測", "Experience Replay", "Negative Sampling"], 0, "Mask R-CNNは物体ごとのマスク分岐を追加し、位置ずれを抑えるROI Alignを使います。", "Mask R-CNN", "https://arxiv.org/abs/1703.06870"),
  applicationQuestion("app-det-003", "FCOS", "FCOSを見分けるキーワードの組合せはどれですか？", ["Anchor-Free・FPN・Center-ness", "RPN・ROI Align・Mask branch", "CBOW・Skip-gram・Negative Sampling", "MLM・NSP・segment embedding"], 0, "FCOSはアンカーフリーの1ステージ検出で、FPNとCenter-nessを利用します。", "FCOS", "https://arxiv.org/abs/1904.01355"),
  applicationQuestion("app-seg-001", "U-Net", "U-Netのスキップ接続の主な目的はどれですか？", ["Encoderの細かな位置情報をDecoderへ渡す", "未来トークンを隠す", "候補領域を生成する", "Q値を保存する"], 0, "U-Netは同解像度のEncoder特徴をDecoderへ連結し、アップサンプリング時の位置情報を補います。", "U-Net", "https://arxiv.org/abs/1505.04597"),
  applicationQuestion("app-seg-002", "Segmentation", "同じクラスでも物体個体ごとに別のマスクを出すタスクはどれですか？", ["インスタンスセグメンテーション", "セマンティックセグメンテーションのみ", "画像分類", "言語モデリング"], 0, "Instance Segmentationは同クラスの複数物体も個体ごとに区別します。", "Mask R-CNN", "https://arxiv.org/abs/1703.06870"),
  applicationQuestion("app-word-001", "Word2vec", "CBOWの予測方向として正しいものはどれですか？", ["周辺語から中心語", "中心語から周辺語", "画像から箱", "状態からQ値"], 0, "CBOWは周辺文脈から中心単語を予測します。Skip-gramは逆方向です。", "Efficient Estimation of Word Representations", "https://arxiv.org/abs/1301.3781"),
  applicationQuestion("app-word-002", "Negative Sampling", "Negative Samplingを使う主な理由はどれですか？", ["全語彙Softmaxの計算を少数の負例で近似する", "文章を画像へ変換する", "未来の単語をすべて見せる", "単語ベクトルをone-hotへ固定する"], 0, "少数の負例だけを使い、巨大語彙に対するSoftmax計算を軽量化します。", "Distributed Representations of Words and Phrases", "https://arxiv.org/abs/1310.4546"),
  applicationQuestion("app-llm-001", "BERT", "BERTの代表的な事前学習課題はどれですか？", ["Masked Language Modeling", "Experience Replay", "ROI Pooling", "Triplet Lossのみ"], 0, "BERTは隠したトークンを前後文脈から予測するMLMを用います。", "BERT", "https://arxiv.org/abs/1810.04805"),
  applicationQuestion("app-llm-002", "GPT", "GPT系の生成を支える学習目標はどれですか？", ["Next token prediction", "Next Sentence Predictionのみ", "画像のROI Align", "Center-ness"], 0, "GPTは過去トークンから次トークンを予測し、自己回帰的に文章を生成します。", "Language Models are Unsupervised Multitask Learners", "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"),
  applicationQuestion("app-llm-003", "RAG", "RAGの構成として最も適切なものはどれですか？", ["Retrieverで外部文書を取得し、Generatorへ渡す", "識別器だけで文章を生成する", "RPNで文書候補を生成する", "Replay Bufferから文章を取り出す"], 0, "RAGは検索器と生成器を組み合わせ、外部文書を根拠として回答を生成します。", "Retrieval-Augmented Generation", "https://arxiv.org/abs/2005.11401"),
  applicationQuestion("app-speech-001", "音響特徴", "STFTの目的として適切なものはどれですか？", ["短い時間窓ごとに周波数成分を求める", "物体の候補箱を作る", "単語ベクトルを学ぶ", "報酬を最大化する"], 0, "音声は時間変化するため、短時間窓へ分けてフーリエ変換し、時間周波数表現を作ります。", "WaveNet", "https://arxiv.org/abs/1609.03499"),
  applicationQuestion("app-speech-002", "WaveNet", "WaveNetの代表的な構成要素はどれですか？", ["Dilated Causal Convolution", "ROI Align", "Negative Sampling", "Shapley Value"], 0, "WaveNetは未来を見ない因果畳み込みと、間隔を広げたDilated Convolutionを組み合わせます。", "WaveNet", "https://arxiv.org/abs/1609.03499"),
  applicationQuestion("app-speech-003", "CTC", "CTCが解決する主な問題はどれですか？", ["入力フレーム列と出力文字列の厳密な位置合わせがない学習", "画像のアンカーボックス生成", "単語のNegative Sampling", "GANのmode collapse"], 0, "CTCはblankと重複を含む複数経路を合算し、アラインメントなしで系列変換を学習します。", "Connectionist Temporal Classification", "https://www.cs.toronto.edu/~graves/icml_2006.pdf"),
  applicationQuestion("app-gen-001", "VAE", "VAEに特徴的な手法はどれですか？", ["Reparameterization Trick", "Non-Maximum Suppression", "Experience Replay", "ROI Pooling"], 0, "VAEは平均と分散から潜在変数をサンプリングしつつ逆伝播できるよう再パラメータ化します。", "Auto-Encoding Variational Bayes", "https://arxiv.org/abs/1312.6114"),
  applicationQuestion("app-gen-002", "GAN", "GANのmode collapseとはどのような現象ですか？", ["生成器が少数の似た出力ばかり生成する", "識別器が必ず0になる", "入力サイズが半分になる", "学習データが自動的に増える"], 0, "mode collapseは生成分布の多様性が失われ、似たサンプルへ偏る現象です。", "Generative Adversarial Nets", "https://arxiv.org/abs/1406.2661"),
  applicationQuestion("app-gen-003", "Diffusion", "拡散モデルの生成手順として最も適切なものはどれですか？", ["ノイズから段階的にノイズを除去する", "候補領域をRPNで選ぶ", "中心語から周辺語を予測する", "Q値の最大行動を選ぶ"], 0, "拡散モデルはノイズ付与過程の逆を学び、ランダムノイズから段階的にデータを復元します。", "Denoising Diffusion Probabilistic Models", "https://arxiv.org/abs/2006.11239"),
  applicationQuestion("app-rl-001", "DQN", "DQNでExperience Replayを使う目的はどれですか？", ["時系列に強く相関した経験をランダム化して学習を安定化する", "画像をパッチへ分割する", "外部文書を検索する", "単語の意味を圧縮する"], 0, "経験をバッファへ保存してランダムに取り出し、連続データの相関を弱めます。", "Playing Atari with Deep Reinforcement Learning", "https://arxiv.org/abs/1312.5602"),
  applicationQuestion("app-rl-002", "Actor-Critic", "Actor-CriticでActorとCriticの役割の組合せはどれですか？", ["Actorが方策、Criticが価値評価", "Actorが価値評価、Criticが画像分類", "両方ともRPN", "両方とも単語埋め込み"], 0, "Actorは行動方策を出し、Criticはその状態や行動の価値を評価します。", "Asynchronous Methods for Deep Reinforcement Learning", "https://arxiv.org/abs/1602.01783"),
  applicationQuestion("app-learn-001", "Active Learning", "Uncertainty Samplingの説明として適切なものはどれですか？", ["モデルが不確かな未ラベル例を選び、人へラベル付けを依頼する", "すべてのデータへ同じラベルを付ける", "特徴量を必ず3次元にする", "生成器と識別器を対戦させる"], 0, "能動学習ではラベル付けコストを抑えるため、学習効果が高い例を選択します。", "Active Learning Literature Survey", "https://minds.wisconsin.edu/handle/1793/60660"),
  applicationQuestion("app-learn-002", "Metric Learning", "Triplet Lossで使う3サンプルはどれですか？", ["Anchor・Positive・Negative", "Encoder・Decoder・Softmax", "State・Action・Rewardのみ", "Query・Key・Valueのみ"], 0, "Triplet Lossは基準AnchorにPositiveを近づけ、Negativeを遠ざけます。", "FaceNet", "https://arxiv.org/abs/1503.03832"),
  applicationQuestion("app-learn-003", "MAML", "MAMLが学ぶものとして最も適切なものはどれですか？", ["少数回の更新で新タスクへ適応しやすい初期値", "物体検出のアンカーボックス", "音声のMel尺度", "GANの識別器だけ"], 0, "MAMLはモデルに依存しにくい形で、少数ステップの勾配更新後に性能が上がる初期パラメータを学びます。", "Model-Agnostic Meta-Learning", "https://arxiv.org/abs/1703.03400"),
  applicationQuestion("app-xai-001", "Grad-CAM", "Grad-CAMの説明として最も適切なものはどれですか？", ["畳み込み特徴マップをクラス勾配で重み付けして注目領域を可視化する", "外部文書を検索して回答する", "未ラベル例を選ぶ", "波形を自己回帰生成する"], 0, "Grad-CAMはCNNの特徴マップと勾配を使い、クラス判断へ寄与した画像領域をヒートマップ化します。", "Grad-CAM", "https://arxiv.org/abs/1610.02391"),
  applicationQuestion("app-xai-002", "Integrated Gradients", "Integrated Gradientsの基準となる考え方はどれですか？", ["Baselineから入力までの経路で勾配を積分する", "候補箱をNMSで削除する", "経験をReplay Bufferへ保存する", "窓をShiftさせる"], 0, "基準入力から実入力へ連続的に変化させ、その経路上の勾配を積分して寄与を求めます。", "Axiomatic Attribution for Deep Networks", "https://arxiv.org/abs/1703.01365"),
  applicationQuestion("app-xai-003", "LIME / SHAP", "LIMEとSHAPの対応として正しいものはどれですか？", ["LIMEは局所代理モデル、SHAPはShapley Value", "LIMEはRPN、SHAPはROI Align", "LIMEはQ学習、SHAPは方策勾配", "LIMEはSTFT、SHAPはMFCC"], 0, "LIMEは周辺摂動から局所的な単純モデルを作り、SHAPは協力ゲーム理論のShapley Valueで寄与を配分します。", "A Unified Approach to Interpreting Model Predictions", "https://arxiv.org/abs/1705.07874")
];
