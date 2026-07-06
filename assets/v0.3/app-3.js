"use strict";

/* =========================================================
   画像解析ラボ v0.3.6
   - カメラ / ローカル動画
   - フレーム差分・背景差分・時間平均・Sobel・解像度・fps
   - 停止中の3×3 Sobelインスペクタ
   ========================================================= */

let labStream = null;
let labRaf = null;
let labSource = "camera";
let labMode = "original";
let labFrozen = false;
let labThreshold = 128;
let labResolution = 64;
let labFps = 30;
let labLastFpsDraw = 0;
let labNeedsDraw = false;
let labPrevGray = null;
let labBackgroundGray = null;
let labAverageGray = null;
let labLastGray = null;
let labWidth = 0;
let labHeight = 0;

const CAMERA_MODES = [
  ["original", "元画像"],
  ["rgb", "RGB分解"],
  ["gray", "グレースケール"],
  ["binary", "二値化"],
  ["blur", "ぼかし"],
  ["sobel", "輪郭検出（Sobel）"],
  ["lowres", "解像度比較"],
  ["pool", "プーリング比較"]
];

const VIDEO_MODES = [
  ["original", "元映像"],
  ["diff", "フレーム差分"],
  ["bg", "背景差分"],
  ["avg", "時間平均"],
  ["sobel", "エッジ検出"],
  ["lowres", "解像度低下"],
  ["fps", "fps低下"]
];

const LAB_TEXT = {
  original: "映像は、連続した画素値の配列です。動画では、画像に時間方向の情報が加わります。",
  rgb: "カラー画像はR・G・Bの3チャンネルです。CNNでは通常、3×高さ×幅の数値配列として扱います。",
  gray: "色を捨てて明るさだけにする前処理です。形や境界に注目しやすくなります。",
  binary: "明るさが閾値より大きいか小さいかで、白黒に分けます。",
  blur: "近くの画素の平均を取り、細部やノイズを弱めます。",
  sobel: "Sobelは近くの画素の明るさの差を使い、境界を強調する畳み込みです。",
  lowres: "解像度を下げると、空間方向の細かな情報が減ります。",
  pool: "領域ごとに代表値を残して縮小する処理です。Maxは強い反応、Averageは平均的な傾向を残します。",
  diff: "直前フレームとの差です。時間方向に変化した、動いた場所が強調されます。",
  bg: "記憶した背景との差です。背景から変化した場所が強調されます。",
  avg: "時間方向に平均します。静止背景は残り、動く物体は薄くなります。",
  fps: "右側だけ更新頻度を下げます。失われるのは時間方向の情報です。"
};

function renderLab() {
  const modes = labSource === "camera" ? CAMERA_MODES : VIDEO_MODES;
  if (!modes.some(([id]) => id === labMode)) labMode = "original";

  $("#view-lab").innerHTML = `
    <div class="subtabs">
      <button id="labCameraTab" class="${labSource === "camera" ? "active" : ""}">カメララボ</button>
      <button id="labVideoTab" class="${labSource === "video" ? "active" : ""}">動画ラボ</button>
    </div>
    <div class="card labwrap">
      <div class="muted">映像・動画は端末内でのみ処理します。アップロード・自動保存はしません。</div>
      <div id="labSourceControls"></div>
      <div class="modes" id="labModeButtons">
        ${modes.map(([id, label]) => `<button data-mode="${id}" class="${id === labMode ? "sel" : ""}">${label}</button>`).join("")}
      </div>
      <div id="labOptions"></div>
      <div class="labcanvases">
        <figure><canvas id="labOriginal" width="320" height="240"></canvas><figcaption>元映像</figcaption></figure>
        <figure><canvas id="labProcessed" width="320" height="240"></canvas><figcaption id="labProcessedCaption">処理後</figcaption></figure>
      </div>
      <div class="muted" id="labFreezeHint" style="display:none">停止中です。左の画像をタップすると、選択した3×3画素とSobel計算を確認できます。</div>
      <div id="labInspector"></div>
      <div class="card" style="margin:0;background:var(--mist);border:none">
        <div class="eyebrow">今日のテーマ</div>
        <div id="labTheme">${LAB_TEXT[labMode]}</div>
      </div>
      <button class="btn shu" id="labQuestion">この実験の確認問題を解く</button>
    </div>`;

  $("#labCameraTab").onclick = () => switchLabSource("camera");
  $("#labVideoTab").onclick = () => switchLabSource("video");
  $$("#labModeButtons button").forEach(button => {
    button.onclick = () => {
      labMode = button.dataset.mode;
      labPrevGray = null;
      labAverageGray = null;
      $("#labInspector").innerHTML = "";
      renderLab();
    };
  });
  $("#labOriginal").onclick = inspectPixel;
  $("#labQuestion").onclick = startLabQuestion;

  renderLabSourceControls();
  renderLabOptions();
}

