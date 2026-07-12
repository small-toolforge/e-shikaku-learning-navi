"use strict";

const DEVELOPMENT_OPERATIONS_CARDS_VERSION = "v0.4.0-dev.9";

function developmentOperationsTerm(id, group, syllabusId, en, kana, ja, desc, examCue, confusion) {
  return {
    id, type: "term", major: "5. 開発・運用環境", group, syllabusId,
    en, kana, ja, desc, examCue, confusion: confusion || "",
    atlasId: "", questionIds: [], scope: "syllabus"
  };
}

function developmentOperationsFormula(id, group, syllabusId, name, fx, yomi, imi, oboe, rei, variables, mistake) {
  return {
    id, type: "formula", major: "5. 開発・運用環境", group, syllabusId,
    name, fx, yomi, imi, oboe, rei, variables, mistake,
    atlasId: "", questionIds: [], scope: "syllabus"
  };
}

function developmentOperationsCompare(id, group, syllabusId, left, right, key) {
  return {
    id, type: "compare", major: "5. 開発・運用環境", group, syllabusId,
    l: left, r: right, key, atlasId: "", questionIds: [], scope: "syllabus"
  };
}

const DEVELOPMENT_OPERATIONS_TERM_CARDS = [
  developmentOperationsTerm("term-5-1-edge", "エッジコンピューティング・モデル軽量化", "5-1-1", "Edge Computing", "エッジ・コンピューティング", "エッジコンピューティング", "クラウドへ送らず、端末や装置の近くで推論・処理する構成です。通信遅延、帯域、プライバシー、オフライン性の改善に使われます。", "端末側・現場側・低遅延・通信量削減が手掛かりです。", "学習まで必ず端末上で行うとは限らず、学習はクラウド、推論はエッジという構成もあります。"),
  developmentOperationsTerm("term-5-1-pruning", "エッジコンピューティング・モデル軽量化", "5-1-1", "Pruning", "プルーニング", "プルーニング・枝刈り", "重要度の低い重み、チャネル、ノードなどを削減し、モデルを疎または小規模にする軽量化手法です。", "不要な重みやチャネルを削る説明があればプルーニングです。", "ゼロ重みが増えても、実装やハードウェアが疎性を活用できなければ高速化しない場合があります。"),
  developmentOperationsTerm("term-5-1-structured-pruning", "エッジコンピューティング・モデル軽量化", "5-1-1", "Structured Pruning", "ストラクチャード・プルーニング", "構造化プルーニング", "チャネル、フィルタ、ヘッド、層などのまとまり単位で削除し、密な小型モデルとして実行しやすくします。", "チャネル単位・フィルタ単位・層単位の削除が手掛かりです。", "重み単位の非構造化プルーニングより、一般的なハードウェアで高速化へつなげやすいです。"),
  developmentOperationsTerm("term-5-1-unstructured-pruning", "エッジコンピューティング・モデル軽量化", "5-1-1", "Unstructured Pruning", "アンストラクチャード・プルーニング", "非構造化プルーニング", "個々の重みを独立に0へし、疎な重み行列を作ります。", "重み単位・高い疎性・sparse matrixが手掛かりです。", "パラメータ数が減っても、疎行列演算への対応がなければ実測速度が上がらないことがあります。"),
  developmentOperationsTerm("term-5-1-distillation", "エッジコンピューティング・モデル軽量化", "5-1-1", "Knowledge Distillation", "ナレッジ・ディスティレーション", "知識蒸留", "大きな教師モデルの出力分布や中間表現を使い、小さな生徒モデルへ知識を移す手法です。", "TeacherからStudentへ、soft targetや温度付き確率を使う説明が手掛かりです。", "教師モデルそのものを削るプルーニングや、数値精度を下げる量子化とは方法が異なります。"),
  developmentOperationsTerm("term-5-1-teacher-student", "エッジコンピューティング・モデル軽量化", "5-1-1", "Teacher Model, Student Model and Soft Targets", "ティーチャー・モデル・スチューデント・モデル・アンド・ソフト・ターゲッツ", "教師モデル・生徒モデル・ソフトターゲット", "教師は通常大規模で高性能、生徒は軽量な学習対象です。教師のクラス間関係を含む確率分布をソフトターゲットとして学びます。", "大きいTeacherから小さいStudentへ確率分布を渡す説明が手掛かりです。", "one-hotのhard labelだけでは、誤クラス間の類似度情報を表しにくいです。"),
  developmentOperationsTerm("term-5-1-quantization", "エッジコンピューティング・モデル軽量化", "5-1-1", "Quantization", "クオンタイゼーション", "量子化", "重みや活性値をFP32からINT8など少ないビット数で表現し、メモリ使用量や演算量を減らします。", "32bitから8bit、低ビット、scaleとzero-pointが手掛かりです。", "モデル容量が小さくなっても、対象デバイスが低ビット演算を高速化できるか確認が必要です。"),
  developmentOperationsTerm("term-5-1-ptq", "エッジコンピューティング・モデル軽量化", "5-1-1", "Post-Training Quantization", "ポストトレーニング・クオンタイゼーション", "学習後量子化・PTQ", "学習済みモデルへ後処理として量子化を適用します。再学習コストが小さい一方、精度低下が大きい場合があります。", "学習後・校正データ・再学習なしまたは少量が手掛かりです。", "校正用データが入力分布を代表しないと、活性値範囲の推定がずれることがあります。"),
  developmentOperationsTerm("term-5-1-qat", "エッジコンピューティング・モデル軽量化", "5-1-1", "Quantization-Aware Training", "クオンタイゼーション・アウェア・トレーニング", "量子化認識学習・QAT", "学習中に量子化誤差を模擬し、低ビット化後の精度を保つよう重みを最適化します。", "fake quantization、学習中に量子化誤差を考慮する説明が手掛かりです。", "PTQより手間は増えますが、厳しい低ビット条件で精度を保ちやすいです。"),

  developmentOperationsTerm("term-5-2-distributed", "並列分散処理", "5-2-1", "Distributed Deep Learning", "ディストリビューテッド・ディープ・ラーニング", "分散深層学習", "複数のGPU、端末、計算ノードへ学習処理を分担し、学習時間短縮や大規模モデル対応を図ります。", "複数ノード・複数GPU・通信・勾配集約が手掛かりです。", "計算量だけでなく通信量、同期待ち、障害、再現性も性能へ影響します。"),
  developmentOperationsTerm("term-5-2-data-parallel", "並列分散処理", "5-2-1", "Data Parallelism", "データ・パラレリズム", "データ並列化", "同じモデルを複数デバイスへ複製し、異なるミニバッチを処理した後で勾配を集約します。", "モデル複製・データ分割・勾配集約が手掛かりです。", "モデル全体が各デバイスのメモリへ収まる必要があります。"),
  developmentOperationsTerm("term-5-2-model-parallel", "並列分散処理", "5-2-1", "Model Parallelism", "モデル・パラレリズム", "モデル並列化", "モデルの層やテンソルを複数デバイスへ分割し、1つの巨大モデルを協調して実行します。", "モデル自体を分割・1台に収まらないモデルが手掛かりです。", "デバイス間で中間活性値を送るため、分割位置と通信量が重要です。"),
  developmentOperationsTerm("term-5-2-sync", "並列分散処理", "5-2-1", "Synchronous Training", "シンクロナス・トレーニング", "同期学習", "各ワーカーの計算完了を待ち、同じステップの勾配を集約してから全ワーカーを更新します。", "全ワーカー待ち・同一ステップ・stragglerが手掛かりです。", "遅いワーカーが全体を待たせる一方、重みの世代を揃えやすいです。"),
  developmentOperationsTerm("term-5-2-async", "並列分散処理", "5-2-1", "Asynchronous Training", "エイシンクロナス・トレーニング", "非同期学習", "各ワーカーが他の完了を待たず、計算した勾配を順次反映します。", "待ち時間削減・古い勾配・stale gradientが手掛かりです。", "処理効率は上げやすい一方、古い重みに基づく勾配が収束を不安定にする場合があります。"),
  developmentOperationsTerm("term-5-2-collective", "並列分散処理", "5-2-1", "All-Reduce and Parameter Server", "オールリデュース・アンド・パラメーター・サーバー", "All-ReduceとParameter Server", "All-Reduceはワーカー間で集約結果を共有し、Parameter Serverは中央または分散サーバーがパラメータを管理します。", "リング型集団通信ならAll-Reduce、中央管理型ならParameter Serverが手掛かりです。", "Parameter Serverは集中箇所がボトルネックになり、All-Reduceは通信トポロジの影響を受けます。"),

  developmentOperationsTerm("term-5-2-federated", "連合学習", "5-2-2", "Federated Learning", "フェデレーテッド・ラーニング", "連合学習", "生データを各端末や組織に残したままローカル学習し、モデル更新を集約してグローバルモデルを作ります。", "データを中央へ集めない・ローカル更新・中央集約が手掛かりです。", "生データを送らなくても、更新情報からの漏えいや悪意ある更新への対策は別途必要です。"),
  developmentOperationsTerm("term-5-2-cross-device", "連合学習", "5-2-2", "Cross-Device Federated Learning", "クロスデバイス・フェデレーテッド・ラーニング", "クロスデバイス学習", "スマートフォンやIoTなど多数で不安定な端末を対象とし、一部参加、通信制約、端末離脱を前提にします。", "多数端末・一部参加・通信不安定・端末離脱が手掛かりです。", "少数の安定した企業・病院間連携であるクロスサイロと区別します。"),
  developmentOperationsTerm("term-5-2-cross-silo", "連合学習", "5-2-2", "Cross-Silo Federated Learning", "クロスサイロ・フェデレーテッド・ラーニング", "クロスサイロ学習", "企業、病院、拠点など少数で比較的安定した組織間における連合学習です。", "少数組織・安定接続・継続参加が手掛かりです。", "多数の個人端末を対象とするクロスデバイスより、参加者の信頼関係や契約が設計上重要になります。"),
  developmentOperationsTerm("term-5-2-fedavg", "連合学習", "5-2-2", "Federated Averaging", "フェデレーテッド・アベレージング", "Federated Averaging・FedAvg", "各クライアントのローカル学習結果を、通常はデータ件数に応じて重み付き平均し、グローバルモデルを更新します。", "Local Modelの重み付き平均、データ件数n_kが手掛かりです。", "単純平均では端末ごとのデータ件数差を反映できません。非IIDデータでは収束が難しくなる場合があります。"),
  developmentOperationsTerm("term-5-2-local-global", "連合学習", "5-2-2", "Local Model and Global Model", "ローカル・モデル・アンド・グローバル・モデル", "ローカルモデルとグローバルモデル", "ローカルモデルは各参加者のデータで更新されたモデル、グローバルモデルはそれらを集約した共有モデルです。", "端末内更新がLocal、中央集約後に配布される共有版がGlobalです。", "ローカルモデルをそのまま全体モデルとみなさず、集約ラウンドを区別します。"),
  developmentOperationsTerm("term-5-2-noniid", "連合学習", "5-2-2", "Non-IID Data", "ノン・アイアイディー・データ", "非独立同分布データ・Non-IID", "参加者ごとにクラス構成や入力分布が異なる状態で、連合学習の更新方向がばらつく主因になります。", "端末ごとの偏ったデータ・client driftが手掛かりです。", "中央集約しないだけで各端末のデータ分布が同じになるわけではありません。"),

  developmentOperationsTerm("term-5-3-simd", "アクセラレータ", "5-3-1", "SIMD: Single Instruction Multiple Data", "シムド／シングル・インストラクション・マルチプル・データ", "単一命令列複数データ", "1つの命令で複数のデータ要素へ同じ演算を適用する並列方式です。CPUのベクトル命令などが代表です。", "1命令で複数データ要素を同時処理する説明が手掛かりです。", "複数スレッドへ同じ命令を発行するSIMTとは抽象化の見え方が異なります。"),
  developmentOperationsTerm("term-5-3-simt", "アクセラレータ", "5-3-1", "SIMT: Single Instruction Multiple Thread", "シムト／シングル・インストラクション・マルチプル・スレッド", "単一命令複数スレッド", "多数のスレッドへ同じ命令を発行し、各スレッドが異なるデータを処理するGPUで代表的な実行方式です。", "GPU・多数スレッド・warpやwavefrontが手掛かりです。", "分岐がスレッド間で異なるとdivergenceが起こり、並列効率が下がります。"),
  developmentOperationsTerm("term-5-3-mimd", "アクセラレータ", "5-3-1", "MIMD: Multiple Instruction Multiple Data", "ミムド／マルチプル・インストラクション・マルチプル・データ", "複数命令列複数データ", "複数の処理装置が異なる命令列を、それぞれ異なるデータへ独立して実行する方式です。", "複数命令・複数データ・独立処理が手掛かりです。", "同じ命令を一斉に実行するSIMDやSIMTより柔軟ですが、制御や同期が複雑です。"),
  developmentOperationsTerm("term-5-3-gpu", "アクセラレータ", "5-3-1", "GPU: Graphics Processing Unit", "ジーピーユー／グラフィックス・プロセッシング・ユニット", "GPU", "多数の演算器と高いメモリ帯域を持ち、行列積や畳み込みなど並列性の高い深層学習処理を高速化します。", "多数コア・SIMT・高メモリ帯域が手掛かりです。", "すべての処理がCPUより速いわけではなく、小規模処理や分岐の多い処理では転送・起動コストが支配的になります。"),
  developmentOperationsTerm("term-5-3-tpu", "アクセラレータ", "5-3-1", "TPU: Tensor Processing Unit", "ティーピーユー／テンソル・プロセッシング・ユニット", "TPU", "テンソル・行列演算を高効率に実行するために設計された機械学習向けアクセラレータです。", "行列演算特化・systolic array・機械学習専用が手掛かりです。", "GPUより常に高速という意味ではなく、対応演算、精度、モデル形状、ソフトウェア環境に依存します。"),

  developmentOperationsTerm("term-5-4-virtualization", "環境構築", "5-4-1", "Virtualization Environment", "ヴァーチャライゼーション・エンバイロメント", "仮想化環境", "物理資源を抽象化し、複数の隔離された実行環境を同一ハードウェア上で動かす仕組みです。", "仮想マシン、ハイパーバイザー、コンテナなどを包含する上位概念です。", "仮想化はコンテナだけを指す用語ではありません。"),
  developmentOperationsTerm("term-5-4-hosted", "環境構築", "5-4-1", "Hosted Virtualization", "ホステッド・ヴァーチャライゼーション", "ホスト型仮想化", "通常のホストOS上で仮想化ソフトウェアを動かし、その上にゲストOSを実行します。", "ホストOSの上・デスクトップ向け・導入容易が手掛かりです。", "ハードウェアへ直接載るハイパーバイザー型より階層が1つ多く、オーバーヘッドが増える場合があります。"),
  developmentOperationsTerm("term-5-4-hypervisor", "環境構築", "5-4-1", "Bare-Metal Hypervisor", "ベアメタル・ハイパーバイザー", "ハイパーバイザー型仮想化", "ハードウェア上へ直接ハイパーバイザーを配置し、その上で複数のゲストOSを実行します。", "ホストOSを介さない・Type 1・サーバー基盤が手掛かりです。", "ホスト型のように一般OS上のアプリとして動く方式ではありません。"),
  developmentOperationsTerm("term-5-4-container", "環境構築", "5-4-1", "Container Virtualization", "コンテナ・ヴァーチャライゼーション", "コンテナ型仮想化", "ホストOSのカーネルを共有しながら、プロセス・ファイルシステム・ネットワークなどを隔離します。", "ゲストOS不要・軽量・高速起動が手掛かりです。", "VMより軽量ですが、ホストカーネル共有による制約とセキュリティ境界を理解する必要があります。"),
  developmentOperationsTerm("term-5-4-docker", "環境構築", "5-4-1", "Docker", "ドッカー", "Docker", "コンテナイメージの作成、配布、実行を行う代表的なコンテナ基盤です。", "image、container、build、runが手掛かりです。", "Dockerそのものが仮想マシンを作るハイパーバイザーというわけではありません。"),
  developmentOperationsTerm("term-5-4-dockerfile", "環境構築", "5-4-1", "Dockerfile", "ドッカーファイル", "Dockerfile", "ベースイメージ、ファイル配置、依存関係、実行コマンドなどを宣言的に記述し、イメージを再現可能に構築するファイルです。", "FROM、COPY、RUN、CMD、ENTRYPOINTが手掛かりです。", "Dockerfileは実行中のコンテナそのものではなく、イメージを構築するレシピです。"),
  developmentOperationsTerm("term-5-4-image-container", "環境構築", "5-4-1", "Container Image and Container", "コンテナ・イメージ・アンド・コンテナ", "コンテナイメージとコンテナ", "イメージは読み取り中心の実行テンプレートで、コンテナはそのイメージから生成された実行インスタンスです。", "設計図・テンプレートがImage、実行中または停止中の実体がContainerです。", "同じイメージから複数コンテナを生成できます。")
];

