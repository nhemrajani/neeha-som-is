# Compute-Efficient Personalisation of PPG Foundation Models

Independent Study, Fall 2026
Neeharika Hemrajani
Supervisor: Professor Sohee Park

Research log (password protected): https://neeha.xyz/ppg-personalisation
Weekly entries, current results, and the standing of each deliverable. The password
is shared separately.

---

## The Question

How cheaply can a shared model be tuned to fit one person, when is that worth the
cost, and does it help everyone equally?

## Background

Photoplethysmography (PPG) is the optical pulse signal recorded by nearly every
consumer wearable. A green LED shines light into the wrist, blood absorbs some of it
and scatters the rest back to a detector, and each heartbeat pushes a pulse of blood
through the vessels under the strap, so the quantity of light returning rises and
falls in time with the heart. That waveform yields heart rate, and the spacing
between successive peaks yields heart rate variability (HRV), which is the principal
input to the recovery metrics reported by commercial devices.

Reading that signal once required a separate hand-built model for each variable of
interest, whether heart rate, sleep staging or workout detection, each trained on its
own labelled data. Within roughly the last eighteen months, open PPG foundation
models have appeared: large self-supervised networks pretrained on millions of
unlabelled pulse recordings, whose only pretraining task is to learn what pulse
signal looks like in general. Downstream tasks are then trained as small predictors
on top of the learned representations rather than on the raw waveform, and require
considerably less labelled data.

## The Problem

These models are trained once, for an entire population, and do not change for an
individual. Bodies differ, and a model optimised for the average performs only
moderately well for any particular person.

Production systems address this cheaply through normalisation, scoring a person's
readings against their own rolling baseline. WHOOP compares current HRV against a
thirty-day baseline, which is why the score is withheld for the first four days while
the system estimates the user's normal range. The approach is robust and close to
free, but it assumes that the relationship between signal and outcome is shared
across people, and that only the centre and range of the distribution differ between
them.

For some people that assumption does not hold. Vascular structure, arrhythmia, age,
and the effect of skin tone on the optical signal can alter the mapping itself, and a
baseline is only a rescaling applied on top of a single common mapping. Adapting the
model to the individual can re-learn that mapping. Adaptation, however, is not free.
It consumes compute, and across millions of users a separate model per person may
cost more than the accuracy it returns.

## The Gap

The PPG foundation model literature names three open problems, namely on-device
efficiency, per-person personalisation, and fairness across subpopulations, while
most large-laboratory work has concentrated instead on scale and pretraining. Four
categories of personalisation method are now available: normalisation, domain
adaptation, parameter-efficient fine-tuning, and retrieval. Each has been
demonstrated on a different backbone, on a different task, and against a different
definition of cost. None has been placed alongside the others on a single
accuracy-versus-cost axis for PPG.

## The Framing

Personalisation at scale is a problem of compute allocation before it is one of
accuracy, since it is viable only if the accuracy it adds justifies the compute it
consumes. Treating it as a cost-benefit frontier rather than an accuracy-only
question is as much a management-science lens as a machine-learning one.

## Research Questions

Stated operationally, so that each can be measured.

| | |
| --- | --- |
| RQ1 | Reproducibility. Does a linear probe on frozen PaPaGei embeddings, evaluated under PaPaGei's own protocol on PPG-DaLiA heart rate, reproduce their reported MAE of 11.53 within its confidence interval? |
| RQ2 | Benefit. For a held-out individual, does per-person adaptation reduce heart-rate MAE relative to the unmodified population model, and relative to the population model with per-person normalisation? |
| RQ3 | Sample efficiency. How does that reduction vary with the quantity of the individual's data used for adaptation? |
| RQ4 | Cost. Plotting MAE reduction against adaptation cost, where does the marginal return fall below a stated threshold? |
| RQ5 | Backbone. Does per-person adaptation yield greater benefit on PaPaGei-P, whose pretraining objective clusters by subject, or on PaPaGei-S, whose objective is organised by waveform morphology? |

RQ5 is the cheapest novel contribution available here, being the same experiment run
twice.

## Data

Primary: PPG-DaLiA. Fifteen subjects, wrist PPG at 64 Hz, chest ECG as ground truth,
eight activities, 64,697 windows.

