// ============================================================
//  LONA OS — engine.js  (v2.6)
//  Vstopna točka — inicializira vse module
// ============================================================

// ── MISSION LOG ────────────────────────────────────────────
function logMission(agentId, missionId, xp, modifier, compromised) {
  const log = JSON.parse(localStorage.getItem("lona_mission_log") || "[]");
  log.push({
    agentId, missionId, xp, compromised,
    modifier: modifier?.label || "—",
    date: new Date().toISOString(),
  });
  // Max 100 vnosov
  if (log.length > 100) log.splice(0, log.length - 100);
  localStorage.setItem("lona_mission_log", JSON.stringify(log));
}

// ── CURRENT AGENT ─────────────────────────────────────────
function getCurrentAgent() {
  return localStorage.getItem("lona_current_agent") || LONA_CONFIG.agents[0].id;
}

// ── TOAST ──────────────────────────────────────────────────
function lonaToast(msg, color) {
  const c = { green:"#2D7D52", gold:"#C47D1A", red:"#C4352A", cyan:"#2563EB" };
  const bg = { green:"#EAF4EE", gold:"#FDF3E3", red:"#FDECEA", cyan:"#EEF3FD" };
  const clr = c[color] || c.green;
  const bgClr = bg[color] || bg.green;
  const el = document.createElement("div");
  el.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    background:${bgClr};border:1px solid ${clr}44;color:${clr};
    padding:10px 18px;border-radius:12px;font-size:.85rem;font-weight:600;
    z-index:9000;white-space:nowrap;
    box-shadow:0 4px 16px rgba(0,0,0,.12);
    font-family:var(--font-sans, sans-serif);
    animation:fadeInUp .25s ease;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ── MISSION FUNNEL CONFIG ──────────────────────────────────
// Ozemlja po misiji
const MISSION_ZONES = {
  sesanje:    ["En prostor", "Dva prostora", "Cela hiša"],
  posoda:     null,  // auto — sistem sam izbere
  perilo:     ["En kup", "Cela gora"],
  kuhanje:    ["Priprava", "Kuhanje", "Pospravljanje po"],
  skrivna_wc: null,
  wc:         null,  // auto
};

const MISSION_ZONES_AUTO = {
  posoda:     ["Zloži ven", "Zloži noter", "Oboje"],
  skrivna_wc: ["Skrivna"],
  wc:         ["WC"],
};

// Modifikatorji po misiji
const MISSION_MODIFIERS = {
  sesanje: [
    { icon:"🐻", label:"Medvedja hoja",       text:"Sesalec potiskaš samo po vseh štirih!" },
    { icon:"🦀", label:"Rakova hoja",          text:"Po vseh štirih — trebuh gor, sesalec med nogami." },
    { icon:"🦩", label:"Štorklja",             text:"Sešeš samo na eni nogi. Menjava pri vsaki sobi." },
    { icon:"🤫", label:"Tihi agent",           text:"Sesalec se ne sme dotakniti pohištva. Nič hrupa." },
    { icon:"⚡", label:"Turbo",                text:"5 minut — štoparica teče. Kaj se da?" },
    { icon:"🙈", label:"Navigacija na slepo",  text:"Eden zapre oči, drugi usmerja: levo, desno, stop." },
  ],
  posoda: [
    { icon:"🤫", label:"Tihi agent",           text:"Niti en 'klink'. Vsak zvok = -2 XP." },
    { icon:"⚡", label:"Turbo",                text:"3 minute — vse zloženo preden odteče čas." },
    { icon:"🎯", label:"Sortiranje",           text:"Najprej vilice, potem žlice, potem noži — po velikosti." },
    { icon:"🧤", label:"Ena roka",             text:"Zlagaš samo z eno roko. Druga je za hrbtom." },
    { icon:"🦩", label:"Štorklja",             text:"Med zlaganjem stojiš na eni nogi." },
  ],
  perilo: [
    { icon:"🐻", label:"Medvedja hoja",        text:"Vsak kos perila prineseš po vseh štirih." },
    { icon:"🦀", label:"Rakova hoja",          text:"Transport do stroja — trebuh gor, kos perila na trebuhu." },
    { icon:"🔍", label:"Detektiv",             text:"Preveri vsak žep! Skrit kovanec = bonus. Robček = kazen." },
    { icon:"🎯", label:"Sortiranje",           text:"Najprej temno, potem svetlo, potem barvno." },
    { icon:"⚡", label:"Turbo",                text:"Cela gora v 4 minute. Štoparica!" },
  ],
  kuhanje: [
    { icon:"🧑‍🍳", label:"Šef govori",        text:"Starš samo naroča, ti izvajaš. Brez vprašanj." },
    { icon:"🤫", label:"Tiha kuhinja",         text:"Nič glasnega odlaganja. Kuhinja ostane tiha." },
    { icon:"⚡", label:"Turbo prep",           text:"Vse sestavine pripravljene v 3 minutah." },
    { icon:"🎯", label:"Natančnost",           text:"Meriš vse — žlice, grami. Nič na oko." },
    { icon:"🧤", label:"Ena roka",             text:"Rezanje in mešanje samo z eno roko." },
  ],
  skupna: [
    { icon:"🐻", label:"Medvedja hoja",    text:"Oba prenašata skupaj po vseh štirih!" },
    { icon:"🙈", label:"Navigacija slepo", text:"Eden zapre oči, drugi usmerja." },
    { icon:"⚡", label:"Turbo skupaj",     text:"5 minut — skupaj naredita vse!" },
    { icon:"🤫", label:"Tiha ekipa",       text:"Nobenih besed — samo geste!" },
  ],
  skrivna_wc: [],
  listi: [
    { icon:"🔍", label:"Detektiv",      text:"Poišči 5 RAZLIČNIH listov — oblika, barva, velikost." },
    { icon:"🎨", label:"Umetnik",       text:"Nariši vsak list ki ga najdeš." },
    { icon:"⚡", label:"Hitrostni lov", text:"2 minuti — kdo najde več vrst?" },
  ],
  pot: [
    { icon:"🥷", label:"Nindža čiščenje", text:"Brez hrupa, brez opomina." },
    { icon:"⏱️", label:"Hitrostni rekord", text:"Izmeri čas — poraziš rekord?" },
    { icon:"📋", label:"Inspektor",        text:"Preveri vsak centimeter. Starš oceni 1-10." },
  ],
  vrt: [
    { icon:"🌱", label:"Botanik",    text:"Identificiraj 3 rastline ki rasteš." },
    { icon:"💧", label:"Vodovod",    text:"Zalij NATANČNO — ne preveč, ne premalo." },
    { icon:"🔬", label:"Opazovalec", text:"Poišči žuželko in jo opisuj 1 minuto." },
  ],
  narava_foto: [
    { icon:"🎯", label:"Tema: Simetrija",  text:"Najdi 3 simetrične objekte v naravi." },
    { icon:"🌈", label:"Tema: Barve",      text:"Vsaka barva mavrice — ena fotografija." },
    { icon:"🔍", label:"Makro izziv",      text:"Fotografiraj kar je manjše od tvoje roke." },
  ],
  orientacija_out: [
    { icon:"☀️", label:"Sončna metoda",  text:"Najdi sever samo s senco in palico." },
    { icon:"⭐", label:"Zvezde",          text:"Ponoči poišči Severnico." },
    { icon:"🗺️", label:"Brez kompasa",   text:"Navigiraj 100m samo z opazovanjem." },
  ],
  taborisce: [
    { icon:"⚡", label:"Speed Camp",    text:"Postavi taborišče v 10 minutah." },
    { icon:"🌧️", label:"Mokri izziv",   text:"Postavi taborišče ki bo suho tudi v dežju." },
    { icon:"🌙", label:"Nočni tabor",   text:"Zvečer — vse postaviti pred temo." },
  ],
  wc: [
    { icon:"🥷", label:"Nindža čiščenje",  text:"Preden te kdo opazi — hitro in tiho." },
    { icon:"⚡", label:"Turbo",            text:"5 minut — vse mora sijati." },
    { icon:"🔍", label:"Inspektor",        text:"Preveri vsak kot. Starš bo pregledal z belim robcem." },
    { icon:"🤫", label:"Tiho čiščenje",    text:"Nobenih glasnih gibov. Tiho kot miška." },
  ],
};

// ── STEP 1: OZEMLJE ────────────────────────────────────────
function showZonePicker(missionId, callback) {
  const zones = MISSION_ZONES[missionId];

  // Null = auto izbira, brez dialoga
  if (!zones) {
    const autoZones = MISSION_ZONES_AUTO[missionId] || ["Standardno"];
    const picked = autoZones[Math.floor(Math.random() * autoZones.length)];
    callback(picked);
    return;
  }

  const d = document.createElement("div");
  d.className = "joker-dialog";
  const btns = zones.map(z =>
    `<button class="funnel-btn" data-zone="${z}">${z}</button>`
  ).join("");
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🗺️</div>
    <p class="joker-dialog__title">Kje bo misija?</p>
    <div class="funnel-grid">${btns}</div>
    <button class="joker-dialog__cancel" style="margin-top:10px;width:100%">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelectorAll(".funnel-btn").forEach(b => {
    b.addEventListener("click", () => { d.remove(); callback(b.dataset.zone); });
  });
}

// ── STEP 2: MODIFIKATOR ────────────────────────────────────
function showModifier(missionId, callback) {
  const pool = MISSION_MODIFIERS[missionId] || MISSION_MODIFIERS.sesanje;
  const mod = pool[Math.floor(Math.random() * pool.length)];
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${mod.icon}</div>
    <p class="joker-dialog__title">${mod.label}</p>
    <p class="joker-dialog__body" style="font-size:.95rem;color:var(--text-primary)">${mod.text}</p>
    <div class="joker-dialog__btns" style="margin-top:4px">
      <button class="joker-dialog__cancel">Premešaj 🔀</button>
      <button class="joker-dialog__confirm">Sprejmi ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  // Premešaj → nov modifikator
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => {
    d.remove(); showModifier(missionId, callback);
  });
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove(); callback(mod);
  });
}

