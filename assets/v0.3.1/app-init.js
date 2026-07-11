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
  if (version < 5 && typeof SYLLABUS_QUESTIONS !== "undefined") {
    for (const question of SYLLABUS_QUESTIONS) {
      if (!await getOne("questions", question.id)) await putOne("questions", question);
    }
  }
  if (version < 5) await putOne("meta", { key: "seedVersion", value: 5, at: Date.now() });
}

async function init() {
  try {
    $("#hdrDate").textContent = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
    await openDB();
    await seed();
    await loadAll();
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
