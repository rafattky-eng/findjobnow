// FindJob Now V9.0.3 — single-file bundle (storage, i18n, data, engines, UI)
// FindJob Now V7.1 — Local storage & state
const APP_VERSION = "9.0.3";
const DNA_ENGINE_VERSION = 7;
const STORAGE_KEY = "fj2_state";

const L = (k, d) => { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } };
const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

function defaultState() {
  return {
    profile: null,
    scores: null,
    matches: null,
    dna: null,
    targetDNA: null,
    cvText: "",
    jobs: [],
    applications: { saved: [], applied: [], interview: [], offer: [], rejected: [] },
    preferences: { visaOnly: false, workType: "any", jlptMin: "", englishOnly: false, remoteOnly: false },
    settings: { lang: "en", theme: "dark" },
    view: "landing",
    onboarding: {
      step: 1, // 1=resume, 2=wizard
      wizardStep: 1, // 1-6
      hasResume: false,
      desiredRole: "",
      desiredRoles: [], // multi-select support (V7.2+)
      desiredIndustry: "", // joined string of desiredIndustries
      desiredIndustries: [], // multi-select (V7.6.0)
      experience: null,
      japanese: 0,
      visaStatus: null,
      location: "" // Tokyo | Osaka | Nagoya | Fukuoka | Remote | Any
    },
    targetJobs: { industries: [], titles: [], careerGoal: "" },
    targetCompanies: [], // company ids or names the user is tracking
    selectedRoles: null,
    journey: { goal: null, fastMode: false },
    history: {}, // { "YYYY-MM-DD": count } applications per day (V7.4)
    reported: {}, // reported/hidden source links (V7.4)
    daily: null, // { date, count } daily application counter (V7.3)
    tier: "free" // free | pro | premium (placeholder)
  };
}

function migrate(raw) {
  const s = { ...defaultState(), ...(raw || {}) };
  if (!s.onboarding) s.onboarding = defaultState().onboarding;
  if (!s.targetJobs) s.targetJobs = { industries: [], titles: [], careerGoal: "" };
  if (!s.applications) s.applications = defaultState().applications;
  if (!s.settings) s.settings = { lang: "en", theme: "dark" };
  if (!s.journey) s.journey = { goal: null, fastMode: false };
  if (!s.tier) s.tier = "free";
  if (!s.targetCompanies) s.targetCompanies = [];
  if (s.onboarding && s.onboarding.location === undefined) s.onboarding.location = "";
  if (s.onboarding && !Array.isArray(s.onboarding.desiredRoles)) {
    s.onboarding.desiredRoles = s.onboarding.desiredRole ? [s.onboarding.desiredRole] : [];
  }
  if (s.onboarding && !Array.isArray(s.onboarding.desiredIndustries)) {
    s.onboarding.desiredIndustries = s.onboarding.desiredIndustry ? [s.onboarding.desiredIndustry] : [];
  }
  if (Array.isArray(s.jobs)) s.jobs = s.jobs.filter(j => j && j.source !== "Seed"); // V7.5: removed fake seed jobs
  // Migrate V6 fields
  if (s.onboarding.experience && !["entry","1-3","3-5","5-10","10+"].includes(s.onboarding.experience)) {
    if (s.onboarding.experience === "experienced") s.onboarding.experience = "3-5";
  }
  return s;
}

let STATE = migrate(L(STORAGE_KEY, null));

function persist() { W(STORAGE_KEY, STATE); }

