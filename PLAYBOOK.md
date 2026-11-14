# Sins: Engineering Playbook

A quality and completion checklist for this project, adapted from the general Vibecoding Engineering Playbook. It keeps only the parts that apply to a static, read-only site with Markdown articles, and adds content-accuracy checks, which matter most here.

**Core principle:** nothing is done because an AI agent says it is done. Mark an item PASS only with evidence (a command, a screenshot, a diff you read).

## 0. Project classification

| Property | Value |
|---|---|
| Type | Static content site (marketing/reference), no backend, no auth, no database, no user input |
| Stack | Plain HTML, CSS, JS. `marked` 4.3.0 from cdnjs renders Markdown in the browser |
| Content | 7 sins x 5 topics x 6 lenses = 210 articles (`<Sin>/<topic>/<lens>.md`), driven by `sins.json` |
| Hosting | Vercel Hobby (free), https://seven-sins-liard.vercel.app |
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
| All 7 sins written | PASS | 210/210 files present and non-empty, all 210 article URLs render at 360px and 768px |
| Links and DOIs | PARTIAL | 310 URLs checked 2026-11-14 (22 DOI 403s are bot-blocking). Re-run after content edits |
| Scripture and quote accuracy | PARTIAL | Pride and Lust checked; Greed/Gluttony Upanishads, philosophical lens and Christianity non-Bible items checked and fixed. Buddhist suttas, Evagrius and Aquinas still open (see step 3) |
| Security (XSS) | PARTIAL | `sin.html` renders `marked.parse(md)` through `innerHTML`; marked 4.x does not sanitize. Safe only while all Markdown is first-party. See 5 |
| Supply chain | PASS | `sin.html` loads `marked` 4.3.0 with a sha512 `integrity` hash that matches the cdnjs API value; page still renders it (checked in Chrome 2026-11-14) |
| SEO / social previews | PARTIAL | Meta description, Open Graph, Twitter card, favicon, canonical (home), `robots.txt` and `sitemap.xml` added. No `og:image`; social preview not tested |
| SEO of article content | FAIL (P2) | Articles load via `fetch` after page load and the URL uses a query string, so crawlers see an empty shell. Acceptable only if search traffic is not a goal |
| Error states | PASS | Styled `404.html` for unknown URLs on the live site. 404 shows "isn't written yet"; other failures show a retry message; `sins.json` failure handled on both pages. 404 and simulated network failure checked in Chrome 2026-11-14; `sins.json` failure path not exercised |
| Accessibility | PARTIAL | `aria-pressed` buttons, `aria-live`, focus outlines, heading order and contrast checked. axe-core 4.10.0 (wcag2a/2aa/21a/21aa/22aa plus best-practice) run 2026-11-14 on the home page, one article and the 404 page: 0 violations after adding a `<main>` landmark to `sin.html` and `404.html` (redeployed 2026-11-14; axe on the live article page: 0 violations). Lighthouse 12.8.2 (mobile emulation, local server) 2026-11-14: accessibility, best-practices and SEO 100 on home and an article; performance first 93 and 75 (CLS 0.164 and 0.817 from the footer and late-injected buttons), then 100 and 100 (CLS 0 and 0.037) after hiding the article and footer until content loads. Focus-visible rule covers buttons, cards and back link; pages show no horizontal overflow at 640px (same as 200% zoom on a 1280px screen); real keyboard-only walk-through not done |
| Tests / CI | FAIL (P2) | None. A small script can replace them (see 4) |
| Disclaimer on site | PASS | Footer on both pages |
| Docs | PASS | README covers run, layout, adding a sin, writing guidelines, sources |
| Stray file | UNKNOWN | `Inner-Battles.md` is not linked from the site or README. Decide: link it, move it, or remove it |

## 2. Content integrity (highest priority for this project)

