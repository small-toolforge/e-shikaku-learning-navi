#!/usr/bin/env python3
"""E資格 学習ナビ dev.27 の統合検査。既存基盤228問 + 追加4問 = 232問を確認する。"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKS = [
    ROOT / "tools/v0.4.0_基盤検査.py",
    ROOT / "tools/v0.4.0_dev27_追加検査.py",
]


def main() -> int:
    failed = False
    for check in CHECKS:
        print(f"\n>>> {check.name}")
        result = subprocess.run([sys.executable, str(check)], cwd=ROOT)
        if result.returncode != 0:
            failed = True

    print("\n=== dev.27 統合判定 ===")
    if failed:
        print("結果: NG（上記検査のエラーを確認してください）")
        return 1

    print("[OK] 既存教材基盤: 228問")
    print("[OK] dev.27 機械学習復旧: 4問")
    print("[OK] アプリ最終問題数: 232問")
    print("結果: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
