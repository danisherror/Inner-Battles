# Sins: Engineering Playbook

A quality and completion checklist for this project, adapted from the general Vibecoding Engineering Playbook. It keeps only the parts that apply to a static, read-only site with Markdown articles, and adds content-accuracy checks, which matter most here.

**Core principle:** nothing is done because an AI agent says it is done. Mark an item PASS only with evidence (a command, a screenshot, a diff you read).

## 0. Project classification

| Property | Value |
|---|---|
| Type | Static content site (marketing/reference), no backend, no auth, no database, no user input |
| Stack | Plain HTML and CSS. `build.js` renders the Markdown to static HTML with `marked` 4.3.0 at build time (generated pages are committed) |
| Content | 7 sins + 2 inner battles (Procrastination, Overthinking) = 9 entries x 5 topics x 6 lenses = 270 articles (`<Entry>/<topic>/<lens>.md`), driven by `sins.json`; more inner battles are planned in `Inner-Battles.md` |
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
| Scripture and quote accuracy | PARTIAL | Pride and Lust checked; Greed/Gluttony Upanishads, philosophical lens, Christianity non-Bible items, cited Buddhist suttas, Evagrius (Dysinger) and Aquinas (New Advent) checked and fixed. Still open: the remaining "from memory" Buddhist summaries, the Kant point in Lust, and Gregory's *Moralia* (only seen via Aquinas); see step 3 |
| Security (XSS) | PARTIAL | Markdown is rendered at build time by `build.js` (marked 4.x, no sanitizer); `sin.html` no longer runs `marked` in the browser. Hostile Markdown passes through unchanged, so this is safe only while all Markdown is first-party. Open until a sanitizing step is added or contributions are ruled out. See 5 |
| Supply chain | PASS | `sin.html` loads `marked` 4.3.0 with a sha512 `integrity` hash that matches the cdnjs API value; page still renders it (checked in Chrome 2026-11-14) |
| SEO / social previews | PARTIAL | Meta description, Open Graph, Twitter card, favicon, canonical, `robots.txt` and `sitemap.xml` (211 URLs) added; every pre-rendered article page has its own title, description, canonical and Open Graph tags. `og.png` (1200x630) and `summary_large_image` Twitter card added 2026-11-14; live tags and image fetched with Facebook and Twitter crawler user agents (200, image/png). Platform preview tools (login required) not used; per-article previews not checked in them |
| SEO of article content | PASS (P2) | `build.js` pre-renders all 210 articles to static `<Sin>/<topic>/<lens>.html`, linked from `index.html` and listed in the sitemap; old `sin.html?id=...` links redirect. Not checked: what Google actually indexes |
| Error states | PASS | Styled `404.html` for unknown URLs on the live site. 404 shows "isn't written yet"; other failures show a retry message; `sins.json` failure handled on both pages. 404 and simulated network failure checked in Chrome 2026-11-14; `sins.json` failure path not exercised |
| Accessibility | PARTIAL | `aria-pressed` buttons, `aria-live`, focus outlines, heading order and contrast checked. axe-core 4.10.0 (wcag2a/2aa/21a/21aa/22aa plus best-practice) run 2026-11-14 on the home page, one article and the 404 page: 0 violations after adding a `<main>` landmark to `sin.html` and `404.html` (redeployed 2026-11-14; axe on the live article page: 0 violations). Lighthouse 12.8.2 (mobile emulation, local server) 2026-11-14: accessibility, best-practices and SEO 100 on home and an article; performance first 93 and 75 (CLS 0.164 and 0.817 from the footer and late-injected buttons), then 100 and 100 (CLS 0 and 0.037) after hiding the article and footer until content loads. Focus-visible rule covers buttons, cards and back link; pages show no horizontal overflow at 640px (same as 200% zoom on a 1280px screen); real keyboard-only walk-through not done |
| Tests / CI | FAIL (P2) | None. A small script can replace them (see 4) |
| Disclaimer on site | PASS | Footer on both pages |
| Docs | PASS | README covers run, layout, adding a sin, writing guidelines, sources |
| Inner battles | PARTIAL | Decided 2026-11-14: `sins.json` has a `kind` field (`sin` or `inner-battle`), the home page has a separate section, `Inner-Battles.md` is the plan (19 topics, phased). Pilot Procrastination and phase 1 Overthinking written (60 articles); quotes read against sources, research claims only via abstracts; not checked in a browser. Rest of phase 1 and phases 2-4 not started |

