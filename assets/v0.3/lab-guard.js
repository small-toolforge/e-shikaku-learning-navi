"use strict";
/* ラボの読み込み失敗を空白画面にせず、原因を画面に出すための保護層 */
(() => {
  const originalNav = window.nav;
  if (typeof originalNav !== "function") return;

  window.nav = function guardedNav(view) {
    try {
      return originalNav(view);
    } catch (error) {
      if (view !== "lab") throw error;
      console.error("E資格 学習ナビ: lab startup failed", error);
      const host = document.querySelector("#view-lab");
      if (host) {
        host.innerHTML = `
          <div class="card">
            <h2>ラボを起動できませんでした</h2>
            <p>画面部品の読み込み世代が混在した可能性があります。</p>
            <div class="muted">詳細: ${String(error && error.message ? error.message : error)}</div>
            <button class="btn primary" id="labRetry">ラボを再読み込み</button>
          </div>`;
        const retry = document.querySelector("#labRetry");
        if (retry) retry.onclick = () => location.reload();
      }
      return undefined;
    }
  };
})();
