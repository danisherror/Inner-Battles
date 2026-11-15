// Home page: cards open on the lens the reader chose last, and a filter box narrows the cards.
// The box is hidden in the markup and shown here, so without JavaScript the page is simply the full list.
(() => {
  // Cards link to the first lens; swap in the saved one if it is still a real lens.
  try {
    const lens = localStorage.getItem("lens");
    if (document.querySelector("main").dataset.lenses.split(" ").includes(lens))
      for (const a of document.querySelectorAll("a.card[href]")) a.href = a.getAttribute("href").replace(/[^/]+\.html$/, lens + ".html");
  } catch (e) {}

  const box = document.querySelector(".filter");
  if (!box) return;
  const input = box.querySelector("input");
  const status = box.querySelector(".filter-status");
  const cards = [...document.querySelectorAll(".grid .card")];
  const sections = [...document.querySelectorAll("main section")];
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    for (const c of cards) {
      c.hidden = !c.textContent.toLowerCase().includes(q);
      if (!c.hidden) shown++;
    }
    for (const s of sections) s.hidden = !s.querySelector(".card:not([hidden])");
    status.textContent = !q ? "" : shown ? `${shown} of ${cards.length} topics` : `No topics match "${input.value.trim()}"`;
  };
  input.addEventListener("input", apply);
  box.hidden = false;
  apply(); // the browser may restore typed text when the reader comes back to the page
})();
