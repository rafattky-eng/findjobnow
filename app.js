// FindJob Now V7.1 — Main application controller (Tokyo + foreigner focus)

const $ = id => document.getElementById(id);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

function say(msg, ok) {
  const el = $("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "toast show " + (ok ? "ok" : "err");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { el.classList.remove("show"); }, 2800);
}

function setView(v) {
  STATE.view = v;
  persist();
  render();
  window.scrollTo(0, 0);
}

/* ========== LANDING ========== */
function renderLanding() {
  return `
  <div class="card hero" style="text-align:center;padding:28px 20px">
    <div class="step-badge">${t("start_here")}</div>
    <h1 class="hero-title">FindJob Now</h1>
    <p class="sub">${t("hero_sub")}</p>
    <div class="btn-row" style="margin-top:20px">
      <button type="button" class="btn primary btn-lg" id="btnUpload">📄 ${t("upload_cv")}</button>
      <input type="file" id="cvFile" class="hidden" accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain">
      <button type="button" class="btn secondary" id="btnPaste">📋 ${t("paste_cv")}</button>
      <button type="button" class="btn ghost" id="btnSkip">${t("skip_cv")}</button>
    </div>
    <div id="pasteModal" class="hidden" style="margin-top:14px;text-align:left">
      <textarea class="textarea" id="pasteText" rows="7" placeholder="${tx("Paste your resume text…", "履歴書テキストを貼り付け…")}"></textarea>
      <button type="button" class="btn primary" id="btnPasteGo" style="margin-top:10px">${tx("Analyze", "分析")}</button>
    </div>
  </div>
  <p class="honesty">${t("honesty")}</p>
  <details class="more">
    <summary>📤 ${t("install_title")}</summary>
    <ol style="color:var(--mu);font-size:13px;padding-left:20px">
      <li>${t("install_1")}</li>
      <li>${t("install_2")}</li>
      <li>${t("install_3")}</li>
    </ol>
  </details>
  `;
}

function wireLanding() {
  $("btnUpload")?.addEventListener("click", () => $("cvFile")?.click());
  $("cvFile")?.addEventListener("change", async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    await handleFile(f);
  });
  $("btnPaste")?.addEventListener("click", () => $("pasteModal")?.classList.toggle("hidden"));
  $("btnPasteGo")?.addEventListener("click", () => {
    const text = $("pasteText")?.value || "";
    if (text.trim().length < 40) { say(tx("Please paste more text", "もっとテキストを貼り付けてください"), 0); return; }
    runAnalysis(text, true);
  });
  $("btnSkip")?.addEventListener("click", () => {
    STATE.onboarding.hasResume = false;
    STATE.onboarding.step = 2;
    STATE.onboarding.wizardStep = 1;
    STATE.view = "onboarding";
    STATE.profile = STATE.profile || { name: "", skills: [], yrs: 0, jlpt: "", strengths: [], missing: [tx("Upload a resume for full analysis", "詳細分析には履歴書を")] };
    STATE.scores = STATE.scores || { resume: 40, japan: 40, language: 30, experience: 30, visa: 50, readiness: 40 };
    persist();
    render();
  });
}

async function handleFile(f) {
  say(t("reading"), 1);
  try {
    let text = "";
    if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) text = await extractPdfText(f);
    else text = await f.text();
    if (text.trim().length < 40) {
      say(tx("Could not extract text. Please paste instead.", "抽出できませんでした。貼り付けてください。"), 0);
      $("pasteModal")?.classList.remove("hidden");
      return;
    }
    runAnalysis(text, true);
  } catch (err) {
    console.error(err);
    say(tx("Read failed — try paste", "読み込み失敗 — 貼り付けてください"), 0);
    $("pasteModal")?.classList.remove("hidden");
  }
}

/* ========== PDF ========== */
let pdfJsPromise = null;
async function ensurePdfJs() {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    return window.pdfjsLib;
  }
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      const timer = setTimeout(() => reject(new Error("timeout")), 12000);
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.async = true;
      s.onload = () => { clearTimeout(timer); window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error("no lib")); };
      s.onerror = () => { clearTimeout(timer); reject(new Error("load fail")); };
      document.head.appendChild(s);
    }).then(lib => {
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      return lib;
    }).catch(err => { pdfJsPromise = null; throw err; });
  }
  return pdfJsPromise;
}