function startOver() {
  const lang = STATE.settings?.lang || "en";
  STATE = defaultState();
  STATE.settings.lang = lang;
  clearTimeout(window._toastTimer);
  document.getElementById("toast")?.classList.remove("show");
  persist();
  render();
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `findjobnow-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  say(t("backup_ok"), 1);
}

function restoreBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      STATE = migrate(data);
      persist();
      say(t("restored"), 1);
      render();
    } catch {
      say(t("restore_fail"), 0);
    }
  };
  reader.readAsText(file);
}
// FindJob Now V7.1 — EN / JP i18n
const I18N = {
  en: {
    nav_home: "Home", nav_jobs: "Jobs", nav_tools: "Tools", nav_tracker: "Tracker",
    start_here: "START HERE",
    upload_cv: "Upload Resume",
    paste_cv: "Paste Resume Text",
    skip_cv: "Continue without resume",
    or: "or",
    hero_sub: "Career intelligence for working in Japan. Private. No sign-up.",
    honesty: "Rule-based matching · No cloud AI · Data stays on this device",
    step_resume: "Resume",
    step_target: "Career Target",
    wizard_role: "What role do you want?",
    wizard_role_ph: "e.g. Travel Operations Manager",
    wizard_industry: "Which industry?",
    wizard_exp: "Experience level",
    wizard_ja: "Japanese level",
    wizard_visa: "Visa status",
    wizard_location: "Where do you want to work?",
    next: "Next →",
    back: "← Back",
    see_results: "See my results →",
    find_jobs: "Find Jobs",
    improve_resume: "Improve Resume",
    interview_practice: "Interview Practice",
    strengths: "Strengths",
    skill_gaps: "Skill Gaps",
    next_action: "Next Action",
    current: "Current",
    target: "Target",
    match: "Match",
    readiness: "Readiness",
    japan_fit: "Japan Fit",
    immediate: "Immediate",
    growth: "Growth",
    stretch: "Stretch",
    avoid: "Avoid",
    why_match: "Why this match?",
    good_match: "Good match",
    missing: "Missing",
    apply: "Apply",
    save: "Save",
    view_details: "View details",
    edit_target: "Edit target",
    ats_score: "ATS Score",
    missing_kw: "Missing keywords",
    rewrite: "Rewrite suggestions",
    achievement: "Achievement builder",
    backup_ok: "Backup downloaded",
    restored: "Progress restored",
    restore_fail: "Could not restore file",
    reading: "Reading resume…",
    analysis_done: "Analysis complete",
    pick_role: "Please select or enter at least one desired role",
    pick_industry: "Please select an industry",
    pick_exp: "Please select experience level",
    pick_ja: "Please select Japanese level",
    pick_visa: "Please select visa status",
    pick_location: "Please select a location preference",
    no_jobs: "No matches yet. Tap “Refresh live matches” or open Japan Boards to search & apply.",
    japan_ready: "Japan Ready",
    needs_n3: "Needs N3+",
    visa_challenge: "Visa Challenge",
    days_ago: "d ago",
    follow_up: "Follow up",
    install_title: "Install FindJob Now",
    install_1: "Tap Safari Share (square with ↑)",
    install_2: "Tap “Add to Home Screen”",
    install_3: "Open it like an app",
    free_tier: "Free",
    pro_tier: "Pro",
    premium_tier: "Premium",
    coming_soon: "Coming soon",
    company_directory: "Company Directory",
    foreign_friendly: "Foreigner-friendly",
    japanese_companies: "Japanese companies",
    target_companies: "Target Companies",
    add_target: "Add to targets",
    remove_target: "Remove",
    culture_tips: "Business Culture",
    visa_deep: "Visa Deep-dive",
    jp_resume: "Japanese Resume",
    jlpt_resources: "JLPT Resources",
    interview_prep: "Interview Prep",
    salary_benchmarks: "Salary Benchmarks",
    tokyo_filter: "Tokyo focus",
    interview_countdown: "Interview countdown",
    follow_up_template: "Follow-up template",
    days_until: "days until interview",
    copy_template: "Copy template",
    companies_tracked: "companies tracked",
    tokyo_areas: "Tokyo areas",
    location_pref: "Location preference"
  },
  jp: {
    nav_home: "ホーム", nav_jobs: "求人", nav_tools: "ツール", nav_tracker: "管理",
    start_here: "ここから開始",
    upload_cv: "履歴書をアップロード",
    paste_cv: "テキストを貼り付け",
    skip_cv: "履歴書なしで続ける",
    or: "または",
    hero_sub: "日本で働くためのキャリア知能。プライベート。登録不要。",
    honesty: "ルールベース照合 · クラウドAIなし · データはこの端末のみ",
    step_resume: "履歴書",
    step_target: "キャリア目標",
    wizard_role: "希望の職種は？",
    wizard_role_ph: "例: 旅行オペレーションマネージャー",
    wizard_industry: "希望の業界は？",
    wizard_exp: "経験レベル",
    wizard_ja: "日本語レベル",
    wizard_visa: "ビザ状況",
    wizard_location: "希望の勤務地は？",
    next: "次へ →",
    back: "← 戻る",
    see_results: "結果を見る →",
    find_jobs: "求人を探す",
    improve_resume: "履歴書を改善",
    interview_practice: "面接練習",
    strengths: "強み",
    skill_gaps: "スキルギャップ",
    next_action: "次のアクション",
    current: "現在",
    target: "目標",
    match: "マッチ",
    readiness: "準備度",
    japan_fit: "日本適合",
    immediate: "今すぐ",
    growth: "成長",
    stretch: "ストレッチ",
    avoid: "避ける",
    why_match: "マッチ理由",
    good_match: "良い点",
    missing: "不足",
    apply: "応募",
    save: "保存",
    view_details: "詳細を見る",
    edit_target: "目標を編集",
    ats_score: "ATSスコア",
    missing_kw: "不足キーワード",
    rewrite: "書き換え提案",
    achievement: "実績ビルダー",
    backup_ok: "バックアップを保存しました",
    restored: "復元しました",
    restore_fail: "復元に失敗しました",
    reading: "読み込み中…",
    analysis_done: "分析完了",
    pick_role: "希望職種を1つ以上選択または入力してください",
    pick_industry: "業界を選択してください",
    pick_exp: "経験レベルを選択してください",
    pick_ja: "日本語レベルを選択してください",
    pick_visa: "ビザ状況を選択してください",
    pick_location: "勤務地を選択してください",
    no_jobs: "マッチがありません。「ライブマッチを更新」を押すか、日本ボードから検索・応募してください。",
    japan_ready: "日本準備OK",
    needs_n3: "N3以上が必要",
    visa_challenge: "ビザ要確認",
    days_ago: "日前",
    follow_up: "フォローアップ",
    install_title: "FindJob Nowをインストール",
    install_1: "Safariの共有ボタンをタップ",
    install_2: "「ホーム画面に追加」をタップ",
    install_3: "アプリアイコンから起動",
    free_tier: "無料",
    pro_tier: "Pro",
    premium_tier: "Premium",
    coming_soon: "近日公開",
    company_directory: "企業ディレクトリ",
    foreign_friendly: "外国人歓迎",
    japanese_companies: "日系企業",
    target_companies: "ターゲット企業",
    add_target: "ターゲットに追加",
    remove_target: "削除",
    culture_tips: "ビジネス文化",
    visa_deep: "ビザ詳細",
    jp_resume: "日本語履歴書",
    jlpt_resources: "JLPTリソース",
    interview_prep: "面接準備",
    salary_benchmarks: "年収ベンチマーク",
    tokyo_filter: "東京フォーカス",
    interview_countdown: "面接カウントダウン",
    follow_up_template: "フォローアップテンプレート",
    days_until: "日後に面接",
    copy_template: "テンプレートをコピー",
    companies_tracked: "社を追跡中",
    tokyo_areas: "東京エリア",
    location_pref: "勤務地希望"
  }
};

function t(key) {
  const lang = (STATE?.settings?.lang) || "en";
  return (I18N[lang] && I18N[lang][key]) || (I18N.en[key]) || key;
}

function tx(en, jp) {
  return ((STATE?.settings?.lang) === "jp") ? jp : en;
}

function setLang(lang) {
  STATE.settings.lang = lang;
  persist();
  document.documentElement.lang = lang === "jp" ? "ja" : "en";
  render();
}
// FindJob Now V7.1 — Japan-centric data (Tokyo + foreigner focus)

const FOREIGNER_FRIENDLY_COMPANIES = [
  { id: "rakuten", name: "Rakuten", type: "foreign-friendly", industry: "E-commerce / Tech", tokyo: true, visa: true, note: "English-friendly HQ, global teams" },
  { id: "mercari", name: "Mercari", type: "foreign-friendly", industry: "Marketplace / Tech", tokyo: true, visa: true, note: "Strong English culture, international hires" },
  { id: "google_jp", name: "Google Japan", type: "foreign-friendly", industry: "Tech", tokyo: true, visa: true, note: "Tokyo office, sponsorship common" },
  { id: "amazon_jp", name: "Amazon Japan", type: "foreign-friendly", industry: "E-commerce / Tech", tokyo: true, visa: true, note: "Large ops & tech roles, visa support" },
  { id: "microsoft_jp", name: "Microsoft Japan", type: "foreign-friendly", industry: "Tech", tokyo: true, visa: true, note: "Enterprise & cloud roles" },
  { id: "apple_jp", name: "Apple Japan", type: "foreign-friendly", industry: "Tech / Retail", tokyo: true, visa: true, note: "Retail + corporate positions" },
  { id: "ibm_jp", name: "IBM Japan", type: "foreign-friendly", industry: "Tech / Consulting", tokyo: true, visa: true, note: "Consulting and tech services" },
  { id: "accenture_jp", name: "Accenture Japan", type: "foreign-friendly", industry: "Consulting", tokyo: true, visa: true, note: "Global consulting, English projects" },
  { id: "deloitte_jp", name: "Deloitte Japan", type: "foreign-friendly", industry: "Consulting", tokyo: true, visa: true, note: "Audit, consulting, tech" },
  { id: "pwc_jp", name: "PwC Japan", type: "foreign-friendly", industry: "Consulting", tokyo: true, visa: true, note: "Professional services" },
  { id: "ey_jp", name: "EY Japan", type: "foreign-friendly", industry: "Consulting", tokyo: true, visa: true, note: "Assurance & advisory" },
  { id: "kpmg_jp", name: "KPMG Japan", type: "foreign-friendly", industry: "Consulting", tokyo: true, visa: true, note: "Audit and advisory" },
  { id: "line", name: "LINE / LY Corporation", type: "foreign-friendly", industry: "Tech / Messaging", tokyo: true, visa: true, note: "Communication platform, tech roles" },
  { id: "smartnews", name: "SmartNews", type: "foreign-friendly", industry: "Tech / Media", tokyo: true, visa: true, note: "News app, English-friendly" },
  { id: "indeed_jp", name: "Indeed Japan", type: "foreign-friendly", industry: "HR Tech", tokyo: true, visa: true, note: "Job platform, sales & tech" },
  { id: "recruit", name: "Recruit Holdings", type: "japanese", industry: "HR / Media", tokyo: true, visa: true, note: "Large HR group, some English roles" },
  { id: "softbank", name: "SoftBank", type: "japanese", industry: "Telecom / Tech", tokyo: true, visa: true, note: "Telecom and investment" },
  { id: "sony", name: "Sony", type: "japanese", industry: "Electronics / Entertainment", tokyo: true, visa: true, note: "Global brand, mixed English" },
  { id: "toyota", name: "Toyota", type: "japanese", industry: "Automotive", tokyo: false, visa: true, note: "HQ Aichi; Tokyo offices exist" },
  { id: "honda", name: "Honda", type: "japanese", industry: "Automotive", tokyo: true, visa: true, note: "Engineering and sales" },
  { id: "panasonic", name: "Panasonic", type: "japanese", industry: "Electronics", tokyo: true, visa: true, note: "Consumer electronics" },
  { id: "hitachi", name: "Hitachi", type: "japanese", industry: "Conglomerate / Tech", tokyo: true, visa: true, note: "IT and infrastructure" },
  { id: "fujitsu", name: "Fujitsu", type: "japanese", industry: "Tech / IT Services", tokyo: true, visa: true, note: "IT services, some English teams" },
  { id: "nec", name: "NEC", type: "japanese", industry: "Tech", tokyo: true, visa: true, note: "IT and network solutions" },
  { id: "jtb", name: "JTB", type: "japanese", industry: "Travel", tokyo: true, visa: true, note: "Major travel agency, inbound focus" },
  { id: "his", name: "HIS", type: "japanese", industry: "Travel", tokyo: true, visa: true, note: "Travel and tourism, international" },
  { id: "jal", name: "Japan Airlines (JAL)", type: "japanese", industry: "Airline", tokyo: true, visa: true, note: "Airline operations & customer roles" },
  { id: "ana", name: "ANA", type: "japanese", industry: "Airline", tokyo: true, visa: true, note: "Airline, bilingual opportunities" },
  { id: "hilton_jp", name: "Hilton Japan", type: "foreign-friendly", industry: "Hospitality", tokyo: true, visa: true, note: "Hotel management, English OK" },
  { id: "marriott_jp", name: "Marriott Japan", type: "foreign-friendly", industry: "Hospitality", tokyo: true, visa: true, note: "International hotel brand" },
  { id: "hyatt_jp", name: "Hyatt Japan", type: "foreign-friendly", industry: "Hospitality", tokyo: true, visa: true, note: "Luxury hotels, bilingual staff" },
  { id: "airbnb_jp", name: "Airbnb Japan", type: "foreign-friendly", industry: "Travel / Tech", tokyo: true, visa: true, note: "Platform operations" },
  { id: "booking_jp", name: "Booking.com Japan", type: "foreign-friendly", industry: "Travel / Tech", tokyo: true, visa: true, note: "Travel tech, sales & CS" },
  { id: "expedia_jp", name: "Expedia Japan", type: "foreign-friendly", industry: "Travel / Tech", tokyo: true, visa: true, note: "OTA operations" },
  { id: "unilever_jp", name: "Unilever Japan", type: "foreign-friendly", industry: "FMCG", tokyo: true, visa: true, note: "Consumer goods, marketing" },
  { id: "p&g_jp", name: "P&G Japan", type: "foreign-friendly", industry: "FMCG", tokyo: true, visa: true, note: "Marketing & sales roles" },
  { id: "nestle_jp", name: "Nestlé Japan", type: "foreign-friendly", industry: "FMCG", tokyo: true, visa: true, note: "Food & beverage" },
  { id: "cisco_jp", name: "Cisco Japan", type: "foreign-friendly", industry: "Tech / Networking", tokyo: true, visa: true, note: "Networking and sales" },
  { id: "oracle_jp", name: "Oracle Japan", type: "foreign-friendly", industry: "Tech / Enterprise", tokyo: true, visa: true, note: "Enterprise software" },
  { id: "salesforce_jp", name: "Salesforce Japan", type: "foreign-friendly", industry: "SaaS / CRM", tokyo: true, visa: true, note: "CRM, strong English culture" }
];

const TOKYO_AREAS = [
  { id: "chiyoda", en: "Chiyoda", jp: "千代田区", type: "ward" },
  { id: "chuo", en: "Chūō", jp: "中央区", type: "ward" },
  { id: "minato", en: "Minato", jp: "港区", type: "ward" },
  { id: "shinjuku", en: "Shinjuku", jp: "新宿区", type: "ward" },
  { id: "bunkyo", en: "Bunkyō", jp: "文京区", type: "ward" },
  { id: "shibuya", en: "Shibuya", jp: "渋谷区", type: "ward" },
  { id: "shinagawa", en: "Shinagawa", jp: "品川区", type: "ward" },
  { id: "meguro", en: "Meguro", jp: "目黒区", type: "ward" },
  { id: "ota", en: "Ōta", jp: "大田区", type: "ward" },
  { id: "setagaya", en: "Setagaya", jp: "世田谷区", type: "ward" },
  { id: "nakano", en: "Nakano", jp: "中野区", type: "ward" },
  { id: "suginami", en: "Suginami", jp: "杉並区", type: "ward" },
  { id: "toshima", en: "Toshima", jp: "豊島区", type: "ward" },
  { id: "kita", en: "Kita", jp: "北区", type: "ward" },
  { id: "itabashi", en: "Itabashi", jp: "板橋区", type: "ward" },
  { id: "nerima", en: "Nerima", jp: "練馬区", type: "ward" },
  { id: "yokohama", en: "Yokohama", jp: "横浜", type: "commutable" },
  { id: "kawasaki", en: "Kawasaki", jp: "川崎", type: "commutable" },
  { id: "saitama", en: "Saitama City", jp: "さいたま市", type: "commutable" },
  { id: "chiba", en: "Chiba City", jp: "千葉市", type: "commutable" }
];

const LOCATION_OPTS = [
  { id: "Tokyo", en: "Tokyo", jp: "東京" },
  { id: "Osaka", en: "Osaka", jp: "大阪" },
  { id: "Nagoya", en: "Nagoya", jp: "名古屋" },
  { id: "Fukuoka", en: "Fukuoka", jp: "福岡" },
  { id: "Remote", en: "Remote", jp: "リモート" },
  { id: "Any", en: "Any / Flexible", jp: "どこでも可" }
];

const SALARY_BENCHMARKS = {
  "Travel Consultant": { entry: [280, 350], mid: [350, 480], senior: [480, 650], unit: "万円" },
  "Tour Coordinator": { entry: [300, 380], mid: [380, 520], senior: [520, 700], unit: "万円" },
  "Travel Operations Manager": { entry: [400, 500], mid: [500, 700], senior: [700, 950], unit: "万円" },
  "Customer Success Manager": { entry: [400, 520], mid: [520, 720], senior: [720, 1000], unit: "万円" },
  "Hospitality Manager": { entry: [350, 450], mid: [450, 620], senior: [620, 850], unit: "万円" },
  "Project Manager": { entry: [450, 580], mid: [580, 800], senior: [800, 1100], unit: "万円" },
  "Software Engineer": { entry: [450, 600], mid: [600, 900], senior: [900, 1400], unit: "万円" },
  "Marketing Manager": { entry: [400, 520], mid: [520, 750], senior: [750, 1050], unit: "万円" },
  "Sales Manager": { entry: [400, 550], mid: [550, 800], senior: [800, 1200], unit: "万円" },
  "HR / Recruiter": { entry: [350, 450], mid: [450, 650], senior: [650, 900], unit: "万円" },
  "default": { entry: [320, 420], mid: [420, 600], senior: [600, 850], unit: "万円" }
};

const BUSINESS_CULTURE_TIPS = [
  {
    id: "hou-ren-sou",
    en: "Hō-Ren-Sō (報連相)",
    jp: "報連相",
    tip_en: "Report, Contact, Consult. Keep managers informed proactively — never let them hear news from someone else first.",
    tip_jp: "報告・連絡・相談。上司に先に知らせる習慣を。他の人から聞くことがないように。"
  },
  {
    id: "nemawashi",
    en: "Nemawashi (根回し)",
    jp: "根回し",
    tip_en: "Lay the groundwork before formal meetings. Talk to stakeholders one-by-one so the meeting becomes confirmation, not debate.",
    tip_jp: "正式な会議の前に関係者と個別に根回し。会議は確認の場にする。"
  },
  {
    id: "meishi",
    en: "Meishi exchange (名刺交換)",
    jp: "名刺交換",
    tip_en: "Receive the card with both hands, read it carefully, place it on the table during the meeting. Never write on or put a card in your back pocket.",
    tip_jp: "両手で受け取り、丁寧に読み、会議中はテーブルに。裏面に書き込んだり後ろポケットに入れない。"
  },
  {
    id: "punctuality",
    en: "Punctuality & time",
    jp: "時間厳守",
    tip_en: "Arrive 5–10 minutes early. Being on time is late. Cancel or reschedule as early as possible if needed.",
    tip_jp: "5〜10分前到着が基本。「時間通り」は遅い。変更はできるだけ早く。"
  },
  {
    id: "hierarchy",
    en: "Hierarchy & titles",
    jp: "上下関係と役職",
    tip_en: "Address people by family name + san (or title). Seniority and title matter in seating, speaking order, and decision flow.",
    tip_jp: "姓＋さん（または役職）で呼ぶ。席順・発言順・意思決定に上下関係が影響する。"
  },
  {
    id: "group_harmony",
    en: "Wa (和) — group harmony",
    jp: "和",
    tip_en: "Direct confrontation is avoided. Disagreement is often soft or indirect. Read the air (空気を読む) and protect group face.",
    tip_jp: "直接の対立は避ける。反対意見は柔らかく。空気を読み、場の面子を守る。"
  },
  {
    id: "after_work",
    en: "Nomikai & after-work",
    jp: "飲み会",
    tip_en: "Informal drinking gatherings build trust. Participation is valued; you do not need to drink alcohol, but showing up matters.",
    tip_jp: "飲み会は信頼構築の場。参加が重視される。飲まなくても出席は大事。"
  },
  {
    id: "apology",
    en: "Apology culture",
    jp: "謝罪の文化",
    tip_en: "A sincere apology (sumimasen / moushiwake arimasen) often resets a situation faster than long explanations. Own the issue first.",
    tip_jp: "誠実な謝罪が説明より早く状況をリセットする。まず責任を認める。"
  }
];

const JLPT_RESOURCES = [
  { level: "N5–N4", items: ["Genki I & II", "Minna no Nihongo", "Tae Kim Guide", "Anki core decks", "NHK Easy News (simple)"] },
  { level: "N3", items: ["Tobira", "Sou Matome N3 series", "Try! N3", "NHK News Web Easy", "Shadowing practice"] },
  { level: "N2", items: ["Shin Kanzen Master N2", "Sou Matome N2", "Japanese podcasts (News, Bilingual)", "Business Japanese texts"] },
  { level: "N1", items: ["Shin Kanzen Master N1", "Authentic news (Asahi, NHK)", "Novels / business reports", "JLPT official practice"] },
  { level: "General", items: ["jlpt.jp (official)", "Wanikani / Anki", "Italki / HelloTalk for speaking", "JapanesePod101"] }
];

const JP_RESUME_GUIDE = [
  { title_en: "Rirekisho (履歴書)", title_jp: "履歴書", body_en: "Standard 1–2 page form. Use the official template. Photo (suit, neutral background), education & work history in reverse chronological order, certifications, reason for applying.", body_jp: "1〜2枚の定型用紙。写真（スーツ・無地背景）、学歴・職歴は新しい順、資格、志望動機。" },
  { title_en: "Shokumu keirekisho (職務経歴書)", title_jp: "職務経歴書", body_en: "Free-format career summary (2–3 pages). Achievements with numbers, skills, projects. More important for mid-career hires than the rirekisho.", body_jp: "自由形式の職務要約（2〜3枚）。数値付き実績、スキル、プロジェクト。中途採用では履歴書より重要。" },
  { title_en: "Photo & format", title_jp: "写真と形式", body_en: "Color photo, upper body, plain background, taken within 3 months. Handwritten is traditional but typed is widely accepted for foreign applicants.", body_jp: "カラー・上半身・無地背景・3ヶ月以内。手書きが伝統だが外国人はPC作成も広く受け入れられる。" },
  { title_en: "Dates & seals", title_jp: "日付と印", body_en: "Use Japanese era or Western year consistently. Hanko (name stamp) is still common on paper submissions; digital applications often skip it.", body_jp: "和暦か西暦で統一。紙提出ではハンコが一般的。デジタル応募では省略されることが多い。" }
];

const VISA_DEEP_DIVE = [
  { id: "engineer", en: "Engineer / Specialist in Humanities / International Services", jp: "技術・人文知識・国際業務", body_en: "Most common work visa for office, tech, marketing, tourism coordination, language-related roles. Requires relevant degree or 10+ years experience. Sponsorship by employer.", body_jp: "オフィス・技術・マーケ・観光・語学関連で最も一般的。関連学位または10年以上の経験。雇用主のスポンサーが必要。" },
  { id: "highly_skilled", en: "Highly Skilled Professional", jp: "高度専門職", body_en: "Points-based (70+). Faster path to permanent residency (1–3 years). Attractive for senior talent; salary and education weigh heavily.", body_jp: "ポイント制（70点以上）。永住への近道（1〜3年）。シニア人材向け。年収と学歴が大きく影響。" },
  { id: "specified", en: "Specified Skilled Worker", jp: "特定技能", body_en: "For designated industries (hospitality, caregiving, construction, etc.). Skills test + Japanese test. Route for practical roles.", body_jp: "特定産業（宿泊・介護・建設など）。技能試験＋日本語試験。実務職向けルート。" },
  { id: "student_change", en: "Student → Work change", jp: "留学からの変更", body_en: "Job offer required before graduation. Apply for status change. Timing and company sponsorship are critical.", body_jp: "卒業前に内定が必要。在留資格変更を申請。タイミングとスポンサーが重要。" },
  { id: "dependent", en: "Dependent / Spouse", jp: "家族滞在・配偶者", body_en: "Spouse of Japanese or work-visa holder may work with permission. Dependent of student has limits.", body_jp: "日本人・就労ビザ配偶者は許可を得て就労可。留学生の家族は制限あり。" }
];
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

  // Target role 15% (supports multi-role titles)
  let role = 30;
  const titles = (STATE.targetJobs?.titles || []).length
    ? STATE.targetJobs.titles
    : (Array.isArray(o.desiredRoles) && o.desiredRoles.length ? o.desiredRoles : [o.desiredRole || ""]);
  titles.forEach(t0 => {
    const desired = String(t0 || "").toLowerCase();
    if (!desired) return;
    desired.split(/\s+/).forEach(w => { if (w.length > 3 && text.includes(w)) role += 14; });
    if (text.includes(desired.slice(0, 18))) role += 10;
  });
  if ((o.desiredIndustries || []).some(x => text.includes(x.toLowerCase()))) role += 15;
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
  // Ensure multi-role titles are set
  const o = STATE.onboarding || {};
  if (Array.isArray(o.desiredRoles) && o.desiredRoles.length) {
    STATE.targetJobs.titles = o.desiredRoles.slice(0, 5);
    o.desiredRole = o.desiredRoles[0];
  } else if (o.desiredRole) {
    STATE.targetJobs.titles = [o.desiredRole];
  }
  buildTargetDNA({ dna: STATE.dna, scores: STATE.scores, missing: STATE.profile?.missing, name: STATE.profile?.name });
  // Auto-add foreigner-friendly companies into targets
  if (typeof autoSuggestTargetCompanies === "function") autoSuggestTargetCompanies();
  STATE.view = "dashboard";
  persist();
  say(t("analysis_done"), 1);
  render();
  // Kick off live job search in background so Matches tab is populated
  if (typeof searchLiveJobs === "function") {
    setTimeout(() => searchLiveJobs(), 400);
  }
}
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
    visa: /visa sponsorship (available|provided)|will sponsor|sponsorship available|ビザサポートあり/i.test(`${raw.title} ${raw.description || ""}`),
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
      <span class="badge source">${esc(job.applicationMethod || "Application method not verified")}</span>
      ${job.language ? `<span class="badge source">${esc(job.language)}</span>` : ""}
    </div>
    ${job.language === "Japanese" || job.language === "English / Unknown" ? `<p class="sub" style="margin:6px 0">${tx("Original page language may differ from app language. Automatic page translation is external; verify details with the employer.", "求人ページの言語はアプリ設定と異なる場合があります。外部の自動翻訳を利用し、内容を雇用主に確認してください。")}</p><a class="chip" href="${esc(safeUrl("https://translate.google.com/translate?sl=auto&tl=" + (STATE.settings.lang === "jp" ? "ja" : "en") + "&u=" + encodeURIComponent(job.url)))}" target="_blank" rel="noopener noreferrer">${STATE.settings.lang === "jp" ? "日本語に翻訳（外部）" : "Translate page (external)"}</a>` : ""}
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
      <a class="btn primary sm" href="${esc(safeUrl(job.url))}" target="_blank" rel="noopener noreferrer">${tx("Open original vacancy", "元の求人を開く")}</a>
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
// FindJob Now V7.3 — Easy Apply / Agencies / SME sources + Daily Plan + Application Note
// q = search URL prefix (role appended). Where no reliable search URL exists, q is omitted and the site home opens.

const EASY_APPLY_SOURCES = [
  { id: "linkedin", name: "LinkedIn Easy Apply", url: "https://www.linkedin.com/jobs/", q: "https://www.linkedin.com/jobs/search/?location=Japan&f_AL=true&keywords=", tags: ["easy", "upload"], en: "Use Easy Apply filter. Many Japan roles accept 1-click or CV upload. Verify each vacancy.", jp: "Easy Applyフィルターを使用。日本の求人の多くが1クリックまたは履歴書アップロード対応。求人ごとに確認。" },
  { id: "indeed", name: "Indeed Japan (Indeed Apply)", url: "https://jp.indeed.com/", q: "https://jp.indeed.com/jobs?q=", tags: ["easy", "upload"], en: "Indeed Apply on many listings — upload CV once and apply quickly. Others open employer site.", jp: "Indeed Apply対応求人が多い。履歴書を一度アップロードして素早く応募。他は企業サイトへ。" },
  { id: "careercross", name: "CareerCross", url: "https://www.careercross.com/en/", q: "https://www.careercross.com/en/job-search?keywords=", tags: ["upload", "bilingual"], en: "Create profile + upload resume. Recruiters and companies can contact you for bilingual roles.", jp: "プロフィール作成＋履歴書アップロード。バイリンガル求人でリクルーター・企業から連絡あり。" },
  { id: "daijob", name: "Daijob", url: "https://www.daijob.com/en/", q: "https://www.daijob.com/jobs/search?job_search_form_with_keyword%5Bkeyword%5D=", tags: ["upload", "bilingual"], en: "Strong resume database. Upload once; recruiters search and contact you.", jp: "履歴書データベースが強い。一度アップロードするとリクルーターが検索・連絡。" },
  { id: "gaijinpot", name: "GaijinPot Jobs", url: "https://jobs.gaijinpot.com/en/", q: "https://jobs.gaijinpot.com/job/index/lang/en?job_key=", tags: ["upload", "foreign", "easy"], en: "Foreigner-focused. Many simple apply / CV upload flows.", jp: "外国人向け。簡単な応募・履歴書アップロードが多い。" },
  { id: "jobsinjapan", name: "Jobs in Japan", url: "https://jobsinjapan.com/", tags: ["easy", "upload", "foreign"], en: "Simple applications and resume upload for foreign residents.", jp: "在日外国人向けの簡単応募・履歴書アップロード。" },
  { id: "wexpats", name: "WeXpats Jobs", url: "https://we-xpats.com/en/job/as/jp", tags: ["upload", "foreign"], en: "Profile + resume for foreign job seekers in Japan.", jp: "外国人求職者向けプロフィール＋履歴書登録。" },
  { id: "green", name: "Green (IT / startup)", url: "https://www.green-japan.com/", tags: ["upload", "sme"], en: "IT & startup. Profile system with resume; companies contact you.", jp: "IT・スタートアップ。プロフィール＋履歴書。企業から連絡。" },
  { id: "wantedly", name: "Wantedly", url: "https://www.wantedly.com/", q: "https://www.wantedly.com/projects?q=", tags: ["sme", "easy"], en: "Often “talk to us” / casual apply. Good for startups; not always full CV upload.", jp: "「話を聞きに行きたい」型が多い。スタートアップ向き。フル履歴書アップロードではない場合あり。" },
  { id: "tokyodev", name: "TokyoDev", url: "https://www.tokyodev.com/", q: "https://www.tokyodev.com/jobs?q=", tags: ["upload", "foreign"], en: "English-friendly tech jobs in Japan. Many accept direct CV / apply form.", jp: "英語歓迎の日本テック求人。直接履歴書・応募フォームが多い。" },
  { id: "japandev", name: "Japan Dev", url: "https://japan-dev.com/", q: "https://japan-dev.com/jobs?q=", tags: ["upload", "foreign"], en: "Developer jobs with clear apply / CV paths.", jp: "開発者向け。明確な応募・履歴書ルート。" },
  { id: "workjapan", name: "WORK JAPAN", url: "https://workjapan.jp/", tags: ["upload", "foreign"], en: "Jobs for foreigners; profile and apply flows.", jp: "外国人向け求人。プロフィール・応募フローあり。" },
  { id: "careerjet", name: "Careerjet Japan", url: "https://www.careerjet.jp/", q: "https://www.careerjet.jp/search/jobs?s=", tags: ["upload"], en: "Aggregator — many listings lead to employer apply / CV forms.", jp: "集約サイト。多くの求人が企業の応募・履歴書フォームへ。" },
  { id: "glassdoor", name: "Glassdoor Japan", url: "https://www.glassdoor.com/Job/japan-jobs-SRCH_IL.0,5_IN123.htm", tags: ["easy", "upload"], en: "Some Easy Apply style and CV upload options (availability varies).", jp: "Easy Apply風・履歴書アップロードがある場合あり（求人による）。" },
  { id: "reed", name: "Reed Japan (if available)", url: "https://www.reedglobal.com/en-jp", tags: ["upload"], en: "Recruiter-led; submit CV for matching roles.", jp: "リクルーター経由。履歴書提出でマッチング。" }
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
  ["Upload or paste your CV once in FindJob Now (stays on this device).", "FindJob Nowに履歴書を一度アップロードまたは貼り付け（この端末にのみ保存）。"],
  ["Select one or more target roles (use Select All if needed).", "1つ以上の希望職種を選択（必要ならすべて選択）。"],
  ["Search real vacancies from employer feeds, then open Japan boards that accept resume upload / Easy Apply.", "雇主フィードから実求人を検索し、履歴書アップロードやEasy Apply対応の日本求人サイトを開く。"],
  ["Apply by CV upload or email using the application note below (edit role & company first).", "下の応募文を編集してから、履歴書アップロードまたはメールで応募。"],
  ["Track every application in the Tracker tab and follow up.", "Trackerタブで応募を記録し、フォローアップする。"]
];

/* ---------- Application note ---------- */
function buildApplicationNote(lang, role, company, name) {
  const r = (role || "").trim(), co = (company || "").trim(), n = (name || "").trim();
  if (lang === "jp") {
    return `採用ご担当者様

${co ? co + "の" : "貴社の"}${r ? "「" + r + "」" : "求人"}に応募させていただきたく、ご連絡いたしました。
これまでの経験とスキルを活かし、貴社の事業に貢献できると考えております。

履歴書を添付いたしました。ご都合のよい日時に面接の機会をいただけますと幸いです。

ご検討のほど、よろしくお願いいたします。

${n}`;
  }
  return `Dear Hiring Manager,

I am writing to apply for ${r ? "the " + r + " position" : "this position"}${co ? " at " + co : ""}.

Please find my resume attached. I would welcome the opportunity to discuss how my experience can contribute to your team.

I am available for an interview at your convenience.

Thank you for your consideration.

Best regards,
${n}`;
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
// FindJob Now V7.4 — Smart job filters/flags, quick "Applied", follow-ups, streak & weekly summary,
// interview prep + keigo email templates, link health (verified / report), privacy.

const VERIFIED_IDS = ["indeed", "indeed2", "careercross", "daijob", "jobsinjapan", "gaijinpot", "wexpats", "wexpats-e", "tokyodev2", "japandev2", "enworld"];
const VERIFIED_LABEL = "2026-11";

function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

/* ---------- Daily counter + history + streak ---------- */
function bumpDaily(delta) {
  const d = getDaily();
  d.count = Math.max(0, d.count + delta);
  if (!STATE.history) STATE.history = {};
  STATE.history[d.date] = d.count;
  persist();
  return d.count;
}
function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) { const k = addDays(-i); out.push({ k, v: (STATE.history || {})[k] || 0 }); }
  return out;
}
function currentStreak() {
  const h = STATE.history || {};
  let s = 0, i = (h[addDays(0)] || 0) > 0 ? 0 : 1;
  while ((h[addDays(-i)] || 0) > 0) { s++; i++; }
  return s;
}