// ── JOKER VERJETNOST ──────────────────────────────────────
function jokerProbability(count) {
  if (count <= 0) return 0;
  if (count === 1) return 0.20;
  if (count === 2) return 0.35;
  return 0.50; // 3+
}

// ── STEP 3: MODIFIKATOR DIALOG (joker pade nepričakovano) ──
function showMissionConfirm(agentId, missionLabel, mod, callback) {
  const jokers = getJokers(agentId);
  const name   = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

  // Tiho vrži kocko — joker pade PRED potrditvijo
  const jokerFalls = Math.random() < jokerProbability(jokers);

  if (jokerFalls) {
    // Kratka zakasnitev — kot da sistem "razmišlja"
    setTimeout(() => {
      const d = document.createElement("div");
      d.className = "joker-dialog";
      d.innerHTML = `<div class="joker-dialog__box" style="border-color:rgba(255,209,102,.6);box-shadow:0 0 40px rgba(255,209,102,.2)">
        <div class="joker-dialog__icon" style="font-size:3rem;animation:pulse-dot 1s ease-in-out infinite">🃏</div>
        <p class="joker-dialog__title" style="color:var(--neon-gold);font-size:1.3rem">JOKER!</p>
        <p class="joker-dialog__body" style="font-size:.9rem">
          <strong>${name}</strong> ima srečo —<br>
          <em>${missionLabel}</em> je danes preskočena!<br>
          <span style="font-size:.75rem;color:var(--text-dim)">Jokerjev ostane: ${jokers - 1}</span>
        </p>
        <div class="joker-dialog__btns">
          <button class="joker-dialog__cancel">Vseeno opravi</button>
          <button class="joker-dialog__confirm" style="background:rgba(255,209,102,.15);border-color:rgba(255,209,102,.5);color:var(--neon-gold)">Sprejmi! 🃏</button>
        </div>
      </div>`;
      document.body.appendChild(d);
      d.querySelector(".joker-dialog__cancel").addEventListener("click", () => { d.remove(); callback(false); });
      d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
        d.remove();
        spendJoker(agentId);
        lonaToast(`Joker! ${name} je prost danes 🃏`, "gold");
        callback(true);
      });
    }, 400);
    return;
  }

  // Normalen povzetek
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${mod.icon}</div>
    <p class="joker-dialog__title">${mod.label}</p>
    <p class="joker-dialog__body" style="font-size:.92rem;color:var(--text-primary)">${mod.text}</p>
    <div class="mission-summary" style="margin-top:8px">
      <div class="summary-row">
        <span class="summary-label">Misija</span>
        <span class="summary-val">${missionLabel}</span>
      </div>
      ${jokers > 0 ? `<div class="summary-row"><span class="summary-label">Jokerji</span><span class="summary-val" style="color:var(--neon-gold)">🃏 ×${jokers}</span></div>` : ""}
    </div>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Gremo! 🚀</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => { d.remove(); callback(false); });
}

