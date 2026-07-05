---
name: gacha-ui
description: >-
  Explore UI directions by generating several genuinely-different real-data HTML mockups
  in parallel, serving them so the user picks side-by-side, distilling each pick into
  locked constraints, and narrowing round by round until approved — then landing the
  winner in the real stack and refining. Use when the user wants to COMPARE concrete
  options rather than accept one guess: "this section looks cheap / off", "make it look
  better", "redesign this", "show me some other directions/styles", or designing a new
  surface where the look is unsettled. NOT for: pure logic/data bugs, a known one-line
  CSS tweak (just do it), or writing a brand-new page when the user has NOT asked to
  compare options (use frontend-design for a single high-quality draft).
---

# Gacha-UI: divergent UI design by parallel mockups + human-in-the-loop selection

**One line:** diverge on FORM, lock the TRUTH. Generate several genuinely-different throwaway HTML mockups built on *real data*, show them side-by-side, let the human point at the winner, distill that pick into hard constraints, and narrow each round until they say "that's the one" — then build it for real.

**Why this works (not just taste):** parallel prototyping measurably beats iterating one design, and the gain comes specifically from *showing* multiples side-by-side — not from merely making them. Three mechanisms you must preserve: **side-by-side comparison**, **delayed commitment**, and **self/work separation**. So "serve N and let the human pick" is the value, not decoration. It's Anthropic's **parallelization (voting) → evaluator-optimizer** loop, human as evaluator.

→ Evidence + citations: `reference/why-parallel-prototyping.md` (read only if you need the receipts).

## The two non-negotiables

1. **Diverge on form, lock the truth.** Every round varies exactly ONE unsettled dimension. Everything already decided — plus *real data, brand tokens, and user-approved elements* — is held byte-for-byte identical across all N mockups. Divergence you can attribute; fidelity you never break.
2. **The human points; you don't guess for them.** There is no universal "good-looking" (expert agreement barely beats chance) and auto-judges miss aesthetic/brand fit. So you ALWAYS render and show; the user always makes the real pick. (You may *optionally* auto-cull obviously-broken/near-duplicate cards before showing — never auto-judge which design is *better*.)

> **HARD-GATE — never skip the show.** You MUST serve all N mockups and let the human pick. Do NOT collapse to one, pre-pick a "winner", or describe options in prose. *Generating* multiples only widens your own exploration; only *showing* them raises quality. Skipping the show nullifies the whole method.

## Two modes

- **Mode A — Refine existing UI** (the common case): there's a component/page the user dislikes. Read it + screenshot it as the baseline. Round 1 diverges on the single most-unsettled dimension.
- **Mode B — Design from scratch**: no UI yet, look is open. Round 1 diverges on the broad **archetype** (e.g. console/HUD, bento, editorial, radial-dashboard, card-wall…). Later rounds narrow exactly like Mode A.

Decide the mode in Gate 0. Everything after is identical.

---

## The loop

Run these in order. It's re-entrant: rounds repeat B→E until converged.

### Gate 0 — Should we even gacha? (simplicity-first)
- Judge scope. A **one-line tweak or a fully-specified change → just do it**, no gacha. Heavy parallel flow is for *unsettled* visual direction. (Models over-trigger heavy flows; this gate is the throttle.)
- Pin the **single target block/component** with clear boundaries.
- Pick the **mode** (A or B).
- **Announce** one line to the user so they see the plan (and that you considered *not* gacha-ing): *"Using gacha-ui: I'll make N=__ throwaway mockups (mode __) of __, serve them so you pick side-by-side, then narrow each round."* — or, for the no-gacha branch, *"This is a one-liner / fully-specified, not a gacha case — doing it directly."* Once you fan out you can't course-correct mid-flight, so the prep below must be solid first.

