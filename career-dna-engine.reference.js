// ===== CAREER DNA ENGINE (V4.0) =====
const DNA_VERSION = 4;
const _rx = (a, f) => new RegExp(a, f || "gi");
const DOMAINS = {
  management: { en: "Management", jp: "マネジメント", re: _rx("\\b(managed|managing|manager|head of|supervis\\w+|oversaw|oversee\\w*|team of \\d+|direct reports?|headcount|people management|budget (?:of|owner)|responsible for (?:a )?team)\\b|マネージャー|管理職|部長|課長|統括|責任者") },
  leadership: { en: "Leadership", jp: "リーダーシップ", re: _rx("\\b(led|leading|leader|mentor\\w*|coach\\w*|spearhead\\w*|directed|founded|co-?founded|stakeholders?|cross[- ]functional|championed|drove|built (?:a )?team)\\b|リーダー|主導|立ち上げ") },
  operations: { en: "Operations", jp: "オペレーション", re: _rx("\\b(operations?|logistics|process improvement|workflow|scheduling|coordinat\\w+|procurement|vendors?|supply chain|sops?|kpis?|quality control|efficiency|streamlin\\w+|compliance|inventory|back[- ]office|project plan\\w*|timeline|delivery)\\b|運営|業務改善|進行管理") },
  marketing: { en: "Marketing", jp: "マーケティング", re: _rx("\\b(marketing|seo|sem|campaigns?|brand\\w*|social media|content strategy|newsletter|advertis\\w+|growth|promotion\\w*|ppc|google analytics|market research)\\b|マーケティング|広告|販促") },
  product: { en: "Product ownership", jp: "プロダクト開発", re: _rx("\\b(product (?:owner|manager|management|roadmap|strategy|development|launch\\w*|design)|roadmaps?|requirements?|user stories|backlog|mvp|go[- ]to[- ]market|gtm|prototype\\w*|ux|user research|a/b test\\w*|new products?|created (?:a )?(?:new )?(?:product|service|tour|package)s?|developed (?:a )?(?:new )?(?:product|service|tour|package)s?|packages? design|launched)\\b|商品企画|企画|新商品|サービス開発") },
  techKnow: { en: "Technology knowledge", jp: "テクノロジー知識", re: _rx("\\b(api|apis|cloud|aws|azure|gcp|database|sql|system design|architecture|agile|scrum|jira|confluence|sdlc|devops|saas|integration|software|technical|technology|it project|erp|crm|automation|python|javascript|java|react|html|css|data pipeline|machine learning)\\b|システム|IT|エンジニア") },
  coding: { en: "Hands-on coding", jp: "コーディング", re: _rx("\\b(wrote code|writing code|coding|programming|programmer|developed (?:software|applications?|apps?|web|websites?|backend|frontend|apis?)|implemented (?:features?|code|algorithms?|apis?)|full[- ]?stack|back[- ]?end|front[- ]?end|github|unit tests?|code reviews?|refactor\\w*|software (?:engineer|developer)|web developer|debugg\\w+|deployed code|pull requests?)\\b|プログラミング|開発者|実装") },
  travel: { en: "Travel industry", jp: "旅行業界", re: _rx("\\b(travel|tour\\w*|hotel\\w*|airlines?|booking\\w*|itinerar\\w+|ota|gds|destinations?|inbound|outbound|reservations?|hospitality|ryokan|dmc|resort|cruise|guest\\w*|concierge|sightseeing|amadeus|sabre)\\b|旅行|観光|ホテル|宿泊|航空") },
  bizdev: { en: "Business development", jp: "事業開発", re: _rx("\\b(business development|partnerships?|alliances?|b2b|new accounts?|lead generation|negotiat\\w+|revenue growth|market expansion|client acquisition|deals?|channel (?:sales|partners?)|strategic partners?)\\b|事業開発|提携|新規開拓") },
  sales: { en: "Sales", jp: "営業", re: _rx("\\b(sales|selling|quota|retail|account executive|upsell\\w*|closing|cross[- ]sell\\w*|revenue target)\\b|営業|販売") },
  customer: { en: "Customer care", jp: "カスタマーケア", re: _rx("\\b(customer service|customer success|customer support|help ?desk|call cent(?:er|re)|client relations?|complaints?|customer satisfaction|csat|inbound calls?|tickets?|zendesk)\\b|接客|カスタマー|問い合わせ|コールセンター") },
  analytics: { en: "Analytics", jp: "データ分析", re: _rx("\\b(data analy\\w+|sql|tableau|power bi|excel|dashboards?|reporting|statistic\\w*|insights?|metrics|forecast\\w*|kpi analysis|looker)\\b|データ分析|集計") },
  education: { en: "Teaching", jp: "教育", re: _rx("\\b(teach\\w*|instructor|tutor\\w*|lessons?|curriculum|eikaiwa|esl|efl|tefl|alt\\b|training sessions?|trainer)\\b|教師|講師|英会話|研修") },
  creative: { en: "Creative", jp: "クリエイティブ", re: _rx("\\b(design\\w*|copywrit\\w+|video|storytelling|photograph\\w*|editor|writer|illustrat\\w+|figma|photoshop|content creation)\\b|デザイン|ライター|制作") },
  finance: { en: "Finance", jp: "財務", re: _rx("\\b(finance|accounting|audit\\w*|bookkeeping|invoic\\w+|tax|accounts (?:payable|receivable)|financial (?:analysis|reporting))\\b|経理|財務|会計") },
  hr: { en: "HR / Recruiting", jp: "人事", re: _rx("\\b(recruit\\w*|talent acquisition|hr|human resources|onboarding|hiring|interview(?:ing)? candidates)\\b|採用|人事") }
};
const TOOL_TERMS = ["jira","confluence","salesforce","hubspot","excel","sql","python","javascript","typescript","java","react","aws","azure","tableau","power bi","figma","google analytics","seo","crm","sap","notion","slack","scrum","agile","kanban","zendesk","shopify","wordpress","photoshop","amadeus","sabre","gds","ota","quickbooks","xero","git","docker","rest api","api","budgeting","negotiation","presentation","stakeholder management","project management","roadmap","a/b testing"];

