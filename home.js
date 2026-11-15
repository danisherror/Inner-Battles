// Home page: cards open on the lens the reader chose last, and a search box narrows the cards and
// lists the articles whose text matches. The box is hidden in the markup and shown here, so without
// JavaScript the page is simply the full list.
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

  // Article search. search.json (written by build.js) holds the text of every article; it is fetched
  // the first time the box is used. Matching ignores case and diacritics, so "issa" finds "issā".
  const results = document.querySelector(".results");
  const MIN = 3, MAX = 20;
  const fold = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let index = null, loading = false, lens = "";
  try { lens = localStorage.getItem("lens") || ""; } catch (e) {}
  const loadIndex = () => {
    if (index || loading) return;
    loading = true;
    fetch("search.json").then(r => r.ok ? r.json() : Promise.reject()).then(d => {
      index = d.articles.map(([path, sin, topic, lensName, text]) =>
        ({ path, title: `${sin}: ${topic} (${lensName})`, text, hay: fold(text), head: fold(`${sin} ${topic} ${lensName}`) }));
      apply();
    }).catch(() => { loading = false; });
  };
  // Every term must appear in the article or its title; title matches and the reader's lens rank first.
  const search = terms => {
    const hits = [];
    for (const a of index) {
      let score = a.path.endsWith("/" + lens) ? 5 : 0;
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
      link.href = a.path + ".html";
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
    const terms = fold(typed).split(/\s+/).filter(Boolean);
    const searching = index && fold(typed).length >= MIN;
    const hits = searching ? search(terms) : [];
    show(hits, terms);
    const topics = shown ? `${shown} of ${cards.length} topics` : "No topics";
    status.textContent = !q ? ""
      : searching ? (shown || hits.length ? `${topics}, ${hits.length} articles` : `Nothing matches "${typed}"`)
      : shown ? topics : `No topics match "${typed}"`;
  };
  input.addEventListener("input", () => { loadIndex(); apply(); });
  input.addEventListener("focus", loadIndex);
  if (input.value.trim()) loadIndex();
  box.hidden = false;
  apply(); // the browser may restore typed text when the reader comes back to the page
})();