Secondary: WESAD, for generalisation checking only, and only if time permits. It is
not committed to beyond that.

Under consideration: PulseDB, comprising 5,361 subjects pre-segmented at 125 Hz into
ten-second windows with demographics. It is clinical finger PPG rather than consumer
wrist PPG, so a different population and a different signal-quality regime. Whether
it enters this term is settled by a viability check in Week 4 rather than assumed:
the budget sweep requires enough data per person to split into adaptation, buffer and
test, so the decision rests on the median usable minutes per subject. If viable, the
protocol is ported late in the term as a generalisation section. If thin, it is held
over as a separate study. The two datasets are not run in parallel; the frontier is
completed on PPG-DaLiA first.

The task is continuous heart-rate estimation, a regression with output in BPM. Heart
rate is chosen for verifiability, because it is well benchmarked, has published
numbers to reproduce and has ECG ground truth available, rather than because it is
unsolved.

## Preprocessing

PaPaGei's published pipeline is followed exactly, since deviation without reason
makes RQ1 unanswerable. A fourth-order Chebyshev bandpass between 0.5 and 12 Hz is
applied with `filtfilt` to avoid phase distortion; the signal is segmented into
eight-second windows with six seconds of overlap; windows more than 25 per cent
flatline are discarded; each window is z-scored; and the result is resampled to
125 Hz and padded to the encoder's expected input length.

The rejection rate is recorded per subject, because it varies, and that variation
matters for the budget sweep. Note also that per-window z-scoring already removes
amplitude differences arising from sensor fit and skin optics, so some personalisation
happens silently in preprocessing. The baseline is therefore not a raw population
model but a window-normalised one.

## The Splitting Protocol

Two requirements pull against each other. A population model must be trained on some
people and tested on a person it has never seen, which is leave-one-subject-out.
Per-person adaptation needs some of the target person's data to adapt on and some to
test on, and because windows overlap by six seconds, a random split would place
near-identical windows on both sides.

For each target subject in turn, the recording is divided four ways. The population
set is every window from the other fourteen subjects, used to train the downstream
model on which the population arms rely. The adaptation set is a contiguous portion
of the target subject's recording taken from the beginning, used only by the
per-person arms. The test set is a later contiguous portion, used for evaluation by
every arm. Between adaptation and test sits a buffer of at least eight seconds,
discarded entirely, which guarantees that no eight-second window straddles both.

Blocks are contiguous and temporally ordered for two reasons. Random selection within
a subject would place overlapping windows on both sides of the split, and contiguous
blocks with a buffer make that impossible. In deployment one adapts on data already
collected and predicts data not yet seen, so adapting on the past and testing on the
future is the honest simulation; adapting on a random sample scattered through the
recording would flatter the results.

PPG-DaLiA runs its activities in a fixed order, which introduces a confound: taking
the first twenty minutes as the adaptation set means adapting on whichever activities
come first, and measuring adaptation and activity transfer at once. An
activity-stratified split, taking the first portion of each activity for adaptation
and the rest for testing, removes the confound at some cost in realism. This study
takes the activity-stratified split as primary and reports the naive temporal split
as a secondary realism check.

Any tuning, whether of the ridge penalty, the adapter rank or the learning rate, is
selected on the population set or on a validation portion of the adaptation set, and
never on the test set. Hyperparameter ranges are fixed in advance of any test result.

## The Arms

Five conditions, with a sixth held as optional. Each is evaluated on the same test
set for the same subject, so the numbers are directly comparable.

| | Model | Personalisation | Cost per person |
| --- | --- | --- | --- |
| A | Shared | None. Frozen encoder, ridge regression trained on the other fourteen subjects, applied unchanged. The baseline. | Zero |
| B | Shared | Per-person normalisation, with statistics drawn from the adaptation set alone. | Two numbers |
| C1 | Per user | Per-person linear probe on frozen embeddings, warm-started from the population solution and shrunk toward it. | 513 numbers |
| C2 | Per user | Parameter-efficient adaptation: frozen encoder plus small trainable components. | Adapter parameters, swept by rank |
| D | Per user | Full fine-tuning of all five million parameters. An upper bound, not a deployment candidate. | Five million parameters |
| E | Shared | Optional. Population model plus demographic features already recorded in the dataset. | Four numbers |

