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
      photo:   null,   // Pot do slike npr. "photos/lea.jpg"
      jokers:  2,
      badges:  ["kuhanje_pomocnik", "sesanje_mojster"],
    },
    {
      id:      "nejc",
      name:    "Nejc",
      xp:      195,
      rank:    "Regrut II",
      avatar:  "🛡️",
      photo:   null,   // Pot do slike npr. "photos/nejc.jpg"
      jokers:  1,
      badges:  ["kuhanje_vajenec"],
    },
  ],

  // ── GLOBAL GOAL ────────────────────────────────────────────
  globalGoal: {
    name:    "Kino Večer",
    icon:    "🎬",
    current: 0,
    target:  500,
    unit:    "XP",
  },

  // ── REWARD SYSTEM ──────────────────────────────────────────
  // revealAt: koliko XP mora agent imeti da vidi nagrado
  // buyAt:    koliko XP stane nagrada
  // sharedRevealAt: skupni XP za odkritje skupne nagrade
  rewards: {
    personal: [
      { id: "igra_15",    label: "15 min igre",        icon: "🎮", buyAt: 30,  revealAt: 0   },
      { id: "cokolada",   label: "Čokolada",            icon: "🍫", buyAt: 50,  revealAt: 30  },
      { id: "sladoled",   label: "Sladoled",            icon: "🍦", buyAt: 80,  revealAt: 50  },
      { id: "kosilo",     label: "Izbira kosila",       icon: "🍽️", buyAt: 150, revealAt: 100 },
      { id: "trgovina",   label: "Izbira v trgovini",   icon: "🛒", buyAt: 250, revealAt: 200 },
    ],
    shared: [
      { id: "risanka",    label: "Risanka skupaj",      icon: "📺", buyAt: 80,  sharedRevealAt: 0   },
      { id: "tabor",      label: "Tabor v dnevni sobi", icon: "🏕️", buyAt: 200, sharedRevealAt: 100 },
      { id: "kino",       label: "Kino večer",          icon: "🎬", buyAt: 500, sharedRevealAt: 250 },
      { id: "izlet",      label: "Izlet po izbiri",     icon: "🗺️", buyAt: 800, sharedRevealAt: 500 },
    ],
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
      baseXp:       15,
      cooldownHrs:  72,
      state:        "available",
    },
    perilo: {
      id:              "perilo",
      label:           "Gora Perila",
      icon:            "ph-stack",
      baseXp:          30,
      cooldownHrs:     72,
      isScoutBonus:    true,  // Agent sam opazi → XP × scoutMultiplier
      scoutMultiplier: 2.5,
      state:           "special",
    },
    wc: {
      id:          "wc",
      location:    "indoor",
      duration:    "short",
      label:       "WC Čiščenje",
      icon:        "ph-toilet",
      baseXp:      20,
      cooldownHrs: 72,
      state:       "available",
    },
    kuhanje: {
      id:             "kuhanje",
      label:          "Kuhanje",
      icon:           "ph-cooking-pot",
      baseXp:         40,
      cooldownHrs:    72,
      hasMastery:     true,
      masterySkillId: "kuhanje",
      state:          "available",
    },
    izvidnik: {
      id:        "izvidnik",
      label:     "Izvidniški Bonus",
      icon:      "ph-eye",
      baseXp:    0,
      isScout:   true,
      state:     "available",
    },
    skupna: {
      id:        "skupna",
      label:     "Skupna Misija",
      icon:      "ph-users-three",
      baseXp:    30,
      isShared:  true, // Oba agenta dobita XP
      state:     "available",
    },
    // ── OUTDOOR MISIJE ─────────────────────────────────────
    listi: {
      id: "listi", label: "List Detektiv", icon: "🍃",
      baseXp: 20, cooldownHrs: 48,
      location: "outdoor", duration: "short",
      state: "available",
    },
    pot: {
      id: "pot", label: "Počisti Pot", icon: "🧹",
      baseXp: 25, cooldownHrs: 72,
      location: "outdoor", duration: "short",
      state: "available",
    },
    taborisce: {
      id: "taborisce", label: "Vzpostavi Taborišče", icon: "🏕️",
      baseXp: 50, cooldownHrs: 168,
      location: "outdoor", duration: "long",
      state: "available",
    },
    narava_foto: {
      id: "narava_foto", label: "Narava Fotograf", icon: "📸",
      baseXp: 30, cooldownHrs: 72,
      location: "outdoor", duration: "medium",
      state: "available",
    },
    vrt: {
      id: "vrt", label: "Vrtnar", icon: "🌱",
      baseXp: 35, cooldownHrs: 72,
      location: "outdoor", duration: "medium",
      state: "available",
    },
    orientacija_out: {
      id: "orientacija_out", label: "Orientacija", icon: "🧭",
      baseXp: 40, cooldownHrs: 168,
      location: "outdoor", duration: "medium",
      state: "available",
    },

    // ── EQ OPERACIJE ──────────────────────────────────────
    nevtralizator: {
      id:        "nevtralizator",
      label:     "Nevtralizator",
      icon:      "🧘",
      baseXp:    0,       // Nagrada je Joker, ne XP
      isEq:      true,
      eqType:    "nevtralizator",
      state:     "available",
    },
    debriefing: {
      id:        "debriefing",
      label:     "Debriefing",
      icon:      "📋",
      baseXp:    25,
      isEq:      true,
      eqType:    "debriefing",
      state:     "available",
    },
    intel_report: {
      id:        "intel_report",
      label:     "Intel Report",
      icon:      "🤝",
      baseXp:    20,
      isEq:      true,
      eqType:    "intel_report",
      cooldownHrs: 168, // 1x na teden
      state:     "available",
    },
    advokat: {
      id:        "advokat",
      label:     "Advokat",
      icon:      "⚖️",
      baseXp:    30,
      isEq:      true,
      eqType:    "advokat",
      state:     "available",
    },

    skrivna_wc: {
      id:       "skrivna_wc",
      label:    "Skrivna Misija",
      icon:     "ph-question",
      baseXp:   0,
      isHidden: true,
      state:    "hidden",
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
          xpCost: 25, xpReward: 0, autonomy: "opazovalec",
        },
        {
          level: 2, id: "mojster", label: "Mojster", icon: "⭐",
          description: "Polna licenca. S to veščino zdaj zaslužuješ XP.",
          xpCost: 0, xpReward: 40, autonomy: "samostojno",
          unlocksBadge: "kuhanje_mojster",
        },
      ],
    },
    voda: {
      id: "voda", label: "Gospodar Vode", icon: "💧",
      levels: [
        {
          level: 0, id: "iskanje", label: "Poišči ventil", icon: "🔍",
          description: "S starším poišči glavni ventil za vodo v hiši.",
          xpCost: 0, xpReward: 20, autonomy: "nadzor",
        },
        {
          level: 1, id: "zapiranje", label: "Zapri ventil", icon: "🔧",
          description: "Sam poišči ventil in ga zapri ko starš reče.",
          xpCost: 0, xpReward: 30, autonomy: "opazovalec",
        },
        {
          level: 2, id: "mojster", label: "Mojster", icon: "⭐",
          description: "Zapri in odpri ventil v 30 sekundah. Brez pomoči.",
          xpCost: 0, xpReward: 50, autonomy: "samostojno",
          unlocksBadge: "voda_mojster",
        },
      ],
    },
    blackout: {
      id: "blackout", label: "Blackout Protokol", icon: "🔦",
      levels: [
        {
          level: 0, id: "z_lucko", label: "Z lučko", icon: "🔦",
          description: "Z naglavno lučko najdi pot do varovalke skupaj s starším.",
          xpCost: 0, xpReward: 20, autonomy: "nadzor",
        },
        {
          level: 1, id: "vodenje", label: "Glasovno vodenje", icon: "🗣️",
          description: "Brez lučke. Starš te usmerja samo z besedami: levo, desno, stop.",
          xpCost: 0, xpReward: 30, autonomy: "opazovalec",
        },
        {
          level: 2, id: "mojster", label: "Mojster", icon: "⭐",
          description: "Sam, v temi, do varovalke in nazaj v 60 sekundah.",
          xpCost: 0, xpReward: 50, autonomy: "samostojno",
          unlocksBadge: "blackout_mojster",
        },
      ],
    },
    diplomat: {
      id: "diplomat", label: "Diplomat", icon: "🎩",
      levels: [
        {
          level: 0, id: "trgovina", label: "Vprašaj v trgovini", icon: "🛒",
          description: "Sam pristopi k prodajalcu in vprašaj kje je artikel. Brez pomoči.",
          xpCost: 0, xpReward: 25, autonomy: "nadzor",
        },
        {
          level: 1, id: "restavracija", label: "Naroči v restavraciji", icon: "🍽️",
          description: "Sam naroči hrano za celo mizo. Pozdrav, naročilo, hvala.",
          xpCost: 0, xpReward: 35, autonomy: "opazovalec",
        },
        {
          level: 2, id: "mojster", label: "Mojster", icon: "⭐",
          description: "Reši problem sam — reklamacija, napaka v naročilu, zamuda.",
          xpCost: 0, xpReward: 50, autonomy: "samostojno",
          unlocksBadge: "diplomat_mojster",
        },
      ],
    },
    mizarstvo: {
      id: "mizarstvo", label: "Mizarstvo", icon: "🪚",
      levels: [
        { level: 0, id: "vajenec",  label: "Vajenec",  icon: "🌱", description: "Kladivo, žeblji, osnove. Polni nadzor.",    xpCost: 75, xpReward: 0,  autonomy: "nadzor",      },
        { level: 1, id: "pomocnik", label: "Pomočnik", icon: "🔧", description: "Žaga in vrtalnik. Starš opazuje.",           xpCost: 25, xpReward: 0,  autonomy: "opazovalec",  },
        { level: 2, id: "mojster",  label: "Mojster",  icon: "⭐", description: "Popravi sam. Polna samostojnost.",           xpCost: 0,  xpReward: 50, autonomy: "samostojno", unlocksBadge: "mizarstvo_mojster" },
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

  // ── GIBALNI ATRIBUTI ────────────────────────────────────────
  attributes: {
    moc: {
      id: "moc", label: "Moč", icon: "💪", color: "#FF3B30",
      xpPerLevel: 50,
      titles: ["Začetnik","Borec","Vojak","Junak","Jeklen"],
      missions: ["sesanje","pot","taborisce","perilo"],
    },
    koordinacija: {
      id: "koordinacija", label: "Koordinacija", icon: "🎯", color: "#007AFF",
      xpPerLevel: 40,
      titles: ["Neroden","Natančen","Spreten","Virtuoz","Maestro"],
      missions: ["posoda","kuhanje","listi","narava_foto"],
    },
    hitrost: {
      id: "hitrost", label: "Hitrost", icon: "⚡", color: "#FFD60A",
      xpPerLevel: 45,
      titles: ["Počasen","Hiter","Blic","Strela","Hitronogi"],
      missions: ["wc","sesanje","pot"],
    },
    vzdrzljivost: {
      id: "vzdrzljivost", label: "Vzdržljivost", icon: "🫁", color: "#34C759",
      xpPerLevel: 60,
      titles: ["Šibak","Trdoživ","Vzdržen","Železen","Maratonec"],
      missions: ["taborisce","orientacija_out","vrt","skupna"],
    },
    motorika: {
      id: "motorika", label: "Fina Motorika", icon: "🖐️", color: "#AF52DE",
      xpPerLevel: 35,
      titles: ["Neroden","Priden","Spreten","Artist","Mojster Rok"],
      missions: ["posoda","kuhanje","perilo","vrt","listi"],
    },
    um: {
      id: "um", label: "Um", icon: "🧠", color: "#FF9500",
      xpPerLevel: 40,
      titles: ["Sanjar","Mislec","Strateg","Taktik","Genij"],
      missions: ["debriefing","advokat","intel_report","orientacija_out"],
    },
  },

  // ── OPREMA = LICENCA ────────────────────────────────────────
  // Oprema se odklene ko agent doseže določen mastery level
  // To je dokaz dejanskega znanja — ne okras
  equipment: [
    {
      id:          "vakuumsko_rezilo",
      label:       "Vakuumsko Rezilo",
      icon:        "🌀",
      description: "Orodje mojstrov sesanja. Hitreje, tiše, brez sledi.",
      slot:        "weapon",
      unlockedBy:  { skill: "sesanje_mastery", level: 1 },
      xpBonus:     0.1, // +10% XP na sesanje misijah
    },
    {
      id:          "kuharski_mec",
      label:       "Kuharjev Meč",
      icon:        "🍳",
      description: "Ni samo za rezanje zelenjave. Pravi kuharski mojster ga nosi.",
      slot:        "weapon",
      unlockedBy:  { skill: "kuhanje", level: 1 },
      xpBonus:     0.1,
    },
    {
      id:          "mojstrski_sekac",
      label:       "Mojstrski Sekač",
      icon:        "🪚",
      description: "Podeljeno le tistim, ki poznajo les in žebelj.",
      slot:        "weapon",
      unlockedBy:  { skill: "mizarstvo", level: 1 },
      xpBonus:     0.1,
    },
    {
      id:          "vodna_palica",
      label:       "Vodna Palica",
      icon:        "💧",
      description: "Nadzor nad vodo. Hiša je varna dokler jo nosiš.",
      slot:        "armor",
      unlockedBy:  { skill: "voda", level: 1 },
      xpBonus:     0,
    },
    {
      id:          "nocni_scit",
      label:       "Nočni Ščit",
      icon:        "🔦",
      description: "Varuje v temi. Edini, ki ga nosijo tisti brez strahu.",
      slot:        "armor",
      unlockedBy:  { skill: "blackout", level: 1 },
      xpBonus:     0,
    },
    {
      id:          "zlati_jezik",
      label:       "Zlati Jezik",
      icon:        "🎩",
      description: "Beseda je orožje. Podeljeno le pravim diplomatom.",
      slot:        "special",
      unlockedBy:  { skill: "diplomat", level: 1 },
      xpBonus:     0,
    },
  ],

  // ── BANKA LONA ──────────────────────────────────────────────
  bank: {
    interestRate:  0.20,   // 20% obresti
    durationDays:  7,      // po 7 dneh
    minDeposit:    50,     // minimalni depozit
    maxDeposit:    500,    // maksimalni depozit
  },

  // ── TEDENSKE SEZONE ────────────────────────────────────────
  season: {
    label:       "Sezona 1",
    resetDay:    0,    // 0 = nedelja
    resetHour:   0,    // polnoč
    rewards: [
      { rank: 1, label: "Zmagovalec tedna", icon: "🏆", bonusXp: 30 },
      { rank: 2, label: "Finalist",          icon: "🥈", bonusXp: 15 },
    ],
  },

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