/* ---------- Follow-ups due ---------- */
function followUpsDue() {
  const t0 = today();
  return (STATE.applications?.applied || []).filter(i => {
    if (i.followUp) return i.followUp <= t0;
    const d = daysSince(i.appliedAt || i.savedAt);
    return d != null && d >= 5;
  });
}

/* ---------- Job flags + filters ---------- */
function jobFlags(job) {
  const o = STATE.onboarding || {};
  const text = `${job.title || ""} ${job.company || ""} ${job.description || job.desc || ""}`;
  const out = [];
  const needsJa = /japanese (is )?(required|fluent|fluency|business)|business[- ]level japanese|jlpt|\bn[1-2]\b|日本語(必須|堪能|ビジネス)/i.test(text);
  const enOk = /english (only|ok|speaking)|no japanese|without japanese|japanese not required|英語/i.test(text);
  if (needsJa && (o.japanese || 0) < 4) out.push(["warn", tx("Japanese likely required — your level is below N2", "日本語が必要な可能性 — あなたのレベルはN2未満")]);
  else if (enOk) out.push(["good", tx("English-friendly role", "英語で働ける可能性")]);
  if (job.visa) out.push(["good", tx("Visa sponsorship mentioned", "ビザ支援の記載あり")]);
  else if (o.visaStatus === "need_sponsorship") out.push(["warn", tx("Visa support not stated — ask the employer", "ビザ支援の記載なし — 確認を")]);
  if (job.remote) out.push(["good", tx("Remote possible", "リモート可")]);
  return out;
}
function jobFilterState() { if (!STATE._jf) STATE._jf = { visa: false, noJa: false, remote: false, min: 0 }; return STATE._jf; }
function filteredJobs(jobs) {
  const f = jobFilterState();
  return jobs.filter(j => {
    if (f.visa && !j.visa) return false;
    if (f.remote && !j.remote) return false;
    if (f.noJa && jobFlags(j).some(x => x[0] === "warn" && /Japanese|日本語/.test(x[1]))) return false;
    if (f.min && (j.matchScore || 0) < f.min) return false;
    return true;
  });
}
function renderJobFilters() {
  const f = jobFilterState();
  const chip = (k, label, on) => `<button type="button" class="chip ${on ? "on" : ""}" data-jf="${k}">${label}</button>`;
  return `<div class="chip-row" style="margin:10px 0 4px">
    ${chip("visa", "🛂 " + tx("Visa support", "ビザ支援"), f.visa)}
    ${chip("noJa", "🇬🇧 " + tx("No Japanese needed", "日本語不要"), f.noJa)}
    ${chip("remote", "🏠 " + tx("Remote", "リモート"), f.remote)}
    ${chip("min", "⭐ 60%+", f.min === 60)}
  </div>`;
}
function renderJobFlags(job) {
  const fl = jobFlags(job);
  return fl.length ? `<ul class="why-list" style="margin-top:8px">${fl.map(x => `<li class="${x[0] === "good" ? "good" : "miss"}">${x[0] === "good" ? "✓" : "⚠"} ${esc(x[1])}</li>`).join("")}</ul>` : "";
}

