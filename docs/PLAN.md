# Atlas: practical improvement plan

31 October 2026 — approved by the owner in ChatGPT. Stages 1 and 2 are merged; Stage 3 is in development. The owner subsequently approved combining remaining development on one branch and reviewing one release instead of merging each stage separately.

## Product direction

Build for the owner and their approximately 18-year-old nieces and nephews: curious people who want to discover their own country and understand the world. Welcome younger learners through clarity and optional help. Keep the tone intelligent, warm, playful, and respectful of adults. This updates the child-first framing in the initial audit.

The product promise: **Explore somewhere. Understand something. Play with what you discovered. Remember it later.**

Preserve the existing atlas, advanced statistics, history, and free exploration. Add a guided journey through them. Avoid compulsory lessons, childish praise, punitive daily streaks, and ranking people's countries by worth. Represent everyday life, culture, ingenuity, landscapes, and history alongside economic conditions and challenges.

## Resources verified

| Resource | Observation | Implication |
|---|---|---|
| Repository | Public; `okunomodammy-pixel/atlas` | Existing public-repository Pages and standard Actions model can continue. |
| Current files | 194 files, 14,749,867 bytes at main `ec60fc3b8a7fadd1b9d9301844e3b38f642168a8` | About 14.75 MB of current checked-in content, excluding the full Git history. |
| Repository API size | 10,416 KB reported by GitHub | A separate GitHub metric; not the same measurement as adding current file sizes. Neither indicates a current storage problem. |
| Published six files | 3,943,781 bytes | About 3.94 MB before transfer compression; HTML alone about 3.62 MB. |
| Source map/data files | About 2.5 MB locally | Already enough for the proposed map interactions; no new map service required. |
| Workspace | About 6.6 GB available at inspection | Enough room for this work. Temporary browser tools (~656 MB), node modules (~166 MB), and npm cache (~45 MB) are development dependencies, not app downloads. Workspace availability does not establish permanent storage. |
| Existing validation | 40/40 browser smoke checks and 67/67 pipeline checks passed during the audit | Keep these and add checks for the newly identified failures. |
| Account-wide billing | Not inspected | No claim about remaining paid-service credits, account-wide artifact storage, or spend settings. |

GitHub's official documentation checked on 31 October 2026 states:

- Published Pages sites may be no larger than 1 GB; Pages source repositories have a recommended 1 GB limit.
- Pages has a soft bandwidth limit of 100 GB/month. It is not an unlimited media host.
- Standard GitHub-hosted Actions runners in public repositories remain free. Larger runners are billed. Storage is a separate allowance; GitHub Free lists 500 MB artifact storage, shared with Packages. The present workflow does not upload test screenshots as retained Actions artifacts.
- Ordinary repository files above 50 MiB generate warnings; GitHub blocks files above 100 MiB.

Sources:

- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github

The first release should need no new paid hosting, database, map subscription, or runtime AI service, assuming the existing public-repository hosting arrangement continues. ChatGPT/Codex subscription and usage limits remain separate from app hosting.

## What can be built with the existing stack

**Immediately feasible:** route and place highlights on the current map; guided story cards; map challenges; hints; per-place skill tracking; review queues; private local explorer profiles; progress export/import; a passport or travel journal; mobile layout improvements; a small curated photo pack; offline availability indicators; graceful update handling.

**Feasible with limitations:** device speech synthesis can offer optional read-aloud when supported, but voices, pronunciation quality, and offline support vary. Reliable prerecorded narration needs licensed or recorded audio and a storage budget. Photos need verified rights, credits, and careful selection. Content can be drafted and sourced here, but local knowledge and pronunciation benefit from human review. Physical low-end phone performance and personal enjoyment need testing by actual users.

**Defer:** account-based cross-device sync, live multiplayer, global leaderboards, personalised live AI tutoring, street-level imagery, full satellite downloads, and offline video tours. These need additional services, usage arrangements, substantial media, or more operational work. They are not needed to prove the core experience.

No map-specific connector was found among the available tools. A map displayed inside ChatGPT does not by itself grant an embeddable map SDK, imagery rights, offline maps, or a free API for Atlas. The current D3/Natural Earth map can support this plan independently. A specific ChatGPT map feature can be evaluated later if identified.

## Architecture and proposed budgets

- Continue the static app on GitHub Pages. Run learning logic on the device; do not add a server for the initial release.
- Keep current atlas navigation available. Add Journeys as a clear primary invitation, without forcing a new user through setup.
- Put new journey content into structured data files, separate from presentation. Each stop has an ID, place coordinates or shape reference, short narrative, sources, optional credited media, tasks, and skills practised.
- Use a small learning module that records attempts by explorer, place, and skill. Review questions must use stable IDs. Version saved data and migrate the existing `mma.v1` record rather than resetting it.
- Keep changes targeted. Avoid a framework migration or wholesale rewrite of the large source file. Separate new logic where useful, then bundle it so offline distribution remains intact.
- Proposed first-release budget: core standalone HTML no larger than 4 MB uncompressed; optional first journey image pack no larger than 1 MB total; approximately five WebP/AVIF images targeted at 100–150 KB each, with WebP compatibility considered. These are acceptance targets to measure, not current promises.
- Keep all learning tasks usable without photos or audio. Offer one complete offline download for the core, and an explicit opt-in for extra media.
- Cache one canonical app document where possible; bound cache contents and remove obsolete versions safely. Current cache installation stores both `./` and `index.html`, which can duplicate the page.
- Add no video in this first version. Load no large development tools into the deployed app. Keep browser downloads, caches, node_modules, and routine screenshots out of Git.
- Keep brief source/credit records. Do not repeatedly replace large media files in Git; history retains prior versions. Review repository and deployed sizes at each release.
- Keep the current weekly data-update cadence. Avoid new hourly jobs or retaining every test artifact. Measure actual Actions/cache storage if a problem emerges.

