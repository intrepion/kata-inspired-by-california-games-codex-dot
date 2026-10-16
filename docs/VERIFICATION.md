# Verification

## Automated checks

- Strict TypeScript and optimized Vite production build pass.
- 32 deterministic unit/behavior tests pass: pumping, lip turns, timed handplants, aerial scoring, footbag positioning/headers/turn combos/drop penalties, surfing risk/carving/re-entry/falls, alternating skating strides/squat-release jumps/lane avoidance/collisions, BMX ramps/hops/balanced flips/braking/falls, disc power/release/catcher/catch/miss/three attempts, every event timer, frozen results, meet order/medals/restart, versioned storage validation and isolation/denial.
- Eight isolated headless Chromium integration tests pass. They use keyboard/mouse inputs and a paused virtual clock advanced through animation frames; they do not write sport state or use gameplay debug hooks. Observable assertions include pipe trick scores and three-fall results; footbag turn combo and practice retry; surfing cutback/aerial/wipeout; skating jump/low-roll scores; BMX rock clearance/full-flip/bad landing; disc overhead catch/attempts; full six-event meet, final scoreboard, restart, record reload, reset isolation; desktop/mobile overflow checks.
- Desktop and 390px mobile home screenshots visually inspected. Preview is a detached production server bound only to 127.0.0.1:5225. No public website deployment is configured.
- Installed dependency audit reports zero known vulnerabilities after upgrading Vitest.
- All three official GitHub Global OS ignore templates were retained byte-for-byte, including macOS special-character patterns.

## Independent reviews

Two independent reviewers examined the initial commit against the empty Git tree, AGENTS.md, specification and research.

**Standards review:** found a BMX exploit where absolute angle accumulation rewarded rocking as a full flip. Resolved with signed rotation and an oscillation regression. Reviewer reran focused BMX tests and confirmed the fix. No further actionable regressions found in follow-up review. Also aligned the drawn pipe surface with the actual rider trajectory and rejected contradictory pumping inputs.

**Spec/fidelity review:** independently identified the same BMX issue, an inaccurate curl multiplier label, and browser assertions that did not prove the tricks named in test titles. Resolved the scoring exploit, changed the cue to “curl bonus,” and added explicit trick/failure assertions. Follow-up review confirmed the fixes and camera/rule mapping. Its remaining footbag evidence note was resolved with a visible turn-combo assertion, then that test passed.

## Native Mac Chrome acceptance

Performed only after explicit release of the shared browser from the other project. Used a new acceptance tab; prior tabs, saves, project files, preview listeners and system security settings were preserved. Normal browser inputs only; no state injection, browser-console shortcuts, virtual time or test hooks.

Played every event to its result within one complete meet:

| Event | Score | Observed native actions and outcomes |
| --- | ---: | --- |
| Half-pipe | 595 | Alternating pumps, successful kick turn, held/released handplant (+415), mistimed trick falls, timer result |
| Footbag | 75 | Kick (+25), movement, turnaround input, header (+50), dropped chain and one-second penalty, timer result |
| Surfing | 534 | Board rotation, carved turn, successful aerial re-entry (+300), flats wipeout, three-fall result |
| Roller skating | 160 | Alternating stride acceleration, crouch-release crack jump (+80), held squat under ball (+40), lane movement, collision and three-fall result |
| BMX | 980 | Pedaling, rock hop (+100), automatic ramp launch, full flip with level landing (+500), brake, off-balance landing failure, timer result |
| Flying disc | 1008 | Both green meter stages, catcher movement, overhead catch (+462), dive catch (+546), poor throw/miss, exactly three attempts and result |

Final scoreboard: **9/30 medal points**. “Enter another meet” returned to event 1. Reload retained best meet 9/30 and all six competition records. Pause/resume repeatedly froze and restored the active run. The playable home tab was retained, then exclusive native browser ownership was explicitly released.

[Native final scoreboard screenshot](evidence/native-meet.png) is captured from the native browser, not an automated reconstruction.

### Native coverage limits

Successful pipe aerials and successful footbag turn combinations were not demonstrated natively (both were attempted); these are covered by deterministic tests, and the headless UI suite confirms turn-combo success. Native touch input, all medal tiers, all possible trick variants and denied-storage mode were not exhaustively played. Mobile layout was checked in isolated headless Chromium rather than on physical mobile hardware. These limits do not imply exact emulation; see RESEARCH.md for intentionally omitted original rules.

## Public source hygiene

Staged tracked source was scanned for personal filesystem paths, credential patterns, private keys and environment files. No findings. Dependencies, generated build output, browser profiles, transient logs and test reports are ignored. The only committed screenshot contains this game's scoreboard, with no browser chrome or unrelated content. The repository is public, licensed MIT, and contains no original-game assets or manual scans.

The GitHub Actions “Game checks” workflow runs unit tests, strict build and isolated browser tests on each push. Final commit identity and its exact CI run are reported with delivery; consult that run rather than an earlier commit's status.
