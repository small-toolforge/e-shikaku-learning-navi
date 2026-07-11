"use strict";

let atlasView = "diagram";
let atlasSegment = "all";
let atlasSelectedNode = "selfAttention";
let atlasSearch = "";
let atlasMajor = "all";

const renderCardsV031 = renderCards;
renderCards = function renderCardsV040() {
  if (cardTab === "atlas") {
    renderAtlasHub();
    return;
  }
  renderCardsV031();
  const tabs = document.querySelector("#view-cards .subtabs");
  if (!tabs || document.querySelector("#tabAtlas")) return;
  const button = document.createElement("button");
  button.id = "tabAtlas";
  button.textContent = "論文図解";
  button.onclick = () => { cardTab = "atlas"; renderCards(); };
  tabs.appendChild(button);
};

function atlasTabs() {
  return `<div class="subtabs atlas-main-tabs">
    <button id="tabTerm">用語</button>
    <button id="tabFormula">数式</button>
    <button id="tabCompare">比較</button>
    <button id="tabAtlas" class="active">論文図解</button>
  </div>`;
}

function bindAtlasTabs() {
  $("#tabTerm").onclick = () => { cardTab = "term"; renderCards(); };
  $("#tabFormula").onclick = () => { cardTab = "formula"; renderCards(); };
  $("#tabCompare").onclick = () => { cardTab = "compare"; renderCards(); };
  $("#tabAtlas").onclick = () => { cardTab = "atlas"; renderCards(); };
}

function renderAtlasHub() {
  const root = $("#view-cards");
  root.innerHTML = `${atlasTabs()}
    <div class="card atlas-intro">
      <div><span class="tag ai">${esc(ATLAS_VERSION)}</span><span class="tag ok">第一号：Transformer</span></div>
      <h2>シラバス2026 論文図解アトラス</h2>
      <div class="muted">原論文の図を転載せず、試験で構造を見分けるための自作SVGとして整理しています。図のブロックをタップすると解説が切り替わります。</div>
      <div class="subtabs atlas-view-tabs">
        <button id="atlasDiagramTab" class="${atlasView === "diagram" ? "active" : ""}">論文図解</button>
        <button id="atlasSyllabusTab" class="${atlasView === "syllabus" ? "active" : ""}">シラバス索引</button>
      </div>
    </div>
    <div id="atlasBody"></div>`;

  bindAtlasTabs();
  $("#atlasDiagramTab").onclick = () => { atlasView = "diagram"; renderAtlasHub(); };
  $("#atlasSyllabusTab").onclick = () => { atlasView = "syllabus"; renderAtlasHub(); };
  atlasView === "diagram" ? renderTransformerAtlas() : renderSyllabusIndex();
}

function svgNode(id, x, y, w, h, lines, kind) {
  const selected = id === atlasSelectedNode ? " selected" : "";
  const tspans = lines.map((line, index) => `<tspan x="${x + w / 2}" dy="${index ? 17 : 0}">${esc(line)}</tspan>`).join("");
  return `<g class="atlas-node ${kind || ""}${selected}" data-node="${id}" role="button" tabindex="0" aria-label="${esc(TRANSFORMER_NODES[id].ja)}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"></rect>
    <text x="${x + w / 2}" y="${y + h / 2 - (lines.length - 1) * 8}" text-anchor="middle">${tspans}</text>
  </g>`;
}

