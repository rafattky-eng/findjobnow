// FindJob Now V7 — Application tracker upgrade

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

function renderTracker() {
  const apps = STATE.applications || {};
  return `
  <h2>${tx("Application Tracker", "応募管理")}</h2>
  <p class="sub">${tx("Local only. Drag is simplified — use status buttons.", "端末内のみ。ステータスボタンで移動。")}</p>
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
  return `
  <div class="kanban-item" data-id="${esc(item.id)}">
    <div style="font-weight:700">${esc(item.title || "Role")}</div>
    <div class="meta">${esc(item.company || "")}</div>
    ${applied ? `<div class="meta">${tx("Applied", "応募")}: ${esc(applied)}${days != null ? ` · ${days}${t("days_ago")}` : ""}${alert ? ` <span class="alert-dot">⚠ ${t("follow_up")}</span>` : ""}</div>` : ""}
    ${item.salary ? `<div class="meta">¥ ${esc(item.salary)}</div>` : ""}
    ${item.notes ? `<div class="meta">${esc(item.notes).slice(0, 80)}</div>` : ""}
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
      ${COLS.filter(c => c.id !== colId).map(c =>
        `<button type="button" class="btn sm secondary" data-move="${esc(item.id)}" data-to="${c.id}" style="min-height:32px;font-size:11px;padding:4px 8px">${tx(c.en, c.jp)}</button>`
      ).join("")}
      <button type="button" class="btn sm ghost" data-edit="${esc(item.id)}" style="min-height:32px;font-size:11px">Edit</button>
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
      item.notes = notes;
      item.salary = salary;
      item.followUp = followUp;
      persist();
      render();
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
