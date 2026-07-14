"use strict";

const EXAM_MODE_VERSION = "v0.4.0-dev.20";
let examTimerId = null;

function questionScopeFor(question) {
  if (!question) return "exam";
  const scopes = [];
  if (Array.isArray(question.cardIds)) {
    question.cardIds.forEach(cardId => {
      const card = typeof findSyllabusCardById === "function" ? findSyllabusCardById(cardId) : null;
      if (card) scopes.push(cardScopeFor(card));
    });
  }
  if (!scopes.length && question.syllabusId) scopes.push(cardScopeFor({ major: question.category || "シラバス", syllabusId: question.syllabusId }));
  if (!scopes.length) return "exam";
  if (scopes.includes("exam")) return "exam";
  if (scopes.includes("mixed")) return "mixed";
  return scopes.every(scope => scope === "optional") ? "optional" : "exam";
}

function examEligibleQuestions() {
  return QUESTIONS.filter(question => questionScopeFor(question) !== "optional");
}

function examOptionalQuestions() {
  return QUESTIONS.filter(question => questionScopeFor(question) === "optional");
}

function uniqueQuestions(groups, limit) {
  const seen = new Set();
  const result = [];
  for (const group of groups) {
    for (const question of group) {
      if (!question || seen.has(question.id)) continue;
      seen.add(question.id);
      result.push(question);
      if (result.length >= limit) return result;
    }
  }
  return result;
}

function examSprintQuestions(limit = 15) {
  const eligible = examEligibleQuestions();
  const due = shuffle(eligible.filter(question => SRS[question.id] && SRS[question.id].due <= today0()));
  const weak = shuffle(eligible.filter(question => SRS[question.id] && (SRS[question.id].lapses || !SRS[question.id].lastCorrect)));
  const unseen = shuffle(eligible.filter(question => !SRS[question.id]));
  const others = shuffle(eligible);
  return uniqueQuestions([due, weak, unseen, others], Math.min(limit, eligible.length));
}

function clearExamTimer() {
  if (examTimerId) clearInterval(examTimerId);
  examTimerId = null;
}

function startExamSession(list, title, minutes = null) {
  clearExamTimer();
  startSession(list, title);
  if (!session || !minutes) return;
  session.examMode = true;
  session.examStartedAt = Date.now();
  session.examDurationMinutes = minutes;
  session.examDeadline = session.examStartedAt + minutes * 60 * 1000;
  session.examExpired = false;
  session.examAnswered = 0;
  session.examEndReason = null;
  renderQuestion();
}

function startExamSprint() {
  startExamSession(examSprintQuestions(15), "試験直前15分", 15);
}

function startExamRandom() {
  startExamSession(shuffle(examEligibleQuestions()).slice(0, 10), "出題対象優先ランダム10問");
}

function startExamWeak() {
  const weak = examEligibleQuestions().filter(question => SRS[question.id] && (SRS[question.id].lapses || !SRS[question.id].lastCorrect));
  startExamSession(shuffle(weak), "出題対象優先の弱点ドリル");
}

function examScopeBadge(question) {
  const scope = questionScopeFor(question);
  if (scope === "optional") return `<span class="tag scope-optional">オプション</span>`;
  if (scope === "mixed") return `<span class="tag scope-mixed">出題範囲混在</span>`;
  return `<span class="tag scope-exam">出題対象</span>`;
}

function injectExamQuestionBadge(question) {
  const card = $("#view-quiz .card");
  const first = card && card.firstElementChild;
  if (!first || first.querySelector("[data-exam-scope-badge]")) return;
  const holder = document.createElement("span");
  holder.dataset.examScopeBadge = "1";
  holder.innerHTML = examScopeBadge(question);
  first.appendChild(holder.firstElementChild);
}

