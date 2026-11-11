// FindJob Now V7 — Career DNA & analysis engine (rule-based, on-device)

const INDUSTRIES = [
  "Travel","Tourism","Hospitality","Airline","Hotel","Customer Service",
  "Sales","Marketing","Operations","Management","Technology","Education",
  "Recruitment","Finance","E-commerce","Customer Success","International Business"
];

const EXP_LEVELS = [
  { id: "entry", en: "Entry Level", jp: "新卒・未経験", yrs: 0 },
  { id: "1-3", en: "1–3 Years", jp: "1–3年", yrs: 2 },
  { id: "3-5", en: "3–5 Years", jp: "3–5年", yrs: 4 },
  { id: "5-10", en: "5–10 Years", jp: "5–10年", yrs: 7 },
  { id: "10+", en: "10+ Years", jp: "10年以上", yrs: 12 }
];

const VISA_OPTS = [
  { id: "need_sponsorship", en: "Need Sponsorship", jp: "スポンサー必要" },
  { id: "work_visa", en: "Work Visa", jp: "就労ビザ" },
  { id: "student", en: "Student Visa", jp: "学生ビザ" },
  { id: "wh", en: "Working Holiday", jp: "ワーキングホリデー" },
  { id: "pr", en: "Permanent Resident", jp: "永住者" },
  { id: "spouse", en: "Spouse Visa", jp: "配偶者ビザ" },
  { id: "national", en: "Japanese National", jp: "日本国籍" }
];

const JA_LABELS = { 1: "N5", 2: "N4", 3: "N3", 4: "N2", 5: "N1" };

const ARCHETYPES = [
  { id: "travel_product", en: "Travel Product Builder", jp: "旅行プロダクトビルダー", keys: /travel|tour|tourism|ota|package/i },
  { id: "ops_strategist", en: "Operations Strategist", jp: "オペレーション戦略家", keys: /operations|ops|logistics|vendor|process/i },
  { id: "cs_expert", en: "Customer Success Expert", jp: "カスタマーサクセス専門家", keys: /customer success|client success|account manag|cs\b/i },
  { id: "growth_builder", en: "Business Growth Builder", jp: "ビジネス成長ビルダー", keys: /sales|business development|growth|bd\b/i },
  { id: "tech_leader", en: "Technical Project Leader", jp: "テクニカルプロジェクトリーダー", keys: /project|scrum|agile|software|engineer|developer/i },
  { id: "hospitality_lead", en: "Hospitality Leader", jp: "ホスピタリティリーダー", keys: /hotel|hospitality|guest|front desk|fnb|f&b/i },
  { id: "marketing_creator", en: "Marketing Creator", jp: "マーケティングクリエイター", keys: /marketing|content|social|seo|campaign/i },
  { id: "people_partner", en: "People & Talent Partner", jp: "人材パートナー", keys: /hr|recruit|talent|people ops|hiring/i }
];

function _rx(s) { try { return new RegExp(s, "gi"); } catch { return /$^/; } }
function _count(re, text) { const m = String(text || "").match(re); return m ? m.length : 0; }

function estimateYears(text) {
  const t = String(text || "");
  let max = 0;
  const patterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
    /experience[:\s]+(\d+)\+?\s*years?/gi,
    /(\d+)\s*年以上/g,
    /経験\s*(\d+)\s*年/g
  ];
  patterns.forEach(re => {
    let m;
    while ((m = re.exec(t))) max = Math.max(max, parseInt(m[1], 10) || 0);
  });
  // Date ranges
  const years = t.match(/\b(20\d{2}|19\d{2})\b/g);
  if (years && years.length >= 2) {
    const nums = years.map(Number).filter(y => y >= 1990 && y <= 2026);
    if (nums.length >= 2) max = Math.max(max, Math.max(...nums) - Math.min(...nums));
  }
  return Math.min(25, max);
}

