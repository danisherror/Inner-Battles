// Draws the share image for each topic, og/<Sin>.png (1200x630), in the style of og.png: the site's dark colours,
// Literata from fonts/, the topic name, its tagline and the six lenses. Drawing text needs a browser, so this runs
// headless Chrome and is kept out of `npm run render` and `npm run check`; run `npm run og` after adding a topic or
// changing a name or tagline, then `npm run render` so the pages point at the new image.
// Chrome is looked for at the usual macOS and Linux paths; set CHROME to use another.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const data = JSON.parse(fs.readFileSync("sins.json", "utf8"));
// Straight apostrophes in sins.json are set as typographic ones in the image.
const esc = s => String(s).replace(/'/g, "\u2019").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const font = f => `url("${path.resolve("fonts", f)}")`;

const chrome = process.env.CHROME || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"
].find(p => fs.existsSync(p));
if (!chrome) { console.error("Chrome not found; set CHROME to its path"); process.exit(1); }

// The script shrinks the name until the card fits, since names run from "Envy" to "Fear of failure and success".
const card = (sin, kind) => `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Literata; font-style: normal; font-weight: 200 900; src: ${font("literata-latin-wght-normal.woff2")}; }
@font-face { font-family: Literata; font-style: italic; font-weight: 200 900; src: ${font("literata-latin-wght-italic.woff2")}; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #17140f; }
main { box-sizing: border-box; width: 1200px; height: 630px; padding: 76px 92px 72px; display: flex; flex-direction: column; font-family: Literata, serif; color: #efe9e0; }
.label { font: 700 22px/1 system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #a79d92; display: flex; align-items: center; gap: 14px; }
.label b { color: #e08a7a; font-size: 30px; font-weight: 400; letter-spacing: 0; }
h1 { margin: 34px 0 0; font-weight: 700; font-size: 132px; line-height: 1.02; letter-spacing: -.01em; }
p { margin: 22px 0 0; font-style: italic; font-size: 40px; line-height: 1.25; color: #e08a7a; max-width: 980px; }
ul { margin: auto 0 0; padding: 0; list-style: none; display: flex; gap: 10px; }
li { font-size: 22px; padding: 8px 17px; border: 1.5px solid #4a4239; border-radius: 99px; color: #d9d1c5; }
</style><main>
<div class="label"><b>&#10022;</b>The Seven Sins &middot; ${esc(kind.label)}</div>
<h1>${esc(sin.name)}</h1>
<p>${esc(sin.tagline)}</p>
<ul>${data.lenses.map(l => `<li>${esc(l.name)}</li>`).join("")}</ul>
</main><script>
document.fonts.ready.then(() => {
  const [h1, p, ul] = ["h1", "p", "ul"].map(s => document.querySelector(s));
  const box = el => el.getBoundingClientRect();
  let size = 132;
  while (size > 56 && (h1.scrollWidth > h1.clientWidth || box(ul).top - box(p).bottom < 48)) {
    h1.style.fontSize = (size -= 4) + "px";
    p.style.marginTop = Math.round(size / 6) + "px";
  }
});
</script>`;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));
fs.mkdirSync("og", { recursive: true });
const only = process.argv.slice(2);
for (const sin of data.sins.filter(s => s.topics && (!only.length || only.includes(s.id)))) {
  const kind = data.kinds.find(k => k.id === (sin.kind || "sin"));
  const html = path.join(dir, `${sin.id}.html`);
  fs.writeFileSync(html, card(sin, kind));
  execFileSync(chrome, ["--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1200,630", "--virtual-time-budget=3000", `--screenshot=${path.resolve("og", sin.id + ".png")}`, `file://${html}`], { stdio: "ignore" });
  console.log(`og/${sin.id}.png`);
}
fs.rmSync(dir, { recursive: true, force: true });
console.log("now run npm run render to link them");
