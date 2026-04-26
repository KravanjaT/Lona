// ============================================================
//  LONA OS — engine/xp.js  (v2.6)
// ============================================================

const LS_XP = "lona_xp_state";
const LS_RANK = "lona_rank_state"; // Rang se nikoli ne zniža

function xpLoadState() {
  const s = localStorage.getItem(LS_XP);
  if (s) return JSON.parse(s);
  const d = {};
  LONA_CONFIG.agents.forEach(a => { d[a.id] = a.xp; });
  return d;
}

function xpSaveState(s) { localStorage.setItem(LS_XP, JSON.stringify(s)); }

function rankLoadState() {
  const s = localStorage.getItem(LS_RANK);
  if (s) return JSON.parse(s);
  const d = {};
  LONA_CONFIG.agents.forEach(a => { d[a.id] = 0; });
  return d;
}

function rankSaveState(s) { localStorage.setItem(LS_RANK, JSON.stringify(s)); }

function getXp(agentId) {
  return xpLoadState()[agentId] ?? 0;
}

// Rang temelji na MAX doseženih XP — nikoli ne pade
function getMaxXp(agentId) {
  const ranks = rankLoadState();
  return ranks[agentId] ?? getXp(agentId);
}

function getRank(xp) {
  const ranks = [...LONA_CONFIG.ranks].reverse();
  return ranks.find(r => xp >= r.minXp)?.label || LONA_CONFIG.ranks[0].label;
}

function addXp(agentId, amount) {
  // Double XP event
  if (amount > 0 && typeof isDoubleXpActive === "function" && isDoubleXpActive()) {
    amount = amount * 2;
  }
  const state  = xpLoadState();
  const prevXp = state[agentId] ?? 0;
  const newXp  = Math.max(0, prevXp + amount); // Ne gre pod 0
  state[agentId] = newXp;
  xpSaveState(state);

  // Posodobi max XP za rang
  const rankState = rankLoadState();
  if (newXp > (rankState[agentId] ?? 0)) {
    rankState[agentId] = newXp;
    rankSaveState(rankState);
  }

  renderAgentCard(agentId);
  updateGoalBar();
  if (typeof renderTreasury === "function") setTimeout(renderTreasury, 100);
  if (typeof renderCmdAgents === "function") setTimeout(renderCmdAgents, 50);

  // Rank up — temelji na max XP
  const maxXp = getMaxXp(agentId);
  if (amount > 0 && getRank(prevXp) !== getRank(maxXp)) {
    showRankUpModal(agentId, getRank(maxXp));
  }
}

function renderAgentCard(agentId) {
  const xp    = getXp(agentId);
  const maxXp = getMaxXp(agentId);
  const rank  = getRank(maxXp);

  // ── INDEX.HTML: Agent Hero ──────────────────────────────
  const currentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : agentId;
  if (agentId === currentId) {
    const nameEl  = document.getElementById("hero-name");
    const rankEl  = document.getElementById("hero-rank");
    const xpEl    = document.getElementById("hero-xp-val");
    const barEl   = document.getElementById("hero-bar-fill");
    const loEl    = document.getElementById("hero-bar-lo");
    const hiEl    = document.getElementById("hero-bar-hi");
    const nextEl  = document.getElementById("hero-bar-next");
    const jokEl   = document.getElementById("hero-joker-count");

    const agentCfg = LONA_CONFIG.agents.find(a => a.id === agentId);
    if (nameEl)  nameEl.textContent  = agentCfg?.name  || agentId;
    if (rankEl)  rankEl.textContent  = rank;
    if (xpEl)    xpEl.textContent    = xp;
    if (jokEl && typeof getJokers === "function") jokEl.textContent = getJokers(agentId);

    // Avatar — slika ali emoji
    const avatarEl = document.getElementById("hero-avatar");
    if (avatarEl) {
      if (agentCfg?.photo) {
        avatarEl.innerHTML = `<img src="${agentCfg.photo}" alt="${agentCfg.name}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%" onerror="this.outerHTML='${agentCfg.avatar}'">`;
      } else {
        avatarEl.textContent = agentCfg?.avatar || "⚡";
      }
    }

    // XP bar
    if (barEl) {
      const ranks = LONA_CONFIG.ranks;
      const ci    = ranks.findIndex(r => r.minXp > maxXp);
      const lo    = ranks[Math.max(0, ci-1)]?.minXp ?? 0;
      const hi    = ranks[ci]?.minXp ?? lo + 300;
      const pct   = Math.min(100, Math.round(((maxXp-lo)/(hi-lo))*100));
      barEl.style.width = pct + "%";
      if (loEl)   loEl.textContent  = lo;
      if (hiEl)   hiEl.textContent  = hi;
      if (nextEl) nextEl.textContent = ranks[ci]?.label ?? "Kapitan ✓";
    }

    // Medalje v krogu
    _renderBadges(agentId);

    // Flash
    const hero = document.getElementById("agent-hero");
    if (hero) {
      hero.style.transition = "box-shadow .15s ease";
      hero.style.boxShadow  = "0 0 0 2px #2D7D52";
      setTimeout(() => { hero.style.boxShadow = ""; }, 600);
    }
  }

  // ── PROFILE.HTML hero ───────────────────────────────────
  const heroXp   = document.getElementById("hero-xp");
  const heroRank = document.getElementById("hero-rank");
  const heroBar  = document.getElementById("hero-bar");
  if (heroXp)   heroXp.textContent   = xp;
  if (heroRank) heroRank.textContent = rank;
  if (heroBar)  _setXpBar(heroBar, xp, maxXp, true);
}

