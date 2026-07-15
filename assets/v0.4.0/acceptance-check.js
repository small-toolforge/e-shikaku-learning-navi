"use strict";

const ACCEPTANCE_CHECK_VERSION = "v0.4.0-dev.19";
const ACCEPTANCE_CHECK_SCHEMA = "eshikaku_acceptance_result_v1";
const ACCEPTANCE_PROFILES = {
  standard: {
    label: "標準セルフチェック",
    description: "Windowsブラウザなどで、教材件数・参照・IndexedDB・Service Workerを確認します。"
  },
  pwa: {
    label: "ホーム画面PWA",
    description: "標準項目に加え、PWA起動・Service Worker制御・CacheStorage・タッチ操作・Secure Contextを確認します。"
  },
  "pwa-offline": {
    label: "PWA・オフライン",
    description: "ホーム画面PWA項目に加え、通信を切った状態であることを確認します。"
  }
};
const ACCEPTANCE_CACHE_ASSETS = [
  "./index.html",
  "./assets/v0.3.1/app-data.js",
  "./assets/v0.4.0/application-atlas-data.js",
  "./assets/v0.4.0/cards/cards-01-math.js",
  "./assets/v0.4.0/questions/questions-01-math.js",
  "./assets/v0.4.0/questions/questions-04-deep-learning-application.js",
  "./assets/v0.4.0/card-progress.js",
  "./assets/v0.4.0/exam-mode.js",
  "./assets/v0.4.0/acceptance-check.js",
  "./assets/v0.4.0/backup-import.js"
];
let latestAcceptanceSnapshot = null;
let acceptanceProfile = "standard";

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
  if (!("serviceWorker" in navigator) || location.protocol.indexOf("http") !== 0) {
    return { passed: false, detail: "HTTP(S)環境で確認してください" };
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration("./");
    return { passed: Boolean(registration), detail: registration ? "登録済み" : "未登録" };
  } catch (error) {
    return { passed: false, detail: error.message || String(error) };
  }
}

function serviceWorkerControlProbe() {
  if (!("serviceWorker" in navigator)) return { passed: false, detail: "Service Worker非対応" };
  return {
    passed: Boolean(navigator.serviceWorker.controller),
    detail: navigator.serviceWorker.controller ? "この画面を制御中" : "未制御：PWAを閉じて再起動してください"
  };
}

async function cacheStorageProbe() {
  if (!("caches" in window)) return { passed: false, detail: "CacheStorage非対応" };
  const missing = [];
  for (const asset of ACCEPTANCE_CACHE_ASSETS) {
    try {
      const url = new URL(asset, location.href).href;
      const response = await caches.match(url);
      if (!response) missing.push(asset);
    } catch (error) {
      missing.push(asset);
    }
  }
  return {
    passed: missing.length === 0,
    detail: missing.length ? `未保存：${missing.slice(0, 4).join(", ")}` : `${ACCEPTANCE_CACHE_ASSETS.length}件利用可能`
  };
}

function touchProbe() {
  const points = Number(navigator.maxTouchPoints || 0);
  const supported = points > 0 || "ontouchstart" in window;
  return { passed: supported, detail: supported ? `maxTouchPoints=${points}` : "タッチ入力を検出できません" };
}

function acceptanceDisplayMode() {
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return "standalone-pwa";
  if (navigator.standalone === true) return "standalone-pwa";
  return "browser";
}

function acceptanceDeviceFamily() {
  const ua = navigator.userAgent || "";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  return "Other";
}

function defaultAcceptanceProfile() {
  return acceptanceDisplayMode() === "standalone-pwa" ? "pwa" : "standard";
}

function currentAcceptanceProfile() {
  return ACCEPTANCE_PROFILES[acceptanceProfile] ? acceptanceProfile : "standard";
}

function acceptanceProfileOptions() {
  return Object.entries(ACCEPTANCE_PROFILES).map(([id, profile]) =>
    `<option value="${esc(id)}" ${id === acceptanceProfile ? "selected" : ""}>${esc(profile.label)}</option>`
  ).join("");
}

