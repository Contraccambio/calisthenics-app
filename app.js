import { ROUTINE, WEEKS, findExercise } from "./data.js";

const PREFS_KEY = "calisthenics-prefs";

const state = {
  view: "gate",
  user: null,
  notes: [],
  historySessions: [],
  day: 1,
  week: "w12",
  date: todayISO(),
  authError: "",
  busy: false,
};

const crono = {
  mode: "stopwatch",
  running: false,
  baseMs: 0,
  startedAt: 0,
  restTotalMs: 0,
  label: "",
  tick: null,
  finished: false,
};
const saveTimers = {};
const saveJobs = {};

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function initials(name) {
  return (name || "").trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function persistPrefs() {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ day: state.day, week: state.week }));
}

function restorePrefs() {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    if (prefs?.day) state.day = Number(prefs.day);
    if (prefs?.week) state.week = prefs.week;
  } catch {
    /* ignore */
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Errore di rete");
  return data;
}

function enterApp(user) {
  state.user = user;
  state.view = "workout";
  state.authError = "";
  state.date = todayISO();
  restorePrefs();
  persistPrefs();
  render();
}

async function loadNotes() {
  const data = await api("/api/notes");
  state.notes = data.notes || [];
}

async function loadHistory() {
  const data = await api("/api/history");
  state.historySessions = data.sessions || [];
}