### 2.1 Structure
- [x] Every sin in `sins.json` with `topics` has a folder named exactly its `id`.
- [x] Every topic folder has all six lens files, with no extras or typos.
- [x] No empty files (checked by script). Not checked: whether any file ends mid-sentence.
- [x] `sins.json` is valid JSON; every `tagline` is present and reads well.
- [x] No sin is left as "Coming soon" by accident.

### 2.2 Writing guidelines (from README)
- [ ] Each tradition is described on its own terms and not ranked.
- [x] Every article ends with a **Sources** section.
- [ ] Any claim about scripture, philosophy or research has a URL or book-and-verse reference.
- [ ] Unchecked points are flagged as "standard summary, not checked against a specific passage".
- [ ] Where a tradition has no exact equivalent (for example, Hinduism and gluttony or sloth), the article says "related, not identical".
- [ ] No fabricated quotes, statistics or studies. If a quote cannot be traced to a source, paraphrase it or remove it.
- [x] The Disclaimer (not medical, psychological or religious authority) stays on the site, not only in the README. It is in the footer of both pages.
- [ ] Sensitive topics (Lust, Gluttony) point to professional help where relevant, and avoid shaming language.
- [ ] Consistent terminology: "Buddhist" (lens name in `sins.json`) vs "Buddhism" (id and file names). Keep it deliberate.
- [ ] Spelling and grammar pass, one spelling convention throughout.

### 2.3 Verification process
1. Run the link checker (see 4) over all `.md` files.
2. Sample at least 2 articles per sin per lens and verify each quote and verse against its source.
3. Record in README the date, what was checked and what was not. Do not mark an article verified based on an agent summary.

## 3. Design and UI (P3 unless broken)

Existing foundation: `style.css` already uses `:root` tokens and a dark-mode media query, with a serif type stack.

- [x] Light and dark themes are both readable; check contrast of `--muted` on `--bg` (WCAG AA 4.5:1).
- [ ] Layout checked at 360px, 768px and 1280px widths, with no horizontal overflow (long Markdown tables and code blocks are the likely cause).
- [x] Topic and lens buttons wrap cleanly on mobile; touch targets are at least 44px.
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
- [x] **SRI:** add `integrity` and `crossorigin="anonymous"` to the `marked` script tag, or vendor the file into the repo. Either removes the cdnjs runtime dependency risk. Compute the hash from the file you actually verified.
- [x] Query parameters (`id`, `topic`, `lens`) are used only to look up entries in `sins.json`, never concatenated into a fetch path directly. Confirm this still holds after edits.
- [x] Security headers at the host (Vercel `vercel.json` or equivalent): `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a CSP allowing only `self` and `cdnjs.cloudflare.com` for scripts.
- [x] HTTPS enforced by the host.
- [x] No secrets, analytics tokens or personal data committed (pattern scan of `git log -p` found none; Gitleaks itself not run).
- [x] No tracking or cookies unless deliberately added; `localStorage` currently stores only the chosen lens, wrapped in try/catch.

## 6. Functional checks

- [ ] `index.html` lists all 7 sins and every card links to a working `sin.html?id=...`.
- [x] Every one of the 210 `sin.html?id=<Sin>&topic=<topic>&lens=<lens>` URLs renders (script-checkable).
- [ ] Unknown `id`, `topic` or `lens` in the URL falls back gracefully (unknown id shows "Not found"; unknown topic and lens default).
- [ ] Back/forward and refresh: the URL updates with `replaceState`, so the back button leaves the page rather than stepping through tabs. Decide whether that is intended.
- [ ] Copy a deep link, open it in a new tab: same article loads.
- [ ] Remembered lens persists across sins and survives `localStorage` being blocked.
- [x] Distinguish error cases: 404 file ("not written yet") vs network or JSON failure ("could not load, retry"). Add an error message to `index.html`.
- [ ] Loading state works and does not flash incorrectly.
- [ ] Open the site from `file://` and confirm the README's explanation (fetch blocked) is accurate; consider a visible hint.

## 7. SEO and sharing (do only if discoverability matters)

