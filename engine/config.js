// ============================================================
//  LONA OS — config.js  (v2.6)
//  Single source of truth. Edit values here, nowhere else.
//  New in v2.6: Mastery system, Scholar, Jokers, Action Prompts
// ============================================================

const LONA_CONFIG = {

  // ── META ───────────────────────────────────────────────────
  version: "2.6",
  appName: "LONA OS",
  subtitle: "Poveljniški Center",

  // ── AGENTS ─────────────────────────────────────────────────
  agents: [
    {
      id:      "lea",
      name:    "Lea",
      xp:      240,
      rank:    "Vojak I",
      avatar:  "⚡",
      jokers:  2,
      badges:  ["kuhanje_pomocnik", "sesanje_mojster"],
    },
    {
      id:      "nejc",
      name:    "Nejc",
      xp:      195,
      rank:    "Regrut II",
      avatar:  "🛡️",
      jokers:  1,
      badges:  ["kuhanje_vajenec"],
    },
  ],

  // ── GLOBAL GOAL ────────────────────────────────────────────
  globalGoal: {
    name:    "Kino Večer",
    icon:    "🎬",
    current: 435,
    target:  500,
    unit:    "XP",
  },

  // ── GATEKEEPER (Nivo 0) ────────────────────────────────────
  // Brez tega je aplikacija ZAKLENJENA
  gatekeeper: {
    label:    "STANDARD 0: ODOBRENO",
    subtitle: "Dnevni protokol — brez tega nič ne deluje",
    checks: [
      { id: "zobje",  label: "Zobje",  icon: "ph-tooth" },
      { id: "pizama", label: "Pižama", icon: "ph-moon"  },
      { id: "miza",   label: "Miza",   icon: "ph-table" },
    ],
  },

  // ── ACTION PROMPTS (Gibalni modifikatorji) ─────────────────
  // Naključno izberi 1 pred vsako misijo
  actionPrompts: [
    { id: "preval",      label: "Preval",              icon: "🤸", instruction: "Naredi preval, preden začneš!" },
    { id: "storklja",    label: "Štorklja",             icon: "🦩", instruction: "Stoj na eni nogi 10 sekund." },
    { id: "ninja",       label: "Nindža",               icon: "🥷", instruction: "Priplazi se do cilja brez hrupa." },
    { id: "slepo",       label: "Navigacija na slepo",  icon: "🙈", instruction: "Eden zaprte oči, drugi ga usmerja z besedami." },
    { id: "diplomat",    label: "Diplomat",             icon: "🎩", instruction: "Misijo dogovori sam — brez pomoči starša." },
    { id: "prepir_stop", label: "Mir na kavču",         icon: "🛋️", instruction: "Prepir med delom? 5 min skupnega načrtovanja na kavču." },
  ],

  // ── MISSIONS ───────────────────────────────────────────────
  missions: {
    sesanje: {
      id:           "sesanje",
      label:        "Sesanje",
      icon:         "ph-wind",
      baseXp:       25,
      cooldownHrs:  72,
      state:        "locked",
      cooldownEnds: null, // ISO timestamp — set by engine.js
    },
    posoda: {
      id:      "posoda",
      label:   "Pomivalni Stroj",
      icon:    "ph-bowl-food",
      baseXp:  15,
      state:   "available",
    },
    perilo: {
      id:              "perilo",
      label:           "Gora Perila",
      icon:            "ph-stack",
      baseXp:          30,
      isScoutBonus:    true,  // Agent sam opazi → XP × scoutMultiplier
      scoutMultiplier: 2.5,
      state:           "special",
    },
    skrivna_wc: {
      id:       "skrivna_wc",
      label:    "WC Čiščenje",
      icon:     "ph-toilet",
      baseXp:   20,
      isHidden: true, // Skrivna misija → podeli Joker
      state:    "hidden",
    },
    kuhanje: {
      id:             "kuhanje",
      label:          "Kuhanje",
      icon:           "ph-cooking-pot",
      baseXp:         40,
      hasMastery:     true,
      masterySkillId: "kuhanje",
      state:          "available",
    },
  },

  // ── JOKER SISTEM ───────────────────────────────────────────
  joker: {
    description: "Preskoči Cooldown ali odkleni zaklenjeno misijo",
    icon:        "🃏",
    sourceLabel: "Dobljeni z opravljanjem Skrivnih misij",
    maxPerAgent: 5,
  },

  // ── MASTERY SYSTEM (Stopnje Mojstrstva) ────────────────────
  masterySkills: {
    kuhanje: {
      id:    "kuhanje",
      label: "Kuhanje",
      icon:  "👨‍🍳",
      levels: [
        {
          level: 0, id: "vajenec", label: "Vajenec", icon: "🌱",
          description: "Učiš se osnov. Starš je 100% nadzornik.",
          xpCost: 50, xpReward: 0, autonomy: "nadzor",
        },
        {
          level: 1, id: "pomocnik", label: "Pomočnik", icon: "🔧",
          description: "Starš pasivno opazuje. Brezplačna praksa.",
          xpCost: 0, xpReward: 20, autonomy: "opazovalec",
        },
        {
          level: 2, id: "mojster", label: "Mojster", icon: "⭐",
          description: "Polna licenca. S to veščino zdaj zaslužuješ XP.",
          xpCost: 0, xpReward: 40, autonomy: "samostojno",
          unlocksBadge: "kuhanje_mojster",
        },
      ],
    },
    mizarstvo: {
      id: "mizarstvo", label: "Mizarstvo", icon: "🪚",
      levels: [
        { level: 0, id: "vajenec",  label: "Vajenec",  icon: "🌱", description: "Kladivo, žeblji, osnove. Polni nadzor.",    xpCost: 75, xpReward: 0,  autonomy: "nadzor",      },
        { level: 1, id: "pomocnik", label: "Pomočnik", icon: "🔧", description: "Žaga in vrtalnik. Starš opazuje.",           xpCost: 0,  xpReward: 25, autonomy: "opazovalec",  },
        { level: 2, id: "mojster",  label: "Mojster",  icon: "⭐", description: "Popravi sam. Polna samostojnost.",           xpCost: 0,  xpReward: 50, autonomy: "samostojno", unlocksBadge: "mizarstvo_mojster" },
      ],
    },
    orientacija: {
      id: "orientacija", label: "Orientacija brez GPS", icon: "🧭",
      levels: [
        { level: 0, id: "vajenec",  label: "Vajenec",  icon: "🌱", description: "Branje karte s starším.",              xpCost: 30, xpReward: 0,  autonomy: "nadzor",      },
        { level: 1, id: "pomocnik", label: "Pomočnik", icon: "🔧", description: "Vodi skupino po karti.",               xpCost: 0,  xpReward: 15, autonomy: "opazovalec",  },
        { level: 2, id: "mojster",  label: "Mojster",  icon: "⭐", description: "Samostojna pot v neznanem območju.",   xpCost: 0,  xpReward: 35, autonomy: "samostojno", unlocksBadge: "orientacija_mojster" },
      ],
    },
  },

  // ── SCHOLAR MODULE (Knjižni Molj) ──────────────────────────
  scholar: {
    label:                "Knjižni Molj",
    icon:                 "📚",
    briefingLabel:        "Ustni brifing s Poveljnikom",
    familyClubMultiplier: 2, // Branje mlajšemu podvoji točke
    bookTypes: [
      { id: "slikanica",   label: "Slikanica",             difficulty: 1, baseXp: 10 },
      { id: "poglavje",    label: "Zgodba s poglavji",     difficulty: 2, baseXp: 20 },
      { id: "roman",       label: "Roman",                 difficulty: 3, baseXp: 40 },
      { id: "literatura",  label: "Literatura / Strokovna", difficulty: 4, baseXp: 60 },
    ],
    activeSessions: [], // { agentId, bookTypeId, startDate, forYounger: bool }
  },

  // ── XP THRESHOLDS ──────────────────────────────────────────
  ranks: [
    { label: "Regrut I",   minXp:    0 },
    { label: "Regrut II",  minXp:   50 },
    { label: "Vojak I",    minXp:  150 },
    { label: "Vojak II",   minXp:  300 },
    { label: "Narednik",   minXp:  500 },
    { label: "Poročnik",   minXp:  800 },
    { label: "Kapitan",    minXp: 1200 },
  ],

  // ── LONA PRO (V razvoju) ───────────────────────────────────
  lonaPro: {
    enabled: false,
    features: [
      "Heritage Skills (popravi sam, mizarstvo, samooskrba)",
      "Analogni Fokus (Deep Work, težka besedila, brez zaslonov)",
      "Mentor Bonus: prenos veščin na Lona Kids prinaša nagrade",
    ],
  },

};