async function extractPdfText(file) {
  const pdfjs = await ensurePdfJs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let i = 1; i <= Math.min(pdf.numPages, 12); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  if (text.trim().length < 40) throw new Error("No text");
  return text.trim();
}

/* ========== ONBOARDING WIZARD (6 questions) ========== */
function renderOnboarding() {
  const o = STATE.onboarding || {};
  if (o.step === 1) {
    return renderLanding();
  }
  const ws = o.wizardStep || 1;
  const total = 6;
  const dots = [1, 2, 3, 4, 5, 6].map(i =>
    `<div class="wizard-dot ${i === ws ? "on" : i < ws ? "done" : ""}"></div>`
  ).join("");

  let body = "";
  if (ws === 1) {
    const selected = Array.isArray(o.desiredRoles) ? o.desiredRoles : (o.desiredRole ? [o.desiredRole] : []);
    const ROLE_SUGGESTIONS = ["Travel Consultant","Tour Coordinator","Travel Operations Manager","Customer Success Manager","Hospitality Manager","Project Manager","Software Engineer","Marketing Manager","Sales Manager","Product Manager"];
    body = `
      <h2>${t("wizard_role")}</h2>
      <p class="sub">${tx("Select one or more roles. You can refine later.", "1つ以上選択。後から変更できます。")}</p>
      <input class="input" id="wRole" value="${esc(selected.join(", "))}" placeholder="${tx("Type a role or pick below…", "職種を入力、または下から選択…")}" autocomplete="off">
      <div class="chip-row" style="margin-top:10px">
        ${ROLE_SUGGESTIONS.map(r =>
          `<button type="button" class="chip ${selected.includes(r) ? "on" : ""}" data-role="${esc(r)}">${esc(r)}</button>`
        ).join("")}
      </div>
      <p class="sub" style="margin-top:8px">${tx("Selected:", "選択中:")} <strong id="roleCount">${selected.length || 0}</strong></p>`;
  } else if (ws === 2) {
    body = `
      <h2>${t("wizard_industry")}</h2>
      <div class="chip-row">
        ${INDUSTRIES.map(ind =>
          `<button type="button" class="chip ${o.desiredIndustry === ind ? "on" : ""}" data-ind="${esc(ind)}">${esc(ind)}</button>`
        ).join("")}
      </div>`;
  } else if (ws === 3) {
    body = `
      <h2>${t("wizard_exp")}</h2>
      <div class="chip-row">
        ${EXP_LEVELS.map(e =>
          `<button type="button" class="chip ${o.experience === e.id ? "on" : ""}" data-exp="${e.id}">${tx(e.en, e.jp)}</button>`
        ).join("")}
      </div>`;
  } else if (ws === 4) {
    body = `
      <h2>${t("wizard_ja")}</h2>
      <p class="sub">1 = N5 · 2 = N4 · 3 = N3 · 4 = N2 · 5 = N1</p>
      <div class="chip-row">
        ${[1, 2, 3, 4, 5].map(n =>
          `<button type="button" class="chip ${o.japanese === n ? "on" : ""}" data-ja="${n}">${n} (${JA_LABELS[n]})</button>`
        ).join("")}
      </div>`;
  } else if (ws === 5) {
    body = `
      <h2>${t("wizard_visa")}</h2>
      <div class="chip-row">
        ${VISA_OPTS.map(v =>
          `<button type="button" class="chip ${o.visaStatus === v.id ? "on" : ""}" data-visa="${v.id}">${tx(v.en, v.jp)}</button>`
        ).join("")}
      </div>`;
  } else {
    body = `
      <h2>${t("wizard_location")}</h2>
      <p class="sub">${tx("Tokyo is the default focus for most foreigner-friendly roles.", "外国人歓迎の求人は東京が中心です。")}</p>
      <div class="chip-row">
        ${LOCATION_OPTS.map(loc =>
          `<button type="button" class="chip ${o.location === loc.id ? "on" : ""}" data-loc="${loc.id}">${tx(loc.en, loc.jp)}</button>`
        ).join("")}
      </div>`;
  }

  return `
  <div class="card">
    <div class="step-badge">${t("step_target")} · ${ws}/${total}</div>
    <div class="wizard-progress">${dots}</div>
    ${body}
  </div>
  <div class="sticky-cta">
    <button type="button" class="btn primary btn-lg" id="wNext">${ws < total ? t("next") : t("see_results")}</button>
    ${ws > 1 ? `<button type="button" class="btn ghost" id="wBack" style="margin-top:8px">${t("back")}</button>` : ""}
  </div>
  `;
}

