# Recon, fidelity, the lock ledger, and the select/converge protocol

Read this when running phases A, C, D, E of the loop.

## Recon (phase A) — fill the fact sheet before any fan-out

You cannot course-correct a parallel fan-out mid-flight, so the prep is the work. Produce three things:

**1. Real-data sheet** — structured, text as its own items, with exact values.
- Numbers/counts: pull the *actual* values from the data layer, not estimates. (E.g. derive `tools.length`, sum a resources array, count rows — whatever's real. If a "metric" can't be sourced, drop it rather than invent one.)
- Copy/labels: the real strings.
- Media: real image paths AND their aspect ratio (mockups must frame to the real ratio, not letterbox a guess).
- Distributions: if you'll show a breakdown (by category/subject/type), compute the real split that sums correctly.

**2. Shared tokens** (`gacha/tokens.css`) — the physical lock.
- One CSS-variable block: brand colors, type scale, radius, spacing, font families.
- Every mockup `@import`s it and uses `var(--…)`. **No mockup redefines a value.** This is why divergence stays in layout, not in remembered hex codes.

**3. Fidelity list** — the verbatim no-touch set, reasserted in every divergence prompt:
- real data · shared tokens · any user-approved element.
- Rule: a mockup that uses placeholder content, edits a locked dimension, or changes a token value is **rejected and redone** — it doesn't reach the user.

> If the fact sheet has holes (missing real numbers, unknown data shape), go fill them (read data files / inspect the API) **before** fanning out. Faking it poisons the whole round.

## Show protocol (phase C)

- Screenshot all N + serve them; give the user URLs and the images. **Side-by-side in a real browser is mandatory** — showing one at a time gets inflated "looks fine" approvals; multiples give the user "permission to criticize" (Tohidi & Buxton 2006).
- One-line frame: *"This round only varies {axis}. Data/tokens/approved bits are identical in all of them — don't compare those; react to {axis}."*
- Ask for **relative** judgment: pick / rank / "winner + worst". Not a numeric score (pairwise is ~1/3 faster, more consistent, lower cognitive load, and far less swayed by irrelevant attributes — 35%→9% preference-flip).
- **Randomize order. Don't seat your favorite first.** For a decisive A-vs-B, ask once in each order.
- Ask *why before which* (reason precedes verdict).

## Extract → ledger (phase D) — I Like / I Wish / What If

Convert reactions to **verdict + actionable constraint**, never raw quotes. The user locates problems; you infer the fix.

- **I Like** → lock it. New row(s) in the ledger.
- **I Wish** → a narrowing constraint / exclusion for next round.
- **What If** → the divergence axis for next round.

Then **echo**: "Locked this round: …. Next round we diverge on: … with N=…."

### Ledger template (`gacha/ledger.md`)

```
# Lock ledger — {target}
Round: {r}   Mode: {A/B}

## LOCKED (held verbatim in all future mockups)
| dimension   | locked value                          | from      | approved by (user phrase)        |
|-------------|---------------------------------------|-----------|----------------------------------|
| layout      | mirror: left stack + right hero       | r2/mock-4 | "go with 4's structure"          |
| palette     | subject-colored tiles, dark base      | r3/mock-2 | "this style is the one"          |
| data-viz    | square-tile matrix + count            | r4/mock-1 | "use these little squares"       |
| ...         | ...                                   | ...       | ...                              |

## FIDELITY (never touch — real)
- data: {…}   tokens: gacha/tokens.css   approved: {…}

## OPEN (still diverging)
- this round's axis: {…}
- next axis (from What If): {…}

## REJECTED (don't resurface)
- {culled takes / "I Wish" exclusions}
```

Element-level + cross-merge is allowed: "A's palette + B's layout" → two rows from two sources. **Before locking two merged rows, confirm they can coexist.** If they pull opposite ways (density vs whitespace, flat vs dimensional, restrained vs expressive), do NOT lock both — the fidelity rule would then reject *every* next-round card for violating one lock, deadlocking the round. Surface the tension as the next divergence axis instead: *"m4's density and m2's airiness pull opposite ways — which wins, or shall next round diverge on resolving exactly that?"*

The ledger is also the **regularizer**: it stops each round from over-fitting the last comment and drifting (best-of-N reward-hacking). Keep a snapshot per round so the user can say "go back to round k" and re-fork.

## Converge (phase E) — three questions

1. Did the user approve — "that's the one / build it"? → **finish (F)**.
2. Stalled — 2 rounds with no new LOCKED row? → **switch the divergence axis** (current axis is exhausted).
3. Hit the round cap (5–6)? → **force-finish** with the best-locked state (hard backstop against infinite divergence).

Any one true → stop gacha. None → run another B→E round on the chosen axis.

**Special case — total miss (the user rejects all N):** the AXIS or framing is wrong, NOT a sign you need more cards. Ask ONE diagnostic (*"none of these — is it the {axis}, or something none tried?"*), then re-diverge on a *different* axis (or widen, feeding the rejected set as "must not resemble"). Do NOT re-roll the same axis at a higher N — more cards on a mis-framed axis just burns the round.

**Re-fork:** if the user later says an earlier round was better, reload that round's ledger snapshot as the live ledger, drop the locks added after it, and resume B on that round's open axis — the per-round snapshots exist for exactly this.

**Terminal:** done = the user approves the *landed, real-data* UI in phase G — not a mockup. Until then you're still in the loop.