## 2. Content integrity (highest priority for this project)

### 2.1 Structure
- [x] Every sin in `sins.json` with `topics` has a folder named exactly its `id`.
- [x] Every topic folder has all six lens files, with no extras or typos.
- [x] No empty files (checked by script). Not checked: whether any file ends mid-sentence.
- [x] `sins.json` is valid JSON; every `tagline` is present and reads well.
- [x] No sin is left as "Coming soon" by accident.

### 2.2 Writing guidelines (from README)
- [x] Each tradition is described on its own terms and not ranked. Checked 2026-11-14 by keyword scan of all 210 articles, not by reading each one. Searched for ranking words ("better than", "superior", "primitive", "mistaken", "falls short" and similar): every hit was a comparison inside one tradition's own text (for example Gita 3.8 "action is better than inaction", Buddhist *mana* as comparing oneself with others) or a modern-lens self-help point, none a comparison between traditions. Searched each lens for mentions of the other lenses: the Christianity articles name no other tradition, and the only cross-tradition mentions elsewhere are neutral clarifications (Buddhist gluttony is "a training rule, not a sin in the Christian sense"; Hinduism and the Upanishads have "no single word equal to" gluttony; Lust/philosophical notes that Augustine also fits the Christianity lens). Searched non-Christian articles for "sin": every use is either a Gita quotation or an explicit "not a sin" note, so the Christian frame is not imposed. Not checked: tone and emphasis, which a keyword scan cannot show. The "modern" lens sometimes says "the sin is...", which is the site's own framing rather than a ranking.
- [x] Every article ends with a **Sources** section.
- [ ] Any claim about scripture, philosophy or research has a URL or book-and-verse reference. Partly checked 2026-11-14, by script, structure only: all 210 articles have a **Sources** section; 202 list at least one URL (692 in total) and the other 8 are modern-lens illustrative composites or the Lust root-causes summary, each saying no study is cited. Not done: matching each claim in an article body to a specific source, so the item stays open.
- [ ] Unchecked points are flagged as "standard summary, not checked against a specific passage". Partly checked 2026-11-14, by script: 152 of 210 Sources sections contain wording of this kind ("from memory", "not compared", "standard across", "illustrative composite"). Of the other 58, most state what was checked instead (for example Upanishad verses against Müller), which says which points were verified but not which were not. 12 have no note after the link list: Lust/effects, how-to-overcome, what-it-is (modern), Lust/what-it-is/philosophical, Lust/root-causes/christianity, and the seven modern stories (which are labelled composites). Open until each of the 58 says what was left unchecked.
- [x] Where a tradition has no exact equivalent (for example, Hinduism and gluttony or sloth), the article says "related, not identical". Checked 2026-11-14 by reading the opening of every Hinduism, Upanishads and philosophical what-it-is article for Gluttony and Sloth, and the Upanishads ones for the other sins. Gluttony and Sloth in Hinduism and the Upanishads already said it (the Gluttony Hinduism story too). Added the line to the Upanishads what-it-is articles for Envy, Wrath, Pride and Lust, which said "no single word" or "rarely name" but not that the match is partial; `npm run render` rebuilt the four pages and `npm run check` passes. Judgement call: Buddhism, Christianity and the philosophical lens have direct terms for every sin and were left alone; Greed in the Upanishads (Isha 1) was treated as a direct match.
- [ ] No fabricated quotes, statistics or studies. If a quote cannot be traced to a source, paraphrase it or remove it.
- [x] The Disclaimer (not medical, psychological or religious authority) stays on the site, not only in the README. It is in the footer of both pages.
- [ ] Sensitive topics (Lust, Gluttony) point to professional help where relevant, and avoid shaming language.
- [x] Consistent terminology: "Buddhist" (lens name in `sins.json`) vs "Buddhism" (id and file names). Keep it deliberate. Decided 2026-11-14: it was not deliberate, since the sibling lenses (Hinduism, Christianity) are named after the tradition. The `sins.json` lens name is now "Buddhism", matching the `buddhism` id and file names; "Buddhist" stays only as an adjective ("Buddhist texts", 6 uses). Rule added to the README writing guidelines. `npm run render` rebuilt all 212 pages (the lens button and page titles changed) and `npm run check` passes. Not checked in a browser.
- [ ] Spelling and grammar pass, one spelling convention throughout. Partly done 2026-11-14, by script, because no spell checker is installed: (1) Convention: the articles are overwhelmingly British (practise 16, honour 15, behaviour 8, programme 6, recognised, summarised), so that is the rule. The American forms that remain are all in quotations, titles or names (NRSV "realized" and "honored", Piff et al. "behavior", *Physiology & Behavior*, World Health Organization); "judgment" (13) and "toward" are accepted in British usage and left. (2) "wellbeing" (3) vs "well-being" (4): all set to "well-being". (3) Every word of all 210 articles was checked against `/usr/share/dict` (US spellings, with UK variants mapped); of 484 unknown words, all were Sanskrit, Pali, Greek or Latin terms, names, contractions, URL remnants or irregular forms the word list lacks (for example "woken", "began", "laptop"); no typos. (4) Scripted checks found no repeated words, no doubled spaces and no space before punctuation, and no "a hour" or "an unique" article errors. Not done: a read-through for grammar and style; the checks cannot catch a wrong but real word ("form" for "from"). The Sanskrit and Pali transliterations (for example "Doṇapāka" vs "Donapaka") were not checked for a single scheme.

