#!/usr/bin/env python3
"""E資格 学習ナビ v0.3.1 のリリース前検査。

標準Pythonでファイル構成・版・PWA整合を検査し、Node.jsがある環境では
JavaScriptの構文も確認する。リポジトリのルートで実行すること。
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "v0.3.1"
STYLE = "assets/v0.3.1/styles.css"
SCRIPTS = [
    "assets/v0.3.1/app-data.js",
    "assets/v0.3.1/app-ui.js",
    "assets/v0.3.1/app-lab.js",
    "assets/v0.3.1/app-management.js",
    "assets/v0.3.1/app-init.js",
]
REQUIRED = [
    "index.html",
    "sw.js",
    "manifest.webmanifest",
    ".nojekyll",
    "README.md",
    "icons/app-icon.svg",
    "icons/icon-192.png",
    "icons/apple-touch-icon.png",
    STYLE,
    *SCRIPTS,
    "docs/3端末動作確認チェック表.md",
    "tools/リリース検査.py",
    "tools/リリース検査.cmd",
]
LEGACY = [
    "v0.3.1.js",
    "assets/v0.3/styles.css",
    "assets/v0.3/app-1.js",
    "assets/v0.3/app-2.js",
    "assets/v0.3/app-3.js",
    "assets/v0.3/app-4.js",
    "assets/v0.3/app-5.js",
    "assets/v0.3/lab-guard.js",
    "assets/v0.3/lab-runtime.js",
]
EXPECTED_SYMBOLS = [
    "function renderHome",
    "function renderLab",
    "function renderStats",
    "function validateQuestionBatch",
    "function runDiagnostics",
    "function downloadBackup",
    "function saveAnswerAtomic",
    "function saveRecoverySnapshot",
    "function clearHistoryAtomic",
]


class Inspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.script_srcs: list[str] = []
        self.script_defer: list[bool] = []
        self.stylesheets: list[str] = []
        self.inline_script_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if data.get("id"):
            self.ids.append(str(data["id"]))
        if tag == "script":
            if data.get("src"):
                self.script_srcs.append(str(data["src"]))
                self.script_defer.append("defer" in data)
            else:
                self.inline_script_count += 1
        if tag == "link" and data.get("rel") == "stylesheet" and data.get("href"):
            self.stylesheets.append(str(data["href"]))


def main() -> int:
    ok: list[str] = []
    warnings: list[str] = []
    errors: list[str] = []

    for rel in REQUIRED:
        path = ROOT / rel
        if path.exists():
            ok.append(f"存在: {rel}")
        else:
            errors.append(f"必須ファイルがありません: {rel}")

    for rel in LEGACY:
        if (ROOT / rel).exists():
            errors.append(f"旧試作ファイルが残っています: {rel}")

    try:
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        sw = (ROOT / "sw.js").read_text(encoding="utf-8")
        manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
        script_texts = {rel: (ROOT / rel).read_text(encoding="utf-8") for rel in SCRIPTS}
        javascript = "\n".join(script_texts.values())
    except Exception as exc:
        errors.append(f"主要ファイルを読み込めません: {exc}")
        return report(ok, warnings, errors)

    inspector = Inspector()
    inspector.feed(html)
    duplicates = sorted({item for item in inspector.ids if inspector.ids.count(item) > 1})
    if duplicates:
        errors.append("静的HTMLでidが重複しています: " + ", ".join(duplicates))
    else:
        ok.append("静的HTMLのid重複なし")

    if inspector.stylesheets != [STYLE]:
        errors.append(f"CSS参照の順序・名称が不一致: {inspector.stylesheets}")
    else:
        ok.append("CSS参照一致")

    if inspector.script_srcs != SCRIPTS:
        errors.append(f"JavaScript参照の順序・名称が不一致: {inspector.script_srcs}")
    else:
        ok.append("JavaScript参照順一致")

    if inspector.script_defer and not all(inspector.script_defer):
        errors.append("外部JavaScriptにはすべてdeferを付けてください")
    else:
        ok.append("JavaScriptはdefer読込")

    if inspector.inline_script_count:
        errors.append(f"index.htmlにインラインscriptが残っています: {inspector.inline_script_count}件")
    else:
        ok.append("index.htmlにインラインscriptなし")

    for symbol in EXPECTED_SYMBOLS:
        if symbol in javascript:
            ok.append(f"実装あり: {symbol}")
        else:
            errors.append(f"実装が見つかりません: {symbol}")

    if "await renderHome()" not in script_texts[SCRIPTS[-1]]:
        errors.append("初期化時にrenderHome()をawaitしていません")
    else:
        ok.append("初期ホーム描画をawait")

    if 'db.transaction(["srs", "logs"], "readwrite")' not in javascript:
        errors.append("回答ログと復習予定の同時保存が見つかりません")
    else:
        ok.append("回答ログと復習予定を原子的に保存")

    app_match = re.search(r'const\s+APP_VERSION\s*=\s*["\'](v[^"\']+)["\']', javascript)
    cache_match = re.search(r'const\s+CACHE_NAME\s*=\s*["\']([^"\']+)["\']', sw)
    if not app_match:
        errors.append("APP_VERSIONを取得できません")
    elif app_match.group(1) != VERSION:
        errors.append(f"APP_VERSIONが想定外です: {app_match.group(1)}")

    if not cache_match:
        errors.append("CACHE_NAMEを取得できません")
    elif VERSION not in cache_match.group(1):
        errors.append(f"版不一致: APP_VERSION={VERSION}, CACHE_NAME={cache_match.group(1)}")
    else:
        ok.append(f"版一致: {VERSION}")

    assets_match = re.search(r"const\s+ASSETS\s*=\s*\[(.*?)\]", sw, flags=re.S)
    sw_assets: set[str] = set()
    if assets_match:
        sw_assets = set(re.findall(r'["\']([^"\']+)["\']', assets_match.group(1)))
        for asset in sorted(sw_assets):
            if asset == "./":
                continue
            rel = asset.removeprefix("./").split("?", 1)[0]
            if not (ROOT / rel).exists():
                errors.append(f"Service Worker対象が存在しません: {asset}")
        required_assets = ["./index.html", "./manifest.webmanifest", f"./{STYLE}", *[f"./{item}" for item in SCRIPTS]]
        for required_asset in required_assets:
            if required_asset not in sw_assets:
                errors.append(f"Service Worker対象から欠落: {required_asset}")
        ok.append(f"Service Worker対象: {len(sw_assets)}件")
    else:
        errors.append("sw.jsのASSETS配列を取得できません")

    for token, label in [
        ("self.skipWaiting()", "skipWaiting"),
        ("self.clients.claim()", "clients.claim"),
        ("fetch(request)", "ネットワーク優先fetch"),
    ]:
        if token in sw:
            ok.append(f"Service Worker: {label}")
        else:
            errors.append(f"Service Workerに{label}がありません")

    if manifest.get("id") != "./":
        errors.append("manifest.idは ./ にしてください")
    if manifest.get("start_url") != "./" or manifest.get("scope") != "./":
        errors.append("manifestのstart_urlとscopeは ./ にしてください")
    if manifest.get("display") != "standalone":
        errors.append("manifest.displayはstandaloneにしてください")
    if manifest.get("orientation") != "any":
        warnings.append("3端末対応のためorientationはanyを推奨します")

    icons = manifest.get("icons", [])
    if not icons:
        errors.append("manifestにiconsがありません")
    for icon in icons:
        src = str(icon.get("src", ""))
        if not src or not (ROOT / src).exists():
            errors.append(f"manifestのiconが存在しません: {src or '(srcなし)'}")
        if src and f"./{src}" not in sw_assets:
            errors.append(f"manifestのiconがService Worker対象外です: {src}")

    node = shutil.which("node")
    if node:
        for rel in SCRIPTS:
            result = subprocess.run([node, "--check", str(ROOT / rel)], capture_output=True, text=True)
            if result.returncode:
                errors.append(f"JavaScript構文エラー（{rel}）: {result.stderr.strip()}")
        result = subprocess.run([node, "--check", str(ROOT / "sw.js")], capture_output=True, text=True)
        if result.returncode:
            errors.append(f"JavaScript構文エラー（sw.js）: {result.stderr.strip()}")
        if not any("JavaScript構文エラー" in item for item in errors):
            ok.append(f"JavaScript構文OK: {len(SCRIPTS) + 1}ファイル")
    else:
        warnings.append("Node.jsがないためJavaScript構文チェックを省略しました")

    total = sum((ROOT / rel).stat().st_size for rel in ["index.html", STYLE, *SCRIPTS])
    ok.append(f"アプリ本体サイズ: {total // 1024}KB")
    return report(ok, warnings, errors)


def report(ok: list[str], warnings: list[str], errors: list[str]) -> int:
    print("=== E資格 学習ナビ リリース検査 ===")
    for item in ok:
        print(f"[OK] {item}")
    for item in warnings:
        print(f"[WARN] {item}")
    for item in errors:
        print(f"[NG] {item}")
    print("-" * 40)
    if errors:
        print(f"結果: NG（エラー {len(errors)}件、警告 {len(warnings)}件）")
        return 1
    print(f"結果: OK（警告 {len(warnings)}件）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
