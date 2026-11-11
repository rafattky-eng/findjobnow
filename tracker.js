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
  if (toCol === "interview" && !item.interviewDate) item.interviewDate = today();
  if (!STATE.applications[toCol]) STATE.applications[toCol] = [];
  STATE.applications[toCol].unshift(item);
  persist();
}