function wireOnboarding() {
  const o = STATE.onboarding;
  if (!Array.isArray(o.desiredRoles)) {
    o.desiredRoles = o.desiredRole ? [o.desiredRole] : [];
  }

  $$("[data-role]").forEach(b => b.addEventListener("click", () => {
    const role = b.dataset.role;
    const idx = o.desiredRoles.indexOf(role);
    if (idx >= 0) o.desiredRoles.splice(idx, 1);
    else o.desiredRoles.push(role);
    o.desiredRole = o.desiredRoles[0] || "";
    if ($("wRole")) $("wRole").value = o.desiredRoles.join(", ");
    const rc = $("roleCount");
    if (rc) rc.textContent = String(o.desiredRoles.length);
    persist(); render();
  }));
  $("wRole")?.addEventListener("input", e => {
    const raw = e.target.value.slice(0, 160);
    const parts = raw.split(/[,/|]+/).map(s => s.trim()).filter(Boolean);
    o.desiredRoles = parts.length ? parts : [];
    o.desiredRole = o.desiredRoles[0] || "";
    const rc = $("roleCount");
    if (rc) rc.textContent = String(o.desiredRoles.length);
    persist();
  });
  $$("[data-ind]").forEach(b => b.addEventListener("click", () => {
    o.desiredIndustry = b.dataset.ind;
    STATE.targetJobs.industries = [b.dataset.ind];
    persist(); render();
  }));
  $$("[data-exp]").forEach(b => b.addEventListener("click", () => {
    o.experience = b.dataset.exp;
    persist(); render();
  }));
  $$("[data-ja]").forEach(b => b.addEventListener("click", () => {
    o.japanese = parseInt(b.dataset.ja, 10);
    persist(); render();
  }));
  $$("[data-visa]").forEach(b => b.addEventListener("click", () => {
    o.visaStatus = b.dataset.visa;
    persist(); render();
  }));
  $$("[data-loc]").forEach(b => b.addEventListener("click", () => {
    o.location = b.dataset.loc;
    persist(); render();
  }));

  $("wBack")?.addEventListener("click", () => {
    o.wizardStep = Math.max(1, (o.wizardStep || 1) - 1);
    persist(); render();
  });
  $("wNext")?.addEventListener("click", () => {
    const ws = o.wizardStep || 1;
    if (ws === 1) {
      let roles = Array.isArray(o.desiredRoles) ? o.desiredRoles.filter(Boolean) : [];
      const typed = ($("wRole")?.value || "").trim();
      if (typed) {
        const parts = typed.split(/[,/|]+/).map(s => s.trim()).filter(Boolean);
        if (parts.length) roles = parts;
      }
      if (!roles.length) { say(t("pick_role"), 0); return; }
      o.desiredRoles = roles;
      o.desiredRole = roles[0];
      STATE.targetJobs.titles = roles.slice(0, 5);
    }
    if (ws === 2 && !o.desiredIndustry) { say(t("pick_industry"), 0); return; }
    if (ws === 3 && !o.experience) { say(t("pick_exp"), 0); return; }
    if (ws === 4 && !(o.japanese >= 1)) { say(t("pick_ja"), 0); return; }
    if (ws === 5 && !o.visaStatus) { say(t("pick_visa"), 0); return; }
    if (ws === 6 && !o.location) { say(t("pick_location"), 0); return; }

    if (ws < 6) {
      o.wizardStep = ws + 1;
      persist();
      render();
      window.scrollTo(0, 0);
    } else {
      finalizeWizard();
    }
  });
}

