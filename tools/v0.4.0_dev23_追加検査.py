#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0-dev.23 の追加静的検査。"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "assets/v0.4.0/release-version.js"
SW = ROOT / "sw.js"

EXPECTED_REASONS = [
    "知らなかった",
    "曖昧だった",
    "混同した",
    "計算・式ミス",
    "形式の読み違い",
    "時間切れ・勘",
]


def main() -> int:
    ok: list[str] = []
    ng: list[str] = []
    warn: list[str] = []

    try:
        release = RELEASE.read_text(encoding="utf-8")
        sw = SW.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[NG] 対象ファイルを読み込めません: {exc}")
        return 1

    checks = {
        "表示版dev.23": 'const RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.23"' in release,
        "Service Worker dev23": 'CACHE_NAME="eshikaku-atlas-v0.4.0-dev23"' in sw,
        "誤答原因6分類": all(reason in release for reason in EXPECTED_REASONS)
        and release.count('const PASS_ERROR_REASONS = [') == 1,
        "旧履歴を変更しないUI差替え": "renderFeedbackWithPassPriority" in release
        and "session.lastLog.errorReason = PASS_ERROR_REASONS" in release,
        "examPriority既定値0": "question.examPriority ?? 0" in release,
        "優先度2は通常最大5問": "const MAX_PRIORITY2_PER_SPRINT = 5" in release
        and "uniqueQuestionsWithPriorityCap" in release,
        "15分集中だけ優先出題を上書き": "examSprintQuestions = function examSprintQuestionsWithPassPriority" in release,
        "期限・弱点・未学習の順序維持": all(
            token in release for token in ["const due =", "const weak =", "const unseen =", "const others ="]
        ),
        "228問セルフチェック維持": "確認問題228問" in release and "QUESTIONS.length === 228" in release,
    }

    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

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

    # 配列に想定外のラベルが混ざっていないかを簡易確認します。
    match = re.search(r"const PASS_ERROR_REASONS = \[(.*?)\];", release, re.S)
    if match:
        labels = re.findall(r'"([^"]+)"', match.group(1))
        if labels == EXPECTED_REASONS:
            ok.append("誤答原因の順序・件数: 6件で一致")
        else:
            ng.append(f"誤答原因の順序・件数が不一致: {labels}")
    else:
        ng.append("PASS_ERROR_REASONS配列を解析できません")

    print("=== E資格 学習ナビ v0.4.0-dev.23 追加検査 ===")
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
