// FindJob Now V7.3 — Easy Apply / Agencies / SME sources + Daily Plan + Application Note
// q = search URL prefix (role appended). Where no reliable search URL exists, q is omitted and the site home opens.

const EASY_APPLY_SOURCES = [
  { id: "linkedin", name: "LinkedIn Easy Apply", url: "https://www.linkedin.com/jobs/", q: "https://www.linkedin.com/jobs/search/?location=Japan&f_AL=true&keywords=", tags: ["easy", "upload"], en: "Easy Apply filter. Availability and required steps vary by vacancy; verify on LinkedIn.", jp: "Easy Applyフィルター。応募手順は求人ごとに異なるため、LinkedIn上で確認してください。" },
  { id: "indeed", name: "Indeed Japan", url: "https://jp.indeed.com/", q: "https://jp.indeed.com/jobs?q=", tags: ["upload"], en: "Some vacancies offer Indeed Apply; others redirect to the employer. Check each vacancy.", jp: "Indeed Apply対応求人もありますが、企業サイトへ移動する求人もあります。求人ごとに確認。" },
  { id: "careercross", name: "CareerCross", url: "https://www.careercross.com/en/", q: "https://www.careercross.com/en/job-search?keywords=", tags: ["upload", "bilingual"], en: "Bilingual jobs. Recruiters can see your profile.", jp: "バイリンガル求人。採用担当者がプロフィールを閲覧。" },
  { id: "daijob", name: "Daijob", url: "https://www.daijob.com/en/", q: "https://www.daijob.com/jobs/search?job_search_form_with_keyword%5Bkeyword%5D=", tags: ["upload", "bilingual"], en: "Resume database. Recruiters contact you.", jp: "履歴書データベース。リクルーターから連絡。" },
  { id: "jobsinjapan", name: "Jobs in Japan", url: "https://jobsinjapan.com/", tags: ["easy", "foreign"], en: "Foreigner-friendly jobs, simple applications.", jp: "外国人歓迎の求人。簡単に応募。" },
  { id: "gaijinpot", name: "GaijinPot Jobs", url: "https://jobs.gaijinpot.com/en/", q: "https://jobs.gaijinpot.com/job/index/lang/en?job_key=", tags: ["upload", "foreign"], en: "Popular with foreign job seekers.", jp: "外国人求職者に人気。" },
  { id: "wexpats-e", name: "WeXpats Jobs", url: "https://we-xpats.com/en/job/as/jp", tags: ["upload", "foreign"], en: "Foreigner-focused board with profile + consultation. (Added)", jp: "外国人向け求人サイト。プロフィール登録・相談あり。（追加）" },
  { id: "wantedly", name: "Wantedly", url: "https://www.wantedly.com/", q: "https://www.wantedly.com/projects?q=", tags: ["sme"], en: "Often an expression of interest / casual meeting request, not one-click Easy Apply.", jp: "「話を聞きに行きたい」などのカジュアル面談希望。ワンクリック応募ではありません。" },
  { id: "green", name: "Green Japan", url: "https://www.green-japan.com/", tags: ["upload", "sme"], en: "IT & startup jobs with profile system.", jp: "IT・スタートアップ求人。プロフィール登録。" },
  { id: "openwork", name: "OpenWork", url: "https://www.openwork.jp/", tags: [], en: "Company reviews and job discovery; application route varies.", jp: "企業口コミ・求人検索。応募方法は求人ごとに異なります。" },
  { id: "bizreach2", name: "BizReach", url: "https://www.bizreach.jp/", tags: [], en: "Experienced-professional / headhunter platform; registration required.", jp: "経験者向けスカウト・ヘッドハンタープラットフォーム。登録が必要です。" },
  { id: "doda2", name: "doda", url: "https://doda.jp/", tags: [], en: "Large Japanese job board; Japanese ability may be needed.", jp: "大手日本語求人サイト。日本語力が必要な場合があります。" },
  { id: "hellowork2", name: "Hello Work", url: "https://www.hellowork.mhlw.go.jp/", tags: [], en: "Official public employment service; Japanese-language support may be limited.", jp: "公的職業紹介サービス。外国語対応には限りがあります。" },
  { id: "mynaviglobal", name: "Mynavi Global", url: "https://global.mynavi.jp/", tags: [], en: "Global / foreign talent recruitment information.", jp: "グローバル人材・外国人採用情報。" },
  { id: "tokyodevjobs", name: "TokyoDev", url: "https://www.tokyodev.com/jobs", tags: [], en: "Technology roles; use for software / engineering searches.", jp: "IT・エンジニア職向け。" },
  { id: "japandevjobs", name: "Japan Dev", url: "https://japan-dev.com/jobs", tags: [], en: "English-friendly technology companies and roles.", jp: "英語対応のテック企業・求人。" }
];