/* ========== DASHBOARD ========== */
function renderDashboard() {
  const p = STATE.profile || {};
  const s = STATE.scores || {};
  const td = STATE.targetDNA;
  const o = STATE.onboarding || {};

  if (!td && (o.desiredRole || o.desiredIndustry)) {
    try { buildTargetDNA({ dna: STATE.dna, scores: s, missing: p.missing, name: p.name }); } catch (_) {}
  }
  const dna = STATE.targetDNA;

  const match = dna?.targetMatch || s.readiness || 0;
  const ready = s.readiness || s.resume || 0;
  const japan = s.japan || 0;

  const targets = (STATE.targetCompanies || [])
    .map(id => FOREIGNER_FRIENDLY_COMPANIES.find(c => c.id === id))
    .filter(Boolean);

  return `
  <!-- Hero DNA -->
  <div class="card hero">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="step-badge">Career DNA</span>
      <span class="muted" style="font-size:11px">V${APP_VERSION}</span>
    </div>
    ${dna ? `
    <div class="dna-path">
      <div class="dna-current">${t("current")}: ${esc(dna.currentIdentity)}</div>
      <div class="dna-arrow">↓</div>
      <div class="dna-target">${esc(dna.targetIdentity)}</div>
      ${dna.archetype ? `<div class="archetype-badge">${esc(STATE.settings.lang === "jp" ? dna.archetype.jp : dna.archetype.en)}</div>` : ""}
    </div>
    <div class="score-grid">
      <div class="score-card"><div class="score-val">${match}</div><div class="score-lbl">${t("match")} %</div></div>
      <div class="score-card"><div class="score-val">${ready}</div><div class="score-lbl">${t("readiness")} %</div></div>
      <div class="score-card"><div class="score-val">${japan}</div><div class="score-lbl">${t("japan_fit")} %</div></div>
    </div>
    ${o.location ? `<p class="sub" style="margin-top:8px">${t("location_pref")}: <strong>${esc(o.location)}</strong></p>` : ""}
    ` : `
    <p class="sub" style="margin-top:12px">${tx("Complete the career target wizard to unlock your DNA.", "キャリア目標ウィザードを完了するとDNAが表示されます。")}</p>
    <button type="button" class="btn primary" data-go="onboarding">${tx("Start wizard", "ウィザード開始")}</button>
    `}
  </div>

  <!-- Target Companies -->
  <div class="card" style="margin-top:14px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 style="margin:0">${t("target_companies")}</h3>
      <span class="muted" style="font-size:12px">${targets.length} ${t("companies_tracked")}</span>
    </div>
    ${targets.length ? `
      <div class="chip-row" style="margin-top:8px">
        ${targets.map(c => `<span class="chip on" style="cursor:default">${esc(c.name)}</span>`).join("")}
      </div>
      <button type="button" class="btn secondary sm" data-go="jobs" style="margin-top:8px">${tx("Manage in Jobs tab", "求人タブで管理")}</button>
    ` : `
      <p class="sub" style="margin-top:8px">${tx("Add foreigner-friendly companies from the Jobs → Company Directory tab.", "求人 → 企業ディレクトリから追加。")}</p>
      <button type="button" class="btn secondary sm" data-go="jobs" style="margin-top:6px">${t("company_directory")}</button>
    `}
  </div>

  <!-- Action Center — 3 primary only -->
  <h3 style="margin:16px 0 8px">${tx("Action Center", "アクションセンター")}</h3>
  <div class="action-grid">
    <button type="button" class="action-card" data-go="jobs">
      <div class="action-icon">🔍</div>
      <div><div class="action-title">${t("find_jobs")}</div><div class="action-sub">${tx("Japan boards + companies", "日本ボード + 企業")}</div></div>
    </button>
    <button type="button" class="action-card" data-go="tools" data-tool="ats">
      <div class="action-icon">📄</div>
      <div><div class="action-title">${t("improve_resume")}</div><div class="action-sub">ATS · Rewrite · JP resume</div></div>
    </button>
    <button type="button" class="action-card" data-go="tools" data-tool="culture">
      <div class="action-icon">🏯</div>
      <div><div class="action-title">${t("culture_tips")}</div><div class="action-sub">${tx("Visa · JLPT · Interview", "ビザ · JLPT · 面接")}</div></div>
    </button>
  </div>

  <!-- Quick Insights — max 3 -->
  <div class="card" style="margin-top:14px">
    <h3 style="margin-bottom:4px">${tx("Quick Insights", "クイックインサイト")}</h3>
    <div class="insight-row">
      <span class="insight-icon">✅</span>
      <div><strong>${t("strengths")}</strong><br><span class="muted">${esc((p.strengths || []).slice(0, 2).join(" · ") || "—")}</span></div>
    </div>
    <div class="insight-row">
      <span class="insight-icon">⚠️</span>
      <div><strong>${t("skill_gaps")}</strong><br><span class="muted">${esc((dna?.gaps || p.missing || []).slice(0, 2).join(" · ") || "—")}</span></div>
    </div>
    <div class="insight-row">
      <span class="insight-icon">🎯</span>
      <div><strong>${t("next_action")}</strong><br><span class="muted">${esc(nextActionText())}</span></div>
    </div>
  </div>

  <!-- Opportunity Center -->
  ${dna ? renderOpportunity(dna) : ""}

  <div class="btn-row cols-2" style="margin-top:8px">
    <button type="button" class="btn secondary" data-go="onboarding">${t("edit_target")}</button>
    <button type="button" class="btn secondary" data-go="tracker">${tx("Tracker", "管理")}</button>
  </div>
  `;
}

