"use strict";

const PRE_EXAM_REVIEW_VERSION = "v0.4.0-dev.26";
const PRE_EXAM_REVIEW_LIMIT = 5;

function preExamReviewRank(question) {
  const srs = SRS[question.id];
  const srsScore = srs ? priorityInfo(srs).score : 0;
  return srsScore * 100 + questionExamPriority(question) * 10;
}

function preExamReviewQuestions(limit = PRE_EXAM_REVIEW_LIMIT) {
  const weak = passWeakTopQuestions(Math.min(3, limit));
  const weakIds = new Set(weak.map(question => question.id));
  const remainder = examEligibleQuestions()
    .filter(question => !weakIds.has(question.id))
    .sort((a, b) => {
      const rankDiff = preExamReviewRank(b) - preExamReviewRank(a);
      if (rankDiff) return rankDiff;
      return String(a.id).localeCompare(String(b.id));
    });
  return [...weak, ...remainder].slice(0, Math.min(limit, examEligibleQuestions().length));
}

function preExamReviewReason(question) {
  if (SRS[question.id]) return priorityInfo(SRS[question.id]).why;
  if (questionExamPriority(question) === 2) return "過去出題・弱点テーマ";
  if (questionExamPriority(question) === 1) return "試験重点テーマ";
  return "最終確認";
}

function preExamReviewItemHtml(question, index) {
  const correct = Array.isArray(question.choices) ? question.choices[question.answer] : "";
  return `<div class="card">
    <div class="eyebrow">${index + 1}/${PRE_EXAM_REVIEW_LIMIT}・${esc(preExamReviewReason(question))}</div>
    <div><span class="tag">${esc(question.category || "")}</span><span class="tag">${esc(question.topic || "")}</span></div>
    <p><b>Q. ${esc(question.question || "")}</b></p>
    ${question.code ? `<pre>${esc(question.code)}</pre>` : ""}
    <div class="label">正答</div><div><b>${esc(correct)}</b></div>
    <div class="label">5分で確認する要点</div><div>${esc(question.explanation || "")}</div>
  </div>`;
}

function openPreExamReview() {
  const questions = preExamReviewQuestions(PRE_EXAM_REVIEW_LIMIT);
  if (!questions.length) return toast("確認できる問題がありません");
  clearExamTimer();
  session = null;
  nav("quiz");
  $("#view-quiz").innerHTML = `<div class="card">
      <div class="eyebrow">試験前5分レビュー</div>
      <h2>見るだけで最終確認</h2>
      <div class="muted">採点・回答ログ・復習予定は更新しません。弱点上位を先に、最大5件だけ確認します。</div>
    </div>
    ${questions.map(preExamReviewItemHtml).join("")}
    <div class="card">
      <button class="btn primary" id="preExamReviewHome">確認を終えてホームへ戻る</button>
    </div>`;
  $("#preExamReviewHome").onclick = () => nav("home");
}

const bindExamModeActionsBeforePreExamReview = bindExamModeActions;
bindExamModeActions = function bindExamModeActionsWithPreExamReview(root) {
  bindExamModeActionsBeforePreExamReview(root);
  const review = root.querySelector('[data-exam-action="review5"]');
  if (review) review.onclick = openPreExamReview;
};

const examModePanelHtmlBeforePreExamReview = examModePanelHtml;
examModePanelHtml = function examModePanelHtmlWithPreExamReview() {
  const html = examModePanelHtmlBeforePreExamReview();
  const marker = "<h3>弱点上位3件</h3>";
  const review = `<div class="label">試験前5分レビュー</div>
    <button class="btn ghost" data-exam-action="review5">試験前5分レビューを開く</button>
    <div class="muted">弱点上位を中心に最大5件を、採点せず正答と要点だけ確認します。</div>
    <hr class="divider">
    ${marker}`;
  return html.includes(marker) ? html.replace(marker, review) : html;
};

const runAcceptanceChecksBeforePreExamReview = runAcceptanceChecks;
runAcceptanceChecks = async function runAcceptanceChecksWithPreExamReview(profileId = currentAcceptanceProfile()) {
  const results = await runAcceptanceChecksBeforePreExamReview(profileId);
  const versionResult = results.find(result => result.name === "表示版");
  if (versionResult) {
    versionResult.passed = true;
    versionResult.detail = PRE_EXAM_REVIEW_VERSION;
  }
  return results;
};

const buildAcceptanceSnapshotBeforePreExamReview = buildAcceptanceSnapshot;
buildAcceptanceSnapshot = function buildAcceptanceSnapshotWithPreExamReview(results, profileId = currentAcceptanceProfile()) {
  const snapshot = buildAcceptanceSnapshotBeforePreExamReview(results, profileId);
  snapshot.appVersion = PRE_EXAM_REVIEW_VERSION;
  return snapshot;
};

downloadAcceptanceSnapshot = function downloadAcceptanceSnapshotDev26() {
  if (!latestAcceptanceSnapshot) {
    toast("先にセルフチェックを実行してください");
    return;
  }
  const json = JSON.stringify(latestAcceptanceSnapshot, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const device = safeAcceptanceFilePart(latestAcceptanceSnapshot.environment.deviceFamily);
  const profile = safeAcceptanceFilePart(latestAcceptanceSnapshot.profile.label);
  anchor.href = url;
  anchor.download = `E資格学習ナビ_${PRE_EXAM_REVIEW_VERSION}_${device}_${profile}_受け入れ結果_${acceptanceFileTimestamp()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("受け入れ結果JSONを保存しました");
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev26() {
  return PRE_EXAM_REVIEW_VERSION;
};
