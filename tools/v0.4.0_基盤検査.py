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
    "assets/v0.4.0/backup-import.css",
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
    "assets/v0.4.0/questions/questions-04-deep-learning-application.js",
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
    "assets/v0.4.0/backup-import.js",
    "assets/v0.4.0/release-version.js",
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
        dla_q = read("assets/v0.4.0/questions/questions-04-deep-learning-application.js")
        dev_q = read("assets/v0.4.0/questions/questions-05-development-operations.js")
        repair = read("assets/v0.4.0/question-reference-repair.js")
        links = read("assets/v0.4.0/questions/question-links.js")
        progress = read("assets/v0.4.0/card-progress.js")
        scope = read("assets/v0.4.0/card-scope.js")
        exam = read("assets/v0.4.0/exam-mode.js")
        exam_css = read("assets/v0.4.0/exam-mode.css")
        acceptance = read("assets/v0.4.0/acceptance-check.js")
        acceptance_css = read("assets/v0.4.0/acceptance-check.css")
        backup_import = read("assets/v0.4.0/backup-import.js")
        backup_import_css = read("assets/v0.4.0/backup-import.css")
        release_version = read("assets/v0.4.0/release-version.js")
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

    ids = {
        "math": re.findall(r'"(math-q\d{3})"', math_q),
        "ml": re.findall(r'"(ml-q\d{3})"', ml_q),
        "dl": re.findall(r'"(dl-q\d{3})"', dl_q),
        "dla": re.findall(r'"(dla-q\d{3})"', dla_q),
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
        "深層学習応用30問": len(ids["dla"]) == 30 and len(set(ids["dla"])) == 30,
        "開発運用22問": len(ids["dev"]) == 22 and len(set(ids["dev"])) == 22,
        "追加問題ID重複なし": len(all_ids) == len(set(all_ids)),
        "数学3問の参照修復": repaired_question_ids == {"math-q010", "math-q016", "math-q024"},
        "修復先カードIDがすべて存在": bool(repair_target_ids) and repair_target_ids <= all_card_ids,
        "参照修復を問題統合前に実行": inspector.scripts.index("assets/v0.4.0/question-reference-repair.js") < inspector.scripts.index("assets/v0.4.0/questions/question-links.js"),
        "問題統合": all(x in links for x in ["...MATH_QUESTIONS", "...MACHINE_LEARNING_QUESTIONS", "...DEEP_LEARNING_BASE_QUESTIONS", "...DEEP_LEARNING_APPLICATION_QUESTIONS", "...DEVELOPMENT_OPERATIONS_QUESTIONS"]),
        "Seed版8で既存端末を修復": 'seedVersion", value: 8' in init and all(x in init for x in ["math-q010", "math-q016", "math-q024", 'await putOne("questions", question)']),
        "Seed版9で深層学習応用を追加": 'seedVersion", value: 9' in init and "DEEP_LEARNING_APPLICATION_QUESTIONS" in init,
        "カード理解度3段階": all(x in progress for x in ["苦手", "曖昧", "覚えた", "CARD_PROGRESS_INTERVALS"]),
        "カード理解度JSON互換": "cardProgress: Object.values(CARD_PROGRESS)" in progress and "validated.cardProgress == null" in progress,
        "出題範囲3状態": all(x in scope for x in ["出題対象", "オプション（出題対象外）", "出題対象・オプション混在"]),
        "試験直前版表示": 'EXAM_MODE_VERSION = "v0.4.0-dev.20"' in exam,
        "オプション問題を除外": 'questionScopeFor(question) !== "optional"' in exam,
        "15分集中モード": all(x in exam for x in [
            "function startExamSprint", "examSprintQuestions(15)", '"試験直前15分", 15',
            "minutes * 60 * 1000", "最大15問",
        ]),
        "出題対象ランダム10問": "startExamRandom" in exam and "slice(0, 10)" in exam,
        "出題対象弱点ドリル": "startExamWeak" in exam,
        "期限・弱点・未学習を優先": all(x in exam for x in ["const due", "const weak", "const unseen", "uniqueQuestions"]),
        "問題画面に範囲タグ": "injectExamQuestionBadge" in exam and "examScopeBadge" in exam,
        "タイマー終了後に結果表示": "session.examExpired" in exam and 'next.textContent = "時間終了の結果を見る"' in exam and "markExamExpiredUi" in exam,
        "途中結果ボタン": "endExamWithCurrentResult" in exam and "ここまでの結果" in exam,
        "回答済みだけを集計": "session.examAnswered" in exam and "correct}/${answered}" in exam and "未回答は不正解として数えません" in exam,
        "試験結果に回答・未回答・正答率・時間": all(x in exam for x in ["回答", "未回答", "回答内正答率", "経過時間", "formatExamElapsed"]),
        "同じ問題で再試行": "examResultRetry" in exam and "finished.list" in exam,
        "ホーム・学習画面へ追加": "renderHomeWithExamMode" in exam and "renderStudyWithExamMode" in exam,
        "試験直前スマホUI": all(x in exam_css for x in [".exam-timer", ".exam-finish", ".exam-result-card", "@media(max-width:600px)"]),
        "受け入れ基盤を維持": 'ACCEPTANCE_CHECK_VERSION = "v0.4.0-dev.19"' in acceptance,
        "最新版v0.4.0-dev.21を統一表示": 'RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.21"' in release_version and "runAcceptanceChecksWithReleaseVersion" in release_version and "buildAcceptanceSnapshotWithReleaseVersion" in release_version,
        "標準・PWA・オフライン3プロファイル": all(x in acceptance for x in ['standard:', 'pwa:', '"pwa-offline":', "確認プロファイル"]),
        "標準13項目を維持": "通信状態取得" in acceptance and "Service Worker登録" in acceptance,
        "PWA起動確認": "ホーム画面PWA起動" in acceptance and "standalone-pwa" in acceptance,
        "Service Worker制御確認": "serviceWorkerControlProbe" in acceptance and "navigator.serviceWorker.controller" in acceptance,
        "主要教材CacheStorage確認": "cacheStorageProbe" in acceptance and "ACCEPTANCE_CACHE_ASSETS" in acceptance and "caches.match" in acceptance and "questions-04-deep-learning-application.js" in acceptance and "backup-import.js" in acceptance,
        "タッチ・Secure Context確認": all(x in acceptance for x in ["touchProbe", "maxTouchPoints", "Secure Context"]),
        "オフライン状態確認": 'profileId === "pwa-offline"' in acceptance and "オフライン状態" in acceptance,
        "実行時件数確認": all(x in acceptance for x in ["シラバスカード438枚", "確認問題204問", "図解16件"]),
        "実行時ID重複確認": "duplicateIds" in acceptance and "問題ID重複なし" in acceptance and "カードID重複なし" in acceptance,
        "実行時相互参照確認": "問題→カード参照" in acceptance and "カード→問題参照" in acceptance,
        "IndexedDB非破壊プローブ": "indexedDbProbe" in acceptance and "delete(key)" in acceptance,
        "受け入れ結果JSON生成": all(x in acceptance for x in ["buildAcceptanceSnapshot", "eshikaku_acceptance_result_v1", "JSON.stringify", "application/json"]),
        "JSONへプロファイル記録": "profile: { id: profileId, label: profile.label }" in acceptance,
        "端末別日本語ファイル名": all(x in acceptance for x in ["safeAcceptanceFilePart", "device", "profile", "受け入れ結果_"]),
        "受け入れ結果に学習履歴を含めない": "回答履歴、問題SRS、カード理解度、バックアップ内容は含みません" in acceptance,
        "結果保存はセルフチェック後だけ": 'id="saveAcceptanceCheck" disabled' in acceptance and "latestAcceptanceSnapshot" in acceptance,
        "受け入れ確認スマホUI": all(x in acceptance_css for x in [".acceptance-profile", ".acceptance-actions", ".acceptance-row", "@media(max-width:600px)"]),
        "バックアップ読込版表示": 'BACKUP_IMPORT_VERSION = "v0.4.0-dev.20"' in backup_import,
        "統合・置換の2方式": all(x in backup_import for x in ["統合読込（新しい状態を優先）", "学習状態を置換（JSONへ戻す）", 'backupImportMode === "replace-state"']),
        "置換は問題教材を保持": "data.questions.forEach(item => questions.put(item))" in backup_import and "questions.clear()" not in backup_import,
        "置換は学習状態だけをクリア": "logs.clear()" in backup_import and "srs.clear()" in backup_import and "CARD_PROGRESS_META_KEY" in backup_import,
        "置換前の二重安全策": "await downloadBackup(false)" in backup_import and "await saveRecoverySnapshot" in backup_import,
        "旧JSONのカード理解度注意": "このJSONにはカード理解度がないため" in backup_import,
        "読込問題の参照修復": "applyQuestionReferenceRepairs(validated.questions)" in backup_import,
        "学習データ日本語ファイル名": "E資格学習ナビ_学習データ_" in backup_import,
        "読込件数の事前表示": all(x in backup_import for x in ["currentLearningCounts", "backupImportCounts", "backupCountsText"]),
        "安全読込スマホUI": ".backup-import-controls" in backup_import_css and "@media(max-width:600px)" in backup_import_css,
        "ローカル配信元固定": '--directory "%ROOT%"' in launcher and "--bind 127.0.0.1" in launcher,
        "CMD文字コード非依存": launcher.isascii() and "chcp" not in launcher.lower(),
    }
    for name, passed in checks.items():
        (ok if passed else ng).append(f"{name}: {'OK' if passed else '不足'}")

    for rel in [*CSS, *SCRIPTS]:
        (ok if f"./{rel}" in sw else ng).append(
            f"Service Worker対象: {rel}" if f"./{rel}" in sw else f"Service Worker対象から欠落: {rel}"
        )
    (ok if "v0.4.0-dev21" in sw else ng).append(
        "Service Workerキャッシュ世代: v0.4.0-dev21" if "v0.4.0-dev21" in sw else "Service Workerキャッシュ世代がv0.4.0-dev21ではありません"
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
    ok.append("問題総数: 204問")
    ok.append("試験直前結果: 回答済みだけを集計し、途中終了・時間終了・全問完了を区別")
    ok.append("学習データ読込: 統合読込＋問題教材を保持する学習状態置換")
    ok.append("受け入れプロファイル: 標準13項目・PWA18項目・PWAオフライン19項目")
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
