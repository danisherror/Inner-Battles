// Compare page: every lens of one section is in the page, and the buttons choose which are shown side by side.
// The buttons are hidden in the markup and shown here, so without JavaScript the page shows all the lenses.
// The choice is kept in localStorage as "compare"; the first visit shows the lens read last and the one after it.
(() => {
  const main = document.querySelector("main.compare");
  const box = main.querySelector(".pick");
  const buttons = [...box.querySelectorAll("button")];
  const ids = buttons.map(b => b.value);
  let chosen = [];
  try { chosen = (localStorage.getItem("compare") || "").split(" ").filter(id => ids.includes(id)); } catch (e) {}
  if (chosen.length < 2) {
    let lens = null;
    try { lens = localStorage.getItem("lens"); } catch (e) {}
    const i = Math.max(ids.indexOf(lens), 0);
    chosen = [ids[i], ids[(i + 1) % ids.length]];
  }
  const show = () => {
    for (const b of buttons) b.setAttribute("aria-pressed", String(chosen.includes(b.value)));
    for (const a of main.querySelectorAll("article[data-lens]")) a.hidden = !chosen.includes(a.dataset.lens);
  };
  box.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (!chosen.includes(b.value)) chosen.push(b.value);
    else if (chosen.length > 1) chosen = chosen.filter(id => id !== b.value); // always leave one lens on the page
    try { localStorage.setItem("compare", chosen.join(" ")); } catch (e) {}
    show();
  });
  show();
  box.hidden = false;
})();
