"use strict";

let syllabusCardSearch = "";
let syllabusCardMajor = "all";
let syllabusCardGroup = "all";

function syllabusCardTabs() {
  return `<div class="subtabs atlas-main-tabs">
    <button id="tabTerm" class="${cardTab === "term" ? "active" : ""}">用語</button>
    <button id="tabFormula" class="${cardTab === "formula" ? "active" : ""}">数式</button>
    <button id="tabCompare" class="${cardTab === "compare" ? "active" : ""}">比較</button>
    <button id="tabAtlas" class="${cardTab === "atlas" ? "active" : ""}">論文図解</button>
  </div>`;
}

function bindSyllabusCardTabs() {
  $("#tabTerm").onclick = () => { cardTab = "term"; syllabusCardGroup = "all"; renderCards(); };
  $("#tabFormula").onclick = () => { cardTab = "formula"; syllabusCardGroup = "all"; renderCards(); };
  $("#tabCompare").onclick = () => { cardTab = "compare"; syllabusCardGroup = "all"; renderCards(); };
  $("#tabAtlas").onclick = () => { cardTab = "atlas"; renderCards(); };
}

function currentCardCollection() {
  if (cardTab === "formula") return FORMULAS;
  if (cardTab === "compare") return COMPARES;
  return TERMS;
}

function syllabusCardText(item) {
  const values = [
    item.id, item.major, item.group, item.syllabusId, item.en, item.kana, item.ja, item.full,
    item.desc, item.examCue, item.confusion, item.name, item.fx, item.yomi, item.imi,
    item.oboe, item.rei, item.variables, item.mistake, item.key,
    item.l && item.l.t, item.l && item.l.k, item.l && item.l.j, item.l && item.l.d,
    item.r && item.r.t, item.r && item.r.k, item.r && item.r.j, item.r && item.r.d
  ];
  return values.filter(Boolean).join(" ").toLocaleLowerCase("ja-JP");
}

function syllabusCardMajorName(item) {
  return item.major || "基礎カード";
}

function syllabusCardGroupName(item) {
  return item.group || "基礎カード";
}

function filteredSyllabusCards() {
  const query = syllabusCardSearch.trim().toLocaleLowerCase("ja-JP");
  return currentCardCollection().filter(item => {
    if (syllabusCardMajor !== "all" && syllabusCardMajorName(item) !== syllabusCardMajor) return false;
    if (syllabusCardGroup !== "all" && syllabusCardGroupName(item) !== syllabusCardGroup) return false;
    return !query || syllabusCardText(item).includes(query);
  });
}

function cardMeta(item) {
  if (!item.major) return `<div class="card-meta"><span class="tag">基礎カード</span></div>`;
  return `<div class="card-meta">
    <span class="tag ai">${esc(item.major)}</span>
    <span class="tag">${esc(item.group || "")}</span>
    <span class="tag">${esc(item.syllabusId || "")}</span>
    <span class="tag ok">シラバス掲載</span>
  </div>`;
}

function relatedCardActions(item) {
  const atlas = item.atlasId ? `<button class="btn ghost small" data-card-atlas="${esc(item.atlasId)}">関連図解</button>` : "";
  const questionIds = Array.isArray(item.questionIds) ? item.questionIds : [];
  const quiz = questionIds.length
    ? `<button class="btn primary small" data-card-questions="${esc(questionIds.join(","))}">関連問題</button><span class="card-related-count">${questionIds.length}問</span>`
    : "";
  if (!atlas && !quiz) return "";
  return `<div class="card-actions">${atlas}${quiz}</div>`;
}

