// Pre-renders the site to static HTML: one page per article, plus index.html, sin.html and sitemap.xml.
// `npm run render` writes the files (commit them; the host serves them as they are).
// `npm run check` exits 1 if any generated file on disk is stale.
const fs = require("fs");
const { marked } = require("marked");

const SITE = "https://seven-sins-liard.vercel.app";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='28'%3E%E2%9C%A6%3C/text%3E%3C/svg%3E";
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

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const articlePath = (s, t, l) => `${s.id}/${t.id}/${l.id}.html`;

// External links get a visible marker and a screen-reader note; a link whose text is just its URL
// is shown as the host name instead, so it reads as a destination rather than a string of characters.
const renderer = new marked.Renderer();
renderer.link = (href, title, text) => {
  const t = title ? ` title="${esc(title)}"` : "";
  if (!/^https?:\/\//.test(href)) return `<a href="${esc(href)}"${t}>${text}</a>`;
  const host = new URL(href).hostname.replace(/^www\./, "");
  const label = /^https?:\/\//.test(text) ? esc(host) : text;
  return `<a class="ext" href="${esc(href)}"${t} rel="noopener">${label}<span class="sr-only"> (external link)</span></a>`;
};
marked.use({ renderer });

// Every article ends with a "**Sources**" paragraph, its list and any checking notes;
// render that tail as its own section so it can be set apart from the article text.
function articleBody(md) {
  const [text, ...tail] = md.split(/^\*\*Sources\*\*\s*$/m);
  const sources = tail.length ? `<section class="sources"><h3>Sources</h3>${marked.parse(tail.join(""))}</section>` : "";
  return marked.parse(text) + sources;
}

// Reader-selectable themes; the colours for each id are in style.css. "" follows the system light/dark setting.
// 404.html is hand-written and carries a copy of the head script and this menu.
const THEMES = [["", "Auto"], ["paper", "Paper"], ["sepia", "Sepia"], ["grey", "Grey"], ["dark", "Dark"], ["black", "Black"]];
const themeMenu = `<details class="theme" hidden><summary><span aria-hidden="true">&#9680;</span> Theme</summary><div class="theme-menu" role="group" aria-label="Theme">${THEMES.map(([id, name]) => `<button type="button" value="${id}"><span class="swatch" aria-hidden="true"></span>${name}</button>`).join("")}</div></details>`;

// The home page passes no `home` link: its hero already carries the site name.
const siteBar = (home, back) => `<a class="skip" href="#content">Skip to content</a>
  <header class="site${home ? "" : " bare"}"><div class="wrap">${home ? `<a class="brand" href="${home}"><span aria-hidden="true">&#10022;</span>The Seven Sins</a>` : ""}<div class="site-actions">${back}${themeMenu}</div></div></header>`;
const footer = text => `<footer><p>${text}</p></footer>`;

function head({ title, description, url, type, depth, robots }) {
  const up = "../".repeat(depth);
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
` : ""}  <link rel="icon" href="${ICON}">
  <script>try { const t = localStorage.getItem("theme"); if (${JSON.stringify(THEMES.map(t => t[0]).filter(Boolean))}.includes(t)) document.documentElement.dataset.theme = t; } catch (e) {}</script>
  <link rel="stylesheet" href="${up}style.css">
  <script src="${up}theme.js" defer></script>
</head>
`;
}

function articlePage(sin, topic, lens, md) {
  const title = `${sin.name}: ${topic.title} (${lens.name}) - The Seven Sins`;
  const description = `${sin.tagline} ${topic.title} through the ${lens.name} lens.`;
  const link = (href, text, on) => `<a href="${href}"${on ? ' aria-current="page"' : ""}>${esc(text)}</a>`;
  const kind = data.kinds.find(k => k.id === kindOf(sin));
  const i = sin.topics.indexOf(topic);
  const step = (t, cls, label) => `<a class="${cls}" href="../${t.id}/${lens.id}.html"><span class="label">${label}</span>${esc(t.title)}</a>`;
  const prev = i > 0 ? step(sin.topics[i - 1], "prev", "Previous") : "";
  const next = i < sin.topics.length - 1
    ? step(sin.topics[i + 1], "next", "Next")
    : `<a class="next" href="../../index.html"><span class="label">Finished</span>Choose another topic</a>`;
  return head({ title, description, url: `${SITE}/${articlePath(sin, topic, lens)}`, type: "article", depth: 2 }) + `<body>
  ${siteBar("../../index.html", `<a class="back" href="../../index.html#kind-${kind.id}">&larr; All topics</a>`)}
  <main class="wrap narrow">
    <header class="page-head">
      <p class="label">${esc(kind.label)}</p>
      <h1 class="sin-title">${esc(sin.name)}</h1>
      <p class="sin-tag">${esc(sin.tagline)}</p>
    </header>
    <div class="switch">
      <nav class="topics" aria-label="Topic"><span class="label" aria-hidden="true">Topic</span>${sin.topics.map(t => link(`../${t.id}/${lens.id}.html`, t.title, t.id === topic.id)).join("")}</nav>
      <nav class="lenses" aria-label="Lens"><span class="label" aria-hidden="true">Lens</span>${data.lenses.map(l => link(`${l.id}.html`, l.name, l.id === lens.id)).join("")}</nav>
    </div>
    <article class="md" id="content"><p class="label">${esc(lens.name)} lens</p><h2>${esc(topic.title)}</h2>${articleBody(md)}</article>
    <nav class="pager" aria-label="Continue reading">${prev}${next}</nav>
  </main>
  ${footer(`Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script>try { localStorage.setItem("lens", ${JSON.stringify(lens.id)}); } catch (e) {}</script>
  <script src="../../progress.js" defer></script>
</body>
</html>
`;
}

function indexPage() {
  const card = s => {
    const inner = `<h3>${esc(s.name)}</h3><p>${esc(s.tagline)}</p>`;
    return s.topics
      ? `<a class="card" href="${articlePath(s, s.topics[0], data.lenses[0])}" data-total="${s.topics.length * data.lenses.length}">${inner}</a>`
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
  return head({ title: `The Seven Sins ${SUBTITLE}`, description: DESCRIPTION, url: `${SITE}/`, type: "website", depth: 0 }) + `<body>
  ${siteBar(null, "")}
  <main class="wrap" id="content">
    <header class="hero">
      <span class="mark" aria-hidden="true">&#10022;</span>
      <h1>The Seven Sins</h1>
      <p class="sub">${SUBTITLE}</p>
      <p>Understand the habits and struggles that hold us back, and learn how to leave them behind.</p>
      <ul class="lens-list" aria-label="Every topic is read through ${count} lenses">
        <li class="label" aria-hidden="true">${count} lenses</li>
        ${data.lenses.map(l => `<li>${esc(l.name)}</li>`).join("")}
      </ul>
      <nav class="jump" aria-label="Sections">${data.kinds.map(k => `<a href="#kind-${k.id}">${esc(k.title)}</a>`).join("")}</nav>
      <div class="filter" role="search" hidden>
        <label class="sr-only" for="filter">Filter topics</label>
        <input id="filter" type="search" placeholder="Filter the ${data.sins.length} topics, for example &quot;fear&quot;" autocomplete="off" spellcheck="false">
        <p class="filter-status label" role="status"></p>
      </div>
    </header>
    ${sections}
    <p class="center"><button class="reset" type="button" hidden>Clear reading progress</button></p>
  </main>
  <script src="home.js" defer></script>
  <script src="progress.js" defer></script>
  ${footer(`A read-only guide for self-improvement. Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script>
    // Cards link to the first lens; swap in the lens the reader chose last.
    try {
      const lens = localStorage.getItem("lens");
      if (${JSON.stringify(lensIds)}.includes(lens))
        for (const a of document.querySelectorAll("a.card[href]")) a.href = a.getAttribute("href").replace(/[^/]+\\.html$/, lens + ".html");
    } catch (e) {}
  </script>
</body>
</html>
`;
}

// Old links look like sin.html?id=Pride&topic=effects&lens=buddhism; send them to the static page.
function redirectPage() {
  const topics = Object.fromEntries(sins.map(s => [s.id, s.topics.map(t => t.id)]));
  return head({ title: "The Seven Sins", description: DESCRIPTION, depth: 0, robots: "noindex" }) + `<body>
  ${siteBar("index.html", "")}
  <main class="wrap narrow" id="content">
    <header class="hero">
      <h1>Not available yet</h1>
      <p>That page isn't available yet.</p>
    </header>
    <p class="center"><a class="back" href="index.html">&larr; All topics</a></p>
  </main>
  <script>
    const TOPICS = ${JSON.stringify(topics)};
    const LENSES = ${JSON.stringify(lensIds)};
    const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const q = new URLSearchParams(location.search);
    const id = q.get("id");
    if (Object.hasOwn(TOPICS, id)) {
      const topic = TOPICS[id].includes(q.get("topic")) ? q.get("topic") : TOPICS[id][0];
      const lens = [q.get("lens"), get("lens")].find(l => LENSES.includes(l)) || LENSES[0];
      location.replace(id + "/" + topic + "/" + lens + ".html");
    }
  </script>
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
  for (const s of sins)
    for (const t of s.topics)
      for (const l of data.lenses) {
        out.set(articlePath(s, t, l), articlePage(s, t, l, fs.readFileSync(`${s.id}/${t.id}/${l.id}.md`, "utf8")));
        urls.push(`${SITE}/${articlePath(s, t, l)}`);
      }
  out.set("index.html", indexPage());
  out.set("sin.html", redirectPage());
  out.set("sitemap.xml", sitemap(urls));
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
