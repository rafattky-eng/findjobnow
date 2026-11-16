// FindJob Now V7.2 — Japan-focused job discovery + company directory + multi-role + richer live matches

const JAPAN_BOARDS = [
  { id: "careercross", name: "CareerCross", url: "https://www.careercross.com/en/", q: "https://www.careercross.com/en/job-search?keywords=" },
  { id: "daijob", name: "Daijob", url: "https://www.daijob.com/en/", q: "https://www.daijob.com/jobs/search?job_search_form_with_keyword%5Bkeyword%5D=" },
  { id: "gaijinpot", name: "GaijinPot", url: "https://jobs.gaijinpot.com/en/", q: "https://jobs.gaijinpot.com/job/index/lang/en?job_key=" },
  { id: "tokyodev", name: "TokyoDev", url: "https://www.tokyodev.com/", q: "https://www.tokyodev.com/jobs?q=" },
  { id: "japandev", name: "Japan Dev", url: "https://japan-dev.com/", q: "https://japan-dev.com/jobs?query=" },
  { id: "linkedin", name: "LinkedIn Japan", url: "https://www.linkedin.com/jobs/", q: "https://www.linkedin.com/jobs/search/?location=Japan&keywords=" },
  { id: "indeed", name: "Indeed Japan", url: "https://jp.indeed.com/", q: "https://jp.indeed.com/jobs?q=" },
  { id: "robertwalters", name: "Robert Walters", url: "https://www.robertwalters.co.jp/en/", q: "https://www.robertwalters.co.jp/en/jobs.html?keywords=" },
  { id: "michaelpage", name: "Michael Page", url: "https://www.michaelpage.co.jp/en", q: "https://www.michaelpage.co.jp/jobs?keywords=" },
  { id: "jac", name: "JAC Recruitment", url: "https://www.jac-recruitment.jp/en/", q: "https://www.jac-recruitment.jp/en/job-search/?keyword=" },
  { id: "jetro", name: "JETRO HR Portal", url: "https://www.jetro.go.jp/en/hrportal/", linkOnly: true },
  { id: "wantedly", name: "Wantedly", url: "https://www.wantedly.com/", q: "https://www.wantedly.com/projects?q=" },
  { id: "skillhouse", name: "Skillhouse (agency)", url: "https://www.skillhouse.co.jp/en/", linkOnly: true }
];