function termCardHtml(term) {
  return `<article class="card syllabus-term-card">
    ${cardMeta(term)}
    <div class="termword"><ruby>${esc(term.en)}<rt>${esc(term.kana)}</rt></ruby></div>
    ${term.full ? `<div class="muted">${esc(term.full)}</div>` : ""}
    <div><b>${esc(term.ja)}</b></div>
    <p class="muted">${esc(term.desc)}</p>
    ${term.en ? `<button class="speak-card" data-speak-card="${esc(term.en)}" aria-label="${esc(term.en)}を読み上げる">🔊 英語を聞く</button>` : ""}
    ${term.examCue ? `<div class="card-exam-cue"><b>試験での見分け方</b><div>${esc(term.examCue)}</div></div>` : ""}
    ${term.confusion ? `<div class="card-confusion"><b>混同しやすい点</b><div>${esc(term.confusion)}</div></div>` : ""}
    ${relatedCardActions(term)}
  </article>`;
}

function formulaCardHtml(formula) {
  return `<article class="card card-formula">
    ${cardMeta(formula)}
    <h2>${esc(formula.name)}</h2>
    <div class="fx">${esc(formula.fx)}</div>
    <div class="label">読み方</div><div>${esc(formula.yomi)}</div>
    <div class="label">意味</div><div>${esc(formula.imi)}</div>
    <div class="label">覚え方</div><div>${esc(formula.oboe)}</div>
    ${formula.variables ? `<div class="label">記号</div><div class="muted">${esc(formula.variables)}</div>` : ""}
    <div class="label">具体例</div><div class="muted">${esc(formula.rei)}</div>
    ${formula.mistake ? `<div class="card-confusion"><b>よくある誤り</b><div>${esc(formula.mistake)}</div></div>` : ""}
    ${relatedCardActions(formula)}
  </article>`;
}

function compareCardHtml(compare) {
  return `<article class="card compare-card">
    ${cardMeta(compare)}
    <div class="cmprow">
      <div class="cmpcol"><b><ruby>${esc(compare.l.t)}<rt>${esc(compare.l.k)}</rt></ruby></b><div>${esc(compare.l.j)}</div><div class="muted">${esc(compare.l.d)}</div></div>
      <div class="cmpvs">vs</div>
      <div class="cmpcol"><b><ruby>${esc(compare.r.t)}<rt>${esc(compare.r.k)}</rt></ruby></b><div>${esc(compare.r.j)}</div><div class="muted">${esc(compare.r.d)}</div></div>
    </div>
    <div class="label">見分け方</div><div style="color:var(--shu);font-weight:700">${esc(compare.key)}</div>
    ${relatedCardActions(compare)}
  </article>`;
}

function renderSyllabusCardResults() {
  const list = filteredSyllabusCards();
  const total = currentCardCollection().length;
  const syllabusTotal = currentCardCollection().filter(item => item.major).length;
  $("#syllabusCardCount").innerHTML = `<b>${list.length}枚を表示</b><span class="muted">全${total}枚／シラバス拡充${syllabusTotal}枚</span>`;
  const html = cardTab === "formula"
    ? list.map(formulaCardHtml).join("")
    : cardTab === "compare"
      ? list.map(compareCardHtml).join("")
      : list.map(termCardHtml).join("");
  $("#cardList").innerHTML = html || `<div class="card cards-empty"><b>該当するカードがありません</b><div class="muted">検索語、章または分野を変更してください。</div></div>`;
  bindSyllabusCardActions();
}

function speakSyllabusCard(text) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    toast("この端末では音声読み上げを利用できません");
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  speechSynthesis.speak(utterance);
}

function relatedQuestionById(id) {
  return QUESTIONS.find(question => question.id === id)
    || (typeof APPLICATION_QUESTIONS !== "undefined" ? APPLICATION_QUESTIONS.find(question => question.id === id) : null)
    || (typeof ATLAS_QUESTIONS !== "undefined" ? ATLAS_QUESTIONS.find(question => question.id === id) : null);
}

function bindSyllabusCardActions() {
  $$("#cardList [data-speak-card]").forEach(button => {
    button.onclick = () => speakSyllabusCard(button.dataset.speakCard);
  });
  $$("#cardList [data-card-atlas]").forEach(button => {
    button.onclick = () => {
      applicationAtlasId = normalizeApplicationAtlasId(button.dataset.cardAtlas);
      atlasView = "diagram";
      cardTab = "atlas";
      renderCards();
      window.scrollTo(0, 0);
    };
  });
  $$("#cardList [data-card-questions]").forEach(button => {
    button.onclick = () => {
      const questions = button.dataset.cardQuestions.split(",").map(relatedQuestionById).filter(Boolean);
      startSession(questions, "カード関連問題");
    };
  });
}