### A — Project profile + real-data recon (do this fully or don't start)
The skill is stack-agnostic; establish the profile once, then reuse it every round. Detect from the repo; ask only what you can't infer.
- **Stack & preview**: framework (React/Vue/Svelte/static…), how it's served, how to take a screenshot. *Default toolkit when nothing else fits:* standalone HTML mockups + a static server + Playwright screenshots (see `scripts/serve-and-shoot.js`).
- **Design tokens**: pull the real brand colors / type scale / radius / spacing into ONE shared CSS-variable block (`gacha/tokens.css`). **Copy it into each round dir** so every mockup `@import`s `./tokens.css` — a sibling path (`../tokens.css`) renders under `file://` but 404s over the local server, so screenshots and the served gallery would silently disagree. Mockups never redefine values. (shadcn-style physical lock — divergence happens in layout, not in remembered hex codes.)
- **Real data**: the actual numbers, copy, labels, image aspect ratios. Structured list; text as its own items. **Never lorem/placeholder** — a winner chosen on fake content breaks on real content and the feedback is junk. If you don't have the real data yet, go get it (read the data files / API shape) before fanning out.
- **Target viewport**: ask which width is real — desktop, mobile, or both? Shoot at that width (the script's `[width]` arg; run it twice for both). A winner picked at a guessed width can break at the real one — same fake-context trap as fake data.
- **Fidelity list**: real data + tokens + any already-approved element. This is reasserted verbatim in every divergence prompt.

→ Full recon + fidelity rules: `reference/lock-ledger.md` (Recon section).

### B — Diverge (parallel, voting variant)
- Diverge on the **single most-unsettled dimension** only (from the prior round's "What If"; in round 1, the archetype or the biggest open question).
- Generate **N** throwaway mockups that share the same data + tokens and differ *structurally* on that axis. Each mockup gets a distinct **constraint card + prototype name** (e.g. "Refined-restrained", "Vivid-friendly", "High-density expert") — and, on style-flavored axes, **one named design language from `reference/style-vocabulary.md` as its exemplar** (unique per card; at most one card in the known-AI-mode center listed there).
- **Force real diversity** — independent re-runs collapse to the same typical answer. Use distribution-level instructions ("be mutually distinct; include 1–2 non-mainstream/contrarian takes"), one ordinary-but-different persona per card, and a quick "list the option space first, then split" step. Then drop near-duplicates — checked **blind**: a fresh pass that hasn't seen the constraint cards describes each render's axis-stance in one sentence; collisions = true dupes.
- **Isolate generation (structural, not phrasing).** Map the option-space centrally → assign regions **for max spread (claim both poles first, then tails, then interior)** → generate each mockup in its **own parallel subagent that sees only its constraint card + the fidelity list**, never the other cards' output. One agent writing all N cross-contaminates (one design recolored); N agents on an identical prompt collapse to the mode. One-prompt-producing-N is the fallback, not the default.
- → Full diversity recipe + the divergence prompt: `reference/diversity-recipe.md`.
- Save to `gacha/round-{r}/mockup-{i}.html`.

### C — Show & select (human-in-the-loop — never skip)
- **Serve the live gallery so the user browses side-by-side in a real browser — this is the load-bearing step.** Run `scripts/serve-and-shoot.js <round-dir>`: it writes a grid of *live* HTML iframes (not images) and starts a local server, printing the URLs. **Screenshots are an optional by-product of the same command** — they exist so *you* (the model) can look at each mockup to auto-cull broken/near-duplicate cards and sanity-check against feedback; they're skipped gracefully when Playwright is absent, and the side-by-side viewing never depends on them. Give the user the URLs (and the PNGs too if you shot them).
- Add a one-line **"look at X, ignore Y this round"** guide (e.g. "judge layout; colors/copy are identical across all, don't compare them").
- Ask for a **pick / ranking / "winner + worst"**, not a 1–10 score. Pairwise/relative judgments are faster and far less biased than scores. Mixing is welcome ("A's density + B's palette").
- **Randomize the presentation order; don't always put your favorite first** (kills position bias). Ask them to say *why* before *which*.

### D — Extract constraints → lock ledger
- Convert the pick + words into **"verdict + actionable constraint"**, not raw quotes. Users are great at *finding problems*, poor at *prescribing fixes* — treat feedback as problem-location signal and infer the constraint. Use **I Like / I Wish / What If**:
  - *I Like* → write into the **lock ledger** (now held fixed).
  - *I Wish* → next round's narrowing constraint / exclusion.
  - *What If* → next round's divergence axis.
- Ledger is per-dimension (palette / layout / type / spacing / motion / data-viz), each row recording **value · which mockup it came from · the user phrase that approved it**. Support element-level approval and cross-version merges (A's palette + B's layout).
- **Echo back to the user: "locked this round: …; next round we diverge on: …."**
- → Ledger template: `reference/lock-ledger.md`.

### E — Converge check
Three questions each round: (1) did the user approve ("that's the one")? (2) stalled — 2 rounds with no new lock? → switch the divergence axis. (3) hit the round cap (5–6)? → force-finish. Any one true → stop gacha, go to F.

### F — Land it (real stack, data-driven)
- Implement the locked direction in the real framework with the **real data source**, reusing the shared tokens. This is real work, not a copy-paste — wire data, state, interactions.
- Acceptance is **end-state**: does the final real-data UI match every line of the lock ledger? Don't relitigate individual mockups.

### G — Refine (get the design right)
- Render → screenshot → **visual-diff against the approved mockup → fix only the differing regions.** Don't repaint the whole thing (changing A breaks B).
- For pointed fixes, feed the **full current code + the user's annotations on the screenshot** with "keep everything else; change only the marked spots."
- Structural change → spin a fresh variant round; pure visual nudge → local edit. Don't re-gacha a whole page to change one color.

---

## Knobs (defaults + why)

| Knob | Default | Why |
|---|---|---|
| **N (mockups/round)** | 5 early (wide), 3–4 late (narrow); adaptive — drop a notch when feedback converges | max-of-n: cheap + uncertain → diverge more; "clear majority → early stop". Models over-diverge — hard-code this rule. |
| **Divergence axis** | exactly ONE most-unsettled dimension/round; rest locked verbatim | controlled variable = attributable choice + max info gain |
| **Fidelity list** | real data + tokens (physically locked as shared CSS vars) + approved elements; reasserted every prompt; a card that fakes/edits a locked dim is rejected | real material → real feedback; lock by file, not by memory |
| **Diversity** | isolated per-card generation (parallel subagents, own constraint card only) + max-spread regions (poles first) + distribution-level instruction + one ordinary-distinct persona per card + de-dup on the axis | collapse is typicality bias; re-running doesn't fix it — structure + explicit per-card constraints do |
| **Converge signal** | approve OR stall(2) OR cap(5–6) | AutoGen dual-stop + stall counter + self-consistency early-stop |
| **Lock ledger** | per-dimension rows: value · source mockup · approving phrase; element-level + cross-merge; echoed each round | evaluator-optimizer memory; also the best-of-N regularizer against over-fitting one round's feedback |
| **Persistence** | each round in `gacha/round-N/` (html + png + pick + ledger snapshot) | supports "go back to round k and re-fork" if the user reverses |
| **Models** | plain divergence on a fast model; review/refine on the strongest | tier by task difficulty |

---

## Prompt skeletons

Inline skeletons below; full versions in the reference files.

**① Diverge one round** (one isolated generator per mockup — preferred; a single prompt producing all N only when subagents aren't available):
```
Make {N} throwaway HTML mockups of "{target}" for the user to pick side-by-side.

LOCK THE TRUTH (identical, verbatim, in every mockup — never modify):
- Real data (use as-is, NO lorem/placeholder): {structured real data}
- Brand tokens (@import the same CSS vars, never change values): {tokens path}
- Approved elements (keep exactly): {locked elements}
- Already-locked dims (copy verbatim, do NOT diverge this round): {ledger snapshot}

DIVERGE ON ONE AXIS ONLY:
- Vary only: {the single most-unsettled dimension}
- Everything else: per the lock list above.

FORCE DIVERSITY (distribution-level, not "give me N"):
- The {N} must be STRUCTURALLY different on the axis — not one design recolored.
- Each card = a distinct prototype name + one ordinary-but-different persona/lens
  (+ on style axes: one UNIQUE named design language from reference/style-vocabulary.md).
- First map the option-space, annotating each answer with the probability a typical designer
  would pick it; assign regions favoring the POLES + low-probability tails — at most one card
  in the known-AI-mode center. Don't let card 1 anchor the rest.
- Must NOT resemble these rejected/duplicate takes: {prior culls}

OUTPUT: one self-contained HTML file each, gacha/round-{r}/mockup-{i}.html, sharing the
same data + tokens; plus a one-line design intent. Self-check: any card that fakes data /
edits a locked dim / duplicates another ON THE AXIS (differs only in off-axis dims) → redo that card.
```

**② Select & extract** — see `reference/lock-ledger.md` (show protocol, I-Like/I-Wish/What-If, converge questions).

**③ Land + refine:**
```
Direction locked. Build the winner in {real stack} with real data.
MUST: match every lock-ledger line {ledger}; use real data source {source}; reuse shared tokens.
ACCEPT (end-state): final real-data UI matches the ledger.
REFINE: render → screenshot → visual-diff vs approved mockup → fix only differing regions
(no full repaint). Structural change → new variant round; visual nudge → local edit only.
```

---

## File layout this skill writes

```
gacha/
  tokens.css                # shared design tokens (the physical lock) — master copy
  data.json | data.md       # real data recon (or inline)
  ledger.md                 # the running lock ledger (source of truth between rounds)
  round-1/  tokens.css  mockup-1..N.html + .png + pick.md   # tokens.css COPIED in so @import './tokens.css' works over http too
  round-2/  ...
```
(Put under a scratch/ignored dir, or /tmp, if the repo shouldn't carry mockups.)

## Boundaries vs other skills

*(Names below refer to common companion skills; if your agent doesn't have them, the division of labor still holds — do that job as a plain task instead.)*

- **frontend-design** makes ONE high-quality draft from scratch. gacha-ui makes MANY, with the human in the loop, and converges. **The load-bearing pivot: did the user ask to COMPARE / explore options?** Yes → gacha-ui ("this looks off", "show me directions"). No — they want one good page → frontend-design. A single mockup *inside* gacha may borrow frontend-design's craft.
- **brainstorming** aligns *what to build* in words, no visual output. gacha-ui makes the *look* concrete via mockups. Hand off: brainstorming settles "which block, what goal" → gacha-ui visualizes and converges it.

## Tools
- `scripts/serve-and-shoot.js <dir> [port=auto] [width=1280]` — screenshots every `.html` in a dir and serves them in a **grid** (side-by-side) for browser viewing; auto-picks a free port. Needs Playwright + Chromium (install: `npm i -D playwright && npx playwright install chromium`). If Playwright is missing it **skips screenshots but still serves the gallery** (open it and screenshot by hand). Any screenshotter works — this is just the batteries-included default; if the repo already has Playwright/Puppeteer, prefer its own path.
- `reference/walkthrough.md` — ONE concrete round end-to-end (recon → diverge → pick → extract → ledger → converge); read it to see the rhythm, especially the verdict→constraint step.
- `reference/diversity-recipe.md` — how to pick the axis, set N, and force real divergence.
- `reference/style-vocabulary.md` — 40+ named design languages (grouped by family) + the known-AI-mode list; per-card exemplar seeds for style-flavored axes.
- `reference/lock-ledger.md` — recon/fidelity rules, the ledger template, the select/extract/converge protocol.
- `reference/why-parallel-prototyping.md` — the evidence/citations behind the method (optional).
