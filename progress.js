// Reader state kept in localStorage; nothing leaves the browser.
// "read" is a list of "Topic/section/lens" keys: an article page records itself and ticks the topic and
// lens links already read, and the home page shows a count on each card.
// "lens" is the lens of the last article opened; home.js and redirect.js use it to pick links.
// "last" is that article's path and title; the home page offers it as "Continue reading", and each
// home card opens on the first section not yet read in the chosen lens.
(() => {
  const key = path => path.replace(/\.html$/, "").split("/").slice(-3).join("/");
  const load = () => { try { return new Set(JSON.parse(localStorage.getItem("read")) || []); } catch (e) { return new Set(); } };
  const save = read => { try { localStorage.setItem("read", JSON.stringify([...read])); } catch (e) {} };

  const article = () => {
    try {
      localStorage.setItem("lens", key(location.pathname).split("/")[2]);
      const text = sel => document.querySelector(sel).textContent;
      localStorage.setItem("last", JSON.stringify({
        path: key(location.pathname),
        title: `${text(".sin-title")}: ${text("article.md h2")} (${text(".lenses a[aria-current]")})`
      }));
    } catch (e) {}
    const read = load();
    if (!read.has(key(location.pathname))) { read.add(key(location.pathname)); save(read); }
    for (const a of document.querySelectorAll(".topics a, .lenses a")) {
      if (a.hasAttribute("aria-current") || a.classList.contains("read") || !read.has(key(a.pathname))) continue;
      a.classList.add("read");
      a.insertAdjacentHTML("beforeend", '<span class="sr-only"> (read)</span>');
    }
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
  addEventListener("pageshow", document.querySelector("article.md") ? article : home);
})();