function currentCardsDisplayVersion() {
  if (typeof MACHINE_LEARNING_CARDS_VERSION !== "undefined") return MACHINE_LEARNING_CARDS_VERSION;
  if (typeof MATH_CARDS_VERSION !== "undefined") return MATH_CARDS_VERSION;
  if (typeof APPLICATION_CARDS_VERSION !== "undefined") return APPLICATION_CARDS_VERSION;
  return "v0.4.0-dev";
}

const renderCardsBeforeSyllabusExpansion = renderCards;
renderCards = function renderCardsWithSyllabusExpansion() {
  if (cardTab === "atlas") {
    renderAtlasHub();
    return;
  }
  const collection = currentCardCollection();
  const majors = [...new Set(collection.map(syllabusCardMajorName))].sort((a, b) => a.localeCompare(b, "ja"));
  if (syllabusCardMajor !== "all" && !majors.includes(syllabusCardMajor)) syllabusCardMajor = "all";
  const groupSource = syllabusCardMajor === "all"
    ? collection
    : collection.filter(item => syllabusCardMajorName(item) === syllabusCardMajor);
  const groups = [...new Set(groupSource.map(syllabusCardGroupName))].sort((a, b) => a.localeCompare(b, "ja"));
  if (syllabusCardGroup !== "all" && !groups.includes(syllabusCardGroup)) syllabusCardGroup = "all";
  const syllabusTotal = collection.filter(item => item.major).length;
  $("#view-cards").innerHTML = `${syllabusCardTabs()}
    <div class="card cards-toolbar">
      <div><span class="tag ai">${esc(currentCardsDisplayVersion())}</span><span class="tag ok">シラバスカード${syllabusTotal}枚</span></div>
      <div class="cards-toolbar-row">
        <label><span class="label">カード検索</span><input id="syllabusCardSearch" type="search" value="${esc(syllabusCardSearch)}" placeholder="日本語・英語・フリガナ・数式を検索"></label>
        <label><span class="label">章</span><select id="syllabusCardMajor"><option value="all">すべての章</option>${majors.map(major => `<option value="${esc(major)}" ${major === syllabusCardMajor ? "selected" : ""}>${esc(major)}</option>`).join("")}</select></label>
        <label><span class="label">分野</span><select id="syllabusCardGroup"><option value="all">すべての分野</option>${groups.map(group => `<option value="${esc(group)}" ${group === syllabusCardGroup ? "selected" : ""}>${esc(group)}</option>`).join("")}</select></label>
      </div>
      <div class="cards-count"><div id="syllabusCardCount"></div><button class="btn ghost small" id="syllabusCardReset">絞り込み解除</button></div>
      <div class="notice cards-scope-note"><b>出題対象／オプション表示について</b><div class="muted">現在は公式シラバス掲載項目として表示しています。グレー網掛けのオプション判定は、原本との対応表を確定後に追加します。</div></div>
    </div>
    <div id="cardList" class="cards-grid"></div>`;
  bindSyllabusCardTabs();
  $("#syllabusCardSearch").oninput = event => { syllabusCardSearch = event.target.value; renderSyllabusCardResults(); };
  $("#syllabusCardMajor").onchange = event => { syllabusCardMajor = event.target.value; syllabusCardGroup = "all"; renderCards(); };
  $("#syllabusCardGroup").onchange = event => { syllabusCardGroup = event.target.value; renderSyllabusCardResults(); };
  $("#syllabusCardReset").onclick = () => { syllabusCardSearch = ""; syllabusCardMajor = "all"; syllabusCardGroup = "all"; renderCards(); };
  renderSyllabusCardResults();
};
