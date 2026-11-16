// FindJob Now V7.5 — Real live listings (Jobicy + Remotive, filtered per role), per-role search shortcuts,
// role picker, link-only sections. No fake/seed jobs.

const GENERIC_WORDS = ["manager", "specialist", "senior", "junior", "lead", "coordinator", "officer", "assistant", "executive", "staff", "associate", "head", "director", "engineer", "developer", "analyst", "consultant", "representative", "japan", "tokyo", "and", "the", "for"];
const TECH_RE = /engineer|developer|software|devops|data|backend|frontend|full.?stack|qa|\bit\b|product|designer|ux|cloud|ai\b|ml\b|security/i;

/* ---------- text helpers ---------- */
function stripHtml(s) {
  let x = String(s || "");
  const dec = v => v.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  x = dec(x); x = x.replace(/<[^>]*>/g, " "); x = dec(x); x = x.replace(/<[^>]*>/g, " ");
  return x.replace(/\s+/g, " ").trim();
}
function roleTokens(role) {
  const all = String(role || "").toLowerCase().split(/[^a-z0-9+#]+/).filter(w => w.length >= 3);
  const core = all.filter(w => !GENERIC_WORDS.includes(w));
  return core.length ? core : all;
}
function jobRelevantTo(job, role) {
  const tk = roleTokens(role);
  if (!tk.length) return true;
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  if (tk.some(w => title.includes(w))) return true;
  return tk.length >= 2 && tk.every(w => desc.includes(w));
}

/* ---------- active role ---------- */
function getActiveRole() {
  const roles = getSearchRoles();
  return STATE._jobRole && roles.includes(STATE._jobRole) ? STATE._jobRole : roles[0];
}

/* ---------- cache (protects free APIs) ---------- */
function lcGet(k, ttl) { try { const c = JSON.parse(localStorage.getItem("fj_lc_" + k)); if (c && Date.now() - c.t < ttl) return c.v; } catch (_) {} return null; }
function lcSet(k, v) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("fj_lc_")) { try { if (Date.now() - JSON.parse(localStorage.getItem(key)).t > 86400000) localStorage.removeItem(key); } catch (_) { localStorage.removeItem(key); } }
    }
    localStorage.setItem("fj_lc_" + k, JSON.stringify({ t: Date.now(), v }));
  } catch (_) {}
}
async function fetchCached(url, ttl, mapper) {
  const hit = lcGet(url, ttl);
  if (hit) return { list: hit, ok: true };
  const data = await jget(url, 12000);
  if (!data) return { list: [], ok: false };
  const list = mapper(data);
  lcSet(url, list);
  return { list, ok: true };
}

/* ---------- sources ---------- */
const JP_SCOPE = /japan|日本|asia|apac|worldwide|anywhere|global|international|^$/i;
const mapJobicy = d => (d.jobs || []).map(j => ({ id: "jcy-" + j.id, title: j.jobTitle, company: j.companyName, url: j.url, location: j.jobGeo || "Remote", description: String(j.jobDescription || j.jobExcerpt || "").slice(0, 1500), publication_date: String(j.pubDate || "").slice(0, 10) }));
const mapRemotive = d => (d.jobs || []).map(j => ({ id: "rem-" + j.id, title: j.title, company: j.company_name, url: j.url, location: j.candidate_required_location || "Worldwide", description: String(j.description || "").slice(0, 1500), publication_date: String(j.publication_date || "").slice(0, 10) }));

async function searchLiveJobs() {
  if (STATE._liveBusy) return;
  STATE._liveBusy = true;
  if (STATE.view === "jobs") render();
  const roles = getSearchRoles().filter(r => r !== "jobs in Japan");
  const prevIds = new Set((STATE.jobs || []).map(j => j.id));
  const failed = [], raw = [];
  const stat = { Jobicy: 0, Remotive: 0 };
  try {
    // Jobicy: all Japan-eligible + APAC remote jobs (2 calls total), filtered per role locally
    for (const geo of ["japan", "apac"]) {
      const r = await fetchCached(`https://jobicy.com/api/v2/remote-jobs?count=100&geo=${geo}`, 15 * 60000, mapJobicy);
      if (!r.ok) failed.push("Jobicy (" + geo + ")");
      r.list.forEach(x => raw.push({ x, src: "Jobicy" }));
    }
    // Remotive: one search per role (max 3), Japan/Asia/Worldwide only
    for (const role of roles.slice(0, 3)) {
      const q = roleTokens(role).slice(0, 2).join(" ") || role;
      const r = await fetchCached(`https://remotive.com/api/remote-jobs?limit=40&search=${encodeURIComponent(q)}`, 3 * 3600000, mapRemotive);
      if (!r.ok) failed.push("Remotive (" + role + ")");
      r.list.filter(x => JP_SCOPE.test(x.location || "")).forEach(x => raw.push({ x, src: "Remotive" }));
    }
  } catch (_) {}

  const targetRoles = roles.length ? roles : [""];
  const byKey = new Map();
  raw.forEach(({ x, src }) => {
    const matched = targetRoles.filter(r => !r || jobRelevantTo({ title: stripHtml(x.title), description: stripHtml(x.description) }, r));
    if (!matched.length) return;
    const key = (String(x.title) + "|" + String(x.company)).toLowerCase().replace(/\s+/g, " ");
    if (byKey.has(key)) { matched.forEach(m => { const e = byKey.get(key); if (!e.roles.includes(m)) e.roles.push(m); }); return; }
    const job = enrichJob(x, src);
    job.roles = matched.filter(Boolean);
    byKey.set(key, job);
  });
  let list = [...byKey.values()].filter(locationAllowed);
  list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0) || String(b.posted).localeCompare(String(a.posted)));
  list = list.slice(0, 60);
  list.forEach(j => { stat[j.source] = (stat[j.source] || 0) + 1; });
  const fresh = list.filter(j => !prevIds.has(j.id)).length;
  STATE.jobs = list;
  STATE._liveInfo = { at: Date.now(), total: list.length, fresh, stat, failed, hadPrev: prevIds.size > 0 };
  STATE._liveBusy = false;
  persist();
  if (list.length) jobSay(tx(`${list.length} real listings · ${fresh} new`, `実際の求人${list.length}件・新着${fresh}件`), 1);
  else jobSay(tx("No live listings for your roles — use the search buttons", "該当なし — 検索ボタンを利用"), 0);
  if (STATE.view === "jobs") render();
}

