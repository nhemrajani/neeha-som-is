# Compute-Efficient Personalisation of PPG Foundation Models

**Independent Study · Fall 2026 – Spring 2027 · 4.0 credits per term**
Neeharika Hemrajani · Advisor: Professor Sohee Park

> **📓 Research log (password protected):** _deployment URL goes here_
> Weekly entries, current results, and where each deliverable stands.
> The password is shared separately — ask me if you need it again.

---

## The question, in one sentence

> How cheaply can you tune a shared AI model to fit one person, when is that worth the cost, and does it help everyone equally?

## Background

**PPG** (photoplethysmography) is the optical pulse signal in nearly every consumer
wearable. A green LED shines light into the wrist; blood absorbs some of it and
scatters the rest back to a detector. Each heartbeat pushes a pulse of blood through
the vessels under the strap, so the light bouncing back rises and falls in time with
the heart. That waveform yields heart rate, and from the spacing between peaks, heart
rate variability (HRV) — the main input to metrics like WHOOP's Recovery score.

Until recently, reading that signal meant hand-building a separate model per
variable — heart rate, sleep staging, workout detection — each with its own labelled
training data. In roughly the last eighteen months, **open PPG foundation models**
have appeared: large self-supervised networks pretrained on millions of unlabelled
pulse recordings, learning what pulse signal looks like generically. Downstream
tasks then train a small predictor on top of those representations instead of the
raw wave, needing far less labelled data.

## The problem

**These models are trained once, for an entire population, and never change for an
individual.** Bodies differ, so a model optimised for the average performs
mediocrely for any specific person.

Production systems handle this cheaply, by **normalisation**: your readings are
scored against your own rolling baseline (WHOOP compares current HRV to your 30-day
normal — which is why the score is greyed out for the first four days while the
system learns your range). This is robust and nearly free, but it assumes the
*relationship* between signal and outcome is shared across people, and only your
centre and range differ.

For some people that assumption breaks. Vascular structure, arrhythmia, age, and
skin tone's effect on the optical signal can change the mapping itself — and a
baseline is only a rescaling on top of a one-size-fits-all mapping. **Personalising
the model itself** can re-learn the mapping for that person. The catch: tuning isn't
free, and "a custom model for every member" may cost more than it's worth at scale.

### The gap

The PPG foundation-model literature repeatedly names three open problems —
**on-device efficiency, per-person personalisation, and fairness across
subpopulations** — while most large-lab work has focused on scale and pretraining.
Four categories of personalisation method now exist (domain adaptation,
parameter-efficient fine-tuning, retrieval, and hypernetwork-generated adapters),
each demonstrated on a different task under a different definition of cost. **No one
has placed them on a single accuracy-versus-cost axis for PPG.**

### The framing

"One model per person, at scale" is fundamentally a **compute allocation problem**:
personalisation is viable only if the accuracy it adds justifies the compute it
consumes. Treating it as a cost-benefit frontier rather than an accuracy-only
question is as much a management-science lens as a machine-learning one.

## Research questions

| # | Question |
| - | -------- |
| **Q1** | **Baseline / reproducibility.** Can a published open PPG foundation model reproduce a reported downstream result (e.g. heart-rate estimation) on an open dataset, using a clean, documented pipeline? |
| **Q2** | **Personalisation and fairness.** Does adapting that model to an individual, via parameter-efficient fine-tuning on that person's data, measurably improve per-person predictions over the population model? By how much, for whom, and does it narrow subgroup gaps (e.g. across skin tone) rather than widening them? |
| **Q3** | **Efficiency frontier.** What does that improvement cost? Plotting accuracy gain against compute and parameters updated, where does per-person personalisation stop being worthwhile? |

Underneath those: how much per-person data is *enough* for personalisation to help?
Does it help everyone, or mainly the people the population model already served
poorly? And can adaptation be made cheap enough to be plausible on-device?

## Methods under comparison