function nextActionText() {
  const o = STATE.onboarding || {};
  const s = STATE.scores || {};
  if ((s.resume || 0) < 55) return tx("Improve resume with ATS tool", "ATSツールで履歴書を改善");
  if ((o.japanese || 0) < 3) return tx("Plan Japanese study toward N3", "日本語N3に向けた学習計画");
  if (!(STATE.targetCompanies || []).length) return tx("Add 3 target companies from the directory", "企業ディレクトリから3社追加");
  if (!(STATE.jobs || []).length) return tx("Search jobs on Japan boards", "日本の求人ボードで検索");
  return tx("Apply to top 3 matched roles this week", "今週マッチ上位3件に応募");
}

function renderOpportunity(dna) {
  const tab = STATE._oppTab || "immediate";
  const roles = dna.roles || {};
  const tabs = [
    ["immediate", t("immediate"), roles.immediate],
    ["growth", t("growth"), roles.growth],
    ["stretch", t("stretch"), roles.stretch],
    ["avoid", t("avoid"), roles.avoid]
  ];
  const active = tabs.find(x => x[0] === tab) || tabs[0];
  return `
  <div class="card" style="margin-top:14px">
    <h3>${tx("Opportunity Center", "オポチュニティセンター")}</h3>
    <div class="tabs">
      ${tabs.map(([id, label]) =>
        `<button type="button" class="tab ${id === tab ? "on" : ""}" data-opp="${id}">${label}</button>`
      ).join("")}
    </div>
    <div class="chip-row">
      ${(active[2] || []).map(r => `<span class="chip on" style="cursor:default">${esc(r)}</span>`).join("") || `<span class="muted">${tx("None", "なし")}</span>`}
    </div>
    ${dna.timeToTransition ? `<p class="sub" style="margin-top:8px">${tx("Expected transition", "移行目安")}: <strong>${esc(dna.timeToTransition)}</strong></p>` : ""}
    ${dna.learning?.length ? `<p class="sub">${tx("Learn", "学習")}: ${esc(dna.learning.slice(0, 2).join(" · "))}</p>` : ""}
  </div>`;
}