### 2.3 Verification process
1. Run the link checker (see 4) over all `.md` files.
2. Sample at least 2 articles per sin per lens and verify each quote and verse against its source.
3. Record in README the date, what was checked and what was not. Do not mark an article verified based on an agent summary.

## 3. Design and UI (P3 unless broken)

Existing foundation: `style.css` already uses `:root` tokens and a dark-mode media query, with a serif type stack.

- [x] Light and dark themes are both readable; check contrast of `--muted` on `--bg` (WCAG AA 4.5:1).
- [x] Layout checked at 360px, 768px and 1280px widths, with no horizontal overflow (long Markdown tables and code blocks are the likely cause). Checked 2026-11-14: `index.html`, `404.html` and all 210 article pages (7 sins × 5 topics × 6 lenses) have `scrollWidth` equal to the viewport width at all three widths. No article contains a table or code block today, so the `style.css` has no rules for them; add overflow handling when the first one appears.
- [x] Topic and lens buttons wrap cleanly on mobile; touch targets are at least 44px.
- [x] Visible keyboard focus on cards and buttons. Checked 2026-11-14 in Chrome (dark theme, local server) by tabbing: the home page cards and, on an article page, the back link and all 5 topic and 6 lens links (including the current ones) match `:focus-visible` and show a 2px solid `--accent` outline with a 2px offset. The light theme was not tested in the browser; its `--accent` is `#8b2e2e` on `#faf7f2`.
- [x] Markdown elements (tables, blockquotes, lists, links) are styled consistently. `style.css` styles `article.md` h2/h3, lists, links, blockquotes, tables (scroll inside the block), inline code, code blocks, hr and images. Not yet checked in the browser against a real table or blockquote, since no article has one.
- [x] Respect `prefers-reduced-motion` if any transitions are added. The only transition is the card hover; it is disabled under `prefers-reduced-motion: reduce`.
- [x] Spacing and radius values use tokens instead of one-off numbers. `--space-1`..`--space-7` and `--radius-sm`/`--radius`/`--radius-pill` in `:root`. One-off values were snapped to the nearest token, so some gaps shift by 1-4px. Border widths, the 44px touch target and max-widths stay literal.

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

