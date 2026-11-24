# 05 Memory and knowledge graphs

Giving an AI a long-term memory it can actually use. Sources: Fractal's academia 3.13, 3.14, 3.23, 3.25, 3.30;
GrindPilot's brain write-up (`GRINDPILOT_BRAIN.md`, including Fractal's update and GrindPilot's reply); the research
pass in `potential ideas.md`.

---

## 1. The algorithm walks the graph, not the model

- **Sources:** HippoRAG and HippoRAG 2 (arXiv 2405.14831, 2502.14802): a knowledge graph plus personalised PageRank as
  a model of memory recall. Data Meerkat's Obsidian "AI brain" post-mortem: metadata first, no hubs, the algorithm
  walks the graph, privacy. A-MEM (2502.12110) and Generative Agents (2304.03442) as background.
- **Recall by personalised PageRank** (20 iterations), restarting at the nodes that match the query:

  ```
  r ← (1 − d)·p + d·Wᵀ r        p = seed nodes matching the query, W = normalised link weights
  ```

  The top nodes become a short **packet** handed to the model.
- **Measured:** asked about a past project in a fresh chat, the model made **one** recall call and answered correctly
  in **14 s**. Later, with a 6,456-note map, recall answered the same question in **0.02 s**.
- **Lesson:** let an algorithm pick what's relevant and hand the model a small packet, rather than asking the model to
  wander a graph.

**How we know.**
- Graph plus personalised PageRank as recall: outside sources, Gutiérrez et al. *HippoRAG*, arXiv 2405.14831; *HippoRAG 2*, arXiv 2502.14802; Brin & Page (1998); Haveliwala, *Topic-Sensitive PageRank* (2002). Background: Xu et al. *A-MEM*, arXiv 2502.12110; Park et al. *Generative Agents*, arXiv 2304.03442. The post-mortem: Data Meerkat, *I built my "AI Brain" in Obsidian. Then I had to tear it down*.
- One recall call, right answer in 14 s; 0.02 s on the 6,456-note map: our own measurement, Fractal academia 3.14; result file not kept.
- The GrindPilot design it came from: `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\GRINDPILOT_BRAIN.md` (section 3).

**Proof.**
- Code: `Fractal\fractal\mind.py`, Rust twin `Fractal\rust\parts\memory-mind\src\mind.rs` (Fractal academia 3.47); tests `Fractal\runtime\experiments\tests\mind_unit.py`
- Not kept: the live test's chat and timings.