const PREF_LIKES = [
  { id: "creating", en: "Creating products", jp: "商品・サービスづくり" },
  { id: "managing", en: "Management", jp: "マネジメント" },
  { id: "bizdev", en: "Business development", jp: "事業開発" },
  { id: "travel", en: "Travel", jp: "旅行・観光" },
  { id: "marketing", en: "Marketing", jp: "マーケティング" },
  { id: "tech", en: "Technology", jp: "テクノロジー" },
  { id: "people", en: "Working with people", jp: "人と関わる仕事" },
  { id: "analysis", en: "Data & analysis", jp: "データ分析" },
  { id: "ops", en: "Organizing operations", jp: "運営・段取り" },
  { id: "creative", en: "Creative work", jp: "クリエイティブ" },
  { id: "teaching", en: "Teaching", jp: "教える仕事" },
  { id: "sales", en: "Sales", jp: "営業" }
];
const PREF_DISLIKES = [
  { id: "coding", en: "Pure coding", jp: "純粋なコーディング" },
  { id: "repetitive", en: "Repetitive work", jp: "単純作業の繰り返し" },
  { id: "callcenter", en: "Call center work", jp: "コールセンター" },
  { id: "sales", en: "Quota / pressure sales", jp: "ノルマ営業" },
  { id: "teaching", en: "Teaching", jp: "教える仕事" },
  { id: "analysis", en: "Heavy data work", jp: "データ作業中心" }
];
const DOMAIN_TAG = { management:"managing", leadership:"managing", product:"creating", marketing:"marketing", bizdev:"bizdev", travel:"travel", techKnow:"tech", analytics:"analysis", education:"teaching", creative:"creative", operations:"ops", sales:"sales", customer:"people" };

