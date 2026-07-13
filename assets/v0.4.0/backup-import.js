"use strict";

const BACKUP_IMPORT_VERSION = "v0.4.0-dev.19";
let backupImportMode = "merge";

function backupTimestamp(date = new Date()) {
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

const backupObjectBeforeSafeImport = backupObject;
backupObject = function backupObjectDev19() {
  return Object.assign(backupObjectBeforeSafeImport(), { appVersion: BACKUP_IMPORT_VERSION });
};

downloadBackup = async function downloadBackupJapanese(mark = true) {
  const data = backupObject();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `E資格学習ナビ_学習データ_${backupTimestamp()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (mark) {
    await putOne("meta", { key: "lastBackupAt", value: Date.now() });
    toast("学習データを書き出しました");
  }
  return data;
};

function backupImportModeText(mode = backupImportMode) {
  if (mode === "replace-state") {
    return "回答履歴・問題の復習予定・カード理解度をJSONの状態で置き換えます。問題教材は削除せず、JSON内の問題を追加・更新します。実行前に現在データを自動保存します。";
  }
  return "問題と回答を追加・更新し、問題の復習予定とカード理解度は更新日時が新しい状態を優先します。現在の新しい状態は古いJSONで上書きされません。";
}

function backupImportCounts(data) {
  return {
    questions: Array.isArray(data.questions) ? data.questions.length : 0,
    logs: Array.isArray(data.logs) ? data.logs.length : 0,
    srs: Array.isArray(data.srs) ? data.srs.length : 0,
    cardProgress: Array.isArray(data.cardProgress) ? data.cardProgress.length : 0
  };
}

function currentLearningCounts() {
  return {
    questions: QUESTIONS.length,
    logs: LOGS.length,
    srs: Object.keys(SRS || {}).length,
    cardProgress: Object.keys(typeof CARD_PROGRESS === "object" && CARD_PROGRESS ? CARD_PROGRESS : {}).length
  };
}

function backupCountsText(counts) {
  return `問題${counts.questions}件・回答${counts.logs}件・問題復習${counts.srs}件・カード理解度${counts.cardProgress}件`;
}

function normalizeImportedBackup(data) {
  const validated = validateBackupData(data);
  if (typeof applyQuestionReferenceRepairs === "function") applyQuestionReferenceRepairs(validated.questions);
  return validated;
}

function replaceLearningStateFromBackup(data) {
  return new Promise((resolve, reject) => {
    const importedProgress = typeof progressArrayToObject === "function"
      ? progressArrayToObject(data.cardProgress || [])
      : {};
    const tx = db.transaction(["questions", "logs", "srs", "meta"], "readwrite");
    const questions = tx.objectStore("questions");
    const logs = tx.objectStore("logs");
    const srs = tx.objectStore("srs");

    data.questions.forEach(item => questions.put(item));
    logs.clear();
    srs.clear();
    data.logs.forEach(item => logs.put(item));
    data.srs.forEach(item => srs.put(item));
    tx.objectStore("meta").put({
      key: typeof CARD_PROGRESS_META_KEY === "string" ? CARD_PROGRESS_META_KEY : "cardProgress",
      value: Object.values(importedProgress),
      updatedAt: Date.now()
    });
    tx.objectStore("meta").put({ key: "lastRestoreAt", value: Date.now() });
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("学習状態の置換に失敗しました"));
  });
}

async function importBackupSafely(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    if (file.size > 50 * 1024 * 1024) throw new Error("バックアップファイルは50MB以下にしてください");
    const data = normalizeImportedBackup(JSON.parse(await file.text()));
    const before = currentLearningCounts();
    const after = backupImportCounts(data);

    if (backupImportMode === "replace-state") {
      const oldFormatNote = Array.isArray(data.cardProgress)
        ? ""
        : "\nこのJSONにはカード理解度がないため、カード理解度は未設定へ置き換わります。";
      const message = `学習状態をJSONで置き換えます。\n\n現在：${backupCountsText(before)}\nJSON：${backupCountsText(after)}\n\n問題教材は削除しません。回答履歴・問題復習・カード理解度をJSONの内容へ置換します。現在データはJSONファイルと端末内スナップショットへ自動保存します。${oldFormatNote}\n\n続行しますか？`;
      if (!confirm(message)) return;
      await downloadBackup(false);
      await saveRecoverySnapshot("学習状態の置換読込前");
      await replaceLearningStateFromBackup(data);
      await loadAll();
      session = null;
      toast("JSONの学習状態へ置き換えました");
    } else {
      const message = `学習データを統合します。\n\n現在：${backupCountsText(before)}\nJSON：${backupCountsText(after)}\n\n復習予定とカード理解度は、更新日時が新しい状態を優先します。現在の状態は端末内スナップショットへ保存します。\n\n続行しますか？`;
      if (!confirm(message)) return;
      await saveRecoverySnapshot("バックアップ統合読込前");
      await mergeBackupData(data);
      await loadAll();
      session = null;
      toast("学習データを統合しました");
    }
    await renderStats();
  } catch (error) {
    toast("読み込み失敗：" + (error.message || error));
  }
}

importBackup = importBackupSafely;

function installBackupImportControls() {
  const dataCard = [...$("#view-stats").querySelectorAll(".card")]
    .find(card => card.querySelector("h2")?.textContent === "データ管理");
  if (!dataCard || $("#backupImportControls")) return;

  const versionLine = dataCard.querySelector(":scope > .muted");
  if (versionLine) {
    versionLine.innerHTML = `アプリ版：<b>${esc(BACKUP_IMPORT_VERSION)}</b> / 学習履歴はこの端末のブラウザ内に保存されています。`;
  }

  const importButton = $("#importData");
  const fileInput = $("#backupFile");
  if (!importButton || !fileInput) return;

  importButton.textContent = "学習データを読み込む（方法を選択）";
  importButton.onclick = () => fileInput.click();
  fileInput.onchange = importBackupSafely;

  importButton.insertAdjacentHTML("beforebegin", `<div class="backup-import-controls" id="backupImportControls">
    <label><span class="label">読込方法</span><select id="backupImportMode">
      <option value="merge">統合読込（新しい状態を優先）</option>
      <option value="replace-state">学習状態を置換（JSONへ戻す）</option>
    </select></label>
    <div class="muted" id="backupImportHelp">${esc(backupImportModeText())}</div>
    <div class="backup-import-safety"><b>安全策</b><div>置換読込の前には、現在の学習データを自動でJSON保存し、端末内の復元用スナップショットも作成します。</div></div>
  </div>`);

  $("#backupImportMode").value = backupImportMode;
  $("#backupImportMode").onchange = event => {
    backupImportMode = event.target.value;
    $("#backupImportHelp").textContent = backupImportModeText();
  };
}

const renderStatsBeforeBackupImport = renderStats;
renderStats = async function renderStatsWithBackupImport() {
  await renderStatsBeforeBackupImport();
  installBackupImportControls();
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev19() {
  return BACKUP_IMPORT_VERSION;
};