function transformerSvg() {
  const viewBoxes = {
    all: "0 0 760 760",
    encoder: "15 145 320 590",
    decoder: "355 20 390 715"
  };
  const viewBox = viewBoxes[atlasSegment] || viewBoxes.all;
  return `<div class="atlas-svg-wrap">
    <svg id="transformerDiagram" class="atlas-svg" viewBox="${viewBox}" aria-labelledby="transformerSvgTitle" role="img">
      <title id="transformerSvgTitle">TransformerのEncoderとDecoder構成図</title>
      <defs>
        <marker id="atlasArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      </defs>
      <text class="atlas-heading" x="180" y="168" text-anchor="middle">Encoder</text>
      <text class="atlas-heading" x="550" y="108" text-anchor="middle">Decoder</text>
      <rect class="atlas-frame" x="45" y="185" width="270" height="405" rx="24"></rect>
      <rect class="atlas-frame" x="395" y="125" width="310" height="525" rx="24"></rect>
      <text class="atlas-repeat" x="20" y="385">N×</text>
      <text class="atlas-repeat" x="715" y="390">N×</text>

      ${svgNode("inputEmbedding",85,680,190,50,["Input Embedding"],"embedding")}
      ${svgNode("encoderPosition",85,610,190,48,["Positional Encoding"],"position")}
      ${svgNode("selfAttention",85,475,190,66,["Multi-Head","Self-Attention"],"attention")}
      ${svgNode("encoderAddNorm1",85,405,190,48,["Add & Norm"],"norm")}
      ${svgNode("encoderFFN",85,295,190,68,["Feed Forward"],"ffn")}
      ${svgNode("encoderAddNorm2",85,225,190,48,["Add & Norm"],"norm")}

      ${svgNode("outputEmbedding",455,680,190,50,["Output Embedding"],"embedding")}
      ${svgNode("decoderPosition",455,610,190,48,["Positional Encoding"],"position")}
      ${svgNode("maskedAttention",455,535,190,62,["Masked Multi-Head","Self-Attention"],"attention")}
      ${svgNode("decoderAddNorm1",455,470,190,45,["Add & Norm"],"norm")}
      ${svgNode("crossAttention",455,375,190,66,["Source-Target","Attention"],"attention")}
      ${svgNode("decoderAddNorm2",455,310,190,45,["Add & Norm"],"norm")}
      ${svgNode("decoderFFN",455,220,190,60,["Feed Forward"],"ffn")}
      ${svgNode("decoderAddNorm3",455,155,190,45,["Add & Norm"],"norm")}
      ${svgNode("linear",485,85,130,44,["Linear"],"linear")}
      ${svgNode("softmax",485,25,130,44,["Softmax"],"softmax")}

      <g class="atlas-arrows" marker-end="url(#atlasArrow)">
        <path d="M180 680 L180 660"></path><path d="M180 610 L180 545"></path>
        <path d="M180 475 L180 455"></path><path d="M180 405 L180 367"></path><path d="M180 295 L180 277"></path>
        <path d="M550 680 L550 660"></path><path d="M550 610 L550 601"></path><path d="M550 535 L550 519"></path>
        <path d="M550 470 L550 445"></path><path d="M550 375 L550 359"></path><path d="M550 310 L550 284"></path>
        <path d="M550 220 L550 204"></path><path d="M550 155 L550 133"></path><path d="M550 85 L550 73"></path>
        <path class="cross-arrow" d="M275 249 C355 249 365 408 451 408"></path>
      </g>
      <text class="atlas-output-label" x="550" y="15" text-anchor="middle">次トークン確率</text>
    </svg>
  </div>`;
}

