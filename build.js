// Pre-renders the site to static HTML: one page per article, a compare page per topic section
// (all the lenses side by side), an overview page per topic (<Sin>/index.html: every section and lens),
// plus index.html, progress.html (the reader's own progress, saved articles and export), sin.html, 404.html, sitemap.xml
// and search.json (the article text that the home page search box reads).
// `npm run render` writes the files (commit them; the host serves them as they are).
// `npm run check` exits 1 if any generated file on disk is stale.
const fs = require("fs");
const crypto = require("crypto");
const { marked } = require("marked");

const SITE = "https://seven-sins-liard.vercel.app";
const SUBTITLE = "and the inner battles beyond them";
const DISCLAIMER = "If a habit is harming your life, please talk to a doctor, therapist or a trusted person.";

const data = JSON.parse(fs.readFileSync("sins.json", "utf8"));
const sins = data.sins.filter(s => s.topics);
const kindOf = s => s.kind || "sin";
const sinCount = data.sins.filter(s => kindOf(s) === "sin").length;
const lensIds = data.lenses.map(l => l.id);
const lensList = data.lenses.map(l => l.name).slice(0, -1).join(", ") + " and " + data.lenses.at(-1).name;
const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const count = words[data.lenses.length];
const DESCRIPTION = `Understand the ${words[sinCount]} deadly sins, and the inner battles beyond them, through ${count} lenses (${lensList}) and learn how to leave them behind.`;

// Stylesheet and script links carry a hash of the file, and vercel.json caches those files as immutable,
// so a changed file is fetched under a new URL. Editing style.css or a script therefore makes every page stale.
const hashed = file => `${file}?v=${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 10)}`;
const ASSET = Object.fromEntries(["style.css", "theme.js", "site.js", "home.js", "progress.js", "reader.js", "compare.js", "redirect.js"].map(f => [f, hashed(f)]));

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const articlePath = (s, t, l) => `${s.id}/${t.id}/${l.id}.html`;
const overviewUrl = s => `${SITE}/${s.id}/`;

// External links get a visible marker and a screen-reader note; a link whose text is just its URL
// is shown as the host name instead, so it reads as a destination rather than a string of characters.
const renderer = {};
renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  const t = title ? ` title="${esc(title)}"` : "";
  if (!/^https?:\/\//.test(href)) return `<a href="${esc(href)}"${t}>${text}</a>`;
  const host = new URL(href).hostname.replace(/^www\./, "");
  const label = /^https?:\/\//.test(text) ? esc(host) : text;
  return `<a class="ext" href="${esc(href)}"${t} rel="noopener">${label}<span class="sr-only"> (external link)</span></a>`;
};
marked.use({ renderer });

// Every article ends with a "**Sources**" paragraph, its list and any checking notes;
// render that tail as its own section so it can be set apart from the article text.
// On an article page the Sources heading gets an id and a link to itself; the compare page has one
// Sources list per lens, so it passes no anchor.
function articleBody(md, anchor) {
  const [text, ...tail] = md.split(/^\*\*Sources\*\*\s*$/m);
  const h3 = anchor ? `<h3 id="sources">Sources<a class="anchor" href="#sources"><span aria-hidden="true">#</span><span class="sr-only">Link to Sources</span></a></h3>` : "<h3>Sources</h3>";
  const sources = tail.length ? `<section class="sources">${h3}${marked.parse(tail.join(""))}</section>` : "";
  return marked.parse(text) + sources;
}

// Plain text of an article without its Sources tail, for search.json.
function articleText(md) {
  return marked.parse(md.split(/^\*\*Sources\*\*\s*$/m)[0])
    .replace(/<span class="sr-only">.*?<\/span>/g, "").replace(/<\/?(?:a|em|strong|code|span)\b[^>]*>/g, "").replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim().normalize("NFC");
}

