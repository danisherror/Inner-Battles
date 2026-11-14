# Sins

A read-only guide to the seven deadly sins, and to other inner battles beyond them (the first is procrastination): what each one is, where it comes from, what it costs, and how to overcome it. Every topic is explained through six lenses:

- **Modern** (psychology and everyday life)
- **Hinduism** (Bhagavad Gita and wider tradition)
- **Upanishads**
- **Christianity**
- **Buddhism**
- **Philosophical** (Plato, Aristotle, the Stoics, Kant)

There is no backend. Articles are written in Markdown and pre-rendered to static HTML (one page per article) by `build.js`, so the pages work without JavaScript and search engines can read them.

## Status

| Sin | Status |
| --- | --- |
| Lust | Written (5 topics × 6 lenses) |
| Pride | Written (5 topics × 6 lenses). Links, DOIs, Bible, Upanishad (Müller), Stoic and Aristotle quotations checked 2026-11-14; other references are from memory, see the note at the end of each article |
| Greed, Envy, Gluttony, Wrath, Sloth | Written (5 topics × 6 lenses each). Links and DOIs checked 2026-11-14, as for Pride |
| Procrastination (inner battle, pilot) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |
| Overthinking (inner battle, phase 1) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |
| Perfectionism (inner battle, phase 1) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |
| Self-doubt (inner battle, phase 1) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |
| Self-criticism (inner battle, phase 1) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |
| Jealousy (inner battle, phase 1) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |
| Fear and anxiety (inner battle, phase 2) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |
| Fear of failure and success (inner battle, phase 2) | Written (5 topics × 6 lenses), 2026-11-14. See "Inner battles" below |

Inner battles are not sins, so `sins.json` marks them `"kind": "inner-battle"` and the home page lists them in their own section. The plan is in `Inner-Battles.md`: 19 topics in phases, one topic per batch, each checked before the next.

Structure and link audit, 2026-11-14 (the seven sins, before Procrastination was added): all 210 articles exist and every article has a Sources section. Of 310 unique URLs, 287 returned 200; 22 DOI links returned 403 to a bot (publisher blocking) but all resolve in the doi.org registry. This shows the links exist, not that each source supports its claim; quotes and verses for the sins other than Pride have not been fully checked against their sources yet. Lust: every direct quotation was compared with its cited page on 2026-11-14 and four wording errors were fixed (Dhammapada 186, Augustine, Katha Upanishad, 1 Samuel 13:14); Gita paraphrases in the four Lust Hinduism articles were read against the English translations on holy-bhagavad-gita.org and match (verses 2.62-63, 3.37-38, 3.41-43, 6.35, 7.11, 16.21), and the missing verse links were added. For Greed, Envy, Gluttony, Wrath and Sloth, an automated quote comparison was inconclusive for many quotations because several cited pages (SuttaCentral, Wikisource and others) do not load as plain text; the Bible quotations spot-checked (Proverbs 6:9-11, 10:4, 15:1, 15:18, 16:32, 26:14, Romans 12:11, 2 Thessalonians 3:10, Ephesians 4:26, James 1:19-20, NRSV) matched exactly. Greed and Gluttony Upanishad quotations were then read against the Müller translation on Wikisource (2026-11-14): the Isha 1 and 6-7 wording in three Greed articles did not match it and was replaced with Müller's text, and the Taittiriya 3.7-3.10 and Chandogya 7.26.2 quotations in Gluttony match word for word. Wikisource notes that the source edition of its Taittiriya page is not documented. Philosophical-lens quotations in Greed, Envy, Gluttony, Wrath and Sloth were compared by script with MIT Classics, Wikisource, Perseus and Gutenberg texts and five wording errors fixed. Catechism paragraphs 2733, 1809, 2290 and 2534-2536 were read at scborromeo.org (CCC 2733 was misdescribed and is corrected), Augustine's *Confessions* 1.1 was corrected to the Pilkington wording, and two unverifiable phrases (Abba Moses, Ecclesiastes "never having enough") were paraphrased. Lust Catechism (2026-11-14): CCC 2351 and 2354 quotations were corrected to the text, and the 2359 citation (about homosexual persons) was replaced with 2340 and 2347. Lust philosophical lens (2026-11-14): Plato's *Phaedrus* chariot and *Republic* IX, Aristotle NE II, III, VII and IX.12, and Epictetus (*Encheiridion* 5 and 34, *Discourses* 2.18) were read in MIT Classics and Gutenberg texts and linked; one claim not in Aristotle ("enjoys less") was replaced with his actual point. The Kant point is unlinked. Evagrius and Aquinas (2026-11-14): the Aquinas references in Sloth, Wrath, Envy, Greed and Gluttony were read at New Advent and support the points made; the Evagrius acedia description matches Dysinger's translation, though that page gives no chapter number, and Gregory's *Moralia* 31.45 was confirmed only through Aquinas's citations. Buddhist texts, second pass (2026-11-14): Dhammapada 3-5, 74, 177, 186-187, 280, 355 and 365 were read against the Buddharakkhita translation on Access to Insight (two wording fixes: verse 5 punctuation, verse 365 text); DN 16 last words, SN 7.2, SN 3.13, AN 7.61 and SN 45.2 were read against Sujato's translation via the SuttaCentral bilarasuttas API, and the Wrath and Gluttony stories were corrected (Bharadvaja asks for ordination, not forgiveness; Sudassana is a student, not a relative). MN 2, SN 1.71, AN 7.64, SN 46.51, AN 3.39 and AN 3.61 were then checked the same way (fixed the SN 1.71 and MN 2 wording and the SN 46.51 list of causes). A third pass checked the sutta numbers, titles and cited points of SN 56.11, SN 22.59, SN 12.2, AN 8.6, AN 5.161, AN 5.177, AN 4.13, AN 6.19-20, MN 7, MN 21, MN 27, MN 39, MN 70, MN 135, DN 3, Sn 1.8, Sn 2.4 and Sn 4.11 (fixed the DN 3 story details and the Mangala Sutta "humility" wording). The other Buddhist summaries still marked "from memory", plus Evagrius and Aquinas references, are unverified.

