# 13 Techniques, explained

The project records (Fractal, Ruby, Odysseus, Volta, the NCM lab) say what *we* did. This file says what each
technique *is*: the mechanism from first principles, the maths where there is any, a small worked example (our own
numbers where we have them), the traps, where the idea came from, and every section that used it. Each project section
links here from its **The idea behind it** line (see [00 How every record is written](00%20How%20every%20record%20is%20written.md)).

How to read a section:
- **What it is** and **How it works** can be read without the rest of the academia.
- **Where it came from** cites only papers, books and repositories we are confident are real. Sources listed in
  [References](References.md) are marked *(References)*; anything we could not confirm is marked *(unconfirmed)*.
- **Where we used it** lists real sections only, as "Fractal 3.81", "Ruby 3.9", "Odysseus 3.9", "Volta 3.4",
  "NCM lab 1.9". Where Fractal's record has two sections with the same number (3.60, 3.61, 3.66, 3.83), a word in
  brackets says which.
- **Try it** names the lesson in **Study hub.html** that lets you change the numbers and watch the result.

The 21 techniques fall into four groups: measuring (1 to 4), running a model on one card (5 to 7), making an agent
work (8 to 12, 16, 17), changing or combining models (13 to 15), and keeping the system honest and alive (18 to 21).

---

## Paired comparison and the sign test

**What it is.** A way to decide whether a change helped by running the old and the new version on exactly the same
questions and counting only the questions where they disagree: how many the change *fixed* and how many it *broke*.
If the change did nothing, fixes and breaks are a coin toss, and the sign test says how surprising the split is.

**How it works.**
1. Run version A and version B on the same n questions. Each question lands in one of four cells: both pass, both
   fail, fixed (A failed, B passed; call the count b) and broke (A passed, B failed; count c).
2. Throw away the questions where both agree. They say nothing about which version is better, and they are most of
   the exam. This is why pairing beats comparing two totals: the totals carry the noise of every question, while the
   difference carries only the disagreements. In variance terms, Var(B − A) = Var(A) + Var(B) − 2·Cov(A, B), and on
   the same questions the covariance is large and positive, so the paired difference is much less noisy.
3. The null hypothesis is "B is no better than A", so each of the m = b + c disagreements is equally likely to fall
   either way. The number of fixes is then a binomial with m trials and p = 0.5.
4. The exact two-sided p-value is the chance of a split at least as lopsided:
   p = 2 × Σ (i = 0 to min(b, c)) C(m, i) / 2^m, capped at 1.
   This is the exact form of McNemar's test for paired yes/no outcomes.
5. One consequence worth remembering: with m disagreements the smallest possible p is 2 / 2^m. Five disagreements can
   never reach p < 0.05 (2/32 = 0.0625); six can (2/64 = 0.031). A change that moves only two or three questions
   cannot be proven by one run, however good it looks.

*Worked example (ours).* The Rust academy's 12-line playbook on the 156-problem Rust exam: 139 passed without it, 148
with it, **fixed 10, broke 1** (Fractal 3.39). So m = 11, and P(X ≤ 1) = (C(11,0) + C(11,1)) / 2^11 = 12 / 2048 =
0.0059; doubled, **p = 0.012**. Compare the reply check of Fractal 3.68: 23 against 21 of 26, but fixed 2, broke 0, so
m = 2 and p = 2 × 1/4 = **0.5**. A two-task gain is exactly what a coin gives half the time.

**Why it matters / when it fails.**
- It tests direction, not size or cost. A significant gain can still be too expensive: the 3.68 check fixed two tasks
  for 2.3 times the tokens and was turned down.
- It assumes each verdict is fixed. If answers are sampled, or the server is not fully deterministic (Fractal 3.67
  found a resumed run going through where it had failed), a task that flips by chance shows up as "fixed" or
  "broke". Pair against a repeated baseline, not one lucky or unlucky run (see *Repeats and the noise floor*).
- Many tries, one winner. Testing five prompt lines and keeping the best (Fractal 3.81) inflates false wins; the
  winner must be repeated.
- A small p on the set the change was tuned on proves little. Ruby's action gate went from 7 unwanted actions to 0 on
  the answers its word lists were tuned on, and did much worse on phrases written blind (Ruby 3.14).
- The marker must be right. In Fractal 3.66 all three of one run's "failures" were marking errors; a sign test on
  wrong verdicts is precise nonsense.

**Where it came from.** The sign test is the oldest significance test on record: John Arbuthnot (1710) used it on 82
years of London christening records. The paired version for yes/no outcomes is Q. McNemar, *Note on the sampling error
of the difference between correlated proportions or percentages*, Psychometrika 12 (1947). W. J. Dixon and A. M. Mood,
*The statistical sign test*, JASA 41 (1946), set it out for general use. For AI evaluations, E. Miller, *Adding Error
Bars to Evals*, arXiv 2411.00640 (2024) recommends paired differences on shared questions *(References)*.

**Where we used it.**
- Fractal 2.1 and 2.2: "fixed N, broke M" made the house method; paired counts trusted over raw percentages.
- Fractal 3.1: solve-check-repair, LiveCodeBench 37.5% to 60% (fixed 9, broke 0) and 52.5% to 77.5% (fixed 10, broke 0).
- Fractal 3.22: the compiler loop on Rust, 133 to 141 (fixed 8, broke 0); the self-written playbook fixed 2, broke 2.
- Fractal 3.39: the 12-line playbook, 139 to 148, fixed 10, broke 1, p = 0.012; adopted.
- Fractal 3.44: `exam pair` builds the fixed/broke count and the exact two-sided sign test into the exam kit.
- Fractal 3.66: working habits, 32 against 32 of 35, p = 1.000.
- Fractal 3.67: habits on the hard exam, fixed 2, broke 3, p = 1.000; not adopted.
- Fractal 3.68: the full reply check, fixed 2, broke 0, p = 0.500; not adopted.
- Fractal 3.71: the quick check, fixed 2, broke 0, p = 0.500; not adopted.
- Fractal 3.73: the self-edit copy, fixed 2, broke 1, p = 1.0; not adopted.
- Fractal 3.84: playbook live, 142 to 148 (fixed 8, broke 2, p = 0.109); with the edge-case line, fixed 2, broke 7 (p = 0.180).
- Ruby 3.9: answer-by-answer pairing over ten seeds; round 5 beat v4b, 943 against 901 of 1,020.
- Ruby 3.20: the facts card, 8 won and 0 lost on 1,020 paired answers; passes.
- Odysseus 3.9: the workshop adopts a habit only if the sign test over two rounds gives p ≤ 0.05.

**Try it.** *Is it real or luck?* Set the fixed and broke counts and watch the p-value and the coin-toss
distribution; find the smallest split that can ever be significant.

---

## Confidence intervals for small exams

**What it is.** A range of pass rates that are consistent with the score you saw. On a 26-task exam, "21 of 26" does
not mean the model is an 81% model: it means its true rate on tasks like these is somewhere between about 62% and
91%. The Wilson interval is the right tool for a small count of passes.

**How it works.**
1. Treat each task as a draw from a large pool of similar tasks, passed with unknown probability p. The count of
   passes in n tasks is binomial. The observed rate is p̂ = passes / n.
2. The textbook (Wald) interval, p̂ ± z·√(p̂(1 − p̂)/n), assumes the binomial looks like a bell curve around p̂. On a
   small n near 0% or 100% it does not: at 26 of 26 it gives 100% ± 0, which is absurd.
3. Wilson's interval instead asks which values of p would *not* be rejected by a test at the chosen level, and solves
   for them. With z = 1.96 for 95%:
   centre = (p̂ + z²/(2n)) / (1 + z²/n)
   half-width = z / (1 + z²/n) × √( p̂(1 − p̂)/n + z²/(4n²) )
   The centre is pulled towards 50%, and the interval never leaves 0 to 100%.
4. What the interval covers: uncertainty from *which tasks happened to be on the exam*. It does not cover run-to-run
   wobble from sampling, which is a separate source (see *Repeats and the noise floor*).