Arm B carries a known trap. Where normalisation statistics overlap in time with the
evaluation data, performance is inflated, as Otesteanu et al. (2026) demonstrate. The
buffer prevents this, provided the statistics are computed exclusively from the
adaptation set.

Arm C1 is run warm-started as the primary variant, with a from-scratch variant
reported for comparison. Warm-starting handles cold start, since a person with no
data receives exactly Arm A and improves smoothly from there, whereas a from-scratch
fit estimates 513 coefficients from very few examples and may perform worse than the
population model at small budgets. It also degrades gracefully rather than
catastrophically, which is what a product requires, and it makes the curve
interpretable as a deployment story. The gap between the two curves at small budgets
is itself a finding, since it quantifies what warm-starting buys.

Arm C2 carries the one genuinely open implementation question. PaPaGei is
convolutional and the parameter-efficient fine-tuning literature is transformer-based.
The options, in ascending order of ambition, are to adapt only the final projection
layer, to adapt only the 1×1 convolutions, which are matrix multiplications and take
LoRA unchanged, to apply low-rank decomposition to reshaped convolutional kernels, or
to insert adapter blocks between convolutional blocks. Adapting the final projection
layer is the named fallback, and a more expressive variant is attempted first.

Arm D is expected to overfit given only minutes of one person's data, and may perform
worse than Arm A. That is itself a result, since it demonstrates that adaptation
capacity is not monotonically beneficial.

## The Data Budget Sweep

Budgets of 2, 5, 10, 20 and 40 minutes are swept, together with all available data.
Each budget is taken from the start of the adaptation set, so smaller budgets are
prefixes of larger ones and the curve reads as what a person would have had after n
minutes of wear.

Budgets are reported in usable minutes of signal after rejection rather than raw
wall-clock time, since a subject with a noisy signal loses more windows and therefore
yields fewer usable windows from the same wear time. Both are reported: usable
minutes is the fair scientific comparison, wall-clock wear time is what a product
would actually ask of a member, and the gap between them appears not to have been
reported elsewhere.

## Cost Measurement

Four quantities are measured, with the first nominated as primary. Trainable
parameters per person is exact, hardware-independent and auditable. Stored bytes per
person follows from it and is the deployment translation. Adaptation wall-clock time
is reported per person on stated hardware. Adaptation FLOPs are estimated where that
can be done honestly.

For a model of five million parameters, training cost is not the binding constraint.
What does not scale is retaining a per-member artefact across millions of members, so
storage is the operationally meaningful axis, whereas most published efficiency work
reports training compute instead.

There is a third cost this study cannot measure and should not ignore. Deployment
cost comprises adaptation, storage and serving. A shared population model allows many
members' requests to be batched into a single pass, which is what makes inference
affordable at scale; per-person adapters break batching, so either each request runs
separately or adapters are swapped between requests at a cost in latency and memory
bandwidth. Systems for serving many low-rank adapters concurrently exist, but they
are specialised infrastructure rather than a standard deployment. The true production
cost of per-person adaptation may therefore be dominated by lost batching efficiency
rather than by training or storage. This study measures adaptation and storage only,
and the reported frontier is consequently a lower bound on true production cost.

## Evaluation and Statistics

Mean absolute error in BPM is the primary metric, with RMSE and Pearson correlation
reported alongside. Error is computed per subject and then averaged across subjects,
with the distribution reported, since pooling all windows would let subjects with
more data dominate.

Confidence intervals are bootstrapped over 500 resamples, matching PaPaGei's
procedure, resampled at the subject level for cross-subject claims and at the window
level for within-subject claims. Because every arm is evaluated on the same test sets
for the same subjects, comparisons are paired, and the per-subject difference between
arms is reported rather than only the difference of means. Where two arms' confidence
intervals overlap, no claim of superiority is made; the finding is recorded as no
detectable difference at this sample size.

## Stratified Analyses

Three analyses follow the main results. By activity, across the eight that PPG-DaLiA
labels, to establish whether adaptation gains concentrate in high-motion conditions,
which would indicate that personalisation is partly learning a person's movement
rather than their physiology. By subject, reporting the full distribution rather than
the mean, to establish whether adaptation helps everyone or rescues a poorly-served
minority, and whether the subjects worst served by the population model gain most. By
subject characteristic, using the Fitzpatrick skin type, sex, age and fitness level
recorded in the dataset; with fifteen subjects this is illustrative only and is
labelled as such rather than reported as a fairness finding.

