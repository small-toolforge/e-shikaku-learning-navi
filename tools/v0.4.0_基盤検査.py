#!/usr/bin/env python3
"""E資格 学習ナビ v0.4.0 図解・カード・確認問題・カード復習の静的検査。"""
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
        if (ROOT / rel).exists():
            ok.append(f"存在: {rel}")
        else:
            ng.append(f"必須ファイルがありません: {rel}")

    try:
        html = read("index.html")
        sw = read("sw.js")
        data = read("assets/v0.4.0/atlas-data.js")
        ui = read("assets/v0.4.0/atlas-ui.js")
        application_data = read("assets/v0.4.0/application-atlas-data.js")
        application_ui = read("assets/v0.4.0/application-atlas-ui.js")
        application_css = read("assets/v0.4.0/application-atlas.css")
        development_atlas_data = read("assets/v0.4.0/development-atlas-data.js")
        development_atlas_ui = read("assets/v0.4.0/development-atlas-ui.js")
        application_cards = read("assets/v0.4.0/cards/cards-04-deep-learning-application.js")
        math_cards = read("assets/v0.4.0/cards/cards-01-math.js")
        machine_learning_cards = read("assets/v0.4.0/cards/cards-02-machine-learning.js")
        deep_learning_base_cards = read("assets/v0.4.0/cards/cards-03-deep-learning-base.js")
        development_operations_cards = read("assets/v0.4.0/cards/cards-05-development-operations.js")
        math_questions = read("assets/v0.4.0/questions/questions-01-math.js")
        machine_learning_questions = read("assets/v0.4.0/questions/questions-02-machine-learning.js")
        deep_learning_questions = read("assets/v0.4.0/questions/questions-03-deep-learning-base.js")
        development_operations_questions = read("assets/v0.4.0/questions/questions-05-development-operations.js")
        question_links = read("assets/v0.4.0/questions/question-links.js")
        cards_ui = read("assets/v0.4.0/cards/cards-ui.js")
        cards_css = read("assets/v0.4.0/cards/cards.css")
        card_progress = read("assets/v0.4.0/card-progress.js")
        card_progress_css = read("assets/v0.4.0/card-progress.css")
        card_scope = read("assets/v0.4.0/card-scope.js")
        card_scope_css = read("assets/v0.4.0/card-scope.css")
        segment_defaults = read("assets/v0.4.0/atlas-segment-defaults.js")
        init = read("assets/v0.3.1/app-init.js")
        launcher = read(LOCAL_LAUNCHER)
    except Exception as exc:
        ng.append(f"主要ファイルを読み込めません: {exc}")
        return report(ok, warn, ng)

    inspector = Inspector()
    inspector.feed(html)
    (ok if inspector.styles == CSS else ng).append(
        "CSS参照順一致" if inspector.styles == CSS else f"CSS参照順が不一致: {inspector.styles}"
    )
    (ok if inspector.scripts == SCRIPTS else ng).append(
        "JavaScript参照順一致" if inspector.scripts == SCRIPTS else f"JavaScript参照順が不一致: {inspector.scripts}"
    )

    application_ids = [
        "resnet", "vision-transformer", "detection", "segmentation", "word-embedding",
        "llm", "speech", "generative", "deep-rl", "learning-methods", "xai",
    ]
    development_ids = ["compression", "distributed", "federated", "virtualization"]
    expected_deep_syllabus_ids = [
        "3-1-1", "3-1-2", "3-1-3", "3-1-4", "3-2-1", "3-2-2", "3-2-3", "3-2-4",
        "3-3-1", "3-3-2", "3-3-3", "3-4-1", "3-4-2", "3-4-3", "3-5-1", "3-5-2",
        "3-5-3", "3-6-1", "3-7-1", "3-7-2", "3-7-3", "3-7-4", "3-7-5",
    ]
    expected_devops_counts = {"5-1-1": 6, "5-2-1": 4, "5-2-2": 4, "5-3-1": 4, "5-4-1": 4}

    math_question_ids = re.findall(r'"(math-q\d{3})"', math_questions)
    machine_learning_question_ids = re.findall(r'"(ml-q\d{3})"', machine_learning_questions)
    deep_learning_question_ids = re.findall(r'"(dl-q\d{3})"', deep_learning_questions)
    development_operations_question_ids = re.findall(r'"(devops-q\d{3})"', development_operations_questions)
    all_new_question_ids = (
        math_question_ids + machine_learning_question_ids + deep_learning_question_ids
        + development_operations_question_ids
    )
    deep_syllabus_coverage = all(
        deep_learning_questions.count(f'"{item_id}"') == 2 for item_id in expected_deep_syllabus_ids
    )
    devops_syllabus_coverage = all(
        development_operations_questions.count(f'"{item_id}"') == count
        for item_id, count in expected_devops_counts.items()
    )

    checks = {
        "Transformerアトラス版表示": 'ATLAS_VERSION = "v0.4.0-dev.1"' in data,
        "応用アトラス版表示": 'APPLICATION_ATLAS_VERSION = "v0.4.0-dev.2"' in application_data,
        "第5章概念図版表示": 'DEVELOPMENT_ATLAS_VERSION = "v0.4.0-dev.11"' in development_atlas_data,
        "カード復習版表示": 'CARD_PROGRESS_VERSION = "v0.4.0-dev.12"' in card_progress,
        "出題範囲版表示": 'CARD_SCOPE_VERSION = "v0.4.0-dev.13"' in card_scope,
        "数学カード版表示": 'MATH_CARDS_VERSION = "v0.4.0-dev.4"' in math_cards,
        "機械学習カード版表示": 'MACHINE_LEARNING_CARDS_VERSION = "v0.4.0-dev.5"' in machine_learning_cards,
        "深層学習基礎カード版表示": 'DEEP_LEARNING_BASE_CARDS_VERSION = "v0.4.0-dev.7"' in deep_learning_base_cards,
        "開発運用カード版表示": 'DEVELOPMENT_OPERATIONS_CARDS_VERSION = "v0.4.0-dev.9"' in development_operations_cards,
        "問題セット版表示": 'QUESTION_SET_VERSION = "v0.4.0-dev.10"' in question_links,
        "Transformer原典": "Attention Is All You Need" in data,
        "Transformer図解ノード": "TRANSFORMER_NODES" in data and data.count("segment:") >= 16,
        "Transformer確認問題3問": data.count('id: "atlas-transformer-00') == 3,
        "シラバス索引": "SYLLABUS_INDEX" in data and data.count("syllabusItem(") >= 50,
        "論文図解タブ": 'button.textContent = "論文図解"' in ui,
        "スマホ分割表示": all(x in ui for x in ['data-segment="all"', 'data-segment="encoder"', 'data-segment="decoder"']),
        "分割時の解説初期値": "maskedAttention" in segment_defaults and "selfAttention" in segment_defaults,
        "応用11図解": all(f'id: "{atlas_id}"' in application_data for atlas_id in application_ids),
        "第5章概念図4件": all(f'id: "{atlas_id}"' in development_atlas_data for atlas_id in development_ids),
        "第5章概念図ノード": development_atlas_data.count("applicationNode(") >= 30,
        "第5章概念図をアトラスへ追加": "APPLICATION_ATLASES.push(...DEVELOPMENT_ATLASES)" in development_atlas_data,
        "第5章カードから概念図へ接続": "DEVELOPMENT_ATLAS_BY_SYLLABUS" in development_atlas_data and "card.atlasId = atlasId" in development_atlas_data,
        "第5章索引から概念図へ接続": all(item_id in development_atlas_ui for item_id in ["5-1-1", "5-2-1", "5-2-2", "5-4-1"]),
        "全16図解表示": "全16図解" in development_atlas_ui,
        "第5章公式資料表示": "公式資料" in development_atlas_ui and "代表論文" in development_atlas_ui,
        "応用確認問題28問": application_data.count('applicationQuestion("app-') == 28,
        "応用図解選択UI": "applicationAtlasSelect" in application_ui and "renderApplicationAtlas" in application_ui,
        "応用SVGノード解説": "applicationDiagramSvg" in application_ui and "applicationNodeExplanation" in application_ui,
        "スマホ向け日本語ノード選択": "data-application-node-button" in application_ui and ".application-node-buttons" in application_css,
        "応用問題の間隔反復接続": "startSession(" in application_ui and "APPLICATION_QUESTIONS" in init,
        "数学用語カード41枚": math_cards.count('mathTerm("term-') == 41,
        "数学数式カード18枚": math_cards.count('mathFormula("formula-') == 18,
        "数学比較カード11枚": math_cards.count('mathCompare("compare-') == 11,
        "機械学習用語カード76枚": machine_learning_cards.count('machineLearningTerm("term-') == 76,
        "機械学習数式カード29枚": machine_learning_cards.count('machineLearningFormula("formula-') == 29,
        "機械学習比較カード20枚": machine_learning_cards.count('machineLearningCompare("compare-') == 20,
        "深層学習基礎用語カード64枚": deep_learning_base_cards.count('deepLearningBaseTerm("term-') == 64,
        "深層学習基礎数式カード22枚": deep_learning_base_cards.count('deepLearningBaseFormula("formula-') == 22,
        "深層学習基礎比較カード24枚": deep_learning_base_cards.count('deepLearningBaseCompare("compare-') == 24,
        "開発運用用語カード33枚": development_operations_cards.count('developmentOperationsTerm("term-') == 33,
        "開発運用数式カード3枚": development_operations_cards.count('developmentOperationsFormula("formula-') == 3,
        "開発運用比較カード13枚": development_operations_cards.count('developmentOperationsCompare("compare-') == 13,
        "数学確認問題24問": len(math_question_ids) == 24 and len(set(math_question_ids)) == 24,
        "機械学習確認問題36問": len(machine_learning_question_ids) == 36 and len(set(machine_learning_question_ids)) == 36,
        "深層学習基礎確認問題46問": len(deep_learning_question_ids) == 46 and len(set(deep_learning_question_ids)) == 46,
        "深層学習基礎23項目を各2問": deep_syllabus_coverage,
        "開発運用確認問題22問": len(development_operations_question_ids) == 22 and len(set(development_operations_question_ids)) == 22,
        "開発運用5項目の配分": devops_syllabus_coverage,
        "追加問題ID重複なし": len(all_new_question_ids) == len(set(all_new_question_ids)),
        "問題は4択": all([
            math_questions.count('["') >= 24,
            machine_learning_questions.count('["') >= 36,
            deep_learning_questions.count('["') >= 46,
            development_operations_questions.count('["') >= 22,
        ]),
        "問題とカードの相互接続": "findSyllabusCardById" in question_links and "card.questionIds.push" in question_links,
        "1・2・3・5章問題を統合": all(x in question_links for x in [
            "...MATH_QUESTIONS", "...MACHINE_LEARNING_QUESTIONS", "...DEEP_LEARNING_BASE_QUESTIONS",
            "...DEVELOPMENT_OPERATIONS_QUESTIONS",
        ]),
        "追加問題Seed版7": 'version < 7' in init and "SYLLABUS_QUESTIONS" in init and 'seedVersion", value: 7' in init,
        "カード横断検索": "syllabusCardSearch" in cards_ui and "syllabusCardText" in cards_ui,
        "カード章・分野フィルター": all(x in cards_ui for x in ["syllabusCardMajor", "syllabusCardGroup"]),
        "カードから図解・問題へ接続": "data-card-atlas" in cards_ui and "data-card-questions" in cards_ui,
        "カード英語読み上げ": "SpeechSynthesisUtterance" in cards_ui,
        "カードスマホ1列表示": "grid-template-columns:1fr" in cards_css,
        "カード理解度3段階": all(x in card_progress for x in ['"weak"', '"unsure"', '"mastered"', "苦手", "曖昧", "覚えた"]),
        "カード間隔反復": "CARD_PROGRESS_INTERVALS = [3, 7, 14, 30, 60, 90]" in card_progress and "dueAt" in card_progress,
        "カード復習対象フィルター": "syllabusCardDueOnly" in card_progress and "本日のカード復習" in card_progress,
        "カード状態別フィルター": "syllabusCardProgressFilter" in card_progress and "すべての状態" in card_progress,
        "カード理解度をIndexedDBへ保存": 'CARD_PROGRESS_META_KEY = "cardProgress"' in card_progress and 'putOne("meta"' in card_progress,
        "カード理解度をJSONバックアップ": "cardProgress: Object.values(CARD_PROGRESS)" in card_progress,
        "旧バックアップ互換": "validated.cardProgress == null" in card_progress,
        "カード理解度の統合復元": "mergeBackupDataWithCardProgress" in card_progress and "updatedAt > current.updatedAt" in card_progress,
        "カード理解度の置換復元": "replaceLearningDataWithCardProgress" in card_progress,
        "履歴削除へカード理解度を含む": "clearHistoryAndCardProgressAtomic" in card_progress and 'delete(CARD_PROGRESS_META_KEY)' in card_progress,
        "記録画面にカード集計": "カード理解度" in card_progress and "本日復習" in card_progress,
        "カード理解度スマホUI": ".card-progress-buttons" in card_progress_css and "@media(max-width:600px)" in card_progress_css,
        "出題範囲3状態": all(x in card_scope for x in ["出題対象", "オプション（出題対象外）", "出題対象・オプション混在"]),
        "出題範囲フィルター": "syllabusCardScopeFilter" in card_scope and "すべて表示" in card_scope,
        "オプション小項目対応": "OPTIONAL_WHOLE_SYLLABUS_IDS" in card_scope and '"5-1-1"' in card_scope and '"2-1-10"' in card_scope,
        "混在小項目を安全側表示": "MIXED_SCOPE_SYLLABUS_IDS" in card_scope and '"4-4-2"' in card_scope,
        "出題範囲スマホUI": ".card-scope-filter-row" in card_scope_css and "@media(max-width:600px)" in card_scope_css,
        "最新表示v0.4.0-dev.13": "currentCardsDisplayVersionDev13" in card_scope,
        "索引検索": "atlasSearch" in ui and "renderSyllabusIndex" in ui,
        "ローカル確認の配信元固定": '--directory "%ROOT%"' in launcher,
        "ローカル確認の端末内限定": "--bind 127.0.0.1" in launcher,
        "ローカル確認CMDはASCIIのみ": launcher.isascii(),
        "ローカル確認CMDはchcp非依存": "chcp" not in launcher.lower(),
        "Anaconda候補を自動検出": "anaconda3\\python.exe" in launcher and "miniconda3\\python.exe" in launcher,
    }
    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    for rel in [*CSS, *SCRIPTS]:
        asset = f"./{rel}"
        if asset in sw:
            ok.append(f"Service Worker対象: {rel}")
        else:
            ng.append(f"Service Worker対象から欠落: {rel}")
    if "v0.4.0-dev13" in sw:
        ok.append("Service Workerキャッシュ世代: v0.4.0-dev13")
    else:
        ng.append("Service Workerキャッシュ世代がv0.4.0-dev13ではありません")

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
    content_size = sum(len(text.encode()) for text in [
        data, ui, application_data, application_ui, development_atlas_data, development_atlas_ui,
        segment_defaults, application_cards, math_cards, machine_learning_cards,
        deep_learning_base_cards, development_operations_cards, math_questions,
        machine_learning_questions, deep_learning_questions, development_operations_questions,
        question_links, cards_ui, cards_css, card_progress, card_progress_css, card_scope, card_scope_css,
    ]) // 1024
    ok.append(f"シラバス索引項目: {index_count}件")
    ok.append("図解総数: 16件（Transformer1＋応用11＋開発運用4）")
    ok.append("追加カード: 438枚（数学70枚＋機械学習125枚＋深層学習基礎110枚＋応用84枚＋開発運用49枚）")
    ok.append("追加確認問題: 156問（応用28問＋数学24問＋機械学習36問＋深層学習基礎46問＋開発運用22問）")
    ok.append("問題総数: 174問（既存15問＋Transformer3問＋追加156問）")
    ok.append("カード理解度: 苦手0日・曖昧1日・覚えた3→7→14→30→60→90日")
    ok.append("出題範囲表示: 出題対象・オプション・混在の3状態")
    ok.append(f"追加教材サイズ: {content_size}KB")
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