// ── AGENT PICKER ───────────────────────────────────────────
function showAgentPicker(callback) {
  const d = document.createElement("div");
  d.className = "joker-dialog";
  const btns = LONA_CONFIG.agents.map(a =>
    `<button class="agent-pick-btn" data-id="${a.id}">${a.avatar} ${a.name}</button>`
  ).join("");
  d.innerHTML = `<div class="joker-dialog__box">
    <p class="joker-dialog__title">Kdo je opravil misijo?</p>
    <div class="joker-dialog__btns">${btns}</div>
    <button class="joker-dialog__cancel" style="margin-top:8px;width:100%">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelectorAll(".agent-pick-btn").forEach(b => {
    b.addEventListener("click", () => { d.remove(); callback(b.dataset.id); });
  });
}

// ── QUALITY CHECK (Mission Compromised) ───────────────────
function showQualityCheck(agentId, mission, mod, callback) {
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🔍</div>
    <p class="joker-dialog__title">Kakovostni pregled</p>
    <p class="joker-dialog__body">
      Je <strong>${name}</strong> opravil misijo<br>
      <strong>${mission.label}</strong> pravilno?
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel" style="border-color:rgba(255,60,90,.3);color:var(--neon-red)">
        ⚠️ Površno
      </button>
      <button class="joker-dialog__confirm">
        ✓ Opravljeno
      </button>
    </div>
    <p style="font-size:.7rem;color:var(--text-dim);text-align:center;margin-top:-4px">
      Površno = pol točk, misija ostane odprta
    </p>
  </div>`;
  document.body.appendChild(d);

  // Površno — pol točk, brez cooldowna
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => {
    d.remove();
    lonaToast(`⚠️ Površno — samo +${Math.floor(mission.baseXp/2)} XP`, "red");
    callback(true, false);
  });

  // Opravljeno — polne točke + cooldown
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    lonaToast(`+${mission.baseXp} XP zasluženo! ✓`, "green");
    callback(false, false);
  });
}

// ── HELPER: zakleni mission gumb ─────────────────────────
function _lockBtn(b) {
  if (!b) return;
  b.classList.remove("mission-btn--available","mission-btn--special","mission-btn--mastery");
  b.classList.add("mission-btn--locked");
  b.disabled = true;
  b.style.opacity = "";
  b.style.pointerEvents = "";
  const top = b.querySelector(".mission-btn__top");
  if (top && !top.querySelector(".mission-btn__lock")) {
    const lk = document.createElement("span");
    lk.className = "mission-btn__lock"; lk.textContent = "🔒";
    top.appendChild(lk);
  }
  b.querySelector(".mission-btn__avail-dot")?.remove();
}