/* ---------- Progress card (Plan tab) ---------- */
function renderProgressCard() {
  const days = lastDays(7), max = Math.max(DAILY_GOAL, ...days.map(d => d.v));
  const total7 = days.reduce((a, d) => a + d.v, 0);
  const A = STATE.applications || {};
  const nApplied = (A.applied || []).length, nInt = (A.interview || []).length, nOff = (A.offer || []).length, nRej = (A.rejected || []).length;
  const sent = nApplied + nInt + nOff + nRej;
  const reply = sent ? Math.round((nInt + nOff + nRej) / sent * 100) : 0;
  const streak = currentStreak();
  const wd = ["S", "M", "T", "W", "T", "F", "S"];
  return `
  <div class="card" style="margin-top:12px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:13px;font-weight:700">${tx("📈 This week", "📈 今週")}</div>
      <strong style="color:var(--ac)">🔥 ${streak} ${tx("day streak", "日連続")}</strong>
    </div>
    <div style="display:flex;align-items:flex-end;gap:6px;height:70px;margin:10px 0 4px">
      ${days.map(d => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
        <div style="width:100%;border-radius:4px 4px 0 0;background:${d.v >= DAILY_GOAL ? "var(--ok)" : "var(--ac)"};opacity:${d.v ? 1 : .2};height:${Math.max(4, Math.round(d.v / max * 100))}%"></div>
        <span class="sub" style="font-size:10px;margin-top:2px">${wd[new Date(d.k).getDay()]}</span></div>`).join("")}
    </div>
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px">
      <span>${tx("Applications (7d)", "応募数(7日)")}: <strong>${total7}</strong></span>
      <span>${tx("Interviews", "面接")}: <strong>${nInt}</strong></span>
      <span>${tx("Reply rate", "返信率")}: <strong>${reply}%</strong></span>
    </div>
    ${sent >= 10 && reply < 10 ? `<p class="sub" style="margin-top:8px">💡 ${tx("Low replies: try SME/Startup + agencies, and tailor your note per job.", "返信が少ない場合: 中小企業・エージェントを増やし、応募文を求人ごとに調整。")}</p>` : ""}
  </div>`;
}
function renderFollowUpCard() {
  const due = followUpsDue();
  if (!due.length) return "";
  return `
  <div class="card" style="margin-top:12px;border-color:var(--ac)">
    <div style="font-size:13px;font-weight:700;color:var(--ac);margin-bottom:6px">⏰ ${tx("Follow up today", "今日フォローする")} (${due.length})</div>
    ${due.slice(0, 5).map(i => `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;padding:5px 0">
      <span style="min-width:0">${esc(i.title || "Role")} · ${esc(i.company || "")}</span>
      <span style="display:flex;gap:4px;flex-shrink:0"><button type="button" class="btn sm secondary" data-fu-note="${esc(i.id)}" style="min-height:32px;font-size:11px">✉️ ${tx("Email", "メール")}</button><button type="button" class="btn sm ghost" data-fu-snooze="${esc(i.id)}" style="min-height:32px;font-size:11px">+3d</button></span>
    </div>`).join("")}
  </div>`;
}

/* ---------- Link health ---------- */
function visibleSources(list) { return list.filter(s => !(STATE.reported || {})[s.id]); }
function renderRestoreRow(list) {
  const n = list.filter(s => (STATE.reported || {})[s.id]).length;
  return n ? `<p class="sub" style="margin-top:10px;text-align:center">${tx(`${n} reported link(s) hidden.`, `報告済みリンク${n}件を非表示中。`)} <a href="#" data-restore-links style="color:var(--ac)">${tx("Restore", "元に戻す")}</a></p>` : "";
}

/* ---------- Prep tab ---------- */
const PREP_QS = [
  ["Please introduce yourself.", "自己紹介をお願いします。", "60 seconds: background → strengths → why this role."],
  ["Why do you want to work in Japan?", "なぜ日本で働きたいのですか。", "Give a long-term reason, not just “I like Japan”."],
  ["Why our company?", "志望動機を教えてください。", "Name 1–2 specific things about the company."],
  ["What are your strengths and weaknesses?", "長所と短所を教えてください。", "Weakness + how you are improving it."],
  ["What is your Japanese level?", "日本語のレベルを教えてください。", "Be honest: JLPT level + how you use it daily."],
  ["What is your visa status?", "在留資格は何ですか。", "State type and expiry; say if you need sponsorship."],
  ["Where do you see yourself in 3–5 years?", "3〜5年後のキャリアプランは？", "Link your goal to the company’s growth."],
  ["Tell us about a difficulty you overcame.", "困難を乗り越えた経験は？", "Use situation → action → result."],
  ["What salary do you expect?", "希望年収はいくらですか。", "Give a range based on market; say you are flexible."],
  ["When can you start?", "入社可能時期はいつですか。", "Include notice period / visa change time."],
  ["Do you have any questions for us?", "何か質問はありますか。（逆質問）", "Always ask 1–2: team, onboarding, expectations."]
];
function prepTemplates(lang, role, co, name) {
  const r = role || (lang === "jp" ? "【職種】" : "[Role]"), c = co || (lang === "jp" ? "【会社名】" : "[Company]"), n = name || (lang === "jp" ? "【氏名】" : "[Your name]");
  if (lang === "jp") return [
    ["📧 応募メール", `件名：【応募】${r}の件（${n}）\n\n${c}\n採用ご担当者様\n\nはじめてご連絡いたします。${n}と申します。\n貴社の${r}の求人を拝見し、応募させていただきたくご連絡いたしました。\n履歴書・職務経歴書を添付いたしますので、ご確認いただけますと幸いです。\n\nご多忙のところ恐れ入りますが、ご検討のほど、何卒よろしくお願い申し上げます。\n\n${n}`],
    ["⏰ 選考状況の確認", `件名：【ご確認のお願い】${r}応募の件（${n}）\n\n${c}\n採用ご担当者様\n\nお世話になっております。先日${r}に応募いたしました${n}と申します。\nその後の選考状況につきまして、ご教示いただけますと幸いです。\nお忙しいところ恐縮ですが、何卒よろしくお願い申し上げます。\n\n${n}`],
    ["📅 面接日程の返信", `件名：Re: 面接日程のご連絡（${n}）\n\n${c}\n採用ご担当者様\n\nお世話になっております。${n}です。\n面接日程のご連絡をいただき、誠にありがとうございます。\n【日時】に伺います。当日はどうぞよろしくお願いいたします。\n\n${n}`],
    ["🙏 面接のお礼", `件名：面接のお礼（${n}）\n\n${c}\n採用ご担当者様\n\n本日はお忙しい中、面接のお時間をいただき、誠にありがとうございました。\nお話を伺い、貴社で${r}として貢献したいという思いがさらに強くなりました。\n引き続き、何卒よろしくお願い申し上げます。\n\n${n}`],
    ["🚪 内定辞退", `件名：内定辞退のご連絡（${n}）\n\n${c}\n採用ご担当者様\n\nこの度は内定のご連絡をいただき、誠にありがとうございます。\n慎重に検討を重ねた結果、誠に勝手ながら、今回は辞退させていただきたく存じます。\nご期待に沿えず、深くお詫び申し上げます。\n\n${n}`]
  ];
  return [
    ["📧 Application email", `Subject: Application for ${r} – ${n}\n\nDear Hiring Manager at ${c},\n\nI am writing to apply for the ${r} position. Please find my resume attached.\nI would welcome the chance to discuss how I can contribute to your team.\n\nThank you for your time and consideration.\n\nBest regards,\n${n}`],
    ["⏰ Status follow-up", `Subject: Following up – ${r} application (${n})\n\nDear Hiring Team at ${c},\n\nI applied for the ${r} position recently and wanted to follow up on the status of my application. I remain very interested and am happy to provide anything further.\n\nThank you for your time.\n\nBest regards,\n${n}`],
    ["📅 Reply to interview invite", `Subject: Re: Interview schedule – ${n}\n\nDear Hiring Team at ${c},\n\nThank you for the invitation. I confirm my availability on [date/time] and look forward to meeting you.\n\nBest regards,\n${n}`],
    ["🙏 Interview thank-you", `Subject: Thank you – ${r} interview\n\nDear Hiring Team at ${c},\n\nThank you for taking the time to interview me today. Our conversation strengthened my interest in the ${r} role and in contributing to your team.\n\nBest regards,\n${n}`],
    ["🚪 Decline an offer", `Subject: Regarding your offer – ${n}\n\nDear Hiring Team at ${c},\n\nThank you very much for the offer. After careful consideration, I must respectfully decline. I sincerely appreciate your time and wish you every success.\n\nBest regards,\n${n}`]
  ];
}
function renderPrepTab() {
  const lang = STATE._noteLang || "en";
  const role = STATE._noteRole || "", co = STATE._noteCo || "", name = STATE.profile?.name || "";
  const tpls = prepTemplates(lang, role, co, name);
  return `
  <div class="card">
    <div style="font-size:13px;font-weight:700">${tx("🎤 Interview prep & email templates", "🎤 面接準備・メールテンプレート")}</div>
    <p class="sub" style="margin-top:4px">${tx("Polite (keigo) Japanese emails and English versions. Fill role & company, then copy.", "敬語の日本語メールと英語版。職種・会社名を入力してコピー。")}</p>
  </div>
  <div class="card" style="margin-top:12px">
    <div class="tabs" style="margin-bottom:8px">
      <button type="button" class="tab ${lang === "en" ? "on" : ""}" data-notelang="en">English</button>
      <button type="button" class="tab ${lang === "jp" ? "on" : ""}" data-notelang="jp">日本語</button>
    </div>
    <input id="prepRole" class="input" type="text" placeholder="${tx("Role", "職種")}" value="${esc(role)}" style="width:100%;margin-bottom:6px">
    <input id="prepCo" class="input" type="text" placeholder="${tx("Company", "会社名")}" value="${esc(co)}" style="width:100%">
  </div>
  ${tpls.map((x, i) => `
  <div class="card" style="margin-top:10px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">${x[0]}</div>
    <textarea class="textarea" rows="7" style="width:100%" readonly id="tpl${i}">${esc(x[1])}</textarea>
    <button type="button" class="btn secondary sm" data-copy-tpl="tpl${i}" style="margin-top:6px">${tx("Copy", "コピー")}</button>
  </div>`).join("")}
  <div class="card" style="margin-top:12px">
    <div style="font-size:13px;font-weight:700;margin-bottom:8px">${tx("Common interview questions", "よくある面接質問")}</div>
    ${PREP_QS.map(q => `<div style="padding:8px 0;border-top:1px solid var(--bd)"><div style="font-size:13px;font-weight:600">${esc(q[0])}</div><div class="sub" style="font-size:12px">${esc(q[1])}</div><div style="font-size:12px;color:var(--ac);margin-top:2px">💡 ${esc(q[2])}</div></div>`).join("")}
  </div>`;
}

function renderPrivacyCard() {
  return `<div class="card" style="margin-top:12px"><div style="font-size:13px;font-weight:700;margin-bottom:4px">🔒 ${tx("Privacy", "プライバシー")}</div>
  <p class="sub">${tx("Your resume, profile and tracker stay on this device only — nothing is uploaded to our servers. Job searches send only your role keywords to public job sources. Use 💾 Backup to keep a copy; clearing browser data deletes your data. Site links open third-party websites with their own privacy policies.", "履歴書・プロフィール・トラッカーはこの端末内のみに保存され、サーバーには送信されません。求人検索は職種キーワードのみを公開求人ソースに送信します。💾バックアップでコピーを保存してください。ブラウザデータを消すとデータも消えます。外部サイトはそれぞれのプライバシーポリシーに従います。")}</p></div>`;
}

/* ---------- Wiring ---------- */
function wireBoost() {
  $$("[data-jf]").forEach(b => b.addEventListener("click", () => {
    const f = jobFilterState(), k = b.dataset.jf;
    if (k === "min") f.min = f.min === 60 ? 0 : 60; else f[k] = !f[k];
    render();
  }));
  $$("[data-job-applied]").forEach(b => b.addEventListener("click", () => {
    const job = (STATE.jobs || []).find(j => j.id === b.dataset.jobApplied);
    if (!job) return;
    const A = STATE.applications;
    if ((A.applied || []).some(x => x.id === job.id)) { say(tx("Already marked applied", "応募済みです"), 1); return; }
    for (const col of ["saved", "interview", "offer", "rejected"]) { const i = (A[col] || []).findIndex(x => x.id === job.id); if (i >= 0) A[col].splice(i, 1); }
    A.applied = A.applied || [];
    A.applied.unshift({ ...job, status: "applied", savedAt: today(), appliedAt: today(), followUp: addDays(5), notes: "", salary: "", interviewDate: "" });
    const c = bumpDaily(1);
    say(tx(`Marked applied · today ${c}/${DAILY_GOAL}`, `応募済みに記録 · 今日 ${c}/${DAILY_GOAL}`), 1);
    render();
  }));
  $$("[data-job-note]").forEach(b => b.addEventListener("click", () => {
    const job = (STATE.jobs || []).find(j => j.id === b.dataset.jobNote);
    if (!job) return;
    STATE._noteRole = job.title; STATE._noteCo = job.company; STATE._jobsTab = "easy";
    render(); window.scrollTo(0, 0);
    say(tx("Note filled for this job — edit and copy", "この求人の応募文を作成しました"), 1);
  }));
  $$("[data-report]").forEach(b => b.addEventListener("click", () => {
    if (!STATE.reported) STATE.reported = {};
    STATE.reported[b.dataset.report] = today(); persist(); render();
    say(tx("Reported & hidden. Thanks!", "報告して非表示にしました"), 1);
  }));
  $$("[data-restore-links]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); STATE.reported = {}; persist(); render(); }));
  $$("[data-fu-snooze]").forEach(b => b.addEventListener("click", () => {
    const it = findApp(b.dataset.fuSnooze); if (!it) return;
    it.followUp = addDays(3); persist(); render();
  }));
  $$("[data-fu-note]").forEach(b => b.addEventListener("click", () => {
    const it = findApp(b.dataset.fuNote); if (!it) return;
    STATE._noteRole = it.title; STATE._noteCo = it.company; STATE._jobsTab = "prep"; render(); window.scrollTo(0, 0);
  }));
  ["prepRole", "prepCo"].forEach(id => $(id)?.addEventListener("change", () => {
    STATE._noteRole = $("prepRole").value; STATE._noteCo = $("prepCo").value; render();
  }));
  $$("[data-copy-tpl]").forEach(b => b.addEventListener("click", () => {
    const ta = $(b.dataset.copyTpl); if (!ta) return;
    (navigator.clipboard?.writeText(ta.value) || Promise.reject()).then(() => say(tx("Copied", "コピーしました"), 1)).catch(() => { ta.select(); say(tx("Select & copy manually", "選択してコピーしてください"), 0); });
  }));
}
// FindJob Now V7.1 — Resume Intelligence + Interview + Japan tools

function renderTools() {
  const tool = STATE._tool || null;
  return `
  <h2>${tx("Toolkit", "ツールキット")}</h2>
  <p class="sub">${tx("11 tools: resume, interview, culture, visa, JLPT & more", "11ツール：履歴書・面接・文化・ビザ・JLPTなど")}</p>
  <div class="tool-grid">
    <button type="button" class="tool-card" data-tool="ats"><span class="icon">📊</span><span class="label">${t("ats_score")}</span></button>
    <button type="button" class="tool-card" data-tool="rewrite"><span class="icon">✍️</span><span class="label">${t("rewrite")}</span></button>
    <button type="button" class="tool-card" data-tool="achieve"><span class="icon">🏆</span><span class="label">${t("achievement")}</span></button>
    <button type="button" class="tool-card" data-tool="interview"><span class="icon">🎤</span><span class="label">${t("interview_practice")}</span></button>
    <button type="button" class="tool-card" data-tool="interviewprep"><span class="icon">📋</span><span class="label">${t("interview_prep")}</span></button>
    <button type="button" class="tool-card" data-tool="salary"><span class="icon">💰</span><span class="label">${t("salary_benchmarks")}</span></button>
    <button type="button" class="tool-card" data-tool="visa"><span class="icon">🛂</span><span class="label">${t("visa_deep")}</span></button>
    <button type="button" class="tool-card" data-tool="culture"><span class="icon">🏯</span><span class="label">${t("culture_tips")}</span></button>
    <button type="button" class="tool-card" data-tool="jpresume"><span class="icon">📝</span><span class="label">${t("jp_resume")}</span></button>
    <button type="button" class="tool-card" data-tool="jlpt"><span class="icon">📚</span><span class="label">${t("jlpt_resources")}</span></button>
    <button type="button" class="tool-card" data-tool="areas"><span class="icon">🗺</span><span class="label">${t("tokyo_areas")}</span></button>
  </div>
  <div id="toolPanel" class="tool-panel ${tool ? "" : "hidden"}"></div>
  ${renderTierNote()}
  `;
}

function renderTierNote() {
  return `
  <div class="card" style="margin-top:16px;opacity:0.85">
    <div style="font-size:12px;font-weight:700;color:var(--mu)">${tx("Plan", "プラン")}: <span style="color:var(--ac)">${t(STATE.tier + "_tier")}</span></div>
    <p class="sub" style="margin-top:6px">${tx("Pro & Premium tiers coming later — structure is ready.", "Pro・Premiumは今後対応予定。枠組みのみ準備済み。")}</p>
  </div>`;
}

function wireTools() {
  $$("[data-tool]").forEach(el => {
    el.addEventListener("click", () => {
      STATE._tool = el.dataset.tool;
      const panel = $("toolPanel");
      if (!panel) return;
      panel.classList.remove("hidden");
      panel.innerHTML = renderToolPanel(el.dataset.tool);
      wireToolPanel(el.dataset.tool);
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderToolPanel(tool) {
  if (tool === "ats") return renderAts();
  if (tool === "rewrite") return renderRewrite();
  if (tool === "achieve") return renderAchieve();
  if (tool === "interview") return renderInterview();
  if (tool === "interviewprep") return renderInterviewPrep();
  if (tool === "salary") return renderSalary();
  if (tool === "visa") return renderVisaDeep();
  if (tool === "culture") return renderCulture();
  if (tool === "jpresume") return renderJpResume();
  if (tool === "jlpt") return renderJlpt();
  if (tool === "areas") return renderTokyoAreas();
  return "";
}

function wireToolPanel(tool) {
  if (tool === "ats") {
    $("atsGo")?.addEventListener("click", () => {
      const jd = $("atsJd")?.value || "";
      const r = atsCheck(jd);
      $("atsOut").innerHTML = `
        <div class="score-grid">
          <div class="score-card"><div class="score-val">${r.score}</div><div class="score-lbl">ATS</div></div>
          <div class="score-card"><div class="score-val">${r.kwS}</div><div class="score-lbl">${tx("Keywords", "キーワード")}</div></div>
        </div>
        <h3 style="margin-top:12px">${t("missing_kw")}</h3>
        <div class="chip-row">${r.miss.slice(0, 14).map(k => `<span class="chip" style="cursor:default">${esc(k)}</span>`).join("") || "—"}</div>
        <p class="sub">${tx("Add only what is true for you.", "事実に基づくものだけ追加してください。")}</p>`;
    });
  }
  if (tool === "rewrite") {
    $("rwGo")?.addEventListener("click", () => {
      const bullet = $("rwIn")?.value || "";
      $("rwOut").innerHTML = rewriteBullet(bullet).map(b => `<div class="card" style="margin:8px 0;font-size:14px">${esc(b)}</div>`).join("");
    });
  }
  if (tool === "achieve") {
    $("achGo")?.addEventListener("click", () => {
      const raw = $("achIn")?.value || "";
      $("achOut").innerHTML = buildAchievements(raw).map(b => `<div class="card" style="margin:8px 0;font-size:14px">${esc(b)}</div>`).join("");
    });
  }
  if (tool === "interview") {
    $$("[data-iq]").forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.iq;
        $("iqList").innerHTML = interviewQuestions(cat).map((q, i) => `
          <div class="card" style="margin:8px 0">
            <div style="font-weight:700;margin-bottom:6px">${i + 1}. ${esc(q.q)}</div>
            <p class="sub">${esc(q.tip)}</p>
            <textarea class="textarea iq-ans" data-qi="${i}" rows="3" placeholder="${tx("Type your answer…", "回答を入力…")}"></textarea>
            <button type="button" class="btn secondary sm" style="margin-top:8px" data-score-iq="${i}">${tx("Score answer", "回答を採点")}</button>
            <div class="iq-score hidden" id="iqScore${i}"></div>
          </div>`).join("");
        $$("[data-score-iq]").forEach(b => {
          b.addEventListener("click", () => {
            const i = b.dataset.scoreIq;
            const ans = document.querySelector(`.iq-ans[data-qi="${i}"]`)?.value || "";
            const s = scoreAnswer(ans);
            const el = $("iqScore" + i);
            if (el) {
              el.classList.remove("hidden");
              el.innerHTML = `
                <div class="score-grid" style="margin-top:8px">
                  <div class="score-card"><div class="score-val">${s.communication}</div><div class="score-lbl">Comm</div></div>
                  <div class="score-card"><div class="score-val">${s.structure}</div><div class="score-lbl">Structure</div></div>
                  <div class="score-card"><div class="score-val">${s.confidence}</div><div class="score-lbl">Confidence</div></div>
                  <div class="score-card"><div class="score-val">${s.results}</div><div class="score-lbl">Results</div></div>
                  <div class="score-card"><div class="score-val">${s.overall}</div><div class="score-lbl">Overall</div></div>
                </div>
                <p class="sub">${esc(s.tip)}</p>`;
            }
          });
        });
      });
    });
  }
  if (tool === "interviewprep") {
    $("copyFollowUp")?.addEventListener("click", () => {
      const text = $("fuTemplate")?.textContent || "";
      navigator.clipboard?.writeText(text).then(() => say(tx("Copied", "コピーしました"), 1)).catch(() => say(tx("Copy failed", "コピー失敗"), 0));
    });
  }
}

function renderAts() {
  return `
  <h3>${t("ats_score")}</h3>
  <p class="sub">${tx("Paste a job description to check keyword coverage against your resume.", "求人票を貼り付けて履歴書とのキーワード一致を確認。")}</p>
  <textarea class="textarea" id="atsJd" rows="5" placeholder="${tx("Paste job description…", "求人票を貼り付け…")}"></textarea>
  <button type="button" class="btn primary" id="atsGo" style="margin-top:10px">${tx("Analyze", "分析")}</button>
  <div id="atsOut" style="margin-top:12px"></div>`;
}

function atsCheck(jd) {
  const cv = (STATE.cvText || "").toLowerCase();
  const words = String(jd || "").toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\s+#.]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const top = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 40).map(([w]) => w);
  const hit = top.filter(w => cv.includes(w));
  const miss = top.filter(w => !cv.includes(w));
  const kwS = top.length ? Math.round((hit.length / top.length) * 100) : 50;
  const score = Math.min(98, Math.round(kwS * 0.7 + (STATE.scores?.resume || 40) * 0.3));
  return { score, kwS, miss, hit };
}

function renderRewrite() {
  return `
  <h3>${t("rewrite")}</h3>
  <p class="sub">${tx("Paste a weak bullet — get stronger versions.", "弱い箇条書きを貼り付けて、強い表現に変換。")}</p>
  <textarea class="textarea" id="rwIn" rows="3" placeholder="${tx("e.g. Responsible for customer inquiries", "例: 顧客対応を担当")}"></textarea>
  <button type="button" class="btn primary" id="rwGo" style="margin-top:10px">${tx("Rewrite", "書き換え")}</button>
  <div id="rwOut" style="margin-top:12px"></div>`;
}

function rewriteBullet(b) {
  let s = String(b || "").trim().replace(/^[-•*\s]+/, "").replace(/\.$/, "");
  if (!s) return [tx("Paste a bullet first.", "まず箇条書きを貼り付けてください。")];
  const out = [];
  if (/responsible for|担当/i.test(s)) {
    out.push(s.replace(/responsible for/i, "Owned").replace(/担当し(た|ていました)?/, "主導した"));
    out.push("Delivered results while " + s.charAt(0).toLowerCase() + s.slice(1));
  }
  out.push("Improved outcomes by focusing on " + s.charAt(0).toLowerCase() + s.slice(1));
  out.push(s + " — resulting in measurable impact for the team.");
  if (out.length < 3) out.push("Led initiatives related to " + s);
  return [...new Set(out)].slice(0, 4);
}

function renderAchieve() {
  return `
  <h3>${t("achievement")}</h3>
  <p class="sub">${tx("Turn duties into quantified achievements.", "業務内容を数値化された実績に変換。")}</p>
  <textarea class="textarea" id="achIn" rows="3" placeholder="${tx("e.g. Handled customer inquiries", "例: 顧客からの問い合わせ対応")}"></textarea>
  <button type="button" class="btn primary" id="achGo" style="margin-top:10px">${tx("Generate", "生成")}</button>
  <div id="achOut" style="margin-top:12px"></div>`;
}

function buildAchievements(raw) {
  const s = String(raw || "").trim();
  if (!s) return [tx("Describe a duty first.", "まず業務内容を書いてください。")];
  return [
    `Handled 100+ ${s.toLowerCase().replace(/^handled |^managed |^responsible for /i, "")} weekly while maintaining 95% satisfaction.`,
    `Streamlined ${s.toLowerCase()} processes, reducing response time by ~30%.`,
    `Partnered with cross-functional teams to improve ${s.toLowerCase()}, supporting team KPIs.`,
    `Trained peers on best practices for ${s.toLowerCase()}, raising team consistency.`
  ];
}

const IQ = {
  behavioral: [
    { q: "Tell me about yourself.", tip: "Present → Past → Future in 60–90s." },
    { q: "Describe a challenge you overcame.", tip: "Use STAR: Situation, Task, Action, Result." },
    { q: "Tell me about a time you failed.", tip: "Own it, show learning, end with improvement." }
  ],
  leadership: [
    { q: "Describe a time you led a team.", tip: "Focus on influence, not just title." },
    { q: "How do you handle underperformance?", tip: "Clarity, coaching, accountability." }
  ],
  customer: [
    { q: "Tell me about a difficult customer.", tip: "Empathy → diagnosis → resolution → follow-up." },
    { q: "How do you measure customer success?", tip: "Retention, NPS, expansion — pick 1–2 metrics." }
  ],
  japan: [
    { q: "Why Japan, and why now?", tip: "Real ties + long-term plan. Show you intend to stay." },
    { q: "Why our company?", tip: "Name 1 product/value + 1 skill of yours that serves it." }
  ],
  visa: [
    { q: "Do you need visa sponsorship?", tip: "Be direct about status and timeline; show 3+ year commitment." },
    { q: "When can you start?", tip: "Notice period + realistic relocation date." }
  ],
  english: [
    { q: "Practice: Introduce your current role in English.", tip: "60 seconds, clear structure, one proof point." }
  ],
  japanese: [
    { q: "自己紹介をお願いします。", tip: "現在→過去→志望動機を60秒で。" }
  ]
};

function interviewQuestions(cat) {
  return IQ[cat] || IQ.behavioral;
}

function renderInterview() {
  const cats = [
    ["behavioral", "Behavioral"], ["leadership", "Leadership"], ["customer", "Customer Service"],
    ["japan", "Japan-Specific"], ["visa", "Visa"], ["english", "English Practice"], ["japanese", "Japanese Practice"]
  ];
  return `
  <h3>${t("interview_practice")}</h3>
  <p class="sub">${tx("Pick a category, answer, and get a simple score.", "カテゴリを選び、回答して簡易スコアを取得。")}</p>
  <div class="chip-row">
    ${cats.map(([id, label]) => `<button type="button" class="chip" data-iq="${id}">${label}</button>`).join("")}
  </div>
  <div id="iqList" style="margin-top:12px"></div>`;
}

function scoreAnswer(ans) {
  const w = String(ans || "").trim().split(/\s+/).filter(Boolean).length;
  const hasNumber = /\d+/.test(ans);
  const hasStar = /situation|task|action|result|まず|次に|結果/i.test(ans);
  const communication = Math.min(95, 40 + Math.min(w, 80));
  const structure = hasStar ? 85 : (w > 40 ? 60 : 40);
  const confidence = Math.min(90, 50 + Math.floor(w / 3));
  const results = hasNumber ? 80 : 45;
  const overall = Math.round((communication + structure + confidence + results) / 4);
  let tip = tx("Add a concrete result with a number.", "数値を含む具体的な結果を追加。");
  if (overall >= 75) tip = tx("Strong answer — keep this structure.", "良い回答です。この構成を維持。");
  else if (w < 20) tip = tx("Too short — expand with STAR.", "短すぎます。STARで広げて。");
  return { communication, structure, confidence, results, overall, tip };
}

function renderInterviewPrep() {
  const role = STATE.onboarding?.desiredRole || "the role";
  const company = (STATE.targetCompanies || [])[0]
    ? (FOREIGNER_FRIENDLY_COMPANIES.find(c => c.id === STATE.targetCompanies[0])?.name || "the company")
    : "the company";
  const template = `Dear [Hiring Manager],