/* ---------- per-role search shortcuts (real result pages) ---------- */
const SEARCH_SITES = [
  { n: "⚡ LinkedIn Easy Apply", q: "https://www.linkedin.com/jobs/search/?location=Japan&f_AL=true&keywords=", main: true },
  { n: "Indeed Japan", q: "https://jp.indeed.com/jobs?q=", main: true },
  { n: "GaijinPot", q: "https://jobs.gaijinpot.com/job/index/lang/en?job_key=", main: true },
  { n: "CareerCross", q: "https://www.careercross.com/en/job-search?keywords=", main: true },
  { n: "Daijob", q: "https://www.daijob.com/jobs/search?job_search_form_with_keyword%5Bkeyword%5D=" },
  { n: "Wantedly (SME)", q: "https://www.wantedly.com/projects?q=" },
  { n: "LinkedIn (all)", q: "https://www.linkedin.com/jobs/search/?location=Japan&keywords=" },
  { n: "Japan Dev", q: "https://japan-dev.com/jobs?query=", tech: true },
  { n: "TokyoDev", q: "https://www.tokyodev.com/jobs?q=", tech: true }
];
function searchButtons(role, full) {
  const enc = encodeURIComponent(role);
  return SEARCH_SITES.filter(s => (full ? (!s.tech || TECH_RE.test(role)) : s.main))
    .map(s => `<a class="chip ${s.main && s.n.startsWith("⚡") ? "on" : ""}" href="${esc(safeUrl(s.q + enc))}" target="_blank" rel="noopener" style="text-decoration:none">${esc(s.n)}</a>`).join("");
}

/* ---------- role picker ---------- */
function renderRolePicker(withAll) {
  const roles = getSearchRoles();
  if (roles.length < 2 && !withAll) return `<p class="sub" style="margin:0 0 8px">${tx("Searching for", "検索職種")}: <strong>${esc(roles[0])}</strong></p>`;
  const cur = withAll && STATE._jobRole === "__all" ? "__all" : getActiveRole();
  return `<div class="chip-row" style="margin-bottom:10px">
    ${withAll && roles.length > 1 ? `<button type="button" class="chip ${cur === "__all" ? "on" : ""}" data-pickrole="__all">${tx("All roles", "すべて")}</button>` : ""}
    ${roles.map(r => `<button type="button" class="chip ${cur === r ? "on" : ""}" data-pickrole="${esc(r)}">${esc(r)}</button>`).join("")}
  </div>`;
}

