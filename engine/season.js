// ============================================================
//  LONA OS — engine/season.js  (v2.6)
//  Tedenske sezone — ločen tedenski XP, reset ob nedeljah
// ============================================================

const LS_SEASON    = "lona_season_xp";
const LS_SEASON_WK = "lona_season_week";

function _getWeekKey() {
  const now  = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function getSeasonXp(agentId) {
  const state = JSON.parse(localStorage.getItem(LS_SEASON) || "{}");
  const wk    = localStorage.getItem(LS_SEASON_WK);
  if (wk !== _getWeekKey()) return 0; // Nov teden
  return state[agentId] ?? 0;
}

function addSeasonXp(agentId, amount) {
  if (amount <= 0) return;
  const wk    = _getWeekKey();
  const saved = localStorage.getItem(LS_SEASON_WK);

  // Nov teden — resetiraj
  if (saved !== wk) {
    _checkSeasonEnd(saved);
    localStorage.setItem(LS_SEASON_WK, wk);
    localStorage.setItem(LS_SEASON, JSON.stringify({}));
  }

  const state   = JSON.parse(localStorage.getItem(LS_SEASON) || "{}");
  state[agentId] = (state[agentId] ?? 0) + amount;
  localStorage.setItem(LS_SEASON, JSON.stringify(state));
  renderSeasonPanel();
}

function _checkSeasonEnd(oldWeek) {
  if (!oldWeek) return;
  const state = JSON.parse(localStorage.getItem(LS_SEASON) || "{}");
  if (!Object.keys(state).length) return;

  // Razglasi zmagovalca
  const sorted = LONA_CONFIG.agents
    .map(a => ({ id: a.id, name: a.name, avatar: a.avatar, xp: state[a.id] ?? 0 }))
    .sort((a, b) => b.xp - a.xp);

  const winner = sorted[0];
  if (!winner || winner.xp === 0) return;

  // Bonus XP za zmagovalca
  LONA_CONFIG.season.rewards.forEach((r, i) => {
    if (sorted[i]) {
      addXp(sorted[i].id, r.bonusXp);
    }
  });

  // Pokaži razglasitev ob naslednjem zagonu
  localStorage.setItem("lona_season_winner", JSON.stringify({
    week: oldWeek, winner: winner, scores: sorted
  }));
}

function renderSeasonPanel() {
  const el = document.getElementById("season-panel");
  if (!el) return;

  const wk     = _getWeekKey();
  const saved  = localStorage.getItem(LS_SEASON_WK);
  const scores = saved === wk
    ? JSON.parse(localStorage.getItem(LS_SEASON) || "{}")
    : {};

  const sorted = LONA_CONFIG.agents
    .map(a => ({ ...a, xp: scores[a.id] ?? 0 }))
    .sort((a, b) => b.xp - a.xp);

  const max = Math.max(...sorted.map(a => a.xp), 1);

  el.innerHTML = `
    <div class="season-header">
      <span class="season-icon">🏆</span>
      <div>
        <p class="season-title">${LONA_CONFIG.season.label}</p>
        <p class="season-sub">Tedenski turnir · reset v nedeljo</p>
      </div>
    </div>
    <div class="season-scores">
      ${sorted.map((a, i) => `
        <div class="season-row ${i === 0 ? 'season-row--lead' : ''}">
          <span class="season-rank">${i === 0 ? '🥇' : '🥈'}</span>
          <span class="season-avatar">${a.avatar}</span>
          <span class="season-name">${a.name}</span>
          <div class="season-bar">
            <div class="season-bar__fill" style="width:${Math.round((a.xp/max)*100)}%"></div>
          </div>
          <span class="season-xp">${a.xp} XP</span>
        </div>
      `).join("")}
    </div>
    <p class="season-note">Zmagovalec dobi +${LONA_CONFIG.season.rewards[0].bonusXp} XP bonus!</p>
  `;
}

function checkSeasonWinnerAnnouncement() {
  const data = localStorage.getItem("lona_season_winner");
  if (!data) return;
  localStorage.removeItem("lona_season_winner");
  const { week, winner, scores } = JSON.parse(data);

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🏆</div>
    <p class="joker-dialog__title">Zmagovalec tedna!</p>
    <p class="joker-dialog__body">
      <strong style="font-size:1.3rem">${winner.avatar} ${winner.name}</strong><br>
      ${winner.xp} XP ta teden<br>
      <span style="color:#2D7D52;font-weight:600">+${LONA_CONFIG.season.rewards[0].bonusXp} XP bonus!</span>
    </p>
    <button class="joker-dialog__confirm" style="width:100%">Naprej! 🚀</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (typeof showConfetti === "function") showConfetti();
  });
}

function initSeason() {
  renderSeasonPanel();
  checkSeasonWinnerAnnouncement();
}
