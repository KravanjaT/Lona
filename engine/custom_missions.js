// ============================================================
//  LONA OS — engine/custom_missions.js  (v2.6)
//  Dodajanje lastnih misij — lokalno + pripravljen za globalno
// ============================================================

const LS_CUSTOM = "lona_custom_missions";

function customLoad() {
  return JSON.parse(localStorage.getItem(LS_CUSTOM) || "[]");
}
function customSave(s) { localStorage.setItem(LS_CUSTOM, JSON.stringify(s)); }

function getCustomMissions() { return customLoad(); }

function addCustomMission(mission) {
  const missions = customLoad();
  const id = "custom_" + Date.now();
  const newMission = {
    id,
    label:       mission.label,
    icon:        mission.icon || "⭐",
    baseXp:      parseInt(mission.xp) || 20,
    cooldownHrs: parseInt(mission.cooldown) || 0,
    location:    mission.location || "indoor",
    duration:    mission.duration || "medium",
    category:    "custom",
    addedBy:     mission.addedBy || "commander",
    addedAt:     new Date().toISOString(),
    // Za globalni hub — pripravljeno
    globalId:    null,
    stars:       0,
    reviews:     0,
  };
  missions.push(newMission);
  customSave(missions);
  return newMission;
}

function removeCustomMission(id) {
  const missions = customLoad().filter(m => m.id !== id);
  customSave(missions);
}

