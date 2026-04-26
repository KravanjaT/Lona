// ============================================================
//  LONA OS — engine/attributes.js  (v2.6)
//  Gibalni atributi — vizualni stats + aktivni XP bonus
// ============================================================

const LS_ATTRS = "lona_attributes";

function attrsLoad() {
  return JSON.parse(localStorage.getItem(LS_ATTRS) || "{}");
}
function attrsSave(s) { localStorage.setItem(LS_ATTRS, JSON.stringify(s)); }

function getAttrXp(agentId, attrId) {
  const s = attrsLoad();
  return s[agentId]?.[attrId] ?? 0;
}

function getAttrLevel(agentId, attrId) {
  const attr = LONA_CONFIG.attributes[attrId];
  if (!attr) return 0;
  return Math.min(4, Math.floor(getAttrXp(agentId, attrId) / attr.xpPerLevel));
}

function getAttrTitle(agentId, attrId) {
  const attr  = LONA_CONFIG.attributes[attrId];
  const level = getAttrLevel(agentId, attrId);
  return attr?.titles[level] || "";
}

/** Dodaj XP atributu ko agent opravi misijo */
function addAttrXp(agentId, missionId, baseXp) {
  const attrs = LONA_CONFIG.attributes;
  const state = attrsLoad();
  if (!state[agentId]) state[agentId] = {};

  let bonusXp = 0;

  Object.values(attrs).forEach(attr => {
    if (!attr.missions.includes(missionId)) return;

    const prevLevel = getAttrLevel(agentId, attr.id);
    state[agentId][attr.id] = (state[agentId][attr.id] ?? 0) + Math.round(baseXp * 0.5);
    const newLevel  = Math.min(4, Math.floor(state[agentId][attr.id] / attr.xpPerLevel));

    // Level up — pokazi obvestilo
    if (newLevel > prevLevel) {
      setTimeout(() => _showAttrLevelUp(agentId, attr, newLevel), 800);
    }

    // Aktivni bonus — višji level = +bonus%
    const bonusPct = newLevel * 0.05; // +5% na level
    bonusXp += Math.round(baseXp * bonusPct);
  });

  attrsSave(state);
  return bonusXp; // Vrne bonus XP ki se doda k misiji
}

function _showAttrLevelUp(agentId, attr, newLevel) {
  const title = attr.titles[newLevel];
  const name  = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box" style="text-align:center">
    <div style="font-size:2.5rem;margin-bottom:4px">${attr.icon}</div>
    <p style="font-size:.6rem;font-weight:900;letter-spacing:.15em;text-transform:uppercase;color:${attr.color};margin-bottom:6px">ATRIBUT NAPREDEK</p>
    <p style="font-family:'Nunito',sans-serif;font-size:1.1rem;font-weight:900;color:#1C1C1E;margin-bottom:4px">${attr.label}</p>
    <p style="font-size:1.4rem;font-weight:900;color:${attr.color};margin-bottom:8px">${title}</p>
    <p style="font-size:.8rem;color:#8E8E93;margin-bottom:14px">${name} je dosegel nov nivo ${attr.label.toLowerCase()}!<br>Bonus XP na teh misijah: <strong style="color:${attr.color}">+${newLevel*5}%</strong></p>
    <button class="joker-dialog__confirm" style="width:100%;background:${attr.color}">Odlično! 💪</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (typeof showConfetti === "function") showConfetti();
  });
}

/** Renderira attribute panel na profilu */
function renderAttributes(agentId) {
  const el = document.getElementById("attributes-panel");
  if (!el) return;

  const attrs = LONA_CONFIG.attributes;

  el.innerHTML = Object.values(attrs).map(attr => {
    const xp    = getAttrXp(agentId, attr.id);
    const level = getAttrLevel(agentId, attr.id);
    const title = attr.titles[level];
    const pct   = Math.min(100, Math.round((xp % attr.xpPerLevel) / attr.xpPerLevel * 100));
    const bonusPct = level * 5;

    return `<div class="attr-row">
      <div class="attr-row__left">
        <span class="attr-row__icon">${attr.icon}</span>
        <div>
          <p class="attr-row__label">${attr.label}</p>
          <p class="attr-row__title" style="color:${attr.color}">${title}</p>
        </div>
      </div>
      <div class="attr-row__right">
        <div class="attr-bar">
          <div class="attr-bar__fill" style="width:${pct}%;background:${attr.color}"></div>
        </div>
        <p class="attr-row__bonus">${bonusPct > 0 ? '+'+bonusPct+'% XP' : 'Lv.'+level}</p>
      </div>
    </div>`;
  }).join("");
}

/** Renderira mini attribute hexagon na indexu */
function renderAttrsMini(agentId) {
  const el = document.getElementById("attrs-mini");
  if (!el) return;

  const attrs = LONA_CONFIG.attributes;
  el.innerHTML = Object.values(attrs).map(attr => {
    const level = getAttrLevel(agentId, attr.id);
    const pct   = Math.min(100, Math.round(getAttrXp(agentId, attr.id) / (attr.xpPerLevel * 4) * 100));
    return `<div class="attr-mini" title="${attr.label}: ${attr.titles[level]}">
      <div class="attr-mini__bar" style="height:${Math.max(8, pct*0.5)}px;background:${attr.color}"></div>
      <span class="attr-mini__icon">${attr.icon}</span>
    </div>`;
  }).join("");
}

function initAttributes() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : LONA_CONFIG.agents[0].id;
  renderAttributes(agentId);
  renderAttrsMini(agentId);
}