const AGENCY_SOURCES = [
  { id: "ragent", name: "Recruit Agent", url: "https://www.r-agent.com/", tags: ["top", "japanese"], en: "Japan’s largest agency. Best for Japanese-speakers. Priority #1.", jp: "国内最大級のエージェント。日本語話者に最適。最優先。" },
  { id: "jac", name: "JAC Recruitment", url: "https://www.jac-recruitment.jp/en/", q: "https://www.jac-recruitment.jp/en/job-search/?keyword=", tags: ["top", "bilingual"], en: "Bilingual & global roles. Priority agency.", jp: "バイリンガル・外資系に強い。優先エージェント。" },
  { id: "robertwalters", name: "Robert Walters", url: "https://www.robertwalters.co.jp/en/", q: "https://www.robertwalters.co.jp/en/jobs.html?keywords=", tags: ["top", "bilingual"], en: "Professional roles, English-friendly.", jp: "専門職、英語対応。" },
  { id: "hays", name: "Hays Japan", url: "https://www.hays.co.jp/", tags: ["top", "bilingual"], en: "Specialist recruiter for IT, finance, engineering.", jp: "IT・金融・エンジニア等の専門エージェント。" },
  { id: "michaelpage", name: "Michael Page", url: "https://www.michaelpage.co.jp/en", q: "https://www.michaelpage.co.jp/jobs?keywords=", tags: ["top", "bilingual"], en: "Mid–senior professional placements.", jp: "ミドル〜シニア層の人材紹介。" },
  { id: "enworld", name: "en world Japan", url: "https://www.enworld.com/", tags: ["bilingual"], en: "Global-company roles, bilingual.", jp: "外資系・バイリンガル求人。" },
  { id: "randstad", name: "Randstad Japan", url: "https://www.randstad.co.jp/", tags: ["staffing"], en: "Staffing + permanent placement.", jp: "派遣・人材紹介。" },
  { id: "persol", name: "PERSOL Career", url: "https://persol-career.co.jp/", tags: ["japanese"], en: "Large Japanese agency, many SME clients.", jp: "大手エージェント。中小企業の求人も多い。" },
  { id: "rgf", name: "RGF Professional", url: "https://www.rgf-professional.jp/", tags: ["bilingual"], en: "Recruit Group’s professional recruiter.", jp: "リクルートグループの専門エージェント。" },
  { id: "adecco", name: "Adecco Japan", url: "https://www.adecco.co.jp/", tags: ["staffing"], en: "Temp-to-perm & staffing — quick entry.", jp: "派遣・紹介予定派遣。早く入社しやすい。" },
  { id: "manpower", name: "ManpowerGroup Japan", url: "https://www.manpowergroup.jp/", tags: ["staffing"], en: "Staffing agency with wide SME coverage. (Added)", jp: "中小企業にも強い派遣会社。（追加）" },
  { id: "pasona", name: "Pasona", url: "https://www.pasona.co.jp/", tags: ["staffing"], en: "Staffing & placement. (Added)", jp: "派遣・人材紹介。（追加）" },
  { id: "bizreach", name: "BizReach", url: "https://www.bizreach.jp/", tags: ["japanese"], en: "Headhunters contact you. Good for experienced pros. (Added)", jp: "ヘッドハンターからスカウト。経験者向け。（追加）" }
];

