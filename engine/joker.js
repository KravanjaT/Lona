// ============================================================
//  LONA OS — engine/joker.js  (v2.6)
// ============================================================

const LS_JK = "lona_jokers";

function jkLoad() {
  const s = localStorage.getItem(LS_JK);
  if (s) return JSON.parse(s);
  const d = {};
  LONA_CONFIG.agents.forEach(a => { d[a.id] = a.jokers ?? 0; });
  return d;
}

function jkSave(s) { localStorage.setItem(LS_JK, JSON.stringify(s)); }

function getJokers(agentId) { return jkLoad()[agentId] ?? 0; }

function spendJoker(agentId) {
  const s = jkLoad();
  if ((s[agentId] ?? 0) <= 0) return false;
  s[agentId]--;
  jkSave(s);
  renderJokers(agentId);
  return true;
}

function grantJoker(agentId) {
  const s   = jkLoad();
  const max = LONA_CONFIG.joker.maxPerAgent ?? 5;
  s[agentId] = Math.min((s[agentId] ?? 0) + 1, max);
  jkSave(s);
  renderJokers(agentId);
}

function renderJokers(agentId) {
  const row = document.querySelector(`.agent-row[data-agent="${agentId}"]`);
  if (!row) return;
  const count = row.querySelector(".joker-count");
  if (count) count.textContent = getJokers(agentId);
}

function promptJokerUse(agentId, missionId) {
  const count = getJokers(agentId);
  const name  = LONA_CONFIG.agents.find(a => a.id === agentId)?.name ?? agentId;
  const label = LONA_CONFIG.missions[missionId]?.label ?? missionId;

  if (count <= 0) { lonaToast("Nimaš Jokerjev! 🃏", "red"); return; }

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🃏</div>
    <p class="joker-dialog__title">Uporabi Joker?</p>
    <p class="joker-dialog__body"><strong>${name}</strong> ima <strong>${count}</strong> Joker${count > 1 ? "je" : ""}.<br>Odkleni <em>${label}</em>?</p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Ne</button>
      <button class="joker-dialog__confirm">Uporabi 🃏</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (spendJoker(agentId)) {
      localStorage.removeItem("lona_cooldown_" + missionId);
      renderCooldown(missionId);
      lonaToast("Joker uporabljen! Misija odklenjena 🃏", "gold");
    }
  });
}

function initJokers() {
  LONA_CONFIG.agents.forEach(a => renderJokers(a.id));
}

function initJokers() {
  // Naloži shranjeno stanje ali config defaults
  const state = jkLoad();
  LONA_CONFIG.agents.forEach(a => {
    if (!(a.id in state)) state[a.id] = a.jokers ?? 0;
  });
  jkSave(state);
  LONA_CONFIG.agents.forEach(a => renderJokers(a.id));
}