async function jget(url, ms = 9000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error("http " + r.status);
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function locationAllowed(job) {
  const loc = (STATE.onboarding?.location || "").toLowerCase();
  if (!loc || loc === "any") return true;
  if (loc === "remote") return !!job.remote || /remote|リモート|work from home/i.test(job.location || "");
  const jl = (job.location || "").toLowerCase();
  if (loc === "tokyo") return /tokyo|東京|kanto|関東|yokohama|横浜|kawasaki|saitama|chiba/i.test(jl) || jl === "japan" || !jl || /remote/i.test(jl);
  if (loc === "osaka") return /osaka|大阪|kansai|関西/i.test(jl) || jl === "japan";
  if (loc === "nagoya") return /nagoya|名古屋|aichi|愛知/i.test(jl) || jl === "japan";
  if (loc === "fukuoka") return /fukuoka|福岡|kyushu|九州/i.test(jl) || jl === "japan";
  return true;
}

function getSearchRoles() {
  const titles = (STATE.targetJobs?.titles || []).filter(Boolean);
  if (titles.length) return titles;
  const single = (STATE.onboarding?.desiredRole || "").trim();
  if (single) return [single];
  return ["jobs in Japan"];
}

function enrichJob(raw, source) {
  const job = {
    id: raw.id || (source + "-" + Math.random().toString(36).slice(2, 9)),
    title: (typeof stripHtml === "function" ? stripHtml(raw.title || raw.name || "Role") : (raw.title || "Role")),
    company: raw.company || raw.company_name || raw.organization || "",
    url: raw.url || raw.job_url || raw.apply_url || "#",
    location: raw.location || raw.candidate_required_location || "Japan",
    description: (typeof stripHtml === "function" ? stripHtml(raw.description || raw.description_text || "") : (raw.description || "")).slice(0, 600),
    source,
    visa: /visa|sponsor|就労|スポンサー/i.test(`${raw.title} ${raw.description || ""}`),
    remote: /remote|リモート|work from home/i.test(`${raw.title} ${raw.location || ""} ${raw.description || ""}`),
    posted: raw.publication_date || raw.published || raw.date || ""
  };
  const scored = scoreJobMatch(job, STATE.profile, STATE.targetDNA, STATE.onboarding);
  job.matchScore = scored.score;
  job.targetScore = scored.targetScore;
  job.good = scored.good;
  job.miss = scored.miss;
  job.japanReady = scored.japanReady;
  return job;
}

const CAREER_PAGES = [
  { name: "JTB", url: "https://www.jtbcorp.jp/en/" },
  { name: "HIS", url: "https://www.his-j.com/" },
  { name: "Rakuten", url: "https://corp.rakuten.co.jp/careers/" },
  { name: "Mercari", url: "https://careers.mercari.com/" },
  { name: "Hilton Japan", url: "https://jobs.hilton.com/" },
  { name: "Salesforce Japan", url: "https://www.salesforce.com/jp/company/careers/" },
  { name: "Google Japan", url: "https://careers.google.com/locations/tokyo/" },
  { name: "Airbnb Japan", url: "https://careers.airbnb.com/" },
  { name: "Amazon Japan", url: "https://www.amazon.jobs/en/locations/tokyo-japan" },
  { name: "LINE / LY Corporation", url: "https://linecorp.com/en/career/position" },
  { name: "Japan Airlines (JAL)", url: "https://www.jal.com/en/employment/" },
  { name: "Booking.com Japan", url: "https://careers.booking.com/" },
  { name: "SoftBank", url: "https://www.softbank.jp/en/corp/careers/" },
  { name: "Unilever Japan", url: "https://www.unilever.co.jp/careers/" },
  { name: "SmartNews", url: "https://about.smartnews.com/en/careers/" },
  { name: "Marriott Japan", url: "https://careers.marriott.com/" },
  { name: "Accenture Japan", url: "https://www.accenture.com/jp-en/careers" },
  { name: "ANA", url: "https://www.ana.co.jp/group/en/company/recruit/" },
  { name: "Microsoft Japan", url: "https://careers.microsoft.com/" },
  { name: "Oracle Japan", url: "https://www.oracle.com/jp/careers/" },
  { name: "Hyatt Japan", url: "https://careers.hyatt.com/" },
  { name: "Panasonic", url: "https://www.panasonic.com/global/corporate/careers.html" },
  { name: "Deloitte Japan", url: "https://www2.deloitte.com/jp/en/careers.html" },
  { name: "Expedia Japan", url: "https://careers.expediagroup.com/" },
  { name: "IBM Japan", url: "https://www.ibm.com/careers/japan" },
  { name: "P&G Japan", url: "https://www.pgcareers.com/" },
  { name: "Cisco Japan", url: "https://www.cisco.com/c/en_jp/about/careers.html" }
];

function jobSay(msg, ok) { if (STATE.view === "jobs") say(msg, ok); }

function japanReadyBadge(level) {
  if (level === "ready") return `<span class="badge ready">🟢 ${t("japan_ready")}</span>`;
  if (level === "needs") return `<span class="badge needs">🟡 ${t("needs_n3")}</span>`;
  return `<span class="badge risk">🔴 ${t("visa_challenge")}</span>`;
}

function renderJobCard(job) {
  const score = job.matchScore || 0;
  return `
  <article class="job-card">
    <div class="job-title">${esc(job.title)}</div>
    <div class="job-company">${esc(job.company)} · ${esc(job.location || "")}</div>
    <div class="job-meta">
      <span class="badge ready">🟢 ${tx("Real listing", "実際の求人")}</span>
      <span class="badge source">${esc(job.source || "Web")}</span>
      ${job.posted ? `<span class="badge source">${esc(String(job.posted).slice(0, 10))}</span>` : ""}
      ${japanReadyBadge(job.japanReady)}
      ${job.visa ? `<span class="badge visa">Visa</span>` : ""}
      ${job.remote ? `<span class="badge source">Remote</span>` : ""}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:2px">
      <span class="muted">${t("match")}</span>
      <strong style="color:var(--ac)">${score}%</strong>
    </div>
    <div class="match-bar"><i style="width:${score}%"></i></div>
    ${renderJobFlags(job)}
    ${(job.good?.length || job.miss?.length) ? `
    <div style="font-size:12px;font-weight:700;margin-top:8px;color:var(--mu)">${t("why_match")}</div>
    <ul class="why-list">
      ${(job.good||[]).map(g => `<li class="good">✓ ${esc(g)}</li>`).join("")}
      ${(job.miss||[]).map(m => `<li class="miss">• ${esc(m)}</li>`).join("")}
    </ul>` : ""}
    <div class="btn-row cols-2" style="margin-top:10px">
      <a class="btn primary sm" href="${esc(safeUrl(job.url))}" target="_blank" rel="noopener">${t("apply")}</a>
      <button type="button" class="btn secondary sm" data-save-job="${esc(job.id)}">${t("save")}</button>
    </div>
    <div class="btn-row cols-2" style="margin-top:6px">
      <button type="button" class="btn ghost sm" data-job-applied="${esc(job.id)}">✅ ${tx("I applied", "応募した")}</button>
      <button type="button" class="btn ghost sm" data-job-note="${esc(job.id)}">✉️ ${tx("Write note", "応募文")}</button>
    </div>
  </article>`;
}

function renderCompanyCard(c) {
  const tracked = (STATE.targetCompanies || []).includes(c.id);
  return `
  <article class="job-card" style="padding:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div>
        <div class="job-title" style="font-size:15px">${esc(c.name)}</div>
        <div class="job-company">${esc(c.industry)}</div>
      </div>
      <button type="button" class="btn sm ${tracked ? "ghost" : "secondary"}" data-target-co="${esc(c.id)}" style="min-height:32px;font-size:11px;flex-shrink:0">
        ${tracked ? t("remove_target") : t("add_target")}
      </button>
    </div>
    <div class="job-meta" style="margin-top:6px">
      ${c.visa ? `<span class="badge visa">Visa</span>` : ""}
      ${c.tokyo ? `<span class="badge source">Tokyo</span>` : ""}
      <span class="badge ${c.type === "foreign-friendly" ? "ready" : "source"}">${c.type === "foreign-friendly" ? t("foreign_friendly") : t("japanese_companies")}</span>
    </div>
    <p class="sub" style="margin-top:6px;font-size:12px">${esc(c.note)}</p>
  </article>`;
}

function renderJobs() {
  const jobs = STATE.jobs || [];
  const roles = getSearchRoles();
  const q = encodeURIComponent(roles[0] || "jobs");
  const tab = STATE._jobsTab || "matches";
  const coTab = STATE._coTab || "foreign";

  const foreign = FOREIGNER_FRIENDLY_COMPANIES.filter(c => c.type === "foreign-friendly");
  const japanese = FOREIGNER_FRIENDLY_COMPANIES.filter(c => c.type === "japanese");
  const list = coTab === "japanese" ? japanese : foreign;

  return `
  <h2>${t("find_jobs")}</h2>
  <p class="sub">${tx("Live matches · Easy Apply · Agencies · SME & Startups · Boards · Directory", "ライブマッチ · 簡単応募 · エージェント · 中小企業 · ボード · 企業一覧")}</p>

  <div class="tabs-wrap" id="jobTabsWrap">
  <div class="tabs scroll" id="jobTabs" style="margin-bottom:0">
    <button type="button" class="tab ${tab === "matches" ? "on" : ""}" data-jtab="matches">${tx("Matches", "マッチ")}</button>
    <button type="button" class="tab ${tab === "easy" ? "on" : ""}" data-jtab="easy">${tx("🚀 Easy Apply", "🚀 簡単応募")}</button>
    <button type="button" class="tab ${tab === "agency" ? "on" : ""}" data-jtab="agency">${tx("🤝 Agencies", "🤝 エージェント")}</button>
    <button type="button" class="tab ${tab === "sme" ? "on" : ""}" data-jtab="sme">${tx("🏢 SME", "🏢 中小企業")}</button>
    <button type="button" class="tab ${tab === "plan" ? "on" : ""}" data-jtab="plan">${tx("🎯 Plan", "🎯 計画")}</button>
    <button type="button" class="tab ${tab === "prep" ? "on" : ""}" data-jtab="prep">${tx("🎤 Prep", "🎤 面接準備")}</button>
    <button type="button" class="tab ${tab === "boards" ? "on" : ""}" data-jtab="boards">${tx("Japan Boards", "日本ボード")}</button>
    <button type="button" class="tab ${tab === "companies" ? "on" : ""}" data-jtab="companies">${t("company_directory")}</button>
  </div>
  <div class="swipe-fade l" aria-hidden="true">‹</div>
  <div class="swipe-fade r" aria-hidden="true">›</div>
  <div class="swipe-hint" id="swipeHint" aria-hidden="true"><span class="finger">👉</span><span>${tx("Swipe for more", "スワイプで他も表示")}</span></div>
  </div>

  ${tab === "matches" ? renderMatchesTab()
  : tab === "easy" ? renderEasyTab()
  : tab === "agency" ? renderAgencyTab()
  : tab === "sme" ? renderSmeTab()
  : tab === "plan" ? renderPlanTab()
  : tab === "prep" ? renderPrepTab()
  : tab === "boards" ? renderBoardsTab()
  : `
  <div class="tabs" style="margin-bottom:10px">
    <button type="button" class="tab ${coTab === "foreign" ? "on" : ""}" data-cotab="foreign">${t("foreign_friendly")} (${foreign.length})</button>
    <button type="button" class="tab ${coTab === "japanese" ? "on" : ""}" data-cotab="japanese">${t("japanese_companies")} (${japanese.length})</button>
  </div>
  <p class="sub">${tx("Tap “Add to targets” to track on your dashboard. Top foreigner-friendly companies are auto-suggested after analysis.", "「ターゲットに追加」でダッシュボードに表示。分析後に外国人歓迎企業が自動提案されます。")}</p>
  ${list.map(renderCompanyCard).join("")}
  `}
  `;
}

function wireJobs() {
  $$("[data-jtab]").forEach(b => b.addEventListener("click", () => {
    STATE._jobsTab = b.dataset.jtab;
    render();
  }));
  $$("[data-cotab]").forEach(b => b.addEventListener("click", () => {
    STATE._coTab = b.dataset.cotab;
    render();
  }));
  wireSwipeTabs();
  if (typeof wireBoost === "function") wireBoost();
  if (typeof wireSources === "function") wireSources();
  $("btnSearchJobs")?.addEventListener("click", () => searchLiveJobs());
  if (typeof wireLive === "function") wireLive();
  $$("[data-save-job]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.saveJob;
      const job = (STATE.jobs || []).find(j => j.id === id);
      if (!job) return;
      const col = STATE.applications.saved;
      if (!col.some(x => x.id === id)) {
        col.unshift({
          ...job,
          savedAt: today(),
          status: "saved",
          notes: "",
          salary: "",
          followUp: "",
          interviewDate: ""
        });
        persist();
        say(tx("Saved to tracker", "トラッカーに保存"), 1);
      } else {
        say(tx("Already saved", "保存済み"), 1);
      }
    });
  });
  $$("[data-target-co]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.targetCo;
      if (!STATE.targetCompanies) STATE.targetCompanies = [];
      const idx = STATE.targetCompanies.indexOf(id);
      if (idx >= 0) STATE.targetCompanies.splice(idx, 1);
      else STATE.targetCompanies.push(id);
      persist();
      render();
    });
  });
}