const SME_SOURCES = [
  { id: "wantedly2", name: "Wantedly", url: "https://www.wantedly.com/", q: "https://www.wantedly.com/projects?q=", en: "Startups & small teams, casual first contact.", jp: "スタートアップ・小規模チーム。気軽な応募。" },
  { id: "green2", name: "Green Japan", url: "https://www.green-japan.com/", en: "IT / startup / growth SMEs.", jp: "IT・スタートアップ・成長中の中小企業。" },
  { id: "tokyodev2", name: "TokyoDev", url: "https://www.tokyodev.com/", q: "https://www.tokyodev.com/jobs?q=", en: "Engineers; many visa-sponsoring small firms.", jp: "エンジニア向け。ビザ支援の小規模企業が多い。" },
  { id: "japandev2", name: "Japan Dev", url: "https://japan-dev.com/", q: "https://japan-dev.com/jobs?query=", en: "English-friendly tech companies of all sizes.", jp: "英語対応のテック企業（規模問わず）。" },
  { id: "hellowork", name: "Hello Work", url: "https://www.hellowork.mhlw.go.jp/", en: "Government board. Mostly small & regional employers.", jp: "公共職業安定所。中小・地方企業が中心。" },
  { id: "engage", name: "Engage (en-japan)", url: "https://en-gage.net/", en: "Free for SMEs to post, so lots of small employers.", jp: "中小企業が無料で掲載。小規模企業が多い。" },
  { id: "wexpats", name: "WeXpats Jobs", url: "https://we-xpats.com/en/job/as/jp", tags: ["foreign"], en: "20,000+ jobs for foreigners in Japan, incl. small & mid-size firms. (Added)", jp: "外国人向け求人2万件以上。中小企業も多数。（追加）" },
  { id: "indeed2", name: "Indeed Japan", url: "https://jp.indeed.com/", q: "https://jp.indeed.com/jobs?q=", en: "Filter by small company / region in the site.", jp: "サイト内で中小企業・地域を絞り込み。" },
  { id: "doda", name: "doda", url: "https://doda.jp/", en: "Large board with many mid-size firms. (Added)", jp: "中堅企業の求人が多い。（追加）" },
  { id: "mynavi", name: "Mynavi Global", url: "https://global.mynavi.jp/", en: "Mid-size Japanese firms hiring foreigners. (Added)", jp: "外国人採用に積極的な中堅企業。（追加）" }
];

const TAG_LABEL = {
  easy: ["⚡ Easy Apply", "⚡ 簡単応募"], upload: ["📄 Resume upload", "📄 履歴書UP"],
  bilingual: ["🌐 Bilingual", "🌐 バイリンガル"], foreign: ["🧑‍💼 Foreigner-friendly", "🧑‍💼 外国人歓迎"],
  sme: ["🏢 SME/Startup", "🏢 中小/スタートアップ"], top: ["⭐ Priority", "⭐ 優先"],
  staffing: ["🧑‍🔧 Staffing", "🧑‍🔧 派遣"], japanese: ["🇯🇵 Japanese-heavy", "🇯🇵 日本語中心"]
};

const PRIORITY_ORDER = [
  ["Easy Apply jobs", "簡単応募の求人"], ["Resume-upload jobs", "履歴書アップロード求人"],
  ["Recruiter-submitted jobs", "エージェント経由の求人"], ["SME companies", "中小企業"],
  ["Startups", "スタートアップ"], ["Regional companies", "地方企業"]
];

const STEPS = [
  ["Create 2 resumes (English + Japanese), save as PDF and DOCX.", "履歴書を2種類（英語・日本語）作成し、PDFとDOCXで保存。"],
  ["Upload your resume to LinkedIn, CareerCross, Daijob, GaijinPot, Jobs in Japan, Green, Wantedly, Indeed.", "LinkedIn・CareerCross・Daijob・GaijinPot・Jobs in Japan・Green・Wantedly・Indeedに履歴書を登録。"],
  ["Register with Recruit Agent, JAC, Robert Walters, Hays, Michael Page — one recruiter can submit you to many companies.", "Recruit Agent・JAC・Robert Walters・Hays・Michael Pageに登録。1人の担当者が複数社へ推薦。"],
  ["Apply daily: 20–30 applications (see counter above).", "毎日20〜30件応募（上のカウンター参照）。"],
  ["Use the ready-made application note below (edit the role & company).", "下の応募文テンプレートを使用（職種・会社名を編集）。"]
];

