# Compute-Efficient Personalisation of PPG Foundation Models

Independent Study, Fall 2026
Neeharika Hemrajani
Supervisor: Professor Sohee Park

Research log (password protected): _deployment URL goes here_
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
categories of personalisation method are now available: domain adaptation,
parameter-efficient fine-tuning, retrieval, and hypernetwork-generated adapters. Each
has been demonstrated on a different task and against a different definition of cost.
None has been placed alongside the others on a single accuracy-versus-cost axis for
PPG.

## The Framing

Personalisation at scale is a problem of compute allocation before it is one of
accuracy, since it is viable only if the accuracy it adds justifies the compute it
consumes. Treating it as a cost-benefit frontier rather than an accuracy-only
question is as much a management-science lens as a machine-learning one.

## Research Questions

| | |
| - | -------- |
| Q1 | Baseline and reproducibility. Can a published open PPG foundation model reproduce a reported downstream result, such as heart-rate estimation, on an open dataset using a clean and documented pipeline? |
| Q2 | Personalisation and fairness. Does adapting that model to an individual, through parameter-efficient fine-tuning on that person's data, measurably improve per-person predictions over the population model? By how much, for whom, and does it narrow gaps across subgroups such as skin tone rather than widening them? |
| Q3 | Efficiency frontier. What does that improvement cost? Plotting accuracy gain against compute and parameters updated, at what point does per-person personalisation stop being worthwhile? |

Three further questions sit underneath these. How much per-person data is enough for
personalisation to help? Does it help everyone, or principally those whom the
population model already served poorly? And can adaptation be made cheap enough to be
plausible on-device?

## Methods Under Comparison

| | Model | Personalisation | Cost |
| - | ----- | --------------- | ---- |
| A | Shared | None (population model) | Nothing |
| B | Shared | Normalisation, as production systems do today | Negligible |
| C1 | Shared | Linear probing: freeze the model and train a single layer on top of the representations | Low |
| C2 | Per user | Parameter-efficient fine-tuning (LoRA, adapters): freeze the model and insert small trainable parameters | Medium |
| C3 | Per user | Full fine-tuning: update every parameter, which is the most accurate option but expensive to store and difficult to scale | High |

Cost is measured as parameters updated and stored bytes per person, with each method
run at several personal-data budgets.

## Plan of Work

The study runs across a single term and proceeds in two phases.

|  | Phase 1: Foundations and open baseline | Phase 2: Personalisation and efficiency |
| --- | --- | --- |
| Focus | Q1 | Q2 and Q3 |
| Core work | Data handling, PPG preprocessing, loading a pretrained open model, reproducing one downstream metric | Parameter-efficient adaptation, per-person experiments, accuracy-versus-compute analysis, fairness analysis |
| Data | Open PPG datasets (PPG-DaLiA, WESAD) with own WHOOP-derived metrics | As above, with deeper use of the n = 1 longitudinal data |
| Output | Literature review, reproducible baseline repository, interim results memo | Technical paper, experiment repository, results talk |

### Skills Developed

Python fluency, taken alongside CPSC 1100; scientific Python (NumPy, Pandas, SciPy);
PPG preprocessing, covering filtering, segmentation and peak detection; machine
learning fundamentals and evaluation, including leakage-safe splits, baselines and
error bars; a first small neural network in PyTorch; and loading a pretrained open
model in order to linear-probe a downstream task.

## Deliverables

- A literature review of approximately 8 to 12 pages, covering the open PPG foundation model landscape, the personalisation and efficiency gap, and a precise statement of questions and datasets. A draft is submitted at mid-term for feedback.
- A reproducible baseline repository that loads an open PPG dataset, runs preprocessing, loads a published open model, and reproduces one downstream metric, with a README and environment file so that it clones and runs.
- A results memo of approximately 2 to 3 pages, reporting the baseline figure, any surprises, and the specific personalisation experiments that follow from it.
- Personalisation experiments comparing population and per-person results for a set of individuals, across at least three adaptation methods, with leakage-safe splits and error bars.
- An efficiency-frontier analysis giving the accuracy-versus-compute curve and a defensible answer to the question of when personalisation is worth its cost.
- A fairness analysis establishing whether personalisation narrows or widens subgroup gaps, reported with standard fairness metrics, namely demographic parity and equality of opportunity, alongside accuracy.
- A technical paper of approximately 15 to 20 pages in the shape of a workshop paper, and a public experiment repository whose figures are regenerated by scripts held in the repository.

As a stretch objective, the calibration and uncertainty of the personalised
predictions are reported alongside accuracy using an off-the-shelf toolbox such as
UQ360 rather than novel methods, treating the question of how much per-person data is
enough as one of sample efficiency. This tests not only whether personalisation is
more accurate, but whether its confidence can be trusted, which is what should make a
per-person model safe to act on.

Assessment is by these deliverables at the end of the term, supported by a weekly
research log, linked above, and biweekly supervisor check-ins.

## Intended Contributions

