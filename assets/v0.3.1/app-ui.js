"use strict";

function showViewError(target, error) {
  target.innerHTML = `<div class="card"><h2>画面を開けませんでした</h2><div class="muted">${esc(error && (error.message || error))}</div><button class="btn primary" onclick="location.reload()">再読み込み</button></div>`;
  console.error(error);
}

function nav(view) {
  $$(".view").forEach(v => v.classList.remove("active"));
  const target = $("#view-" + view);
  if (!target) return;
  target.classList.add("active");
  $$("nav.tabs button").forEach(b => b.classList.toggle("active", b.dataset.nav === view));

  const renderers = {
    home: renderHome,
    study: renderStudy,
    cards: renderCards,
    lab: renderLab,
    stats: renderStats
  };
  const renderer = renderers[view];
  if (renderer) {
    try {
      const result = renderer();
      if (result && typeof result.catch === "function") {
        result.catch(error => showViewError(target, error));
      }
    } catch (error) {
      showViewError(target, error);
    }
  }

  if (view !== "lab") stopLab();
  window.scrollTo(0, 0);
}

$$("nav.tabs button").forEach(b => {
  b.onclick = () => nav(b.dataset.nav);
});

async function backupAge() {
  const meta = await getOne("meta", "lastBackupAt");
  return meta && meta.value ? Math.floor((Date.now() - meta.value) / DAY) : null;
}

async function renderHome() {
  const due = dueQuestions();
  const news = newQuestions();
  const acc = accuracy(LOGS);
  const streak = streakDays();
  const age = await backupAge();
  const overdue = QUESTIONS.filter(q => SRS[q.id] && SRS[q.id].due < today0()).length;
  const notice = age === null
    ? `<div class="notice warn"><b>バックアップがまだありません</b><div class="muted">3端末で使うため、記録タブからJSONを書き出しておくと安心です。</div></div>`
    : age >= 14
      ? `<div class="notice warn"><b>最終バックアップから${age}日経過</b><div class="muted">記録タブから新しいバックアップを作成してください。</div></div>`
      : "";
  const priority = due.slice(0, 4).map(q =>
    `<li><b>${esc(q.topic)}</b><div class="why">${esc(priorityInfo(SRS[q.id]).why)}</div></li>`
  ).join("") || `<li class="muted">今日の復習はありません。</li>`;

  $("#view-home").innerHTML = `${notice}
    <div class="card">
      <div class="eyebrow">きょうの状態</div>
      <div class="row">
        <div class="stat"><div class="v">${due.length}<small>問</small></div><div class="l">今日の復習</div></div>
        <div class="stat"><div class="v">${overdue}<small>問</small></div><div class="l">期限超過</div></div>
        <div class="stat"><div class="v">${acc == null ? "–" : acc + "%"}</div><div class="l">総合正答率</div></div>
        <div class="stat"><div class="v">${streak}<small>日</small></div><div class="l">継続</div></div>
      </div>
    </div>
    <div class="card">
      <h2>優先して復習</h2>
      <ul class="plist">${priority}</ul>
      <button class="btn primary" id="homeReview" ${due.length ? "" : "disabled"}>今日の復習を始める（${due.length}問）</button>
      <button class="btn ghost" id="homeNew" ${news.length ? "" : "disabled"}>新しい問題（${news.length}問）</button>
      <button class="btn ghost" id="homeLab">画像解析ラボ</button>
    </div>`;

  $("#homeReview").onclick = () => startSession(due, "今日の復習");
  $("#homeNew").onclick = () => startSession(shuffle(news).slice(0, 10), "新規学習");
  $("#homeLab").onclick = () => nav("lab");
}

