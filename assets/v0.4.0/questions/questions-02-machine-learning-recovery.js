"use strict";

const MACHINE_LEARNING_RECOVERY_VERSION = "v0.4.0-dev.27";

function machineLearningRecoveryQuestion(
  id,
  topic,
  syllabusId,
  question,
  choices,
  answer,
  explanation,
  options = {}
) {
  return Object.assign(
    syllabusQuestion(
      id,
      "機械学習",
      topic,
      "標準",
      syllabusId,
      question,
      choices,
      answer,
      explanation,
      []
    ),
    {
      examPriority: 2,
      questionPolarity: options.questionPolarity || "normal"
    }
  );
}

const MACHINE_LEARNING_RECOVERY_QUESTIONS = [
  machineLearningRecoveryQuestion(
    "ml-q037",
    "False Positive / False Negative",
    "2-1-12",
    "迷惑メールを陽性、正常メールを陰性とします。正常メールを誤って『迷惑メール』と判定した結果はどれですか？",
    [
      "True Positive（真陽性）",
      "False Negative（偽陰性）",
      "False Positive（偽陽性）",
      "True Negative（真陰性）"
    ],
    2,
    "実際は陰性（正常メール）なのに、予測が陽性（迷惑メール）なのでFalse Positive（フォールス・ポジティブ／偽陽性）です。『実際はN、予測はP』と読むと取り違えにくくなります。"
  ),
  machineLearningRecoveryQuestion(
    "ml-q038",
    "False Positive / False Negative",
    "2-1-12",
    "病気を陽性とする検査で、実際には病気の人を『陰性』と判定して見逃しました。この結果はどれですか？",
    [
      "False Positive（偽陽性）",
      "False Negative（偽陰性）",
      "True Positive（真陽性）",
      "True Negative（真陰性）"
    ],
    1,
    "実際は陽性なのに予測が陰性なのでFalse Negative（フォールス・ネガティブ／偽陰性）です。FNは『本当はPositiveなのにNegativeとした見逃し』です。Recall（リコール／再現率）を高めるとFNを減らす方向になります。"
  ),
  machineLearningRecoveryQuestion(
    "ml-q039",
    "Holdout / Validation / Test",
    "2-1-11",
    "訓練・検証・テストの3分割で、ハイパーパラメータの選択と最終性能評価の役割分担として最も適切なものはどれですか？",
    [
      "ハイパーパラメータはテストデータで選び、最終評価も同じテストデータで行う",
      "ハイパーパラメータは訓練データだけで選び、検証データは使わない",
      "検証データは最終評価専用で、テストデータを調整に使う",
      "Validationで調整し、Testは原則として最後の性能評価に使う"
    ],
    3,
    "Validation（バリデーション／検証用データ）はモデル選択やハイパーパラメータ調整に使い、Test（テスト／最終評価用データ）は原則として最後の性能確認まで温存します。Holdout（ホールドアウト／一回分割）はデータを訓練用と評価用などへ一度分割する方法です。"
  ),
  machineLearningRecoveryQuestion(
    "ml-q040",
    "Holdout / Validation / Test",
    "2-1-11",
    "モデル開発時のデータの使い方として、最も不適切なものはどれですか？",
    [
      "テストデータの結果を何度も見ながらハイパーパラメータを調整する",
      "訓練データでモデルのパラメータを学習する",
      "検証データでモデルやハイパーパラメータを比較する",
      "最終的に選んだモデルを、調整に使っていないテストデータで評価する"
    ],
    0,
    "テストデータを繰り返し見て調整すると、テストデータへ間接的に過学習し、最終評価が楽観的になります。調整はValidation（バリデーション／検証）で行い、Test（テスト／最終評価）は最後まで温存するのが基本です。",
    { questionPolarity: "incorrect_choice" }
  )
];
