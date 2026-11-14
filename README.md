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

Structure and link audit, 2026-11-14: all 210 articles exist and every article has a Sources section. Of 310 unique URLs, 287 returned 200; 22 DOI links returned 403 to a bot (publisher blocking) but all resolve in the doi.org registry. This shows the links exist, not that each source supports its claim; quotes and verses for the sins other than Pride have not been checked against their sources yet.

## Run locally

The site loads `.md` files with `fetch`, so it must be served over HTTP. Opening `index.html` directly from disk will not work.

```sh
cd Sins
python3 -m http.server 8000
```

Then open <http://localhost:8000>. An internet connection is needed because the Markdown renderer ([marked](https://cdnjs.com/libraries/marked) 4.3.0) is loaded from cdnjs.

The site can be deployed to any static host, such as Vercel, as it is.

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
