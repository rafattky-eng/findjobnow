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
