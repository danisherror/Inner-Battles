// Reading progress, kept in localStorage as a list of "Topic/section/lens" keys.
// An article page records itself and ticks the topic and lens links already read;
// the home page shows a count on each card. Nothing leaves the browser.
(() => {
  const key = path => path.replace(/\.html$/, "").split("/").slice(-3).join("/");
  const load = () => { try { return new Set(JSON.parse(localStorage.getItem("read")) || []); } catch (e) { return new Set(); } };
  const save = read => { try { localStorage.setItem("read", JSON.stringify([...read])); } catch (e) {} };

  const article = () => {
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
      const id = card.getAttribute("href").split("/")[0];
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
  };

  const reset = document.querySelector(".reset");
  if (reset) reset.addEventListener("click", () => { try { localStorage.removeItem("read"); } catch (e) {} home(); });
  // pageshow also fires when the reader comes back with the Back button, so the counts stay current.
  addEventListener("pageshow", document.querySelector("article.md") ? article : home);
})();