function markExamExpiredUi() {
  const timerBox = $("#examTimerBox");
  if (timerBox) timerBox.classList.add("expired");
  const finish = $("#examFinishEarly");
  if (finish) {
    finish.disabled = true;
    finish.textContent = "この問題を回答後に終了";
  }
  const next = $("#next");
  if (next) {
    next.textContent = "時間終了の結果を見る";
    next.onclick = renderResult;
  }
}

function updateExamTimerDisplay() {
  if (!session || !session.examMode || !session.examDeadline) return clearExamTimer();
  const remaining = Math.max(0, session.examDeadline - Date.now());
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const timer = $("#examTimer");
  if (timer) timer.textContent = `${minutes}:${seconds}`;
  if (remaining <= 0 && !session.examExpired) {
    session.examExpired = true;
    session.examEndReason = "time-expired";
    clearExamTimer();
    toast("制限時間が終了しました。この問題の回答後に結果を表示します");
    markExamExpiredUi();
  }
}

function endExamWithCurrentResult() {
  if (!session || !session.examMode || session.examExpired) return;
  const answered = Number(session.examAnswered || 0);
  const message = answered
    ? `ここまでの${answered}問の結果を表示します。未回答の問題は成績に含めません。よろしいですか？`
    : "まだ回答していません。0問の途中結果を表示しますか？";
  if (!confirm(message)) return;
  session.examEndReason = "manual";
  renderResult();
}

function injectExamTimer() {
  if (!session || !session.examMode) return;
  const view = $("#view-quiz");
  if (!view || $("#examTimerBox")) return;
  const box = document.createElement("div");
  box.id = "examTimerBox";
  box.className = `exam-timer${session.examExpired ? " expired" : ""}`;
  box.innerHTML = `<div class="exam-timer-main"><span>試験直前モード</span><b id="examTimer">15:00</b></div><button type="button" id="examFinishEarly" class="exam-finish">ここまでの結果</button>`;
  view.insertBefore(box, view.firstChild);
  $("#examFinishEarly").onclick = endExamWithCurrentResult;
  updateExamTimerDisplay();
  if (session.examExpired) markExamExpiredUi();
  if (!examTimerId && !session.examExpired) examTimerId = setInterval(updateExamTimerDisplay, 1000);
}

const renderQuestionBeforeExamMode = renderQuestion;
renderQuestion = function renderQuestionWithExamMode() {
  renderQuestionBeforeExamMode();
  if (!session) return;
  injectExamQuestionBadge(session.list[session.idx]);
  injectExamTimer();
};

const renderFeedbackBeforeExamMode = renderFeedback;
renderFeedback = function renderFeedbackWithExamMode(question, ok) {
  if (session && session.examMode) session.examAnswered = Math.max(Number(session.examAnswered || 0), session.idx + 1);
  renderFeedbackBeforeExamMode(question, ok);
  injectExamQuestionBadge(question);
  injectExamTimer();
  if (session && session.examMode && session.examExpired) markExamExpiredUi();
};

