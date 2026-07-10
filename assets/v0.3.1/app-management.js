"use strict";

async function renderStats() {
  const acc = accuracy(LOGS);
  const streak = streakDays();
  const categories = [...new Set(QUESTIONS.map(q => q.category))];
  const categoryRows = categories.map(category => {
    const ids = new Set(QUESTIONS.filter(q => q.category === category).map(q => q.id));
    const logs = LOGS.filter(log => ids.has(log.questionId));
    return { category, accuracy: accuracy(logs), count: logs.length };
  }).filter(row => row.count);
  const reasons = {};
  LOGS.filter(log => !log.isCorrect && log.errorReason).forEach(log => {
    reasons[log.errorReason] = (reasons[log.errorReason] || 0) + 1;
  });
  const recovery = await getOne("meta", "recoverySnapshot");
  const recoveryText = recovery && recovery.at
    ? `${new Date(recovery.at).toLocaleString("ja-JP")}（${esc(recovery.reason || "変更前")}）`
    : "なし";

  $("#view-stats").innerHTML = `<div class="card"><h2>全体</h2>
    <div class="row">
      <div class="stat"><div class="v">${LOGS.length}</div><div class="l">総回答数</div></div>
      <div class="stat"><div class="v">${acc == null ? "–" : acc + "%"}</div><div class="l">正答率</div></div>
      <div class="stat"><div class="v">${streak}日</div><div class="l">継続</div></div>
    </div></div>
    <div class="card"><h2>分野別正答率</h2>${categoryRows.length ? categoryRows.map(row =>
      `<div style="display:flex;justify-content:space-between"><span>${esc(row.category)}</span><b>${row.accuracy}%</b></div><div class="bar"><span class="${row.accuracy < 60 ? "low" : ""}" style="width:${row.accuracy}%"></span></div>`
    ).join("") : `<div class="muted">まだ回答記録がありません。</div>`}</div>
    <div class="card"><h2>誤答原因</h2>${Object.entries(reasons).length ? Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) =>
      `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:5px 0"><span>${esc(reason)}</span><b>${count}回</b></div>`
    ).join("") : `<div class="muted">誤答原因を選ぶと集計されます。</div>`}</div>
    <div class="card"><h2>データ管理</h2>
      <div class="muted">アプリ版：<b>${APP_VERSION}</b> / 学習履歴はこの端末のブラウザ内に保存されています。</div>
      <button class="btn ghost small" id="exportData">学習データを書き出す（JSON）</button>
      <button class="btn ghost small" id="importData">学習データを読み込む</button>
      <input type="file" id="backupFile" accept=".json,application/json" style="display:none">
      <div class="preview"><b>端末内の復元用スナップショット</b><div class="muted">${recoveryText}</div><button class="btn ghost small" id="restoreRecovery" ${recovery ? "" : "disabled"}>直前の状態へ戻す</button></div>
      <details><summary>問題を追加する（全件事前検査）</summary>
        <div class="muted">全問題を検査し、新規・更新・エラー件数を確認してから一括保存します。</div>
        <textarea id="questionJson" placeholder='[{"id":"q200", ...}]'></textarea>
        <button class="btn ghost small" id="validateQuestions">JSONを検査する</button>
        <div id="questionPreview"></div>
        <button class="btn primary small" id="applyQuestions" disabled>バックアップ後に取り込む</button>
      </details>
      <details><summary>端末・PWA診断</summary><button class="btn ghost small" id="runDiagnostics">診断を実行</button><div id="diagnostics"></div></details>
      <details><summary>危険な操作</summary><button class="btn shu small" id="resetHistory">学習履歴をすべて削除</button></details>
    </div>`;

  $("#exportData").onclick = () => downloadBackup(true);
  $("#importData").onclick = () => $("#backupFile").click();
  $("#backupFile").onchange = importBackup;
  $("#restoreRecovery").onclick = restoreRecoverySnapshot;
  $("#validateQuestions").onclick = previewQuestions;
  $("#applyQuestions").onclick = applyQuestions;
  $("#runDiagnostics").onclick = runDiagnostics;
  $("#resetHistory").onclick = resetHistory;
}

function backupObject() {
  return {
    app: "eshikaku",
    version: 1,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    questions: QUESTIONS,
    logs: LOGS,
    srs: Object.values(SRS)
  };
}

async function downloadBackup(mark = true) {
  const data = backupObject();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `eshikaku_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (mark) {
    await putOne("meta", { key: "lastBackupAt", value: Date.now() });
    toast("バックアップを書き出しました");
  }
  return data;
}