function extractSignals(text) {
  const t = String(text || "").toLowerCase();
  const signals = {
    travel: _count(/\b(travel|tourism|tour|ota|airline|hotel|hospitality|guest|inbound|outbound|itinerary|booking)\b|旅行|観光|ホテル|航空/, t),
    sales: _count(/\b(sales|revenue|quota|pipeline|crm|closing|account)\b|営業|売上/, t),
    marketing: _count(/\b(marketing|campaign|seo|sem|content|social media|brand)\b|マーケ|広告/, t),
    operations: _count(/\b(operations|ops|logistics|process|vendor|supply|workflow)\b|運営|オペレーション/, t),
    management: _count(/\b(manager|management|led |managed |supervised|director|head of)\b|管理|マネージャー|責任者/, t),
    leadership: _count(/\b(led |lead |leadership|mentor|coach|team of|supervised)\b|リーダー|指導/, t),
    customer: _count(/\b(customer service|customer success|client|support|helpdesk|inquiry)\b|顧客|お客様|サポート/, t),
    tech: _count(/\b(software|developer|engineer|python|javascript|sql|api|saas|system)\b|システム|開発/, t),
    product: _count(/\b(product manager|product owner|roadmap|backlog|feature)\b|プロダクト/, t),
    hr: _count(/\b(recruit|talent|hiring|hr |human resources|onboarding)\b|人事|採用/, t),
    finance: _count(/\b(finance|accounting|budget|forecast|p&l|revenue analysis)\b|財務|会計/, t),
    language: _count(/\b(english|japanese|jlpt|n1|n2|n3|bilingual|fluent)\b|英語|日本語|jlpt/, t)
  };
  // Normalize to 0-100
  Object.keys(signals).forEach(k => { signals[k] = Math.min(100, signals[k] * 12); });
  return signals;
}

function extractSkills(text) {
  const t = String(text || "");
  const pool = [
    "Excel","PowerPoint","Salesforce","HubSpot","Slack","Notion","Jira","SQL","Python",
    "JavaScript","React","AWS","GDS","Amadeus","Sabre","Customer Service","Project Management",
    "Agile","Scrum","SEO","Google Ads","Meta Ads","Negotiation","Vendor Management",
    "Stakeholder Management","Budgeting","Forecasting","CRM","ERP","Tableau","Looker"
  ];
  return pool.filter(s => new RegExp("\\b" + s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(t));
}

function extractName(text) {
  const lines = String(text || "").split(/\n/).map(l => l.trim()).filter(Boolean);
  for (const l of lines.slice(0, 6)) {
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(l) && l.length < 40) return l;
    if (/^[\u3040-\u30ff\u4e00-\u9faf\s]{2,20}$/.test(l)) return l;
  }
  return "";
}

function detectJlpt(text) {
  const t = String(text || "");
  if (/\bN1\b|JLPT\s*N1|日本語能力試験\s*N1/i.test(t)) return 5;
  if (/\bN2\b|JLPT\s*N2/i.test(t)) return 4;
  if (/\bN3\b|JLPT\s*N3/i.test(t)) return 3;
  if (/\bN4\b|JLPT\s*N4/i.test(t)) return 2;
  if (/\bN5\b|JLPT\s*N5/i.test(t)) return 1;
  if (/native\s*japanese|日本語\s*ネイティブ|bilingual.*japanese/i.test(t)) return 5;
  if (/business\s*japanese|ビジネス日本語|fluent\s*japanese/i.test(t)) return 4;
  return 0;
}

function inferArchetype(signals, role, industry, goal) {
  const blob = [role, industry, goal, ...Object.entries(signals).filter(([,v]) => v >= 30).map(([k]) => k)].join(" ");
  for (const a of ARCHETYPES) {
    if (a.keys.test(blob)) return a;
  }
  // Fallback by strongest signal
  const top = Object.entries(signals).sort((a,b) => b[1]-a[1])[0];
  if (top && top[1] >= 25) {
    const map = {
      travel: ARCHETYPES[0], operations: ARCHETYPES[1], customer: ARCHETYPES[2],
      sales: ARCHETYPES[3], tech: ARCHETYPES[4], marketing: ARCHETYPES[6], hr: ARCHETYPES[7]
    };
    if (map[top[0]]) return map[top[0]];
  }
  return { id: "generalist", en: "Career Generalist", jp: "キャリアジェネラリスト", keys: /./ };
}

