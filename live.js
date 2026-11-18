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
const ROLE_SYNONYMS = {
  "business development manager": ["partnerships manager","international business development","strategic partnerships","commercial manager","market development manager"],
  "travel operations manager": ["travel manager","tour operations","travel product manager","destination manager","operations manager tourism"],
  "tourism manager": ["inbound tourism","destination management","travel trade","tourism business development"],
  "inbound tourism manager": ["inbound tourism","destination management","travel trade","tourism business development"],
  "account manager": ["key account manager","client success","partner manager","customer success manager"],
  "customer success manager": ["client success","account manager","partner success","customer experience manager"],
  "software engineer": ["systems analyst","software developer","business systems","application engineer"],
  "international sales manager": ["global sales","international business development","export sales","sales partnerships"]
};
function normalizeWords(v) {
  return String(v || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9+#]+/g, " ").trim().replace(/\s+/g, " ");
}
function roleTerms(role) {
  const key = normalizeWords(role);
  const synonyms = ROLE_SYNONYMS[key] || [];
  const core = key.split(" ").filter(w => w.length >= 3 && !GENERIC_WORDS.includes(w));
  return [...new Set([key, ...synonyms, ...core].filter(Boolean))];
}
function roleTokens(role) {
  return normalizeWords(role).split(" ").filter(w => w.length >= 3 && !GENERIC_WORDS.includes(w));
}
function jobRelevantTo(job, role) {
  const title = normalizeWords(job.title);
  const desc = normalizeWords(job.description);
  const terms = roleTerms(role);
  if (terms.some(term => title.includes(normalizeWords(term)))) return true;
  const tokens = roleTokens(role);
  if (!tokens.length) return false;
  const titleHits = tokens.filter(w => title.includes(w)).length;
  const descHits = tokens.filter(w => desc.includes(w)).length;
  return titleHits >= 1 || (tokens.length >= 2 && descHits >= Math.max(2, Math.ceil(tokens.length * 0.6)));
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
  if (hit) return { list: hit, ok: true, cached: true, error: "" };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const response = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (data && data.success === false) throw new Error(data.error || "Provider returned an error");
      const list = mapper(data);
      lcSet(url, list);
      return { list, ok: true, cached: false, error: "" };
    } finally { clearTimeout(timer); }
  } catch (err) {
    return { list: [], ok: false, cached: false, error: err?.name === "AbortError" ? "Timed out" : (err?.message || "Network/CORS error") };
  }
}

/* ---------- permitted public feeds ---------- */
const JP_SCOPE = /japan|日本|asia|apac|worldwide|anywhere|global|international|^$/i;
const mapJobicy = d => (d.jobs || []).map(j => ({
  id: "jcy-" + j.id, title: j.jobTitle, company: j.companyName, url: j.url,
  location: j.jobGeo || "Not specified", description: String(j.jobDescription || j.jobExcerpt || "").slice(0, 2200),
  publication_date: String(j.pubDate || "").slice(0, 10), source: "Jobicy"
}));
const mapRemotive = d => (d.jobs || []).map(j => ({
  id: "rem-" + j.id, title: j.title, company: j.company_name, url: j.url,
  location: j.candidate_required_location || "Not specified", description: String(j.description || "").slice(0, 2200),
  publication_date: String(j.publication_date || "").slice(0, 10), source: "Remotive"
}));
const mapGreenhouse = (d, board) => (d.jobs || []).map(j => {
  const loc = (j.location && j.location.name) || "Not specified";
  return {
    id: "gh-" + board + "-" + j.id,
    title: j.title,
    company: greenhouseCompanyName(board),
    url: j.absolute_url || ("https://boards.greenhouse.io/" + board + "/jobs/" + j.id),
    location: loc,
    description: String((j.metadata || []).map(m => m.value).join(" ") || "").slice(0, 500),
    publication_date: String(j.updated_at || j.created_at || "").slice(0, 10),
    source: "Greenhouse · " + board
  };
});
const GREENHOUSE_BOARDS = ["airbnb", "stripe", "figma", "dropbox", "gitlab", "intercom", "asana", "remotecom", "tripadvisor"];
const JOBICY_TTL = 6 * 60 * 60 * 1000; // refresh far less often than once/hour
const REMOTIVE_TTL = 6 * 60 * 60 * 1000; // Remotive advises no more than 4 requests/day