- [x] Unique `<title>` and meta description per page. `sin.html` already sets a title per sin; add the topic and lens.
- [ ] Canonical URL, Open Graph (title, description, image) and Twitter card.
- [x] `robots.txt` and `sitemap.xml` listing the pages.
- [ ] Articles are rendered client-side, so search engines may index little. Options if this matters: pre-render the Markdown to static HTML at build time (one HTML page per article), or accept the limitation and note it here.
- [x] Favicon.
- [x] `lang="en"` is already set.

## 8. Accessibility (target WCAG 2.2 AA)

- [x] Lens switcher: either implement the full tab pattern (`aria-controls`, `tabpanel`, arrow keys, roving `tabindex`) or drop `role="tab"` and use buttons with `aria-pressed`.
- [x] Topic buttons expose the current state (`aria-pressed` or `aria-current`).
- [x] Loading and error messages are announced (`aria-live="polite"` on the article region).
- [x] Heading hierarchy: one `h1` per page, `h2` for the topic, article headings below it (the article injects `<h2>` and Markdown may include another `h1`; check).
- [ ] Link text in articles is descriptive; external links are clearly marked.
- [x] Colour contrast passes in light and dark themes.
- [ ] Page works with keyboard only and at 200% zoom.

## 9. Performance

Measure first; the site is small.

- [x] Lighthouse on the home page and a sample article: LCP <= 2.5s, CLS <= 0.1, INP <= 200ms. Local run: LCP 0.9s and 1.6s, CLS 0 and 0.037, TBT 0 ms (INP not measured). Live URL after redeploy (2026-11-14): home performance 100 (LCP 0.8s, CLS 0, TBT 40 ms); article 99 (LCP 1.8s, CLS 0, TBT 0 ms); accessibility, best-practices and SEO 100 on both.
- [ ] Each article is a separate small `fetch` (about 1 to 2 KB each); confirm no waterfall beyond `sins.json` then article.
- [ ] `marked` is the only third-party script; consider `defer`, or vendoring to remove the extra origin.
- [x] Cache headers for `.md` and `sins.json` at the host.

## 10. Code quality and maintainability