function renderTransformerAtlas() {
  const paper = ATLAS_PAPERS.transformer;
  const selected = TRANSFORMER_NODES[atlasSelectedNode] || TRANSFORMER_NODES.selfAttention;
  $("#atlasBody").innerHTML = `<div class="card atlas-paper-head">
      <div class="eyebrow">${esc(paper.syllabus)}</div>
      <h2><ruby>${esc(paper.title)}<rt>${esc(paper.kana)}</rt></ruby></h2>
      <div>${esc(paper.ja)}</div>
      <div class="muted">${esc(paper.authors)} / ${paper.year}</div>
      <p>${esc(paper.summary)}</p>
      <div class="atlas-segments" aria-label="図の表示範囲">
        <button data-segment="all" class="${atlasSegment === "all" ? "active" : ""}">全体</button>
        <button data-segment="encoder" class="${atlasSegment === "encoder" ? "active" : ""}">Encoder</button>
        <button data-segment="decoder" class="${atlasSegment === "decoder" ? "active" : ""}">Decoder</button>
      </div>
      ${transformerSvg()}
      <div class="smallnote">色付きブロックをタップしてください。スマホでは「Encoder」「Decoder」に分けると文字が大きくなります。</div>
    </div>
    <div class="card atlas-explain" id="atlasExplain">
      ${atlasNodeExplanation(selected)}
    </div>
    <div class="card">
      <h2>図を読む順番</h2>
      <ol class="atlas-flow">
        <li>Encoderで入力を埋め込み、位置情報を加えます。</li>
        <li>EncoderのSelf-Attentionで入力内の関係を捉えます。</li>
        <li>DecoderのMasked Attentionで未来を隠します。</li>
        <li>Source-Target AttentionでEncoder出力を参照します。</li>
        <li>LinearとSoftmaxで次トークンの確率を出します。</li>
      </ol>
      <button class="btn primary" id="atlasQuiz">確認問題を始める（3問）</button>
    </div>
    <div class="card">
      <h2>原典</h2>
      ${paper.sources.map(source => `<div class="atlas-source"><span class="tag ai">原典論文</span><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a></div>`).join("")}
      <div class="smallnote">構成図は学習用に描き直したもので、論文掲載図の画像転載ではありません。</div>
    </div>
    <div class="card">
      <h2>次に追加する図解</h2>
      <div class="atlas-roadmap">
        ${["RNN / LSTM / GRU","ResNet","Vision Transformer / Swin","物体検出モデル比較","U-Net","BERT / GPT / RAG","VAE / GAN / Diffusion","DQN / A3C","XAI","軽量化・分散学習"].map(x => `<span class="tag">${esc(x)}</span>`).join("")}
      </div>
    </div>`;

  $$("#view-cards [data-segment]").forEach(button => {
    button.onclick = () => { atlasSegment = button.dataset.segment; renderTransformerAtlas(); };
  });
  $$("#transformerDiagram .atlas-node").forEach(node => {
    const select = () => {
      atlasSelectedNode = node.dataset.node;
      $$("#transformerDiagram .atlas-node").forEach(x => x.classList.toggle("selected", x.dataset.node === atlasSelectedNode));
      $("#atlasExplain").innerHTML = atlasNodeExplanation(TRANSFORMER_NODES[atlasSelectedNode]);
      $("#atlasExplain").scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    node.onclick = select;
    node.onkeydown = event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }
    };
  });
  $("#atlasQuiz").onclick = () => {
    const questions = paper.questionIds.map(id => QUESTIONS.find(q => q.id === id)).filter(Boolean);
    startSession(questions.length ? questions : ATLAS_QUESTIONS, "Transformer図解チェック");
  };
}

function atlasNodeExplanation(node) {
  return `<div class="eyebrow">タップしたブロック</div>
    <div class="termword atlas-term"><ruby>${esc(node.en)}<rt>${esc(node.kana)}</rt></ruby></div>
    <div><b>${esc(node.ja)}</b></div>
    <p>${esc(node.desc)}</p>
    <div class="notice warn"><b>試験での見分け方</b><div>${esc(node.exam)}</div></div>`;
}

function actualCoverage(item) {
  if (item.atlasId === "transformer") return { level: "ready", text: "図解あり / 問題3問" };
  const ready = {
    "2-1-12": "比較カードあり",
    "3-1-3": "数式・比較カードあり",
    "3-3-1": "比較カードあり",
    "3-3-2": "比較カードあり",
    "3-4-1": "用語・数式・ラボ・問題あり",
    "3-4-3": "用語・比較・ラボあり",
    "3-7-3": "比較カードあり"
  };
  if (ready[item.id]) return { level: "partial", text: ready[item.id] };
  if (item.atlasId) return { level: "planned", text: "図解準備中" };
  return { level: "index", text: "索引登録" };
}