// ── MISSION CLICK — GLAVNI FLOW ────────────────────────────
function onMissionClick(btn) {
  const missionId = btn.dataset.mission;
  const mission   = LONA_CONFIG.missions[missionId];
  if (!mission) return;

  // Gatekeeper ni odobren
  if (btn.dataset.gkLocked === "1") {
    lonaToast("Najprej opravi Standard 0! 🔒", "red");
    return;
  }

  // Zaklenjeno s cooldownom → Joker ponudi
  if (btn.classList.contains("mission-btn--locked")) {
    const ms = getCooldownMs(missionId);
    if (ms > 0) {
      // Pokaži koliko časa še — in ponudi joker
      const d = document.createElement("div");
      d.className = "joker-dialog";
      d.innerHTML = `<div class="joker-dialog__box">
        <div class="joker-dialog__icon">🔒</div>
        <p class="joker-dialog__title">${mission.label}</p>
        <p class="joker-dialog__body">Misija se odklene čez<br><strong style="font-size:1.1rem">${fmtMs(ms)}</strong></p>
        <div class="joker-dialog__btns">
          <button class="joker-dialog__cancel">Zapri</button>
          <button class="joker-dialog__confirm">Uporabi Joker 🃏</button>
        </div>
      </div>`;
      document.body.appendChild(d);
      d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
      d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
        d.remove();
        const agentId = getCurrentAgent();
        if (getJokers(agentId) <= 0) {
          lonaToast("Nimaš Jokerjev!", "red");
          return;
        }
        spendJoker(agentId);
        showJokerFly();
        localStorage.removeItem("lona_cooldown_" + missionId);
        renderCooldown(missionId);
        lonaToast("Joker porabljen — misija odklenjena! 🃏", "gold");
        updateMissionsBadge();
      });
    }
    return;
  }

  // Gatekeeper ni odobren — blokiraj
  if (!isGatekeeperApproved()) {
    lonaToast("Najprej opravi Standard 0! 🔒", "red");
    return;
  }

  // Izvidniški bonus — starš sam potrdi kaj je otrok opazil
  if (mission.isScout) {
    const agentId   = getCurrentAgent();
    const agentName = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

    // XP možnosti
    const xpOptions = [10, 15, 20, 25, 30, 40, 50];

    const d = document.createElement("div");
    d.className = "joker-dialog";
    const optBtns = xpOptions.map(v =>
      `<button class="funnel-btn" data-xp="${v}">+${v} XP</button>`
    ).join("");
    d.innerHTML = `<div class="joker-dialog__box">
      <div class="joker-dialog__icon">👁️</div>
      <p class="joker-dialog__title">Izvidniški Bonus</p>
      <p class="joker-dialog__body">
        <strong>${agentName}</strong> je sam opazil priložnost<br>in jo opravil brez opomnika.<br>
        <span style="font-size:.8rem;color:#8A8480">Koliko XP je vredno?</span>
      </p>
      <div class="funnel-grid" style="margin-top:4px">${optBtns}</div>
      <button class="joker-dialog__cancel" style="margin-top:8px;width:100%">Prekliči</button>
    </div>`;
    document.body.appendChild(d);
    d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
    d.querySelectorAll(".funnel-btn").forEach(b => {
      b.addEventListener("click", () => {
        d.remove();
        const xp = parseInt(b.dataset.xp);
        logMission(agentId, "izvidnik", xp, {label:"Izvidniški bonus"}, false);
        addXp(agentId, xp);
        lonaToast(`${agentName} +${xp} XP — sam je opazil! 👁️`, "gold");
      });
    });
    return;
  }

  // Skupna misija — oba agenta dobita XP
  if (mission.isShared) {
    const d = document.createElement("div");
    d.className = "joker-dialog";
    const agents = LONA_CONFIG.agents;
    d.innerHTML = `<div class="joker-dialog__box">
      <div class="joker-dialog__icon">🤝</div>
      <p class="joker-dialog__title">Skupna misija!</p>
      <p class="joker-dialog__body">
        Oba agenta opravita nalogo skupaj.<br>
        Vsak dobi <strong>+${mission.baseXp} XP</strong>
      </p>
      <div class="joker-dialog__btns">
        <button class="joker-dialog__cancel">Prekliči</button>
        <button class="joker-dialog__confirm">Opravljeno ✓</button>
      </div>
    </div>`;
    document.body.appendChild(d);
    d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
    d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
      d.remove();
      showQualityCheck(getCurrentAgent(), mission, null, (compromised) => {
        const xp = compromised ? Math.floor(mission.baseXp / 2) : mission.baseXp;
        // Oba dobita XP
        LONA_CONFIG.agents.forEach(a => {
          logMission(a.id, missionId, xp, {label:"Skupna misija"}, compromised);
          addXp(a.id, xp);
        });
        if (!compromised) {
          lonaToast(`Oba +${xp} XP! 🤝`, "green");
        } else {
          lonaToast(`⚠️ Površno — oba +${xp} XP`, "red");
        }
        setTimeout(updateMissionsBadge, 100);
      });
    });
    return;
  }

  // EQ Operacije — poseben flow
  if (mission.isEq) {
    const agentId = getCurrentAgent();
    if (typeof handleEqMission === "function") handleEqMission(agentId, mission);
    return;
  }

  // Skrivna misija — najprej agent, potem naključna misija
  // Nič se ne zaklene — skrivna ostane vedno odprta
  if (mission.isHidden || missionId === "skrivna_wc") {
    const agentId   = getCurrentAgent();
    const pool      = Object.values(LONA_CONFIG.missions).filter(m => m.id !== "skrivna_wc" && !m.isHidden);
    const picked    = pool[Math.floor(Math.random() * pool.length)];
    const agentName = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
    const d = document.createElement("div");
    d.className = "joker-dialog";
    d.innerHTML = `<div class="joker-dialog__box">
      <div class="joker-dialog__icon">🎲</div>
      <p class="joker-dialog__title">Skrivna misija!</p>
      <p class="joker-dialog__body">
        <strong>${agentName}</strong> mora opraviti:<br>
        <strong style="font-size:1.1rem">${picked.label}</strong><br>
        <span style="color:#2D7D52;font-weight:600">+${picked.baseXp} XP</span>
      </p>
      <div class="joker-dialog__btns">
        <button class="joker-dialog__cancel">Prekliči</button>
        <button class="joker-dialog__confirm">Opravljeno ✓</button>
      </div>
    </div>`;
    document.body.appendChild(d);
    d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
    d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
      d.remove();
      showQualityCheck(agentId, picked, null, (compromised) => {
        const xp = compromised ? Math.floor(picked.baseXp / 2) : picked.baseXp;
        logMission(agentId, picked.id, xp, {label:"Skrivna misija"}, compromised);
        addXp(agentId, xp);
        lonaToast(compromised ? `⚠️ Površno — +${xp} XP` : `+${xp} XP zasluženo! ✓`, compromised ? "red" : "green");
        setTimeout(updateMissionsBadge, 100);
      });
    });
    return;
  }

  // FUNNEL: Modifikator → Joker check → Zaključek
  const agentId = getCurrentAgent();
  showModifier(missionId, mod => {
    showMissionConfirm(agentId, mission.label, mod, (jokerUsed) => {
      if (jokerUsed) return;
      showQualityCheck(agentId, mission, mod, (compromised) => {
            const xp = compromised
              ? Math.floor(mission.baseXp / 2)  // pol točk
              : mission.baseXp;

            addXp(agentId, xp);

            // Cooldown samo če ni compromised
            if (!compromised && mission.cooldownHrs) {
              setCooldown(missionId, mission.cooldownHrs);
              _lockBtn(btn);
              renderCooldown(missionId);
            }

            // Log
            logMission(agentId, missionId, xp, mod, compromised);
            if (!compromised) {
              lonaToast(`+${xp} XP zasluženo! ✓`, "green");
            } else {
              lonaToast(`⚠️ Površno — +${xp} XP`, "red");
            }
            setTimeout(updateMissionsBadge, 100);
      });
    });
  });
}