// id, EN title, JP title, level(0 entry..3 lead), minYears, profile weights, tags, industries, fast, long, jpNeed(0-5), titleRegex, search queries
const ROLE_CATALOG = [
  { id:"tpm", t:"Technical Project Manager", j:"テクニカルプロジェクトマネージャー", lv:2, my:4, p:{management:.22,leadership:.18,techKnow:.25,operations:.2,product:.15}, tags:["managing","tech","ops"], ind:["tech","operations"], long:1, jp:2, re:/technical (project|program)|it project|project manager|program manager|delivery manager/i, q:["technical project manager","it project manager","program manager"] },
  { id:"pm", t:"Product Manager", j:"プロダクトマネージャー", lv:2, my:3, p:{product:.35,leadership:.15,techKnow:.15,analytics:.1,marketing:.1,bizdev:.15}, tags:["creating","managing","tech"], ind:["tech","marketing"], long:1, jp:2, re:/product (manager|owner|lead)|associate product|head of product/i, q:["product manager","product owner","associate product manager"] },
  { id:"tpdm", t:"Travel Product Manager", j:"トラベルプロダクトマネージャー", lv:2, my:3, p:{travel:.35,product:.3,bizdev:.1,marketing:.1,operations:.15}, tags:["travel","creating","managing"], ind:["travel"], long:1, jp:2, re:/travel (product|experience)|tour(ism)? product|destination (product|manager)|product.{0,12}(travel|tour)/i, q:["travel product manager","tourism product manager","travel experience product"] },
  { id:"opsm", t:"Operations Manager", j:"オペレーションマネージャー", lv:2, my:4, p:{operations:.35,management:.3,leadership:.15,customer:.1,analytics:.1}, tags:["managing","ops"], ind:["operations","customer"], long:1, jp:2, re:/operations? (manager|lead|director|head)|business operations|head of operations/i, q:["operations manager","business operations manager","operations lead"] },
  { id:"bdm", t:"Business Development Manager", j:"事業開発マネージャー", lv:2, my:3, p:{bizdev:.35,sales:.15,management:.1,leadership:.1,marketing:.15,travel:.15}, tags:["bizdev","managing","sales"], ind:["sales","travel"], long:1, jp:2, re:/business development|partnerships? (manager|lead)|alliances?/i, q:["business development manager","partnerships manager","business development"] },
  { id:"mktm", t:"Marketing Manager", j:"マーケティングマネージャー", lv:2, my:4, p:{marketing:.45,management:.15,creative:.15,analytics:.15,leadership:.1}, tags:["marketing","managing","creative"], ind:["marketing"], long:1, jp:2, re:/marketing (manager|lead|director|head)|head of marketing|brand manager/i, q:["marketing manager","brand manager","head of marketing"] },
  { id:"mkts", t:"Digital Marketing Specialist", j:"デジタルマーケティング担当", lv:1, my:1, p:{marketing:.5,analytics:.2,creative:.2,techKnow:.1}, tags:["marketing","creative","analysis"], ind:["marketing"], fast:1, jp:1, re:/marketing (specialist|coordinator|executive|associate)|digital marketing|growth marketer|seo specialist|social media/i, q:["digital marketing specialist","marketing coordinator","growth marketing"] },
  { id:"content", t:"Content / Community Marketer", j:"コンテンツ・コミュニティ担当", lv:1, my:1, p:{marketing:.35,creative:.4,customer:.1,travel:.15}, tags:["creative","marketing"], ind:["marketing"], fast:1, jp:1, re:/content (marketer|manager|writer|creator)|community (manager|specialist)|copywriter/i, q:["content marketing","community manager","copywriter"] },
  { id:"swe", t:"Software Engineer", j:"ソフトウェアエンジニア", lv:1, my:1, p:{coding:.6,techKnow:.3,analytics:.1}, tags:["coding","tech"], ind:["tech"], long:1, jp:1, re:/software (engineer|developer)|developer|programmer|full[- ]?stack|back[- ]?end|front[- ]?end|engineer/i, q:["software engineer","full stack developer","backend developer"] },
  { id:"da", t:"Data Analyst", j:"データアナリスト", lv:1, my:1, p:{analytics:.5,techKnow:.2,operations:.15,product:.1,coding:.05}, tags:["analysis","tech"], ind:["tech"], jp:1, re:/data analyst|business intelligence|bi analyst|analytics/i, q:["data analyst","business intelligence analyst","analytics"] },
  { id:"ba", t:"Business Analyst", j:"ビジネスアナリスト", lv:1, my:2, p:{analytics:.3,operations:.25,product:.2,techKnow:.15,management:.1}, tags:["analysis","ops","tech"], ind:["tech","operations"], long:1, jp:2, re:/business analyst|systems analyst|requirements analyst/i, q:["business analyst","systems analyst"] },
  { id:"scrum", t:"Scrum Master / Delivery Lead", j:"スクラムマスター", lv:2, my:3, p:{management:.2,leadership:.25,techKnow:.3,operations:.25}, tags:["managing","tech","ops"], ind:["tech"], long:1, jp:2, re:/scrum master|agile coach|delivery lead/i, q:["scrum master","agile delivery lead"] },
  { id:"csm", t:"Customer Success Manager", j:"カスタマーサクセス", lv:1, my:2, p:{customer:.35,bizdev:.15,leadership:.1,techKnow:.15,operations:.1,sales:.15}, tags:["people","tech","bizdev"], ind:["customer","tech"], long:1, jp:2, re:/customer success|client success|account manager|client manager/i, q:["customer success manager","client success","account manager"] },
  { id:"sup", t:"Customer Support Specialist", j:"カスタマーサポート", lv:0, my:0, p:{customer:.7,techKnow:.15,operations:.15}, tags:["people","repetitive"], ind:["customer"], fast:1, jp:2, re:/customer (support|service)|support (specialist|agent|representative)|help ?desk/i, q:["customer support specialist","customer service","support agent"] },
  { id:"cc", t:"Call Center Operator", j:"コールセンター", lv:0, my:0, p:{customer:.8,sales:.1,operations:.1}, tags:["callcenter","repetitive","people"], ind:["customer"], fast:1, jp:3, re:/call cent(er|re)|telemarket|inbound (agent|calls)|outbound calls|contact cent(er|re)/i, q:["call center","contact center agent"] },
  { id:"tc", t:"Travel Consultant / Tour Coordinator", j:"旅行コンサルタント", lv:0, my:0, p:{travel:.5,customer:.2,sales:.15,operations:.15}, tags:["travel","people"], ind:["travel"], fast:1, jp:2, re:/travel (consultant|agent|advisor)|tour (coordinator|operator|guide)|reservation|itinerary/i, q:["travel consultant","tour coordinator","travel agent"] },
  { id:"tops", t:"Tour / Travel Operations Manager", j:"ツアーオペレーション", lv:2, my:3, p:{travel:.3,operations:.35,management:.2,customer:.15}, tags:["travel","managing","ops"], ind:["travel","operations"], long:1, jp:2, re:/(tour|travel).{0,12}operations|destination (operations|manager)|dmc/i, q:["travel operations manager","tour operations"] },
  { id:"hotel", t:"Hotel Guest Relations", j:"ホテルゲストリレーション", lv:0, my:0, p:{travel:.4,customer:.5,operations:.1}, tags:["travel","people"], ind:["travel"], fast:1, jp:3, re:/hotel|guest relations|front desk|concierge/i, q:["guest relations","front desk hotel"] },
  { id:"sales", t:"Sales Associate", j:"販売・営業スタッフ", lv:0, my:0, p:{sales:.55,customer:.3,marketing:.15}, tags:["sales","people"], ind:["sales"], fast:1, jp:2, re:/sales (associate|representative|executive)|retail|inside sales/i, q:["sales associate","inside sales representative"] },
  { id:"ae", t:"Account Executive", j:"アカウントエグゼクティブ", lv:1, my:2, p:{sales:.4,bizdev:.3,customer:.15,techKnow:.15}, tags:["sales","bizdev"], ind:["sales","tech"], long:1, jp:2, re:/account executive|sales (manager|lead)|enterprise sales/i, q:["account executive","sales manager"] },
  { id:"se", t:"Solutions Consultant", j:"ソリューションコンサルタント", lv:1, my:2, p:{techKnow:.35,sales:.2,customer:.2,bizdev:.15,product:.1}, tags:["tech","people","bizdev"], ind:["tech"], long:1, jp:2, re:/solutions? (consultant|engineer|architect)|sales engineer|pre-?sales/i, q:["solutions consultant","sales engineer"] },
  { id:"teach", t:"English Teacher", j:"英語講師", lv:0, my:0, p:{education:.7,customer:.15,creative:.15}, tags:["teaching","people"], ind:["education"], fast:1, jp:0, re:/teacher|instructor|tutor|esl|efl|tefl|alt\b/i, q:["english teacher","online english tutor"] },
  { id:"rec", t:"Recruiter", j:"リクルーター", lv:1, my:1, p:{hr:.6,sales:.15,customer:.15,bizdev:.1}, tags:["people","sales"], ind:["hr"], jp:2, re:/recruit|talent acquisition|sourcer/i, q:["recruiter","talent acquisition"] },
  { id:"pc", t:"Project Coordinator", j:"プロジェクトコーディネーター", lv:0, my:0, p:{operations:.45,customer:.15,leadership:.1,techKnow:.1,management:.2}, tags:["ops","people"], ind:["operations"], fast:1, jp:2, re:/project coordinator|operations coordinator|program coordinator|coordinator/i, q:["project coordinator","operations coordinator"] }
];
const ARCHETYPES = [
  { id:"tpl", en:"Technical Product Leader", jp:"テクニカル・プロダクトリーダー", blurb_en:"You turn technology into products and lead people to ship them — not a pure coder.", blurb_jp:"技術を商品に変えて、人を率いて形にする人。コーダーではありません。", f:s=>s.product*.35+s.techKnow*.2+(s.management+s.leadership)/2*.3+s.bizdev*.15 },
  { id:"tjl", en:"Technical Project Leader", jp:"テクニカル・プロジェクトリーダー", blurb_en:"You understand technology and keep complex projects, people and deadlines on track.", blurb_jp:"技術を理解し、複雑なプロジェクトを期限通りに進める人。", f:s=>s.techKnow*.3+s.operations*.25+(s.management+s.leadership)/2*.35+s.product*.1 },
  { id:"tpb", en:"Travel Product Builder", jp:"トラベルプロダクトビルダー", blurb_en:"You know travel deeply and create products, tours or services around it.", blurb_jp:"旅行に精通し、商品やツアーを企画する人。", f:s=>s.travel*.45+s.product*.3+s.bizdev*.1+s.marketing*.15 },
  { id:"oo", en:"Operations Organizer", jp:"オペレーション・オーガナイザー", blurb_en:"You make things run smoothly: processes, vendors, teams and quality.", blurb_jp:"プロセス、取引先、チーム、品質を整えて回す人。", f:s=>s.operations*.45+(s.management+s.leadership)/2*.4+s.customer*.15 },
  { id:"gbb", en:"Growth & Business Builder", jp:"グロース＆ビジネスビルダー", blurb_en:"You win partners and customers and grow revenue.", blurb_jp:"パートナーと顧客を開拓し、売上を伸ばす人。", f:s=>s.bizdev*.4+s.marketing*.25+s.sales*.2+s.leadership*.15 },
  { id:"bcs", en:"Brand & Content Storyteller", jp:"ブランド＆コンテンツ・ストーリーテラー", blurb_en:"You shape how people see a brand through content and campaigns.", blurb_jp:"コンテンツとキャンペーンでブランドの見え方をつくる人。", f:s=>s.marketing*.5+s.creative*.4+s.analytics*.1 },
  { id:"ces", en:"Customer Experience Specialist", jp:"カスタマーエクスペリエンス担当", blurb_en:"You are warm, reliable and great with guests and customers.", blurb_jp:"お客様に寄り添い、信頼される接客のプロ。", f:s=>s.customer*.5+s.travel*.25+s.sales*.1+s.operations*.15 },
  { id:"eng", en:"Hands-on Engineer", jp:"ハンズオン・エンジニア", blurb_en:"You build software yourself and are strongest close to the code.", blurb_jp:"自分でソフトを作る、コードに近い場所で強い人。", f:s=>s.coding*.7+s.techKnow*.3-(s.management+s.product)*.1 },
  { id:"dps", en:"Data Problem-Solver", jp:"データ・プロブレムソルバー", blurb_en:"You find answers in numbers and explain them clearly.", blurb_jp:"数字から答えを見つけ、わかりやすく伝える人。", f:s=>s.analytics*.6+s.techKnow*.25+s.operations*.15 },
  { id:"edu", en:"Educator & Communicator", jp:"教育・コミュニケーター", blurb_en:"You explain, coach and help others learn.", blurb_jp:"教え、導き、学びを支える人。", f:s=>s.education*.8+s.creative*.1+s.customer*.1 },
  { id:"ptp", en:"People & Talent Partner", jp:"ピープル＆タレントパートナー", blurb_en:"You connect people with the right opportunities.", blurb_jp:"人と機会をつなぐ人。", f:s=>s.hr*.8+s.sales*.1+s.customer*.1 }
];