Thank you for the opportunity to interview for the ${role} position at ${company}.

I enjoyed learning more about the team and the role. I remain very interested and believe my experience aligns well with what you are looking for.

Please let me know if you need any additional information. I look forward to hearing from you.

Best regards,
[Your Name]`;
  return `
  <h3>${t("interview_prep")}</h3>
  <p class="sub">${tx("Checklist + follow-up email template for Japan interviews.", "日本の面接向けチェックリストとフォローアップメール。")}</p>
  <div class="card">
    <strong>${tx("Before the interview", "面接前")}</strong>
    <ul style="margin:8px 0 0 18px;font-size:13px;color:var(--mu)">
      <li>${tx("Research company products, recent news, and values", "会社の製品・ニュース・理念を調べる")}</li>
      <li>${tx("Prepare 2–3 STAR stories with numbers", "数値付きSTAR事例を2〜3用意")}</li>
      <li>${tx("Practice self-intro in English and simple Japanese", "英語と簡単な日本語で自己紹介練習")}</li>
      <li>${tx("Arrive 10 minutes early; bring extra copies of resume", "10分前到着、履歴書の予備を持参")}</li>
      <li>${tx("Have questions ready (role, team, next steps)", "質問を用意（役割・チーム・次のステップ）")}</li>
    </ul>
  </div>
  <div class="card" style="margin-top:10px">
    <strong>${t("follow_up_template")}</strong>
    <pre id="fuTemplate" style="white-space:pre-wrap;font-size:12px;margin-top:8px;color:var(--tx)">${esc(template)}</pre>
    <button type="button" class="btn secondary sm" id="copyFollowUp" style="margin-top:8px">${t("copy_template")}</button>
  </div>`;
}

function renderSalary() {
  const role = STATE.onboarding?.desiredRole || "";
  const key = Object.keys(SALARY_BENCHMARKS).find(k => role && role.toLowerCase().includes(k.toLowerCase().split(" ")[0])) || "default";
  const b = SALARY_BENCHMARKS[key] || SALARY_BENCHMARKS.default;
  const exp = STATE.onboarding?.experience || "1-3";
  const band = exp === "entry" || exp === "1-3" ? b.entry : (exp === "3-5" || exp === "5-10" ? b.mid : b.senior);
  return `
  <h3>${t("salary_benchmarks")}</h3>
  <p class="sub">${tx("Tokyo mid-market ranges for foreign professionals (万円 / year). Not an offer.", "東京の外国人向け中間相場（万円/年）。オファーではありません。")}</p>
  <p class="sub">${tx("Role basis", "職種基準")}: <strong>${esc(key === "default" ? (role || "General") : key)}</strong></p>
  <div class="score-grid">
    <div class="score-card"><div class="score-val" style="font-size:16px">¥${band[0]}–${band[1]}万</div><div class="score-lbl">${tx("Your band", "あなたの帯")}</div></div>
  </div>
  <div class="card" style="margin-top:12px">
    <div style="font-size:12px;font-weight:700;margin-bottom:6px">${tx("Full benchmarks (Tokyo)", "東京フルベンチマーク")}</div>
    ${Object.entries(SALARY_BENCHMARKS).filter(([k]) => k !== "default").map(([name, v]) =>
      `<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--bd)">
        <span>${esc(name)}</span>
        <span class="muted">${v.entry[0]}–${v.senior[1]}万</span>
      </div>`
    ).join("")}
  </div>
  <p class="sub">${tx("Adjust for Japanese level, company size, and visa needs.", "日本語レベル・企業規模・ビザで調整。")}</p>`;
}

function renderVisaDeep() {
  const v = STATE.onboarding?.visaStatus || "need_sponsorship";
  return `
  <h3>${t("visa_deep")}</h3>
  <p class="sub">${tx("Status", "状況")}: <strong>${esc(v)}</strong> · ${tx("General information only, not legal advice.", "一般情報のみ。法的助言ではありません。")}</p>
  ${VISA_DEEP_DIVE.map(item => `
    <div class="card" style="margin:8px 0">
      <div style="font-weight:700">${tx(item.en, item.jp)}</div>
      <p class="sub" style="margin-top:4px">${tx(item.body_en, item.body_jp)}</p>
    </div>
  `).join("")}`;
}

function renderCulture() {
  return `
  <h3>${t("culture_tips")}</h3>
  <p class="sub">${tx("Eight practical tips for Japanese business culture.", "日本のビジネス文化のための8つの実践ヒント。")}</p>
  ${BUSINESS_CULTURE_TIPS.map(tip => `
    <div class="card" style="margin:8px 0">
      <div style="font-weight:700">${tx(tip.en, tip.jp)}</div>
      <p class="sub" style="margin-top:4px">${tx(tip.tip_en, tip.tip_jp)}</p>
    </div>
  `).join("")}`;
}

function renderJpResume() {
  return `
  <h3>${t("jp_resume")}</h3>
  <p class="sub">${tx("What Japanese employers expect beyond a Western CV.", "日本企業が欧米式CV以外に期待するもの。")}</p>
  ${JP_RESUME_GUIDE.map(g => `
    <div class="card" style="margin:8px 0">
      <div style="font-weight:700">${tx(g.title_en, g.title_jp)}</div>
      <p class="sub" style="margin-top:4px">${tx(g.body_en, g.body_jp)}</p>
    </div>
  `).join("")}`;
}

function renderJlpt() {
  return `
  <h3>${t("jlpt_resources")}</h3>
  <p class="sub">${tx("Study paths by level. Official site: jlpt.jp", "レベル別学習パス。公式: jlpt.jp")}</p>
  ${JLPT_RESOURCES.map(r => `
    <div class="card" style="margin:8px 0">
      <div style="font-weight:700">${esc(r.level)}</div>
      <div class="chip-row" style="margin-top:6px">${r.items.map(i => `<span class="chip" style="cursor:default">${esc(i)}</span>`).join("")}</div>
    </div>
  `).join("")}`;
}

function renderTokyoAreas() {
  const wards = TOKYO_AREAS.filter(a => a.type === "ward");
  const commute = TOKYO_AREAS.filter(a => a.type === "commutable");
  return `
  <h3>${t("tokyo_areas")}</h3>
  <p class="sub">${tx("23 wards focus + common commuting cities from the greater Tokyo area.", "23区中心 + 首都圏の通勤圏都市。")}</p>
  <div class="card">
    <div style="font-size:12px;font-weight:700;margin-bottom:6px">${tx("Key wards (selection)", "主要区（抜粋）")}</div>
    <div class="chip-row">${wards.map(a => `<span class="chip" style="cursor:default">${tx(a.en, a.jp)}</span>`).join("")}</div>
  </div>
  <div class="card" style="margin-top:10px">
    <div style="font-size:12px;font-weight:700;margin-bottom:6px">${tx("Commutable cities", "通勤圏")}</div>
    <div class="chip-row">${commute.map(a => `<span class="chip" style="cursor:default">${tx(a.en, a.jp)}</span>`).join("")}</div>
  </div>`;
}
// FindJob Now V7.1 — Application tracker with interview countdown + follow-up

const COLS = [
  { id: "saved", en: "Saved", jp: "保存" },
  { id: "applied", en: "Applied", jp: "応募済" },
  { id: "interview", en: "Interview", jp: "面接" },
  { id: "offer", en: "Offer", jp: "内定" },
  { id: "rejected", en: "Rejected", jp: "不採用" }
];

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function renderTracker() {
  const apps = STATE.applications || {};
  const interviewItems = (apps.interview || []).filter(i => i.interviewDate);
  return `
  <h2>${tx("Application Tracker", "応募管理")}</h2>
  <p class="sub">${tx("Local only. Status buttons move items. Interview dates show countdown.", "端末内のみ。ステータスボタンで移動。面接日でカウントダウン。")}</p>

  ${interviewItems.length ? `
  <div class="card" style="margin-bottom:12px;border-color:var(--ac)">
    <div style="font-size:12px;font-weight:700;color:var(--ac);margin-bottom:6px">⏱ ${t("interview_countdown")}</div>
    ${interviewItems.map(item => {
      const left = daysUntil(item.interviewDate);
      const label = left == null ? "—" : (left < 0 ? tx("Past", "終了") : (left === 0 ? tx("Today", "今日") : `${left} ${t("days_until")}`));
      return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0">
        <span>${esc(item.title)} · ${esc(item.company || "")}</span>
        <strong style="color:var(--ac)">${label}</strong>
      </div>`;
    }).join("")}
  </div>` : ""}

  <div class="kanban">
    ${COLS.map(col => {
      const items = apps[col.id] || [];
      return `
      <div class="kanban-col" data-col="${col.id}">
        <h4>${tx(col.en, col.jp)} (${items.length})</h4>
        ${items.length ? items.map(item => renderTrackerItem(item, col.id)).join("") : `<p class="muted" style="font-size:12px">${tx("Empty", "なし")}</p>`}
      </div>`;
    }).join("")}
  </div>
  <button type="button" class="btn secondary" id="btnAddManual" style="margin-top:12px">${tx("+ Add manually", "+ 手動追加")}</button>
  <div id="manualForm" class="card hidden" style="margin-top:10px">
    <input class="input" id="mfTitle" placeholder="${tx("Job title", "職種")}" style="margin-bottom:8px">
    <input class="input" id="mfCompany" placeholder="${tx("Company", "会社")}" style="margin-bottom:8px">
    <input class="input" id="mfUrl" placeholder="URL" style="margin-bottom:8px">
    <button type="button" class="btn primary" id="mfSave">${tx("Save", "保存")}</button>
  </div>
  `;
}

