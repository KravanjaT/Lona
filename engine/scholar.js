// ============================================================
//  LONA OS — engine/scholar.js  (v2.6)
//  Knjižni Molj — bralni XP modul
// ============================================================

const LS_SCHOLAR = "lona_scholar_sessions";

function calcSessionXp(bookTypeId, forYounger) {
  const bt = LONA_CONFIG.scholar.bookTypes.find(b => b.id === bookTypeId);
  if (!bt) return 0;
  return forYounger ? bt.baseXp * LONA_CONFIG.scholar.familyClubMultiplier : bt.baseXp;
}

function completeSession(agentId, bookTypeId, forYounger) {
  const xp       = calcSessionXp(bookTypeId, forYounger);
  const sessions = getSessions();
  sessions.push({ agentId, bookTypeId, forYounger: !!forYounger, xp, date: new Date().toISOString() });
  localStorage.setItem(LS_SCHOLAR, JSON.stringify(sessions));
  addXp(agentId, xp);
  renderScholarHistory();
  return xp;
}

function getSessions() {
  return JSON.parse(localStorage.getItem(LS_SCHOLAR) || "[]");
}

function updateScholarXpPreview() {
  const sel    = document.querySelector(".book-type-btn--selected");
  const younger = document.getElementById("scholar-younger")?.checked ?? false;
  const prev   = document.getElementById("scholar-xp-preview") || document.querySelector(".scholar-xp-badge");
  if (!prev) return;
  if (!sel) { prev.textContent = "— XP"; return; }
  const xp = calcSessionXp(sel.dataset.bookType, younger);
  prev.textContent = "+" + xp + " XP" + (younger ? " 🔥×2" : "");
}

function renderScholarHistory() {
  const el = document.querySelector(".scholar-history");
  if (!el) return;
  const sessions = getSessions().slice(-5).reverse();
  if (!sessions.length) {
    el.innerHTML = '<p style="color:var(--text-dim);font-size:.78rem;text-align:center;padding:12px 0">Še ni sej.</p>';
    return;
  }
  el.innerHTML = sessions.map(s => {
    const bt    = LONA_CONFIG.scholar.bookTypes.find(b => b.id === s.bookTypeId);
    const agent = LONA_CONFIG.agents.find(a => a.id === s.agentId);
    const date  = new Date(s.date).toLocaleDateString("sl-SI", { month:"short", day:"numeric" });
    return `<div class="scholar-history__row">
      <span class="scholar-history__date">${date}</span>
      <span class="scholar-history__agent">${agent?.avatar ?? ""}${agent?.name ?? s.agentId}</span>
      <span class="scholar-history__book">${bt?.label ?? s.bookTypeId}${s.forYounger ? " 👨‍👧" : ""}</span>
      <span class="scholar-history__xp">+${s.xp} XP</span>
    </div>`;
  }).join("");
}

function scholarToast(msg, color) { lonaToast(msg, color); }

function initScholar() {
  document.querySelectorAll(".book-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".book-type-btn").forEach(b => b.classList.remove("book-type-btn--selected"));
      btn.classList.add("book-type-btn--selected");
      updateScholarXpPreview();
    });
  });

  const cb = document.getElementById("scholar-younger");
  if (cb) cb.addEventListener("change", updateScholarXpPreview);

  const finish = document.getElementById("scholar-finish");
  if (finish) {
    finish.addEventListener("click", () => {
      const sel     = document.querySelector(".book-type-btn--selected");
      const agentSel = document.querySelector(".scholar-agent-select");
      const younger = document.getElementById("scholar-younger")?.checked ?? false;
      if (!sel) { scholarToast("Izberi vrsto knjige!", "red"); return; }
      const agentId = agentSel?.value ?? LONA_CONFIG.agents[0].id;
      const xp      = completeSession(agentId, sel.dataset.bookType, younger);
      scholarToast("+" + xp + " XP zasluženo! 📚", "gold");
      document.querySelectorAll(".book-type-btn").forEach(b => b.classList.remove("book-type-btn--selected"));
      if (cb) cb.checked = false;
      updateScholarXpPreview();
    });
  }

  renderScholarHistory();
  updateScholarXpPreview();
}
