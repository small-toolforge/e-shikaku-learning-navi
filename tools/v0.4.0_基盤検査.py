#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0 論文図解アトラス基盤の静的検査。"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = [
    "assets/v0.3.1/styles.css",
    "assets/v0.4.0/atlas.css",
    "assets/v0.4.0/application-atlas.css",
]
SCRIPTS = [
    "assets/v0.3.1/app-data.js",
    "assets/v0.4.0/atlas-data.js",
    "assets/v0.4.0/application-atlas-data.js",
    "assets/v0.3.1/app-ui.js",
    "assets/v0.4.0/atlas-ui.js",
    "assets/v0.4.0/application-atlas-ui.js",
    "assets/v0.4.0/atlas-segment-defaults.js",
    "assets/v0.3.1/app-lab.js",
    "assets/v0.3.1/app-management.js",
    "assets/v0.3.1/app-init.js",
]
LOCAL_LAUNCHER = "tools/v0.4.0_ローカル確認.cmd"
REQUIRED = ["index.html", "sw.js", *CSS, *SCRIPTS, LOCAL_LAUNCHER]


class Inspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.styles: list[str] = []
        self.scripts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if tag == "link" and data.get("rel") == "stylesheet" and data.get("href"):
            self.styles.append(str(data["href"]))
        if tag == "script" and data.get("src"):
            self.scripts.append(str(data["src"]))


def main() -> int:
    ok: list[str] = []
    warn: list[str] = []
    ng: list[str] = []

    for rel in REQUIRED:
        if (ROOT / rel).exists():
            ok.append(f"存在: {rel}")
        else:
            ng.append(f"必須ファイルがありません: {rel}")

    try:
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        sw = (ROOT / "sw.js").read_text(encoding="utf-8")
        data = (ROOT / "assets/v0.4.0/atlas-data.js").read_text(encoding="utf-8")
        ui = (ROOT / "assets/v0.4.0/atlas-ui.js").read_text(encoding="utf-8")
        application_data = (ROOT / "assets/v0.4.0/application-atlas-data.js").read_text(encoding="utf-8")
        application_ui = (ROOT / "assets/v0.4.0/application-atlas-ui.js").read_text(encoding="utf-8")
        application_css = (ROOT / "assets/v0.4.0/application-atlas.css").read_text(encoding="utf-8")
        segment_defaults = (ROOT / "assets/v0.4.0/atlas-segment-defaults.js").read_text(encoding="utf-8")
        init = (ROOT / "assets/v0.3.1/app-init.js").read_text(encoding="utf-8")
        launcher = (ROOT / LOCAL_LAUNCHER).read_text(encoding="utf-8")
    except Exception as exc:
        ng.append(f"主要ファイルを読み込めません: {exc}")
        return report(ok, warn, ng)

    inspector = Inspector()
    inspector.feed(html)
    if inspector.styles == CSS:
        ok.append("CSS参照順一致")
    else:
        ng.append(f"CSS参照順が不一致: {inspector.styles}")
    if inspector.scripts == SCRIPTS:
        ok.append("JavaScript参照順一致")
    else:
        ng.append(f"JavaScript参照順が不一致: {inspector.scripts}")

    application_ids = [
        "resnet", "vision-transformer", "detection", "segmentation", "word-embedding",
        "llm", "speech", "generative", "deep-rl", "learning-methods", "xai",
    ]
    checks = {
        "Transformerアトラス版表示": 'ATLAS_VERSION = "v0.4.0-dev.1"' in data,
        "応用アトラス版表示": 'APPLICATION_ATLAS_VERSION = "v0.4.0-dev.2"' in application_data,
        "Transformer原典": "Attention Is All You Need" in data,
        "Transformer図解ノード": "TRANSFORMER_NODES" in data and data.count("segment:") >= 16,
        "Transformer確認問題3問": data.count('id: "atlas-transformer-00') == 3,
        "シラバス索引": "SYLLABUS_INDEX" in data and data.count("syllabusItem(") >= 50,
        "論文図解タブ": 'button.textContent = "論文図解"' in ui,
        "スマホ分割表示": all(x in ui for x in ['data-segment="all"', 'data-segment="encoder"', 'data-segment="decoder"']),
        "分割時の解説初期値": "maskedAttention" in segment_defaults and "selfAttention" in segment_defaults,
        "応用11図解": all(f'id: "{atlas_id}"' in application_data for atlas_id in application_ids),
        "応用確認問題28問": application_data.count('applicationQuestion("app-') == 28,
        "応用図解選択UI": "applicationAtlasSelect" in application_ui and "renderApplicationAtlas" in application_ui,
        "応用SVGノード解説": "applicationDiagramSvg" in application_ui and "applicationNodeExplanation" in application_ui,
        "スマホ向け日本語ノード選択": "data-application-node-button" in application_ui and ".application-node-buttons" in application_css,
        "応用索引から図解へ接続": "applicationAtlasIdForItem" in application_ui and "data-open-atlas" in application_ui,
        "間隔反復への接続": "startSession(" in application_ui and "APPLICATION_QUESTIONS" in init,
        "追加問題のSeed": 'version < 4' in init and 'seedVersion", value: 4' in init,
        "索引検索": "atlasSearch" in ui and "renderSyllabusIndex" in ui,
        "ローカル確認の配信元固定": '--directory "%ROOT%"' in launcher,
        "ローカル確認の端末内限定": "--bind 127.0.0.1" in launcher,
    }
    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    for rel in [*CSS, *SCRIPTS]:
        asset = f'./{rel}'
        if asset in sw:
            ok.append(f"Service Worker対象: {rel}")
        else:
            ng.append(f"Service Worker対象から欠落: {rel}")
    if "v0.4.0-dev2" in sw:
        ok.append("Service Workerキャッシュ世代: v0.4.0-dev2")
    else:
        ng.append("Service Workerキャッシュ世代がv0.4.0-dev2ではありません")

    node = shutil.which("node")
    if node:
        for rel in [*SCRIPTS, "sw.js"]:
            result = subprocess.run([node, "--check", str(ROOT / rel)], capture_output=True, text=True)
            if result.returncode:
                ng.append(f"JavaScript構文エラー（{rel}）: {result.stderr.strip()}")
        if not any("JavaScript構文エラー" in item for item in ng):
            ok.append(f"JavaScript構文OK: {len(SCRIPTS) + 1}ファイル")
    else:
        warn.append("Node.jsがないためJavaScript構文チェックを省略しました")

    index_count = len(re.findall(r"syllabusItem\(", data)) - 1
    atlas_size = sum(len(text.encode()) for text in [data, ui, application_data, application_ui, segment_defaults]) // 1024
    ok.append(f"シラバス索引項目: {index_count}件")
    ok.append(f"図解総数: {1 + len(application_ids)}件")
    ok.append("応用追加問題: 28問（既存18問と合わせて46問想定）")
    ok.append(f"アトラス追加サイズ: {atlas_size}KB")
    return report(ok, warn, ng)


def report(ok: list[str], warn: list[str], ng: list[str]) -> int:
    print("=== E資格 学習ナビ v0.4.0 基盤検査 ===")
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