function renderTrackerItem(item, colId) {
  const applied = item.appliedAt || item.savedAt || "";
  const days = daysSince(applied);
  const alert = (colId === "applied" && days != null && days >= 7);
  const left = item.interviewDate ? daysUntil(item.interviewDate) : null;
  return `
  <div class="kanban-item" data-id="${esc(item.id)}">
    <div style="font-weight:700">${esc(item.title || "Role")}</div>
    <div class="meta">${esc(item.company || "")}</div>
    ${applied ? `<div class="meta">${tx("Applied", "応募")}: ${esc(applied)}${days != null ? ` · ${days}${t("days_ago")}` : ""}${alert ? ` <span class="alert-dot">⚠ ${t("follow_up")}</span>` : ""}</div>` : ""}
    ${item.interviewDate ? `<div class="meta" style="color:var(--ac)">📅 ${esc(item.interviewDate)}${left != null && left >= 0 ? ` · ${left}d` : ""}</div>` : ""}
    ${item.salary ? `<div class="meta">¥ ${esc(item.salary)}</div>` : ""}
    ${item.notes ? `<div class="meta">${esc(item.notes).slice(0, 80)}</div>` : ""}
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
      ${COLS.filter(c => c.id !== colId).map(c =>
        `<button type="button" class="btn sm secondary" data-move="${esc(item.id)}" data-to="${c.id}" style="min-height:32px;font-size:11px;padding:4px 8px">${tx(c.en, c.jp)}</button>`
      ).join("")}
      <button type="button" class="btn sm ghost" data-edit="${esc(item.id)}" style="min-height:32px;font-size:11px">Edit</button>
      ${colId === "applied" || colId === "interview" ? `<button type="button" class="btn sm ghost" data-fu="${esc(item.id)}" style="min-height:32px;font-size:11px">${t("follow_up")}</button>` : ""}
    </div>
  </div>`;
}

