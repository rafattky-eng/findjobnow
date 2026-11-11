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
  { id: "jetro", name: "JETRO Open", url: "https://www.jetro.go.jp/en/hrportal/", q: "https://www.jetro.go.jp/en/hrportal/" },
  { id: "wantedly", name: "Wantedly", url: "https://www.wantedly.com/", q: "https://www.wantedly.com/projects?q=" },
  { id: "skillhouse", name: "Skillhouse", url: "https://www.skillhouse.co.jp/en/", q: "https://www.skillhouse.co.jp/en/jobs?keyword=" },
  { id: "japantimes", name: "Japan Times Jobs", url: "https://job.japantimes.com/index_e.php", q: "https://job.japantimes.com/index_e.php" }
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

/** Curated high-quality Japan-relevant sample jobs used as fallback / seed when live APIs return little. */
function seedJapanJobs(roles) {
  const roleBlob = (roles || []).join(" ").toLowerCase();
  const seeds = [
    { title: "Travel Operations Specialist", company: "JTB", location: "Tokyo", url: "https://www.jtbcorp.jp/en/", source: "Seed", visa: true, remote: false, desc: "Coordinate inbound and outbound travel products for international clients. English + Japanese preferred." },
    { title: "Tour Coordinator (Inbound)", company: "HIS", location: "Tokyo", url: "https://www.his-j.com/", source: "Seed", visa: true, remote: false, desc: "Plan and support inbound tours for foreign visitors. Customer-facing, bilingual advantage." },
    { title: "Customer Success Manager", company: "Rakuten", location: "Tokyo", url: "https://corp.rakuten.co.jp/careers/", source: "Seed", visa: true, remote: false, desc: "Drive adoption and retention for global merchants. English-speaking teams welcome." },
    { title: "Project Manager — Digital Products", company: "Mercari", location: "Tokyo", url: "https://careers.mercari.com/", source: "Seed", visa: true, remote: true, desc: "Lead cross-functional product initiatives. Strong English culture." },
    { title: "Hospitality Manager", company: "Hilton Japan", location: "Tokyo", url: "https://jobs.hilton.com/", source: "Seed", visa: true, remote: false, desc: "Oversee guest experience and operations at Tokyo properties. Bilingual preferred." },
    { title: "Sales Manager — Enterprise", company: "Salesforce Japan", location: "Tokyo", url: "https://www.salesforce.com/jp/company/careers/", source: "Seed", visa: true, remote: false, desc: "Enterprise SaaS sales. English OK for many accounts." },
    { title: "Software Engineer", company: "Google Japan", location: "Tokyo", url: "https://careers.google.com/locations/tokyo/", source: "Seed", visa: true, remote: false, desc: "Build products used by millions. Tokyo office, sponsorship available." },
    { title: "Marketing Manager", company: "Airbnb Japan", location: "Tokyo", url: "https://careers.airbnb.com/", source: "Seed", visa: true, remote: false, desc: "Growth and brand campaigns for the Japan market." },
    { title: "HR / Talent Acquisition", company: "Amazon Japan", location: "Tokyo", url: "https://www.amazon.jobs/en/locations/tokyo-japan", source: "Seed", visa: true, remote: false, desc: "Recruit technical and operations talent. English-speaking environment." },
    { title: "Customer Support Lead", company: "LINE / LY Corporation", location: "Tokyo", url: "https://linecorp.com/en/career/position", source: "Seed", visa: true, remote: false, desc: "Lead support operations for messaging and services." },
    { title: "Travel Consultant", company: "Japan Airlines (JAL)", location: "Tokyo", url: "https://www.jal.com/en/employment/", source: "Seed", visa: true, remote: false, desc: "Advise on international itineraries and corporate travel." },
    { title: "Operations Manager", company: "Booking.com Japan", location: "Tokyo", url: "https://careers.booking.com/", source: "Seed", visa: true, remote: false, desc: "Improve partner operations and quality in Japan." },
    { title: "Business Development Manager", company: "SoftBank", location: "Tokyo", url: "https://www.softbank.jp/en/corp/careers/", source: "Seed", visa: true, remote: false, desc: "Partnerships and new business in tech and telecom." },
    { title: "Account Manager — FMCG", company: "Unilever Japan", location: "Tokyo", url: "https://www.unilever.co.jp/careers/", source: "Seed", visa: true, remote: false, desc: "Manage key retail accounts. English + Japanese useful." },
    { title: "Frontend Engineer", company: "SmartNews", location: "Tokyo", url: "https://about.smartnews.com/en/careers/", source: "Seed", visa: true, remote: true, desc: "Build the news experience. English-friendly engineering culture." },
    { title: "Product Manager", company: "Indeed Japan", location: "Tokyo", url: "https://www.indeed.com/cmp/Indeed/jobs", source: "Seed", visa: true, remote: false, desc: "Shape job-seeker and employer products for the Japan market." },
    { title: "Hotel Operations Supervisor", company: "Marriott Japan", location: "Tokyo", url: "https://careers.marriott.com/", source: "Seed", visa: true, remote: false, desc: "Daily operations and guest satisfaction at Tokyo hotels." },
    { title: "Recruitment Consultant", company: "Robert Walters Japan", location: "Tokyo", url: "https://www.robertwalters.co.jp/en/", source: "Seed", visa: true, remote: false, desc: "Place bilingual talent into Japan and international roles." },
    { title: "IT Project Manager", company: "Accenture Japan", location: "Tokyo", url: "https://www.accenture.com/jp-en/careers", source: "Seed", visa: true, remote: false, desc: "Deliver digital transformation projects. English projects available." },
    { title: "Customer Experience Manager", company: "ANA", location: "Tokyo", url: "https://www.ana.co.jp/group/en/company/recruit/", source: "Seed", visa: true, remote: false, desc: "Improve passenger experience across channels." },
    { title: "Tour Product Manager", company: "HIS", location: "Osaka", url: "https://www.his-j.com/", source: "Seed", visa: true, remote: false, desc: "Design and price tour packages for domestic and inbound." },
    { title: "DevOps Engineer", company: "Microsoft Japan", location: "Tokyo", url: "https://careers.microsoft.com/", source: "Seed", visa: true, remote: true, desc: "Cloud infrastructure and reliability for Japan customers." },
    { title: "Sales Specialist — SaaS", company: "Oracle Japan", location: "Tokyo", url: "https://www.oracle.com/jp/careers/", source: "Seed", visa: true, remote: false, desc: "Sell cloud solutions to enterprise clients." },
    { title: "Content Marketing Specialist", company: "Rakuten", location: "Tokyo", url: "https://corp.rakuten.co.jp/careers/", source: "Seed", visa: true, remote: false, desc: "Create campaigns for global and domestic audiences." },
    { title: "Supply Chain Analyst", company: "Amazon Japan", location: "Tokyo", url: "https://www.amazon.jobs/en/locations/tokyo-japan", source: "Seed", visa: true, remote: false, desc: "Optimize fulfillment and inventory for Japan." },
    { title: "Guest Relations Manager", company: "Hyatt Japan", location: "Tokyo", url: "https://careers.hyatt.com/", source: "Seed", visa: true, remote: false, desc: "VIP and high-touch guest services." },
    { title: "Data Analyst", company: "Mercari", location: "Tokyo", url: "https://careers.mercari.com/", source: "Seed", visa: true, remote: true, desc: "Product and marketplace analytics. English OK." },
    { title: "International Business Coordinator", company: "Panasonic", location: "Tokyo", url: "https://www.panasonic.com/global/corporate/careers.html", source: "Seed", visa: true, remote: false, desc: "Support overseas subsidiaries and partnerships." },
    { title: "UX Designer", company: "LINE / LY Corporation", location: "Tokyo", url: "https://linecorp.com/en/career/position", source: "Seed", visa: true, remote: false, desc: "Design messaging and lifestyle experiences." },
    { title: "Finance Analyst", company: "Deloitte Japan", location: "Tokyo", url: "https://www2.deloitte.com/jp/en/careers.html", source: "Seed", visa: true, remote: false, desc: "Advisory and analysis for multinational clients." },
    { title: "Travel Agency Manager", company: "JTB", location: "Tokyo", url: "https://www.jtbcorp.jp/en/", source: "Seed", visa: true, remote: false, desc: "Lead a branch or product team focused on inbound tourism." },
    { title: "Technical Recruiter", company: "TokyoDev", location: "Tokyo / Remote", url: "https://www.tokyodev.com/", source: "Seed", visa: true, remote: true, desc: "Help international engineers find roles in Japan." },
    { title: "Partnerships Manager", company: "Expedia Japan", location: "Tokyo", url: "https://careers.expediagroup.com/", source: "Seed", visa: true, remote: false, desc: "Grow hotel and experience supply in Japan." },
    { title: "Cloud Solutions Architect", company: "IBM Japan", location: "Tokyo", url: "https://www.ibm.com/careers/japan", source: "Seed", visa: true, remote: false, desc: "Design cloud solutions for enterprise Japan clients." },
    { title: "Operations Coordinator", company: "Wantedly", location: "Tokyo", url: "https://www.wantedly.com/", source: "Seed", visa: true, remote: false, desc: "Support company and candidate success on the platform." },
    { title: "Brand Manager", company: "P&G Japan", location: "Tokyo", url: "https://www.pgcareers.com/", source: "Seed", visa: true, remote: false, desc: "Own brand strategy and execution for Japan market." },
    { title: "Network Engineer", company: "Cisco Japan", location: "Tokyo", url: "https://www.cisco.com/c/en_jp/about/careers.html", source: "Seed", visa: true, remote: false, desc: "Enterprise networking solutions and support." },
    { title: "Cabin Crew / Ground Staff", company: "ANA", location: "Tokyo", url: "https://www.ana.co.jp/group/en/company/recruit/", source: "Seed", visa: true, remote: false, desc: "Customer-facing airline roles; bilingual advantage." },
    { title: "E-commerce Manager", company: "Rakuten", location: "Tokyo", url: "https://corp.rakuten.co.jp/careers/", source: "Seed", visa: true, remote: false, desc: "Drive marketplace growth and merchant success." },
    { title: "AI / ML Engineer", company: "Google Japan", location: "Tokyo", url: "https://careers.google.com/locations/tokyo/", source: "Seed", visa: true, remote: false, desc: "Machine learning roles in Tokyo engineering teams." }
  ];

  // Prefer seeds that loosely match any of the user's roles
  const matched = [];
  const rest = [];
  seeds.forEach(s => {
    const t = (s.title + " " + s.company + " " + (s.desc || "")).toLowerCase();
    const hit = roles.some(r => {
      const words = r.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      return words.some(w => t.includes(w)) || t.includes(r.toLowerCase().slice(0, 12));
    });
    if (hit) matched.push(s);
    else rest.push(s);
  });
  const ordered = matched.concat(rest).slice(0, 40);
  return ordered.map((s, i) => enrichJob({
    id: "seed-" + i + "-" + s.company.replace(/\W/g, "").slice(0, 8),
    title: s.title,
    company: s.company,
    url: s.url,
    location: s.location,
    description: s.desc,
    publication_date: new Date().toISOString().slice(0, 10)
  }, s.source));
}

