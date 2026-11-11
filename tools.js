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