// The meta description is the opening of the article itself, cut at a word near 155 characters.
function summary(text) {
  if (text.length <= 155) return text;
  const cut = text.slice(0, text.lastIndexOf(" ", 155)).replace(/[\s,;:(]+$/, "");
  return /[.!?]["')]?$/.test(cut) ? cut : cut + "…";
}

// Structured data for search engines. A script of type application/ld+json is a data block: the browser
// never runs it, so the script-src 'self' policy in vercel.json does not apply to it
// (https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element, the step that
// returns early when the type is not a JavaScript, module or import-map type).
const jsonLd = graph => `  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>\n`;
const WEBSITE = { "@type": "WebSite", name: "The Seven Sins", url: `${SITE}/` };

// Reader-selectable themes; the colours for each id are in style.css. "" follows the system light/dark setting.
// All scripts are files, never inline: the Content-Security-Policy in vercel.json allows only script-src 'self'.
const THEMES = [["", "Auto"], ["paper", "Paper"], ["sepia", "Sepia"], ["grey", "Grey"], ["dark", "Dark"], ["black", "Black"]];
// The text size buttons sit in the same menu: the site bar has no room for them beside it on a 320px phone.
const themeMenu = `<details class="theme" hidden><summary><span aria-hidden="true">&#9680;</span> Display</summary><div class="theme-menu"><div class="themes" role="group" aria-label="Theme">${THEMES.map(([id, name]) => `<button type="button" value="${id}"><span class="swatch" aria-hidden="true"></span>${name}</button>`).join("")}</div><div class="text-size" role="group" aria-label="Text size"><span class="label" aria-hidden="true">Text</span><button type="button" value="-1" aria-label="Smaller text">A&minus;</button><span class="size" aria-live="polite">100%</span><button type="button" value="1" aria-label="Larger text">A+</button></div></div></details>`;

// A link to the search box on the home page, for pages that have no box of their own. site.js shows it,
// since the box itself only exists with JavaScript on.
const searchLink = home => `<a class="search-link" href="${home}#search" aria-keyshortcuts="/" hidden><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m13 13 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="search-text">Search</span></a>`;
// The home page passes no `home` link: its hero already carries the site name.
// id="top" is where the "Back to top" links lead, so keyboard focus starts again from the top too.
const siteBar = (home, back) => `<a class="skip" href="#content">Skip to content</a>
  <header class="site${home ? "" : " bare"}" id="top"><div class="wrap">${home ? `<a class="brand" href="${home}"><span aria-hidden="true">&#10022;</span>The Seven Sins</a>` : ""}<div class="site-actions">${back}${themeMenu}</div></div></header>`;
const toTop = `<p class="to-top"><a href="#top">Back to top<span aria-hidden="true"> &uarr;</span></a></p>`;
// The search box and its results, on the home page and the 404 page; home.js runs both.
const searchBox = `<div class="filter" id="search" role="search" hidden>
        <label class="sr-only" for="filter">Search topics and articles</label>
        <input id="filter" type="search" placeholder="Search topics and articles" autocomplete="off" spellcheck="false" aria-keyshortcuts="/">
        <p class="filter-status label" role="status"></p>
      </div>`;
const resultsBox = `<div class="results" role="region" aria-labelledby="results-title" hidden><h2 class="label" id="results-title"></h2><ol></ol></div>`;
const jumpNav = up => `<nav class="jump" aria-label="Sections">${data.kinds.map(k => `<a href="${up}#kind-${k.id}">${esc(k.title)}</a>`).join("")}</nav>`;
const footer = text => `<footer><p>${text}</p></footer>`;

// Article tools, all run in the browser by reader.js (the Read toggle by progress.js). Every control is hidden in
// the markup and shown by the script that runs it, so without JavaScript none of them appears.
const tools = `<div class="tools" role="group" aria-label="Article tools" hidden><button type="button" class="save" aria-pressed="false" hidden><span class="icon" aria-hidden="true"></span>Save</button><button type="button" class="mark-read" aria-pressed="false" hidden><span class="icon" aria-hidden="true"></span>Read</button><button type="button" class="share" hidden><span class="icon" aria-hidden="true"></span>Share</button><button type="button" class="listen" aria-pressed="false" hidden><span class="icon" aria-hidden="true"></span>Listen</button><span class="tools-status" role="status"></span></div>`;
const notes = up => `<div class="notes" hidden>
      <label class="label" for="note">Your notes</label>
      <textarea id="note" rows="4" aria-describedby="note-hint"></textarea>
      <p id="note-hint">Kept only in this browser on this device, and never sent anywhere. Clearing site data deletes them; <a href="${up}progress.html">Your reading</a> can export them to a file.</p>
      <p class="hl-hint" hidden>Select a passage to highlight it; tap a highlight to remove it.</p>
    </div>
    <div class="hl-bar" hidden><button type="button"></button></div>`;

function head({ title, description, url, type, depth, robots, graph }) {
  const up = depth === "root" ? "/" : "../".repeat(depth); // "root": absolute paths, for a page served at any URL
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
${robots ? `  <meta name="robots" content="${robots}">\n` : ""}${url ? `  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="The Seven Sins ${SUBTITLE}. ${data.sins.length} topics, each read through ${count} lenses: ${lensList}.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/og.png">
` : ""}${graph ? jsonLd(graph) : ""}  <link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${up}apple-touch-icon.png">
  <script src="${up}${ASSET["theme.js"]}"></script>
  <link rel="preload" href="${up}fonts/literata-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${up}${ASSET["style.css"]}">
</head>
`;
}

const navLink = (href, text, on) => `<a href="${href}"${on ? ' aria-current="page"' : ""}>${esc(text)}</a>`;
// Ends the Topic row on article and compare pages, as "Compare lenses" ends the Lens row.
const overviewLink = `<a class="overview-link" href="../index.html"><span aria-hidden="true">&#9638;&nbsp;</span>All sections</a>`;

// One page per topic listing every section in every lens, with a tick on each article read (progress.js)
// and a link to the first unread one.
function overviewPage(sin) {
  const kind = data.kinds.find(k => k.id === kindOf(sin));
  const total = sin.topics.length * data.lenses.length;
  const title = `${sin.name}: all ${total} articles - The Seven Sins`;
  const description = `${sin.tagline} ${sin.topics.length} sections, each read through ${count} lenses: ${lensList}.`;
  const url = overviewUrl(sin);
  const graph = [{ "@type": "BreadcrumbList", itemListElement: [["The Seven Sins", `${SITE}/`], [sin.name, url]]
    .map(([name, item], n) => ({ "@type": "ListItem", position: n + 1, name, item })) }];
  const related = (sin.related || []).map(id => data.sins.find(s => s.id === id)).filter(r => r && r.topics);
  const relatedNav = related.length ? `
    <nav class="related" aria-labelledby="related-title"><h2 class="label" id="related-title">Related topics</h2><div class="related-list">${related.map(r => `<a href="../${r.id}/index.html"><strong>${esc(r.name)}</strong><span>${esc(r.tagline)}</span></a>`).join("")}</div></nav>` : "";
  const first = `${sin.topics[0].id}/${data.lenses[0].id}.html`;
  return head({ title, description, url, type: "website", depth: 1, graph }) + `<body>
  ${siteBar("../index.html", `<a class="back" href="../index.html#kind-${kind.id}">&larr; All topics</a>${searchLink("../index.html")}`)}
  <main class="wrap narrow overview" id="content" data-total="${total}">
    <header class="page-head">
      <p class="label">${esc(kind.label)}</p>
      <h1 class="sin-title">${esc(sin.name)}</h1>
      <p class="sin-tag">${esc(sin.tagline)}</p>
      <p class="start"><a href="${first}"><span class="label">Start reading</span>${esc(sin.topics[0].title)}: ${esc(data.lenses[0].name)}</a></p>
      <p class="overview-progress label" hidden></p>
    </header>
    ${sin.topics.map(t => `<section>
      <h2 id="sec-${t.id}">${esc(t.title)}</h2>
      <nav class="lenses" aria-labelledby="sec-${t.id}">${data.lenses.map(l => `<a href="${t.id}/${l.id}.html">${esc(l.name)}</a>`).join("")}<a class="compare-link" href="${t.id}/compare.html"><span aria-hidden="true">&#8644;&nbsp;</span>Compare lenses</a></nav>
    </section>`).join("\n    ")}${relatedNav}
  </main>
  ${footer(`Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script src="../${ASSET["site.js"]}" defer></script>
  <script src="../${ASSET["progress.js"]}" defer></script>
</body>
</html>
`;
}

function articlePage(sin, topic, lens, md) {
  const title = `${sin.name}: ${topic.title} (${lens.name}) - The Seven Sins`;
  const description = summary(articleText(md));
  const url = `${SITE}/${articlePath(sin, topic, lens)}`;
  const graph = [
    { "@type": "Article", headline: `${sin.name}: ${topic.title} (${lens.name})`, description, url, mainEntityOfPage: url, inLanguage: "en", image: `${SITE}/og.png`, about: sin.name, isPartOf: WEBSITE },
    { "@type": "BreadcrumbList", itemListElement: [
      ["The Seven Sins", `${SITE}/`],
      [sin.name, overviewUrl(sin)],
      [`${topic.title} (${lens.name})`, url]
    ].map(([name, item], n) => ({ "@type": "ListItem", position: n + 1, name, item })) }
  ];
  const kind = data.kinds.find(k => k.id === kindOf(sin));
  const i = sin.topics.indexOf(topic);
  const step = (t, cls, label) => `<a class="${cls}" href="../${t.id}/${lens.id}.html"><span class="label">${label}</span>${esc(t.title)}</a>`;
  const prev = i > 0 ? step(sin.topics[i - 1], "prev", "Previous") : "";
  const next = i < sin.topics.length - 1
    ? step(sin.topics[i + 1], "next", "Next")
    : `<a class="next" href="../../index.html"><span class="label">Finished</span>Choose another topic</a>`;
  // The same section in the next lens, wrapping from the last lens to the first.
  const other = data.lenses[(data.lenses.indexOf(lens) + 1) % data.lenses.length];
  const lensNext = `<a class="lens-next" href="${other.id}.html"><span class="label">Same section, next lens</span>${esc(topic.title)}: ${esc(other.name)}</a>`;
  // Related topics open on the same section and lens the reader is on now.
  const related = (sin.related || []).map(id => {
    const r = data.sins.find(s => s.id === id);
    if (!r) throw new Error(`${sin.id}: unknown related id "${id}" in sins.json`);
    return r;
  }).filter(r => r.topics && r.topics.some(t => t.id === topic.id));
  const relatedNav = related.length ? `
    <nav class="related" aria-labelledby="related-title"><h2 class="label" id="related-title">Related topics</h2><div class="related-list">${related.map(r => `<a href="../../${articlePath(r, topic, lens)}"><strong>${esc(r.name)}</strong><span>${esc(r.tagline)}</span></a>`).join("")}</div></nav>` : "";
  return head({ title, description, url, type: "article", depth: 2, graph }) + `<body>
  ${siteBar("../../index.html", `<a class="back" href="../../index.html#kind-${kind.id}">&larr; All topics</a>${searchLink("../../index.html")}`)}
  <main class="wrap narrow">
    <header class="page-head">
      <p class="label">${esc(kind.label)}</p>
      <h1 class="sin-title">${esc(sin.name)}</h1>
      <p class="sin-tag">${esc(sin.tagline)}</p>
    </header>
    <div class="switch">
      <nav class="topics" aria-label="Topic"><span class="label" aria-hidden="true">Topic</span>${sin.topics.map(t => navLink(`../${t.id}/${lens.id}.html`, t.title, t.id === topic.id)).join("")}${overviewLink}</nav>
      <nav class="lenses" aria-label="Lens"><span class="label" aria-hidden="true">Lens</span>${data.lenses.map(l => navLink(`${l.id}.html`, l.name, l.id === lens.id)).join("")}<a class="compare-link" href="compare.html"><span aria-hidden="true">&#8644;&nbsp;</span>Compare lenses</a></nav>
    </div>
    ${tools}
    <article class="md" id="content"><p class="label">${esc(lens.name)} lens</p><h2>${esc(topic.title)}</h2>${articleBody(md, true)}</article>
    ${notes("../../")}
    <nav class="pager" aria-label="Continue reading">${prev}${next}${lensNext}</nav>${relatedNav}
    ${toTop}
  </main>
  ${footer(`Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script src="../../${ASSET["site.js"]}" defer></script>
  <script src="../../${ASSET["progress.js"]}" defer></script>
  <script src="../../${ASSET["reader.js"]}" defer></script>
</body>
</html>
`;
}

// One section of one topic with every lens in the page. compare.js shows the chosen lenses side by side;
// without JavaScript all of them are shown. The text is the articles' own, so the page is kept out of
// search results and the sitemap.
function comparePage(sin, topic, mds) {
  const kind = data.kinds.find(k => k.id === kindOf(sin));
  const title = `${sin.name}: ${topic.title}, lenses compared - The Seven Sins`;
  return head({ title, description: `${sin.tagline} ${topic.title}, read through ${count} lenses side by side.`, depth: 2, robots: "noindex" }) + `<body>
  ${siteBar("../../index.html", `<a class="back" href="../../index.html#kind-${kind.id}">&larr; All topics</a>${searchLink("../../index.html")}`)}
  <main class="wrap compare" id="content">
    <header class="page-head">
      <p class="label">${esc(kind.label)}</p>
      <h1 class="sin-title">${esc(sin.name)}</h1>
      <p class="sin-tag">${esc(topic.title)}, read through each lens side by side.</p>
    </header>
    <div class="switch">
      <nav class="topics" aria-label="Topic"><span class="label" aria-hidden="true">Topic</span>${sin.topics.map(t => navLink(`../${t.id}/compare.html`, t.title, t.id === topic.id)).join("")}${overviewLink}</nav>
      <div class="lenses pick" role="group" aria-label="Lenses to show" hidden><span class="label" aria-hidden="true">Lenses to show</span>${data.lenses.map(l => `<button type="button" value="${l.id}" aria-pressed="false">${esc(l.name)}</button>`).join("")}</div>
    </div>
    <div class="columns">
      ${data.lenses.map((l, n) => `<article class="md" data-lens="${l.id}"><h2>${esc(l.name)}</h2>${articleBody(mds[n])}<p class="open"><a href="${l.id}.html">Open the ${esc(l.name)} article on its own</a></p></article>`).join("\n      ")}
    </div>
    ${toTop}
  </main>
  ${footer(`Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script src="../../${ASSET["site.js"]}" defer></script>
  <script src="../../${ASSET["compare.js"]}" defer></script>
</body>
</html>
`;
}

function indexPage() {
  const card = s => {
    const inner = `<h3>${esc(s.name)}</h3><p>${esc(s.tagline)}</p>`;
    return s.topics
      ? `<a class="card" href="${articlePath(s, s.topics[0], data.lenses[0])}" data-topics="${s.topics.map(t => t.id).join(" ")}" data-total="${s.topics.length * data.lenses.length}">${inner}</a>`
      : `<div class="card disabled">${inner}<span class="soon">Coming soon</span></div>`;
  };
  const sections = data.kinds.map(k => {
    const items = data.sins.filter(s => kindOf(s) === k.id).sort((a, b) => a.name.localeCompare(b.name, "en"));
    return items.length ? `<section aria-labelledby="kind-${k.id}">
      <div class="section-head"><h2 class="section-title" id="kind-${k.id}">${esc(k.title)}</h2><span class="label">${items.length} topics</span></div>
      <p class="section-intro">${esc(k.intro)}</p>
        <div class="grid">
          ${items.map(card).join("\n          ")}
        </div>
      </section>` : "";
  }).filter(Boolean).join("\n      ");
  return head({ title: `The Seven Sins ${SUBTITLE}`, description: DESCRIPTION, url: `${SITE}/`, type: "website", depth: 0, graph: [{ ...WEBSITE, description: DESCRIPTION, inLanguage: "en" }] }) + `<body>
  ${siteBar(null, "")}
  <main class="wrap" id="content" data-lenses="${lensIds.join(" ")}">
    <header class="hero">
      <span class="mark" aria-hidden="true">&#10022;</span>
      <h1>The Seven Sins</h1>
      <p class="sub">${SUBTITLE}</p>
      <p>Understand the habits and struggles that hold us back, and learn how to leave them behind.</p>
      <p class="resume" hidden><span class="label">Continue reading</span><a></a></p>
      <p class="random" hidden><a href="">Read something at random</a></p>
      <p class="mine-link" hidden><a href="progress.html">Your reading: progress, export and import</a></p>
      <ul class="lens-list" aria-label="Every topic is read through ${count} lenses">
        <li class="label" aria-hidden="true">${count} lenses</li>
        ${data.lenses.map(l => `<li>${esc(l.name)}</li>`).join("")}
      </ul>
      <div class="lens-list pick" role="group" aria-labelledby="pick-label" hidden><span class="label" id="pick-label">Open topics in the lens</span>${data.lenses.map(l => `<button type="button" value="${l.id}" aria-pressed="false">${esc(l.name)}</button>`).join("")}</div>
      ${jumpNav("")}
      ${searchBox}
    </header>
    <section class="mine saved-list" aria-labelledby="saved-title" hidden>
      <div class="section-head"><h2 class="section-title" id="saved-title">Saved articles</h2></div>
      <ol></ol>
    </section>
    <section class="mine hl-list" aria-labelledby="hl-title" hidden>
      <div class="section-head"><h2 class="section-title" id="hl-title">Your highlights</h2></div>
      <ol></ol>
    </section>
    ${sections}
    ${resultsBox}
    <p class="center"><button class="reset" type="button" hidden>Clear reading progress</button></p>
  </main>
  <script src="${ASSET["site.js"]}" defer></script>
  <script src="${ASSET["home.js"]}" defer></script>
  <script src="${ASSET["progress.js"]}" defer></script>
  <script src="${ASSET["reader.js"]}" defer></script>
  ${footer(`A read-only guide for self-improvement. Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
</body>
</html>
`;
}

// The reader's own page: how much of each topic and lens has been read (progress.js fills in the counts),
// and export and import of everything kept in the browser (reader.js). Without JavaScript it is a plain list
// of the topics. It is about one browser's state, so it is kept out of search results and the sitemap.
function readingPage() {
  const total = sins.reduce((n, s) => n + s.topics.length * data.lenses.length, 0);
  const kinds = data.kinds.map(k => {
    const items = sins.filter(s => kindOf(s) === k.id).sort((a, b) => a.name.localeCompare(b.name, "en"));
    return items.length ? `<section aria-labelledby="kind-${k.id}">
      <h2 id="kind-${k.id}">${esc(k.title)}</h2>
      <ul class="bars">
        ${items.map(s => `<li data-topic="${s.id}" data-total="${s.topics.length * data.lenses.length}"><a href="${s.id}/index.html">${esc(s.name)}</a><span class="count label"></span><span class="bar" aria-hidden="true"><span></span></span></li>`).join("\n        ")}
      </ul>
    </section>` : "";
  }).filter(Boolean).join("\n    ");
  return head({ title: "Your reading - The Seven Sins", description: DESCRIPTION, depth: 0, robots: "noindex" }) + `<body>
  ${siteBar("index.html", `<a class="back" href="index.html">&larr; All topics</a>${searchLink("index.html")}`)}
  <main class="wrap narrow reading" id="content" data-total="${total}">
    <header class="page-head">
      <p class="label">Kept in this browser</p>
      <h1 class="sin-title">Your reading</h1>
      <p class="sin-tag">What you have read, kept only in this browser on this device.</p>
      <p class="nojs">Reading progress is kept by the site's scripts, which are not running, so this page can only list the topics.</p>
    </header>
    <section class="totals" aria-labelledby="totals-title" hidden>
      <h2 id="totals-title">All topics</h2>
      <p class="reading-total"></p>
      <ul class="bars">
        ${data.lenses.map(l => `<li data-lens="${l.id}" data-total="${total / data.lenses.length}"><span>${esc(l.name)}</span><span class="count label"></span><span class="bar" aria-hidden="true"><span></span></span></li>`).join("\n        ")}
      </ul>
    </section>
    ${kinds}
    <section class="transfer" aria-labelledby="transfer-title" hidden>
      <h2 id="transfer-title">Move to another device</h2>
      <p class="kept"></p>
      <p>Export saves everything the site keeps in this browser (articles read, saved articles, notes, highlights and display settings) to a file. Import that file in the browser on the other device: lists are merged with what is already there, and display settings are taken from the file.</p>
      <p class="transfer-actions"><button type="button" class="export">Export to a file</button><label class="import">Import a file<input type="file" accept=".json,application/json"></label></p>
      <p class="transfer-status" role="status"></p>
    </section>
  </main>
  ${footer(`A read-only guide for self-improvement. Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script src="${ASSET["site.js"]}" defer></script>
  <script src="${ASSET["progress.js"]}" defer></script>
  <script src="${ASSET["reader.js"]}" defer></script>
</body>
</html>
`;
}

// Old links look like sin.html?id=Pride&topic=effects&lens=buddhism; redirect.js sends them to the static page.
function redirectPage() {
  const topics = Object.fromEntries(sins.map(s => [s.id, s.topics.map(t => t.id)]));
  return head({ title: "The Seven Sins", description: DESCRIPTION, depth: 0, robots: "noindex" }) + `<body>
  ${siteBar("index.html", "")}
  <main class="wrap narrow" id="content" data-topics="${esc(JSON.stringify(topics))}" data-lenses="${lensIds.join(" ")}">
    <header class="hero">
      <h1>Not available yet</h1>
      <p>That page isn't available yet.</p>
    </header>
    <p class="center"><a class="back" href="index.html">&larr; All topics</a></p>
  </main>
  <script src="${ASSET["redirect.js"]}"></script>
</body>
</html>
`;
}

// The host serves this for any unknown URL, at whatever depth that URL has, so its links are absolute.
function notFoundPage() {
  return head({ title: "Page not found - The Seven Sins", description: DESCRIPTION, depth: "root", robots: "noindex" }) + `<body>
  ${siteBar("/", "")}
  <main class="wrap narrow" id="content" data-base="/">
    <header class="hero">
      <h1>Page not found</h1>
      <p>That page doesn't exist, or it has moved. Search the articles, or pick a topic from one of the lists.</p>
      ${jumpNav("/")}
      ${searchBox}
    </header>
    ${resultsBox}
  </main>
  ${footer(`A read-only guide for self-improvement. Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script src="/${ASSET["site.js"]}" defer></script>
  <script src="/${ASSET["home.js"]}" defer></script>
</body>
</html>
`;
}

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
}

function outputs() {
  const out = new Map();
  const urls = [`${SITE}/`];
  const articles = [];
  for (const s of sins) {
    out.set(`${s.id}/index.html`, overviewPage(s));
    urls.push(overviewUrl(s));
    for (const t of s.topics) {
      const mds = [];
      for (const l of data.lenses) {
        const md = fs.readFileSync(`${s.id}/${t.id}/${l.id}.md`, "utf8");
        out.set(articlePath(s, t, l), articlePage(s, t, l, md));
        articles.push([`${s.id}/${t.id}/${l.id}`, s.name, t.title, l.name, articleText(md)]);
        urls.push(`${SITE}/${articlePath(s, t, l)}`);
        mds.push(md);
      }
      out.set(`${s.id}/${t.id}/compare.html`, comparePage(s, t, mds));
    }
  }
  out.set("index.html", indexPage());
  out.set("progress.html", readingPage());
  out.set("sin.html", redirectPage());
  out.set("404.html", notFoundPage());
  out.set("sitemap.xml", sitemap(urls));
  out.set("search.json", JSON.stringify({ articles }) + "\n");
  return out;
}

const stale = [...outputs()].filter(([p, content]) => !fs.existsSync(p) || fs.readFileSync(p, "utf8") !== content);
if (process.argv.includes("--check")) {
  stale.forEach(([p]) => console.log("STALE", p));
  console.log(stale.length ? `${stale.length} stale file(s); run npm run render` : "generated files are up to date");
  process.exit(stale.length ? 1 : 0);
}
for (const [p, content] of stale) fs.writeFileSync(p, content);
console.log(`wrote ${stale.length} file(s)`);
