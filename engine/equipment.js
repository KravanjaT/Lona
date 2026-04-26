// ============================================================
//  LONA OS — engine/equipment.js  (v2.6)
//  Oprema = Licenca — odklene se z mastery, ne z zlatom
// ============================================================

const LS_EQUIP = "lona_equipment";

function getEquipment(agentId) {
  const s = localStorage.getItem(LS_EQUIP);
  const all = s ? JSON.parse(s) : {};
  return all[agentId] || [];
}

function hasEquipment(agentId, equipId) {
  return getEquipment(agentId).includes(equipId);
}

function unlockEquipment(agentId, equipId) {
  const s    = localStorage.getItem(LS_EQUIP);
  const all  = s ? JSON.parse(s) : {};
  if (!all[agentId]) all[agentId] = [];
  if (!all[agentId].includes(equipId)) {
    all[agentId].push(equipId);
    localStorage.setItem(LS_EQUIP, JSON.stringify(all));
    _showEquipmentUnlock(agentId, equipId);
    renderEquipment(agentId);
  }
}

function _showEquipmentUnlock(agentId, equipId) {
  const item  = LONA_CONFIG.equipment.find(e => e.id === equipId);
  const agent = LONA_CONFIG.agents.find(a => a.id === agentId);
  if (!item) return;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box" style="text-align:center">
    <div style="font-size:3rem;margin-bottom:4px;animation:chest-glow 1.5s infinite">${item.icon}</div>
    <p style="font-size:.6rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#C47D1A;margin-bottom:6px">NOVA OPREMA</p>
    <p style="font-family:'DM Serif Display',serif;font-size:1.3rem;color:#1A1714;margin-bottom:6px">${item.label}</p>
    <p style="font-size:.8rem;color:#4A4540;margin-bottom:14px;font-style:italic">"${item.description}"</p>
    <p style="font-size:.75rem;color:#8A8480;margin-bottom:12px">${agent?.name} je zaslužil/-a to opremo z resničnim znanjem.</p>
    <button class="joker-dialog__confirm" style="width:100%">Sprejmi opremo ⚔️</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (typeof showConfetti === "function") showConfetti();
  });
  if (typeof _playSound === "function") _playSound("coin");
}

function checkEquipmentUnlocks(agentId) {
  // Preveri mastery levels
  const masteryItems = LONA_CONFIG.equipment.filter(e => e.unlockedBy?.skill);
  masteryItems.forEach(item => {
    if (hasEquipment(agentId, item.id)) return;
    const { skill, level } = item.unlockedBy;
    const current = typeof getMasteryLevel === "function"
      ? getMasteryLevel(agentId, skill) : 0;
    if (current >= level) {
      unlockEquipment(agentId, item.id);
    }
  });
}

function renderEquipment(agentId) {
  const el = document.getElementById("equipment-grid");
  if (!el) return;

  const owned = getEquipment(agentId);
  const items = LONA_CONFIG.equipment || [];

  el.innerHTML = items.map(item => {
    const isOwned  = owned.includes(item.id);
    const unlock   = item.unlockedBy;
    const skillLvl = unlock?.skill && typeof getMasteryLevel === "function"
      ? getMasteryLevel(agentId, unlock.skill) : 0;
    const skillNeeded = unlock?.level || 1;
    const skillCfg    = unlock?.skill ? LONA_CONFIG.masterySkills[unlock.skill] : null;

    if (isOwned) {
      return `<div class="equip-item equip-item--owned" title="${item.description}">
        <span class="equip-item__icon">${item.icon}</span>
        <span class="equip-item__label">${item.label}</span>
        <span class="equip-item__badge">✓</span>
      </div>`;
    } else {
      const hint = skillCfg
        ? `${skillCfg.label} lv.${skillNeeded}`
        : "???";
      return `<div class="equip-item equip-item--locked" title="${hint}">
        <span class="equip-item__icon" style="filter:grayscale(1);opacity:.3">${item.icon}</span>
        <span class="equip-item__label" style="color:#C4BFB8">${item.label}</span>
        <span class="equip-item__hint">${hint}</span>
      </div>`;
    }
  }).join("");
}

function initEquipment() {
  const agentId = typeof getCurrentAgent === "function"
    ? getCurrentAgent() : LONA_CONFIG.agents[0].id;
  checkEquipmentUnlocks(agentId);
  renderEquipment(agentId);
}
