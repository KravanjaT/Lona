// ============================================================
//  LONA OS — engine/gatekeeper.js  (v2.6)
// ============================================================

const LS_GK = "lona_gatekeeper_date";

function gkTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isGatekeeperApproved() {
  return localStorage.getItem(LS_GK) === gkTodayStr();
}

function approveGatekeeper() {
  localStorage.setItem(LS_GK, gkTodayStr());
}

function resetGatekeeper() {
  localStorage.removeItem(LS_GK);
}

function renderGatekeeper() {
  const approved = isGatekeeperApproved();
  const toggle   = document.getElementById("gatekeeper-toggle");
  const card     = document.querySelector(".card--gatekeeper");
  const checks   = document.querySelectorAll(".checklist__cb");
  const title    = document.getElementById("gk-title");
  const grid     = document.querySelector(".missions-grid");

  if (!toggle) return;

  // Toggle + checkboxi
  toggle.checked = approved;
  checks.forEach(cb => { cb.checked = approved; });

  // Naslov
  if (title) title.textContent = approved
    ? "STANDARD 0: ODOBRENO"
    : "STANDARD 0: ZAKLENJENO";

  // Card border
  if (card) card.style.borderColor = approved
    ? "var(--green)"
    : "var(--ink-4)";

  // Zakleni/odkleni VSE mission gumbe
  if (grid) {
    grid.querySelectorAll(".mission-btn").forEach(btn => {
      if (btn.classList.contains("mission-btn--locked")) return;
      // Ne postavi disabled — click handler mora delovati da pokaže sporočilo
      btn.style.opacity = approved ? "" : "0.4";
      btn.style.filter  = approved ? "" : "grayscale(0.5)";
      btn.dataset.gkLocked = approved ? "" : "1";
    });

    // Overlay
    let ov = document.querySelector(".missions-overlay");
    if (!approved) {
      if (!ov) {
        ov = document.createElement("div");
        ov.className = "missions-overlay";
        ov.innerHTML = `<span class="ov-icon">🔒</span><span>Najprej opravi <strong>Standard 0</strong></span>`;
        const wrapper = grid.closest(".missions-wrapper") || grid.parentElement;
        wrapper.style.position = "relative";
        wrapper.appendChild(ov);
      }
    } else {
      if (ov) ov.remove();
    }
  }

  // Posodobi badge
  if (typeof updateMissionsBadge === "function") setTimeout(updateMissionsBadge, 50);
}

function initGatekeeper() {
  const toggle = document.getElementById("gatekeeper-toggle");
  if (!toggle) return;

  // Takoj ob zagonu
  renderGatekeeper();

  // Toggle
  toggle.addEventListener("change", () => {
    toggle.checked ? approveGatekeeper() : resetGatekeeper();
    renderGatekeeper();
  });

  // Posamični checkboxi
  document.querySelectorAll(".checklist__cb").forEach(cb => {
    cb.addEventListener("change", () => {
      const allDone = [...document.querySelectorAll(".checklist__cb")].every(c => c.checked);
      if (allDone) {
        approveGatekeeper();
        toggle.checked = true;
        renderGatekeeper();
      }
    });
  });
}
