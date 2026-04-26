// ============================================================
//  LONA OS — engine/streak.js  (v2.6)
//  Streak sistem + Combo bonus
// ============================================================

const LS_STREAK = "lona_streak";
const LS_COMBO  = "lona_combo";

// ── STREAK ──────────────────────────────────────────────────

function streakLoad() {
  return JSON.parse(localStorage.getItem(LS_STREAK) || "{}");
}
function streakSave(s) { localStorage.setItem(LS_STREAK, JSON.stringify(s)); }

function todayStr() { return new Date().toISOString().slice(0,10); }
function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate()-1);
  return d.toISOString().slice(0,10);
}

function getStreak(agentId) {
  const s = streakLoad();
  return s[agentId] || { count: 0, lastDay: null, best: 0 };
}

function updateStreak(agentId) {
  const state = streakLoad();
  const ag    = state[agentId] || { count: 0, lastDay: null, best: 0 };
  const today = todayStr();
  const yest  = yesterdayStr();

  if (ag.lastDay === today) return ag; // Že posodobljen danes

  if (ag.lastDay === yest) {
    ag.count++;                        // Nadaljevanje streaka
  } else {
    ag.count = 1;                      // Reset
  }

  ag.lastDay = today;
  ag.best    = Math.max(ag.best, ag.count);
  state[agentId] = ag;
  streakSave(state);
  return ag;
}

function getStreakBonus(agentId) {
  const streak = getStreak(agentId);
  const count  = streak.count;
  if (count >= 7)  return 0.30; // +30%
  if (count >= 5)  return 0.20; // +20%
  if (count >= 3)  return 0.10; // +10%
  return 0;
}

// ── COMBO ────────────────────────────────────────────────────

function comboLoad() {
  return JSON.parse(localStorage.getItem(LS_COMBO) || "{}");
}
function comboSave(s) { localStorage.setItem(LS_COMBO, JSON.stringify(s)); }

function getTodayMissionCount(agentId) {
  const log   = JSON.parse(localStorage.getItem("lona_mission_log") || "[]");
  const today = todayStr();
  return log.filter(e => e.agentId === agentId && e.date?.slice(0,10) === today).length;
}

function getComboBonus(agentId) {
  const count = getTodayMissionCount(agentId);
  if (count >= 5) return 0.30; // +30%
  if (count >= 3) return 0.20; // +20%
  if (count >= 2) return 0.10; // +10%
  return 0;
}

function getComboLabel(agentId) {
  const count = getTodayMissionCount(agentId);
  if (count >= 5) return "🔥🔥🔥 MEGA COMBO";
  if (count >= 3) return "🔥🔥 COMBO";
  if (count >= 2) return "🔥 COMBO";
  return null;
}

// ── SKUPNI BONUS ─────────────────────────────────────────────

function applyBonuses(agentId, baseXp) {
  const streakPct = getStreakBonus(agentId);
  const comboPct  = getComboBonus(agentId);
  const totalPct  = streakPct + comboPct;
  const bonus     = Math.round(baseXp * totalPct);
  return { bonus, streakPct, comboPct, totalPct };
}

// ── RENDER ───────────────────────────────────────────────────

function renderStreak(agentId) {
  const el = document.getElementById("streak-display");
  if (!el) return;

  const streak      = getStreak(agentId);
  const count       = streak.count;
  const best        = streak.best;
  const bonus       = Math.round(getStreakBonus(agentId) * 100);
  const missionCount = getTodayMissionCount(agentId);
  const comboBonus  = Math.round(getComboBonus(agentId) * 100);
  const comboLabel  = getComboLabel(agentId);

  // Streak ognji
  const flames = count > 0
    ? Array(Math.min(count, 7)).fill("🔥").join("")
    : "❄️";

  el.innerHTML = `
    <div class="streak-row">
      <div class="streak-main">
        <span class="streak-flames">${flames}</span>
        <div>
          <p class="streak-count">${count} <span class="streak-days">dni zapored</span></p>
          <p class="streak-best">Rekord: ${best} dni</p>
        </div>
      </div>
      ${bonus > 0 ? `<span class="streak-bonus">+${bonus}% XP</span>` : ''}
    </div>
    ${comboLabel ? `
    <div class="combo-row">
      <span class="combo-label">${comboLabel}</span>
      <span class="combo-bonus">+${comboBonus}% XP</span>
      <span class="combo-count">${missionCount} misij danes</span>
    </div>` : `
    <div class="combo-row combo-row--inactive">
      <span style="font-size:.75rem;color:rgba(255,255,255,.4)">
        ${2 - missionCount > 0 ? `Še ${2 - missionCount} misij za Combo 🔥` : 'Dobro jutro Agent!'}
      </span>
    </div>`}
  `;
}

// ── STREAK MILESTONE ─────────────────────────────────────────