/* ---------- Matches tab ---------- */
function liveInfoLine() {
  const i = STATE._liveInfo;
  if (STATE._liveBusy) return `<p class="sub">⏳ ${tx("Searching real listings…", "実際の求人を検索中…")}</p>`;
  if (!i) return `<p class="sub">${tx("Tap refresh to load real listings.", "更新をタップして求人を読み込み。")}</p>`;
  const time = new Date(i.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const src = Object.entries(i.stat).filter(e => e[1]).map(e => `${e[0]} ${e[1]}`).join(" · ");
  return `<p class="sub">${tx("Updated", "更新")} ${time} · <strong>${i.total}</strong> ${tx("listings", "件")}${i.hadPrev ? ` · <strong>${i.fresh}</strong> ${tx("new", "新着")}` : ""}${src ? ` · ${esc(src)}` : ""}</p>
  ${i.failed.length ? `<p class="sub" style="color:var(--er)">⚠ ${tx("Source unavailable", "取得できず")}: ${esc(i.failed.join(", "))}</p>` : ""}`;
}

function renderMatchesTab() {
  const roles = getSearchRoles();
  const all = (STATE.jobs || []).filter(j => j.source !== "Seed");
  const sel = STATE._jobRole;
  const showAll = sel === "__all" || roles.length < 2;
  const active = getActiveRole();
  const byRole = showAll ? all : all.filter(j => (j.roles || []).includes(active));
  const list = filteredJobs(byRole);

  const shortcuts = (STATE._jobRole === "__all" && roles.length > 1)
    ? roles.map(r => `<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;margin-bottom:4px">${esc(r)}</div><div class="chip-row">${searchButtons(r, false)}</div></div>`).join("")
    : `<div class="chip-row">${searchButtons(active, true)}</div>`;

  return `
  <div class="card" style="margin-bottom:12px">
    <div style="font-size:12px;font-weight:700;color:var(--mu);margin-bottom:6px">${tx("Your target roles", "希望職種")}</div>
    ${renderRolePicker(true)}
    ${STATE.onboarding?.location ? `<p class="sub">${t("location_pref")}: <strong>${esc(STATE.onboarding.location)}</strong></p>` : ""}
  </div>

  <div class="card accent" style="margin-bottom:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:2px">🔎 ${tx("Open real job listings now", "今すぐ実際の求人を見る")}</div>
    <p class="sub" style="margin-bottom:8px">${tx("These open live search results for your role. ⚡ = Easy Apply (resume upload, one-tap).", "あなたの職種の検索結果を開きます。⚡＝簡単応募。")}</p>
    ${shortcuts}
  </div>

  <div class="btn-row">
    <button type="button" class="btn primary" id="btnSearchJobs" ${STATE._liveBusy ? "disabled" : ""}>${STATE._liveBusy ? tx("Searching…", "検索中…") : tx("Refresh live matches", "ライブマッチを更新")}</button>
  </div>
  ${liveInfoLine()}
  ${renderJobFilters()}
  ${list.length ? `
    <p class="sub" style="margin:10px 0 6px">${tx("Real remote/Japan-eligible listings", "実際のリモート/日本対象求人")} · ${list.length}${list.length !== byRole.length ? "/" + byRole.length : ""}</p>
    ${list.map(renderJobCard).join("")}`
  : `<div class="card" style="text-align:center;padding:20px">
      <p class="muted">${byRole.length ? tx("No jobs match these filters — turn one off.", "条件に合う求人がありません。") : tx("No remote/Japan-eligible listings found for this role right now.", "この職種のリモート/日本対象の求人は現在見つかりません。")}</p>
      <p class="sub" style="margin-top:8px">${tx("On-site Japan jobs are on the sites above — use the buttons (⚡ Easy Apply first).", "現地勤務の求人は上のサイトにあります。⚡簡単応募から。")}</p>
    </div>`}
  <p class="sub" style="margin-top:10px">${tx("Live data: Jobicy and Remotive (remote jobs open to Japan/Asia/worldwide). Click Apply to open the original posting.", "データ: Jobicy・Remotive（日本/アジア/全世界向けリモート求人）。応募は元の求人ページで。")}</p>`;
}

/* ---------- Boards tab ---------- */
function renderBoardsTab() {
  const role = encodeURIComponent(getActiveRole());
  const search = JAPAN_BOARDS.filter(b => b.q && !b.linkOnly), links = JAPAN_BOARDS.filter(b => b.linkOnly);
  return `
  <div class="card">
    <div style="font-size:13px;font-weight:700;margin-bottom:4px">${tx("Japan job boards — search your role", "日本の求人ボード — 職種で検索")}</div>
    ${renderRolePicker(false)}
    <div class="chip-row" style="flex-wrap:wrap;gap:8px">
      ${search.map(b => `<a class="chip" href="${esc(safeUrl(b.q + role))}" target="_blank" rel="noopener" style="text-decoration:none;min-width:120px;justify-content:center">${esc(b.name)}</a>`).join("")}
    </div>
  </div>
  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:4px">🔗 ${tx("Website links only (no direct job search)", "ウェブサイトリンクのみ（直接検索なし）")}</div>
    <div class="chip-row" style="flex-wrap:wrap;gap:8px">
      ${links.map(b => `<a class="chip" href="${esc(safeUrl(b.url))}" target="_blank" rel="noopener" style="text-decoration:none">${esc(b.name)}</a>`).join("")}
    </div>
  </div>
  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:2px">🏢 ${tx("Company career pages (website links only)", "企業採用ページ（リンクのみ）")}</div>
    <p class="sub" style="margin-bottom:8px">${tx("Open the company’s own careers site, then search for roles there.", "企業の採用サイトを開いて職種を検索。")}</p>
    <div class="chip-row" style="flex-wrap:wrap;gap:8px">
      ${CAREER_PAGES.map(c => `<a class="chip" href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener" style="text-decoration:none">${esc(c.name)}</a>`).join("")}
    </div>
  </div>`;
}

/* ---------- wiring ---------- */
function wireLive() {
  $$("[data-pickrole]").forEach(b => b.addEventListener("click", () => { STATE._jobRole = b.dataset.pickrole; render(); }));
}