- [ ] **XSS:** `marked.parse` output is written into the static pages unsanitized at build time. Today all Markdown is first-party, so the risk is low. If articles ever come from contributors or another source, add DOMPurify. Test by adding `<script>` and `<img onerror>` to a scratch article and confirming the outcome. Tested 2026-11-14 by running `marked` 4.3.0 with the `build.js` link renderer on hostile Markdown (not by building a scratch article, so no page was rendered in a browser): `<script>alert(1)</script>` and `<img src=x onerror=alert(2)>` pass through verbatim, and `[click](javascript:alert(3))` becomes `<a href="javascript:alert(3)">` because the renderer only special-cases `http(s)` links. Inline code and the `![i](x" onerror=...)` attribute-breakout attempt were escaped or left as text. The CSP has `script-src 'unsafe-inline'`, so it would not block the inline script. Result: unsafe for untrusted Markdown, fine while every article is first-party. Left open until a sanitizing step is added or contributions are ruled out.
- [x] **SRI:** add `integrity` and `crossorigin="anonymous"` to the `marked` script tag, or vendor the file into the repo. Either removes the cdnjs runtime dependency risk. Compute the hash from the file you actually verified. Moot since 2026-11-14: `marked` no longer loads in the browser.
- [x] Query parameters (`id`, `topic`, `lens`) are used only to look up entries in `sins.json`, never concatenated into a fetch path directly. Confirm this still holds after edits.
- [x] Security headers at the host (Vercel `vercel.json` or equivalent): `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a CSP allowing only `self` (and inline scripts) for scripts; cdnjs was removed from the CSP when `marked` stopped loading in the browser.
- [x] HTTPS enforced by the host.
- [x] No secrets, analytics tokens or personal data committed (pattern scan of `git log -p` found none; Gitleaks itself not run).
- [x] No tracking or cookies unless deliberately added; `localStorage` currently stores only the chosen lens, wrapped in try/catch.

## 6. Functional checks

- [x] `index.html` lists all 7 sins and every card links to a working `sin.html?id=...`. Checked 2026-11-14 by running the `index.html` script against `sins.json` in a Node sandbox: 7 enabled cards, none marked "Coming soon", each linking to `sin.html?id=<Sin>` with an `id` that exists in `sins.json`, and all 30 article files present per sin. `sin.html` returned HTTP 200 for each id from `python3 -m http.server`. Not checked in a real browser (the local server for that was not allowed to run in the background), so the rendered DOM and click-through are unconfirmed.
- [x] Every one of the 210 `sin.html?id=<Sin>&topic=<topic>&lens=<lens>` URLs renders (script-checkable).
- [x] Unknown `id`, `topic` or `lens` in the URL falls back gracefully (unknown id shows "Not found"; unknown topic and lens default). Checked 2026-11-14 in Chrome against https://seven-sins-liard.vercel.app (the deployed site, not a local server): `id=Nope` showed "Not found" / "That sin isn't available yet."; `id=Pride&topic=bogus&lens=bogus` rendered "What it is" in the Modern lens and the URL was rewritten to valid values.
- [x] Back/forward and refresh: the URL updates with `replaceState`, so the back button leaves the page rather than stepping through tabs. Checked 2026-11-14 in Chrome against https://seven-sins-liard.vercel.app (the deployed site, not a local server): switching lens added no history entries, and refresh keeps the selection from the URL. Decision: keep `replaceState` (each tab click is a view change inside one page, not navigation); switch to `pushState` plus a `popstate` handler only if stepping back through tabs is wanted.
- [x] Copy a deep link, open it in a new tab: same article loads. Checked 2026-11-14 in Chrome against https://seven-sins-liard.vercel.app (the deployed site, not a local server): `id=Wrath&topic=what-it-is&lens=upanishads` in a fresh tab selected the same topic and lens and loaded the Upanishads article.
- [x] Remembered lens persists across sins and survives `localStorage` being blocked. Checked 2026-11-14 in Chrome against https://seven-sins-liard.vercel.app (the deployed site, not a local server): chose Buddhism on Pride, opened `id=Greed&topic=what-it-is` with no `lens`, and Buddhism was selected. Blocked storage was simulated by making the `localStorage` getter throw, after which `store.get`/`store.set` returned null / did nothing without throwing; a full page load with storage blocked was not run.
- [x] Distinguish error cases: 404 file ("not written yet") vs network or JSON failure ("could not load, retry"). Add an error message to `index.html`.
- [x] Loading state works and does not flash incorrectly. Read from the code on 2026-11-14, not observed in a browser: `body.pending` hides `#article` and the footer until the first fetch settles (success or failure both call `ready()`); on a tab or lens switch the article shows "Loading..." in place. A real-browser pass with network throttling is still open. Superseded 2026-11-14: pages are pre-rendered, so there is no loading state any more.
- [x] Open the site from `file://` and confirm the README's explanation (fetch blocked) is accurate; consider a visible hint. Source for the claim: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSRequestNotHttp (MDN says `fetch` to a `file:///` URL fails). Added a `file:` hint to the error path of `index.html` and `sin.html`, and cited the source in the README. Not run from `file://` in a browser: the Chrome extension cannot open `file://` URLs. Superseded 2026-11-14: the pages no longer use `fetch`, so `file://` works; the hint was removed with the `fetch` code.

