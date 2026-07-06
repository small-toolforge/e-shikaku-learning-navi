"use strict";
/* E資格 学習ナビ v0.3.8: 独立ラボ実装 */

var rtStream = null;
var rtRaf = null;
var rtSource = "camera";
var rtMode = "original";
var rtFrozen = false;
var rtThreshold = 128;
var rtResolution = 64;
var rtFps = 30;
var rtPool = "max";
var rtPrevGray = null;
var rtBgGray = null;
var rtAvgGray = null;
var rtLastGray = null;
var rtWidth = 0;
var rtHeight = 0;
var rtLastFpsAt = 0;
var rtNeedFrame = false;

var RT_CAMERA_MODES = [
  ["original", "元画像"], ["rgb", "RGB分解"], ["gray", "グレースケール"],
  ["binary", "二値化"], ["blur", "ぼかし"], ["sobel", "輪郭検出（Sobel）"],
  ["lowres", "解像度比較"], ["pool", "プーリング比較"]
];
var RT_VIDEO_MODES = [
  ["original", "元映像"], ["diff", "フレーム差分"], ["bg", "背景差分"],
  ["avg", "時間平均"], ["sobel", "エッジ検出"], ["lowres", "解像度低下"], ["fps", "fps低下"]
];
var RT_THEME = {
  original:"映像は連続した画素値の配列です。動画では、画像に時間方向の情報が加わります。",
  rgb:"カラー画像はR・G・Bの3チャンネルです。CNNでは数値配列として扱います。",
  gray:"色を捨て、明るさだけにする前処理です。形や境界に注目しやすくなります。",
  binary:"明るさが閾値より大きいか小さいかで、白黒に分けます。",
  blur:"近くの画素の平均を取り、細部やノイズを弱めます。",
  sobel:"Sobelは近くの画素の明るさの差を使い、境界を強調する畳み込みです。",
  lowres:"解像度を下げると、空間方向の細かな情報が減ります。",
  pool:"領域ごとに代表値を残して縮小します。Maxは強い反応、Averageは平均的な傾向を残します。",
  diff:"直前フレームとの差です。動いた場所が強調されます。",
  bg:"記憶した背景との差です。背景から変化した場所が強調されます。",
  avg:"時間方向に平均します。静止背景は残り、動く物体は薄くなります。",
  fps:"右側だけ更新頻度を下げます。失われるのは時間方向の情報です。"
};

function renderLab() {
  var modes = rtSource === "camera" ? RT_CAMERA_MODES : RT_VIDEO_MODES;
  if (!modes.some(function (item) { return item[0] === rtMode; })) rtMode = "original";
  var modeButtons = modes.map(function (item) {
    return '<button data-rt-mode="' + item[0] + '" class="' + (item[0] === rtMode ? 'sel' : '') + '">' + item[1] + '</button>';
  }).join("");

  $("#view-lab").innerHTML =
    '<div class="subtabs">' +
      '<button id="rtCameraTab" class="' + (rtSource === "camera" ? "active" : "") + '">カメララボ</button>' +
      '<button id="rtVideoTab" class="' + (rtSource === "video" ? "active" : "") + '">動画ラボ</button>' +
    '</div>' +
    '<div class="card labwrap">' +
      '<div class="muted">映像・動画は端末内でのみ処理します。アップロード・自動保存はしません。</div>' +
      '<div id="rtSourceControls"></div>' +
      '<div class="modes" id="rtModeButtons">' + modeButtons + '</div>' +
      '<div id="rtOptions"></div>' +
      '<div class="labcanvases">' +
        '<figure><canvas id="rtOriginal" width="320" height="240"></canvas><figcaption>元映像</figcaption></figure>' +
        '<figure><canvas id="rtProcessed" width="320" height="240"></canvas><figcaption>処理後</figcaption></figure>' +
      '</div>' +
      '<div class="muted" id="rtFreezeHint" style="display:none">停止中です。左の画像をタップすると、選択した3×3画素とSobel計算を確認できます。</div>' +
      '<div id="rtInspector"></div>' +
      '<div class="card" style="margin:0;background:var(--mist);border:none"><div class="eyebrow">今日のテーマ</div><div>' + RT_THEME[rtMode] + '</div></div>' +
      '<button class="btn shu" id="rtQuestion">この実験の確認問題を解く</button>' +
    '</div>';

  $("#rtCameraTab").onclick = function () { rtSwitch("camera"); };
  $("#rtVideoTab").onclick = function () { rtSwitch("video"); };
  $$("#rtModeButtons button").forEach(function (button) {
    button.onclick = function () { rtMode = button.dataset.rtMode; rtPrevGray = null; rtAvgGray = null; $("#rtInspector").innerHTML = ""; renderLab(); };
  });
  $("#rtOriginal").onclick = rtInspect;
  $("#rtQuestion").onclick = rtStartQuestion;
  rtRenderSourceControls();
  rtRenderOptions();
}

