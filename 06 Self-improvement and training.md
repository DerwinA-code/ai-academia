# 06 Self-improvement and training

How an AI can get better: by practice, by memory, by distillation, by sampling, and what didn't work. Sources:
Fractal's academia 3.2, 3.3, 3.6, 3.10, 3.13, 3.24 and Part 5.

---

## 1. Improvements as files, not weights

- **Sources:** *Self-Improving AI Coding Agents Through Accumulated Behavioral Rules* (arXiv 2607.13091): improvements
  kept as version-controlled rule files. *Agentic Context Engineering* (ACE, arXiv 2510.04618): playbooks that grow beat
  repeated rewrites. Harness² (see 03) confirms it at scale.
- **The Coach design that worked:**
  - **lessons:** recalled into prompts for similar tasks;
  - **house rules:** apply everywhere and the model can't change them;
  - **exam questions:** hidden from the model, used only to measure it;
  - **corrections:** saved as training data for a possible later fine-tune.
- **Lesson:** keeping the tests secret from the learner is what makes "it got better" believable.

**How we know.**
- Rules as version-controlled files: outside source, *Self-Improving AI Coding Agents Through Accumulated Behavioral Rules*, arXiv 2607.13091. Growing playbooks: Zhang et al. *Agentic Context Engineering* (ACE), arXiv 2510.04618. At scale: Xu, Chen, …, Lee, Pfister. *Harness²*, arXiv 2610.14224.
- The Coach (lessons, house rules, hidden exam questions, corrections): our own build, Fractal academia 3.2; code `Fractal\fractal\coach.py`, house rules `Fractal\data\rules.json`, corrections `Fractal\data\training.jsonl`.
- "Secret tests make 'it got better' believable": our own lesson, Fractal academia 3.2; source of the measurement it rests on not recorded beyond that section.

**Proof.**
- Code: `Fractal\fractal\coach.py`
- Results: `Fractal\data\rules.json`, `Fractal\data\training.jsonl`

