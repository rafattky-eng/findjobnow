// FindJob Now V7 — Resume Intelligence + Interview Coach V2

function renderTools() {
  const tool = STATE._tool || null;
  return `
  <h2>${tx("Toolkit", "ツールキット")}</h2>
  <p class="sub">${tx("Resume intelligence & interview practice", "履歴書知能と面接練習")}</p>
  <div class="tool-grid">
    <button type="button" class="tool-card" data-tool="ats"><span class="icon">📊</span><span class="label">${t("ats_score")}</span></button>
    <button type="button" class="tool-card" data-tool="rewrite"><span class="icon">✍️</span><span class="label">${t("rewrite")}</span></button>
    <button type="button" class="tool-card" data-tool="achieve"><span class="icon">🏆</span><span class="label">${t("achievement")}</span></button>
    <button type="button" class="tool-card" data-tool="interview"><span class="icon">🎤</span><span class="label">${t("interview_practice")}</span></button>
    <button type="button" class="tool-card" data-tool="salary"><span class="icon">💰</span><span class="label">${tx("Salary", "年収目安")}</span></button>
    <button type="button" class="tool-card" data-tool="visa"><span class="icon">🛂</span><span class="label">${tx("Visa guide", "ビザ案内")}</span></button>
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
  if (tool === "salary") return renderSalary();
  if (tool === "visa") return renderVisa();
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
  const communication = Math.min(98, 40 + Math.min(w, 80));
  const structure = hasStar ? 85 : w > 40 ? 60 : 40;
  const confidence = w >= 30 ? 75 : w >= 15 ? 55 : 35;
  const results = hasNumber ? 80 : 45;
  const overall = Math.round((communication + structure + confidence + results) / 4);
  let tip = tx("Add a concrete result with a number.", "数値を含む具体的な結果を追加。");
  if (overall >= 75) tip = tx("Strong answer — keep this structure.", "良い回答です。この構成を維持。");
  else if (w < 20) tip = tx("Too short — expand with STAR.", "短すぎます。STARで広げて。");
  return { communication, structure, confidence, results, overall, tip };
}

function renderSalary() {
  const yrs = STATE.profile?.yrs || STATE.dna?.yrs || 2;
  const base = 3500000 + yrs * 280000;
  const high = base + 1200000;
  return `
  <h3>${tx("Salary estimator (Japan)", "年収目安（日本）")}</h3>
  <p class="sub">${tx("Rough mid-market ranges for foreign professionals in Tokyo. Not an offer.", "東京の外国人向け中間相場の目安。オファーではありません。")}</p>
  <div class="score-grid">
    <div class="score-card"><div class="score-val" style="font-size:18px">¥${(base/10000).toFixed(0)}万</div><div class="score-lbl">${tx("Lower", "下限")}</div></div>
    <div class="score-card"><div class="score-val" style="font-size:18px">¥${((base+high)/2/10000).toFixed(0)}万</div><div class="score-lbl">${tx("Mid", "中央")}</div></div>
    <div class="score-card"><div class="score-val" style="font-size:18px">¥${(high/10000).toFixed(0)}万</div><div class="score-lbl">${tx("Upper", "上限")}</div></div>
  </div>
  <p class="sub">${tx("Adjust for industry, Japanese level, and company size.", "業界・日本語レベル・企業規模で調整。")}</p>`;
}

function renderVisa() {
  const v = STATE.onboarding?.visaStatus || "need_sponsorship";
  const tips = {
    need_sponsorship: tx("Target companies that state visa support. Engineer/Specialist in Humanities is common.", "ビザサポート明記の企業を狙う。技人国が一般的。"),
    work_visa: tx("You can change employers with notification. Keep your residence card updated.", "転職時は届出が必要。在留カードを最新に。"),
    student: tx("Part-time limits apply. Plan job hunting before graduation for status change.", "資格外活動の制限あり。卒業前に就職活動を。"),
    wh: tx("Working Holiday is time-limited. Use it to build Japan experience.", "期限あり。日本経験の構築に活用を。"),
    pr: tx("Strong position — focus on role fit and compensation.", "有利な立場。役割と待遇に集中を。"),
    spouse: tx("Flexible work authorization — highlight stability.", "就労制限が少ない。安定性をアピール。"),
    national: tx("No visa constraints — compete on skills and culture fit.", "ビザ制約なし。スキルと文化適合で勝負。")
  };
  return `
  <h3>${tx("Visa assistant", "ビザアシスタント")}</h3>
  <p class="sub">${tx("Status", "状況")}: <strong>${esc(v)}</strong></p>
  <div class="card">${tips[v] || tips.need_sponsorship}</div>
  <p class="sub">${tx("This is general information, not legal advice.", "一般情報であり、法的助言ではありません。")}</p>`;
}