| | Model | Personalisation | Cost |
| - | ----- | --------------- | ---- |
| **A** | Shared | None (population model) | Nothing |
| **B** | Shared | Normalisation — what production does today | Negligible |
| **C1** | Shared | Linear probing: freeze the model, train one layer on top of the representations | Low |
| **C2** | Per user | Parameter-efficient fine-tuning (LoRA / adapters): freeze the model, insert small trainable parameters | Medium |
| **C3** | Per user | Full fine-tuning: update every parameter — most accurate, expensive to store, hard to scale | High |

Cost is measured as **parameters updated and stored bytes per person**, with each
method run at several personal-data budgets.

## Plan of work

|  | **Part 1 — Fall 2026**<br>Foundations & open baseline | **Part 2 — Spring 2027**<br>Personalisation & efficiency |
| --- | --- | --- |
| **Focus** | Q1 | Q2 & Q3 |
| **Core work** | Data handling → PPG preprocessing → load a pretrained open model → reproduce one downstream metric | Parameter-efficient adaptation → per-person experiments → accuracy-vs-compute analysis → fairness analysis |
| **Data** | Open PPG datasets (PPG-DaLiA, WESAD) + own WHOOP-derived metrics | Same, plus deeper use of the n = 1 longitudinal data |
| **Output** | Literature review + reproducible baseline repository + results memo | Technical paper + experiment repository + results talk |
| **Credits** | 4.0 | 4.0 |

### Skills being built in Fall

Python fluency (alongside CPSC 1100) · scientific Python (NumPy/Pandas/SciPy) · PPG
preprocessing (filtering, segmentation, peak detection) · ML fundamentals and
evaluation (leakage-safe splits, baselines, error bars) · a first small neural
network in PyTorch · loading a pretrained open model and linear-probing a downstream
task.

## Deliverables

**Fall 2026**

- **Literature review** (~8–12 pages) — the open PPG foundation-model landscape, the personalisation/efficiency gap, and a precise statement of questions and datasets. Draft at mid-term for feedback.
- **Reproducible baseline repository** — loads an open PPG dataset, runs preprocessing, loads a published open model, and reproduces one downstream metric, with a README and environment file so it clones and runs.
- **Results memo** (~2–3 pages) — the baseline number, surprises, and the specific personalisation experiments for Spring.

**Spring 2027**

- **Personalisation experiments** — population vs per-person results across at least three adaptation methods, with leakage-safe splits and error bars.
- **Efficiency-frontier analysis** — the accuracy-versus-compute curve and a defensible answer to "when is personalisation worth it?"
- **Fairness analysis** — whether personalisation narrows or widens subgroup gaps, reported with standard fairness metrics (demographic parity, equality of opportunity) alongside accuracy.
- **Technical paper** (~15–20 pages, workshop-paper shape) plus a public experiment repository whose figures are regenerated by scripts in the repo.

*Stretch:* report calibration and uncertainty of personalised predictions alongside
accuracy using an off-the-shelf toolbox (e.g. UQ360), treating "how much per-person
data is enough" as a sample-efficiency question — testing not just whether
personalisation is more accurate, but whether its confidence can be trusted.

Assessment is by these deliverables at each term end, supported by a **weekly
research log** (the dashboard above) and **biweekly supervisor check-ins**.

## Intended contributions

1. An open, reproducible **benchmark and harness** for per-person personalisation of an open PPG foundation model, releasable so others can extend it.
2. A systematic **accuracy-versus-compute characterisation** of per-person adaptation across methods — the first such frontier for an open PPG foundation model.
3. A **fairness analysis as a first-class result**, not an afterthought: whether and for whom per-person adaptation narrows subgroup gaps, using the skin-tone robustness benchmark the base model already ships.

## Data and tools

**Datasets (open):**

- **PPG-DaLiA** — wrist PPG + accelerometer across daily-life activities; the standard for heart-rate estimation.
- **WESAD** — wrist/chest signals including PPG; a second, contrasting task.
- **ICU waveform sets** (MIMIC-derived / VitalDB) — a reach option for larger-scale, cleaner PPG if time allows.
- **Own WHOOP data (~1 year)** — a longitudinal n = 1 for personalisation. *Caveat:* WHOOP's public developer API exposes derived metrics (recovery, strain, HRV, resting HR, sleep), not the raw PPG waveform, so personal-data personalisation runs on derived signals.

