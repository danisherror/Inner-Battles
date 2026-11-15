# Frontend to-do

Things we can still do on the frontend, written 2026-11-15 from a read of the code (`build.js`, `style.css`, the five scripts, `vercel.json` and a few generated pages). Nothing here was checked in a browser; items that need a look before any work are marked "check first".

Already in place, so not listed below: pre-rendered pages that work without JavaScript, six themes, article search on the home page, reading progress and "Continue reading", the compare page, related topics, previous/next pager, print styles, reduced-motion handling, view transitions, skip link, focus outlines, CSP and security headers, Open Graph tags and structured data.

## 1. Verify what exists

- [ ] **Browser pass.** Open the home page, an article, a compare page and `404.html` at phone, tablet and desktop widths in each theme. The README lists "the pages in a browser" as not checked for most topics.
- [ ] **Contrast in every theme.** Measure text, muted text, links, the "read" tick and focus outlines against WCAG AA in Paper, Sepia, Grey, Dark and Black.
- [ ] **Keyboard and screen reader pass.** Tab through the theme menu, search, topic/lens switcher and compare buttons; listen to one article with VoiceOver.
- [ ] **Print pass.** Print an article and a compare page to PDF and read the result.
- [ ] **No-JavaScript pass.** Confirm that search, theme menu and reset stay hidden and every page is still usable.

## 2. Automated checks

- [ ] **Internal link check in CI.** `check.yml` only fails on stale generated files. Add a pass over every `href` in the generated HTML.
- [ ] **Accessibility check in CI.** Run axe or Lighthouse on a handful of representative pages (home, article, compare, 404).
- [ ] **HTML validation.** Validate a sample of generated pages so a `build.js` template change cannot ship broken markup.
- [ ] **Size budget.** Fail the check if `style.css`, any script or `search.json` grows past a set size.
- [ ] **Screenshot comparison.** Keep reference screenshots of four pages per theme and diff them on pull requests.

## 3. Performance

- [ ] **Smaller search index.** `search.json` is 783 KB (about 234 KB gzipped) and is fetched whole when the search box gets focus. Split it per topic, or ship headings and excerpts first and full text on demand.
- [ ] **Caching for CSS and JS.** `vercel.json` sets long caching for fonts only. Add a content hash to `style.css` and the script file names in `build.js`, then cache them as immutable.
- [ ] **Font loading.** Check first: confirm `font-display` and that the italic and latin-ext files load only when a page uses them.
- [ ] **Speculative loading.** Add a speculation rules block (or prefetch on hover) for the pager's "Next" link and the home cards. This needs a CSP change for inline rules, or an external rules file.
- [ ] **Compare page weight.** Each compare page carries all six lenses. Check first: measure the largest one before deciding whether to do anything.

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

- [ ] **Mark as read at the end.** `progress.js` records an article as read when the page opens. Record it when the end of the article scrolls into view.
- [ ] **Reading time** beside each article heading, computed in `build.js` from the word count.
- [ ] **Text size control** next to the theme menu, kept in localStorage like the theme.
- [ ] **Hyphenation and line breaking.** `style.css` has no `hyphens` rule. Check first: try `hyphens: auto` on phone widths and `text-wrap: pretty` on paragraphs.
- [ ] **Tablet breakpoint.** The only breakpoint is 520px. Check first: look at the card grid and switcher between 600px and 900px.
- [ ] **Compare page on phones.** Check first: side-by-side columns may be unreadable at phone width; consider one lens at a time with a swipe or tabs.
- [ ] **Heading anchors.** Give `h2` and `h3` in articles an `id` and a link so a section or the Sources list can be shared.
- [ ] **Glossary for Sanskrit, Pali and Greek terms.** Mark terms such as *mudita* with a `lang` attribute and a short definition (a `<dfn>` or a glossary page).
- [ ] **Quotation styling.** Check first: review how block quotations and verse references look in each theme.

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
- [ ] **Document the localStorage keys** (`read`, `lens`, `last`, `compare`, theme) in one place in the README.
- [ ] **Unused CSS check** after the five superseded drafts were removed in `7e201f5`.

## Suggested order

1. Section 1 (browser pass), because it will change the priority of everything else.
2. Topic landing page and mark-as-read-at-the-end.
3. Smaller search index and CSS/JS caching.
4. CI link and accessibility checks.
5. The rest as wanted.
