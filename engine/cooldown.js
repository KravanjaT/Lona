// ============================================================
//  LONA OS — engine/cooldown.js  (v2.6)
// ============================================================

const LS_CD = "lona_cooldown_";

function setCooldown(missionId, hrs) {
  localStorage.setItem(LS_CD + missionId, Date.now() + hrs * 3600000);
}

function getCooldownMs(missionId) {
  return Math.max(0, parseInt(localStorage.getItem(LS_CD + missionId) || "0", 10) - Date.now());
}

function isOnCooldown(missionId) {
  return getCooldownMs(missionId) > 0;
}

function fmtMs(ms) {
  const m = Math.ceil(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

function renderCooldown(missionId) {
  const btn = document.querySelector(`[data-mission="${missionId}"]`);
  if (!btn) return;
  const ms  = getCooldownMs(missionId);

  // Zagotovi da .mission-btn__cooldown obstaja
  let cdEl = btn.querySelector(".mission-btn__cooldown");
  if (!cdEl) {
    cdEl = document.createElement("p");
    cdEl.className = "mission-btn__cooldown";
    btn.appendChild(cdEl);
  }

  if (ms <= 0 && btn.classList.contains("mission-btn--locked")) {
    // Odkleni
    btn.classList.remove("mission-btn--locked");
    btn.classList.add("mission-btn--available");
    btn.disabled = false;
    btn.style.opacity = "";
    btn.style.pointerEvents = "";
    btn.querySelector(".mission-btn__lock")?.remove();
    btn.querySelector(".mission-btn__joker-hint")?.remove();
    cdEl.textContent = "";
    if (!btn.querySelector(".mission-btn__avail-dot")) {
      const dot = document.createElement("span");
      dot.className = "mission-btn__avail-dot";
      btn.querySelector(".mission-btn__top").appendChild(dot);
    }
  } else if (ms > 0) {
    cdEl.innerHTML = `<i class="ph-bold ph-clock"></i> ${fmtMs(ms)}`;
  }
}

function initCooldownTicker() {
  function tick() {
    Object.values(LONA_CONFIG.missions).forEach(m => {
      if (m.cooldownHrs) renderCooldown(m.id);
    });
  }

  // Ob zagonu — zakleni VSE gumbe ki imajo aktiven cooldown
  document.querySelectorAll(".mission-btn[data-mission]").forEach(btn => {
    const mId = btn.dataset.mission;
    if (!isOnCooldown(mId)) return;
    if (typeof _lockBtn === "function") {
      _lockBtn(btn);
    } else {
      btn.classList.remove("mission-btn--available","mission-btn--special","mission-btn--mastery");
      btn.classList.add("mission-btn--locked");
      btn.disabled = true;
      const top = btn.querySelector(".mission-btn__top");
      if (top && !top.querySelector(".mission-btn__lock")) {
        const lk = document.createElement("span");
        lk.className = "mission-btn__lock"; lk.textContent = "🔒";
        top.appendChild(lk);
      }
      btn.querySelector(".mission-btn__avail-dot")?.remove();
    }
  });

  tick();
  if (typeof updateMissionsBadge === "function") setTimeout(updateMissionsBadge, 50);
  setInterval(tick, 60000);
}