const DEVELOPMENT_OPERATIONS_FORMULA_CARDS = [
  developmentOperationsFormula("formula-5-1-memory-bits", "エッジコンピューティング・モデル軽量化", "5-1-1", "モデル重み容量の概算", "Memory≈N×b/8", "メモリは、パラメータ数エヌ掛けるビット数ビーを八で割る", "パラメータ数と1要素のビット数から重み部分の容量を概算します。", "要素数×1要素のビット数÷8", "1億パラメータを8bitで持つと重みは約100MB", "Nはパラメータ数、bは1パラメータのビット数", "実際にはスケール、zero-point、メタデータ、実行時活性値なども必要です。"),
  developmentOperationsFormula("formula-5-1-affine-quant", "エッジコンピューティング・モデル軽量化", "5-1-1", "アフィン量子化", "q=clip(round(x/s)+z)", "キューは、エックスをスケールエスで割って丸め、ゼロポイントゼットを足して範囲内へ収める", "実数xを整数qへ写す代表的な量子化式です。復元は概ねx≈s(q−z)です。", "割って、丸めて、zero-pointを足す", "s=0.1、z=128、x=0.5ならq=133", "sはscale、zはzero-point、clipは整数範囲への制限", "scaleが0にならないこと、丸めと飽和の扱いを確認します。"),
  developmentOperationsFormula("formula-5-2-fedavg", "連合学習", "5-2-2", "Federated Averaging", "w_(t+1)=Σₖ(nₖ/N)wₖ", "次のグローバル重みは、各クライアントのデータ件数比掛けるローカル重みの総和", "各クライアントのローカルモデルを、保有データ件数に応じて重み付き平均します。", "データが多い参加者ほど重みを大きくする", "100件と300件なら重みは0.25対0.75", "nₖはクライアントkの件数、Nは総件数、wₖはローカル重み", "単純平均と混同せず、参加クライアントだけでNを定義するラウンドもあります。")
];