const JP_PLACE_RE = /japan|日本|tokyo|東京|osaka|大阪|kyoto|京都|nagoya|名古屋|fukuoka|福岡|yokohama|横浜|kawasaki|川崎|sapporo|札幌|kobe|神戸|hiroshima|広島|sendai|仙台|chiba|千葉|saitama|埼玉|okinawa|沖縄|aichi|愛知|kanagawa|神奈川|hyogo|兵庫|shizuoka|静岡|hokkaido|北海道|ibaraki|茨城|tochigi|栃木|gunma|群馬|niigata|新潟|nagano|長野|gifu|岐阜|mie|三重|shiga|滋賀|nara|奈良|wakayama|和歌山|okayama|岡山|yamaguchi|山口|kumamoto|熊本|kagoshima|鹿児島|nagasaki|長崎|oita|大分|miyazaki|宮崎|aomori|青森|iwate|岩手|akita|秋田|yamagata|山形|fukushima|福島|toyama|富山|ishikawa|石川|fukui|福井|tottori|鳥取|shimane|島根|tokushima|徳島|kagawa|香川|ehime|愛媛|kochi|高知|saga|佐賀/i;
function isJapanEligibleListing(job) {
  const location = String(job?.location || "");
  const detail = `${job?.title || ""} ${job?.description || ""}`;
  if (JP_PLACE_RE.test(location)) return true;
  // A remote / worldwide label alone is NOT proof that Japan applicants are eligible.
  return /(remote|リモート|work from anywhere|worldwide|anywhere)/i.test(location) && JP_PLACE_RE.test(detail);
}
function greenhouseCompanyName(slug) {
  const names = {
    airbnb: "Airbnb", stripe: "Stripe", figma: "Figma", dropbox: "Dropbox",
    gitlab: "GitLab", intercom: "Intercom", asana: "Asana",
    remotecom: "Remote", tripadvisor: "Tripadvisor"
  };
  return names[slug] || slug;
}
async function searchLiveJobs() {
  if (STATE._liveBusy) return;
  STATE._liveBusy = true;
  STATE._liveProgress = { done: 0, total: 0 };
  if (STATE.view === "jobs") render();

  const previous = new Set((STATE.jobs || []).map(j => j.id));
  const raw = [];
  const failures = [];
  const sourceResults = [];
  let requests = [];

  try {
    const roles = getSearchRoles().filter(r => r && r !== "jobs in Japan");
    const GH_TTL = 6 * 60 * 60 * 1000;
    requests = [
      { name: "Jobicy · APAC", url: "https://jobicy.com/api/jobs?count=100&geo=apac", ttl: JOBICY_TTL, mapper: mapJobicy, filter: isJapanEligibleListing },
      { name: "Jobicy · Anywhere", url: "https://jobicy.com/api/jobs?count=100&geo=anywhere", ttl: JOBICY_TTL, mapper: mapJobicy, filter: isJapanEligibleListing },
      { name: "Remotive", url: "https://remotive.com/api/remote-jobs?limit=100", ttl: REMOTIVE_TTL, mapper: mapRemotive, filter: isJapanEligibleListing }
    ];

    // Public Greenhouse boards. Only listings with a clear Japan location qualify.
    GREENHOUSE_BOARDS.forEach(board => {
      requests.push({
        name: "Greenhouse · " + greenhouseCompanyName(board),
        url: "https://boards-api.greenhouse.io/v1/boards/" + board + "/jobs",
        ttl: GH_TTL,
        mapper: d => mapGreenhouse(d, board),
        filter: isJapanEligibleListing
      });
    });

    STATE._liveProgress.total = requests.length;
    if (STATE.view === "jobs") render();

    // Each source has its own timeout; one unavailable feed must never block the others.
    const settled = await Promise.all(requests.map(async source => {
      try {
        const r = await fetchCached(source.url, source.ttl, source.mapper);
        const accepted = (r.list || []).filter(source.filter);
        sourceResults.push({
          name: source.name, ok: !!r.ok, cached: !!r.cached,
          count: accepted.length, error: r.error || ""
        });
        if (!r.ok) failures.push(source.name + ": " + (r.error || "Unavailable"));
        accepted.forEach(x => raw.push({ x, src: x.source || source.name }));
        return r;
      } catch (err) {
        sourceResults.push({ name: source.name, ok: false, cached: false, count: 0, error: err?.message || "Source error" });
        failures.push(source.name + ": " + (err?.message || "Source error"));
        return { list: [], ok: false };
      } finally {
        STATE._liveProgress.done += 1;
        if (STATE.view === "jobs") {
          if (STATE._liveProgress.done === STATE._liveProgress.total || STATE._liveProgress.done % 3 === 0) render();
          const label = tx(
            `Checking job sources… ${STATE._liveProgress.done}/${STATE._liveProgress.total}`,
            `求人ソースを確認中… ${STATE._liveProgress.done}/${STATE._liveProgress.total}`
          );
          jobSay(label, 1);
        }
      }
    }));

    const targetRoles = roles.length ? roles : [""];
    const byKey = new Map();
    raw.forEach(({ x, src }) => {
      const clean = { title: stripHtml(x.title), description: stripHtml(x.description) };
      const matched = targetRoles.filter(role => !role || jobRelevantTo(clean, role));
      if (!matched.length) return;
      const canonical = String(x.url || "").split("?")[0].replace(/\/$/, "");
      const key = String(x.id || (clean.title + "|" + x.company + "|" + x.location + "|" + canonical)).toLowerCase();
      if (byKey.has(key)) {
        const existing = byKey.get(key);
        matched.forEach(m => { if (m && !existing.roles.includes(m)) existing.roles.push(m); });
        return;
      }
      if (!x.title || !x.company || !/^https?:\/\//i.test(String(x.url || ""))) return;
      const job = enrichJob(x, src);
      job.roles = matched.filter(Boolean);
      job.url = x.url;
      job.location = x.location || "Not specified";
      job.language = /[\u3000-\u30ff\u3400-\u9fff]/.test((x.title || "") + " " + (x.description || "")) ? "Japanese" : "English / Unknown";
      job.applicationMethod = "Application method not verified";
      byKey.set(key, job);
    });

    // Strict Japan eligibility is checked again after normalization.
    let list = [...byKey.values()].filter(j => isJapanEligibleListing(j) && locationAllowed(j));
    list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0) || String(b.posted).localeCompare(String(a.posted)));
    list = list.slice(0, 80);

    const stat = {};
    list.forEach(j => { stat[j.source] = (stat[j.source] || 0) + 1; });
    const fresh = list.filter(j => !previous.has(j.id)).length;
    const successCount = sourceResults.filter(x => x.ok).length;
    STATE.jobs = list;
    STATE._liveInfo = {
      at: Date.now(), total: list.length, fresh, stat,
      failures, hadPrev: previous.size > 0,
      sources: sourceResults, sourceCount: requests.length, successCount,
      cached: sourceResults.some(x => x.cached), searchLinks: SEARCH_SITES.length
    };
    persist();

    if (list.length) {
      jobSay(tx(`${list.length} Japan-eligible vacancies matched · ${fresh} new`, `日本で応募可能な求人 ${list.length}件 · 新着 ${fresh}件`), 1);
    } else if (!successCount) {
      jobSay(tx("Job feeds could not be reached. Check the source errors below and try again.", "求人フィードに接続できませんでした。下のエラーを確認して再試行してください。"), 0);
    } else {
      jobSay(tx("Search completed: no Japan-eligible vacancies matched these roles in the connected feeds. This does not mean Japan has no vacancies.", "検索完了：接続済みフィードでは条件に合う日本の求人がありませんでした。日本に求人がないという意味ではありません。"), 0);
    }
  } catch (err) {
    STATE._liveInfo = {
      at: Date.now(), total: 0, fresh: 0, stat: {},
      failures: [...failures, "Search error: " + (err?.message || "Unexpected error")],
      sources: sourceResults, sourceCount: requests.length,
      successCount: sourceResults.filter(x => x.ok).length, cached: false,
      searchLinks: SEARCH_SITES.length
    };
    jobSay(tx("Search stopped safely. Please try again; the error is shown in Feed status.", "検索を安全に停止しました。再試行してください。エラーはフィード状況に表示されます。"), 0);
  } finally {
    STATE._liveBusy = false;
    STATE._liveProgress = null;
    try { persist(); } catch (_) {}
    if (STATE.view === "jobs") render();
  }
}
/* ---------- per-role search shortcuts (real result pages) ---------- */
const SEARCH_SITES = [
  { n: "LinkedIn Easy Apply (filter)", q: "https://www.linkedin.com/jobs/search/?location=Japan&f_AL=true&keywords=", main: true },
  { n: "Indeed Japan", q: "https://jp.indeed.com/jobs?q=", main: true },
  { n: "CareerCross", q: "https://www.careercross.com/en/job-search?keywords=", main: true },
  { n: "Daijob", q: "https://www.daijob.com/jobs/search?job_search_form_with_keyword%5Bkeyword%5D=", main: true },
  { n: "GaijinPot Jobs", q: "https://jobs.gaijinpot.com/job/index/lang/en?job_key=", main: true },
  { n: "Jobs in Japan", q: "https://jobsinjapan.com/jobs/?s=", main: true },
  { n: "WeXpats Jobs", q: "https://we-xpats.com/en/job/as/jp/?occupation=", main: true },
  { n: "Wantedly", q: "https://www.wantedly.com/projects?q=", main: true },
  { n: "Green Japan", q: "https://www.green-japan.com/search_key/1?key=", main: true },
  { n: "BizReach", q: "https://www.bizreach.jp/job/?keyword=", main: true },
  { n: "doda", q: "https://doda.jp/DodaFront/View/JobSearchList.action?kw=", main: true },
  { n: "Hello Work", q: "https://www.hellowork.mhlw.go.jp/", main: true, siteOnly: true },
  { n: "JAC Recruitment", q: "https://www.jac-recruitment.jp/en/job-search/?keyword=" },
  { n: "Robert Walters", q: "https://www.robertwalters.co.jp/en/jobs.html?keywords=" },
  { n: "Michael Page", q: "https://www.michaelpage.co.jp/jobs?keywords=" },
  { n: "Hays Japan", q: "https://www.hays.co.jp/" , siteOnly: true },
  { n: "en world Japan", q: "https://www.enworld.com/" , siteOnly: true },
  { n: "RGF Professional", q: "https://www.rgf-professional.jp/" , siteOnly: true },
  { n: "Japan Dev (tech)", q: "https://japan-dev.com/jobs?query=", tech: true },
  { n: "TokyoDev (tech)", q: "https://www.tokyodev.com/jobs?q=", tech: true }
];
function searchButtons(role, full) {
  const enc = encodeURIComponent(role);
  return SEARCH_SITES.filter(s => (full ? (!s.tech || TECH_RE.test(role)) : s.main))
    .map(s => `<a class="chip" href="${esc(safeUrl(s.siteOnly ? s.q : s.q + enc))}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">${esc(s.n)}</a>`).join("");
}

