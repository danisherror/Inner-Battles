// Theme menu. Loaded in <head> without defer so the saved theme is applied before the first paint;
// the menu itself is set up once the page has parsed. It stays hidden when JavaScript is off
// (the site then follows the system setting).
(() => {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved; // a value style.css does not know simply leaves the system colours
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", () => {
    const box = document.querySelector("details.theme");
    if (!box) return;
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
    // Tabbing out of the menu closes it too, so it does not stay open over the page.
    box.addEventListener("focusout", e => { if (e.relatedTarget && !box.contains(e.relatedTarget)) box.open = false; });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && box.open) { box.open = false; box.querySelector("summary").focus(); }
    });
    show();
    box.hidden = false;
  });
})();