// ── MISSIONS BADGE ─────────────────────────────────────────
function updateMissionsBadge() {
  const badgeEl = document.querySelector(".section-header__badge");
  if (!badgeEl) return;
  const all    = document.querySelectorAll(".missions-grid .mission-btn[data-mission]").length;
  const locked = document.querySelectorAll(".missions-grid .mission-btn--locked").length;
  const avail  = all - locked;
  badgeEl.textContent = avail + " razpoložljive";
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  try {
    if (typeof initGatekeeper === "function") initGatekeeper();
    else console.error("initGatekeeper not found");

    if (typeof initXp === "function") initXp();
    if (typeof initJokers === "function") initJokers();
    if (typeof initActionPrompt === "function") initActionPrompt();
    if (typeof initCooldownTicker === "function") initCooldownTicker();

    document.querySelectorAll(".mission-btn[data-mission]").forEach(btn => {
      btn.addEventListener("click", (e) => { addRipple(btn, e); popBtn(btn); onMissionClick(btn); });
    });

    if (typeof initMastery === "function") initMastery();
    if (typeof initScholar === "function") initScholar();
    if (typeof initRewards === "function") initRewards();

    setTimeout(updateMissionsBadge, 100);
    setTimeout(renderTreasury, 150);
    if (typeof initDoubleXpButton === "function") initDoubleXpButton();
    if (typeof renderCmdAgents === "function") renderCmdAgents();
    if (typeof initSeason === "function") initSeason();
    if (typeof initEquipment === "function") initEquipment();
    if (typeof initBank === "function") initBank();
    if (typeof initAttributes === "function") initAttributes();
  } catch(e) {
    console.error("Init error:", e);
  }
});

// ── REWARD CLAIMING ────────────────────────────────────────
function initRewards() {
  document.querySelectorAll(".reward-row, .reward-item").forEach(row => {
    row.style.cursor = "pointer";
    row.addEventListener("click", () => claimReward(row));
  });
}

function claimReward(row) {
  const cost   = parseInt(row.dataset.cost);
  const shared = row.dataset.shared === "true";
  const label  = row.querySelector(".reward-row__name, .reward-item__label")?.textContent?.trim() || "Nagrada";
  if (!cost) return;

  if (shared) {
    // Skupna nagrada — preveri skupne točke
    const total = Object.values(xpLoadState()).reduce((s,v) => s+v, 0);
    if (total < cost) { lonaToast(`Premalo skupnih točk! (${total}/${cost} XP)`, "red"); return; }
    _showClaimDialog(label, cost, true, null);
  } else {
    // Osebna nagrada — current agent plača
    const agentId = getCurrentAgent();
    if (getXp(agentId) < cost) {
      lonaToast(`Premalo točk! (${getXp(agentId)}/${cost} XP)`, "red");
      return;
    }
    _showClaimDialog(label, cost, false, agentId);
  }
}

function _showClaimDialog(label, cost, shared, agentId) {
  const name = agentId
    ? LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId
    : "Ekipa";

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🎁</div>
    <p class="joker-dialog__title">Vzemi nagrado?</p>
    <p class="joker-dialog__body">
      <strong>${label}</strong><br>
      ${name} plača <strong style="color:var(--neon-red)">−${cost} XP</strong>
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Vzemi 🎁</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (shared) {
      // Odštej od obeh agentov proporcionalno
      const state = xpLoadState();
      const total = Object.values(state).reduce((s,v) => s+v, 0);
      LONA_CONFIG.agents.forEach(a => {
        const share = Math.round((state[a.id] / total) * cost);
        addXp(a.id, -share);
      });
    } else {
      addXp(agentId, -cost);
    }
    lonaToast(`${label} — uživaj! 🎁`, "gold");
    // Posodobi nagrade v profilu
    if (typeof renderRewards === "function") renderRewards();
  });
}

