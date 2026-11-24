# 03 Agents, tools and harnesses

What makes a tool-using AI reliable. Sources: Fractal's academia 3.1, 3.4, 3.9, 3.16, 3.20–3.23 and Part 6;
GrindPilot's live testing (`06 Live testing and lessons.md`) and goals (`04 Learning and goals.md`).

---

## 1. Check against executable evidence; don't just think longer

**Solve, check, repair** (generate, run on the problem's own examples, feed back failures, repair, keep the best),
measured on Qwen3.8-27B, paired:

| | LiveCodeBench |
|---|---|
| Plain → with check-and-repair, no thinking | 37.5 % → **60.0 %** (fixed 9, broke 0) |
| Plain thinking → with check-and-repair | 52.5 % → **77.5 %** (fixed 10, broke 0) |

- The **non-thinking pipeline beat plain thinking** (60 % vs 52.5 %) in much less time.
- **Salvage cut-off thinking:** if thinking runs out of budget, hand the notes so far to a no-think answer.
- HumanEval+ and MBPP+ moved only within noise: the gain is on harder problems.

**How we know.**
- The LiveCodeBench table (37.5 → 60.0, fixed 9 broke 0; 52.5 → 77.5, fixed 10 broke 0) and HumanEval+/MBPP+ within noise: our own measurement, Fractal academia 3.1; runs in `Fractal\results\runs`.
- Salvaging cut-off thinking: Fractal academia 3.1.
- Benchmarks: "Liu et al. *EvalPlus* (HumanEval+, MBPP+), arXiv 2305.01210; Jain et al. *LiveCodeBench*, arXiv 2403.07974".

**Proof.**
- Results: `Fractal\results\runs\20261028-185024-local-quick.jsonl.gz`, `Fractal\results\runs\20261029-211749-fractal-quick.jsonl.gz`, `Fractal\results\runs\20261029-045930-local-think-quick.jsonl.gz` (corrected 24 Nov: was 20261028-195341, an empty file), `Fractal\results\runs\20261030-001514-fractal-think-quick.jsonl.gz`, index `Fractal\results\index.jsonl`
- Code: `Fractal\fractal\pipeline.py`

**The idea behind it:** [Solve, check, repair with a compiler](https://derwina-code.github.io/ai-academia/Study%20hub.html#repair), [Paired comparison and the sign test](https://derwina-code.github.io/ai-academia/Study%20hub.html#paired)


## 2. Compilers and type checkers as free judges

**Rust, MultiPL-E HumanEval-Rust (156 problems), Qwen3.8-27B, greedy, no thinking:**

| Condition | Passed |
|---|---|
| Python, one answer (same problems) | **151 (96.8 %)** |
| Rust, one answer | 133 (85.3 %) |
| Rust + compiler errors shown, up to 3 repairs, no tests | **141 (90.4 %)**, fixed 8, broke 0, +33 % time |

- The compiler fixed all 10 compile failures: `&str + &str`, a negative `usize`, a missing `f64::is_integer`, wrong
  `&` patterns, a forgotten helper, an unavailable crate.
- **The 15 still failing all compiled and gave wrong answers.** "If it compiles, it works" is false: compilers catch
  type, null and memory mistakes, not logic (rounding, sort order, negative-number edge cases).
- The compiler closed about 40 % of the Rust-vs-Python gap. **A model writes best in the language with the most
  training data**; feedback narrows the gap, it doesn't close it.

**Type-checking Python found nothing** (mypy, missing-annotation complaints ignored, up to 3 repairs):

| Benchmark | Plain | With mypy check |
|---|---|---|
| HumanEval+ (164) | 153 | 153 |
| MBPP+ (378) | 296 | 296 (2 false alarms on right answers) |
| LiveCodeBench quick (40) | 15 | 17 (both from the plain "does it parse?" check, not from mypy) |

- Offline, mypy flagged 1 of 35 wrong answers (and 4 false alarms on right ones).
- **A strong model's wrong Python is logic, not types.** The published "94 % of TypeScript compile errors are type
  errors" (arXiv 2504.09246) doesn't carry over to it.

**A model's own lessons didn't teach it Rust.** It wrote itself a sensible 10-lesson playbook from its 14 mistakes on
half the problems. On the other 78: one answer 69 → 69 (fixed 2, broke 2); with the compiler 71 → 70. **The compiler
is a better teacher than self-written advice, because it reacts to the exact mistake.**

**Built from this:** after an agent writes a `.rs` file, the compiler check runs automatically and its errors go into
the tool result. In 4 live chats, all compiled and passed hidden tests. One earlier attempt compiled but **hung forever
on the hidden tests**: tests remain the real proof.

**How we know.**
- The Rust table (151, 133, 141 of 156; fixed 8 broke 0), the 10 compile failures and the 15 wrong answers: Fractal academia 3.22; results `Fractal\runtime\experiments\2026-11-08\rust_results`. Benchmark: "Cassano et al. *MultiPL-E*, arXiv 2208.08227".
- mypy found nothing (153/153, 296/296, 15 → 17; offline 1 of 35): Fractal academia 3.22; results `Fractal\runtime\experiments\2026-11-08\python_check_results.jsonl`, `typecheck_offline_results.json`.
- "94 % of TypeScript compile errors are type errors": "Mündler et al. *Type-Constrained Code Generation*, arXiv 2504.09246".
- The self-written playbook (69 → 69, 71 → 70): Fractal academia 3.22; `Fractal\runtime\experiments\2026-11-08\rust_lessons.md`.
- The automatic compiler check and the 4 live chats: Fractal academia 3.22; `Fractal\runtime\experiments\2026-11-08\compilecheck_live_results.json`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-08\rust_results\r1.jsonl`, `Fractal\runtime\experiments\2026-11-08\python_check_results.jsonl`, `Fractal\runtime\experiments\2026-11-08\compilecheck_live_results.json`, log `Fractal\runtime\experiments\2026-11-08\rust_lessons.log`
- Code: `Fractal\fractal\compilecheck.py`, `Fractal\runtime\experiments\2026-11-08\rust_bench.py`

**The idea behind it:** [Solve, check, repair with a compiler](https://derwina-code.github.io/ai-academia/Study%20hub.html#repair), [Lessons and playbooks in the prompt](https://derwina-code.github.io/ai-academia/Study%20hub.html#lessons)


## 3. Skills and toolboxes beat many agents

**The idea** (Anthropic's Agent Skills; the "playbooks, not agents" argument): one general agent, plus folders of
instructions and scripts loaded only when needed. A playbook has four parts:
1. **process:** the agent interviews you until it could do the job without you;
2. **toolbox:** tools built once and reused;
3. **proof:** checks before the result reaches you;
4. **the loop:** when something is wrong, fix the playbook, not that one output.

**Measured, Fractal's toolbox** (scripts saved only if they pass their own check; the prompt holds only an index of
names, one-liners and use counts):

| Toolbox | Month | Tool calls | Seconds | Right |
|---|---|---|---|---|
| off | Feb | 4 | 14.1 | yes |
| **on** | Feb | **1** | **7.1** | yes |
| off | Mar | 5 | 15.2 | yes |
| **on** | Mar | **1** | **8.1** | yes |

About **2× faster and 4–5× fewer steps** with the same answers, on one simple job with 2 runs each: a first result, not
a benchmark. The real gain is reuse **across projects and chats**; within one folder the agent already reused its own
recent script.

**Design rules that held:**
- **Save only with proof:** run the script on its own sample files; save only if it exits 0 and prints every expected
  text.
- **Fixing is versioning:** saving under the same name bumps the version and keeps the old file.
- **Track failure:** a tool with more failures than successes since its last fix is marked "failing lately".
- **Saved scripts are code that runs later:** always show the whole script for approval, so a prompt-injected page
  can't plant one.

**How we know.**
- The idea: "Anthropic, *Agent Skills* (Oct 2025)" and "cooper.simson, "I don't think you should build AI agents anymore" (reel)".
- The toolbox table (4 → 1 calls, 14.1 → 7.1 s; 5 → 1, 15.2 → 8.1 s) and the design rules: our own measurement, Fractal academia 3.20; results `Fractal\runtime\experiments\2026-11-08\toolbox_live_results.json`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-08\toolbox_live_results.json`
- Code: `Fractal\fractal\toolbox.py`, `Fractal\rust\parts\tools\src\toolbox.rs`, tests `Fractal\runtime\experiments\tests\toolbox_unit.py`

**The idea behind it:** [Lessons and playbooks in the prompt](https://derwina-code.github.io/ai-academia/Study%20hub.html#lessons), [The agent tool loop](https://derwina-code.github.io/ai-academia/Study%20hub.html#loop)


## 4. Improve the harness, not the weights

**Harness²** (Google, arXiv 2610.14224, read in full): everything around a frozen model is its harness, in 8 editable
parts (system prompt, guardrails, long-term memory, tool guidance, skills, scripts, subagents, tool-loop plugins).
- **Per task:** run once; two editors each propose one change (one general, one domain); each changed harness runs the
  same task; a composer compares the three runs and merges, revises, adopts or keeps the base. **No answer key is
  used:** the signal is the contrast between runs of the same task.
- **Across tasks:** adopted changes are filed with an `EXPERIENCE.md`, and lessons are kept only if a contrast supports
  them.
- **Results:** one step +3.0 to +11.8 points across three benchmarks; five parallel tries +2.6 to +6.7 more. **Weaker
  models gained most.** In the ablation, **skills (−5.3) and scripts (−3.7) were the most valuable parts**, ahead of
  prompt edits (−1.5).
- **Costs the authors list:** extra runs, noisy contrasts that share the model's biases, the selector sometimes keeping
  a weaker answer, and nine tasks got worse.
- **Open question for local models:** can a model be a good editor of its own harness? The paper's editor was much
  stronger than its workers.

**The rules in the released code** (`harness2/core/prompts.py` and `core/library.py`, read 13 Nov 2026). The paper
describes the loop; the code's instructions to its editors, composer and selector hold the discipline that makes it
safe. They are worth copying into any self-editing loop:
1. **Every edit points to a moment in a run.** Evidence in order of strength: two runs of one task disagreed (the
   agent can already do it and only needs telling); the same failure in every run; a risk seen but not yet hit.
2. **"Keep the base" is a full answer.** A change the evidence doesn't argue for is a step back: it costs context.
3. **Always-on text is the expensive form.** Prefer a skill with a trigger line, then a script, a subagent, a
   tool-loop plugin; always-on text last, and when some is added, some is cut.
4. **Two editors with separate jobs:** how the agent works, and what a practitioner knows. Neither does the other's.
5. **Facts apart from procedure.** A verified fact about this task is written and labelled as such; a procedure
   must hold for the next task; a guessed fact is worse than none.
6. **The composer reads runs as samples:** a defect in one base run of several is noise, one good candidate run is
   weak evidence, and an edit tied to a run that produced nothing is unsafe.
7. **The final pick is blind:** shuffled, unnamed outputs with unchanged-harness outputs among them.
8. **No answers, rubrics or scores reach the editors,** and stored harnesses are checked for grader words.
9. **A lesson is filed only with its cue, the lesson and the evidence,** beside the whole adopted harness, per
   domain.
10. **Everything read is data, not instructions.**

These name three separate jobs for an editor model: propose, compose, select. A test of "can a small model edit its
own harness" should score each, and needs a plain second try as its control.

**A browser built for agents, in Rust** (Read, 14 Nov 2026). Obscura (Apache-2.0) is a headless browser written in Rust: V8 for JavaScript, Chrome's control protocol, screenshots, PDFs, an MCP server, a native Windows build, and private addresses refused by default. Its own figures: 30 MB and 85 ms a page, against 200 MB and 500 ms for headless Chrome. A separate "stealth" build is made to slip past bot protection; the default build is the one an honest agent should use. Measured 14 Nov on 12 public pages: it read the real text of two pages that a plain HTTP read got nothing from (a 404 and a 403 sent to non-browsers), but took 1.2 to 8 s and 31 to 271 MB a page, far from its advertised 30 MB and 85 ms except on the simplest page. Best used as a fallback when the plain read comes back empty.

**A browser built for agents** (Read, 14 Nov 2026). Lightpanda, a headless browser written from scratch in Zig (AGPL-3.0, beta), runs JavaScript with V8, speaks Chrome's control protocols and has its own MCP server. Its own benchmark: 100 pages in 5 s and 123 MB, against 46 s and 2 GB for headless Chrome. For a local agent whose model already holds most of the machine, a browser at a sixteenth of Chrome's memory is the useful part. Reels sell it as "bypassing anti-bot systems"; its README doesn't claim that, and an honest agent shouldn't want it. Not measured here.

**A 27B as its own harness editor** (Measured, 14 Nov 2026; Harness²'s rules, the model editing its own prompt, a Rust coding bench with hidden tests the editors never see). Per task, it works: on 13 failed problems the composed edit turned 8 into passes, against 0 for a placebo sentence of the same kind, and broke 1 of 21 passes (the placebo also 1). It kept the base on 17 of 21 problems that were already right, without being told. Its blind pick among the answers chose a right one 12 times of 13. But the playbook it wrote from its 13 adopted rules, read on 122 held-out problems, fixed none and broke 6: the rules were fixes for single tasks. So a same-size model can repair and select; generalising the repairs is where a stronger editor, or lessons filed by kind of task and read on demand, is needed.

**A default belongs in the always-on text** (Measured, 13 Nov 2026). Harness² puts always-on text last, and that is right for know-how. A default is the exception. A 27B whose owner had made Rust its main language carried that only as a memory note, recalled when a chat's first message matched: asked for code with no language named, it wrote Python 10 times of 10. One always-on line (about 70 tokens) made it Rust 10 of 10, and a named language or an existing file in another language was still respected. A preference that must hold in every chat can't live in on-demand memory.

**Same conclusion from three directions:** Agent Skills, Harness² and the toolbox measurement all say that reusable,
checked scripts and skills are where agent gains come from.

**How we know.**
- Harness² method, results, ablation and the ten rules from its code: "Xu, Chen, …, Lee, Pfister. *Harness²: Recursive Agent Harnessing for an Open World*, arXiv 2610.14224; github.com/google-research/harness2 (its `core/prompts.py` and `core/library.py` read 13 Nov 2026)"; Fractal academia 3.21.
- Obscura's own figures: "Obscura, github.com/h4ckf0r0day/obscura (README read 14 Nov 2026; Apache-2.0); named by the top comment under the prompts_backlog reel, not by the reel". Our 12-page measurement (1.2–8 s, 31–271 MB): Fractal academia 3.50; results `Fractal\runtime\experiments\2026-11-14\obscura\results.json`.
- Lightpanda: "Lightpanda, github.com/lightpanda-io/browser (README read 14 Nov 2026; AGPL-3.0); reel by prompts_backlog (5 Nov 2026), which doesn't name it"; not measured.
- The 27B as its own editor (8 of 13 vs 0 placebo, 17 of 21 kept, 12 of 13 picks, 0 fixed 6 broke on 122 held out): Fractal academia 3.21; results `Fractal\runtime\experiments\2026-11-13\harness_editor\results.json`.
- Rust as the always-on default (Python 10/10 → Rust 10/10): Fractal academia 3.43; results `Fractal\runtime\experiments\2026-11-13\rust_default\language_choice.json`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-13\harness_editor\results.json`, playbook `Fractal\runtime\experiments\2026-11-13\harness_editor\self_playbook.md`, `Fractal\runtime\experiments\2026-11-13\rust_default\language_choice.json`, `Fractal\runtime\experiments\2026-11-14\obscura\results.json`
- Code: `Fractal\runtime\experiments\2026-11-13\harness_editor\editor_test.py`, `Fractal\runtime\experiments\2026-11-13\rust_default\language_choice.py`, `Fractal\runtime\experiments\2026-11-14\obscura\measure.ps1`

**The idea behind it:** [Lessons and playbooks in the prompt](https://derwina-code.github.io/ai-academia/Study%20hub.html#lessons), [Hidden tests and held-out exams](https://derwina-code.github.io/ai-academia/Study%20hub.html#hidden), [Working inside a fixed context](https://derwina-code.github.io/ai-academia/Study%20hub.html#context)


## 5. Routing and model choice

- **A small model routes well.** A 4B helper on the CPU classified requests (area plus effort) in ~1 s: **37/40**
  correct vs 24/40 for keyword rules.
- **Variable thinking budgets didn't pay.** An effort router scored 25/27 vs always-think 27/27, and wasn't faster.
- **A specialist's reputation is not a measurement.** Devstral Small 2 24B, sold as an agent model, scored 4/22 on the
  real agent task against 21/22 for the general 27B, and lower on every code benchmark.
- **Hard rules first:** pictures go to a model that can see; the user's manual pick wins.

**How we know.**
- Helper routing 37/40 vs 24/40 and the effort router 25/27 vs 27/27: Fractal academia 3.9; result file not kept.
- Devstral Small 2 4/22 vs 21/22: Fractal academia 3.10; scores in `Fractal\data\hub\scores.json`.
- Hard rules first: Fractal academia 3.9.

**Proof.**
- Code: `Fractal\fractal\hub\dispatch.py`, `Fractal\runtime\experiments\tests\route_bench.py`, `Fractal\runtime\experiments\tests\effort_bench.py`
- Results: `Fractal\data\hub\scores.json`
- Not kept: the 40 labelled requests' run output.

**The idea behind it:** [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe)


## 6. The tool loop: lessons from real use

- **Parse what the model actually produces.** Models sometimes write tool calls as plain text; parse and run them.
- **Use the shell the model writes for.** The model wrote PowerShell; `cmd` broke its commands.
- **Continue cut-off answers** automatically (up to 3 times).
- **Shorten repeated reads** of an unchanged file to a pointer.
- **Stuck guards:** after 3 repeat-call nudges, remove the tools and make the model report.
- **Never turn silence into consent or refusal.** A 30-minute approval timeout was reported to the model as "the user
  said no". Approvals now wait forever, with a chime.
- **Risk levels for tools:** read (never asks), write/run (asks unless trusted), send (always asks and shows the whole
  message, no "allow for this chat").

**How we know.**
- All points (parsing text tool calls, PowerShell, continuing cut-offs, shortened re-reads, stuck guards, approvals waiting forever, risk levels): Fractal academia 3.4, built from live use; no measurement files.

**Proof.**
- Code: `Fractal\rust\parts\agent\src\turn`, `Fractal\rust\parts\tools\src\plugins\code.rs` (older Python `Fractal\fractal\studio`)
- Not kept: the chats that showed each problem.

**The idea behind it:** [The agent tool loop](https://derwina-code.github.io/ai-academia/Study%20hub.html#loop)


## 7. Prompt injection

- **Mark untrusted text as data.** Email bodies are wrapped with an `UNTRUSTED` marker and treated as someone else's
  writing, never instructions.
- **Outward actions always ask.** Sending email shows the whole message every time.
- **Saved code is an injection target** (section 3): approval must show the code.
- **Screen reading asks first:** the screen can show private things.
- **Offline by design, with a pass per read** (GrindPilot, 11 Nov 2026; **Adopted**, design not yet measured). An
  agent that runs unattended for hours shouldn't hold a standing permission to browse:
  - **Every web read needs a pass the user gave for that read:** the exact sites or links shown, a page limit and
    15 minutes. Nothing is allowed for good.
  - **The agent can only ask.** Its request waits on screen while it does other work. An unanswered request is
    never a yes (section 6's "silence is not consent").
  - **Enforce it where the bytes leave**, not in the planner: the fetcher checks the pass before every request,
    robots.txt and redirects included. A redirect to another site is refused.
  - **Let the user send links.** Reading exactly the pages the user chose, with no link followed, gives research
    without unintended browsing.
  - **Supervision is a live list** of every address fetched or refused, with one Stop that ends every pass.
  - **Audit the quiet paths.** A UI that loaded web fonts, a browser shell's background services and "send me a
    report" webhooks were all going online without anyone deciding it. Fixed with a content policy, browser
    flags and a localhost-only rule.

  Project record: GrindPilot documentary chapter 15.

**How we know.**
- `UNTRUSTED` marker, outward actions asking, saved code shown: Fractal academia 3.16 and 3.20 (design, not measured).
- Screen reading asks first: Fractal academia 3.15 (`read_screen` is a write-risk tool).
- The pass-per-read internet gate: GrindPilot, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\15 Offline by design - the internet gate.md` (adopted, not measured).

**Proof.**
- Code: `Fractal\rust\parts\tools\src\accounts.rs`, `Fractal\rust\parts\odysseus\src\mail\ai.rs` (the marker), older `Fractal\fractal\accounts.py`

**The idea behind it:** [Prompt injection and command guards](https://derwina-code.github.io/ai-academia/Study%20hub.html#guards)


## 8. Agents that act in a UI (GrindPilot)

- **Rules should act; tasks should wait.** A task step timed out during a loading screen, and the rule that could have
  clicked refused to restart the running task. Fix: the rule clicks, and the task only waits patiently.
- **Fuzzy matching is fine for reading, dangerous for buttons.** "claim" fuzzily matched "Not Claimable", "Claimed" and
  OCR noise; the agent pressed "Not Claimable" 10 times. Buttons need whole-word matches, inactive-word lists and a
  try limit (2).
- **Imported knowledge is for one client; ground it on the user's.** Rules written for the Chinese client failed on
  the global client ("Click to Start" vs "Press to Play").
- **Patience first.** Give an unknown screen 25–40 s before acting, so loading isn't interrupted.
- **Login shows a chain of popups.** Allow "back" again on each new popup, or after 20 s, up to a limit.
- **Recordings are material to learn from, not scripts to repeat.** What's learned is knowledge (screens, buttons,
  links with roles); tasks are goals that work out their own clicks.
- **A save list is not a menu** (GrindPilot, Melvor Idle, 11 Nov 2026; **Adopted**). Exploring a character-select
  screen clicked the player's hardcore save, "Cloud Save" and a Discord link. Recognise save lists (two different
  slot headers, or "Select your Character" / "Load Game"), explore nothing there, and load only the save the user
  named, in the slot they named.
- **Check the window is really in front before looking.** A capture shows whatever lies over the game: the agent
  learned its own control panel as a game screen. Check the target window is uncovered, and wait or stop otherwise.
- **Tests need their whole data root redirected**, not just one folder: a test overwrote the real field report.
  Make the test run fail if a real file changed.
- **Protect paths to shops, not just words.** A "+" beside a currency counter opens a top-up shop. Settings pages are
  as risky as shops for an explorer.
- **Not every badge means reward.** "New!" dots that never clear are followed once per session.
- **Launch like the OS does.** `Popen` on an admin-only exe fails (error 740); `ShellExecute` prompts properly.
- **Don't treat a launcher process as the window.** A browser launcher exits at once when the browser is already open.
- **Teaching mid-run works** if the knowledge cache follows the database version.

**How we know.**
- Rules vs tasks, fuzzy matches on "Not Claimable", global vs Chinese client, patience, login popups, recordings as material, top-up shops, "New!" badges, `Popen` error 740, launchers, teaching mid-run: GrindPilot, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\06 Live testing and lessons.md` and `04 Learning and goals.md`.
- Save lists and covered windows, redirected data roots: `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\17 Ready for any game - save lists, covered windows, honest evidence.md` and `13 A second game - Melvor Idle.md`.

**Proof.**
- Code: `D:\Games\HoYoPlay\games\Grind Pilot\grindpilot-rs`, tests `D:\Games\HoYoPlay\games\Grind Pilot\tests`
- Not kept here: the live play sessions (summarised in `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\PLAYTHROUGH LOG.md`).

**The idea behind it:** [The agent tool loop](https://derwina-code.github.io/ai-academia/Study%20hub.html#loop), [Hidden tests and held-out exams](https://derwina-code.github.io/ai-academia/Study%20hub.html#hidden)


## 9. Mail and calendars

- **Recurring events must be expanded on the event's own clock.** Expanding in UTC shifted weekdays in a UTC+11 time
  zone.
- **Seal secrets with the OS** (Windows DPAPI): only the user's account can open them.

**How we know.**
- Recurring events on the event's own clock (UTC+11 weekday shift) and DPAPI sealing: Fractal academia 3.16. Standards: "RFC 5545 (iCalendar), RFC 3501 (IMAP)"; "Microsoft Docs: `Windows.Media.Ocr`, `Windows.Data.Pdf`, DPAPI".

**Proof.**
- Code: `Fractal\fractal\accounts.py`, `Fractal\rust\parts\tools\src\accounts.rs`, tests `Fractal\runtime\experiments\tests\accounts_unit.py`

**The idea behind it:** none of the listed techniques; expand repeating events in their own time zone and let the operating system hold secrets.


## 10. An audit log the owner can read (Built, 11 Nov 2026)

- **Log at the one place every action passes through.** Fractal's log is written where every chat event is recorded,
  so a new tool or feature is logged without anyone remembering to add it. Callers that sit outside that path
  (scheduled tasks, the phone's gateway) add their own lines.
- **Two forms of the same day:** a plain-text file a person can open, and a detailed file a viewer can filter.
- **An offline device logs by hand-over.** The phone assistant's actions arrive when it next connects. Each line keeps
  the time it happened and an id made from its content, so a hand-over that is sent twice is written once.
- **Decide what is never logged before the first line is written:** incognito chats, and anything shaped like a
  password, key or card number. Test the masking on real identifiers: the first rule also hid chat ids and timestamps.
- **Logging must not be able to stop the work,** and tests need their own log folder: the first test run wrote test
  events into the real log.
- Record: Fractal academia 3.27.

**How we know.**
- All points (one logging place, two forms, hand-over ids, masking, test log folder): our own build, Fractal academia 3.27.

**Proof.**
- Results: `AI activity logs` (the log itself), viewer `AI activity logs\Activity log.html`
- Code: `Fractal\fractal\activity.py`, tests `Fractal\runtime\experiments\tests\activity_attach_unit.py`; the auditor that reads it `Fractal\rust\parts\auditor`

**The idea behind it:** [Append-only logs and an auditor](https://derwina-code.github.io/ai-academia/Study%20hub.html#audit)


## 11. Free data services as tools: a catalogue is not a tool (Read, 12 Nov 2026)

**Source.** A reel ("Stop paying for APIs", algorithmswithpeter, 18 Oct 2026) about "a free GitHub repository" of
public APIs. The reel blurs the name and asks viewers to comment to get the link. Its table (API, Description, Auth,
HTTPS, CORS) and its wording match **public-apis/public-apis** ("A collective list of free APIs", MIT licence, about
498,000 stars, last change 7 Nov 2026). That match is our inference; the reel doesn't confirm it.

**What the list is** (counted from its README on 12 Nov 2026):
- 2,378 services in 52 categories (weather, geocoding, finance, government, books, science, transport and so on).
- 1,163 need no key, 1,049 need an API key, 156 need OAuth; 2,250 are HTTPS.
- A newer **MCP Servers** section: 29 servers an agent can connect to directly, each with its sign-in, its transport
  (`stdio` or `HTTP`) and links to registries.

**What it isn't.**
- It is a list of links kept by volunteers, with a sponsor: the top of the page advertises a paid API suite, and 40
  of the rows are that sponsor's.
- Nothing in it is checked for being up, honest or still free. "Free" often means a free tier or non-commercial use
  (Open-Meteo's row says so). The repository has about 2,600 open issues and pull requests.

**Why it matters for a local AI.**
- A data service answers a fact in a few hundred bytes of JSON. The same fact through a web search and a page costs
  thousands of tokens of context and can be read wrong. For a small local model that is the gain. **Not measured.**
- Keyless, HTTPS services in the list that suit an assistant: Open-Meteo (weather), Nager.Date (public holidays),
  Frankfurter (exchange rates), Free Dictionary and Wiktionary, Wikipedia, REST Countries, Open Library, arXiv,
  Nominatim (addresses to coordinates), Archive.org.
- **Pick by need, not by catalogue.** Start from questions the assistant answered slowly or wrongly, and add one
  service for each. 2,378 links are not 2,378 tools: every tool costs a line in the prompt and a check to maintain
  (section 3).

**Risks to design for.**
- **Every call tells a stranger something.** A weather question sends where you are; a keyless service still sees the
  IP address. Send rounded coordinates or a city, never names, contacts or message text, and say in the audit log
  what left the PC (section 10).
- **Answers are untrusted text.** A description field can carry instructions; mark replies as data like any web page
  (section 7).
- **Services vanish or change shape.** Each tool needs its own check with a known answer, re-run nightly, and a
  plain "the service didn't answer" when it fails, never a guess.
- **Third-party MCP servers are code or eyes you didn't write.** A `stdio` server runs on your machine; an `HTTP`
  server sees every argument. A registry listing is not a review: read the code or don't install it.

**"Using applications" is a different thing.** These are data services on the web. Operating programs on the PC or
the phone is done by connectors (MCP), by the phone assistant's own actions, or by an agent that reads the screen
(section 8). The list's MCP section is the bridge between the two, and it is small and unreviewed.

**Measured, 12 Nov 2026 (Fractal academia 3.37).** Four of the keyless services became tools (weather, public holidays, exchange rates, definitions), each tied to one fixed host. On 30 everyday questions with known answers, the same 27B model was right 11 times with no tools, 28 with web search (7.2 s and 7,008 tokens a question) and 29 with the fact tools beside web search (2.7 s and 2,408 tokens).
- **Accuracy is within noise of web search; the gain is time, tokens and fewer unknown sites** (five fixed hosts against pages on twenty sites).
- **A new tool's first measurement tests the tool.** The first run scored 21 of 24 against web search's 23: the weather tool counted days from the PC's date, and the town's own date was a day behind. Fixed by always returning a week and stating the town's date.
- **Handing over the right line doesn't mean it is read.** One yes-or-no question was wrong in both runs with the answer in the tool's list: the model began from what it believed. Put the verdict in the first line.
- **Tool descriptions cost prompt space on every message** (about 510 tokens for four tools), and a tool for something the model already knows (rare words) only adds cost.
- The truth for rates and weather came from the same services, which favours the tools; holidays and words did not.

**A third run after three changes (same day).** 35 questions: 34 right with the fact tools, 34 with web search, 12 with no tools; 2.5 s and 2,171 tokens a question against 5.8 s and 5,323.
- **Verdict first worked.** The holiday tool now takes a date and its first line is YES, NO or "NO, not nationwide". All eight yes-or-no date questions were right, five of them new. Change what the tool returns before changing the prompt.
- **Give the neighbours too.** The one-day answer also names the holidays either side. When the model checked its own wrong guess for a holiday's date, that line gave it the right one.
- **Dropping the unneeded tool cost nothing:** the rare words stayed 4 of 4 at under half the tokens, and every message carries about 470 extra prompt tokens instead of about 510.
- **A tool's failure message is an instruction.** One service answered HTTP 502 mid-run. The message ended "Say so; don't guess", and the model said so, with web search offered and unused. With the service forced to fail on six questions: 0 of 6 right and no searches with that ending; 4 of 6 right and 6 of 6 searched with "Use web search for this if you have it; otherwise say so. Don't guess."
- Small numbers throughout: equal scores at 35 questions mean "about the same".

**Status.** Built, measured three times and switched on in Fractal (three tools: weather, public holidays, exchange rates).

**How we know.**
- The reel and the list's counts (2,378 services, 52 categories, 29 MCP servers): "algorithmswithpeter, reel "Stop paying for APIs" (18 Oct 2026); the list it matches, public-apis/public-apis on GitHub, README counted 12 Nov 2026 (2,378 services, 52 categories, 29 MCP servers)". The key/OAuth/HTTPS split and sponsor rows: same README count; result file not kept.
- The risks: our own reasoning, not measured.
- The three runs (11/28/29 of 30; 34/34/12 of 35; times and tokens; the date bug; verdict first; failure message 0 of 6 vs 4 of 6): our own measurement, Fractal academia 3.37; results `Fractal\runtime\experiments\2026-11-12\facts_trial`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-12\facts_trial\summary.json`, `summary_run2.json`, `summary_run3.json`, `fallback_check.json`, notes `findings.md` (all in that folder)
- Code: `Fractal\plugins\facts`, `Fractal\rust\parts\tools\src\plugins\facts.rs`, tests `Fractal\runtime\experiments\tests\facts_unit.py`, trial `Fractal\runtime\experiments\2026-11-12\facts_trial\run_trial.py`

**The idea behind it:** [The agent tool loop](https://derwina-code.github.io/ai-academia/Study%20hub.html#loop), [Working inside a fixed context](https://derwina-code.github.io/ai-academia/Study%20hub.html#context)


## 12. A character that runs for months: Pino (Read, 12 Nov 2026)

**Source.** A reel by 3eyes.iii ("how we got to having an AI bird obsessed with cats and trains", 29 Oct 2026) about
**Pino**, a kiwi bird living in a small 3D town at pinos.world. Read on 12 Nov 2026: the maker's pages "How Pino
works", "Pino's brain", "Pino's memories" and the developer docs, the live data behind them, the maker's three.js
forum post (23 Aug 2026) and the bird's GitHub account. The maker's article on X could not be opened; what is taken
from it is marked. **The engine's code is not public, so everything below is the maker's description plus the live
data, not something we ran.**

**The loop.**
1. Something happens: someone speaks to him, something lands near him, he finishes what he was doing, or a few
   minutes pass.
2. His mind puts together what he can see, how he feels, what he is in the middle of and **which moves are on offer**.
3. A language model picks one to three of those moves and gives a reason in his voice.
4. The world carries them out or turns them down, and the result comes back to him.

**What the model does not decide** (this is the part worth copying):
- **Needs and feelings are arithmetic, worked out every second with no model:** five needs (rest, curiosity, social,
  expression, quiet, each 0 to 1) and a mood and an energy (each -1 to 1).
- **The list of moves and how they turn out** belong to the world, not the model.
- **When nothing new has happened, no model is asked:** he carries on. On the day read, 29 of his last 60 moves were
  such carry-ons. His log shows about 220 model decisions a day.

**What makes him change over time.**
- **A character sheet that says who he is, not what to do:** 22 written lines (traits, values, fears, quirks, a
  voice), no lines to say and no plans.
- **A sleep pass that may only add.** While he sleeps a separate pass adds lines to the sheet (9 so far, such as
  "ends up at the cat shrine around midday, most days"). The written lines can't be deleted, some parts are locked,
  and a "drift guard" stops him collapsing into one note.
- **Verdicts from tallies.** One sentence per activity ("Paddling in the pond settles me", borne out 20 times),
  worked out in sleep from what the activity did to his mood and needs each time. If the finding reverses, the
  sentence changes.
- **Interests with a half-life.** The words that recur in what he reads, weighted to recent weeks ("train" 147,
  "cat" 111). The maker calls this attraction, not opinion.
- **A small memory on purpose.** Two parts, lately and for good, 45 places each on the day read. A memory is worth
  its strength, how often it has come back and how recently. A full part takes a new memory only if it is worth more
  than the weakest one there. Things that come back on different days move to "for good" during sleep. (From the X
  article, by search summary: plain markdown files, strength halving every three weeks.)
- **Unfinished things wait at the place** where he left them and are picked up only when he returns there.
- **Open items of six kinds** (person, question, want, worry, promise, piece of work), and three lines he "holds
  to" that filter what reaches him.

**Where the "emergent" obsessions come from.** Not from the model alone. His town has a cat shrine he passes daily;
visitors leave him notes and offerings; what he reads is counted into interests; what an activity does to his needs
becomes a verdict; verdicts and habits are added to his sheet; the sheet shapes the next choice. The loop is closed
and its state survives for months, so small early leanings compound. That is a designed feedback loop, and a good
one. It is not evidence of feeling or awareness, and the maker's own pages say "a program".

**Hardware and models** (maker's statements):
- His mind runs around the clock on a Raspberry Pi; the world and the site are separate machines.
- The Pi does not run the model: decisions go to hosted language models, unnamed, with a step that picks a model
  tier for each decision, then a local fallback, then a plain rule (X article, by search summary). A separate vision
  model looks at pictures.
- The town is three.js with WebGPU. His daily log goes back 140 days, to 4 May 2026.

**Cautions.**
- **Unreviewed internet access.** He searches, follows links and publishes pages under his own GitHub account, and
  "nobody checks them afterwards". His memory holds raw page script kept as a memory, and his search history
  includes "bypass website verification script". An assistant with the owner's files and accounts must not work this
  way (section 7).
- **Money is attached.** He sells prints (278 sold), and a Solana coin's price movement shifts the mood of his world.
  A character with an audience and a coin has reasons to be entertaining; read claims of autonomy with that in mind.
- **Nothing here is measured.** There is no test of whether the sheet's additions make him more consistent, only the
  maker's impression.

**What transfers to an assistant.**
- Keep state in numbers and files, and let the model supply only the choice and the words (the same rule as the
  station's chatter, 09).
- Let traits be **earned from counts** during sleep, add-only, with the authored lines locked.
- Skip the model when nothing has changed.
- A memory with limited room, where entry means beating the weakest item, is a different answer to "too many notes"
  than better search (05, section 8). Untested here.

**How we know.**
- Everything about Pino (loop, needs, moves, character sheet, sleep pass, tallies, memory, hardware, cautions, 278 prints, 140 days of log): "3eyes.iii, reel on Pino (29 Oct 2026); pinos.world pages "How Pino works", "Pino's brain", "Pino's memories" and developer docs with their live data; three.js forum post (23 Aug 2026); github.com/pino-the-bird" (status R).
- The marked parts (plain markdown files, three-week half-life, model tiers and fallbacks): "3eyes_iii, article on X "Pino - An Autonomous AI bird living in a small town on the internet" (could not be opened; search summary only)" (status S).
- What transfers: our own judgement, untested.

**Proof.**
- Not kept: copies of the live data read on 12 Nov.

**The idea behind it:** [Sleep: consolidating memory offline](https://derwina-code.github.io/ai-academia/Study%20hub.html#sleep), [Graph memory with personalised PageRank](https://derwina-code.github.io/ai-academia/Study%20hub.html#ppr)


## 13. An agent that can be put down and picked up: Infinity (Read and built, 12 Nov 2026)

**Source.** A reel by itisjiwan (26 Oct 2026); AWS Open Source blog, "Introducing Infinity: a runtime for extreme
agent concurrency" (23 Oct 2026); the code at github.com/hydro-project/infinity (Apache 2.0, from AWS and UC
Berkeley's Hydro project); write-ups by The Agent Report, PBX Science and datastudios.org. The code was not run here.

**The idea.** Every tool call is a point where the agent can stop. Its state is its conversation, kept as a small
snapshot (about 100 KB), and it is woken when the tool's answer or a message arrives (under 2 ms). Agents that wait
use no processor time.

**The claim, checked.** "75,000 agents in 8 GB" is worked out from a measurement: 80,000 waiting agents in 8.4 GB,
on one thread of a server processor, with in-memory stores and short conversations (about 20 turns). The memory
grows with each conversation's length. It counts agents that are waiting; each one that is thinking still needs a
model.

**What transfers.**
- **The conversation is the whole state.** If it is saved, an agent can stop between any two tool calls and be picked
  up later: after a restart, after a game, or on another machine.
- **Keep a list of who is mid-work.** Saving conversations isn't enough on its own; something has to know which ones
  to wake. Fractal had the first and not the second.
- **Say what is known about a step that was cut off:** it may have run partly. A model server took a conversation
  with a missing result without complaint and the model simply ran the step again. That is wrong for anything that
  isn't safe to repeat.
- **Unattended work should step aside between steps,** not only before it starts.
- **Scale numbers from the cloud rarely transfer.** One model on one card is limited by the card, not by memory for
  waiting agents (Fractal Studio's own process: 47 MB).

**Measured in Fractal** (Fractal academia 3.38): after a forced stop, 5 of 5 scheduled tasks finished by themselves
and 2 of 2 chats finished after "continue"; a task paused with no model calls while a faked game held the card for
60 s. Small, easy jobs. **Status:** built and switched on in Fractal.

**How we know.**
- The idea and the 80,000 agents in 8.4 GB: "itisjiwan, reel on Infinity (26 Oct 2026); AWS Open Source blog, *Introducing Infinity: a runtime for extreme agent concurrency* (23 Oct 2026); The Agent Report, *AWS Infinity Fits 75,000 Idle Agents in 8 GB — Until You Count the Turns*; PBX Science and datastudios.org write-ups" and "hydro-project/infinity on GitHub (Apache 2.0; not run here)".
- Studio's 47 MB, 5 of 5 tasks, 2 of 2 chats, the 60 s pause: our own measurement, Fractal academia 3.38; results `Fractal\runtime\experiments\2026-11-12\resume_trial\results.jsonl`.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-12\resume_trial\results.jsonl`, log `Fractal\runtime\experiments\2026-11-12\resume_trial\trial.log`
- Code: `Fractal\fractal\studio\resume.py` (Rust: `Fractal\rust\parts\studio-store`), trial `Fractal\runtime\experiments\2026-11-12\resume_trial\run_trial.py`

**The idea behind it:** [Processes, handles and clean shutdown](https://derwina-code.github.io/ai-academia/Study%20hub.html#handles), [The agent tool loop](https://derwina-code.github.io/ai-academia/Study%20hub.html#loop)


## 14. A second, different AI beside the first: lessons from Odysseus (Measured and built, 20-21 Nov 2026)

Lattice gave Studio a second AI, Odysseus (gpt-oss-20b), beside Fractal (Qwen3.8-27B), each with its own model, prompt
and chats. What carried over beyond this project:

- **A fast reasoning model with thin knowledge invents with confidence.** In the user's first phone chat, gpt-oss-20b
  answered a price question with headed tables and made-up prices and products, read the "6000" in "Blackwell 6000"
  as a price, and kept that reading when corrected. Rewriting the prompt fixed the form (plain sentences, numbers read
  back exactly, "a number in a product name is not a price", re-read the question when told it's wrong) and cut the
  replies from 14.1 s to 9.7 s for the same five messages. It did not fix the knowledge: one made-up price range
  remained. **A prompt can stop the tables; only a source of facts (the web) stops the inventing.**
- **Give the second AI work it's good at, and let the user's request count as consent.** Fractal can hand a task to
  Odysseus (`hand_to_odysseus`). It asks for the user's OK when it suggests one on its own, but a handover the user
  asked for in their own latest message goes straight through. Whose turn it is stays on one thread, so the two
  models never share the card. Fractal suggests handovers on its own only after a measurement says what Odysseus is
  better at; until then, only on request.
- **Rebuild from behaviour, not from code, to stay clear of a copyleft licence.** The original Odysseus is AGPL. Each
  feature was first described in our own words from how the original behaves (specs), then built from those
  descriptions with the original's code never opened. 142 tests, six features, in a day.
- **One search source is a single point of failure.** On 21 Nov DuckDuckGo's plain HTML endpoint began answering every
  automated search with a bot check (HTTP 202 and an "anomaly" page). That stopped Odysseus's Research tool and
  Fractal's web search at the same moment. Don't work around a bot check; plan a second source (a search API with a
  key, or a search program run locally), and have the tool say "search unavailable" plainly (it did: "the web search
  gave nothing two rounds in a row").
- **Check every tool with the real model, not only stand-ins.** 142 stand-in tests passed. The first live check still
  found a calendar parser that put "next Tuesday" on a Saturday (04, section 8). A Compare round and a documents
  edit passed first time.
- Records: Fractal academia 3.53, 3.60, 3.61, 3.63; Odysseus academia (`E:\Project Lattice\Fractal\Odysseus\docs\ACADEMIA.md`).

**How we know.**
- The first phone chat and the prompt rewrite (14.1 s → 9.7 s, one made-up price left): Fractal academia 3.60 and Odysseus academia 3.4; result file not kept.
- Handovers and consent: Fractal academia 3.61 (the handover part) and Odysseus academia 3.5.
- Rebuilding from behaviour (142 tests, six features): Fractal academia 3.53 and 3.63, Odysseus academia 3.6.
- DuckDuckGo's bot check and the "next Tuesday" calendar bug: Fractal academia 3.63 and Odysseus academia 3.7 (live check, ~09:00 21 Nov).
- gpt-oss-20b's licence and design: "Model cards" are not listed for it in References; source not recorded beyond Odysseus academia 3.2.

**Proof.**
- Code: `Fractal\rust\src\gateway\odysseus.rs` (the phone prompt), `Fractal\rust\parts\agent\src\turn\handover.rs`, `Fractal\rust\parts\odysseus`, `Fractal\rust\parts\odysseus\src\planner\calendar.rs`
- Check it yourself: `cargo test -p odysseus` (from `Fractal\rust`)
- Not kept: the first phone chat's transcript as a file.

**The idea behind it:** [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe), [The agent tool loop](https://derwina-code.github.io/ai-academia/Study%20hub.html#loop), [Rewriting with parity tests](https://derwina-code.github.io/ai-academia/Study%20hub.html#parity)
