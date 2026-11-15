# Frontend to-do

Things we can still do on the frontend, written 2026-11-15 from a read of the code (`build.js`, `style.css`, the five scripts, `vercel.json` and a few generated pages). Nothing here was checked in a browser; items that need a look before any work are marked "check first".

Already in place, so not listed below: pre-rendered pages that work without JavaScript, six themes, article search on the home page, reading progress and "Continue reading", the compare page, related topics, previous/next pager, print styles, reduced-motion handling, view transitions, skip link, focus outlines, CSP and security headers, Open Graph tags and structured data.

## 1. Verify what exists

Done 2026-11-15 in Chrome against a local server (so without the `vercel.json` headers). Pages were loaded in same-origin iframes at fixed widths, because the window could not be resized.

- [x] **Browser pass.** Home, `Envy/what-it-is/modern.html`, `Envy/what-it-is/compare.html`, `Self-doubt/root-causes/buddhism.html` and `404.html` at 320, 390, 768, 1024 and 1440px in all five themes: no horizontal overflow anywhere. Phone and tablet screenshots looked right. Notes for later items: on a phone the topic/lens switcher takes about 330px before the article starts (see "Sticky topic/lens switcher"), and the compare page shows one column below about 700px, so lenses stack rather than sit side by side (see "Compare page on phones").
- [x] **Contrast in every theme.** Every text pair passes AA (4.5:1) in all five themes; the lowest is 5.34:1 (muted text in Grey). The pairs checked were text, muted text and accent on the page and on cards; accent on accent-soft (current lens, pressed buttons, "read" tick); page colour on accent (current topic); text on accent-soft (search `<mark>`). Focus outlines are 6.45:1 or more against both page and card. `--line` borders are only 1.24–1.46:1 against the page. For the pills that is fine, since their text identifies them, but the search box had nothing else marking its edge, so it now uses `--muted` as its border (5.3:1 or more).
- [~] **Keyboard and screen reader pass.** Keyboard done: Tab order is skip link, theme, Continue reading, jump links, search, cards. Every focus has a visible outline. Enter opens the theme menu, Enter picks a theme and Escape closes it and returns focus to the summary. Space toggles a compare button and updates `aria-pressed`. The search status is `role="status"`, and the input has a label. Fixed: the theme menu stayed open after Tab moved focus out of it; `theme.js` now closes it on `focusout`. **Still to do:** listen to one article with VoiceOver; that needs a person.
- [x] **Print pass.** Printed the article and the compare page to PDF with headless Chrome: 2 pages each. Then checked the print stylesheet by applying it on screen, with the Black theme chosen. The output is black on white; the site bar, switcher, pager and related topics are gone; external links show their URL after the link text. The compare page prints only the lenses chosen on screen, one under another, each under its own heading.
- [x] **No-JavaScript pass.** Loaded each page in a sandboxed iframe with scripts off. Theme menu, search, reset, Continue reading and the compare buttons are all hidden. The home page shows all 26 cards, and the compare page shows all six lenses. No page overflows at 390px. One limit: old `sin.html?id=…` links cannot redirect without JavaScript and show "Not available yet" with a link home.

## 2. Automated checks

- [ ] **Internal link check in CI.** `check.yml` only fails on stale generated files. Add a pass over every `href` in the generated HTML.
- [ ] **Accessibility check in CI.** Run axe or Lighthouse on a handful of representative pages (home, article, compare, 404).
- [ ] **HTML validation.** Validate a sample of generated pages so a `build.js` template change cannot ship broken markup.
- [ ] **Size budget.** Fail the check if `style.css`, any script or `search.json` grows past a set size.
- [ ] **Screenshot comparison.** Keep reference screenshots of four pages per theme and diff them on pull requests.

## 3. Performance

Checked 2026-11-15 in Chrome against a local server that sends the `vercel.json` headers. None of this has been checked on the deployed site yet.

