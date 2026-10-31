# Stage 2: Meet Nigeria again

Implemented following the approved [plan](PLAN.md). Stage 1 was merged in [PR #10](https://github.com/okunomodammy-pixel/atlas/pull/10). This stage is prepared directly above updated main `8101d7af798d977f428ab747a220de1f69f90ae0` on the separate review branch `codex/stage-2-nigeria-journey`, retaining the data update published after Stage 1.

## The experience

The Explore screen leads with a journey through five places: Lagos, Ibadan, Lokoja, Kano and the Obudu highlands. Each stop combines an original illustrated field note, a short story, something to notice on the existing map, optional deeper reading, two challenges, a personal note and source links.

The tone is for curious adults and young adults. Readers can jump to a stop or read on without doing its challenges. There are no timers, compulsory sign-ups, daily-streak penalties or paid map services.

Ten stable challenges practise location plus a second skill at each place: landscape, direction, river systems, culture/place connections or relief/climate. Lettered map markers are interactive and keyboard-accessible; equivalent answer buttons are available in the reading panel. Labels are shuffled between questions and persisted during a question so reopening does not silently change an unfinished answer.

After the five stops, a reconstruction asks for all five places in a shuffled order. The field journal records which stories were opened, challenges tried, personal notes, reconstruction results and skills recalled in later scheduled reviews. Its stamp says **Journey explored**, rather than claiming lasting mastery or a physical visit.

## Memory and saving

- `saved.journeys['nigeria-again']` holds the cursor, visited stories, notes, task history, reconstruction and review session.
- `saved.placeSkills['NGA:<stop id>'][<skill>]` separates attempts, correct answers, assistance and the latest practice day by place and skill. These belong to the current browser's explorer record; independent family profiles remain Stage 3 work.
- Question IDs such as `journey:nigeria-again:lagos-locate` use the existing spaced-review scheduler in `saved.srs`. Journey review appears alongside lesson review on Explore, Learn and Play, while retaining spatial questions rather than turning all review into text-only quizzes.
- Wrong and hinted answers return the next day. A correct hinted answer records assistance without inventing a wrong-answer count or advancing delayed-recall strength. Early and same-day practice preserve the existing interval.
- Reading on queues untried tasks without recording them as mistakes. Passing through a story is not treated as evidence of recall.
- The cursor and answered feedback persist immediately, so reopening during feedback does not add a second attempt. Notes are escaped when displayed and limited to 600 characters. Stage 1 saving warnings remain active.
- The original `mma.v1` key, schema-2 lesson passes, scores, visited countries and unknown fields are retained. New records are additive.

## Content, visuals and map provenance

Content is in `src/data/journeys.json`; the interface is in `src/journeys.js` and `src/journeys.css`. The build inlines all three into both build variants. The journey uses the existing Natural Earth country/state/river geometry and approximate atlas positions for cities and the confluence. The Obudu coordinate is a manually placed approximate plateau-area pin, explicitly distinguished from Obudu town.

Sources are linked per stop. Accessible official references inspected during development included Oyo State's background page, Kogi State's confluence description and Cross River State's geography material, alongside the existing atlas's maps/history content. Encyclopedia links provide further geographic and craft context. Some encyclopedia sites refused automated access during this session; this is not a claim of a complete independent editorial fact-check. Family/local review of names, tone, cultural detail and approximate pins remains worthwhile before broad publication.

The original SVG field notes depict water/bridges, roofs/hills, a river meeting, cloth and highlands. They are labelled illustrations, not photographs or precise city views. Photo downloads were unavailable from the sources checked, so no unverified photos or media rights were introduced. A later optional photo pack can follow the agreed 1 MB budget. The current journey needs no image downloads, audio service or network connection.

The line between stops is explicitly a learning connection, not a driving itinerary. Map framing reserves space for search/zoom controls, and leaders separate nearby place markers. Story mode emphasises the current stop; spatial challenges give the map more space on phones.

## Validation — 31 October 2026

| Suite | Result |
|---|---|
| Data pipeline fixture tests | 67/67 passed |
| Browser smoke | 40/40 passed |
| Stage 1 learning foundations | 46/46 passed |
| Guided journey regressions | 47/47 passed |
| Atlas/pipeline integration | 27/27 passed |
| Nigeria | 20/20 passed |

**247 checks passed.** The complete `python3 -m pipeline.release` gate includes `tests/test_journeys.py`. New coverage exercises the full journey and reconstruction, old progress, wrong/hinted answers, next-day review, per-place skill records, feedback resumption, safe notes, shared stop links, deferred practice, incomplete journals and a complete offline run.

After Stage 1 merged and its automated exchange-rate data update landed, this branch was refreshed onto the new main without changing the tested feature code. The 27 atlas/pipeline integration checks and all 47 journey checks were rerun successfully against that latest data. The resource figures below refer to this refreshed build.

At 360×640 and 390×844, checks cover a visible opening Start button, a visible current story pin, answer-marker separation, clearance from search/zoom controls, real pointer/keyboard map input and no horizontal page overflow. They are Chromium/emulated-device checks; physical Android/iPhone, screen-reader and family enjoyment tests remain to be done.

Generated screenshots are `out/test/stage2-story-360.png`, `stage2-story-390.png`, `stage2-map-task-360.png`, `stage2-map-task-390.png` and `stage2-journal-desktop.png`. The desktop journal screenshot contains an example note, not a real user's data. Screenshots and browser tooling are not committed.

## Resource budget and review

The self-contained HTML is **3,669,715 bytes**, an increase of **42,961 bytes** over the latest Stage 1 build. The offline ZIP is **1,143,177 bytes**. The build now fails if the core exceeds the approved 4,000,000-byte budget. No runtime dependency, backend, account system or paid service was added, and the existing six-file publication layout remains intact.

The source-only review branch leaves generated root `index.html` and `sw.js` to the existing release workflow. It does not publish a redesign to the live site. The Stage 2 PR targets main; Stage 1 is already merged. Stage 3 adds separate local explorers, backup/restore and the fuller installed-offline/update lifecycle.
