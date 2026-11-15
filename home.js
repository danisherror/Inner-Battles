// Home page: cards open on the lens chosen with the lens buttons or read last, and a search box narrows
// the cards and lists the articles whose text matches. The 404 page uses the same search box, without cards.
// The box and the lens buttons are hidden in the markup and shown here, so without JavaScript the page is
// simply the full list.
(() => {
  const main = document.querySelector("main");
  const base = main.dataset.base || ""; // "/" on the 404 page, which is served at any depth
  const lenses = (main.dataset.lenses || "").split(" ");
  let lens = "";
  try { lens = localStorage.getItem("lens") || ""; } catch (e) {}
  if (!lenses.includes(lens)) lens = "";

  // Cards link to the first lens; swap in the chosen one. progress.js then picks the section, so it is told
  // when the lens changes.
  const pick = document.querySelector(".lens-list.pick");
  const useLens = () => {
    for (const a of document.querySelectorAll("a.card[href]")) a.href = a.getAttribute("href").replace(/[^/]+\.html$/, (lens || lenses[0]) + ".html");
    if (pick) for (const b of pick.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.value === (lens || lenses[0])));
  };
  if (pick) {
    pick.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      lens = b.value;
      try { localStorage.setItem("lens", lens); } catch (e) {}
      useLens();
      document.dispatchEvent(new Event("lenschange"));
    });
    pick.hidden = false;
    document.querySelector("ul.lens-list").hidden = true; // the plain list of lens names, for no JavaScript
  }
  useLens();

  const box = document.querySelector(".filter");
  if (!box) return;
  const input = box.querySelector("input");
  const status = box.querySelector(".filter-status");
  const cards = [...document.querySelectorAll(".grid .card")];
  const sections = [...document.querySelectorAll("main section:not(.mine)")]; // .mine: saved articles and highlights (reader.js)

  // Article search. search.json (written by build.js) holds the text of every article; it is fetched
  // the first time the box is used. Matching ignores case and diacritics, so "issa" finds "issā".
  const results = document.querySelector(".results");
  const MIN = 3, MAX = 20;
  const fold = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let index = null, loading = false;
  const loadIndex = () => {
    if (index || loading) return;
    loading = true;
    fetch(base + "search.json").then(r => r.ok ? r.json() : Promise.reject()).then(d => {
      index = d.articles.map(([path, sin, topic, lensName, text]) =>
        ({ path, title: `${sin}: ${topic} (${lensName})`, text, hay: fold(text), head: fold(`${sin} ${topic} ${lensName}`) }));
      apply();
    }).catch(() => { loading = false; });
  };
  // Every term must appear in the article or its title; title matches and the reader's lens rank first.
  const search = terms => {
    const hits = [];
    for (const a of index) {
      let score = lens && a.path.endsWith("/" + lens) ? 5 : 0;
      const all = terms.every(t => {
        const n = a.hay.split(t).length - 1, inHead = a.head.includes(t);
        score += Math.min(n, 5) + (inHead ? 10 : 0);
        return n || inHead;
      });
      if (all) hits.push({ a, score });
    }
    return hits.sort((x, y) => y.score - x.score).map(h => h.a);
  };
  // About 170 characters around the first match, with each matched term marked.
  const snippet = (a, terms) => {
    const first = Math.min(...terms.map(t => a.hay.indexOf(t)).filter(i => i >= 0), a.text.length);
    const start = first === a.text.length ? 0 : a.text.lastIndexOf(" ", Math.max(first - 50, 0)) + 1;
    const stop = a.text.indexOf(" ", start + 170);
    const end = stop < 0 ? a.text.length : stop;
    const p = document.createElement("p");
    const re = new RegExp(terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
    let at = start;
    if (start) p.append("… ");
    for (const m of a.hay.slice(start, end).matchAll(re)) {
      const mark = document.createElement("mark");
      mark.textContent = a.text.slice(start + m.index, start + m.index + m[0].length);
      p.append(a.text.slice(at, start + m.index), mark);
      at = start + m.index + m[0].length;
    }
    p.append(a.text.slice(at, end) + (end < a.text.length ? " …" : ""));
    return p;
  };
  const show = (hits, terms) => {
    results.hidden = !hits.length;
    results.querySelector("h2").textContent = hits.length > MAX ? `In the articles: first ${MAX} of ${hits.length}` : "In the articles";
    results.querySelector("ol").replaceChildren(...hits.slice(0, MAX).map(a => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      // site.js on the article marks the searched words and scrolls to the first.
      link.href = `${base}${a.path}.html#q=${encodeURIComponent(terms.join(" "))}`;
      link.textContent = a.title;
      li.append(link, snippet(a, terms));
      return li;
    }));
  };

  const apply = () => {
    const typed = input.value.trim();
    const q = typed.toLowerCase();
    let shown = 0;
    for (const c of cards) {
      c.hidden = !c.textContent.toLowerCase().includes(q);
      if (!c.hidden) shown++;
    }
    for (const s of sections) s.hidden = !s.querySelector(".card:not([hidden])");
    main.classList.toggle("searching", !!q); // style.css hides the saved and highlight lists while searching
    const terms = fold(typed).split(/\s+/).filter(Boolean);
    const searching = index && fold(typed).length >= MIN;
    const hits = searching ? search(terms) : [];
    show(hits, terms);
    const topics = shown ? `${shown} of ${cards.length} topics` : "No topics";
    const articles = `${hits.length} articles`;
    status.textContent = !q ? ""
      : searching ? (shown || hits.length ? (cards.length ? `${topics}, ${articles}` : articles) : `Nothing matches "${typed}"`)
      : !cards.length ? ""
      : shown ? topics : `No topics match "${typed}"`;
  };
  input.addEventListener("input", () => { loadIndex(); apply(); });
  input.addEventListener("focus", loadIndex);
  if (input.value.trim()) loadIndex();
  box.hidden = false;
  apply(); // the browser may restore typed text when the reader comes back to the page
  // The search link on other pages leads here. Focusing straight away did not hold in Chrome when the page was
  // reached by a link (it did on reload), so it waits for pageshow, which comes after load.
  addEventListener("pageshow", () => { if (location.hash === "#search") input.focus(); });
})();