1. An open and reproducible benchmark and harness for per-person personalisation of an open PPG foundation model, released so that others can extend it.
2. A systematic accuracy-versus-compute characterisation of per-person adaptation across methods, covering linear probing, LoRA and adapters, and full fine-tuning. This is the first such frontier for an open PPG foundation model.
3. A fairness analysis treated as a first-class result rather than an afterthought, establishing whether and for whom per-person adaptation narrows subgroup gaps, using the skin-tone robustness benchmark that the base model already ships.

## Data and Tools

Open datasets:

- PPG-DaLiA, providing wrist PPG and accelerometer recordings across daily-life activities, and the standard dataset for heart-rate estimation.
- WESAD, providing wrist and chest signals including PPG, and a second, contrasting task.
- ICU waveform sets derived from MIMIC or VitalDB, held as a reach option for larger-scale and cleaner PPG should time allow.
- Own WHOOP data covering approximately one year, giving a longitudinal n = 1 case for personalisation. WHOOP's public developer API exposes derived metrics such as recovery, strain, HRV, resting heart rate and sleep, rather than the raw PPG waveform, so personalisation on personal data runs on derived signals.

Stack: Python, PyTorch, HuggingFace (Transformers and PEFT), NumPy, Pandas, SciPy,
and Git with GitHub.

## Core Reading

| Work | Relevance |
| ---- | -------------- |
| [Pillai et al. (2025), PaPaGei](https://arxiv.org/abs/2410.20542), ICLR 2025 | The first open PPG foundation model, releasing weights and code and benchmarking skin-tone robustness and parameter efficiency. Primary base model. ([code](https://github.com/Nokia-Bell-Labs/papagei-foundation-model)) |
| [Saha et al. (2025), Pulse-PPG](https://arxiv.org/abs/2502.01108) | An open, field-trained PPG foundation model, held as a comparison base. ([code](https://github.com/maxxu05/pulseppg)) |
| [Abbaspourazad et al. (2024), Apple](https://arxiv.org/abs/2312.05409), ICLR 2024 | A consumer-scale PPG and ECG foundation model, showing that the representations carry health signal. |
| [Narayanswamy et al. (2024), Google](https://research.google/pubs/scaling-wearable-foundation-models), ICLR 2025 | How wearable foundation models scale with data, compute and size. |
| [Hu et al. (2021), LoRA](https://arxiv.org/abs/2106.09685) | The core parameter-efficient method for the personalisation experiments. |
| Sattigeri, Ghosh et al. (2022), Fair Infinitesimal Jackknife, NeurIPS 2022 | Improving the fairness of a pre-trained model without refitting, grounding the fairness pillar and its metrics. |
| [Koerber et al. (2023)](https://pubmed.ncbi.nlm.nih.gov/36333652/) | Heart-rate accuracy across skin tones, and the equity motivation for the study. |
| [Reiss et al. (2019), PPG-DaLiA](https://archive.ics.uci.edu/dataset/495/ppg+dalia) and [Schmidt et al. (2018), WESAD](https://archive.ics.uci.edu/dataset/465/wesad) | The two baseline datasets. |

The full annotated bibliography, covering foundation models, the case for
personalisation, domain adaptation, normalisation, datasets, signal quality, fairness
and efficiency, will be published here with the literature review.

## Scope and Limits

This is a representation-learning and efficiency study, conducted entirely on open
foundation models and open datasets. It makes no clinical claims and offers no
diagnoses. The comparison drawn to production systems rests on public documentation
rather than privileged information, and the work exposes no proprietary data or
intellectual property.

---

## This Repository

```
content/study.json      Study overview shown at the top of the dashboard
content/log/*.md        One markdown file per log entry
content/TEMPLATE.md     Copy this to start a new entry
app/                    The dashboard (Next.js)
middleware.ts           Password gate in front of every page
```

This repository is public, so log entries held here are readable on GitHub. The
password protects the dashboard's reading experience rather than the file contents,
and anything genuinely confidential should be kept out of `content/`.

### Adding a Log Entry

1. Copy `content/TEMPLATE.md` to `content/log/YYYY-MM-DD-short-slug.md`.
2. Fill in the frontmatter (`title`, `date`, `week`, `hours`, `tags`, `summary`) and write the entry in markdown.
3. Commit and push. The live log redeploys on its own, with nothing to upload.

```bash
git add . && git commit -m "Log: week 2" && git push
```

### Running It Locally

```bash
npm install
cp .env.example .env.local   # then set RESEARCH_LOG_PASSWORD
npm run dev
```

Open http://localhost:3000 and sign in with the password from `.env.local`.

### How the Password Works

Every route sits behind `middleware.ts`. Anyone without a valid session cookie is
sent to `/login`, which checks the submitted password against the
`RESEARCH_LOG_PASSWORD` environment variable and sets an HttpOnly cookie valid for
thirty days. The password itself is never stored in this repository, and if the
variable is missing the site fails closed rather than exposing the log. To change it,
update `RESEARCH_LOG_PASSWORD` in the hosting environment and redeploy.
