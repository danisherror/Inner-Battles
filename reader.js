// Reader tools kept in localStorage; nothing leaves the browser.
// On an article: Save (kept as "saved", a list of {path, title}, newest first), a private note ("notes", an object
// of path: text), Share, Listen (the browser's own speech synthesis) and highlights ("highlights", an object of
// path: {title, items}). Each highlight is stored as its text with a few words either side, not as character
// positions, so it survives corrections to the article; one whose text is no longer found is dropped.
// On the home page: the saved articles and the highlights, as lists. On progress.html: every note, each under
// its article, and export and import of everything the site keeps in the browser, as a file. The Read toggle beside these tools is run by progress.js.
(() => {
  const PATH = /^[\w-]+\/[\w-]+\/[\w-]+$/;
  const get = (name, fallback) => { try { return JSON.parse(localStorage.getItem(name)) ?? fallback; } catch (e) { return fallback; } };
  const put = (name, value) => { try { localStorage.setItem(name, JSON.stringify(value)); } catch (e) {} };
  const isObject = v => v !== null && typeof v === "object" && !Array.isArray(v);
  // Stored values are checked before use, since an imported file or another tab may have written them.
  const okItem = h => isObject(h) && typeof h.text === "string" && h.text && typeof h.before === "string" && typeof h.after === "string";
  const savedList = () => [].concat(get("saved", [])).filter(s => isObject(s) && PATH.test(s.path) && typeof s.title === "string");
  const notesMap = () => { const n = get("notes", {}); return isObject(n) ? n : {}; };
  const highlightsMap = () => {
    const all = get("highlights", {});
    const out = {};
    if (isObject(all)) for (const [path, v] of Object.entries(all)) {
      if (PATH.test(path) && isObject(v) && typeof v.title === "string" && Array.isArray(v.items)) out[path] = { title: v.title, items: v.items.filter(okItem) };
    }
    return out;
  };

  // --- article page ---
  const text = document.querySelector("article.md");
  if (text) {
    const here = location.pathname.replace(/\.html$/, "").split("/").slice(-3).join("/");
    const read = sel => document.querySelector(sel).textContent;
    const title = `${read(".sin-title")}: ${read("article.md h2")} (${read(".lenses a[aria-current]")})`;
    const tools = document.querySelector(".tools");
    const status = tools.querySelector(".tools-status");
    let quiet;
    const say = msg => { status.textContent = msg; clearTimeout(quiet); quiet = setTimeout(() => { status.textContent = ""; }, 4000); };

    // Save
    const save = tools.querySelector(".save");
    const showSaved = () => save.setAttribute("aria-pressed", String(savedList().some(s => s.path === here)));
    save.addEventListener("click", () => {
      const list = savedList().filter(s => s.path !== here);
      const on = save.getAttribute("aria-pressed") !== "true";
      put("saved", on ? [{ path: here, title }, ...list] : list);
      showSaved();
      say(on ? "Saved; it is listed on the home page" : "Removed from saved articles");
    });
    addEventListener("pageshow", showSaved);
    save.hidden = false;

    // Share: the system share sheet where there is one, otherwise copy the link. The canonical address is shared,
    // so a "#q=" from the search results is left off.
    const share = tools.querySelector(".share");
    const url = document.querySelector('link[rel="canonical"]').href;
    const copy = () => navigator.clipboard.writeText(url).then(() => say("Link copied"), () => say("Could not copy the link"));
    if (navigator.share || navigator.clipboard) {
      share.addEventListener("click", () => {
        if (!navigator.share) return copy();
        // AbortError means the reader closed the share sheet.
        navigator.share({ title: document.title, url }).catch(e => { if (e.name !== "AbortError" && navigator.clipboard) copy(); });
      });
      share.hidden = false;
    }

    // Listen: one utterance per block (heading, paragraph, list item), so the block being read can be marked.
    const listen = tools.querySelector(".listen");
    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      const blocks = () => [...text.children].flatMap(el =>
        el.matches(".label, .sources") ? [] : el.matches("ul, ol") ? [...el.children] : el.matches("blockquote") ? [...el.children] : [el]);
      let run = 0;
      const stop = () => {
        run++;
        speechSynthesis.cancel();
        for (const el of text.querySelectorAll(".speaking")) el.classList.remove("speaking");
        listen.setAttribute("aria-pressed", "false");
      };
      const speak = (list, i, token) => {
        if (token !== run) return;
        for (const el of text.querySelectorAll(".speaking")) el.classList.remove("speaking");
        if (i >= list.length) return stop();
        const el = list[i];
        el.classList.add("speaking");
        const u = new SpeechSynthesisUtterance(el.textContent);
        u.lang = document.documentElement.lang;
        u.onend = () => speak(list, i + 1, token);
        u.onerror = () => { if (token === run) stop(); };
        speechSynthesis.speak(u);
      };
      listen.addEventListener("click", () => {
        if (listen.getAttribute("aria-pressed") === "true") return stop();
        stop();
        listen.setAttribute("aria-pressed", "true");
        speak(blocks(), 0, run);
      });
      addEventListener("pagehide", stop);
      listen.hidden = false;
    }
    tools.hidden = false;

    // Notes: saved as they are typed; an empty note is removed.
    const box = document.querySelector(".notes");
    const note = box.querySelector("textarea");
    note.value = notesMap()[here] || "";
    note.addEventListener("input", () => {
      const all = notesMap();
      if (note.value.trim()) all[here] = note.value; else delete all[here];
      put("notes", all);
    });
    box.hidden = false;

    // Highlights are drawn with the CSS Custom Highlight API, which leaves the page markup alone
    // (https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API, Baseline since June 2025).
    // A browser without it gets no highlighter rather than a second way of drawing them.
    if (!(window.CSS && CSS.highlights && window.Highlight)) return;
    // The article text as one string with runs of white space folded to a single space, the way it reads,
    // remembering where each character came from. Labels, the title, Sources and screen-reader text are left out,
    // as they are for the search marks.
    const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest(".sources, .label, h2, .sr-only") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [], at = [];
    let flat = "", space = true;
    while (walker.nextNode()) {
      const node = walker.currentNode, idx = [];
      for (let o = 0; o < node.data.length; o++) {
        idx.push(flat.length);
        const blank = /\s/.test(node.data[o]);
        if (blank && space) continue;
        flat += blank ? " " : node.data[o];
        space = blank;
        at.push([node, o]);
      }
      idx.push(flat.length);
      nodes.push({ node, idx });
    }
    const toRange = ([s, e]) => {
      const r = new Range();
      r.setStart(...at[s]);
      r.setEnd(at[e - 1][0], at[e - 1][1] + 1);
      return r;
    };
    // A selection as a [start, end) span of that string, cut to the article text, trimmed of spaces and widened
    // to whole words, so a drag that stops a letter short still keeps the word.
    const toSpan = range => {
      let s = -1, e = -1;
      for (const { node, idx } of nodes) {
        if (!range.intersectsNode(node)) continue;
        const from = node === range.startContainer ? idx[range.startOffset] : idx[0];
        if (s < 0) s = from;
        e = node === range.endContainer ? idx[range.endOffset] : idx[idx.length - 1];
      }
      while (s < e && flat[s] === " ") s++;
      while (e > s && flat[e - 1] === " ") e--;
      const word = i => /[\p{L}\p{N}'’-]/u.test(flat[i] || "");
      if (s < e) { while (word(s - 1) && word(s)) s--; while (word(e) && word(e - 1)) e++; }
      return s >= 0 && s < e ? [s, e] : null;
    };
    // Up to about 40 characters either side, cut at a word.
    const record = ([s, e]) => ({
      text: flat.slice(s, e),
      before: s > 40 ? flat.slice(s - 40, s).replace(/^\S*\s/, "") : flat.slice(0, s),
      after: flat.length - e > 40 ? flat.slice(e, e + 40).replace(/\s\S*$/, "") : flat.slice(e)
    });
    // Where the words on both sides still match, use that place; otherwise the text alone, if it occurs only once.
    const find = h => {
      const hits = [];
      for (let i = flat.indexOf(h.text); i >= 0; i = flat.indexOf(h.text, i + 1)) hits.push(i);
      const i = hits.find(i => flat.slice(0, i).endsWith(h.before) && flat.startsWith(h.after, i + h.text.length)) ?? (hits.length === 1 ? hits[0] : undefined);
      return i === undefined ? null : [i, i + h.text.length];
    };
    // Overlapping or touching spans become one.
    const merge = list => list.sort((a, b) => a[0] - b[0]).reduce((out, sp) => {
      const last = out.at(-1);
      if (last && sp[0] <= last[1]) last[1] = Math.max(last[1], sp[1]); else out.push([...sp]);
      return out;
    }, []);

    const stored = (highlightsMap()[here] || { items: [] }).items;
    let spans = merge(stored.map(find).filter(Boolean));
    const keep = () => {
      const all = highlightsMap();
      delete all[here]; // put back last, so the home page can list the most recent first
      if (spans.length) all[here] = { title, items: spans.map(record) };
      put("highlights", all);
    };
    if (spans.length !== stored.length) keep(); // drop the ones whose text is gone
    const draw = () => CSS.highlights.set("reader", new Highlight(...spans.map(toRange)));
    draw();

    // One button, fixed at the foot of the screen so it stays clear of the system's own menu beside a selection,
    // or at the top when the selection is in the lower part of the screen, so it does not cover it.
    const bar = document.querySelector(".hl-bar");
    const act = bar.querySelector("button");
    let pending = null; // ["add", span] or ["remove", index]
    const hide = () => { pending = null; bar.hidden = true; };
    const offer = (what, label, range) => {
      pending = what;
      act.textContent = label;
      bar.classList.toggle("top", range.getBoundingClientRect().bottom > innerHeight * 0.6);
      bar.hidden = false;
    };
    let wait;
    document.addEventListener("selectionchange", () => {
      clearTimeout(wait);
      wait = setTimeout(() => {
        const sel = getSelection();
        const span = sel.rangeCount && !sel.isCollapsed ? toSpan(sel.getRangeAt(0)) : null;
        if (span) offer(["add", span], "Highlight", sel.getRangeAt(0));
        else if (pending && pending[0] === "add") hide();
      }, 150);
    });
    // A tap on a highlight offers to remove it.
    text.addEventListener("click", e => {
      if (!getSelection().isCollapsed || e.target.closest("a")) return;
      const inside = r => [...r.getClientRects()].some(b => e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom);
      const i = spans.findIndex(sp => inside(toRange(sp)));
      if (i < 0) hide(); else offer(["remove", i], "Remove highlight", toRange(spans[i]));
    });
    document.addEventListener("click", e => { if (!text.contains(e.target) && !bar.contains(e.target)) hide(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    // Keep the selection and the focus where they are when the button is pressed.
    act.addEventListener("pointerdown", e => e.preventDefault());
    act.addEventListener("click", () => {
      if (!pending) return;
      const [kind, value] = pending;
      spans = kind === "add" ? merge([...spans, value]) : spans.filter((_, i) => i !== value);
      keep();
      draw();
      if (kind === "add") getSelection().removeAllRanges();
      hide();
      say(kind === "add" ? "Highlighted; it is listed on the home page" : "Highlight removed");
    });
    box.querySelector(".hl-hint").hidden = false;
    return;
  }

  // --- home page: saved articles and highlights ---
  const savedBox = document.querySelector(".saved-list");
  if (savedBox) {
    const hlBox = document.querySelector(".hl-list");
    const link = (path, title) => {
      const a = document.createElement("a");
      a.href = path + ".html";
      a.textContent = title;
      return a;
    };
    const lists = () => {
      const saved = savedList();
      savedBox.querySelector("ol").replaceChildren(...saved.map(s => {
        const li = document.createElement("li");
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove";
        remove.value = s.path;
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${s.title} from saved articles`);
        li.append(link(s.path, s.title), remove);
        return li;
      }));
      savedBox.hidden = !saved.length;
      const marked = Object.entries(highlightsMap()).filter(([, v]) => v.items.length).reverse();
      hlBox.querySelector("ol").replaceChildren(...marked.map(([path, v]) => {
        const li = document.createElement("li");
        const quotes = document.createElement("ul");
        for (const h of v.items) {
          const q = document.createElement("li");
          q.textContent = h.text.length > 240 ? h.text.slice(0, h.text.lastIndexOf(" ", 240)) + " …" : h.text;
          quotes.append(q);
        }
        li.append(link(path, v.title), quotes);
        return li;
      }));
      hlBox.hidden = !marked.length;
      const more = document.querySelector(".mine-link");
      if (more) more.hidden = false;
    };
    savedBox.addEventListener("click", e => {
      const b = e.target.closest("button.remove");
      if (!b) return;
      put("saved", savedList().filter(s => s.path !== b.value));
      lists();
      // Focus would be lost with the removed item; move it to the list heading, or once the list is empty
      // (and hidden) to the next heading on the page.
      const h = [savedBox, hlBox, ...document.querySelectorAll("main section:not(.mine)")].find(sec => !sec.hidden).querySelector("h2");
      h.tabIndex = -1;
      h.focus();
    });
    addEventListener("pageshow", lists);
  }

  // --- progress.html: notes, export and import ---
  const transfer = document.querySelector(".transfer");
  if (!transfer) return;
  // A note is kept under its article's path; build.js puts the names for the three parts of a path on <main>.
  let names = {};
  try { names = JSON.parse(document.querySelector("main").dataset.names); } catch (e) {}
  const titleOf = path => {
    const [sin, section, lens] = path.split("/");
    const name = (kind, id) => (isObject(names[kind]) && names[kind][id]) || id;
    return `${name("sins", sin)}: ${name("sections", section)} (${name("lenses", lens)})`;
  };
  const notesBox = document.querySelector(".notes-list");
  const listNotes = () => {
    const notes = Object.entries(notesMap()).filter(([path, t]) => PATH.test(path) && typeof t === "string" && t.trim());
    notesBox.querySelector("ol").replaceChildren(...notes.map(([path, t]) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = path + ".html#note"; // the note box under the article
      a.textContent = titleOf(path);
      const p = document.createElement("p");
      p.textContent = t.trim();
      li.append(a, p);
      return li;
    }));
    notesBox.hidden = !notes.length;
  };
  // Every key the site keeps. The first five hold JSON; the rest are plain strings.
  const JSON_KEYS = ["read", "saved", "notes", "highlights", "last"];
  const TEXT_KEYS = ["lens", "compare", "theme", "size"];
  const FORMAT = "the-seven-sins-reading";
  const tstatus = transfer.querySelector(".transfer-status");
  const kept = () => {
    const n = [[[].concat(get("read", [])).length, "article read", "articles read"], [savedList().length, "saved article", "saved articles"],
      [Object.keys(notesMap()).length, "note", "notes"], [Object.values(highlightsMap()).reduce((n, v) => n + v.items.length, 0), "highlight", "highlights"]];
    transfer.querySelector(".kept").textContent = "In this browser now: " + n.map(([c, one, many]) => `${c} ${c === 1 ? one : many}`).join(", ") + ".";
  };

  transfer.querySelector(".export").addEventListener("click", () => {
    const data = {};
    for (const k of JSON_KEYS) { const v = get(k, null); if (v !== null) data[k] = v; }
    for (const k of TEXT_KEYS) { try { const v = localStorage.getItem(k); if (v !== null) data[k] = v; } catch (e) {} }
    const day = new Date().toISOString().slice(0, 10);
    const file = new Blob([JSON.stringify({ format: FORMAT, version: 1, exported: day, data }, null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = `seven-sins-reading-${day}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    tstatus.textContent = `Exported to ${a.download}.`;
  });

  // Lists are merged with what is here; display settings and the last article come from the file.
  const merge = d => {
    const read = new Set([].concat(get("read", [])).filter(k => typeof k === "string"));
    for (const k of [].concat(d.read || [])) if (typeof k === "string" && PATH.test(k)) read.add(k);
    put("read", [...read]);
    const saved = savedList();
    for (const s of [].concat(d.saved || [])) if (isObject(s) && PATH.test(s.path) && typeof s.title === "string" && !saved.some(x => x.path === s.path)) saved.push({ path: s.path, title: s.title });
    put("saved", saved);
    const notes = notesMap();
    if (isObject(d.notes)) for (const [path, t] of Object.entries(d.notes)) {
      if (!PATH.test(path) || typeof t !== "string" || !t.trim()) continue;
      const mine = notes[path] || "";
      notes[path] = !mine.trim() ? t : mine.includes(t) ? mine : `${mine}\n\n${t}`; // keep both when they differ
    }
    put("notes", notes);
    const marks = highlightsMap();
    if (isObject(d.highlights)) for (const [path, v] of Object.entries(d.highlights)) {
      if (!PATH.test(path) || !isObject(v) || typeof v.title !== "string" || !Array.isArray(v.items)) continue;
      const items = marks[path] ? marks[path].items : [];
      for (const h of v.items.filter(okItem)) if (!items.some(x => x.text === h.text && x.before === h.before && x.after === h.after)) items.push({ text: h.text, before: h.before, after: h.after });
      marks[path] = { title: marks[path] ? marks[path].title : v.title, items };
    }
    put("highlights", marks);
    if (isObject(d.last) && PATH.test(d.last.path) && typeof d.last.title === "string") put("last", { path: d.last.path, title: d.last.title });
    for (const k of TEXT_KEYS) if (typeof d[k] === "string") { try { localStorage.setItem(k, d[k]); } catch (e) {} }
  };
  const input = transfer.querySelector(".import input");
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    file.text().then(raw => {
      const f = JSON.parse(raw);
      if (!isObject(f) || f.format !== FORMAT || !isObject(f.data)) throw new Error();
      merge(f.data);
      kept();
      listNotes();
      document.dispatchEvent(new Event("readerchange"));
      tstatus.textContent = `Imported ${file.name}. Display settings apply from the next page.`;
    }).catch(() => { tstatus.textContent = `${file.name} is not a reading file exported from this site; nothing was changed.`; });
    input.value = ""; // so the same file can be chosen again
  });
  addEventListener("pageshow", () => { kept(); listNotes(); });
  transfer.hidden = false;
})();
