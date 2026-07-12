"use strict";

const DEVELOPMENT_OPERATIONS_QUESTIONS = [
  syllabusQuestion(
    "devops-q001", "開発・運用環境", "エッジコンピューティング", "基礎", "5-1-1",
    "エッジコンピューティングを採用する理由として最も適切なものはどれですか？",
    ["すべての学習処理を必ず端末だけで行うため", "低遅延・通信量削減・オフライン動作などを実現するため", "モデルの精度を必ず100%にするため", "クラウドを使うことを技術的に禁止するため"], 1,
    "エッジコンピューティングは端末や現場に近い場所で推論・処理し、遅延、帯域、プライバシー、オフライン性を改善します。学習まで必ず端末側とは限りません。",
    ["term-5-1-edge"]
  ),
  syllabusQuestion(
    "devops-q002", "開発・運用環境", "構造化・非構造化プルーニング", "標準", "5-1-1",
    "一般的なハードウェアで実行速度の向上へつなげやすいプルーニングはどれですか？",
    ["重みをランダムに増やす手法", "すべての重みを同じ値にする手法", "個々の重みだけを0にする非構造化プルーニング", "チャネルやフィルタ単位で削除する構造化プルーニング"], 3,
    "構造化プルーニングはチャネルや層などのまとまりを削り、通常の密な小型演算へ落とし込みやすいため、一般的なハードウェアで高速化しやすいです。",
    ["term-5-1-pruning", "term-5-1-structured-pruning", "term-5-1-unstructured-pruning", "compare-5-1-structured-unstructured"]
  ),
  syllabusQuestion(
    "devops-q003", "開発・運用環境", "プルーニング", "標準", "5-1-1",
    "非構造化プルーニングで重みの多くを0にしたのに、推論時間がほとんど短くならない主な理由として適切なものはどれですか？",
    ["実行環境が疎行列演算を活用できていないから", "モデルの重みが0になると必ず演算量が増えるから", "プルーニングは学習データを増やす手法だから", "非構造化プルーニングは量子化と同じだから"], 0,
    "重みが0でも、密行列として同じ演算を実行すれば速度は上がりません。疎性を利用できるライブラリやハードウェアが必要です。",
    ["term-5-1-pruning", "term-5-1-unstructured-pruning", "compare-5-1-structured-unstructured"]
  ),
  syllabusQuestion(
    "devops-q004", "開発・運用環境", "知識蒸留", "基礎", "5-1-1",
    "知識蒸留におけるSoft Targetの利点として適切なものはどれですか？",
    ["Studentモデルの層数を自動的にTeacherと同じにする", "クラス間の類似度を含むTeacherの確率分布をStudentへ伝えられる", "学習済みモデルの重みをすべて0にする", "入力データをINT8へ変換する"], 1,
    "Teacherが出す柔らかい確率分布には、正解以外のクラスとの関係も含まれます。Studentはhard labelだけより豊かな情報を学べます。",
    ["term-5-1-distillation", "term-5-1-teacher-student", "compare-5-1-pruning-distillation"]
  ),
  syllabusQuestion(
    "devops-q005", "開発・運用環境", "PTQとQAT", "標準", "5-1-1",
    "PTQとQATの説明として正しいものはどれですか？",
    ["PTQは学習中に量子化誤差を模擬し、QATは学習後だけに適用する", "PTQとQATはどちらもプルーニングの別名である", "PTQは学習後に適用し、QATは学習中に量子化誤差を考慮する", "QATは量子化を行わず、データ並列だけを行う"], 2,
    "PTQは学習済みモデルへ後処理として適用し、QATはfake quantizationなどで学習中から量子化誤差へ適応させます。",
    ["term-5-1-quantization", "term-5-1-ptq", "term-5-1-qat", "compare-5-1-ptq-qat"]
  ),
  syllabusQuestion(
    "devops-q006", "開発・運用環境", "量子化とモデル容量", "標準", "5-1-1",
    "1億パラメータの重みを8bitで保持するとき、重み部分だけの概算容量として最も近いものはどれですか？",
    ["約12.5MB", "約50MB", "約100MB", "約800MB"], 2,
    "Memory≈N×b/8より、1億×8/8=1億byte、約100MBです。実際にはscale、zero-point、活性値、メタデータなども必要です。",
    ["term-5-1-quantization", "formula-5-1-memory-bits", "compare-5-1-pruning-quantization"]
  ),
  syllabusQuestion(
    "devops-q007", "開発・運用環境", "データ並列とモデル並列", "基礎", "5-2-1",
    "1台のGPUメモリにモデル全体が収まらない場合、直接的な候補となる並列方式はどれですか？",
    ["モデル並列化", "データ並列化だけ", "Early Stopping", "Cross-Device連合学習"], 0,
    "モデル並列は層やテンソルを複数デバイスへ分割し、1台へ収まらないモデルを扱います。データ並列では通常、各デバイスにモデル全体を複製します。",
    ["term-5-2-distributed", "term-5-2-data-parallel", "term-5-2-model-parallel", "compare-5-2-data-model-parallel"]
  ),
  syllabusQuestion(
    "devops-q008", "開発・運用環境", "同期学習", "標準", "5-2-1",
    "同期学習でStragglerが問題になる理由はどれですか？",
    ["最も速いワーカーだけが更新するから", "遅いワーカーの完了を全体が待つから", "勾配を一切集約しないから", "モデルを必ずCPUへ移すから"], 1,
    "同期学習は同じステップの全ワーカーを待って勾配を集約するため、遅いワーカーが全体の進行を止めます。",
    ["term-5-2-sync", "compare-5-2-sync-async"]
  ),
  syllabusQuestion(
    "devops-q009", "開発・運用環境", "非同期学習", "標準", "5-2-1",
    "非同期学習で収束を不安定にする可能性があるものはどれですか？",
    ["古い重みに基づいて計算されたStale Gradient", "すべてのワーカーが同じ時刻に更新すること", "Soft Targetの温度", "Container Imageのレイヤー"], 0,
    "非同期学習では他ワーカーを待たず更新できる一方、古いパラメータを基に計算した勾配が後から反映されることがあります。",
    ["term-5-2-async", "compare-5-2-sync-async"]
  ),
  syllabusQuestion(
    "devops-q010", "開発・運用環境", "All-ReduceとParameter Server", "標準", "5-2-1",
    "All-ReduceとParameter Serverの対応として適切なものはどれですか？",
    ["All-Reduceは中央サーバーだけが全パラメータを保持し、Parameter Serverは必ずリング通信を使う", "どちらもコンテナ仮想化の方式である", "All-Reduceはワーカー間で集約結果を共有し、Parameter Serverは中央または分散サーバーがパラメータを管理する", "どちらもモデルの低ビット化を行う"], 2,
    "All-Reduceは集団通信で勾配などを集約・共有します。Parameter Serverはパラメータ管理役を置く構成です。",
    ["term-5-2-collective"]
  ),
  syllabusQuestion(
    "devops-q011", "開発・運用環境", "連合学習", "基礎", "5-2-2",
    "連合学習の基本構成として適切なものはどれですか？",
    ["各参加者の生データを中央へ集めてから学習する", "各参加者がローカルデータで更新し、その更新を集約してグローバルモデルを作る", "モデルを一切共有しない", "すべての参加者が同一データを持つことを前提にする"], 1,
    "連合学習では生データを各端末・組織に残し、ローカル更新を中央などで集約します。ただし更新情報の漏えい対策は別途必要です。",
    ["term-5-2-federated", "term-5-2-local-global"]
  ),
  syllabusQuestion(
    "devops-q012", "開発・運用環境", "Cross-DeviceとCross-Silo", "基礎", "5-2-2",
    "多数のスマートフォンが不定期に参加し、通信切断も多い連合学習はどれですか？",
    ["Cross-Silo", "Model Parallelism", "Cross-Device", "Bare-Metal Virtualization"], 2,
    "多数で不安定な個人端末を対象にするのがCross-Deviceです。少数の企業・病院・拠点間はCross-Siloです。",
    ["term-5-2-cross-device", "term-5-2-cross-silo", "compare-5-2-cross-device-silo"]
  ),
  syllabusQuestion(
    "devops-q013", "開発・運用環境", "Federated Averaging", "標準", "5-2-2",
    "クライアントAが100件で重み2、Bが300件で重み6を持つとき、FedAvgによる単一パラメータの集約値はどれですか？",
    ["3", "4", "5", "8"], 2,
    "データ件数比は0.25と0.75なので、0.25×2+0.75×6=5です。単純平均の4ではありません。",
    ["term-5-2-fedavg", "formula-5-2-fedavg"]
  ),
  syllabusQuestion(
    "devops-q014", "開発・運用環境", "Non-IIDデータ", "標準", "5-2-2",
    "連合学習におけるNon-IIDデータの説明として適切なものはどれですか？",
    ["全クライアントのデータ分布が完全に同じ状態", "データが暗号化されていない状態", "モデルが量子化されている状態", "クライアントごとにクラス構成や入力分布が異なる状態"], 3,
    "端末や組織ごとにデータ分布が偏ると、ローカル更新の方向がばらつき、client driftや収束悪化につながります。",
    ["term-5-2-noniid", "term-5-2-local-global"]
  ),
  syllabusQuestion(
    "devops-q015", "開発・運用環境", "SIMD", "基礎", "5-3-1",
    "SIMDの説明として適切なものはどれですか？",
    ["1つの命令で複数のデータ要素へ同じ演算を適用する", "複数の命令列が複数データを独立処理する", "多数スレッドが異なるOSを起動する", "モデルの層を複数GPUへ分割する"], 0,
    "SIMDはSingle Instruction Multiple Dataで、CPUのベクトル命令など、1命令を複数データへ適用します。",
    ["term-5-3-simd", "compare-5-3-simd-simt"]
  ),
  syllabusQuestion(
    "devops-q016", "開発・運用環境", "SIMT", "標準", "5-3-1",
    "GPUのSIMTで、同じWarp内のスレッドが異なる分岐へ進むと起こりやすいものはどれですか？",
    ["量子化誤差の消失", "分岐Divergenceによる並列効率低下", "モデル容量の自動削減", "FedAvgの重み変更"], 1,
    "同じグループ内で分岐がばらつくと、分岐経路を順に実行する必要が生じ、SIMTの効率が低下します。",
    ["term-5-3-simt", "compare-5-3-simd-simt", "compare-5-3-simt-mimd"]
  ),
  syllabusQuestion(
    "devops-q017", "開発・運用環境", "MIMD", "基礎", "5-3-1",
    "MIMDの説明として適切なものはどれですか？",
    ["1命令で複数データだけを処理する", "必ず同じ命令を全処理装置へ発行する", "複数の処理装置が異なる命令列を異なるデータへ実行する", "コンテナがホストカーネルを共有する"], 2,
    "MIMDはMultiple Instruction Multiple Dataで、複数の処理装置が独立した命令列を実行できます。",
    ["term-5-3-mimd", "compare-5-3-simt-mimd"]
  ),
  syllabusQuestion(
    "devops-q018", "開発・運用環境", "GPUとTPU", "標準", "5-3-1",
    "GPUとTPUの比較として適切なものはどれですか？",
    ["GPUは汎用的な大規模並列演算、TPUはテンソル・行列演算へ特化した設計", "GPUはCPU命令しか実行できず、TPUは必ず画像だけを処理する", "TPUはどのモデルでも常にGPUより高速", "両者は仮想化方式の名称"], 0,
    "GPUは幅広い並列計算に使われ、TPUは機械学習のテンソル演算へ特化しています。実性能は対応演算やモデル形状に依存します。",
    ["term-5-3-gpu", "term-5-3-tpu", "compare-5-3-gpu-tpu"]
  ),
  syllabusQuestion(
    "devops-q019", "開発・運用環境", "ホスト型とハイパーバイザー型", "基礎", "5-4-1",
    "通常のホストOS上で仮想化ソフトウェアを動かす方式はどれですか？",
    ["Bare-Metal Hypervisor", "Hosted Virtualization", "Container Image", "Federated Learning"], 1,
    "ホスト型は一般OSの上で仮想化ソフトを動かします。ハイパーバイザー型はハードウェアへ直接配置するType 1です。",
    ["term-5-4-virtualization", "term-5-4-hosted", "term-5-4-hypervisor", "compare-5-4-hosted-hypervisor"]
  ),
  syllabusQuestion(
    "devops-q020", "開発・運用環境", "仮想マシンとコンテナ", "標準", "5-4-1",
    "仮想マシンとコンテナの違いとして適切なものはどれですか？",
    ["仮想マシンはホストカーネルを必ず共有し、コンテナはゲストOSを含む", "両者とも必ずゲストOSを含む", "仮想マシンはゲストOSを含み、コンテナは通常ホストカーネルを共有する", "コンテナは仮想化とは無関係"], 2,
    "VMはゲストOSごと仮想化するため比較的重く、コンテナはホストカーネルを共有して軽量・高速起動しやすいです。",
    ["term-5-4-virtualization", "term-5-4-container", "compare-5-4-vm-container"]
  ),
  syllabusQuestion(
    "devops-q021", "開発・運用環境", "Dockerfile", "基礎", "5-4-1",
    "Dockerfileの役割として適切なものはどれですか？",
    ["実行中コンテナのメモリ内容を表示するだけのファイル", "ベースイメージ、依存関係、ファイル配置、実行設定を記述してイメージを再現可能に構築する", "連合学習の更新を集約する", "GPUのWarpを制御する"], 1,
    "DockerfileはFROM、COPY、RUN、CMD、ENTRYPOINTなどを記述するイメージ構築レシピです。コンテナそのものではありません。",
    ["term-5-4-docker", "term-5-4-dockerfile"]
  ),
  syllabusQuestion(
    "devops-q022", "開発・運用環境", "Container ImageとContainer", "基礎", "5-4-1",
    "Container ImageとContainerの関係として正しいものはどれですか？",
    ["Imageは実行テンプレートで、Containerはそこから生成された実行インスタンス", "Containerが設計図で、Imageが実行中のプロセス", "1つのImageからは1つのContainerしか作れない", "両者は同じ意味で区別しない"], 0,
    "Imageは読み取り中心の配布・実行テンプレートで、ContainerはImageから生成される実体です。同じImageから複数Containerを起動できます。",
    ["term-5-4-image-container", "compare-5-4-image-container"]
  )
];
