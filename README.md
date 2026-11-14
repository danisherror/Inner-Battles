# Sins

A read-only guide to the seven deadly sins: what each one is, where it comes from, what it costs, and how to overcome it. Every topic is explained through six lenses:

- **Modern** (psychology and everyday life)
- **Hinduism** (Bhagavad Gita and wider tradition)
- **Upanishads**
- **Christianity**
- **Buddhist**
- **Philosophical** (Plato, Aristotle, the Stoics, Kant)

There is no backend. It is plain HTML, CSS and JavaScript, with articles written in Markdown.

## Status

| Sin | Status |
| --- | --- |
| Lust | Written (5 topics × 6 lenses) |
| Pride | Written (5 topics × 6 lenses). Links, DOIs, Bible, Upanishad (Müller), Stoic and Aristotle quotations checked 2026-11-14; other references are from memory, see the note at the end of each article |
| Greed, Envy, Gluttony, Wrath, Sloth | Written (5 topics × 6 lenses each). Links and DOIs checked 2026-11-14, as for Pride |

Structure and link audit, 2026-11-14: all 210 articles exist and every article has a Sources section. Of 310 unique URLs, 287 returned 200; 22 DOI links returned 403 to a bot (publisher blocking) but all resolve in the doi.org registry. This shows the links exist, not that each source supports its claim; quotes and verses for the sins other than Pride have not been fully checked against their sources yet. Lust: every direct quotation was compared with its cited page on 2026-11-14 and four wording errors were fixed (Dhammapada 186, Augustine, Katha Upanishad, 1 Samuel 13:14); Gita paraphrases in the four Lust Hinduism articles were read against the English translations on holy-bhagavad-gita.org and match (verses 2.62-63, 3.37-38, 3.41-43, 6.35, 7.11, 16.21), and the missing verse links were added. Catechism paragraphs, Buddhist suttas and the Plato and Stoic points in Lust have not been read against the text. For Greed, Envy, Gluttony, Wrath and Sloth, an automated quote comparison was inconclusive for many quotations because several cited pages (SuttaCentral, Wikisource and others) do not load as plain text; the Bible quotations spot-checked (Proverbs 6:9-11, 10:4, 15:1, 15:18, 16:32, 26:14, Romans 12:11, 2 Thessalonians 3:10, Ephesians 4:26, James 1:19-20, NRSV) matched exactly. Greed and Gluttony Upanishad quotations were then read against the Müller translation on Wikisource (2026-11-14): the Isha 1 and 6-7 wording in three Greed articles did not match it and was replaced with Müller's text, and the Taittiriya 3.7-3.10 and Chandogya 7.26.2 quotations in Gluttony match word for word. Wikisource notes that the source edition of its Taittiriya page is not documented. Philosophical-lens quotations in Greed, Envy, Gluttony, Wrath and Sloth were compared by script with MIT Classics, Wikisource, Perseus and Gutenberg texts and five wording errors fixed. Catechism paragraphs 2733, 1809, 2290 and 2534-2536 were read at scborromeo.org (CCC 2733 was misdescribed and is corrected), Augustine's *Confessions* 1.1 was corrected to the Pilkington wording, and two unverifiable phrases (Abba Moses, Ecclesiastes "never having enough") were paraphrased. Buddhist texts, second pass (2026-11-14): Dhammapada 3-5, 74, 177, 186-187, 280, 355 and 365 were read against the Buddharakkhita translation on Access to Insight (two wording fixes: verse 5 punctuation, verse 365 text); DN 16 last words, SN 7.2, SN 3.13, AN 7.61 and SN 45.2 were read against Sujato's translation via the SuttaCentral bilarasuttas API, and the Wrath and Gluttony stories were corrected (Bharadvaja asks for ordination, not forgiveness; Sudassana is a student, not a relative). MN 2, SN 1.71, AN 7.64, SN 46.51, AN 3.39 and AN 3.61 were then checked the same way (fixed the SN 1.71 and MN 2 wording and the SN 46.51 list of causes). A third pass checked the sutta numbers, titles and cited points of SN 56.11, SN 22.59, SN 12.2, AN 8.6, AN 5.161, AN 5.177, AN 4.13, AN 6.19-20, MN 7, MN 21, MN 27, MN 39, MN 70, MN 135, DN 3, Sn 1.8, Sn 2.4 and Sn 4.11 (fixed the DN 3 story details and the Mangala Sutta "humility" wording). The other Buddhist summaries still marked "from memory", plus Evagrius and Aquinas references, are unverified.

