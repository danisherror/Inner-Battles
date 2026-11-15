// Home page: a filter box over the topic cards. The box is hidden in the markup and shown here,
// so without JavaScript the page is simply the full list.
(() => {
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