function renderStudy() {
  const categories = [...new Set(QUESTIONS.map(q => q.category))];
  const weak = QUESTIONS.filter(q => SRS[q.id] && (SRS[q.id].lapses || !SRS[q.id].lastCorrect));
  const codes = QUESTIONS.filter(q => q.type === "code");
  const formulas = QUESTIONS.filter(q => q.type === "formula");

  $("#view-study").innerHTML = `<div class="card"><h2>ドリル</h2>
    <button class="btn primary" id="stWeak" ${weak.length ? "" : "disabled"}>弱点ドリル（${weak.length}問）</button>
    <button class="btn ghost" id="stCode" ${codes.length ? "" : "disabled"}>コード読解（${codes.length}問）</button>
    <button class="btn ghost" id="stFormula" ${formulas.length ? "" : "disabled"}>数式問題（${formulas.length}問）</button>
    <button class="btn ghost" id="stAll">全問からランダム10問</button>
    </div><div class="card"><h2>分野別</h2>${categories.map(c =>
      `<button class="btn ghost small" data-cat="${esc(c)}">${esc(c)}（${QUESTIONS.filter(q => q.category === c).length}問）</button>`
    ).join("")}</div>`;

  $("#stWeak").onclick = () => startSession(shuffle(weak), "弱点ドリル");
  $("#stCode").onclick = () => startSession(shuffle(codes), "コード読解");
  $("#stFormula").onclick = () => startSession(shuffle(formulas), "数式問題");
  $("#stAll").onclick = () => startSession(shuffle(QUESTIONS).slice(0, 10), "ランダム演習");
  $$("#view-study [data-cat]").forEach(b => {
    b.onclick = () => startSession(shuffle(QUESTIONS.filter(q => q.category === b.dataset.cat)), b.dataset.cat);
  });
}

function startSession(list, title) {
  if (!list.length) return toast("対象の問題がありません");
  session = { list, title, idx: 0, correct: 0, grading: false };
  nav("quiz");
  renderQuestion();
}

function endSession() {
  session = null;
  nav("home");
}

function renderQuestion() {
  const q = session.list[session.idx];
  session.selected = null;
  session.confidence = null;
  session.startedAt = Date.now();
  session.grading = false;

  $("#view-quiz").innerHTML = `<div class="muted">${esc(session.title)} ${session.idx + 1}/${session.list.length}</div>
    <div class="card">
      <div><span class="tag">${esc(q.category)}</span><span class="tag">${esc(q.topic)}</span><span class="tag">${esc(q.difficulty || "")}</span></div>
      ${q.code ? `<pre>${esc(q.code)}</pre>` : ""}
      <p><b>Q. ${esc(q.question)}</b></p>
      <div id="choices">${q.choices.map((c, i) => `<button class="choice" data-i="${i}"><span class="abc">${String.fromCharCode(65 + i)}</span>${esc(c)}</button>`).join("")}</div>
      <div class="label">自信度</div>
      <div class="confbar" id="confidence"><button data-c="0">低い</button><button data-c="1">普通</button><button data-c="2">高い</button></div>
      <button class="btn primary" id="grade" disabled>採点する</button>
      <button class="btn ghost small" id="quit">中断してホームへ</button>
    </div>`;

  $$("#choices button").forEach(b => {
    b.onclick = () => {
      $$("#choices button").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
      session.selected = Number(b.dataset.i);
      updateGrade();
    };
  });
  $$("#confidence button").forEach(b => {
    b.onclick = () => {
      $$("#confidence button").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
      session.confidence = Number(b.dataset.c);
      updateGrade();
    };
  });
  $("#grade").onclick = gradeQuestion;
  $("#quit").onclick = endSession;
}

function updateGrade() {
  $("#grade").disabled = session.grading || session.selected == null || session.confidence == null;
}

function saveAnswerAtomic(srs, log) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["srs", "logs"], "readwrite");
    tx.objectStore("srs").put(srs);
    tx.objectStore("logs").put(log);
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("回答記録を保存できませんでした"));
  });
}