function rtSwitch(nextSource) {
  if (rtSource === nextSource) return;
  rtStop(); rtSource = nextSource; rtMode = "original"; renderLab();
}

function rtRenderSourceControls() {
  var box = $("#rtSourceControls");
  if (rtSource === "camera") {
    box.innerHTML = '<div class="row"><button class="btn primary" style="flex:2;margin-top:0" id="rtStartCamera">カメラを起動</button><button class="btn ghost" style="flex:1;margin-top:0" id="rtPauseCamera" ' + (rtStream ? '' : 'disabled') + '>' + (rtFrozen ? '再開' : '一時停止') + '</button></div>';
    $("#rtStartCamera").onclick = rtStartCamera;
    $("#rtPauseCamera").onclick = rtToggleFreeze;
  } else {
    box.innerHTML = '<input id="rtVideoPicker" type="file" accept="video/*" style="display:none">' +
      '<div class="row"><button class="btn primary" style="flex:2;margin-top:0" id="rtChooseVideo">動画を選択</button><button class="btn ghost" style="flex:1;margin-top:0" id="rtPlayVideo" disabled>再生</button><button class="btn ghost" style="flex:1;margin-top:0" id="rtStepVideo" disabled>コマ送り</button></div>' +
      '<div class="muted" id="rtVideoStatus">端末内の動画を選択してください。</div>';
    $("#rtChooseVideo").onclick = function () { $("#rtVideoPicker").click(); };
    $("#rtVideoPicker").onchange = rtLoadVideo;
    $("#rtPlayVideo").onclick = rtToggleVideo;
    $("#rtStepVideo").onclick = rtStepVideo;
  }
}

function rtRenderOptions() {
  var box = $("#rtOptions");
  if (rtMode === "binary") {
    box.innerHTML = '<div class="label">閾値: <span id="rtThresholdLabel">' + rtThreshold + '</span></div><input id="rtThreshold" type="range" min="0" max="255" value="' + rtThreshold + '">';
    $("#rtThreshold").oninput = function (event) { rtThreshold = Number(event.target.value); $("#rtThresholdLabel").textContent = rtThreshold; };
  } else if (rtMode === "pool") {
    box.innerHTML = '<div class="confbar"><button id="rtMax" class="' + (rtPool === "max" ? "sel" : "") + '">Max Pooling</button><button id="rtAvg" class="' + (rtPool === "avg" ? "sel" : "") + '">Average Pooling</button></div>';
    $("#rtMax").onclick = function () { rtPool = "max"; rtRenderOptions(); };
    $("#rtAvg").onclick = function () { rtPool = "avg"; rtRenderOptions(); };
  } else if (rtMode === "lowres") {
    box.innerHTML = '<div class="confbar"><button data-r="224">224</button><button data-r="64" class="sel">64</button><button data-r="32">32</button></div>';
    box.querySelectorAll("button").forEach(function (button) { button.onclick = function () { rtResolution = Number(button.dataset.r); box.querySelectorAll("button").forEach(function (item) { item.classList.toggle("sel", item === button); }); }; });
  } else if (rtMode === "bg") {
    box.innerHTML = '<button class="btn ghost small" id="rtSetBackground">いまの画面を背景として記憶</button>';
    $("#rtSetBackground").onclick = function () { if (!rtLastGray) return toast("先に動画を再生してください"); rtBgGray = rtLastGray.slice(); toast("背景を記憶しました"); };
  } else if (rtMode === "fps") {
    box.innerHTML = '<div class="confbar"><button data-f="30" class="' + (rtFps === 30 ? 'sel' : '') + '">30 fps</button><button data-f="10" class="' + (rtFps === 10 ? 'sel' : '') + '">10 fps</button><button data-f="5" class="' + (rtFps === 5 ? 'sel' : '') + '">5 fps</button></div>';
    box.querySelectorAll("button").forEach(function (button) { button.onclick = function () { rtFps = Number(button.dataset.f); rtLastFpsAt = 0; rtRenderOptions(); }; });
  } else { box.innerHTML = ""; }
}

