# Source research and adaptation boundaries

Research completed before sport implementation. Primary baseline: [Epyx computer manual scan](https://www.c64sets.com/california_games/california_games.pdf), hosted by [C64 Sets](https://www.c64sets.com/california_games.html). References below use printed page numbers (PDF page = printed page + 4). No manual scans, ROMs, artwork, or music are distributed here.

## Computer manual findings

- Pages 2–3: practice and selected/all-event competition; six-event order; saved records.
- Pages 4–5: half-pipe combines directional pumping, lip turns, aerials and timed handplants; 75 seconds or three falls.
- Pages 5–6: footbag uses position-dependent contacts, turns and combinations; drops interrupt chains and cost time.
- Pages 6–7: surf riding rewards wave use, turns, curl proximity and successful aerial return; 90 seconds or four wipeouts.
- Pages 7–8: roller skating alternates leg thrusts; holding fire squats, releasing jumps. Obstacles and three falls determine survival.
- Pages 8–9: BMX mixes propulsion, obstacles, ramps and balanced trick landings; two-minute course, distinct serious/easy fall rules.
- Pages 10–11: disc is three throw/catch attempts. Backswing and release timing precede catcher movement; running, reaching and diving catches differ.
- Page 11: competition totals placement points, 5/3/1.

## Platform differences

The [Atari Lynx manual transcription](https://atariage.com/manual_html_page.php?SoftwareID=2413) documents four events: BMX, surfing, half-pipe and footbag. Skating and disc are absent. It uses the Lynx A/B buttons; BMX has a 90-second limit and flip bonuses, surfing allows three solo wipeouts, and footbag has a cumulative-chain scoring scheme. These differ from the computer instructions, so this project does not combine numerical rules and call them a faithful port. The [current publisher's compilation listing](https://store.steampowered.com/app/1399480/California_Games_C64DOSAtariLynxNESSMSGenesis/) also distinguishes versions across C64, DOS, Atari, Lynx, NES, SMS and Genesis. Other console editions are not asserted to be identical.

## Implementation mapping

| Event | Preserved mechanical identity / camera | Intentional simplifications |
| --- | --- | --- |
| Concrete Crescent / half-pipe | Fixed side view, U ramp, slope-aware pumping; lip kick turns, full-speed aerials; held/released handplants | 35s; synthetic momentum and sinusoidal path; common three falls; smaller trick catalog |
| Pocket Gravity / footbag | Fixed full-body view, gravity, move beneath bag, foot/header zones, turn between contacts, chain bonuses | 35s; automatic re-toss after drop and one-second penalty; no horseshoe/double-arch/Doda catalog or bird interactions |
| Glasswater / surfing | Side-on wave, board heading, curl proximity, carved turns, aerial re-entry angle | 35s/three falls; moving within a bounded stylized face; points replace judge ratings; no full wave fluid simulation |
| Boardwalk Beat / skating | Side-scrolling promenade, alternating strides, three lanes, squat/release jump, cracks/cones/balls | 40s; reduced obstacle set; no 360 spins; 2100-unit course |
| Dustline / BMX | Scrolling desert, pedal/brake, terrain ramps, hops, airborne rotation and level landings | 40s; one rotation axis; common three falls; no tabletop/wheelie/serious-injury or finish-pad braking rule; 2400-unit course |
| Last Light / disc | Full field view; power then release timing; catcher chase, overhead and diving catches | 60s ceiling/three throws; Space meter taps replace joystick sweep sequence; no distinct left/right running-catch awards |

Practice does not update competition records. Single-player meets award medals against visible fixed targets, not simulated opponents; sum medal points rather than incompatible raw sport scores. Original names, drawing code, geometric figures, and optional oscillator feedback were created for this game. No copied melodies, branding, sprites, levels or program code.
