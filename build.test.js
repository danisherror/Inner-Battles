// `npm test` runs these with Node's own test runner (node:test), so they need no extra package.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const { execSync } = require("child_process");
const { esc, articleBody, articleText, summary } = require("./build.js");

test("esc escapes the characters that matter in text and attribute values", () => {
  assert.equal(esc(`Tom & "Jerry" <b>`), "Tom &amp; &quot;Jerry&quot; &lt;b&gt;");
  assert.equal(esc(3), "3");
});

test("summary leaves a short text as it is", () => {
  const text = "A short opening sentence.";
  assert.equal(summary(text), text);
  assert.equal(summary("x".repeat(155)), "x".repeat(155));
});

test("summary cuts a long text at a word near 155 characters and adds an ellipsis", () => {
  const text = "word ".repeat(40).trim();
  const out = summary(text);
  assert.ok(out.length <= 156, `${out.length} characters`);
  assert.ok(out.endsWith("word…"));
  assert.ok(!out.includes("  "));
});

test("summary drops trailing punctuation before the ellipsis", () => {
  const text = "a".repeat(140) + " first, second, third, fourth and more words after the cut";
  const out = summary(text);
  assert.match(out, /[^\s,;:(]…$/);
});

test("summary adds no ellipsis when the cut ends a sentence", () => {
  const text = "a".repeat(150) + " end. " + "more ".repeat(10);
  assert.equal(summary(text), "a".repeat(150) + " end.");
});

const md = `Opening line with [a link](https://www.example.com/page) and *emphasis* & more.

**Sources**

- <https://example.org/source>
`;

test("articleText leaves out the Sources tail, the tags and the screen-reader notes", () => {
  assert.equal(articleText(md), "Opening line with a link and emphasis & more.");
});

test("articleText decodes entities and collapses white space", () => {
  assert.equal(articleText(`"Quoted"   <it's>\n\nNext`), `"Quoted" <it's> Next`);
});

test("articleBody marks external links and shows a bare URL as its host", () => {
  const html = articleBody(md);
  assert.match(html, /<a class="ext" href="https:\/\/www\.example\.com\/page" rel="noopener">a link<span class="sr-only"> \(external link\)<\/span><\/a>/);
  assert.match(html, /<a class="ext" href="https:\/\/example\.org\/source" rel="noopener">example\.org<span/);
});

test("articleBody leaves internal links plain", () => {
  assert.match(articleBody("[next](../effects/modern.html)"), /<a href="\.\.\/effects\/modern\.html">next<\/a>/);
});

test("articleBody puts the Sources tail in its own section, with an anchor only when asked", () => {
  assert.match(articleBody(md, true), /<section class="sources"><h3 id="sources">Sources<a class="anchor" href="#sources">/);
  assert.match(articleBody(md), /<section class="sources"><h3>Sources<\/h3>/);
  assert.doesNotMatch(articleBody("No sources here."), /class="sources"/);
});

// A class or id in style.css should appear in a class or id attribute of a generated page, or as a word in a script
// (which may add it with classList); otherwise the rule is probably left over from removed markup.
test("every class and id selector in style.css is used", () => {
  const css = fs.readFileSync("style.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const names = new Set();
  for (const [, selector] of css.matchAll(/(?:^|[;{}])\s*([^;{}@]+)\{/g)) {
    for (const [name] of selector.matchAll(/[.#]-?[a-zA-Z_][\w-]*/g)) names.add(name);
  }
  const files = ext => execSync(`git ls-files '*.${ext}'`).toString().trim().split("\n");
  const used = new Set();
  for (const f of files("html")) {
    for (const [, attr, value] of fs.readFileSync(f, "utf8").matchAll(/\b(class|id)="([^"]*)"/g)) {
      for (const w of value.split(/\s+/)) used.add((attr === "id" ? "#" : ".") + w);
    }
  }
  const scripts = files("js").map(f => fs.readFileSync(f, "utf8")).join("\n");
  const unused = [...names].filter(n => !used.has(n) && !new RegExp(`(^|[^\\w-])${n.slice(1)}(?![\\w-])`, "m").test(scripts));
  assert.deepEqual(unused, []);
});