function analyse(text) {
  const t = String(text || "");
  const yrs = estimateYears(t);
  const signals = extractSignals(t);
  const skills = extractSkills(t);
  const name = extractName(t);
  const jlptFromCv = detectJlpt(t);
  const o = STATE.onboarding || {};
  const ja = Math.max(jlptFromCv, o.japanese || 0);
  const expMap = { entry: 0, "1-3": 2, "3-5": 4, "5-10": 7, "10+": 12 };
  const effectiveYrs = Math.max(yrs, expMap[o.experience] || 0);

  // Resume score (0-100)
  let resume = 30;
  if (name) resume += 6;
  if (skills.length >= 3) resume += 12;
  if (skills.length >= 6) resume += 6;
  if (effectiveYrs >= 1) resume += 10;
  if (effectiveYrs >= 3) resume += 8;
  if (/\d+%|\d+\+|increased|improved|led |managed |達成|改善/i.test(t)) resume += 12;
  if (/summary|objective|profile|職務要約|自己pr/i.test(t)) resume += 6;
  if (ja >= 3) resume += 5;
  if (ja >= 4) resume += 5;
  resume = Math.min(98, resume);

  const langScore = Math.min(100, (ja * 15) + (/english|英語|fluent/i.test(t) ? 25 : 15) + (o.english || 0) * 5);
  const expScore = Math.min(100, 30 + effectiveYrs * 6);
  const visaScore = ({ national: 100, pr: 95, spouse: 90, work_visa: 80, wh: 55, student: 40, need_sponsorship: 35 }[o.visaStatus]) || 50;
  const japan = Math.round(langScore * 0.35 + expScore * 0.25 + resume * 0.2 + visaScore * 0.2);

  const archetype = inferArchetype(signals, o.desiredRole, o.desiredIndustry, STATE.targetJobs?.careerGoal);

  // Strengths & missing
  const strengths = [];
  const missing = [];
  if (signals.travel >= 30 || /travel|tourism|tour/i.test(o.desiredIndustry || "")) strengths.push(tx("Travel / tourism background", "旅行・観光の経験"));
  if (signals.leadership >= 25 || signals.management >= 30) strengths.push(tx("Leadership / management signals", "リーダーシップ・管理経験"));
  if (signals.customer >= 30) strengths.push(tx("Customer-facing experience", "顧客対応経験"));
  if (ja >= 3) strengths.push(tx(`Japanese ${JA_LABELS[ja] || ja}`, `日本語 ${JA_LABELS[ja] || ja}`));
  if (skills.length >= 4) strengths.push(tx("Solid tool / skill set", "実務ツール・スキル"));
  if (!strengths.length) strengths.push(tx("Transferable professional experience", "汎用的な職務経験"));

  if (ja < 3 && (o.desiredIndustry || "").match(/travel|tourism|hospitality|hotel/i)) missing.push(tx("Japanese N3+ recommended", "日本語N3以上推奨"));
  if (signals.leadership < 20 && /manager|lead|director|ops/i.test(o.desiredRole || "")) missing.push(tx("Leadership examples on resume", "履歴書のリーダーシップ実績"));
  if (signals.product < 15 && /product/i.test(o.desiredRole || "")) missing.push(tx("Product ownership experience", "プロダクトオーナー経験"));
  if (skills.length < 3) missing.push(tx("More concrete skills & tools", "具体的なスキル・ツール"));
  if (resume < 60) missing.push(tx("Quantified achievements", "数値化された実績"));

  const dna = {
    signals,
    yrs: effectiveYrs,
    ja,
    jlpt: JA_LABELS[ja] || "",
    skills,
    archetype,
    level: effectiveYrs >= 10 ? 5 : effectiveYrs >= 5 ? 4 : effectiveYrs >= 3 ? 3 : effectiveYrs >= 1 ? 2 : 1,
    locationPref: null,
    visaNeeded: ["need_sponsorship","student","wh"].includes(o.visaStatus),
    visaStatus: o.visaStatus
  };

  return {
    name,
    yrs: effectiveYrs,
    jlpt: JA_LABELS[ja] || "",
    skills,
    strengths,
    missing,
    dna,
    scores: {
      resume,
      japan,
      language: Math.round(langScore),
      experience: Math.round(expScore),
      visa: visaScore,
      readiness: Math.round(resume * 0.4 + langScore * 0.3 + expScore * 0.3)
    }
  };
}