function switchLabSource(nextSource) {
  if (labSource === nextSource) return;
  stopLab();
  labSource = nextSource;
  labMode = "original";
  renderLab();
}

function renderLabSourceControls() {
  const box = $("#labSourceControls");
  if (labSource === "camera") {
    box.innerHTML = `
      <div class="row">
        <button class="btn primary" style="flex:2;margin-top:0" id="labStartCamera">カメラを起動</button>
        <button class="btn ghost" style="flex:1;margin-top:0" id="labPauseCamera" ${labStream ? "" : "disabled"}>${labFrozen ? "再開" : "一時停止"}</button>
      </div>`;
    $("#labStartCamera").onclick = startCamera;
    $("#labPauseCamera").onclick = toggleCameraFreeze;
  } else {
    box.innerHTML = `
      <input id="labVideoPicker" type="file" accept="video/*" style="display:none">
      <div class="row">
        <button class="btn primary" style="flex:2;margin-top:0" id="labChooseVideo">動画を選択</button>
        <button class="btn ghost" style="flex:1;margin-top:0" id="labPlayVideo" disabled>再生</button>
        <button class="btn ghost" style="flex:1;margin-top:0" id="labStepVideo" disabled>コマ送り</button>
      </div>
      <div class="muted" id="labVideoStatus">端末内の動画を選択してください。</div>`;
    $("#labChooseVideo").onclick = () => $("#labVideoPicker").click();
    $("#labVideoPicker").onchange = loadVideoFile;
    $("#labPlayVideo").onclick = toggleVideoPlay;
    $("#labStepVideo").onclick = stepVideo;

    const video = $("#vidFile");
    if (video && video.src) {
      $("#labPlayVideo").disabled = false;
      $("#labStepVideo").disabled = false;
    }
  }
}

function renderLabOptions() {
  const box = $("#labOptions");
  if (labMode === "binary") {
    box.innerHTML = `<div class="label">閾値: <span id="labThresholdLabel">${labThreshold}</span></div><input id="labThreshold" type="range" min="0" max="255" value="${labThreshold}">`;
    $("#labThreshold").oninput = event => {
      labThreshold = Number(event.target.value);
      $("#labThresholdLabel").textContent = labThreshold;
    };
    return;
  }
  if (labMode === "lowres") {
    box.innerHTML = `<div class="confbar"><button data-resolution="224">224</button><button data-resolution="64" class="sel">64</button><button data-resolution="32">32</button></div>`;
    box.querySelectorAll("button").forEach(button => {
      button.onclick = () => {
        labResolution = Number(button.dataset.resolution);
        box.querySelectorAll("button").forEach(item => item.classList.toggle("sel", item === button));
      };
    });
    return;
  }
  if (labMode === "bg") {
    box.innerHTML = `<button class="btn ghost small" id="labSetBackground">いまの画面を背景として記憶</button>`;
    $("#labSetBackground").onclick = () => {
      if (!labLastGray) return toast("先に動画を再生してください");
      labBackgroundGray = labLastGray.slice();
      toast("背景を記憶しました");
    };
    return;
  }
  if (labMode === "fps") {
    box.innerHTML = `<div class="confbar"><button data-fps="30" class="${labFps === 30 ? "sel" : ""}">30 fps</button><button data-fps="10" class="${labFps === 10 ? "sel" : ""}">10 fps</button><button data-fps="5" class="${labFps === 5 ? "sel" : ""}">5 fps</button></div>`;
    box.querySelectorAll("button").forEach(button => {
      button.onclick = () => {
        labFps = Number(button.dataset.fps);
        labLastFpsDraw = 0;
        renderLabOptions();
      };
    });
    return;
  }
  box.innerHTML = "";
}