function wireTracker() {
  $$("[data-move]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.move;
      const to = btn.dataset.to;
      moveApplication(id, to);
      render();
    });
  });
  $$("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.edit;
      const item = findApp(id);
      if (!item) return;
      const notes = prompt(tx("Notes", "メモ"), item.notes || "") ?? item.notes;
      const salary = prompt(tx("Salary", "年収・給与"), item.salary || "") ?? item.salary;
      const followUp = prompt(tx("Follow-up date (YYYY-MM-DD)", "フォロー日"), item.followUp || "") ?? item.followUp;
      const interviewDate = prompt(tx("Interview date (YYYY-MM-DD)", "面接日"), item.interviewDate || "") ?? item.interviewDate;
      item.notes = notes;
      item.salary = salary;
      item.followUp = followUp;
      item.interviewDate = interviewDate;
      persist();
      render();
    });
  });
  $$("[data-fu]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.fu;
      const item = findApp(id);
      if (!item) return;
      const template = `Dear Hiring Team,

I hope this message finds you well. I interviewed for the ${item.title || "role"} position${item.company ? ` at ${item.company}` : ""} and remain very interested.

Please let me know if any further information would be helpful. Thank you for your time.

Best regards`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(template).then(() => say(tx("Follow-up template copied", "フォローアップをコピー"), 1));
      } else {
        prompt(tx("Copy this follow-up", "この文をコピー"), template);
      }
    });
  });
  $("btnAddManual")?.addEventListener("click", () => $("manualForm")?.classList.toggle("hidden"));
  $("mfSave")?.addEventListener("click", () => {
    const title = $("mfTitle")?.value?.trim();
    if (!title) return;
    STATE.applications.saved.unshift({
      id: "manual-" + Date.now(),
      title,
      company: $("mfCompany")?.value?.trim() || "",
      url: $("mfUrl")?.value?.trim() || "",
      savedAt: today(),
      status: "saved",
      notes: "",
      salary: "",
      followUp: "",
      interviewDate: ""
    });
    persist();
    render();
  });
}