function buildTargetDNA(ana) {
  const o = STATE.onboarding || {};
  const role = (o.desiredRole || "").trim() || "Target Role";
  const industry = o.desiredIndustry || "";
  const current = ana?.dna?.archetype
    ? (STATE.settings.lang === "jp" ? ana.dna.archetype.jp : ana.dna.archetype.en)
    : (ana?.name || "Professional");

  // Infer a more specific current identity from CV signals
  let currentIdentity = current;
  const sig = ana?.dna?.signals || {};
  if (sig.travel >= 40) currentIdentity = tx("Travel Specialist", "旅行スペシャリスト");
  else if (sig.operations >= 40) currentIdentity = tx("Operations Coordinator", "オペレーションコーディネーター");
  else if (sig.customer >= 40) currentIdentity = tx("Customer Success Associate", "カスタマーサクセス担当");
  else if (sig.sales >= 40) currentIdentity = tx("Sales Professional", "営業プロフェッショナル");
  else if (sig.management >= 40) currentIdentity = tx("Team Lead", "チームリーダー");

  const gaps = [...(ana?.missing || [])];
  if (o.japanese < 4 && /japan|tokyo|client/i.test(role + industry)) {
    if (!gaps.some(g => /N2|N3|Japanese/i.test(g))) gaps.push(tx("Japanese N2 for client-facing roles", "顧客対応には日本語N2"));
  }

  const learning = [];
  if (gaps.some(g => /Japanese|N2|N3/i.test(g))) learning.push(tx("JLPT study plan (N3→N2)", "JLPT学習計画（N3→N2）"));
  if (gaps.some(g => /Leadership|leader/i.test(g))) learning.push(tx("Lead a small project end-to-end", "小規模プロジェクトを主導"));
  if (gaps.some(g => /Product/i.test(g))) learning.push(tx("Product management fundamentals", "プロダクトマネジメント基礎"));
  if (!learning.length) learning.push(tx("Domain depth in target industry", "目標業界での専門性強化"));

  const certs = [];
  if (/travel|tourism|tour/i.test(industry + role)) certs.push("IATA / GDS basics");
  if (/project|scrum|agile/i.test(role)) certs.push("PMP or Scrum Master");
  if (/sales|crm/i.test(role)) certs.push("Salesforce Admin");
  if (o.japanese >= 1 && o.japanese < 4) certs.push("JLPT " + (JA_LABELS[Math.min(5, (o.japanese || 1) + 1)] || "N3"));

  const yearsToTransition = gaps.length >= 3 ? "2–3 years" : gaps.length >= 1 ? "6–18 months" : "Ready now";

  // Role buckets
  const immediate = [role];
  const growth = [];
  const stretch = [];
  const avoid = [];

  if (/consultant|coordinator|specialist|associate/i.test(role)) {
    growth.push(role.replace(/consultant|coordinator|specialist|associate/i, "Manager").replace(/\s+/g, " ").trim());
  } else if (/manager/i.test(role)) {
    growth.push(role);
    stretch.push(role.replace(/manager/i, "Director"));
  } else {
    growth.push("Senior " + role);
    stretch.push(role + " Lead");
  }

  if (/call.?cent|telemarket/i.test(STATE.targetJobs?.careerGoal || "")) {
    avoid.push("Call Center Agent");
  }
  if (/no coding|don't like coding|pure coding/i.test(STATE.targetJobs?.careerGoal || "")) {
    avoid.push("Pure Software Engineer");
  }
  if (!avoid.length) avoid.push("Roles far outside " + (industry || "your domain"));

  const targetMatch = Math.min(98, 50
    + (role ? 15 : 0)
    + (industry ? 10 : 0)
    + (ana?.scores?.resume || 0) * 0.15
    + (o.japanese || 0) * 3
  );

  STATE.targetDNA = {
    currentIdentity,
    targetIdentity: role,
    archetype: ana?.dna?.archetype,
    gaps: gaps.slice(0, 5),
    learning: learning.slice(0, 4),
    certifications: certs.slice(0, 3),
    timeToTransition: yearsToTransition,
    roles: {
      immediate: [...new Set(immediate)].slice(0, 4),
      growth: [...new Set(growth)].slice(0, 4),
      stretch: [...new Set(stretch)].slice(0, 3),
      avoid: [...new Set(avoid)].slice(0, 3)
    },
    targetMatch: Math.round(targetMatch),
    version: DNA_ENGINE_VERSION
  };
  return STATE.targetDNA;
}