// ── RPG ZAKLADNICA — RADAR ─────────────────────────────────
function renderTreasury() {
  const el = document.getElementById("treasury");
  if (!el) return;

  const agentId = getCurrentAgent();
  const agentXp = getXp(agentId);
  const allXp   = Object.values(JSON.parse(localStorage.getItem("lona_xp_state") || "{}"))
                        .reduce((s,v) => s+v, 0);
  const rewards = LONA_CONFIG.rewards;
  if (!rewards) return;

  // Združi vse nagrade po XP pragu
  const allRewards = [
    ...rewards.personal.map(r => ({...r, shared: false, threshold: r.revealAt, buy: r.buyAt})),
    ...rewards.shared.map(r => ({...r, shared: true,  threshold: r.sharedRevealAt, buy: r.buyAt})),
  ].sort((a, b) => a.buy - b.buy);

  const currentXp   = (r) => r.shared ? allXp : agentXp;
  const nextLocked  = allRewards.find(r => currentXp(r) < r.threshold);
  const nextReveal  = allRewards.find(r => currentXp(r) >= r.threshold && currentXp(r) < r.buy);
  const buyable     = allRewards.filter(r => currentXp(r) >= r.buy);
  const revealed    = allRewards.filter(r => currentXp(r) >= r.threshold && currentXp(r) < r.buy);

  let html = `<div class="treasure-radar">`;

  // ── GLAVNA SKRINJA ──────────────────────────────────────
  const focus = nextReveal || nextLocked;
  const isLocked  = focus && currentXp(focus) < focus.threshold;
  const isBuyable = !isLocked && focus;

  if (focus) {
    const xp       = currentXp(focus);
    const target   = isLocked ? focus.threshold : focus.buy;
    const pct      = Math.min(100, Math.round((xp / target) * 100));
    const dist     = target - xp;
    const chestCls = isLocked ? "treasure-chest--locked" : "treasure-chest--buyable";
    const nameCls  = isLocked ? "treasure-info__name--hidden" : "";
    const nameText = isLocked ? "Neznana nagrada..." : focus.label;
    const icon     = isLocked ? "📦" : focus.icon;
    const label    = isLocked ? "Naslednja skrinja" : (focus.shared ? "Skupna nagrada" : "Osebna nagrada");

    html += `<div class="treasure-main">
      <div class="treasure-chest ${chestCls}">${icon}</div>
      <div class="treasure-info">
        <p class="treasure-info__label">${label}</p>
        <p class="treasure-info__name ${nameCls}">${nameText}</p>
        <div class="radar-bar-wrap">
          <div class="radar-bar"><div class="radar-bar__fill" style="width:${pct}%"></div></div>
          <span class="radar-xp">${xp}/${target}</span>
        </div>
      </div>
    </div>`;

    if (dist > 0) {
      html += `<div class="radar-next">
        <span class="radar-next__compass">🧭</span>
        <p class="radar-next__text">Naslednje odkritje: <strong>${isLocked ? "Presenečenje" : focus.label}</strong></p>
        <span class="radar-next__dist">še ${dist} XP</span>
      </div>`;
    }
  }

  // ── DOSTOPNE NAGRADE ────────────────────────────────────
  if (buyable.length > 0 || revealed.length > 0) {
    html += `<div class="revealed-list">`;

    buyable.forEach(r => {
      const xp = r.shared ? allXp : agentXp;
      html += `<div class="revealed-item revealed-item--buyable"
        data-reward-id="${r.id}" data-shared="${r.shared}"
        onclick="claimRpgReward(this)" data-reward-cost="${r.buy}">
        <span class="revealed-item__icon">${r.icon}</span>
        <span class="revealed-item__name">${r.label}${r.shared ? " 🤝" : ""}</span>
        <span class="revealed-item__cost">−${r.buy} XP ✓</span>
      </div>`;
    });

    revealed.forEach(r => {
      const xp  = r.shared ? allXp : agentXp;
      const dist = r.buy - xp;
      html += `<div class="revealed-item">
        <span class="revealed-item__icon">${r.icon}</span>
        <span class="revealed-item__name">${r.label}${r.shared ? " 🤝" : ""}</span>
        <span class="revealed-item__cost">še ${dist} XP</span>
      </div>`;
    });

    html += `</div>`;
  }

  html += `</div>`;
  el.innerHTML = html;
}


function claimRpgReward(el) {
  const rewardId = el.dataset.rewardId;
  const cost     = parseInt(el.dataset.rewardCost);
  const shared   = el.dataset.shared === "true";
  const agentId  = getCurrentAgent();
  const rewards  = shared ? LONA_CONFIG.rewards.shared : LONA_CONFIG.rewards.personal;
  const reward   = rewards.find(r => r.id === rewardId);
  if (!reward) return;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${reward.icon}</div>
    <p class="joker-dialog__title">${reward.label}</p>
    <p class="joker-dialog__body">
      ${shared ? "Skupaj porabita" : "Porabiš"} <strong style="color:#C4352A">−${cost} XP</strong>
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Vzemi! 🎁</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (shared) {
      const state = JSON.parse(localStorage.getItem("lona_xp_state") || "{}");
      const total = Object.values(state).reduce((s,v) => s+v, 0);
      LONA_CONFIG.agents.forEach(a => {
        const share = Math.round(((state[a.id]||0) / total) * cost);
        addXp(a.id, -share);
      });
    } else {
      addXp(agentId, -cost);
    }
    showTreasureParticles();
    lonaToast(`${reward.label} — uživaj! 🎁`, "gold");
    setTimeout(renderTreasury, 300);
  });
}


