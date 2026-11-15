// Site-wide behaviour that needs JavaScript and keeps no reader state: the search link in the site bar,
// keyboard shortcuts, and marking the searched words on an article opened from the search results.
(() => {
  const input = document.getElementById("filter");
  const searchLink = document.querySelector(".search-link");
  // The link leads to the home page search box, which exists only with JavaScript, so it is hidden in the markup.
  if (searchLink) searchLink.hidden = false;

  // "/" goes to search (the box on this page, or the home page one); left and right arrows follow the pager.
  // Keys typed into a field, held with a modifier, or pressed inside the Display menu or a scrolling block are left alone.
  document.addEventListener("keydown", e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest("input, textarea, select, [contenteditable], details[open], pre, table")) return;
    let link = null;
    if (e.key === "/") {
      if (input && !input.closest("[hidden]")) { e.preventDefault(); input.focus(); return; }
      link = searchLink;
    } else if (!e.shiftKey && e.key === "ArrowLeft") link = document.querySelector(".pager .prev");
    else if (!e.shiftKey && e.key === "ArrowRight") link = document.querySelector(".pager .next");
    if (!link) return;
    e.preventDefault();
    link.click();
  });

  // Search result links end in #q=<the words searched>. Mark each of those words in the article text
  // (not its Sources) and scroll to the first. Matching ignores case and diacritics, as the search does.
  const text = document.querySelector("article.md");
  const q = /^#q=(.+)/.exec(location.hash);
  if (!text || !q) return;
  const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let terms;
  try { terms = fold(decodeURIComponent(q[1])).split(/\s+/).filter(Boolean); } catch (e) { return; }
  if (!terms.length) return;
  const re = new RegExp(terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest(".sources, .label, h2, .sr-only") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const marks = [];
  for (const node of nodes) {
    // Fold one character at a time, remembering where each folded character came from, so a match in the
    // folded text maps back to the original even where folding changes its length.
    let hay = "", at = 0;
    const starts = [], ends = [];
    for (const ch of node.data) {
      const f = fold(ch);
      hay += f;
      for (let k = 0; k < f.length; k++) { starts.push(at); ends.push(at + ch.length); }
      at += ch.length;
    }
    const found = [...hay.matchAll(re)].map(m => [starts[m.index], ends[m.index + m[0].length - 1]]);
    // Wrap from the end so the earlier offsets in this node stay valid.
    const here = [];
    for (const [start, end] of found.reverse()) {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      const mark = document.createElement("mark");
      range.surroundContents(mark);
      here.unshift(mark);
    }
    marks.push(...here);
  }
  if (marks.length) marks[0].scrollIntoView({ block: "center" });
})();
