# Sins: Engineering Playbook

A quality and completion checklist for this project, adapted from the general Vibecoding Engineering Playbook. It keeps only the parts that apply to a static, read-only site with Markdown articles, and adds content-accuracy checks, which matter most here.

**Core principle:** nothing is done because an AI agent says it is done. Mark an item PASS only with evidence (a command, a screenshot, a diff you read).

## 0. Project classification

| Property | Value |
|---|---|
| Type | Static content site (marketing/reference), no backend, no auth, no database, no user input |
| Stack | Plain HTML, CSS, JS. `marked` 4.3.0 from cdnjs renders Markdown in the browser |
| Content | 7 sins x 5 topics x 6 lenses = 210 articles (`<Sin>/<topic>/<lens>.md`), driven by `sins.json` |
| Hosting | Any static host (Vercel suggested in README) |
| Main risk | Wrong or unsourced claims about scripture, philosophy and research. Technical risk is low |

**Not applicable (N/A):** authentication, authorization, database, API design, concurrency, backups, MCP and agent security, CI/CD pipelines beyond a link/lint check, observability stacks, desktop/CLI, AI cost management. Do not add infrastructure for these.

**Priority levels**
- P0: wrong or fabricated claims presented as sourced fact, XSS, broken site
- P1: broken links or articles, 404s, content that contradicts the writing guidelines
- P2: accessibility, SEO, performance, maintainability
- P3: visual polish

**Statuses:** PASS (verified with evidence), FAIL, PARTIAL, N/A, UNKNOWN.

## 1. Current state (observed from the repo, 2026-11-14)

| Area | Status | Evidence / note |
|---|---|---|
| All 7 sins written | PARTIAL | README lists all as written. Not yet verified that all 210 files exist and match `sins.json` (see 2.1) |
| Links and DOIs | PARTIAL | README says checked 2026-11-14 for Pride and the other six. Re-run after any edit |
| Scripture and quote accuracy | PARTIAL | README states Bible, Müller Upanishad, Stoic and Aristotle quotes checked for Pride only. Other references "from memory" |
| Security (XSS) | PARTIAL | `sin.html` renders `marked.parse(md)` through `innerHTML`; marked 4.x does not sanitize. Safe only while all Markdown is first-party. See 5 |
| Supply chain | PASS | `sin.html` loads `marked` 4.3.0 with a sha512 `integrity` hash that matches the cdnjs API value; page still renders it (checked in Chrome 2026-11-14) |
| SEO / social previews | FAIL (P2) | `index.html` and `sin.html` have no meta description, canonical, Open Graph or Twitter tags. No `sitemap.xml` or `robots.txt` in repo |
| SEO of article content | FAIL (P2) | Articles load via `fetch` after page load and the URL uses a query string, so crawlers see an empty shell. Acceptable only if search traffic is not a goal |
| Error states | PASS | 404 shows "isn't written yet"; other failures show a retry message; `sins.json` failure handled on both pages. 404 and simulated network failure checked in Chrome 2026-11-14; `sins.json` failure path not exercised |
| Accessibility | PARTIAL | Fake tab roles replaced by `aria-pressed` buttons, `aria-live` on the article, focus outlines added. Heading hierarchy, contrast and an axe/Lighthouse run still not done |
| Tests / CI | FAIL (P2) | None. A small script can replace them (see 4) |
| Disclaimer on site | PASS | Footer on both pages |
| Docs | PASS | README covers run, layout, adding a sin, writing guidelines, sources |
| Stray file | UNKNOWN | `Inner-Battles.md` is not linked from the site or README. Decide: link it, move it, or remove it |

## 2. Content integrity (highest priority for this project)

### 2.1 Structure
- [ ] Every sin in `sins.json` with `topics` has a folder named exactly its `id`.
- [ ] Every topic folder has all six lens files, with no extras or typos.
- [ ] No empty files, and no file ends mid-sentence.
- [ ] `sins.json` is valid JSON; every `tagline` is present and reads well.
- [ ] No sin is left as "Coming soon" by accident.

### 2.2 Writing guidelines (from README)
- [ ] Each tradition is described on its own terms and not ranked.
- [ ] Every article ends with a **Sources** section.
- [ ] Any claim about scripture, philosophy or research has a URL or book-and-verse reference.
- [ ] Unchecked points are flagged as "standard summary, not checked against a specific passage".
- [ ] Where a tradition has no exact equivalent (for example, Hinduism and gluttony or sloth), the article says "related, not identical".
- [ ] No fabricated quotes, statistics or studies. If a quote cannot be traced to a source, paraphrase it or remove it.
- [ ] The Disclaimer (not medical, psychological or religious authority) stays on the site, not only in the README. Currently it appears only in the README; consider adding it to the footer.
- [ ] Sensitive topics (Lust, Gluttony) point to professional help where relevant, and avoid shaming language.
- [ ] Consistent terminology: "Buddhist" (lens name in `sins.json`) vs "Buddhism" (id and file names). Keep it deliberate.
- [ ] Spelling and grammar pass, one spelling convention throughout.