async function saveRecoverySnapshot(reason) {
  const snapshot = backupObject();
  await putOne("meta", {
    key: "recoverySnapshot",
    at: Date.now(),
    reason,
    value: snapshot
  });
  return snapshot;
}

function validateBackupData(data) {
  if (!data || data.app !== "eshikaku") throw new Error("E資格 学習ナビのバックアップ形式ではありません");
  if (!Array.isArray(data.questions) || !Array.isArray(data.logs) || !Array.isArray(data.srs)) throw new Error("questions / logs / srs が配列ではありません");
  if (data.questions.length > 10000 || data.logs.length > 200000 || data.srs.length > 10000) throw new Error("バックアップ件数が上限を超えています");
  const questionIds = new Set();
  for (const q of data.questions) {
    if (!q || typeof q !== "object" || !/^[A-Za-z0-9._-]{1,80}$/.test(String(q.id || ""))) throw new Error("問題IDが不正です");
    if (questionIds.has(q.id)) throw new Error(`問題IDが重複しています：${q.id}`);
    questionIds.add(q.id);
  }
  for (const log of data.logs) {
    if (!log || typeof log !== "object" || typeof log.answerId !== "string" || !log.answerId) throw new Error("回答ログのIDが不正です");
  }
  for (const item of data.srs) {
    if (!item || typeof item !== "object" || typeof item.questionId !== "string" || !item.questionId) throw new Error("復習予定の問題IDが不正です");
  }
  return data;
}

function mergeBackupData(data) {
  return new Promise((resolve, reject) => {
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
    tx.objectStore("meta").put({ key: "lastRestoreAt", value: Date.now() });
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("復元に失敗しました"));
  });
}

function replaceLearningData(data) {
  return new Promise((resolve, reject) => {
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
    tx.objectStore("meta").put({ key: "lastRestoreAt", value: Date.now() });
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("復元に失敗しました"));
  });
}

async function importBackup(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    if (file.size > 50 * 1024 * 1024) throw new Error("バックアップファイルは50MB以下にしてください");
    const data = validateBackupData(JSON.parse(await file.text()));
    if (!confirm(`問題${data.questions.length}件、回答${data.logs.length}件、復習予定${data.srs.length}件を統合します。現在の状態は端末内の復元用スナップショットへ保存します。`)) return;
    await saveRecoverySnapshot("バックアップ読込前");
    await mergeBackupData(data);
    await loadAll();
    toast("学習データを読み込みました");
    await renderStats();
  } catch (error) {
    toast("読み込み失敗：" + (error.message || error));
  }
}

async function restoreRecoverySnapshot() {
  try {
    const meta = await getOne("meta", "recoverySnapshot");
    if (!meta || !meta.value) return toast("復元用スナップショットがありません");
    const data = validateBackupData(meta.value);
    if (!confirm("現在の問題・回答・復習予定を、直前の状態で置き換えます。よろしいですか？")) return;
    downloadBackup(false);
    await replaceLearningData(data);
    await loadAll();
    toast("直前の状態へ戻しました");
    await renderStats();
  } catch (error) {
    toast("復元失敗：" + (error.message || error));
  }
}

function stripFence(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
}