async function startCamera() {
  try {
    stopLab();
    labStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 640 } },
      audio: false
    });
    const video = $("#labVideo");
    video.srcObject = labStream;
    await video.play();
    labFrozen = false;
    renderLabSourceControls();
    startLabLoop();
    toast("カメラを起動しました");
  } catch (error) {
    toast("カメラを起動できません: " + error.name);
  }
}

function toggleCameraFreeze() {
  labFrozen = !labFrozen;
  $("#labPauseCamera").textContent = labFrozen ? "再開" : "一時停止";
  $("#labFreezeHint").style.display = labFrozen ? "" : "none";
  if (!labFrozen) $("#labInspector").innerHTML = "";
  if (labFrozen) toast("一時停止しました。左の画像をタップしてください");
}

function loadVideoFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const video = $("#vidFile");
  if (video._objectUrl) URL.revokeObjectURL(video._objectUrl);
  video._objectUrl = URL.createObjectURL(file);
  video.src = video._objectUrl;
  video.loop = true;
  video.onloadeddata = () => {
    labPrevGray = null;
    labBackgroundGray = null;
    labAverageGray = null;
    labNeedsDraw = true;
    $("#labPlayVideo").disabled = false;
    $("#labStepVideo").disabled = false;
    $("#labVideoStatus").textContent = file.name + " を読み込みました。";
    video.play().then(() => {
      $("#labPlayVideo").textContent = "停止";
      startLabLoop();
    });
  };
  video.onseeked = () => { labNeedsDraw = true; };
  video.load();
  event.target.value = "";
}

function toggleVideoPlay() {
  const video = $("#vidFile");
  if (!video.src) return;
  if (video.paused) {
    video.play();
    $("#labPlayVideo").textContent = "停止";
  } else {
    video.pause();
    $("#labPlayVideo").textContent = "再生";
  }
}

function stepVideo() {
  const video = $("#vidFile");
  if (!video.src) return;
  video.pause();
  $("#labPlayVideo").textContent = "再生";
  video.currentTime = Math.min(video.duration || 0, (video.currentTime || 0) + 1 / 30);
  labNeedsDraw = true;
}

function startLabLoop() {
  if (!labRaf) labRaf = requestAnimationFrame(drawLabFrame);
}

function stopLab() {
  if (labRaf) cancelAnimationFrame(labRaf);
  labRaf = null;
  if (labStream) labStream.getTracks().forEach(track => track.stop());
  labStream = null;
  const video = $("#vidFile");
  if (video && !video.paused) video.pause();
  labFrozen = false;
  labPrevGray = null;
  labBackgroundGray = null;
  labAverageGray = null;
}

function stopCamera() {
  stopLab();
}