### 2.3 Verification process
1. Run the link checker (see 4) over all `.md` files.
2. Sample at least 2 articles per sin per lens and verify each quote and verse against its source.
3. Record in README the date, what was checked and what was not. Do not mark an article verified based on an agent summary.

## 3. Design and UI (P3 unless broken)

Existing foundation: `style.css` already uses `:root` tokens and a dark-mode media query, with a serif type stack.

- [ ] Light and dark themes are both readable; check contrast of `--muted` on `--bg` (WCAG AA 4.5:1).
- [ ] Layout checked at 360px, 768px and 1280px widths, with no horizontal overflow (long Markdown tables and code blocks are the likely cause).
- [ ] Topic and lens buttons wrap cleanly on mobile; touch targets are at least 44px.
- [ ] Visible keyboard focus on cards and buttons.
- [ ] Markdown elements (tables, blockquotes, lists, links) are styled consistently.
- [ ] Respect `prefers-reduced-motion` if any transitions are added.
- [ ] Spacing and radius values use tokens instead of one-off numbers.

## 4. Tooling (small and proportionate)

Use only what solves a real problem here.

| Need | Tool | Notes |
|---|---|---|
| Serve locally | `python3 -m http.server 8000` | Already documented |
| Browser check | Claude in Chrome / Playwright | Preview pages, check console errors and layout |
| Link checking | `lychee` or `markdown-link-check` | Run on `**/*.md`; CLAUDE.md requires a source URL for third-party claims |
| Structure check | A short shell or Node script | Verify every `sins.json` entry has all 30 files (see 2.1) |
| Accessibility | axe or Lighthouse | Run on `index.html` and one `sin.html` URL |
| Secret scan | Gitleaks | Cheap insurance before publishing; the repo has no secrets by design |
| Spell check | `codespell` or `cspell` | Optional |

Suggested `scripts/check-structure.sh` (create only when approved):

```sh
#!/bin/sh
# Fails if any sin/topic/lens article listed in sins.json is missing or empty.
node -e '
const fs = require("fs");
const d = JSON.parse(fs.readFileSync("sins.json", "utf8"));
let bad = 0;
for (const s of d.sins.filter(s => s.topics))
  for (const t of s.topics)
    for (const l of d.lenses) {
      const p = `${s.id}/${t.id}/${l.id}.md`;
      if (!fs.existsSync(p) || fs.statSync(p).size === 0) { console.log("MISSING/EMPTY", p); bad++; }
    }
console.log(bad ? `${bad} problem(s)` : "all articles present");
process.exit(bad ? 1 : 0);
'
```

## 5. Security (proportionate to a static site)

- [ ] **XSS:** `marked.parse` output goes into `innerHTML` unsanitized. Today all Markdown is first-party, so the risk is low. If articles ever come from contributors or another source, add DOMPurify. Test by adding `<script>` and `<img onerror>` to a scratch article and confirming the outcome.
- [ ] **SRI:** add `integrity` and `crossorigin="anonymous"` to the `marked` script tag, or vendor the file into the repo. Either removes the cdnjs runtime dependency risk. Compute the hash from the file you actually verified.
- [ ] Query parameters (`id`, `topic`, `lens`) are used only to look up entries in `sins.json`, never concatenated into a fetch path directly. Confirm this still holds after edits.
- [ ] Security headers at the host (Vercel `vercel.json` or equivalent): `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a CSP allowing only `self` and `cdnjs.cloudflare.com` for scripts.
- [ ] HTTPS enforced by the host.
- [ ] No secrets, analytics tokens or personal data committed (`git log -p` scan with Gitleaks).
- [ ] No tracking or cookies unless deliberately added; `localStorage` currently stores only the chosen lens, wrapped in try/catch.

## 6. Functional checks

- [ ] `index.html` lists all 7 sins and every card links to a working `sin.html?id=...`.
- [ ] Every one of the 210 `sin.html?id=<Sin>&topic=<topic>&lens=<lens>` URLs renders (script-checkable).
- [ ] Unknown `id`, `topic` or `lens` in the URL falls back gracefully (unknown id shows "Not found"; unknown topic and lens default).
- [ ] Back/forward and refresh: the URL updates with `replaceState`, so the back button leaves the page rather than stepping through tabs. Decide whether that is intended.
- [ ] Copy a deep link, open it in a new tab: same article loads.
- [ ] Remembered lens persists across sins and survives `localStorage` being blocked.
- [ ] Distinguish error cases: 404 file ("not written yet") vs network or JSON failure ("could not load, retry"). Add an error message to `index.html`.
- [ ] Loading state works and does not flash incorrectly.
- [ ] Open the site from `file://` and confirm the README's explanation (fetch blocked) is accurate; consider a visible hint.

