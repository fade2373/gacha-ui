# Walkthrough — one concrete round, start to finish

A single round shown end-to-end so the *rhythm* is concrete. The two steps models botch most are **D (turn the user's words into ledger rows)** and **E (pick the right converge branch)** — those are shown in full; recon/serve mechanics are compressed. The numbers and quotes here are illustrative; in a real run they come from the actual repo and the actual user.

Target: the cheap-looking stats strip at the top of a workspace dashboard. Mode A (refine existing).

---

### Gate 0
> "Using gacha-ui: I'll make N=5 throwaway mockups (mode A) of the top stats strip, serve them side-by-side so you pick, then narrow each round."

### A — recon (the fact sheet, filled — not invented)
- **Real data** (pulled from the data layer, e.g. `data/metrics.ts`, not guessed): projects = 12 (3 active); tasks = 248 (32 due this week); members = 9. Status split that sums to 248: Todo 96 / In-progress 51 / Review 34 / Done 67.
- **Tokens** → `gacha/tokens.css`, copied into `round-1/`: `--bg:#0b0d12 --accent:#4cc4ff --ok:#3ee667 ...`. Every mockup `@import './tokens.css'`.
- **Viewport**: desktop (1280) — that's where this dashboard is used.
- **Fidelity list** (reasserted in the prompt): the numbers above · tokens · nothing approved yet (round 1).

### B — diverge on ONE axis: **data-visualization** (how the numbers are shown)
Five constraint cards, each a distinct persona + a different region of the option-space (see diversity-recipe.md):
1. `big-number` — restrained: huge numerals, tiny labels.
2. `tile-matrix` — one square tile per item, filled = colored.
3. `bar-breakdown` — horizontal status bars.
4. `ring-dial` — radial gauges (contrarian/tail pick).
5. `editorial` — magazine-style with one lead stat (tail pick).
→ `gacha/round-1/mockup-1..5.html` + `tokens.css`.

### C — show & select
`node scripts/serve-and-shoot.js gacha/round-1` → grid gallery at `http://localhost:8127/_index.html`. Give the user the URL + the 5 PNGs.
> "This round only varies how the numbers are *visualized* — data, colors, fonts are identical across all five, don't compare those. Why do you prefer the one you pick? Then: winner, and worst?"

User: *"The rings in 4 are too busy — that's the worst. I like 2's little squares, you read the count at a glance; but 2's colors feel muted, 3's palette is nicer."*

### D — extract → ledger (the load-bearing step)
Convert words to **verdict + constraint**, never raw quotes. The user locates problems; you infer the fix.
- "like 2's little squares, read the count at a glance" → **I Like** → LOCK: data-viz = square-tile matrix. (source r1/m2, phrase "count at a glance")
- "2's colors feel muted, 3's palette is nicer" → cross-merge: keep m2's tiles but take **m3's palette** → LOCK: palette = m3's. (source r1/m3) ← *check first: tile-matrix + m3 palette can coexist? yes, no contradiction → lock both.*
- "the rings are the worst" → **I Wish (exclusion)** → REJECTED: radial/ring dials. Don't resurface.
- not yet settled: layout/arrangement of the tiles → **What If** → next round's axis.

Ledger after this round (`gacha/ledger.md`):
```
## LOCKED
| data-viz | square-tile matrix + count | r1/m2 | "count at a glance" |
| palette  | m3's (softer)              | r1/m3 | "3's palette is nicer" |
## REJECTED
- radial/ring dials ("the worst")
## OPEN
- next axis: tile layout / arrangement
```
**Echo back:** *"Locked: square-tile matrix (from 2) + palette from 3. Next round diverges on tile arrangement, N=4."*

### E — converge check
1. Approved overall? No — still refining. 2. Stalled (2 rounds, no new lock)? No, just locked 2 rows. 3. Round cap (5–6)? No (round 1).
→ none true → **run another B→E round on the new axis (tile layout), N=4.**

*(If instead the user had said "none of these work" — total miss — the signal is the AXIS is wrong, not that you need more cards: ask one diagnostic, re-diverge on a DIFFERENT axis; do NOT re-roll data-viz at higher N.)*

---

When converged (user: "that's the one, build it") → **F**: build it in the real stack with the real `metrics.ts` source, reuse `tokens.css`, match every ledger row → **G**: screenshot, visual-diff vs the approved mockup, fix only the differing regions.