## 7. SEO and sharing (do only if discoverability matters)

- [x] Unique `<title>` and meta description per page. `sin.html` already sets a title per sin; add the topic and lens.
- [x] Canonical URL, Open Graph (title, description, image) and Twitter card (home page canonical only; article pages share generic Open Graph text because the tags are set by JS).
- [x] `robots.txt` and `sitemap.xml` listing the pages.
- [x] Articles were rendered client-side, so search engines may index little. Done 2026-11-14: `build.js` pre-renders each article to `<Sin>/<topic>/<lens>.html` (210 pages, each with its own title, description, canonical URL and Open Graph tags), and `index.html` links to them directly. `sitemap.xml` lists all 211 URLs. Old `sin.html?id=...` links redirect to the matching page. Checked by script: every `href`/`src` in the 213 generated pages resolves to an existing file, each article page has one `h1`, the redirect and lens scripts behave as intended for valid, bogus, `constructor` and path-like inputs, and `npm run check` reports no stale files. Not checked: the pages in a real browser, the Vercel deployment, or what Google actually indexes after the change.
- [x] Favicon.
- [x] `lang="en"` is already set.

## 8. Accessibility (target WCAG 2.2 AA)

- [x] Lens switcher: either implement the full tab pattern (`aria-controls`, `tabpanel`, arrow keys, roving `tabindex`) or drop `role="tab"` and use buttons with `aria-pressed`.
- [x] Topic buttons expose the current state (`aria-pressed` or `aria-current`).
- [x] Loading and error messages are announced (`aria-live="polite"` on the article region).
- [x] Heading hierarchy: one `h1` per page, `h2` for the topic, article headings below it (the article injects `<h2>` and Markdown may include another `h1`; check).
- [x] Link text in articles is descriptive; external links are clearly marked. Done 2026-11-14: `build.js` now renders every `http(s)` link in an article with a `↗` marker (CSS), a visually hidden " (external link)" and `rel="noopener"`; links whose text was the bare URL (the SuttaCentral API notes) show the host name instead. Checked by script: no article link reads "here", "link" or "read more", and all 210 pages regenerate cleanly. Not viewed in a browser.
- [x] Colour contrast passes in light and dark themes.
- [x] Page works with keyboard only and at 200% zoom. Checked 2026-11-14 in Chrome against https://seven-sins-liard.vercel.app/Wrath/root-causes/buddhism.html after the external-link change was deployed: 18 focusable elements in a sensible order (back link, topics, lenses, then sources), no positive `tabindex`, and every one has a visible focus indicator (computed outline or shadow). Zoom was emulated by narrowing the window to 584 CSS px (about 240% of the 1414 px default), because the extension cannot send zoom shortcuts: no horizontal scroll and no overflowing element; the screenshot shows the article text and external-link markers intact. Not done: real Tab key presses through the page, a screen reader, and the 320 px (400%) reflow case. The live external-link markup was confirmed: 6 links, none with bare-URL text, all `rel="noopener"`, `↗` marker and hidden "(external link)" present.

## 9. Performance

Measure first; the site is small.

- [x] Lighthouse on the home page and a sample article: LCP <= 2.5s, CLS <= 0.1, INP <= 200ms. Local run: LCP 0.9s and 1.6s, CLS 0 and 0.037, TBT 0 ms (INP not measured). Live URL after redeploy (2026-11-14): home performance 100 (LCP 0.8s, CLS 0, TBT 40 ms); article 99 (LCP 1.8s, CLS 0, TBT 0 ms); accessibility, best-practices and SEO 100 on both.
- [x] Each article is a separate small `fetch` (about 1 to 2 KB each); confirm no waterfall beyond `sins.json` then article. Moot 2026-11-14: articles are static pages, with no `fetch` at all.
- [x] `marked` is the only third-party script; consider `defer`, or vendoring to remove the extra origin. Moot 2026-11-14: no third-party script remains; `marked` runs only in `build.js`.
- [x] Cache headers for `.md` and `sins.json` at the host.

