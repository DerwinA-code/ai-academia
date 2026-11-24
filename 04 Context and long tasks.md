# 04 Context and long tasks

Keeping an agent on track when its work outgrows its context window. Source: Fractal's academia 3.5, 3.12 and Part 6.
The test case was a real project chat that ran for days and needed **451 checkpoints**.

---

## 1. Mask before you summarise

- **Source:** JetBrains, *The Complexity Trap* (arXiv 2508.21433): simply masking old tool output works about as well as
  LLM summarisation, at about half the cost.
- **What we built:** at 75 % of usable room, old tool output and big arguments become one-line pointers (keeping
  6,000 characters). A written checkpoint note is made only if masking isn't enough.
- **Measured** (offline replay of the long chat, from message 2000 on): checkpoint notes **141 → 55**, upkeep time
  **~92 → ~42 min**.
- **Where the space really went:** 54 MB of a 67 MB chat file was repeated copies of the action log. Look at what
  fills the context before designing anything clever.

**How we know.**
- Masking works about as well as summarising at half the cost: outside source, Lindenbauer et al. (JetBrains). *The Complexity Trap*, arXiv 2508.21433.
- The 75 % trigger, one-line pointers and 6,000 kept characters: our own build, Fractal academia 3.5; code `Fractal\fractal\studio\handoff.py` (the Python original) and its Rust twin `Fractal\rust\parts\handoff\src\handoff.rs` (Fractal academia 3.55).
- Notes 141 → 55 and upkeep ~92 → ~42 min: our own measurement, Fractal academia 3.5; replay script `Fractal\runtime\experiments\tests\room_replay.py`; result file not kept.
- 54 MB of 67 MB was copies of the action log: our own measurement, Fractal academia 3.5; result file not kept.

**Proof.**
- Code: `Fractal\fractal\studio\handoff.py`, `Fractal\rust\parts\handoff\src\handoff.rs`, tests `Fractal\runtime\experiments\tests\room_unit.py`
- Not kept: the replay's output (only the numbers in Fractal academia 3.5 remain).