Installed app storage and available browser quota depend on the user's device and browser. Show download sizes, handle quota failures, and distinguish cache storage from saved learning progress. Do not promise that installation prevents a browser or user from clearing data.

## First journey proposal: “Meet Nigeria again”

Use five stops that show different ways of living and different landscapes:

1. **Lagos:** coast, lagoon, movement, and city life.
2. **Ibadan:** an inland city, local history, and connections to the surrounding region.
3. **Lokoja:** find where the Niger and Benue meet; understand the river system.
4. **Kano:** trade, craft, city history, and the north.
5. **Obudu area:** highlands, terrain, and how altitude changes the environment.

This is a curated map journey, not a driving itinerary. Exact stops, wording, and images need factual and source review. Add a source to each meaningful claim, and keep uncertainty visible where needed.

Each stop has a short introduction, an optional deeper section, a map action, and one or two questions. The journey ends with reconstructing the places or route and an entry in a personal travel journal. Wrong answers give useful hints. A later review revisits weak places. Adults can take their time, skip familiar material, or open the full atlas page.

“Follow the Niger” remains a good second journey, extending from a familiar Nigerian river system into neighbouring countries. A further global journey should follow a clear connection—food, music, rivers, migration, or trade—rather than a random country list.

## Build sequence and acceptance criteria

### Stage 1 — Reliability and the foundation for learning

Address audit priorities 3–6: cancel quiz timers on exit; repair dialog focus handling and restore focus; improve reading/map space on small screens; distinguish a passed check from durable mastery; prevent immediate retries from inflating spaced-recall progress. Add explicit handling for failed saving. Preserve existing progress.

Done when the existing test suites pass; exiting during feedback cannot overwrite another screen; keyboard focus stays in dialogs; old saved progress migrates; first-lesson checks no longer imply full remembered coverage; and the owner can read and play comfortably at 360×640 as well as desktop.

### Stage 2 — One complete, enjoyable journey

Address audit priorities 1–3: add the five-stop Nigeria journey, short stories, map tasks, a hint flow, a journal entry, and place/skill tracking that connects to later review. Present a mature visual design. Keep photos optional and within budget.

Done when the entire journey can be finished offline, resumed after reopening, and reviewed later; every stop has traceable sources; every task gives useful feedback; and the owner and nieces/nephews can finish without navigation explanations.

### Stage 3 — Richer content, shared devices and reliable offline use

The owner added content upgrades to this stage on 31 October 2026. Treat editorial quality and enjoyment as a defined workstream alongside the device and storage improvements.

**Content and learning:** deepen the five Nigeria stops with specific, well-sourced details about everyday life, culture, landscapes and how places connect. Food, music, craft, architecture, history and nature are possible entry points; choose what fits each place rather than forcing the same checklist onto every story. Keep the voice suitable for curious adults and young adults, with optional depth and space for personal memories. Review existing country profiles and lessons for accuracy, readability and balance; upgrade the highest-priority material first and record the remaining work, rather than promising a full rewrite of every country in one stage.

Broaden the questions and hints to practise spatial reasoning, comparison and explanation as well as recognition. Preserve stable task IDs and existing progress; when a factual correction changes what a question assesses, version that question and handle its review history explicitly. Add dated source/editorial notes and distinguish fact, interpretation and uncertainty. Resolve unsupported claims before using them as scored answers. Verify media rights and credits before adding an optional photo pack; retain the 4 MB core and 1 MB optional-media budgets.

**Shared devices and offline reliability:** separate local explorer profiles, export/import with validation, visible offline readiness, bounded cache/update behaviour, and graceful storage errors. Offer optional read-aloud only after checking its device support; it must not block the release.

Done when the upgraded Nigeria journey has traceable support for its substantive claims, more varied useful practice, and an editorial changelog; the owner and nieces/nephews can review its tone, interest and difficulty; two people keep independent progress; an exported profile restores correctly; a downloaded journey reopens in airplane mode; a failed media download does not break the core; and an app update preserves profiles and progress. Confirm on an actual inexpensive Android phone, not just browser emulation. Content review and device testing are part of readiness for the wider launch; the Stage 2 family pilot can happen sooner.

### Stage 4 — Refine from family use, then expand

Use feedback from the intended adults and young adults to improve pacing, tone, interests, and difficulty. Add the next journey only after the first is enjoyable and understandable. Explore more languages, richer audio, and optional backup sync when there is evidence of need.

Measure first-task discoverability, completion, clarity of feedback, next-day/week recall, and willingness to take another journey. A short family pilot gives useful direction but is not proof of universal learning gains.

## Review checkpoints

The owner approved this direction, first journey, sequence, and resource budgets on 31 October 2026. Stages are development and validation milestones, not mandatory separate merges. Keep remaining work on one reviewable release branch/PR, with screenshots and test evidence, then merge once the release is ready. Prepare the Stage 4 family pilot alongside Stage 3; implement feedback-dependent refinements after actual use. Do not publish an unreviewed redesign to the live app.

“Meet Nigeria again” is the agreed first journey. Refine individual stops and content during Stage 2. Map-provider integration is not a dependency for this plan.