function showAddMissionDialog(addedBy) {
  const icons = ["⭐","🎯","💡","🔨","🎨","🧩","🚀","🌟","💪","🎭","🏃","🧪","📖","🎵","🌈"];
  const agent = typeof getCurrentAgent === "function" ? getCurrentAgent() : null;
  const agentName = agent ? LONA_CONFIG.agents.find(a => a.id === agent)?.name : null;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box" style="max-width:380px;width:calc(100% - 24px)">
    <div class="joker-dialog__icon">✏️</div>
    <p class="joker-dialog__title">Nova Misija</p>
    ${addedBy === "agent" ? `<p style="font-size:.75rem;color:#8E8E93;text-align:center;margin-bottom:8px">${agentName} predlaga — Poveljnik potrdi</p>` : ''}

    <!-- Ikona izbira -->
    <div style="width:100%;margin-bottom:10px">
      <p style="font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">Ikona</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="icon-picker">
        ${icons.map(ic => `<button onclick="selectIcon('${ic}',this)"
          style="width:36px;height:36px;border-radius:10px;border:2px solid #C7C7CC;
          background:#F2F2F7;font-size:1.2rem;cursor:pointer;transition:all 150ms">${ic}</button>`
        ).join("")}
      </div>
      <input type="hidden" id="cm-icon" value="⭐"/>
    </div>

    <!-- Ime -->
    <div style="width:100%;margin-bottom:10px">
      <p style="font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">Ime misije</p>
      <input id="cm-label" type="text" placeholder="npr. Počisti garažo"
        style="width:100%;padding:10px 14px;border-radius:12px;border:2.5px solid #C7C7CC;
        font-family:'Nunito',sans-serif;font-size:.95rem;font-weight:700;outline:none;
        transition:border-color 150ms" onfocus="this.style.borderColor='#007AFF'" onblur="this.style.borderColor='#C7C7CC'"/>
    </div>

    <!-- XP + Cooldown -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;margin-bottom:10px">
      <div>
        <p style="font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">XP</p>
        <select id="cm-xp" style="width:100%;padding:10px;border-radius:12px;border:2.5px solid #C7C7CC;font-family:'Nunito',sans-serif;font-size:.9rem;font-weight:700">
          <option value="10">10 XP</option>
          <option value="15">15 XP</option>
          <option value="20" selected>20 XP</option>
          <option value="25">25 XP</option>
          <option value="30">30 XP</option>
          <option value="40">40 XP</option>
          <option value="50">50 XP</option>
        </select>
      </div>
      <div>
        <p style="font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">Cooldown</p>
        <select id="cm-cooldown" style="width:100%;padding:10px;border-radius:12px;border:2.5px solid #C7C7CC;font-family:'Nunito',sans-serif;font-size:.9rem;font-weight:700">
          <option value="0">Brez</option>
          <option value="24">1 dan</option>
          <option value="48" selected>2 dni</option>
          <option value="72">3 dni</option>
          <option value="168">1 teden</option>
        </select>
      </div>
    </div>

    <!-- Lokacija -->
    <div style="width:100%;margin-bottom:14px">
      <p style="font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">Lokacija</p>
      <div style="display:flex;gap:6px">
        <button id="loc-indoor" onclick="selectLocation('indoor',this)"
          style="flex:1;padding:9px;border-radius:12px;border:2.5px solid #007AFF;background:#EFF6FF;color:#007AFF;font-family:'Nunito',sans-serif;font-size:.82rem;font-weight:900">🏠 Notri</button>
        <button id="loc-outdoor" onclick="selectLocation('outdoor',this)"
          style="flex:1;padding:9px;border-radius:12px;border:2.5px solid #C7C7CC;background:#F2F2F7;color:#8E8E93;font-family:'Nunito',sans-serif;font-size:.82rem;font-weight:900">🌿 Zunaj</button>
      </div>
      <input type="hidden" id="cm-location" value="indoor"/>
    </div>

    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel" onclick="this.closest('.joker-dialog').remove()">Prekliči</button>
      <button class="joker-dialog__confirm" onclick="submitCustomMission('${addedBy}')">
        ${addedBy === "agent" ? "Pošlji predlog 📤" : "Dodaj misijo ✓"}
      </button>
    </div>
  </div>`;

  document.body.appendChild(d);

  // Focus na input
  setTimeout(() => d.querySelector("#cm-label")?.focus(), 300);
}

// Helpers za dialog
window.selectIcon = function(icon, btn) {
  document.querySelectorAll("#icon-picker button").forEach(b => {
    b.style.borderColor = "#C7C7CC";
    b.style.background  = "#F2F2F7";
  });
  btn.style.borderColor = "#007AFF";
  btn.style.background  = "#EFF6FF";
  document.getElementById("cm-icon").value = icon;
};

window.selectLocation = function(loc, btn) {
  document.getElementById("cm-location").value = loc;
  const indoor  = document.getElementById("loc-indoor");
  const outdoor = document.getElementById("loc-outdoor");
  if (loc === "indoor") {
    indoor.style.borderColor  = "#007AFF"; indoor.style.background  = "#EFF6FF"; indoor.style.color  = "#007AFF";
    outdoor.style.borderColor = "#C7C7CC"; outdoor.style.background = "#F2F2F7"; outdoor.style.color = "#8E8E93";
  } else {
    outdoor.style.borderColor = "#34C759"; outdoor.style.background = "#EDFFF3"; outdoor.style.color = "#34C759";
    indoor.style.borderColor  = "#C7C7CC"; indoor.style.background  = "#F2F2F7"; indoor.style.color  = "#8E8E93";
  }
};

window.submitCustomMission = function(addedBy) {
  const label    = document.getElementById("cm-label")?.value?.trim();
  const icon     = document.getElementById("cm-icon")?.value || "⭐";
  const xp       = document.getElementById("cm-xp")?.value || "20";
  const cooldown = document.getElementById("cm-cooldown")?.value || "48";
  const location = document.getElementById("cm-location")?.value || "indoor";

  if (!label) {
    lonaToast("Vpiši ime misije!", "red");
    document.getElementById("cm-label")?.focus();
    return;
  }

  document.querySelector(".joker-dialog")?.remove();

  if (addedBy === "agent") {
    // Shrani kot predlog — čaka na potrditev
    const proposals = JSON.parse(localStorage.getItem("lona_proposals") || "[]");
    proposals.push({ label, icon, xp, cooldown, location, addedBy: getCurrentAgent(), date: new Date().toISOString() });
    localStorage.setItem("lona_proposals", JSON.stringify(proposals));
    lonaToast(`Predlog "${label}" poslan Poveljniku! 📤`, "green");
    return;
  }

  // Commander — direktno dodaj
  const mission = addCustomMission({ label, icon, xp, cooldown, location, addedBy: "commander" });

  // Dodaj v missions-grid
  renderCustomMissions();
  lonaToast(`Misija "${label}" dodana! ✓`, "green");
  if (typeof showConfetti === "function") showConfetti();
};

function renderCustomMissions() {
  const grid = document.getElementById("custom-missions-grid");
  if (!grid) return;

  const missions = customLoad();
  if (!missions.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:#8E8E93;font-size:.82rem;font-style:italic">Še ni lastnih misij</div>`;
    return;
  }

  grid.innerHTML = missions.map(m => `
    <button class="mission-btn" data-mission="${m.id}" data-custom="1"
      style="background:linear-gradient(160deg,#CF8FFF,#AF52DE);border-color:#AF52DE;border-width:3px;box-shadow:0 5px 0 #7B2BAE;position:relative">
      <div class="mission-btn-inner" style="background:linear-gradient(160deg,#CF8FFF,#AF52DE);border-color:rgba(255,255,255,.3)">
        <div class="mission-btn__top">
          <span class="mission-btn__icon">${m.icon}</span>
          <span class="mission-btn__avail-dot"></span>
        </div>
        <p class="mission-btn__name">${m.label}</p>
        <p class="mission-btn__xp">+${m.baseXp} XP</p>
        <p class="mission-btn__sub" style="color:rgba(255,255,255,.7)">${m.cooldownHrs ? m.cooldownHrs + 'h' : 'Brez cooldowna'}</p>
      </div>
    </button>
  `).join("");

  // Dodaj event listenerje
  grid.querySelectorAll(".mission-btn[data-custom]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      addRipple(btn, e);
      // Misijo obravnavaj kot normalno
      const mId = btn.dataset.mission;
      const custom = customLoad().find(m => m.id === mId);
      if (custom) onMissionClick(btn);
    });
  });
}

