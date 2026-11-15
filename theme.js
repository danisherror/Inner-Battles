// Theme menu. The saved choice is applied by a small inline script in <head> before the first paint;
// this file only runs the menu, which stays hidden when JavaScript is off (the site then follows the system setting).
(() => {
  const box = document.querySelector("details.theme");
  if (!box) return;
  const root = document.documentElement;
  const buttons = box.querySelectorAll("button");
  const show = () => {
    const current = root.dataset.theme || "";
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.value === current));
  };
  box.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.value) root.dataset.theme = b.value; else delete root.dataset.theme;
    try { if (b.value) localStorage.setItem("theme", b.value); else localStorage.removeItem("theme"); } catch (e) {}
    show();
  });
  document.addEventListener("click", e => { if (!box.contains(e.target)) box.open = false; });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && box.open) { box.open = false; box.querySelector("summary").focus(); }
  });
  show();
  box.hidden = false;
})();
