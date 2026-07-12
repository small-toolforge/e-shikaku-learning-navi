"use strict";

const ACCEPTANCE_CHECK_VERSION = "v0.4.0-dev.15";

function acceptanceResult(name, passed, detail = "") {
  return { name, passed: Boolean(passed), detail: String(detail || "") };
}

function duplicateIds(items) {
  const seen = new Set();
  const dup = new Set();
  items.forEach(item => {
    const id = item && item.id;
    if (!id) return;
    if (seen.has(id)) dup.add(id);
    seen.add(id);
  });
  return [...dup];
}

function allSyllabusCards() {
  return [...TERMS, ...FORMULAS, ...COMPARES].filter(item => item && item.major && item.id);
}

function atlasCountForAcceptance() {
  const applicationCount = typeof APPLICATION_ATLASES !== "undefined" ? APPLICATION_ATLASES.length : 0;
  return 1 + applicationCount;
}

async function indexedDbProbe() {
  const key = "acceptanceProbe";
  const token = `probe-${Date.now()}`;
  try {
    await putOne("meta", { key, value: token, at: Date.now() });
    const stored = await getOne("meta", key);
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["meta"], "readwrite");
      tx.objectStore("meta").delete(key);
      tx.oncomplete = resolve;
      tx.onabort = tx.onerror = () => reject(tx.error || new Error("probe delete failed"));
    });
    return stored && stored.value === token;
  } catch (error) {
    console.warn("IndexedDB acceptance probe failed", error);
    return false;
  }
}

async function serviceWorkerProbe() {
  if (!("serviceWorker" in navigator) || location.protocol.indexOf("http") !== 0) return { passed: false, detail: "HTTP(S)環境で確認してください" };
  try {
    const registration = await navigator.serviceWorker.getRegistration("./");
    return { passed: Boolean(registration), detail: registration ? "登録済み" : "未登録" };
  } catch (error) {
    return { passed: false, detail: error.message || String(error) };
  }
}

async function runAcceptanceChecks() {
  const cards = allSyllabusCards();
  const questionDuplicates = duplicateIds(QUESTIONS);
  const cardDuplicates = duplicateIds(cards);
  const missingCardLinks = [];
  const missingQuestionLinks = [];

  QUESTIONS.forEach(question => {
    (question.cardIds || []).forEach(cardId => {
      if (!findSyllabusCardById(cardId)) missingCardLinks.push(`${question.id}→${cardId}`);
    });
  });
  cards.forEach(card => {
    (card.questionIds || []).forEach(questionId => {
      if (!QUESTIONS.some(question => question.id === questionId)) missingQuestionLinks.push(`${card.id}→${questionId}`);
    });
  });

  const idb = await indexedDbProbe();
  const sw = await serviceWorkerProbe();
  const scopeCounts = typeof cardScopeCounts === "function" ? cardScopeCounts(cards) : { exam: 0, optional: 0, mixed: 0 };
  const eligibleQuestions = typeof examEligibleQuestions === "function" ? examEligibleQuestions() : [];
  const optionalQuestions = typeof examOptionalQuestions === "function" ? examOptionalQuestions() : [];

  return [
    acceptanceResult("表示版", ACCEPTANCE_CHECK_VERSION === "v0.4.0-dev.15", ACCEPTANCE_CHECK_VERSION),
    acceptanceResult("シラバスカード438枚", cards.length === 438, `${cards.length}枚`),
    acceptanceResult("確認問題174問", QUESTIONS.length === 174, `${QUESTIONS.length}問`),
    acceptanceResult("図解16件", atlasCountForAcceptance() === 16, `${atlasCountForAcceptance()}件`),
    acceptanceResult("問題ID重複なし", questionDuplicates.length === 0, questionDuplicates.join(", ")),
    acceptanceResult("カードID重複なし", cardDuplicates.length === 0, cardDuplicates.join(", ")),
    acceptanceResult("問題→カード参照", missingCardLinks.length === 0, missingCardLinks.slice(0, 5).join(", ")),
    acceptanceResult("カード→問題参照", missingQuestionLinks.length === 0, missingQuestionLinks.slice(0, 5).join(", ")),
    acceptanceResult("出題範囲3分類", scopeCounts.exam > 0 && scopeCounts.optional > 0 && scopeCounts.mixed > 0, `対象${scopeCounts.exam}・任意${scopeCounts.optional}・混在${scopeCounts.mixed}`),
    acceptanceResult("試験直前の対象問題", eligibleQuestions.length > 0 && eligibleQuestions.length + optionalQuestions.length === QUESTIONS.length, `対象${eligibleQuestions.length}・除外${optionalQuestions.length}`),
    acceptanceResult("IndexedDB書込・読込・削除", idb, idb ? "正常" : "失敗"),
    acceptanceResult("Service Worker登録", sw.passed, sw.detail),
    acceptanceResult("オンライン状態", navigator.onLine, navigator.onLine ? "オンライン" : "オフライン確認中")
  ];
}

function acceptanceCheckHtml(results) {
  const passed = results.filter(result => result.passed).length;
  const failed = results.length - passed;
  const rows = results.map(result => `<div class="acceptance-row ${result.passed ? "pass" : "fail"}">
    <span class="acceptance-mark">${result.passed ? "OK" : "NG"}</span>
    <div><b>${esc(result.name)}</b>${result.detail ? `<div class="muted">${esc(result.detail)}</div>` : ""}</div>
  </div>`).join("");
  return `<div class="acceptance-summary ${failed ? "has-failure" : "all-pass"}"><b>${failed ? `NG ${failed}件` : "すべてOK"}</b><span>${passed}/${results.length}項目</span></div>${rows}`;
}

async function executeAcceptanceCheck() {
  const output = $("#acceptanceCheckOutput");
  const button = $("#runAcceptanceCheck");
  if (!output) return;
  if (button) button.disabled = true;
  output.innerHTML = `<div class="muted">確認中です…</div>`;
  try {
    const results = await runAcceptanceChecks();
    output.innerHTML = acceptanceCheckHtml(results);
  } catch (error) {
    output.innerHTML = `<div class="notice warn"><b>セルフチェックを完了できませんでした</b><div class="muted">${esc(error.message || error)}</div></div>`;
  } finally {
    if (button) button.disabled = false;
  }
}

const renderStatsBeforeAcceptanceCheck = renderStats;
renderStats = async function renderStatsWithAcceptanceCheck() {
  await renderStatsBeforeAcceptanceCheck();
  const root = $("#view-stats");
  if (!root || $("#acceptanceCheckPanel")) return;
  root.insertAdjacentHTML("afterbegin", `<div class="card" id="acceptanceCheckPanel">
    <div class="eyebrow">v0.4.0受け入れ準備</div><h2>実行時セルフチェック</h2>
    <div class="muted">教材件数、ID重複、相互参照、出題範囲、IndexedDB、Service Workerをこの端末上で確認します。学習履歴は変更しません。</div>
    <button class="btn primary" id="runAcceptanceCheck">セルフチェックを実行</button>
    <div id="acceptanceCheckOutput" class="acceptance-output"></div>
  </div>`);
  $("#runAcceptanceCheck").onclick = executeAcceptanceCheck;
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev15() {
  return ACCEPTANCE_CHECK_VERSION;
};
