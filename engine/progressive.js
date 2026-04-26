// ============================================================
//  LONA OS — engine/progressive.js  (v2.6)
//  Progressive misije — strah + samostojnost (3 stopnje)
// ============================================================

const LS_PROG = "lona_progressive";

function progLoad() { return JSON.parse(localStorage.getItem(LS_PROG) || "{}"); }
function progSave(s) { localStorage.setItem(LS_PROG, JSON.stringify(s)); }
function progKey(agentId, missionId) { return agentId + "__" + missionId; }

function getProgLevel(agentId, missionId) {
  return progLoad()[progKey(agentId, missionId)] ?? 0;
}

function handleProgressiveMission(agentId, mission) {
  const level    = getProgLevel(agentId, mission.id);
  const levels   = mission.levels || [];
  const name     = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const catLabel = mission.category === "fear" ? "Strah Protokol 🌙" : "Samostojnost 🎯";
  const catColor = mission.category === "fear" ? "#AF52DE" : "#007AFF";

  const d = document.createElement("div");
  d.className = "joker-dialog";

  // Prikaz vseh stopenj
  const stepsHtml = levels.map((l, i) => {
    const done    = i < level;
    const active  = i === level;
    const locked  = i > level;
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;
      border-radius:12px;border:2px solid ${done ? '#34C759' : active ? catColor : '#C7C7CC'};
      background:${done ? '#EDFFF3' : active ? 'rgba(0,122,255,.06)' : '#F2F2F7'};
      margin-bottom:6px;opacity:${locked ? '.5' : '1'}">
      <span style="font-size:1.1rem;flex-shrink:0">${done ? '✅' : active ? '▶️' : '🔒'}</span>
      <div style="flex:1">
        <p style="font-size:.72rem;font-weight:800;color:${done ? '#34C759' : active ? catColor : '#8E8E93'};
          margin-bottom:2px">Stopnja ${i + 1} · +${l.xp} XP</p>
        <p style="font-size:.82rem;font-weight:700;color:${locked ? '#8E8E93' : '#1C1C1E'};line-height:1.3">${l.label}</p>
      </div>
    </div>`;
  }).join("");

  const currentLevel = levels[level];
  const isComplete   = level >= levels.length;

  d.innerHTML = `<div class="joker-dialog__box" style="max-width:360px;width:calc(100% - 32px)">
    <div style="font-size:2.2rem;margin-bottom:4px">${mission.icon}</div>
    <p style="font-size:.6rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:${catColor};margin-bottom:4px">${catLabel}</p>
    <p style="font-family:'Nunito',sans-serif;font-size:1.2rem;font-weight:900;color:#1C1C1E;margin-bottom:12px">${mission.label}</p>
    <div style="width:100%">${stepsHtml}</div>
    ${isComplete
      ? `<p style="font-size:.85rem;font-weight:800;color:#34C759;text-align:center;padding:8px">🏆 Vse stopnje opravljene!</p>
         <button class="joker-dialog__cancel" style="width:100%;margin-top:4px" onclick="this.closest('.joker-dialog').remove()">Zapri</button>`
      : `<p style="font-size:.72rem;color:#8E8E93;text-align:center;margin-top:4px">
           <strong>${name}</strong> je na stopnji ${level + 1} od ${levels.length}
         </p>
         <div class="joker-dialog__btns" style="margin-top:8px">
           <button class="joker-dialog__cancel" onclick="this.closest('.joker-dialog').remove()">Prekliči</button>
           <button class="joker-dialog__confirm" style="background:${catColor}">
             Stopnja ${level + 1} opravljena ✓
           </button>
         </div>`
    }
  </div>`;

  document.body.appendChild(d);

  if (!isComplete) {
    d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
      d.remove();
      const xp = currentLevel.xp;

      // Napreduj na naslednjo stopnjo
      const state = progLoad();
      state[progKey(agentId, mission.id)] = level + 1;
      progSave(state);

      addXp(agentId, xp);
      logMission(agentId, mission.id, xp, {label: `${mission.label} L${level+1}`}, false);
      if (typeof addSeasonXp === "function") addSeasonXp(agentId, xp);
      if (typeof addAttrXp === "function") addAttrXp(agentId, mission.id, xp);

      const newLevel = level + 1;
      if (newLevel >= levels.length) {
        // Vse stopnje — epska animacija
        showScrollBurn(mission.label + " ★ ZAKLJUČENO", xp);
        setTimeout(() => showStamp("MOJSTER!", "gold"), 400);
        if (typeof showConfetti === "function") showConfetti();
        lonaToast(`${name} je zaključil ${mission.label}! 🏆`, "gold");
      } else {
        showScrollBurn(`${mission.label} — Stopnja ${level + 1}`, xp);
        setTimeout(() => showStamp(`STOPNJA ${level + 1} ✓`, "green"), 400);
        showXpFloat(xp);
        lonaToast(`+${xp} XP · Stopnja ${newLevel + 1} odklenjena!`, "green");
      }
    });
  }
}

function renderProgressiveMissions(agentId) {
  const fearEl = document.getElementById("fear-missions");
  const indeEl = document.getElementById("independence-missions");
  if (!fearEl && !indeEl) return;

  const missions = Object.values(LONA_CONFIG.missions).filter(m => m.isProgressive);

  const render = (el, category) => {
    if (!el) return;
    const filtered = missions.filter(m => m.category === category);
    el.innerHTML = filtered.map(m => {
      const level    = getProgLevel(agentId, m.id);
      const total    = m.levels?.length || 3;
      const done     = level >= total;
      const pct      = Math.round((level / total) * 100);
      const color    = category === "fear" ? "#AF52DE" : "#007AFF";
      const current  = m.levels?.[level];

      return `<div class="prog-card" onclick="handleProgressiveMission('${agentId}',LONA_CONFIG.missions['${m.id}'])">
        <div class="prog-card__top">
          <span class="prog-card__icon">${m.icon}</span>
          <div class="prog-card__info">
            <p class="prog-card__name">${m.label}</p>
            <p class="prog-card__level" style="color:${color}">
              ${done ? '🏆 Zaključeno!' : `Stopnja ${level + 1} / ${total}`}
            </p>
          </div>
          <span class="prog-card__xp" style="color:${done ? '#34C759' : color}">
            ${done ? '✓' : `+${current?.xp || 0} XP`}
          </span>
        </div>
        ${!done ? `<p class="prog-card__task">${current?.label || ''}</p>` : ''}
        <div class="prog-card__bar">
          <div class="prog-card__bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
    }).join("");
  };

  render(fearEl, "fear");
  render(indeEl, "independence");
}

function initProgressive() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : LONA_CONFIG.agents[0].id;
  renderProgressiveMissions(agentId);
}
