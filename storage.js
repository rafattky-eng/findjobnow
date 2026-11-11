// FindJob Now V7.1 — Local storage & state
const APP_VERSION = "7.2.0";
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
      desiredIndustry: "",
      experience: null,
      japanese: 0,
      visaStatus: null,
      location: "" // Tokyo | Osaka | Nagoya | Fukuoka | Remote | Any
    },
    targetJobs: { industries: [], titles: [], careerGoal: "" },
    targetCompanies: [], // company ids or names the user is tracking
    selectedRoles: null,
    journey: { goal: null, fastMode: false },
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
