# 02 Measuring AI systems

How to tell a real improvement from luck. The core rule across all the projects: **no change is kept until a
measurement shows it helps, and nothing else gets worse.** Sources: Fractal's academia Part 2 and Parts 5–6; Ruby's
phone-brain chapter (3.24); GrindPilot's exam (`11 The exam.md`) and review.

---

## 1. Instruments that worked

| Instrument | What it measures | Note |
|---|---|---|
| **Coding benchmarks** (HumanEval+, MBPP+, LiveCodeBench) | Correctness on hidden tests | Small suites (40 LiveCodeBench problems) are noisy |
| **Paired comparison** | Same items, old vs new: "fixed N, broke M" | Far more trustworthy than two separate averages |
| **Live checks through the real app** | A real task (read 11 files, report a fact from each), permission behaviour | Catches what offline evals can't |
| **Haystack recall** | Hide 12 random codes in 15–30K tokens, ask for all | Tests whether long context is really usable |
| **Speed benches** | Fixed prompts (reasoning, prose, code rewrite) at temperature 0, plus VRAM | Through the real server path |
| **Replays** | Feed a real long chat through new context code offline | Counts notes and time without the model |
| **Blind judging** | Two anonymous answers, both orders | For writing quality and tone |
| **Seeded end-to-end bench** | 20 seeded runs per task on a simulated environment | GrindPilot: success, clicks, seconds, guarded clicks |

**How we know.**
- The table is Fractal's own instrument list, Fractal academia 2.1, with each instrument's first use: coding benchmarks (3.1; "Liu et al. *EvalPlus* (HumanEval+, MBPP+), arXiv 2305.01210; Jain et al. *LiveCodeBench*, arXiv 2403.07974"), haystack recall (3.12), speed benches (3.11, 3.12), replays (3.5), blind judging (3.10, 3.24).
- The seeded end-to-end bench: GrindPilot's, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\11 The exam.md`.

**Proof.**
- Results: `Fractal\results\runs` (benchmark runs), `Fractal\runtime\experiments\2026-11-07\kv4\results.json` (haystack), `Fractal\runtime\experiments\2026-11-07\spec\results.json` (speed)
- Code: `Fractal\evals\fractal_evals`, `Fractal\runtime\experiments\tests\live_checks.py`, `Fractal\runtime\experiments\tests\room_replay.py`, `D:\Games\HoYoPlay\games\Grind Pilot\exam`

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 2. Rules for valid measurements (each learned the hard way)

1. **The machine must be otherwise idle.** A game or Discord holding VRAM cut speed to 10–28 tok/s. Benches now refuse
   to run when other GPU apps are found.
2. **Measure through the real path.** A bench that started its own server gave different numbers from the server the
   app actually uses.
3. **Nothing else may touch what's being measured.** A 30-second status poll silently reloaded the model mid-bench.
4. **Use paired, fixed tests.** Report fixed/broke counts, not just percentages.
5. **Report flakiness honestly.** A check that passed 1/2 before a change and fails sometimes after is flaky, not a
   regression. Say which.
6. **Give the baseline a clean room.** A first toolbox test ran the "without" condition in a folder where the previous
   month's script was still lying around, so it reused it. That run was discarded.
7. **Score the whole answer.** The same test's scorer read only the last 600 characters and marked right answers wrong.
8. **Compare neighbours, not ends.** Runs from different days with different code can't be compared across the gap.
9. **Use only synthetic test files.** A personal PDF was once picked from Downloads as an OCR test. Never use the
   user's own documents.

**Four more, from someone else's careful write-up** (`FareedKhan-dev/kimi-k3-in-c`, read 11 Nov 2026; their
measurements, not ours; the model is in 01, section 7):
- **A limit you only ask for measures nothing.** Told to use 8 GB on a 228 GB machine, a program still benefits from
  the system's file cache. They capped memory from outside the program, then compared. Any test of a low-memory mode
  must enforce the limit, or the number flatters it.
- **The drive is part of the experiment.** 41 to 61 % of the time went to waiting on storage at every memory size,
  and the same program took 31.7 s per token on a local NVMe drive and 70.6 s on a network volume. Hold the device
  fixed between two settings, and measure the drive the way the program reads it (large random direct reads), which
  a simple copy test does not.