async function rtStartCamera() {
  try {
    rtStop();
    rtStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 640 } }, audio: false });
    var video = $("#labVideo"); video.srcObject = rtStream; await video.play();
    rtFrozen = false; rtRenderSourceControls(); rtStartLoop(); toast("カメラを起動しました");
  } catch (error) { toast("カメラを起動できません: " + error.name); }
}

function rtToggleFreeze() {
  rtFrozen = !rtFrozen;
  $("#rtPauseCamera").textContent = rtFrozen ? "再開" : "一時停止";
  $("#rtFreezeHint").style.display = rtFrozen ? "" : "none";
  if (!rtFrozen) $("#rtInspector").innerHTML = "";
}

function rtLoadVideo(event) {
  var file = event.target.files[0]; if (!file) return;
  var video = $("#vidFile");
  if (video._rtUrl) URL.revokeObjectURL(video._rtUrl);
  video._rtUrl = URL.createObjectURL(file); video.src = video._rtUrl; video.loop = true;
  video.onloadeddata = function () {
    rtPrevGray = null; rtBgGray = null; rtAvgGray = null; rtNeedFrame = true;
    $("#rtPlayVideo").disabled = false; $("#rtStepVideo").disabled = false;
    $("#rtVideoStatus").textContent = file.name + " を読み込みました。";
    video.play().then(function () { $("#rtPlayVideo").textContent = "停止"; rtStartLoop(); });
  };
  video.onseeked = function () { rtNeedFrame = true; };
  video.load(); event.target.value = "";
}

function rtToggleVideo() {
  var video = $("#vidFile"); if (!video.src) return;
  if (video.paused) { video.play(); $("#rtPlayVideo").textContent = "停止"; }
  else { video.pause(); $("#rtPlayVideo").textContent = "再生"; }
}

function rtStepVideo() {
  var video = $("#vidFile"); if (!video.src) return;
  video.pause(); $("#rtPlayVideo").textContent = "再生";
  video.currentTime = Math.min(video.duration || 0, (video.currentTime || 0) + 1 / 30); rtNeedFrame = true;
}

function rtStartLoop() { if (!rtRaf) rtRaf = requestAnimationFrame(rtDraw); }
function rtStop() {
  if (rtRaf) cancelAnimationFrame(rtRaf); rtRaf = null;
  if (rtStream) rtStream.getTracks().forEach(function (track) { track.stop(); }); rtStream = null;
  var video = document.querySelector("#vidFile"); if (video && !video.paused) video.pause();
  rtFrozen = false; rtPrevGray = null; rtBgGray = null; rtAvgGray = null;
}
function stopCamera() { rtStop(); }

