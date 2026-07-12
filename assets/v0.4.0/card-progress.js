"use strict";

const CARD_PROGRESS_VERSION = "v0.4.0-dev.12";
const CARD_PROGRESS_META_KEY = "cardProgress";
const CARD_PROGRESS_STATES = new Set(["weak", "unsure", "mastered"]);
const CARD_PROGRESS_INTERVALS = [3, 7, 14, 30, 60, 90];
let CARD_PROGRESS = {};
let syllabusCardProgressFilter = "all";
let syllabusCardDueOnly = false;

function normalizeCardProgressRecord(source) {
  if (!source || typeof source !== "object") return null;
  const cardId = String(source.cardId || "");
  const state = String(source.state || "");
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(cardId) || !CARD_PROGRESS_STATES.has(state)) return null;
  return {
    cardId,
    state,
    stage: Math.max(0, Math.min(5, Number(source.stage) || 0)),
    intervalDays: Math.max(0, Math.min(365, Number(source.intervalDays) || 0)),
    dueAt: Number(source.dueAt) || today0(),
    lastReviewedAt: Number(source.lastReviewedAt) || 0,
    updatedAt: Number(source.updatedAt) || 0,
    reviewCount: Math.max(1, Number(source.reviewCount) || 1)
  };
}

function progressArrayToObject(records) {
  const result = {};
  (Array.isArray(records) ? records : []).forEach(source => {
    const record = normalizeCardProgressRecord(source);
    if (!record) return;
    const current = result[record.cardId];
    if (!current || record.updatedAt >= current.updatedAt) result[record.cardId] = record;
  });
  return result;
}

async function loadCardProgress() {
  const meta = await getOne("meta", CARD_PROGRESS_META_KEY);
  CARD_PROGRESS = progressArrayToObject(meta && meta.value);
}

async function saveCardProgress() {
  await putOne("meta", {
    key: CARD_PROGRESS_META_KEY,
    value: Object.values(CARD_PROGRESS),
    updatedAt: Date.now()
  });
}

const loadAllBeforeCardProgress = loadAll;
loadAll = async function loadAllWithCardProgress() {
  await loadAllBeforeCardProgress();
  await loadCardProgress();
};

function cardProgressRecord(cardId) {
  return CARD_PROGRESS[cardId] || null;
}

function cardProgressLabel(state) {
  return state === "weak" ? "苦手" : state === "unsure" ? "曖昧" : state === "mastered" ? "覚えた" : "未設定";
}

function cardProgressClass(state) {
  return state === "weak" ? "weak" : state === "unsure" ? "unsure" : state === "mastered" ? "mastered" : "unset";
}

function cardProgressDueText(record) {
  if (!record) return "状態を選ぶと復習予定を作成します";
  const due = new Date(record.dueAt);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today0()) / DAY);
  if (diff < 0) return `${Math.abs(diff)}日遅れ`;
  if (diff === 0) return "今日復習";
  if (diff === 1) return "明日復習";
  return `${fmtDate(due.getTime())}に復習`;
}

function cardProgressHtml(item) {
  if (!item || !item.id) return "";
  const record = cardProgressRecord(item.id);
  const current = record ? record.state : "";
  return `<div class="card-progress ${cardProgressClass(current)}" data-card-progress-panel="${esc(item.id)}">
    <div class="card-progress-head"><b>理解度</b><span>${esc(cardProgressDueText(record))}</span></div>
    <div class="card-progress-buttons" role="group" aria-label="${esc(item.ja || item.name || item.id)}の理解度">
      <button data-card-progress-id="${esc(item.id)}" data-card-progress-state="weak" aria-pressed="${current === "weak"}">苦手</button>
      <button data-card-progress-id="${esc(item.id)}" data-card-progress-state="unsure" aria-pressed="${current === "unsure"}">曖昧</button>
      <button data-card-progress-id="${esc(item.id)}" data-card-progress-state="mastered" aria-pressed="${current === "mastered"}">覚えた</button>
    </div>
    ${record ? `<div class="card-progress-meta">${esc(cardProgressLabel(record.state))}・復習${record.reviewCount}回・間隔${record.intervalDays}日</div>` : ""}
  </div>`;
}

