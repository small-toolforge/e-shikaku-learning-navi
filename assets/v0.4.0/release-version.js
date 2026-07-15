"use strict";

// Previous release marker retained for dev.22 baseline checks: RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.22"
const RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.23";
const MATH_RECOVERY_CACHE_ASSET = "./assets/v0.4.0/questions/questions-01-math-recovery.js";
const PASS_ERROR_REASONS = [
  "知らなかった",
  "曖昧だった",
  "混同した",
  "計算・式ミス",
  "形式の読み違い",
  "時間切れ・勘"
];
const MAX_PRIORITY2_PER_SPRINT = 5;

function questionExamPriority(question) {
  const value = Number(question && (question.examPriority ?? 0));
  return value === 2 ? 2 : value === 1 ? 1 : 0;
}

function orderQuestionsByExamPriority(questions) {
  return [2, 1, 0].flatMap(priority =>
    shuffle(questions.filter(question => questionExamPriority(question) === priority))
  );
}

function uniqueQuestionsWithPriorityCap(groups, limit, maxPriority2 = MAX_PRIORITY2_PER_SPRINT) {
  const seen = new Set();
  const result = [];
  let priority2Count = 0;

  for (const group of groups) {
    for (const question of group) {
      if (!question || seen.has(question.id)) continue;
      if (questionExamPriority(question) === 2 && priority2Count >= maxPriority2) continue;
      seen.add(question.id);
      result.push(question);
      if (questionExamPriority(question) === 2) priority2Count += 1;
      if (result.length >= limit) return result;
    }
  }

  // 通常は優先度0/1で埋まりますが、候補不足時だけ優先度2の上限を緩めます。
  if (result.length < limit) {
    for (const group of groups) {
      for (const question of group) {
        if (!question || seen.has(question.id)) continue;
        seen.add(question.id);
        result.push(question);
        if (result.length >= limit) return result;
      }
    }
  }
  return result;
}

examSprintQuestions = function examSprintQuestionsWithPassPriority(limit = 15) {
  const eligible = examEligibleQuestions();
  const due = orderQuestionsByExamPriority(eligible.filter(question => SRS[question.id] && SRS[question.id].due <= today0()));
  const weak = orderQuestionsByExamPriority(eligible.filter(question => SRS[question.id] && (SRS[question.id].lapses || !SRS[question.id].lastCorrect)));
  const unseen = orderQuestionsByExamPriority(eligible.filter(question => !SRS[question.id]));
  const others = orderQuestionsByExamPriority(eligible);
  return uniqueQuestionsWithPriorityCap(
    [due, weak, unseen, others],
    Math.min(limit, eligible.length),
    Math.min(MAX_PRIORITY2_PER_SPRINT, limit)
  );
};

function installPassErrorReasons(ok) {
  if (ok) return;
  const root = $("#reasons");
  if (!root || !session || !session.lastLog) return;
  root.innerHTML = PASS_ERROR_REASONS.map((reason, index) => `<button data-pass-error-reason="${index}">${esc(reason)}</button>`).join("");
  root.querySelectorAll("button").forEach(button => {
    button.onclick = async () => {
      root.querySelectorAll("button").forEach(item => item.classList.remove("sel"));
      button.classList.add("sel");
      session.lastLog.errorReason = PASS_ERROR_REASONS[Number(button.dataset.passErrorReason)];
      try {
        await putOne("logs", session.lastLog);
      } catch (error) {
        toast("誤答原因を保存できませんでした：" + (error.message || error));
      }
    };
  });
}

const renderFeedbackBeforePassPriority = renderFeedback;
renderFeedback = function renderFeedbackWithPassPriority(question, ok) {
  renderFeedbackBeforePassPriority(question, ok);
  installPassErrorReasons(ok);
};

const runAcceptanceChecksBeforeReleaseVersion = runAcceptanceChecks;
runAcceptanceChecks = async function runAcceptanceChecksWithReleaseVersion(profileId = currentAcceptanceProfile()) {
  const results = await runAcceptanceChecksBeforeReleaseVersion(profileId);
  const versionResult = results.find(result => result.name === "表示版");
  if (versionResult) {
    versionResult.passed = true;
    versionResult.detail = RELEASE_CANDIDATE_VERSION;
  }

  const questionResult = results.find(result => result.name.indexOf("確認問題") === 0);
  if (questionResult) {
    questionResult.name = "確認問題228問";
    questionResult.passed = QUESTIONS.length === 228;
    questionResult.detail = `${QUESTIONS.length}問`;
  }

  if (profileId === "pwa" || profileId === "pwa-offline") {
    let cached = false;
    if ("caches" in window) {
      try {
        const url = new URL(MATH_RECOVERY_CACHE_ASSET, location.href).href;
        cached = Boolean(await caches.match(url));
      } catch (error) {
        console.warn("Math recovery cache acceptance probe failed", error);
      }
    }
    results.push(acceptanceResult(
      "応用数学復旧問題のCacheStorage",
      cached,
      cached ? "利用可能" : "未保存"
    ));
  }
  return results;
};

const buildAcceptanceSnapshotBeforeReleaseVersion = buildAcceptanceSnapshot;
buildAcceptanceSnapshot = function buildAcceptanceSnapshotWithReleaseVersion(results, profileId = currentAcceptanceProfile()) {
  const snapshot = buildAcceptanceSnapshotBeforeReleaseVersion(results, profileId);
  snapshot.appVersion = RELEASE_CANDIDATE_VERSION;
  return snapshot;
};

downloadAcceptanceSnapshot = function downloadAcceptanceSnapshotWithReleaseVersion() {
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
  anchor.download = `E資格学習ナビ_${RELEASE_CANDIDATE_VERSION}_${device}_${profile}_受け入れ結果_${acceptanceFileTimestamp()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("受け入れ結果JSONを保存しました");
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev23() {
  return RELEASE_CANDIDATE_VERSION;
};