*Worked example (ours).* 21 of 26 (the 27B's baseline `h0`, Fractal 3.67): p̂ = 0.808, z²/n = 0.148. Centre =
(0.808 + 0.074) / 1.148 = 0.768; half-width = 1.96 × √(0.00597 + 0.00142) / 1.148 = 0.147. So **62% to 91%**. 23 of 26
gives 71% to 96%. The two overlap almost entirely, which is why Fractal 3.81 wrote that "a result of 20, 21 or 23
cannot be told apart from another by one run". For comparison, the Wald interval at 21 of 26 is 66% to 96%, and at
26 of 26 Wilson gives 87% to 100% where Wald gives nothing.

A second example shows what intervals cannot do. LiveCodeBench in Fractal 3.1: 15 of 40 (37.5%) against 24 of 40
(60%). The Wilson intervals are 24% to 53% and 45% to 74%: they overlap. Yet the paired count was fixed 9, broke 0,
p = 2/512 = 0.004. Overlapping intervals are not a test; when the questions are shared, pair them.

**Why it matters / when it fails.**
- It makes small exams honest: a 26-task exam can tell a 50% model from an 85% one, not 80% from 85%.
- Items must be independent and drawn from the population you care about. The hard exam's 26 tasks come in 8 kinds
  written by one hand; the interval is about tasks like those, not about real work.
- Bowyer et al. argue that error bars built on the central limit theorem mislead below a few hundred questions;
  Wilson (or a Beta posterior) is the safe choice at our sizes. Clopper-Pearson's exact interval is wider still.
- Comparing two intervals for overlap throws away the pairing and is far weaker than the sign test.

**Where it came from.** E. B. Wilson, *Probable inference, the law of succession, and statistical inference*, JASA 22
(1927). L. D. Brown, T. T. Cai and A. DasGupta, *Interval estimation for a binomial proportion*, Statistical Science 16
(2001), showed why Wald fails and recommended Wilson. For AI evals: Bowyer et al., arXiv 2503.01747, and Miller,
arXiv 2411.00640 *(References, "Error bars on small evals")*.

**Where we used it.**
- Fractal 3.81: `compare.js` prints Wilson 95% intervals; 20 to 21 of 26 is about 58% to 91%, 23 of 26 is 71% to 96%,
  so one 23 is "inside the noise".
- Fractal 3.84: the five edge-case runs compared with the same script; mean 21.6 against 20.7, below the bar set first.

**Try it.** *How sure is 21 of 26?* Move the passed and total sliders and compare Wilson with Wald, especially near
0 and 100%.

---

## Repeats and the noise floor

**What it is.** The noise floor is how much a score moves when nothing real has changed. You find it by running the
same thing again, or by rebuilding a control by the same steps, before judging any change. A difference smaller than
the floor is not a result.

**How it works.**
1. Give each task its own chance of passing on a run, q_i. Tasks the model always passes (q = 1) or always fails
   (q = 0) never move. "Flippers" with q near 0.5 do.
2. The run-to-run variance of the total is Σ q_i(1 − q_i). Three flippers at q = 0.5 give 3 × 0.25 = 0.75, a standard
   deviation of about 0.9 tasks. So two runs of an unchanged model routinely differ by one task, sometimes two.
3. Averaging k runs shrinks that wobble by √k. It does nothing for the other source of uncertainty, which tasks are on
   the exam (that needs more tasks; see *Confidence intervals for small exams*).
4. Greedy decoding (temperature 0) is not a guarantee of repeatability: batching, floating-point order on the card,
   a server that answers differently on a resumed run, or a date in the prompt can all change answers.
5. A *control* finds the floor without a second idea in play: rebuild today's system by the same steps, check it
   equals the running one, then make a change that should not matter (a rounding change) and count what moves.
6. Set the bar before the runs ("mean of 22 or more over five runs, nothing broken more than once"), so the floor
   cannot be argued away afterwards.

*Worked example (ours).* Ruby 3.9: the rebuilt control equalled the phone's brain in all 310 tensors and gave the same
answer to all 306 questions. A control that differed only in the precision of the word table changed **29 of 306
answers (17 lost, 12 won)**: about one answer in ten moves from rounding alone, and a 17 to 12 split gives p = 0.46.
On Fractal's hard exam (3.81, 3.84) the plain 27B scored 21, 20, 21 (mean 20.7); the edge-case line scored 22, 22, 21,
22, 21 (mean 21.6). The difference, 0.9 tasks, is one flipper. The only per-task signal that survived was
`f1_rs_scope`: 0 of 3 plain, 4 of 5 with the line.

**Why it matters / when it fails.**
- Without the floor, every lucky run looks like progress. The all-four-lines run scored 23, then 21 and 21 on repeat
  (Fractal 3.81): regression to the mean after picking the best of several tries.
- Repeats cost GPU hours; the cheap substitute is a deterministic re-grade of saved answers (`exam grade`).
- Repeats on the same items do not tell you whether the exam itself is representative.
- One seed of each exam (Ruby 3.16) is a screening run, not a verdict.

**Where it came from.** Variance decomposition for evals and the advice to resample answers: Miller, *Adding Error
Bars to Evals*, arXiv 2411.00640 *(References)*. Controls and pre-set bars are standard experimental method (R. A.
Fisher, *The Design of Experiments*, 1935). L. Madaan et al., *Quantifying Variance in Evaluation Benchmarks*, arXiv
2406.10229 (2024), measures seed-to-seed variance on public LLM benchmarks *(not in References; unconfirmed beyond our
own recollection)*. The habit in our records comes from Ruby 3.9's control.

**Where we used it.**
- Fractal 2.2: rule 5, report flakiness honestly (a permission check that passed 1 of 2).
- Fractal 3.42 and Ruby 3.9: the rebuilt control; "a rounding-sized change moves about one answer in ten".
- Fractal 3.67: a resumed run passed a task that had stopped the first one: the server is not fully deterministic.
- Fractal 3.71: the date in the instructions changed between runs; some run-to-run noise expected.
- Fractal 3.80: the plan's step 1, the 27B's own spread over three runs, as the bar a candidate must beat.
- Fractal 3.81: `v1` 20 and `v2` 21 against `h0` 21; three flippers, four steady failures; repeats of `s5-all` (21, 21).
- Fractal 3.84: five runs of the edge-case line, mean 21.6, below the bar of 22; not adopted.
- Ruby 3.16 and 3.18: one seed per exam to screen six and three candidates; none passed.
- Odysseus 3.9: two rounds of fresh seeds before any habit is adopted.

**Try it.** *How much does a score wobble?* Choose how many tasks are flippers and how many runs to average, and
watch simulated scores spread and narrow.

---

## Hidden tests and held-out exams

**What it is.** Judging a model on tests it never sees and on questions never used to build, tune or teach it. Visible
tests tell the model what "done" looks like; hidden ones tell *you* whether it is really done.

**How it works.**
1. Split the material three ways: what the learner may see or train on, what you may look at while tuning (a
   development set), and a final exam looked at once.
2. Anything chosen while looking at a set is fitted to that set. A score on it is optimistic by an amount you cannot
   know; only a set untouched by every choice gives an unbiased estimate. This is Goodhart's law in miniature: a
   measure that becomes a target stops measuring.
3. For code, give the model the problem and a few example tests, then grade with many more hidden tests, especially
   the edge cases the specification names. The gap between visible and hidden pass rates measures how much the model
   is "passing the examples" rather than solving the problem.
4. Guard against *contamination*: training rows that are near copies of exam questions. A simple filter is word
   overlap: overlap(a, b) = |words(a) ∩ words(b)| / |words(a)|; drop a row when it reaches a threshold (we use 0.6,
   or 0.5 for practice problems).

*Worked example (ours).* On the hard exam (Fractal 3.67) every code task's visible tests passed every time, yet five
different code tasks failed the hidden ones: "1.-5" taken as money though the doc comment forbids a sign, `put` on an
existing key not replacing the value, `median` crashing on an empty list. In Ruby 3.15 the contamination check found
**19 of 1,761** training rows near exam questions (the weather, the date, the dog's name), so round 5's scores were
slightly flattered.

**Why it matters / when it fails.**
- A held-out set stops being held out the moment you tune on its failures. Ruby's action gate scored 7 unwanted
  actions to 0 on its tuning answers; on 219 phrases written blind it kept only 102 of 115 asked-for actions; the
  final design was judged on a third set (128 of 132 kept, 80 of 110 unwanted dropped) (Ruby 3.14). Recall's
  "pointer" candidate was shaped while looking at the recall exam, so it had to be confirmed by the model's answers,
  and was not (Fractal 3.30, 3.36).
- Hidden tests can be wrong. In self-practice the setter's own answers were wrong about half the time (187 of 385
  rejected, Fractal 3.3); markers can be wrong too (Fractal 3.66, 3.71).
- A held-out exam written by the same hand that built the system shares its blind spots.
- Public benchmarks may be in a model's pre-training data; date-cut sets such as LiveCodeBench exist for that reason.

**Where it came from.** Train/validation/test splitting is standard (T. Hastie, R. Tibshirani, J. Friedman, *The
Elements of Statistical Learning*, 2001). Hidden unit tests for code models: M. Chen et al., *Evaluating Large Language
Models Trained on Code* (HumanEval), arXiv 2107.03374 (2021). Many more hidden tests per problem: Liu et al.,
*EvalPlus*, arXiv 2305.01210; contamination-free by date: Jain et al., *LiveCodeBench*, arXiv 2403.07974; Rust
translations: Cassano et al., *MultiPL-E*, arXiv 2208.08227 *(all References)*. Goodhart's law: C. Goodhart (1975),
popularised in this form by M. Strathern (1997).

**Where we used it.**
- Fractal 3.2: exam questions hidden from the model; "keeping tests secret from the learner".
- Fractal 3.3: practice problems with ≥0.5 overlap to any benchmark dropped (43 of 385).
- Fractal 3.22: MultiPL-E's hidden tests; the self-written playbook tested on 78 odd-numbered problems never used to learn.
- Fractal 3.24: Ruby's 53-question held-out exam, wording and names different from training, near copies filtered at 0.6.
- Fractal 3.30: the recall exam; warns that its questions were written by the hand that built the candidate.
- Fractal 3.44: `exam grade` re-compiles every stored answer with the hidden tests.
- Fractal 3.67: hidden tests for every code task (`hidden\<id>.rs`) find weak spot 1, "stops at the tests it can see".
- Fractal 3.68: the check made Fractal write its own edge-case tests; it still missed "1.-5" and "1.234".
- Ruby 3.14: three phrase sets for the action gate, the first two no longer blind.
- Ruby 3.15: `teacher.exe check`, 19 contaminated rows; runners now refuse such data.
- Odysseus 3.9: proving-ground tasks generated fresh from a seed, so there is nothing to memorise.

**Try it.** *Does it pass the tests it can't see?* Write a small function's visible tests, then reveal the hidden
edge cases and see which "passing" versions fail.

---

## Speculative decoding

**What it is.** A way to write several tokens per pass of the big model without changing what it writes. A cheap
drafter guesses the next few tokens; the big model checks all of them in one pass, keeps the ones it agrees with and
replaces the first one it doesn't.

**How it works.**
1. Writing is memory-bound: each pass reads all the weights (see *Quantisation and the VRAM budget*), and checking
   k + 1 positions in one batch costs little more than checking one.
2. The drafter proposes k tokens. The big model computes its own distribution at each of the k + 1 positions in one
   pass.
3. Greedy: keep draft tokens while they equal the big model's top choice; at the first mismatch, take the big model's
   token. Sampled: accept draft token x with probability min(1, p(x)/q(x)), where p is the big model and q the
   drafter; on rejection, sample from the normalised max(0, p − q). Either way the output has exactly the big model's
   distribution.
4. If each guess is accepted with probability α (independently), one pass yields on average
   E[tokens per pass] = (1 − α^(k+1)) / (1 − α).
5. Each pass also costs more: the drafter runs k times (relative cost c each) and the check is wider. Leviathan et
   al.'s expected speed-up is (1 − α^(k+1)) / ((1 − α)(k·c + 1)).
6. Drafters: a small separate model; *n-gram / prompt lookup*, which copies the continuation of a matching earlier
   span in the context (free, excellent when rewriting given text); or *multi-token prediction (MTP)* heads trained
   with the model.

*Worked example (ours).* Adopted setting, MTP 1-ahead plus n-gram (Fractal 3.11): acceptance 0.97 on reasoning. With
k = 1, E = (1 − 0.97²) / 0.03 = 1.97 tokens per pass. Measured speed went from 50.7 to **75.4 tok/s**, a 1.49×
gain, so each pass cost about 1.97 / 1.49 = 1.32 times a plain pass. With k = 2 theory gives 2.91 tokens per pass,
yet at 36K context prose fell to 36.2 tok/s, slower than none: the extra cost per pass grew under memory pressure
(about 0.6 GB spare). Code rewrites with the n-gram drafter reached **249 tok/s**, because rewritten code is mostly
copied.

**Why it matters / when it fails.**
- Free speed when acceptance is high; little or none on creative prose (acceptance 0.87 here).
- Larger k raises the cost of each pass and the memory used; on a full card it can be slower than no drafting.
- The drafter needs the same tokenizer; MTP needs heads shipped with the model (Qwen3.8-27B has one; Gemma 4, the
  helper and the voice model have none).
- On a busy server with large batches, spare compute disappears and so does the gain.

**Where it came from.** Y. Leviathan, M. Kalman, Y. Matias, *Fast Inference from Transformers via Speculative
Decoding*, arXiv 2211.17192 (ICML 2023) *(References)*; independently C. Chen et al. (DeepMind), *Accelerating Large
Language Model Decoding with Speculative Sampling*, arXiv 2302.01318 (2023). The forerunner is M. Stern, N. Shazeer,
J. Uszkoreit, *Blockwise Parallel Decoding*, NeurIPS 2018. MTP: Gloeckle et al., arXiv 2404.19737, and DeepSeek-V3,
arXiv 2412.19437 *(References)*. The n-gram drafter follows "prompt lookup decoding" (A. Saxena, GitHub, 2023;
*attribution unconfirmed*). Our implementation is llama.cpp's `--spec-type draft-mtp,ngram-mod` (PRs #22673, #23269)
*(References)*.

**Where we used it.**
- Fractal 1.3 and 1.5: why several tokens per weight read help; the expected-tokens formula.
- Fractal 3.11: three rounds of measurement; MTP 1-ahead + n-gram adopted (reasoning 50.7 to 75.4 tok/s; code
  rewrites 249, against 184 with n-gram alone); 2-ahead slower at 36K; the 11-file task 11/11 in 32 s.

**Try it.** *Guess ahead, check once.* Set acceptance α, draft length k and draft cost c, and watch tokens per pass
and the real speed-up; find where a longer draft starts to lose.

---

## Quantisation and the VRAM budget

**What it is.** Storing a model's weights with fewer bits each so it fits on a consumer card, and the arithmetic that
says whether everything (weights, the KV cache, working buffers) fits in the card's memory. If it doesn't fit,
something spills to system RAM and writing speed falls three to four times.

**How it works.**
1. Weights are split into small blocks that share a scale. In llama.cpp's `q4_0`, 32 weights are stored as 4-bit
   integers with one 16-bit scale: (32 × 4 + 16) / 32 = **4.5 bits a weight**; `q8_0` is (32 × 8 + 16) / 32 = 8.5.
   Each weight is read back as w ≈ scale × q.
2. Rounding to a step Δ adds an error of variance about Δ²/12 per weight. Not all weights matter equally, so smarter
   formats spend bits where they matter: k-quants use nested scales, i-quants use codebooks, and an *importance
   matrix* weights the rounding error by how large each input activation is on calibration text (Σ x²), so weights
   that meet big activations are kept more precisely. Files can mix types per tensor.
3. The memory budget:
   weights (parameters × bits / 8) + KV cache (per token × context) + compute buffer + other programs + margin ≤ VRAM.
4. Speed follows from the same numbers: each written token reads every weight once, so
   top speed ≈ memory bandwidth ÷ size of the weights.

*Worked example (ours).* Fractal's file holds 27,320,697,856 weights at an average 4.17 bits: 27.32 × 10⁹ × 4.17 / 8
= **14.24 GB** (the file is 14,241,849,344 bytes, 13.3 GiB); in BF16 the same model is 54.65 GB (Fractal 3.42). Top
speed on the 5070 Ti: 896 GB/s ÷ 13.3 GB ≈ 67 tok/s; measured 50.8, about 76% of the bound (Fractal 1.3). After
games, the default batch of 512 needed a compute buffer that left the card "short by 857 MiB"; the model spilled and
ran at 17 tok/s. A batch of 384 fitted and gave 44.5 (Fractal 3.7).

**Why it matters / when it fails.**
- Quality falls off steeply below about 3 bits; at 4 bits a good mixed file is close to full precision on most tasks.
  Perplexity or KL to the original is not a task score; measure on your own exam.
- Calibration helps most at low bit widths. On Ruby's brain an importance matrix made no measurable difference
  (Ruby 3.9).
- Adapters trained on one precision drift on another: v5's add-on on a 4-bit base lost facts (134 against 145 merged),
  on an 8-bit base it did not (146) (Ruby 3.20).
- "Fits on paper" is not "fastest": letting llama.cpp choose the context took 40K and spilled (30 tok/s); capping it
  gave 50 (Fractal 3.8). Windows, Discord, the browser and games hold VRAM too; a game with the 27B loaded ran at 5 fps
  (Fractal 3.52).

**Where it came from.** T. Dettmers et al., *LLM.int8()*, arXiv 2208.07339 (2022); E. Frantar et al., *GPTQ*, arXiv
2210.17323 (2022); J. Lin et al., *AWQ: Activation-aware Weight Quantization*, arXiv 2306.00978 (2023). The GGUF
formats, k-quants and `llama-imatrix` are G. Gerganov's llama.cpp project; we ran `llama-imatrix` and `llama-quantize
--imatrix` ourselves *(References)*. Unsloth's *Dynamic 2.0* per-layer files are the maker's claims *(References, C)*.

**Where we used it.**
- Fractal 1.2 and 1.3: the 4.25-bit file in about 15 GB; the budget inequality; speed is bytes per token.
- Fractal 3.7: the spill bug, `ubatch-size = 384`, 17 to 44.5 tok/s.
- Fractal 3.8: the memory checker (`fit()` estimates weights + KV × context + buffer + margin).
- Fractal 3.10: vision projector on the card cost 8K of context and speed; kept on the CPU.
- Fractal 3.19: AirLLM, reading the weights from disk at 1.2 GB/s is about 11 s a token.
- Fractal 3.42: the running file is 211 IQ4_XS tensors plus a dozen other types, 4.17 bits on average.
- Fractal 3.52: the game guard unloads the 15 GB model when a game starts.
- Odysseus 3.2: gpt-oss-20b, 12.11 GB file, about 11.9 GB on the card at 32K.
- Odysseus 3.14: Chatterbox needs about 2.4 GB of card memory; does not fit beside the 27B.
- Ruby 3.9: importance matrix on her brain, no measurable difference.
- Ruby 3.11: `brain.exe` merges and converts; rounding to Q4_0 is llama.cpp's `llama-quantize`.
- Ruby 3.20: the same add-on drifts on a Q4_0 base and not on Q8_0.
- Volta 3.3: model sizes (IQ3_S, IQ3_XXS) chosen to fit 64 GB RAM and 48 GB of cards.
- NCM lab 1.5: memory needs for training (a 27B LoRA needs about 24 GB at the very least).

**Try it.** *Will it fit on the card?* Set parameters, bits, context and KV bits, and see the stack against a 16 GB
bar and the speed limit it implies.

---

## The KV cache

**What it is.** The store of keys and values a transformer keeps for every token it has already read, so that each
new token only has to compute its own. It is what makes writing fast, and it is the memory cost of a long context.

**How it works.**
1. In each attention layer, a token's query q is compared with every earlier token's key k, and the result weights
   their values v: attention = softmax(q·Kᵀ / √d) · V.
2. In a model that only looks backwards, earlier tokens' keys and values never change. So they are computed once and
   kept. Without the cache, writing token t would redo all t earlier tokens in every layer: quadratic work. With it,
   each step computes one new k and v per layer.
3. Reading the prompt (*prefill*) fills the cache in parallel; writing (*decode*) appends one entry per token.
4. Memory per token = 2 (K and V) × attention layers × KV heads × head size × bytes per number. Grouped-query
   attention shares each KV head among several query heads to cut this; hybrid models such as Qwen3.8 give only about
   one layer in four full attention, the rest a fixed-size state.
5. A cache can be saved and restored: if the start of a prompt never changes, its cache can be loaded instead of
   recomputed (a *prompt cache*), but only for an identical prefix with the identical model.

*Worked example.* A typical dense 8B model (32 layers, 8 KV heads, head size 128, 16-bit numbers) needs 2 × 32 × 8 ×
128 × 2 = 131,072 bytes, **128 KiB per token**: 1 GiB at 8,192 tokens. *Ours* (Fractal 3.12): storing K and V at 4.5
bits instead of 8.5 means 36,864 × 4.5 ≈ 166K bit-units against 20,480 × 8.5 ≈ 174K, so 36K at `q4_0` costs what 20K
did at `q8_0`. Measured: 14.5 GB at 20K q8 against 14.6 GB at 36K q4, the same writing speed (50.8), and 12 of 12
hidden facts recalled at 30K. On the phone (Ruby 3.14), restoring the saved state of her fixed instructions cut the
first reply's wait from **4.8 to 2.6 s** (the state file is 14 to 32 MB).

**Why it matters / when it fails.**
- It grows linearly with context and batch; at long contexts it rivals the weights. Running short of room for it is
  what forced checkpoints at 20K.
- Low-bit KV can hurt recall of exact details; KIVI found keys need per-channel and values per-token scaling. Test
  recall at the full context, as `kv4_bench.py` did.
- A saved state is tied to the exact model and the exact prompt tokens: change either and it must be thrown away
  (Ruby keys it to the brain's sha and the prompt's tokens).
- Only an unchanged *prefix* is reusable: put fixed text first and changing text (the time) after it. Ruby 3.22 moved
  the facts card before the time for this reason: 5.3 s to 0.8 s for a routed question's first word.
- Editing earlier context (masking old tool output) invalidates everything cached after the edit: a cost to weigh in
  *Working inside a fixed context*.

**Where it came from.** Attention: A. Vaswani et al., *Attention Is All You Need*, arXiv 1706.03762 (2017). Sharing KV
heads: N. Shazeer, *Fast Transformer Decoding: One Write-Head is All You Need* (multi-query attention), arXiv
1911.02150 (2019); J. Ainslie et al., *GQA*, arXiv 2305.13245 (2023). Inference memory analysis: R. Pope et al.,
*Efficiently Scaling Transformer Inference*, arXiv 2211.05102 (2022). Paged storage: W. Kwon et al., *vLLM /
PagedAttention*, arXiv 2309.06180 (2023). Low-bit KV: Liu et al., *KIVI*, arXiv 2402.02750 *(References)*.

**Where we used it.**
- Fractal 1.1: the KV cache as the memory cost of context; Qwen3.8's hybrid layers.
- Fractal 3.11: speed falls as context grows at nearly the same VRAM; 2-ahead drafting slower at 36K.
- Fractal 3.12: 4-bit KV cache, 20K to 36K at the same memory, 12/12 recall at 30K; adopted.
- Ruby 3.8: her brain keeps its prompt between replies.
- Ruby 3.14: the saved read-in state, first reply 4.8 to 2.6 s (8.2 to 2.3 s with the long prompt).
- Ruby 3.22: a saved state for each fixed part, with and without the card; 5.3 to 0.8 s.
- NCM lab 1.9: the prefix is run once and its keys and values kept for every level, instead of re-running it at each.

**Try it.** *What does each word cost?* Set layers, KV heads, head size, KV bits and context, and see the cache grow
next to the weights.

---

## The agent tool loop

**What it is.** The cycle that turns a language model into an agent: the model either answers or asks for a tool
(read a file, run a command, search); the harness runs the tool, puts the result back into the conversation, and asks
the model again, until it answers or a limit stops it.

**How it works.**
1. The harness sends the conversation plus a list of tools, each with a name, a description and an argument schema.
2. The model writes either final text or a tool call: a name and JSON arguments.
3. The harness checks the call (valid JSON, a known tool, arguments of the right shape), decides by the tool's risk
   whether to ask the user (read: never; write and run: unless trusted; send: always), runs it, and appends the result
   as a tool message.
4. Repeat. Stop on a final answer, a step cap, or a stuck guard (the same call repeated, no progress).
5. Thinking and acting interleave: the model reasons about the last result before choosing the next action.
6. Two costs compound. Every step re-sends a longer context (results pile up), and every step can fail. If each step
   succeeds with probability s and a task needs n steps, the chance of a clean run is roughly sⁿ: at s = 0.98,
   0.98³⁰ = 0.55, but 0.98³ = 0.94. Fewer, larger steps (reading several files in one call) matter as much as a better
   model.

*Worked example (ours).* The 11-file task (read 11 files, report a fact from each): 30 steps and 210 s before
speculative decoding and parallel reads; **11/11 in 32 s** after (Fractal 3.11). Devstral, sold as an agent model,
managed 4 of 22 on the same task against the 27B's 21 of 22 (Fractal 3.10).

**Why it matters / when it fails.**
- Loops: thinking loops ("Wait... Hmm...") until out of tokens (Fractal 3.6); repeated calls, handled by nudges and,
  after three, removing the tools so the model must report (Fractal 3.4).
- Format failures: tool calls written as plain text (now parsed); a call that was not valid JSON made the server
  answer 500 and stopped a whole exam run (Fractal 3.67); gpt-oss's malformed calls did the same (Fractal 3.81).
- The harness can be wrong: `run_command` refused `.\t.exe` that the same command had just built, and Fractal spent
  dozens of calls on workarounds (Fractal 3.67). An approval that timed out was reported to the model as "teacher said
  no" (Fractal 3.4).
- Step caps cut off honest work (Fractal 3.71: four tasks hit the cap).
- Tool results are other people's text: they can carry instructions (see *Prompt injection and command guards*).
- Every tool call is also a natural place to save and resume an agent (Fractal 3.38).

**Where it came from.** S. Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models*, arXiv 2210.03629
(ICLR 2023); T. Schick et al., *Toolformer*, arXiv 2302.04761 (2023). The plain loop with permissions and a step cap is
the common design described in Anthropic's *Building effective agents* (Dec 2024). Putting an agent down at each tool
call: AWS and Hydro's *Infinity* runtime (Oct 2026) *(References, S)*.

**Where we used it.**
- Fractal 1.6: the loop, model to tool call to result and back.
- Fractal 3.4: Studio's loop; risk classes; cut-off answers continue; repeated reads return a pointer; stuck guard; 7/7 permission checks.
- Fractal 3.6: Qwen's sampling and a loop guard, 11-file task 4/11 to 9.7/11.
- Fractal 3.10: agents chosen by measured score; Devstral 4/22.
- Fractal 3.11: parallel reads and faster writing, 11/11 in 32 s.
- Fractal 3.38: work that survives a restart; 5 of 5 interrupted tasks finished by themselves 4 to 7 s after a restart.
- Fractal 3.58: Studio's turn loop rebuilt in Rust, with the AI as an input.
- Fractal 3.61 (handover): `hand_to_odysseus`, asked every time; the two turns never share the card.
- Fractal 3.67 and 3.71: faults in the harness found by the exam; step-cap hits.
- Odysseus 3.6 and 3.7: his six tools and their live check (the Planner failed on "next Tuesday", then was fixed).

**Try it.** *Watch the loop.* Step through a small task call by call; set the per-step success rate and the number of
steps and see the chance of a clean run.

---

## Solve, check, repair with a compiler

**What it is.** Instead of trusting a model's first answer, run something that can check it (the problem's own
examples, a compiler, a type checker, tests), show the model the exact errors, let it repair, and keep the best
attempt. Executable evidence is a better teacher than more thinking.

**How it works.**
1. Generate a candidate.
2. Check it mechanically: parse it, compile it, run the visible examples.
3. If the check fails, return the exact error text ("fix each error before running anything") and ask for a repair.
   Limit the rounds (we use 3).
4. Keep the attempt that passed most checks; if thinking ran out of budget, hand the notes so far to a no-think
   answer (salvage).
5. The maths of sampling against a checker: if one attempt passes with probability p and a perfect checker can tell,
   the best of k independent attempts passes with 1 − (1 − p)^k (p = 0.6, k = 3 gives 0.94). For reporting, the
   unbiased pass@k from n samples with c correct is 1 − C(n − c, k) / C(n, k). Repair beats blind resampling when the
   error message points at the mistake, as a compiler's does.
6. The ceiling is the checker: it can only catch what it checks. A compiler proves types, lifetimes and that
   functions exist; it proves nothing about logic.

*Worked example (ours).* Rust, 156 problems (Fractal 3.22): one answer 133; with the compiler's errors and up to 3
repairs, **141, fixed 8, broke 0**, for 33% more time. All 10 compile failures were fixed; the 15 still failing all
compile and give wrong answers (rounding, sort order, negative edge cases). On Python, mypy fixed **0 of 582**, because
the 27B's wrong Python is wrong logic, not wrong types. LiveCodeBench with the examples as the check: 37.5% to 60.0%,
fixed 9, broke 0 (Fractal 3.1).

**Why it matters / when it fails.**
- Visible examples are not the specification: the model stops at the tests it can see (Fractal 3.67, weak spot 1).
- Self-written tests share the model's blind spots: under the 3.68 check it wrote edge-case tests and found real bugs,
  but still read "1.-5" as 95 cents.
- Asking the model to judge its own reply without running anything flags almost everything (code) or nothing (a
  faded rule) (Fractal 3.71).
- It costs time and tokens: 1.33 times for the compiler loop, 2.3 times for the full reply check.
- Generated "proven" data is only as good as its checker: about half the setter's hand-worked answers were wrong
  (Fractal 3.3); agreement between independent solutions is the stronger filter.

**Where it came from.** Checking samples against examples: Y. Li et al., *Competition-Level Code Generation with
AlphaCode*, arXiv 2203.07814 (Science, 2022); pass@k: M. Chen et al., arXiv 2107.03374 (2021). Repair from feedback:
X. Chen, M. Lin, N. Schärli, D. Zhou, *Teaching Large Language Models to Self-Debug*, arXiv 2304.05128 (2023); N. Shinn
et al., *Reflexion*, arXiv 2303.11366 (2023). Type errors in AI code: Mündler et al., arXiv 2504.09246; best-of-n with
checkers: S* (arXiv 2502.14382) and *Large Language Monkeys* (arXiv 2407.21787) *(References)*.

**Where we used it.**
- Fractal 3.1: `fractal/pipeline.py`, LiveCodeBench 37.5% to 60% and 52.5% to 77.5%, broke 0.
- Fractal 3.3: self-practice keeps a solution only if it reproduces the setter's answers; 115 of 385 kept.
- Fractal 3.20: the toolbox saves a script only if it runs clean on its own sample files.
- Fractal 3.22: the compiler loop, 133 to 141 of 156; `check_code` in Studio, 4/4 live chats compiled and passed hidden tests.
- Fractal 3.39: the practice desk checks course exercises with the course's own tests.
- Fractal 3.44: `exam run r1` (the compiler loop) and `exam check` in the Rust exam kit.
- Fractal 3.68: the reply check, 21 to 23 of 26, 2.3 times the tokens; not adopted.
- Fractal 3.71: the quick yes/no self-check; same score, still too costly.
- Fractal 3.84: `r1` 142 and `r1-book` 148, live, with the compiler loop.
- Odysseus 3.9: every proving-ground task is checked by code, not by a model.

**Try it.** *Let the compiler mark it.* Pick a kind of bug (a type error, a missing function, wrong rounding) and see
which check catches it: the examples, the compiler or the hidden tests.

---

## Lessons and playbooks in the prompt

**What it is.** Improving a model without touching its weights, by putting short written rules, lessons or a
playbook in its instructions. The rules live in files that can be read, compared, tested and undone.

**How it works.**
1. A model's answer depends on everything in its context; instructions shift what it is likely to write. This is
   in-context learning: no gradient, only conditioning.
2. Kinds of text: *house rules* that apply everywhere; *lessons* recalled when a task looks similar; a *playbook* that
   grows item by item from failures (adding small entries, rather than rewriting the whole thing each round, avoids
   losing what earlier rounds learned); *skills*, where only each skill's name and one line sit in the prompt and the
   body is read on demand.
3. Each line costs its tokens on every turn it is present (a cached prefix makes this cheap in time, not in room),
   and lines interact: a line that fixes one behaviour can break another.
4. So each line is a change like any other: run the exam with and without it, pair the answers, set the bar before,
   repeat before adopting.
5. Facts and behaviour differ: a prompt can carry a fact exactly; fine-tuning shapes habits but takes in new facts
   slowly and can encourage invention.

*Worked example (ours).* The Rust academy's 12-line playbook: 139 to **148 of 156, fixed 10, broke 1, p = 0.012**
(Fractal 3.39), repeated live as 142 to 148 (Fractal 3.84). By contrast the 10 lessons the model wrote itself from its
own 14 mistakes changed nothing: 69 of 78 both ways (Fractal 3.22). Ruby's 758-character facts card, added only when a
router says "knowledge", raised her recall from 145 to **165 of 192** and won 8, lost 0 on 1,020 paired answers (Ruby
3.20); a knowledge-only fine-tune did not beat it (Ruby 3.21).

**Why it matters / when it fails.**
- Lines interfere. "Never add up by hand; use a tool" broke three tasks alone and, in the combined set, broke a hand
  trace every time (Fractal 3.81).
- A line that helps one exam can hurt another: the edge-case line fixed `f1_rs_scope` on the hard exam but cost five
  problems on the Rust exam (Fractal 3.84).
- Rules given early fade. "Fahrenheit only" failed in every run, whether the rule was restated, quoted, or reminded
  on every turn (Fractal 3.81): the habit of adding a conversion wins over a rule the model can see.
- Self-written lessons can be invented; they need grounding in their source (see *Sleep: consolidating memory
  offline*).
- Anything a model writes for itself and reads back later is a route for planted instructions (Fractal 3.82).
- Long prompts cost time on small devices (Ruby's 590-token prompt, Fractal 3.24).

**Where it came from.** In-context learning: T. Brown et al., *Language Models are Few-Shot Learners*, arXiv
2005.14165 (2020). Growing playbooks: Zhang et al., *Agentic Context Engineering* (ACE), arXiv 2510.04618; rules kept
as files: arXiv 2607.13091; skills loaded on demand: Anthropic, *Agent Skills* (Oct 2025); Suzgun et al., *Dynamic
Cheatsheet*, arXiv 2504.07952; facts in fine-tuning: Gekhman et al., arXiv 2405.05904; rules fading over a chat:
Mittal, arXiv 2603.23530 *(all References)*.

**Where we used it.**
- Fractal 3.2: the Coach; lessons recalled into prompts, house rules the model can't change.
- Fractal 3.20: the toolbox index in the prompt, bodies read on demand (Agent Skills style).
- Fractal 3.22: a self-written Rust playbook, no gain (69/78 both ways).
- Fractal 3.39 and 3.43: the 12-line playbook, 139 to 148, adopted in practice and in Studio's code chats.
- Fractal 3.66 and 3.67: ten working habits, 32 against 32 of 35 and 20 against 21 of 26; not adopted.
- Fractal 3.81: four prompt lines alone and together; only the edge-case line behaved (22, 22).
- Fractal 3.84: the edge-case line over five runs (mean 21.6) and on the Rust exam (148 to 143); not adopted.
- Odysseus 3.9: the workshop; one habit at a time, paired, adopted only at p ≤ 0.05, retired when it stops earning its place.
- Ruby 3.20, 3.21 and 3.22: the facts card in her prompt passes; a knowledge add-on does not; the card kept read in.

**Try it.** *Does the rule help or hinder?* Switch our five prompt lines on and off and see the recorded fixed and
broke counts on the hard exam and the Rust exam.

---

## Graph memory with personalised PageRank

**What it is.** Memory kept as a graph of notes (chats, facts, files, ideas) joined by weighted links. To recall,
start from the notes that match the question and let a random walk spread along the links; the notes where the walk
spends most time are handed to the model as a short packet. The algorithm walks the graph, not the AI.

**How it works.**
1. Build the graph: nodes for chats, topics, memories, ideas and facts; links weighted by how strongly they relate.
   Normalise each node's outgoing weights to sum to 1 (matrix W).
2. Make a restart vector p: the seed notes that match the query's words, normalised to sum to 1.
3. Iterate r ← (1 − d)·p + d·Wᵀ·r. At each step the walker follows a link with probability d, or with probability
   1 − d (the *restart probability*) jumps back to a seed. The fixed point r is the personalised PageRank.
4. Each iteration shrinks the remaining error by a factor d; after 20 iterations at d = 0.85 it is below 0.85²⁰ ≈ 0.04
   of where it started.
5. Hand the top-ranked notes, of the allowed types, to the model as the packet.
6. Hubs matter: a node with many links collects mass from all of them. Cap the links per node, and keep hub types out
   of what can be walked or returned.

*Worked example.* Three notes: a fact A that matches the query, the chat C it came from, and a second fact B from the
same chat. Links A–C and B–C, so C passes half its weight to A and half to B. Seeds p = (1, 0, 0). With d = 0.85 the
fixed point is A 0.35, **C 0.46**, B 0.20: the chat outranks the fact you asked about. With a restart probability of
0.5 (d = 0.5) it is **A 0.58**, C 0.33, B 0.08. This is what the recall exam found on the real map: "the walk buries
the exact note", because the SSBU chat has 142 links (Fractal 3.30).

**Why it matters / when it fails.**
- The seeds come from word matching, so a question in different words often has no seed at all: 18 of the 52 such
  questions share no word with their note, so no word-based method can pass more than 34 of 52 (Fractal 3.34). That
  needs embeddings, not a better walk.
- Finding a note is not using it: "pointer" handed over more notes (86 against 80 of 112), but the model answered 71
  against 73 right and invented 4 more (Fractal 3.36).
- The restart probability trades "stay near what matched" against "find the chat it came from"; returning more often
  (restart 0.5 to 0.85) helped a little but never matched words alone (Fractal 3.30).
- Filler words ("is", "of") seed almost every note unless they are stopped.

**Where it came from.** S. Brin and L. Page, *The Anatomy of a Large-Scale Hypertextual Web Search Engine* (1998); T.
Haveliwala, *Topic-Sensitive PageRank* (WWW 2002) *(References)*; G. Jeh and J. Widom, *Scaling Personalized Web
Search* (WWW 2003). As a model of memory recall: Gutiérrez et al., *HippoRAG*, arXiv 2405.14831, and *HippoRAG 2*,
arXiv 2502.14802 *(References)*. Practical rules (metadata first, no hubs, the algorithm walks): Data Meerkat, *I built
my "AI Brain" in Obsidian. Then I had to tear it down* *(References, R)*.

**Where we used it.**
- Fractal 3.14: the Mind; `CHAT_LINKS = 5`, `HUB_LIMIT = 12`, 20 iterations; one `recall_mind` call answered in 14 s; `RECALL_TYPES` keeps hubs out of recall.
- Fractal 3.30: the recall exam; today's walk hands over 80 of 112, pointer 86; different words at best 26 of 52.
- Fractal 3.34: three word-based fixes (BM25, relevance feedback, linked-note scores): 25, 24 and 26 of 52; none helped.
- Fractal 3.36: the model's answers, walk 73 against pointer 71 of 120; pointer not adopted.
- Fractal 3.47: the walk ported to Rust exactly, including Python's corrected float summation; 78 of 112 through both.

**Try it.** *Where does the walk end up?* Drag the restart probability on a small graph and watch the fact and its
chat trade places.

---

## Sleep: consolidating memory offline

**What it is.** A job that runs while the AI is idle: it reads back the day's chats, keeps what is worth keeping
(lessons, facts), throws away what isn't, and practises on the day's topics. The brain analogy is the hippocampus
replaying the day into long-term memory during sleep.

**How it works.**
1. Two speeds of memory: a fast store of episodes (here, the chats) and a slow, structured store (the Brain, the Mind,
   training data). Writing every new thing straight into the slow store disrupts it; replaying episodes into it
   offline, with filters, does not.
2. *Consolidate*: a model proposes lessons from each chat. Each must pass filters before it is kept:
   - grounded: grounding = |stems(lesson) ∩ stems(chat)| / |stems(lesson)| ≥ 0.6, so most of its content words
     appear in the source;
   - new: word overlap with existing entries below 0.7;
   - not secret and not sensitive (regular-expression filters).
3. *Dream*: self-practice on the day's topics, kept only when independently verified (see *Solve, check, repair with
   a compiler*).
4. *Sparks*: links between projects that share a topic.
5. Schedule: only when the machine is free; a chat or a game wakes it. In the paper the slow store is new low-rank
   weights; on a 16 GB card we keep the schedule and the filters and write to memory files instead.

*Worked example (ours).* The first dry run on real chats proposed 4 lessons; the grounding check dropped 1 that the
model had invented. Another proposal described the user's private voice samples, which is how the `SENSITIVE` filter
came about (Fractal 3.13). The dreaming step's ancestor, overnight self-practice, kept **115 of 385** problems
(Fractal 3.3).

**Why it matters / when it fails.**
- Models confidently "remember" things that never happened; without grounding, Sleep writes fiction into memory.
- Private content leaks into summaries unless it is filtered.
- What it writes is read back into later prompts, so it is a route for planted instructions (Fractal 3.82 scans it).
- It competes for the card with everything else, so it must yield to games, chats and exams.
- Every memory change needs the recall exam before and after: the Rust academy note kept recall at 80 of 112 as one
  short note and dropped it to 77 as three longer ones (Fractal 3.39).
- Sleep-time "thinking ahead" (project maps) is built but stays off until it is measured.

**Where it came from.** J. McClelland, B. McNaughton, R. O'Reilly, *Why there are complementary learning systems in the
hippocampus and neocortex*, Psychological Review 102 (1995). For language models: Behrouz, Hashemi, Javanmard,
Mirrokni, *Language Models Need Sleep*, arXiv 2606.03979 (2026) *(References, R)*; idle-time thinking: Lin et al.,
*Sleep-time Compute*, arXiv 2504.13171 *(References, C)*; reflections over memories: Park et al., *Generative Agents*,
arXiv 2304.03442; filtered self-practice: Singh et al., ReST-EM, arXiv 2312.06585 *(References)*.

**Where we used it.**
- Fractal 3.3: self-practice with proven answers, the basis of the "dream" step.
- Fractal 3.13: `fractal/sleep.py`, consolidate, dream, sparks; `sleep_unit.py` 14/14; grounding dropped an invented lesson.
- Fractal 3.29: Sleep for both; Ruby's journal digested by Fractal, her misses kept as practice material.
- Fractal 3.39: a memory change judged by the recall exam (80 kept with one short note).
- Fractal 3.65: sleep-time compute; project maps written while asleep, off until measured.
- Fractal 3.72: Sleep whenever the PC has been free for 30 minutes and there are new chats, or a day has passed.
- Fractal 3.82: a read-only scanner for what the AIs write for themselves, Sleep's file included.

**Try it.** *What would she keep from today?* Paste a short chat and a proposed lesson, move the grounding threshold,
and see which lessons survive.

---

## Distillation into a small model

**What it is.** Training a small *student* model to behave like a large *teacher*, so the behaviour can run where the
teacher can't (a phone, a CPU). The student learns from the teacher's outputs rather than from human labels.

**How it works.**
1. *Soft targets.* The teacher's probabilities over the next token carry more than the right answer: they say which
   wrong answers are nearly right. Soften both models' outputs with a temperature T: pᵢ = exp(zᵢ/T) / Σⱼ exp(zⱼ/T).
2. Train the student on loss = λ·T²·KL(p_teacher ‖ p_student) + (1 − λ)·CE(label, p_student), where KL(P ‖ Q) =
   Σ P(x)·ln(P(x)/Q(x)) is zero only when the student matches the teacher. The T² keeps gradient sizes comparable as T
   changes.
3. *Sequence-level* distillation trains on the teacher's written outputs as ordinary text. It needs no access to the
   teacher's probabilities, and works when the two models' tokenizers differ, as ours do.
4. *Context (prompt) distillation*: the teacher answers with a long instruction prompt; the student is trained on the
   same examples with a short prompt, so the instructions move into the weights.
5. *On-policy* distillation lets the student write and the teacher grade each token, so the student learns from its
   own mistakes rather than only from the teacher's good paths.

*Worked example.* Teacher (0.7, 0.2, 0.1), student (0.5, 0.3, 0.2) over three tokens: KL = 0.7·ln 1.4 + 0.2·ln(2/3) +
0.1·ln 0.5 = 0.236 − 0.081 − 0.069 = **0.085 nats**. *Ours* (Fractal 3.24): the 27B wrote Ruby-style replies with
every rule in a ~590-token prompt; Qwen3-1.7B was trained (LoRA r16, 3 epochs, loss on replies only) with a ~70-token
prompt. The stock model with the long prompt scored 48% overall and added an unwanted action to 94% of ordinary chat
replies; the student v3 scored **90%** with a 68-token prompt, at the same speed and file size.

**Why it matters / when it fails.**
- Students copy the teacher's tics: v2 kept saying "I'll leave that to Fractal when it's back"; trimming those
  sentences fixed it, while dropping whole examples wiped out the user facts (59 to 7).
- One teacher limits the student: imitation copies style more readily than capability.
- New facts go in slowly and can encourage invention; a card in the prompt did better (Ruby 3.20, 3.21).
- Adding a skill dilutes the others: v4 started setting alarms for fact questions until the fact examples were
  repeated (v4b) (Fractal 3.24).
- More data is not always better: rounds 6 and 7 all fell below v5 (Ruby 3.16, 3.18).
- Contamination flatters the student (19 rows, Ruby 3.15). And test the whole product path: a markdown filter turned
  `notes_read` into `notesread`, so no action written by the phone brain had ever run (Fractal 3.24).
- For voices, a small student lost quality: Odysseus's Piper copy was judged "very poor" (Odysseus 3.12).

**Where it came from.** C. Buciluă, R. Caruana, A. Niculescu-Mizil, *Model Compression*, KDD 2006; G. Hinton, O.
Vinyals, J. Dean, *Distilling the Knowledge in a Neural Network*, arXiv 1503.02531 (2015); Y. Kim and A. Rush,
*Sequence-Level Knowledge Distillation*, arXiv 1606.07947 (2016); context distillation: A. Askell et al., *A General
Language Assistant as a Laboratory for Alignment*, arXiv 2112.00861 (2021), and C. Snell, D. Klein, R. Zhong,
*Learning by Distilling Context*, arXiv 2209.15189 (2022); Thinking Machines, *On-Policy Distillation* (2025)
*(References, R)*; Gudibande et al., *The False Promise of Imitating Proprietary LLMs*, arXiv 2305.15717
*(References)*.

**Where we used it.**
- Fractal 3.24: Ruby's phone brain; v1 75% to v2 91%, v3 adopted, v4b 93.7% with 1 unwanted action in 75.
- Fractal 3.65: on-policy distillation for Ruby, sequence-level only because the tokenizers differ.
- Fractal 3.66 (voice): a Piper voice trained on Chatterbox's lines, run on the phone.
- Ruby 3.3 and 3.7: round 5; teacher lines filtered (466 of 487 kept); talk exam 81 to 92 of 102, plain chat down.
- Ruby 3.4 and 3.6: her on-phone voice, a 16M-parameter Piper student at 0.035 real-time factor.
- Ruby 3.15: the contamination check before every brain build.
- Ruby 3.16 and 3.18: rounds 6 and 7; none passes, v5 stays.
- Odysseus 3.12: a fast copy of voice X for a blind listen; judged very poor.

**Try it.** *Teacher and student.* Move the temperature and the student's probabilities and watch the soft targets
and the KL change.

---

## LoRA fine-tuning

**What it is.** Fine-tuning a big model by training only a small add-on: for each chosen weight matrix, a pair of
thin matrices whose product is the change. The base stays frozen, the add-on is a few megabytes, and it can be merged
in, switched off, or mixed with others.

**How it works.**
1. A layer computes h = W₀x, with W₀ of size d × k. Full fine-tuning learns a change ΔW of the same size.
2. LoRA assumes the useful change has low rank r and writes it as ΔW = B·A, with B of size d × r and A of size r × k:
   h = W₀x + (α/r)·B·A·x. B starts at zero, so training starts from the base model exactly.
3. Trainable numbers per matrix: r·(d + k) instead of d·k. The optimiser's state (Adam keeps two numbers per trainable
   weight) shrinks by the same factor.
4. After training, W = W₀ + (α/r)·B·A can be merged into the weights, so answering costs nothing extra.
5. QLoRA keeps the frozen base in 4-bit and trains the add-on in 16-bit, so bigger models fit.
6. Because add-ons are just changes, they can be added, averaged, trimmed (TIES: keep each one's strongest changes,
   drop those that disagree in sign, average the rest) or scaled.

*Worked example.* A 2,048 × 2,048 projection has 4,194,304 weights. At r = 16 the add-on has 16 × (2,048 + 2,048) =
**65,536**, 1.6% of it. *Ours*: Ruby's brains are 16-bit LoRA r16 on Qwen3-1.7B, 3 epochs, loss on replies only, 73
to 230 s on the 5070 Ti (Fractal 3.24). Merging v4b and v5 by TIES gave 920 of 1,020; pushing v4b's change 25%
further gave 27 unwanted actions against 10 (Ruby 3.9, Fractal 3.42).

**Why it matters / when it fails.**
- LoRA learns less and forgets less than full fine-tuning; it shapes behaviour well and stores new facts poorly.
- An add-on trained against one version of the base drifts on another: v5's add-on on a 4-bit base lost facts (134
  against 145), on an 8-bit base it did not (146) (Ruby 3.20).
- More epochs overfit: the 6-epoch knowledge add-on learned Fractal facts (51 of 75) and forgot the user (38 of 75)
  (Ruby 3.21).
- The data must aim at the misses, or the gain is nil: the helper's LoRA on practice answers gave no clear gain
  (Fractal 3.10).
- A 27B LoRA needs about 24 GB at the very least (NCM lab 1.5); it does not fit this card without layer streaming
  (Fractal 3.49).
- Tied embeddings can be written twice on merge (+175 MB; Fractal 3.24, Ruby 3.9).

**Where it came from.** E. Hu et al., *LoRA: Low-Rank Adaptation of Large Language Models*, arXiv 2106.09685 (ICLR
2022), building on A. Aghajanyan et al., *Intrinsic Dimensionality Explains the Effectiveness of Language Model
Fine-Tuning*, arXiv 2012.13255 (2020). QLoRA: Dettmers et al., arXiv 2305.14314; capacity and forgetting: Biderman et
al., *LoRA Learns Less and Forgets Less*, arXiv 2405.09673, and Thinking Machines, *LoRA Without Regret* (2025);
arithmetic on changes: Ilharco et al., arXiv 2212.04089; Wortsman et al. (model soups), arXiv 2203.05482; Yadav et al.
(TIES), arXiv 2306.01708 *(all References)*.

**Where we used it.**
- Fractal 3.10: LoRA on the 4B helper with practice data, no clear gain; not adopted.
- Fractal 3.24: Ruby's phone brain, LoRA r16, v1 to v4b.
- Fractal 3.42: weight arithmetic reviewed; Fractal's 27B has no fine-tune to merge.
- Fractal 3.49: layer streaming for LoRA training ("Soup") evaluated for the 27B.
- Ruby 3.7: round 5 (v5), not adopted at first; later passed on ten seeds (3.9).
- Ruby 3.9: soups, TIES, extrapolation and an importance matrix on her add-ons.
- Ruby 3.11: `brain.exe` merges adapters by any weighted mix (`--mix v4b=0.5,v5=0.5`).
- Ruby 3.16 and 3.18: nine candidates trained in 5 to 10 minutes each; none passes.
- Ruby 3.20 and 3.21: add-ons switched per question; drift on a 4-bit base; knowledge-only add-ons lose to the card.
- NCM lab 1.5: memory needs for a 27B LoRA, when choosing a training card.

**Try it.** *How small can the change be?* Set d, k and r and see the add-on's size against the full matrix, and what
a rank-r change can and cannot express.

---

## Mixture of experts and routers

**What it is.** A model, or a system, made of several specialists with a router that sends each input to only a few
of them. Inside a model, the "experts" are feed-forward blocks chosen per token; at the system level, they are whole
models, add-ons or prompt cards chosen per request. Either way you pay memory for all of them and compute for the few
that run.

**How it works.**
1. A small gate scores every expert for the current token: s = W_g·x.
2. Keep the top k scores and turn them into weights: g = softmax(TopK(s, k)); the others get weight 0.
3. The layer's output is the weighted sum of the chosen experts: y = Σ (i in top k) gᵢ·Eᵢ(x).
4. Training adds a load-balancing term so that tokens spread across experts, for example L_aux = N·Σᵢ fᵢ·Pᵢ, where fᵢ
   is the share of tokens sent to expert i and Pᵢ its mean gate probability; it is smallest when both are even.
5. The cost split: memory holds *all* parameters; each token reads and computes only the *active* ones. Since speed
   is bytes read per token (see *Quantisation and the VRAM budget*), an MoE writes like a much smaller dense model.
6. At the system level a router does the same job with a rule or a small classifier: send a picture to a model that
   can see, a knowledge question to the facts card, a long code task to whoever measured best at it.

*Worked example (ours).* gpt-oss-20b (Odysseus 3.2) has about 21B parameters, about 3.6B active per token, in a
12.11 GB file. If reads scaled with the active share, each token would touch roughly 12.11 × 3.6/21 ≈ 2.1 GB, a bound
of about 430 tok/s at 896 GB/s; shared layers and overheads cut that, and it measured **164 to 187 tok/s** against
the dense 27B's ~50. But on the hard exam the MoE candidates scored 18, 8 and 19 of 26 against the 27B's 21 (Fractal
3.78), and gpt-oss passed 5 of the 20 tasks it reached (Fractal 3.81). At the system level, the helper router sent 37
of 40 labelled requests to the right place against 24 of 40 for fixed rules (Fractal 3.9).

**Why it matters / when it fails.**
- Memory is set by total parameters: every expert must sit in VRAM or RAM, or be streamed from disk, slowly.
- Fast is not the same as able: experts are reported to help memorisation more than reasoning, and none of our MoE
  tries met the 21-of-26 bar.
- A router is a second model that can be wrong; its errors send the right question to the wrong expert. Keep it
  simple, rule-first, and measure it on its own.
- Combining at the system level has costs: separate add-ons drifted on a 4-bit base (Ruby 3.20), and a second brain
  costs memory (a 3.4 GB Gemma beside her Qwen).
- An expert with a different output format can break the harness: gpt-oss's malformed tool calls stopped an exam run.

**Where it came from.** R. Jacobs, M. Jordan, S. Nowlan, G. Hinton, *Adaptive Mixtures of Local Experts*, Neural
Computation 3 (1991); N. Shazeer et al., *Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts
Layer*, arXiv 1701.06538 (2017); D. Lepikhin et al., *GShard*, arXiv 2006.16668 (2020); W. Fedus, B. Zoph, N.
Shazeer, *Switch Transformers*, arXiv 2101.03961 (2021); A. Jiang et al., *Mixtral of Experts*, arXiv 2401.04088
(2024). On reasoning: Jelassi et al., *Mixture of Parrots*, arXiv 2410.19034; Abnar et al., arXiv 2501.12370; teams of
add-ons: LoRAMoE, Arrow, LoraHub *(all References, S)*.

**Where we used it.**
- Fractal 3.7: the hub, several models taking turns on one card (llama.cpp's router mode).
- Fractal 3.9: the dispatcher; helper routing 37/40 against rules 24/40, adopted; the effort router not adopted.
- Fractal 3.70: the MoE test begun (gpt-oss-20b, Qwen3.5-35B-A3B, Qwen3-Coder-30B-A3B, Gemma 4 26B-A4B).
- Fractal 3.78: the three MoE trials, 18, 8 and 19 of 26 at 76 to 91 tok/s; removed from Studio's menu.
- Fractal 3.80 and 3.81: experts tested only on the 27B's weak spots; Odysseus 5 of 20, not an expert for them.
- Odysseus 3.2: gpt-oss-20b, 21B total, ~3.6B active, 164 to 187 tok/s.
- Volta 3.3 and 3.6: a large MoE (Qwen3.8-Flash-Next) planned for Volta through Strata; a claim until measured.
- Ruby 3.18, 3.20 and 3.21: the case for splitting her skills; a router sends knowledge questions to the facts card.

**Try it.** *Which expert answers?* Set the number of experts and k, push tokens through a toy router, and compare
active against total parameters and the bytes read per token.

---

## Prompt injection and command guards

**What it is.** Prompt injection is text inside data (an email, a web page, a file, a note the AI wrote earlier) that
the model reads as an instruction. Command guards are the layers that stop such text, or a plain mistake, from doing
damage: marking untrusted text, asking before risky actions, and hard floors that no setting can switch off.

**How it works.**
1. A language model receives instructions and data in one stream of tokens. There is no hardware boundary between
   "what the user asked" and "what the email says"; only training and framing separate them.
2. So no single filter is enough. Defences are layered:
   - *mark* untrusted text (our `UNTRUSTED` wrapper; "spotlighting");
   - *least privilege*: each tool has a risk (read, write, run, send) and only what is needed is allowed;
   - *a person approves* anything irreversible (send always asks, showing the whole message);
   - *a floor*: a fixed list of commands that are refused whatever the trust setting;
   - *scan what persists*: notes and lessons that will be read back later;
   - *separate plan from data* (CaMeL's design: the plan comes only from the trusted request, and data cannot change
     which tools run).
3. Layering helps because a bad action must get past every layer: if two independent layers each miss with
   probabilities m₁ and m₂, both miss with m₁·m₂. They are rarely fully independent, and an attacker adapts, so treat
   this as an upper bound on comfort, not a guarantee.
4. Normalise before matching: decode encoded commands, fold look-alike characters, drop invisible ones, so a pattern
   can't be hidden by spelling.

*Worked example (ours).* The never-run floor (Fractal 3.75) decodes `-EncodedCommand` (UTF-16 in base64) and judges it
again, refuses any command over 20,000 characters, and blocks deleting drive roots, formatting disks, or touching the
voice samples, the signing key and the audit logs, even in a chat set to trust everything. The scanner (Fractal 3.82)
read **6,571 files with 0 hits after one fix**. Ruby's action gate, judged on a third, blind set, kept **128 of 132**
asked-for actions and dropped **80 of 110** unwanted ones (Ruby 3.14).

**Why it matters / when it fails.**
- Blocklists are bypassable by rewording; they are a floor, not a wall.
- False positives annoy and get switched off: the scanner's first run flagged an ordinary file (`projects.json`).
- "Trust everything" used to skip even the approval card; the floor exists because of that.
- Approval fatigue: if every action asks, people click yes.
- An action list in a small model's prompt is itself a hazard: the stock phone model added a random action ("open
  Spotify") to 94% of chat replies (Fractal 3.24).
- What an AI writes for itself is a delayed injection route (memory poisoning).

**Where it came from.** The term: S. Willison's blog (Sept 2022); the first systematic study: F. Perez and I. Ribeiro,
*Ignore Previous Prompt*, arXiv 2211.09527 (2022); indirect injection through retrieved data: K. Greshake et al., *Not
what you've signed up for*, arXiv 2302.12173 (2023). Defences: Hines et al., *Spotlighting*, arXiv 2403.14720;
Debenedetti et al., *CaMeL*, arXiv 2503.18813; adaptive attacks: Nasr, Carlini et al., *The Attacker Moves Second*,
arXiv 2510.09023; OWASP Top 10 for Agentic Applications (Dec 2025) *(References)*. Least privilege: J. Saltzer and M.
Schroeder, *The Protection of Information in Computer Systems* (1975).

**Where we used it.**
- Fractal 3.4: tool risks (read, write/run, send); send always asks and shows the whole message.
- Fractal 3.16: email text wrapped as `UNTRUSTED`, never followed as instructions.
- Fractal 3.24: finding 1, an action list in a small model's prompt is unsafe.
- Fractal 3.74: Hermes Agent's code reviewed; what ports to Rust (the floor and the scanner came from it).
- Fractal 3.75: the never-run floor under `run_command`, which no trust setting skips.
- Fractal 3.82: a read-only scanner for planted instructions in notes, lessons, Sleep's file and the toolbox.
- Ruby 3.14: the gate on her actions; unwanted actions 7 to 0 (v5) and 32 to 1 (v4b) on saved answers.
- Odysseus 3.6: mail sent only on a click with recipients confirmed; downloads only after file, source and size are confirmed.
- Odysseus 3.9: a self-written habit may not contain links, paths, code or phrases like "ignore previous".

**Try it.** *Spot the planted instruction.* Paste a note; see how the text is cleaned (invisible and full-width
characters) and which patterns fire.

---

## Working inside a fixed context

**What it is.** Keeping a long task going when everything the model can see at once is capped (36,864 tokens here).
Old material is hidden, summarised or moved to files, in order from cheapest to most drastic, so the goal, the rules
and the next step always fit.

**How it works.**
1. The budget: system prompt + tool list + history + tool results + room for the reply ≤ the context window.
2. Layer 1, *masking*: at 75% of usable room, old tool output and big arguments become one-line pointers. No model
   call is needed, and the full text stays on disk.
3. Layer 2, *a checkpoint note*, only if masking is not enough: the model writes a note ordered by importance (next
   steps and new facts first), the harness adds what it knows for certain (the user's messages word for word, the last
   actions), and the model continues from the note.
4. Layer 3, *outside memory*: an append-only fact ledger, an editable `plan.md`, and a searchable paper trail, so a
   settled fact is never re-summarised away.
5. The arithmetic of checkpoints: their number is roughly the tokens a task generates divided by the room freed each
   time. Making room cheaper (masking) or making the room larger (a 4-bit KV cache) both cut checkpoints.
6. Attention is uneven: models use the start and end of a long context better than the middle, and early rules fade
   (see *Lessons and playbooks in the prompt*). Whatever must be obeyed should be near the end or restated.

*Worked example (ours).* A replay of the SSBU DLC chat (Fractal 3.5): notes **141 to 55** and upkeep time from about 92
to 42 minutes once masking came first. Plain structured notes (~1,040 tokens) recalled 9.5 of 12 facts; "AI
shorthand" (~315 tokens) only 7.5. The 11-file task needed 2 checkpoints at 20K and **0** at 36K (Fractal 3.12). And
54 MB of the 67 MB chat file turned out to be copies of the action log.

**Why it matters / when it fails.**
- A note cut off before its "next steps" leaves the model lost; at one point a refresh loop ran 194 checkpoints.
- Summaries drift and drop facts; the append-only ledger exists because of it.
- Masking or editing early context invalidates the prompt cache after that point (see *The KV cache*).
- A bigger window is not free: it costs KV memory, and speed falls as context grows on a full card (Fractal 3.11).
- On small devices the prompt itself is the budget: Ruby's 590-token instruction prompt cost reading time every turn,
  which is why her rules were distilled into weights and her facts card is sent only when routed (Fractal 3.24, Ruby
  3.20).

**Where it came from.** Masking against summarising: Lindenbauer et al. (JetBrains), *The Complexity Trap*, arXiv
2508.21433 *(References, R)*. Position effects: N. Liu et al., *Lost in the Middle*, arXiv 2307.03172 (TACL 2024).
Memory paged in and out of context: C. Packer et al., *MemGPT*, arXiv 2310.08560 (2023). The file system as memory and
reciting the plan: Manus, *Context Engineering for AI Agents*; Anthropic's context editing and compaction guidance
*(References, S)*.

**Where we used it.**
- Fractal 1.1: the context window and what fills it.
- Fractal 3.4: repeated reads of an unchanged file return a short pointer.
- Fractal 3.5: masking first, checkpoint notes, the fact ledger, `plan.md`, the paper trail; notes 141 to 55.
- Fractal 3.12: the 4-bit KV cache, 20K to 36K; the 11-file task needs no checkpoints.
- Fractal 3.24: Ruby's instructions moved from a 590-token prompt into weights (68 tokens).
- Fractal 3.55: the checkpoints rebuilt in Rust, 1,355 of 1,355 checks, trail files byte for byte.
- Ruby 3.20 and 3.22: the facts card only when the router says knowledge, kept read in.

**Try it.** *Make room.* Watch a context bar fill as a task runs; choose masking or a note and see what survives and
what it costs.

---

## Speech synthesis and the latency budget

**What it is.** Turning text into a voice fast enough to talk to. Modern systems copy a voice from a short clip; the
hard part at home is not quality but the *time to first sound*, which must stay under about three seconds for a
conversation to feel live.

**How it works.**
1. A text-to-speech model turns text into acoustic tokens or a spectrogram, conditioned on a speaker reference (a few
   seconds of the target voice, encoded once). A *vocoder* turns that into a waveform.
2. The latency budget for one reply is a sum:
   first sound = transport + model load (if cold) + reference encoding + reading the text + making the first chunk +
   audio buffering.
3. The *real-time factor* is RTF = time to make the audio ÷ length of the audio. Streaming sentence by sentence
   without gaps needs RTF < 1; then first sound depends only on the first sentence.
4. So the levers are: keep the model loaded (no cold start), encode the reference once and keep it, run on the card
   if there is room, split the text into sentences and send the first one early, and choose a model whose RTF is well
   under 1 on the hardware that will run it.
5. Humans leave about 200 ms between turns; anything over a few seconds reads as the system being stuck.

*Worked example (ours).* Chatterbox Turbo on the CPU (Odysseus 3.14): load 0.6 s, reading the reference clip 4.2 s *on
every run*, then 3.2 s for "Listen to me." (1 s of speech): RTF about 1.5, so it cannot stream at all. On the card, kept
loaded with the reference cached, whole lines took **0.49 to 1.01 s** and short phrases 0.16 to 0.20 s (Odysseus
3.15). Pocket TTS kept loaded on the CPU made each whole line in **0.41 to 0.74 s** against Chatterbox's 9.2 to 14.6 s
(Fractal 3.76); streamed, first sound came in 0.08 to 0.10 s. A small Piper voice runs at RTF 0.035 on two threads
(Ruby 3.4).

**Why it matters / when it fails.**
- Cold starts and per-line reference encoding dominate short lines; the fix is a resident server, not a faster model.
- Voice copied from a speaker embedding alone drifts from line to line ("a different person each line"); a pitch lock
  roughened it (Fractal 3.64).
- The card is shared with the language model: Chatterbox on the card needs about 2.4 GB, which does not fit beside the
  27B (Odysseus 3.14).
- Small trained students lose quality (Odysseus 3.12); judge voices blind and by ear.
- Long requests stop early (Pocket at about 12 s), so text must be cut at sentences and commas (Fractal 3.77).
- Measure the time to first sound before shipping, on the device that will speak.

**Where it came from.** Neural speech: A. van den Oord et al., *WaveNet*, arXiv 1609.03499 (2016); end-to-end VITS: J.
Kim, J. Kong, J. Son, arXiv 2106.06103 (2021), on which Piper is built; vocoders: J. Kong et al., *HiFi-GAN*, arXiv
2010.05646 (2020). Turn gaps: T. Stivers et al., *Universals and cultural variation in turn-taking in conversation*,
PNAS 106 (2009). The models we used: Resemble AI's Chatterbox Turbo (MIT, model card), Kyutai's Pocket TTS (README)
*(References, S; speeds C)*; streaming budgets: channel.tel and Pipecat *(References, S)*.

**Where we used it.**
- Fractal 3.17: whisper and Qwen3-TTS on the CPU, about 11 s for 6 s of audio; speaking in pieces.
- Fractal 3.64: Chatterbox Turbo for a steady voice; why the old one drifted.
- Fractal 3.66 (voice): Chatterbox can't reach conversation speed on the CPU; a Piper voice trained from it, made on the phone.
- Fractal 3.76: Pocket TTS against Chatterbox, 0.41 to 0.74 s against 9.2 to 14.6 s a line; a blind listen.
- Fractal 3.77: Pocket TTS wired in, kept running, sentence by sentence, Chatterbox the fall-back.
- Ruby 3.4, 3.5 and 3.6: her on-phone voice; speed was never the limit, quality was.
- Odysseus 3.13: voice X through Pocket TTS, fast with no training.
- Odysseus 3.14 and 3.15: where Chatterbox's time goes; `llama-tts-serve` kept loaded, a line in 0.5 to 1.0 s.
- Odysseus 3.16 and 3.17: his voice wired into Studio, Hey Fractal and the phone.

**Try it.** *How soon does she speak?* Stack the parts of the latency budget, move the real-time factor and the
length of the first sentence, and see when the first sound arrives.

---

## Processes, handles and clean shutdown

**What it is.** The plumbing that decides what keeps running and what holds resources (the graphics card, ports,
files) after you think something has stopped. A model server, a voice server or a gateway is its own program; closing
the window that started it does not stop it unless something makes it.

**How it works.**
1. A process owns resources: card memory, a listening port, open file handles. They are freed only when the process
   frees them or ends.
2. On Windows a child process does not end when its parent does. A program that must die with Studio has to be
   stopped by something that knows it is Studio's (a stop tool, or a job object set to kill its members when the job
   closes).
3. Handles can be *inherited*: when a parent starts a child with inheritance on, every inheritable handle (including
   its redirected standard output) is copied into the child. If the child outlives the parent, the file stays open,
   and the next run cannot open its own log.
4. Fixes follow from that: make handles the child doesn't need non-inheritable; give each server its own log; stop
   things in order (the starter first, so it can't restart the rest); define exactly what "ours" means, so the stop
   tool never touches the user's own programs.
5. Watchers decide by polling: the time to react is at most the polling interval plus any grace period (5 s for the
   game guard; 40 s without a window before Studio shuts Fractal down).
6. Shared resources need one holder at a time and a fair queue; if each waiter politely yields to every other, they
   can all wait for ever (a deadlock).

*Worked example (ours).* A game ran at 5 fps because the 27B (about 15 GB) stayed loaded on the 16 GB card after
Studio was closed: the model server outlives Studio, and everything that watched for games only *paused*, none
*unloaded* (Fractal 3.52). The game guard now unloads the model within seconds. Later, a pocket-tts that outlived
Studio held `studio.log` through an inherited handle, so the next Studio could not start; `keep_log_handles_private`
fixed it (Fractal 3.83). Two exams each yielded to the other from 06:00 to about 09:00, until one holder file and
oldest-first ordering replaced "anyone may yield to anyone" (Odysseus 3.7).

**Why it matters / when it fails.**
- Pausing is not releasing: a paused job still holds the card.
- Heuristics for "is a window open" can be wrong: a windowless browser process read as "open" for ever (Fractal 3.83).
- Stopping by name is dangerous; `fractal-off` stops only programs inside the project, Python running Fractal's
  modules, and Studio's own browser profile, never the user's browser, editor or games.
- A process killed outright cannot write its last log line.
- Background jobs must also respect the user: they wait for games, chats, exams and Sleep (Fractal 3.72).
- Fixes not yet tried live must be listed as such (Fractal 3.83 had to wait for the next start).

**Where it came from.** Windows documentation (Microsoft Learn): *Inheritance* under Processes and Threads,
`CreateProcess` (`bInheritHandles`), `SetHandleInformation` (`HANDLE_FLAG_INHERIT`) and *Job Objects*
(`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`). Deadlock conditions: E. Coffman, M. Elphick, A. Shoshani, *System Deadlocks*,
ACM Computing Surveys 3 (1971). Supervisors that restart or stop children: J. Armstrong, *Making reliable distributed
systems in the presence of software errors* (PhD thesis, 2003, Erlang/OTP).

**Where we used it.**
- Fractal 3.38: work that survives a restart; scheduled tasks pause for a game while running.
- Fractal 3.52: the game guard and `fractal-off`; the power button; closing Studio shuts Fractal down.
- Fractal 3.72: jobs wait only for games, a busy card, a working chat, Sleep or Fractal being off; hidden jobs, no consoles.
- Fractal 3.77: the Pocket TTS server started hidden, kept running, stopped by `fractal-off`.
- Fractal 3.83 (closing Studio): the window watch fixed; Studio's log handles made non-inheritable.
- Odysseus 3.7: the exam gate deadlock; one holder (`holder.pid`), oldest first.
- Ruby 3.15: all four training runners stopped while Fractal was meant to be off.
- Volta 3.8: `volta gpu watch` and the heat guard looking after the cards.

**Try it.** *Who is still holding the file?* Start a small process tree, switch handle inheritance on and off, close
the parent, and see what survives and what stays locked.

---

## Append-only logs and an auditor

**What it is.** A record of every action the AIs take, written only by adding lines and never by editing them, and a
separate checker (the auditor) that reads the record by fixed rules and tells the user what needs them. The log makes
the AIs' work visible; the append-only rule makes it trustworthy.

**How it works.**
1. *One hook at the choke point*: every chat event passes through one function, and the log is written there, so
   nothing is missed by a caller forgetting to log. Jobs outside the main program call the same writer directly.
2. *Each line is self-contained*: when, who, what kind, what it was given, whether it worked. Secrets are masked on
   the way in. A line that arrives twice (a phone resending) carries an id made from its content and is written once.
3. *Append-only*: past days are never rewritten. To make tampering *evident*, fingerprint what is closed: a hash per
   finished day kept in a ledger, or a hash chain where each entry's fingerprint covers the previous one,
   hᵢ = H(hᵢ₋₁ ‖ lineᵢ). Changing any earlier line changes every later fingerprint.
4. *The auditor uses rules, not a model*: unanswered OK requests; a tool run after a "no"; a risky tool with no OK on
   record; a past log changed rather than added to; failures grouped; an AI gone quiet; lines out of order.
5. *Summary first, two levels*: "needs you" (rare, acted on) and "worth a look" (read when there is time). Alerts that
   fire too often are ignored, so each rule is tuned until it stays quiet on normal days.

*Worked example (ours).* The auditor's first run (Fractal 3.70) read two days, 348 lines. The draft flagged Ruby's
late-arriving lines as out of order and the same download line 17 times; both were fixed before the report. What
remained: nothing that needed the user, four things worth a look, including three `run_command` calls with no OK on
record, which turned out to be clones the user had asked for. A day of 155 practice problems had produced only 17 log
lines, because practice ran outside Studio's hook; the writer was then opened to every job (Fractal 3.27).

**Why it matters / when it fails.**
- A log sees only what passes its hook; say plainly what doesn't write to it.
- A process killed outright can't write its last line.
- Tests must write to their own folder (`FRACTAL_ACTIVITY_DIR`): the first Ruby tests wrote test events into the real
  log.
- Attribution matters: Odysseus's chats were written as Fractal's until he got his own folder (Fractal 3.79).
- On one machine, an attacker who can rewrite the log can rewrite the ledger too; real tamper-evidence needs the
  fingerprints kept somewhere else (or sent off the machine).
- Over-masking hides useful fields: the first masking rule hid chat ids and timestamps too.

**Where it came from.** Hash-chained records: S. Haber and W. S. Stornetta, *How to Time-Stamp a Digital Document*,
Journal of Cryptology 3 (1991). Secure logs on machines that may be compromised: B. Schneier and J. Kelsey (1998);
efficient tamper-evident logs: S. Crosby and D. Wallach, USENIX Security 2009 *(References)*. Monitoring AI agents:
Greenblatt et al., *AI Control*, arXiv 2312.06942 *(References, S)*. Alert fatigue: Google SRE book, ch. 6
*(References, S)*.

**Where we used it.**
- Fractal 3.5: the append-only fact ledger in checkpoint notes; a settled fact is never lost.
- Fractal 3.27: the AI activity log; one hook, two files per AI per day, secrets masked, 31/31 checks.
- Fractal 3.70: the auditor; rules only, a fingerprint ledger for past days, first report on 348 lines.
- Fractal 3.79: Odysseus gets his own log folder and is read by the auditor.
- Fractal 3.82: `auditor scan`, the same read-only approach applied to what the AIs write for themselves.
- Ruby 3.19: the auditor's findings reach the phone as notifications and an audit window.
- Volta 3.4: the Rust node keeps its own activity log (`activity.rs`).
- Odysseus 3.9: every adopted habit is logged and can be undone.

**Try it.** *Change a line, see the chain break.* Edit any line of a small hash-chained log and watch every later
fingerprint change.

---

## Rewriting with parity tests

**What it is.** Replacing a working program with a new one (here, Python with Rust) by proving the new one does
*exactly* what the old one did: the same inputs give the same outputs, byte for byte where possible. Behaviour is
frozen during the move; improvements come after, as separate, measured changes.

**How it works.**
1. Pick a part with clear edges. Keep the old one running as the fall-back.
2. Record or generate inputs: real files, every request from past benches, edge cases, made-up states.
3. Run old and new on each, compare the outputs exactly. Every difference is a bug in the new one, or a deliberate
   change written down.
4. Copy the old language's habits where they reach the output: what counts as white space, how JSON is laid out, how
   floats are summed, local time.
5. Switch over when the checks pass, keep the old version on disk, and keep a one-file way back.
6. The statistics of "it all matched": if the true rate of disagreement were r, the chance that n independent checks
   all agree is (1 − r)ⁿ. Setting that to 5% gives the *rule of three*: after n checks with no failure, r is below
   about 3/n with 95% confidence.

*Worked example (ours).* The model hub in Rust matched the Python on **3,277 of 3,277** checks (Fractal 3.48), so the
rate of disagreement on inputs like those is below 3/3,277 ≈ 0.09%. The memory part matched 101,781 of 101,781, which
needed Python's corrected float summation copied exactly, because the walk's scores depend on the order of rounding
(Fractal 3.47). The NCM lab's Rust matched PyTorch on 1,987 of 2,000 Sudoku boards by default and **2,000 of 2,000**
once PyTorch's TF32 shortcut was switched off: the differences were PyTorch's rounding, not the port; the same work
found a real bug in candle's `conv_transpose1d` (NCM lab 1.9).

**Why it matters / when it fails.**
- Parity covers only the inputs tried; the rule of three says nothing about kinds of input never generated.
- Byte-for-byte means copying the old program's quirks on purpose, and its bugs; fix them after the switch, one at a
  time.
- Some outputs can never match: tokens, timestamps, random ids, and floating-point order on a GPU. Set those aside
  explicitly and say so.
- A stand-in is not the real thing: the hub was proven against a stand-in server first, with real calls still to do
  (Fractal 3.48); Ruby's gateway was proven on the PC before the phone (Fractal 3.45).
- The move costs time without a measured gain in behaviour; the gain is in speed, size and one language (Fractal
  3.40, 3.41).

**Where it came from.** Characterisation tests: M. Feathers, *Working Effectively with Legacy Code* (2004).
Differential testing: W. McKeeman, *Differential Testing for Software*, Digital Technical Journal 10 (1998). Replacing
a system piece by piece beside the old one: M. Fowler, *StranglerFigApplication* (2004). The rule of three: J. Hanley
and A. Lippman-Hand, *If nothing goes wrong, is everything all right?*, JAMA 249 (1983).

**Where we used it.**
- Fractal 3.41: Lattice's shared foundations in Rust; the five pages and settings the same byte for byte.
- Fractal 3.44: the exam kit in Rust gives the recorded numbers from the recorded answers.
- Fractal 3.45: Ruby's gateway in Rust; 23/23 checks, 28 of 28 replies matched, 24 byte for byte.
- Fractal 3.47: memory in Rust; 101,781 of 101,781 checks; recall 78 of 112 through both.
- Fractal 3.48: the model hub in Rust; 3,277 of 3,277.
- Fractal 3.54: the tools part, 1,880 checks.
- Fractal 3.55: the checkpoints part, 1,355 of 1,355, trail files byte for byte.
- Fractal 3.58 and 3.62: the turn loop and the switch to the Rust Studio (6,569 of 6,569 on the station state).
- Ruby 3.10 and 3.11: her gateway; her brain builder making the same bytes as the Python tools.
- Volta 3.4 and 3.5: the node in Rust, 70/70 link checks, the Python node retired.
- NCM lab 1.9: the released models in Rust, matching PyTorch in full 32-bit maths.

**Try it.** *How many matches make it safe?* Move the number of checks and see the rule-of-three bound on the
disagreement rate fall.