function checkStreakMilestone(agentId, streak) {
  const milestones = [3, 5, 7, 14, 30];
  if (!milestones.includes(streak.count)) return;

  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const msgs = {
    3:  ["🔥 3 dni zapored!", "Začetek dobre navade!"],
    5:  ["🔥🔥 5 dni!", "Ti si neustavljiv/-a!"],
    7:  ["⭐ TEDEN ZMAG!", "Cel teden — to je res!", "+30% XP bonus aktiviran!"],
    14: ["🏆 2 TEDNA!", "Legendarni status!"],
    30: ["👑 MESEC ZMAG!", "To je LONA legenda!"],
  };
  const [icon, title, sub] = msgs[streak.count] || ["🔥", "Streak!", ""];

  setTimeout(() => {
    const d = document.createElement("div");
    d.className = "joker-dialog";
    d.innerHTML = `<div class="joker-dialog__box" style="text-align:center">
      <div style="font-size:3rem;margin-bottom:4px">${icon}</div>
      <p style="font-size:.6rem;font-weight:900;letter-spacing:.15em;text-transform:uppercase;color:#FF9500;margin-bottom:6px">STREAK MILESTONE</p>
      <p style="font-family:'Nunito',sans-serif;font-size:1.4rem;font-weight:900;color:#1C1C1E;margin-bottom:4px">${title}</p>
      <p style="font-size:.85rem;color:#FF9500;font-weight:700;margin-bottom:4px">${name} · ${streak.count} dni zapored</p>
      ${sub ? `<p style="font-size:.78rem;color:#8E8E93;margin-bottom:12px">${sub}</p>` : '<div style="margin-bottom:12px"></div>'}
      <button class="joker-dialog__confirm" style="width:100%;background:#FF9500" onclick="this.closest('.joker-dialog').remove()">Naprej! 🔥</button>
    </div>`;
    document.body.appendChild(d);
    if (typeof showConfetti === "function") showConfetti();
  }, 1500);
}

// ── COMBO ANIMACIJA ──────────────────────────────────────────

function showComboAnimation(agentId, bonusXp) {
  const label = getComboLabel(agentId);
  if (!label || bonusXp <= 0) return;

  const el = document.createElement("div");
  el.style.cssText = `
    position:fixed;top:30%;left:50%;transform:translateX(-50%) scale(0);
    z-index:9300;font-family:'Nunito',sans-serif;font-size:2rem;font-weight:900;
    color:#FF9500;text-shadow:0 0 20px rgba(255,149,0,.5);
    animation:combo-pop .6s cubic-bezier(.17,.67,.35,1.4) forwards;
    pointer-events:none;white-space:nowrap;
  `;
  el.textContent = label + " +" + bonusXp + " XP";
  document.body.appendChild(el);

  const style = document.createElement("style");
  style.textContent = `@keyframes combo-pop {
    0%{transform:translateX(-50%) scale(0) rotate(-5deg);opacity:0}
    50%{transform:translateX(-50%) scale(1.2) rotate(2deg);opacity:1}
    70%{transform:translateX(-50%) scale(.95) rotate(-1deg)}
    80%{transform:translateX(-50%) scale(1);opacity:1}
    100%{transform:translateX(-50%) scale(1) translateY(-40px);opacity:0}
  }`;
  document.head.appendChild(style);
  setTimeout(() => { el.remove(); style.remove(); }, 1800);
}

function initStreak() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : LONA_CONFIG.agents[0].id;
  // Posodobi streak ob zagonu (novi dan)
  const streak = updateStreak(agentId);
  if (streak.count > 1) checkStreakMilestone(agentId, streak);
  renderStreak(agentId);
}

function renderStreakProfile(agentId) {
  const el = document.getElementById("streak-profile");
  if (!el) return;
  const streak = getStreak(agentId);
  const bonus  = Math.round(getStreakBonus(agentId) * 100);
  const flames = streak.count > 0 ? Array(Math.min(streak.count, 7)).fill("🔥").join("") : "❄️";

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;padding:14px;background:linear-gradient(135deg,#1C1C2E,#2D1B4E);border-radius:16px">
      <span style="font-size:2rem;letter-spacing:-2px">${flames}</span>
      <div style="flex:1">
        <p style="font-family:'Nunito',sans-serif;font-size:1.2rem;font-weight:900;color:#fff">
          ${streak.count} dni zapored
        </p>
        <p style="font-size:.65rem;font-weight:700;color:rgba(255,255,255,.4)">
          Rekord: ${streak.best} dni
        </p>
      </div>
      ${bonus > 0 ? `<span style="font-family:'Nunito',sans-serif;font-size:.88rem;font-weight:900;color:#FFD60A;background:rgba(255,214,10,.15);padding:4px 12px;border-radius:20px">+${bonus}% XP</span>` : ''}
    </div>
  `;
}