- **A simulation fed the wrong workload is wrong in both directions.** Their cache simulation predicted 36 % hits;
  the real figure was 0 %. The trace had been recorded in a mode that re-ran the whole prompt each step, which
  manufactures repeats the normal mode doesn't have. Record the trace from the path you will ship.
- **Test without the big thing, and verify the big thing in parts.** Their whole engine is checked exactly against a
  reference on a 13-layer model with the same structure, in under a minute, before anyone downloads 1.56 TB. The
  download is then checked shard by shard, because "a partial download does not fail loudly; it produces wrong
  tokens", and a failed shard costs 17 GB instead of the lot.

**How we know.**
- Rules 1–8: Fractal academia 2.2 (each tied to the incident that taught it); rule 3's 30-second poll in 3.7; rules 6 and 7 (the "without" run reusing an old script, the 600-character scorer) in 3.20.
- Rule 9 (a personal PDF picked as an OCR test): Fractal academia Part 6 (Bugs and lessons); result file not kept.
- The four further rules: outside source, "kimi-k3-in-c (FareedKhan-dev/kimi-k3-in-c), README; found through an Instagram reel by princegupta.ai" (their measurements, not ours).

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-08\toolbox_live_results_run1.json` (the discarded unfair run) beside `toolbox_live_results.json`
- Code: `Fractal\runtime\experiments\2026-11-08\toolbox_live.py`

**The idea behind it:** [Repeats and the noise floor](file:///E:/AI%20academia/Study%20hub.html#repeats), [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired)


## 3. Secret exams and hard gates

- **Keep the exam secret from the learner.** An exam the learner has seen measures memory, not skill. Fractal's Coach
  keeps exam questions hidden from the model; GrindPilot never learns from its exam pictures.
- **Keep exam material before it is deleted.** GrindPilot's digest deletes raw recordings, so it now keeps 1 keyframe
  in 20 (at most 100 per recording) for the exam, at the cost of at most 1 learned step in 20.
- **Some scores are gates, not trade-offs.** GrindPilot: zero spending-guard misses and 100 % claim precision ("never
  press Not Claimable"). A change that breaks a gate is rejected whatever else it improves.
- **Re-run the old exam after adding a skill.** Ruby's phone brain v4 learned 6 new actions, scored 86.7 % on them,
  and started setting alarms for "What time does Fractal go to sleep?". Only the old exam and the unwanted-action count
  showed it.

**How we know.**
- Fractal's Coach keeping exam questions hidden: Fractal academia 3.2.
- GrindPilot's keyframes (1 in 20, at most 100), its gates (zero spending-guard misses, 100 % claim precision) and never learning from exam pictures: `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\11 The exam.md`.
- Ruby's v4 brain (86.7 % on new actions, alarms for "What time does Fractal go to sleep?"): Fractal academia 3.24; results `Fractal\runtime\experiments\2026-11-09\ruby_brain\results`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-09\ruby_brain\results`
- Code: `D:\Games\HoYoPlay\games\Grind Pilot\exam`