- [ ] **Smaller search index.** Measured: `search.json` is 783 KB, 234 KB with gzip and 179 KB with Brotli (Vercel compresses responses, so a reader downloads about the Brotli size). It holds 780 articles, and the article text is 91% of the file (the rest is paths and titles), so there is no structure to strip. It is fetched only when the search box first gets focus, and the browser keeps it with `must-revalidate`, so later visits cost one 304. Splitting it per topic does not work, because a search covers every article. Sharding per lens (about 30 KB each, the reader's lens first) would show the first results sooner, but the list would then reorder as the other shards arrive. **Decision needed:** leave it as it is (recommended for now), or build the lens shards.
- [x] **Caching for CSS and JS.** `build.js` now links `style.css` and the five scripts with a hash of the file (`style.css?v=538093b936`), and `vercel.json` caches those six files for a year as immutable. A query string was used instead of a hashed file name, so no second copy of each file is committed. Vercel matches header `source` on the path alone, without the query string (<https://vercel.com/docs/project-configuration/vercel-json#headers>). Cost: editing `style.css` or a script and running `npm run render` rewrites all 913 pages, and `npm run check` fails until then. Checked locally: on a second page the stylesheet and scripts came from cache (transfer size 0), and search still works.
- [x] **Font loading.** Nothing to change. All four `@font-face` rules have `font-display: swap` and a `unicode-range`. `Envy/what-it-is/modern.html` loads only the latin upright and italic files. `Addiction-and-compulsion/stories/buddhism.html` (which has "ā") also loads latin-ext upright, but not latin-ext italic, because no ā appears in italics there.
- [~] **Speculative loading.** Added `speculation-rules.json` (prefetch `.pager a` and `a.card` with `moderate` eagerness: hover for 200 ms on desktop, or pointerdown), sent on every page by a `Speculation-Rules` header in `vercel.json` with the required `application/speculationrules+json` type. No CSP change is needed because there is no inline script. It uses prefetch, not prerender: prerender runs the page's scripts, and `progress.js` would then mark an article as read on hover (<https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/speculationrules>). Checked locally: Chrome fetches the rules file and logs no CSP or parse error. **Still to do:** confirm that a prefetch actually happens, in Chrome DevTools → Application → Speculative loads on the deployed site. The test browser prefetched nothing, not even from a bare test page with inline rules and no CSP, so speculative loading is switched off there.
- [x] **Compare page weight.** Nothing to change. The largest is `Lust/stories/compare.html` at 20.7 KB (7.6 KB gzipped), against 10.8 KB (3.7 KB gzipped) for the largest single article.

## 4. Navigation and structure

- [ ] **Topic landing page.** A home card opens `what-it-is/modern.html` and the breadcrumb's second level points there too. Add one overview page per topic with the 5 sections × 6 lenses grid and read ticks.
- [ ] **Search from article pages.** The search box exists on the home page only. Add a search link or field to the site header.
- [ ] **Highlight the search term on arrival.** When a result is opened, scroll to and mark the matched text (text fragment link or a small script).
- [ ] **Sticky topic/lens switcher.** Nothing is sticky today; on a long article the switcher scrolls away. Check first on a phone, where it may take too much height.
- [ ] **Next lens in the pager.** The pager moves between sections of one lens. Add "Same section, next lens" beside it.
- [ ] **Back to top link** at the end of long articles.
- [ ] **Search on the 404 page**, plus links to the two sections of the home page.
- [ ] **Lens chooser on the home page.** The lens used by the cards is whichever was read last. Let the reader pick it directly.
- [ ] **Random article link** ("Read something") on the home page.
- [ ] **Keyboard shortcuts.** `/` to focus search, left and right arrows for previous and next. Today the only key handler is Escape on the theme menu.

## 5. Reading experience

Done 2026-11-15, checked in Chrome against a local server (pages in same-origin iframes at fixed widths, as in section 1).

- [x] **Mark as read at the end.** `progress.js` now records an article as read when its Sources section (the end of the text) scrolls into view, using an `IntersectionObserver`; a browser without one records it on opening, as before. "Continue reading" and the saved lens are still set on opening. Checked: an article opened in a 300px-high frame stayed unread until its Sources were scrolled into view, and one whose Sources sat below the fold stayed unread.
- [x] **Reading time.** Not added. Measured: 777 of the 780 articles round to "1 min" at 230 words a minute (median 153 words, longest 358), so the label would say the same thing on almost every page.
- [x] **Text size control.** Four steps (90, 100, 115 and 130% of the browser's own size), kept in localStorage as `size` and applied in `<head>` by `theme.js` before the first paint, like the theme. It sits inside the theme menu, now called "Display", rather than next to it: at 320px the site bar has no room for two more 44px buttons beside the brand. The buttons use `aria-disabled` at either end of the range so focus is not lost, and the percentage is announced through `aria-live`. Checked: no horizontal overflow and the menu stays on screen on home, article, compare and Self-doubt pages at 320, 390, 600, 768 and 900px at every step.
- [x] **Hyphenation and line breaking.** `text-wrap: pretty` was already on `p` and `li`. Added `hyphens: auto` for article text at 520px and below, limited to words of 10 or more letters. At `7 3 3` Chrome broke about one line in four (including "loss-es", the comma apparently counted), which read worse than the ragged edge.
- [x] **Tablet breakpoint.** Nothing to change. Between 521 and 900px the card grid goes from one column to two (from about 600px) to three (from about 840px), with cards 250–350px wide; the article measure is capped at 42rem; the switcher takes 194–298px; the compare page shows two columns from about 700px.
- [x] **Compare page on phones.** Nothing to change. The section 1 pass already found one column below about 700px, so lenses stack rather than sit side by side, and the "Lenses to show" buttons already work as the tabs this item suggested.
- [x] **Heading anchors.** The article Markdown has no headings at all; the only `h2` is the title and the only `h3` is the generated Sources heading. On article pages that heading now has `id="sources"` and a "#" link to itself (hidden in print). The compare page has six Sources lists in one page, so it gets no id.
- [ ] **Glossary for Sanskrit, Pali and Greek terms.** Not started; it is a content task more than a frontend one. There are about 450 distinct italic phrases across the articles; the commonest terms are *tamas* (24), *shadripu*, *rajas*, *shreyas*, *akrasia* and *preyas*, but many italics are English emphasis or titles. **Decision needed:** a glossary file (term, language, short definition with a source) that `build.js` uses to wrap matching `<em>` in `<dfn lang="…">`, or a glossary page; either way each definition needs checking, as the README does for quotations.
- [x] **Quotation styling.** Nothing to change. The 29 block quotations in the articles are all the "invented composite story" notes; quotations from texts are inline, in quotation marks with the reference in parentheses. The note (italic, accent rule on the left) was checked in Dark and Sepia; its colours are the same text and accent tokens checked for contrast in section 1.

## 6. Reader features (all local, no backend)

- [ ] **Bookmarks.** Let a reader save articles and list them on the home page.
- [ ] **Private notes.** A text box per article stored in localStorage, with a clear "stays in this browser" note.
- [ ] **Export and import of progress** as a file, so a reader can move between devices.
- [ ] **Share button** using the Web Share API, with copy-link as the fallback.
- [ ] **Read aloud** using the browser's speech synthesis.
- [ ] **Progress overview.** A page or panel showing what has been read across all 26 topics.
- [ ] **Mark unread** for a single article; today the only control is "Clear reading progress" for everything.
- [ ] **Text highlighter.** Let a reader highlight passages, kept in localStorage. Do it after bookmarks: the articles are short (roughly 200 words each in the Envy modern lens), so saving a whole article covers much of the same need.
  - [ ] Select text and a small "Highlight" button appears; tapping an existing highlight removes it.
  - [ ] One colour per theme, checked for contrast in all of them. No notes attached to highlights.
  - [ ] Store each highlight as the quoted text plus a few words either side, not as character positions, so it survives corrections to the article. Drop it quietly when the text no longer matches.
  - [ ] Draw highlights without changing the page markup. Check first: the CSS Custom Highlight API does this, but its browser support was not verified; older browsers would need a fallback that wraps the text in `<mark>`.
  - [ ] Check first on a phone: selecting text brings up the system's own copy/share menu, and the "Highlight" button must not fight it.
  - [ ] A "Your highlights" list on the home page, linking back to each article.
  - [ ] Hidden without JavaScript, like search and the theme menu.
  - [ ] Include highlights in the export and import item above; they are lost if the reader clears site data and do not follow them to another device.
  - [ ] Leave highlights out of print, or print them as a light underline.

## 7. Offline and install

- [ ] **Web app manifest** with name, icons and theme colours. None exists today.
- [ ] **Service worker** that caches the shell and each article as it is read, with an "available offline" hint. The CSP already allows same-origin scripts.
- [ ] **`theme-color` meta tag** per theme so the browser bar matches the page. None is set today; `theme.js` would update it.

## 8. Sharing and search engines

- [ ] **Share image per topic.** Every page uses the same `og.png`. Generate one per topic in `build.js`.
- [ ] **`lastmod` in `sitemap.xml`**, taken from each file's last git commit date. The sitemap has none.
- [ ] **Dates in the Article structured data** (`datePublished`, `dateModified`), from the same source.
- [ ] **Clean URLs.** `cleanUrls` is false, so every address ends in `.html`. Switching needs redirects and new canonical links; decide whether it is worth it.
- [ ] **Custom domain** in place of `seven-sins-liard.vercel.app`, which is written into every canonical link.

## 9. Housekeeping

- [ ] **Lint and format** the five scripts and `style.css` (none is configured).
- [ ] **Unit tests for `build.js`** helpers such as the description and excerpt functions.
- [ ] **Document the localStorage keys** (`read`, `lens`, `last`, `compare`, `theme`, `size`) in one place in the README.
- [ ] **Unused CSS check** after the five superseded drafts were removed in `7e201f5`.

## Suggested order

1. Section 1 (browser pass), because it will change the priority of everything else.
2. Topic landing page (mark-as-read-at-the-end is done).
3. ~~CSS/JS caching~~ (done); decide on the search index shards.
4. CI link and accessibility checks.
5. The rest as wanted.