## 10. Code quality and maintainability

- [x] `sin.html` and `index.html` stay small; extract a shared JS file only if duplication grows. Checked 2026-11-14: `index.html` is 48 lines (3.4 KB) and `sin.html` 30 lines (1.9 KB), each with one inline script. The only overlap is a guarded `localStorage` read of `lens` and the lens id list, both generated from `sins.json`; no shared file extracted. Revisit if a third page needs the same script.
- [x] HTML escaping: titles and taglines from `sins.json` are interpolated into `innerHTML`. They are first-party, but escape them or use `textContent` if the data ever becomes external. Done 2026-11-14: `build.js` escapes titles and taglines with `esc`.
- [x] No dead code, unused CSS or unused files. Done 2026-11-14: removed unused rules (`.card .v`, `article h1`, `.tag`, `.virtue`, `.practice`, `nav.pager`) and the unused `connect-src` CSP directive; `Inner-Battles.md` is the one unlinked file, parked by the user (see item 6).
- [x] README stays in sync with reality (status table, layout, sources). Update it whenever content or structure changes. Layout section updated 2026-11-14 to list every tracked top-level file.
- [x] `sins.json` is the single source of truth for sins, topics and lenses. Done 2026-11-14: `build.js` now derives the lens list, lens count and sin names in meta text from `sins.json` instead of hardcoding them. The README's lens list and the "seven" and "six" in prose are still hand-written.
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
| 6 | Decide on `Inner-Battles.md` (link, move or delete) | P2 | Decision recorded in README | DONE 2026-11-14: kept as the plan for the inner-battles section, not linked; retire or link it once those topics are on the site (recorded in README) |
| 7 | Error states: distinguish 404 from network/JSON failure; handle `sins.json` failure on the home page | P2 | Verified by blocking the request in DevTools | DONE: 404 and network failure checked; `sins.json` failure path not exercised |
| 8 | Accessibility fixes (tabs pattern, live region, headings, contrast) | P2 | axe reports 0 serious issues on sampled pages | PARTIAL: aria-pressed, aria-live, focus outlines added; heading order (h1, h2) and contrast checked; axe-core run on home, one article (before and after a topic switch) and 404: 0 violations after the `<main>` fix; Lighthouse accessibility 100 on home and an article; axe on the live article page 0 violations after redeploy |
| 9 | Responsive and dark-mode check at 360 / 768 / 1280px | P3 | Screenshots reviewed, no overflow | PARTIAL: 1280px dark and light-mode screenshots of an article reviewed 2026-11-14 (no clipping, buttons wrap cleanly, contrast fine); home at 1280px dark reviewed; all 210 article URLs and index.html load at 360px and 768px with no horizontal overflow (checked in Chrome via iframes, 2026-11-14); light and dark contrast pass AA (computed ratios, lowest 5.35:1); touch targets raised to 44px; no screenshot review at 1280px or of light mode |
| 10 | SEO basics: meta, OG, robots, sitemap, favicon | P2 | Tags present in page source; social preview tested | PARTIAL: description, Open Graph, Twitter card, favicon, canonical and `og:url` on the home page, per-article title/description/`og:url`, `robots.txt` and `sitemap.xml` (211 URLs) added. `og.png` and large Twitter card added and checked live with crawler user agents; per-article pages carry their own tags since pre-rendering; platform preview tools not used; the vercel.app domain is a placeholder if a custom domain is added later |
| 11 | Footer disclaimer on the site | P2 | Visible on both pages | DONE: footer on both pages |
| 12 | Deploy (for example Vercel), add security headers, smoke test the live URL | P2 | Home and 3 random article URLs load over HTTPS | DONE: Vercel Hobby (free) project `seven-sins`, https://seven-sins-liard.vercel.app; home, 3 articles, `sins.json`, `robots.txt` return 200; `vercel.json` sets CSP, nosniff, Referrer-Policy, X-Frame-Options; HSTS from Vercel; page renders with clean console (2026-11-14) |