function formatExamElapsed(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}分${seconds}秒`;
}

function examEndReasonText(reason) {
  if (reason === "time-expired") return "制限時間終了";
  if (reason === "manual") return "途中終了";
  return "全問完了";
}

function renderExamResult(finished) {
  const answered = Math.max(0, Math.min(finished.list.length, Number(finished.examAnswered || 0)));
  const correct = Math.max(0, Math.min(answered, Number(finished.correct || 0)));
  const remaining = Math.max(0, finished.list.length - answered);
  const accuracy = answered ? Math.round(correct * 100 / answered) : null;
  const elapsedSeconds = Math.round((Date.now() - Number(finished.examStartedAt || Date.now())) / 1000);
  const reason = finished.examEndReason || (finished.examExpired ? "time-expired" : answered >= finished.list.length ? "completed" : "manual");
  session = null;
  $("#view-quiz").innerHTML = `<div class="card exam-result-card">
    <div class="eyebrow">${esc(finished.title)}・${esc(examEndReasonText(reason))}</div>
    <h2>試験直前モードの結果</h2>
    <div class="exam-result-score"><b>${correct}/${answered}</b><span>回答した問題の正解数</span></div>
    <div class="row exam-result-stats">
      <div class="stat"><div class="v">${answered}<small>問</small></div><div class="l">回答</div></div>
      <div class="stat"><div class="v">${remaining}<small>問</small></div><div class="l">未回答</div></div>
      <div class="stat"><div class="v">${accuracy == null ? "–" : accuracy + "%"}</div><div class="l">回答内正答率</div></div>
      <div class="stat"><div class="v exam-elapsed">${esc(formatExamElapsed(elapsedSeconds))}</div><div class="l">経過時間</div></div>
    </div>
    <div class="notice"><b>未回答は不正解として数えません</b><div class="muted">回答済みの問題だけを正答率へ反映し、保存済みの回答は通常どおり復習予定へ反映しています。</div></div>
    <button class="btn primary" id="examResultHome">ホームへ戻る</button>
    <button class="btn ghost small" id="examResultRetry">同じ問題でもう一度</button>
  </div>`;
  $("#examResultHome").onclick = () => nav("home");
  $("#examResultRetry").onclick = () => startExamSession(finished.list, finished.title, finished.examDurationMinutes || 15);
}

const renderResultBeforeExamMode = renderResult;
renderResult = function renderResultWithExamMode() {
  clearExamTimer();
  if (session && session.examMode) {
    if (!session.examEndReason) session.examEndReason = session.examExpired ? "time-expired" : Number(session.examAnswered || 0) >= session.list.length ? "completed" : "manual";
    renderExamResult(session);
    return;
  }
  renderResultBeforeExamMode();
};

const endSessionBeforeExamMode = endSession;
endSession = function endSessionWithExamMode() {
  clearExamTimer();
  endSessionBeforeExamMode();
};

function examModePanelHtml() {
  const eligible = examEligibleQuestions();
  const optional = examOptionalQuestions();
  const weak = eligible.filter(question => SRS[question.id] && (SRS[question.id].lapses || !SRS[question.id].lastCorrect));
  return `<div class="card exam-mode-card">
    <div class="eyebrow">試験直前</div><h2>出題対象優先モード</h2>
    <div class="muted">オプション（出題対象外）を除き、出題対象と混在項目から演習します。</div>
    <div class="exam-mode-counts"><span class="tag scope-exam">対象 ${eligible.length}問</span><span class="tag scope-optional">除外 ${optional.length}問</span><span class="tag shu">弱点 ${weak.length}問</span></div>
    <button class="btn primary" data-exam-action="sprint">15分集中（最大15問）</button>
    <button class="btn ghost small" data-exam-action="random">出題対象からランダム10問</button>
    <button class="btn ghost small" data-exam-action="weak" ${weak.length ? "" : "disabled"}>出題対象の弱点ドリル（${weak.length}問）</button>
  </div>`;
}

function bindExamModeActions(root) {
  const sprint = root.querySelector('[data-exam-action="sprint"]');
  const random = root.querySelector('[data-exam-action="random"]');
  const weak = root.querySelector('[data-exam-action="weak"]');
  if (sprint) sprint.onclick = startExamSprint;
  if (random) random.onclick = startExamRandom;
  if (weak) weak.onclick = startExamWeak;
}

function installExamModePanel(viewId, position = "afterbegin") {
  const root = $(viewId);
  if (!root || root.querySelector(".exam-mode-card")) return;
  root.insertAdjacentHTML(position, examModePanelHtml());
  bindExamModeActions(root);
}

const renderHomeBeforeExamMode = renderHome;
renderHome = async function renderHomeWithExamMode() {
  await renderHomeBeforeExamMode();
  installExamModePanel("#view-home", "beforeend");
};

const renderStudyBeforeExamMode = renderStudy;
renderStudy = function renderStudyWithExamMode() {
  renderStudyBeforeExamMode();
  installExamModePanel("#view-study", "afterbegin");
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev20() {
  return EXAM_MODE_VERSION;
};
