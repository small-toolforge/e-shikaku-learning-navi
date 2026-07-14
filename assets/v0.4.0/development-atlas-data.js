"use strict";

const DEVELOPMENT_ATLAS_VERSION = "v0.4.0-dev.11";

const DEVELOPMENT_ATLASES = [
  {
    id: "compression",
    order: 110,
    category: "5-(1) エッジコンピューティング・モデル軽量化",
    title: "Pruning / Distillation / Quantization",
    kana: "プルーニング／ディスティレーション／クオンタイゼーション",
    ja: "枝刈り・知識蒸留・量子化によるモデル軽量化",
    summary: "大きなモデルを端末へ載せる代表的な3経路です。プルーニングは不要部分を削り、知識蒸留は教師から小さな生徒へ学習させ、量子化は数値表現を低ビット化します。",
    syllabus: ["エッジコンピューティング", "プルーニング", "知識蒸留", "PTQ / QAT", "INT8量子化"],
    viewBox: "0 0 900 570",
    nodes: [
      applicationNode("largeModel", 25, 245, 130, 66, ["Large Model", "FP32"], "Large Model", "ラージ・モデル", "大規模モデル", "高精度でも、端末のメモリ・計算量・消費電力へ収まらない場合があります。", "軽量化前の基準モデルです。容量だけでなく実測遅延も確認します。", "input"),
      applicationNode("prune", 210, 65, 155, 66, ["Pruning", "Remove"], "Pruning", "プルーニング", "プルーニング・枝刈り", "重要度の低い重み、チャネル、ヘッド、層などを削ります。", "個別重みを0にするのが非構造化、チャネルなどのまとまりを削るのが構造化です。", "main"),
      applicationNode("sparse", 430, 65, 155, 66, ["Sparse / Small", "Model"], "Sparse or Smaller Model", "スパース・オア・スモーラー・モデル", "疎または小型のモデル", "削減後のモデルです。疎性を実行環境が活用できなければ、容量が減っても高速化しない場合があります。", "ゼロ重みの増加と実測速度向上は同義ではありません。", "output"),
      applicationNode("teacher", 205, 245, 150, 66, ["Teacher", "Soft Targets"], "Teacher Model and Soft Targets", "ティーチャー・モデル・アンド・ソフト・ターゲッツ", "教師モデルとソフトターゲット", "教師の確率分布や中間表現を、生徒モデルの学習信号として使います。", "クラス間の類似度を含む柔らかい分布が知識蒸留の手掛かりです。", "attention"),
      applicationNode("student", 430, 245, 155, 66, ["Student", "Model"], "Student Model", "スチューデント・モデル", "生徒モデル", "小型モデルが教師の出力へ近づくよう学習します。", "既存モデルの要素を削るのではなく、別の小型モデルを訓練します。", "output"),
      applicationNode("quant", 205, 425, 155, 66, ["PTQ / QAT", "Scale + Zero"], "Post-Training or Quantization-Aware Training", "ポストトレーニング／クオンタイゼーション・アウェア・トレーニング", "学習後量子化／量子化認識学習", "PTQは学習後に校正して量子化し、QATは学習中から量子化誤差を模擬します。", "後処理ならPTQ、fake quantizationを含む再学習ならQATです。", "position"),
      applicationNode("int8", 430, 425, 155, 66, ["INT8 Model", "Low Bit"], "Low-Bit Model", "ロービット・モデル", "低ビットモデル", "FP32などをINT8へ変換し、容量と対応デバイス上の演算コストを削減します。", "1億パラメータを8bitで持つ重み容量は概算約100MBです。", "output"),
      applicationNode("edge", 690, 245, 170, 78, ["Edge Device", "Latency / Memory"], "Edge Device", "エッジ・デバイス", "端末・現場機器", "軽量化後のモデルを、メモリ、遅延、電力、精度の制約を確認して配置します。", "ファイル容量だけでなく、対応演算・実行時活性値・実測速度も評価します。", "merge")
    ],
    edges: [
      applicationEdge("largeModel", "prune", "削る"), applicationEdge("prune", "sparse"), applicationEdge("sparse", "edge"),
      applicationEdge("largeModel", "teacher", "教える"), applicationEdge("teacher", "student"), applicationEdge("student", "edge"),
      applicationEdge("largeModel", "quant", "低ビット化"), applicationEdge("quant", "int8"), applicationEdge("int8", "edge")
    ],
    reading: ["大規模モデルと端末制約を確認する", "Pruning・Distillation・Quantizationのどの経路かを見分ける", "軽量化後の精度を再評価する", "対象デバイスで容量・遅延・電力を実測する"],
    compare: [["Pruning", "重み・チャネル・層など、既存モデルの要素を削る"], ["Distillation", "教師の出力分布を使い、別の小型Studentを学習する"], ["Quantization", "FP32からINT8などへ数値表現のビット数を減らす"], ["構造化Pruning", "一般的な密演算へ落とし込みやすく、実測高速化につなげやすい"]],
    questionIds: ["devops-q002", "devops-q004", "devops-q005", "devops-q006"],
    sources: [
      { kind: "primary-paper", title: "Deep Compression", url: "https://arxiv.org/abs/1510.00149", year: 2015 },
      { kind: "primary-paper", title: "Distilling the Knowledge in a Neural Network", url: "https://arxiv.org/abs/1503.02531", year: 2015 },
      { kind: "primary-paper", title: "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference", url: "https://arxiv.org/abs/1712.05877", year: 2017 }
    ]
  },
  {
    id: "distributed",
    order: 120,
    category: "5-(2) 並列分散処理",
    title: "Data / Model Parallelism and Gradient Aggregation",
    kana: "データ／モデル・パラレリズム・アンド・グラディエント・アグリゲーション",
    ja: "データ並列・モデル並列と勾配集約",
    summary: "データ並列は同じモデルを各GPUへ複製して異なるミニバッチを処理し、勾配を集約します。モデル並列は巨大モデル自体を層やテンソル単位で複数デバイスへ分割します。",
    syllabus: ["分散深層学習", "データ並列化", "モデル並列化", "All-Reduce", "Parameter Server", "同期 / 非同期"],
    viewBox: "0 0 900 600",
    nodes: [
      applicationNode("dataset", 25, 130, 125, 66, ["Dataset", "Mini-batches"], "Dataset and Mini-Batches", "データセット・アンド・ミニバッチズ", "データとミニバッチ", "データ並列ではミニバッチを複数ワーカーへ分割します。", "データを分けても、各ワーカーには通常同じモデル全体があります。", "input"),
      applicationNode("replicaA", 205, 50, 145, 66, ["GPU 1", "Model Copy"], "Model Replica", "モデル・レプリカ", "モデル複製1", "モデル全体の複製がミニバッチAを処理します。", "モデル全体が各GPUのメモリへ収まることが前提です。", "main"),
      applicationNode("replicaB", 205, 150, 145, 66, ["GPU 2", "Model Copy"], "Model Replica", "モデル・レプリカ", "モデル複製2", "同じ重みから始め、別のミニバッチを処理します。", "異なるデータを同じモデルで処理するのがData Parallelismです。", "main"),
      applicationNode("replicaC", 205, 250, 145, 66, ["GPU 3", "Model Copy"], "Model Replica", "モデル・レプリカ", "モデル複製3", "各ワーカーがローカル勾配を計算します。", "同期学習では全ワーカーの完了を待つためStragglerが問題になります。", "main"),
      applicationNode("aggregate", 435, 135, 175, 76, ["All-Reduce /", "Parameter Server"], "Gradient Aggregation", "グラディエント・アグリゲーション", "勾配集約", "All-Reduceはワーカー間で集団通信し、Parameter Serverは管理役へ更新を集めます。", "全員待ちなら同期、古い勾配を順次反映するなら非同期です。", "merge"),
      applicationNode("syncModel", 690, 135, 170, 76, ["Updated Model", "Next Step"], "Synchronized Model", "シンクロナイズド・モデル", "更新済み共有モデル", "集約した勾配で各モデル複製を同じ重みへ更新します。", "同期学習では同じステップの重み世代を揃えやすいです。", "output"),
      applicationNode("hugeModel", 25, 455, 145, 66, ["Huge Model", "Too Large"], "Huge Model", "ヒュージ・モデル", "巨大モデル", "モデル全体が1台のGPUメモリへ収まらない状態です。", "この制約ではデータ並列だけでは解決せず、モデル並列が候補です。", "input"),
      applicationNode("stage1", 235, 410, 135, 66, ["GPU 1", "Layers 1..n"], "Model Partition", "モデル・パーティション", "モデル分割前半", "層・テンソルなどモデルの一部を担当します。", "デバイス間で中間活性値を受け渡します。", "position"),
      applicationNode("stage2", 435, 410, 135, 66, ["GPU 2", "Layers n+1.."], "Model Partition", "モデル・パーティション", "モデル分割後半", "残りのモデル部分を担当します。", "分割位置と通信量がボトルネックへ影響します。", "position"),
      applicationNode("result", 690, 410, 170, 66, ["Forward /", "Backward"], "Pipeline or Tensor Parallel Execution", "パイプライン／テンソル・パラレル", "分割モデルの協調実行", "複数GPUが中間値と勾配を交換し、1つのモデルとして順伝播・逆伝播します。", "モデル自体を分けるのがModel Parallelismです。", "output")
    ],
    edges: [
      applicationEdge("dataset", "replicaA", "batch A"), applicationEdge("dataset", "replicaB", "batch B"), applicationEdge("dataset", "replicaC", "batch C"),
      applicationEdge("replicaA", "aggregate", "grad A"), applicationEdge("replicaB", "aggregate", "grad B"), applicationEdge("replicaC", "aggregate", "grad C"), applicationEdge("aggregate", "syncModel"),
      applicationEdge("hugeModel", "stage1"), applicationEdge("stage1", "stage2", "activation"), applicationEdge("stage2", "result")
    ],
    reading: ["同じモデルを複製してデータを分けるならデータ並列", "各ワーカーの勾配をAll-ReduceまたはParameter Serverで集約する", "全ワーカー待ちと古い勾配から同期・非同期を見分ける", "モデルが1台に収まらないならモデル自体を分割する"],
    compare: [["Data Parallelism", "同じモデルを複製し、異なるミニバッチを処理して勾配集約"], ["Model Parallelism", "モデルの層・テンソルを複数デバイスへ分割"], ["Synchronous", "全ワーカーを待ち、重み世代を揃えやすいがStragglerに弱い"], ["Asynchronous", "待ち時間を減らせるがStale Gradientに注意"]],
    questionIds: ["devops-q007", "devops-q008", "devops-q009", "devops-q010"],
    sources: [
      { kind: "primary-paper", title: "Parameter Server for Distributed Machine Learning", url: "https://www.usenix.org/conference/osdi14/technical-sessions/presentation/li_mu", year: 2014 },
      { kind: "primary-paper", title: "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism", url: "https://arxiv.org/abs/1909.08053", year: 2019 }
    ]
  },
  {
    id: "federated",
    order: 130,
    category: "5-(2) 連合学習",
    title: "Federated Learning / Federated Averaging",
    kana: "フェデレーテッド・ラーニング／フェデレーテッド・アベレージング",
    ja: "連合学習とデータ件数による重み付き集約",
    summary: "生データを各端末・組織へ残したまま、グローバルモデルを配布し、ローカル学習した更新をFedAvgなどで集約します。Non-IID、端末離脱、更新情報の保護が重要です。",
    syllabus: ["Federated Learning", "Cross-Device", "Cross-Silo", "Local / Global Model", "Federated Averaging", "Non-IID"],
    viewBox: "0 0 900 570",
    nodes: [
      applicationNode("global", 350, 35, 200, 72, ["Global Model", "Round t"], "Global Model", "グローバル・モデル", "グローバルモデル", "集約側が現在の共有モデルを参加クライアントへ配布します。", "中央へ生データを集めるのではなく、モデルを配布します。", "merge"),
      applicationNode("clientA", 55, 210, 165, 76, ["Client A", "100 samples"], "Client A Local Training", "クライアント・エー・ローカル・トレーニング", "クライアントAのローカル学習", "自組織・自端末の100件を使ってローカルモデルを更新します。", "Cross-Deviceは多数で不安定な端末、Cross-Siloは少数の安定した組織が代表です。", "main"),
      applicationNode("clientB", 367, 210, 165, 76, ["Client B", "300 samples"], "Client B Local Training", "クライアント・ビー・ローカル・トレーニング", "クライアントBのローカル学習", "300件を使うため、FedAvgではAより大きな重みになります。", "単純平均ではなくデータ件数比を使う点が試験の計算ポイントです。", "main"),
      applicationNode("clientC", 680, 210, 165, 76, ["Client C", "Non-IID"], "Client C Local Training", "クライアント・シー・ローカル・トレーニング", "クライアントCのローカル学習", "他クライアントと異なるクラス・入力分布を持つNon-IIDの例です。", "分布差はClient Driftや収束悪化の原因になります。", "main"),
      applicationNode("updates", 235, 365, 190, 72, ["Model Updates", "not raw data"], "Model Updates", "モデル・アップデーツ", "モデル更新情報", "各クライアントは生データではなく、重み・勾配などの更新情報を送ります。", "生データを送らなくても、更新からの情報漏えいや悪意ある更新への対策は必要です。", "attention"),
      applicationNode("fedavg", 505, 365, 190, 72, ["FedAvg", "Σ(nk/N)wk"], "Federated Averaging", "フェデレーテッド・アベレージング", "連合平均", "参加クライアントのローカルモデルを、データ件数に応じて重み付き平均します。", "100件と300件なら重みは0.25対0.75です。", "merge"),
      applicationNode("next", 350, 490, 200, 62, ["Global Model", "Round t+1"], "Next Global Model", "ネクスト・グローバル・モデル", "次ラウンドのグローバルモデル", "集約結果を次ラウンドの共有モデルとして再配布します。", "配布→ローカル学習→集約を複数ラウンド繰り返します。", "output")
    ],
    edges: [
      applicationEdge("global", "clientA", "配布", true), applicationEdge("global", "clientB", "配布", true), applicationEdge("global", "clientC", "配布", true),
      applicationEdge("clientA", "updates", "wA"), applicationEdge("clientB", "updates", "wB"), applicationEdge("clientC", "updates", "wC"),
      applicationEdge("updates", "fedavg"), applicationEdge("fedavg", "next"), applicationEdge("next", "global", "next round", true)
    ],
    reading: ["グローバルモデルを参加クライアントへ配布する", "各クライアントがローカルデータで学習する", "生データではなくモデル更新を返す", "FedAvgでデータ件数比により集約し、次ラウンドへ進む"],
    compare: [["Cross-Device", "多数のスマートフォン・IoT。一部参加、離脱、通信制約を前提"], ["Cross-Silo", "少数の企業・病院・拠点。比較的安定した継続参加"], ["Local Model", "各参加者のデータで更新したモデル"], ["Global Model", "ローカル更新を集約した共有モデル"], ["Non-IID", "参加者ごとにデータ分布が異なり、収束を難しくする"]],
    questionIds: ["devops-q011", "devops-q012", "devops-q013", "devops-q014"],
    sources: [
      { kind: "primary-paper", title: "Communication-Efficient Learning of Deep Networks from Decentralized Data", url: "https://arxiv.org/abs/1602.05629", year: 2016 }
    ]
  },
  {
    id: "virtualization",
    order: 140,
    category: "5-(4) 環境構築",
    title: "Hosted / Bare-Metal / Container Virtualization",
    kana: "ホステッド／ベアメタル／コンテナ・ヴァーチャライゼーション",
    ja: "ホスト型・ハイパーバイザー型・コンテナ型仮想化",
    summary: "仮想マシンはゲストOSごと隔離し、コンテナはホストカーネルを共有してプロセスを隔離します。Dockerfileはイメージを作るレシピ、Imageはテンプレート、Containerは実行インスタンスです。",
    syllabus: ["仮想化環境", "ホスト型", "ハイパーバイザー型", "コンテナ型", "Docker", "Dockerfile", "Image / Container"],
    viewBox: "0 0 900 620",
    nodes: [
      applicationNode("hardware", 350, 535, 200, 62, ["Physical", "Hardware"], "Physical Hardware", "フィジカル・ハードウェア", "物理ハードウェア", "CPU、メモリ、ストレージなどの物理資源です。", "仮想化方式は、ハードウェアとゲスト環境の間に何があるかで見分けます。", "input"),
      applicationNode("hostOS", 55, 405, 180, 62, ["Host OS", "Windows / Linux"], "Host Operating System", "ホスト・オペレーティング・システム", "ホストOS", "ホスト型仮想化では一般OS上に仮想化ソフトを置きます。", "ホストOSの上ならHosted Virtualizationです。", "main"),
      applicationNode("hosted", 55, 280, 180, 62, ["Hosted", "Hypervisor"], "Hosted Hypervisor", "ホステッド・ハイパーバイザー", "ホスト型仮想化ソフト", "一般OS上のアプリケーションとして仮想マシンを管理します。", "導入しやすい一方、ホストOSを介する階層があります。", "position"),
      applicationNode("guestVM1", 55, 150, 180, 76, ["Guest OS", "+ App"], "Virtual Machine", "ヴァーチャル・マシン", "仮想マシン", "ゲストOSとアプリケーションを含む独立環境です。", "VMはゲストOSを含み、コンテナより一般に重い構成です。", "output"),
      applicationNode("bare", 355, 405, 190, 62, ["Bare-Metal", "Hypervisor"], "Bare-Metal Hypervisor", "ベアメタル・ハイパーバイザー", "ハイパーバイザー型仮想化", "物理ハードウェア上へ直接配置するType 1の方式です。", "ホストOSを介さずハードウェアへ直接載る点が識別語です。", "main"),
      applicationNode("guestVM2", 355, 280, 190, 76, ["Guest OS", "+ App"], "Virtual Machine", "ヴァーチャル・マシン", "仮想マシン", "ハイパーバイザー上でゲストOSごと実行します。", "VMごとに異なるOSを使える一方、OS分の資源が必要です。", "output"),
      applicationNode("containerOS", 665, 405, 180, 62, ["Host OS", "Shared Kernel"], "Host OS and Shared Kernel", "ホスト・オーエス・アンド・シェアード・カーネル", "ホストOSと共有カーネル", "コンテナは通常、ホストOSのカーネルを共有します。", "ゲストOSを個別に持たない点がVMとの大きな違いです。", "main"),
      applicationNode("runtime", 665, 280, 180, 62, ["Container", "Runtime"], "Container Runtime", "コンテナ・ランタイム", "コンテナ実行基盤", "Dockerなどがイメージから隔離されたプロセス環境を作ります。", "Dockerはハイパーバイザーそのものではありません。", "position"),
      applicationNode("image", 610, 135, 125, 76, ["Image", "Template"], "Container Image", "コンテナ・イメージ", "コンテナイメージ", "Dockerfileなどから構築される読み取り中心の実行テンプレートです。", "Imageは設計図・配布単位です。", "attention"),
      applicationNode("container", 765, 135, 125, 76, ["Container", "Instance"], "Container", "コンテナ", "コンテナ実体", "イメージから生成された実行中または停止中のインスタンスです。", "同じImageから複数Containerを作れます。", "output"),
      applicationNode("dockerfile", 610, 20, 280, 62, ["Dockerfile", "FROM / COPY / RUN / CMD"], "Dockerfile", "ドッカーファイル", "Dockerfile", "ベースイメージ、ファイル配置、依存関係、実行設定を記述するイメージ構築レシピです。", "DockerfileはImageでもContainerでもなく、Imageを作る宣言ファイルです。", "special")
    ],
    edges: [
      applicationEdge("hardware", "hostOS"), applicationEdge("hostOS", "hosted"), applicationEdge("hosted", "guestVM1"),
      applicationEdge("hardware", "bare"), applicationEdge("bare", "guestVM2"),
      applicationEdge("hardware", "containerOS"), applicationEdge("containerOS", "runtime"), applicationEdge("runtime", "container"),
      applicationEdge("dockerfile", "image", "build"), applicationEdge("image", "container", "run")
    ],
    reading: ["ホストOS上に仮想化ソフトがあるならホスト型", "ハードウェア上へ直接ハイパーバイザーを置くならType 1", "ホストカーネル共有でプロセスを隔離するならコンテナ型", "DockerfileからImageをbuildし、ImageからContainerをrunする"],
    compare: [["Hosted", "通常のホストOS上で仮想化ソフトを実行"], ["Bare-Metal", "ハードウェア上へ直接ハイパーバイザーを配置"], ["Virtual Machine", "ゲストOSを含み、比較的強い分離と大きな資源量"], ["Container", "ホストカーネルを共有し、軽量・高速起動"], ["Image / Container", "実行テンプレート / そこから生成したインスタンス"]],
    questionIds: ["devops-q019", "devops-q020", "devops-q021", "devops-q022"],
    sources: [
      { kind: "primary-paper", title: "An Updated Performance Comparison of Virtual Machines and Linux Containers", url: "https://ieeexplore.ieee.org/document/7095802", year: 2015 },
      { kind: "official", title: "Dockerfile reference", url: "https://docs.docker.com/reference/dockerfile/", year: 2026 }
    ]
  }
];

APPLICATION_ATLASES.push(...DEVELOPMENT_ATLASES);

const DEVELOPMENT_ATLAS_BY_SYLLABUS = {
  "5-1-1": "compression",
  "5-2-1": "distributed",
  "5-2-2": "federated",
  "5-4-1": "virtualization"
};

for (const card of [...TERMS, ...FORMULAS, ...COMPARES]) {
  const atlasId = DEVELOPMENT_ATLAS_BY_SYLLABUS[card.syllabusId];
  if (atlasId) card.atlasId = atlasId;
}