function insertCardProgress(html, item) {
  const progress = cardProgressHtml(item);
  return progress ? html.replace(/<\/article>\s*$/, `${progress}</article>`) : html;
}

const termCardHtmlBeforeProgress = termCardHtml;
termCardHtml = function termCardHtmlWithProgress(item) {
  return insertCardProgress(termCardHtmlBeforeProgress(item), item);
};

const formulaCardHtmlBeforeProgress = formulaCardHtml;
formulaCardHtml = function formulaCardHtmlWithProgress(item) {
  return insertCardProgress(formulaCardHtmlBeforeProgress(item), item);
};

const compareCardHtmlBeforeProgress = compareCardHtml;
compareCardHtml = function compareCardHtmlWithProgress(item) {
  return insertCardProgress(compareCardHtmlBeforeProgress(item), item);
};

function nextCardProgressRecord(cardId, state) {
  const previous = cardProgressRecord(cardId);
  const now = Date.now();
  let stage = 0;
  let intervalDays = 0;
  if (state === "unsure") {
    intervalDays = 1;
  } else if (state === "mastered") {
    stage = previous && previous.state === "mastered" ? Math.min(5, previous.stage + 1) : 0;
    intervalDays = CARD_PROGRESS_INTERVALS[stage];
  }
  return {
    cardId,
    state,
    stage,
    intervalDays,
    dueAt: today0() + intervalDays * DAY,
    lastReviewedAt: now,
    updatedAt: now,
    reviewCount: (previous ? previous.reviewCount : 0) + 1
  };
}

async function setCardProgress(cardId, state) {
  if (!CARD_PROGRESS_STATES.has(state)) throw new Error("カード状態が不正です");
  CARD_PROGRESS[cardId] = nextCardProgressRecord(cardId, state);
  await saveCardProgress();
}

function isCardDue(item) {
  const record = item && item.id ? cardProgressRecord(item.id) : null;
  return Boolean(record && Number(record.dueAt) <= today0());
}

const filteredSyllabusCardsBeforeProgress = filteredSyllabusCards;
filteredSyllabusCards = function filteredSyllabusCardsWithProgress() {
  return filteredSyllabusCardsBeforeProgress().filter(item => {
    const record = item.id ? cardProgressRecord(item.id) : null;
    const state = record ? record.state : "new";
    if (syllabusCardProgressFilter !== "all" && state !== syllabusCardProgressFilter) return false;
    if (syllabusCardDueOnly && !isCardDue(item)) return false;
    return true;
  });
};

function cardProgressCounts(collection) {
  const result = { new: 0, weak: 0, unsure: 0, mastered: 0, due: 0 };
  collection.filter(item => item.id).forEach(item => {
    const record = cardProgressRecord(item.id);
    if (!record) result.new += 1;
    else result[record.state] += 1;
    if (isCardDue(item)) result.due += 1;
  });
  return result;
}

function refreshCardProgressSummary() {
  const root = $("#cardProgressSummary");
  if (!root || cardTab === "atlas") return;
  const counts = cardProgressCounts(currentCardCollection());
  root.innerHTML = `<span class="tag shu">苦手 ${counts.weak}</span><span class="tag warn">曖昧 ${counts.unsure}</span><span class="tag ok">覚えた ${counts.mastered}</span><span class="tag ai">本日復習 ${counts.due}</span><span class="tag">未設定 ${counts.new}</span>`;
}

