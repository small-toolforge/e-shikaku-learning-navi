"use strict";

let applicationAtlasId = "transformer";
const applicationNodeSelection = {};
const APPLICATION_ATLAS_ALIASES = {
  vit: "vision-transformer",
  unet: "segmentation",
  "bert-gpt": "llm",
  wavenet: "speech",
  rl: "deep-rl",
  "metric-learning": "learning-methods"
};

function normalizeApplicationAtlasId(id) {
  return APPLICATION_ATLAS_ALIASES[id] || id || "";
}

function applicationAtlasById(id) {
  const normalized = normalizeApplicationAtlasId(id);
  return APPLICATION_ATLASES.find(atlas => atlas.id === normalized) || null;
}

function applicationAtlasIdForItem(item) {
  const byItem = {
    "4-5-1": "speech", "4-5-2": "speech", "4-5-3": "speech",
    "4-8-1": "learning-methods", "4-8-2": "learning-methods", "4-8-3": "learning-methods",
    "4-8-4": "learning-methods", "4-8-5": "learning-methods"
  };
  return normalizeApplicationAtlasId(byItem[item.id] || item.atlasId);
}

const actualCoverageDev1 = actualCoverage;
actualCoverage = function actualCoverageDev2(item) {
  const id = applicationAtlasIdForItem(item);
  if (id === "transformer") return { level: "ready", text: "図解あり / 問題3問" };
  const atlas = applicationAtlasById(id);
  if (atlas) return { level: "ready", text: `図解あり / 問題${atlas.questionIds.length}問` };
  return actualCoverageDev1(item);
};

const atlasIndexCardDev1 = atlasIndexCard;
atlasIndexCard = function atlasIndexCardDev2(item) {
  const coverage = actualCoverage(item);
  const className = coverage.level === "ready" ? "ok" : coverage.level === "partial" ? "ai" : coverage.level === "planned" ? "warn" : "";
  const resources = item.resources.map(resource => {
    const names = { term: "用語", formula: "数式", compare: "比較", atlas: "図解", concept: "概念図", lab: "ラボ", question: "問題", planned: "未分類" };
    return `<span class="tag">${esc(names[resource] || resource)}</span>`;
  }).join("");
  const normalized = applicationAtlasIdForItem(item);
  const hasAtlas = normalized === "transformer" || Boolean(applicationAtlasById(normalized));
  return `<article class="card atlas-index-card">
    <div class="eyebrow">${esc(item.major)} / ${esc(item.group)}</div>
    <h2>${esc(item.topic)}${item.detail ? ` <span class="muted">— ${esc(item.detail)}</span>` : ""}</h2>
    <div><span class="tag ${className}">${esc(coverage.text)}</span><span class="tag">${esc(item.scope)}</span></div>
    <div class="atlas-keywords">${item.keywords.map(keyword => `<span>${esc(keyword)}</span>`).join("")}</div>
    <details><summary>教材への紐付け</summary><div>${resources}</div></details>
    ${hasAtlas ? `<button class="btn primary small" data-open-atlas="${esc(normalized)}">図解を開く</button>` : ""}
  </article>`;
};

const renderSyllabusIndexDev1 = renderSyllabusIndex;
renderSyllabusIndex = function renderSyllabusIndexDev2() {
  renderSyllabusIndexDev1();
  $$("#atlasIndexList [data-open-atlas]").forEach(button => {
    button.onclick = () => {
      applicationAtlasId = normalizeApplicationAtlasId(button.dataset.openAtlas);
      atlasView = "diagram";
      atlasSegment = "all";
      atlasSelectedNode = "selfAttention";
      renderAtlasHub();
    };
  });
};