/* ---------- Application note ---------- */
function buildApplicationNote(lang, role, company, name) {
  const r = (role || "").trim(), c = (company || "").trim(), n = (name || "").trim();
  if (lang === "jp") {
    return `採用ご担当者様\n\n${c ? c + "の" : "貴社の"}${r ? "「" + r + "」" : "求人"}に応募いたします。これまでの経験とスキルを活かし、貴社に貢献できると考えております。\n\nご都合のよい日時に面接を受けることが可能です。ぜひお話しできれば幸いです。\n\nご検討のほど、よろしくお願いいたします。\n${n}`;
  }
  return `Dear Hiring Manager,\n\nI am interested in ${r ? "the " + r + " position" : "this position"}${c ? " at " + c : ""} and would like to apply. My experience includes relevant skills and professional experience in my field.\n\nI am available for an interview at your convenience and look forward to discussing how I can contribute to your team.\n\nThank you for your consideration.\n\nBest regards,\n${n}`;
}

/* ---------- Daily counter ---------- */
const DAILY_GOAL = 25;
function getDaily() {
  const d = new Date().toISOString().slice(0, 10);
  if (!STATE.daily || STATE.daily.date !== d) STATE.daily = { date: d, count: 0, easy: 0, agency: 0, sme: 0, large: 0 };
  return STATE.daily;
}

/* ---------- Rendering ---------- */
function srcQuery() { return encodeURIComponent((typeof getActiveRole === "function" ? getActiveRole() : "") || "jobs"); }

function renderSourceCard(s, kind) {
  const verified = typeof VERIFIED_IDS !== "undefined" && VERIFIED_IDS.includes(s.id);
  const href = s.q ? s.q + srcQuery() : s.url;
  const tags = (s.tags || []).map(k => `<span class="badge ${k === "top" ? "ready" : "source"}">${tx(TAG_LABEL[k][0], TAG_LABEL[k][1])}</span>`).join("");
  return `
  <article class="job-card" style="padding:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div style="min-width:0">
        <div class="job-title" style="font-size:15px">${esc(s.name)}</div>
        <p class="sub" style="margin-top:4px;font-size:12px">${esc(tx(s.en, s.jp))}</p>
      </div>
      <a class="btn primary sm" href="${esc(safeUrl(href))}" target="_blank" rel="noopener" data-src-open="${kind}" style="flex-shrink:0;min-height:36px">${s.q ? tx("Search", "検索") : (kind === "agency" ? tx("Register", "登録") : tx("Website", "サイト"))}</a>
    </div>
    ${tags ? `<div class="job-meta" style="margin-top:6px">${tags}</div>` : ""}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:11px">
      <span style="color:var(--ok)">${verified ? "✔ " + tx("Checked", "確認済") + " " + VERIFIED_LABEL : ""}</span>
      <button type="button" class="btn ghost sm" data-report="${esc(s.id)}" style="min-height:28px;font-size:11px;padding:2px 8px">⚠ ${tx("Report broken", "リンク切れ報告")}</button>
    </div>
  </article>`;
}

function renderSourceGroups(list, kind) {
  const vis = visibleSources(list);
  const withQ = vis.filter(x => x.q), noQ = vis.filter(x => !x.q);
  const head = (t0) => `<p class="sub" style="margin:14px 0 6px;font-weight:700">${t0}</p>`;
  return `${renderRolePicker(false)}
  ${withQ.length ? head(kind === "agency" ? tx("Search jobs by your role", "職種で検索") : tx("🔎 Search with your role", "🔎 職種で検索")) + withQ.map(x => renderSourceCard(x, kind)).join("") : ""}
  ${noQ.length ? head(kind === "agency" ? tx("🔗 Register / website links", "🔗 登録・ウェブサイトリンク") : tx("🔗 Website links only (no direct search)", "🔗 ウェブサイトリンクのみ（直接検索なし）")) + noQ.map(x => renderSourceCard(x, kind)).join("") : ""}
  ${renderRestoreRow(list)}`;
}