// Predlogi otrok — pokaži Poveljniku
function showProposals() {
  const proposals = JSON.parse(localStorage.getItem("lona_proposals") || "[]");
  if (!proposals.length) { lonaToast("Ni predlogov", "cyan"); return; }

  const d = document.createElement("div");
  d.className = "joker-dialog";
  const items = proposals.map((p, i) => {
    const name = LONA_CONFIG.agents.find(a => a.id === p.addedBy)?.name || p.addedBy;
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#F2F2F7;border-radius:12px;margin-bottom:6px">
      <span style="font-size:1.3rem">${p.icon}</span>
      <div style="flex:1">
        <p style="font-size:.85rem;font-weight:800;color:#1C1C1E">${p.label}</p>
        <p style="font-size:.65rem;color:#8E8E93">${name} · +${p.xp} XP</p>
      </div>
      <div style="display:flex;gap:4px">
        <button onclick="approveProposal(${i})" style="padding:5px 10px;border-radius:8px;background:#34C759;color:white;border:none;font-weight:900;font-size:.75rem;cursor:pointer">✓</button>
        <button onclick="rejectProposal(${i})" style="padding:5px 10px;border-radius:8px;background:#FF3B30;color:white;border:none;font-weight:900;font-size:.75rem;cursor:pointer">✗</button>
      </div>
    </div>`;
  }).join("");

  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">📬</div>
    <p class="joker-dialog__title">Predlogi agentov</p>
    <div style="width:100%">${items}</div>
    <button class="joker-dialog__cancel" style="width:100%;margin-top:4px" onclick="this.closest('.joker-dialog').remove()">Zapri</button>
  </div>`;
  document.body.appendChild(d);
}

window.approveProposal = function(idx) {
  const proposals = JSON.parse(localStorage.getItem("lona_proposals") || "[]");
  const p = proposals[idx];
  addCustomMission(p);
  proposals.splice(idx, 1);
  localStorage.setItem("lona_proposals", JSON.stringify(proposals));
  document.querySelector(".joker-dialog")?.remove();
  renderCustomMissions();
  lonaToast(`Misija "${p.label}" odobrena! ✓`, "green");
  if (typeof showConfetti === "function") showConfetti();
};

window.rejectProposal = function(idx) {
  const proposals = JSON.parse(localStorage.getItem("lona_proposals") || "[]");
  proposals.splice(idx, 1);
  localStorage.setItem("lona_proposals", JSON.stringify(proposals));
  document.querySelector(".joker-dialog")?.remove();
  lonaToast("Predlog zavrnjen", "red");
};

function initCustomMissions() {
  renderCustomMissions();
  // Preveri predloge
  const proposals = JSON.parse(localStorage.getItem("lona_proposals") || "[]");
  if (proposals.length > 0) {
    setTimeout(() => lonaToast(`📬 ${proposals.length} predlog${proposals.length>1?'ov':''} čaka na potrditev!`, "gold"), 2000);
  }
}

// Pokaži proposals gumb če so predlogi
function updateProposalsBtn() {
  const btn = document.getElementById("proposals-btn");
  if (!btn) return;
  const proposals = JSON.parse(localStorage.getItem("lona_proposals") || "[]");
  btn.style.display = proposals.length > 0 ? "block" : "none";
  if (proposals.length > 0) btn.textContent = `📬 ${proposals.length}`;
}