/** V7 scoring weights */
function scoreJobMatch(job, profile, targetDNA, onboarding) {
  const text = `${job.title || ""} ${job.company || ""} ${job.description || ""}`.toLowerCase();
  const skills = profile?.skills || [];
  const o = onboarding || {};

  // Resume experience 35%
  let exp = 40;
  if (STATE.dna?.yrs >= 3) exp += 20;
  if (STATE.dna?.yrs >= 5) exp += 15;
  if (STATE.dna?.signals) {
    const top = Object.entries(STATE.dna.signals).sort((a,b) => b[1]-a[1]).slice(0, 3);
    top.forEach(([k, v]) => { if (v >= 25 && text.includes(k.slice(0, 5))) exp += 8; });
  }
  exp = Math.min(100, exp);

  // Skills 25%
  let sk = 30;
  skills.forEach(s => { if (text.includes(String(s).toLowerCase())) sk += 12; });
  sk = Math.min(100, sk);

  // Target role 15%
  let role = 30;
  const desired = (o.desiredRole || "").toLowerCase();
  if (desired) {
    desired.split(/\s+/).forEach(w => { if (w.length > 3 && text.includes(w)) role += 20; });
  }
  if (o.desiredIndustry && text.includes(o.desiredIndustry.toLowerCase())) role += 15;
  role = Math.min(100, role);

  // Language 10%
  let lang = 50;
  if (o.japanese >= 4) lang = 90;
  else if (o.japanese >= 3) lang = 75;
  else if (o.japanese >= 2) lang = 55;
  if (/japanese required|jlpt|日本語必須/i.test(text) && o.japanese < 3) lang = Math.min(lang, 35);

  // Visa 5%
  let visa = 60;
  if (["national","pr","spouse","work_visa"].includes(o.visaStatus)) visa = 95;
  else if (o.visaStatus === "need_sponsorship") visa = job.visa ? 70 : 30;
  else if (o.visaStatus === "student" || o.visaStatus === "wh") visa = 45;

  // Location 5%
  let loc = 70;
  if (/tokyo|東京/i.test(text)) loc = 90;
  if (/remote|リモート/i.test(text)) loc = 85;

  // Goals 5%
  let goals = 60;
  if (targetDNA?.targetIdentity && text.includes(String(targetDNA.targetIdentity).toLowerCase().split(" ")[0])) goals = 85;

  const total = Math.round(
    exp * 0.35 + sk * 0.25 + role * 0.15 + lang * 0.10 + visa * 0.05 + loc * 0.05 + goals * 0.05
  );

  // Why match
  const good = [];
  const miss = [];
  if (exp >= 60) good.push(tx("Relevant experience", "関連経験あり"));
  if (sk >= 55) good.push(tx("Skills overlap", "スキル一致"));
  if (role >= 55) good.push(tx("Fits target role", "希望職種に近い"));
  if (lang >= 70) good.push(tx("Language fit", "語学フィット"));
  if (exp < 45) miss.push(tx("Limited domain experience shown", "領域経験が少ない"));
  if (lang < 50) miss.push(tx("Japanese level may be low for this role", "日本語レベルが不足の可能性"));
  if (visa < 50) miss.push(tx("Visa sponsorship may be needed", "ビザサポートが必要な可能性"));

  return {
    score: Math.min(98, Math.max(20, total)),
    targetScore: Math.round(role * 0.6 + goals * 0.4),
    good: good.slice(0, 3),
    miss: miss.slice(0, 3),
    japanReady: o.japanese >= 3 && ["national","pr","spouse","work_visa"].includes(o.visaStatus)
      ? "ready"
      : o.japanese >= 2 ? "needs" : "risk"
  };
}

function runAnalysis(text, goWizard) {
  const ana = analyse(text);
  STATE.profile = {
    name: ana.name,
    skills: ana.skills,
    yrs: ana.yrs,
    jlpt: ana.jlpt,
    strengths: ana.strengths,
    missing: ana.missing
  };
  STATE.scores = ana.scores;
  STATE.dna = ana.dna;
  STATE.cvText = String(text).slice(0, 20000);
  STATE.onboarding = STATE.onboarding || defaultState().onboarding;
  STATE.onboarding.hasResume = !!(text && text.trim().length > 40);
  if (goWizard) {
    STATE.onboarding.step = 2;
    STATE.onboarding.wizardStep = 1;
    STATE.view = "onboarding";
  }
  persist();
  say(t("analysis_done"), 1);
  render();
}

function finalizeWizard() {
  // Re-run analysis with onboarding context if we have CV
  if (STATE.cvText) {
    const ana = analyse(STATE.cvText);
    STATE.profile = {
      name: ana.name || STATE.profile?.name,
      skills: ana.skills,
      yrs: ana.yrs,
      jlpt: ana.jlpt,
      strengths: ana.strengths,
      missing: ana.missing
    };
    STATE.scores = ana.scores;
    STATE.dna = ana.dna;
  } else {
    // Minimal profile from wizard only
    const ana = analyse(" ");
    STATE.profile = STATE.profile || {
      name: "",
      skills: [],
      yrs: EXP_LEVELS.find(e => e.id === STATE.onboarding.experience)?.yrs || 0,
      jlpt: JA_LABELS[STATE.onboarding.japanese] || "",
      strengths: [tx("Target role defined", "希望職種を設定済み")],
      missing: [tx("Upload a resume for deeper analysis", "詳細分析には履歴書をアップロード")]
    };
    STATE.scores = ana.scores;
    STATE.dna = ana.dna;
  }
  buildTargetDNA({ dna: STATE.dna, scores: STATE.scores, missing: STATE.profile?.missing, name: STATE.profile?.name });
  STATE.view = "dashboard";
  persist();
  say(t("analysis_done"), 1);
  render();
}
