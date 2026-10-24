# Building the atlas

The live site is `index.html` on the `gh-pages` branch. It is one file with the data and libraries
inside it, so it works offline. Everything needed to rebuild that file is in this repo.

## Layout

```
index.html, sw.js, manifest.webmanifest, icon-*.png, og.png   the deployed site (unchanged)
src/index.html            the app source: markup, styles and all scripts
src/data/*.json           the nine data files embedded into the build
build/dist.py             src/ -> out/dist/index.html and out/standalone/Mental-Map-Atlas.html
build/build_data.py       rebuilds world, facts, physical, cities, nigeria, hist .json
build/build_econ.py       rebuilds econ.json (currencies)
build/build_wpp.py        rebuilds wpp.json from the UN WPP 2024 workbook
build/assemble_now.py     rebuilds now.json from data/extracted/
build/verify.py           rebuilds everything and checks it is identical to what is committed
build/batches/            the batch files used to write src/index.html; already merged, kept for history
data/intermediate/        simplified map layers used by build_data.py
data/extracted/           figures read from source documents, and hand corrections
tests/harness.py          local server and Playwright setup
tests/smoke.py            pass/fail regression check
tests/regression/t*.py    earlier test scripts that still run (they print results; most don't assert)
tests/legacy/t*.py        scripts written for the first design; kept for reference, they no longer run
package.json, package-lock.json   d3 7.9.0, topojson-client 3.1.0 and the map packages, pinned
```

## Build

```
npm ci
python3 build/dist.py              # writes out/
python3 tests/smoke.py             # needs: pip install playwright (and its Chromium)
python3 build/verify.py            # optional: proves the build and data are reproducible
```

`build/verify.py` and the data scripts also need a clone of Natural Earth vector data
(github.com/nvkelso/natural-earth-vector). They look for it next to the repo, or set `NE_GEOJSON`
to its `geojson` folder.

## Publishing (still manual)

Nothing publishes automatically. To release: build, run the tests, copy
`out/standalone/Mental-Map-Atlas.html` to `index.html`, change the cache name in `sw.js`
(for example `mma-v18` to `mma-v19`) so phones pick up the new version, then commit to
`main` and update `gh-pages` to the same commit. GitHub Pages deploys from `gh-pages`.

## Where each data file comes from

| File | Source | Rebuilt by | Reproducible from the repo? |
|---|---|---|---|
| world.json | Natural Earth 1:50m via world-atlas 2.0.2 | build_data.py | Yes |
| facts.json | world-countries 5.1.0 + Natural Earth admin-0 attributes | build_data.py | Yes, with the Natural Earth clone |
| physical.json | Natural Earth rivers, lakes, regions, marine areas, peaks, time zones, bathymetry | build_data.py | Yes, from data/intermediate (see below) |
| cities.json | Natural Earth populated places | build_data.py | Yes, with the Natural Earth clone |
| nigeria.json | Natural Earth admin-1 states and rivers | build_data.py | Yes, from data/intermediate |
| hist.json | historical-basemaps (André Ourednik, GPL-3.0) | build_data.py | Yes, from data/intermediate |
| econ.json | world-countries currencies + Natural Earth economy class + 6 hand corrections | build_econ.py | Yes, with the Natural Earth clone |
| wpp.json | UN World Population Prospects 2024, compact indicators workbook | build_wpp.py | Yes, given the 26 MB workbook (not stored here) |
| now.json | IMF WEO Oct 2026 annex tables; Energy Institute 2026; UN migrant stock 2024; ND-GAIN 2026; Nigeria MPI 2022 | assemble_now.py | From data/extracted only (see below) |

## Known gaps

- **The mapshaper commands** that simplified the Natural Earth and historical layers into
  `data/intermediate/` were run by hand and not recorded. The simplified files are kept,
  so the build is reproducible, but they can't be regenerated from the originals yet.
- **The figures in data/extracted/** were read from PDF and spreadsheet reports by one-off scripts
  that were not saved. The values are kept and traceable to their reports, but re-extracting
  them needs new scripts. Phase 1 replaces the IMF part with an API fetch.
- **Some figures are typed into src/index.html** rather than kept in data files: the conflict list,
  critical minerals, Nigeria's CPI, exchange rate, rebased GDP and monetary poverty figures,
  the country profiles, lessons and quiz questions. They are versioned with the code but
  not separated from it.
- **Eight early test scripts** (tests/legacy: t1, t2, t4 to t9) click a top tab bar that was replaced
  in the v9 redesign. They stop at the same point on the build from before the move, so this is not
  new breakage. `tests/smoke.py` covers the same ground with the current controls.
- The README and the page description still say "seven-lesson course"; the course has 11 lessons.
  Left as is in this phase.
