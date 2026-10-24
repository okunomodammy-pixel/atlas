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

## Behaviour of the sources (verified on 24 Oct 2026)

- **IMF DataMapper**
  - Returns every economy and year for an indicator and ignores country and year filters in the URL.
  - An unknown code returns HTTP 200 with no values; the pipeline treats that as a failure.
  - The indicator list names the edition ("World Economic Outlook (October 2026)").
  - The newer IMF API at api.imf.org answered 503 "no healthy upstream" on every attempt, so it is not used.
- **World Bank**
  - All-country requests with `mrv` are cached by Cloudflare for about a day.
  - A new request shape can be slow the first time.
  - On 24 Oct 2026 the World Bank's servers returned 502 (bad gateway) for everything not already cached. The pipeline recorded the failure and published nothing for that indicator.
  - An invalid parameter returns HTTP 200 with an error message, which is treated as a failure.
