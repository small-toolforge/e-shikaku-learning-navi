#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0-dev.27 の追加静的検査。"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECOVERY = ROOT / "assets/v0.4.0/questions/questions-02-machine-learning-recovery.js"
INIT = ROOT / "assets/v0.3.1/app-init.js"
REVIEW = ROOT / "assets/v0.4.0/pre-exam-review.js"
RELEASE = ROOT / "assets/v0.4.0/release-version.js"
SW = ROOT / "sw.js"

EXPECTED_IDS = {f"ml-q{i:03d}" for i in range(37, 41)}
EXPECTED_TOPICS = [
    "False Positive / False Negative",
    "Holdout / Validation / Test",
]


def main() -> int:
    ok: list[str] = []
    ng: list[str] = []
    warn: list[str] = []

    try:
        recovery = RECOVERY.read_text(encoding="utf-8")
        init = INIT.read_text(encoding="utf-8")
        review = REVIEW.read_text(encoding="utf-8")
        release = RELEASE.read_text(encoding="utf-8")
        sw = SW.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[NG] 対象ファイルを読み込めません: {exc}")
        return 1

    ids = set(re.findall(r'"(ml-q\d{3})"', recovery))
    checks = {
        "表示版dev.27": 'PRE_EXAM_REVIEW_VERSION = "v0.4.0-dev.27"' in review,
        "機械学習復旧4問": ids == EXPECTED_IDS,
        "過去出題2テーマ": all(topic in recovery for topic in EXPECTED_TOPICS),
        "4問をexamPriority 2": "examPriority: 2" in recovery and recovery.count("machineLearningRecoveryQuestion(") == 5,
        "不適切選択問題を含む": 'questionPolarity: "incorrect_choice"' in recovery,
        "英語の読みと日本語訳を含む": all(token in recovery for token in ["フォールス・ポジティブ／偽陽性", "フォールス・ネガティブ／偽陰性", "バリデーション／検証", "テスト／最終評価"]),
        "Seed版11で4問を追加": 'seedVersion", value: 11' in init and "MACHINE_LEARNING_RECOVERY_QUESTIONS" in init,
        "復旧問題をseed前に読込": init.index('questions-02-machine-learning-recovery.js') < init.index("await seed()"),
        "既存問題を上書きしない": 'if (!await getOne("questions", question.id)) await putOne("questions", question)' in init,
        "232問セルフチェック": "確認問題232問" in review and "QUESTIONS.length === 232" in review,
        "Service Worker dev27": 'CACHE_NAME="eshikaku-atlas-v0.4.0-dev27"' in sw,
        "復旧問題をオフラインキャッシュ": 'questions-02-machine-learning-recovery.js' in sw,
        "5分レビュー維持": "PRE_EXAM_REVIEW_LIMIT = 5" in review and "openPreExamReview" in review,
        "104問120分本番想定維持": all(token in release for token in ["FULL_EXAM_QUESTION_COUNT = 104", "FULL_EXAM_MINUTES = 120", "FULL_EXAM_WARNING_MINUTES = 15"]),
        "誤答原因6分類維持": all(reason in release for reason in ["知らなかった", "曖昧だった", "混同した", "計算・式ミス", "形式の読み違い", "時間切れ・勘"]),
    }

    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    node = shutil.which("node")
    if node:
        for path in [RECOVERY, INIT, REVIEW, SW]:
            result = subprocess.run([node, "--check", str(path)], capture_output=True, text=True)
            if result.returncode:
                ng.append(f"JavaScript構文エラー（{path.name}）: {result.stderr.strip()}")
        if not any("JavaScript構文エラー" in item for item in ng):
            ok.append("JavaScript構文OK: dev27関連4ファイル")
    else:
        warn.append("Node.jsがないためJavaScript構文チェックを省略しました")

    print("=== E資格 学習ナビ v0.4.0-dev.27 追加検査 ===")
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