function findApp(id) {
  for (const col of COLS) {
    const arr = STATE.applications[col.id] || [];
    const found = arr.find(x => x.id === id);
    if (found) return found;
  }
  return null;
}

function moveApplication(id, toCol) {
  let item = null;
  for (const col of COLS) {
    const arr = STATE.applications[col.id] || [];
    const idx = arr.findIndex(x => x.id === id);
    if (idx >= 0) {
      item = arr.splice(idx, 1)[0];
      break;
    }
  }
  if (!item) return;
  item.status = toCol;
  if (toCol === "applied" && !item.appliedAt) item.appliedAt = today();
  if (toCol === "applied" && !item.followUp) item.followUp = addDays(5);
  if (toCol === "interview" && !item.interviewDate) item.interviewDate = today();
  if (!STATE.applications[toCol]) STATE.applications[toCol] = [];
  STATE.applications[toCol].unshift(item);
  persist();
}
// FindJob Now V7.1 — Main application controller (Tokyo + foreigner focus)

const $ = id => document.getElementById(id);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const ROLE_SUGGESTIONS = [
  "Business Development Manager","International Business Development","Travel Business Development",
  "Inbound Tourism Manager","Tourism Operations Manager","Travel Product Manager",
  "International Sales Manager","Partnerships Manager","Account Manager",
  "Customer Success Manager","Operations Manager","General Manager",
  "Project Manager","Software / Systems Manager","Travel Consultant","Tour Coordinator",
  "Hospitality Manager","Marketing Manager","Sales Manager","Product Manager"
];


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

    body = `
      <h2>${t("wizard_role")}</h2>
      <p class="sub">${tx("Select one or more roles. You can refine later.", "1つ以上選択。後から変更できます。")}</p>
      <input class="input" id="wRole" value="${esc(selected.join(", "))}" placeholder="${tx("Type a role or pick below…", "職種を入力、または下から選択…")}" autocomplete="off">
      <div class="chip-row" style="margin-top:10px">
        ${ROLE_SUGGESTIONS.map(r =>
          `<button type="button" class="chip ${selected.includes(r) ? "on" : ""}" data-role="${esc(r)}">${esc(r)}</button>`
        ).join("")}
      </div>
      <div class="btn-row" style="margin-top:8px;gap:8px">
        <button type="button" class="btn secondary" id="btnSelectAllRoles" style="flex:1">${tx("Select All", "すべて選択")}</button>
        <button type="button" class="btn ghost" id="btnClearRoles" style="flex:1">${tx("Clear", "クリア")}</button>
      </div>
      <p class="sub" style="margin-top:8px">${tx("Selected:", "選択中:")} <strong id="roleCount">${selected.length || 0}</strong></p>`;
  } else if (ws === 2) {
    body = `
      <h2>${t("wizard_industry")}</h2>
      <div class="chip-row">
        ${INDUSTRIES.map(ind =>
          `<button type="button" class="chip ${(o.desiredIndustries || []).includes(ind) ? "on" : ""}" data-ind="${esc(ind)}">${esc(ind)}</button>`
        ).join("")}
      </div>
      <p class="sub" style="margin-top:8px">${tx("Tap to select one or more.", "複数選択できます。")} ${tx("Selected:", "選択中:")} <strong>${(o.desiredIndustries || []).length}</strong></p>`;
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
  $("btnSelectAllRoles")?.addEventListener("click", () => {
    o.desiredRoles = [...ROLE_SUGGESTIONS];
    o.desiredRole = o.desiredRoles[0] || "";
    if ($("wRole")) $("wRole").value = o.desiredRoles.join(", ");
    persist(); render();
  });
  $("btnClearRoles")?.addEventListener("click", () => {
    o.desiredRoles = [];
    o.desiredRole = "";
    if ($("wRole")) $("wRole").value = "";
    persist(); render();
  });
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
    const list = Array.isArray(o.desiredIndustries) ? o.desiredIndustries.slice() : [];
    const i = list.indexOf(b.dataset.ind);
    if (i >= 0) list.splice(i, 1); else list.push(b.dataset.ind);
    o.desiredIndustries = list;
    o.desiredIndustry = list.join(" / ");
    STATE.targetJobs.industries = list;
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
    if (ws === 2 && !(o.desiredIndustries || []).length) { say(t("pick_industry"), 0); return; }
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
  const backButton = $("btnBack");
  if (backButton) {
    backButton.classList.toggle("hidden", !["jobs", "tools", "tracker", "onboarding"].includes(v));
    backButton.setAttribute("aria-label", STATE.settings.lang === "jp" ? "戻る" : "Back");
    backButton.title = STATE.settings.lang === "jp" ? "戻る" : "Back";
  }
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
  $("btnBack")?.addEventListener("click", () => {
    if (STATE.view === "onboarding") {
      const step = STATE.onboarding?.wizardStep || 1;
      if (step > 1) STATE.onboarding.wizardStep = step - 1;
      else STATE.view = "dashboard";
      persist(); render(); window.scrollTo(0, 0);
      return;
    }
    if (STATE.view !== "dashboard" && STATE.view !== "landing") setView("dashboard");
    else setView("jobs");
  });
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