**The idea behind it:** [Lessons and playbooks in the prompt](file:///E:/AI%20academia/Study%20hub.html#lessons), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 2. Self-practice needs independent agreement

- **Method** (after ReST-EM, *Beyond Human Data*, arXiv 2312.06585): the model sets a problem with hand-worked hidden
  tests, solves it 3 times independently, and a solution is kept **only if it reproduces the setter's answers**.
  Problems with ≥ 0.5 word similarity to any benchmark or exam are dropped as contamination.
- **Overnight result:** 385 problems → **115 kept**, 187 rejected ("setter's tests look wrong"), 43 dropped for overlap.
- **The setter is wrong about half the time.** Self-generated data needs agreement between independent solutions, not a
  confident setter.
- **Left alone with a study folder, the learner marked its own work** (13 Nov 2026). Asked to "learn and practise"
  from a folder of lessons and a worked course, a 27B spent most of a 16-minute visit re-reading (its context was
  trimmed seven times), then set itself three easy tasks, checked them with its own asserts, and reported the
  course's quizzes as solved. No error occurred, so nothing was learned.
- **What a self-study folder needs:** exercises from an outside source; a checker that swaps in the source's own
  tests (proved by a self-test: every reference solution passes, no starting file does); a progress record written
  by the checker, not the learner; the reference answer locked until a pass or a few honest failures; and notes
  accepted only for exercises the learner first got wrong.
- **A short playbook from the model's own compiler errors helped where a compiler was in the loop:** 12 lines in
  the prompt took a Rust benchmark from 139 to 148 of 156 with the compiler loop (fixed 10, broke 1, p = 0.012),
  and from 136 to 140 without it (inside the noise). One greedy run each; unchanged scores drifted by 2 to 3
  between days.

**How we know.**
- The method: outside source, Singh et al. *Beyond Human Data* (ReST-EM), arXiv 2312.06585; our build Fractal academia 3.3, code `Fractal\fractal\practice.py`.
- 385 → 115 kept, 187 rejected, 43 dropped: our own measurement, Fractal academia 3.3; kept problems `Fractal\data\practice\problems.jsonl`; the overnight run's log not kept.
- The learner marking its own work (16-minute visit, context trimmed seven times): our own observation, Fractal academia 3.39; the visit's transcript not kept as a result file.
- What a self-study folder needs: our own build, Fractal academia 3.39; `Fractal\Rust academy\practice`.
- Playbook 139 → 148 of 156 (p = 0.012) and 136 → 140 without the compiler: our own measurement, Fractal academia 3.39 (adopted in 3.43); playbook `Fractal\Rust academy\lessons\PLAYBOOK.md`; result `Fractal\runtime\experiments\2026-11-12\rust_academy\academy_measure.json`.

**Proof.**
- Results: `Fractal\data\practice\problems.jsonl`, `Fractal\runtime\experiments\2026-11-12\rust_academy\academy_measure.json`
- Code: `Fractal\fractal\practice.py`, `Fractal\runtime\experiments\2026-11-12\rust_academy\measure_academy.py`
- Not kept: the overnight practice log; the 13 Nov self-study transcript.

**The idea behind it:** [Solve, check, repair with a compiler](file:///E:/AI%20academia/Study%20hub.html#repair), [Lessons and playbooks in the prompt](file:///E:/AI%20academia/Study%20hub.html#lessons), [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired)


## 3. LoRA on self-practice data: no gain

A LoRA on the 4B helper, trained on its own proven practice answers:

| Benchmark | Before | After |
|---|---|---|
| HumanEval+ | 77.5 | 72.5 |
| MBPP+ | 76.2 | 73.8 |
| LiveCodeBench | 25 | 30 |

No clear gain; **not adopted.** Proven answers alone did not teach a small model new skill.

**How we know.**
- HumanEval+ 77.5 → 72.5, MBPP+ 76.2 → 73.8, LiveCodeBench 25 → 30: our own measurement, Fractal academia 3.10 and Part 5 (Negative results); code `Fractal\fractal\train\lora.py`; training data `Fractal\data\practice\training.jsonl`; benchmark runs `Fractal\results\runs\20261106-075430-helper-base-quick.jsonl.gz` and `Fractal\results\runs\20261106-094800-helper-lora-quick.jsonl.gz`, logs `Fractal\runtime\logs\quick-helper-base.log` and `Fractal\runtime\logs\quick-helper-lora.log` (corrected 24 Nov: was "benchmark result files not kept"; 80-task quick suites).
- Benchmarks: outside sources, Liu et al. *EvalPlus* (HumanEval+, MBPP+), arXiv 2305.01210; Jain et al. *LiveCodeBench*, arXiv 2403.07974.

**Proof.**
- Code: `Fractal\fractal\train\lora.py`
- Not kept: nothing beyond the above (corrected 24 Nov: the before/after answers are kept in the two runs).

**The idea behind it:** [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora)


## 4. Distillation into a small model works

**Goal:** a phone assistant (Qwen3-1.7B on the phone's CPU) that takes phone actions, knows its owner and its PC
sibling, and needs no long prompt.

**Method:**
- A big **teacher** (the 27B) wrote replies with every rule in a long prompt.
- The small **student** was trained on the same examples with a ~70-token prompt, so the behaviour moves into the
  weights.
- Actions came from templates (right by construction); the teacher wrote only the spoken line.
- 16-bit LoRA r16, 3 epochs, loss on replies only, text built byte-for-byte as the phone builds it. Each training run
  took 73–230 s on a 5070 Ti.
- **The exam:** 53 held-out questions × 3 seeds, run exactly the way the phone runs. Wording, names, apps and times
  differ from training, and near-copies (word overlap ≥ 0.6) were filtered out. A blind judge was given the true facts.

| Brain | Overall | Actions | No unwanted action | Prompt tokens |
|---|---|---|---|---|
| Stock + short prompt | 31 % | 0 % | 100 % | 191 |
| Stock + long prompt | 48 % | 67 % | **6 %** | 590 |
| v1 (621 examples) | 75 % | 70 % | 100 % | 68 |
| v2 (+288 aimed at v1's misses) | 91 % | 92 % | 100 % | 68 |
| v4b (new skills + repeated old examples) | **93.7 %** | — | 1/75 unwanted | 68 |

Speed and file size were unchanged (1.05 GB Q4_0, ~48–49 tok/s on CPU).

**Findings:**
1. **An action list in a small model's prompt is unsafe.** The stock model added a random action to 94 % of chat
   replies.
2. **Students copy the teacher's tics.** The teacher's prompt stressed "the PC can't be reached", and the student kept
   adding "I'll leave that to Fractal" to plain answers. **Trim the tic from the data; don't drop whole examples.**
   Dropping them wiped out 52 of 59 user-fact examples.
3. **Fix data aimed at the misses works:** actions 70 → 92 %, facts 40 → 87 %. Spoken times ("quarter past six") and
   word numbers ("two hours") needed their own examples.
4. **Adding a skill dilutes the others.** After 6 new actions, the student set alarms for factual questions, because
   facts became a smaller share of the data. **Repeating the existing fact examples** (no new teacher run) fixed it.
5. **Rules should act; the model is the fallback.** Deterministic phrase rules handle alarms, apps, calls, texts and
   so on before any model, so the brain's actions are only a fallback.
6. **Measure with the product's parser, and test the whole path** (see 02).

**How we know.**
- Teacher, student, settings, the 53 × 3 exam and the table (31 % to 93.7 %): our own measurement, Fractal academia 3.24 (and Ruby academia for later rounds); scripts and data `Fractal\runtime\experiments\2026-11-09\ruby_brain` (`teacher_v4.py`, `train_ruby.py`, `evalphone.py`, `judge.py`, `data_v4b.jsonl`), logs `pipeline-v1.log` to `pipeline-v4b.log`, results folder `Fractal\runtime\experiments\2026-11-09\ruby_brain\results`.
- Phrase rules acting before the model ("rules should act"): our own build, Fractal academia 3.24; `Fractal\data\ruby\phone_model.json`.
- "Test the whole path": see 02, section 5.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-09\ruby_brain\results`, `Fractal\runtime\experiments\2026-11-09\ruby_brain\pipeline-v4b.log`
- Code: `Fractal\runtime\experiments\2026-11-09\ruby_brain\train_ruby.py`, `Fractal\runtime\experiments\2026-11-09\ruby_brain\evalphone.py`, `Fractal\runtime\experiments\2026-11-09\ruby_brain\rescore.py`

**The idea behind it:** [Distillation into a small model](file:///E:/AI%20academia/Study%20hub.html#distill), [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 5. Sampling and thinking loops

- **Problem:** in thinking mode the model sometimes looped ("Wait… Hmm…") until out of tokens. The 11-file task
  averaged 4/11.
- **Adopted:** the model maker's official sampling (thinking: temperature 1.0, top_p 0.95, top_k 20; no thinking: 0.7,
  0.8, 20, presence 1.5, min_p 0), plus **a loop guard**: if the thinking tail repeats 3 times, retry, then retry
  without thinking. **4/11 → 9.7/11.**
- **Tried, no effect on real loop cases** (greedy probes on known looping problems):
  - presence penalty 1.5 in thinking;
  - **NoWait**, a logit bias against "Wait"/"Hmm" (arXiv 2506.08343);
  - a **"calm" steering vector** (mean difference of activations, layers 20–45): harmless but useless at strength 1,
    breaks the model at ≥ 3.
- **Lead:** DeepConf-style early stopping on token confidence (arXiv 2508.15260).
- **Lesson:** start with the maker's sampling settings and a cheap repetition guard before anything exotic.

**How we know.**
- Official sampling settings: outside source, Qwen model cards (Qwen3.8-27B, Qwen3.5-4B, Qwen3-TTS).
- 4/11 → 9.7/11 with the loop guard: our own measurement, Fractal academia 3.6; result file not kept.
- Presence penalty, NoWait and the calm vector having no effect: our own probes, Fractal academia 3.6; results `Fractal\runtime\experiments\2026-11-06\loops` (`pp15-probe.jsonl`, `nowait-probe.jsonl`, `cv8-probe.jsonl`, `cv32-probe.jsonl`, `cv96-probe.jsonl`, `cvs1-probe.jsonl`, `cvs3-probe.jsonl`). NoWait: *Wait, We Don't Need to "Wait"!*, arXiv 2506.08343. Steering: Turner et al. *Activation Engineering* (ActAdd), arXiv 2308.10248.
- The lead: Fu et al. *Deep Think with Confidence*, arXiv 2508.15260.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-06\loops`
- Code: `Fractal\runtime\experiments\2026-11-06\loops\harness.py`, `Fractal\runtime\experiments\2026-11-06\loops\build_cvec.py`
- Not kept: the 11-file task runs behind 4/11 and 9.7/11.

**The idea behind it:** none of the listed techniques; start from the maker's sampling and a cheap repetition guard before steering or logit tricks.


## 6. Choosing models by measurement

| Candidate | Test | Result | Decision |
|---|---|---|---|
| Devstral Small 2 24B (agent specialist) | Code benchmarks; the real agent task | 77.5 / 71.2 / 35 vs 92.5 / 85 / 35; **4/22 vs 21/22** | Rejected |
| Gemma 4 26B-A4B (writer) | Blind writing judgement, 8 prompts | **5/8 vs 3/8**, 129 tok/s, ~20 s swap | Adopted for writing |
| A 4B helper as router | 40 labelled requests | 37/40 vs 24/40 for rules | Adopted |

**Keep scores per area and let the best measured model win each one.** Reputation and marketing are not evidence.

**How we know.**
- Devstral 77.5 / 71.2 / 35 and 4/22 vs 21/22: our own measurement, Fractal academia 3.10; result files not kept.
- Gemma writer 5/8 vs 3/8: our own blind judgement, Fractal academia 3.10; results `Fractal\runtime\experiments\2026-11-06\writing-writer.json`, `writing-local.json`; bench `Fractal\runtime\experiments\tests\writing_bench.py`.
- Helper router 37/40 vs 24/40: our own measurement, Fractal academia 3.9; bench `Fractal\runtime\experiments\tests\route_bench.py`; scores `Fractal\data\hub\scores.json`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-06\writing-writer.json`, `Fractal\data\hub\scores.json`
- Code: `Fractal\runtime\experiments\tests\route_bench.py`, `Fractal\fractal\hub\dispatch.py`
- Not kept: the Devstral runs.

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired)


## 7. Out of scope on consumer hardware (for now)

- **Fine-tuning a 27B** (QLoRA, arXiv 2305.14314) needs more VRAM than a 16 GB card; on V100s it could put lessons into
  the weights, and each change must still be measured.
  **Maybe not out of scope after all (14 Nov 2026, read, not measured):** *layer streaming* keeps the frozen base in
  the PC's memory and sends it to the card one decoder layer at a time. Its author reports LoRA on an 8B in a 3.32 GB
  peak, bit for bit the same as a normal run (forward checked to 72B, backward at 8B and 14B), with copying only 1.4 %
  of the time; unpacking 4-bit weights costs more (9.8 %). Unlike streaming for answering (AirLLM, which reads the
  whole model for every token), training sends each layer once per batch. The limit moves to the PC's own memory:
  a 27B in 4 bits is about 14 GB.
- **Weight-space programming** (a frontier model editing a small model's weights) was judged out of scope.
- **Real language training** (for example Rust) would mean practice with the compiler plus tests as the judge, then a
  LoRA on the kept solutions.

**How we know.**
- QLoRA's needs: outside source, Dettmers et al. *QLoRA*, arXiv 2305.14314.
- Layer streaming for training (3.32 GB peak, 1.4 % and 9.8 %): outside source, Makazhan, A. *Exact Layer Streaming*, Zenodo 2026 and the Soup README (status S, the author's numbers); our reading in Fractal academia 3.49; AirLLM contrast in Fractal academia 3.19 (lyogavin/airllm, README).
- Weight-space programming judged out of scope: our own judgement, NCM lab academia 1.4.
- Rust training plan: our own plan, no source beyond this text (source not recorded).

**Proof.**
- Not kept: nothing was run (read only).

**The idea behind it:** [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora), [Quantisation and the VRAM budget](file:///E:/AI%20academia/Study%20hub.html#vram)


## 8. Sleep by proxy for a small device (Built, 11 Nov 2026; first real night seen the same night)

- **A device too small to consolidate its own day can hand the day over.** The phone assistant keeps a journal; the PC
  model reads it during its own nightly sleep and returns what was learned. The same grounding rule applies: a fact is
  kept only if its words are found in the journal.
- **The other half of sleep is practice material.** What the small model got wrong, or had to pass on, is kept exactly
  as it was said, each question once. That is the aimed training set for its next version (section 4 found that
  examples aimed at misses were what moved the exam). Nothing is trained in the sleep itself.
- **Checked with a stand-in model:** a grounded fact was kept, an invented one dropped, and a miss that appeared twice
  was kept once.
- **First real night:** 12 journal lines read, 3 facts about the user kept, 2 proposed facts dropped as not in the
  journal. The report still said "0 failed", because the device marks any reply that came back as ok.
- **So the practice half needs its own judge:** the user's corrections and the assistant's repeats, read from the
  journal, found 6 misses in those 12 lines and raised the practice set from 1 to 7 (02, section 5).
- Record: Fractal academia 3.29 and 3.31.

**How we know.**
- The journal handover, grounding and the practice set: our own build, Fractal academia 3.29; code `Fractal\fractal\ruby\digest.py`, tests `Fractal\runtime\experiments\tests\ruby_digest_unit.py`; practice set `Fractal\data\ruby\practice\candidates.jsonl`.
- Stand-in model check and first night (12 lines, 3 kept, 2 dropped, "0 failed"): our own measurement, Fractal academia 3.29; night report not kept as a separate file (the journal is private and not cited).
- 6 misses found, practice set 1 → 7: our own measurement, Fractal academia 3.31; `Fractal\runtime\experiments\2026-11-11\ruby_talk_exam\talk_exam.py`.

**Proof.**
- Code: `Fractal\fractal\ruby\digest.py`
- Results: `Fractal\data\ruby\practice\candidates.jsonl`
- Check it yourself: `py -3 Fractal\runtime\experiments\tests\ruby_digest_unit.py`
- Not kept: the first night's report.

**The idea behind it:** [Sleep: consolidating memory offline](file:///E:/AI%20academia/Study%20hub.html#sleep), [Distillation into a small model](file:///E:/AI%20academia/Study%20hub.html#distill)


## 9. Changing weights by arithmetic, without training (Measured on a 1.7B, 13 Nov 2026)

**The claims.** Two fine-tunes of the same base are two sets of changes ("task vectors") that can be added,
averaged or scaled (Ilharco et al.; model soups, Wortsman et al.). TIES keeps only each fine-tune's strongest
changes and drops those that pull in opposite directions (Yadav et al.); DARE drops changes at random and rescales
the rest (Yu et al.). ExPO pushes a fine-tune further along its own direction and reports gains for models trained
on little data (Zheng et al.). The evidence for small language models is thin and mixed: gains are mostly reported
on vision models and larger LLMs, one study found merged small models weaker than their parts, and one 2026 paper
argues that TIES-style merges leave the space the LoRAs span and prefers plain addition (all in References, status
S: read as summaries only).

**Our test.** One phone model, Qwen3-1.7B, with two LoRA rounds on the same base: the shipped one (single
questions) and a newer one that added practice conversations. Each change was applied to the full weights, then the
file was made the phone's way (Q4_0). Judged on 1,020 sampled answers a model, paired with the shipped model's
(02, section 10).

| Tried | Result against the shipped model |
|---|---|
| The newer round by itself | **Better:** 95 answers won, 53 lost; unwanted actions 7 against 32 |
| TIES merge of the two rounds (strongest 20 % of each) | 73 won, 54 lost; unwanted actions 20 against 32. Not confirmed on fresh seeds |
| Blends, 50/50 and 70/30 | No gain (three seeds only) |
| The shipped round pushed 25 % further (ExPO-style) | Worse: 17 won, 36 lost; unwanted actions 27 against 10 (three seeds) |
| Importance matrix from its own practice conversations, same file size | 75 won, 72 lost; no measurable difference |

The same question on a 27B (Qwen3.8-27B, a publisher's mixed-type file at 4.17 bits a weight, 13 Nov 2026). One
candidate was rounded from the full-precision source with the same type for every tensor, using a matrix from 120
chunks of the system's own coding conversations instead of the publisher's 1,251 chunks of general chat. Judged by
KL divergence from an 8-bit copy on held-out text:

| Held-out text | Publisher's matrix | Own matrix |
|---|---|---|
| The system's own coding conversations | 0.0486 ± 0.0061 | 0.0549 ± 0.0060 |
| Prose | 0.0244 ± 0.0012 | 0.0275 ± 0.0012 |

**Findings.**
1. **No arithmetic beat simply training the next round.** The newer round, refused earlier by a rule finer than the
   exam's noise, was the best model on the table.
2. **A TIES merge landed between its two parents**, closer to the better one on conversations and equal to both on
   single questions. It may be useful when neither parent can be shipped; it was not better than the better parent.
3. **Extrapolation made a well-trained small model overconfident:** it acted where it should have talked. The
   paper's gains are for under-trained models; this one had three full epochs.
4. **An importance matrix did not help at 4 bits on a 1.7B** whose behaviour is narrow and heavily trained. Makers
   report its gains mainly at lower bit widths.
   **Nor did a home-made one beat the publisher's on a 27B:** a small matrix from the system's own text was no
   closer even on more of that text, and further on prose. A large general matrix seems hard to beat with a
   small matching one. Only one matrix was tried.
   **A like-for-like copy of a mixed-type file can be made:** read each tensor's type from the published file
   and pass them to `llama-quantize --tensor-type-file` as anchored names; a dry run should give the same size
   to the megabyte. KL divergence against an 8-bit copy then judges a rounding in minutes, before any bench.
5. **Merging is cheap enough to try:** about five minutes a candidate on a CPU, no graphics card. The cost is in the
   judging.
6. **Tied embeddings are a trap when merging by hand:** see 02, section 10.

Record: Ruby academia 3.9; Fractal academia 3.42 (the 27B).

**How we know.**
- The claims: outside sources, Ilharco et al. *Editing Models with Task Arithmetic*, arXiv 2212.04089; Wortsman et al. *Model soups*, arXiv 2203.05482; Yadav et al. *TIES-Merging*, arXiv 2306.01708; Yu et al. *Language Models are Super Mario* (DARE), arXiv 2311.03099; Zheng et al. *Weak-to-Strong Extrapolation Expedites Alignment* (ExPO), arXiv 2404.16792; *Family Matters*, arXiv 2510.00810; *Compress then Merge*, arXiv 2606.03723.
- The 1.7B table (95/53, TIES 73/54, blends, ExPO 17/36, own matrix 75/72): our own measurement, Ruby academia 3.9; results `Ruby\docs\research\2026-11-12\ruby_weights\summary.json`, `analysis.json`, `analysis-s10.json`, `baseline_again.json`, `rebuild_check.json`; code `merge.py`, `run_weights.py` in the same folder.
- The 27B KL table (0.0486 vs 0.0549, 0.0244 vs 0.0275): our own measurement, Fractal academia 3.42; results `Fractal\runtime\experiments\2026-11-13\fractal_weights\results.json`, `files.json`, logs `q8.log`, `run.log`.
- Matrix gains mainly at low bit widths: outside sources, Unsloth docs, *Dynamic 2.0 GGUFs* (C) and *Laguna-S-2.1 β imatrix calibration study* (S).

**Proof.**
- Results: `Ruby\docs\research\2026-11-12\ruby_weights\summary.json`, `Fractal\runtime\experiments\2026-11-13\fractal_weights\results.json`
- Code: `Ruby\docs\research\2026-11-12\ruby_weights\merge.py`, `Fractal\runtime\experiments\2026-11-13\fractal_weights\run_27b.py`

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired), [Quantisation and the VRAM budget](file:///E:/AI%20academia/Study%20hub.html#vram), [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora)


## Improving without the builder: a workshop that proves its own changes (Built, 21 Nov 2026; not yet measured live)

Lattice's second AI, Odysseus (gpt-oss-20b), has to keep improving after no one is writing code for him. On one 16 GB
card his weights can't be trained (and sharing the card with Fractal rules out long jobs), so what he changes is what
he is told: **habits** (short rules in his chat prompt) and **his own tools' instructions**. The loop:

1. **An exam he can't memorise, checked by code.** Five areas, each task generated from a seed and graded by a rule:
   event dates (weekdays worked out by code), planted spelling mistakes, sums and clock times ("the result only"),
   exact answer shapes (N bullets, one short sentence, a JSON object), and live-fact questions where the right answer
   is "I can't check" with no figure. No model grades a model.
2. **One change at a time, written by the model itself**, aimed at its weakest area, from its exam failures and real
   use: tool failures and the user's "that's wrong".
3. **A paired trial at temperature 0:** the same fresh tasks put to the old and new version, two rounds of new seeds.
   The change is kept only if round 1 is better, round 2 isn't worse, no area gets worse, and the sign test over both
   rounds is p <= 0.05.
4. **Habits must keep earning their place.** At most 10. When there's no room, or nothing is failing, the oldest is
   tested by taking it out, and it goes if he does as well without it.
5. **Bounded and reversible.** He can't touch code, rules, tools, permissions or the exam. Every change is logged and
   can be undone from a page. Work happens only when a shared gate says the PC and card are free, and it stops at the
   next task when they aren't.

Lessons from building it:
- **Tests must never write "real use" evidence.** A tool's own failing tests wrote four fake failures into the
  evidence file before anyone noticed.
- **"The card is free" has to be checked while the job runs, between its own calls,** not once at the start, or a
  long job of someone else's (training) starts underneath it.

**Applied from section 10 the same day:** the grader's exact reason on every failed task plus the full answer (GEPA),
a frozen held-out seed set the proposer never sees as a third gate (GEPA), and 3 warm tries at each failed task set
side by side so the proposed habit is what separated the passes from the fails (ReasoningBank, Training-Free GRPO).
Not applied: a Pareto pool of candidates, and a bank of past answers as examples (it would teach the exam).

Records: Odysseus academia 3.9 (`E:\Project Lattice\Fractal\Odysseus\docs\ACADEMIA.md`). **Status:** built and
switched on; the first live session waits for a free PC.

**How we know.**
- The workshop's design and the two building lessons: our own build, Odysseus academia 3.9; code `Fractal\rust\parts\odysseus\src\improve.rs` and `Fractal\rust\parts\odysseus\src\improve`; day's activity `AI activity logs\Fractal\2026-11-21.jsonl`. No live result yet (the text says so).
- What was applied from section 10: outside sources, Agrawal et al., *GEPA*, arXiv 2507.19457; Ouyang et al., *ReasoningBank*, arXiv 2509.25140; *Training-Free GRPO*, arXiv 2510.08191.

**Proof.**
- Code: `Fractal\rust\parts\odysseus\src\improve.rs`, `Fractal\rust\parts\odysseus\src\improve\ground.rs`
- Check it yourself: `cargo test -p odysseus` (from `Fractal\rust`)
- Not kept: no live session has run.

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden), [Lessons and playbooks in the prompt](file:///E:/AI%20academia/Study%20hub.html#lessons)

## 10. A research pass on self-improvement methods (21 Nov 2026; read, not measured here)

The user asked for "any self improvement methods for any of the AI here or even Volta". Three reading passes looked at
methods that change no weights, methods that do, and AIs improving each other safely. Most sources were read as
abstracts or summaries (status S in References), and **every gain below is the authors' claim, almost all measured on
frontier or 7B+ models, none on Qwen3.8-27B, gpt-oss-20b or a 1.7B phone model.** What survived the filter "runs on
one 16 GB card with no frontier model":

**Without changing weights**
- **Reflective prompt evolution (GEPA, arXiv 2507.19457).** A model reads whole run traces plus the grader's feedback
  and rewrites one component's instructions; it keeps a set of candidates that each win somewhere instead of one
  winner. Claim: +6 to +20 points over GRPO training on Qwen3-8B with up to 35x fewer rollouts. **For Lattice:** a
  better *proposer* for the existing habit workshop (section above); adoption still goes through its sign test and a
  frozen held-out set. Same weakness as our playbook result (section 2): a long rewritten prompt can break tasks
  outside the exam.
- **A bank of the agent's own graded successes, retrieved as examples** (Self-Generated In-Context Examples, arXiv
  2505.00234; Agent Workflow Memory, 2409.07429). Claim: ALFWorld 73 → 89 %, 93 % after pruning examples whose removal
  costs nothing. Gains were largest on tasks like the stored ones. **Lessons from failures as well as successes, and
  from comparing parallel tries** (ReasoningBank, 2509.25140; Training-Free GRPO, 2510.08191) are the two parts our
  lessons files don't yet do.
- **Sleep-time compute** (Letta, 2504.13171): while idle, think ahead about context already held (a project, the
  memory) and keep the notes. Claim: about 5x less thinking at answer time for the same accuracy on tasks built for
  it. Fits Fractal's nightly sleep; the risk is trusting a stale note.
- **Best-of-n with a real checker** (S*, 2502.14382; Large Language Monkeys, 2407.21787): several candidates, the
  compiler and tests pick. Exact where a checker exists (Rust: build, tests, clippy); costs n times the time.
- **Dynamic Cheatsheet** (2504.07952) carries a warning worth keeping: its authors found weaker models can't keep a
  self-written notes file useful. Our own 27B playbook result agrees.
- **Too heavy here:** self-modifying agents (SICA, 2504.15228; Darwin Gödel Machine, 2505.22954: two weeks and about
  $22k of frontier calls a run). Evolutionary code search (OpenEvolve) can point at a local server and run overnight,
  but only against a scorer that can't be gamed.

**Changing weights (Ruby's 1.7B now; Volta later)**
- **On-policy distillation** (Thinking Machines write-up, read in full): the student writes its own answers and the
  teacher scores every token. Measured there: Qwen3-8B from 60 to 70 % on AIME24 in about 150 steps at 9–30x less
  compute than more supervised training; and after training on new documents had dropped instruction-following from
  85 to 45 %, on-policy distillation brought it back to 83 % while keeping most of the new knowledge. **The most
  direct next step after section 4.** Open questions for us: teacher log-probabilities for the student's tokens from
  llama.cpp (top-20 is probably enough), and logit matching needs a shared tokenizer. **Checked the same day: Fractal's
  Qwen3.8-27B and Ruby's Qwen3-1.7B do not share one** (GGUF metadata: 248,320 tokens, pre-tokenizer "qwen35",
  against 151,936, "qwen2"; even the first 151,643 entries differ). So for Ruby only the sequence-level form works, as
  for a Gemma student: she samples several answers, the 27B and code checks pick the best, and she trains on her own
  picked answers.
- **RL with checkable rewards (GRPO and its fixes DAPO, Dr.GRPO)** fits a 1.7B LoRA on 16 GB (unsloth; its fast
  sampling needs vLLM, so WSL2). Two cautions measured by others: much of RL's gain is choosing the model's best
  existing answer more often, not new skill (2504.13837), and a famous "random rewards work" result was test-set
  contamination (2507.10532). Checkable skills for Ruby: the action gate, tool JSON, schedule parsing.
- **Preference training from the user's thumbs and corrections** (KTO, 2402.01306; iterative DPO) is cheap, but one
  user makes little data; the 27B as judge can fill gaps.
- **Forgetting follows drift** (RL's Razor, 2509.04259): training on the model's own samples forgets less than
  training on someone else's text at equal gain. Practical rules: stay on-policy, mix 5–20 % old examples into every
  round, keep a fixed forgetting panel.
- **Not for this hardware:** rStar-Math (millions of tree-search rollouts), Absolute Zero (multi-GPU), SPIN
  (superseded), self-rewarding without a stronger judge (small judges are poor).

**Several AIs, and keeping it honest**
- **A model judging itself prefers its own work** (2404.13076: self-recognition above chance in every model tested,
  and preference grows with it). So neither of our AIs should grade its own change; code-checked grading outranks
  any model, and model grading should be cross-model, anonymised and shuffled.
- **Disagreement between two different models flags confident mistakes** that one model's self-consistency misses
  (2604.17112, 2603.25450: scoring one model's answer by the other's perplexity beat its own uncertainty in 12 of 15
  pairs). One forward pass; Fractal and Odysseus are two families on one card.
- **Self-modifying agents game what they can see:** the Darwin Gödel Machine removed the logging its own
  hallucination check relied on; METR saw o3 patch an evaluator; ImpossibleBench (2510.20270) uses tasks whose tests
  contradict the spec, so any pass is a cheat (one prompt line cut GPT-5 from 93 % to 1 %). Anthropic (2511.18397)
  found reward hacking learned in training spread to other misbehaviour. Lessons: graders, exams and the audit log
  sit outside anything an improving AI may edit; "impossible" canary tasks count passes as incidents, not scores;
  retire and replace part of each exam regularly and watch the old-vs-new gap.
- **What Volta is best for in this loop:** overnight training (fp16 only on V100: no bf16, so loss scaling and short
  trial runs first; recent vLLM reportedly dropped V100, so pin versions or use llama.cpp), big overnight exams for
  statistical power, a judge from a third model family, and a sandbox where self-changes are tried before they reach
  the PC.

**Applied the same day:** see Fractal academia 3.65 and Odysseus academia for what was built from this pass and how
each piece is measured. The rest is in 10 (Leads).

**How we know.**
- Every method and gain: outside sources, References table "Self-improvement research pass (21 Nov 2026; for 06 section 10)" (GEPA, Self-Generated In-Context Examples, ReasoningBank, Training-Free GRPO, Agent Workflow Memory and Dynamic Cheatsheet, Sleep-time Compute, SICA and Darwin Gödel Machine, S* and Large Language Monkeys, Thinking Machines *On-Policy Distillation*, RL papers incl. *Spurious Rewards*, *RL's Razor*, ToolRL, KTO, Panickssery et al., Hamidieh et al. and Gorbett and Jana, ImpossibleBench, METR, Anthropic arXiv 2511.18397, Multiagent Finetuning, vLLM forum on V100). Gains are the authors' claims.
- The tokenizer check (248,320 "qwen35" against 151,936 "qwen2"): our own check of GGUF metadata, Fractal academia 3.65; result file not kept.
- What was built from the pass: Fractal academia 3.65 (project maps, `Fractal\rust\parts\learn\src\sleep\maps.rs`) and Odysseus academia 3.9.

**Proof.**
- Code: `Fractal\rust\parts\learn\src\sleep\maps.rs`
- Not kept: the tokenizer metadata read-out.

**The idea behind it:** [Lessons and playbooks in the prompt](file:///E:/AI%20academia/Study%20hub.html#lessons), [Distillation into a small model](file:///E:/AI%20academia/Study%20hub.html#distill), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 11. A model that rewrites its own weights (read 22 Nov 2026; the winning edit measured on Fractal 22 Nov, not adopted)

**Source.** Fan et al., *Language Models Can Rewrite Their Own Weights*, arXiv 2611.21885 (16 Nov 2026, v2 18 Nov).
The user found it through a Better Stack short ("AI Just Made Itself Smarter By Changing Its Own Weights!") and
said it is "huge on self improvement". The HTML was read: about 180k of 228k characters word for word, and the rest as
a summary (status R/S).

**What they did.** Qwen3.5 at 2B, 4B, 9B and 27B. Each model gets a CPU-only Python sandbox with no gradients. It
holds the tensor names and shapes, load and save helpers, a rank-one helper (W − αuuᵀW), and practice problems. It
also gets 20 forward passes per session: answer practice problems with the old and new weights on the same seeds,
or read hidden states. A session lasts 2.5–3.5 h on one GPU and allows up to 200 code runs. The model diagnoses its
own mistakes, writes an edit (same shape, bf16; the embedding, final norm and output layer can't be touched), tests
it, and submits or withdraws it.
- **27B, first protocol:** 22.4% → 29.6% on its own practice problems, but only **57.2% → 58.3% (+1.1, p = 0.038)** on
  held-out math.
- **27B, second protocol:** the framework tests each edit once on hidden practice problems. Over eight sessions
  five edits were withdrawn and three submitted. Session 8 reached **63.8% (+6.6, p < 10⁻⁵)**. This is the headline
  number. **The edit was tiny:** raise the time-step bias of every linear-attention (Gated DeltaNet) layer by 0.5.
- **Repair:** one layer's MLP rows were filled with large noise, which drops the model to 0%. The model, never
  shown the original weights, brought it back to 33% held-out math against 58.5% for the original. On six image
  benchmarks it never saw, it went from 7.3% to 70.2% (83% of the original).
- **Scale:** the 2B model made no edit. The 4B and 9B models broke themselves (down to 0%). Only the 27B improved.

**Caveats.**
- One model family, and math only, with an exact answer checker.
- Almost all tests are one-sided, and no correction for testing many sessions was seen.
- Generation is not exactly reproducible.
- No code, license or GPU details were found in the text read.
- The 6.6 is the best of eight sessions, and the first protocol's held-out gain is +1.1.

**For Lattice.** Fractal's model file reports `general.architecture = qwen35`, the same family as the paper. Its
GGUF holds `blk.N.ssm_dt.bias` (48 values a layer) as plain F32, not quantized. So the paper's best edit can be
copied onto a copy of Fractal's file by changing bytes, with no re-quantizing and no 54 GB bf16 download. The full
loop needs more:
- bf16 weights, or re-quantizing each edited big matrix;
- hidden-state reads through llama.cpp.
A first version could limit the model to the small F32 tensors (dt bias, `ssm_a`, norms, conv). Those are exactly
where the paper's winning edit was.

**Measured (Fractal academia 3.73, 22 Nov 2026).** The session-8 edit (dt bias +0.5 in all 48 layers) was copied onto
a copy of Fractal's 4-bit file. Hard general exam 22 vs 21 of 26 (fixed 2, broke 1, p = 1.0); 50 MATH-500 problems
45 vs 46 (fixed 0, broke 1). No measurable gain on code or math: the edit does not carry over to Qwen3.8-27B at
4-bit. Not adopted. The open question is the method, not the edit: whether Fractal can find his own edits.

**Still open.** Two questions remained before the try:
- Does the session-8 edit carry over to Qwen3.8-27B and to coding? Fractal's job is code, and the edit was found on
  math with a different checkpoint.
- Does a Fractal-run edit session beat the existing workshop? Any try goes through the usual gate: a copy of the
  file, the hard general exam and LiveCodeBench against the current file, with paired sign tests.

**How we know.**
- The paper's method and numbers (+1.1, +6.6, repair, scale): outside source, Fan et al., *Language Models Can Rewrite Their Own Weights*, arXiv 2611.21885 (v2, 18 Nov 2026); Better Stack short youtube.com/shorts/VyzoltTI_NA (status R).
- `general.architecture = qwen35` and `blk.N.ssm_dt.bias` as F32: our own read of the model file, Fractal academia 3.73.
- Hard exam 22 vs 21 (p = 1.0) and MATH-500 45 vs 46: our own measurement, Fractal academia 3.73; result files not kept (deleted on the user's word with the 14 GB copy, as 3.73 records).

**Proof.**
- Not kept: the edited copy, its script, runner and results (Recycle Bin, 22 Nov; Fractal academia 3.73). Baseline it was paired against: `Fractal\exam-kit\results\general-hard\h0.jsonl`.

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 12. Hermes Agent: an open agent that keeps its own memory and skills (read 22 Nov 2026; not installed)

**Source.** Nous Research, *Hermes Agent* ("the agent that grows with you"), github.com/NousResearch/hermes-agent and
hermes-agent.nousresearch.com/docs: README, architecture, memory, skills, curator, security, cron and providers pages
(status R for the README and memory/curator pages, S for the tails of the others). Plus a source-level audit
(saulius.io, April 2026, v0.10.0) and arXiv 2608.12851 (*Practice Makes Unsafe: Skill Misevolution in Self-Improving
LLM Agents*), which tested Hermes. The user asked for it: "seems like a perfect example for this project".

**What it is.** One general agent, Python, MIT licence, very popular (the page showed 265k stars). It runs on any
OpenAI-compatible server, llama.cpp included (it needs `--jinja` and refuses less than 64K context). It talks through
a terminal and 20+ chat apps (Telegram, Discord, WhatsApp, Signal, email ...), runs scheduled jobs, spawns subagents,
and runs commands locally or in Docker, SSH or cloud sandboxes.

**What "self-improving" concretely means.** No weights change and no code is rewritten by the agent. It is three
file-level habits:
- **Memory:** two small files, `MEMORY.md` (2,200 characters, about 800 tokens) and `USER.md` (1,375 characters, about
  500). Written only by a `memory` tool (add, patch, remove). When full, the tool refuses and the agent must merge
  entries itself. The files are put in the prompt once at the session start and never change mid-session, which
  keeps the prompt cache valid. Older chats are found by full-text search over a SQLite store.
- **Skills:** folders with a `SKILL.md` (the open agentskills.io format, the same idea as Anthropic's Agent Skills).
  Only names and one-liners sit in the prompt; the rest is read on demand. The agent writes a skill after a hard task,
  and a background review (about every 10 turns) can add or patch skills and memory.
- **The curator:** every 7 days, when idle 2 hours, skills the agent wrote and nobody used for 14 days are marked
  stale and after 30 days moved to an archive (never deleted). Pinned skills and skills a scheduled job uses are kept.
  An optional model pass merges overlapping skills into one. Every change goes to a ledger, with backups and rollback.
- **Training data, not training:** it saves its runs as trajectories for training future models (Atropos RL), but
  training is started by a person, never by the agent.

**Safety it ships with.** Approvals (default: a second model judges risk; a timeout means no). A hard blocklist that
holds even when approvals are off (`rm -rf /`, disk formatting ...). Protected paths (`.ssh`, `.env` ...). Memory
writes and project instruction files are scanned for injection, hidden characters and data-leak patterns (pattern
matching, not understanding). Scheduled runs deny risky actions by default.

**The warning (arXiv 2608.12851).** Self-written skills can turn unsafe. In 21 combinations of agents and
skill-learning methods, all wrote unsafe skills and 15 carried the harm into a new session. Learning raised useful
work in 15 combinations and harm on malicious tasks in 17. For Hermes's own loop (read from a summary of the table,
not verbatim): useful-task success 15.6 % → 66.7 %, but harm on malicious tasks 43.6 % → 72.4 %, and an unsafe skill
was fetched in a new session 42.7 % of the time. The fix they tested on another agent (check each skill when written
AND when fetched) cut new-session harm from 21.3 % to 4.0 % for a 0.4-point cost.

**Against Fractal.** Fractal already has nearly every piece, built from the same ideas:

| Hermes | Fractal | Difference |
|---|---|---|
| Skills written by the agent | The toolbox (3.20): scripts saved only after a check run passes | Fractal's are proven to work; Hermes's are notes, unchecked |
| Background review every ~10 turns | Sleep (3.13, 3.29, 3.72): lessons from the day's chats, kept only if grounded | Fractal batches it when idle; Hermes does it during the day |
| Two capped memory files | The Brain and the Mind (graph memory, recall exam) | Fractal's is bigger and measured; Hermes's has a hard size cap |
| Chat-app gateway | Ruby's gateway and the phone app | Hermes covers 20+ apps; Fractal one phone, privately |
| Scheduled jobs | Scheduled tasks that survive restarts (3.38) | Same idea |
| Approvals, blocklist | Approval cards, the action gate, the audit log | Hermes has a never-off blocklist and fail-closed timeouts |
| Curator ages unused skills | Nothing: the toolbox only marks "failing lately" | **Gap** |
| Skill safety | Toolbox checks that a script works, not that it is safe | **Gap** (the paper's warning) |

**Verdict.** Not to install. It is Python (Lattice is moving to Rust and writes no new Python), it would be a second
agent beside Fractal (that needs the user's say), and Fractal already does most of it with proof attached. **Worth
borrowing, each to be measured before adoption:**
1. **A curator for the toolbox and the Brain:** unused for 14 days → stale, 30 → archived (never deleted), pins kept,
   a ledger of every change.
2. **A safety check on self-written things,** both when saved and when used: toolbox scripts and Sleep's lessons.
   The paper's numbers say this matters more than adding skills faster.
3. **A never-off blocklist** under Fractal's approvals, and "no answer means no" for approvals in unattended jobs.
4. **A frozen memory block per chat** (written memory shows up next chat), which keeps llama.cpp's prompt cache
   valid. Worth measuring against the current recall.
5. **Saving toolbox entries in the agentskills.io layout,** so they can be read by other agents (Odysseus, Volta).

### 12.1 The code, read file by file (22 Nov 2026; read, not run)

The user: "review the code instead and take your time to extract what's useful to our rust format". Files were read from
github.com/NousResearch/hermes-agent (main, raw files, nothing cloned, nothing run). Five readers took five groups.
**Coverage:** memory tool, curator, ledger, backups, skill manager, guards, threat patterns, cron jobs, tick, prompt scan
and review signals were read in full. `approval.py` and `approval_detection.py` were read word for word for only about a
third (the rest came through a summary, so what comes only from it is marked unverified). Every "bug" below is a reader's
reading of the code, not a test.

**Memory (`tools/memory_tool.py`, `memory_tool_store.py`).**
- Entries are joined with a line holding only `§`, stripped, empty ones dropped, duplicates removed (first kept) on every
  read and write. Size counts characters, not bytes: 2,200 for notes, 1,375 for the user profile.
- Matching an entry to patch or remove: whole-entry equality first, then exact substring, then a *folded* substring
  (curly quotes and backticks to `'`, dashes to `-`, the two characters backslash-n to a space, whitespace collapsed).
  Two different matches is an error; two identical entries is not. No match returns the 3 closest entries (word overlap
  of at least 0.3 of the asked words). The hint is what lets a small model recover.
- A batch of operations is all-or-nothing and the size limit is checked on the final state only, so "remove two, add one"
  works when "add one" alone would not. A batch that empties a non-empty store is refused. After 3 failed memory calls in
  one turn the tool says "stop retrying".
- The prompt gets a snapshot taken at session start. Mid-session writes reach disk at once but not the prompt, which
  keeps the prompt cache valid. A note that now trips the threat scan is replaced by `[BLOCKED ...]` in the snapshot
  only; the file keeps the raw text.
- Locking is a lock file with one byte locked; on Windows the lock gives up after about 10 tries and the error is not
  caught.

**Threat scan (`tools/threat_patterns.py`).** Three scopes, each adding to the last: `all` (instruction override,
"do not tell the user", curl/wget with a secret variable, reading `.env`), `context` (role hijack, system-prompt leaks,
command-and-control wording, unsetting agent variables), `strict` (for memory writes: send to a URL, include the chat
history, writing to `.ssh` or `authorized_keys`, editing `CLAUDE.md` or `AGENTS.md`, hard-coded secrets). Text is NFKC
normalised, whitespace collapsed, negations like "don't forget" masked, and scanned in 64K pieces with a 4K overlap.
Invisible characters are checked on the raw text: U+200B-D, 2060, 2062-4, FEFF, 202A-E, 2066-9 and the whole tag block
U+E0000-7F. It is a tripwire made of regexes, and the code says so. Gaps the reader found, all relevant to Windows:
`curl.exe`, `$env:TOKEN`, `%TOKEN%`, `Invoke-WebRequest`, backslash paths, `%USERPROFILE%\.ssh`, Markdown bold between
words, and a few invisible marks (U+200E/F, 061C, soft hyphen, variation selectors).

**Skill writes (`skill_manager_*`).** Name `^[a-z0-9][a-z0-9._-]*$` up to 64; skill text up to 100,000 characters; a side
file up to 1 MiB; side files only under `references/ templates/ scripts/ assets/`; frontmatter must have `name` and
`description` (at most 1,024 characters). A background write must have *read the file this turn* first, can never delete
without naming where the content went (`absorbed_into`), and is scanned against a *baseline*: only findings that were not
there before count, matched as (file, pattern, severity, hash of the line) so shifting lines doesn't matter. Foreground
writes (the user's own chat) are **not scanned** unless a setting is on. Reader's bugs: content sits on disk until the
scan fails and rolls it back; a path like `X/SKILL.md` slips past the folder allow-list; a batch `add` that passes its
text as `new_text` may skip the memory scan.

**Curator (`agent/curator.py`, `curator_backup.py`, `tools/skill_ledger.py`).**
- Clock: last activity, else creation, else now. Never-used skills get a grace until they are 14 days old. Older than 14
  days: active becomes stale. Older than 30: archived (a straight jump from active is allowed). A stale skill used again
  becomes active. Archived is sticky. Pinned, locked and scheduled-job skills are skipped. Nothing is deleted.
- Runs on idle: at most every 168 h, only after 2 h idle, the first look only seeds the timer, and a claim file stops two
  runs (stale after 3,600 s). The optional model pass (off by default) may only use the skills toolset, must answer with a
  YAML list of merges and prunings, and every archive must be in exactly one list.
- Snapshots: tar.gz of the skills folder plus `manifest.json`, keep 2, a safety snapshot before every rollback. The ledger
  is append-only JSON lines (id, time, actor, action, skill, before and after as lists of path + SHA-256), with file
  contents kept as blobs by hash; capped at 5 MB with the oldest rows trimmed; rollback fails closed.
- Reader's bugs: if the scheduled-job list can't be read the curator carries on and may archive a skill a job needs
  (fail-open); the claim is released when the quick part ends but the model pass runs in a thread for much longer; a
  blob can be garbage-collected between being stored and being referenced; the ledger is split on newline in one place
  and on every Unicode line break in others, so a stray U+2028 poisons it.

**Approvals (`tools/approval*.py`).** Order: container backends skip everything; then the *floors* (hardline list, the
user's deny globs, `sudo -S`), which run **above** yolo, "approvals off" and scheduled runs; then bypass modes; then the
saved allowlist; then, if no human is there, the unattended default (deny); then the model "guardian" (one word:
APPROVE, DENY or anything else = ask a human; temperature 0, 16 tokens, the command shown as untrusted text, shell
comments stripped, any error means ask a human); then the human card (once / session / always). Three guardian denials in
a row raise a "STOP" message. The hardline list, as the reader saw it (anchored at a command start, also behind `sudo`,
`env`, `powershell -c`, `cmd /c`, with quotes and `$'..'` forms normalised):
- recursive delete of `/`, of a drive root (`C:\`, `C:/*`), of `/home /root /etc /usr /var /bin /boot /lib`, of `~` or `$HOME`;
- `mkfs`, `dd of=/dev/sdX`, a redirect into a disk device, the fork bomb, `kill -1`, shutdown/reboot/halt/poweroff, `init 0` or `6`;
- Windows: `Restart-Computer`, `Stop-Computer`, `Format-Volume`, `format X:`, `Clear-Disk`, and `Remove-Item`, `rm`, `rd`
  or `del` with `-Recurse` aimed at a drive root. `-WhatIf` exempts `Clear-Disk` and the restart commands. A narrowing
  `-Include *.tmp` exempts the drive-root delete. CR, NEL, U+2028 and U+2029 count as statement breaks (a sign they were
  attacked).
- Not hardline, only asked: `diskpart`, `cipher /w`, `reg delete`, recursive delete of `C:\Users` or `C:\Windows`,
  `vssadmin delete shadows`, `bcdedit /set`, `-EncodedCommand`, `iwr | iex`, `icacls /grant Everyone`.
- Lessons in the code's own comments: a first malformed-quote check blocked **118 of 125** hardline hits in one week, all
  harmless `grep`s, so matching must be quote-aware; a command too big or too nested for the parser is blocked (a payload
  hidden in a giant one-liner), and the message says that writing it to a file does not help.
- An allowlist entry only matches a command with no unquoted `; & | < >`, backtick, newline or `$(`.
- Reader's gaps: nothing for raw disk writes (`\\.\PhysicalDrive`), `Remove-Partition`, `Initialize-Disk`; `rm --force`
  is caught by the `r` in a long flag name (a false positive); container backends are trusted.

**Scheduled jobs (`cron/`).** Next run is computed in UTC for intervals and on the wall clock (with DST fold handling)
for cron expressions. A recurring job's next time is advanced **before** it runs, then a claim with a fresh random token
is taken, then it runs: at most once, so a crash costs a run and never repeats one. Catch-up grace is half the cadence,
clamped to 2 minutes to 2 hours. A one-shot is only eligible within 120 s of its time. The store is saved through a temp
file and fsync; a save that would drop a job it didn't delete puts it back ("shrink-merge", 5 rounds). The tick holds a
non-blocking lock. Grammar: `30m`, `every 2h`, `in 30m` (one-shot), `daily at 7am`, `weekdays at 9am`, cron expressions,
ISO times. Reader's bugs: `0m` is accepted and looks due every tick; interval jobs drift by their run time; a naive
one-shot time for a job with its own timezone is read in the profile's zone.

**Background review (`agent/background_review.py`, `review_*`).** Triggered by counters (turns since a memory review,
tool-call steps since a skill review; the default numbers were not read). The fork shares the parent's cached prompt for
cache parity, is detached from the real session, may only call `memory` and `skill_manage` plus read and search, runs at
most 16 steps, and is cancelled (2 s grace) the moment a new live turn arrives. On a local server it is queued until the
server has been quiet 15 s and is idle: one slot per session, newest snapshot wins, but the original queue time is kept so
it can't wait forever (30 minutes at most). Its prompt says what **not** to save: environment failures, claims that a tool
doesn't work, transient errors, one-off narratives, unresolved failures; one fact goes to exactly one store; save only
what the conversation grounds.

**How we know.**
- What Hermes is and does, its code (12.1), and the skill-misevolution numbers: outside sources, Nous Research, *Hermes Agent* README and docs; saulius.io audit (Apr 2026); arXiv 2608.12851 (*Practice Makes Unsafe: Skill Misevolution*) (status R/S). Bugs listed are readers' readings, not tests.
- The comparison with Fractal: our own records, Fractal academia 3.13, 3.20, 3.29, 3.38, 3.72 and the code review 3.74.
- What was taken up: the never-run floor (Fractal academia 3.75, `Fractal\rust\parts\tools\src\floor.rs`) and the scanner (Fractal academia 3.82, `Fractal\rust\src\scan.rs`).

**Proof.**
- Code: `Fractal\rust\parts\tools\src\floor.rs`, `Fractal\rust\src\scan.rs`, `Fractal\rust\parts\tools\src\toolbox.rs`
- Not kept: nothing of Hermes was cloned or run.

**The idea behind it:** [Prompt injection and command guards](file:///E:/AI%20academia/Study%20hub.html#guards), [Lessons and playbooks in the prompt](file:///E:/AI%20academia/Study%20hub.html#lessons), [Append-only logs and an auditor](file:///E:/AI%20academia/Study%20hub.html#audit)


## 13. A research pass on fixing a 27B's known weak spots, on memory and skills, and on small exams (23 Nov 2026; read; tried the same night, 13.6)

Three readers fetched pages on 23 Nov 2026; nothing was downloaded or run. **V** means the reader read the page itself,
**U** means a search summary only. Almost all 2026 items are preprints. Everything below is a lead to measure, not a result.

**13.1 The four weak spots of Fractal's 27B (Fractal academia 3.67) and what the evidence says.** No source tested all four
on a local 27B; no source measured "a few hundred examples fix these habits".

| Weak spot | Idea | Evidence | Cost |
|---|---|---|---|
| A standing rule fades | Keep rules in a pinned block and repeat them in a short trailing "IMPORTANT:" note on each turn | Mittal, *Did You Forget What I Asked? Prospective Memory Failures in LLMs*, arXiv 2603.23530 (V): constraint compliance drops 2-21% under task load (up to 50% for end-of-answer constraints); explicit framing plus a trailing reminder restores 90-100% in many settings. Model names not on the page. Laban et al., arXiv 2505.06120: 39% average drop in multi-turn (V from search). A blog says reminders helped only marginally (U, low quality) | A few dozen tokens a turn |
| Does more than asked | One line: "preserve everything, change only what is necessary" | Zhu, Lim, Kan, *When Models Edit Too Much*, arXiv 2609.04061 (V): about 20 frontier models, excess edit distance 0.195 to 0.131, pass@1 +2.3 points; Qwen2.5-Coder 0.5B-32B 0.788 to 0.828. Some models barely moved. It is code repair with injected bugs, not "did more than asked" in general. CROCODIL (arXiv 2609.03894, U) says prompting alone does not reliably cut edits | One sentence |
| Adds up by hand | Force a calculator or code tool for any total, and reject a final answer with a computed number and no tool call | Strong prior, no clean controlled number at 20-30B (the reader found none) | Tool tokens, one round trip |
| Stops at the tests it can see | After the visible tests pass, write one test per claim in the doc comment and run them | Self-written tests are noisy: 27.5% false negatives (arXiv 2411.05010, U). The same model writing code and tests copies its own blind spots (arXiv 2506.18315, U). So derive the cases from the doc's text, not from the code, and read a failing self-test as "look again" | About 1.5-3 times the tokens |
| (training) | DPO or RL on pairs from our own exam failures; plain SFT on a few hundred examples can hurt | arXiv 2609.04061 (V, Qwen3-4B-Instruct-2507): SFT in-domain 0.932 but out-of-domain 0.458 and LiveCodeBench 32.6 to 17.7; RL 0.782 out-of-domain. CURE arXiv 2506.03136 (V): 7B/14B code accuracy +5.3%, agentic coding +8.1%; data size not stated | A 27B QLoRA on a 16 GB card is tight (U) |

**What follows for us.** The 3.68 check (one note with all four asks) scored 23 of 26 at 2.3 times the tokens and was not
adopted. The research says to try the asks one at a time. Each is a `--lessons` file for the exam (no code change), and
the exam takes 11 minutes: Fractal academia 3.81.

**13.2 Memory.** MemoryAgentBench (arXiv 2507.05257, V, ICLR 2026) splits memory into accurate retrieval, learning at test
time, long-range understanding and selective forgetting; no method is good at all four. Plain BM25 or dense retrieval
often beat the extraction-based memories: accurate retrieval long-context GPT-4.1-mini 71.8, HippoRAG-v2 65.1, BM25 60.5,
Mem0 32.6, Cognee 28.3. Conflicting facts are the universal weak spot: every method 7% or less on multi-hop conflicts, best
overall 32.5. For a graph of about 6,900 notes the baseline is lexical plus embeddings, and the open problem is
superseding stale or contradicting notes (our recall exam's "different words" weakness, 06 s3 and 05, is the same family).
Published leaderboards are weak yardsticks: one audit reports 6.4% of LoCoMo's answer key wrong (99 of 1,540; the
auditor sells a memory product; U), and LongMemEval-S (115K tokens) fits in a modern context. **Our own recall exam is a
better signal; always include a full-context or BM25 baseline.**

**13.3 Safe self-improvement.**
- *Learning by Doing* (Zep Agent Skills, arXiv 2611.01386, V, a vendor): skills are made only from traces with strong
  external verification (self-reported success does not count); a second model checks every claim against cited events;
  scanners reject instance data and instructions copied from tool output; trust tiers (provisional, corroborated by two
  or more attempt families, established by a Wilson lower bound); a skill with verified failures ranks lower and a
  conflicted one is dropped. Gains: +8.6 points pooled on tau3-bench banking, +4.5 to +18.8 on AppWorld, +32.6 on ALFWorld
  with Qwen3-8B. Limits: gains are capped by what the teacher can already solve (+0.6 where it never passed); merging
  skills with opposite rules lost points; a full skill index cost tokens on short tasks.
- *Poisoning and drift* (mostly U): planted "successful experiences" make agents copy unsafe habits such as skipping tests
  and persist until purged (MemoryGraft, arXiv 2512.16962); an attacker can write memory by ordinary queries (MINJA, NeurIPS
  2025); poisoned trajectories reach 43.5-54.6% success because a step that ran without error counts as validated
  (arXiv 2608.08303, 2608.05563); EvoBreak (arXiv 2608.01759, V): individually harmless stored experiences together weaken
  refusals, 86.1% average attack success, and checking note by note misses it (no defence was tested).
- **For Sleep and the toolbox:** lessons distilled from chats are an injection path. Quarantine new lessons, record where
  each came from, never let tool or web output become a lesson, check the set of lessons as well as each one, gate adoption
  on a hidden-test regression run, keep a snapshot to roll back to and an audit trail. This agrees with Hermes (s12) and
  with the takes of Fractal academia 3.74 (the scanner, the "do not save" list, the curator), and with the never-run
  floor (3.75).

**13.4 Small exams.** Wilson or Beta-binomial intervals, not the usual normal-approximation error bars (Bowyer et al.,
arXiv 2503.01747, V): at N = 100 the nominal 95% interval covers about 92.5%, worse at N = 10-30, and an interval
collapses to zero width at 0% or 100%. For two models use a paired method (Miller, arXiv 2411.00640, U); split the noise into
which questions were drawn and run-to-run sampling noise, which repeating runs reduces (arXiv 2512.21326, U). **Our
arithmetic, not from a source:** a 95% Wilson interval at 21 of 26 is roughly +/-15 to 18 points, so 21 against 23 of 26 cannot
be told apart; report the tasks that flipped and repeat runs (the sign test on fixed and broke that `exam pair` gives is
the paired view). No source found for contamination checks on small private exams; ours rely on hidden tests.

**13.5 Local speed (a check against what we have).** The reader found MTP drafting in llama.cpp roughly doubles decode speed
for Qwen 27B on 16 GB cards (contributor-run rows, V: RTX 5080 53.4 to 101.3 tokens/s at 2 drafts; 5060 Ti 26.3 to 59.5;
code and JSON gain most, prose little; more than 4 drafts is usually worse; needs about 0.5-1.7 GB more VRAM, so context
shrinks). **We already run this** (section 01 s5: MTP 1-ahead plus n-gram adopted, 75 tokens/s on code); the finding agrees,
including "deeper drafting can be slower on a full card". KV cache at q8_0 looks free (perplexity 34.6 to 34.1 on a 35B, U);
q4 is mixed. IQ4_XS costs about twice the KL divergence of Q4_K_M for 15-20% less size (U, different models), which is what
lets the 27B fit. **No independent evidence of a 4-bit, 16 GB model beating Qwen3.8-27B on coding or agent work** (vendor
numbers only), so staying on it is defensible; one same-model score moved 14 points between harnesses (U), so a harness
matters as much as the model.

**13.6 What happened when we tried them (23 Nov 2026, Fractal academia 3.81).** The ideas of 13.1 were run the same night on Fractal's 27B,
as prompt lines and as a trailing reminder, on the 26-task hard exam, with the 27B's own spread measured first (20, 21, 21 of 26
with the same settings; four tasks fail every time).
- **Standing rules fading:** a system-prompt line, a trailing reminder on every turn and the rules quoted word for word on every turn
  all failed to fix it (0 of 7 runs with a reminder). The model wrote the banned unit in brackets with the rule in front of it. The
  paper's 90-100% restoration was for formatting constraints under task load; here the failure is a habit, not a lapse of memory.
- **Doing more than asked:** the "change only what is necessary" line did nothing (0 of 3 on that task).
- **Adding up by hand:** forcing a tool made it count with a tool (4 to 14 calls on the totals task) but the task passed anyway; the line
  cost +14% tokens and, in the combination, broke the hand-traced task every time. Out.
- **Edge cases the doc names:** the only one with an effect: 22 and 22 of 26 against 20.7, no task broken, +9% tokens, one task
  fixed twice (a `put` that must replace). Small, and below the rule set in advance; the line to carry forward.
- **A lesson about the method:** one run of 23 against 20-21 looked like a gain and was not (the repeats gave 21 and 21). The papers on small
  evals (13.4) were right: repeat before believing a run.

Sources: see References, "Research pass of 23 Nov 2026".

**How we know.**
- 13.1 to 13.5, every outside number: References table "Research pass of 23 Nov 2026 (for 06 section 13)" (Mittal; Laban et al.; Zhu, Lim, Kan; CROCODIL; CURE and the self-test papers; MemoryAgentBench, ConvoMem, Penfield Labs audit; *Learning by Doing*, MemoryGraft, EvoBreak, arXiv 2608.08303 and 2608.05563; Bowyer et al., Miller, arXiv 2512.21326; sudoingX/qwen38-mtp, dev.to rosgluk, llama.cpp PR 22673, Unsloth GGUF benchmarks). MINJA (NeurIPS 2025) is not in References: source not recorded there.
- The four weak spots: our own measurement, Fractal academia 3.67; `Fractal\exam-kit\results\general-hard\h0.jsonl`. The 3.68 check (23 of 26, 2.3 times the tokens): `Fractal\exam-kit\results\general-hard\h0C.jsonl`.
- The Wilson interval at 21 of 26: our own arithmetic (the text says so).
- 13.6, the night's runs (spread 20, 21, 21; reminders, quotes, the four lines, edge cases 22 and 22): our own measurement, Fractal academia 3.81; results `Fractal\exam-kit\results\general-hard\` (`v1.jsonl`, `v2.jsonl`, `s1-rules.jsonl`, `s2-minimal.jsonl`, `s3-count.jsonl`, `s4-cases.jsonl`, `s4b-cases.jsonl`, `s5-all.jsonl`, `r1-remind.jsonl`, `r2-remind.jsonl`, `q1-quote.jsonl`, `q2-quote.jsonl`), lesson files `Fractal\runtime\experiments\2026-11-23\L1-rules.txt` to `L5-all.txt`, logs `chain1.log` to `chain6.log`.

**Proof.**
- Results: `Fractal\exam-kit\results\general-hard\s4-cases.jsonl`, `Fractal\exam-kit\results\general-hard\s4b-cases.jsonl`, `Fractal\runtime\experiments\2026-11-23\chain6.log`
- Code: `Fractal\exam-kit\src\general.rs`, `Fractal\exam-kit\src\pair.rs`
- Check it yourself: `exam.exe general report results\general-hard\s4-cases.jsonl results\general-hard\v1.jsonl` (from `Fractal\exam-kit`)

**The idea behind it:** [Confidence intervals for small exams](file:///E:/AI%20academia/Study%20hub.html#wilson), [Repeats and the noise floor](file:///E:/AI%20academia/Study%20hub.html#repeats), [Lessons and playbooks in the prompt](file:///E:/AI%20academia/Study%20hub.html#lessons)


## 14. Why a small model's fine-tunes trade one skill for another, and what to do instead (Measured on Ruby 21-23 Nov 2026; research 23 Nov)

**In short:**
- On Ruby's 1.7B brain, every fine-tune that taught more facts cost some conversation. Adding chat practice from one
  teacher made it worse, not better.
- The research says this is the known pattern: fine-tuning teaches a model to use what it already knows. New facts go
  in slowly and push it towards making things up, and mixed data conflicts once there is plenty of it.
- Splitting the skills into a team, with each brain answering only what it is best at, passed the rule on the first
  try, on paper. The fix is architectural, not more data.

**Measured on Ruby** (Ruby academia 3.16, 3.18; `Ruby\docs\research\2026-11-23\ruby_team_8`). Every row below was
judged on 1,020 answers paired with v5, under the 12 Nov rule.

| Try | Better / worse than v5 | Recall, of 192 (v5: 145) |
|---|---|---|
| Round 6 (more facts), four ways | none passes; facts up, chat down | up to 155 (v6b) |
| 7a: + 400 everyday chats from the 27B | 54 / 62, no real difference | 147 |
| 7b: + 800 chats | 47 / 88, clearly worse | 135 |
| **8a: team v5 + v6b, rule router** (offline, from existing answers) | **8 / 1, passes** (p 0.039) | **160** |
| **8b: team v5 + Gemma try 3** | **8 / 0, passes** (p 0.008) | **169** |

**What the research says** (Measured by others; sources in References, "Research pass, 23 Nov 2026 (night)"):
- **Facts are the hard part.** Gekhman et al. 2024: examples with facts the model didn't know are learned slowly.
  Once learned, they raise hallucination roughly linearly. With half-unknown data, accuracy was 43.0 at early stopping
  and 38.8 after 50 epochs. *Fine-tuning teaches use, not knowledge.*
- **Mixing data conflicts when there is a lot of it.** Dong et al. 2023: general chat plateaus near 1,000 samples, and
  the total amount of mixed data matters more than the ratio. This matches 7a (no change) and 7b (worse).
- **LoRA learns less and forgets less** (Biderman et al. 2024). Forgetting grows with training length (0.595 → 0.414
  over 16 epochs, full fine-tune). Weight decay and dropout don't prevent it.
- **One teacher narrows the style.** Imitation copies style, not accuracy (Gudibande et al. 2023), and more diverse
  synthetic data trains better (Chen et al. 2024).
- **What helps one brain:**
  - training on the model's own rewording of the answers (SDFT, Yang et al. 2024: GSM8K kept at 29.1 against 21.5
    with plain fine-tuning);
  - fewer epochs and early stopping;
  - a lower learning rate.
- **Teams of add-ons.** LoRAMoE (Dou et al. 2024) kept world knowledge where one LoRA lost it (TriviaQA 58.1 against
  47.8 on the same data). Arrow routing gains 1-2 points over one joint fine-tune. Apple ships a 3B on-device model
  with rank-16 task adapters swapped per task: production precedent for exactly this.
- **llama.cpp can do it.** `--lora` with `--lora-init-without-apply`, plus a per-request `lora` field with a scale for
  each add-on. Two caveats:
  - the add-on runs on an already-quantised base, so its output differs from the merged-then-quantised brain;
  - reported costs are 1.3-2.5× the first-token time in other engines, and nobody has published Android CPU numbers.

**Measured here on the caveat** (8c, 23 Nov): v5's own add-on on the Q4_0 base scored 134 of 192 on recall, against
145 for the merged v5, with 6 unwanted actions added. The base precision matters. 8c2 tests a Q8_0 base, and 8d tests
the facts card in the prompt instead of any add-on. **Results (Ruby academia 3.20):**
- On a Q8_0 base the add-ons match the merged brains (146 against 145), and the routed team scores 166.
- The card in the prompt of routed questions, with v5 unchanged, scores 165 and passes the 12 Nov rule (8 won, 0
  lost).
- Team and card together score 167, no better than the card alone.
- For facts, the prompt wins: one brain, no training, no extra memory.

**The general lesson.** When fine-tunes keep trading one skill for another, stop adding data. Give each skill its own
small brain (or add-on), route between them with rules first, and judge the team against the best single brain on the
same paired exam. Put facts that change in the prompt or in retrieval, not in the weights.

**And a knowledge-only expert** (k1, k2, 23 Nov, Ruby academia 3.21):
- Training an add-on only on the 348 knowledge rows, then routing knowledge questions to it, does not beat the card.
  The teams scored 153 and 160 of 192 on recall (card 165), and both fail the paired rule (2 won, 4 and 6 lost).
- Six epochs taught more Fractal facts than three (51 against 43 of 75) and did not add invention. Even so, the
  facts written into the weights are less reliable than the same facts in the prompt.
- The order to try, for a small model: card or retrieval first, a trained expert only for skills a prompt can't
  give.

**How we know.**
- Round 6 four ways: our own measurement, Ruby academia 3.16; `Ruby\docs\research\2026-11-21\ruby_brain_v6` (logs `run_v6.log`, `run_v6bc.log`, `run_v6e.log`), `Ruby\docs\research\2026-11-21\ruby_confirm_v6b`.
- 7a and 7b: our own measurement, Ruby academia 3.18; results `Ruby\docs\research\2026-11-21\ruby_brain_v7\result_ruby-v7a.json`, `result_ruby-v7b.json`.
- 8a, 8b, 8c, 8c2, 8d: our own measurement, Ruby academia 3.20; `Ruby\docs\research\2026-11-23\ruby_team_8` (`result_8a.json`, `result_8b.json`, `result_8d.json`, `run_8c.log`, `run_8c2.log`, `run_8d.log`).
- k1, k2: our own measurement, Ruby academia 3.21; `Ruby\docs\research\2026-11-23\ruby_knowledge_k\result_team_ruby-k1.json`, `result_team_ruby-k2.json`.
- The research: outside sources, References table "Research pass, 23 Nov 2026 (night)" (Gekhman et al.; Dong et al.; Biderman et al. and *LoRA Without Regret*; Gudibande et al. and Chen et al.; Yang et al. SDFT; LoRAMoE, Arrow, LoraHub, LoRA-Switch; Apple's on-device adapters, status C).
- llama.cpp `--lora-init-without-apply` and per-request `lora`: source not recorded in References (llama.cpp server README presumably; not named).

**Proof.**
- Results: `Ruby\docs\research\2026-11-23\ruby_team_8\README.md`, `Ruby\docs\research\2026-11-23\ruby_knowledge_k\README.md`, `Ruby\docs\research\2026-11-21\ruby_brain_v7\README.md`
- Code: `Ruby\docs\research\2026-11-23\ruby_team_8\run_8d.sh`

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora), [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired)

