#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0-dev.28 の追加静的検査。"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PASS_RECOVERY = ROOT / "assets/v0.4.0/questions/questions-06-pass-recovery.js"
ML_RECOVERY = ROOT / "assets/v0.4.0/questions/questions-02-machine-learning-recovery.js"
INIT = ROOT / "assets/v0.3.1/app-init.js"
REVIEW = ROOT / "assets/v0.4.0/pre-exam-review.js"
RELEASE = ROOT / "assets/v0.4.0/release-version.js"
SW = ROOT / "sw.js"

EXPECTED_PASS_IDS = {
    "math-q049", "math-q050", "math-q051", "math-q052",
    "dla-q031", "dla-q032", "dla-q033", "dla-q034",
}
EXPECTED_ML_IDS = {f"ml-q{i:03d}" for i in range(37, 41)}


def main() -> int:
    ok: list[str] = []
    ng: list[str] = []
    warn: list[str] = []

    try:
        recovery = PASS_RECOVERY.read_text(encoding="utf-8")
        ml_recovery = ML_RECOVERY.read_text(encoding="utf-8")
        init = INIT.read_text(encoding="utf-8")
        review = REVIEW.read_text(encoding="utf-8")
        release = RELEASE.read_text(encoding="utf-8")
        sw = SW.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[NG] 対象ファイルを読み込めません: {exc}")
        return 1

    pass_ids = set(re.findall(r'"((?:math|dla)-q\d{3})"', recovery))
    ml_ids = set(re.findall(r'"(ml-q\d{3})"', ml_recovery))
    answers = [int(value) for value in re.findall(r'\],\s*([0-3]),\s*\n\s*"', recovery)]
    answer_counts = {index: answers.count(index) for index in range(4)}

    checks = {
        "表示版dev.28": 'PRE_EXAM_REVIEW_VERSION = "v0.4.0-dev.28"' in review,
        "dev28重点8問": pass_ids == EXPECTED_PASS_IDS,
        "dev27機械学習4問維持": ml_ids == EXPECTED_ML_IDS,
        "数学4問とTransformer/ViT4問": all(token in recovery for token in [
            "PCA", "特異値分解", "コサイン類似度・距離", "クロスエントロピー",
            "Attentionの出力形状", "Attentionの行列サイズ", "ViTの埋め込み形状", "ViTとAttention計算量",
        ]),
        "重点8問をexamPriority 2": "examPriority: 2" in recovery and recovery.count("passRecoveryQuestion(") == 9,
        "正答位置を均等化": answer_counts == {0: 2, 1: 2, 2: 2, 3: 2},
        "Seed版12で8問追加": 'seedVersion", value: 12' in init and "PASS_RECOVERY_QUESTIONS" in init,
        "重点問題をseed前に読込": init.index('questions-06-pass-recovery.js?v=dev28') < init.index("await seed()"),
        "既存問題を上書きしない": 'if (!await getOne("questions", question.id)) await putOne("questions", question)' in init,
        "動的読込をdev28へ統一": all(token in init for token in [
            'questions-02-machine-learning-recovery.js?v=dev28',
            'questions-06-pass-recovery.js?v=dev28',
            'pre-exam-review.js?v=dev28',
        ]),
        "240問セルフチェック": "確認問題240問" in review and "QUESTIONS.length === 240" in review,
        "Service Worker cache dev29": 'CACHE_NAME="eshikaku-atlas-v0.4.0-dev29"' in sw,
        "dev28版URLをオフラインキャッシュ": all(token in sw for token in [
            'questions-02-machine-learning-recovery.js?v=dev28',
            'questions-06-pass-recovery.js?v=dev28',
            'pre-exam-review.js?v=dev28',
        ]),
        "5分レビュー維持": "PRE_EXAM_REVIEW_LIMIT = 5" in review and "openPreExamReview" in review,
        "104問120分本番想定維持": all(token in release for token in [
            "FULL_EXAM_QUESTION_COUNT = 104", "FULL_EXAM_MINUTES = 120", "FULL_EXAM_WARNING_MINUTES = 15"
        ]),
        "誤答原因6分類維持": all(reason in release for reason in [
            "知らなかった", "曖昧だった", "混同した", "計算・式ミス", "形式の読み違い", "時間切れ・勘"
        ]),
    }

    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    node = shutil.which("node")
    if node:
        for path in [PASS_RECOVERY, INIT, REVIEW, SW]:
            result = subprocess.run([node, "--check", str(path)], capture_output=True, text=True)
            if result.returncode:
                ng.append(f"JavaScript構文エラー（{path.name}）: {result.stderr.strip()}")
        if not any("JavaScript構文エラー" in item for item in ng):
            ok.append("JavaScript構文OK: dev28関連4ファイル")
    else:
        warn.append("Node.jsがないためJavaScript構文チェックを省略しました")

    print("=== E資格 学習ナビ v0.4.0-dev.28 追加検査 ===")
    for item in ok:
        print(f"[OK] {item}")
    for item in warn:
        print(f"[WARN] {item}")
    for item in ng:
        print(f"[NG] {item}")
    print("-" * 44)
    if ng:
        print(f"結果: NG（エラー {len(ng)}件、警告 {len(warn)}件）")
        return 1
    print(f"結果: OK（警告 {len(warn)}件）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
