"use strict";

const EXAM_MODE_VERSION = "v0.4.0-dev.14";
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
  session.examDeadline = Date.now() + minutes * 60 * 1000;
  session.examExpired = false;
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
    clearExamTimer();
    toast("15分経過。この問題の回答後に結果を表示します");
    const timerBox = $("#examTimerBox");
    if (timerBox) timerBox.classList.add("expired");
  }
}

function injectExamTimer() {
  if (!session || !session.examMode) return;
  const view = $("#view-quiz");
  if (!view || $("#examTimerBox")) return;
  const box = document.createElement("div");
  box.id = "examTimerBox";
  box.className = `exam-timer${session.examExpired ? " expired" : ""}`;
  box.innerHTML = `<span>試験直前モード</span><b id="examTimer">15:00</b>`;
  view.insertBefore(box, view.firstChild);
  updateExamTimerDisplay();
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
  renderFeedbackBeforeExamMode(question, ok);
  injectExamQuestionBadge(question);
  injectExamTimer();
  if (session && session.examMode && session.examExpired) {
    const next = $("#next");
    if (next) {
      next.textContent = "15分の結果を見る";
      next.onclick = renderResult;
    }
  }
};

const renderResultBeforeExamMode = renderResult;
renderResult = function renderResultWithExamMode() {
  clearExamTimer();
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

currentCardsDisplayVersion = function currentCardsDisplayVersionDev14() {
  return EXAM_MODE_VERSION;
};
