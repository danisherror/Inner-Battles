// Reader state kept in localStorage; nothing leaves the browser.
// "read" is a list of "Topic/section/lens" keys: an article page records itself once the end of its text
// (the Sources section) scrolls into view, and ticks the topic and lens links already read; the topic
// overview page ticks every article read; the home page shows a count on each card.
// "lens" is the lens of the last article opened, or the one picked with the lens buttons on the home page;
// home.js and redirect.js use it to pick links.
// "last" is that article's path and title; the home page offers it as "Continue reading", and each
// home card and the overview's "Start reading" link open on the first section not yet read in the chosen lens.
// The Read button on an article marks it read or unread by hand; progress.html shows the counts per topic and lens.
(() => {
  const key = path => path.replace(/\.html$/, "").split("/").slice(-3).join("/");
  const load = () => { try { return new Set(JSON.parse(localStorage.getItem("read")) || []); } catch (e) { return new Set(); } };
  const save = read => { try { localStorage.setItem("read", JSON.stringify([...read])); } catch (e) {} };

  const tick = (links, read) => {
    for (const a of links) {
      if (a.hasAttribute("aria-current") || a.classList.contains("read") || !read.has(key(a.pathname))) continue;
      a.classList.add("read");
      a.insertAdjacentHTML("beforeend", '<span class="sr-only"> (read)</span>');
    }
  };
  const savedLens = () => { try { return localStorage.getItem("lens"); } catch (e) { return null; } };

  const article = () => {
    try {
      localStorage.setItem("lens", key(location.pathname).split("/")[2]);
      const text = sel => document.querySelector(sel).textContent;
      localStorage.setItem("last", JSON.stringify({
        path: key(location.pathname),
        title: `${text(".sin-title")}: ${text("article.md h2")} (${text(".lenses a[aria-current]")})`
      }));
    } catch (e) {}
    tick(document.querySelectorAll(".topics a, .lenses a"), load());
  };

  // Topic overview: a tick on each article read, a count, and "Start reading" moved on to the first
  // unread section in the chosen lens (the first unread article in any lens once that lens is finished).
  const overview = main => {
    const read = load();
    const links = [...main.querySelectorAll(".lenses a:not(.compare-link)")];
    tick(links, read);
    const n = links.filter(a => read.has(key(a.pathname))).length;
    const label = main.querySelector(".overview-progress");
    label.textContent = n >= links.length ? `All ${links.length} read ✓` : `${n} of ${links.length} read`;
    label.hidden = !n;
    const file = "/" + (savedLens() ? savedLens() + ".html" : links[0].pathname.split("/").pop());
    const unread = links.filter(a => !read.has(key(a.pathname)));
    const next = unread.find(a => a.pathname.endsWith(file)) || unread[0];
    if (!next) return;
    const start = main.querySelector(".start a");
    start.href = next.href;
    start.lastChild.textContent = `${next.closest("section").querySelector("h2").textContent}: ${next.firstChild.textContent}`;
    start.firstChild.textContent = n ? "Continue" : "Start reading";
  };

  // Reaching the end counts as reading, so a page opened and left at once is not ticked.
  // An article short enough to fit on the screen counts as soon as it opens.
  // The Read button sets it by hand either way, and once it is used the end of the text no longer counts.
  let seen = null;
  const toggle = document.querySelector(".tools .mark-read");
  const setRead = on => {
    const read = load();
    if (on) read.add(key(location.pathname)); else read.delete(key(location.pathname));
    save(read);
    if (toggle) toggle.setAttribute("aria-pressed", String(on));
  };
  const markAtEnd = () => {
    const text = document.querySelector("article.md");
    const end = text.querySelector(".sources") || text.lastElementChild;
    if (!("IntersectionObserver" in window)) return setRead(true);
    seen = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setRead(true); seen.disconnect(); }
    });
    seen.observe(end);
  };
  if (toggle) {
    toggle.addEventListener("click", () => {
      if (seen) seen.disconnect();
      setRead(toggle.getAttribute("aria-pressed") !== "true");
    });
    addEventListener("pageshow", () => toggle.setAttribute("aria-pressed", String(load().has(key(location.pathname)))));
    toggle.hidden = false;
  }

  // progress.html: a count and a bar for every topic and every lens.
  const reading = main => {
    const read = [...load()];
    const fill = (li, n) => {
      const total = Number(li.dataset.total);
      li.querySelector(".count").textContent = n >= total ? `All ${total} read ✓` : `${n} of ${total}`;
      li.querySelector(".bar span").style.width = `${Math.min(n / total, 1) * 100}%`;
      li.classList.toggle("done", n >= total);
    };
    for (const li of main.querySelectorAll("li[data-topic]")) fill(li, read.filter(k => k.startsWith(li.dataset.topic + "/")).length);
    for (const li of main.querySelectorAll("li[data-lens]")) fill(li, read.filter(k => k.endsWith("/" + li.dataset.lens)).length);
    const total = Number(main.dataset.total);
    main.querySelector(".reading-total").textContent = read.length
      ? `${read.length} of ${total} articles read.` : `None of the ${total} articles read yet. An article counts as read once you reach its end.`;
    main.querySelector(".totals").hidden = false;
    main.querySelector(".nojs").hidden = true;
  };

  const home = () => {
    const read = [...load()];
    for (const card of document.querySelectorAll("a.card[data-total]")) {
      const [id, , file] = card.getAttribute("href").split("/");
      const sections = card.dataset.topics.split(" ");
      const lens = file.replace(/\.html$/, "");
      card.href = `${id}/${sections.find(t => !read.includes(`${id}/${t}/${lens}`)) || sections[0]}/${file}`;
      const n = read.filter(k => k.startsWith(id + "/")).length;
      const total = Number(card.dataset.total);
      let label = card.querySelector(".progress");
      if (!n) { if (label) label.remove(); continue; }
      if (!label) { label = document.createElement("span"); label.className = "progress label"; card.append(label); }
      label.textContent = n >= total ? `All ${total} read ✓` : `${n} of ${total} read`;
      label.classList.toggle("done", n >= total);
    }
    // "Read something at random": any article not read yet, or any article once all are read.
    const all = [];
    const lenses = document.querySelector("main").dataset.lenses.split(" ");
    for (const card of document.querySelectorAll("a.card[data-topics]")) {
      const id = card.getAttribute("href").split("/")[0];
      for (const t of card.dataset.topics.split(" ")) for (const l of lenses) all.push(`${id}/${t}/${l}`);
    }
    const unread = all.filter(k => !read.includes(k));
    const pool = unread.length ? unread : all;
    const random = document.querySelector(".random");
    random.querySelector("a").href = pool[Math.floor(Math.random() * pool.length)] + ".html";
    random.hidden = !pool.length;
    const reset = document.querySelector(".reset");
    if (reset) reset.hidden = !read.length;
    const resume = document.querySelector(".resume");
    let last = null;
    try { last = JSON.parse(localStorage.getItem("last")); } catch (e) {}
    // Only a path of the shape this script wrote becomes a link.
    const ok = last && typeof last.title === "string" && /^[\w-]+\/[\w-]+\/[\w-]+$/.test(last.path);
    const link = resume.querySelector("a");
    if (ok) { link.href = last.path + ".html"; link.textContent = last.title; }
    resume.hidden = !ok;
  };

  const reset = document.querySelector(".reset");
  if (reset) reset.addEventListener("click", () => { try { localStorage.removeItem("read"); localStorage.removeItem("last"); } catch (e) {} home(); });
  // pageshow also fires when the reader comes back with the Back button, so the counts stay current.
  const main = document.querySelector("main");
  if (document.querySelector("article.md")) { addEventListener("pageshow", article); markAtEnd(); }
  else if (main.classList.contains("overview")) addEventListener("pageshow", () => overview(main));
  // reader.js sends "readerchange" after importing a file.
  else if (main.classList.contains("reading")) { addEventListener("pageshow", () => reading(main)); document.addEventListener("readerchange", () => reading(main)); }
  else { addEventListener("pageshow", home); document.addEventListener("lenschange", home); }
})();