function acceptanceProfileHelp() {
  const profile = ACCEPTANCE_PROFILES[currentAcceptanceProfile()];
  return profile ? profile.description : "";
}

async function runAcceptanceChecks(profileId = currentAcceptanceProfile()) {
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

  const results = [
    acceptanceResult("表示版", ACCEPTANCE_CHECK_VERSION === "v0.4.0-dev.19", ACCEPTANCE_CHECK_VERSION),
    acceptanceResult("シラバスカード438枚", cards.length === 438, `${cards.length}枚`),
    acceptanceResult("確認問題204問", QUESTIONS.length === 204, `${QUESTIONS.length}問`),
    acceptanceResult("図解16件", atlasCountForAcceptance() === 16, `${atlasCountForAcceptance()}件`),
    acceptanceResult("問題ID重複なし", questionDuplicates.length === 0, questionDuplicates.join(", ")),
    acceptanceResult("カードID重複なし", cardDuplicates.length === 0, cardDuplicates.join(", ")),
    acceptanceResult("問題→カード参照", missingCardLinks.length === 0, missingCardLinks.slice(0, 5).join(", ")),
    acceptanceResult("カード→問題参照", missingQuestionLinks.length === 0, missingQuestionLinks.slice(0, 5).join(", ")),
    acceptanceResult("出題範囲3分類", scopeCounts.exam > 0 && scopeCounts.optional > 0 && scopeCounts.mixed > 0, `対象${scopeCounts.exam}・任意${scopeCounts.optional}・混在${scopeCounts.mixed}`),
    acceptanceResult("試験直前の対象問題", eligibleQuestions.length > 0 && eligibleQuestions.length + optionalQuestions.length === QUESTIONS.length, `対象${eligibleQuestions.length}・除外${optionalQuestions.length}`),
    acceptanceResult("IndexedDB書込・読込・削除", idb, idb ? "正常" : "失敗"),
    acceptanceResult("Service Worker登録", sw.passed, sw.detail),
    acceptanceResult("通信状態取得", true, navigator.onLine ? "オンライン" : "オフライン")
  ];

  if (profileId === "pwa" || profileId === "pwa-offline") {
    const control = serviceWorkerControlProbe();
    const cache = await cacheStorageProbe();
    const touch = touchProbe();
    results.push(
      acceptanceResult("ホーム画面PWA起動", acceptanceDisplayMode() === "standalone-pwa", acceptanceDisplayMode()),
      acceptanceResult("Service Worker制御", control.passed, control.detail),
      acceptanceResult("主要教材のCacheStorage", cache.passed, cache.detail),
      acceptanceResult("タッチ操作", touch.passed, touch.detail),
      acceptanceResult("Secure Context", window.isSecureContext, window.isSecureContext ? "有効" : "無効")
    );
  }

  if (profileId === "pwa-offline") {
    results.push(acceptanceResult("オフライン状態", !navigator.onLine, navigator.onLine ? "オンラインのままです" : "オフライン"));
  }

  return results;
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

function buildAcceptanceSnapshot(results, profileId = currentAcceptanceProfile()) {
  const passed = results.filter(result => result.passed).length;
  const profile = ACCEPTANCE_PROFILES[profileId] || ACCEPTANCE_PROFILES.standard;
  return {
    schema: ACCEPTANCE_CHECK_SCHEMA,
    appVersion: ACCEPTANCE_CHECK_VERSION,
    checkedAt: new Date().toISOString(),
    profile: { id: profileId, label: profile.label },
    summary: {
      passed,
      total: results.length,
      allPassed: passed === results.length
    },
    environment: {
      deviceFamily: acceptanceDeviceFamily(),
      displayMode: acceptanceDisplayMode(),
      language: navigator.language || "",
      online: navigator.onLine,
      secureContext: window.isSecureContext,
      maxTouchPoints: Number(navigator.maxTouchPoints || 0),
      serviceWorkerControlled: Boolean(navigator.serviceWorker && navigator.serviceWorker.controller),
      location: `${location.origin}${location.pathname}`,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      screen: { width: screen.width, height: screen.height, pixelRatio: window.devicePixelRatio || 1 },
      userAgent: navigator.userAgent || ""
    },
    contents: {
      syllabusCards: allSyllabusCards().length,
      questions: QUESTIONS.length,
      atlases: atlasCountForAcceptance(),
      cacheAssetsChecked: profileId === "standard" ? 0 : ACCEPTANCE_CACHE_ASSETS.length,
      database: DB_NAME,
      databaseVersion: DB_VER
    },
    checks: results.map(result => ({
      name: result.name,
      passed: result.passed,
      detail: result.detail
    })),
    privacy: "回答履歴、問題SRS、カード理解度、バックアップ内容は含みません。"
  };
}

function acceptanceFileTimestamp(date = new Date()) {
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function safeAcceptanceFilePart(value) {
  return String(value || "").replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "").slice(0, 40) || "不明";
}

function downloadAcceptanceSnapshot() {
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
  anchor.download = `E資格学習ナビ_${ACCEPTANCE_CHECK_VERSION}_${device}_${profile}_受け入れ結果_${acceptanceFileTimestamp()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("受け入れ結果JSONを保存しました");
}

function resetAcceptanceOutput() {
  latestAcceptanceSnapshot = null;
  const output = $("#acceptanceCheckOutput");
  const saveButton = $("#saveAcceptanceCheck");
  if (output) output.innerHTML = "";
  if (saveButton) saveButton.disabled = true;
}

async function executeAcceptanceCheck() {
  const output = $("#acceptanceCheckOutput");
  const button = $("#runAcceptanceCheck");
  const saveButton = $("#saveAcceptanceCheck");
  if (!output) return;
  if (button) button.disabled = true;
  if (saveButton) saveButton.disabled = true;
  output.innerHTML = `<div class="muted">確認中です…</div>`;
  try {
    const profileId = currentAcceptanceProfile();
    const results = await runAcceptanceChecks(profileId);
    latestAcceptanceSnapshot = buildAcceptanceSnapshot(results, profileId);
    output.innerHTML = acceptanceCheckHtml(results);
    if (saveButton) saveButton.disabled = false;
  } catch (error) {
    latestAcceptanceSnapshot = null;
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
  acceptanceProfile = defaultAcceptanceProfile();
  root.insertAdjacentHTML("afterbegin", `<div class="card" id="acceptanceCheckPanel">
    <div class="eyebrow">v0.4.0受け入れ準備</div><h2>実行時セルフチェック</h2>
    <div class="muted">教材件数、ID重複、相互参照、出題範囲、IndexedDB、Service Workerをこの端末上で確認します。学習履歴は変更しません。</div>
    <div class="acceptance-profile"><label><span class="label">確認プロファイル</span><select id="acceptanceProfile">${acceptanceProfileOptions()}</select></label><div class="muted" id="acceptanceProfileHelp">${esc(acceptanceProfileHelp())}</div></div>
    <div class="acceptance-actions"><button class="btn primary" id="runAcceptanceCheck">セルフチェックを実行</button><button class="btn ghost" id="saveAcceptanceCheck" disabled>結果JSONを保存</button></div>
    <div class="muted acceptance-privacy-note">保存する結果には端末・表示環境と検査結果だけを含み、回答履歴やカード理解度は含みません。</div>
    <div id="acceptanceCheckOutput" class="acceptance-output"></div>
  </div>`);
  $("#acceptanceProfile").onchange = event => {
    acceptanceProfile = event.target.value;
    $("#acceptanceProfileHelp").textContent = acceptanceProfileHelp();
    resetAcceptanceOutput();
  };
  $("#runAcceptanceCheck").onclick = executeAcceptanceCheck;
  $("#saveAcceptanceCheck").onclick = downloadAcceptanceSnapshot;
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev19() {
  return ACCEPTANCE_CHECK_VERSION;
};
