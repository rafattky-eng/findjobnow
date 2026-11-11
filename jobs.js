// FindJob Now V7.1 — Japan-focused job discovery + company directory

const JAPAN_BOARDS = [
  { id: "careercross", name: "CareerCross", url: "https://www.careercross.com/", q: "https://www.careercross.com/en/job-search?keywords=" },
  { id: "daijob", name: "Daijob", url: "https://www.daijob.com/", q: "https://www.daijob.com/jobs/search?job_search_form_with_keyword%5Bkeyword%5D=" },
  { id: "gaijinpot", name: "GaijinPot", url: "https://jobs.gaijinpot.com/", q: "https://jobs.gaijinpot.com/job/index/lang/en?job_key=" },
  { id: "tokyodev", name: "TokyoDev", url: "https://www.tokyodev.com/", q: "https://www.tokyodev.com/jobs?q=" },
  { id: "japandev", name: "Japan Dev", url: "https://japan-dev.com/", q: "https://japan-dev.com/jobs?query=" },
  { id: "linkedin", name: "LinkedIn Japan", url: "https://www.linkedin.com/jobs/", q: "https://www.linkedin.com/jobs/search/?keywords=" }
];

async function jget(url, ms = 8000) {
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
  if (loc === "remote") return !!job.remote || /remote|リモート/i.test(job.location || "");
  const jl = (job.location || "").toLowerCase();
  if (loc === "tokyo") return /tokyo|東京|kanto|関東|yokohama|横浜|kawasaki|saitama|chiba/i.test(jl) || jl === "japan" || !jl;
  if (loc === "osaka") return /osaka|大阪|kansai|関西/i.test(jl) || jl === "japan";
  if (loc === "nagoya") return /nagoya|名古屋|aichi|愛知/i.test(jl) || jl === "japan";
  if (loc === "fukuoka") return /fukuoka|福岡|kyushu|九州/i.test(jl) || jl === "japan";
  return true;
}

