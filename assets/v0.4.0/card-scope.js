"use strict";

const CARD_SCOPE_VERSION = "v0.4.0-dev.13";
let syllabusCardScopeFilter = "all";

const OPTIONAL_WHOLE_SYLLABUS_IDS = new Set([
  "1-1-1", "1-2-1",
  "2-1-1", "2-1-2", "2-1-3", "2-1-4", "2-1-5", "2-1-6", "2-1-7", "2-1-8", "2-1-9", "2-1-10",
  "3-2-1", "3-2-3", "3-2-4", "3-3-1", "3-3-2", "3-3-3", "3-7-4", "3-7-5",
  "4-1-2", "4-2-3", "4-5-1", "4-5-2", "4-5-3", "4-8-2", "4-8-3", "4-8-5", "4-9-2",
  "5-1-1", "5-2-2"
]);

const MIXED_SCOPE_SYLLABUS_IDS = new Set([
  "3-1-2", "3-1-3", "3-1-4", "3-4-1", "3-7-1", "3-7-3",
  "4-4-2", "4-6-1", "4-6-2", "4-6-3", "4-7-1", "4-8-4"
]);

function cardScopeFor(item) {
  if (!item || !item.major || !item.syllabusId) return "legacy";
  if (item.scope === "exam" || item.scope === "optional" || item.scope === "mixed") return item.scope;
  if (OPTIONAL_WHOLE_SYLLABUS_IDS.has(item.syllabusId)) return "optional";
  if (MIXED_SCOPE_SYLLABUS_IDS.has(item.syllabusId)) return "mixed";
  return "exam";
}

function cardScopeLabel(scope) {
  if (scope === "optional") return "オプション（出題対象外）";
  if (scope === "mixed") return "出題対象・オプション混在";
  if (scope === "exam") return "出題対象";
  return "基礎カード";
}

function cardScopeTagClass(scope) {
  if (scope === "optional") return "scope-optional";
  if (scope === "mixed") return "scope-mixed";
  if (scope === "exam") return "scope-exam";
  return "scope-legacy";
}

const cardMetaBeforeScope = cardMeta;
cardMeta = function cardMetaWithScope(item) {
  if (!item || !item.major) return cardMetaBeforeScope(item);
  const scope = cardScopeFor(item);
  return `<div class="card-meta">
    <span class="tag ai">${esc(item.major)}</span>
    <span class="tag">${esc(item.group || "")}</span>
    <span class="tag">${esc(item.syllabusId || "")}</span>
    <span class="tag ${cardScopeTagClass(scope)}">${esc(cardScopeLabel(scope))}</span>
  </div>`;
};

const filteredSyllabusCardsBeforeScope = filteredSyllabusCards;
filteredSyllabusCards = function filteredSyllabusCardsWithScope() {
  return filteredSyllabusCardsBeforeScope().filter(item => {
    if (syllabusCardScopeFilter === "all") return true;
    return cardScopeFor(item) === syllabusCardScopeFilter;
  });
};

function cardScopeCounts(collection) {
  const counts = { exam: 0, optional: 0, mixed: 0, legacy: 0 };
  collection.forEach(item => { counts[cardScopeFor(item)] += 1; });
  return counts;
}

function refreshCardScopeSummary() {
  const root = $("#cardScopeSummary");
  if (!root || cardTab === "atlas") return;
  const counts = cardScopeCounts(currentCardCollection());
  root.innerHTML = `<span class="tag scope-exam">出題対象 ${counts.exam}</span><span class="tag scope-optional">オプション ${counts.optional}</span><span class="tag scope-mixed">混在 ${counts.mixed}</span>${counts.legacy ? `<span class="tag">基礎カード ${counts.legacy}</span>` : ""}`;
}

function installCardScopeToolbar() {
  const toolbar = $("#view-cards .cards-toolbar");
  if (!toolbar || $("#cardScopeControls")) return;
  const controls = document.createElement("div");
  controls.id = "cardScopeControls";
  controls.className = "card-scope-toolbar";
  controls.innerHTML = `<div class="cards-toolbar-row card-scope-filter-row">
      <label><span class="label">出題範囲</span><select id="syllabusCardScopeFilter">
        <option value="all">すべて表示</option>
        <option value="exam">出題対象</option>
        <option value="optional">オプション（出題対象外）</option>
        <option value="mixed">出題対象・オプション混在</option>
      </select></label>
      <div class="card-scope-note"><b>公式シラバス2026準拠</b><div>グレー網掛けをオプションとして反映しています。1つの小項目内で白・グレーが混在するものは、安全側に「混在」と表示します。</div></div>
    </div>
    <div class="card-scope-summary" id="cardScopeSummary"></div>`;
  const progress = $("#cardProgressControls");
  if (progress) progress.insertAdjacentElement("afterend", controls);
  else toolbar.appendChild(controls);
  $("#syllabusCardScopeFilter").value = syllabusCardScopeFilter;
  $("#syllabusCardScopeFilter").onchange = event => {
    syllabusCardScopeFilter = event.target.value;
    renderSyllabusCardResults();
  };
  refreshCardScopeSummary();
}

const renderSyllabusCardResultsBeforeScope = renderSyllabusCardResults;
renderSyllabusCardResults = function renderSyllabusCardResultsWithScope() {
  renderSyllabusCardResultsBeforeScope();
  refreshCardScopeSummary();
};

const renderCardsBeforeCardScope = renderCards;
renderCards = function renderCardsWithCardScope() {
  renderCardsBeforeCardScope();
  if (cardTab !== "atlas") installCardScopeToolbar();
};

currentCardsDisplayVersion = function currentCardsDisplayVersionDev13() {
  return CARD_SCOPE_VERSION;
};