async function gradeQuestion() {
  if (!session || session.grading) return;
  session.grading = true;
  updateGrade();
  $$("#choices button, #confidence button, #quit").forEach(b => { b.disabled = true; });

  const q = session.list[session.idx];
  const ok = session.selected === q.answer;
  const srs = nextReview(SRS[q.id], ok, session.confidence);
  srs.questionId = q.id;
  const log = {
    answerId: uid("a"),
    questionId: q.id,
    answeredAt: Date.now(),
    isCorrect: ok,
    selectedAnswer: session.selected,
    confidence: session.confidence,
    answerTimeSeconds: Math.round((Date.now() - session.startedAt) / 1000),
    errorReason: null,
    repetitionStage: srs.stage,
    sourceDevice: /Mobi|Android/i.test(navigator.userAgent) ? "スマホ" : "PC"
  };

  try {
    await saveAnswerAtomic(srs, log);
    if (ok) session.correct++;
    SRS[q.id] = srs;
    LOGS.push(log);
    session.lastLog = log;
    renderFeedback(q, ok);
  } catch (error) {
    session.grading = false;
    $$("#choices button, #confidence button, #quit").forEach(b => { b.disabled = false; });
    updateGrade();
    toast("保存に失敗しました：" + (error.message || error));
  }
}

const MARK_O = '<svg viewBox="0 0 100 100"><path d="M50 12 C27 12 12 30 12 50 C12 72 30 88 50 88 C72 88 88 71 88 50 C88 30 72 14 52 13"/></svg>';
const MARK_X = '<svg viewBox="0 0 100 100"><path d="M20 20 L80 80 M80 20 L20 80"/></svg>';

function sourceCards(q) {
  if (!Array.isArray(q.sources) || !q.sources.length) return "";
  const kindNames = { "jdla": "JDLA公式資料", "primary-paper": "原典論文", "official-doc": "公式ドキュメント", "support": "補助解説" };
  return `<div class="label">根拠を確認</div>${q.sources.map(s => {
    const url = isHttpUrl(s.url) ? s.url : "";
    const kind = kindNames[s.kind] || s.kind || "参考";
    return `<div><span class="tag ai">${esc(kind)}</span>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(s.title || url)}</a>` : esc(s.title || "")} ${s.year ? `<span class="muted">${esc(s.year)}</span>` : ""}${s.why ? `<div class="muted">${esc(s.why)}</div>` : ""}</div>`;
  }).join("")}`;
}

function renderFeedback(q, ok) {
  const terms = (q.terms || []).map(name => {
    const t = TERMS.find(x => x.en === name);
    return t ? `<hr class="divider"><div class="termword"><ruby>${esc(t.en)}<rt>${esc(t.kana)}</rt></ruby></div>${t.full ? `<div class="muted">${esc(t.full)}</div>` : ""}<div>${esc(t.ja)}</div><div class="muted">${esc(t.desc)}</div>` : "";
  }).join("");
  const formulas = (q.formulas || []).map(name => {
    const f = FORMULAS.find(x => x.name === name);
    return f ? `<hr class="divider"><div class="fx">${esc(f.fx)}</div><div class="label">読み方</div><div>${esc(f.yomi)}</div><div class="label">覚え方</div><div>${esc(f.oboe)}</div>` : "";
  }).join("");

  $("#view-quiz").innerHTML = `<div class="muted">${esc(session.title)} ${session.idx + 1}/${session.list.length}</div>
    <div class="card">
      <div class="mark">${ok ? MARK_O : MARK_X}</div>
      <div style="text-align:center;color:var(--shu);font-weight:700">${ok ? "正解" : "不正解"}</div>
      <p><b>Q. ${esc(q.question)}</b></p>
      ${q.code ? `<pre>${esc(q.code)}</pre>` : ""}
      ${q.choices.map((c, i) => `<button class="choice ${i === q.answer ? "correct" : i === session.selected ? "wrong" : ""}" disabled><span class="abc">${String.fromCharCode(65 + i)}</span>${esc(c)}</button>`).join("")}
      <div class="label">解説</div><div>${esc(q.explanation || "")}</div>
      ${sourceCards(q)}${terms}${formulas}
      ${ok ? "" : `<div class="label">誤答の原因</div><div class="reasons" id="reasons">${ERROR_REASONS.map((r, i) => `<button data-r="${i}">${esc(r)}</button>`).join("")}</div>`}
      <div class="muted" style="margin-top:12px">次回復習：${fmtDate(SRS[q.id].due)}</div>
      <button class="btn ghost small" id="copyPrompt">GPT相談文をコピー</button>
      <button class="btn primary" id="next">${session.idx + 1 < session.list.length ? "次の問題へ" : "結果を見る"}</button>
    </div>`;

  $$("#reasons button").forEach(b => {
    b.onclick = async () => {
      $$("#reasons button").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
      session.lastLog.errorReason = ERROR_REASONS[Number(b.dataset.r)];
      try {
        await putOne("logs", session.lastLog);
      } catch (error) {
        toast("誤答原因を保存できませんでした：" + (error.message || error));
      }
    };
  });
  $("#copyPrompt").onclick = () => copyPrompt(q, ok);
  $("#next").onclick = () => {
    session.idx++;
    session.idx < session.list.length ? renderQuestion() : renderResult();
  };
}

function copyPrompt(q, ok) {
  const text = `E資格の復習です。
