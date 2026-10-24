# Data pipeline

Fetches indicators from official APIs, checks them, and publishes only what passes.
The atlas never calls an API while someone is using it: the pipeline writes local files,
and the build embeds them (that wiring is Phase 2).

```
python3 -m pipeline.run              fetch, check, publish or hold, write the log
python3 -m pipeline.run --dry-run    same, but nothing under data/ changes (report in out/)
python3 -m pipeline.run --only gdp_pc,cpi_avg
python3 tests/test_pipeline.py       52 offline checks against recorded live responses
```

## Running on its own (GitHub Actions: .github/workflows/atlas.yml)

| When | What it does |
|---|---|
| Mondays 05:17 UTC (06:17 Lagos) | fetch and check the data; publish routine changes; hold the rest |
| a push to `main` that changes the app or pipeline | rebuild, test and publish (for example, after merging a pull request) |
| **Run workflow** on the Actions tab | the same, by hand (untick "fetch" to republish without fetching) |
| the owner comments `approve` on the data-review issue | publish exactly the held versions that issue lists |

The site is published only after `tests/smoke.py` and `tests/test_atlas_pipeline.py` pass on the new build
(`python3 -m pipeline.release`); if they fail, the live site stays as it was and the run is marked failed.
When something needs a person (a held update, or a source unreachable for three weeks), the run opens or
updates one GitHub issue labelled `data-review` that mentions the owner, so GitHub sends a notification.
The issue closes itself when nothing is waiting. Runs on other branches build and test but never publish.

## What happens to an update

| Outcome | When | What changes |
|---|---|---|
| **no change** | the source returns the same data as last time | only the manifest's "last checked" |
| **published** | it changed and passed every check | `data/normal/<id>.json`, the atlas file, the log |
| **held for review** | it changed in a way a person should look at | `data/review/<id>.json`; the published data stays as it was |
| **rejected** | the data is unusable (not numbers, duplicates, no values) | nothing but the log and manifest |
| **fetch failed** | the source is down, times out or answers with an error | nothing but the log and manifest |

**Held for review:**
- the first publication of an indicator;
- a changed definition, unit or label at the source;
- a new IMF WEO edition (April and October);
- coverage falling;
- country codes nobody has mapped;
- zeros where a zero is implausible;
- values out of range;
- revisions beyond the indicator's threshold;
- a value going from observed back to estimate;
- a large year-on-year jump in a new or changed value (from 2015);
- disagreement with the figures read from the IMF report;
- many income-group changes at once.

**Routine (published and logged):**
- small revisions;
- new years;
- estimates or projections becoming observed;
- new World Bank updates;
- a few countries gained or lost.

## Approving a held update

Open `data/review/<id>.json`. It lists the reasons (`issues.review`) and the full staged data.
If it is right, add its hash to `pipeline/config/approvals.json`:

```json
{"approve": {"gdp_pc": "d42a31086be1fafd"}}
```

The next run publishes it, as long as the staged data still has that hash. If the source changed
in between, the hash will not match and the new data is reviewed instead. Approving also records
the definition as confirmed in `pipeline/config/definitions.json`.

## Observed, estimate, projection

Each value carries a status taken from the source's own metadata, never from today's date.

- **IMF (WEO through DataMapper)**
  - `observed` up to the IMF's "latest actual annual data" year for that economy and area (national accounts, prices, government finance or balance of payments);
  - `estimate` after that year and before the edition's first projection year;
  - `projection` from that year on.
  
  The latest-actual years come from the edition's Database Appendix, read once per edition into
  `config/editions/weo-<edition>.json` by `python3 -m pipeline.sources.weo_appendix` (needs `pdftotext`).
  The projection start year is taken from the IMF's own statement in the same edition
  ("projections for 2026–31" in October 2026). The world total before that year is labelled `aggregate`.
- **World Bank:** `reported`. The API's per-value status field is blank, so the pipeline does not
  claim to know which values are estimates.
- **Income group:** `classification`. The API does not date it.

## Files

```
pipeline/config/indicators.json   the indicators, their source codes, units and thresholds
pipeline/config/countries.json    code exceptions (Kosovo UNK/UVK/XKX, Palestine PSE/WBG) and known aggregates
pipeline/config/sources.json      endpoints, timeouts, back-off, which sources review new editions
pipeline/config/editions/         IMF latest-actual tables, one per WEO edition
pipeline/config/definitions.json  definitions a person has confirmed
pipeline/config/approvals.json    held updates a person has approved
data/raw/<source>/<sha>.json.gz   responses exactly as received, stored once per content
data/normal/<id>.json             last good data per indicator
data/history/<id>/<edition>.json  the previous edition, kept when a new one is published
data/review/<id>.json             held updates with their reasons
data/atlas/pipeline.json          the slice the atlas will embed (2015-2031)
data/manifest.json                per source and indicator: last attempt, last success, state
data/UPDATE_LOG.md                one line per indicator per run, newest first
```

## Sources and how often they are checked

The weekly run (`--scheduled`) skips any source checked more recently than its `check_every_days`
in `pipeline/config/sources.json`; it reports "not due" and fetches nothing. Manual runs and approvals
always fetch. After an indicator's first review, a new release that passes every check is published
on its own; only unusual changes come to you.

| Source | What | Publishes | Checked |
|---|---|---|---|
| IMF DataMapper | GDP, GDP per person, growth, inflation (all countries) | April and October | every 13 days |
| World Bank API | GDP per person, income groups | several times a year | every 6 days |
| NBS homepage dashboard | headline, core and food inflation; fuel prices; quarterly GDP growth (Nigeria) | monthly / quarterly | every 6 days |
| CBN exchange-rate API | official naira rate per US dollar | daily | every 6 days |

## Behaviour of the sources (verified on 24 Oct 2026)

- **IMF DataMapper**
  - Returns every economy and year for an indicator and ignores country and year filters in the URL.
  - An unknown code returns HTTP 200 with no values; the pipeline treats that as a failure.
  - The indicator list names the edition ("World Economic Outlook (October 2026)").
  - The newer IMF API at api.imf.org answered 503 "no healthy upstream" on every attempt, so it is not used.
- **NBS** has no data API, and its e-library stopped listing new reports in December 2024. Its homepage
  dashboard carries the latest official CPI (headline, core, food, with monthly history and the index base
  period), average fuel prices and a sentence giving the latest quarterly GDP growth. The page showed a
  malformed food history ("20.31.19.57"); the reader uses only the labelled latest value when a history
  does not parse, and says so in the log. A change of base period counts as a definition change (held).
- **CBN** serves every official rate since 2019 as one JSON list (~8 MB). The raw store keeps only the
  US dollar rows. The atlas's earlier hand-entered rate (₦1,333.64 "on 21 October") matched CBN's
  20 October selling rate; the fetched series fixes the date.
- **World Bank**
  - All-country requests with `mrv` are cached by Cloudflare for about a day.
  - A new request shape can be slow the first time.
  - On 24 Oct 2026 the World Bank's servers returned 502 (bad gateway) for everything not already cached. The pipeline recorded the failure and published nothing for that indicator.
  - An invalid parameter returns HTTP 200 with an error message, which is treated as a failure.
