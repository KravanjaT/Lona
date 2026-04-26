// ============================================================
//  LONA OS — engine/mastery.js  (v2.6)
// ============================================================

const LS_MASTERY = "lona_mastery";

function masteryLoad() {
  return JSON.parse(localStorage.getItem(LS_MASTERY) || "{}");
}
function masterySave(s) { localStorage.setItem(LS_MASTERY, JSON.stringify(s)); }
function masteryKey(agentId, skillId) { return agentId + "__" + skillId; }

function getMasteryLevel(agentId, skillId) {
  return masteryLoad()[masteryKey(agentId, skillId)] ?? 0;
}

function canAdvance(agentId, skillId) {
  const level = getMasteryLevel(agentId, skillId);
  const skill = LONA_CONFIG.masterySkills[skillId];
  if (!skill) return false;
  const next = skill.levels[level + 1];
  if (!next) return false;
  if (next.xpCost > 0) return getXp(agentId) >= next.xpCost;
  return true;
}

function advanceMastery(agentId, skillId) {
  if (!canAdvance(agentId, skillId)) return false;
  const state   = masteryLoad();
  const key     = masteryKey(agentId, skillId);
  const level   = state[key] ?? 0;
  const skill   = LONA_CONFIG.masterySkills[skillId];
  const nextLvl = skill.levels[level + 1];

  if (nextLvl.xpCost > 0) addXp(agentId, -nextLvl.xpCost);
  state[key] = level + 1;
  masterySave(state);
  if (nextLvl.xpReward > 0) addXp(agentId, nextLvl.xpReward);
  if (nextLvl.unlocksBadge) grantBadge(agentId, nextLvl.unlocksBadge);
  renderMastery(agentId);
  return true;
}

function grantBadge(agentId, badgeId) {
  const key    = "lona_badges_" + agentId;
  const badges = JSON.parse(localStorage.getItem(key) || "[]");
  if (!badges.includes(badgeId)) { badges.push(badgeId); localStorage.setItem(key, JSON.stringify(badges)); }
}

function toggleMasteryCard(skillId) {
  document.querySelector(`.mastery-card[data-skill="${skillId}"]`)?.classList.toggle("mastery-card--open");
}

function renderMastery(agentId) {
  document.querySelectorAll(".mastery-card[data-skill]").forEach(card => {
    const skillId = card.dataset.skill;
    const skill   = LONA_CONFIG.masterySkills[skillId];
    if (!skill) return;
    const level = getMasteryLevel(agentId, skillId);
    const curEl = card.querySelector(".mastery-card__current-level");
    if (curEl) { const l = skill.levels[level]; curEl.textContent = l.icon + " " + l.label; }
    skill.levels.forEach((lvl, i) => {
      const step = card.querySelector(`.mastery-step[data-level="${i}"]`);
      if (!step) return;
      step.classList.remove("mastery-step--done","mastery-step--active","mastery-step--locked");
      if (i < level)       step.classList.add("mastery-step--done");
      else if (i === level) step.classList.add("mastery-step--active");
      else                  step.classList.add("mastery-step--locked");
    });
    const advBtn = card.querySelector(".mastery-advance-btn");
    if (advBtn) { const ok = canAdvance(agentId, skillId); advBtn.disabled = !ok; advBtn.style.opacity = ok ? "1" : "0.4"; }
  });
}

function initMastery() {
  initMasterySelects();
  document.querySelectorAll(".mastery-card__head--toggle").forEach(head => {
    head.addEventListener("click", () => {
      const skillId = head.closest(".mastery-card")?.dataset.skill;
      if (skillId) toggleMasteryCard(skillId);
    });
  });
  document.querySelectorAll(".mastery-advance-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card    = btn.closest(".mastery-card");
      const skillId = card?.dataset.skill;
      // Agent iz selecta v tej kartici
      const sel     = card?.querySelector(".mastery-agent-select");
      const agentId = sel?.value || btn.dataset.agent || LONA_CONFIG.agents[0].id;
      if (skillId && agentId) {
        if (!canAdvance(agentId, skillId)) {
          const needed = LONA_CONFIG.masterySkills[skillId]?.levels[(getMasteryLevel(agentId,skillId)||0)+1]?.xpCost || 0;
          lonaToast(`Premalo XP! Potrebuješ ${needed} XP`, "red");
          return;
        }
        advanceMastery(agentId, skillId);
        lonaToast("Napredoval si na naslednji nivo! ⭐", "gold");
        if (typeof checkEquipmentUnlocks === 'function') setTimeout(() => checkEquipmentUnlocks(agentId), 300);
      }
    });
  });
}

function initMasterySelects() {
  document.querySelectorAll(".mastery-agent-select").forEach(sel => {
    const skillId = sel.dataset.skill;
    // Ob spremembi agenta posodobi gumb
    sel.addEventListener("change", () => {
      const btn = document.querySelector(`.mastery-advance-btn[data-skill="${skillId}"]`);
      if (btn) {
        btn.dataset.agent = sel.value;
        renderMastery(sel.value);
      }
    });
    // Init
    const btn = document.querySelector(`.mastery-advance-btn[data-skill="${skillId}"]`);
    if (btn) {
      btn.dataset.agent = sel.value;
      renderMastery(sel.value);
    }
  });
}