function _count(re, text){ const m = text.match(re); return m ? m.length : 0; }
function estimateYears(text){
  const t = String(text||"");
  let explicit = 0;
  for(const m of t.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?|年)(?:\s+of)?(?:\s+(?:professional|work|relevant|industry))?/gi)){
    const ctx = t.slice(Math.max(0, m.index-30), m.index+60);
    if(/experience|経験|working|worked|industry|professional|career/i.test(ctx)) explicit = Math.max(explicit, Math.min(40, +m[1]));
  }
  const nowY = new Date().getFullYear();
  const spans = [];
  for(const m of t.matchAll(/\b((?:19|20)\d{2})\s*(?:[-–—]|to)\s*((?:19|20)\d{2}|present|current|now|today)\b/gi)){
    const a = +m[1], b = /^\d/.test(m[2]) ? +m[2] : nowY;
    if(b >= a && b - a <= 40 && a >= 1970) spans.push([a, b]);
  }
  spans.sort((x,y)=>x[0]-y[0]);
  let total = 0, cur = null;
  for(const s of spans){ if(!cur) cur = s.slice(); else if(s[0] <= cur[1]) cur[1] = Math.max(cur[1], s[1]); else { total += cur[1]-cur[0]; cur = s.slice(); } }
  if(cur) total += cur[1]-cur[0];
  return Math.min(40, Math.max(explicit, total));
}
function extractTitles(text){
  const re = /\b((?:senior|junior|lead|chief|head of|associate|assistant|principal|deputy)?\s*(?:[A-Za-z&\/]+\s){0,2}(?:manager|director|engineer|developer|consultant|coordinator|specialist|analyst|executive|owner|officer|designer|teacher|recruiter|founder|producer|planner|agent|representative))\b/gi;
  const out = new Set();
  for(const m of String(text||"").matchAll(re)){ const v = m[1].trim().replace(/\s+/g," "); if(v.length <= 46 && !/^(stack|end|web|the|and|a|an)\s/i.test(v)) out.add(v); }
  return [...out].slice(0, 12);
}
function extractSignals(text){
  const raw = String(text||"");
  const signals = {}, evidence = {};
  const titles = extractTitles(raw);
  for(const [k, d] of Object.entries(DOMAINS)){
    const re = new RegExp(d.re.source, d.re.flags);
    const n = _count(re, raw);
    let score = Math.round(100 * (1 - Math.exp(-n / 4)));
    evidence[k] = [];
    const re2 = new RegExp(d.re.source, "i");
    const m = raw.match(re2);
    if(m){ const i = m.index; evidence[k].push(raw.slice(Math.max(0, i-30), i+m[0].length+40).replace(/\s+/g," ").trim()); }
    signals[k] = score;
  }
  // job-title evidence outweighs bare keywords
  const tj = titles.join(" | ").toLowerCase();
  const bump = (k, v) => { signals[k] = Math.min(100, Math.max(signals[k], v)); };
  if(/manager|director|head of/.test(tj)) bump("management", 65);
  if(/lead|head of|director|founder|chief|principal/.test(tj)) bump("leadership", 60);
  if(/product (manager|owner)/.test(tj)) bump("product", 80);
  if(/project manager|program manager|operations|coordinator|producer|planner/.test(tj)) bump("operations", 55);
  if(/marketing/.test(tj)) bump("marketing", 65);
  if(/(software|backend|frontend|full[- ]?stack|web) (engineer|developer)|programmer/.test(tj)) bump("coding", 75);
  if(/business development|partnership/.test(tj)) bump("bizdev", 65);
  if(/recruiter/.test(tj)) bump("hr", 65);
  if(/teacher|instructor/.test(tj)) bump("education", 65);
  // keyword listing alone is not hands-on coding: require verbs or an engineering title
  const handsOn = /(software|backend|frontend|full[- ]?stack|web) (engineer|developer)|programmer|wrote code|developed (software|applications?|apps?|websites?)|implemented (features?|code)/i.test(raw);
  if(!handsOn) signals.coding = Math.min(signals.coding, 30);
  return { signals, evidence, titles };
}
function inferLevel(yrs, titles, signals){
  const t = (titles||[]).join(" ").toLowerCase();
  let lv = yrs < 2 ? 0 : yrs < 5 ? 1 : yrs < 9 ? 2 : 3;
  if(/manager|director|head of|lead|principal/.test(t) && yrs >= 3) lv = Math.max(lv, 2);
  if(/director|head of|chief|vp\b/.test(t) && yrs >= 8) lv = 3;
  if((signals.management||0) >= 60 && yrs >= 4) lv = Math.max(lv, 2);
  return lv;
}
const LV_LABEL = { en:["Early-career","Mid-level","Experienced","Senior"], jp:["若手","中堅","経験豊富","シニア"] };
const JLN_V = { N1:5, N2:4, N3:3, N4:2, N5:1 };
function jaLevel(jlpt, text){ return JLN_V[jlpt] || (/japanese|日本語|nihongo/i.test(text||"") ? 2 : 0); }