function safeUrl(u) {
  try {
    const x = new URL(String(u || ""), location.href);
    if (x.protocol === "https:" || x.protocol === "http:") return x.href;
  } catch {}
  return "#";
}

function today() { return new Date().toISOString().slice(0, 10); }

/** Auto-add top foreigner-friendly companies into targets after wizard (non-destructive). */
function autoSuggestTargetCompanies() {
  if (!STATE.targetCompanies) STATE.targetCompanies = [];
  if (STATE.targetCompanies.length >= 5) return;
  const preferred = ["rakuten", "mercari", "google_jp", "amazon_jp", "salesforce_jp", "hilton_jp", "jtb", "his", "microsoft_jp", "line"];
  preferred.forEach(id => {
    if (STATE.targetCompanies.length >= 6) return;
    if (!STATE.targetCompanies.includes(id) && FOREIGNER_FRIENDLY_COMPANIES.some(c => c.id === id)) {
      STATE.targetCompanies.push(id);
    }
  });
}

/** Swipe indicator for horizontally scrollable tab bars. */
function wireSwipeTabs() {
  const bar = $("jobTabs"), wrap = $("jobTabsWrap");
  if (!bar || !wrap) return;
  const on = bar.querySelector(".tab.on");
  if (on) bar.scrollLeft = Math.max(0, on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2);
  const update = () => {
    const max = bar.scrollWidth - bar.clientWidth;
    wrap.classList.toggle("can-l", bar.scrollLeft > 8);
    wrap.classList.toggle("can-r", bar.scrollLeft < max - 8);
    if (max <= 8) wrap.classList.remove("can-l", "can-r");
  };
  update();
  const seen = L("fj_swipe_seen", 0);
  const hint = $("swipeHint");
  if (hint && (seen >= 3 || bar.scrollWidth - bar.clientWidth <= 8)) hint.remove();
  else if (hint) {
    W("fj_swipe_seen", seen + 1);
    setTimeout(() => hint.classList.add("hide"), 6000);
  }
  bar.addEventListener("scroll", () => { update(); if (hint) { hint.classList.add("hide"); W("fj_swipe_seen", 3); } }, { passive: true });
}