- [ ] `sin.html` and `index.html` stay small; extract a shared JS file only if duplication grows.
- [ ] HTML escaping: titles and taglines from `sins.json` are interpolated into `innerHTML`. They are first-party, but escape them or use `textContent` if the data ever becomes external.
- [ ] No dead code, unused CSS or unused files.
- [ ] README stays in sync with reality (status table, layout, sources). Update it whenever content or structure changes.
- [ ] `sins.json` is the single source of truth for sins, topics and lenses.
- [x] Commit messages follow CLAUDE.md: short imperative subject, optional body, no AI attribution lines.

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
| 3 | Quote and verse verification pass for Lust, Greed, Envy, Gluttony, Wrath, Sloth (Pride already done) | P0 | Each checked item recorded in README with date | IN PROGRESS: Pride done earlier. Lust: quotes and Gita claims checked. Other five sins: Bible quotes spot-checked (NRSV, match). Greed and Gluttony Upanishad quotes checked against Müller on Wikisource (Isha lines fixed). Philosophical-lens quotes in Greed, Envy, Gluttony, Wrath and Sloth checked by script against MIT Classics, Wikisource, Perseus and Gutenberg; five wording errors fixed. Christianity non-Bible items checked (Catechism, Augustine; three fixes). Buddhist second pass: Dhammapada 3-5, 74, 177, 186-187, 280, 355, 365 (Buddharakkhita) and DN16, SN 7.2, SN 3.13, AN 7.61, SN 45.2 (Sujato) checked; DN16 line, two stories and Dhp 5/365 wording fixed. MN 2, SN 1.71, AN 7.64, SN 46.51, AN 3.39, AN 3.61 also checked (three wording fixes); the remaining "from memory" Buddhist summaries (suttas cited in text now all checked for number, title and point), Lust Catechism and Plato/Aristotle/Epictetus points checked; Aquinas references read at New Advent (OK); Evagrius checked against Dysinger translation (no chapter number on page); Gregory Moralia only via Aquinas |
| 4 | Sources section present in all articles; unchecked points labelled | P1 | `grep -L "Sources"` over articles returns nothing | DONE: every article has a Sources heading (Lust root-causes/modern notes none cited) |
| 5 | Add SRI to `marked` (or vendor it) | P2 | Page still renders; browser console clean | DONE: sha512 integrity matches cdnjs; renders in Chrome |
| 6 | Decide on `Inner-Battles.md` (link, move or delete) | P2 | Decision recorded in README | PARKED by user |
| 7 | Error states: distinguish 404 from network/JSON failure; handle `sins.json` failure on the home page | P2 | Verified by blocking the request in DevTools | DONE: 404 and network failure checked; `sins.json` failure path not exercised |
| 8 | Accessibility fixes (tabs pattern, live region, headings, contrast) | P2 | axe reports 0 serious issues on sampled pages | PARTIAL: aria-pressed, aria-live, focus outlines added; heading order (h1, h2) and contrast checked; axe-core run on home, one article (before and after a topic switch) and 404: 0 violations after the `<main>` fix; Lighthouse accessibility 100 on home and an article; axe on the live article page 0 violations after redeploy |
| 9 | Responsive and dark-mode check at 360 / 768 / 1280px | P3 | Screenshots reviewed, no overflow | PARTIAL: 1280px dark and light-mode screenshots of an article reviewed 2026-11-14 (no clipping, buttons wrap cleanly, contrast fine); home at 1280px dark reviewed; all 210 article URLs and index.html load at 360px and 768px with no horizontal overflow (checked in Chrome via iframes, 2026-11-14); light and dark contrast pass AA (computed ratios, lowest 5.35:1); touch targets raised to 44px; no screenshot review at 1280px or of light mode |
| 10 | SEO basics: meta, OG, robots, sitemap, favicon | P2 | Tags present in page source; social preview tested | PARTIAL: description, Open Graph, Twitter card, favicon, canonical and `og:url` on the home page, per-article title/description/`og:url`, `robots.txt` and `sitemap.xml` (home plus 7 sins) added. No `og:image`; social preview not tested; the vercel.app domain is a placeholder if a custom domain is added later |
| 11 | Footer disclaimer on the site | P2 | Visible on both pages | DONE: footer on both pages |
| 12 | Deploy (for example Vercel), add security headers, smoke test the live URL | P2 | Home and 3 random article URLs load over HTTPS | DONE: Vercel Hobby (free) project `seven-sins`, https://seven-sins-liard.vercel.app; home, 3 articles, `sins.json`, `robots.txt` return 200; `vercel.json` sets CSP, nosniff, Referrer-Policy, X-Frame-Options; HSTS from Vercel; page renders with clean console (2026-11-14) |

**Next up:** finish step 3: check the other Buddhist articles still noted "from memory" with the `bilarasuttas` API (`https://suttacentral.net/api/bilarasuttas/<uid>/sujato?lang=en`), then any remaining paraphrase-only summaries (Kant in Lust, a few Buddhist summaries). After that: a real keyboard-only walk-through, and an `og:image` plus social preview test (step 10).

## 13. Release readiness checklist

**Content**
- [x] 210/210 articles present, with Sources sections.
- [x] Links checked; verification dates recorded in README.
- [ ] No unsourced or invented quotes.

**Site**
- [ ] Home page and every article URL render with a clean console.
- [ ] Mobile and dark mode checked.
- [x] Error states checked.

**Security and supply chain**
- [x] SRI or vendored `marked`.
- [x] No secrets in git history (pattern scan only; Gitleaks not run).
- [x] Security headers set at the host.

**Quality**
- [ ] axe and Lighthouse reports reviewed.
- [ ] README accurate.
- [x] `LICENSE` present (MIT, already in repo).

**Deploy**
- [x] Live URL smoke-tested over HTTPS.

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
