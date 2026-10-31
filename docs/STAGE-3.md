# Combined release: content, explorers and offline use

## Implemented for review

The owner authorised merging and launching this release for a phone-based family pilot, with further refinements based on live feedback. The interface adds warm paper and sea-glass colours, rounded cards and passport-stamp details, preserving dark mode and reduced-motion preferences.

- Five Nigeria stops now offer fifteen challenges, including selecting multiple clues, ordering a river's downstream connections, estimating distance, and choosing useful maps. Original illustrations remain available offline.
- Each stop adds a connection to everyday life and dated editorial notes. Ghana, Benin and Cameroon receive targeted profile clarifications; the Holy See/Vatican convention is clarified.
- Local explorers keep separate notes, scores and review schedules. Create, switch and rename explorers; download one or all profiles, preview a validated backup, and restore it as additional profiles.
- Existing progress migrates into `mma.explorers.v1`. The original `mma.v1` stays untouched for recovery. Other tabs and storage failures cannot silently overwrite the explorer collection. These profiles are shared-device conveniences, not private logins.
- Offline installation verifies a bounded cache of one app document and three installation assets. Updates wait for an explicit save-and-apply action. A failed download preserves the last working edition. Worker and asset changes also produce distinct versions.
- The downloadable ZIP includes all six hosting files. The standalone HTML includes the core atlas, libraries and journey; progress backups remain separate from app downloads.

## Editorial changelog and limits

Edition: 31 October 2026. Lagos distinguishes straight-line map distance from rail journeys; Ibadan adds inland and southwest anchors; Lokoja practises confluence-to-delta connections; Kano practises transport and market connections; Obudu distinguishes terrain/climate maps from political labels.

The old `kano-craft` scored prompt is replaced by `kano-links-v2`. Historical answers remain historical; the replacement begins fresh review. An unfinished review substitutes the revised question without counting an old answer twice. Completed review results remain unchanged.

Journey sources and their scope are recorded in `src/data/journeys.json`. Official Nigerian Railway Corporation material was accessible during review. Some further-reading sites returned blocked or unavailable pages; their links do not constitute independent verification of every claim. No unverified precise craft-history claim is used as a scored answer. This is a targeted editorial upgrade, not a completed fact-check of every country profile.

Remaining editorial work: local review of all five stories and their cultural nuance; systematic country-profile and lesson audits; source-link maintenance; pronunciation review before narration; licensed, credited photos only if they materially improve the experience. No new photo or audio dependency is added to this release.

## Family pilot and release review

Stages 3 and 4 share one release branch. Actual use supplies the Stage 4 refinements; development cannot substitute for that evidence.

1. On an inexpensive Android phone, open the preview, find the journey, complete Lagos and continue without navigation coaching. Check reading comfort and touch targets.
2. Have two people create explorers, write different notes, switch, export and restore a backup. Explain that clearing browser data can remove local progress.
3. Confirm readiness while online, reopen in airplane mode, complete a stop and reopen again. Check an update preserves both explorers.
4. Ask which story was interesting, which question was confusing, whether difficulty felt fair, and whether they want another journey. Revisit a few places the next day and week.
5. Record problems and refine pacing, wording and navigation before the combined release. Choose the next journey after this feedback.

Automated browser emulation and service-worker checks support this review. Physical phone performance, OS installation behaviour, enjoyment and local cultural review still require people using real devices. No launch date is guaranteed by passing automated checks.