const DEVELOPMENT_OPERATIONS_COMPARE_CARDS = [
  developmentOperationsCompare("compare-5-1-pruning-distillation", "エッジコンピューティング・モデル軽量化", "5-1-1", {t:"Pruning",k:"プルーニング",j:"既存モデルの不要部分を削る",d:"重み・チャネル・層を削減"}, {t:"Distillation",k:"ディスティレーション",j:"教師から小さい生徒へ学習",d:"soft target・Teacher/Student"}, "削除して軽くするならPruning、別の小型モデルへ知識を移すならDistillationです。"),
  developmentOperationsCompare("compare-5-1-pruning-quantization", "エッジコンピューティング・モデル軽量化", "5-1-1", {t:"Pruning",k:"プルーニング",j:"要素や構造を削る",d:"疎性・チャネル削除"}, {t:"Quantization",k:"クオンタイゼーション",j:"数値表現を低ビット化",d:"FP32→INT8など"}, "数を減らすのがPruning、1要素あたりのビット数を減らすのがQuantizationです。"),
  developmentOperationsCompare("compare-5-1-structured-unstructured", "エッジコンピューティング・モデル軽量化", "5-1-1", {t:"Structured Pruning",k:"ストラクチャード・プルーニング",j:"チャネル・層単位",d:"一般ハードウェアで高速化しやすい"}, {t:"Unstructured Pruning",k:"アンストラクチャード・プルーニング",j:"個別重み単位",d:"高い疎性だが疎演算が必要"}, "まとまりを削るならStructured、個々の重みを0にするならUnstructuredです。"),
  developmentOperationsCompare("compare-5-1-ptq-qat", "エッジコンピューティング・モデル軽量化", "5-1-1", {t:"PTQ",k:"ピー・ティー・キュー",j:"学習後に量子化",d:"低コスト・精度低下の可能性"}, {t:"QAT",k:"キュー・エー・ティー",j:"学習中に量子化誤差を模擬",d:"手間は増えるが精度を保ちやすい"}, "後処理ならPTQ、学習過程で低ビット誤差へ適応させるならQATです。"),
  developmentOperationsCompare("compare-5-2-data-model-parallel", "並列分散処理", "5-2-1", {t:"Data Parallelism",k:"データ・パラレリズム",j:"同じモデルを複製",d:"データを分割し勾配集約"}, {t:"Model Parallelism",k:"モデル・パラレリズム",j:"モデル自体を分割",d:"1台に収まらない巨大モデル"}, "モデルを各台へ複製するならData、モデルの層やテンソルを分けるならModel Parallelismです。"),
  developmentOperationsCompare("compare-5-2-sync-async", "並列分散処理", "5-2-1", {t:"Synchronous",k:"シンクロナス",j:"全ワーカーを待つ",d:"重み世代を揃えやすい"}, {t:"Asynchronous",k:"エイシンクロナス",j:"完了した更新を順次反映",d:"待ち時間減・stale gradient"}, "全員待ちなら同期、待たずに順次更新なら非同期です。"),
  developmentOperationsCompare("compare-5-2-cross-device-silo", "連合学習", "5-2-2", {t:"Cross-Device",k:"クロスデバイス",j:"多数の個人端末",d:"一部参加・通信不安定"}, {t:"Cross-Silo",k:"クロスサイロ",j:"少数の組織・拠点",d:"安定接続・継続参加"}, "多数で不安定な端末ならCross-Device、少数の組織間ならCross-Siloです。"),
  developmentOperationsCompare("compare-5-3-simd-simt", "アクセラレータ", "5-3-1", {t:"SIMD",k:"シムド",j:"1命令で複数データ",d:"ベクトル命令"}, {t:"SIMT",k:"シムト",j:"1命令を複数スレッドへ",d:"GPU・warp / wavefront"}, "複数データ要素を1命令で扱う抽象ならSIMD、多数スレッドとして見せるGPU方式ならSIMTです。"),
  developmentOperationsCompare("compare-5-3-simt-mimd", "アクセラレータ", "5-3-1", {t:"SIMT",k:"シムト",j:"同じ命令を多数スレッドへ",d:"分岐divergenceに注意"}, {t:"MIMD",k:"ミムド",j:"複数命令・複数データ",d:"独立した処理を並行"}, "同一命令を一斉発行するならSIMT、各処理装置が異なる命令を実行するならMIMDです。"),
  developmentOperationsCompare("compare-5-3-gpu-tpu", "アクセラレータ", "5-3-1", {t:"GPU",k:"ジーピーユー",j:"汎用的な大規模並列演算",d:"SIMT・幅広い演算"}, {t:"TPU",k:"ティーピーユー",j:"テンソル・行列演算特化",d:"機械学習向け専用設計"}, "幅広い並列計算ならGPU、テンソル演算へ特化した専用アクセラレータならTPUです。"),
  developmentOperationsCompare("compare-5-4-hosted-hypervisor", "環境構築", "5-4-1", {t:"Hosted",k:"ホステッド",j:"ホストOS上の仮想化ソフト",d:"導入しやすい"}, {t:"Bare-Metal Hypervisor",k:"ベアメタル・ハイパーバイザー",j:"ハードウェア上へ直接",d:"Type 1・基盤向け"}, "一般OSの上で動くならホスト型、ハードウェアへ直接載るならハイパーバイザー型です。"),
  developmentOperationsCompare("compare-5-4-vm-container", "環境構築", "5-4-1", {t:"Virtual Machine",k:"ヴァーチャル・マシン",j:"ゲストOSを含む",d:"強い分離・比較的重い"}, {t:"Container",k:"コンテナ",j:"ホストカーネルを共有",d:"軽量・高速起動"}, "ゲストOSごと仮想化するならVM、カーネル共有でプロセスを隔離するならContainerです。"),
  developmentOperationsCompare("compare-5-4-image-container", "環境構築", "5-4-1", {t:"Container Image",k:"コンテナ・イメージ",j:"実行テンプレート",d:"読み取り中心・配布単位"}, {t:"Container",k:"コンテナ",j:"イメージから作る実行実体",d:"同じImageから複数生成"}, "設計図・テンプレートならImage、そこから起動したインスタンスならContainerです。")
];

TERMS.push(...DEVELOPMENT_OPERATIONS_TERM_CARDS);
FORMULAS.push(...DEVELOPMENT_OPERATIONS_FORMULA_CARDS);
COMPARES.push(...DEVELOPMENT_OPERATIONS_COMPARE_CARDS);