function validateQuestionBatch(raw) {
  const errors = [];
  const warnings = [];
  const text = stripFence(raw);
  if (!text) return { errors: ["JSONを貼り付けてください"], warnings, items: [] };
  if (new Blob([text]).size > 2 * 1024 * 1024) return { errors: ["一度に貼り付けられるJSONは2MBまでです"], warnings, items: [] };

  let array;
  try {
    array = JSON.parse(text);
  } catch (error) {
    return { errors: ["JSONとして解析できません：" + error.message], warnings, items: [] };
  }
  if (!Array.isArray(array)) return { errors: ["最上位は配列にしてください"], warnings, items: [] };
  if (!array.length) return { errors: ["問題が1件もありません"], warnings, items: [] };
  if (array.length > 500) errors.push("一度に取り込めるのは500問までです");

  const ids = new Set();
  const items = [];
  array.forEach((source, index) => {
    const at = `${index + 1}件目`;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      errors.push(`${at}: オブジェクトではありません`);
      return;
    }
    const q = Object.assign({}, source);
    q.id = String(q.id || "");
    if (!/^[A-Za-z0-9._-]{1,80}$/.test(q.id)) errors.push(`${at}: idは英数字・._-で1〜80文字にしてください`);
    if (ids.has(q.id)) errors.push(`${at}: バッチ内でidが重複しています（${q.id}）`);
    ids.add(q.id);

    if (typeof q.question !== "string" || !q.question.trim() || q.question.length > 2000) errors.push(`${at}: questionは1〜2000文字です`);
    if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 8 || q.choices.some(c => typeof c !== "string" || !c.trim() || c.length > 500)) errors.push(`${at}: choicesは空欄なし2〜8件、各500文字以内です`);
    if (!Number.isInteger(q.answer) || !Array.isArray(q.choices) || q.answer < 0 || q.answer >= q.choices.length) errors.push(`${at}: answerがchoicesの範囲外です`);
    if (typeof q.explanation !== "string" || !q.explanation.trim() || q.explanation.length > 5000) errors.push(`${at}: explanationは1〜5000文字です`);

    q.category = String(q.category || "未分類").slice(0, 100);
    q.topic = String(q.topic || "").slice(0, 150);
    q.difficulty = String(q.difficulty || "").slice(0, 30);
    q.type = String(q.type || "choice").slice(0, 30);
    q.labTag = String(q.labTag || "");
    if (!ALLOWED_LAB_TAGS.has(q.labTag)) errors.push(`${at}: labTagは空欄/sobel/pool/diff/videoのみです`);

    ["terms", "formulas"].forEach(key => {
      if (q[key] == null) return;
      if (!Array.isArray(q[key]) || q[key].some(value => typeof value !== "string" || value.length > 200)) errors.push(`${at}: ${key}は200文字以内の文字列配列です`);
    });
    if (q.code != null && (typeof q.code !== "string" || q.code.length > 10000)) errors.push(`${at}: codeは10000文字以内です`);
    if (q.sources != null) {
      if (!Array.isArray(q.sources)) {
        errors.push(`${at}: sourcesは配列です`);
      } else if (q.sources.length > 20) {
        errors.push(`${at}: sourcesは20件までです`);
      } else {
        q.sources.forEach((sourceItem, sourceIndex) => {
          if (!sourceItem || typeof sourceItem !== "object" || Array.isArray(sourceItem)) {
            errors.push(`${at}: sources[${sourceIndex}]がオブジェクトではありません`);
            return;
          }
          if (sourceItem.url && !isHttpUrl(sourceItem.url)) errors.push(`${at}: sources[${sourceIndex}].urlはhttp/httpsのみです`);
          if (sourceItem.title != null && (typeof sourceItem.title !== "string" || sourceItem.title.length > 500)) errors.push(`${at}: sources[${sourceIndex}].titleは500文字以内です`);
          if (sourceItem.why != null && (typeof sourceItem.why !== "string" || sourceItem.why.length > 1000)) errors.push(`${at}: sources[${sourceIndex}].whyは1000文字以内です`);
        });
      }
    }
    if (JSON.stringify(q).length > 30000) errors.push(`${at}: 1問のデータが大きすぎます`);
    items.push(q);
  });
  return { errors, warnings, items };
}

function previewQuestions() {
  const result = validateQuestionBatch($("#questionJson").value);
  const box = $("#questionPreview");
  pendingQuestionBatch = null;
  $("#applyQuestions").disabled = true;
  if (result.errors.length) {
    box.innerHTML = `<div class="preview error"><b>エラー ${result.errors.length}件</b><ul>${result.errors.slice(0, 30).map(error => `<li>${esc(error)}</li>`).join("")}</ul>${result.errors.length > 30 ? `<div>ほか${result.errors.length - 30}件</div>` : ""}</div>`;
    return;
  }
  const existing = new Set(QUESTIONS.map(q => q.id));
  const newCount = result.items.filter(q => !existing.has(q.id)).length;
  const updateCount = result.items.length - newCount;
  pendingQuestionBatch = result.items;
  box.innerHTML = `<div class="preview"><span class="tag ok">検査OK</span><b>${result.items.length}問</b><div>新規：${newCount}問 / 更新：${updateCount}問</div><div class="muted">更新は同じidの問題を置き換えます。回答履歴・復習予定は保持します。</div></div>`;
  $("#applyQuestions").disabled = false;
}