分野：${q.category} / ${q.topic}
問題：${q.question}
選択肢：
${q.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`).join("\n")}
私の回答：${q.choices[session.selected]}
正答：${q.choices[q.answer]}
結果：${ok ? "正解" : "不正解"}
自信度：${["低い", "普通", "高い"][session.confidence]}

用語には英語の発音用フリガナと日本語訳を、数式には日本語での読み方を付け、考え方・間違えやすい点・類題2問を説明してください。`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast("相談文をコピーしました")).catch(() => prompt("コピーしてください", text));
  } else {
    prompt("コピーしてください", text);
  }
}

function renderResult() {
  const finished = session;
  session = null;
  $("#view-quiz").innerHTML = `<div class="card" style="text-align:center"><div class="eyebrow">${esc(finished.title)} おつかれさまでした</div><div style="font-size:1.9rem;font-weight:700">${finished.correct}/${finished.list.length}問正解</div><div class="muted">復習予定へ反映しました。</div><button class="btn primary" id="resultHome">ホームへ戻る</button></div>`;
  $("#resultHome").onclick = () => nav("home");
}

function renderCards() {
  $("#view-cards").innerHTML = `<div class="subtabs"><button id="tabTerm" class="${cardTab === "term" ? "active" : ""}">用語</button><button id="tabFormula" class="${cardTab === "formula" ? "active" : ""}">数式</button><button id="tabCompare" class="${cardTab === "compare" ? "active" : ""}">比較</button></div><div id="cardList"></div>`;
  $("#tabTerm").onclick = () => { cardTab = "term"; renderCards(); };
  $("#tabFormula").onclick = () => { cardTab = "formula"; renderCards(); };
  $("#tabCompare").onclick = () => { cardTab = "compare"; renderCards(); };
  const list = $("#cardList");
  if (cardTab === "term") {
    list.innerHTML = TERMS.map(t => `<div class="card"><div class="termword"><ruby>${esc(t.en)}<rt>${esc(t.kana)}</rt></ruby></div>${t.full ? `<div class="muted">${esc(t.full)}</div>` : ""}<div>${esc(t.ja)}</div><div class="muted">${esc(t.desc)}</div></div>`).join("");
  } else if (cardTab === "formula") {
    list.innerHTML = FORMULAS.map(f => `<div class="card"><h2>${esc(f.name)}</h2><div class="fx">${esc(f.fx)}</div><div class="label">読み方</div><div>${esc(f.yomi)}</div><div class="label">意味</div><div>${esc(f.imi)}</div><div class="label">覚え方</div><div>${esc(f.oboe)}</div><div class="label">具体例</div><div class="muted">${esc(f.rei)}</div></div>`).join("");
  } else {
    list.innerHTML = COMPARES.map(c => `<div class="card"><div class="cmprow"><div class="cmpcol"><b><ruby>${esc(c.l.t)}<rt>${esc(c.l.k)}</rt></ruby></b><div>${esc(c.l.j)}</div><div class="muted">${esc(c.l.d)}</div></div><div class="cmpvs">vs</div><div class="cmpcol"><b><ruby>${esc(c.r.t)}<rt>${esc(c.r.k)}</rt></ruby></b><div>${esc(c.r.j)}</div><div class="muted">${esc(c.r.d)}</div></div></div><div class="label">見分け方</div><div style="color:var(--shu);font-weight:700">${esc(c.key)}</div></div>`).join("");
  }
}