function rtDraw(now) {
  rtRaf = requestAnimationFrame(rtDraw);
  var original = $("#rtOriginal"), processed = $("#rtProcessed");
  if (!original || !processed) { cancelAnimationFrame(rtRaf); rtRaf = null; return; }
  if (rtSource === "camera" && rtFrozen) return;
  var source = rtSource === "camera" ? $("#labVideo") : $("#vidFile");
  if (!source || !source.videoWidth || !source.videoHeight) return;
  if (rtSource === "camera" && !rtStream) return;
  if (rtSource === "video" && source.paused && !rtNeedFrame) return;
  var width = 320, height = Math.max(2, Math.round(width * source.videoHeight / source.videoWidth));
  if (original.width !== width || original.height !== height) { original.width = width; original.height = height; processed.width = width; processed.height = height; rtPrevGray = null; rtBgGray = null; rtAvgGray = null; }
  var ctx = original.getContext("2d", { willReadFrequently: true }); ctx.drawImage(source, 0, 0, width, height);
  var image = ctx.getImageData(0, 0, width, height), gray = rtGray(image.data, width * height);
  rtLastGray = gray; rtWidth = width; rtHeight = height;
  var outCtx = processed.getContext("2d");
  if (rtMode === "fps") { if (now - rtLastFpsAt >= 1000 / rtFps) { outCtx.putImageData(image, 0, 0); rtLastFpsAt = now; } }
  else outCtx.putImageData(rtFilter(image, gray, width, height), 0, 0);
  if (rtMode === "diff") rtPrevGray = gray.slice();
  rtNeedFrame = false;
}

function rtGray(data, count) {
  var out = new Float32Array(count);
  for (var i = 0, p = 0; i < data.length; i += 4, p++) out[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  return out;
}

function rtFilter(image, gray, width, height) {
  if (rtMode === "original") return image;
  var output = new ImageData(width, height), input = image.data;
  function set(pixel, r, g, b) { var i = pixel * 4; output.data[i] = r; output.data[i + 1] = g; output.data[i + 2] = b; output.data[i + 3] = 255; }
  var x, y, p, value;
  if (rtMode === "gray") { for (p = 0; p < gray.length; p++) set(p, gray[p], gray[p], gray[p]); return output; }
  if (rtMode === "binary") { for (p = 0; p < gray.length; p++) { value = gray[p] > rtThreshold ? 255 : 0; set(p, value, value, value); } return output; }
  if (rtMode === "rgb") { var third = Math.floor(height / 3); for (y = 0; y < height; y++) for (x = 0; x < width; x++) { p = y * width + x; var idx = p * 4; if (y < third) set(p, input[idx], 0, 0); else if (y < third * 2) set(p, 0, input[idx + 1], 0); else set(p, 0, 0, input[idx + 2]); } return output; }
  if (rtMode === "blur") { for (y = 0; y < height; y++) for (x = 0; x < width; x++) { var sum = 0, n = 0; for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2) { var yy = y + dy, xx = x + dx; if (yy >= 0 && yy < height && xx >= 0 && xx < width) { sum += gray[yy * width + xx]; n++; } } value = sum / n; set(y * width + x, value, value, value); } return output; }
  if (rtMode === "sobel") { for (y = 1; y < height - 1; y++) for (x = 1; x < width - 1; x++) { p = y * width + x; var gx = -gray[p - width - 1] - 2 * gray[p - 1] - gray[p + width - 1] + gray[p - width + 1] + 2 * gray[p + 1] + gray[p + width + 1]; var gy = -gray[p - width - 1] - 2 * gray[p - width] - gray[p - width + 1] + gray[p + width - 1] + 2 * gray[p + width] + gray[p + width + 1]; value = Math.min(255, Math.hypot(gx, gy)); set(p, value, value, value); } return output; }
  if (rtMode === "lowres") { var step = Math.max(1, Math.round(width / rtResolution)); for (y = 0; y < height; y++) for (x = 0; x < width; x++) { var sy = Math.floor(y / step) * step, sx = Math.floor(x / step) * step, q = (sy * width + sx) * 4; set(y * width + x, input[q], input[q + 1], input[q + 2]); } return output; }
  if (rtMode === "pool") { var size = 8; for (var by = 0; by < height; by += size) for (var bx = 0; bx < width; bx += size) { var max = 0, total = 0, count = 0; for (y = by; y < Math.min(by + size, height); y++) for (x = bx; x < Math.min(bx + size, width); x++) { value = gray[y * width + x]; max = Math.max(max, value); total += value; count++; } value = rtPool === "max" ? max : total / count; for (y = by; y < Math.min(by + size, height); y++) for (x = bx; x < Math.min(bx + size, width); x++) set(y * width + x, value, value, value); } return output; }
  if (rtMode === "diff" || rtMode === "bg") { var base = rtMode === "diff" ? rtPrevGray : rtBgGray; for (p = 0; p < gray.length; p++) { value = base ? Math.min(255, Math.abs(gray[p] - base[p]) * (rtMode === "diff" ? 3 : 2.5)) : (rtMode === "bg" ? 40 : 0); set(p, value, value, value); } return output; }
  if (rtMode === "avg") { if (!rtAvgGray) rtAvgGray = gray.slice(); else for (p = 0; p < gray.length; p++) rtAvgGray[p] += (gray[p] - rtAvgGray[p]) * 0.05; for (p = 0; p < gray.length; p++) set(p, rtAvgGray[p], rtAvgGray[p], rtAvgGray[p]); return output; }
  return image;
}