function _renderBadges(agentId) {
  const ring = document.getElementById("hero-badge-ring");
  if (!ring) return;

  const badges = JSON.parse(localStorage.getItem("lona_badges_" + agentId) || "[]");

  if (badges.length === 0) {
    ring.innerHTML = '<div class="badge-ring-empty"></div>';
    return;
  }

  const icons = {
    kuhanje_mojster:    "👨‍🍳", mizarstvo_mojster:  "🪚",
    kuhanje_pomocnik:   "🔧",  kuhanje_vajenec:    "🌱",
    mizarstvo_vajenec:  "🌱",  mizarstvo_pomocnik: "🔧",
    voda_mojster:       "💧",  blackout_mojster:   "🔦",
    diplomat_mojster:   "🎩",
  };

  // Razporedi v krogu
  const count  = Math.min(badges.length, 8);
  const radius = 68; // px od centra
  ring.innerHTML = badges.slice(0, count).map((b, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const x = 80 + radius * Math.cos(angle);
    const y = 80 + radius * Math.sin(angle);
    const icon = icons[b] || "⭐";
    return `<div class="badge-ring-item" style="left:${x}px;top:${y}px" title="${b}">${icon}</div>`;
  }).join("");
}

function _setXpBar(el, xp, maxXp, useWidth) {
  const ranks = LONA_CONFIG.ranks;
  const ci    = ranks.findIndex(r => r.minXp > maxXp);
  const lo    = ranks[Math.max(0, ci - 1)]?.minXp ?? 0;
  const hi    = ranks[ci]?.minXp ?? lo + 300;
  const pct   = Math.min(100, Math.round(((maxXp - lo) / (hi - lo)) * 100));
  if (useWidth) {
    el.style.width = pct + "%";
  } else {
    el.style.setProperty("--fill", pct + "%");
  }
}

function updateGoalBar() {
  const state = xpLoadState();
  const total = Object.values(state).reduce((s, v) => s + v, 0);
  const goal  = LONA_CONFIG.globalGoal;
  const pct   = Math.min(100, Math.round((total / goal.target) * 100));

  const fillEl = document.querySelector(".goal__bar-fill, .shared-goal__bar-fill");
  const curEl  = document.getElementById("goal-current");
  const remEl  = document.getElementById("goal-remaining");

  if (fillEl) fillEl.style.setProperty("--fill", pct + "%");
  if (curEl)  curEl.textContent = total;
  if (remEl)  remEl.textContent = Math.max(0, goal.target - total) + " XP";

  // Osvetli nagrade — samo vizualno, tekst se ne spreminja
  document.querySelectorAll("[data-cost][data-shared='true']").forEach(item => {
    item.classList.toggle("reward-item--active", total >= parseInt(item.dataset.cost));
  });
  const maxAgXp = Math.max(...LONA_CONFIG.agents.map(a => getXp(a.id)));
  document.querySelectorAll("[data-cost]:not([data-shared='true'])").forEach(item => {
    item.classList.toggle("reward-item--active", maxAgXp >= parseInt(item.dataset.cost));
  });
}

function showRankUpModal(agentId, newRank) {
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name ?? agentId;
  const m    = document.createElement("div");
  m.className = "rankup-modal";
  m.innerHTML = `<div class="rankup-modal__box">
    <div class="rankup-modal__icon">🏆</div>
    <p class="rankup-modal__label">RANK UP!</p>
    <p class="rankup-modal__agent">${name}</p>
    <p class="rankup-modal__rank">${newRank}</p>
    <button class="btn-primary rankup-modal__close">Nadaljuj</button>
  </div>`;
  document.body.appendChild(m);
  m.querySelector(".rankup-modal__close").addEventListener("click", () => m.remove());
  setTimeout(() => { if (m.parentNode) m.remove(); }, 5000);
}

function initXp() {
  const state = xpLoadState();
  LONA_CONFIG.agents.forEach(a => {
    if (!(a.id in state)) state[a.id] = a.xp;
  });
  xpSaveState(state);

  const rankState = rankLoadState();
  LONA_CONFIG.agents.forEach(a => {
    if (!(a.id in rankState)) rankState[a.id] = state[a.id] ?? 0;
  });
  rankSaveState(rankState);

  // Renderiraj vse agente (HQ panel jih prikaže oba)
  LONA_CONFIG.agents.forEach(a => renderAgentCard(a.id));
  updateGoalBar();
}