**The idea behind it:** [Working inside a fixed context](file:///E:/AI%20academia/Study%20hub.html#context)


## 2. Checkpoint notes: order by importance

- **Put NEXT STEPS and NEW FACTS first.** A note once grew its DONE section until NEXT STEPS fell off the end, and the
  fact ledger stayed empty for 170+ refreshes. A cut-off note must still say what to do next.
- **Keep an append-only fact ledger.** A fact once settled is never lost or re-summarised (`SETTLED:` lines). Facts
  should accumulate.
- **Keep the user's own words** word for word (the newest 3 messages whole).
- **List the last actions and the distinct actions already done,** to stop re-reading the same files.
- **Leave a minimum gap between checkpoints.** A refresh loop made 194 checkpoints because the size after a refresh was
  already above the trigger.
- **Protect the state the system depends on.** A trimming step once deleted the handoff note itself.

**How we know.**
- NEXT STEPS falling off the end, the empty fact ledger for 170+ refreshes, the 194-checkpoint refresh loop and the trim that deleted the handoff note: our own bugs, Fractal academia Part 6 (Bugs and lessons) and 3.5; logs of those chats not kept as files.
- The note layout (NEXT STEPS and NEW FACTS first, `SETTLED:` ledger, newest 3 user messages whole, last 12 actions): our own build, Fractal academia 3.5; code `Fractal\fractal\studio\handoff.py` and `Fractal\rust\parts\handoff\src\handoff.rs`.
- Paper trail of notes: `Fractal\data\studio\trail` (exists).

**Proof.**
- Code: `Fractal\rust\parts\handoff\src\handoff.rs`
- Not kept: the chat that showed the refresh loop and the cut-off notes (only the bug table in Fractal academia Part 6).

**The idea behind it:** [Working inside a fixed context](file:///E:/AI%20academia/Study%20hub.html#context)


## 3. Plain notes beat "AI shorthand"

| Note style | Size | Facts recalled | Invented |
|---|---|---|---|
| **Plain, structured** | ~1,040 tokens | **9.5/12** | 0 |
| "AI shorthand" | ~315 tokens | 7.5/12 | 0 |

A 3× smaller note lost a sixth of the facts. **Adopted:** plain notes.

**How we know.**
- Plain ~1,040 tokens 9.5/12 against shorthand ~315 tokens 7.5/12, none invented: our own measurement, Fractal academia 3.5 (Measurements table); result file not kept, and no script for it was found.

**Proof.**
- Not kept: the note-style comparison's notes, questions and scores. The numbers exist only in Fractal academia 3.5.

**The idea behind it:** [Working inside a fixed context](file:///E:/AI%20academia/Study%20hub.html#context)


## 4. The file system as memory

- **Source:** Manus, *Context Engineering for AI Agents*: use files as memory, and recite the plan so the goal stays in
  recent attention.
- **Plan as an editable file** (`plan.md`): the user's edit wins.
- **Paper trail:** every note and the full record are kept and searchable, so nothing is truly lost by masking.

**How we know.**
- Files as memory and reciting the plan: outside source, Manus, *Context Engineering for AI Agents* (References: "Anthropic, context editing and compaction guidance; Manus, *Context Engineering for AI Agents*").
- `plan.md` with the user's edit winning, and the searchable paper trail: our own build, Fractal academia 3.5; trail folder `Fractal\data\studio\trail`.

**Proof.**
- Code: `Fractal\fractal\studio\handoff.py`, `Fractal\rust\parts\handoff\src\handoff.rs`

**The idea behind it:** [Working inside a fixed context](file:///E:/AI%20academia/Study%20hub.html#context)


## 5. More room: a cheaper cache

- 4-bit KV gave **36,864 tokens** of context in the memory 20,480 took at 8-bit, with 12/12 haystack recall at 30K
  (see 01, section 3).
- **Effect on tasks:** the 11-file task needed 2 checkpoints at 20K and **0 at 36K**.
- With faster writing (MTP) and parallel reads, the same task went from 30 steps and 210 s to ~30 s.

**How we know.**
- 36,864 tokens at 4-bit in the room of 20,480 at 8-bit, 12/12 recall at 30K: our own measurement, Fractal academia 3.12; results `Fractal\runtime\experiments\2026-11-07\kv4\results.json` with server logs beside it; bench `Fractal\runtime\experiments\tests\kv4_bench.py`. Low-bit KV keeps quality: outside source, Liu et al. *KIVI*, arXiv 2402.02750.
- 11-file task 2 checkpoints at 20K, 0 at 36K: our own measurement, Fractal academia 3.5 and 3.12; result file not kept.
- 30 steps / 210 s to ~30 s with MTP and parallel reads: our own measurement, Fractal academia 3.11; results `Fractal\runtime\experiments\2026-11-07\mtp\results.json` and `Fractal\runtime\experiments\2026-11-07\spec`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-07\kv4\results.json`, `Fractal\runtime\experiments\2026-11-07\kv4\server-q4_0-36864.log`, `Fractal\runtime\experiments\2026-11-07\kv4\server-q8_0-20480.log`
- Code: `Fractal\runtime\experiments\tests\kv4_bench.py`
- Not kept: the 11-file task runs at 20K and 36K.

**The idea behind it:** [The KV cache](file:///E:/AI%20academia/Study%20hub.html#kv), [Quantisation and the VRAM budget](file:///E:/AI%20academia/Study%20hub.html#vram)


## 6. Leads from the literature (read, not yet tried)

- CTXAgent (arXiv 2610.34425), Self-GC (2607.00692), *LLM Agents Are Latent Context Managers* (2606.30005),
  TokenPilot (2606.17016), SWE-Pruner (2601.16746), *An Empirical Study of Harness Design for Coding Agents*
  (2609.20804).
- Anthropic's context editing and compaction guidance.

**How we know.**
- The six papers: outside sources, References row "CTXAgent 2610.34425; Self-GC 2607.00692; *LLM Agents Are Latent Context Managers* 2606.30005; TokenPilot 2606.17016; SWE-Pruner 2601.16746; *Harness Design for Coding Agents* 2609.20804" (status S).
- Anthropic's guidance: outside source, References row "Anthropic, context editing and compaction guidance; Manus, *Context Engineering for AI Agents*" (status S).
- Nothing measured here.

**The idea behind it:** [Working inside a fixed context](file:///E:/AI%20academia/Study%20hub.html#context)


## 7. The general lessons

1. Look at what fills the context before designing anything.
2. Masking first, summarising second.
3. Order notes so a cut-off note still says what to do next.
4. Facts accumulate in a ledger; they're not re-summarised.
5. Plain language recalls better than compressed shorthand.
6. A bigger effective context (cache quantisation) removes whole classes of problems for free.

**How we know.**
- A summary of sections 1 to 5 of this file; each lesson's source is given there (Fractal academia 3.5, 3.12, Part 6; *The Complexity Trap*, arXiv 2508.21433).

**The idea behind it:** [Working inside a fixed context](file:///E:/AI%20academia/Study%20hub.html#context), [The KV cache](file:///E:/AI%20academia/Study%20hub.html#kv)


## 8. Dates and the clock: give the model a table, put the time on the message (Measured, 21 Nov 2026)

- **Models count weekdays badly.** Asked to turn "dentist next Tuesday at 3:30pm" into an event on Saturday 21 Nov,
  with "now" and the weekday in its prompt, gpt-oss-20b answered Saturday 28 Nov, and "team call every Monday 9am"
  lost its repeat. With the next 14 days listed in the prompt ("Tue 24 Nov = 2026-11-24; ...") and a repeat-rule
  field, it answered 24 Nov and `FREQ=WEEKLY;BYDAY=MO`, about 1 s each. **Look-up beats arithmetic:** anything the
  model would have to compute from the date (weekdays, "in 3 weeks", month ends) is cheaper to list than to hope for.
- **A model with no clock guesses, at length.** Asked the time through a handover, Odysseus had only the date. It
  reasoned for 807 words, got it wrong, then asked to save a script to read the clock.
- **Put the clock on the newest message, not in the system prompt.** A system prompt that changes every minute
  invalidates the cached conversation and the model re-reads the whole chat each turn. Lattice adds one line
  ("[Teacher's clock when they sent this: HH:MM, weekday day month year. Mention it only if it matters.]") to the
  newest user message of the copy sent to the model. The stored chat keeps the user's words as typed.
- Records: Fractal academia 3.61 (09:00), 3.63; Odysseus academia 3.7, 3.8.

**How we know.**
- gpt-oss-20b answering Sat 28 Nov and losing the repeat, then 24 Nov and `FREQ=WEEKLY;BYDAY=MO` with the 14-day table: our own live check, Odysseus academia 3.7 and Fractal academia 3.63; code `Fractal\rust\parts\odysseus\src\planner\calendar.rs`; result file not kept (the live check is described in the record only).
- Odysseus reasoning 807 words about the time: our own observation, Odysseus academia 3.8; the chat itself not kept as a result file.
- The clock line on the newest message: our own build, Fractal academia 3.61 ("Fractal hands tasks to Odysseus", 09:00 entry) and Odysseus academia 3.8; code `Fractal\rust\parts\agent\src\prompt.rs` (the "Teacher's clock" line and its test).
- Timing of the day: `AI activity logs\Fractal\2026-11-21.jsonl`.

**Proof.**
- Code: `Fractal\rust\parts\agent\src\prompt.rs`, `Fractal\rust\parts\odysseus\src\planner\calendar.rs`
- Check it yourself: `cargo test -p agent` (from `Fractal\rust`) runs the clock-line test
- Not kept: the planner's first wrong answers and the 807-word reply.

**The idea behind it:** [Working inside a fixed context](file:///E:/AI%20academia/Study%20hub.html#context), [The agent tool loop](file:///E:/AI%20academia/Study%20hub.html#loop)