**Note on counts (2026-11-14):** the audit figures in this file (210 articles, 212 pages, 310 URLs and so on) were taken before Procrastination was added; the site now has 270 articles and 273 generated pages. Re-run the checks over the new pages before the next release; `npm run check` and the structure check pass.

**Next up:** finish step 3: check the other Buddhist articles still noted "from memory" with the `bilarasuttas` API (`https://suttacentral.net/api/bilarasuttas/<uid>/sujato?lang=en`), then any remaining paraphrase-only summaries (Kant in Lust, a few Buddhist summaries). After that: label what was left unchecked in the 58 Sources sections (2.2), a real keyboard-only walk-through, a check in the platforms' own preview tools (step 10), and a decision on a sanitizer for the XSS item (5).

## 13. Release readiness checklist

**Content**
- [x] 210/210 articles present, with Sources sections.
- [x] Links checked; verification dates recorded in README.
- [ ] No unsourced or invented quotes. Still open, 2026-11-14: 259 quoted passages sit in 133 articles. The verification record in the README covers Bible, Upanishad, Catechism, Dhammapada, the cited suttas and the philosophical-lens texts, but no one-to-one list of quote against source exists, so "none invented" is not yet shown. The only quotes in articles with no link are dialogue in five modern-lens stories, each labelled an illustrative composite.

**Site**
- [x] Home page and every article URL render with a clean console. Checked 2026-11-14 against https://seven-sins-liard.vercel.app: all 212 pages (home, 404 and 210 articles) fetched with HTTP 200, one `h1` each (404 excepted), a title, no inline handlers, and every local `href`/`src` returns 200. The console was read in Chrome only for the home page and `Wrath/root-causes/buddhism.html`: no messages. The other pages were not opened one by one, because `X-Frame-Options: DENY` blocks iframe loading. The pages carry one tiny script and the CSP blocks everything else. Found and fixed: a literal `<uid>` in 12 Buddhist articles was parsed as an HTML tag and vanished from the text; it is now in a code span.
- [x] Mobile and dark mode checked. 360/768/1280px overflow check on all pages and the AA contrast results are recorded in section 6; 2026-11-14 a Chrome screenshot of a live article in dark mode at 570px (the smallest the window goes) shows wrapped buttons, no clipping and readable text. Not checked: a real phone, or the light theme at phone width.
- [x] Error states checked.

**Security and supply chain**
- [x] SRI or vendored `marked`.
- [x] No secrets in git history (pattern scan only; Gitleaks not run).
- [x] Security headers set at the host.

**Quality**
- [x] axe and Lighthouse reports reviewed. Run 2026-11-14 on the local build (axe-core 4.14.0 through puppeteer-core, Lighthouse 12.8.2, both from the npx cache, nothing added to the repo): axe on all 212 pages at 375px in light and dark, 0 violations, 0 console warnings or errors, no horizontal overflow. Lighthouse on the home page, `Wrath/root-causes/buddhism.html` and `Lust/what-it-is/modern.html`: performance, accessibility, best practices and SEO all 100; LCP 0.8s, CLS 0, TBT 0ms. The remaining Lighthouse notes (compression, cache TTL, render-blocking `style.css`) come mostly from the Python dev server; Lighthouse was not re-run on the live URL after these changes. Two defects found and fixed along the way: the `<uid>` code span overflowed at 375px on 12 pages (`overflow-wrap: anywhere` on `code`), and `404.html` had no favicon, so the browser's `/favicon.ico` request logged a 404 in the console.
- [x] README accurate. Read against the repo 2026-11-14: status table, run and render commands, layout and the add-a-sin steps match (`npm run check` passes). Fixed: the layout now lists `LICENSE` and `.gitignore`; a sentence saying Lust Catechism, suttas and Plato/Stoic points were unread contradicted later text and was removed; "Sources used so far" now names SuttaCentral, the Vatican Catechism, Wikisource, MIT Classics and New Advent, which the verification notes already relied on. Not changed: the Kant point and "from memory" Buddhist summaries are still listed as unverified.
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