function notesFor(exerciseId) {
  return state.notes
    .filter((n) => n.exerciseId === exerciseId && (n.text || "").trim())
    .sort((a, b) => b.date.localeCompare(a.date) || (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

function noteForToday(exerciseId) {
  return state.notes.find((n) => n.exerciseId === exerciseId && n.date === state.date);
}

function setLocalNote(exerciseId, patch) {
  const idx = state.notes.findIndex((n) => n.exerciseId === exerciseId && n.date === state.date);
  const next = {
    exerciseId,
    date: state.date,
    day: state.day,
    week: state.week,
    text: "",
    done: false,
    ...(idx >= 0 ? state.notes[idx] : {}),
    ...patch,
  };
  if (!(next.text || "").trim() && !next.done) {
    if (idx >= 0) state.notes.splice(idx, 1);
    return next;
  }
  if (idx >= 0) state.notes[idx] = next;
  else state.notes.push(next);
  return next;
}

function persistNote(exerciseId) {
  clearTimeout(saveTimers[exerciseId]);
  saveTimers[exerciseId] = setTimeout(() => {
    saveTimers[exerciseId] = null;
    writeNote(exerciseId);
  }, 280);
}

async function writeNote(exerciseId) {
  const note = noteForToday(exerciseId) || { text: "", done: false };
  const job = api("/api/notes", {
    method: "PUT",
    body: JSON.stringify({
      exerciseId,
      date: state.date,
      day: state.day,
      week: state.week,
      text: note.text || "",
      done: Boolean(note.done),
    }),
  }).then((data) => {
    if (data.note) setLocalNote(exerciseId, data.note);
    else state.notes = state.notes.filter((n) => !(n.exerciseId === exerciseId && n.date === state.date));
    flashSaved();
  }).catch((err) => {
    flashSaved(err.message || "Salvataggio fallito");
  });
  saveJobs[exerciseId] = job;
  await job;
}

async function flushPendingNotes() {
  const pending = Object.keys(saveTimers).filter((id) => saveTimers[id]);
  pending.forEach((id) => {
    clearTimeout(saveTimers[id]);
    saveTimers[id] = null;
  });
  await Promise.all([...pending.map((id) => writeNote(id)), ...Object.values(saveJobs)]);
}

function saveNote(exerciseId, text) {
  setLocalNote(exerciseId, { text, day: state.day, week: state.week });
  persistNote(exerciseId);
}

function toggleDone(exerciseId) {
  const current = noteForToday(exerciseId);
  setLocalNote(exerciseId, { done: !current?.done, day: state.day, week: state.week });
  persistNote(exerciseId);
  render();
}

async function completeSession() {
  const exerciseIds = ROUTINE[state.day].exercises.map((ex) => ex.id);
  try {
    await api("/api/sessions/complete", {
      method: "POST",
      body: JSON.stringify({ date: state.date, day: state.day, week: state.week, exerciseIds }),
    });
    await loadNotes();
    flashSaved("Sessione completata");
    render();
  } catch (err) {
    flashSaved(err.message);
  }
}

async function submitLogin() {
  const name = document.getElementById("loginName")?.value.trim() || "";
  const password = document.getElementById("loginPassword")?.value || "";
  if (!name || !password) return setAuthError("Nome e password sono obbligatori.");
  state.busy = true;
  state.authError = "";
  render();
  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
    await loadNotes();
    enterApp(data.user);
  } catch (err) {
    setAuthError(err.message);
  } finally {
    state.busy = false;
  }
}

async function logout() {
  if (state.user && !confirm("Uscire dall'app? Le note sono già salvate.")) return;
  await flushPendingNotes();
  crono.mode = "stopwatch";
  resetCrono();
  await api("/api/logout", { method: "POST", body: "{}" }).catch(() => {});
  state.user = null;
  state.notes = [];
  state.historySessions = [];
  state.view = "gate";
  state.authError = "";
  render();
}

function setAuthError(message) {
  state.authError = message;
  state.busy = false;
  render();
}

function flashSaved(text = "Salvato") {
  const el = document.getElementById("saveDot");
  if (!el) return;
  el.textContent = text;
  el.classList.remove("hidden");
  clearTimeout(flashSaved._t);
  flashSaved._t = setTimeout(() => el.classList.add("hidden"), 1400);
}

function parseRestSeconds(rest, fallback) {
  if (Number.isFinite(fallback) && fallback > 0) return fallback;
  const t = String(rest || "").trim();
  if (!t || /libere|reg\.?/i.test(t)) return 0;
  if (/emom/i.test(t)) return 60;
  let minutes = 0;
  let seconds = 0;
  const minMatch = t.match(/(\d+)\s*['’′]/);
  const secMatch = t.match(/(\d+)\s*["”″]/);
  if (minMatch) minutes = Number(minMatch[1]);
  if (secMatch) seconds = Number(secMatch[1]);
  if (!minMatch && !secMatch) {
    const only = t.match(/^(\d+)\s*(s|sec)?$/i);
    if (only) seconds = Number(only[1]);
  }
  return minutes * 60 + seconds;
}

function cronoElapsed() {
  if (!crono.running) return crono.baseMs;
  return crono.baseMs + (performance.now() - crono.startedAt);
}

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function ensureCronoTick() {
  if (crono.tick) return;
  crono.tick = setInterval(paintCrono, 200);
}

function startCrono() {
  if (crono.running) return;
  if (crono.mode === "rest" && (crono.finished || cronoElapsed() >= crono.restTotalMs)) {
    crono.baseMs = 0;
    crono.finished = false;
  }
  crono.running = true;
  crono.startedAt = performance.now();
  ensureCronoTick();
  paintCrono();
}

function pauseCrono() {
  if (crono.running) {
    crono.baseMs = cronoElapsed();
    crono.running = false;
  }
  paintCrono();
}

function resetCrono() {
  const leaveRest = crono.mode === "rest" && !crono.running && crono.baseMs === 0 && !crono.finished;
  crono.running = false;
  crono.baseMs = 0;
  crono.startedAt = 0;
  crono.finished = false;
  if (leaveRest || crono.mode !== "rest") {
    crono.mode = "stopwatch";
    crono.restTotalMs = 0;
    crono.label = "";
  }
  paintCrono();
}

function startRestCountdown(seconds, label) {
  if (!seconds) return;
  crono.mode = "rest";
  crono.restTotalMs = seconds * 1000;
  crono.label = label || "";
  crono.baseMs = 0;
  crono.finished = false;
  crono.running = true;
  crono.startedAt = performance.now();
  ensureCronoTick();
  paintCrono();
}

function paintCrono() {
  const root = document.getElementById("cronometro");
  const digits = document.getElementById("cronoDigits");
  const mode = document.getElementById("cronoMode");
  const sub = document.getElementById("cronoSub");
  const track = document.getElementById("cronoTrack");
  const bar = document.getElementById("cronoBar");
  const startBtn = document.getElementById("cronoStart");
  const pauseBtn = document.getElementById("cronoPause");
  if (!root) return;

  const elapsed = cronoElapsed();
  let displayMs = elapsed;
  let progress = 0;
  if (crono.mode === "rest") {
    displayMs = Math.max(0, crono.restTotalMs - elapsed);
    progress = crono.restTotalMs ? (displayMs / crono.restTotalMs) * 100 : 0;
    if (crono.running && displayMs <= 0 && !crono.finished) {
      crono.finished = true;
      crono.running = false;
      crono.baseMs = crono.restTotalMs;
      flashSaved("Recupero finito");
      if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
    }
  }

  if (digits) digits.textContent = formatClock(displayMs);
  if (mode) mode.textContent = crono.mode === "rest" ? "Recupero" : "Cronometro";
  if (sub) sub.textContent = crono.label;
  root.classList.toggle("is-rest", crono.mode === "rest");
  root.classList.toggle("is-done", crono.mode === "rest" && (crono.finished || displayMs <= 0));
  if (track) {
    track.classList.toggle("hidden", crono.mode !== "rest");
    if (bar) bar.style.width = `${progress}%`;
  }
  if (startBtn) startBtn.disabled = crono.running;
  if (pauseBtn) pauseBtn.disabled = !crono.running;
}

function syncCronoDock() {
  const root = document.getElementById("cronometro");
  const show = Boolean(state.user) && state.view !== "gate";
  root?.classList.toggle("hidden", !show);
  document.body.classList.toggle("crono-open", show);
  if (show) paintCrono();
}

function weekLabel(id) {
  return WEEKS.find((w) => w.id === id)?.label || id;
}

function progress() {
  const day = ROUTINE[state.day];
  const done = day.exercises.filter((ex) => {
    const n = noteForToday(ex.id);
    return n && (n.done || (n.text || "").trim());
  }).length;
  return { done, total: day.exercises.length };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function sessionRows(session) {
  const rows = [
    ["Data allenamento", session.date],
    ["Giorno", `Giorno ${session.day} — ${ROUTINE[session.day]?.title || ""}`],
    ["Periodo", weekLabel(session.week)],
    [],
    ["Esercizio", "Target", "Recupero", "Fatto", "Note"],
  ];
  const byId = Object.fromEntries((session.notes || []).map((n) => [n.exerciseId, n]));
  (ROUTINE[session.day]?.exercises || []).forEach((ex) => {
    const n = byId[ex.id];
    rows.push([ex.name, ex.targets[session.week] || "", ex.rest, n?.done ? "Sì" : "", (n?.text || "").trim() || "-"]);
  });
  return rows;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportRows(rows, filename) {
  if (window.XLSX) {
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 32 }, { wch: 28 }, { wch: 12 }, { wch: 8 }, { wch: 40 }];
    window.XLSX.utils.book_append_sheet(wb, ws, filename.slice(0, 31));
    window.XLSX.writeFile(wb, `${filename}.xlsx`);
    return;
  }
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadBlob(`${filename}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

function exportCurrentDay() {
  const notes = state.notes.filter((n) => n.date === state.date && n.day === state.day);
  exportRows(sessionRows({ date: state.date, day: state.day, week: state.week, notes }), `Allenamento_${state.date}_G${state.day}`);
  flashSaved("Export pronto");
}

function exportArchive() {
  const sessions = state.historySessions.length ? state.historySessions : groupNotes();
  if (!sessions.length) return flashSaved("Nessuna sessione");
  if (window.XLSX) {
    const wb = window.XLSX.utils.book_new();
    sessions.forEach((s) => {
      const ws = window.XLSX.utils.aoa_to_sheet(sessionRows(s));
      window.XLSX.utils.book_append_sheet(wb, ws, `${s.date}_G${s.day}`.slice(0, 31));
    });
    window.XLSX.writeFile(wb, `Archivio_${todayISO()}.xlsx`);
  } else {
    exportRows(sessions.flatMap((s, i) => [...(i ? [[]] : []), ...sessionRows(s)]), `Archivio_${todayISO()}`);
  }
  flashSaved("Archivio scaricato");
}

function groupNotes() {
  const map = new Map();
  for (const n of state.notes) {
    const key = `${n.date}|${n.day}`;
    if (!map.has(key)) map.set(key, { date: n.date, day: n.day, week: n.week, notes: [] });
    map.get(key).notes.push(n);
  }
  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date) || b.day - a.day);
}

function render() {
  const root = document.getElementById("app");
  if (state.view === "gate") root.innerHTML = renderGate();
  else if (state.view === "history") root.innerHTML = renderHistory();
  else root.innerHTML = renderWorkout();
  bindEvents();
  syncCronoDock();
}

function renderGate() {
  return `
    <section class="hero">
      <div class="kicker">Scheda 6 settimane</div>
      <h1>Calisthenics Log</h1>
      <p>Tre giorni di allenamento. Entra con nome e password: le note restano sul server, sul tuo profilo.</p>
    </section>
    <div class="stack">
      <div class="segment">
        <button class="seg active" id="showLogin">Entra</button>
        <a class="seg" href="/admin" style="text-decoration:none;text-align:center"><b>Admin</b><span>utilizzo</span></a>
      </div>
      <div class="card">
        <label for="loginName">Nome</label>
        <input id="loginName" autocomplete="username" placeholder="Nome e cognome" />
        <label for="loginPassword">Password</label>
        <input id="loginPassword" type="password" autocomplete="current-password" />
        ${state.authError ? `<p class="error">${escapeHtml(state.authError)}</p>` : ""}
        <div class="row" style="margin-top:12px">
          <button class="btn btn-primary btn-block" id="loginBtn" ${state.busy ? "disabled" : ""}>
            ${state.busy ? "Attendi…" : "Entra"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderWorkout() {
  const user = state.user;
  if (!user) {
    state.view = "gate";
    return renderGate();
  }
  const day = ROUTINE[state.day];
  const { done, total } = progress();
  return `
    <div class="topbar">
      <span class="chip">
        <span class="avatar" style="width:28px;height:28px;border-radius:8px;background:${user.color};font-size:11px">${escapeHtml(initials(user.name))}</span>
        ${escapeHtml(user.name)}
      </span>
      <div class="row">
        <button class="chip" id="historyBtn">Storico</button>
        <button class="chip chip-exit" id="logoutBtn">Esci</button>
      </div>
    </div>
    <section class="hero">
      <div class="kicker">Giorno ${state.day} · ${weekLabel(state.week)}</div>
      <h1>${day.title}</h1>
      <p>${day.focus}</p>
      <div class="progress">${done}/${total} esercizi annotati</div>
    </section>
    <div class="segment">
      ${[1, 2, 3].map((d) => `
        <button class="seg ${state.day === d ? "active" : ""}" data-day="${d}">
          <b>Giorno ${d}</b>
          <span>${ROUTINE[d].title}</span>
        </button>
      `).join("")}
    </div>
    <div class="filters">
      <div>
        <label>Periodo</label>
        <select id="weekSelect">
          ${WEEKS.map((w) => `<option value="${w.id}" ${w.id === state.week ? "selected" : ""}>${w.label}</option>`).join("")}
        </select>
      </div>
      <div>
        <label>Data</label>
        <input type="date" id="dateInput" value="${state.date}" />
      </div>
    </div>
    ${day.exercises.map((ex) => renderExercise(ex)).join("")}
    <div class="footer-actions">
      <button class="btn btn-primary btn-block" id="completeBtn">Completa sessione</button>
      <div class="row">
        <button class="btn btn-ghost grow" id="exportDayBtn">Esporta giorno</button>
        <button class="btn btn-ghost grow" id="exportAllBtn">Esporta storico</button>
      </div>
    </div>
  `;
}

function renderExercise(ex) {
  const today = noteForToday(ex.id);
  const history = notesFor(ex.id).filter((n) => n.date !== state.date).slice(0, 4);
  const done = Boolean(today?.done);
  return `
    <article class="ex ${done ? "is-done" : ""}" data-ex="${ex.id}">
      <div class="ex-head">
        <label class="done-toggle">
          <input type="checkbox" data-done="${ex.id}" ${done ? "checked" : ""} />
          <span class="ex-name">${escapeHtml(ex.name)}</span>
        </label>
        <div class="row">
          ${ex.skill ? `<span class="badge skill">Skill</span>` : ""}
          ${parseRestSeconds(ex.rest, ex.restSec) ? `<button class="badge timer-btn" data-timer="${ex.id}" type="button">Recupero ${escapeHtml(ex.rest)}</button>` : `<span class="badge">Recupero ${escapeHtml(ex.rest)}</span>`}
        </div>
      </div>
      <div class="target">Target: <b>${escapeHtml(ex.targets[state.week])}</b></div>
      ${ex.note ? `<p class="muted" style="margin-top:-6px">${escapeHtml(ex.note)}</p>` : ""}
      <label>Le tue note</label>
      <textarea data-note="${ex.id}" placeholder="Ripetizioni fatte, kg, hold, sensazioni…">${escapeHtml(today?.text || "")}</textarea>
      ${history.length ? `
        <div class="history">
          <div class="tiny">Note precedenti</div>
          <ul>
            ${history.map((n) => `<li><b>${formatDate(n.date)}</b> — ${escapeHtml(n.text)}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </article>
  `;
}

function renderHistory() {
  const user = state.user;
  const sessions = state.historySessions;
  return `
    <div class="topbar">
      <button class="chip" id="backWorkoutBtn">← Allenamento</button>
      <button class="chip chip-exit" id="logoutBtn">Esci</button>
    </div>
    <section class="hero">
      <div class="kicker">Archivio</div>
      <h1>Storico sessioni</h1>
      <p>${sessions.length} allenamenti salvati per ${escapeHtml(user?.name || "")}.</p>
    </section>
    ${sessions.length ? `
      <div class="stack">
        ${sessions.map((s) => `
          <button class="card session-card" data-open-session="${s.date}|${s.day}">
            <div>
              <div class="ex-name">${formatDate(s.date)} · Giorno ${s.day}</div>
              <div class="muted">${ROUTINE[s.day]?.title || ""} · ${weekLabel(s.week)}</div>
            </div>
            <div class="muted">${s.notes.filter((n) => (n.text || "").trim()).length} note${s.completedAt ? " · completata" : ""}</div>
          </button>
        `).join("")}
        <button class="btn btn-ghost btn-block" id="exportAllBtn">Esporta storico completo</button>
      </div>
    ` : `<div class="empty">Nessuna sessione ancora. Annota un esercizio e torna qui.</div>`}
  `;
}

function bindEvents() {
  document.getElementById("loginBtn")?.addEventListener("click", () => submitLogin());
  ["loginName", "loginPassword"].forEach((id) => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitLogin();
    });
  });
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("historyBtn")?.addEventListener("click", async () => {
    try {
      await loadHistory();
    } catch {
      state.historySessions = groupNotes();
    }
    state.view = "history";
    render();
  });
  document.getElementById("backWorkoutBtn")?.addEventListener("click", () => {
    state.view = "workout";
    render();
  });
  document.querySelectorAll("[data-day]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.day = Number(btn.dataset.day);
      persistPrefs();
      render();
    });
  });
  document.getElementById("weekSelect")?.addEventListener("change", (e) => {
    state.week = e.target.value;
    persistPrefs();
    render();
  });
  document.getElementById("dateInput")?.addEventListener("change", (e) => {
    state.date = e.target.value || todayISO();
    persistPrefs();
    render();
  });
  document.querySelectorAll("[data-note]").forEach((area) => {
    area.addEventListener("input", (e) => saveNote(e.target.dataset.note, e.target.value));
    area.addEventListener("change", (e) => saveNote(e.target.dataset.note, e.target.value));
  });
  document.querySelectorAll("[data-done]").forEach((box) => {
    box.addEventListener("change", () => toggleDone(box.dataset.done));
  });
  document.querySelectorAll("[data-timer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ex = findExercise(btn.dataset.timer);
      if (!ex) return;
      const seconds = parseRestSeconds(ex.rest, ex.restSec);
      if (seconds) startRestCountdown(seconds, `${ex.name} · ${ex.rest}`);
    });
  });
  document.getElementById("completeBtn")?.addEventListener("click", completeSession);
  document.getElementById("exportDayBtn")?.addEventListener("click", exportCurrentDay);
  document.getElementById("exportAllBtn")?.addEventListener("click", exportArchive);
  document.querySelectorAll("[data-open-session]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [date, day] = btn.dataset.openSession.split("|");
      state.date = date;
      state.day = Number(day);
      state.view = "workout";
      persistPrefs();
      render();
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

document.getElementById("cronoStart")?.addEventListener("click", startCrono);
document.getElementById("cronoPause")?.addEventListener("click", pauseCrono);
document.getElementById("cronoReset")?.addEventListener("click", resetCrono);

restorePrefs();
render();

api("/api/me")
  .then(async (data) => {
    await loadNotes();
    enterApp(data.user);
  })
  .catch(() => {});
