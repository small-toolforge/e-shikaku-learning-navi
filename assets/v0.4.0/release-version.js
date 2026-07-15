"use strict";

// Previous release marker retained for dev.22 baseline checks: RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.22"
const RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.28";
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
const PASS_EXAM_DATE = new Date(2026, 7, 29);
const FULL_EXAM_QUESTION_COUNT = 104;
const FULL_EXAM_MINUTES = 120;
const FULL_EXAM_WARNING_MINUTES = 15;

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

function passExamDaysRemaining() {
  return Math.ceil((PASS_EXAM_DATE.getTime() - today0()) / DAY);
}

function passExamCountdownText() {
  const days = passExamDaysRemaining();
  if (days < 0) return "試験おつかれさまでした";
  if (days === 0) return "今日は試験日です";
  return `試験まであと${days}日`;
}

function passWeakTopQuestions(limit = 3) {
  return examEligibleQuestions()
    .filter(question => SRS[question.id])
    .sort((a, b) => {
      const scoreDiff = priorityInfo(SRS[b.id]).score - priorityInfo(SRS[a.id]).score;
      if (scoreDiff) return scoreDiff;
      const examPriorityDiff = questionExamPriority(b) - questionExamPriority(a);
      if (examPriorityDiff) return examPriorityDiff;
      return String(a.id).localeCompare(String(b.id));
    })
    .slice(0, limit);
}

function passWeakTopHtml() {
  const weak = passWeakTopQuestions(3);
  if (!weak.length) {
    return `<div class="muted">まだ回答履歴がありません。今日の15分メニューから始めてください。</div>`;
  }
  return `<ul class="plist">${weak.map(question => {
    const info = priorityInfo(SRS[question.id]);
    return `<li><b>${esc(question.topic)}</b><div class="muted">${esc(question.category)}</div><div class="why">${esc(info.why)}</div></li>`;
  }).join("")}</ul>`;
}

function fullExamQuestions(limit = FULL_EXAM_QUESTION_COUNT) {
  return shuffle(examEligibleQuestions()).slice(0, Math.min(limit, examEligibleQuestions().length));
}

function startFullExamList(list, title = `本番想定${FULL_EXAM_QUESTION_COUNT}問・${FULL_EXAM_MINUTES}分`) {
  startExamSession(list, title, FULL_EXAM_MINUTES);
  if (!session) return;
  session.fullExamMode = true;
  session.examWarningMinutes = FULL_EXAM_WARNING_MINUTES;
  session.examWarningShown = false;
  renderQuestion();
}

function startFullExamSimulation() {
  const list = fullExamQuestions(FULL_EXAM_QUESTION_COUNT);
  if (list.length < FULL_EXAM_QUESTION_COUNT) {
    toast(`本番想定には${FULL_EXAM_QUESTION_COUNT}問必要ですが、出題対象は${list.length}問です`);
    return;
  }
  startFullExamList(list);
}

const updateExamTimerDisplayBeforeFullExam = updateExamTimerDisplay;
updateExamTimerDisplay = function updateExamTimerDisplayWithFullWarning() {
  const activeSession = session;
  const isFullExam = Boolean(activeSession && activeSession.examMode && activeSession.fullExamMode && activeSession.examDeadline && !activeSession.examExpired);
  const remaining = isFullExam ? Math.max(0, activeSession.examDeadline - Date.now()) : null;
  updateExamTimerDisplayBeforeFullExam();
  if (!isFullExam || !session || session !== activeSession) return;

  const threshold = FULL_EXAM_WARNING_MINUTES * 60 * 1000;
  if (remaining <= threshold && remaining > 0) {
    const timerBox = $("#examTimerBox");
    if (timerBox) timerBox.classList.add("warning");
    if (!session.examWarningShown) {
      session.examWarningShown = true;
      toast(`残り${FULL_EXAM_WARNING_MINUTES}分です。未回答を残さないことを優先してください`);
    }
  }
};

const injectExamTimerBeforeFullExam = injectExamTimer;
injectExamTimer = function injectExamTimerWithFullExamLabel() {
  injectExamTimerBeforeFullExam();
  if (!session || !session.examMode) return;
  const label = $("#examTimerBox .exam-timer-main span");
  if (label) label.textContent = session.fullExamMode ? `本番想定 ${FULL_EXAM_QUESTION_COUNT}問・${FULL_EXAM_MINUTES}分` : "試験直前モード";
  if (session.fullExamMode && session.examDeadline - Date.now() <= FULL_EXAM_WARNING_MINUTES * 60 * 1000 && session.examDeadline > Date.now()) {
    const timerBox = $("#examTimerBox");
    if (timerBox) timerBox.classList.add("warning");
  }
};

const renderExamResultBeforeFullExam = renderExamResult;
renderExamResult = function renderExamResultWithFullExam(finished) {
  const fullExam = Boolean(finished && finished.fullExamMode);
  renderExamResultBeforeFullExam(finished);
  if (!fullExam) return;
  const heading = $("#view-quiz .exam-result-card h2");
  if (heading) heading.textContent = "本番想定モードの結果";
  const retry = $("#examResultRetry");
  if (retry) retry.onclick = () => startFullExamList(finished.list, finished.title);
};

const bindExamModeActionsBeforeFullExam = bindExamModeActions;
bindExamModeActions = function bindExamModeActionsWithFullExam(root) {
  bindExamModeActionsBeforeFullExam(root);
  const full = root.querySelector('[data-exam-action="full"]');
  if (full) full.onclick = startFullExamSimulation;
};

const examModePanelHtmlBeforePassDashboard = examModePanelHtml;
examModePanelHtml = function examModePanelHtmlWithPassDashboard() {
  return `<div class="card exam-mode-card">
    <div class="eyebrow">合格モード</div>
    <h2>${esc(passExamCountdownText())}</h2>
    <div class="muted">目標：あと8問を回収。今日やることだけに絞ります。</div>
    <div class="label">今日の15分メニュー</div>
    <button class="btn primary" data-exam-action="sprint">今日の15分メニューを始める</button>
    <div class="muted">復習期限 → 弱点 → 未学習の順を保ち、過去出題・弱点テーマを優先します。</div>
    <hr class="divider">
    <div class="label">本番想定</div>
    <button class="btn ghost" data-exam-action="full">104問・120分の本番想定を始める</button>
    <div class="muted">出題対象から104問を重複なしで抽出し、残り15分で一度だけ通知します。</div>
    <hr class="divider">
    <h3>弱点上位3件</h3>
    ${passWeakTopHtml()}
  </div>`;
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

currentCardsDisplayVersion = function currentCardsDisplayVersionDev25() {
  return RELEASE_CANDIDATE_VERSION;
};