**The idea behind it:** [Graph memory with personalised PageRank](file:///E:/AI%20academia/Study%20hub.html#ppr)


## 2. The map can have hubs; recall can't

- Hubs (a folder, a tool, a test suite linked to hundreds of notes) make a graph look rich but **ruin recall**: every
  walk drains into them.
- **Rule:** draw everything, but walk only the node types that answer questions (chats, memories, ideas, facts, files).
  Folders, tools, suites and skill groups are shown but never walked.
- **Cap links where recall walks:** each chat keeps at most 5 links, and no walked node may exceed 12.
- **Separate what's shown from what's searched.** Pretty and useful pull in different directions; give each its own
  rule.

**How we know.**
- Hubs draining walks, the walked types and the link caps (5 a chat, 12 a node): our own build and finding, Fractal academia 3.14 (`RECALL_TYPES`); the hub idea also in Data Meerkat's post-mortem (References) and `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\GRINDPILOT_BRAIN.md` (section 2.3).
- Measured confirmation that a parent note acts as a hub: Fractal academia 3.30; results `Fractal\data\recall_exam\results\20261111-042412.json`.

**Proof.**
- Code: `Fractal\fractal\mind.py`, `Fractal\rust\parts\memory-mind\src\mind.rs`
- Results: `Fractal\data\recall_exam\history.jsonl`

**The idea behind it:** [Graph memory with personalised PageRank](file:///E:/AI%20academia/Study%20hub.html#ppr)


## 3. Build memory from records you already keep

- Fractal added ~1,650 notes in 7 regions **without generating anything**: checkpoints, fact-ledger facts, files from
  tool calls, tools, practice problems, benchmark tasks, and frequent unlinked words. A code map added 5,023 functions
  and classes.
- **Cache by source change:** rebuilding only when source files change took the build from ~1.3 s to 0.6 s.
- **Code graphs:** Tree-sitter or `ast` gives exact structure; an LLM gives meaning; together the structure is
  checkable against the code (Understand-Anything, Graphify). **Tag every edge as EXTRACTED (read from source) or
  INFERRED (resolved by name)**, so recall answers can state their confidence.

**How we know.**
- ~1,650 notes in 7 regions, 5,023 functions and classes from the code map, cache 1.3 s → 0.6 s: our own build and measurement, Fractal academia 3.14; code `Fractal\fractal\mind.py` (`mind.atlas()`), `Fractal\fractal\codegraph.py`, tests `Fractal\runtime\experiments\tests\atlas_unit.py`; timing result file not kept.
- Tree-sitter or `ast` plus an LLM, and EXTRACTED/INFERRED edge tags: outside sources, Understand-Anything (Egonex-AI); Graphify (Graphify-Labs); our notes on them in `Fractal\docs\potential ideas.md` (sections 2 and 3).

**Proof.**
- Code: `Fractal\fractal\codegraph.py`, `Fractal\rust\parts\memory-mind\src\codegraph.rs`
- Results: the vault itself, `Fractal\data\studio\mind\vault`
- Not kept: the 1.3 s / 0.6 s timings.

**The idea behind it:** [Graph memory with personalised PageRank](file:///E:/AI%20academia/Study%20hub.html#ppr)


## 4. Lessons from a 15-year personal vault (a pasted Reddit post), applied

| The author's practice | What it became |
|---|---|
| Deep hierarchical folders; links by hand; tags last | A nested vault: `Projects/<project>/<chat>/{Checkpoints,Facts,Ideas}` and so on |
| Zip old daily notes by year | **Folding:** keep the latest 24 checkpoints per chat; older ones fold into one note per day. On the map, 464 conversation notes became 42. Forgetting can be folding |
| Merge small notes into bigger ones | Facts that repeat each other merge (both directions ≥ 0.7 overlap, ≥ 4 content words) |
| Notes must prove their worth | A use count goes up each time a note is handed to the model; notes that keep proving useful grow on the map |
| An idea is light yellow when born, blue once it's a business | An idea turns "taken up" when a later chat uses at least half its words, and links to that chat |

**How we know.**
- The practices: outside source, "A Reddit post on a ~15-year personal Obsidian vault (pasted by the user)".
- What each became (nested vault, folding to 24 checkpoints, 464 → 42 conversation notes, merging at ≥ 0.7, use counts, ideas "taken up"): our own build, Fractal academia 3.14 (the table under it); code `Fractal\fractal\mind.py`; the 464 → 42 count's result file not kept.

**Proof.**
- Code: `Fractal\fractal\mind.py`, `Fractal\rust\parts\memory-mind\src\mind.rs`
- Results: `Fractal\data\studio\mind\vault`

**The idea behind it:** [Graph memory with personalised PageRank](file:///E:/AI%20academia/Study%20hub.html#ppr), [Sleep: consolidating memory offline](file:///E:/AI%20academia/Study%20hub.html#sleep)


## 5. Consolidation: self-written memory needs grounding

- **Source:** *Language Models Need Sleep* (Google Research, arXiv 2606.03979): alternate wake (learning in context)
  with sleep, which consolidates into new low-rank weights and "dreams" (self-practice filtered by reward).
- **Without hardware to train a 27B,** keep the schedule and the filters and update memory instead of weights:
  nightly, only while the PC is free.
- **Grounding check:** a proposed lesson is kept only if ≥ 60 % of its content-word stems appear in the source chat,
  it's new (< 0.7 overlap with existing entries), and it is neither secret nor sensitive.
- **Measured:** a dry run proposed 4 lessons; grounding dropped the one the model had invented. **Models confidently
  "remember" things that never happened.**
- **Privacy filter:** one proposal described the user's private voice samples, which led to a sensitive-topic filter.
- GrindPilot applied the same idea to behaviour: only outcomes that were actually recorded (reward links, keys that
  worked, rules that fired) count as evidence.

**How we know.**
- Wake and sleep, low-rank consolidation and dreams: outside source, Behrouz, Hashemi, Javanmard, Mirrokni. *Language Models Need Sleep*, arXiv 2606.03979 (2026).
- The grounding rule (≥ 60 % stems, < 0.7 overlap, not secret), the dry run of 4 lessons with one invented dropped, and the `SENSITIVE` filter: our own build and measurement, Fractal academia 3.13; code `Fractal\fractal\sleep.py`, tests `Fractal\runtime\experiments\tests\sleep_unit.py`; dry-run output not kept.
- GrindPilot's behaviour evidence: the GrindPilot record, `E:\AI academia\GrindPilot - an evidence-driven agent that learns to play games from the screen.md` (sections 4 and 5), and `GRINDPILOT_BRAIN.md` section 5.2.

**Proof.**
- Code: `Fractal\fractal\sleep.py`, Rust twin `Fractal\rust\parts\learn\src\sleep.rs`
- Not kept: the dry run's four proposed lessons.

**The idea behind it:** [Sleep: consolidating memory offline](file:///E:/AI%20academia/Study%20hub.html#sleep)


## 6. Promotion and forgetting

**Promotion must be slow and evidence-only** (GrindPilot's general brain):
- three tiers: **house** (seeded, can't be changed by a project), **candidate** (seen working once), **general**
  (proven across contexts);
- promote at ≥ 2 independent contexts with ≥ 3 wins and ≥ 80 % success, or very strong single-context evidence
  (≥ 15 wins at ≥ 90 %);
- demote a general skill that falls below 50 % after ≥ 6 uses;
- **replace evidence per source, never add it**, or nightly consolidation inflates counts;
- **independent means different engines, or ≥ 3 games** (GrindPilot, 11 Nov 2026; **Adopted**): two Unity games from
  one studio share habits by design. Engines are recorded when a game's folder is scanned; an unknown engine can't
  show independence;
- **rebuild evidence from what each source knows now, every sleep** (**Adopted**, after a real bug): "go back with
  Esc" was promoted on evidence from an Esc that left the agent on the same page and from pages the project later
  deleted. Count no action whose result was "nothing changed", and let forgotten facts stop counting (the skill
  goes back to candidate);
- **merge general knowledge under a project's own facts,** so the project wins. House rules always win: a project
  "teaching" that Purchase is a claim button still can't make the agent press it.

**Forgetting must be fair and reversible:**
- forget only what had **enough chances** and **no evidence of use**;
- **back up first**, then delete, then compact;
- **never forget** what the user made by hand, what a task or rule points at, or the routes to protected things;
- **when you add a usage counter, record when counting began.** Old items all read "seen 0", and judging from their
  creation date would have wiped good items on the first night;
- judge in days and per item: the larger of 14 days and 3× the item's own usual gap between uses. Weekly things vanish
  under a "5 runs" rule. (GrindPilot built the 14-day floor on 11 Nov 2026; the per-item gap is still a lead.)

**How we know.**
- Three tiers, the promotion and demotion thresholds, per-source evidence, merging under a project's facts, house rules winning: GrindPilot's own build, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\GRINDPILOT_BRAIN.md` (sections 4.2, 4.3, 5) and `...\05 Brain.md`; outside source as listed in References: "GrindPilot documentary (8 Nov 2026) and Fractal's review of it".
- "Independent means different engines, or ≥ 3 games", the "Going back: Esc" bug and the 14-day floor (11 Nov 2026): `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\17 Ready for any game - save lists, covered windows, honest evidence.md`.
- "Record when counting began" (the "seen 0" bug): `GRINDPILOT_BRAIN.md` section 5.3.
- Backup first, never forget hand-made items: same sections; the per-item gap is marked in the text as still a lead.

**Proof.**
- Results: `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\GRINDPILOT_BRAIN.md`, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\17 Ready for any game - save lists, covered windows, honest evidence.md`
- Not kept here: GrindPilot's own test runs live in its project, not in Lattice.

**The idea behind it:** [Sleep: consolidating memory offline](file:///E:/AI%20academia/Study%20hub.html#sleep), [Repeats and the noise floor](file:///E:/AI%20academia/Study%20hub.html#repeats)


## 7. Vector search: when it's worth it

- **turbovec / TurboQuant** (arXiv 2504.19874): rotate each normalised vector with one shared random rotation, then
  store each coordinate at 2–4 bits with a fixed codebook. No training, online adds and removes, and a brute-force SIMD
  scan on the CPU. Claims: 10M × 768-d drops from 31 GB to 4 GB; recall@1 0.96–0.98 at 4-bit.
- **Not needed at personal scale.** 6,463 notes as float32 768-d embeddings is about 20 MB; plain numpy is enough.
  Compression pays off at millions of vectors.
- **Add embedding recall when keyword recall starts missing notes** that use different words from the question.

**How we know.**
- How turbovec works and its claims (31 GB → 4 GB, recall@1 0.96–0.98): outside sources, turbovec (github.com/RyanCodrai/turbovec, PyPI), status "R, benchmarks C" (the maker's numbers, not checked), and *Online Vector Quantization with Near-optimal Distortion Rate* (TurboQuant), arXiv 2504.19874; found through marc.kaz, reel on turbovec.
- 6,463 notes ≈ 20 MB: our own arithmetic, Fractal academia 3.25; nothing installed or measured.

**Proof.**
- Not kept: nothing was run (Fractal academia 3.25: "Nothing installed").

**The idea behind it:** none of the listed techniques; compressing embeddings only pays at millions of vectors, so measure recall first and add embeddings when words stop matching.


## 8. A recall exam, and what its first run showed

No memory change should be adopted without **a recall exam**: questions about past work with known answers, scored for
right answers and tokens used. The "second brain" products seen in reels (for example "BASE" for Claude Code) show
hooks, domains and dashboards, but no measurements; an exam is what would show whether any of them is better.

**Built 11 Nov 2026** for Fractal (Fractal academia 3.30; `fractal/recall_exam.py`). How it is put together:

- **Write the questions from real notes, and ask each thing twice:** once in the note's own words, once in different
  words. Add questions that ask where a detail came from (the answer is one link away), and questions memory has no
  answer to.
- **Make the answer a list of parts** (a path, a number, a name) that must all be in one note. Note ids change when
  notes merge or fold; the parts don't.
- **Measure three things separately:**

  | Measure | Question it answers | Needs a model |
  |---|---|---|
  | kept | Is the answer still in memory at all? | no |
  | handed | Does recall hand that note over, how high, and for how many tokens? | no |
  | answered | Does the model then answer right, give up, or invent? | yes |

- **Run candidates beside today's recall** on the same questions, and keep them out of the live code until one wins.
- **The exam must only read.** No use counts, no saved chats, or later runs find the exam's own traces.

**First run** (120 questions, 133 notes, packet of up to 6):

| Way of recalling | Same words | Other words | Where it came from | Tokens a question |
|---|---|---|---|---|
| Words, then a PageRank walk (section 1) | 51/52, first in the packet 6 times | 21/52 | 8/8 | 734 |
| Words only | 52/52, first 45 times | 24/52 | 3/8 | 466 |
| Best-matching notes first, then the one chat the walk points to; filler words ignored | 52/52, first 49 times | 26/52 | 8/8 | 515 |

- **A parent note that links to all its children is a hub** (section 2), even when no cap was written for it. The walk
  drained into each chat's summary and pushed the exact fact down or out.
- **The walk is still what finds the parent.** So don't drop it: rank by direct match, and keep one place in the
  packet for what the walk points to.
- **Check the stop list.** Two-letter filler words ("is", "of") matched almost every note; on questions with no
  answer the packet shrank from 476 to 342 tokens once they were ignored.
- **Different words are the real weakness** (26/52 at best). Ignoring word endings didn't help (23/52). This is the
  measured case for embedding recall (section 7), and the number it has to beat.
- **Word-based fixes are finished (measured 11 Nov 2026, Fractal academia 3.34).** BM25 scoring, relevance feedback
  (widening the question with words its best notes share) and a share of linked notes' scores gave 25, 24 and 26 of
  52. The reason was countable beforehand: **18 of the 52 questions share no word at all with the note that holds
  the answer**, 7 more match but rank just outside the packet. Feedback also hurt same-word questions (exact note
  first 36 times in 52 against 49). **General rule:** before trying retrieval fixes, split the misses into "no
  shared word", "ranked too low" and "not in memory"; each fix can only reach one of those.
- **Not yet measured:** the model's answers on these packets.

Two small ideas worth keeping from the "second brain" products:
- **a start-of-session "due now" line;**
- **a visible end-of-session memory tally** ("+2 facts, +1 lesson"), so the user sees what memory changed.

**How we know.**
- The exam's design and first run (120 questions, 133 notes, the three methods' scores and tokens): our own measurement, Fractal academia 3.30; results `Fractal\data\recall_exam\results\20261111-042412.json` and `Fractal\data\recall_exam\history.jsonl`; questions `Fractal\data\recall_exam\questions.json`.
- Word-based fixes (BM25, feedback, linked scores 25, 24, 26 of 52; 18 of 52 share no word): our own measurement, Fractal academia 3.34; recorded in `Fractal\data\recall_exam\history.jsonl` (runs of 11 to 12 Nov).
- "BASE" shows no measurements: outside source, charlieautomates, "BASE" second brain (reel); our review Fractal academia 3.23.

**Proof.**
- Results: `Fractal\data\recall_exam\results\20261111-042412.json`, `Fractal\data\recall_exam\results\20261111-224842.json`, `Fractal\data\recall_exam\history.jsonl`
- Code: `Fractal\fractal\recall_exam.py`, tests `Fractal\runtime\experiments\tests\recall_exam_unit.py`
- Check it yourself: `py -3 -m fractal.recall_exam` (from `Fractal`; the kept and handed measures need no model)

**The idea behind it:** [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden), [Graph memory with personalised PageRank](file:///E:/AI%20academia/Study%20hub.html#ppr)