renderAtlasHub = function renderAtlasHubDev2() {
  const root = $("#view-cards");
  const atlasOptions = [
    { id: "transformer", category: "3. 深層学習の基礎", title: "Transformer" },
    ...APPLICATION_ATLASES.map(atlas => ({ id: atlas.id, category: atlas.category, title: atlas.title }))
  ];
  root.innerHTML = `${atlasTabs()}
    <div class="card atlas-intro">
      <div><span class="tag ai">${esc(APPLICATION_ATLAS_VERSION)}</span><span class="tag ok">応用分野11図解を追加</span></div>
      <h2>シラバス2026 論文図解アトラス</h2>
      <div class="muted">Transformerに加え、「4. 深層学習の応用」を画像認識から説明可能AIまで図解しました。モデル名を、構造・処理順・試験での見分け方で整理します。</div>
      <div class="subtabs atlas-view-tabs">
        <button id="atlasDiagramTab" class="${atlasView === "diagram" ? "active" : ""}">論文図解</button>
        <button id="atlasSyllabusTab" class="${atlasView === "syllabus" ? "active" : ""}">シラバス索引</button>
      </div>
      ${atlasView === "diagram" ? `<div class="label">図解を選ぶ</div>
        <select id="applicationAtlasSelect" class="atlas-select application-atlas-select">
          ${atlasOptions.map(option => `<option value="${esc(option.id)}" ${applicationAtlasId === option.id ? "selected" : ""}>${esc(option.category)}｜${esc(option.title)}</option>`).join("")}
        </select>` : ""}
    </div>
    <div id="atlasBody"></div>`;

  bindAtlasTabs();
  $("#atlasDiagramTab").onclick = () => { atlasView = "diagram"; renderAtlasHub(); };
  $("#atlasSyllabusTab").onclick = () => { atlasView = "syllabus"; renderAtlasHub(); };

  if (atlasView === "syllabus") {
    renderSyllabusIndex();
    return;
  }

  const selector = $("#applicationAtlasSelect");
  selector.onchange = event => {
    applicationAtlasId = event.target.value;
    atlasSegment = "all";
    atlasSelectedNode = "selfAttention";
    renderAtlasHub();
  };

  if (applicationAtlasId === "transformer") renderTransformerAtlas();
  else renderApplicationAtlas(applicationAtlasById(applicationAtlasId));
};

function applicationNodeCenter(atlas, nodeId) {
  const node = atlas.nodes.find(item => item.id === nodeId);
  return node ? { x: node.x + node.w / 2, y: node.y + node.h / 2 } : { x: 0, y: 0 };
}