## 7. SEO and sharing (do only if discoverability matters)

- [ ] Unique `<title>` and meta description per page. `sin.html` already sets a title per sin; add the topic and lens.
- [ ] Canonical URL, Open Graph (title, description, image) and Twitter card.
- [ ] `robots.txt` and `sitemap.xml` listing the pages.
- [ ] Articles are rendered client-side, so search engines may index little. Options if this matters: pre-render the Markdown to static HTML at build time (one HTML page per article), or accept the limitation and note it here.
- [ ] Favicon.
- [ ] `lang="en"` is already set.

## 8. Accessibility (target WCAG 2.2 AA)

- [ ] Lens switcher: either implement the full tab pattern (`aria-controls`, `tabpanel`, arrow keys, roving `tabindex`) or drop `role="tab"` and use buttons with `aria-pressed`.
- [ ] Topic buttons expose the current state (`aria-pressed` or `aria-current`).
- [ ] Loading and error messages are announced (`aria-live="polite"` on the article region).
- [ ] Heading hierarchy: one `h1` per page, `h2` for the topic, article headings below it (the article injects `<h2>` and Markdown may include another `h1`; check).
- [ ] Link text in articles is descriptive; external links are clearly marked.
- [ ] Colour contrast passes in light and dark themes.
- [ ] Page works with keyboard only and at 200% zoom.

## 9. Performance

Measure first; the site is small.

- [ ] Lighthouse on the home page and a sample article: LCP <= 2.5s, CLS <= 0.1, INP <= 200ms.
- [ ] Each article is a separate small `fetch` (about 1 to 2 KB each); confirm no waterfall beyond `sins.json` then article.
- [ ] `marked` is the only third-party script; consider `defer`, or vendoring to remove the extra origin.
- [ ] Cache headers for `.md` and `sins.json` at the host.

## 10. Code quality and maintainability

- [ ] `sin.html` and `index.html` stay small; extract a shared JS file only if duplication grows.
- [ ] HTML escaping: titles and taglines from `sins.json` are interpolated into `innerHTML`. They are first-party, but escape them or use `textContent` if the data ever becomes external.
- [ ] No dead code, unused CSS or unused files.
- [ ] README stays in sync with reality (status table, layout, sources). Update it whenever content or structure changes.
- [ ] `sins.json` is the single source of truth for sins, topics and lenses.
- [ ] Commit messages follow CLAUDE.md: short imperative subject, optional body, no AI attribution lines.

## 11. Working with the AI agent on this repo

- Give each task a narrow scope (for example, "verify Wrath quotes" rather than "improve content").
- Ask the agent to inspect existing articles first and match their tone, structure and Sources format.
- Any claim about a third-party source found online needs a source URL in the article or README (CLAUDE.md rule). Reject answers without one.
- Review the git diff for every content change. Check for invented quotes, verse numbers and URLs; these are the failure mode most likely to slip through here.
- Never accept "all links checked" without the link checker's output.
- Agents must not add dependencies, build tooling or a backend without approval.

## 12. Completion plan (suggested order)

