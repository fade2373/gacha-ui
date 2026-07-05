# Divergence: pick the axis, size N, force real diversity

Read this when running phase B (diverge). The failure mode this prevents: fanning out N agents and getting N near-identical cards (typicality collapse) — which silently kills the whole method, because best-of-N is only as good as the diversity of the pool.

## 1. Pick the ONE axis

Vary exactly one most-unsettled dimension per round; lock the rest verbatim. Candidate axes, roughly coarse→fine:

- **Archetype / overall paradigm** (Mode B round 1): console-HUD · bento · editorial/magazine · radial-dashboard · card-wall · slim command-bar · … — don't stop at what you'd name spontaneously; pull candidates from `style-vocabulary.md` (40+ named design languages, grouped by family).
- **Layout / composition**: arrangement, hierarchy, where the hero sits, mirror vs stacked.
- **Information density / what to show**: minimal-glanceable vs rich-detailed; which data is hero.
- **Data visualization**: how a number/breakdown is shown (bars vs rings vs tile-matrix vs dot-grid).
- **Color / texture / depth**: palette, glow, glass, gradients, flat vs dimensional.
- **Typography / tone**: type pairing, weight, restraint vs expressive.
- **Motion / micro-interaction** (usually a refine-phase concern, not a divergence axis).

How to choose: the axis is whatever is **least decided** — usually the prior round's *What If*. Round 1 of Mode B = archetype; round 1 of Mode A = the biggest thing the user dislikes. Going coarse→fine keeps every round attributable.

## 2. Size N

- **5** when wide/uncertain (early, archetype, open direction).
- **3–4** when narrowing (axis is constrained, options are close).
- **Adaptive:** drop a notch the moment feedback converges (clear majority / "anything like X"). Stop early on a clear majority.
- Rationale: cheap throwaway mockups + high uncertainty → diverge more (max-of-n economics). But models *over*-diverge by default — so state the N rule explicitly and don't fan out 8 cards for a settled question.

## 3. Force real diversity (the recipe)

Independent re-runs of the same prompt collapse to the same typical design. Temperature alone doesn't fix it. Do these:

1. **Distribution-level instruction**, not list-level. Say "produce mockups that are *mutually distinct* and *include 1–2 non-mainstream/contrarian* takes from the tail of the space" — not just "give me 5 options." Strongest form (verbalized sampling): when mapping the option-space, ask for **~10 candidate answers each annotated with the probability a typical designer would pick it**, then assign card regions *favoring the low-probability tail*. RLHF-induced typicality collapse yields to this prompt-level move; raising temperature alone does not.
2. **One distinct lens per card — persona AND exemplar.** Give each mockup a prototype name + an *ordinary-but-different* persona/priority ("a teacher who wants glanceable totals" vs "a power user who wants the full breakdown"). Use ordinary, varied viewpoints — NOT famous designers/brands (celebrity personas semantically cluster and reduce diversity). For style-flavored axes, ALSO assign each card one **named design language from `style-vocabulary.md`** to metabolize — a concrete exemplar pulls generation out of the mode far harder than an abstract persona; different exemplar per card, never shared (a shared reference anchors all cards), and **at most one card in the known-AI-mode center** (cream-editorial / dark-acid / broadsheet / generic-SaaS-bento — see the vocabulary file).
3. **Map the space first, then split.** Have the generator first list the option-space / opposing choices for this axis, *then* assign each card a different region. This stops card 1 from anchoring cards 2–N.
4. **Generate each card in an ISOLATED context.** Diversity is structural, not just phrasing — there are two symmetric failure modes: *one* agent writing all N cards sequentially cross-contaminates them (shared style momentum: same font instincts, same layout tricks — one design recolored), while N agents given the *same* prompt independently all collapse to the same typical answer. The working structure is: map the option-space centrally (item 3) → assign each card its region via its constraint card → spawn **N parallel generators that each see ONLY their own constraint card + the fidelity list** — never each other's output. (The machine analog of parallel prototyping's separate designers.) Fall back to one-prompt-producing-N only when subagents aren't available.
5. **Pick regions for MAX SPREAD, poles first.** When assigning regions on the axis, first claim the two *extremes*, then 1–2 tail/contrarian positions, and only then fill the interior. Five cards that are mutually distinct but all mid-space explore a tiny ball — they pass the de-dup test and still waste the round. Coverage diameter, not card count, is what the round buys.
6. **De-dup ON THE AXIS, not on overall look — and run it BLIND.** For each pair ask: *if you described both in one sentence about {the axis}, would the sentences differ?* Don't let the generator grade its own cards (it always sees them as distinct): have a **fresh pass that has NOT seen the constraint cards** look only at the rendered results (screenshots or the HTML) and describe each card's stance on the axis in one sentence — two descriptions that collide = true duplicates. (This is the machine-check the screenshots are for.) Two cards that both read "left rail + hero grid" are duplicates **even if their fonts/colors differ** — that variation is off-axis noise (and itself a fidelity violation, since non-axis dims are supposed to be locked verbatim). The classic trap is 5 cards that differ only in hue/font/radius: diverse *thumbnails*, identical *structure*, so best-of-N draws from a pool of one real answer. Cull to the most distinct axis-answers; feed culled/duplicate takes into the next prompt as "must NOT resemble these."
7. **Differentiation > count.** N being large does nothing if the cards are similar; the gain comes from *how different* the per-card constraints are. Spend effort on distinct constraint cards, not more cards.
8. **Prompt + structure are the whole toolkit in agent harnesses** — you can't set a subagent's temperature, so items 1–7 are the real levers. Only if you directly control the API: divergence rounds may add higher temperature (~0.7–1.0) and/or min-p (~0.05–0.1); landing/refine rounds drop back to low-temp deterministic output. Treat sampling params as a garnish, never the mechanism.

## 4. Per-mockup constraint card (fill one per card, feed into the divergence prompt)

```
Card {i} — "{prototype name}"
  lens/persona:        {ordinary but distinct viewpoint}
  exemplar:            {one named design language from style-vocabulary.md — unique to this card}
  stance on {axis}:    {a specific region of the option-space, distinct from other cards}
  information priority: {what's hero, what's secondary}
  tone:                {restrained / vivid / dense / playful / premium …}
  (locked dims, data, tokens: identical to all cards — from the fidelity list)
```

Aim: someone glancing at the N screenshots should instantly see they explore *different answers to the same question*, not the same answer with jitter.
