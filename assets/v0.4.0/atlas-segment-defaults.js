"use strict";

document.addEventListener("click", event => {
  const button = event.target.closest && event.target.closest("#view-cards [data-segment]");
  if (!button) return;
  if (button.dataset.segment === "encoder") atlasSelectedNode = "selfAttention";
  if (button.dataset.segment === "decoder") atlasSelectedNode = "maskedAttention";
}, true);
