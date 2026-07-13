"use strict";

const BACKUP_IMPORT_MODE_VERSION = "v0.4.0-dev.19";
let backupImportMode = "merge";

function backupImportModeLabel(mode = backupImportMode) {
  return mode === "replace" ? "置換読込" : "統合読込";
}

function backupCardProgressCount(data) {
  return Array.isArray(data.cardProgress) ? data.cardProgress.length : 0;
}

function backupImportSummary(data) {
  return `問題${data.questions.length}件、回答${data.logs.length}件、問題の復習予定${data.srs.length}件、カード理解度${backupCardProgressCount(data)}件`;
}

function installBackupImportModeUi() {
  const dataCard = [...$("#view-stats").querySelectorAll(".card")].find(card => card.querySelector("h2")?.textContent === "データ管理");
  const importButton = $("#importData");
  if (!dataCard || !importButton || $("#backupImportModePanel")) return;

  const panel = document.createElement("div");
  panel.id = "backupImportModePanel";
  panel.className = "backup-import-mode";
  panel.innerHTML = `<div class="label">読み込み方法</div>
    <label class="backup-import-option selected" data-backup-mode-option="merge">
      <input type="radio" name="backupImportMode" value="merge" checked>
      <span><b>統合読込（推奨）</b><small>端末とJSONの新しい状態を残します。現在の学習データを基本的に維持します。</small></span>
    </label>
    <label class="backup-import-option" data-backup-mode-option="replace">
      <input type="radio" name="backupImportMode" value="replace">
      <span><b>置換読込</b><small>問題・回答履歴・問題SRS・カード理解度をJSONの内容で置き換えます。読込前に自動バックアップと復元用スナップショットを作成します。</small></span>
    </label>
    <div class="notice warn backup-replace-warning" id="backupReplaceWarning" hidden><b>置換読込は現在の学習状態を上書きします</b><div class="muted">古いバックアップ時点へ完全に戻したい場合だけ使用してください。確認時に「置換」と入力します。</div></div>`;

  importButton.parentNode.insertBefore(panel, importButton);
  importButton.textContent = "学習データを統合して読み込む";
  importButton.title = "現在の学習データとバックアップを安全に統合します";

  dataCard.querySelectorAll('input[name="backupImportMode"]').forEach(radio => {
    radio.onchange = event => {
      backupImportMode = event.target.value === "replace" ? "replace" : "merge";
      dataCard.querySelectorAll("[data-backup-mode-option]").forEach(option => {
        option.classList.toggle("selected", option.dataset.backupModeOption === backupImportMode);
      });
      const replace = backupImportMode === "replace";
      $("#backupReplaceWarning").hidden = !replace;
      importButton.textContent = replace ? "学習データを置換して読み込む" : "学習データを統合して読み込む";
      importButton.classList.toggle("shu", replace);
      importButton.classList.toggle("ghost", !replace);
      importButton.title = replace ? "現在の学習状態をJSONで置き換えます" : "現在の学習データとバックアップを安全に統合します";
    };
  });
}

async function confirmReplaceBackup(data, fileName) {
  const summary = backupImportSummary(data);
  const first = confirm(`${summary}で現在の学習状態を置き換えます。\n\n読込前に現在のJSONバックアップを保存し、端末内の復元用スナップショットも作成します。\n\nファイル：${fileName}\n\n続けますか？`);
  if (!first) return false;
  const phrase = prompt("誤操作防止のため「置換」と入力してください。", "");
  return phrase === "置換";
}

importBackup = async function importBackupWithMode(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    if (file.size > 50 * 1024 * 1024) throw new Error("バックアップファイルは50MB以下にしてください");
    const data = validateBackupData(JSON.parse(await file.text()));
    const summary = backupImportSummary(data);

    if (backupImportMode === "replace") {
      if (!await confirmReplaceBackup(data, file.name)) {
        toast("置換読込を中止しました");
        return;
      }
      await downloadBackup(false);
      await saveRecoverySnapshot("置換読込前");
      await replaceLearningData(data);
      await loadAll();
      toast("学習データをJSONの内容で置き換えました");
    } else {
      if (!confirm(`${summary}を現在の学習データへ統合します。\n\n同じカードはupdatedAtが新しい状態を残します。現在の状態は端末内の復元用スナップショットへ保存します。\n\nファイル：${file.name}`)) return;
      await saveRecoverySnapshot("統合読込前");
      await mergeBackupData(data);
      await loadAll();
      toast("学習データを統合して読み込みました");
    }

    session = null;
    await renderStats();
  } catch (error) {
    toast(`${backupImportModeLabel()}失敗：` + (error.message || error));
  }
};

const renderStatsBeforeBackupImportMode = renderStats;
renderStats = async function renderStatsWithBackupImportMode() {
  await renderStatsBeforeBackupImportMode();
  installBackupImportModeUi();
  const fileInput = $("#backupFile");
  if (fileInput) fileInput.onchange = importBackup;
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev19() {
  return BACKUP_IMPORT_MODE_VERSION;
};