function drawLabFrame(time) {
  labRaf = requestAnimationFrame(drawLabFrame);
  const originalCanvas = $("#labOriginal");
  const processedCanvas = $("#labProcessed");
  if (!originalCanvas || !processedCanvas) {
    cancelAnimationFrame(labRaf);
    labRaf = null;
    return;
  }
  if (labSource === "camera" && labFrozen) return;

  const source = labSource === "camera" ? $("#labVideo") : $("#vidFile");
  if (!source || !source.videoWidth || !source.videoHeight) return;
  if (labSource === "camera" && !labStream) return;
  if (labSource === "video" && source.paused && !labNeedsDraw) return;

  const width = 320;
  const height = Math.max(2, Math.round(width * source.videoHeight / source.videoWidth));
  if (originalCanvas.width !== width || originalCanvas.height !== height) {
    originalCanvas.width = width;
    originalCanvas.height = height;
    processedCanvas.width = width;
    processedCanvas.height = height;
    labPrevGray = null;
    labBackgroundGray = null;
    labAverageGray = null;
  }

  const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });
  originalCtx.drawImage(source, 0, 0, width, height);
  const image = originalCtx.getImageData(0, 0, width, height);
  const gray = toGray(image.data, width * height);
  labLastGray = gray;
  labWidth = width;
  labHeight = height;

  const processedCtx = processedCanvas.getContext("2d");
  if (labMode === "fps") {
    if (time - labLastFpsDraw >= 1000 / labFps) {
      processedCtx.putImageData(image, 0, 0);
      labLastFpsDraw = time;
    }
  } else {
    processedCtx.putImageData(applyLabMode(image, gray, width, height), 0, 0);
  }
  if (labMode === "diff") labPrevGray = gray.slice();
  labNeedsDraw = false;
}

function toGray(data, pixels) {
  const gray = new Float32Array(pixels);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

function applyLabMode(image, gray, width, height) {
  if (labMode === "original") return image;
  const out = new ImageData(width, height);
  const data = image.data;
  const set = (pixel, r, g, b) => {
    const i = pixel * 4;
    out.data[i] = r;
    out.data[i + 1] = g;
    out.data[i + 2] = b;
    out.data[i + 3] = 255;
  };

  if (labMode === "gray") {
    for (let p = 0; p < gray.length; p++) set(p, gray[p], gray[p], gray[p]);
    return out;
  }
  if (labMode === "binary") {
    for (let p = 0; p < gray.length; p++) {
      const value = gray[p] > labThreshold ? 255 : 0;
      set(p, value, value, value);
    }
    return out;
  }
  if (labMode === "rgb") {
    const oneThird = Math.floor(height / 3);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      if (y < oneThird) set(p, data[i], 0, 0);
      else if (y < oneThird * 2) set(p, 0, data[i + 1], 0);
      else set(p, 0, 0, data[i + 2]);
    }
    return out;
  }
  if (labMode === "blur") {
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      let sum = 0, count = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < height && xx >= 0 && xx < width) {
          sum += gray[yy * width + xx];
          count++;
        }
      }
      const value = sum / count;
      set(y * width + x, value, value, value);
    }
    return out;
  }
  if (labMode === "sobel") {
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gx = -gray[p - width - 1] - 2 * gray[p - 1] - gray[p + width - 1] + gray[p - width + 1] + 2 * gray[p + 1] + gray[p + width + 1];
      const gy = -gray[p - width - 1] - 2 * gray[p - width] - gray[p - width + 1] + gray[p + width - 1] + 2 * gray[p + width] + gray[p + width + 1];
      const value = Math.min(255, Math.hypot(gx, gy));
      set(p, value, value, value);
    }
    return out;
  }
  if (labMode === "lowres") {
    const step = Math.max(1, Math.round(width / labResolution));
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const sy = Math.floor(y / step) * step;
      const sx = Math.floor(x / step) * step;
      const i = (sy * width + sx) * 4;
      set(y * width + x, data[i], data[i + 1], data[i + 2]);
    }
    return out;
  }
  if (labMode === "pool") {
    const size = 8;
    for (let by = 0; by < height; by += size) for (let bx = 0; bx < width; bx += size) {
      let max = 0, sum = 0, count = 0;
      for (let y = by; y < Math.min(by + size, height); y++) for (let x = bx; x < Math.min(bx + size, width); x++) {
        const value = gray[y * width + x];
        max = Math.max(max, value);
        sum += value;
        count++;
      }
      const result = labPool === "max" ? max : sum / count;
      for (let y = by; y < Math.min(by + size, height); y++) for (let x = bx; x < Math.min(bx + size, width); x++) set(y * width + x, result, result, result);
    }
    return out;
  }
  if (labMode === "diff" || labMode === "bg") {
    const base = labMode === "diff" ? labPrevGray : labBackgroundGray;
    for (let p = 0; p < gray.length; p++) {
      const value = base ? Math.min(255, Math.abs(gray[p] - base[p]) * (labMode === "diff" ? 3 : 2.5)) : (labMode === "bg" ? 40 : 0);
      set(p, value, value, value);
    }
    return out;
  }
  if (labMode === "avg") {
    if (!labAverageGray) labAverageGray = gray.slice();
    else for (let p = 0; p < gray.length; p++) labAverageGray[p] += (gray[p] - labAverageGray[p]) * 0.05;
    for (let p = 0; p < gray.length; p++) set(p, labAverageGray[p], labAverageGray[p], labAverageGray[p]);
    return out;
  }
  return image;
}