// ── ZVOČNI EFEKTI (Web Audio API) ───────────────────────────
function _playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Zmagovalen akord navzgor
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "fail") {
      // Padajoč ton
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "coin") {
      // Kovanec (bonus XP)
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch(e) { /* Audio ni podprt */ }
}

// ── JUICE ANIMACIJE ─────────────────────────────────────────

/** Pečat animacija — mission complete */
function showStamp(text, color) {
  const color_cls = color === "red" ? "stamp--red" : color === "gold" ? "stamp--gold" : "";
  const overlay = document.createElement("div");
  overlay.className = "stamp-overlay";
  const stamp = document.createElement("div");
  stamp.className = `stamp ${color_cls}`;
  stamp.textContent = text;
  overlay.appendChild(stamp);
  document.body.appendChild(overlay);

  // Animacija noter
  stamp.style.animation = "stamp-in .35s cubic-bezier(.17,.67,.35,1.3) forwards";

  // Zvočni efekt
  if (navigator.vibrate) navigator.vibrate([30, 10, 20]);
  _playSound(color === "red" ? "fail" : "success");

  // Po 1.2s ven
  setTimeout(() => {
    stamp.style.animation = "stamp-out .3s ease forwards";
    setTimeout(() => overlay.remove(), 350);
  }, 1200);
}

