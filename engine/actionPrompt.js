// ============================================================
//  LONA OS — engine/actionPrompt.js  (v2.6)
// ============================================================

const LS_AP = "lona_action_prompt_today";

function apPickRandom() {
  const p = LONA_CONFIG.actionPrompts;
  return p[Math.floor(Math.random() * p.length)];
}

function apGetToday() {
  const today = new Date().toISOString().slice(0, 10);
  const s     = localStorage.getItem(LS_AP);
  if (s) {
    const d = JSON.parse(s);
    if (d.date === today) return d.prompt;
  }
  const prompt = apPickRandom();
  localStorage.setItem(LS_AP, JSON.stringify({ date: today, prompt }));
  return prompt;
}

function apRender(prompt) {
  const iconEl = document.querySelector(".action-prompt-banner__icon");
  const textEl = document.querySelector(".action-prompt-banner__text");
  if (iconEl) iconEl.textContent = prompt.icon;
  if (textEl) textEl.textContent = prompt.instruction;
}

function initActionPrompt() {
  apRender(apGetToday());

  const btn = document.querySelector(".action-prompt-banner__refresh");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const p      = apPickRandom();
    const today  = new Date().toISOString().slice(0, 10);
    localStorage.setItem(LS_AP, JSON.stringify({ date: today, prompt: p }));
    btn.style.transform  = "rotate(180deg)";
    btn.style.transition = "transform 0.3s ease";
    setTimeout(() => { btn.style.transform = ""; }, 350);
    const banner = document.querySelector(".action-prompt-banner");
    if (banner) {
      banner.style.opacity    = "0";
      banner.style.transition = "opacity 0.15s";
      setTimeout(() => { apRender(p); banner.style.opacity = "1"; }, 160);
    }
  });
}