function enrichJob(raw, source) {
  const job = {
    id: raw.id || (source + "-" + Math.random().toString(36).slice(2, 9)),
    title: raw.title || raw.name || "Role",
    company: raw.company || raw.company_name || raw.organization || "",
    url: raw.url || raw.job_url || raw.apply_url || "#",
    location: raw.location || raw.candidate_required_location || "Japan",
    description: (raw.description || raw.description_text || "").slice(0, 500),
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

async function searchLiveJobs() {
  const role = (STATE.onboarding?.desiredRole || STATE.targetDNA?.targetIdentity || "jobs in Japan").trim();
  const industry = STATE.onboarding?.desiredIndustry || "";
  const loc = STATE.onboarding?.location || "";
  const query = [role, industry, loc === "Tokyo" ? "Tokyo" : "Japan"].filter(Boolean).join(" ");
  say(tx("Searching jobs…", "求人を検索中…"), 1);

  const out = [];

  try {
    const data = await jget("https://remotive.com/api/remote-jobs?limit=30&search=" + encodeURIComponent(role));
    if (data && Array.isArray(data.jobs)) {
      data.jobs.slice(0, 15).forEach(j => {
        out.push(enrichJob({
          id: "rem-" + j.id,
          title: j.title,
          company: j.company_name,
          url: j.url,
          location: j.candidate_required_location || "Remote",
          description: j.description,
          publication_date: j.publication_date
        }, "Remotive"));
      });
    }
  } catch (_) {}

  try {
    const data = await jget("https://jobicy.com/api/v2/remote-jobs?count=20&tag=" + encodeURIComponent((industry || role).split(" ")[0]));
    if (data && Array.isArray(data.jobs)) {
      data.jobs.slice(0, 10).forEach(j => {
        out.push(enrichJob({
          id: "jcy-" + j.id,
          title: j.jobTitle,
          company: j.companyName,
          url: j.url,
          location: j.jobGeo || "Remote",
          description: j.jobDescription,
          publication_date: j.pubDate
        }, "Jobicy"));
      });
    }
  } catch (_) {}

  const seen = new Set();
  const unique = [];
  out.forEach(j => {
    const k = (j.title + "|" + j.company).toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    if (locationAllowed(j)) unique.push(j);
  });

  unique.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  STATE.jobs = unique.slice(0, 40);
  persist();

  if (!STATE.jobs.length) {
    say(tx("No live results — use Japan board links below", "ライブ結果なし — 下の日本ボードを利用"), 0);
  } else {
    say(tx(`Found ${STATE.jobs.length} jobs`, `${STATE.jobs.length}件の求人`), 1);
  }
  if (STATE.view === "jobs") render();
}

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
      <span class="badge source">${esc(job.source || "Web")}</span>
      ${japanReadyBadge(job.japanReady)}
      ${job.visa ? `<span class="badge visa">Visa</span>` : ""}
      ${job.remote ? `<span class="badge source">Remote</span>` : ""}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:2px">
      <span class="muted">${t("match")}</span>
      <strong style="color:var(--ac)">${score}%</strong>
    </div>
    <div class="match-bar"><i style="width:${score}%"></i></div>
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
  const role = STATE.onboarding?.desiredRole || "";
  const q = encodeURIComponent(role || "jobs");
  const tab = STATE._jobsTab || "matches";
  const coTab = STATE._coTab || "foreign";

  const foreign = FOREIGNER_FRIENDLY_COMPANIES.filter(c => c.type === "foreign-friendly");
  const japanese = FOREIGNER_FRIENDLY_COMPANIES.filter(c => c.type === "japanese");
  const list = coTab === "japanese" ? japanese : foreign;

  return `
  <h2>${t("find_jobs")}</h2>
  <p class="sub">${tx("Tokyo-first boards + live matches + company directory", "東京優先ボード + ライブマッチ + 企業ディレクトリ")}</p>

  <div class="tabs" style="margin-bottom:12px">
    <button type="button" class="tab ${tab === "matches" ? "on" : ""}" data-jtab="matches">${tx("Matches", "マッチ")}</button>
    <button type="button" class="tab ${tab === "companies" ? "on" : ""}" data-jtab="companies">${t("company_directory")}</button>
  </div>

  ${tab === "matches" ? `
  <div class="card">
    <div style="font-size:12px;font-weight:700;color:var(--mu);margin-bottom:8px">${tx("Japan job boards", "日本の求人ボード")}</div>
    <div class="chip-row">
      ${JAPAN_BOARDS.map(b => `
        <a class="chip" href="${b.q}${q}" target="_blank" rel="noopener" style="text-decoration:none">${b.name}</a>
      `).join("")}
    </div>
    ${STATE.onboarding?.location ? `<p class="sub" style="margin-top:8px">${t("location_pref")}: <strong>${esc(STATE.onboarding.location)}</strong></p>` : ""}
  </div>

  <div class="btn-row">
    <button type="button" class="btn primary" id="btnSearchJobs">${tx("Refresh matches", "マッチを更新")}</button>
  </div>

  ${jobs.length ? jobs.map(renderJobCard).join("") : `
    <div class="card" style="text-align:center;padding:24px">
      <p class="muted">${t("no_jobs")}</p>
    </div>
  `}
  ` : `
  <div class="tabs" style="margin-bottom:10px">
    <button type="button" class="tab ${coTab === "foreign" ? "on" : ""}" data-cotab="foreign">${t("foreign_friendly")} (${foreign.length})</button>
    <button type="button" class="tab ${coTab === "japanese" ? "on" : ""}" data-cotab="japanese">${t("japanese_companies")} (${japanese.length})</button>
  </div>
  <p class="sub">${tx("Tap “Add to targets” to track on your dashboard.", "「ターゲットに追加」でダッシュボードに表示。")}</p>
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
  $("btnSearchJobs")?.addEventListener("click", () => searchLiveJobs());
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