## Schedule

Four graded checkpoints, each falling on a Thursday, with a research log entry and
status update before each check-in.

| Week | Date | Deliverable |
| --- | --- | --- |
| 3 | 17 September | Proposal, plan of work, bibliography |
| 8 | 22 October | Midterm report, working code, public repository, note on reproduction status |
| 12 | 19 November | Progress presentation, results on two backbones, graphs, paper outline |
| 16 | 17 December | Final paper, public repository, final presentation |

The term proceeds in two phases. The first establishes the pipeline and the open
baseline, running from data handling and preprocessing through to loading the
pretrained encoder and reproducing one downstream metric. The second runs the
per-person experiments, the accuracy-versus-compute analysis and the stratified
analyses.

One structural decision shapes the schedule. PaPaGei's own preprocessing code is used
rather than a reimplementation, because rebuilding it by hand would consume roughly
four weeks that the term does not contain if both the frontier and the paper are due
in December. That decision moves the project to embeddings by Week 5 rather than
Week 9, and those four weeks are the difference between a complete frontier and a
partial one.

Two points carry most of the schedule risk. If embeddings are not produced by the
start of October, everything downstream compresses, which is why the encoder
repository is installed in Week 2 rather than Week 5, so that installation problems
surface early. The convolutional adaptation question has no published answer for a
one-dimensional signal encoder, which is why adapting the final projection layer is
treated as an acceptable outcome rather than a fallback. Where scope must be cut, it
is cut in preference to quality: the arms are prioritised A, B, C1, C2, and three
arms done properly with honest statistics is a better result than four done badly.

## Deliverables

- A proposal with plan of work and bibliography, comprising the motivation, background, related work organised by the claim each group of papers supports, the five research questions stated operationally, the method, the evaluation protocol, and a limitations section.
- A midterm report with working code in a public repository and an explicit note on reproduction status, reporting what was built, the baseline figure with its confidence interval, and the comparison between the population, normalisation and per-person linear probe arms.
- A progress presentation with results on both backbones, the two principal graphs, and a paper outline with figure placeholders.
- A final paper of roughly 15 to 20 pages in the shape of a workshop paper, with a public experiment repository whose figures are regenerated by scripts held in the repository, and a final presentation.

The two principal figures are the frontier plot, giving cost against error for every
arm on both backbones, and the sample-efficiency curve, giving data budget against
improvement.

## Intended Contributions

1. An open and reproducible benchmark and harness for per-person personalisation of an open PPG foundation model, released so that others can extend it.
2. A systematic accuracy-versus-compute characterisation of per-person adaptation across methods, measured against per-person normalisation rather than against a raw population model, which is the comparison production systems actually warrant.
3. An empirical test of whether a pretraining objective that encodes subject identity leaves more or less headroom for adaptation, obtained by running the same experiment on both PaPaGei backbones.

## Limitations

Stated in advance rather than discovered late.

- Fifteen subjects is thin for a per-person question, and the subgroup analyses are illustrative only, not fairness findings.
- The task is heart rate, chosen for verifiability rather than because it is unsolved.
- The baseline for comparison is per-person normalisation, not the raw population model, and per-window normalisation in preprocessing already removes some individual variation.
- Applying parameter-efficient methods to a convolutional encoder is an open implementation question, with adapting the final projection layer as the named fallback.
- The frontier measures adaptation and storage cost but not serving cost, which is dominated by lost batching efficiency, so the reported frontier is a lower bound on production cost.
- Low-rank adaptation of PPG models is already published; the contribution is the comparison of per-person methods on a common cost axis, not the method itself.

This is a representation-learning and efficiency study, conducted entirely on open
foundation models and open datasets. It makes no clinical claims and offers no
diagnoses. The comparison drawn to production systems rests on public documentation
rather than privileged information, and the work exposes no proprietary data or
intellectual property.

## Tools

Python, PyTorch, HuggingFace Transformers and PEFT, NumPy, Pandas, SciPy,
scikit-learn, Jupyter, and Git with GitHub.