| # | Task | Priority | Done when | Status (2026-11-14) |
|---|---|---|---|---|
| 1 | Structure check: all 210 files exist, non-empty, and match `sins.json` | P1 | Script exits 0 | DONE: 210/210 present, none empty |
| 2 | Link and DOI check over all `.md` files | P1 | Checker reports 0 broken links; output saved | DONE: 310 URLs checked; 22 DOI 403s are publisher bot-blocking and resolve in doi.org (links exist; claims not checked) |
| 3 | Quote and verse verification pass for Lust, Greed, Envy, Gluttony, Wrath, Sloth (Pride already done) | P0 | Each checked item recorded in README with date | IN PROGRESS: Pride done earlier. Lust: quotes and Gita claims checked. Other five sins: Bible quotes spot-checked (NRSV, match). Greed and Gluttony Upanishad quotes checked against Müller on Wikisource (Isha lines fixed). Philosophical-lens quotes in Greed, Envy, Gluttony, Wrath and Sloth checked by script against MIT Classics, Wikisource, Perseus and Gutenberg; five wording errors fixed. Christianity non-Bible items checked (Catechism, Augustine; three fixes). About 24 Buddhist sutta quotes, Evagrius and Aquinas references still unverified |
| 4 | Sources section present in all articles; unchecked points labelled | P1 | `grep -L "Sources"` over articles returns nothing | DONE: every article has a Sources heading (Lust root-causes/modern notes none cited) |
| 5 | Add SRI to `marked` (or vendor it) | P2 | Page still renders; browser console clean | DONE: sha512 integrity matches cdnjs; renders in Chrome |
| 6 | Decide on `Inner-Battles.md` (link, move or delete) | P2 | Decision recorded in README | PARKED by user |
| 7 | Error states: distinguish 404 from network/JSON failure; handle `sins.json` failure on the home page | P2 | Verified by blocking the request in DevTools | DONE: 404 and network failure checked; `sins.json` failure path not exercised |
| 8 | Accessibility fixes (tabs pattern, live region, headings, contrast) | P2 | axe reports 0 serious issues on sampled pages | PARTIAL: aria-pressed, aria-live, focus outlines added; heading order (h1, h2) and contrast checked; no axe/Lighthouse run |
| 9 | Responsive and dark-mode check at 360 / 768 / 1280px | P3 | Screenshots reviewed, no overflow | PARTIAL: all 210 article URLs and index.html load at 360px and 768px with no horizontal overflow (checked in Chrome via iframes, 2026-11-14); light and dark contrast pass AA (computed ratios, lowest 5.35:1); touch targets raised to 44px; no screenshot review at 1280px or of light mode |
| 10 | SEO basics: meta, OG, robots, sitemap, favicon | P2 | Tags present in page source; social preview tested | PARTIAL: description, Open Graph, Twitter card, favicon, canonical and `og:url` on the home page, per-article title/description/`og:url`, `robots.txt` and `sitemap.xml` (home plus 7 sins) added. No `og:image`; social preview not tested; the vercel.app domain is a placeholder if a custom domain is added later |
| 11 | Footer disclaimer on the site | P2 | Visible on both pages | DONE: footer on both pages |
| 12 | Deploy (for example Vercel), add security headers, smoke test the live URL | P2 | Home and 3 random article URLs load over HTTPS | DONE: Vercel Hobby (free) project `seven-sins`, https://seven-sins-liard.vercel.app; home, 3 articles, `sins.json`, `robots.txt` return 200; `vercel.json` sets CSP, nosniff, Referrer-Policy, X-Frame-Options; HSTS from Vercel; page renders with clean console (2026-11-14) |

**Next up:** step 3 for the remaining non-Bible quotations in Greed, Envy, Gluttony, Wrath and Sloth (Buddhist suttas, Stoics, Aristotle, Plato, Augustine, Catechism, Aquinas). Sacred-texts.com blocks scripted fetches; Wikisource's `action=parse` API works with a User-Agent header. Fix the wording or drop the quotation marks if a quote can't be confirmed. Then the Lust leftovers (Catechism, suttas, Plato and Stoic points), then steps 8, 9, 10 and 12.

## 13. Release readiness checklist

**Content**
- [ ] 210/210 articles present, with Sources sections.
- [ ] Links checked; verification dates recorded in README.
- [ ] No unsourced or invented quotes.

**Site**
- [ ] Home page and every article URL render with a clean console.
- [ ] Mobile and dark mode checked.
- [ ] Error states checked.

**Security and supply chain**
- [ ] SRI or vendored `marked`.
- [ ] No secrets in git history.
- [ ] Security headers set at the host.

**Quality**
- [ ] axe and Lighthouse reports reviewed.
- [ ] README accurate.
- [ ] `LICENSE` present (MIT, already in repo).

**Deploy**
- [ ] Live URL smoke-tested over HTTPS.

## 14. Audit prompt for this repo

Paste into Claude Code when you want an independent check. Do not modify files in the first pass.

> Act as a content editor, front-end engineer and QA reviewer for this static site. Inspect the repo before making claims. Do not modify files, install dependencies or run destructive commands. Using PLAYBOOK.md as the checklist, report:
> 1. Structure: any missing, empty or unlisted article against `sins.json`.
> 2. Content: articles lacking a Sources section; quotes or verses you cannot trace to a cited source; claims that rank traditions; missing "related, not identical" notes.
> 3. Links: run a link checker and list broken ones with their file and line.
> 4. Front end: bugs, error-handling gaps, XSS and supply-chain risks, accessibility issues in `index.html`, `sin.html`, `style.css`.
> 5. Docs: places where README disagrees with the repo.
>
> For each finding give an ID, severity (P0-P3), file, evidence, why it matters, the recommended fix and how to verify it. Separate confirmed defects from possible risks. Then propose a fix plan by priority and wait for approval before changing anything.

**Final principle:** the project is done when every article exists, every claim is traceable to a source, the site works for keyboard and mobile users, and each of those facts is backed by evidence you can show.