**The idea behind it:** [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 4. Benches that check real state catch lying successes

- GrindPilot's bench found a **false success within minutes**. `reach` clicked a button that changed nothing, and still
  returned as if it had arrived. A test that only checks "did it return OK" would have hidden it. The bench checks the
  environment's own state (the page it ended on, what was claimed).
- **A click that changes nothing is not arriving.** Fix: if the screen is unchanged after the click (similarity
  ≥ 0.98), carry on searching.
- **Fixtures can collide with the thing under test.** A simulated HUD icon was colour-identical to a word, so the fake
  OCR read the icon as a button. Every drawn thing needs a distinct colour.
- **Judge the agent with its own functions,** not a re-implementation. That is what makes the exam trustworthy.

**How we know.**
- All four points (the false `reach` success, the 0.98 similarity fix, the colour collision, judging with the agent's own functions): GrindPilot's own testing, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\11 The exam.md` ("GrindPilot documentary (8 Nov 2026) and Fractal's review of it").

**Proof.**
- Code: `D:\Games\HoYoPlay\games\Grind Pilot\exam`, `D:\Games\HoYoPlay\games\Grind Pilot\tests`
- Not kept here: the bench runs themselves.

**The idea behind it:** [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden), [Append-only logs and an auditor](file:///E:/AI%20academia/Study%20hub.html#audit)


## 5. Measure the product's path, not just the model

- **"It returned" is not "it worked"; the user's next sentence is a free judge** (Ruby, 11 Nov 2026; **Measured**).
  The phone assistant's journal marked every reply that came back as ok, so its first real report said 0 failed of
  12 while the user corrected it three times in a row. Counting a correction ("no", "I meant", "that's not what I
  meant", within five minutes) and a near-identical answer to a different question as misses found **6 of 12**.
  Guard the rule: a bare "no" after the assistant asked a question is an answer, and two different alarms are not
  a repeat. Fractal academia 3.31.
- **If the product sends chat history, the exam must too.** The same assistant scored 93.7 % on 53 single questions
  and **79.4 %** on 34 short conversations (corrections, split names, small talk). The single questions showed 1
  unwanted action in 75; the conversations showed 8 in 78 ("Morning!" set an alarm). Nothing in its training data
  had a second turn.
- **Fine-tuning can cost general sense the old exam never asked for.** After a correction the untrained model left
  the wrong meaning 96 % of the time, the fine-tuned one 75 %. Keep the stock model's score beside the tuned one on
  every new exam: it shows what was lost as well as what was gained.

- **Use the product's own parser.** On Ruby's phone, the stock 1.7B added a random action ("open Spotify") to 94 % of
  ordinary chat replies. A strict test parser had hidden this; the app's lenient parser, which it needs because small
  models mangle tags like `}></do>`, exposed it.
- **Test the whole path.** A reply's `notes_read` action arrived on the phone as `notesread`, because the app stripped
  markdown underscores from the whole reply, tag included. No action written by the phone brain had ever run on the
  phone, across two releases. The exam scored the raw model text and couldn't see this.
- **Test files and the real app can disagree.** An offline mypy check reported "found nothing" because one unparsable
  file makes mypy stop checking all the others, and the grader's own header tripped a warning on every answer. Parse
  each file first and check broken ones apart; silence complaints that belong to the harness.

**How we know.**
- Corrections as misses, 6 of 12: Fractal academia 3.31; code `Fractal\fractal\ruby\digest.py`.
- 93.7 % vs 79.4 % on the talk exam, 1 in 75 vs 8 in 78 unwanted actions, 96 % vs 75 % after a correction: Fractal academia 3.31; results `Fractal\runtime\experiments\2026-11-11\ruby_talk_exam\results`.
- The stock 1.7B adding an action to 94 % of replies, and `notes_read` arriving as `notesread`: Fractal academia 3.24.
- mypy stopping on one unparsable file: Fractal academia 3.22; results `Fractal\runtime\experiments\2026-11-08\typecheck_offline_results.json`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-11\ruby_talk_exam\results`, `Fractal\runtime\experiments\2026-11-09\ruby_brain\results`, `Fractal\runtime\experiments\2026-11-08\typecheck_offline_results.json`
- Code: `Fractal\runtime\experiments\2026-11-11\ruby_talk_exam\talk_exam.py`, `Fractal\runtime\experiments\2026-11-08\typecheck_offline.py`

**The idea behind it:** [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden), [Distillation into a small model](file:///E:/AI%20academia/Study%20hub.html#distill)


## 6. Judges

- **A judge needs the ground truth.** Without the fact card, a 27B judge preferred "I don't know" to a correct answer
  (1–4). With the card, the same answers won 5–0.
- **Judge both orders** and count ties. Ruby's brains were compared as wins–losses–ties (for example 18–12, 23 ties).
- **Blind writing judgement** chose a 26B MoE writer over the 27B coder 5/8 to 3/8 on 8 prompts. That is small but
  enough to route writing to it.
- **When the evaluator can't perceive the output** (an AI that can't hear audio), use objective proxies (pitch,
  melody span, whisper transcription) and leave the final call to the person's own blind listening test.

**How we know.**
- The judge needing the fact card (1–4 without, 5–0 with) and wins–losses–ties 18–12, 23 ties: Fractal academia 3.24; results `Fractal\runtime\experiments\2026-11-09\ruby_brain\results` (the `judge_*.json` files).
- Blind writing judgement 5/8 vs 3/8: Fractal academia 3.10; result `Fractal\runtime\experiments\2026-11-06\writing-local.json` and `writing-writer.json`.
- Objective proxies for audio (pitch, melody span, whisper) and the person's blind listen: the 9 Nov voice-design runs (scripts `Fractal\runtime\experiments\2026-11-09\melody_stats.py` and `Fractal\runtime\experiments\2026-11-09\pitch_test`); no academia section found that records them, so source not recorded beyond those scripts.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-09\ruby_brain\results`, `Fractal\runtime\experiments\2026-11-06\writing-writer.json`
- Code: `Fractal\runtime\experiments\2026-11-09\ruby_brain\judge.py`, `Fractal\runtime\experiments\tests\writing_bench.py`

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired)


