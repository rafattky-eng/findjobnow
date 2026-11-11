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