/* ========== RENDER ORCHESTRATOR ========== */
function render() {
  const main = $("main");
  if (!main) return;
  const v = STATE.view || "landing";
  const nav = $("bottomNav");
  const progress = $("progressWrap");

  $("btnEn")?.classList.toggle("active", STATE.settings.lang !== "jp");
  $("btnJp")?.classList.toggle("active", STATE.settings.lang === "jp");

  if (v === "landing" || (v === "onboarding" && STATE.onboarding?.step === 1 && !STATE.profile && !STATE.cvText)) {
    main.innerHTML = renderLanding();
    if (nav) nav.style.display = "none";
    document.body.classList.add("no-nav");
    if (progress) progress.classList.add("hidden");
    wireLanding();
  } else if (v === "onboarding") {
    main.innerHTML = renderOnboarding();
    if (nav) nav.style.display = "none";
    document.body.classList.add("no-nav");
    if (progress) {
      progress.classList.remove("hidden");
      const ws = STATE.onboarding?.wizardStep || 1;
      if ($("stepLabel")) $("stepLabel").textContent = `Step ${ws} of 6`;
      if ($("stepName")) $("stepName").textContent = t("step_target");
      if ($("progressFill")) $("progressFill").style.width = Math.round((ws / 6) * 100) + "%";
    }
    wireOnboarding();
  } else {
    if (nav) nav.style.display = "";
    document.body.classList.remove("no-nav");
    if (progress) progress.classList.add("hidden");
    if (v === "dashboard") main.innerHTML = renderDashboard();
    else if (v === "jobs") { main.innerHTML = renderJobs(); wireJobs(); }
    else if (v === "tools") { main.innerHTML = renderTools(); wireTools(); if (STATE._tool) { const p = $("toolPanel"); if (p) { p.classList.remove("hidden"); p.innerHTML = renderToolPanel(STATE._tool); wireToolPanel(STATE._tool); } } }
    else if (v === "tracker") { main.innerHTML = renderTracker(); wireTracker(); }
    else main.innerHTML = renderDashboard();
    wireCommon();
  }

  $$("#bottomNav button").forEach(b => {
    b.classList.toggle("active", b.dataset.view === v);
  });
  const foot = $("appFooter");
  if (foot) {
    foot.innerHTML = `<div>© 2026 Rafat Kotaki. All rights reserved.</div><div>FindJob Now · v${APP_VERSION}</div>`;
  }
}

function wireCommon() {
  $$("[data-go]").forEach(el => {
    el.addEventListener("click", () => {
      const go = el.dataset.go;
      if (el.dataset.tool) STATE._tool = el.dataset.tool;
      if (go === "onboarding") {
        STATE.onboarding.step = 2;
        STATE.onboarding.wizardStep = STATE.onboarding.wizardStep || 1;
      }
      if (go === "jobs") STATE._jobsTab = STATE._jobsTab || "matches";
      setView(go);
    });
  });
  $$("[data-opp]").forEach(b => {
    b.addEventListener("click", () => {
      STATE._oppTab = b.dataset.opp;
      render();
    });
  });
}

function wireChrome() {
  $("btnEn")?.addEventListener("click", () => setLang("en"));
  $("btnJp")?.addEventListener("click", () => setLang("jp"));
  $("btnRestart")?.addEventListener("click", () => {
    if (confirm(tx("Start over? Your local data will be cleared.", "最初からやり直しますか？ローカルデータは消去されます。"))) startOver();
  });
  $("btnBackup")?.addEventListener("click", downloadBackup);
  $("logoHome")?.addEventListener("click", () => setView(STATE.profile || STATE.cvText || STATE.onboarding?.desiredRole ? "dashboard" : "landing"));
  $$("#bottomNav button").forEach(b => {
    b.addEventListener("click", () => setView(b.dataset.view));
  });
  let restoreInput = $("restoreFile");
  if (!restoreInput) {
    restoreInput = document.createElement("input");
    restoreInput.type = "file";
    restoreInput.id = "restoreFile";
    restoreInput.accept = "application/json";
    restoreInput.className = "hidden";
    document.body.appendChild(restoreInput);
  }
  restoreInput.addEventListener("change", e => {
    const f = e.target.files?.[0];
    if (f) restoreBackup(f);
    e.target.value = "";
  });
  let pressTimer;
  $("btnBackup")?.addEventListener("touchstart", () => {
    pressTimer = setTimeout(() => $("restoreFile")?.click(), 800);
  });
  $("btnBackup")?.addEventListener("touchend", () => clearTimeout(pressTimer));
}

/* ========== INIT ========== */
function init() {
  document.documentElement.lang = STATE.settings.lang === "jp" ? "ja" : "en";
  wireChrome();

  try {
    const params = new URLSearchParams(location.search);
    const tool = params.get("tool");
    if (tool) { STATE.view = "tools"; STATE._tool = tool; }
  } catch (_) {}

  if (STATE.onboarding?.step === 2 && STATE.onboarding?.wizardStep < 6 && !STATE.targetDNA) {
    if (STATE.view !== "tools" && STATE.view !== "tracker") {
      STATE.view = "onboarding";
    }
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  render();
}

document.addEventListener("DOMContentLoaded", init);
