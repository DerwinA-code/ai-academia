# AI academia

**A research record of what I measured while building local AI systems**, by Derwin Agbisit
([LinkedIn](https://www.linkedin.com/in/derwin-agbisit-a61524204)).

**View it online:** [the presentation](https://derwina-code.github.io/ai-academia/AI%20academia.html) ·
[the study hub](https://derwina-code.github.io/ai-academia/Study%20hub.html) ·
[landing page](https://derwina-code.github.io/ai-academia/)

## For reviewers

- **What this is.** The cross-project record behind Project Lattice, a family of personal AIs I design and direct on
  my own hardware: a PC with one 16 GB GPU, a phone, and a second machine for heavy jobs.
- **How it was written.** The systems and these records were built with AI coding agents working under my direction.
  "The user" in the text is me. The rule I set is the same throughout: no change is kept until a test shows it helps,
  and every section ends with how it was done, the proof, and the idea behind it
  ([00 How every record is written](00%20How%20every%20record%20is%20written.md)).
- **Where to start.** [13 Techniques, explained](13%20Techniques%2C%20explained.md) for the methods,
  [02 Measuring AI systems](02%20Measuring%20AI%20systems.md) for how results are judged, and
  [10 Leads and open questions](10%20Leads%20and%20open%20questions.md) for what is not yet measured.
- **What you can check here.** The `proof/` folder holds the result files behind the headline numbers, at the same
  paths the records cite:

  | Claim | File in `proof/` | What to look for |
  |---|---|---|
  | Check-and-repair loop: LiveCodeBench quick set (40 tasks) 52.5% → 77.5% | `Fractal/results/index.jsonl` | runs `20261029-045930-local-think-quick` (0.525) and `20261030-001514-fractal-think-quick` (0.775) |
  | Compiler-error loop: Rust 85.3% → 90.4% on 156 problems | `Fractal/runtime/experiments/2026-11-08/rust_results/r0.jsonl`, `r1.jsonl` | count of `"verdict": "pass"`: 133, then 141 |
  | Speculative decoding: 50.7 → 75.4 tokens/s | `Fractal/runtime/experiments/2026-11-07/mtp/results.json` | rows `q4-36K ngram (now)` and `q4-36K mtp1` |
  | 4-bit KV cache: 1.8× the context at the same speed | `Fractal/runtime/experiments/2026-11-07/kv4/results.json` | context 20480 and 36864, `write_tok_s` 50.8 for both |
  | Phone model: 31% → 93.7% on its exam | `Fractal/runtime/experiments/2026-11-09/ruby_brain/results/` | `summary.overall` in `base-app08.json` (0.308) and `ruby-v4b-short.json` (0.937) |
  | Next-Concept Modeling reproduction: ROUGE-L 27.93 on XSum | `NCM lab/eval/xsum/scores.txt` | the R-L column |

- **What is not here.** The records cite many more files by their path on my machine (`Fractal\...`, `Ruby\...`,
  `Volta\...`, `D:\...`). Those are not published in this repository: the model weights, the code, the full
  experiment folders and anything personal stay local. `view/proof.json` lists every cited file and marks the claims
  that have no file kept.

## What each piece was built from

Each row starts from someone else's published work, names the small version built here, and says what was measured.
Rejected results are listed next to adopted ones.

| Source | The small version here | What was measured | Check it in `proof/` |
|---|---|---|---|
| Leviathan et al., *Fast Inference from Transformers via Speculative Decoding*, arXiv 2211.17192; Gloeckle et al., *Multi-token Prediction*, arXiv 2404.19737 | Multi-token drafting, one token ahead, on a 27B model on a 16 GB card ([01, section 5](01%20Local%20inference%20on%20consumer%20GPUs.md)) | 50.7 → 75.4 tokens/s on reasoning: adopted. Drafting two ahead made prose slower (50.6 → 36.2): not adopted | `Fractal/runtime/experiments/2026-11-07/mtp/results.json` |
| Liu et al., *KIVI*, arXiv 2402.02750 | A 4-bit KV cache on the same model ([01, section 3](01%20Local%20inference%20on%20consumer%20GPUs.md)) | Context 20,480 → 36,864 tokens at the same 50.8 tokens/s; 12 of 12 hidden facts recalled at 30,000 tokens | `Fractal/runtime/experiments/2026-11-07/kv4/results.json` |
| Kumbong et al., *Next-Concept Modeling*, arXiv 2610.14162 (Stanford Hazy Research) | The released models reproduced on a consumer GPU, then the generator ported to Rust ([01, section 10](01%20Local%20inference%20on%20consumer%20GPUs.md)) | ROUGE-L 27.93 on 11,334 XSum articles (paper: about 28.0). Hard Sudoku 86.25% against the paper's 86.1%; that result file is not published here | `NCM lab/eval/xsum/scores.txt` |
| Cassano et al., *MultiPL-E*, arXiv 2208.08227 (the benchmark); Mündler et al., *Type-Constrained Code Generation*, arXiv 2504.09246 | Compiler errors fed back to the model for up to three repairs ([03, section 2](03%20Agents%2C%20tools%20and%20harnesses.md)) | Rust 133 → 141 of 156. The same idea with a Python type checker found nothing (153 → 153 of 164), so the paper's TypeScript finding did not carry over; that result file is not published here | `Fractal/runtime/experiments/2026-11-08/rust_results/r0.jsonl`, `r1.jsonl` |
| Liu et al., *EvalPlus*, arXiv 2305.01210; Jain et al., *LiveCodeBench*, arXiv 2403.07974 (the benchmarks) | A solve, check, repair loop on the problem's own examples ([03, section 1](03%20Agents%2C%20tools%20and%20harnesses.md)) | LiveCodeBench quick set (40 tasks): 52.5% → 77.5% with thinking, 37.5% → 60% without. HumanEval+ and MBPP+ moved only within noise | `Fractal/results/index.jsonl` |
| Singh et al., *Beyond Human Data* (ReST-EM), arXiv 2312.06585 | Self-practice kept only on independent agreement, then a LoRA trained on the kept answers ([06, sections 2 and 3](06%20Self-improvement%20and%20training.md)) | A negative result: HumanEval+ 77.5 → 72.5 and MBPP+ 76.2 → 73.8 on the 4B helper. Not adopted | `Fractal/results/index.jsonl`, runs `20261106-075430-helper-base-quick` and `20261106-094800-helper-lora-quick` |
| Hinton et al., *Distilling the Knowledge in a Neural Network*, arXiv 1503.02531; Snell et al., *Learning by Distilling Context*, arXiv 2209.15189 | A 27B teacher with a long prompt, a 1.7B phone student with a 68-token prompt, trained with LoRA ([06, section 4](06%20Self-improvement%20and%20training.md)) | The phone exam went from 31% to 93.7% across versions v1 to v4b | `Fractal/runtime/experiments/2026-11-09/ruby_brain/results/` |

Other write-ups name their sources in the same way, for example masking old tool output after *The Complexity Trap*
(topic 04) and graph recall after *HippoRAG* (topic 05), but their result files were not kept or are not published
here. [References](References.md) marks how closely each source was read.

---

General findings about AI, gathered from the user's projects and their research. Each project keeps its own record of
what it built; this folder keeps what is **true beyond one project**: how models behave, what speeds them up, what
makes an agent reliable, how to measure any of it, and which ideas failed.

Started 10 Nov 2026 from the records of:
- **Fractal** (the PC AI): `E:\Fractal AI project\docs\ACADEMIA.md`, the main source, 28 Oct–10 Nov 2026.
- **Ruby** (the phone AI): `E:\Project Lattice\Ruby\` (`docs\ACADEMIA.md`, `docs\RESEARCH.md`, `docs\VOICE_SHORTLIST.md`,
  `Ruby voice\README.md`, the phone-brain chapter 3.24 of Fractal's academia).
- **GrindPilot** (a game-playing agent): `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary`.
- **Volta** (the heavy lifter for a second machine, added 11 Nov 2026): `E:\Project Lattice\Volta\docs\ACADEMIA.md`.
- **Odysseus** (Lattice's second AI on the PC, added 21 Nov 2026): `E:\Project Lattice\Fractal\Odysseus\docs\ACADEMIA.md`.
- **Research passes:** `E:\Fractal AI project\docs\potential ideas.md`, and papers, repos and reels read along the way.

## The presentation

Open **`AI academia.html`** for a slide-style view of this folder: the headline numbers as interactive charts, the
negative results, the leads (searchable), and every file readable in a side panel. It is one file and works offline.

It is built from these `.md` files. After editing any of them, rebuild it with `py -3 view/build.py`. The chart
numbers are written by hand in `view/template.html`, so change them there when a measurement changes.

## Proof of work and the techniques (24 Nov 2026)

- **[00 How every record is written](00%20How%20every%20record%20is%20written.md)**: the standard. Every section of every academia ends with **How we did it**, **Proof** (paths checked on disk, a check that needs no model, what was not kept) and **The idea behind it**.
- **[13 Techniques, explained](13%20Techniques%2C%20explained.md)**: the academia of the 21 techniques the projects use: how each works, its maths, where it came from, and every section that used it.
- **Study hub.html**: the same techniques taught interactively: stepped animated lessons, quizzes, and labs where you change the numbers until the method breaks. Opens offline; rebuilt by `viewhubuild.cmd`.

## How to read it

| File | What it covers |
|---|---|
| [01 Local inference on consumer GPUs](01%20Local%20inference%20on%20consumer%20GPUs.md) | Why speed is bytes per token, the VRAM budget, quantisation, the KV cache, speculative decoding, model routers, bigger-than-VRAM models, older cards |
| [02 Measuring AI systems](02%20Measuring%20AI%20systems.md) | How to tell a real gain from luck: paired tests, secret exams, hard gates, benches that check real state, judges, the traps we fell into |
| [03 Agents, tools and harnesses](03%20Agents%2C%20tools%20and%20harnesses.md) | Tool loops, checking against evidence, compilers as judges, skills and toolboxes, harness refinement, permissions, prompt injection, rules vs tasks |
| [04 Context and long tasks](04%20Context%20and%20long%20tasks.md) | Working inside a fixed context: masking, checkpoint notes, fact ledgers, plans as files, cheap context from a 4-bit cache |
| [05 Memory and knowledge graphs](05%20Memory%20and%20knowledge%20graphs.md) | Graph memory with personalised PageRank, hubs, building memory from existing records, consolidation, forgetting, vector search |
| [06 Self-improvement and training](06%20Self-improvement%20and%20training.md) | Self-practice, sleep and dreaming, distillation into small models, LoRA results, sampling and thinking loops, routing, picking models by measurement |
| [07 Voice](07%20Voice.md) | Speech to text, text to speech, latency budgets, designing a voice from words, holding pitch, training a phone voice, licences and consent |
| [08 Vision, OCR and media](08%20Vision%2C%20OCR%20and%20media.md) | OCR next to vision models, reading game screens, picture and video generation on one card |
| [09 Interfaces for AI](09%20Interfaces%20for%20AI.md) | Showing what an AI is doing, 3D maps of memory, what makes AI interfaces impressive |
| [10 Leads and open questions](10%20Leads%20and%20open%20questions.md) | Ideas not yet measured, with how to test each |
| [11 Several AIs on several machines](11%20Several%20AIs%20on%20several%20machines.md) | Handing work to another machine: one door and one direction, pairing, a fixed job list instead of a remote shell, the other machine being off, one audit log, testing the line before the hardware exists |
| [12 Experts, routers and hardware tiers](12%20Experts%2C%20routers%20and%20hardware%20tiers.md) | A team of expert models and a router instead of one all-rounder, on each tier (phone, PC, Volta); why: a small brain trades skills (Ruby rounds 6 and 7); what each tier tests first |
| [13 Techniques, explained](13%20Techniques%2C%20explained.md) | The 21 techniques behind the records, from first principles: paired tests, intervals, repeats, hidden tests, speculative decoding, quantisation, the KV cache, the tool loop, compiler repair, prompt lessons, graph memory, Sleep, distillation, LoRA, MoE, command guards, fixed context, voice latency, process handles, audit logs, parity rewrites |
| [References](References.md) | Every source, marked by how closely it was read |

**Papers** (whole write-ups of one system, by the project that built it):

| Paper | What it covers |
|---|---|
| [GrindPilot: an evidence-driven agent that learns to play games from the screen](GrindPilot%20-%20an%20evidence-driven%20agent%20that%20learns%20to%20play%20games%20from%20the%20screen.md) | GrindPilot's own working paper (10 Nov 2026): learning from watching, knowledge as evidence, the general brain, the exam, 40 real-game failures. The topic files above quote its lessons |

**Status words used throughout:**
- **Measured:** we ran it and have numbers, with the setup stated.
- **Adopted / Not adopted:** a project kept the change, or measured it and rejected it.
- **Claim:** the maker or author says so; not checked by us.
- **Lead:** worth testing; nothing measured yet.

**Hardware behind most numbers:** RTX 5070 Ti 16 GB (Blackwell, 896 GB/s), Ryzen 5 7600, 31 GB RAM, Windows 11,
llama.cpp b11946 (CUDA 13), main model Qwen3.8-27B (UD-IQ4_XS GGUF, ~13.3 GB). Phone numbers are from a Qwen3-1.7B
running on the phone's CPU.

## Rules for this folder

- **Findings, not diaries.** Each entry says what was found, the evidence, and the general lesson. Build details stay in
  the project records, which each entry points to.
- **Numbers keep their conditions.** A speed without its context size, card and settings is not a finding.
- **Negative results stay.** A measured "no gain" saves the next person the work.
- **Claims are labelled as claims** until measured here.
- **Nothing private.** No keys, personal documents, voice samples of real people, or anything from incognito chats.
- **Project-specific notes stay in the project.** When a note matters to both, the full write-up lives here and the
  project's academia gets a short pointer.