/* ---------- role picker ---------- */
function renderRolePicker(withAll) {
  const roles = getSearchRoles();
  if (roles.length < 2 && !withAll) return `<p class="sub" style="margin:0 0 8px">${tx("Searching for", "検索職種")}: <strong>${esc(roles[0])}</strong></p>`;
  const cur = withAll && STATE._jobRole === "__all" ? "__all" : getActiveRole();
  return `<div class="chip-row" style="margin-bottom:10px">
    ${withAll ? `<button type="button" class="chip ${cur === "__all" ? "on" : ""}" data-pickrole="__all">${tx("All selected roles", "選択したすべての職種")}</button>` : ""}
    ${roles.map(r => `<button type="button" class="chip ${cur === r ? "on" : ""}" data-pickrole="${esc(r)}">${esc(r)}</button>`).join("")}
  </div>`;
}

/* ---------- Matches tab ---------- */
function liveInfoLine() {
  const i = STATE._liveInfo;
  if (STATE._liveBusy) {
    const p = STATE._liveProgress || { done: 0, total: 0 };
    return `<p class="sub">⏳ ${tx(`Checking job sources… ${p.done}/${p.total}`, `求人ソースを確認中… ${p.done}/${p.total}`)}</p>`;
  }
  if (!i) return `<p class="sub">${tx("Tap Refresh to search public feeds for Japan-eligible vacancies. Japan job-board search links are separate.", "更新を押してリモート求人を確認。日本の求人サイト検索は下にあります。")}</p>`;
  const time = new Date(i.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const status = (i.sources || []).map(x => `<div class="sub" style="margin:3px 0">${x.ok ? "✓" : "⚠"} ${esc(x.name)} · ${x.ok ? (x.cached ? tx("Cached", "キャッシュ") : tx("Responded", "応答")) + " · " + x.count : esc(x.error)}</div>`).join("");
  return `<div class="card" style="padding:12px;margin:8px 0">
    <strong>${tx("Feed status", "フィード状況")}</strong>
    <p class="sub" style="margin:4px 0">${tx("Sources responded", "応答したソース")}: <strong>${i.successCount || 0}/${i.sourceCount || 0}</strong> · ${tx("Verified feed matches", "確認できた求人")}: <strong>${i.total}</strong></p>
    <p class="sub" style="margin:2px 0">${tx("Updated", "更新")}: ${time}${i.cached ? " · " + tx("Some results cached", "一部キャッシュ") : ""}</p>
    ${status}
    <p class="sub" style="margin:5px 0 0">${tx("Board search links are separate from verified vacancy results.", "求人サイトの検索リンクは、確認済み求人とは別です。")}</p>
  </div>`;
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
    <p class="sub" style="margin-bottom:8px">${tx("These open each provider’s search page. Application methods differ by vacancy; check the employer page.", "あなたの職種の各サイトの検索結果を開きます。応募方法は求人ごとに確認してください。")}</p>
    ${shortcuts}
  </div>

  <div class="btn-row">
    <button type="button" class="btn primary" id="btnSearchJobs" ${STATE._liveBusy ? "disabled" : ""}>${STATE._liveBusy ? tx("Searching…", "検索中…") : tx("Refresh live matches", "ライブマッチを更新")}</button>
  </div>
  ${liveInfoLine()}
  ${renderJobFilters()}
  ${list.length ? `
    <p class="sub" style="margin:10px 0 6px">${tx("Verified vacancies from employer feeds", "雇主フィードからの確認済み求人")} · ${list.length}${list.length !== byRole.length ? "/" + byRole.length : ""}</p>
    ${list.map(renderJobCard).join("")}`
  : `<div class="card" style="text-align:center;padding:20px">
      <p class="muted">${byRole.length ? tx("No jobs match the current filters. Try broadening the filters.", "現在の条件に一致する求人はありません。条件を広げてください。") : tx("No verified Japan-eligible vacancies matched these roles in this check. This does not mean there are no Japan vacancies.", "今回のリモート求人フィードでは一致する求人を確認できませんでした。日本の求人がないという意味ではありません。")}</p>
      <p class="sub" style="margin-top:8px">${tx("Try related titles or search Japan job boards directly below. Search links are not counted as vacancy listings.", "関連職種で検索するか、下の日本求人サイトを直接検索してください。検索リンクは求人件数に含みません。")}</p>
      <div class="chip-row">${searchButtons(active, true)}</div>
    </div>`}
  <p class="sub" style="margin-top:10px">${tx("Structured feeds: Greenhouse employer boards + Jobicy/Remotive, filtered to explicit Japan locations or remote roles that explicitly accept Japan-based applicants.", "構造化フィードはJobicy・Remotiveのリモート求人です。日本の現地求人は上の公式求人サイトで検索してください。")}</p>`;
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
