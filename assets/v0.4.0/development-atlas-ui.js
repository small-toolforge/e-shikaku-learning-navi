"use strict";

const applicationAtlasIdForItemBeforeDevelopment = applicationAtlasIdForItem;
applicationAtlasIdForItem = function applicationAtlasIdForItemDev11(item) {
  const byItem = {
    "5-1-1": "compression",
    "5-2-1": "distributed",
    "5-2-2": "federated",
    "5-4-1": "virtualization"
  };
  return byItem[item.id] || applicationAtlasIdForItemBeforeDevelopment(item);
};

const renderApplicationAtlasBeforeDevelopment = renderApplicationAtlas;
renderApplicationAtlas = function renderApplicationAtlasDev11(atlas) {
  renderApplicationAtlasBeforeDevelopment(atlas);
  if (!atlas || !atlas.category.startsWith("5-")) return;

  const rows = $$("#atlasBody .atlas-source");
  rows.forEach((row, index) => {
    const source = atlas.sources[index];
    const tag = row.querySelector(".tag");
    if (!tag || !source) return;
    tag.textContent = source.kind === "official" ? "公式資料" : "代表論文";
  });

  const note = $("#atlasBody .atlas-source")?.parentElement?.querySelector(".smallnote");
  if (note) note.textContent = "図はシラバス学習用に処理関係を整理した自作概念図で、論文・公式資料の図を転載したものではありません。";
};

const renderAtlasHubBeforeDevelopment = renderAtlasHub;
renderAtlasHub = function renderAtlasHubDev11() {
  renderAtlasHubBeforeDevelopment();
  const intro = $("#view-cards .atlas-intro");
  if (!intro) return;

  const tags = intro.querySelectorAll(":scope > div:first-child .tag");
  if (tags[0]) tags[0].textContent = DEVELOPMENT_ATLAS_VERSION;
  if (tags[1]) tags[1].textContent = "全16図解";

  const heading = intro.querySelector("h2");
  if (heading) heading.textContent = "シラバス2026 図解アトラス";

  const description = heading?.nextElementSibling;
  if (description) {
    description.textContent = "Transformerと深層学習の応用11図解に加え、モデル軽量化、並列分散処理、連合学習、仮想化環境を自作概念図で整理しました。図の構造、処理順、試験での見分け方を相互に確認できます。";
  }
};

if (typeof currentCardsDisplayVersion === "function") {
  currentCardsDisplayVersion = function currentCardsDisplayVersionDev11() {
    return DEVELOPMENT_ATLAS_VERSION;
  };
}
