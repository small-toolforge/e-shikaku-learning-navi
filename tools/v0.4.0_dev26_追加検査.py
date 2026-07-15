#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0-dev.26 の追加静的検査。"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / "assets/v0.4.0/pre-exam-review.js"
INIT = ROOT / "assets/v0.3.1/app-init.js"
RELEASE = ROOT / "assets/v0.4.0/release-version.js"
SW = ROOT / "sw.js"


def main() -> int:
    ok: list[str] = []
    ng: list[str] = []
    warn: list[str] = []

    try:
        review = REVIEW.read_text(encoding="utf-8")
        init = INIT.read_text(encoding="utf-8")
        release = RELEASE.read_text(encoding="utf-8")
        sw = SW.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[NG] 対象ファイルを読み込めません: {exc}")
        return 1

    checks = {
        "表示版dev.26": 'PRE_EXAM_REVIEW_VERSION = "v0.4.0-dev.26"' in review,
        "5分レビュー最大5件": "PRE_EXAM_REVIEW_LIMIT = 5" in review,
        "弱点上位3件を先頭": "passWeakTopQuestions(Math.min(3, limit))" in review,
        "重点度とSRSで補完": "preExamReviewRank" in review and "questionExamPriority(question)" in review and "priorityInfo(srs).score" in review,
        "見るだけレビュー": all(token in review for token in ["採点・回答ログ・復習予定は更新しません", "正答", "5分で確認する要点"]),
        "回答保存処理を呼ばない": all(token not in review for token in ["saveAnswerAtomic(", "nextReview(", 'putOne("logs"', "startSession("]),
        "合格モードへ5分レビュー追加": 'data-exam-action="review5"' in review and "openPreExamReview" in review,
        "ホームへ戻れる": "preExamReviewHome" in review and 'nav("home")' in review,
        "初期表示前にdev26拡張読込": 'loadAppExtension("./assets/v0.4.0/pre-exam-review.js")' in init and "await loadAll()" in init,
        "dev25本番想定を維持": all(token in release for token in ["FULL_EXAM_QUESTION_COUNT = 104", "FULL_EXAM_MINUTES = 120", "FULL_EXAM_WARNING_MINUTES = 15"]),
        "dev23誤答原因6分類を維持": all(reason in release for reason in ["知らなかった", "曖昧だった", "混同した", "計算・式ミス", "形式の読み違い", "時間切れ・勘"]),
        "228問セルフチェック維持": "確認問題228問" in release and "QUESTIONS.length === 228" in release,
        "Service Worker dev26": 'CACHE_NAME="eshikaku-atlas-v0.4.0-dev26"' in sw,
        "5分レビューをオフラインキャッシュ": '"./assets/v0.4.0/pre-exam-review.js"' in sw,
        "受け入れ版dev26上書き": "runAcceptanceChecksWithPreExamReview" in review and "buildAcceptanceSnapshotWithPreExamReview" in review,
    }

    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    node = shutil.which("node")
    if node:
        for path in [REVIEW, INIT, SW]:
            result = subprocess.run([node, "--check", str(path)], capture_output=True, text=True)
            if result.returncode:
                ng.append(f"JavaScript構文エラー（{path.name}）: {result.stderr.strip()}")
        if not any("JavaScript構文エラー" in item for item in ng):
            ok.append("JavaScript構文OK: pre-exam-review.js / app-init.js / sw.js")
    else:
        warn.append("Node.jsがないためJavaScript構文チェックを省略しました")

    print("=== E資格 学習ナビ v0.4.0-dev.26 追加検査 ===")
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
