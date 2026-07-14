"use strict";

const DEEP_LEARNING_APPLICATION_QUESTIONS_VERSION = "v0.4.0-dev.21";

function deepLearningApplicationQuestion(
  id, topic, difficulty, syllabusId, question, choices, answer, explanation, cardIds,
  examPriority = 1, questionPolarity = "normal", calculationPattern = null
) {
  return Object.assign(
    syllabusQuestion(
      id, "深層学習の応用", topic, difficulty, syllabusId,
      question, choices, answer, explanation, cardIds
    ),
    { examPriority, questionPolarity, calculationPattern }
  );
}

const DEEP_LEARNING_APPLICATION_QUESTIONS = [
  deepLearningApplicationQuestion(
    "dla-q001", "Scaled Dot-Product Attention", "標準", "3-6-1",
    "QueryとKeyの内積が8、Keyの次元d_kが16のとき、Softmaxへ渡す前のスコアはいくつですか？",
    ["2", "4", "8", "32"], 0,
    "AttentionスコアはQKᵀを√d_kで割ります。8÷√16=8÷4=2です。読み方は『キュー・キー転置を、ディー・ケーの平方根で割る』です。",
    ["term-3-6-self-scaled"], 2, "normal", "scaled_dot_product_attention"
  ),
  deepLearningApplicationQuestion(
    "dla-q002", "Attentionの形状", "標準", "3-6-1",
    "Qの形状がB×H×T_q×d_k、Kの形状がB×H×T_k×d_kのとき、QKᵀの形状はどれですか？",
    ["B×H×d_k×d_k", "B×H×T_q×T_k", "B×T_q×T_k", "B×H×T_k×T_q"], 1,
    "最後のd_kどうしを内積に使うため、Query位置T_qとKey位置T_kが残り、B×H×T_q×T_kになります。",
    ["term-3-5-attention", "term-3-6-self-scaled"], 2, "normal", "attention_shape"
  ),
  deepLearningApplicationQuestion(
    "dla-q003", "Self-AttentionとCross-Attention", "標準", "3-6-1",
    "Encoder-Decoder TransformerのCross-Attentionで、一般的なQ・K・Vの出所として正しいものはどれですか？",
    ["Q・K・VすべてEncoder", "Q・K・VすべてDecoder", "QはDecoder、KとVはEncoder", "QはEncoder、KとVはDecoder"], 2,
    "Cross-Attention（クロス・アテンション／交差注意）では、Decoder側のQueryがEncoder側のKeyとValueを参照します。",
    ["term-3-6-source-masked", "term-3-5-attention"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q004", "Masked Attention", "標準", "3-6-1",
    "Causal Maskについて不適切な説明はどれですか？",
    ["未来トークンへのAttentionを遮断する", "自己回帰生成で利用する", "遮断位置へ大きな負値を加える実装がある", "入力文のPaddingだけを除外するための仕組みである"], 3,
    "Causal Maskは未来参照を防ぐマスクです。Padding Maskは埋め草位置を除外する別目的のマスクです。",
    ["term-3-6-source-masked"], 2, "incorrect_choice"
  ),
  deepLearningApplicationQuestion(
    "dla-q005", "Multi-Head Attention", "基礎", "3-6-1",
    "d_model=768を12個のheadへ等分するとき、1head当たりの次元d_kはいくつですか？",
    ["64", "96", "128", "768"], 0,
    "768÷12=64です。Multi-Head Attention（マルチヘッド・アテンション／複数頭注意）では、通常d_modelをhead数で分割します。",
    ["term-3-6-multihead-position"], 2, "normal", "head_dimension"
  ),
  deepLearningApplicationQuestion(
    "dla-q006", "Multi-Head Attention", "標準", "3-6-1",
    "8headの出力を連結し、各headの出力次元が64のとき、連結直後の次元はいくつですか？",
    ["64", "512", "8", "4096"], 1,
    "各headの64次元を8個連結するため64×8=512次元です。その後、出力射影を適用するのが一般的です。",
    ["term-3-6-multihead-position"], 2, "normal", "multihead_concat"
  ),
  deepLearningApplicationQuestion(
    "dla-q007", "Scaled Dot-Product Attention", "標準", "3-6-1",
    "Attentionの内積を√d_kで割る理由として不適切なものはどれですか？",
    ["d_kが大きいと内積の絶対値が大きくなりやすい", "Softmaxの飽和を抑える", "勾配が極端に小さくなることを抑える", "系列長を必ず半分にする"], 3,
    "√d_kによるスケーリングは内積の分散とSoftmaxの飽和を抑えるためです。系列長を変更する処理ではありません。",
    ["term-3-6-self-scaled"], 2, "incorrect_choice"
  ),
  deepLearningApplicationQuestion(
    "dla-q008", "Transformerの埋め込み", "基礎", "3-6-1",
    "入力表現の形状がB×T×768と書かれているとき、768が表すものとして最も適切なのはどれですか？",
    ["バッチ数", "トークン数", "埋め込み・隠れ表現の次元", "語彙数"], 2,
    "BはBatch（バッチ）、TはToken length（トークン長）、768は各トークンを表す埋め込みまたは隠れ表現の次元です。",
    ["term-3-6-multihead-position"], 2
  ),

  deepLearningApplicationQuestion(
    "dla-q009", "ViTのトークン数", "基礎", "4-1-2",
    "224×224のRGB画像を16×16のパッチへ分割するViTで、CLS Tokenを含む入力トークン数はいくつですか？",
    ["196", "197", "224", "225"], 1,
    "縦横とも224÷16=14なのでパッチ数は14×14=196です。CLS Token（シーエルエス・トークン／分類トークン）を1つ加えて197です。",
    ["term-4-1-patch-embedding", "term-4-1-cls-token"], 2, "normal", "vit_token_count"
  ),
  deepLearningApplicationQuestion(
    "dla-q010", "ViTのトークン数", "標準", "4-1-2",
    "384×384画像を16×16のパッチへ分割し、CLS Tokenを1つ加える場合のトークン数はいくつですか？",
    ["576", "384", "577", "625"], 2,
    "384÷16=24、24×24=576パッチです。CLS Tokenを加えて577トークンになります。",
    ["term-4-1-patch-embedding", "term-4-1-cls-token"], 2, "normal", "vit_token_count"
  ),
  deepLearningApplicationQuestion(
    "dla-q011", "Patch Embedding", "基礎", "4-1-2",
    "16×16のRGBパッチを平坦化した直後の要素数として不適切なものはどれですか？",
    ["16×16×3", "768", "各画素3チャネルを含む", "16×16=256だけでRGBチャネルを含まない"], 3,
    "RGBは3チャネルなので16×16×3=768要素です。256は空間画素数だけで、チャネルを含みません。",
    ["term-4-1-patch-embedding"], 2, "incorrect_choice", "patch_vector_dimension"
  ),
  deepLearningApplicationQuestion(
    "dla-q012", "ViTの位置埋め込み", "標準", "4-1-2",
    "197トークン、埋め込み次元768のViTで、各トークンへ加える位置埋め込みの代表的な形状はどれですか？",
    ["1×768", "197×197", "1×197×768", "768×768"], 2,
    "バッチ方向へ共有する位置埋め込みは1×197×768の形が代表的です。各トークン位置に768次元の位置表現を加えます。",
    ["term-4-1-patch-embedding", "term-3-6-multihead-position"], 2, "normal", "position_embedding_shape"
  ),
  deepLearningApplicationQuestion(
    "dla-q013", "ViTとCNN", "標準", "4-1-2",
    "ViTについて不適切な説明はどれですか？",
    ["画像をパッチ列として扱う", "位置情報を与える必要がある", "Self-Attentionでパッチ間関係を学ぶ", "畳み込みの局所受容野だけを必ず用いて情報を混合する"], 3,
    "標準的なViTはパッチ列へSelf-Attentionを適用します。CNNのように畳み込みの局所受容野だけへ限定されるわけではありません。",
    ["term-4-1-patch-embedding", "compare-4-1-vit-swin"], 2, "incorrect_choice"
  ),
  deepLearningApplicationQuestion(
    "dla-q014", "Swin Transformer", "標準", "4-1-2",
    "Swin Transformerが隣接するWindow間で情報を交換する主要な仕組みはどれですか？",
    ["CLS Tokenを削除する", "Shifted Windowで窓位置をずらす", "全層を全結合層にする", "画像を1パッチだけにする"], 1,
    "Shifted Window（シフテッド・ウィンドウ／シフト窓）により、前層とは異なる窓境界でAttentionを計算し、窓間の情報を接続します。",
    ["term-4-1-shifted-window", "compare-4-1-vit-swin"], 1
  ),

  deepLearningApplicationQuestion(
    "dla-q015", "Contrastive Learning", "基礎", "4-8-2",
    "画像のContrastive LearningでPositive Pairとして最も典型的な組合せはどれですか？",
    ["同じ画像へ異なるデータ拡張を適用した2例", "無関係な2画像", "正解ラベルと損失値", "学習率とバッチサイズ"], 0,
    "Contrastive Learning（コントラスティブ・ラーニング／対照学習）では、同じ対象の異なる拡張を近づけるPositive Pairとして扱います。",
    ["term-4-8-contrastive-learning"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q016", "Contrastive Learning", "標準", "4-8-2",
    "対照学習の目的として最も適切なものはどれですか？",
    ["すべての埋め込みを同じ点へ集める", "Positiveを近づけ、Negativeを相対的に遠ざける", "入力画像の画素数を減らす", "分類器の出力クラス数を固定する"], 1,
    "表現空間で似た対象を近づけ、異なる対象を遠ざけることで、下流課題に使える埋め込みを学習します。",
    ["term-4-8-contrastive-learning", "term-4-8-triplet-loss"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q017", "Triplet Loss", "標準", "4-8-4",
    "Triplet Lossについて不適切な説明はどれですか？",
    ["Anchor・Positive・Negativeを使う", "AnchorとPositiveの距離を小さくする", "AnchorとNegativeをマージン以上遠ざける", "PositiveをNegativeより遠くすることを目標にする"], 3,
    "Triplet Loss（トリプレット・ロス／三つ組損失）はPositiveを近づけ、Negativeを遠ざけます。目的を逆にしないことが重要です。",
    ["term-4-8-triplet-loss", "formula-4-8-triplet"], 2, "incorrect_choice", "triplet_loss"
  ),

  deepLearningApplicationQuestion(
    "dla-q018", "Diffusion Model", "基礎", "4-6-1",
    "拡散モデルのForward Processで行うことはどれですか？",
    ["データへ段階的にノイズを加える", "識別器と敵対学習する", "報酬を最大化する", "パッチへ分割する"], 0,
    "Forward Process（フォワード・プロセス／順過程）では、データへ少しずつノイズを加えて単純な分布へ近づけます。",
    ["term-4-6-diffusion"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q019", "Diffusion Model", "標準", "4-6-1",
    "代表的な拡散モデルでニューラルネットワークが学習する対象として最も近いものはどれですか？",
    ["正解クラスのone-hotだけ", "各時刻で加えられたノイズまたはそれに等価な量", "物体検出のAnchor Box", "将来報酬の最大値だけ"], 1,
    "代表的なDDPMでは、時刻tのノイズ付きデータから加えられたノイズを予測し、Reverse Process（逆過程）を構成します。",
    ["term-4-6-diffusion"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q020", "Diffusion Model", "標準", "4-6-1",
    "拡散モデルについて不適切な説明はどれですか？",
    ["ノイズ除去を複数ステップ繰り返して生成できる", "Noise Scheduleを用いる", "GANと同様に識別器との敵対学習が必須である", "順過程と逆過程を区別する"], 2,
    "標準的な拡散モデルにGANのDiscriminator（ディスクリミネーター／識別器）は必須ではありません。",
    ["term-4-6-diffusion", "term-4-6-gan"], 2, "incorrect_choice"
  ),

  deepLearningApplicationQuestion(
    "dla-q021", "GAN", "標準", "4-6-3",
    "GANでDiscriminatorが実データxに対して目指す出力として最も適切なものはどれですか？",
    ["D(x)を1へ近づける", "D(x)を0へ近づける", "常に0.5へ固定する", "画像サイズと同じ値にする"], 0,
    "Discriminator（ディスクリミネーター／識別器）は実データを真と判定するためD(x)を1へ、生成データD(G(z))を0へ近づけます。",
    ["term-4-6-gan", "formula-4-6-gan"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q022", "GAN", "標準", "4-6-3",
    "Generator更新でよく使われる非飽和損失の考え方はどれですか？",
    ["D(G(z))を0へ近づける", "−log D(G(z))を最小化し、D(G(z))を1へ近づける", "実データをノイズへ変換する", "Q値を最大化する"], 1,
    "Generator（ジェネレーター／生成器）は生成データを本物と思わせたいので、非飽和損失では−log D(G(z))を最小化します。",
    ["term-4-6-gan", "formula-4-6-gan"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q023", "GAN", "基礎", "4-6-3",
    "Mode Collapseについて不適切な説明はどれですか？",
    ["生成結果の多様性が失われる", "似たサンプルばかり生成する", "GANで起こり得る", "すべての訓練例を均等に再現できた理想状態である"], 3,
    "Mode Collapse（モード・コラプス／モード崩壊）は、生成分布の一部へ偏って多様性を失う失敗状態です。",
    ["term-4-6-mode-collapse", "term-4-6-gan"], 2, "incorrect_choice"
  ),

  deepLearningApplicationQuestion(
    "dla-q024", "Q Learning", "標準", "4-7-1",
    "Q=5、学習率α=0.2、報酬r=1、割引率γ=0.9、次状態の最大Qが7のとき、1回更新後のQはいくつですか？",
    ["5.46", "6.00", "6.46", "7.30"], 0,
    "TD目標は1+0.9×7=7.3、TD誤差は7.3−5=2.3です。Q←5+0.2×2.3=5.46ですが、選択肢では5.46が正答です。",
    ["term-4-7-dqn", "term-4-7-td-learning", "formula-4-7-qlearning"], 2, "normal", "q_learning_update"
  ),
  deepLearningApplicationQuestion(
    "dla-q025", "価値関数", "基礎", "4-7-1",
    "状態価値V(s)と行動価値Q(s,a)の違いとして正しいものはどれですか？",
    ["Vは行動を含み、Qは含まない", "Vは状態の価値、Qは状態と行動の組の価値", "どちらも即時報酬だけ", "どちらも教師ラベル"], 1,
    "V(s)は状態sから期待される収益、Q(s,a)は状態sで行動aを取ったときの期待収益です。",
    ["term-4-7-dqn", "term-4-7-actor-critic"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q026", "Actor-Critic", "基礎", "4-7-2",
    "Actor-Criticの役割分担として正しいものはどれですか？",
    ["Actorが価値を評価し、Criticが画像を生成する", "ActorとCriticは同じ固定表", "Actorが方策を出し、Criticが価値を評価する", "ActorがReplay Bufferだけを管理する"], 2,
    "Actor（アクター／行動方策側）が行動分布を出し、Critic（クリティック／評価側）が価値を推定します。",
    ["term-4-7-actor-critic"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q027", "DQN", "標準", "4-7-1",
    "DQNについて不適切な説明はどれですか？",
    ["Q(s,a)をニューラルネットワークで近似する", "Experience Replayで時系列相関を弱める", "Target Networkで学習を安定化できる", "基本形では連続行動を確率密度として直接出力するActorが必須である"], 3,
    "基本的なDQNは離散行動ごとのQ値を出す価値ベース手法で、Actorを必須としません。",
    ["term-4-7-dqn", "term-4-7-experience-replay"], 2, "incorrect_choice"
  ),

  deepLearningApplicationQuestion(
    "dla-q028", "FCOS", "標準", "4-2-3",
    "FCOSで特徴マップ上のある位置から物体境界までを表す代表的な回帰値はどれですか？",
    ["左・上・右・下までの距離", "Anchor番号だけ", "クラス数だけ", "画像全体の平均画素値"], 0,
    "FCOS（エフコス）はAnchor-Freeで、各位置から箱の左・上・右・下境界までの距離を直接回帰します。",
    ["term-4-2-centerness", "compare-4-2-anchor-fcos"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q029", "FCOS", "標準", "4-2-3",
    "FCOSのCenter-nessの役割として最も適切なものはどれですか？",
    ["画像を中央で切り取る", "物体中心から遠い位置の低品質な箱を抑える", "Anchor Boxを生成する", "クラスラベルをone-hot化する"], 1,
    "Center-ness（センターネス／中心らしさ）は、物体中心から離れた位置による低品質な予測のスコアを抑えます。",
    ["term-4-2-centerness", "compare-4-2-anchor-fcos"], 2
  ),
  deepLearningApplicationQuestion(
    "dla-q030", "FCOS", "標準", "4-2-3",
    "FCOSについて不適切な説明はどれですか？",
    ["Anchor-Freeの1ステージ検出器である", "各位置から箱境界までの距離を回帰する", "Center-nessを利用する", "事前定義した多数のAnchor BoxとのIoU照合が必須である"], 3,
    "FCOSはAnchor-Free（アンカーフリー／基準箱を使わない）方式なので、多数の事前定義Anchorとの照合を必須としません。",
    ["term-4-2-centerness", "compare-4-2-anchor-fcos"], 2, "incorrect_choice"
  )
];
