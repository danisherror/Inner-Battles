// Pre-renders the site to static HTML: one page per article, a compare page per topic section
// (all the lenses side by side), plus index.html, sin.html, 404.html, sitemap.xml
// and search.json (the article text that the home page search box reads).
// `npm run render` writes the files (commit them; the host serves them as they are).
// `npm run check` exits 1 if any generated file on disk is stale.
const fs = require("fs");
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
const themeMenu = `<details class="theme" hidden><summary><span aria-hidden="true">&#9680;</span> Theme</summary><div class="theme-menu" role="group" aria-label="Theme">${THEMES.map(([id, name]) => `<button type="button" value="${id}"><span class="swatch" aria-hidden="true"></span>${name}</button>`).join("")}</div></details>`;

// The home page passes no `home` link: its hero already carries the site name.
const siteBar = (home, back) => `<a class="skip" href="#content">Skip to content</a>
  <header class="site${home ? "" : " bare"}"><div class="wrap">${home ? `<a class="brand" href="${home}"><span aria-hidden="true">&#10022;</span>The Seven Sins</a>` : ""}<div class="site-actions">${back}${themeMenu}</div></div></header>`;
const footer = text => `<footer><p>${text}</p></footer>`;

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
  <script src="${up}theme.js"></script>
  <link rel="preload" href="${up}fonts/literata-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${up}style.css">
</head>
`;
}

const navLink = (href, text, on) => `<a href="${href}"${on ? ' aria-current="page"' : ""}>${esc(text)}</a>`;

function articlePage(sin, topic, lens, md) {
  const title = `${sin.name}: ${topic.title} (${lens.name}) - The Seven Sins`;
  const description = summary(articleText(md));
  const url = `${SITE}/${articlePath(sin, topic, lens)}`;
  const graph = [
    { "@type": "Article", headline: `${sin.name}: ${topic.title} (${lens.name})`, description, url, mainEntityOfPage: url, inLanguage: "en", image: `${SITE}/og.png`, about: sin.name, isPartOf: WEBSITE },
    { "@type": "BreadcrumbList", itemListElement: [
      ["The Seven Sins", `${SITE}/`],
      [sin.name, `${SITE}/${articlePath(sin, sin.topics[0], lens)}`],
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
  // Related topics open on the same section and lens the reader is on now.
  const related = (sin.related || []).map(id => {
    const r = data.sins.find(s => s.id === id);
    if (!r) throw new Error(`${sin.id}: unknown related id "${id}" in sins.json`);
    return r;
  }).filter(r => r.topics && r.topics.some(t => t.id === topic.id));
  const relatedNav = related.length ? `
    <nav class="related" aria-labelledby="related-title"><h2 class="label" id="related-title">Related topics</h2><div class="related-list">${related.map(r => `<a href="../../${articlePath(r, topic, lens)}"><strong>${esc(r.name)}</strong><span>${esc(r.tagline)}</span></a>`).join("")}</div></nav>` : "";
  return head({ title, description, url, type: "article", depth: 2, graph }) + `<body>
  ${siteBar("../../index.html", `<a class="back" href="../../index.html#kind-${kind.id}">&larr; All topics</a>`)}
  <main class="wrap narrow">
    <header class="page-head">
      <p class="label">${esc(kind.label)}</p>
      <h1 class="sin-title">${esc(sin.name)}</h1>
      <p class="sin-tag">${esc(sin.tagline)}</p>
    </header>
    <div class="switch">
      <nav class="topics" aria-label="Topic"><span class="label" aria-hidden="true">Topic</span>${sin.topics.map(t => navLink(`../${t.id}/${lens.id}.html`, t.title, t.id === topic.id)).join("")}</nav>
      <nav class="lenses" aria-label="Lens"><span class="label" aria-hidden="true">Lens</span>${data.lenses.map(l => navLink(`${l.id}.html`, l.name, l.id === lens.id)).join("")}<a class="compare-link" href="compare.html"><span aria-hidden="true">&#8644;&nbsp;</span>Compare lenses</a></nav>
    </div>
    <article class="md" id="content"><p class="label">${esc(lens.name)} lens</p><h2>${esc(topic.title)}</h2>${articleBody(md)}</article>
    <nav class="pager" aria-label="Continue reading">${prev}${next}</nav>${relatedNav}
  </main>
  ${footer(`Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script src="../../progress.js" defer></script>
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
  ${siteBar("../../index.html", `<a class="back" href="../../index.html#kind-${kind.id}">&larr; All topics</a>`)}
  <main class="wrap compare" id="content">
    <header class="page-head">
      <p class="label">${esc(kind.label)}</p>
      <h1 class="sin-title">${esc(sin.name)}</h1>
      <p class="sin-tag">${esc(topic.title)}, read through each lens side by side.</p>
    </header>
    <div class="switch">
      <nav class="topics" aria-label="Topic"><span class="label" aria-hidden="true">Topic</span>${sin.topics.map(t => navLink(`../${t.id}/compare.html`, t.title, t.id === topic.id)).join("")}</nav>
      <div class="lenses pick" role="group" aria-label="Lenses to show" hidden><span class="label" aria-hidden="true">Lenses to show</span>${data.lenses.map(l => `<button type="button" value="${l.id}" aria-pressed="false">${esc(l.name)}</button>`).join("")}</div>
    </div>
    <div class="columns">
      ${data.lenses.map((l, n) => `<article class="md" data-lens="${l.id}"><h2>${esc(l.name)}</h2>${articleBody(mds[n])}<p class="open"><a href="${l.id}.html">Open the ${esc(l.name)} article on its own</a></p></article>`).join("\n      ")}
    </div>
  </main>
  ${footer(`Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
  <script src="../../compare.js" defer></script>
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
      <ul class="lens-list" aria-label="Every topic is read through ${count} lenses">
        <li class="label" aria-hidden="true">${count} lenses</li>
        ${data.lenses.map(l => `<li>${esc(l.name)}</li>`).join("")}
      </ul>
      <nav class="jump" aria-label="Sections">${data.kinds.map(k => `<a href="#kind-${k.id}">${esc(k.title)}</a>`).join("")}</nav>
      <div class="filter" role="search" hidden>
        <label class="sr-only" for="filter">Search topics and articles</label>
        <input id="filter" type="search" placeholder="Search topics and articles" autocomplete="off" spellcheck="false">
        <p class="filter-status label" role="status"></p>
      </div>
    </header>
    ${sections}
    <div class="results" role="region" aria-labelledby="results-title" hidden><h2 class="label" id="results-title"></h2><ol></ol></div>
    <p class="center"><button class="reset" type="button" hidden>Clear reading progress</button></p>
  </main>
  <script src="home.js" defer></script>
  <script src="progress.js" defer></script>
  ${footer(`A read-only guide for self-improvement. Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
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
  <script src="redirect.js"></script>
</body>
</html>
`;
}

// The host serves this for any unknown URL, at whatever depth that URL has, so its links are absolute.
function notFoundPage() {
  return head({ title: "Page not found - The Seven Sins", description: DESCRIPTION, depth: "root", robots: "noindex" }) + `<body>
  ${siteBar("/", "")}
  <main class="wrap narrow" id="content">
    <header class="hero">
      <h1>Page not found</h1>
      <p>That page doesn't exist, or it has moved. Try one of the topics instead.</p>
    </header>
    <p class="center"><a class="back" href="/">&larr; All topics</a></p>
  </main>
  ${footer(`A read-only guide for self-improvement. Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}`)}
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
  for (const s of sins)
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
  out.set("index.html", indexPage());
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