function installCardProgressToolbar() {
  const toolbar = $("#view-cards .cards-toolbar");
  if (!toolbar || $("#cardProgressControls")) return;
  const controls = document.createElement("div");
  controls.id = "cardProgressControls";
  controls.className = "card-progress-toolbar";
  controls.innerHTML = `<div class="cards-toolbar-row card-progress-filter-row">
      <label><span class="label">理解度</span><select id="syllabusCardProgressFilter">
        <option value="all">すべての状態</option>
        <option value="new">未設定</option>
        <option value="weak">苦手</option>
        <option value="unsure">曖昧</option>
        <option value="mastered">覚えた</option>
      </select></label>
      <label class="card-due-check"><input id="syllabusCardDueOnly" type="checkbox"> 本日までの復習対象だけ</label>
    </div>
    <div class="card-progress-summary" id="cardProgressSummary"></div>
    <div class="card-progress-toolbar-actions"><button class="btn ghost small" id="cardProgressDueButton">本日のカード復習</button><button class="btn ghost small" id="cardProgressResetButton">理解度の絞り込み解除</button></div>`;
  const count = toolbar.querySelector(".cards-count");
  toolbar.insertBefore(controls, count || null);
  $("#syllabusCardProgressFilter").value = syllabusCardProgressFilter;
  $("#syllabusCardDueOnly").checked = syllabusCardDueOnly;
  $("#syllabusCardProgressFilter").onchange = event => {
    syllabusCardProgressFilter = event.target.value;
    renderSyllabusCardResults();
  };
  $("#syllabusCardDueOnly").onchange = event => {
    syllabusCardDueOnly = event.target.checked;
    renderSyllabusCardResults();
  };
  $("#cardProgressDueButton").onclick = () => {
    syllabusCardProgressFilter = "all";
    syllabusCardDueOnly = true;
    $("#syllabusCardProgressFilter").value = "all";
    $("#syllabusCardDueOnly").checked = true;
    renderSyllabusCardResults();
  };
  $("#cardProgressResetButton").onclick = () => {
    syllabusCardProgressFilter = "all";
    syllabusCardDueOnly = false;
    $("#syllabusCardProgressFilter").value = "all";
    $("#syllabusCardDueOnly").checked = false;
    renderSyllabusCardResults();
  };
  refreshCardProgressSummary();
}

const bindSyllabusCardActionsBeforeProgress = bindSyllabusCardActions;
bindSyllabusCardActions = function bindSyllabusCardActionsWithProgress() {
  bindSyllabusCardActionsBeforeProgress();
  $$("#cardList [data-card-progress-id]").forEach(button => {
    button.onclick = async () => {
      button.disabled = true;
      try {
        await setCardProgress(button.dataset.cardProgressId, button.dataset.cardProgressState);
        renderSyllabusCardResults();
        toast(`${cardProgressLabel(button.dataset.cardProgressState)}として記録しました`);
      } catch (error) {
        button.disabled = false;
        toast("カード状態の保存に失敗しました：" + (error.message || error));
      }
    };
  });
};

const renderSyllabusCardResultsBeforeProgress = renderSyllabusCardResults;
renderSyllabusCardResults = function renderSyllabusCardResultsWithProgress() {
  renderSyllabusCardResultsBeforeProgress();
  refreshCardProgressSummary();
};

const renderCardsBeforeCardProgress = renderCards;
renderCards = function renderCardsWithCardProgress() {
  renderCardsBeforeCardProgress();
  if (cardTab !== "atlas") installCardProgressToolbar();
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev12() {
  return CARD_PROGRESS_VERSION;
};

const backupObjectBeforeCardProgress = backupObject;
backupObject = function backupObjectWithCardProgress() {
  return Object.assign(backupObjectBeforeCardProgress(), {
    cardProgress: Object.values(CARD_PROGRESS)
  });
};

const validateBackupDataBeforeCardProgress = validateBackupData;
validateBackupData = function validateBackupDataWithCardProgress(data) {
  const validated = validateBackupDataBeforeCardProgress(data);
  if (validated.cardProgress == null) return validated;
  if (!Array.isArray(validated.cardProgress) || validated.cardProgress.length > 10000) throw new Error("cardProgressは10000件以下の配列です");
  const ids = new Set();
  validated.cardProgress.forEach(source => {
    const record = normalizeCardProgressRecord(source);
    if (!record) throw new Error("カード理解度データが不正です");
    if (ids.has(record.cardId)) throw new Error(`カード理解度IDが重複しています：${record.cardId}`);
    ids.add(record.cardId);
  });
  return validated;
};

mergeBackupData = function mergeBackupDataWithCardProgress(data) {
  return new Promise((resolve, reject) => {
    const importedProgress = progressArrayToObject(data.cardProgress || []);
    const mergedProgress = Object.assign({}, CARD_PROGRESS);
    Object.values(importedProgress).forEach(record => {
      const current = mergedProgress[record.cardId];
      if (!current || record.updatedAt > current.updatedAt) mergedProgress[record.cardId] = record;
    });
    const tx = db.transaction(["questions", "logs", "srs", "meta"], "readwrite");
    const questions = tx.objectStore("questions");
    const logs = tx.objectStore("logs");
    const srs = tx.objectStore("srs");
    data.questions.forEach(item => questions.put(item));
    data.logs.forEach(item => logs.put(item));
    data.srs.forEach(item => {
      const current = SRS[item.questionId];
      if (!current || Number(item.lastAt || 0) > Number(current.lastAt || 0)) srs.put(item);
    });
    tx.objectStore("meta").put({ key: CARD_PROGRESS_META_KEY, value: Object.values(mergedProgress), updatedAt: Date.now() });
    tx.objectStore("meta").put({ key: "lastRestoreAt", value: Date.now() });
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("復元に失敗しました"));
  });
};

