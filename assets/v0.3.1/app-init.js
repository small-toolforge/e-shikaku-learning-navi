"use strict";

async function seed() {
  const meta = await getOne("meta", "seedVersion");
  const version = meta ? Number(meta.value) || 0 : 0;
  if (version < 2) {
    for (const question of SEED_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 3 && typeof ATLAS_QUESTIONS !== "undefined") {
    for (const question of ATLAS_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 4 && typeof APPLICATION_QUESTIONS !== "undefined") {
    for (const question of APPLICATION_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 7 && typeof SYLLABUS_QUESTIONS !== "undefined") {
    for (const question of SYLLABUS_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 8 && typeof MATH_QUESTIONS !== "undefined") {
    const repairIds = new Set(["math-q010", "math-q016", "math-q024"]);
    for (const question of MATH_QUESTIONS) {
      if (repairIds.has(question.id)) await putOne("questions", question);
    }
  }
  if (version < 8) await putOne("meta", { key: "seedVersion", value: 8, at: Date.now() });
  if (version < 9 && typeof DEEP_LEARNING_APPLICATION_QUESTIONS !== "undefined") {
    for (const question of DEEP_LEARNING_APPLICATION_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 9) await putOne("meta", { key: "seedVersion", value: 9, at: Date.now() });
  if (version < 10 && typeof MATH_RECOVERY_QUESTIONS !== "undefined") {
    for (const question of MATH_RECOVERY_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 10) await putOne("meta", { key: "seedVersion", value: 10, at: Date.now() });
  if (version < 11 && typeof MACHINE_LEARNING_RECOVERY_QUESTIONS !== "undefined") {
    for (const question of MACHINE_LEARNING_RECOVERY_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 11) await putOne("meta", { key: "seedVersion", value: 11, at: Date.now() });
  if (version < 12 && typeof PASS_RECOVERY_QUESTIONS !== "undefined") {
    for (const question of PASS_RECOVERY_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 12) await putOne("meta", { key: "seedVersion", value: 12, at: Date.now() });
}

function loadAppExtension(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-app-extension="${src}"]`);
    if (existing) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.dataset.appExtension = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`追加機能を読み込めませんでした: ${src}`));
    document.head.appendChild(script);
  });
}

async function init() {
  try {
    $("#hdrDate").textContent = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
    await openDB();
    await loadAppExtension("./assets/v0.4.0/questions/questions-02-machine-learning-recovery.js?v=dev28");
    await loadAppExtension("./assets/v0.4.0/questions/questions-06-pass-recovery.js?v=dev28");
    await seed();
    await loadAll();
    await loadAppExtension("./assets/v0.4.0/pre-exam-review.js?v=dev28");
    await renderHome();
  } catch (error) {
    $("#view-home").innerHTML = `<div class="card"><h2>初期化できませんでした</h2><div class="muted">${esc(error.message || error)}</div><button class="btn primary" onclick="location.reload()">再読み込み</button></div>`;
    console.error(error);
  }
}

window.addEventListener("pagehide", stopLab);
window.addEventListener("error", event => console.error("global error", event.error || event.message));
init();

if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => console.warn("SW registration failed", error));
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      if (session) toast("新しい版があります。学習終了後に再読み込みしてください");
      else location.reload();
    });
  });
}
