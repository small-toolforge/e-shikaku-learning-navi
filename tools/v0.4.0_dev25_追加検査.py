#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0-dev.25 の追加静的検査。"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "assets/v0.4.0/release-version.js"
EXAM_CSS = ROOT / "assets/v0.4.0/exam-mode.css"
SW = ROOT / "sw.js"


def main() -> int:
    ok: list[str] = []
    warn: list[str] = []
    ng: list[str] = []

    try:
        release = RELEASE.read_text(encoding="utf-8")
        exam_css = EXAM_CSS.read_text(encoding="utf-8")
        sw = SW.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[NG] 対象ファイルを読み込めません: {exc}")
        return 1

    checks = {
        "表示版dev.25": 'const RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.25"' in release,
        "Service Worker dev25": 'CACHE_NAME="eshikaku-atlas-v0.4.0-dev25"' in sw,
        "本番想定104問": "const FULL_EXAM_QUESTION_COUNT = 104" in release,
        "本番想定120分": "const FULL_EXAM_MINUTES = 120" in release,
        "残り15分通知": "const FULL_EXAM_WARNING_MINUTES = 15" in release
        and "examWarningShown" in release
        and "残り${FULL_EXAM_WARNING_MINUTES}分です" in release,
        "出題対象から重複なし104問": "function fullExamQuestions" in release
        and "shuffle(examEligibleQuestions())" in release
        and ".slice(0, Math.min(limit" in release,
        "本番想定開始処理": "function startFullExamSimulation" in release
        and "startFullExamList(list)" in release
        and "startExamSession(list, title, FULL_EXAM_MINUTES)" in release,
        "本番想定フラグ": "session.fullExamMode = true" in release,
        "15分警告は一度だけ": "if (!session.examWarningShown)" in release
        and "session.examWarningShown = true" in release,
        "15分警告タイマー表示": '.exam-timer.warning' in exam_css
        and 'classList.add("warning")' in release,
        "本番想定ボタン": 'data-exam-action="full"' in release
        and "104問・120分の本番想定を始める" in release,
        "本番想定ボタン配線": "bindExamModeActionsWithFullExam" in release
        and "full.onclick = startFullExamSimulation" in release,
        "本番想定結果表示": "本番想定モードの結果" in release,
        "本番想定再試行": "startFullExamList(finished.list, finished.title)" in release,
        "15分集中を維持": "examSprintQuestions = function examSprintQuestionsWithPassPriority" in release
        and 'data-exam-action="sprint"' in release,
        "誤答原因6分類を維持": all(reason in release for reason in [
            "知らなかった", "曖昧だった", "混同した", "計算・式ミス", "形式の読み違い", "時間切れ・勘"
        ]),
        "合格モードを維持": all(token in release for token in [
            "passExamCountdownText", "今日の15分メニュー", "弱点上位3件", "目標：あと8問を回収"
        ]),
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

    print("=== E資格 学習ナビ v0.4.0-dev.25 追加検査 ===")
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