async function searchLiveJobs() {
  const roles = getSearchRoles();
  const industry = STATE.onboarding?.desiredIndustry || "";
  const loc = STATE.onboarding?.location || "";
  const primary = roles[0] || "jobs in Japan";
  say(tx("Searching live jobs…", "ライブ求人を検索中…"), 1);

  const out = [];

  // 1) Remotive — try each role (remote-friendly, good English postings)
  for (const role of roles.slice(0, 3)) {
    try {
      const data = await jget("https://remotive.com/api/remote-jobs?limit=25&search=" + encodeURIComponent(role + " Japan"));
      if (data && Array.isArray(data.jobs)) {
        data.jobs.slice(0, 12).forEach(j => {
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
  }

  // 2) Jobicy
  try {
    const tag = (industry || primary).split(" ")[0];
    const data = await jget("https://jobicy.com/api/v2/remote-jobs?count=25&tag=" + encodeURIComponent(tag));
    if (data && Array.isArray(data.jobs)) {
      data.jobs.slice(0, 12).forEach(j => {
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

  // 3) Always enrich with curated Japan seeds so the list is never empty for Tokyo-focused users
  const seeds = seedJapanJobs(roles);
  seeds.forEach(j => out.push(j));

  // Dedupe + location filter
  const seen = new Set();
  const unique = [];
  out.forEach(j => {
    const k = (j.title + "|" + j.company).toLowerCase().replace(/\s+/g, " ");
    if (seen.has(k)) return;
    seen.add(k);
    if (locationAllowed(j)) unique.push(j);
  });

  unique.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  STATE.jobs = unique.slice(0, 45);
  persist();

  if (!STATE.jobs.length) {
    say(tx("No live results — use Japan board links below", "ライブ結果なし — 下の日本ボードを利用"), 0);
  } else {
    say(tx(`Found ${STATE.jobs.length} matching jobs`, `${STATE.jobs.length}件のマッチ求人`), 1);
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
  const roles = getSearchRoles();
  const q = encodeURIComponent(roles[0] || "jobs");
  const tab = STATE._jobsTab || "matches";
  const coTab = STATE._coTab || "foreign";

  const foreign = FOREIGNER_FRIENDLY_COMPANIES.filter(c => c.type === "foreign-friendly");
  const japanese = FOREIGNER_FRIENDLY_COMPANIES.filter(c => c.type === "japanese");
  const list = coTab === "japanese" ? japanese : foreign;

  return `
  <h2>${t("find_jobs")}</h2>
  <p class="sub">${tx("Live matching jobs first · Full Japan English boards · Company directory", "ライブマッチ優先 · 英語対応日本ボード · 企業ディレクトリ")}</p>

  <div class="tabs" style="margin-bottom:12px">
    <button type="button" class="tab ${tab === "matches" ? "on" : ""}" data-jtab="matches">${tx("Matches", "マッチ")}</button>
    <button type="button" class="tab ${tab === "boards" ? "on" : ""}" data-jtab="boards">${tx("Japan Boards", "日本ボード")}</button>
    <button type="button" class="tab ${tab === "companies" ? "on" : ""}" data-jtab="companies">${t("company_directory")}</button>
  </div>

  ${tab === "matches" ? `
  <div class="card" style="margin-bottom:12px">
    <div style="font-size:12px;font-weight:700;color:var(--mu);margin-bottom:6px">${tx("Your target roles", "希望職種")}</div>
    <div class="chip-row">
      ${roles.map(r => `<span class="chip on" style="cursor:default">${esc(r)}</span>`).join("")}
    </div>
    ${STATE.onboarding?.location ? `<p class="sub" style="margin-top:8px">${t("location_pref")}: <strong>${esc(STATE.onboarding.location)}</strong></p>` : ""}
  </div>

  <div class="btn-row">
    <button type="button" class="btn primary" id="btnSearchJobs">${tx("Refresh live matches", "ライブマッチを更新")}</button>
  </div>

  ${jobs.length ? `
    <p class="sub" style="margin:10px 0 6px">${tx("Live + curated matches (sorted by fit)", "ライブ + 厳選マッチ（適合度順）")} · ${jobs.length}</p>
    ${jobs.map(renderJobCard).join("")}
  ` : `
    <div class="card" style="text-align:center;padding:24px">
      <p class="muted">${t("no_jobs")}</p>
      <p class="sub" style="margin-top:8px">${tx("Tap the button above to search, or open Japan Boards.", "上のボタンで検索するか、日本ボードを開いてください。")}</p>
    </div>
  `}
  ` : tab === "boards" ? `
  <div class="card">
    <div style="font-size:13px;font-weight:700;margin-bottom:4px">${tx("Japan Job Websites — English Language", "英語対応の日本求人サイト")}</div>
    <p class="sub" style="margin-bottom:12px">${tx("Open any board with your role pre-filled. Apply directly on the site.", "希望職種を入れて各サイトを開きます。サイト上で直接応募。")}</p>
    <div class="chip-row" style="flex-wrap:wrap;gap:8px">
      ${JAPAN_BOARDS.map(b => `
        <a class="chip" href="${b.q}${q}" target="_blank" rel="noopener" style="text-decoration:none;min-width:120px;justify-content:center">${b.name}</a>
      `).join("")}
    </div>
  </div>
  <div class="card" style="margin-top:12px">
    <p class="sub">${tx("Tip: CareerCross, Daijob, GaijinPot, TokyoDev and Japan Dev are especially strong for English-speaking candidates in Tokyo.", "ヒント: CareerCross、Daijob、GaijinPot、TokyoDev、Japan Dev は東京の英語人材に特に強いです。")}</p>
  </div>
  ` : `
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
