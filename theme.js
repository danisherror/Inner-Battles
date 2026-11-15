// Theme and text size menu. Loaded in <head> without defer so the saved theme and size are applied before
// the first paint; the menu itself is set up once the page has parsed. It stays hidden when JavaScript is off
// (the site then follows the system setting at the browser's own text size).
// It also sets the browser bar colour (the theme-color meta tags) to the page colour of the theme picked.
(() => {
  const root = document.documentElement;
  // Text size steps; style.css sets the root font size for each, and every size in style.css is in rem.
  const SIZES = { "-1": "90%", "0": "100%", "1": "115%", "2": "130%" };
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved; // a value style.css does not know simply leaves the system colours
    const size = localStorage.getItem("size");
    if (size in SIZES && size !== "0") root.dataset.size = size;
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", () => {
    const box = document.querySelector("details.theme");
    if (!box) return;
    const buttons = box.querySelectorAll(".themes button");
    const steps = box.querySelectorAll(".text-size button");
    // The page has one tag for light and one for dark; with a theme picked both take its --bg. The stylesheet has
    // been applied by now: DOMContentLoaded waits for the deferred scripts, and they wait for the stylesheet.
    const bars = [...document.querySelectorAll('meta[name="theme-color"]')];
    const auto = bars.map(m => m.content);
    const paintBar = () => {
      const bg = root.dataset.theme && getComputedStyle(root).getPropertyValue("--bg").trim();
      bars.forEach((m, i) => { m.content = bg || auto[i]; });
    };
    const show = () => {
      const current = root.dataset.theme || "";
      for (const b of buttons) b.setAttribute("aria-pressed", String(b.value === current));
      const size = Number(root.dataset.size || 0);
      box.querySelector(".size").textContent = SIZES[size];
      // aria-disabled rather than disabled, so focus stays on the button at the end of the range
      for (const b of steps) b.setAttribute("aria-disabled", String(!(size + Number(b.value) in SIZES)));
      paintBar();
    };
    box.addEventListener("click", e => {
      const b = e.target.closest(".themes button");
      if (!b) return;
      if (b.value) root.dataset.theme = b.value; else delete root.dataset.theme;
      try { if (b.value) localStorage.setItem("theme", b.value); else localStorage.removeItem("theme"); } catch (e) {}
      show();
    });
    box.addEventListener("click", e => {
      const b = e.target.closest(".text-size button");
      if (!b) return;
      const size = Number(root.dataset.size || 0) + Number(b.value);
      if (!(size in SIZES)) return;
      if (size) root.dataset.size = size; else delete root.dataset.size;
      try { if (size) localStorage.setItem("size", size); else localStorage.removeItem("size"); } catch (e) {}
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