function renderSyllabusIndex() {
  const majors = [...new Set(SYLLABUS_INDEX.map(item => item.major))];
  const q = atlasSearch.trim().toLocaleLowerCase("ja-JP");
  const filtered = SYLLABUS_INDEX.filter(item => {
    if (atlasMajor !== "all" && item.major !== atlasMajor) return false;
    if (!q) return true;
    const haystack = [item.major, item.group, item.topic, item.detail, ...item.keywords].join(" ").toLocaleLowerCase("ja-JP");
    return haystack.includes(q);
  });
  const keywordCount = SYLLABUS_INDEX.reduce((sum, item) => sum + item.keywords.length, 0);

  $("#atlasBody").innerHTML = `<div class="card">
      <h2>シラバス2026 索引</h2>
      <div class="row">
        <div class="stat"><div class="v">${SYLLABUS_INDEX.length}</div><div class="l">索引項目</div></div>
        <div class="stat"><div class="v">${keywordCount}</div><div class="l">キーワード紐付け</div></div>
        <div class="stat"><div class="v">1</div><div class="l">完成図解</div></div>
      </div>
      <div class="label">検索</div>
      <input id="atlasSearch" class="atlas-search" type="search" value="${esc(atlasSearch)}" placeholder="例：RAG、マハラノビス距離、量子化">
      <div class="label">大分類</div>
      <select id="atlasMajor" class="atlas-select">
        <option value="all">すべて</option>
        ${majors.map(major => `<option value="${esc(major)}" ${atlasMajor === major ? "selected" : ""}>${esc(major)}</option>`).join("")}
      </select>
      <div class="smallnote">シラバス本文の索引化を先に行い、図解・用語・数式・問題を段階的に接続します。グレー網掛けの出題対象外判定は次のレビュー工程で付与します。</div>
    </div>
    <div class="atlas-index-count muted">表示：${filtered.length} / ${SYLLABUS_INDEX.length}項目</div>
    <div id="atlasIndexList">
      ${filtered.length ? filtered.map(atlasIndexCard).join("") : `<div class="card muted">該当する項目がありません。</div>`}
    </div>`;

  const search = $("#atlasSearch");
  search.oninput = () => {
    atlasSearch = search.value;
    window.clearTimeout(search._timer);
    search._timer = window.setTimeout(renderSyllabusIndex, 160);
  };
  $("#atlasMajor").onchange = event => { atlasMajor = event.target.value; renderSyllabusIndex(); };
  $$("#atlasIndexList [data-open-atlas]").forEach(button => {
    button.onclick = () => {
      atlasView = "diagram";
      atlasSegment = "all";
      atlasSelectedNode = "selfAttention";
      renderAtlasHub();
    };
  });
}

function atlasIndexCard(item) {
  const coverage = actualCoverage(item);
  const className = coverage.level === "ready" ? "ok" : coverage.level === "partial" ? "ai" : coverage.level === "planned" ? "warn" : "";
  const resources = item.resources.map(resource => {
    const names = { term: "用語", formula: "数式", compare: "比較", atlas: "図解", concept: "概念図", lab: "ラボ", question: "問題", planned: "未分類" };
    return `<span class="tag">${esc(names[resource] || resource)}</span>`;
  }).join("");
  return `<article class="card atlas-index-card">
    <div class="eyebrow">${esc(item.major)} / ${esc(item.group)}</div>
    <h2>${esc(item.topic)}${item.detail ? ` <span class="muted">— ${esc(item.detail)}</span>` : ""}</h2>
    <div><span class="tag ${className}">${esc(coverage.text)}</span><span class="tag">${esc(item.scope)}</span></div>
    <div class="atlas-keywords">${item.keywords.map(keyword => `<span>${esc(keyword)}</span>`).join("")}</div>
    <details><summary>教材への紐付け候補</summary><div>${resources}</div></details>
    ${item.atlasId === "transformer" ? `<button class="btn primary small" data-open-atlas="transformer">Transformer図解を開く</button>` : ""}
  </article>`;
}
