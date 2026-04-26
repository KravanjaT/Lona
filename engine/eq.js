// ============================================================
//  LONA OS — engine/eq.js  (v2.6)
//  EQ Operacije — čustvena inteligenca
// ============================================================

// ── NEVTRALIZATOR ───────────────────────────────────────────
function showNevtralizator(agentId) {
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🧘</div>
    <p class="joker-dialog__title">Nevtralizator</p>
    <p class="joker-dialog__body">
      <strong>${name}</strong> je prepoznal/-a svojo jezo<br>
      in se umaknil/-a preden je eksplodiral/-a.<br><br>
      <span style="color:#34C759;font-weight:800">To je vrhunski samonadzor.</span><br>
      Nagrada: <strong>+1 Joker 🃏</strong>
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Potrdi ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    grantJoker(agentId);
    logMission(agentId, "nevtralizator", 0, {label:"Nevtralizator"}, false);
    showStamp("NEVTRALIZ.", "green");
    lonaToast(`${name} +1 Joker 🃏 — Izjemen samonadzor!`, "green");
    if (typeof renderCmdAgents === "function") renderCmdAgents();
  });
}

// ── DEBRIEFING ───────────────────────────────────────────────
function showDebriefing(agentId) {
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const xp   = LONA_CONFIG.missions.debriefing.baseXp;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">📋</div>
    <p class="joker-dialog__title">Debriefing</p>
    <p class="joker-dialog__body" style="text-align:left;width:100%">
      <strong>${name}</strong> poroča o napaki:<br><br>
      <span style="font-size:.75rem;color:#8E8E93">Starš potrdi da je agent odgovoril na:</span>
    </p>
    <div style="width:100%;display:flex;flex-direction:column;gap:6px">
      <div class="debriefing-check" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F2F2F7;border-radius:10px;border:2px solid #C7C7CC">
        <span style="font-size:1rem">🔍</span>
        <span style="font-size:.8rem;font-weight:700">Kaj se je zgodilo?</span>
      </div>
      <div class="debriefing-check" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F2F2F7;border-radius:10px;border:2px solid #C7C7CC">
        <span style="font-size:1rem">💡</span>
        <span style="font-size:.8rem;font-weight:700">Kaj sem se naučil?</span>
      </div>
      <div class="debriefing-check" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F2F2F7;border-radius:10px;border:2px solid #C7C7CC">
        <span style="font-size:1rem">🛡️</span>
        <span style="font-size:.8rem;font-weight:700">Kako bom preprečil naslednjič?</span>
      </div>
    </div>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Potrjeno +${xp} XP</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    addXp(agentId, xp);
    logMission(agentId, "debriefing", xp, {label:"Debriefing"}, false);
    showScrollBurn("Debriefing", xp);
    setTimeout(() => showStamp("ANALIZA ✓", "green"), 400);
    if (typeof addSeasonXp === "function") addSeasonXp(agentId, xp);
    lonaToast(`Napaka → podatki. +${xp} XP`, "green");
  });
}

// ── INTEL REPORT ─────────────────────────────────────────────
function showIntelReport(agentId) {
  const name    = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const others  = LONA_CONFIG.agents.filter(a => a.id !== agentId);
  const other   = others[0];
  const xp      = LONA_CONFIG.missions.intel_report.baseXp;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🤝</div>
    <p class="joker-dialog__title">Intel Report</p>
    <p class="joker-dialog__body">
      <strong>${name}</strong> mora povedati<br>
      eno dobro stvar, ki jo je naredil/-a<br>
      <strong style="color:#007AFF">${other?.avatar} ${other?.name}</strong><br>
      ta teden.
    </p>
    <p style="font-size:.75rem;color:#8E8E93;text-align:center">
      Starš potrdi da je poročilo iskreno.
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Potrjeno +${xp} XP</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    addXp(agentId, xp);
    logMission(agentId, "intel_report", xp, {label:"Intel Report"}, false);
    if (LONA_CONFIG.missions.intel_report.cooldownHrs) {
      setCooldown("intel_report", LONA_CONFIG.missions.intel_report.cooldownHrs);
    }
    showStamp("POROČILO ✓", "green");
    showXpFloat(xp);
    if (typeof addSeasonXp === "function") addSeasonXp(agentId, xp);
    lonaToast(`${name} +${xp} XP — Odličen intel! 🤝`, "green");
  });
}

// ── ADVOKAT ───────────────────────────────────────────────────
function showAdvokat(agentId) {
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const xp   = LONA_CONFIG.missions.advokat.baseXp;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">⚖️</div>
    <p class="joker-dialog__title">Sestanek Poveljstva</p>
    <p class="joker-dialog__body">
      <strong>${name}</strong> zahteva sestanek.<br>
      Mora argumentirati svojo zahtevo:
    </p>
    <div style="width:100%;display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F2F2F7;border-radius:10px;border:2px solid #C7C7CC">
        <span style="font-size:1rem">🎯</span>
        <span style="font-size:.8rem;font-weight:700">Kaj zahteva?</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F2F2F7;border-radius:10px;border:2px solid #C7C7CC">
        <span style="font-size:1rem">⚖️</span>
        <span style="font-size:.8rem;font-weight:700">Zakaj je to pošteno?</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F2F2F7;border-radius:10px;border:2px solid #C7C7CC">
        <span style="font-size:1rem">🤝</span>
        <span style="font-size:.8rem;font-weight:700">Kaj ponudi v zameno?</span>
      </div>
    </div>
    <p style="font-size:.72rem;color:#8E8E93;text-align:center">XP dobi za pristop, ne za izid.</p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Dober argument +${xp} XP</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    addXp(agentId, xp);
    logMission(agentId, "advokat", xp, {label:"Advokat"}, false);
    showScrollBurn("Advokat", xp);
    setTimeout(() => showStamp("ARGUMENT ✓", "green"), 400);
    if (typeof addSeasonXp === "function") addSeasonXp(agentId, xp);
    lonaToast(`${name} +${xp} XP — Odlična argumentacija!`, "green");
  });
}

// ── EQ ROUTER ────────────────────────────────────────────────
function handleEqMission(agentId, mission) {
  switch(mission.eqType) {
    case "nevtralizator": showNevtralizator(agentId); break;
    case "debriefing":    showDebriefing(agentId);    break;
    case "intel_report":  showIntelReport(agentId);   break;
    case "advokat":       showAdvokat(agentId);       break;
  }
}