function applicationDiagramSvg(atlas, selectedId) {
  const markerId = `applicationArrow-${atlas.id}`;
  const edges = atlas.edges.map(edge => {
    const from = applicationNodeCenter(atlas, edge.from);
    const to = applicationNodeCenter(atlas, edge.to);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const fromNode = atlas.nodes.find(item => item.id === edge.from);
    const toNode = atlas.nodes.find(item => item.id === edge.to);
    const startOffset = Math.min((fromNode ? Math.max(fromNode.w, fromNode.h) : 60) * 0.42, length * 0.22);
    const endOffset = Math.min((toNode ? Math.max(toNode.w, toNode.h) : 60) * 0.42, length * 0.22);
    const x1 = from.x + dx / length * startOffset;
    const y1 = from.y + dy / length * startOffset;
    const x2 = to.x - dx / length * endOffset;
    const y2 = to.y - dy / length * endOffset;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - 7;
    return `<g class="application-edge ${edge.dashed ? "dashed" : ""}">
      <path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" marker-end="url(#${markerId})"></path>
      ${edge.label ? `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle">${esc(edge.label)}</text>` : ""}
    </g>`;
  }).join("");

  const nodes = atlas.nodes.map(node => {
    const lines = Array.isArray(node.label) ? node.label : [node.label];
    const tspans = lines.map((line, index) => `<tspan x="${node.x + node.w / 2}" dy="${index ? 17 : 0}">${esc(line)}</tspan>`).join("");
    return `<g class="atlas-node application-node ${esc(node.kind)} ${node.id === selectedId ? "selected" : ""}" data-application-node="${esc(node.id)}" role="button" tabindex="0" aria-label="${esc(node.ja)}">
      <rect x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="11"></rect>
      <text x="${node.x + node.w / 2}" y="${node.y + node.h / 2 - (lines.length - 1) * 8}" text-anchor="middle">${tspans}</text>
    </g>`;
  }).join("");

  return `<div class="application-svg-wrap"><svg class="application-svg" viewBox="${esc(atlas.viewBox)}" role="img" aria-label="${esc(atlas.title)}の学習用構成図">
    <defs><marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker></defs>
    ${edges}${nodes}
  </svg></div>`;
}

function applicationNodeExplanation(node) {
  return `<div class="eyebrow">選択したブロック</div>
    <div class="termword atlas-term"><ruby>${esc(node.en)}<rt>${esc(node.kana)}</rt></ruby></div>
    <div><b>${esc(node.ja)}</b></div>
    <p>${esc(node.desc)}</p>
    <div class="notice warn"><b>試験での見分け方</b><div>${esc(node.exam)}</div></div>`;
}

function renderApplicationAtlas(atlas) {
  if (!atlas) {
    $("#atlasBody").innerHTML = `<div class="card">図解データを読み込めませんでした。</div>`;
    return;
  }
  const selectedId = applicationNodeSelection[atlas.id] || atlas.nodes[0].id;
  const selected = atlas.nodes.find(node => node.id === selectedId) || atlas.nodes[0];
  applicationNodeSelection[atlas.id] = selected.id;

  $("#atlasBody").innerHTML = `<div class="card atlas-paper-head application-paper-head">
      <div class="eyebrow">${esc(atlas.category)}</div>
      <h2><ruby>${esc(atlas.title)}<rt>${esc(atlas.kana)}</rt></ruby></h2>
      <div>${esc(atlas.ja)}</div>
      <p>${esc(atlas.summary)}</p>
      <div class="application-syllabus-tags">${atlas.syllabus.map(keyword => `<span class="tag ai">${esc(keyword)}</span>`).join("")}</div>
      ${applicationDiagramSvg(atlas, selected.id)}
      <div class="application-node-buttons" aria-label="図解ブロック一覧">
        ${atlas.nodes.map(node => `<button data-application-node-button="${esc(node.id)}" class="${node.id === selected.id ? "active" : ""}">${esc(node.ja)}</button>`).join("")}
      </div>
      <div class="smallnote">図のブロックまたは上の日本語ボタンを選ぶと、発音・日本語訳・役割・試験での見分け方が切り替わります。</div>
    </div>
    <div class="card atlas-explain" id="applicationAtlasExplain">${applicationNodeExplanation(selected)}</div>
    <div class="card">
      <h2>処理を読む順番</h2>
      <ol class="atlas-flow">${atlas.reading.map(item => `<li>${esc(item)}</li>`).join("")}</ol>
    </div>
    <div class="card">
      <h2>一言対比表</h2>
      <div class="application-compare-table">${atlas.compare.map(row => `<div class="application-compare-row"><b>${esc(row[0])}</b><span>${esc(row[1])}</span></div>`).join("")}</div>
      <button class="btn primary" id="applicationAtlasQuiz">確認問題を始める（${atlas.questionIds.length}問）</button>
    </div>
    <div class="card">
      <h2>原典・代表論文</h2>
      ${atlas.sources.map(source => `<div class="atlas-source"><span class="tag ai">原典論文</span><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>${source.year ? `<span class="muted"> ${esc(source.year)}</span>` : ""}</div>`).join("")}
      <div class="smallnote">図はシラバス学習用に構造を整理した自作図で、論文掲載図の画像転載ではありません。</div>
    </div>`;

  const selectApplicationNode = id => {
    applicationNodeSelection[atlas.id] = id;
    $$("#atlasBody [data-application-node]").forEach(node => node.classList.toggle("selected", node.dataset.applicationNode === id));
    $$("#atlasBody [data-application-node-button]").forEach(button => button.classList.toggle("active", button.dataset.applicationNodeButton === id));
    const node = atlas.nodes.find(item => item.id === id);
    $("#applicationAtlasExplain").innerHTML = applicationNodeExplanation(node);
    $("#applicationAtlasExplain").scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  $$("#atlasBody [data-application-node]").forEach(element => {
    const select = () => selectApplicationNode(element.dataset.applicationNode);
    element.onclick = select;
    element.onkeydown = event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    };
  });
  $$("#atlasBody [data-application-node-button]").forEach(button => {
    button.onclick = () => selectApplicationNode(button.dataset.applicationNodeButton);
  });

  $("#applicationAtlasQuiz").onclick = () => {
    const questions = atlas.questionIds.map(id => QUESTIONS.find(question => question.id === id)).filter(Boolean);
    const fallback = atlas.questionIds.map(id => APPLICATION_QUESTIONS.find(question => question.id === id)).filter(Boolean);
    startSession(questions.length ? questions : fallback, `${atlas.title} 図解チェック`);
  };
}
