/* E資格 学習ナビ v0.3.1 補助パッチ
   v0.3.0 拡張のシード問題を既存IndexedDBへ確実に追加し、
   記録画面に現在の拡張版を表示する。 */
(() => {
  "use strict";
  const EXTRA_SEED = [
    {id:"q101",category:"画像解析",topic:"フレーム差分",difficulty:"基礎",type:"lab",
     question:"フレーム差分で白く強調されるのは、どのような場所ですか？",
     choices:["直前のフレームから画素値が大きく変化した（動いた）場所","画像の中で最も明るい場所","色が最も鮮やかな場所","画像の中心に近い場所"],
     answer:0,explanation:"フレーム差分は連続する2フレームの画素値の差の絶対値です。時間方向に変化した場所、つまり動いた物体の輪郭付近が強く出ます。明るさそのものではなく変化量を見る点が重要です。",
     terms:[],formulas:[],labTag:"diff"},
    {id:"q102",category:"画像解析",topic:"フレームレート",difficulty:"基礎",type:"lab",
     question:"動画を30fpsから5fpsに落としたとき、主に失われる情報はどれですか？",
     choices:["時間方向の情報（速い動きの取りこぼし）","1フレームあたりの解像度","色のチャンネル数","画像の縦横比"],
     answer:0,explanation:"fpsは1秒あたりのフレーム数です。下げると時間方向のサンプリングが粗くなり、速い動きを見逃します。各フレームの解像度や色とは別の情報です。",
     terms:[],formulas:[],labTag:"video"},
    {id:"q103",category:"画像解析",topic:"時間平均",difficulty:"標準",type:"lab",
     question:"動画の時間平均をとると、動いている物体が薄く見える理由として正しいものはどれですか？",
     choices:["各画素を時間方向に平均するため、一時的にしか現れない値の寄与が小さくなるから","カメラのピントが動く物体に合わないから","平均処理で解像度が下がるから","動く物体は明るさが低いから"],
     answer:0,explanation:"時間平均では、静止した背景は毎フレーム同じ値なので残り、動く物体は各位置に短時間しかいないため平均への寄与が小さくなります。",
     terms:[],formulas:[],labTag:"video"}
  ];

  async function seedWhenReady() {
    for (let i = 0; i < 100; i++) {
      try {
        const flag = await getOne("meta", "seedVersionV3Patch");
        if (!flag) {
          for (const q of EXTRA_SEED) {
            const exists = await getOne("questions", q.id);
            if (!exists) await put("questions", q);
          }
          await put("meta", {key:"seedVersionV3Patch", value:1, at:Date.now()});
          await loadAll();
        }
        return;
      } catch (_) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  }

  function addVersionBadge() {
    const base = renderStats;
    renderStats = function() {
      base();
      const host = document.querySelector("#view-stats");
      if (host && !document.querySelector("#v3-version-badge")) {
        host.insertAdjacentHTML("afterbegin", "<div id=\"v3-version-badge\" class=\"muted\" style=\"margin:0 0 10px\">アプリ版：v0.3.1（動画ラボ・畳み込みインスペクタ対応）</div>");
      }
    };
  }

  seedWhenReady().catch(() => {});
  addVersionBadge();
})();