replaceLearningData = function replaceLearningDataWithCardProgress(data) {
  return new Promise((resolve, reject) => {
    const progress = progressArrayToObject(data.cardProgress || []);
    const tx = db.transaction(["questions", "logs", "srs", "meta"], "readwrite");
    const questions = tx.objectStore("questions");
    const logs = tx.objectStore("logs");
    const srs = tx.objectStore("srs");
    questions.clear();
    logs.clear();
    srs.clear();
    data.questions.forEach(item => questions.put(item));
    data.logs.forEach(item => logs.put(item));
    data.srs.forEach(item => srs.put(item));
    tx.objectStore("meta").put({ key: CARD_PROGRESS_META_KEY, value: Object.values(progress), updatedAt: Date.now() });
    tx.objectStore("meta").put({ key: "lastRestoreAt", value: Date.now() });
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("復元に失敗しました"));
  });
};

clearHistoryAtomic = function clearHistoryAndCardProgressAtomic() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["logs", "srs", "meta"], "readwrite");
    tx.objectStore("logs").clear();
    tx.objectStore("srs").clear();
    tx.objectStore("meta").delete(CARD_PROGRESS_META_KEY);
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("削除に失敗しました"));
  });
};

resetHistory = async function resetHistoryWithCardProgress() {
  if (!confirm("回答履歴・問題の復習予定・カード理解度をすべて削除します。問題とカード教材は残ります。現在のバックアップも作成します。")) return;
  try {
    downloadBackup(false);
    await saveRecoverySnapshot("学習履歴とカード理解度の削除前");
    await clearHistoryAtomic();
    await loadAll();
    session = null;
    toast("学習履歴とカード理解度を削除しました");
    await renderStats();
  } catch (error) {
    toast("削除失敗：" + (error.message || error));
  }
};

const renderStatsBeforeCardProgress = renderStats;
renderStats = async function renderStatsWithCardProgress() {
  await renderStatsBeforeCardProgress();
  const collection = [...TERMS, ...FORMULAS, ...COMPARES].filter(item => item.id);
  const counts = cardProgressCounts(collection);
  const cards = [...$("#view-stats").querySelectorAll(".card")];
  const dataCard = cards.find(card => card.querySelector("h2")?.textContent === "データ管理");
  if (!dataCard) return;
  dataCard.insertAdjacentHTML("beforebegin", `<div class="card"><h2>カード理解度</h2>
    <div class="row">
      <div class="stat"><div class="v">${counts.due}</div><div class="l">本日復習</div></div>
      <div class="stat"><div class="v">${counts.weak}</div><div class="l">苦手</div></div>
      <div class="stat"><div class="v">${counts.unsure}</div><div class="l">曖昧</div></div>
      <div class="stat"><div class="v">${counts.mastered}</div><div class="l">覚えた</div></div>
    </div><div class="muted">理解度と次回復習日はJSONバックアップへ含まれます。</div></div>`);
};
