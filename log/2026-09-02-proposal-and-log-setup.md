---
title: Proposal draft and research log setup
date: 2026-09-02
week: 1
hours: 3
tags: [proposal, scoping, setup]
summary: Stood up this log, and worked the proposal down to three linked research questions with a two-term structure.
---

First working session of the semester. Two things: get the infrastructure out of
the way, and get the proposal close enough to file.

**Log infrastructure**

This dashboard now builds from markdown in the repository, so adding an entry is a
commit rather than an upload. The reading view sits behind a shared password.

**Proposal**

The framing settled into a cost-benefit question rather than an accuracy-only one.
Production wearables personalise by *normalisation* — scoring you against your own
rolling baseline on top of a shared model. That is nearly free, but it assumes the
signal-to-outcome mapping is common to everyone and only the centre and range
differ. Personalising the model itself can re-learn that mapping, but tuning is not
free, and "a model per member" may cost more than it returns.

That gives three questions that stack:

1. **Baseline** — can I reproduce a published downstream result from an open PPG
   foundation model on an open dataset, with a clean pipeline?
2. **Personalisation and fairness** — does per-person adaptation beat the population
   model, by how much, for whom, and does it narrow subgroup gaps or widen them?
3. **Efficiency frontier** — what did that improvement cost, and where does it stop
   being worth it?

All three sit within this term: the baseline first, then the personalisation and
efficiency work that depends on it.

**Open items**

- Confirm the target downstream task for the baseline. Heart-rate estimation on
  PPG-DaLiA is the obvious first candidate, given the published number to reproduce.
- Decide on the base model and whether both of its variants are in scope.
- File the Yale independent study petition within the first two weeks of term, with
  the sponsoring faculty email attached.

**Next session**

Finish the proposal draft, then start the literature review outline from the
annotated bibliography.