function rtInspect(event) {
  var video = $("#vidFile");
  var paused = (rtSource === "camera" && rtFrozen) || (rtSource === "video" && video && video.paused);
  if (!paused) { toast(rtSource === "camera" ? "一時停止してからタップしてください" : "動画を停止してからタップしてください"); return; }
  if (!rtLastGray) return;
  var canvas = $("#rtOriginal"), rect = canvas.getBoundingClientRect();
  var x = Math.max(1, Math.min(rtWidth - 2, Math.floor((event.clientX - rect.left) * rtWidth / rect.width)));
  var y = Math.max(1, Math.min(rtHeight - 2, Math.floor((event.clientY - rect.top) * rtHeight / rect.height)));
  var sx = [[-1,0,1],[-2,0,2],[-1,0,1]], sy = [[-1,-2,-1],[0,0,0],[1,2,1]], values = [], gx = 0, gy = 0;
  for (var dy = -1; dy <= 1; dy++) { var row = []; for (var dx = -1; dx <= 1; dx++) { var value = Math.round(rtLastGray[(y + dy) * rtWidth + x + dx]); row.push(value); gx += value * sx[dy + 1][dx + 1]; gy += value * sy[dy + 1][dx + 1]; } values.push(row); }
  var magnitude = Math.round(Math.hypot(gx, gy));
  function table(matrix, klass) { return '<table class="itbl ' + (klass || '') + '">' + matrix.map(function (row) { return '<tr>' + row.map(function (value) { return '<td>' + value + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>'; }
  $("#rtInspector").innerHTML = '<div class="card" style="margin:0"><h2>畳み込みインスペクタ</h2><div class="irow"><div><div class="label">入力3×3</div>' + table(values) + '</div><div><div class="label">Sobel X</div>' + table(sx, 'kern') + '</div><div><div class="label">Sobel Y</div>' + table(sy, 'kern') + '</div></div><div class="label">計算結果</div><div>Gx = <b>' + gx + '</b> / Gy = <b>' + gy + '</b> / √(Gx² + Gy²) ≒ <b>' + magnitude + '</b></div><div class="label">読み方</div><div>「左側をマイナス、右側をプラスとして、左右の明るさの差を計算する。上下も同じように計算し、差が大きいほど境界として強く反応する」</div><div class="label">解釈</div><div>' + (magnitude > 100 ? 'この位置は強い境界です。' : 'この位置は比較的平坦で、境界としての反応は弱めです。') + '</div></div>';
}

function rtStartQuestion() {
  var map = { sobel:"sobel", pool:"pool", diff:"diff", bg:"diff", avg:"video", fps:"video", lowres: rtSource === "video" ? "video" : "" };
  var tag = map[rtMode] || "";
  var items = QUESTIONS.filter(function (q) { return q.type === "lab" && (!tag || q.labTag === tag); });
  if (!items.length) items = QUESTIONS.filter(function (q) { return q.type === "lab"; });
  if (!items.length) return toast("画像解析の問題が未登録です");
  startSession(shuffle(items), "画像解析ラボ 確認問題");
}