## 7. Agreement must come from independent sources

- In self-practice, the problem setter's own hand-worked answers were **wrong about half the time** (187 of 385
  problems rejected as "the setter's tests look wrong"). Only independent solutions agreeing could be trusted.
- In GrindPilot's general brain, a skill that works in two games from **the same studio** may be a studio habit, not a
  general skill. Independence means a different UI toolkit or engine, not just a different title.
- **Count evidence per independent context**, for example per game-day, not per retry. Ten retries in one evening are
  one piece of evidence.
- **Store evidence per (source, item) and replace it, never add.** Without that, nightly consolidation counts the same
  evidence again and everything gets promoted within a week.

**How we know.**
- 187 of 385 problems rejected as "the setter's tests look wrong": Fractal academia 3.3; result file not kept.
- Same-studio skills, evidence per game-day, replace-never-add evidence: GrindPilot's brain review, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\GRINDPILOT_REVIEW.md` and `GRINDPILOT_BRAIN.md`.
- The idea of independent agreement in self-practice: "Singh et al. *Beyond Human Data* (ReST-EM), arXiv 2312.06585" (background).

**Proof.**
- Code: `Fractal\fractal\practice.py`
- Not kept: the overnight practice run's per-problem log.

**The idea behind it:** [Sleep: consolidating memory offline](file:///E:/AI%20academia/Study%20hub.html#sleep), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 8. A suspicious number is a bug report

- "One fact merged 53 others" exposed a parser that had been reading past the end of the fact ledger into the action
  log: 140 log lines had been treated as facts.
- A map that opened as one dot (zoom 0.0014 instead of ~0.65) exposed springs overshooting around hub nodes.
- Tune by numbers (median radius, tick time), not by screenshots, which can be stale.

**How we know.**
- "One fact merged 53 others" and the 140 log lines read as facts: Fractal academia 3.14; code `Fractal\fractal\mind.py`.
- The map opening as one dot (zoom 0.0014): `09 Interfaces for AI.md`, section 3, and Fractal academia 3.14 (force tuning).
- Tuning by numbers, not screenshots: same; result files not kept.

**Proof.**
- Code: `Fractal\fractal\mind.py`, `Fractal\fractal\studio\studio.html`
- Not kept: the before and after map measurements.

**The idea behind it:** [Graph memory with personalised PageRank](file:///E:/AI%20academia/Study%20hub.html#ppr)


## 9. How a decision is made

```
idea → find the source (paper, docs, PR) → small offline test → bench on the idle machine through the real path
     → live check in the real app → adopt only if better and nothing else is worse → record numbers beside the setting
```

Keeping measured numbers as comments next to each setting means the reason for every value travels with it.

**How we know.**
- The pipeline is Fractal's own rule, Fractal academia 2.3, used in every measured section since. Settings carrying their numbers as comments: see `Fractal\config\agents.toml`.

**Proof.**
- Code: `Fractal\config\agents.toml`

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired), [Repeats and the noise floor](file:///E:/AI%20academia/Study%20hub.html#repeats)


## 10. Sampled exams: find the noise floor first, then pair the answers (Measured, 13 Nov 2026)

A small model's exams sampled their answers (temperature 0.7, three seeds a question, 306 answers a model). A rule
written beforehand refused a new version over a 3.1-point drop on one exam. A later trial showed the rule was finer
than the exam.

- **Rebuild the thing you already have, by the new recipe, before judging anything made by it.** The control was
  the current model rebuilt from its training output. It was not identical to the shipped file: 309 of 310 tensors
  matched. The base model's files held the word table twice (tied embeddings, saved as two tensors); writing both
  made the converter store a second copy at lower precision. Every candidate carried the same handicap, so the
  ranking looked reasonable and only the control showed it.
- **The same file gave the same answers every time** (fixed seeds, 306 of 306). So the noise is not between runs.
- **A rounding-sized change still moved about one answer in ten.** The flawed control, different only in the word
  table's precision, changed 29 of 306 answers (17 lost, 12 won) and read 2.5 points lower on one exam. Sampling
  turns tiny differences in the weights into different answers. That is the size of difference the exam cannot see.
- **Pair the answers.** Compare each answer with the reference model's answer to the same question and seed, count
  only the ones that changed (lost, won), and ask how likely a split that uneven is by chance (the exact sign
  test). A real improvement shows as "won" clearly outnumbering "lost". The fixed control scored 0 lost, 0 won.
- **More seeds, not finer thresholds.** On three seeds the new version was 28 won, 21 lost (chance 0.39). On ten
  seeds it was 95 won, 53 lost (chance 0.0007), and the 3.1-point drop was gone (92.5 % against 92.1 %).
- **Confirm on seeds the choice wasn't made on.** A merged candidate picked for its first three seeds passed on all
  ten (chance 0.029) but not on the seven fresh ones (0.21). Counting the seeds that chose it flatters it. With
  several candidates and two rules, 0.029 is weak evidence anyway.
- **If a rule changes after any result is seen, say so,** and show that the verdict doesn't depend on the change.
- Record: Ruby academia 3.9; Fractal academia 3.42.

**How we know.**
- Every number (309 of 310 tensors, 306 of 306 repeat, 29 of 306 changed, 28–21 p 0.39, 95–53 p 0.0007, 92.5 % vs 92.1 %, 0.029 then 0.21 on fresh seeds): our own measurement, Ruby academia 3.9 and Fractal academia 3.42; results `Ruby\docs\research\2026-11-12\ruby_weights` (`analysis.json`, `analysis-s10.json`, `confirm.log`, `baseline_again.json`).
- The exact sign test: general statistics; see the technique write-up.

**Proof.**
- Results: `Ruby\docs\research\2026-11-12\ruby_weights\analysis-s10.json`, `Ruby\docs\research\2026-11-12\ruby_weights\confirm.log`
- Code: `Ruby\docs\research\2026-11-12\ruby_weights\analyse.py`, `Fractal\exam-kit\src\pair.rs`

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired), [Repeats and the noise floor](file:///E:/AI%20academia/Study%20hub.html#repeats), [Confidence intervals for small exams](file:///E:/AI%20academia/Study%20hub.html#wilson)


## 11. Two small traps in an exam harness (Found, 21 Nov 2026)

- **A gate where every waiter yields to every other waiter deadlocks.** Lattice's exam gate made an exam wait while
  "another exam has the model". Two exams queued overnight (a general run and a model comparison) each saw the other
  and waited, with the card idle, from 06:00 to ~09:00. Fix: one holder at a time (a file holding the process id,
  removed on pause; a holder whose process is gone counts for nothing), and with no holder the exam that started
  first goes first. Test it with two waiters, not one.
- **"The answer contains the expected number" counts 42 as found in 420.** Lattice's blind Compare grader matched the
  expected answer as a substring. A bare number must match as a standalone number (no digit, decimal point or minus
  on either side); text answers can stay a case-insensitive substring.
- Records: Fractal academia 3.61 (09:10), 3.63; Odysseus academia 3.6, 3.7.

**How we know.**
- The deadlocked exam gate (06:00 to ~09:00) and its one-holder fix: Fractal academia 3.61 (09:10) and 3.63; Odysseus academia 3.7.
- The substring grader counting 42 in 420: Fractal academia 3.63; Odysseus academia 3.6.

**Proof.**
- Code: `Fractal\exam-kit\src\gate.rs` (holder file `Fractal\exam-kit\holder.pid`), `Fractal\rust\parts\odysseus\src\compare.rs`
- Not kept: the overnight logs of the two waiting exams.

**The idea behind it:** [Processes, handles and clean shutdown](file:///E:/AI%20academia/Study%20hub.html#handles), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)