const SOBEL_X = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
const SOBEL_Y = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

function inspectPixel(event) {
  const video = $("#vidFile");
  const paused = (labSource === "camera" && labFrozen) || (labSource === "video" && video && video.paused);
  if (!paused) {
    toast(labSource === "camera" ? "一時停止してからタップしてください" : "動画を停止してからタップしてください");
    return;
  }
  if (!labLastGray) return;

  const canvas = $("#labOriginal");
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(1, Math.min(labWidth - 2, Math.floor((event.clientX - rect.left) * labWidth / rect.width)));
  const y = Math.max(1, Math.min(labHeight - 2, Math.floor((event.clientY - rect.top) * labHeight / rect.height)));
  const values = [];
  let gx = 0, gy = 0;
  for (let dy = -1; dy <= 1; dy++) {
    const row = [];
    for (let dx = -1; dx <= 1; dx++) {
      const value = Math.round(labLastGray[(y + dy) * labWidth + x + dx]);
      row.push(value);
      gx += value * SOBEL_X[dy + 1][dx + 1];
      gy += value * SOBEL_Y[dy + 1][dx + 1];
    }
    values.push(row);
  }
  const magnitude = Math.round(Math.hypot(gx, gy));
  const table = (matrix, klass = "") => `<table class="itbl ${klass}">${matrix.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join("")}</tr>`).join("")}</table>`;
  $("#labInspector").innerHTML = `
    <div class="card" style="margin:0">
      <h2>畳み込みインスペクタ</h2>
      <div class="irow">
        <div><div class="label">入力3×3</div>${table(values)}</div>
        <div><div class="label">Sobel X</div>${table(SOBEL_X, "kern")}</div>
        <div><div class="label">Sobel Y</div>${table(SOBEL_Y, "kern")}</div>
      </div>
      <div class="label">計算結果</div>
      <div>Gx = <b>${gx}</b> / Gy = <b>${gy}</b> / √(Gx² + Gy²) ≒ <b>${magnitude}</b></div>
      <div class="label">読み方</div>
      <div>「左側をマイナス、右側をプラスとして、左右の明るさの差を計算する。上下も同じように計算し、差が大きいほど境界として強く反応する」</div>
      <div class="label">解釈</div>
      <div>${magnitude > 100 ? "この位置は強い境界です。" : "この位置は比較的平坦で、境界としての反応は弱めです。"}</div>
    </div>`;
}

function startLabQuestion() {
  const tags = { sobel: "sobel", pool: "pool", diff: "diff", bg: "diff", avg: "video", fps: "video", lowres: labSource === "video" ? "video" : "" };
  const tag = tags[labMode] || "";
  let questions = QUESTIONS.filter(q => q.type === "lab" && (!tag || q.labTag === tag));
  if (!questions.length) questions = QUESTIONS.filter(q => q.type === "lab");
  if (!questions.length) return toast("画像解析の問題が未登録です");
  startSession(shuffle(questions), "画像解析ラボ 確認問題");
}
