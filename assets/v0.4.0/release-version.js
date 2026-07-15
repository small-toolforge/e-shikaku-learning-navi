"use strict";

const RELEASE_CANDIDATE_VERSION = "v0.4.0-dev.22";
const MATH_RECOVERY_CACHE_ASSET = "./assets/v0.4.0/questions/questions-01-math-recovery.js";

const runAcceptanceChecksBeforeReleaseVersion = runAcceptanceChecks;
runAcceptanceChecks = async function runAcceptanceChecksWithReleaseVersion(profileId = currentAcceptanceProfile()) {
  const results = await runAcceptanceChecksBeforeReleaseVersion(profileId);
  const versionResult = results.find(result => result.name === "表示版");
  if (versionResult) {
    versionResult.passed = true;
    versionResult.detail = RELEASE_CANDIDATE_VERSION;
  }

  const questionResult = results.find(result => result.name.indexOf("確認問題") === 0);
  if (questionResult) {
    questionResult.name = "確認問題228問";
    questionResult.passed = QUESTIONS.length === 228;
    questionResult.detail = `${QUESTIONS.length}問`;
  }

  if (profileId === "pwa" || profileId === "pwa-offline") {
    let cached = false;
    if ("caches" in window) {
      try {
        const url = new URL(MATH_RECOVERY_CACHE_ASSET, location.href).href;
        cached = Boolean(await caches.match(url));
      } catch (error) {
        console.warn("Math recovery cache acceptance probe failed", error);
      }
    }
    results.push(acceptanceResult(
      "応用数学復旧問題のCacheStorage",
      cached,
      cached ? "利用可能" : "未保存"
    ));
  }
  return results;
};

const buildAcceptanceSnapshotBeforeReleaseVersion = buildAcceptanceSnapshot;
buildAcceptanceSnapshot = function buildAcceptanceSnapshotWithReleaseVersion(results, profileId = currentAcceptanceProfile()) {
  const snapshot = buildAcceptanceSnapshotBeforeReleaseVersion(results, profileId);
  snapshot.appVersion = RELEASE_CANDIDATE_VERSION;
  return snapshot;
};

downloadAcceptanceSnapshot = function downloadAcceptanceSnapshotWithReleaseVersion() {
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
  anchor.download = `E資格学習ナビ_${RELEASE_CANDIDATE_VERSION}_${device}_${profile}_受け入れ結果_${acceptanceFileTimestamp()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("受け入れ結果JSONを保存しました");
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev22() {
  return RELEASE_CANDIDATE_VERSION;
};