function renderNoteCard() {
  const lang = STATE._noteLang || "en";
  const role = (typeof getSearchRoles === "function" ? getSearchRoles()[0] : "") || "";
  const name = STATE.profile?.name || "";
  const text = buildApplicationNote(lang, STATE._noteRole ?? (role === "jobs in Japan" ? "" : role), STATE._noteCo || "", name);
  return `
  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">${tx("✉️ Ready-to-use application note", "✉️ すぐ使える応募文")}</div>
    <div class="tabs" style="margin-bottom:8px">
      <button type="button" class="tab ${lang === "en" ? "on" : ""}" data-notelang="en">English</button>
      <button type="button" class="tab ${lang === "jp" ? "on" : ""}" data-notelang="jp">日本語</button>
    </div>
    <input id="noteRole" class="input" type="text" placeholder="${tx("Role", "職種")}" value="${esc(STATE._noteRole ?? (role === "jobs in Japan" ? "" : role))}" style="width:100%;margin-bottom:6px">
    <input id="noteCo" class="input" type="text" placeholder="${tx("Company (optional)", "会社名（任意）")}" value="${esc(STATE._noteCo || "")}" style="width:100%;margin-bottom:8px">
    <textarea id="noteText" class="textarea" rows="9" style="width:100%">${esc(text)}</textarea>
    <button type="button" class="btn secondary sm" id="copyNote" style="margin-top:8px">${tx("Copy note", "コピー")}</button>
  </div>`;
}

function renderEasyTab() {
  return `
  <div class="card">
    <div style="font-size:13px;font-weight:700">${tx("🚀 Easy Apply / Resume Upload", "🚀 簡単応募 / 履歴書アップロード")}</div>
    <p class="sub" style="margin-top:4px">${tx("Explore direct-apply filters, resume/profile registration and employer application pages. The application method varies by job; verify before applying.", "直接応募フィルター、履歴書・プロフィール登録、企業の応募ページを確認できます。応募方法は求人ごとに異なるため、応募前に確認してください。")}</p>
  </div>
  <div class="card" style="padding:12px"><p class="sub" style="margin:0">${tx("Important: a job-board link is not proof of Easy Apply or CV upload. Only the individual vacancy page can confirm its application method.", "重要：求人サイトへのリンクだけではEasy Applyや履歴書アップロード対応を保証しません。実際の求人ページで応募方法を確認してください。")}</p></div>
  <div style="margin-top:10px">${renderSourceGroups(EASY_APPLY_SOURCES, "easy")}</div>
  ${renderNoteCard()}`;
}

function renderAgencyTab() {
  return `
  <div class="card">
    <div style="font-size:13px;font-weight:700">${tx("🤝 Recruitment & Staffing Agencies", "🤝 人材紹介・派遣会社")}</div>
    <p class="sub" style="margin-top:4px">${tx("Recruiters submit you directly to employers — one registration, many companies. Register with the ⭐ priority agencies first.", "担当者が企業へ直接推薦。1回の登録で複数社へ。まず⭐優先エージェントに登録。")}</p>
  </div>
  <div style="margin-top:10px">${renderSourceGroups(AGENCY_SOURCES, "agency")}</div>
  <div class="card" style="margin-top:12px"><p class="sub">${tx("Tip: use the note template in the Easy Apply tab when emailing recruiters. Staffing (haken) agencies are the fastest way in for many foreigners.", "ヒント: エージェントへのメールにはEasy Applyタブの応募文を利用。派遣会社は外国人にとって最短の入口になることも。")}</p></div>`;
}

function renderSmeTab() {
  return `
  <div class="card">
    <div style="font-size:13px;font-weight:700">${tx("🏢 SME & Startup Jobs", "🏢 中小企業・スタートアップ求人")}</div>
    <p class="sub" style="margin-top:4px">${tx("Smaller companies mean less competition.", "小さな会社ほど競争が少ない。")}</p>
    <ul class="why-list">
      <li class="good">✓ ${tx("Fewer applicants", "応募者が少ない")}</li>
      <li class="good">✓ ${tx("Faster hiring", "採用が早い")}</li>
      <li class="good">✓ ${tx("Higher response rate", "返信率が高い")}</li>
      <li class="good">✓ ${tx("Better interview chances", "面接の可能性が高い")}</li>
      <li class="good">✓ ${tx("More willing to sponsor visas", "ビザ支援に前向き")}</li>
    </ul>
  </div>
  <div style="margin-top:10px">${renderSourceGroups(SME_SOURCES, "sme")}</div>`;
}