## Core Reading

| Work | Relevance |
| ---- | -------------- |
| [Pillai et al. (2025), PaPaGei](https://arxiv.org/abs/2410.20542), ICLR 2025 | The first open PPG foundation model, releasing weights and code and benchmarking skin-tone robustness and parameter efficiency. The base model, in both its S and P variants. ([code](https://github.com/Nokia-Bell-Labs/papagei-foundation-model)) |
| [Reiss et al. (2019), PPG-DaLiA](https://archive.ics.uci.edu/dataset/495/ppg+dalia) | The primary dataset, and the source of the published heart-rate benchmark. |
| [Hu et al. (2021), LoRA](https://arxiv.org/abs/2106.09685) | The core parameter-efficient method for the per-person adaptation arm. |
| Houlsby et al. (2019), Parameter-Efficient Transfer Learning for NLP | Adapter blocks, the alternative to low-rank decomposition for the same arm. |
| Otesteanu et al. (2026), Baseline Normalization Choices Inflate Classification Performance in Wearable Health Monitoring | The inflation trap in the normalisation arm, and the mitigation this protocol adopts. |
| [Saha et al. (2025), Pulse-PPG](https://arxiv.org/abs/2502.01108) | An open, field-trained PPG foundation model, held as a comparison base. ([code](https://github.com/maxxu05/pulseppg)) |
| [Abbaspourazad et al. (2024), Apple](https://arxiv.org/abs/2312.05409), ICLR 2024 | A consumer-scale PPG and ECG foundation model, showing that the representations carry health signal. |
| [Narayanswamy et al. (2024), Google](https://research.google/pubs/scaling-wearable-foundation-models), ICLR 2025 | How wearable foundation models scale with data, compute and size. |
| [Koerber et al. (2023)](https://pubmed.ncbi.nlm.nih.gov/36333652/) | Heart-rate accuracy across skin tones, and the equity motivation for the study. |
| [Schmidt et al. (2018), WESAD](https://archive.ics.uci.edu/dataset/465/wesad) | The secondary dataset, should time permit. |

The full annotated bibliography, covering foundation models, the case for
personalisation, domain adaptation, normalisation, datasets, signal quality, fairness
and efficiency, will be published here with the literature review.

---

## This Repository

```
src/                 Reusable code: data loading, evaluation, model wrappers
notebooks/           Exploration and plotting
data/                PPG-DaLiA. Not committed; downloaded separately.
results/             Output tables, saved embeddings, experiment records
figures/             Generated plots, each regenerated by a script
docs/                Written deliverables: proposal, literature review, paper
log/                 Research log entries in markdown, one file per session
```

This repository is public. Anything genuinely confidential stays out of it,
including the log entries under `log/`, which are readable here whatever the hosted
log does.

### Environment

Requires Python 3.10 or later. The environment is isolated in `venv/`, which is not
committed; `requirements.txt` records exactly what to install so that the pipeline
reproduces elsewhere.

```bash
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Activate the environment in every new terminal session. If Python cannot find a
package you know you installed, an inactive environment is almost always the reason.

After adding a package, re-record the environment:

```bash
pip freeze > requirements.txt
```

### Getting the Data

PPG-DaLiA is downloaded separately and never committed, being far too large. Unzip it
into `data/`, which leaves the subject files at `data/PPG_FieldStudy/S1/S1.pkl` and so
on for the fifteen subjects.

```bash
python -m src.data
```

That prints the subjects found on disk and the full structure of the first one,
including the shape of every array. The loader handles the one trap in this dataset:
the pickles were written under Python 2 and fail to load without
`encoding='latin1'`.

### Working Rhythm

Anything written twice belongs in `src/` rather than a notebook. The failure mode is
arriving in November with preprocessing existing in six slightly different versions
across four notebooks, and no way to reproduce any of them. Notebooks are for looking
at things; `src/` is for anything reused.

Restart the kernel and run a notebook top to bottom before trusting a result, since
cells run out of order create states that cannot be reproduced.

Commit at the end of each working session, with messages that say what actually
happened. A record of real problems being worked through is a more useful artefact
than a suspiciously clean history.

```bash
git add . && git commit -m "what you did" && git push
```
