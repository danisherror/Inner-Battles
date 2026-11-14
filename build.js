// Pre-renders the site to static HTML: one page per article, plus index.html, sin.html and sitemap.xml.
// `npm run render` writes the files (commit them; the host serves them as they are).
// `npm run check` exits 1 if any generated file on disk is stale.
const fs = require("fs");
const { marked } = require("marked");

const SITE = "https://seven-sins-liard.vercel.app";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='28'%3E%E2%9C%A6%3C/text%3E%3C/svg%3E";
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
  <meta property="og:image:alt" content="The Seven Sins: ${data.sins.filter(s => kindOf(s) === "sin").map(s => s.name).join(', ')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/og.png">
` : ""}  <link rel="icon" href="${ICON}">
  <link rel="stylesheet" href="${up}style.css">
</head>
`;
}

function articlePage(sin, topic, lens, md) {
  const title = `${sin.name}: ${topic.title} (${lens.name}) - The Seven Sins`;
  const description = `${sin.tagline} ${topic.title} through the ${lens.name} lens.`;
  const link = (href, text, on) => `<a href="${href}"${on ? ' aria-current="page"' : ""}>${esc(text)}</a>`;
  return head({ title, description, url: `${SITE}/${articlePath(sin, topic, lens)}`, type: "article", depth: 2 }) + `<body>
  <main class="wrap">
    <a class="back" href="../../index.html">&larr; All topics</a>
    <h1 class="sin-title">${esc(sin.name)}</h1>
    <p class="sin-tag">${esc(sin.tagline)}</p>
    <nav class="topics" aria-label="Topic">${sin.topics.map(t => link(`../${t.id}/${lens.id}.html`, t.title, t.id === topic.id)).join("")}</nav>
    <nav class="lenses" aria-label="Lens">${data.lenses.map(l => link(`${l.id}.html`, l.name, l.id === lens.id)).join("")}</nav>
    <article class="md"><h2>${esc(topic.title)}</h2>${marked.parse(md)}</article>
  </main>
  <footer>Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}</footer>
  <script>try { localStorage.setItem("lens", ${JSON.stringify(lens.id)}); } catch (e) {}</script>
</body>
</html>
`;
}

function indexPage() {
  const card = s => {
    const inner = `<h3>${esc(s.name)}</h3><p>${esc(s.tagline)}</p>`;
    return s.topics
      ? `<a class="card" href="${articlePath(s, s.topics[0], data.lenses[0])}">${inner}</a>`
      : `<div class="card disabled">${inner}<span class="soon">Coming soon</span></div>`;
  };
  const sections = data.kinds.map(k => {
    const items = data.sins.filter(s => kindOf(s) === k.id).sort((a, b) => a.name.localeCompare(b.name, "en"));
    return items.length ? `<section aria-labelledby="kind-${k.id}">
        <h2 class="section-title" id="kind-${k.id}">${esc(k.title)}</h2>
        <p class="section-intro">${esc(k.intro)}</p>
        <div class="grid">
          ${items.map(card).join("\n          ")}
        </div>
      </section>` : "";
  }).filter(Boolean).join("\n      ");
  return head({ title: "The Seven Sins", description: DESCRIPTION, url: `${SITE}/`, type: "website", depth: 0 }) + `<body>
  <div class="wrap">
    <header class="hero">
      <h1>The Seven Sins</h1>
      <p>Understand the habits and struggles that hold us back through ${count} lenses (${lensList}) and learn how to leave them behind.</p>
    </header>
    <main>
      ${sections}
    </main>
  </div>
  <footer>A read-only guide for self-improvement. Educational and reflective content, not medical, psychological or religious authority. ${DISCLAIMER}</footer>
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
  <main class="wrap">
    <a class="back" href="index.html">&larr; All topics</a>
    <p>That page isn't available yet.</p>
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