/** XP float animacija — +25 XP leti navzgor */
function showXpFloat(amount, x, y) {
  const el = document.createElement("div");
  el.className = "xp-float";
  el.textContent = `+${amount} XP`;
  el.style.left = (x || window.innerWidth / 2) + "px";
  el.style.top  = (y || window.innerHeight / 2) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/** Ripple efekt na gumbu */
function addRipple(btn, e) {
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height);
  const x      = (e?.clientX ?? rect.left + rect.width/2)  - rect.left - size/2;
  const y      = (e?.clientY ?? rect.top  + rect.height/2) - rect.top  - size/2;
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

/** Confetti za rank up */
function showConfetti() {
  const colors = ["#2D7D52","#C47D1A","#2563EB","#C4352A","#5AAF7A"];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      el.style.cssText = `
        left:${Math.random()*100}vw;
        top:-10px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        animation-duration:${1.5 + Math.random()*2}s;
        animation-delay:${Math.random()*0.5}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 30);
  }
}

// ── DOUBLE XP EVENT ─────────────────────────────────────────
let _doubleXpEnd = 0;
let _doubleXpTimer = null;

function isDoubleXpActive() {
  return Date.now() < _doubleXpEnd;
}

function activateDoubleXp(minutes) {
  _doubleXpEnd = Date.now() + minutes * 60000;
  _showDoubleXpBanner(minutes * 60);
  lonaToast(`⚡ DVOJNI XP za ${minutes} minut!`, "gold");
}

function _showDoubleXpBanner(seconds) {
  document.querySelector(".double-xp-banner")?.remove();
  const banner = document.createElement("div");
  banner.className = "double-xp-banner";
  banner.innerHTML = `
    <span class="double-xp-banner__icon">⚡</span>
    <span>DVOJNI XP</span>
    <span class="double-xp-timer" id="dxp-timer">${_fmtSeconds(seconds)}</span>
    <span>aktivno!</span>
  `;
  document.body.appendChild(banner);

  if (_doubleXpTimer) clearInterval(_doubleXpTimer);
  _doubleXpTimer = setInterval(() => {
    const rem = Math.max(0, Math.ceil((_doubleXpEnd - Date.now()) / 1000));
    const el  = document.getElementById("dxp-timer");
    if (el) el.textContent = _fmtSeconds(rem);
    if (rem <= 0) {
      clearInterval(_doubleXpTimer);
      banner.remove();
      lonaToast("Dvojni XP je potekel.", "cyan");
    }
  }, 1000);
}

function _fmtSeconds(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}

// Settings panel — dodaj Double XP gumb
function initDoubleXpButton() {
  const panel = document.getElementById("settings-panel");
  if (!panel) return;
  const box = panel.querySelector("div");
  if (!box) return;
  const btn = document.createElement("button");
  btn.style.cssText = `padding:11px;border-radius:14px;background:#FDF3E3;border:1px solid rgba(196,125,26,.3);color:#C47D1A;font-size:.88rem;font-weight:600;font-family:inherit;width:100%`;
  btn.textContent = "⚡ Aktiviraj 2× XP (15 min)";
  btn.addEventListener("click", () => {
    panel.style.display = "none";
    activateDoubleXp(15);
  });
  // Vstavi pred "Zapri" gumb
  const closeBtn = box.lastElementChild;
  box.insertBefore(btn, closeBtn);
}

// ── COMMANDER PANEL ─────────────────────────────────────────
function renderCmdAgents() {
  const el = document.getElementById("cmd-agents");
  if (!el) return;

  // Prikaži samo current agenta
  const currentId = getCurrentAgent();
  el.innerHTML = LONA_CONFIG.agents.filter(a => a.id === currentId).map(a => {
    const xp      = getXp(a.id);
    const maxXp   = getMaxXp(a.id);
    const rank    = getRank(maxXp);
    const jokers  = typeof getJokers === "function" ? getJokers(a.id) : 0;
    const current = getCurrentAgent();

    // XP bar
    const ranks = LONA_CONFIG.ranks;
    const ci    = ranks.findIndex(r => r.minXp > maxXp);
    const lo    = ranks[Math.max(0, ci-1)]?.minXp ?? 0;
    const hi    = ranks[ci]?.minXp ?? lo + 300;
    const pct   = Math.min(100, Math.round(((maxXp-lo)/(hi-lo))*100));

    const activeCls = a.id === current ? "cmd-agent--active" : "";

    const avatarHtml = a.photo
      ? `<img src="${a.photo}" alt="${a.name}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%" onerror="this.outerHTML='${a.avatar}'">`
      : a.avatar;
    return `<div class="cmd-agent ${activeCls}" data-agent="${a.id}"
        onclick="switchAgent('${a.id}')">
      <div class="cmd-agent__top">
        <span class="cmd-agent__avatar" style="${a.photo ? 'padding:0;overflow:hidden' : ''}">${avatarHtml}</span>
        <div>
          <p class="cmd-agent__name">${a.name}</p>
          <p class="cmd-agent__rank">${rank}</p>
        </div>
      </div>
      <p class="cmd-agent__xp">${xp} <span style="font-size:.7rem;color:#8A8480">XP</span></p>
      <div class="cmd-agent__bar">
        <div class="cmd-agent__bar-fill" style="width:${pct}%"></div>
      </div>
      <p class="cmd-agent__jokers">🃏 ×${jokers}</p>
    </div>`;
  }).join("");
}

function switchAgent(agentId) {
  localStorage.setItem("lona_current_agent", agentId);
  // Posodobi active state
  document.querySelectorAll(".cmd-agent").forEach(el => {
    el.classList.toggle("cmd-agent--active", el.dataset.agent === agentId);
  });
  lonaToast(`Agent: ${LONA_CONFIG.agents.find(a=>a.id===agentId)?.name}`, "green");
}

function giveBonus(amount) {
  const agentId = getCurrentAgent();
  const name    = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

  // Vpraša kateremu agentu
  const d = document.createElement("div");
  d.className = "joker-dialog";
  const btns = LONA_CONFIG.agents.map(a =>
    `<button class="agent-pick-btn" data-id="${a.id}">${a.avatar} ${a.name}</button>`
  ).join("");
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">⭐</div>
    <p class="joker-dialog__title">+${amount} XP Bonus</p>
    <p class="joker-dialog__body">Komu gre bonus?</p>
    <div class="joker-dialog__btns">${btns}</div>
    <button class="joker-dialog__cancel" style="margin-top:8px;width:100%">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelectorAll(".agent-pick-btn").forEach(b => {
    b.addEventListener("click", () => {
      d.remove();
      addXp(b.dataset.id, amount);
      showStamp(`+${amount} XP`, "gold");
      showXpFloat(amount);
      const n = LONA_CONFIG.agents.find(a=>a.id===b.dataset.id)?.name;
      _playSound("coin");
      lonaToast(`${n} +${amount} XP bonus! ⭐`, "gold");
      renderCmdAgents();
  if (typeof initSeason === "function") initSeason();
  if (typeof initEquipment === "function") initEquipment();
    });
  });
}

// ── SEŽIG SVITKA (EpicWin animacija) ────────────────────────
function showScrollBurn(missionLabel, xp) {
  const overlay = document.createElement("div");
  overlay.className = "scroll-burn";
  overlay.innerHTML = `
    <div class="scroll-burn__inner">
      <div class="scroll-burn__parchment">📜</div>
      <p class="scroll-burn__label">${missionLabel}</p>
      <p class="scroll-burn__xp">+${xp} XP</p>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1800);
}

// ══════════════════════════════════════════════════════════
//  JUICE ANIMACIJE v2
// ══════════════════════════════════════════════════════════

/** Joker karta poleti čez zaslon */
function showJokerFly() {
  const el = document.createElement("div");
  el.className = "joker-fly";
  el.textContent = "🃏";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

/** Screen flash ob rank up */
function showScreenFlash() {
  const el = document.createElement("div");
  el.className = "screen-flash";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

/** Mission complete dim */
function showMissionDim(duration) {
  const el = document.createElement("div");
  el.className = "mission-dim";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration || 1500);
}

/** Treasure particle eksplozija */
function showTreasureParticles(x, y) {
  const emojis = ["⭐","✨","💫","🌟","💛","🟡"];
  for (let i = 0; i < 10; i++) {
    const el  = document.createElement("div");
    el.className = "treasure-particle";
    const angle = (i / 10) * 360;
    const dist  = 80 + Math.random() * 60;
    const tx    = `translate(${Math.cos(angle*Math.PI/180)*dist}px, ${Math.sin(angle*Math.PI/180)*dist - 80}px)`;
    el.style.cssText = `left:${x||window.innerWidth/2}px;top:${y||window.innerHeight/2}px;
      --tx:${tx};--rot:${Math.random()*360}deg;
      animation-duration:${.6+Math.random()*.4}s;
      animation-delay:${i*.03}s;`;
    el.textContent = emojis[i % emojis.length];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

/** XP bar bounce animacija */
function animateXpBar(barEl) {
  if (!barEl) return;
  barEl.classList.remove("xp-bar-animate");
  void barEl.offsetWidth; // reflow
  barEl.classList.add("xp-bar-animate");
  setTimeout(() => barEl.classList.remove("xp-bar-animate"), 800);
}

/** Btn pop animacija */
function popBtn(btn) {
  if (!btn) return;
  btn.classList.remove("mission-btn--pop");
  void btn.offsetWidth;
  btn.classList.add("mission-btn--pop");
  setTimeout(() => btn.classList.remove("mission-btn--pop"), 400);
}