## Inner battles

Procrastination (the pilot, written 2026-11-14) follows the same layout as the sins: five topics × six lenses, 30 articles, each ending with a **Sources** section. What was checked, and what was not:

- Every quotation from the Bhagavad Gita (holy-bhagavad-gita.org, Swami Mukundananda's translation), the Katha and Mundaka Upanishads (Müller, on Wikisource), the Bible (NRSV on BibleGateway), Augustine's *Confessions* 8 (Pilkington, New Advent), the suttas and Dhammapada verses (Sujato, via the SuttaCentral API), Aristotle, Epictetus, Marcus Aurelius (MIT Classics), Seneca's Letter 1 (Wikisource) and Hesiod (theoi.com) was compared with the text of that page on the same date. Epictetus is Higginson's translation, where the passage is chapter 50.
- Research claims were read only in abstracts or secondary summaries: Steel (2007) in the Europe PMC abstract; Tice and Baumeister (1997), Sirois and Pychyl (2013), Wohl et al. (2010) and Gollwitzer and Sheeran (2006) through search results that quote or summarise the abstracts. None was read in full text. Each article says so.
- The 49 external links in the articles were fetched. Four DOI links returned 403 to a bot (publisher blocking) and all five DOIs resolve at doi.org.
- Not checked: the Sanskrit and Pali terms against a dictionary, the Marcus Aurelius paragraph number in Book 2, the *Confessions* section numbers (taken from the New Advent chapter headings), and the pages in a browser (the local server could not be started in this session).

Overthinking (phase 1, written 2026-11-14; covers rumination, worry and restlessness) follows the same layout. Checked: every quotation from the Gita (6.26, 6.33-35, 2.62-63, 2.66, 2.70), the Katha and Mundaka Upanishads (Müller), the Bible (NRSV), Evagrius (Dysinger), the suttas and Dhammapada (Sujato via SuttaCentral: MN 19, SN 36.6, SN 46.51, Dhp 33-36), Epictetus (Higginson), Marcus Aurelius (Long), Seneca's Letters 13 and 98 (Gummere) and Pascal (Trotter, Gutenberg) was compared with the text of its page on the same date. Research claims (Watkins 2008, Watkins and Roberts 2020, Nolen-Hoeksema, Wisco and Lyubomirsky 2008, Killingsworth and Gilbert 2010, Kross et al. 2014) were read in the abstracts in Europe PMC, not in the full texts. All 36 external links were fetched; the four DOI links returned 403 to a bot and all five DOIs resolve at doi.org. Not checked: the Evagrius chapter number (the page gives none), the Marcus Aurelius section number (8.47, taken from the standard numbering), the Pascal passage number in other editions, Sanskrit and Pali terms against a dictionary, and the pages in a browser.

Perfectionism (phase 1, written 2026-11-14) follows the same layout. Checked: every quotation from the Gita (2.47, 2.48, 2.50, 3.35, 18.45, 18.47, 18.48), the Isha and Chandogya Upanishads (Müller, Wikisource page images), the Bible (NRSV: Matthew 5:48, Ecclesiastes 7:16-18, Philippians 3:12-14, 2 Corinthians 12:7-10, Ephesians 2:8-9, Psalm 103:13-14), AN 6.55 and SN 56.11 (Sujato via SuttaCentral), Aristotle (*Nicomachean Ethics* 1.3 and 2.6), Marcus Aurelius (Meditations 5) and Epictetus (*Enchiridion* 1, Carter) was compared with the text of its page by script on the same date. Research claims (Stoeber and Otto 2006, Curran and Hill 2019) were read in the Europe PMC abstracts only. All 26 external links were fetched; the two DOI links returned 403 to a bot and both resolve in the Crossref registry. Not checked: the Greek sense of "perfect" in Matthew 5:48, Sanskrit and Pali terms, the Marcus paragraph number (the page gives none), Shafran, Cooper and Fairburn (2002) and Hewitt and Flett (1991) (neither opened), and the pages in a browser. Noticed while checking: seven older Procrastination and Overthinking articles credit Epictetus to "Higginson", but the MIT Classics page names Elizabeth Carter; not yet corrected.

Self-doubt (phase 1, written 2026-11-14; covers self-doubt and impostor syndrome) follows the same layout. Checked: every quotation from the Gita (2.3, 2.7, 4.40, 6.5, 6.6), the Katha and Mundaka Upanishads and Chandogya 6.1 (Müller, Wikisource), the Bible (NRSV: Exodus 3-4, Judges 6, Jeremiah 1, 2 Corinthians 3:5, 1 Corinthians 15:10, Philippians 4:13, Isaiah 41:10), the Dhammapada chapter on the self (157-160) and SN 46.51 (Sujato via SuttaCentral), Aristotle (*Nicomachean Ethics* 4.3), Marcus Aurelius (Meditations 5) and Epictetus (*Enchiridion* 1, Carter) was compared with the text of its page by script on the same date; the script's flags were line breaks and spacing in the sources, and the Gita-verse wording was checked by eye. The one research source, Bravata et al. (2020), was read in the Europe PMC abstract only; Clance and Imes (1978) was checked for its title and details in Crossref and not opened. All 24 external links were fetched; one DOI returned 403 to a bot and resolves in Crossref. Not checked: the sutta's own definition of doubt in SN 46.51 (read only where it mentions doubt), the Pali term, commentary stories for Dhp 157-160, the surrounding context of Philippians 4:13 and Isaiah 41:10, and the pages in a browser.

Self-criticism (phase 1, written 2026-11-14; the inner critic) follows the same layout. Checked: every quotation from the Gita (2.11, 6.5, 6.6, 9.30-31, 18.66, 18.73), the Katha and Mundaka Upanishads (Müller, Wikisource), the Bible (NRSV: 1 John 3:19-20, Romans 8:1, Psalm 103:10-12, Luke 15:17-24, Matthew 7:3-5), SN 3.4, SN 36.6 and Dhp 157-166 (Sujato via SuttaCentral), Epictetus (*Enchiridion* 5), Marcus Aurelius (Meditations 5) and Aristotle (*Nicomachean Ethics* 9.4) was compared with the text of its page by script on the same date, and two quotations the script flagged (SN 36.6 and one Aristotle phrase) were corrected. Research claims (Zessin et al. 2015, MacBeth and Gumley 2012, Kross et al. 2014) were read in Europe PMC abstracts only; Neff (2003) and Gilbert and Procter (2006) were checked for title and publication details in Crossref and not opened, so the articles say nothing about their findings. All 25 external links were fetched; the four DOI links returned 403 to a bot and all four resolve in Crossref. Not checked: that the Self-Compassion Scale includes self-judgement items (from memory), the Pali and Sanskrit terms, how commentators read 1 John 3:20, "do not fear" against "do not grieve" in 18.66, and the pages in a browser. The Epictetus page at MIT names Elizabeth Carter, but its chapter 5 wording differs in places from the older Carter text, so the exact edition was not established; the Aristotle 9.4 passage is about bad men, and the articles say that applying it to self-critics goes beyond the text.

Jealousy (phase 1, written 2026-11-14; the fear of losing someone or something to a rival, kept apart from [Envy](Envy/what-it-is/modern.html)) follows the same layout and completes phase 1. Checked: every quotation from the Gita (2.62-2.65, 2.70, 2.71, 6.5, 6.6, 12.13-15), the Isha, Katha, Mundaka and Chandogya Upanishads (Müller, Wikisource), the Bible (NRSV: Proverbs 14:30 and 27:4, 1 Corinthians 13:4-7, Galatians 5:19-23, 1 John 4:18, Luke 15:25-32; KJV for Song of Solomon 8:6), Dhp 209-220, DN 21 and Snp 4.11 (Sujato via SuttaCentral), Epictetus (*Enchiridion* 1, 3, 7, 11, 14) and Spinoza (*Ethics* III.35, Elwes via Project Gutenberg) was compared with the text of its page by script on the same date; the script's flags were editorial brackets and verse numbers in the sources. Research claims (Smith and Kim 2007, Elphinston and Noller 2011, Fernández et al. 2025, De Sousa et al. 2026) were read in Europe PMC abstracts only; Parrott and Smith (1993) and Sharpsteen and Kirkpatrick (1997) were checked for title and publication details in Crossref and not opened, so the articles say nothing about their findings. All 34 external links were fetched; the five DOI links returned 403 to a bot and all five resolve in Crossref. The modern lens carries a pointer to a doctor, therapist or domestic abuse service where jealousy turns to control. Not checked: the Pali, Sanskrit and Hebrew words behind "jealousy" (the claim that the Pali *issā* is generally described as envy is from memory), how commentators read the elder son and 1 John 4:18, why the KJV and NRSV differ at Song of Solomon 8:6, whether a traditional Hindu list of inner enemies has a term close to jealousy, Descartes on jealousy (no text could be fetched), the Brihadaranyaka Upanishad (no Wikisource page exists for it under that name), and the pages in a browser. The Epictetus page at MIT names Elizabeth Carter, but the exact edition was not established. The Hinduism story is a passage from the Gita and not a tale, because the one narrative source tried (the Mahabharata at sacred-texts.com) blocked the fetch and was not worked around.

Fear and anxiety (phase 2, written 2026-11-14; the first phase 2 topic, covering ordinary fear and worry as well as anxiety disorders) follows the same layout. Checked: every quotation from the Gita (1.28-31, 2.56, 2.70, 4.10, 6.5, 11.45-50, 16.1-3, 18.30), the Katha and Mundaka Upanishads (Müller, Wikisource), the Bible (NRSV: Psalm 23:4, 56:3-4 and 94:19, Proverbs 12:25 and 29:25, Joshua 1:9, 2 Timothy 1:7, 1 John 4:18, Mark 4:35-41, Matthew 14:22-33), Dhp 33-43 and 209-220, MN 4, MN 131 and Snp 3.8 (Sujato via SuttaCentral), Aristotle (*Rhetoric* 2.5, *Nicomachean Ethics* 3.6), Epictetus (*Enchiridion* 5), Seneca (*Letters* 13), Marcus Aurelius (*Meditations* 8) and Plato (*Apology*) was compared with the text of its page by script on the same date; the script's flags were footnote markers and verse numbers in the sources and one composite's invented words. The WHO anxiety disorders fact sheet was read on its page; the Hofmann et al. (2012) and Craske et al. (2014) claims were read in Europe PMC abstracts only, and their publication details were checked in Crossref. All 38 external links were fetched and returned 200. Because this topic is clinical, the modern lens points to a doctor or therapist and, where the WHO page links anxiety to self-harm, to emergency services or a crisis line; it describes treatment only as the WHO and the two abstracts do. Not checked: the Sanskrit, Pali, Hebrew and Greek words behind "fear" and "anxiety", the NIMH anxiety page (it contained text about an executive order and a renaming of "AI" that I could not account for on 2026-11-14, so it was not used), how commentators read 1 John 4:18 and Matthew 14:31, the Brihadaranyaka Upanishad (not found on Wikisource), the WHO figures after that date, and the pages in a browser. The Epictetus page at MIT names Elizabeth Carter, but the exact edition was not established. Fear and anxiety is related to [Overthinking](Overthinking/what-it-is/modern.html), and the Christianity and Buddhism articles reuse a few passages with a note (Matthew 6, Philippians 4, 1 John 4:18, Dhp 212).

Fear of failure and success (phase 2, written 2026-11-14; covers the dread of falling short and the dread of what succeeding would bring) follows the same layout. Checked: every quotation from the Gita (2.6, 2.9, 2.38, 2.47-2.49, 4.22, 12.17, 18.8), the Isha and Katha Upanishads (Müller, Wikisource), the Bible (NRSV: Proverbs 24:16, Psalm 37:23-24, Micah 7:8, 1 Kings 19:1-8, Matthew 25:14-30, 2 Corinthians 12:9-10, Philippians 3:13-14), AN 8.5, AN 8.6 and MN 36 (Sujato via SuttaCentral), Aristotle (*Nicomachean Ethics* 4.3), Epictetus (*Enchiridion* 1, 8, 19) and Marcus Aurelius (*Meditations* 5) was compared with the text of its page by script on the same date; the script's flags were invented words in the composite story and a phrase in one article that left out two words of the abstract, which was corrected. The MIT page for Meditations 5 prints "In he morning" and the Aristotle page repeats "worthy of"; both are noted in the articles. Research claims (Kosakowska-Berezecka et al. 2017, Boileau et al. 2025, Moreno-Murcia et al. 2019, Hu et al. 2023, Yıldırım et al. 2023) were read in Europe PMC abstracts only, and their details checked in Crossref; Teevan and McGhee (1972) was checked for title and details only and not opened. All 30 external links were fetched; the four DOI links returned 403 to a bot and all four resolve in Crossref. Most of the research is on athletes and students, and the articles say it is correlational. Only one study of fear of success was read, and the articles say so. Not checked: the Sanskrit, Pali and Greek terms, how commentators read the parable of the talents and Elijah's flight, the earlier chapters of 1 Kings, the Gita verses 2.10-2.37, which were not read for the Arjuna retelling, and a Mundaka Upanishad line on truth that I meant to use (no matching line was found in the Wikisource text, so it was left out), and the pages in a browser. The Epictetus page at MIT names Elizabeth Carter, but the exact edition was not established. The Upanishads and philosophical stories are passages and not tales where they say so. The topic overlaps [Perfectionism](Perfectionism/what-it-is/modern.html) and [Procrastination](Procrastination/what-it-is/modern.html).

## Run locally

The pages are generated, plain HTML with relative links and no `fetch`, so you can open `index.html` from disk or serve the folder:

```sh
cd Sins
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

After editing any `.md` file or `sins.json`, regenerate the pages and commit the result:

```sh
npm install        # once; installs marked 4.3.0, used only at build time
npm run render     # rewrites the article pages, index.html, sin.html and sitemap.xml
npm run check      # exits 1 if a generated file is stale
```

The site can be deployed to any static host, such as Vercel, as it is. It is currently deployed on the free Vercel Hobby plan at <https://seven-sins-liard.vercel.app>; `vercel.json` sets the security headers. The generated HTML is committed, so the host runs no build step. To redeploy, run `vercel deploy --prod` in this folder (the project name `seven-sins` is saved in the untracked `.vercel` folder).

## Project layout

```
Sins/
  build.js        generates every .html page and sitemap.xml (npm run render)
  index.html      generated home page: one card per sin
  sin.html        generated redirect for old sin.html?id=... links
  404.html        hand-written "page not found" page
  style.css       styles (light and dark)
  sins.json       single source of truth: lenses, sins, taglines and each sin's topics
  sitemap.xml     generated
  robots.txt  og.png  vercel.json  package.json  package-lock.json  .gitignore
  LICENSE         MIT
  CLAUDE.md       instructions for the AI agent
  PLAYBOOK.md     review checklist and audit notes
  Inner-Battles.md  planning list for the inner-battles section (19 topics, phased); not linked from the site. Decision 2026-11-14: keep it as the plan, and retire or link it once the topics are on the site
  Lust/ Pride/ Greed/ Envy/ Gluttony/ Wrath/ Sloth/ Procrastination/   (each has the same five topic folders)
    what-it-is/       modern.md  hinduism.md  upanishads.md  christianity.md  buddhism.md  philosophical.md
                      (plus a generated .html page next to each .md)
    root-causes/
    effects/
    how-to-overcome/
    stories/
```

Article files follow the pattern `<Sin>/<topic>/<lens>.md`, and the generated page is `<Sin>/<topic>/<lens>.html`. Links between articles in Markdown should point at the `.html` page (for example `../how-to-overcome/modern.html`).

## Adding a sin

1. Create a folder named after the sin, for example `Pride/`, matching its `id` in `sins.json`.
2. For each topic, add a subfolder with six files: `modern.md`, `hinduism.md`, `upanishads.md`, `christianity.md`, `buddhism.md`, `philosophical.md`.
3. Add a `topics` list to that sin in `sins.json`. A sin without `topics` is shown as "Coming soon". Add `"kind": "inner-battle"` for a topic that is not one of the seven sins; with no `kind` it is listed under the sins.
4. Run `npm run render` and commit the generated pages.

```json
"topics": [
  { "id": "what-it-is", "title": "What it is" }
]
```

The topic `id` must match the subfolder name.

## Writing guidelines

- Describe each tradition on its own terms. Do not rank them.
- Use British spelling in our own prose (honour, behaviour, practise as a verb, recognised, programme). Quotations, translations, titles of works and proper names keep their source's spelling (for example NRSV "honored", *Physiology & Behavior*, World Health Organization). Write "well-being" with a hyphen.
- Name each lens after its tradition, as the lens name and the file name do: Hinduism, Christianity, Buddhism (`buddhism`). Use "Buddhist" only as an adjective ("Buddhist texts").
- End every article with a **Sources** section. Any claim about scripture, philosophy or research needs a source URL or a book and verse reference.
- If a point is a standard summary and has not been checked against a specific passage, say so in the Sources section.
- The seven deadly sins are a Christian list. Where another tradition has no exact equivalent (for example, Hinduism and gluttony or sloth), use the closest related idea and say that it is related and not identical.

## Sources used so far

- Bhagavad Gita verses: [holy-bhagavad-gita.org](https://www.holy-bhagavad-gita.org/)
- [Catechism of the Catholic Church, 2351-2359](https://www.vatican.va/archive/ENG0015/__P85.HTM)
- Buddhist texts: [Access to Insight](https://www.accesstoinsight.org/)
- Upanishads: [Swami Krishnananda's Brihadaranyaka commentary](https://www.swami-krishnananda.org/brdup/brhad_IV-04a.html), [Ratha Kalpana (Wikipedia)](https://en.wikipedia.org/wiki/Ratha_Kalpana)
- Bible passages: [BibleGateway](https://www.biblegateway.com/)
- Buddhist suttas (Bhikkhu Sujato's translation): [SuttaCentral](https://suttacentral.net/)
- Catechism paragraphs 2340, 2347, 2351, 2354, 2290, 2534-2536, 1809 and 2733: [Vatican text](https://www.vatican.va/archive/ENG0015/_INDEX.HTM)
- Upanishad quotations (Max Müller translation): [Wikisource](https://en.wikisource.org/)
- Plato, Aristotle and Epictetus passages: [MIT Internet Classics Archive](https://classics.mit.edu/)
- Aquinas, *Summa Theologiae* references: [New Advent](https://www.newadvent.org/summa/)
- [Aristotle, Nicomachean Ethics Book 3](https://pressbooks.ulib.csuohio.edu/nicomacheanethics/?p=86)
- [WHO ICD-11, 6C72 Compulsive sexual behaviour disorder (summary)](https://www.findacode.com/icd-11/code-1630268048.html)

## Disclaimer

This is educational and reflective content, not medical, psychological or religious authority. If a habit feels out of control or is harming your life, please talk to a doctor, therapist or a trusted person.
