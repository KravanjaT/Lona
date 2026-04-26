// ============================================================
//  LONA OS — engine/bank.js  (v2.6)
//  Banka Lona — investiraj XP, dobi obresti po 7 dneh
// ============================================================

const LS_BANK = "lona_bank";

function bankLoad() {
  return JSON.parse(localStorage.getItem(LS_BANK) || "[]");
}
function bankSave(s) { localStorage.setItem(LS_BANK, JSON.stringify(s)); }

function getBankDeposits(agentId) {
  return bankLoad().filter(d => d.agentId === agentId);
}

function depositToBank(agentId, amount) {
  const cfg = LONA_CONFIG.bank;
  if (amount < cfg.minDeposit) {
    lonaToast(`Minimum depozit: ${cfg.minDeposit} XP`, "red"); return;
  }
  if (amount > cfg.maxDeposit) {
    lonaToast(`Maksimum depozit: ${cfg.maxDeposit} XP`, "red"); return;
  }
  if (getXp(agentId) < amount) {
    lonaToast("Premalo XP!", "red"); return;
  }
  addXp(agentId, -amount);
  const deposits = bankLoad();
  deposits.push({
    agentId, amount,
    matureAt: Date.now() + cfg.durationDays * 86400000,
    reward:   Math.round(amount * (1 + cfg.interestRate)),
    date:     new Date().toISOString(),
  });
  bankSave(deposits);
  lonaToast(`${amount} XP investiranih v Banko Lona 🏦`, "gold");
  renderBankPanel();
}

function checkBankMaturity() {
  const deposits = bankLoad();
  const now      = Date.now();
  let changed    = false;

  deposits.forEach(d => {
    if (!d.claimed && d.matureAt <= now) {
      d.claimed = true;
      addXp(d.agentId, d.reward);
      const name = LONA_CONFIG.agents.find(a => a.id === d.agentId)?.name || d.agentId;
      const profit = d.reward - d.amount;
      // Pokaži obvestilo
      setTimeout(() => {
        const el = document.createElement("div");
        el.className = "joker-dialog";
        el.innerHTML = `<div class="joker-dialog__box">
          <div class="joker-dialog__icon">🏦</div>
          <p class="joker-dialog__title">Banka Lona</p>
          <p class="joker-dialog__body">
            <strong>${name}</strong>, tvoja investicija je dozorela!<br><br>
            Vloženo: <strong>${d.amount} XP</strong><br>
            Obresti: <strong style="color:#34C759">+${profit} XP</strong><br>
            Skupaj: <strong style="color:#FFD60A;font-size:1.1rem">${d.reward} XP</strong>
          </p>
          <button class="joker-dialog__confirm" style="width:100%">Dvigi 💰</button>
        </div>`;
        document.body.appendChild(el);
        el.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
          el.remove();
          showStamp("DOBIČEK!", "gold");
          showXpFloat(d.reward);
          if (typeof showConfetti === "function") showConfetti();
        });
      }, 500);
      changed = true;
    }
  });

  if (changed) bankSave(deposits);
}

function renderBankPanel() {
  const el = document.getElementById("bank-panel");
  if (!el) return;

  const agentId  = typeof getCurrentAgent === "function" ? getCurrentAgent() : LONA_CONFIG.agents[0].id;
  const deposits = getBankDeposits(agentId).filter(d => !d.claimed);
  const cfg      = LONA_CONFIG.bank;
  const xp       = typeof getXp === "function" ? getXp(agentId) : 0;

  let html = `<div class="bank-header">
    <span class="bank-icon">🏦</span>
    <div>
      <p class="bank-title">Banka Lona</p>
      <p class="bank-sub">Investiraj XP · +${Math.round(cfg.interestRate*100)}% po ${cfg.durationDays} dneh</p>
    </div>
  </div>`;

  // Aktivni depoziti
  if (deposits.length > 0) {
    html += `<div class="bank-deposits">`;
    deposits.forEach(d => {
      const rem  = Math.max(0, d.matureAt - Date.now());
      const days = Math.ceil(rem / 86400000);
      const hrs  = Math.ceil(rem / 3600000);
      const pct  = Math.min(100, Math.round((1 - rem / (cfg.durationDays * 86400000)) * 100));
      const timeLabel = days > 1 ? `${days} dni` : `${hrs}h`;
      html += `<div class="bank-deposit-row">
        <span class="bank-deposit__icon">💰</span>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:.8rem;font-weight:800;color:#1C1C1E">${d.amount} XP → <span style="color:#FFD60A">${d.reward} XP</span></span>
            <span style="font-size:.72rem;font-weight:700;color:#8E8E93">${timeLabel}</span>
          </div>
          <div style="height:8px;background:#F2F2F7;border-radius:20px;overflow:hidden;border:2px solid #C7C7CC">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#34C759,#FFD60A);border-radius:20px;transition:width .6s ease"></div>
          </div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  // Depozit forma
  const canDeposit = xp >= cfg.minDeposit;
  html += `<div class="bank-deposit-form">
    <p style="font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:8px">Nova investicija</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">`;

  [50, 100, 200, 300].forEach(amt => {
    const enabled = xp >= amt;
    html += `<button onclick="depositToBank('${agentId}',${amt})"
      style="padding:10px 4px;border-radius:12px;font-family:inherit;font-size:.82rem;font-weight:900;
      border:2.5px solid ${enabled ? '#FFD60A' : '#C7C7CC'};
      background:${enabled ? '#FFFBE6' : '#F2F2F7'};
      color:${enabled ? '#FF9500' : '#C7C7CC'};
      cursor:${enabled ? 'pointer' : 'not-allowed'};
      box-shadow:${enabled ? '0 3px 0 rgba(255,214,10,.3)' : 'none'}"
      ${enabled ? '' : 'disabled'}>${amt}</button>`;
  });

  html += `</div>
    <p style="font-size:.68rem;color:#8E8E93;text-align:center">Min: ${cfg.minDeposit} XP · Tvoj XP: <strong style="color:#34C759">${xp}</strong></p>
  </div>`;

  el.innerHTML = html;
}

function initBank() {
  checkBankMaturity();
  renderBankPanel();
}