// ============================================================
//  LONA OS — Debug / Reset Tools
//  Pokliči iz konzole: lonaReset() ali lonaDebug()
// ============================================================

function lonaReset() {
  // Zbriši VSE lona_ ključe
  Object.keys(localStorage)
    .filter(k => k.startsWith("lona_"))
    .forEach(k => localStorage.removeItem(k));
  // Zbriši tudi rank state
  localStorage.removeItem("lona_rank_state");
  console.log("✅ LONA OS — popolni reset");
  location.reload();
}

function lonaDebug() {
  console.group("🔍 LONA OS State");
  console.log("XP:", JSON.parse(localStorage.getItem("lona_xp_state") || "{}"));
  console.log("Jokers:", JSON.parse(localStorage.getItem("lona_jokers") || "{}"));
  console.log("Gatekeeper:", localStorage.getItem("lona_gatekeeper_date"));
  console.log("Mission log entries:", JSON.parse(localStorage.getItem("lona_mission_log") || "[]").length);
  console.log("Scholar sessions:", JSON.parse(localStorage.getItem("lona_scholar_sessions") || "[]").length);
  Object.keys(LONA_CONFIG.missions).forEach(id => {
    const ms = Math.max(0, parseInt(localStorage.getItem("lona_cooldown_" + id) || "0") - Date.now());
    if (ms > 0) console.log(`Cooldown ${id}:`, Math.round(ms/3600000) + "h");
  });
  console.groupEnd();
}