function inferPrefs(signals, text, explicit){
  const likes = [], dislikes = [];
  for(const [d, tag] of Object.entries(DOMAIN_TAG)){ if((signals[d]||0) >= 45 && !likes.includes(tag)) likes.push(tag); }
  const inferredD = [];
  const m = String(text||"").match(/(?:not interested in|don'?t (?:enjoy|like)|do not (?:enjoy|like)|dislike|avoid|prefer not to|no longer want to)\s+([^.\n;]{3,50})/i);
  if(m){
    const c = m[1].toLowerCase();
    if(/cod|program/.test(c)) inferredD.push("coding");
    if(/repetit|routine|data entry/.test(c)) inferredD.push("repetitive");
    if(/call cent|telemarket/.test(c)) inferredD.push("callcenter");
    if(/sales|quota/.test(c)) inferredD.push("sales");
  }
  // soft hint: leaders/product people with only light coding are unlikely to want pure coding
  const lead = ((signals.management||0)+(signals.product||0)+(signals.leadership||0))/3;
  if(lead >= 45 && (signals.coding||0) < 50 && !inferredD.includes("coding")) inferredD.push("coding");
  return { likesInferred: likes.filter(x => !(explicit.likes||[]).includes(x)), dislikesInferred: inferredD.filter(x => !(explicit.dislikes||[]).includes(x)) };
}

function seniorityOf(title){
  const t = String(title||"").toLowerCase();
  if(/\b(director|vp|vice president|head of|chief|principal|staff)\b/.test(t)) return 3;
  if(/\b(senior|sr\.?|lead|manager|architect)\b/.test(t)) return 2;
  if(/\b(junior|jr\.?|intern|trainee|graduate|entry|assistant|associate)\b/.test(t)) return 0;
  return 1;
}
function expFitForRole(c, role){
  let sum = 0, wsum = 0;
  for(const [d, w] of Object.entries(role.p)){ sum += w * Math.min(1, (c.signals[d]||0)/60); wsum += w; }
  let fit = wsum ? sum / wsum : 0;
  if(c.yrs < role.my) fit *= 0.6 + 0.4 * (c.yrs / Math.max(1, role.my));
  if(role.lv <= 0 && c.level >= 3) fit *= 0.8;
  if(role.id === "swe"){
    const s = c.signals, lead = (s.management + s.product + s.leadership) / 3;
    if(s.coding < 40) fit *= 0.35;
    if(lead > s.coding * 0.9) fit *= 0.5;
  }
  return Math.round(Math.min(1, fit) * 100);
}
function interestFit(c, tags, extra){
  const L = new Set(c.prefs.likes||[]), Li = new Set(c.likesInferred||[]), D = new Set(c.prefs.dislikes||[]), Di = new Set(c.dislikesInferred||[]);
  let hits = 0, hardDis = false, softDis = false;
  for(const t of tags){ if(L.has(t)) hits += 1; else if(Li.has(t)) hits += .6; if(D.has(t)) hardDis = true; if(Di.has(t)) softDis = true; }
  let v = (L.size || Li.size) ? 40 + 60 * Math.min(1, hits / Math.max(1, Math.min(2, tags.length))) : 50;
  if(softDis) v = Math.min(v, 30);
  if(hardDis) v = 5;
  if(extra) v = Math.max(0, Math.min(100, v + extra));
  return { v: Math.round(v), hardDis, softDis, hits };
}
function scoreRole(c, role){
  const exp = expFitForRole(c, role);
  const it = interestFit(c, role.tags, 0);
  const top = Object.entries(role.p).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const skill = Math.round(100 * top.reduce((a,[d])=>a+Math.min(1,(c.signals[d]||0)/55),0)/top.length);
  const need = role.jp, have = c.ja;
  const lang = need <= have ? 100 : Math.max(10, 100 - 25 * (need - have));
  const visa = c.visaStrong ? 95 : /student/i.test(c.visaStatus||"") ? 55 : 70;
  const total = Math.round(.40*exp + .25*it.v + .20*skill + .10*lang + .05*visa);
  return { total: it.hardDis ? Math.min(total, 30) : total, parts:{exp, interest:it.v, skill, lang, visa}, hardDis: it.hardDis, softDis: it.softDis };
}
function explainRole(c, role, sc){
  const top = Object.entries(role.p).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([d])=>d).filter(d=>(c.signals[d]||0)>=35);
  const names = top.map(d=>DOMAINS[d].en.toLowerCase());
  const nm = top.map(d=>DOMAINS[d][LANGX()]).join(" / ");
  if(sc.hardDis) return LANGX()==="jp" ? "あなたが避けたい仕事に当たります。" : "This matches something you said you want to avoid.";
  if(names.length) return LANGX()==="jp" ? `${nm}の経験が活かせます。` : `Your ${names.join(" and ")} experience fits this role.`;
  return LANGX()==="jp" ? "経験の一部が活かせます。" : "Partly fits your background.";
}
let LANGX = () => (typeof LANG !== "undefined" && LANG === "jp") ? "jp" : "en";

function computeDNA(text, prefsIn, ctx){
  const raw = String(text||"");
  const ex = extractSignals(raw);
  const yrs = estimateYears(raw);
  const level = inferLevel(yrs, ex.titles, ex.signals);
  const prefs = { likes:(prefsIn&&prefsIn.likes)||[], dislikes:(prefsIn&&prefsIn.dislikes)||[], style:(prefsIn&&prefsIn.style)||{}, path:(prefsIn&&prefsIn.path)||"", note:(prefsIn&&prefsIn.note)||"" };
  // free-text note can add dislikes
  const note = prefs.note.toLowerCase();
  const dl = prefs.dislikes.slice();
  if(/call cent|telemarket/.test(note) && !dl.includes("callcenter")) dl.push("callcenter");
  if(/repetit|routine|data entry/.test(note) && !dl.includes("repetitive")) dl.push("repetitive");
  if(/pure cod|only cod|no cod|programming all day/.test(note) && !dl.includes("coding")) dl.push("coding");
  prefs.dislikes = dl;
  const inf = inferPrefs(ex.signals, raw, prefs);
  const jlpt = (ctx && ctx.jlpt) || "";
  const visaStatus = (ctx && ctx.visaStatus) || "";
  const c = { signals: ex.signals, yrs, level, prefs, likesInferred: inf.likesInferred, dislikesInferred: inf.dislikesInferred, ja: jaLevel(jlpt, raw), jlpt, visaStatus, visaStrong: /permanent|spouse|engineer|humanities|specified/i.test(visaStatus) };
  const roles = ROLE_CATALOG.map(r => { const sc = scoreRole(c, r); return { id:r.id, title:r.t, titleJp:r.j, fit:sc.total, parts:sc.parts, tags:r.tags, ind:r.ind, fast:!!r.fast, long:!!r.long, lv:r.lv, avoid:sc.hardDis, soft:sc.softDis, why:explainRole(c, r, sc), queries:r.q }; }).sort((a,b)=>b.fit-a.fit);
  const usable = roles.filter(r => !r.avoid);
  const best = usable.slice(0, 6);
  const avoid = roles.filter(r => r.avoid || (r.fit < 38 && r.lv >= 2) || (r.soft && r.fit < 50)).slice(-4).reverse();
  const avoidFinal = [...new Set([...roles.filter(r=>r.avoid), ...roles.filter(r=>r.soft && r.fit < 55), ...roles.filter(r=>!r.avoid && r.fit < 35 && r.lv >= 1).slice(-3)])].slice(0,5);
  const fast = usable.filter(r => r.fast && r.fit >= 40 && r.lv <= Math.max(1, level)).sort((a,b)=>b.fit-a.fit).slice(0,4);
  const long = usable.filter(r => r.long && r.fit >= 45).sort((a,b)=>b.fit-a.fit).slice(0,4);
  const arch = ARCHETYPES.map(a => ({ a, v: a.f(ex.signals) })).sort((x,y)=>y.v-x.v);
  const archetype = arch[0].v >= 12 ? arch[0].a : { id:"gen", en:"Versatile Generalist", jp:"マルチプレイヤー", blurb_en:"You have a broad background. Choose a direction below and we will sharpen it.", blurb_jp:"幅広い経験があります。方向を選べば、さらに精度が上がります。" };
  const secondary = arch[1] && arch[1].v >= 20 ? arch[1].a : null;
  const langs = []; if(/english|英語/i.test(raw)) langs.push("English"); if(c.ja) langs.push(jlpt ? "Japanese ("+jlpt+")" : "Japanese");
  const candidateType = {
    en: `${LV_LABEL.en[level]} ${level >= 2 && (ex.signals.management >= 45 || ex.signals.leadership >= 45) ? "manager-track" : "professional"} · ${langs.length>1 ? "bilingual (EN + JA)" : (langs[0]||"language not stated")}${yrs ? " · ~"+yrs+" yrs" : ""}`,
    jp: `${LV_LABEL.jp[level]}・${langs.length>1 ? "バイリンガル" : (langs[0]||"言語未記載")}${yrs ? "・約"+yrs+"年" : ""}`
  };
  const S = ex.signals;
  const indMap = {
    travel: ["Travel & Tourism","旅行・観光", Math.max(S.travel, 0)],
    tech: ["Technology","テクノロジー", Math.round((S.techKnow*.5 + S.product*.3 + S.coding*.2))],
    marketing: ["Marketing","マーケティング", Math.round(S.marketing*.7 + S.creative*.3)],
    sales: ["Sales & Biz Dev","営業・事業開発", Math.round(S.bizdev*.6 + S.sales*.4)],
    operations: ["Operations","オペレーション", Math.round(S.operations*.6 + S.management*.4)],
    customer: ["Customer Service","カスタマーサービス", S.customer],
    education: ["Education","教育", S.education],
    hr: ["HR / Recruiting","人事", S.hr]
  };
  const industries = Object.entries(indMap).map(([id,[en,jp,v]]) => {
    const tag = { travel:"travel", tech:"tech", marketing:"marketing", sales:"bizdev", operations:"ops", customer:"people", education:"teaching", hr:"people" }[id];
    let pct = v; if(prefs.likes.includes(tag)) pct += 10; if(prefs.dislikes.includes(tag)) pct -= 30;
    return { id, label: LANGX()==="jp" ? jp : en, en, jp, pct: Math.max(0, Math.min(98, Math.round(pct))) };
  }).sort((a,b)=>b.pct-a.pct);
  const expertise = [ ["management","Management experience"], ["leadership","Leadership"], ["operations","Operations"], ["marketing","Marketing"], ["product","Product ownership"], ["techKnow","Technology knowledge"], ["travel","Travel industry expertise"] ].map(([k,label]) => ({ key:k, label, jp: DOMAINS[k].jp, score: S[k], level: S[k]>=60 ? "strong" : S[k]>=30 ? "some" : "none", evidence: (ex.evidence[k]||[])[0]||"" }));
  return { version: DNA_VERSION, yrs, level, titles: ex.titles, signals: S, evidence: ex.evidence, prefs, likesInferred: inf.likesInferred, dislikesInferred: inf.dislikesInferred, archetype, secondary, candidateType, industries, expertise, roles, best, avoid: avoidFinal, fast, long, ja: c.ja, jlpt, visaStatus, visaStrong: c.visaStrong, skillTerms: TOOL_TERMS.filter(t => new RegExp("(^|[^a-z])" + t.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&") + "([^a-z]|$)","i").test(raw)) };
}

// ---------- Job matching: 40 experience / 25 interest / 20 skill / 10 language / 5 visa ----------
function matchJob(job, dna){
  const text = ((job.title||"")+" "+(job.description||"")+" "+(job.full||"")).replace(/\s+/g," ");
  const low = text.toLowerCase();
  const title = job.title || "";
  const js = extractSignals(text).signals;
  const c = { signals: dna.signals, yrs: dna.yrs, level: dna.level, prefs: dna.prefs, likesInferred: dna.likesInferred, dislikesInferred: dna.dislikesInferred, ja: dna.ja };
  const why = [], whyNot = [], missing = [];
  // role family via title
  let role = ROLE_CATALOG.filter(r => r.re.test(title)).sort((a,b)=>b.lv-a.lv)[0] || null;
  if(role && role.id === "swe" && !/engineer|developer|programmer/i.test(title)) role = null;
  // experience fit: role-family fit blended with domain overlap
  let dot = 0, jn = 0;
  for(const d of Object.keys(DOMAINS)){ if((js[d]||0) >= 25){ jn += js[d]; dot += js[d] * Math.min(1, (dna.signals[d]||0)/60); } }
  const overlap = jn ? Math.round(100 * dot / jn) : 40;
  let exp = role ? Math.round(expFitForRole(c, role) * .6 + overlap * .4) : overlap;
  const jl = seniorityOf(title), gap = jl - dna.level;
  if(gap >= 2){ exp = Math.round(exp * .55); whyNot.push(LANGX()==="jp" ? "あなたの現在のレベルより上のポジションです。" : "This role is above your current level."); }
  else if(gap === 1){ exp = Math.round(exp * .88); }
  else if(gap <= -2){ exp = Math.round(exp * .8); whyNot.push(LANGX()==="jp" ? "経験に対して簡単すぎる可能性があります。" : "May be below your experience level."); }
  const ym = low.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)[^.]{0,30}(?:experience|in )/);
  let reqYrs = ym ? +ym[1] : 0, penalties = 0;
  if(reqYrs && dna.yrs < reqYrs){ exp = Math.round(exp * (.6 + .4 * dna.yrs / reqYrs)); missing.push(LANGX()==="jp" ? `${reqYrs}年以上の経験` : `${reqYrs}+ years of experience`); penalties += 8; }
  // interest fit
  const tags = new Set(role ? role.tags : []);
  for(const [d, tag] of Object.entries(DOMAIN_TAG)){ if((js[d]||0) >= 50) tags.add(tag); }
  if(/call cent(er|re)|inbound calls|outbound calls|telemarket|cold call/i.test(low)){ tags.add("callcenter"); tags.add("repetitive"); }
  if(/data entry|repetitive|routine tasks|manual input/i.test(low)) tags.add("repetitive");
  if((js.coding||0) >= 50 && /engineer|developer|programmer/i.test(title)) tags.add("coding");
  let extra = 0; const ws = dna.prefs.style || {};
  if(ws.remote === "remote") extra += job.remote ? 8 : -8; else if(ws.remote === "office") extra += job.remote ? -8 : 4;
  const it = interestFit(c, [...tags], extra);
  // skill fit: named tools/skills required in the ad vs CV
  const req = TOOL_TERMS.filter(t => new RegExp("(^|[^a-z])" + t.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&") + "([^a-z]|$)","i").test(low));
  const have = new Set(dna.skillTerms || []);
  const matched = req.filter(t => have.has(t));
  const lack = req.filter(t => !have.has(t));
  const topJ = Object.entries(js).filter(([d,v]) => v >= 25).sort((a,b)=>b[1]-a[1]).slice(0,2);
  const domFit = topJ.length ? Math.round(100 * topJ.reduce((a,[d])=>a+Math.min(1,(dna.signals[d]||0)/55),0)/topJ.length) : 50;
  const skill = req.length ? Math.round(.6 * (100 * matched.length / req.length) + .4 * domFit) : domFit;
  lack.slice(0,4).forEach(t => missing.push(t));
  // language fit
  let needJa = 0;
  const jm = low.match(/japanese[^.]{0,25}(?:n([1-5])|fluent|native|business[- ]level|proficien\w+)|(?:n([1-5]))[^.]{0,15}japanese|jlpt\s*n([1-5])|日本語[^。]{0,8}(ビジネス|ネイティブ|流暢|n[1-5])/i);
  if(jm){ const n = jm[1]||jm[2]||jm[3]; needJa = n ? ({1:5,2:4,3:3,4:2,5:1})[n] : 4; }
  else if(/japanese (?:language|speaking|skills?)|日本語/i.test(low)) needJa = 2;
  const lang = needJa ? (dna.ja >= needJa ? 100 : Math.max(10, 100 - 25*(needJa - dna.ja))) : (dna.ja ? 100 : 88);
  if(needJa && dna.ja < needJa){ missing.push(LANGX()==="jp" ? `日本語 N${6-needJa}` : `Japanese N${6-needJa}`); penalties += 8; whyNot.push(LANGX()==="jp" ? "日本語レベルが要件に届いていません。" : "Your Japanese is below the stated requirement."); }
  // visa / location eligibility
  const loc = (job.location||"");
  const jpOk = /worldwide|anywhere|global|asia|apac|japan|tokyo|osaka|international/i.test(loc) || !loc || /^remote$/i.test(loc.trim());
  const restricted = !jpOk && /\b(usa?|united states|u\.s\.|canada|uk|united kingdom|europe|eu|emea|latam|latin america|australia|germany|france|north america|brazil|india)\b/i.test(loc);
  const authOnly = /(must|need to|required to) (be )?(legally |currently )?(authori[sz]ed|eligible|allowed) to work in (the )?(us|u\.s\.|united states|uk|canada|eu)/i.test(low);
  let visa = (restricted || authOnly) ? 10 : job.visa ? 100 : dna.visaStrong ? 95 : /student/i.test(dna.visaStatus||"") ? 55 : 70;
  if(restricted || authOnly){ whyNot.push(LANGX()==="jp" ? `勤務地の制限: ${loc||"US/EU"}（日本から応募できない可能性）` : `Location-restricted${loc ? " ("+loc+")" : ""} — may not accept applicants in Japan.`); penalties += 30; }
  let total = Math.round(.40*exp + .25*it.v + .20*skill + .10*lang + .05*visa);
  if(restricted || authOnly) total = Math.min(total, 45);
  if(it.hardDis){ total = Math.min(total, 30); whyNot.push(LANGX()==="jp" ? "避けたい仕事の特徴があります。" : "Has traits you said you want to avoid (e.g. call-center or pure-coding work)."); }
  else if(it.softDis){ whyNot.push(LANGX()==="jp" ? "あなたの志向と合わない可能性があります。" : "May not fit what you enjoy."); }
  // positive reasons
  const topC = Object.entries(dna.signals).filter(([d,v]) => v >= 45 && (js[d]||0) >= 25).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([d])=>d);
  if(topC.length) why.push(LANGX()==="jp" ? `${topC.map(d=>DOMAINS[d].jp).join("・")}の経験が求人内容と一致しています。` : `Your ${topC.map(d=>DOMAINS[d].en.toLowerCase()).join(" and ")} experience matches what this job needs.`);
  if(role && expFitForRole(c, role) >= 60) why.push(LANGX()==="jp" ? `「${role.j}」タイプの職種で、経歴に合っています。` : `Fits your profile as a ${role.t}.`);
  if(it.hits >= 1 && !it.hardDis) why.push(LANGX()==="jp" ? "あなたの興味に合っています。" : "Lines up with what you said you like.");
  if(matched.length) why.push(LANGX()==="jp" ? `一致するスキル: ${matched.slice(0,4).join(", ")}` : `Skills you already have: ${matched.slice(0,4).join(", ")}.`);
  if(needJa && dna.ja >= needJa) why.push(LANGX()==="jp" ? "日本語要件を満たしています。" : "You meet the Japanese requirement.");
  if(!needJa) why.push(LANGX()==="jp" ? "日本語は必須ではありません。" : "No Japanese requirement stated.");
  if(job.visa) why.push(LANGX()==="jp" ? "ビザ支援の記載があります。" : "Mentions visa support.");
  if(!why.length) why.push(LANGX()==="jp" ? "一部の条件が一致しています。" : "Some requirements overlap with your background.");
  let pct = Math.round(total * .88 - penalties);
  pct = Math.max(3, Math.min(92, pct));
  const label = pct >= 62 ? "high" : pct >= 38 ? "medium" : "low";
  return { total: Math.max(0, Math.min(99, total)), parts:{ exp, interest: it.v, skill, lang, visa }, why: why.slice(0,5), whyNot: [...new Set(whyNot)].slice(0,4), missing: [...new Set(missing)].slice(0,6), interview: { pct, label }, role: role ? role.id : null, avoid: it.hardDis, restricted: !!(restricted||authOnly), fast: false };
}
