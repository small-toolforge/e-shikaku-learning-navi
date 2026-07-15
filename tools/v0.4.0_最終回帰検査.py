#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0-dev.28 最終回帰検査。

アプリ本体を変更せず、既存のdev.28統合検査に加えて、公開版・Seed・
動的読込URL・Service Worker・ローカル確認環境の整合性をまとめて確認する。
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEV28_CHECK = ROOT / "tools/v0.4.0_dev28_統合検査.py"
INIT = ROOT / "assets/v0.3.1/app-init.js"
REVIEW = ROOT / "assets/v0.4.0/pre-exam-review.js"
SW = ROOT / "sw.js"
LOCAL_CMD = ROOT / "tools/v0.4.0_ローカル確認.cmd"

DEV28_URLS = [
    "./assets/v0.4.0/questions/questions-02-machine-learning-recovery.js?v=dev28",
    "./assets/v0.4.0/questions/questions-06-pass-recovery.js?v=dev28",
    "./assets/v0.4.0/pre-exam-review.js?v=dev28",
]


def main() -> int:
    ng: list[str] = []
    ok: list[str] = []

    print("=== E資格 学習ナビ v0.4.0-dev.28 最終回帰検査 ===")
    print("\n>>> 既存dev.28統合検査")
    result = subprocess.run([sys.executable, str(DEV28_CHECK)], cwd=ROOT)
    if result.returncode != 0:
        ng.append("dev.28統合検査がNG")
    else:
        ok.append("dev.28統合検査: OK")

    try:
        init = INIT.read_text(encoding="utf-8")
        review = REVIEW.read_text(encoding="utf-8")
        sw = SW.read_text(encoding="utf-8")
        local_cmd = LOCAL_CMD.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[NG] 対象ファイルを読み込めません: {exc}")
        return 1

    checks = {
        "表示版dev.28": 'PRE_EXAM_REVIEW_VERSION = "v0.4.0-dev.28"' in review,
        "240問セルフチェック": "確認問題240問" in review and "QUESTIONS.length === 240" in review,
        "Seed版12": 'seedVersion", value: 12' in init and "PASS_RECOVERY_QUESTIONS" in init,
        "Service Worker cache dev29": 'CACHE_NAME="eshikaku-atlas-v0.4.0-dev29"' in sw,
        "動的読込URLをdev28へ統一": all(url in init for url in DEV28_URLS),
        "PWAキャッシュURLをdev28へ統一": all(url in sw for url in DEV28_URLS),
        "dev27動的URLが残っていない": "?v=dev27" not in init and "?v=dev27" not in sw,
        "ローカル確認は127.0.0.1限定": "--bind 127.0.0.1" in local_cmd and "http://127.0.0.1:" in local_cmd,
    }

    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    conflict_files: list[str] = []
    targets = [ROOT / "index.html", ROOT / "sw.js"]
    targets.extend((ROOT / "assets").rglob("*.js"))
    targets.extend((ROOT / "assets").rglob("*.css"))
    for path in targets:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if "<<<<<<<" in text or ">>>>>>>" in text:
            conflict_files.append(str(path.relative_to(ROOT)))
    if conflict_files:
        ng.append("マージ競合マーカー残存: " + ", ".join(conflict_files))
    else:
        ok.append("マージ競合マーカーなし: OK")

    print("\n>>> 最終整合性")
    for item in ok:
        print(f"[OK] {item}")
    for item in ng:
        print(f"[NG] {item}")

    print("-" * 52)
    if ng:
        print(f"最終判定: NG（{len(ng)}件）")
        return 1
    print("最終判定: OK")
    print("次: Windows実行時セルフチェック → 主要機能スモークテスト → iPhone/Android確認")
    return 0


if __name__ == "__main__":
    sys.exit(main())