function renderPlanTab() {
  const d = getDaily();
  const pct = Math.min(100, Math.round(d.count / DAILY_GOAL * 100));
  const mix = [["Easy Apply", "簡単応募", 40], ["Agencies", "エージェント", 30], ["SME", "中小企業", 20], ["Large companies", "大企業", 10]];
  return `
  <div class="card accent">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:13px;font-weight:700">${tx("🎯 Today’s applications", "🎯 今日の応募数")}</div>
      <strong style="color:var(--ac)">${d.count} / ${DAILY_GOAL}</strong>
    </div>
    <div class="match-bar" style="margin:8px 0"><i style="width:${pct}%"></i></div>
    <div class="btn-row cols-2">
      <button type="button" class="btn primary sm" data-daily="+1" style="width:100%">+ ${tx("Applied", "応募した")}</button>
      <button type="button" class="btn ghost sm" data-daily="-1" style="width:100%">− ${tx("Undo", "取消")}</button>
    </div>
    <p class="sub" style="margin-top:8px">${tx("Target: 20–30 per day. Resets daily.", "目標：1日20〜30件。毎日リセット。")}</p>
  </div>

  ${renderFollowUpCard()}
  ${renderProgressCard()}

  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">${tx("The winning mix", "おすすめ配分")}</div>
    ${mix.map(m => `
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px"><span>${tx(m[0], m[1])}</span><strong>${m[2]}% · ~${Math.round(DAILY_GOAL * m[2] / 100)}/${tx("day", "日")}</strong></div>
      <div class="match-bar"><i style="width:${m[2]}%"></i></div>`).join("")}
  </div>

  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">${tx("Apply in this priority", "応募の優先順位")}</div>
    <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.7">${PRIORITY_ORDER.map(p => `<li>${tx(p[0], p[1])}</li>`).join("")}</ol>
    <p class="sub" style="margin-top:8px">${tx("Don’t focus only on famous companies.", "有名企業だけに絞らない。")}</p>
  </div>

  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">${tx("Best job types to prioritize", "優先すべき求人タイプ")}</div>
    <div class="chip-row">
      ${[["Easy Apply", "簡単応募"], ["Resume Upload", "履歴書UP"], ["No cover letter", "カバーレター不要"], ["Foreigner-friendly", "外国人歓迎"], ["Recruiter submission", "エージェント推薦"], ["Immediate hiring", "急募"], ["Visa sponsorship", "ビザ支援"]].map(c => `<span class="chip on" style="cursor:default">✅ ${tx(c[0], c[1])}</span>`).join("")}
    </div>
  </div>

  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">${tx("5-step strategy", "5ステップ戦略")}</div>
    <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.7">${STEPS.map(s => `<li>${tx(s[0], s[1])}</li>`).join("")}</ol>
  </div>
  <div class="card" style="margin-top:12px"><p class="sub"><strong>${tx("Top 10 to start:", "まず登録する10サイト:")}</strong> Recruit Agent · LinkedIn Easy Apply · Indeed · CareerCross · Daijob · JAC · Wantedly · Green · TokyoDev · SME/Startups</p></div>
  ${renderPrivacyCard()}`;
}

function wireSources() {
  $$("[data-notelang]").forEach(b => b.addEventListener("click", () => { STATE._noteLang = b.dataset.notelang; render(); }));
  const refresh = () => {
    const ta = $("noteText"); if (!ta) return;
    STATE._noteRole = $("noteRole").value; STATE._noteCo = $("noteCo").value;
    ta.value = buildApplicationNote(STATE._noteLang || "en", STATE._noteRole, STATE._noteCo, STATE.profile?.name || "");
  };
  $("noteRole")?.addEventListener("input", refresh);
  $("noteCo")?.addEventListener("input", refresh);
  $("copyNote")?.addEventListener("click", () => {
    const text = $("noteText")?.value || "";
    (navigator.clipboard?.writeText(text) || Promise.reject()).then(() => say(tx("Copied", "コピーしました"), 1)).catch(() => { $("noteText")?.select(); say(tx("Press copy on selected text", "選択したテキストをコピーしてください"), 0); });
  });
  $$("[data-src-open]").forEach(a => a.addEventListener("click", () => {
    // Opening a source never counts as an application; no state change.
  }));
  $$("[data-daily]").forEach(b => b.addEventListener("click", () => {
    const c = bumpDaily(b.dataset.daily === "+1" ? 1 : -1);
    render();
    if (b.dataset.daily === "+1" && c === DAILY_GOAL) say(tx("🎉 Daily goal reached!", "🎉 今日の目標達成！"), 1);
  }));
}
