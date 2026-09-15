---
title: Protocol and schedule fixed
date: 2026-09-15
week: 3
hours: 9
tags: [proposal, protocol, schedule, method]
summary: Settled the experimental protocol and the term schedule two days before the proposal is due, which resolved every open item from week one.
---

The proposal is due Thursday. Most of this week went on the two documents it rests
on: the operational protocol and the week-by-week schedule.

**Questions**

The three working questions became five, stated so that each can actually be
measured. Reproducibility against PaPaGei's published MAE of 11.53; benefit, against
both the population model and per-person normalisation; sample efficiency across
adaptation budgets; cost, as the point where marginal return falls below a stated
threshold; and a comparison between the two PaPaGei backbones. The last is the
cheapest novel contribution available, since it is the same experiment run twice on
a backbone whose pretraining objective clusters by subject and one whose objective is
organised by waveform morphology.

**Resolved from week one**

- Task and dataset: heart-rate estimation on PPG-DaLiA, fifteen subjects, chosen for
  verifiability rather than difficulty. WESAD is a generalisation check only if time
  permits.
- Base model: PaPaGei, both S and P variants, which is what makes the backbone
  question possible.

**The splitting protocol**

This took the longest and is the part most likely to be wrong. Windows overlap by six
seconds, so a random within-subject split would put near-identical windows on both
sides. The design is a population set from the other fourteen subjects, a contiguous
adaptation block from the start of the target subject's recording, a contiguous test
block later, and a discarded buffer of at least eight seconds between them so that no
window can straddle the split.

The activity confound needed a decision rather than a default: PPG-DaLiA runs its
activities in fixed order, so a naive temporal split measures adaptation and activity
transfer at once. Activity-stratified is primary, naive temporal is reported as a
secondary realism check.

**Two structural decisions**

Use PaPaGei's own preprocessing rather than reimplementing it. Rebuilding it by hand
is roughly four weeks the term does not contain, and it moves embeddings from Week 9
to Week 5. The synthetic sine-wave exercise still happens, alongside the pipeline
rather than instead of it.

Treat serving cost as a stated limitation rather than something to measure. Per-person
adapters break request batching, which is what makes inference affordable at scale, so
the true production cost may be dominated by lost batching efficiency. That is
infrastructure-dependent and out of scope, which makes the reported frontier a lower
bound.

**Next session**

Submit the proposal Thursday. Then all fifteen subjects loading reliably, PaPaGei's
preprocessing applied, and the PulseDB viability check, which decides whether a second
dataset belongs in this term at all.