## Run locally

The site loads `.md` files with `fetch`, so it must be served over HTTP. Opening `index.html` directly from disk will not work.

```sh
cd Sins
python3 -m http.server 8000
```

Then open <http://localhost:8000>. An internet connection is needed because the Markdown renderer ([marked](https://cdnjs.com/libraries/marked) 4.3.0) is loaded from cdnjs.

The site can be deployed to any static host, such as Vercel, as it is. It is currently deployed on the free Vercel Hobby plan at <https://seven-sins-liard.vercel.app>; `vercel.json` sets the security headers. To redeploy, run `vercel deploy --prod` in this folder (the project name `seven-sins` is saved in the untracked `.vercel` folder).

## Project layout

```
Sins/
  index.html      home page: one card per sin
  sin.html        sin page: topic buttons, lens tabs, rendered article
  style.css       styles (light and dark)
  sins.json       list of lenses, sins and each sin's topics
  Lust/ Pride/ Greed/ Envy/ Gluttony/ Wrath/ Sloth/   (each has the same five topic folders)
    what-it-is/       modern.md  hinduism.md  upanishads.md  christianity.md  buddhism.md  philosophical.md
    root-causes/
    effects/
    how-to-overcome/
    stories/
```

Article files follow the pattern `<Sin>/<topic>/<lens>.md`.

## Adding a sin

1. Create a folder named after the sin, for example `Pride/`, matching its `id` in `sins.json`.
2. For each topic, add a subfolder with six files: `modern.md`, `hinduism.md`, `upanishads.md`, `christianity.md`, `buddhism.md`, `philosophical.md`.
3. Add a `topics` list to that sin in `sins.json`. A sin without `topics` is shown as "Coming soon".

```json
"topics": [
  { "id": "what-it-is", "title": "What it is" }
]
```

The topic `id` must match the subfolder name.

## Writing guidelines

- Describe each tradition on its own terms. Do not rank them.
- End every article with a **Sources** section. Any claim about scripture, philosophy or research needs a source URL or a book and verse reference.
- If a point is a standard summary and has not been checked against a specific passage, say so in the Sources section.
- The seven deadly sins are a Christian list. Where another tradition has no exact equivalent (for example, Hinduism and gluttony or sloth), use the closest related idea and say that it is related and not identical.

## Sources used so far

- Bhagavad Gita verses: [holy-bhagavad-gita.org](https://www.holy-bhagavad-gita.org/)
- [Catechism of the Catholic Church, 2351-2359](https://www.vatican.va/archive/ENG0015/__P85.HTM)
- Buddhist texts: [Access to Insight](https://www.accesstoinsight.org/)
- Upanishads: [Swami Krishnananda's Brihadaranyaka commentary](https://www.swami-krishnananda.org/brdup/brhad_IV-04a.html), [Ratha Kalpana (Wikipedia)](https://en.wikipedia.org/wiki/Ratha_Kalpana)
- Bible passages: [BibleGateway](https://www.biblegateway.com/)
- [Aristotle, Nicomachean Ethics Book 3](https://pressbooks.ulib.csuohio.edu/nicomacheanethics/?p=86)
- [WHO ICD-11, 6C72 Compulsive sexual behaviour disorder (summary)](https://www.findacode.com/icd-11/code-1630268048.html)

## Disclaimer

This is educational and reflective content, not medical, psychological or religious authority. If a habit feels out of control or is harming your life, please talk to a doctor, therapist or a trusted person.