async function applyQuestions() {
  if (!pendingQuestionBatch) return;
  if (!confirm(`${pendingQuestionBatch.length}問を一括保存します。現在のバックアップをダウンロードし、端末内にも復元用スナップショットを保存します。`)) return;
  const button = $("#applyQuestions");
  button.disabled = true;
  try {
    downloadBackup(false);
    await saveRecoverySnapshot("問題取り込み前");
    await putBatch("questions", pendingQuestionBatch);
    await loadAll();
    pendingQuestionBatch = null;
    $("#questionJson").value = "";
    toast("問題を取り込みました");
    await renderStats();
  } catch (error) {
    button.disabled = false;
    toast("取り込み失敗：" + (error.message || error));
  }
}

function clearHistoryAtomic() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["logs", "srs"], "readwrite");
    tx.objectStore("logs").clear();
    tx.objectStore("srs").clear();
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("削除に失敗しました"));
  });
}

async function resetHistory() {
  if (!confirm("回答履歴と復習予定をすべて削除します。問題は残ります。現在のバックアップも作成します。")) return;
  try {
    downloadBackup(false);
    await saveRecoverySnapshot("学習履歴削除前");
    await clearHistoryAtomic();
    await loadAll();
    session = null;
    toast("学習履歴を削除しました");
    await renderStats();
  } catch (error) {
    toast("削除失敗：" + (error.message || error));
  }
}

async function runDiagnostics() {
  const box = $("#diagnostics");
  box.innerHTML = `<div class="muted">確認中…</div>`;
  const rows = [];
  const add = (name, status, detail) => rows.push({ name, status, detail });
  add("アプリ版", "ok", APP_VERSION);
  add("安全な接続", isSecureContext ? "ok" : "ng", isSecureContext ? "HTTPS / secure context" : "カメラにはHTTPSが必要です");
  add("IndexedDB", db ? "ok" : "ng", db ? `${DB_NAME} / 問題${QUESTIONS.length}件 / 回答${LOGS.length}件` : "利用できません");
  try {
    const key = "diag-" + Date.now();
    await putOne("meta", { key, value: Date.now() });
    await deleteOne("meta", key);
    add("IndexedDB書き込み", "ok", "書き込み・削除テスト成功");
  } catch (error) {
    add("IndexedDB書き込み", "ng", error.message || String(error));
  }
  add("Service Worker", "serviceWorker" in navigator ? (navigator.serviceWorker.controller ? "ok" : "warn") : "ng", "serviceWorker" in navigator ? (navigator.serviceWorker.controller ? "制御中" : "対応済み・まだ制御前") : "非対応");
  add("カメラAPI", navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? "ok" : "ng", "許可要求はカメラ起動時のみ行います");
  add("Canvas 2D", document.createElement("canvas").getContext("2d") ? "ok" : "ng", "画像処理に使用");
  add("ファイル読込", "FileReader" in window ? "ok" : "ng", "JSON・動画選択");
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  add("利用形態", "ok", standalone ? "ホーム画面アプリ / PWA" : "ブラウザタブ");
  add("オンライン", navigator.onLine ? "ok" : "warn", navigator.onLine ? "オンライン" : "オフライン");
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const storage = await navigator.storage.estimate();
      add("保存容量", "ok", `${Math.round((storage.usage || 0) / 1024 / 1024)}MB使用 / 約${Math.round((storage.quota || 0) / 1024 / 1024)}MB上限`);
    } catch (_) {}
  }
  add("ブラウザ情報", "ok", navigator.userAgent);

  box.innerHTML = `<table class="diagtable">${rows.map(row => `<tr><th>${esc(row.name)}</th><td><span class="diag-${row.status}">${row.status === "ok" ? "OK" : row.status === "warn" ? "注意" : "NG"}</span><div class="smallnote">${esc(row.detail)}</div></td></tr>`).join("")}</table><button class="btn ghost small" id="copyDiag">診断結果をコピー</button>`;
  $("#copyDiag").onclick = () => {
    const text = rows.map(row => `${row.name}: ${row.status.toUpperCase()} / ${row.detail}`).join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("診断結果をコピーしました")).catch(() => prompt("コピーしてください", text));
    } else {
      prompt("コピーしてください", text);
    }
  };
}
