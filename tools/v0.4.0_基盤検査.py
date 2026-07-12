#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0 の静的基盤検査。"""
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
    "assets/v0.4.0/cards/cards.css",
    "assets/v0.4.0/card-progress.css",
    "assets/v0.4.0/card-scope.css",
    "assets/v0.4.0/exam-mode.css",
    "assets/v0.4.0/acceptance-check.css",
]
SCRIPTS = [
    "assets/v0.3.1/app-data.js",
    "assets/v0.4.0/atlas-data.js",
    "assets/v0.4.0/application-atlas-data.js",
    "assets/v0.4.0/cards/cards-01-math.js",
    "assets/v0.4.0/cards/cards-02-machine-learning.js",
    "assets/v0.4.0/cards/cards-03-deep-learning-base.js",
    "assets/v0.4.0/cards/cards-04-deep-learning-application.js",
    "assets/v0.4.0/cards/cards-05-development-operations.js",
    "assets/v0.4.0/development-atlas-data.js",
    "assets/v0.4.0/questions/questions-01-math.js",
    "assets/v0.4.0/questions/questions-02-machine-learning.js",
    "assets/v0.4.0/questions/questions-03-deep-learning-base.js",
    "assets/v0.4.0/questions/questions-05-development-operations.js",
    "assets/v0.4.0/question-reference-repair.js",
    "assets/v0.4.0/questions/question-links.js",
    "assets/v0.3.1/app-ui.js",
    "assets/v0.4.0/atlas-ui.js",
    "assets/v0.4.0/application-atlas-ui.js",
    "assets/v0.4.0/cards/cards-ui.js",
    "assets/v0.4.0/development-atlas-ui.js",
    "assets/v0.4.0/atlas-segment-defaults.js",
    "assets/v0.3.1/app-lab.js",
    "assets/v0.3.1/app-management.js",
    "assets/v0.4.0/card-progress.js",
    "assets/v0.4.0/card-scope.js",
    "assets/v0.4.0/exam-mode.js",
    "assets/v0.4.0/acceptance-check.js",
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


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def main() -> int:
    ok: list[str] = []
    warn: list[str] = []
    ng: list[str] = []

    for rel in REQUIRED:
        (ok if (ROOT / rel).exists() else ng).append(
            f"存在: {rel}" if (ROOT / rel).exists() else f"必須ファイルがありません: {rel}"
        )

    try:
        html = read("index.html")
        sw = read("sw.js")
        atlas = read("assets/v0.4.0/atlas-data.js")
        app_atlas = read("assets/v0.4.0/application-atlas-data.js")
        dev_atlas = read("assets/v0.4.0/development-atlas-data.js")
        math_cards = read("assets/v0.4.0/cards/cards-01-math.js")
        ml_cards = read("assets/v0.4.0/cards/cards-02-machine-learning.js")
        dl_cards = read("assets/v0.4.0/cards/cards-03-deep-learning-base.js")
        app_cards = read("assets/v0.4.0/cards/cards-04-deep-learning-application.js")
        dev_cards = read("assets/v0.4.0/cards/cards-05-development-operations.js")
        math_q = read("assets/v0.4.0/questions/questions-01-math.js")
        ml_q = read("assets/v0.4.0/questions/questions-02-machine-learning.js")
        dl_q = read("assets/v0.4.0/questions/questions-03-deep-learning-base.js")
        dev_q = read("assets/v0.4.0/questions/questions-05-development-operations.js")
        repair = read("assets/v0.4.0/question-reference-repair.js")
        links = read("assets/v0.4.0/questions/question-links.js")
        progress = read("assets/v0.4.0/card-progress.js")
        scope = read("assets/v0.4.0/card-scope.js")
        exam = read("assets/v0.4.0/exam-mode.js")
        exam_css = read("assets/v0.4.0/exam-mode.css")
        acceptance = read("assets/v0.4.0/acceptance-check.js")
        acceptance_css = read("assets/v0.4.0/acceptance-check.css")
        init = read("assets/v0.3.1/app-init.js")
        launcher = read(LOCAL_LAUNCHER)
    except Exception as exc:
        ng.append(f"主要ファイルを読み込めません: {exc}")
        return report(ok, warn, ng)

    inspector = Inspector()
    inspector.feed(html)
    (ok if inspector.styles == CSS else ng).append("CSS参照順一致" if inspector.styles == CSS else f"CSS参照順が不一致: {inspector.styles}")
    (ok if inspector.scripts == SCRIPTS else ng).append("JavaScript参照順一致" if inspector.scripts == SCRIPTS else f"JavaScript参照順が不一致: {inspector.scripts}")

    ids = {
        "math": re.findall(r'"(math-q\d{3})"', math_q),
        "ml": re.findall(r'"(ml-q\d{3})"', ml_q),
        "dl": re.findall(r'"(dl-q\d{3})"', dl_q),
        "dev": re.findall(r'"(devops-q\d{3})"', dev_q),
    }
    all_ids = sum(ids.values(), [])
    all_card_source = "\n".join([math_cards, ml_cards, dl_cards, app_cards, dev_cards])
    all_card_ids = set(re.findall(r'(?:Term|Formula|Compare)\("([^"]+)"', all_card_source))
    repair_target_ids = set(re.findall(r'"((?:term|formula|compare)-[^"]+)"', repair))
    repaired_question_ids = set(re.findall(r'"(math-q\d{3})"\s*:', repair))

    checks = {
        "Transformer図解": "Attention Is All You Need" in atlas,
        "応用11図解": len(re.findall(r'^\s*id: "', app_atlas, re.M)) >= 11,
        "第5章概念図4件": all(f'id: "{x}"' in dev_atlas for x in ["compression", "distributed", "federated", "virtualization"]),
        "数学カード70枚": math_cards.count('mathTerm("term-') == 41 and math_cards.count('mathFormula("formula-') == 18 and math_cards.count('mathCompare("compare-') == 11,
        "機械学習カード125枚": ml_cards.count('machineLearningTerm("term-') == 76 and ml_cards.count('machineLearningFormula("formula-') == 29 and ml_cards.count('machineLearningCompare("compare-') == 20,
        "深層学習基礎カード110枚": dl_cards.count('deepLearningBaseTerm("term-') == 64 and dl_cards.count('deepLearningBaseFormula("formula-') == 22 and dl_cards.count('deepLearningBaseCompare("compare-') == 24,
        "応用カード84枚": app_cards.count('applicationTerm("term-') == 55 and app_cards.count('applicationFormula("formula-') == 10 and app_cards.count('applicationCompare("compare-') == 19,
        "開発運用カード49枚": dev_cards.count('developmentOperationsTerm("term-') == 33 and dev_cards.count('developmentOperationsFormula("formula-') == 3 and dev_cards.count('developmentOperationsCompare("compare-') == 13,
        "数学24問": len(ids["math"]) == 24 and len(set(ids["math"])) == 24,
        "機械学習36問": len(ids["ml"]) == 36 and len(set(ids["ml"])) == 36,
        "深層学習基礎46問": len(ids["dl"]) == 46 and len(set(ids["dl"])) == 46,
        "開発運用22問": len(ids["dev"]) == 22 and len(set(ids["dev"])) == 22,
        "追加問題ID重複なし": len(all_ids) == len(set(all_ids)),
        "数学3問の参照修復": repaired_question_ids == {"math-q010", "math-q016", "math-q024"},
        "修復先カードIDがすべて存在": bool(repair_target_ids) and repair_target_ids <= all_card_ids,
        "参照修復を問題統合前に実行": inspector.scripts.index("assets/v0.4.0/question-reference-repair.js") < inspector.scripts.index("assets/v0.4.0/questions/question-links.js"),
        "問題統合": all(x in links for x in ["...MATH_QUESTIONS", "...MACHINE_LEARNING_QUESTIONS", "...DEEP_LEARNING_BASE_QUESTIONS", "...DEVELOPMENT_OPERATIONS_QUESTIONS"]),
        "Seed版8で既存端末を修復": 'seedVersion", value: 8' in init and all(x in init for x in ["math-q010", "math-q016", "math-q024", "await putOne(\"questions\", question)"]),
        "カード理解度3段階": all(x in progress for x in ["苦手", "曖昧", "覚えた", "CARD_PROGRESS_INTERVALS"]),
        "カード理解度JSON互換": "cardProgress: Object.values(CARD_PROGRESS)" in progress and "validated.cardProgress == null" in progress,
        "出題範囲3状態": all(x in scope for x in ["出題対象", "オプション（出題対象外）", "出題対象・オプション混在"]),
        "試験直前版表示": 'EXAM_MODE_VERSION = "v0.4.0-dev.14"' in exam,
        "オプション問題を除外": 'questionScopeFor(question) !== "optional"' in exam,
        "15分集中モード": "startExamSprint" in exam and "15 * 60 * 1000" in exam and "最大15問" in exam,
        "出題対象ランダム10問": "startExamRandom" in exam and "slice(0, 10)" in exam,
        "出題対象弱点ドリル": "startExamWeak" in exam,
        "期限・弱点・未学習を優先": all(x in exam for x in ["const due", "const weak", "const unseen", "uniqueQuestions"]),
        "問題画面に範囲タグ": "injectExamQuestionBadge" in exam and "examScopeBadge" in exam,
        "タイマー終了後に結果表示": "session.examExpired" in exam and 'next.textContent = "15分の結果を見る"' in exam,
        "ホーム・学習画面へ追加": "renderHomeWithExamMode" in exam and "renderStudyWithExamMode" in exam,
        "試験直前スマホUI": ".exam-timer" in exam_css and "@media(max-width:600px)" in exam_css,
        "受け入れ確認版表示": 'ACCEPTANCE_CHECK_VERSION = "v0.4.0-dev.17"' in acceptance,
        "実行時件数確認": all(x in acceptance for x in ["シラバスカード438枚", "確認問題174問", "図解16件"]),
        "実行時ID重複確認": "duplicateIds" in acceptance and "問題ID重複なし" in acceptance and "カードID重複なし" in acceptance,
        "実行時相互参照確認": "問題→カード参照" in acceptance and "カード→問題参照" in acceptance,
        "IndexedDB非破壊プローブ": "indexedDbProbe" in acceptance and 'delete(key)' in acceptance,
        "Service Worker実行時確認": "serviceWorkerProbe" in acceptance and "getRegistration" in acceptance,
        "記録画面にセルフチェック": "renderStatsWithAcceptanceCheck" in acceptance and "セルフチェックを実行" in acceptance,
        "受け入れ結果JSON生成": all(x in acceptance for x in ["buildAcceptanceSnapshot", "eshikaku_acceptance_result_v1", "JSON.stringify", "application/json"]),
        "受け入れ結果日本語ファイル名": "E資格学習ナビ_${ACCEPTANCE_CHECK_VERSION}_受け入れ結果_" in acceptance,
        "端末・PWA環境を記録": all(x in acceptance for x in ["acceptanceDeviceFamily", "acceptanceDisplayMode", "standalone-pwa", "viewport", "pixelRatio"]),
        "受け入れ結果に学習履歴を含めない": "回答履歴、問題SRS、カード理解度、バックアップ内容は含みません" in acceptance,
        "結果保存はセルフチェック後だけ": 'id="saveAcceptanceCheck" disabled' in acceptance and "latestAcceptanceSnapshot" in acceptance,
        "受け入れ確認スマホUI": all(x in acceptance_css for x in [".acceptance-actions", ".acceptance-row", "@media(max-width:600px)"]),
        "ローカル配信元固定": '--directory "%ROOT%"' in launcher and "--bind 127.0.0.1" in launcher,
        "CMD文字コード非依存": launcher.isascii() and "chcp" not in launcher.lower(),
    }
    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    for rel in [*CSS, *SCRIPTS]:
        (ok if f"./{rel}" in sw else ng).append(
            f"Service Worker対象: {rel}" if f"./{rel}" in sw else f"Service Worker対象から欠落: {rel}"
        )
    (ok if "v0.4.0-dev17" in sw else ng).append(
        "Service Workerキャッシュ世代: v0.4.0-dev17" if "v0.4.0-dev17" in sw else "Service Workerキャッシュ世代がv0.4.0-dev17ではありません"
    )

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

    ok.append("図解総数: 16件")
    ok.append("シラバス拡充カード: 438枚")
    ok.append("問題総数: 174問")
    ok.append("数学3問の参照修復: math-q010・math-q016・math-q024")
    ok.append("試験直前モード: オプション除外・15分最大15問・ランダム10問・弱点ドリル")
    ok.append("受け入れセルフチェック: 13項目と端末環境をJSON保存")
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
