# Why parallel prototyping works — the receipts

Read this only if you want the evidence behind the method. SKILL.md states the claims; this is the source layer so the body stays lean.

## The core result

**Parallel prototyping beats serial iteration.** In controlled studies, designers who created and shared *multiple* alternatives in parallel — versus iterating a single design — produced work with higher audience engagement, higher expert ratings, and (for ad designs) better click-through and dwell time. They also reported more divergent exploration and rated the process more positively. (Dow, Glassco, Kass, Schwarz, Schwartz & Klemmer, *Parallel prototyping leads to better design results, more divergence, and increased self-efficacy*, ACM ToCHI 2010.)

Three mechanisms drive the gain — preserve all three:

1. **Side-by-side comparison.** Seeing alternatives together lets the evaluator *induce the underlying principles* ("the dense one reads faster, the airy one feels premium") instead of reacting to one artifact in isolation. This is why the SHOW step must be side-by-side, not one-at-a-time.
2. **Delayed commitment.** Exploring N before refining any one protects divergence; committing early collapses the search to the first plausible answer.
3. **Self/work separation.** Critiquing "option B" is emotionally safe; critiquing someone's *only* design reads as a personal verdict and suppresses honest feedback. Multiple options give the user "permission to criticize."

## Making vs showing

**Only *sharing/showing* multiples raises outcome quality — *creating* them only widens the creator's own exploration.** A follow-up isolated the variables: the measurable quality lift comes from putting the alternatives in front of the decider, not merely from having generated them. (Dow, *The Efficacy of Prototyping Under Time Constraints*, and related work, 2011.) This is the entire justification for serve-and-shoot: skipping the show keeps the (smaller) exploration benefit but throws away the quality benefit.

## Show one-at-a-time inflates approvals

Presenting a single option at a time yields inflated "looks fine" responses; multiple concrete alternatives surface real, comparative criticism. (Tohidi, Buxton, Baecker & Sellen, *Getting the Right Design and the Design Right*, CHI 2006.)

## Why a human is the evaluator (no aesthetic auto-judge)

Aesthetic preference is weakly agreed-upon even among experts, so an automated "which is prettier" judge is unreliable and, used as a best-of-N selector, *over-optimizes* a noisy signal. Human–human agreement on design preference is modest (~38%); model–expert agreement runs ~60–64% — better than chance but not enough to replace the human pick, and worse when brand/context fit matters. (DesignPref and related design-preference benchmarks; on best-of-N over a weak verifier over-optimizing, see work on reward over-optimization, e.g. arXiv:2502.12668.)

Corollary the skill enforces: auto-culling is allowed only for **deterministic** problems — broken renders and near-duplicates — never for "which design is better." That judgment stays with the human.

## Relative judgments beat numeric scores

Asking for a pick / ranking / "winner + worst" is faster and far less biased than 1–N scoring: pairwise comparison is roughly a third faster, more consistent, lower cognitive load, and much less swayed by irrelevant attributes (preference-flip rates drop ~35%→9% in comparison vs rating setups). Hence phase C asks for relative judgments and randomizes order.

## Recombination is a real mechanism

Letting the decider mix elements across alternatives ("A's palette + B's layout") is a validated way to reach better composites than any single candidate — which is why the lock ledger supports element-level approval and cross-merge. (See parallel-prototyping recombination work, e.g. Mixplorer / design-mixing studies, CHI 2022.)

## How this maps to agent patterns

The loop is Anthropic's **parallelization, voting variant** (fan out N independent candidates) feeding an **evaluator-optimizer** loop (evaluate, lock, narrow, repeat) — with a *human* as the evaluator and the lock ledger as the optimizer's memory and regularizer.