**Stack:** Python · PyTorch · HuggingFace (Transformers / PEFT) · NumPy/Pandas/SciPy · Git/GitHub

## Core reading

| Work | Why it matters |
| ---- | -------------- |
| [Pillai et al. (2025), **PaPaGei**](https://arxiv.org/abs/2410.20542) — ICLR 2025 | First open PPG foundation model; releases weights + code, benchmarks skin-tone robustness and parameter efficiency. **Primary base model.** ([code](https://github.com/Nokia-Bell-Labs/papagei-foundation-model)) |
| [Saha et al. (2025), **Pulse-PPG**](https://arxiv.org/abs/2502.01108) | Open, field-trained PPG foundation model; comparison base. ([code](https://github.com/maxxu05/pulseppg)) |
| [Abbaspourazad et al. (2024, Apple)](https://arxiv.org/abs/2312.05409) — ICLR 2024 | Consumer-scale PPG/ECG foundation model; representations carry health signal. |
| [Narayanswamy et al. (2024, Google)](https://research.google/pubs/scaling-wearable-foundation-models) — ICLR 2025 | How wearable foundation models scale with data, compute, and size. |
| [Hu et al. (2021), **LoRA**](https://arxiv.org/abs/2106.09685) | Core parameter-efficient method for the Spring experiments. |
| Sattigeri, Ghosh et al. (2022), Fair Infinitesimal Jackknife — NeurIPS 2022 | Improving fairness of a pre-trained model without refitting; grounds the fairness pillar and its metrics. |
| [Koerber et al. (2023)](https://pubmed.ncbi.nlm.nih.gov/36333652/) | Heart-rate accuracy across skin tones — the equity motivation. |
| [Reiss et al. (2019), PPG-DaLiA](https://archive.ics.uci.edu/dataset/495/ppg+dalia) · [Schmidt et al. (2018), WESAD](https://archive.ics.uci.edu/dataset/465/wesad) | The two baseline datasets. |

The full annotated bibliography — foundation models, the case for personalisation,
domain adaptation, normalisation, datasets, signal quality, fairness, and efficiency —
lives in the study documents and will be published here with the literature review.

## Scope and limits

This is a **representation-learning and efficiency study**, run entirely on open
foundation models and open datasets. **No clinical claims, no diagnoses.** The
comparison to production systems is drawn from public documentation, not privileged
information, and the work exposes no proprietary data or IP.

---

## This repository

```
content/study.json      Study overview shown at the top of the dashboard
content/log/*.md        One markdown file per log entry
content/TEMPLATE.md     Copy this to start a new entry
app/                    The dashboard (Next.js)
middleware.ts           Password gate in front of every page
```

> **Note:** this repository is public, so log entries here are readable on GitHub.
> The password protects the dashboard's reading experience, not the file contents.
> Keep anything genuinely confidential out of `content/`.

### Adding a log entry

1. Copy `content/TEMPLATE.md` to `content/log/YYYY-MM-DD-short-slug.md`.
2. Fill in the frontmatter (`title`, `date`, `week`, `hours`, `tags`, `summary`) and write the entry in markdown.
3. Commit and push. The live log redeploys on its own — nothing to upload.

```bash
git add . && git commit -m "Log: week 2" && git push
```

### Running it locally

```bash
npm install
cp .env.example .env.local   # then set RESEARCH_LOG_PASSWORD
npm run dev
```

Open http://localhost:3000 and sign in with the password from `.env.local`.

### How the password works

Every route sits behind `middleware.ts`. Anyone without a valid session cookie is
sent to `/login`, which checks the submitted password against the
`RESEARCH_LOG_PASSWORD` environment variable and sets an HttpOnly cookie good for 30
days. The password itself is never stored in this repository, and if the variable is
missing the site fails closed rather than exposing the log. To change it, update
`RESEARCH_LOG_PASSWORD` in the hosting environment and redeploy.
