#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0-dev.24 の追加静的検査。"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "assets/v0.4.0/release-version.js"
SW = ROOT / "sw.js"


def main() -> int:
    ok: list[str] = []
    warn: list[str] = []
    ng: list[str] = []

    try:
        release = RELEASE.read_text(encoding="utf-8")
        sw = SW.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[NG] 対象ファイルを読み込めません: {exc}")
        return 1

    checks = {
        "表示版dev.24": 'const RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.24"' in release,
        "Service Worker dev24": 'CACHE_NAME="eshikaku-atlas-v0.4.0-dev24"' in sw,
        "試験日をローカル日付で定義": "new Date(2026, 7, 29)" in release,
        "残り日数表示": all(token in release for token in [
            "function passExamDaysRemaining", "function passExamCountdownText", "試験まであと${days}日"
        ]),
        "今日の15分メニュー": 'data-exam-action="sprint"' in release
        and "今日の15分メニューを始める" in release,
        "弱点上位3件": all(token in release for token in [
            "function passWeakTopQuestions", "priorityInfo(SRS[b.id]).score", ".slice(0, limit)", "弱点上位3件"
        ]),
        "履歴なし案内": "まだ回答履歴がありません。今日の15分メニューから始めてください。" in release,
        "合格目標8問": "目標：あと8問を回収" in release,
        "既存の優先出題を維持": all(token in release for token in [
            "examSprintQuestionsWithPassPriority", "MAX_PRIORITY2_PER_SPRINT = 5", "question.examPriority ?? 0"
        ]),
        "誤答原因6分類を維持": release.count("const PASS_ERROR_REASONS = [") == 1
        and all(reason in release for reason in [
            "知らなかった", "曖昧だった", "混同した", "計算・式ミス", "形式の読み違い", "時間切れ・勘"
        ]),
        "問題数228問を維持": "確認問題228問" in release and "QUESTIONS.length === 228" in release,
        "合格モードで既存パネルを上書き": "examModePanelHtmlWithPassDashboard" in release,
    }

    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    # 弱点は回答履歴がある問題だけを対象にし、最大3件に絞ることを確認します。
    weak_block = re.search(
        r"function passWeakTopQuestions\(limit = 3\) \{(.*?)\n\}",
        release,
        re.S,
    )
    if weak_block and ".filter(question => SRS[question.id])" in weak_block.group(1):
        ok.append("弱点上位は回答履歴ありの問題だけ: OK")
    else:
        ng.append("弱点上位の回答履歴フィルターが不足")

    node = shutil.which("node")
    if node:
        for path in [RELEASE, SW]:
            result = subprocess.run([node, "--check", str(path)], capture_output=True, text=True)
            if result.returncode:
                ng.append(f"JavaScript構文エラー（{path.name}）: {result.stderr.strip()}")
        if not any("JavaScript構文エラー" in item for item in ng):
            ok.append("JavaScript構文OK: release-version.js / sw.js")
    else:
        warn.append("Node.jsがないためJavaScript構文チェックを省略しました")

    print("=== E資格 学習ナビ v0.4.0-dev.24 追加検査 ===")
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
